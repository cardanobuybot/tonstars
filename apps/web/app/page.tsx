'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

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

  async function disconnect() {
    try {
      await tonConnectUI.disconnect();
    } catch {}
  }

  async function connect() {
    try {
      await tonConnectUI.openModal();
    } catch {}
  }

  function onBuy() {
    if (!wallet) return;
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

  const t = {
    title: 'Покупай Telegram Stars за TON',
    fast: 'Быстро. Без KYC. Прозрачно.',
    buyBox: 'Купить Stars',
    userLabel: '@Telegram username',
    userHint: 'Введите ник без @. Допустимы латинские буквы, цифры и _ (5–32).',
    amountLabel: 'Сумма Stars',
    ok: (n: number) => `OK — ${n || 0} Stars`,
    toPay: 'К оплате (TON)',
    balance: 'Баланс (TON)',
    buy: 'Купить Stars',
    connect: 'Подключить кошелёк',
    logout: 'Выйти',
  };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: 16 }}>
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

        <div style={{ display: 'flex', gap: 8 }}>
          {wallet ? (
            <>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)',
                  fontSize: 14,
                }}
              >
                {address?.slice(0, 4)}…{address?.slice(-4)}{' '}
                {balanceTon !== null && (
                  <span style={{ opacity: 0.8 }}>
                    · {formatTon(balanceTon)} TON
                  </span>
                )}
              </div>
              <button
                onClick={disconnect}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer',
                }}
              >
                {t.logout}
              </button>
            </>
          ) : (
            <button
              onClick={connect}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                background:
                  'linear-gradient(90deg, #4da3ff 0%, #2fe3c8 100%)',
                color: '#001014',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
              data-tc-button
            >
              {t.connect}
            </button>
          )}
        </div>
      </div>

      {/* title */}
      <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.1 }}>{t.title}</h1>
      <div style={{ opacity: 0.7, marginTop: 8, marginBottom: 22 }}>
        {t.fast}
      </div>

      {/* card */}
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
            color: username.length > 0 && !usernameValid ? '#ff6868' : 'inherit',
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

        {/* итог + баланс */}
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
  );
}
