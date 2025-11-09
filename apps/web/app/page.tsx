'use client';

import React, { useMemo, useState } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';

// 1 STAR = 0.0002 TON (1000 → 0.2 TON)
const STAR_TON_RATE = 0.0002;

// краткая подсказка по нику
const usernameHint = {
  ru: 'Введите ник без @. Допустимы латинские буквы, цифры и _ (5–32).',
  en: 'Enter username without @. Latin letters, digits and _ (5–32).'
};

// простая проверка ника Telegram (без крайних кейсов)
const tgRegex = /^[a-z0-9_]{5,32}$/i;

// формат кошелька в friendly (EQ…) и короткая форма
function toFriendlyShort(raw?: string, testOnly = false) {
  if (!raw) return '';
  try {
    const addr = Address.parseRaw(raw);
    const friendly = addr.toString({ bounceable: false, urlSafe: true, testOnly });
    return friendly.length > 14 ? `${friendly.slice(0, 6)}…${friendly.slice(-4)}` : friendly;
  } catch {
    // если вдруг не распарсили — отдаем как есть (коротко)
    return raw.length > 14 ? `${raw.slice(0, 6)}…${raw.slice(-4)}` : raw;
  }
}

export default function Page() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const [username, setUsername] = useState<string>('');
  const [starsInput, setStarsInput] = useState<string>(''); // строка, чтобы можно было очищать поле
  const [lang, setLang] = useState<'ru' | 'en'>('ru');

  // friendly + короткий адрес для бейджа
  const shortAddr = useMemo(
    () => toFriendlyShort(wallet?.account?.address, wallet?.account?.chain === '-239'),
    [wallet]
  );

  // число звёзд (из строки)
  const starsNum = useMemo(() => {
    const n = Number(starsInput || 0);
    if (!Number.isFinite(n)) return 0;
    return Math.floor(Math.max(0, n)); // только целые ≥ 0 (валидируем при клике)
  }, [starsInput]);

  const amountTon = useMemo(() => {
    const v = starsNum * STAR_TON_RATE;
    // показываем 4 знака после запятой, но без лишних нулей
    return (Math.round(v * 1e4) / 1e4).toFixed(4);
  }, [starsNum]);

  // валидность
  const isUserOk = tgRegex.test(username);
  const isStarsOk = starsNum >= 1;
  const isConnected = !!wallet?.account;
  const canBuy = isConnected && isUserOk && isStarsOk;

  // обработчики
  const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    // только латиница, цифры и _
    const cleaned = val.replace(/[^a-z0-9_]/gi, '');
    setUsername(cleaned);
  };

  const onStarsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // только цифры, позволяем пусто — это убирает баг “липкой 1”
    const digits = e.target.value.replace(/\D/g, '');
    setStarsInput(digits);
  };

  const switchLang = (l: 'ru' | 'en') => setLang(l);

  const onBuy = async () => {
    if (!isUserOk) {
      alert(lang === 'ru'
        ? 'Неверный ник. Разрешены латиница, цифры и _. Длина 5–32.'
        : 'Invalid username. Use Latin letters, digits or _. Length 5–32.');
      return;
    }
    if (!isStarsOk) {
      alert(lang === 'ru' ? 'Минимум 1 звезда.' : 'Minimum is 1 star.');
      return;
    }
    if (!isConnected) {
      // открываем TonConnect, если не подключен
      await tonConnectUI.openModal();
      return;
    }

    // ТУТ будет реальная логика чекаута.
    // Пока просто подтверждение.
    const msg =
      lang === 'ru'
        ? `Отправим ${starsNum} Stars пользователю @${username} за ≈ ${amountTon} TON\nКошелёк: ${shortAddr}`
        : `We will send ${starsNum} Stars to @${username} for ≈ ${amountTon} TON\nWallet: ${shortAddr}`;
    alert(msg);
  };

  // ТЕКСТЫ
  const t = {
    title: lang === 'ru' ? 'Покупай Telegram Stars за TON' : 'Buy Telegram Stars with TON',
    subtitle: lang === 'ru' ? 'Быстро. Без KYC. Прозрачно.' : 'Fast. No KYC. Transparent.',
    formTitle: lang === 'ru' ? 'Купить Stars' : 'Buy Stars',
    usernameLabel: lang === 'ru' ? '@Telegram username' : '@Telegram username',
    usernameWillSend:
      lang === 'ru'
        ? (u: string) => (u ? `Будет отправлено @${u}` : '')
        : (u: string) => (u ? `Will be sent to @${u}` : ''),
    amountLabel: lang === 'ru' ? 'Сумма Stars' : 'Stars amount',
    onlyInts: lang === 'ru' ? 'Только целые числа' : 'Integers only',
    toPay: lang === 'ru' ? 'К оплате (TON)' : 'To pay (TON)',
    buy: lang === 'ru' ? 'Купить Stars' : 'Buy Stars',
    policy: lang === 'ru' ? 'Политика' : 'Privacy',
    terms: lang === 'ru' ? 'Условия' : 'Terms',
    exit: lang === 'ru' ? 'Выйти' : 'Logout'
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 64px' }}>
      {/* Хедер */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="TonStars" width={36} height={36} style={{ borderRadius: 8 }} />
          <div style={{ fontSize: 20, fontWeight: 700 }}>TonStars</div>
          <div
            style={{
              marginLeft: 8, display: 'flex', gap: 6, border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 999, padding: '2px'
            }}
          >
            <button
              onClick={() => switchLang('ru')}
              style={{
                padding: '6px 10px', borderRadius: 999,
                background: lang === 'ru' ? 'rgba(255,255,255,.1)' : 'transparent',
                color: '#fff', border: 0
              }}
            >
              RU
            </button>
            <button
              onClick={() => switchLang('en')}
              style={{
                padding: '6px 10px', borderRadius: 999,
                background: lang === 'en' ? 'rgba(255,255,255,.1)' : 'transparent',
                color: '#fff', border: 0
              }}
            >
              EN
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Свой бейдж с friendly адресом */}
          {isConnected && (
            <div style={{
              fontSize: 14, opacity: .85, padding: '6px 10px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,.16)'
            }}>
              {shortAddr}
            </div>
          )}
          {/* Кнопка TonConnect */}
          <TonConnectButton />
        </div>
      </div>

      {/* Заголовок */}
      <h1 style={{ fontSize: 44, lineHeight: 1.12, margin: '8px 0 8px' }}>{t.title}</h1>
      <div style={{ opacity: 0.8, marginBottom: 22 }}>{t.subtitle}</div>

      {/* Карточка формы */}
      <div style={{
        background: 'rgba(255,255,255,.03)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 20,
        padding: 20
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{t.formTitle}</div>

        {/* Username */}
        <label style={{ display: 'block', marginBottom: 8, opacity: 0.9 }}>{t.usernameLabel}</label>
        <input
          type="text"
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="username"
          value={username}
          onChange={onUsernameChange}
          style={{
            width: '100%', height: 48, padding: '0 14px',
            background: 'rgba(255,255,255,.04)',
            border: `1px solid ${
              username === '' ? 'rgba(255,255,255,.1)' : isUserOk ? 'rgba(59,180,74,.7)' : 'rgba(255,92,92,.7)'
            }`,
            borderRadius: 12, color: '#e8f0ff', outline: 'none'
          }}
        />
        <div style={{
          minHeight: 20, marginTop: 6,
          color: username && !isUserOk ? '#ff6b6b' : 'rgba(255,255,255,.55)', fontSize: 13
        }}>
          {username && !isUserOk ? (lang === 'ru'
            ? 'Неверный формат. 5–32, латиница/цифры/_'
            : 'Invalid format. 5–32, latin/digits/_')
            : usernameHint[lang]}
        </div>

        {/* Stars */}
        <label style={{ display: 'block', marginTop: 14, marginBottom: 8, opacity: 0.9 }}>{t.amountLabel}</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="100"
          value={starsInput}
          onChange={onStarsChange}
          style={{
            width: '100%', height: 48, padding: '0 14px',
            background: 'rgba(255,255,255,.04)',
            border: `1px solid ${
              starsInput === '' ? 'rgba(255,255,255,.1)' : isStarsOk ? 'rgba(59,180,74,.7)' : 'rgba(255,92,92,.7)'
            }`,
            borderRadius: 12, color: '#e8f0ff', outline: 'none'
          }}
        />
        <div style={{ minHeight: 20, marginTop: 6, opacity: .6, fontSize: 13 }}>
          {lang === 'ru' ? 'OK — ' : 'OK — '}{starsNum} Stars
        </div>

        {/* Итог к оплате */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 8, marginBottom: 12, fontSize: 18
        }}>
          <div>{t.toPay}</div>
          <div>≈ {amountTon} TON</div>
        </div>

        {/* Кнопка */}
        <button
          onClick={onBuy}
          disabled={!canBuy}
          style={{
            width: '100%', height: 54, border: 0, borderRadius: 12,
            background: canBuy
              ? 'linear-gradient(90deg,#4dabff,#39e6c2)'
              : 'rgba(255,255,255,.08)',
            color: canBuy ? '#001014' : 'rgba(255,255,255,.45)',
            fontSize: 18, fontWeight: 700, cursor: canBuy ? 'pointer' : 'not-allowed'
          }}
        >
          {t.buy}
        </button>
      </div>

      {/* футер */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
        marginTop: 28, fontSize: 16
      }}>
        <a href="/privacy">{t.policy}</a>
        <a href="/terms">{t.terms}</a>
      </div>
    </div>
  );
}
