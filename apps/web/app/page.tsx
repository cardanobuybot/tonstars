'use client';

import React, { useMemo, useState } from 'react';
import { useTonConnectUI } from './providers/TonConnectProvider';

// 1 STAR = 0.0002 TON (как у нас было: 1000 → 0.2 TON)
const STAR_TON_RATE = 0.0002;

// Допустим юзер может купить от 1 до 100_000
const MIN_STARS = 1;
const MAX_STARS = 100000;

// Валидация Telegram username
// Разрешаем опциональный @ в начале, дальше: латиница/цифры/подчёркивание
// длина 5-32, начинаться с буквы
const tgUsernameRegex = /^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/;

function sanitizeUsername(input: string) {
  // Убираем пробелы по краям и @ в начале
  let v = input.trim();
  if (v.startsWith('@')) v = v.slice(1);
  // Оставляем только латиницу/цифры/_
  v = v.replace(/[^a-zA-Z0-9_]/g, '');
  // Ограничиваем длину 32
  if (v.length > 32) v = v.slice(0, 32);
  return v;
}

function validateUsername(u: string) {
  // Проверяем на полный паттерн (мы не храним @, поэтому добавим его виртуально)
  return tgUsernameRegex.test('@' + u);
}

function sanitizeStars(input: string) {
  // Только цифры
  let v = input.replace(/[^\d]/g, '');
  // Убираем ведущие нули (но "0" пусть станет пустым)
  v = v.replace(/^0+/, '');
  return v;
}

function toStarsNumber(v: string) {
  if (!v) return NaN;
  const n = Number(v);
  if (!Number.isInteger(n)) return NaN;
  if (n < MIN_STARS || n > MAX_STARS) return NaN;
  return n;
}

export default function Page() {
  const [username, setUsername] = useState('');
  const [starsRaw, setStarsRaw] = useState('100'); // дефолт 100
  const [tonConnectUI] = useTonConnectUI();

  const usernameSan = useMemo(() => sanitizeUsername(username), [username]);
  const usernameValid = useMemo(() => validateUsername(usernameSan), [usernameSan]);

  const starsSan = useMemo(() => sanitizeStars(starsRaw), [starsRaw]);
  const stars = useMemo(() => toStarsNumber(starsSan), [starsSan]);
  const starsValid = Number.isInteger(stars);

  const tonAmount = useMemo(() => {
    if (!starsValid) return 0;
    return +(stars! * STAR_TON_RATE).toFixed(4);
  }, [starsValid, stars]);

  const canSubmit = usernameValid && starsValid;

  async function handleConnect() {
    try {
      await tonConnectUI.openModal();
    } catch {}
  }

  async function handleBuy() {
    if (!canSubmit) return;
    // здесь будет логика формирования транзакции
    // пока просто алерт
    alert(`Отправим ${stars} Stars пользователю @${usernameSan} за ≈ ${tonAmount} TON`);
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0f1a', color: '#e5edf5' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 16px' }}>
        {/* Шапка */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg,#00e1ff,#0066ff)'
          }} />
          <div style={{ fontWeight: 700, fontSize: 20 }}>TonStars</div>
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={handleConnect}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'linear-gradient(135deg,#1a7cff,#15e0ff)',
                color: '#000',
                fontWeight: 700
              }}
            >
              Connect Wallet
            </button>
          </div>
        </div>

        {/* Заголовок */}
        <h1 style={{ fontSize: 36, lineHeight: 1.2, margin: '8px 0 4px' }}>
          Покупай Telegram Stars<br />за TON
        </h1>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>Быстро. Без KYC. Прозрачно.</p>

        {/* Карточка формы */}
        <div style={{
          borderRadius: 16,
          padding: 20,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Купить Stars</div>

          {/* Username */}
          <label style={{ display: 'block', fontSize: 14, opacity: 0.8, marginBottom: 8 }}>
            @Telegram username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setUsername(usernameSan)} // нормализуем при блюре
            placeholder="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${username.length === 0 ? 'rgba(255,255,255,0.12)' : (usernameValid ? 'rgba(0,200,140,0.7)' : 'rgba(255,100,100,0.7)')}`,
              color: '#e5edf5',
              borderRadius: 12,
              padding: '12px 14px',
              outline: 'none',
              marginBottom: 6
            }}
          />
          <div style={{ fontSize: 12, minHeight: 18, color: username.length === 0 ? '#9fb2c8' : (usernameValid ? '#7fe3c4' : '#ff9c9c') }}>
            {username.length === 0
              ? 'Допустимы латиница, цифры и _ • 5–32 символов • можно вводить с @'
              : usernameValid
                ? `Будет отправлено @${usernameSan}`
                : 'Неверный формат. Пример: @tonstars_bot, @abcde, a_z09 (5–32)'}
          </div>

          {/* Stars */}
          <label style={{ display: 'block', fontSize: 14, opacity: 0.8, margin: '14px 0 8px' }}>
            Сумма Stars
          </label>
          <input
            inputMode="numeric"
            pattern="\d*"
            value={starsSan}
            onChange={(e) => setStarsRaw(e.target.value)}
            onBlur={() => setStarsRaw(starsSan || '100')}
            placeholder="100"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${starsSan === '' ? 'rgba(255,255,255,0.12)' : (starsValid ? 'rgba(0,200,140,0.7)' : 'rgba(255,100,100,0.7)')}`,
              color: '#e5edf5',
              borderRadius: 12,
              padding: '12px 14px',
              outline: 'none',
              marginBottom: 6
            }}
          />
          <div style={{ fontSize: 12, minHeight: 18, color: starsSan === '' ? '#9fb2c8' : (starsValid ? '#7fe3c4' : '#ff9c9c') }}>
            {starsSan === ''
              ? `Только целые числа ≥ ${MIN_STARS}`
              : starsValid
                ? `OK — ${stars} Stars`
                : `Неверное значение. Диапазон: ${MIN_STARS}–${MAX_STARS}`}
          </div>

          {/* Итог */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 12,
            marginBottom: 12,
            fontWeight: 600
          }}>
            <div>К оплате (TON)</div>
            <div>≈ {tonAmount.toFixed(4)} TON</div>
          </div>

          {/* Кнопка Купить */}
          <button
            disabled={!canSubmit}
            onClick={handleBuy}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background: canSubmit
                ? 'linear-gradient(135deg,#1a7cff,#15e0ff)'
                : 'linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.06))',
              color: canSubmit ? '#06121f' : '#8aa1b9',
              fontWeight: 800,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'transform .06s ease'
            }}
          >
            Купить Stars
          </button>
        </div>

        {/* Футер */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 20, opacity: 0.8 }}>
          <a href="/privacy">Политика конфиденциальности</a>
          <a href="/terms">Условия использования</a>
        </div>
      </div>
    </main>
  );
}
