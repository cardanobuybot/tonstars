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

  // язык интерфейса (простая локалка)
  type Lang = 'ru' | 'en';
  const [lang, setLang] = useState<Lang>('ru');

  // форма
  const [username, setUsername] = useState('');
  const [starsInput, setStarsInput] = useState('100'); // строка в инпуте
  const [starsValue, setStarsValue] = useState<number>(100); // валидное число
  const [starsError, setStarsError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // восстановление языка из localStorage (по желанию)
  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('lang')) as Lang | null;
    if (saved === 'ru' || saved === 'en') setLang(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('lang', lang);
  }, [lang]);

  // Валидация количества звёзд
  function validateStars(raw: string) {
    // 1) оставить только цифры
    let digits = raw.replace(/\D/g, '');
    // 2) убрать ведущие нули
    digits = digits.replace(/^0+/, '');
    // 3) минимум 1
    if (!digits) {
      return { cleaned: '1', value: 1, error: 'Минимум 1 звезда.' };
    }
    const n = parseInt(digits, 10);
    const MAX = 1000000; // разумный верхний предел
    if (n > MAX) {
      return {
        cleaned: String(MAX),
        value: MAX,
        error: `Слишком много. Максимум ${MAX.toLocaleString('ru-RU')} звёзд.`
      };
    }
    return { cleaned: String(n), value: n, error: '' };
  }

  // Обработчики инпута
  function onStarsChange(e: React.ChangeEvent<HTMLInputElement>) {
    // мягкая фильтрация «на лету»: только цифры
    const onlyDigits = e.target.value.replace(/\D/g, '');
    setStarsInput(onlyDigits);
    // не пугаем юзера ошибкой во время набора — нормализуем на blur
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

  // Если юзер ничего не «блюрил», рассчёт делаем от текущего безопасного числа:
  const liveStars = useMemo(() => {
    const parsed = parseInt((starsInput || '').replace(/\D/g, ''), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : starsValue;
  }, [starsInput, starsValue]);

  const tonToPay = useMemo(() => {
    const total = liveStars * PRICE_PER_STAR_TON;
    return total;
  }, [liveStars]);

  async function handleBuy() {
    try {
      setLoading(true);

      // Нормализуем перед оплатой (на случай, если blur не сработал)
      const { cleaned, value, error } = validateStars(starsInput);
      setStarsInput(cleaned);
      setStarsValue(value);
      setStarsError(error);
      if (error) return;

      if (!username.trim()) {
        alert('Введите @username получателя в Telegram');
        return;
      }

      // TODO: тут твоя логика отправки транзакции через TonConnect
      // пример-заглушка:
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
    <div className="min-h-screen bg-[#0b1220] text-white">
      {/* Header */}
      <header className="mx-auto max-w-5xl px-5 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 grid place-items-center">
            <span className="text-cyan-300">✦</span>
          </div>
          <span className="font-semibold text-lg">{t.brand}</span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none"
          >
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>

          <TonConnectButton className="!bg-sky-500 !text-white !rounded-2xl !px-4 !py-2" />
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pt-4 pb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-3">
          {t.title}
        </h1>
        <p className="text-white/60">{t.subtitle}</p>
      </section>

      {/* Card */}
      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-xl font-semibold mb-5">{t.buyBlock}</h2>

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

            {/* Stars amount with validation */}
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

            {/* Action button */}
            <button
              type="button"
              onClick={isConnected ? handleBuy : () => tonConnectUI.openModal()}
              disabled={!!starsError || loading}
              className="mt-2 w-full h-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold transition"
            >
              {loading ? '…' : isConnected ? (lang === 'ru' ? 'Купить Stars' : 'Buy Stars') : (lang === 'ru' ? 'Подключить кошелёк' : 'Connect wallet')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-5xl px-5 pb-10 flex flex-col sm:flex-row gap-3 sm:gap-6 justify-between text-white/60">
        <span>© 2025 TonStars</span>
        <div className="flex gap-6">
          <a href="/privacy" className="hover:text-white">{lang === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy'}</a>
          <a href="/terms" className="hover:text-white">{lang === 'ru' ? 'Условия использования' : 'Terms of Use'}</a>
        </div>
      </footer>
    </div>
  );
}
