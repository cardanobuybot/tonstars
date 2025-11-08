'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

/** Подставь реальную цену звезды в TON */
const PRICE_PER_STAR_TON = 0.0002;

type Lang = 'ru' | 'en';

export default function Page() {
  const [ui] = useTonConnectUI();
  const wallet = useTonWallet();
  const connected = !!wallet;

  const [lang, setLang] = useState<Lang>('ru');
  const [username, setUsername] = useState('');
  const [starsInput, setStarsInput] = useState('100');
  const [stars, setStars] = useState(100);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // сохранить язык
  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved === 'ru' || saved === 'en') setLang(saved);
  }, []);
  useEffect(() => localStorage.setItem('lang', lang), [lang]);

  // --- валидация количества ---
  function validate(raw: string) {
    let digits = raw.replace(/\D/g, '').replace(/^0+/, '');
    if (!digits) digits = '1';
    const n = Math.min(1_000_000, parseInt(digits, 10));
    let e = '';
    if (n < 1) e = t.min1;
    if (n > 1_000_000) e = t.tooMuch;
    return { cleaned: String(n), value: n, error: e };
  }
  function onStarsChange(e: React.ChangeEvent<HTMLInputElement>) {
    setStarsInput(e.target.value.replace(/\D/g, ''));
  }
  function onStarsBlur() {
    const v = validate(starsInput);
    setStarsInput(v.cleaned);
    setStars(v.value);
    setErr(v.error);
  }
  function lockWheel(e: React.WheelEvent<HTMLInputElement>) {
    (e.target as HTMLInputElement).blur();
    setTimeout(() => (e.target as HTMLInputElement).focus(), 0);
  }

  const liveStars = useMemo(() => {
    const n = parseInt(starsInput || '0', 10);
    return Number.isFinite(n) && n > 0 ? n : stars;
  }, [starsInput, stars]);

  const tonToPay = useMemo(() => liveStars * PRICE_PER_STAR_TON, [liveStars]);

  // --- перевод ---
  const t =
    lang === 'ru'
      ? {
          brand: 'TonStars',
          ru: 'RU',
          en: 'EN',
          title: 'Покупай Telegram Stars за TON',
          subtitle: 'Быстро. Без KYC. Прозрачно.',
          block: 'Купить Stars',
          userLabel: '@Telegram username',
          userPh: 'username',
          amount: 'Сумма Stars',
          pay: 'К оплате (TON)',
          connect: 'Подключить кошелёк',
          buy: 'Купить Stars',
          min1: 'Минимум 1 звезда.',
          tooMuch: 'Слишком много. Максимум 1 000 000.',
          hint: 'Только целые числа ≥ 1',
          policy: 'Политика конфиденциальности',
          terms: 'Условия использования',
        }
      : {
          brand: 'TonStars',
          ru: 'RU',
          en: 'EN',
          title: 'Buy Telegram Stars with TON',
          subtitle: 'Fast. No KYC. Transparent.',
          block: 'Buy Stars',
          userLabel: '@Telegram username',
          userPh: 'username',
          amount: 'Stars amount',
          pay: 'To pay (TON)',
          connect: 'Connect wallet',
          buy: 'Buy Stars',
          min1: 'Minimum is 1 star.',
          tooMuch: 'Too many. Maximum 1,000,000.',
          hint: 'Only whole numbers ≥ 1',
          policy: 'Privacy Policy',
          terms: 'Terms of Use',
        };

  async function onBuy() {
    const v = validate(starsInput);
    setStarsInput(v.cleaned);
    setStars(v.value);
    setErr(v.error);
    if (v.error) return;
    if (!username.trim()) {
      alert(lang === 'ru' ? 'Введите @username получателя' : 'Enter recipient @username');
      return;
    }
    setLoading(true);
    try {
      // TODO: тут отправка транзакции / вызов бекэнда
      alert(
        `${lang === 'ru' ? 'Покупка' : 'Purchase'}: ${v.value} Stars ≈ ${(
          v.value * PRICE_PER_STAR_TON
        ).toFixed(4)} TON (@${username})`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-white flex flex-col">
      {/* HEADER */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
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
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 outline-none hover:border-cyan-400/60"
          >
            <option value="ru">{t.ru}</option>
            <option value="en">{t.en}</option>
          </select>
          <TonConnectButton className="!bg-sky-500 !text-white !rounded-2xl !px-4 !py-2" />
        </div>
      </header>

      {/* HERO + CARD */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 flex-1">
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mt-4 sm:mt-8">
          {t.title}
        </h1>
        <p className="text-white/70 mt-3 sm:mt-4">{t.subtitle}</p>

        <section className="mt-6 sm:mt-8">
          <div className="max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4">{t.block}</h2>

            {/* USERNAME */}
            <label className="block text-white/70 text-sm mb-2">{t.userLabel}</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
              placeholder={t.userPh}
              className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 outline-none focus:border-cyan-400/60 mb-4"
            />

            {/* AMOUNT */}
            <label className="block text-white/70 text-sm mb-2">{t.amount}</label>
            <input
              inputMode="numeric"
              pattern="\d*"
              maxLength={7}
              value={starsInput}
              onChange={onStarsChange}
              onBlur={onStarsBlur}
              onWheel={lockWheel}
              aria-invalid={err ? 'true' : 'false'}
              aria-describedby="stars-err"
              placeholder="100"
              className={`w-full h-12 rounded-xl bg-white/5 border px-4 outline-none ${
                err ? 'border-red-500/70 focus:border-red-400' : 'border-white/10 focus:border-cyan-400/60'
              }`}
            />
            <div id="stars-err" className="mt-1 text-sm">
              {err ? <span className="text-red-400">{err}</span> : <span className="text-white/40">{t.hint}</span>}
            </div>

            {/* PRICE */}
            <div className="flex items-center justify-between mt-5">
              <span className="text-white/70">{t.pay}</span>
              <span className="text-lg font-semibold">≈ {tonToPay.toFixed(4)} TON</span>
            </div>

            {/* BUTTON */}
            <button
              onClick={connected ? onBuy : () => ui.openModal()}
              disabled={!!err || loading}
              className="mt-4 w-full h-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold text-lg transition"
            >
              {loading ? '…' : connected ? t.buy : t.connect}
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-3 sm:gap-6 justify-between text-white/60 text-sm">
        <span>© 2025 TonStars</span>
        <div className="flex gap-6">
          <a className="hover:text-white transition" href="/privacy">
            {t.policy}
          </a>
          <a className="hover:text-white transition" href="/terms">
            {t.terms}
          </a>
        </div>
      </footer>
    </div>
  );
}
