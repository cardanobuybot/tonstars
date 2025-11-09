'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Address } from '@ton/core';
import { useTonConnectUI, useTonWallet } from './providers/TonConnectProvider';

const STAR_TON_RATE = 0.0002;

const t = (lang: 'ru' | 'en') =>
  lang === 'ru'
    ? {
        title1: 'Покупай Telegram',
        title2: 'Stars за TON',
        tagline: 'Быстро. Без KYC. Прозрачно.',
        cardTitle: 'Купить Stars',
        usernameLabel: '@Telegram username',
        usernameHintOk: (u: string) => `Будет отправлено @${u}`,
        usernameHintBad: 'Допустимы только латиница, цифры и _ (5–32)',
        amountLabel: 'Сумма Stars',
        amountHintOk: (n: number) => `OK — ${n} Stars`,
        amountHintBad: 'Только целые числа ≥ 1',
        payLabel: 'К оплате (TON)',
        connect: 'Подключить кошелёк',
        buy: 'Купить Stars',
        privacy: 'Политика конфиденциальности',
        terms: 'Условия использования',
        confirmTitle: 'Подтвердите действие на www.tonstars.io',
        confirmText: (u: string, n: number, ton: string) =>
          `Отправим ${n} Stars пользователю @${u} за ≈ ${ton} TON`,
        balance: (x: string) => `· ${x} TON`,
      }
    : {
        title1: 'Buy Telegram',
        title2: 'Stars with TON',
        tagline: 'Fast. No KYC. Transparent.',
        cardTitle: 'Buy Stars',
        usernameLabel: '@Telegram username',
        usernameHintOk: (u: string) => `Will be sent to @${u}`,
        usernameHintBad: 'Only letters, digits, _ (5–32)',
        amountLabel: 'Stars amount',
        amountHintOk: (n: number) => `OK — ${n} Stars`,
        amountHintBad: 'Integers only, ≥ 1',
        payLabel: 'Total (TON)',
        connect: 'Connect Wallet',
        buy: 'Buy Stars',
        privacy: 'Privacy Policy',
        terms: 'Terms of Use',
        confirmTitle: 'Confirm action on www.tonstars.io',
        confirmText: (u: string, n: number, ton: string) =>
          `We will send ${n} Stars to @${u} for ≈ ${ton} TON`,
        balance: (x: string) => `· ${x} TON`,
      };

function useLang(): ['ru' | 'en', (l: 'ru' | 'en') => void] {
  const [lang, setLang] = useState<'ru' | 'en'>(
    (typeof window !== 'undefined' &&
      (localStorage.getItem('lang') as 'ru' | 'en')) || 'ru'
  );
  const set = (l: 'ru' | 'en') => {
    setLang(l);
    if (typeof window !== 'undefined') localStorage.setItem('lang', l);
  };
  return [lang, set];
}

