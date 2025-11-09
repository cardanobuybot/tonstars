'use client';
import React, { useState, useEffect } from 'react';
import { TonConnectButton, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';

export default function Page() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const [username, setUsername] = useState('');
  const [stars, setStars] = useState('');
  const [amountTon, setAmountTon] = useState(0);
  const [balance, setBalance] = useState<number | null>(null);
  const [lang, setLang] = useState<'ru' | 'en'>('ru');

  const texts = {
    ru: {
      title: 'Покупай Telegram Stars за TON',
      subtitle: 'Быстро. Без KYC. Прозрачно.',
      username: '@Telegram username',
      usernamePlaceholder: 'username',
      usernameHint: 'Введите ник без @. Допустимы латинские буквы, цифры и _ (5–32).',
      amount: 'Сумма Stars',
      ok: 'OK',
      toPay: 'К оплате (TON)',
      balance: 'Баланс (TON)',
      buy: 'Купить Stars',
      policy: 'Политика',
      terms: 'Условия',
    },
    en: {
      title: 'Buy Telegram Stars with TON',
      subtitle: 'Fast. No KYC. Transparent.',
      username: '@Telegram username',
      usernamePlaceholder: 'username',
      usernameHint: 'Enter username without @. Latin letters, digits and _ (5–32).',
      amount: 'Stars amount',
      ok: 'OK',
      toPay: 'To pay (TON)',
      balance: 'Balance (TON)',
      buy: 'Buy Stars',
      policy: 'Privacy',
      terms: 'Terms',
    },
  };

  const t = texts[lang];

  useEffect(() => {
    if (wallet) {
      // эмуляция получения баланса — позже можно подцепить API
      setBalance(5.8294);
    } else {
      setBalance(null);
    }
  }, [wallet]);

  useEffect(() => {
    const num = parseFloat(stars);
    if (!isNaN(num) && num > 0) {
      setAmountTon(num * 0.0002);
    } else {
      setAmountTon(0);
    }
  }, [stars]);

  const onBuy = () => {
    if (!wallet) {
      tonConnectUI.openModal();
      return;
    }
    alert(`Отправляем ${amountTon} TON пользователю @${username}`);
  };

  const canBuy = username.length >= 5 && stars !== '' && amountTon > 0;

  return (
    <main
      style={{
        maxWidth: 820,
        margin: '0 auto',
        padding: 20,
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/icon-512.png" alt="TonStars" width={36} height={36} />
          <div style={{ fontWeight: 700, fontSize: 22 }}>TonStars</div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
            <button
              onClick={() => setLang('ru')}
              style={{
                background: lang === 'ru' ? '#fff' : 'transparent',
                color: lang === 'ru' ? '#000' : '#fff',
                borderRadius: 8,
                padding: '4px 8px',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              RU
            </button>
            <button
              onClick={() => setLang('en')}
              style={{
                background: lang === 'en' ? '#fff' : 'transparent',
                color: lang === 'en' ? '#000' : '#fff',
                borderRadius: 8,
                padding: '4px 8px',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              EN
            </button>
          </div>
        </div>
        <TonConnectButton />
      </div>

      {/* TITLE */}
      <h1 style={{ fontSize: 38, lineHeight: 1.2, marginBottom: 8 }}>{t.title}</h1>
      <div style={{ opacity: 0.8, marginBottom: 28 }}>{t.subtitle}</div>

      {/* FORM */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 16,
          padding: 20,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>{t.buy}</div>

        <label style={{ display: 'block', marginBottom: 8 }}>{t.username}</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.trim())}
          placeholder={t.usernamePlaceholder}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          style={{
            width: '100%',
            height: 48,
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            padding: '0 12px',
            fontSize: 16,
          }}
        />
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>{t.usernameHint}</div>

        <div style={{ marginTop: 20 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>{t.amount}</label>
          <input
            type="number"
            value={stars}
            onChange={(e) => setStars(e.target.value)}
            placeholder="100"
            style={{
              width: '100%',
              height: 48,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              padding: '0 12px',
              fontSize: 16,
            }}
          />
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>
            {t.ok} — {stars || 0} Stars
          </div>
        </div>

        {/* ИТОГ */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 16,
            marginBottom: 8,
            fontSize: 16,
          }}
        >
          <div>{t.toPay}</div>
          <div>≈ {amountTon.toFixed(4)} TON</div>
        </div>

        {wallet && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 20,
              fontSize: 16,
            }}
          >
            <div>{t.balance}</div>
            <div>{balance?.toFixed(4) ?? '—'} TON</div>
          </div>
        )}

        <button
          onClick={onBuy}
          disabled={!canBuy}
          style={{
            width: '100%',
            height: 54,
            borderRadius: 12,
            border: 'none',
            background: canBuy
              ? 'linear-gradient(90deg,#00C6FB,#005BEA)'
              : 'rgba(255,255,255,0.08)',
            color: canBuy ? '#001014' : 'rgba(255,255,255,0.3)',
            fontSize: 18,
            fontWeight: 700,
            cursor: canBuy ? 'pointer' : 'default',
          }}
        >
          {t.buy}
        </button>
      </div>

      {/* FOOTER */}
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
        <a
          href="/privacy"
          style={{
            color: 'inherit',
            textDecoration: 'none',
            marginRight: 12,
          }}
        >
          {t.policy}
        </a>
        |
        <a
          href="/terms"
          style={{
            color: 'inherit',
            textDecoration: 'none',
            marginLeft: 12,
            marginRight: 12,
          }}
        >
          {t.terms}
        </a>
        |
        <span style={{ marginLeft: 12 }}>© 2025 TonStars</span>
      </div>
    </main>
  );
}
