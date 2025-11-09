'use client';
import React, { useMemo, useState } from 'react';
import Image from 'next/image';

const MIN_STARS = 1;
const TON_PER_STAR = 0.0002; // пример курса, можно изменить

export default function Page() {
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [username, setUsername] = useState('');
  const [stars, setStars] = useState<number>(100);
  const [connected, setConnected] = useState(false);

  const amountTon = useMemo(
    () => (stars >= MIN_STARS ? stars * TON_PER_STAR : 0),
    [stars]
  );

  const ui = {
    ru: {
      title: 'Покупай Telegram Stars за TON',
      sub: 'Быстро. Без KYC. Прозрачно.',
      buyCard: 'Купить Stars',
      tgUser: '@Telegram username',
      sum: 'Сумма Stars',
      onlyInt: 'Только целые числа ≥ 1',
      pay: 'К оплате (TON)',
      connect: 'Подключить кошелёк',
      buy: 'Купить Stars',
      privacy: 'Политика конфиденциальности',
      terms: 'Условия использования',
    },
    en: {
      title: 'Buy Telegram Stars with TON',
      sub: 'Fast. No KYC. Transparent.',
      buyCard: 'Buy Stars',
      tgUser: '@Telegram username',
      sum: 'Stars amount',
      onlyInt: 'Integers only ≥ 1',
      pay: 'To Pay (TON)',
      connect: 'Connect Wallet',
      buy: 'Buy Stars',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
    },
  }[lang];

  function normalizeStars(v: string) {
    const digits = v.replace(/[^\d]/g, '');
    if (!digits) return '';
    const norm = String(parseInt(digits, 10));
    return norm;
  }

  function onStarsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const norm = normalizeStars(e.target.value);
    if (norm === '') {
      setStars(NaN as any);
      return;
    }
    const n = Math.max(MIN_STARS, parseInt(norm, 10));
    setStars(n);
  }

  function onBuy() {
    if (!connected) return;
    if (!username || !/^[a-zA-Z0-9_]{4,32}$/.test(username)) {
      alert(
        lang === 'ru'
          ? 'Введите корректный username без @'
          : 'Enter valid username without @'
      );
      return;
    }
    alert(
      `OK: ${stars} stars to @${username} (~${amountTon.toFixed(4)} TON)`
    );
  }

  return (
    <div className="wrapper">
      <div className="topbar">
        <div className="brand">
          <div className="logo">
            <Image src="/icon-512.png" alt="TonStars" width={22} height={22} />
          </div>
          TonStars
        </div>

        <select
          className="lang"
          value={lang}
          onChange={(e) => setLang(e.target.value as any)}
        >
          <option value="ru">RU</option>
          <option value="en">EN</option>
        </select>

        <button
          className="connect"
          onClick={() => setConnected((v) => !v)}
        >
          {connected
            ? lang === 'ru'
              ? 'Кошелёк подключен'
              : 'Wallet Connected'
            : lang === 'ru'
            ? 'Подключить кошелёк'
            : 'Connect Wallet'}
        </button>
      </div>

      <section className="hero">
        <h1>{ui.title}</h1>
        <p>{ui.sub}</p>
      </section>

      <section className="card" aria-label={ui.buyCard}>
        <h2>{ui.buyCard}</h2>

        <div className="field">
          <label className="label">{ui.tgUser}</label>
          <input
            className="input"
            inputMode="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
          />
        </div>

        <div className="field">
          <label className="label">{ui.sum}</label>
          <input
            className="input"
            inputMode="numeric"
            value={Number.isNaN(stars) ? '' : String(stars)}
            onChange={onStarsChange}
            placeholder="100"
          />
          <div className="helper">{ui.onlyInt}</div>
        </div>

        <div className="total">
          <span>{ui.pay}</span>
          <span>≈ {amountTon.toFixed(4)} TON</span>
        </div>

        <button
          className={`primary ${connected ? 'enabled' : ''}`}
          onClick={onBuy}
          disabled={!connected}
        >
          {connected ? ui.buy : ui.connect}
        </button>
      </section>

      <div className="footer">
        <a href={lang === 'ru' ? '/privacy' : '/privacy'}>{ui.privacy}</a>
        <a href={lang === 'ru' ? '/terms' : '/terms'}>{ui.terms}</a>
      </div>
    </div>
  );
}
