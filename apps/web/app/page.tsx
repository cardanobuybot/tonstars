'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet
} from '@tonconnect/ui-react';

// ---- типы ----
type StatusCode =
  | 'idle'
  | 'creating'
  | 'opening_wallet'
  | 'waiting_confirm'
  | 'paid'
  | 'error';

// читаем курс из ENV (Vercel)
const BASE_RATE = Number(
  process.env.NEXT_PUBLIC_BASE_STAR_RATE || '0.008556'
); // TON за 1 звезду
const MARKUP_PERCENT = Number(
  process.env.NEXT_PUBLIC_MARKUP_PERCENT || '3'
); // твоя наценка, %

const PRICE_PER_STAR = Number(
  (BASE_RATE * (1 + MARKUP_PERCENT / 100)).toFixed(8)
);

// готовые пакеты звёзд
const STAR_PACKS = [50, 100, 250, 500, 1000, 5000];

// тексты (RU)
const texts = {
  hero: 'Покупай Telegram Stars за TON',
  sub: 'Прозрачная комиссия 3%.',
  buyCardTitle: 'Купить Stars',
  usernameLabel: 'Telegram юзернейм пользователя:',
  usernamePh: 'username',
  usernameHint: 'Можно вводить ник с @ или без — мы обработаем сами.',
  amountLabel: 'Количество Stars:',
  usernameErr: 'Ник: латиница/цифры/_ (4–32)',
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
  } as Record<StatusCode, string>
};

