'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet
} from '@tonconnect/ui-react';

/** Цена за 1 Star в TON — подставь свою при необходимости */
const PRICE_PER_STAR_TON = 0.0002;

export default function Page() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const isConnected = !!wallet;

  type Lang = 'ru' | 'en';
  const [lang, setLang] = useState<Lang>('ru');

  const [username, setUsername] = useState('');
  const [starsInput, setStarsInput] = useState('100');
  const [starsValue, setStarsValue] = useState<number>(100);
  const [starsError, setStarsError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('lang')) as Lang | null;
    if (saved === 'ru' || saved === 'en') setLang(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('lang', lang);
  }, [lang]);

  function validateStars(raw: string) {
    let digits = raw.replace(/\D/g, '');
    digits = digits.replace(/^0+/, '');
    if (!digits) {
      return { cleaned: '1', value: 1, error: 'Минимум 1 звезда.' };
    }
    const n = parseInt(digits, 10);
    const MAX = 1000000;
    if (n > MAX) {
      return {
        cleaned: String(MAX),
        value: MAX,
        error: `Слишком много. Максимум ${MAX.toLocaleString('ru-RU')} звёзд.`
      };
    }
    return { cleaned: String(n), value: n, error: '' };
  }

  function onStarsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const onlyDigits = e.target.value.replace(/\D/g, '');
    setStarsInput(onlyDigits);
  }
  function onStarsBlur() {
    const { cleaned, value, error } = validateStars(starsInput);
    setStarsInput(cleaned);
    setStarsValue(value);
    setStarsError(error);
  }
  function preventWheelNumberChange(e: React.WheelEvent<HTMLInputElement>) {
    (e.target as HTMLInputElement).blur();
    setTimeout(() => (e.target as HTMLInputElement).focus(), 0);
  }

  const liveStars = useMemo(() => {
    const parsed = parseInt((starsInput || '').replace(/\D/g, ''), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : starsValue;
  }, [starsInput, starsValue]);

  const tonToPay = useMemo(() => liveStars * PRICE_PER_STAR_TON, [liveStars]);

  async function handleBuy() {
    try {
      setLoading(true);
      const { cleaned, value, error } = validateStars(starsInput);
      setStarsInput(cleaned);
      setStarsValue(value);
      setStarsError(error);
      if (error) return;

      if (!username.trim()) {
        alert('Введите @username получателя в Telegram');
        return;
      }

      alert(`Покупка: ${value} Stars за ~${(value * PRICE_PER_STAR_TON).toFixed(4)} TON для @${username}`);
    } finally {
      setLoading(false);
    }
  }

  const t = lang === 'ru'
    ? {
        brand: 'TonStars',
        title: 'Покупай Telegram Stars за TON',
        subtitle: 'Быстро. Без KYC. Прозрачно.',
        buyBlock: 'Купить Stars',
        usernameLabel: '@Telegram username',
        usernamePh: 'username',
        amountLabel: 'Сумма Stars',
        toPay: 'К оплате (TON)',
        connect: 'Подключить кошелёк',
        buy: 'Купить Stars',
        privacy: 'Политика конфиденциальности',
        terms: 'Условия использования'
      }
    : {
        brand: 'TonStars',
        title: 'Buy Telegram Stars with TON',
        subtitle: 'Fast. No KYC. Transparent.',
        buyBlock: 'Buy Stars',
        usernameLabel: '@Telegram username',
        usernamePh: 'username',
        amountLabel: 'Stars amount',
        toPay: 'To pay (TON)',
        connect: 'Connect wallet',
        buy: 'Buy Stars',
        privacy: 'Privacy Policy',
        terms: 'Terms of Use'
      };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[#0b1220] text-white font-sans">
      {/* Header */}
      <header className="w-full max-w-5xl px-5 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 grid place-items-center">
            <span className="text-cyan-300 text-lg">✦</span>
          </div>
          <span className="font-semibold text-xl">{t.brand}</span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 outline-none hover:border-cyan-400/50 transition"
          >
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>
          <TonConnectButton className="!bg-sky-500 !text-white !rounded-2xl !px-4 !py-2" />
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-5">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl p-6">
          <h1 className="text-2xl font-bold mb-2 text-center">{t.title}</h1>
          <p className="text-center text-white/60 mb-6">{t.subtitle}</p>

          <h2 className="text-lg font-semibold mb-4">{t.buyBlock}</h2>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block mb-2 text-sm text-white/70">{t.usernameLabel}</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
                placeholder={t.usernamePh}
                className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 outline-none focus:border-cyan-400/60"
              />
            </div>

            {/* Stars amount */}
            <div>
              <label className="block mb-2 text-sm text-white/70">{t.amountLabel}</label>
              <input
                inputMode="numeric"
                pattern="\d*"
                maxLength={7}
                value={starsInput}
                onChange={onStarsChange}
                onBlur={onStarsBlur}
                onWheel={preventWheelNumberChange}
                aria-invalid={starsError ? 'true' : 'false'}
                aria-describedby="stars-error"
                placeholder="100"
                className={[
                  'w-full h-12 rounded-xl bg-white/5 border px-4 outline-none',
                  starsError
                    ? 'border-red-500/70 focus:border-red-400'
                    : 'border-white/10 focus:border-cyan-400/60'
                ].join(' ')}
              />
              <div id="stars-error" className="mt-1 text-sm">
                {starsError ? (
                  <span className="text-red-400">{starsError}</span>
                ) : (
                  <span className="text-white/40">Только целые числа ≥ 1</span>
                )}
              </div>
            </div>

            {/* To pay */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-white/70">{t.toPay}</span>
              <span className="text-lg font-semibold">
                ≈ {tonToPay.toFixed(4)} TON
              </span>
            </div>

            {/* Button */}
            <button
              type="button"
              onClick={isConnected ? handleBuy : () => tonConnectUI.openModal()}
              disabled={!!starsError || loading}
              className="mt-3 w-full h-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold text-lg transition"
            >
              {loading
                ? '…'
                : isConnected
                ? t.buy
                : t.connect}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl px-5 py-8 flex flex-col sm:flex-row gap-3 sm:gap-6 justify-between text-white/60 text-sm">
        <span>© 2025 TonStars</span>
        <div className="flex gap-6">
          <a href="/privacy" className="hover:text-white transition">{t.privacy}</a>
          <a href="/terms" className="hover:text-white transition">{t.terms}</a>
        </div>
      </footer>
    </div>
  );
}
