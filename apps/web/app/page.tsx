'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTonConnectUI, useTonWallet } from './providers/TonConnectProvider';

// 1 STAR = 0.0002 TON  (1000 → 0.2 TON)
const STAR_TON_RATE = 0.0002;

// Утилиты
const fmtTon = (t: number) => (Math.round(t * 10000) / 10000).toFixed(4);
const shortAddr = (addr: string) => (addr.length > 10 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr);
const tgRegex = /^[a-z0-9_]{5,32}$/i;

const clampStars = (v: string, min = 1, max = 1_000_000) => {
  const n = Math.floor(Number(v.replace(/[^\d]/g, '')));
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
};

// Баланс TON (через toncenter, без ключа — ок для теста)
async function fetchBalanceTON(address: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://toncenter.com/api/v2/getAddressBalance?address=${encodeURIComponent(address)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const nano = Number(data?.result ?? data?.balance ?? 0);
    if (!Number.isFinite(nano)) return null;
    return nano / 1e9;
  } catch {
    return null;
  }
}

// Пытаемся получить .ton имя (TonAPI). Если не выйдет — покажем короткий адрес.
async function resolveTonName(address: string): Promise<string | null> {
  try {
    const res = await fetch(`https://tonapi.io/v2/dns/${encodeURIComponent(address)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const name = json?.domain?.name || json?.name || json?.dns?.name || null;
    return typeof name === 'string' && name.endsWith('.ton') ? name : null;
  } catch {
    return null;
  }
}

export default function Page() {
  const [tonConnectUI] = useTonConnectUI() as any; // подстраховка типов пакета
  const wallet = useTonWallet();

  const [username, setUsername] = useState('');
  const [stars, setStars] = useState<number>(100);

  const [nameHint, setNameHint] = useState<string>('Введите ник без @');
  const [isNameValid, setIsNameValid] = useState(true);

  const [balance, setBalance] = useState<number | null>(null);
  const [friendly, setFriendly] = useState<string | null>(null);

  // Валидация ника
  useEffect(() => {
    const clean = username.trim();
    if (!clean) {
      setIsNameValid(true);
      setNameHint('Введите ник без @');
      return;
    }
    if (clean.startsWith('@')) {
      setIsNameValid(false);
      setNameHint('Ник указывайте без @');
      return;
    }
    if (!tgRegex.test(clean)) {
      setIsNameValid(false);
      setNameHint('Только латиница, цифры и подчёркивания (5–32)');
      return;
    }
    setIsNameValid(true);
    setNameHint(`Будет отправлено @${clean.toLowerCase()}`);
  }, [username]);

  // Баланс и .ton имя при подключении
  const rawAddr = wallet?.account?.address || null;

  useEffect(() => {
    let cancel = false;
    if (!rawAddr) {
      setBalance(null);
      setFriendly(null);
      return;
    }
    (async () => {
      const [b, dn] = await Promise.all([fetchBalanceTON(rawAddr), resolveTonName(rawAddr)]);
      if (cancel) return;
      setBalance(b);
      setFriendly(dn);
    })();
    return () => {
      cancel = true;
    };
  }, [rawAddr]);

  const totalTon = useMemo(() => stars * STAR_TON_RATE, [stars]);
  const connected = !!wallet;
  const displayName = useMemo(() => {
    if (!rawAddr) return '';
    if (friendly) return friendly;
    return shortAddr(rawAddr);
  }, [rawAddr, friendly]);

  const onConnect = async () => { await tonConnectUI.openModal(); };
  const onDisconnect = async () => { try { await tonConnectUI.disconnect(); } catch {} };

  const submit = async () => {
    const clean = username.trim();
    if (!connected) return;
    if (!tgRegex.test(clean) || stars < 1) return;
    alert(`Отправим ${stars} Stars пользователю @${clean} за ≈ ${fmtTon(totalTon)} TON`);
    // тут позже вставим реальную логику покупок/мейкеру
  };

  const canBuy = connected && isNameValid && tgRegex.test(username.trim()) && stars >= 1;

  return (
    <div style={{ padding: '24px 16px', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/icon-512.png" width={28} height={28} alt="TonStars" style={{ borderRadius: 6 }} />
          <div style={{ fontWeight: 700, fontSize: 20 }}>TonStars</div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {connected ? (
            <>
              <div
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  padding: '8px 12px',
                  fontSize: 13,
                  opacity: 0.95
                }}
                title={rawAddr || undefined}
              >
                {displayName}{balance != null ? ` • ${fmtTon(balance)} TON` : ''}
              </div>
              <button
                onClick={onDisconnect}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.16)',
                  background: 'transparent',
                  color: 'inherit'
                }}
              >
                Выйти
              </button>
            </>
          ) : (
            <button
              onClick={onConnect}
              style={{
                padding: '12px 16px',
                borderRadius: 14,
                border: 'none',
                color: '#0b1324',
                fontWeight: 700,
                background: 'linear-gradient(90deg, #4bc0ff, #36f1c7)'
              }}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: 44, lineHeight: 1.1, margin: '0 0 8px' }}>
        Покупай Telegram<br />Stars за TON
      </h1>
      <p style={{ opacity: 0.75, marginBottom: 24 }}>Быстро. Без KYC. Прозрачно.</p>

      {/* Card */}
      <div
        style={{
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)',
          padding: 20,
          maxWidth: 720
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Купить Stars</div>

        {/* Username */}
        <label style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}>@Telegram username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          pattern="[a-zA-Z0-9_]*"
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${isNameValid ? 'rgba(255,255,255,0.16)' : 'rgba(255,80,80,0.7)'}`,
            color: 'inherit',
            outline: 'none',
            marginBottom: 6
          }}
        />
        <div
          style={{
            minHeight: 20,
            fontSize: 13,
            color: isNameValid ? 'rgba(120,230,180,0.9)' : 'rgba(255,120,120,0.95)',
            marginBottom: 10
          }}
        >
          {nameHint}
        </div>

        {/* Stars */}
        <label style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}>Сумма Stars</label>
        <input
          value={String(stars)}
          onChange={(e) => setStars(clampStars(e.target.value))}
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          placeholder="100"
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.16)',
            color: 'inherit',
            outline: 'none',
            marginBottom: 8
          }}
          onBlur={(e) => setStars(clampStars(e.target.value))}
        />
        <div style={{ opacity: 0.7, fontSize: 13, marginBottom: 16 }}>OK — {stars} Stars</div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ opacity: 0.85 }}>К оплате (TON)</div>
          <div style={{ fontWeight: 700 }}>≈ {fmtTon(totalTon)} TON</div>
        </div>

        {/* Buy */}
        <button
          onClick={submit}
          disabled={!canBuy}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 14,
            border: 'none',
            fontWeight: 700,
            background: canBuy ? 'linear-gradient(90deg, #4bc0ff, #36f1c7)' : 'rgba(255,255,255,0.08)',
            color: canBuy ? '#0b1324' : 'rgba(255,255,255,0.35)',
            cursor: canBuy ? 'pointer' : 'not-allowed'
          }}
        >
          Купить Stars
        </button>
      </div>

      {/* Footer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 28, maxWidth: 720 }}>
        <a href="/privacy" style={{ opacity: 0.9 }}>Политика конфиденциальности</a>
        <a href="/terms" style={{ opacity: 0.9 }}>Условия использования</a>
      </div>
    </div>
  );
}