export default function Page() {
  const t = texts;

  // ссылки на политику/условия (RU)
  const privacyHref = '/privacy';
  const termsHref = '/terms';

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

  // валидация юзернейма (4–32, режем @)
  const userOk = useMemo(
    () => /^[a-z0-9_]{4,32}$/i.test(username.replace(/^@/, '').trim()),
    [username]
  );

  // количество звёзд из выбранного пакета
  const amountNum = selectedPack;
  const amtOk = amountNum >= 50;

  // сумма в TON с учётом курса и наценки
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

  // основной flow покупки
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

      // 1) создаём ордер на бэке
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

      const orderId: number = createData.order_id;
      const toAddress: string = createData.to_address;
      const tonAmount: number = createData.ton_amount;

      setStatus('opening_wallet');

      // 2) отправляем транзакцию через TonConnect
      const nanoAmount = Math.round(tonAmount * 1e9);
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: toAddress,
            amount: nanoAmount.toString()
          }
        ]
      };

      const txResult: any = await tonConnectUI.sendTransaction(tx);

      // если дошли сюда — кошелёк не отменил отправку
      setStatus('waiting_confirm');

      const tonTxBoc = txResult?.boc || null;
      const fromAddr = wallet.account.address;

      // 3) дергаем callback, чтобы пометить ордер как paid
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
  const isError = status === 'error';
  const isSuccess = status === 'paid';

  return (
    <div className="container safe-bottom" style={{ padding: '32px 16px 28px' }}>
      {/* HEADER */}
      <div
        data-hdr
        style={{
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div
          data-hdr-left
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <img src="/icon-512.png" alt="TonStars" width={36} height={36} />
          <div
            style={{ fontWeight: 700, fontSize: 22, whiteSpace: 'nowrap' }}
          >
            TonStars
          </div>
        </div>
        <div data-hdr-right>
          <div data-tc-button>
            <TonConnectButton />
          </div>
        </div>
      </div>

      {/* HERO */}
      <h1
        style={{
          margin: '28px auto 8px',
          fontSize: 36,
          lineHeight: 1.1,
          letterSpacing: 0.2,
          textAlign: 'center',
          maxWidth: 680
        }}
      >
        {t.hero}
      </h1>
      <div
        style={{ opacity: 0.75, marginBottom: 18, textAlign: 'center' }}
      >
        {t.sub}
      </div>

      {/* CARD */}
      <div
        style={{
          background: 'linear-gradient(180deg,#0f172a,#020617)',
          border: '1px solid rgba(148,163,184,0.35)',
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(15,23,42,0.85)',
          padding: 20,
          maxWidth: 840,
          margin: '0 auto'
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>
          {t.buyCardTitle}
        </div>

        {/* username */}
        <label
          style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}
        >
          {t.usernameLabel}
        </label>
        <input
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={t.usernamePh}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={
            username ? (userOk ? 'input-ok' : 'input-err') : undefined
          }
          style={{
            width: '100%',
            height: 52,
            borderRadius: 12,
            border: '1px solid rgba(148,163,184,0.5)',
            background: '#020617',
            padding: '0 14px',
            color: '#e6ebff',
            outline: 'none'
          }}
        />
        {(!username || !userOk) && (
          <div
            className={username && !userOk ? 'err' : undefined}
            style={{ fontSize: 13, opacity: 0.9, marginTop: 8 }}
          >
            {username ? t.usernameErr : t.usernameHint}
          </div>
        )}

        {/* amount / пакеты */}
        <div style={{ height: 14 }} />
        <label
          style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}
        >
          {t.amountLabel}
        </label>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 6
          }}
        >
          {STAR_PACKS.map((pack) => {
            const active = selectedPack === pack;
            return (
              <button
                key={pack}
                type="button"
                onClick={() => setSelectedPack(pack)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: active
                    ? '1px solid rgba(22,227,201,0.9)'
                    : '1px solid rgba(148,163,184,0.5)',
                  background: active
                    ? 'linear-gradient(90deg,#2a86ff,#16e3c9)'
                    : 'rgba(15,23,42,0.9)',
                  color: active ? '#001014' : '#e6ebff',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                {pack.toLocaleString('ru-RU')} Stars
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 10 }}>
          Выбрано: {amountNum.toLocaleString('ru-RU')} Stars{' '}
          {' · '}
          1 Star ≈ {PRICE_PER_STAR.toFixed(6)} TON
        </div>

        {/* итоги */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
            marginBottom: 10,
            fontSize: 16,
            opacity: 0.95
          }}
        >
          <div>{t.toPay}</div>
          <div>≈ {amountTon.toFixed(4)} TON</div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
            marginBottom: 8,
            fontSize: 16,
            opacity: 0.85
          }}
        >
          <div>{t.balance}</div>
          <div>
            {balanceTon == null
              ? '— TON'
              : `${balanceTon.toFixed(4)} TON`}
          </div>
        </div>

        {/* статус процесса */}
        {showStatus && (
          <div
            style={{
              fontSize: 14,
              marginBottom: 10,
              color: isError
                ? '#ff6b6b'
                : isSuccess
                ? '#4cd964'
                : 'rgba(255,255,255,0.8)'
            }}
          >
            {statusText}
            {isError && errorDetails ? ` (${errorDetails})` : null}
          </div>
        )}

        {/* кнопка */}
        <button
          onClick={onBuy}
          disabled={
            !canBuy ||
            status === 'creating' ||
            status === 'opening_wallet'
          }
          style={{
            width: '100%',
            height: 54,
            borderRadius: 14,
            border: '1px solid rgba(148,163,184,0.4)',
            background:
              canBuy &&
              status !== 'creating' &&
              status !== 'opening_wallet'
                ? 'linear-gradient(90deg,#2a86ff,#16e3c9)'
                : 'rgba(30,41,59,0.8)',
            color:
              canBuy &&
              status !== 'creating' &&
              status !== 'opening_wallet'
                ? '#001014'
                : 'rgba(226,232,240,0.7)',
            fontSize: 18,
            fontWeight: 800,
            cursor:
              canBuy &&
              status !== 'creating' &&
              status !== 'opening_wallet'
                ? 'pointer'
                : 'default'
          }}
        >
          {t.buy}
        </button>
      </div>

      {/* BOTTOM BAR */}
      <div
        className="bottom-bar"
        style={{
          maxWidth: 840,
          margin: '28px auto 0',
          paddingTop: 16,
          borderTop: '1px solid rgba(148,163,184,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          flexWrap: 'wrap',
          opacity: 0.9,
          fontSize: 15
        }}
      >
        <div
          className="lang-pill"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#020617',
            padding: '2px 6px',
            borderRadius: 16,
            border: '1px solid rgba(148,163,184,0.4)',
            transform: 'translateX(-16px)'
          }}
        >
          <button
            aria-label="RU"
            style={{
              padding: '4px 10px',
              borderRadius: 14,
              border: '1px solid rgba(148,163,184,0.5)',
              background: '#0098ea',
              color: '#fff',
              fontWeight: 700
            }}
          >
            RU
          </button>
          <button
            aria-label="EN"
            onClick={() => {
              window.location.href = '/en';
            }}
            style={{
              padding: '4px 10px',
              borderRadius: 14,
              border: '1px solid rgba(148,163,184,0.5)',
              background: 'transparent',
              color: '#cdd6f4',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            EN
          </button>
        </div>

        <a href={privacyHref} className="foot-link">
          {t.policy}
        </a>
        <span className="foot-sep">|</span>
        <a href={termsHref} className="foot-link">
          {t.terms}
        </a>
        <span className="foot-sep">|</span>
        <span className="foot-mute">{t.yearLine}</span>
      </div>
    </div>
  );
}
