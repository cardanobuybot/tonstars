'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';

// Константа курса: 1 Star = 0.0002 TON
const STAR_TON_RATE = 0.0002;

const texts = {
  ru: {
    hero: 'Покупай Telegram Stars за TON',
    sub: 'Быстро. Без KYC. Прозрачно.',
    buyCardTitle: 'Купить Stars',
    usernameLabel: '@Telegram username',
    usernamePh: 'username',
    usernameHint: 'Введите ник без @. Допустимы латинские буквы, цифры и _ (5–32).',
    amountLabel: 'Сумма Stars',
    ok: (n: number) => `OK — ${n} Stars`,
    usernameErr: 'Ник: латиница/цифры/_ (5–32)',
    amountErr: 'Введите целое число ≥ 1',
    toPay: 'К оплате (TON)',
    balance: 'Баланс (TON)',
    buy: 'Купить Stars',
    policy: 'Политика',
    terms: 'Условия',
    yearLine: '© 2025 TonStars',
  },
  en: {
    hero: 'Buy Telegram Stars with TON',
    sub: 'Fast. No KYC. Transparent.',
    buyCardTitle: 'Buy Stars',
    usernameLabel: '@Telegram username',
    usernamePh: 'username',
    usernameHint: 'Enter username without @. Latin letters, digits and _ (5–32).',
    amountLabel: 'Stars amount',
    ok: (n: number) => `OK — ${n} Stars`,
    usernameErr: 'Username: latin/digits/_ (5–32)',
    amountErr: 'Enter an integer ≥ 1',
    toPay: 'To pay (TON)',
    balance: 'Balance (TON)',
    buy: 'Buy Stars',
    policy: 'Privacy',
    terms: 'Terms',
    yearLine: '© 2025 TonStars',
  }
};

