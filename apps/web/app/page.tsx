'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet
} from '@tonconnect/ui-react';

// читаем переменные из Vercel
const BASE_RATE = Number(process.env.NEXT_PUBLIC_BASE_STAR_RATE || '0.008556');
const MARKUP_PERCENT = Number(process.env.NEXT_PUBLIC_MARKUP_PERCENT || '3');

// итоговая цена 1 звезды с учётом наценки
const PRICE_PER_STAR = Number(
  (BASE_RATE * (1 + MARKUP_PERCENT / 100)).toFixed(8)
);

// пакеты звёзд
const STAR_PACKS = [50, 100, 250, 500, 1000];

const texts = {
  ru: {
    hero: 'Покупай Telegram Stars за TON',
    sub: 'Быстро. Без KYC. Прозрачно.',
    buyCardTitle: 'Купить Stars',
    usernameLabel: 'Telegram юзернейм пользователя:',
    usernamePh: 'username',
    usernameHint: 'Можно вводить ник с @ или без — мы обработаем сами.',
    amountLabel: 'Количество Stars:',
    usernameErr: 'Ник: латиница/цифры/_ (5–32)',
    amountErr: 'Минимум 50 звёзд',
    toPay: 'К оплате (TON)',
    balance: 'Баланс (TON)',
    buy: 'Купить Stars',
    policy: 'Политика',
    terms: 'Условия',
    yearLine: '© 2025 TonStars',
    status: {
      idle: '',
      creating: 'Создаём заказ…',
      opening_wallet: 'Открываем кошелёк…',
      waiting_confirm: 'Транзакция отправлена, ждём подтверждения…',
      paid: 'Оплата получена, скоро звёзды будут начислены.',
      error: 'Ошибка при создании заказа.'
    }
  }
};

type Lang = 'ru' | 'en';
type StatusCode =
  | 'idle'
  | 'creating'
  | 'opening_wallet'
  | 'waiting_confirm'
  | 'paid'
  | 'error';

export default function Page() {
  const [lang, setLang] = useState<Lang>('ru');
  const t = texts[lang];

  // форма
  const [username, setUsername] = useState('');
  const [selectedPack, setSelectedPack] = useState<number>(STAR_PACKS[0]);

  // статус процесса
  const [status, setStatus] = useState<StatusCode>('idle');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // кошелёк и TonConnect
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [balanceTon, setBalanceTon] = useState<number | null>(null);
  const addressFriendly = wallet?.account?.address;

  // валидация юзернейма
  const userOk = useMemo(
    () => /^[a-z0-9_]{5,32}$/i.test(username.replace(/^@/, '').trim()),
    [username]
  );

  // количество звёзд из выбранного пакета
  const amountNum = selectedPack;
  const amtOk = amountNum >= 50;

  // вычисляем финальную сумму с учетом пакета
  const amountTon = useMemo(
    () => Number((amountNum * PRICE_PER_STAR).toFixed(4)),
    [amountNum]
  );

  const canBuy = userOk && !!wallet && amtOk;

  // подтягиваем баланс кошелька
  useEffect(() => {
    let aborted = false;

    async function fetchBalance(addr: string) {
      try {
        const url = `https://toncenter.com/api/v2/getAddressBalance?address=${encodeURIComponent(
          addr
        )}`;
        const r = await fetch(url);
        const j = await r.json();
        const nano = Number(j.result);
        if (!aborted && Number.isFinite(nano)) {
          setBalanceTon(Number((nano / 1e9).toFixed(4)));
        }
      } catch {
        if (!aborted) setBalanceTon(null);
      }
    }

    if (addressFriendly) {
      setBalanceTon(null);
      fetchBalance(addressFriendly);
    } else {
      setBalanceTon(null);
    }

    return () => {
      aborted = true;
    };
  }, [addressFriendly]);

  // покупка
  const onBuy = async () => {
    if (!canBuy) return;
    if (!wallet) {
      setStatus('error');
      setErrorDetails('NO_WALLET');
      return;
    }

    try {
      setStatus('creating');
      setErrorDetails(null);

      const createRes = await fetch('/api/order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          stars: amountNum
        })
      });

      const createData = await createRes.json();

      if (!createRes.ok || !createData.ok) {
        throw new Error(createData?.error || 'ORDER_CREATE_FAILED');
      }

      const orderId = createData.order_id;
      const toAddress = createData.to_address;
      const tonAmount = createData.ton_amount;

      setStatus('opening_wallet');

      const nanoAmount = Math.round(tonAmount * 1e9);

      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{ address: toAddress, amount: nanoAmount.toString() }]
      };

      const txResult = await tonConnectUI.sendTransaction(tx);

      setStatus('waiting_confirm');

      const tonTxBoc = txResult?.boc || null;
      const fromAddr = wallet.account.address;

      const cbRes = await fetch('/api/pay-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          ton_tx_hash: tonTxBoc,
          ton_wallet_addr: fromAddr
        })
      });

      const cbData = await cbRes.json();

      if (!cbRes.ok || !cbData.ok) {
        throw new Error(cbData?.error || 'CALLBACK_FAILED');
      }

      if (cbData.status === 'paid' || cbData.status === 'delivered') {
        setStatus('paid');
      } else {
        setStatus('waiting_confirm');
      }
    } catch (err: any) {
      console.error('Buy flow error:', err);
      setStatus('error');
      setErrorDetails(err?.message || String(err));
    }
  };

  const statusText = t.status[status];
  const showStatus = !!statusText;

  // ===== UI =====

  return (
    <div className="container" style={{ padding: '32px 16px 28px' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1>TonStars</h1>
        <div style={{ opacity: 0.6 }}>{t.sub}</div>
        <TonConnectButton />
      </div>

      {/* выбор пакетов */}
      <div>
        <label>{t.amountLabel}</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STAR_PACKS.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPack(p)}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: selectedPack === p
                  ? '1px solid #16e3c9'
                  : '1px solid #666',
                background: selectedPack === p
                  ? 'linear-gradient(90deg,#2a86ff,#16e3c9)'
                  : '#111',
                color: '#fff'
              }}
            >
              {p} Stars
            </button>
          ))}
        </div>
      </div>

      {/* итог */}
      <div style={{ marginTop: 20, fontSize: 18 }}>
        <b>{t.toPay}</b>: {amountTon} TON  
        <br />
        <small>(1 Star = {PRICE_PER_STAR} TON)</small>
      </div>

      {/* кнопка */}
      <button
        onClick={onBuy}
        disabled={!canBuy}
        style={{
          marginTop: 24,
          width: '100%',
          height: 52,
          fontSize: 20,
          borderRadius: 12,
          background: 'linear-gradient(90deg,#2a86ff,#16e3c9)'
        }}
      >
        {t.buy}
      </button>
    </div>
  );
}
