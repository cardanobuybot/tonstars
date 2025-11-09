'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';

const STAR_TON_RATE = 0.0002;

const texts = {
  ru: {
    hero: 'Покупай Telegram Stars за TON',
    sub: 'Быстро. Без KYC. Прозрачно.',
    buyCardTitle: 'Купить Stars',
    usernameLabel: 'Telegram username:',
    usernamePh: 'username',
    usernameHint: 'Введите ник без @.',
    amountLabel: 'Количество Stars:',
    ok: (n: number) => `OK — ${n} Stars`,
    usernameErr: 'Ник: латиница/цифры/_ (5–32)',
    amountErr: 'Введите целое число ≥ 1',
    toPay: 'К оплате (TON)',
    balance: 'Баланс (TON)',
    buy: 'Купить Stars',
    policy: 'Политика',
    terms: 'Условия',
    yearLine: '© 2025 TonStars'
  },
  en: {
    hero: 'Buy Telegram Stars with TON',
    sub: 'Fast. No KYC. Transparent.',
    buyCardTitle: 'Buy Stars',
    usernameLabel: 'Telegram username:',
    usernamePh: 'username',
    usernameHint: 'Enter username without @.',
    amountLabel: 'Stars amount:',
    ok: (n: number) => `OK — ${n} Stars`,
    usernameErr: 'Username: latin/digits/_ (5–32)',
    amountErr: 'Enter an integer ≥ 1',
    toPay: 'To pay (TON)',
    balance: 'Balance (TON)',
    buy: 'Buy Stars',
    policy: 'Privacy',
    terms: 'Terms',
    yearLine: '© 2025 TonStars'
  }
};

export default function Page() {
  // язык
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const t = texts[lang];

  // форма
  const [username, setUsername] = useState('');
  const [amountStr, setAmountStr] = useState('100');

  // кошелёк/баланс
  const wallet = useTonWallet();
  const [balanceTon, setBalanceTon] = useState<number | null>(null);
  const addressFriendly = wallet?.account?.address;

  // валидации
  const userOk = useMemo(() => /^[a-z0-9_]{5,32}$/i.test(username), [username]);
  const amountNum = useMemo(() => {
    const digits = amountStr.replace(/[^\d]/g, '');
    const n = parseInt(digits || '0', 10);
    return Number.isFinite(n) ? n : 0;
  }, [amountStr]);
  const amtOk = amountNum >= 1;
  const amountTon = useMemo(() => Number((amountNum * STAR_TON_RATE).toFixed(4)), [amountNum]);
  const canBuy = userOk && amtOk && !!wallet;

  // баланс
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

  // buy flow (заглушка)
  const onBuy = () => {
    if (!canBuy) return;
    alert(
      lang === 'ru'
        ? `Отправим ${amountNum} Stars пользователю @${username} за ~${amountTon} TON.\n(Тут вызываем TonConnect TX)`
        : `Will send ${amountNum} Stars to @${username} for ~${amountTon} TON.\n(Here call TonConnect TX)`
    );
  };

  return (
    <div className="container safe-bottom" style={{ padding: '32px 16px 28px' }}>
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div data-hdr style={{ marginBottom: 12 }}>
        <div data-hdr-left>
          <img src="/icon-512.png" alt="TonStars" width={36} height={36} />
          <div style={{ fontWeight: 700, fontSize: 22, whiteSpace: 'nowrap' }}>TonStars</div>
        </div>
        <div data-hdr-right>
          <div data-tc-button>
            <TonConnectButton />
          </div>
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────── */}
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
      <div style={{ opacity: 0.75, marginBottom: 18, textAlign: 'center' }}>{t.sub}</div>

      {/* ── CARD ─────────────────────────────────────────────── */}
      <div
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
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>{t.buyCardTitle}</div>

        {/* username */}
        <label style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}>{t.usernameLabel}</label>
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
        {/* helper under username: only hint or error */}
{(!username || !userOk) && (
  <div
    className={username && !userOk ? 'err' : undefined}
    style={{ fontSize: 13, opacity: 0.9, marginTop: 8 }}
  >
    {username ? t.usernameErr : t.usernameHint}
  </div>
)}

        {/* amount */}
        <div style={{ height: 14 }} />
        <label style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}>{t.amountLabel}</label>
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
          <div>{balanceTon == null ? '— TON' : `${balanceTon.toFixed(4)} TON`}</div>
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

      {/* ── BOTTOM BAR: язык + ссылки в одну линию по центру ───────── */}
<div
  className="bottom-bar"
  style={{
    maxWidth: 840,
    margin: '28px auto 0',
    paddingTop: 16,
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    flexWrap: 'wrap',          // если совсем узко — аккуратно перенесёт
    opacity: 0.9,
    fontSize: 15
  }}
>
  {/* переключатель языка – чутка левее визуального центра */}
  <div
    className="lang-pill"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: '#10131a',
      padding: '2px 6px',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.06)',
      transform: 'translateX(-16px)'
    }}
  >
    <button
      onClick={() => setLang('ru')}
      aria-label="RU"
      style={{
        padding: '4px 10px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        background: lang === 'ru' ? '#0098ea' : 'transparent',
        color: lang === 'ru' ? '#fff' : '#cdd6f4',
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
        background: lang === 'en' ? '#0098ea' : 'transparent',
        color: lang === 'en' ? '#fff' : '#cdd6f4',
        fontWeight: 700
      }}
    >
      EN
    </button>
  </div>

  {/* разделители и ссылки */}
  <a href="/privacy" className="foot-link">{t.policy}</a>
  <span className="foot-sep">|</span>
  <a href="/terms" className="foot-link">{t.terms}</a>
  <span className="foot-sep">|</span>
  <span className="foot-mute">{t.yearLine}</span>
</div>
    </div>
  );
}