export default function Page() {
  // Язык интерфейса
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const t = texts[lang];

  // Поля формы
  const [username, setUsername] = useState('');
  const [amountStr, setAmountStr] = useState('100');

  // Кошелёк TonConnect
  const wallet = useTonWallet();
  const [balanceTon, setBalanceTon] = useState<number | null>(null);
  const addressFriendly = wallet?.account?.address;

  // Валидация username (латиница/цифры/_; 5–32)
  const userOk = useMemo(() => /^[a-z0-9_]{5,32}$/i.test(username), [username]);

  // Парсим количество (разрешим пустую строку, а считать будем как 0)
  const amountNum = useMemo(() => {
    const onlyDigits = amountStr.replace(/[^\d]/g, '');
    if (onlyDigits === '') return 0;
    const n = parseInt(onlyDigits, 10);
    return Number.isFinite(n) ? n : 0;
  }, [amountStr]);

  const amtOk = amountNum >= 1;

  // Сумма в TON
  const amountTon = useMemo(() => Number((amountNum * STAR_TON_RATE).toFixed(4)), [amountNum]);

  const canBuy = userOk && amtOk && !!wallet;

  // Баланс
  useEffect(() => {
    let aborted = false;

    async function fetchBalance(addr: string) {
      try {
        const url = `https://toncenter.com/api/v2/getAddressBalance?address=${encodeURIComponent(addr)}`;
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

    return () => { aborted = true; };
  }, [addressFriendly]);

  // Покупка (заглушка)
  const onBuy = () => {
    if (!canBuy) return;
    alert(
      lang === 'ru'
        ? `Отправим ${amountNum} Stars пользователю @${username} за ~${amountTon} TON.\n(Тут вызываем TonConnect TX)`
        : `Will send ${amountNum} Stars to @${username} for ~${amountTon} TON.\n(Here call TonConnect TX)`
    );
  };

  return (
    <div className="container safe-bottom" style={{ padding: '20px 0 28px' }}>
      {/* HEADER */}
      <div data-hdr>
        <div data-hdr-left>
          <img src="/icon-512.png" alt="TonStars" width={36} height={36} />
          <div style={{ fontWeight: 700, fontSize: 22, whiteSpace: 'nowrap' }}>TonStars</div>

          {/* языковая пилюля */}
          <div data-langpill>
            <button
              onClick={() => setLang('ru')}
              aria-label="RU"
              style={{
                padding: '4px 10px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)',
                background: lang === 'ru' ? '#fff' : 'transparent',
                color: lang === 'ru' ? '#000' : '#cdd6f4',
                fontWeight: 700
              }}
            >
              RU
            </button>
            <button
              onClick={() => setLang('en')}
              aria-label="EN"
              style={{
                padding: '4px 10px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)',
                background: lang === 'en' ? '#fff' : 'transparent',
                color: lang === 'en' ? '#000' : '#cdd6f4',
                fontWeight: 700
              }}
            >
              EN
            </button>
          </div>
        </div>

        <div data-hdr-right>
          {/* wrapper чтобы у кнопки был data-атрибут для css-скейла */}
          <div data-tc-button>
            <TonConnectButton />
          </div>
        </div>
      </div>

      {/* HERO */}
      <h1
  style={{
    margin: '24px 0 8px',
    fontSize: 36,
    lineHeight: 1.1,
    letterSpacing: 0.2,
    textAlign: 'center'
  }}
>
  {t.hero}
</h1>
<div
  style={{
    opacity: 0.75,
    marginBottom: 18,
    textAlign: 'center'
  }}
>
  {t.sub}
</div>

      {/* CARD */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(180deg,#0c0f14,#0b0e13)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 18,
          boxShadow: '0 6px 28px rgba(0,0,0,0.45)',
          padding: 18,
          maxWidth: 840,
          margin: '0 auto'
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>
          {t.buyCardTitle}
        </div>

        {/* username */}
        <label style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}>
          {t.usernameLabel}
        </label>
        <input
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={t.usernamePh}
          value={username}
          onChange={(e) => setUsername(e.target.value.trim())}
          className={username ? (userOk ? 'input-ok' : 'input-err') : undefined}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#0c1016',
            padding: '0 14px',
            color: '#e6ebff',
            outline: 'none'
          }}
        />
        <div
          className={username ? (userOk ? 'ok' : 'err') : undefined}
          style={{ fontSize: 13, opacity: 0.9, marginTop: 8 }}
        >
          {username ? (userOk ? t.ok(Math.max(amountNum, 0)) : t.usernameErr) : t.usernameHint}
        </div>

        {/* amount */}
        <div style={{ height: 14 }} />
        <label style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}>
          {t.amountLabel}
        </label>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          className={amountStr !== '' ? (amtOk ? 'input-ok' : 'input-err') : undefined}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#0c1016',
            padding: '0 14px',
            color: '#e6ebff',
            outline: 'none'
          }}
        />
        <div
          className={amountStr !== '' ? (amtOk ? 'ok' : 'err') : undefined}
          style={{ fontSize: 13, opacity: 0.9, marginTop: 8 }}
        >
          {amountStr !== '' ? (amtOk ? t.ok(Math.max(amountNum, 0)) : t.amountErr) : t.ok(0)}
        </div>

        {/* итоги */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 10,
            marginBottom: 12,
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
            marginBottom: 16,
            fontSize: 16,
            opacity: 0.85
          }}
        >
          <div>{t.balance}</div>
          <div>{balanceTon == null ? (wallet ? '— TON' : '— TON') : `${balanceTon.toFixed(4)} TON`}</div>
        </div>

        <button
          onClick={onBuy}
          disabled={!canBuy}
          style={{
            width: '100%',
            height: 54,
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.08)',
            background: canBuy
              ? 'linear-gradient(90deg,#2a86ff,#16e3c9)'
              : 'rgba(255,255,255,0.06)',
            color: canBuy ? '#001014' : 'rgba(230,235,255,0.5)',
            fontSize: 18,
            fontWeight: 800,
            cursor: canBuy ? 'pointer' : 'default'
          }}
        >
          {t.buy}
        </button>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer__inner">
          <a href="/privacy">{t.policy}</a>
          <span aria-hidden="true">|</span>
          <a href="/terms">{t.terms}</a>
          <span aria-hidden="true">|</span>
          <span>{t.yearLine}</span>
        </div>
      </div>
    </div>
  );
}
