'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
} from '@tonconnect/ui-react';

const STAR_TON_RATE = 0.0002;

function formatTon(v: number) {
  if (!isFinite(v)) return '0.0000';
  return v.toFixed(4);
}

async function fetchTonBalance(address: string): Promise<number> {
  const r = await fetch(`https://tonapi.io/v2/accounts/${address}`, {
    cache: 'no-store',
  });
  if (!r.ok) throw new Error('Balance request failed');
  const data = await r.json();
  const nano: number = Number(data.balance ?? 0);
  return nano / 1e9;
}

const USERNAME_REGEX = /^[a-zA-Z0-9_]{5,32}$/;

export default function Page() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [username, setUsername] = useState('');
  const [amountStr, setAmountStr] = useState('100');

  const amount = useMemo(() => {
    if (amountStr.trim() === '') return 0;
    const v = Number(amountStr);
    return Number.isFinite(v) ? Math.floor(Math.max(0, v)) : 0;
  }, [amountStr]);

  const amountTon = useMemo(() => amount * STAR_TON_RATE, [amount]);
  const usernameValid = useMemo(() => USERNAME_REGEX.test(username), [username]);

  const [balanceTon, setBalanceTon] = useState<number | null>(null);
  const [balLoading, setBalLoading] = useState(false);
  const address = wallet?.account?.address;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!address) {
        setBalanceTon(null);
        return;
      }
      try {
        setBalLoading(true);
        const b = await fetchTonBalance(address);
        if (!cancelled) setBalanceTon(b);
      } catch {
        if (!cancelled) setBalanceTon(null);
      } finally {
        if (!cancelled) setBalLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [address]);

  function onBuy() {
    if (!wallet) {
      tonConnectUI.openModal();
      return;
    }
    alert(
      `Отправим ${amount} Stars пользователю @${username} за ~ ${formatTon(
        amountTon
      )} TON`
    );
  }

  const notEnough =
    balanceTon !== null && amountTon > 0 && amountTon > balanceTon;
  const canBuy =
    !!wallet && usernameValid && amount >= 1 && amountTon > 0 && !notEnough;

  const texts = {
    ru: {
      title: 'Покупай Telegram Stars за TON',
      fast: 'Быстро. Без KYC. Прозрачно.',
      buyBox: 'Купить Stars',
      userLabel: '@Telegram username',
      userHint:
        'Введите ник без @. Допустимы латинские буквы, цифры и _ (5–32).',
      amountLabel: 'Сумма Stars',
      ok: (n: number) => `OK — ${n || 0} Stars`,
      toPay: 'К оплате (TON)',
      balance: 'Баланс (TON)',
      buy: 'Купить Stars',
      policy: 'Политика',
      terms: 'Условия',
    },
    en: {
      title: 'Buy Telegram Stars with TON',
      fast: 'Fast. No KYC. Transparent.',
      buyBox: 'Buy Stars',
      userLabel: '@Telegram username',
      userHint:
        'Enter username without @. Latin letters, digits and _ (5–32).',
      amountLabel: 'Stars amount',
      ok: (n: number) => `OK — ${n || 0} Stars`,
      toPay: 'To pay (TON)',
      balance: 'Balance (TON)',
      buy: 'Buy Stars',
      policy: 'Privacy',
      terms: 'Terms',
    },
  };

  const t = texts[lang];

  return (
    <div
      style={{
        maxWidth: 820,
        margin: '0 auto',
        padding: 16,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          justifyContent: 'space-between',
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/icon-512.png"
            alt="TonStars"
            width={32}
            height={32}
            style={{ borderRadius: 6 }}
          />
          <div style={{ fontSize: 20, fontWeight: 700 }}>TonStars</div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 12,
              padding: 2,
            }}
          >
            <button
              onClick={() => setLang('ru')}
              style={{
                padding: '6px 10px',
                borderRadius: 10,
                background: lang === 'ru' ? '#fff' : 'transparent',
                color: lang === 'ru' ? '#000' : '#fff',
                fontWeight: 600,
                border: 'none',
              }}
            >
              RU
            </button>
            <button
              onClick={() => setLang('en')}
              style={{
                padding: '6px 10px',
                borderRadius: 10,
                background: lang === 'en' ? '#fff' : 'transparent',
                color: lang === 'en' ? '#000' : '#fff',
                fontWeight: 600,
                border: 'none',
              }}
            >
              EN
            </button>
          </div>

          <TonConnectButton />
        </div>
      </div>

      {/* content */}
      <div style={{ flex: 1 }}>
        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.1 }}>{t.title}</h1>
        <div style={{ opacity: 0.7, marginTop: 8, marginBottom: 22 }}>
          {t.fast}
        </div>

        <div
          style={{
            padding: 20,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>
            {t.buyBox}
          </div>

          <label style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}>
            {t.userLabel}
          </label>
          <input
            value={username}
            onChange={(e) => {
              const v = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
              setUsername(v);
            }}
            inputMode="text"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="username"
            style={{
              width: '100%',
              height: 52,
              padding: '0 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.02)',
              color: '#e5edf5',
              outline: 'none',
            }}
          />
          <div
            style={{
              marginTop: 8,
              marginBottom: 14,
              fontSize: 13,
              opacity: 0.7,
              color:
                username.length > 0 && !usernameValid ? '#ff6868' : 'inherit',
            }}
          >
            {t.userHint}
          </div>

          <label style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}>
            {t.amountLabel}
          </label>
          <input
            value={amountStr}
            onChange={(e) => {
              const next = e.target.value.replace(/[^\d]/g, '');
              setAmountStr(next);
            }}
            onBlur={() => {
              const v = Math.max(1, amount || 0);
              setAmountStr(String(v));
            }}
            placeholder="100"
            inputMode="numeric"
            style={{
              width: '100%',
              height: 52,
              padding: '0 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.02)',
              color: '#e5edf5',
              outline: 'none',
            }}
          />
          <div style={{ marginTop: 8, marginBottom: 16, opacity: 0.7 }}>
            {t.ok(amount)}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 8,
              alignItems: 'center',
              marginTop: 8,
              marginBottom: 12,
              fontSize: 16,
            }}
          >
            <div>{t.toPay}</div>
            <div>≈ {formatTon(amountTon)} TON</div>

            <div style={{ opacity: 0.8 }}>{t.balance}</div>
            <div
              style={{
                color: notEnough ? '#ff6868' : 'inherit',
                opacity: balLoading ? 0.6 : 1,
              }}
            >
              {balLoading || balanceTon === null
                ? '—'
                : `${formatTon(balanceTon)} TON`}
            </div>
          </div>

          <button
            onClick={onBuy}
            disabled={!canBuy}
            style={{
              width: '100%',
              height: 54,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.12)',
              background: canBuy
                ? 'linear-gradient(90deg, #4da3ff 0%, #2fe3c8 100%)'
                : 'rgba(255,255,255,0.06)',
              color: canBuy ? '#001014' : 'rgba(255,255,255,0.5)',
              fontSize: 18,
              fontWeight: 700,
              cursor: canBuy ? 'pointer' : 'not-allowed',
            }}
          >
            {t.buy}
          </button>
        </div>
      </div>

      {/* footer */}
<div
  style={{
    marginTop: 32,
    padding: '16px 0',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  }}
>
  <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none', marginRight: 12 }}>
    Политика
  </a>
  |
  <a href="/terms" style={{ color: 'inherit', textDecoration: 'none', marginLeft: 12, marginRight: 12 }}>
    Условия
  </a>
  |
  <span style={{ marginLeft: 12 }}>© 2025 TonStars</span>
</div>
  );
}
