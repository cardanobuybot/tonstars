'use client';

import React, { useEffect, useMemo, useState } from 'react';
import TonConnectProvider, { useTonConnectUI, useTonWallet } from './providers/TonConnectProvider';

// ====== Простая локализация (RU/EN) ======
type Lang = 'ru' | 'en';

const t: Record<Lang, Record<string, string>> = {
  ru: {
    title1: 'Покупай Telegram',
    title2: 'Stars за TON',
    subtitle: 'Быстро. Без KYC. Прозрачно.',
    connect: 'Подключить кошелёк',
    disconnect: 'Выйти',
    connected: 'Подключено',
    formTitle: 'Купить Stars',
    usernameLabel: '@Telegram username',
    usernameHint: 'Введите ник без @',
    amountLabel: 'Сумма Stars',
    amountOk: 'OK — {n} Stars',
    payLabel: 'К оплате (TON)',
    buy: 'Купить Stars',
    policy: 'Политика',
    terms: 'Условия',
    invalidUsername: 'Только латиница, цифры и подчёркивание',
    selectLang: 'Язык',
    balance: 'Баланс',
  },
  en: {
    title1: 'Buy Telegram',
    title2: 'Stars with TON',
    subtitle: 'Fast. No KYC. Transparent.',
    connect: 'Connect Wallet',
    disconnect: 'Disconnect',
    connected: 'Connected',
    formTitle: 'Buy Stars',
    usernameLabel: '@Telegram username',
    usernameHint: 'Enter username without @',
    amountLabel: 'Stars amount',
    amountOk: 'OK — {n} Stars',
    payLabel: 'To pay (TON)',
    buy: 'Buy Stars',
    policy: 'Privacy',
    terms: 'Terms',
    invalidUsername: 'Latin letters, digits and underscore only',
    selectLang: 'Language',
    balance: 'Balance',
  },
};

// 1 STAR = 0.0002 TON (1000 → 0.2 TON)
const STAR_TON_RATE = 0.0002;

// helper: сокращение адреса
function shortAddr(a: string, take = 4) {
  if (!a) return '';
  return `${a.slice(0, take)}…${a.slice(-take)}`;
}

// helper: красиво форматнуть число TON
function fmtTon(v: number) {
  return (Math.round(v * 10000) / 10000).toFixed(4);
}

// Пытаемся найти .ton-имя через TonAPI. Если нет, оставляем сокращённый адрес.
async function resolveFriendly(address: string): Promise<string | null> {
  try {
    const res = await fetch(`https://tonapi.io/v2/accounts/${address}`);
    if (!res.ok) return null;
    const data = await res.json();
    // TonAPI может вернуть .dns.domain
    const name = data?.dns?.domain as string | undefined;
    return name || null;
  } catch {
    return null;
  }
}

// Получить баланс в TON через TonAPI
async function fetchBalance(address: string): Promise<number | null> {
  try {
    const res = await fetch(`https://tonapi.io/v2/accounts/${address}`);
    if (!res.ok) return null;
    const data = await res.json();
    const nano = Number(data?.balance ?? 0);
    return nano / 1e9;
  } catch {
    return null;
  }
}

// ====== Главная страница ======
export default function Page() {
  // Язык
  const [lang, setLang] = useState<Lang>(() => (typeof window !== 'undefined' ? ((localStorage.getItem('lang') as Lang) || 'ru') : 'ru'));
  const tr = t[lang];

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  return (
    <TonConnectProvider lang={lang}>
      <HomeScreen lang={lang} setLang={setLang} />
    </TonConnectProvider>
  );
}