export default function Page() {
  const [lang, setLang] = useLang();
  const tr = useMemo(() => t(lang), [lang]);

  const [username, setUsername] = useState('');
  const [rawAmount, setRawAmount] = useState('100');

  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const isConnected = !!wallet?.account?.address;

  // ---- friendly адрес ----
  const friendlyAddress = useMemo(() => {
    try {
      const raw = wallet?.account?.address;
      if (!raw) return '';
      // raw выглядит как "0:abcd…", конвертируем в friendly (EQ…)
      return Address.parseRaw(raw).toString({ bounceable: true, urlSafe: true });
    } catch {
      return wallet?.account?.address || '';
    }
  }, [wallet]);

  const shortFriendly = useMemo(() => {
    if (!friendlyAddress) return '';
    return `${friendlyAddress.slice(0, 4)}…${friendlyAddress.slice(-4)}`;
  }, [friendlyAddress]);

  // ---- баланс ----
  const [balanceTon, setBalanceTon] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        if (!friendlyAddress) {
          setBalanceTon(null);
          return;
        }
        const key = process.env.NEXT_PUBLIC_TONCENTER_API_KEY;
        const url =
          `https://toncenter.com/api/v2/getAddressBalance?address=${friendlyAddress}` +
          (key ? `&api_key=${encodeURIComponent(key)}` : '');

        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        if (!alive) return;
        // баланс в nanoton → в TON
        if (data.ok && typeof data.result === 'string') {
          setBalanceTon(Number(data.result) / 1e9);
        } else {
          setBalanceTon(null);
        }
      } catch {
        if (alive) setBalanceTon(null);
      }
    }
    load();
    // обновлять раз в 20 секунд
    const id = setInterval(load, 20000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [friendlyAddress]);

  // ---- проверки формы ----
  const usernameValid = useMemo(() => {
    const u = username.trim();
    if (u.length < 5 || u.length > 32) return false;
    return /^[a-zA-Z0-9_]+$/.test(u);
  }, [username]);

  const amount = useMemo(() => {
    const cleaned = rawAmount.replace(/[^0-9]/g, '');
    if (cleaned === '' || /^0\d+/.test(cleaned)) return NaN;
    const num = Number(cleaned);
    if (!Number.isInteger(num) || num < 1) return NaN;
    return num;
  }, [rawAmount]);

  const tonToPay = useMemo(
    () => (Number.isFinite(amount) ? Number((Number(amount) * STAR_TON_RATE).toFixed(4)) : 0),
    [amount]
  );

  const onSubmit = () => {
    if (!isConnected) {
      tonConnectUI.openModal();
      return;
    }
    if (!usernameValid || !Number.isFinite(amount)) return;

    const ok = window.confirm(
      `${tr.confirmTitle}\n\n${tr.confirmText(
        username.trim(),
        Number(amount),
        tonToPay.toFixed(4)
      )}`
    );
    if (!ok) return;

    alert('Демо: покупка будет реализована после backend.');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#e5edf5' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src="/icon-512.png" alt="TonStars" width={40} height={40} style={{ borderRadius: 8 }} />
          <div style={{ fontWeight: 700, fontSize: 20 }}>TonStars</div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as 'ru' | 'en')}
            style={{
              background: '#131a28',
              color: '#e5edf5',
              border: '1px solid #22304a',
              borderRadius: 10,
              padding: '10px 12px',
            }}
          >
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>

          <button
            onClick={() => (isConnected ? tonConnectUI.openModal() : tonConnectUI.openModal())}
            style={{
              padding: '10px 16px',
              background: 'linear-gradient(90deg, #1ea0ff 0%, #00c2b8 100%)',
              border: 'none',
              borderRadius: 12,
              color: '#0a0f1a',
              fontWeight: 700,
            }}
          >
            {isConnected
              ? `${shortFriendly}${balanceTon != null ? ' ' + tr.balance(balanceTon.toFixed(2)) : ''}`
              : (lang === 'ru' ? 'Подключить' : 'Connect') + ' Wallet'}
          </button>
        </div>
      </header>

      <section style={{ padding: '12px 20px 0' }}>
        <h1 style={{ fontSize: 34, lineHeight: 1.15, margin: 0, fontWeight: 800 }}>
          {tr.title1} <br /> {tr.title2}
        </h1>
        <p style={{ opacity: 0.7, marginTop: 10 }}>{tr.tagline}</p>
      </section>

      <main style={{ padding: 20 }}>
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            background: '#0f1524',
            border: '1px solid #1d2a44',
            borderRadius: 16,
            padding: 16,
            boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{tr.cardTitle}</div>

          <label style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}>{tr.usernameLabel}</label>
          <input
            inputMode="text"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              background: '#0a101c',
              color: '#e5edf5',
              border: `1px solid ${
                username.length === 0 ? '#22304a' : /^[a-zA-Z0-9_]+$/.test(username) && username.length>=5 && username.length<=32 ? '#2bde73' : '#e86868'
              }`,
              borderRadius: 12,
              padding: '14px 16px',
              outline: 'none',
            }}
          />
          <div
            style={{
              fontSize: 12,
              marginTop: 6,
              color: username.length === 0 ? '#90a0bf' : /^[a-zA-Z0-9_]+$/.test(username) && username.length>=5 && username.length<=32 ? '#2bde73' : '#e86868',
            }}
          >
            {username.length === 0 ? ' ' : (/^[a-zA-Z0-9_]+$/.test(username) && username.length>=5 && username.length<=32 ? tr.usernameHintOk(username.trim()) : tr.usernameHintBad)}
          </div>

          <div style={{ height: 12 }} />
          <label style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}>{tr.amountLabel}</label>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={rawAmount}
            onChange={(e) => setRawAmount(e.target.value)}
            onBlur={() => {
              const c = rawAmount.replace(/[^0-9]/g, '');
              if (c === '' || /^0\d+/.test(c)) setRawAmount('');
              else setRawAmount(String(Number(c)));
            }}
            placeholder="100"
            style={{
              width: '100%',
              background: '#0a101c',
              color: '#e5edf5',
              border: `1px solid ${rawAmount.length === 0 ? '#22304a' : Number.isFinite(Number(rawAmount)) ? '#2bde73' : '#22304a'}`,
              borderRadius: 12,
              padding: '14px 16px',
              outline: 'none',
            }}
          />
          <div
            style={{
              fontSize: 12,
              marginTop: 6,
              color: rawAmount.length === 0 ? '#90a0bf' : Number.isFinite(Number(rawAmount)) ? '#2bde73' : '#e86868',
            }}
          >
            {rawAmount.length === 0 ? ' ' : Number.isFinite(Number(rawAmount)) ? tr.amountHintOk(Number(rawAmount)) : tr.amountHintBad}
          </div>

          <div style={{ height: 16 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
            <span>{tr.payLabel}</span>
            <span>≈ {tonToPay.toFixed(4)} TON</span>
          </div>

          <div style={{ height: 14 }} />
          <button
            onClick={onSubmit}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: 'none',
              borderRadius: 14,
              fontWeight: 800,
              color: '#0a0f1a',
              background: 'linear-gradient(90deg, #1ea0ff 0%, #00c2b8 100%)',
              cursor: 'pointer',
            }}
          >
            {isConnected ? tr.buy : tr.connect}
          </button>
        </div>
      </main>

      <footer
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '10px 20px 40px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        <a href="/privacy" style={{ color: '#a9c1ff' }}>
          {tr.privacy}
        </a>
        <a href="/terms" style={{ color: '#a9c1ff' }}>
          {tr.terms}
        </a>
      </footer>
    </div>
  );
}