function HomeScreen({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const tr = t[lang];
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState<number>(100);
  const [usernameError, setUsernameError] = useState<string>('');

  const [displayName, setDisplayName] = useState<string>('');
  const [balance, setBalance] = useState<number | null>(null);
  const connected = !!wallet;

  // При подключении — тянем friendly имя и баланс
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (wallet?.account?.address) {
        const raw = wallet.account.address;
        const name = (await resolveFriendly(raw)) || shortAddr(raw, 4);
        const bal = await fetchBalance(raw);
        if (!cancelled) {
          setDisplayName(name);
          setBalance(bal);
        }
      } else {
        setDisplayName('');
        setBalance(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wallet?.account?.address]);

  // username: только латиница/цифры/_
  function validateUsername(v: string) {
    if (!/^[a-z0-9_]{1,32}$/i.test(v)) {
      setUsernameError(t[lang].invalidUsername);
      return false;
    }
    setUsernameError('');
    return true;
  }

  // amount: целые, ≥1
  function coerceAmount(v: string) {
    const clean = v.replace(/[^\d]/g, '');
    const n = Math.max(1, parseInt(clean || '0', 10));
    setAmount(n);
  }

  const priceTon = useMemo(() => amount * STAR_TON_RATE, [amount]);

  async function onBuy() {
    if (!connected) {
      await tonConnectUI.openModal(); // просим подключиться
      return;
    }
    if (!validateUsername(username)) return;

    // Здесь будет запрос на бэкенд/мейкеру (A-реселлеру) + TonConnect sendTransaction
    alert(
      lang === 'ru'
        ? `Отправим ${amount} Stars пользователю @${username} за ≈ ${fmtTon(priceTon)} TON`
        : `We will send ${amount} Stars to @${username} for ≈ ${fmtTon(priceTon)} TON`
    );
  }

  async function onConnectClick() {
    await tonConnectUI.openModal();
  }

  async function onDisconnect() {
    await tonConnectUI.disconnect();
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#e5edf5' }}>
      {/* Header */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
          {/* Лого */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/icon.svg" alt="TonStars" width={28} height={28} style={{ borderRadius: 6 }} />
            <div style={{ fontWeight: 700 }}>TonStars</div>
          </div>

          {/* Правый блок: язык + кошелёк */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              style={{ background: '#111827', color: '#e5edf5', border: '1px solid #233047', borderRadius: 8, padding: '8px 10px' }}
            >
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>

            {!connected ? (
              <button
                onClick={onConnectClick}
                style={{
                  background: 'linear-gradient(135deg, #2b8cff, #1be2c5)',
                  color: '#05101c',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 12,
                  fontWeight: 700,
                }}
              >
                {t[lang].connect}
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    background: '#0f172a',
                    border: '1px solid #233047',
                    padding: '8px 10px',
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                  title={wallet?.account?.address}
                >
                  {displayName}{balance != null ? ` • ${fmtTon(balance)} TON` : ''}
                </div>
                <button
                  onClick={onDisconnect}
                  style={{
                    background: 'transparent',
                    color: '#9fb4cc',
                    border: '1px solid #233047',
                    padding: '8px 12px',
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                >
                  {t[lang].disconnect}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 16px 0' }}>
        <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.1 }}>
          {t[lang].title1} <span style={{ color: '#9fb4cc' }}>Telegram</span>
          <br />
          {t[lang].title2}
        </h1>
        <p style={{ opacity: 0.8, marginTop: 8 }}>{t[lang].subtitle}</p>
      </div>

      {/* Card */}
      <div style={{ maxWidth: 980, margin: '16px auto 0', padding: '0 16px 32px' }}>
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #233047',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>{t[lang].formTitle}</h2>

          {/* Username */}
          <label style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}>{t[lang].usernameLabel}</label>
          <input
            inputMode="text"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/^@+/, ''))}
            onBlur={(e) => validateUsername(e.target.value)}
            style={{
              width: '100%',
              background: '#0b1324',
              border: `1px solid ${usernameError ? '#b04b4b' : '#233047'}`,
              color: '#e5edf5',
              outline: 'none',
              padding: '12px 14px',
              borderRadius: 12,
            }}
          />
          <div style={{ height: 22, color: usernameError ? '#ff8d8d' : '#7ea2c4', marginTop: 6, fontSize: 14 }}>
            {usernameError ? usernameError : (lang === 'ru' ? 'Будет отправлено' : 'Will be sent to')}{' '}
            {username ? `@${username}` : ''}
          </div>

          {/* Amount */}
          <label style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}>{t[lang].amountLabel}</label>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={String(amount)}
            onChange={(e) => coerceAmount(e.target.value)}
            style={{
              width: '100%',
              background: '#0b1324',
              border: '1px solid #233047',
              color: '#e5edf5',
              outline: 'none',
              padding: '12px 14px',
              borderRadius: 12,
            }}
          />
          <div style={{ color: '#7ea2c4', marginTop: 6, fontSize: 14 }}>{t[lang].amountOk.replace('{n}', String(amount))}</div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 12 }}>
            <div style={{ opacity: 0.9 }}>{t[lang].payLabel}</div>
            <div style={{ fontWeight: 700 }}>≈ {fmtTon(priceTon)} TON</div>
          </div>

          {/* Buy */}
          <button
            onClick={onBuy}
            disabled={!username || !!usernameError || amount < 1}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #2b8cff, #1be2c5)',
              color: '#05101c',
              border: 'none',
              padding: '14px 18px',
              borderRadius: 12,
              fontWeight: 800,
              opacity: !username || !!usernameError || amount < 1 ? 0.5 : 1,
              cursor: !username || !!usernameError || amount < 1 ? 'not-allowed' : 'pointer',
            }}
          >
            {t[lang].buy}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '8px 16px 32px', display: 'flex', gap: 24 }}>
        <a href={lang === 'ru' ? '/privacy' : '/privacy'} style={{ color: '#9fb4cc' }}>
          {t[lang].policy}
        </a>
        <a href={lang === 'ru' ? '/terms' : '/terms'} style={{ color: '#9fb4cc' }}>
          {t[lang].terms}
        </a>
      </div>
    </div>
  );
}
