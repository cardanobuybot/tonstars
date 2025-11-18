// apps/web/lib/telegram.ts

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Базовый URL к Telegram Bot API
const API_URL = BOT_TOKEN
  ? `https://api.telegram.org/bot${BOT_TOKEN}`
  : '';

type TgGetChatResponse = {
  ok: boolean;
  result?: {
    id: number;
    username?: string;
    [key: string]: any;
  };
  description?: string;
};

/**
 * Превращаем @username в числовой user_id через getChat.
 * Это нужно, чтобы позже реально отправлять Stars.
 */
export async function resolveUserId(username: string): Promise<{
  ok: boolean;
  userId?: number;
  error?: string;
}> {
  if (!BOT_TOKEN || !API_URL) {
    console.warn('TELEGRAM_BOT_TOKEN is not set, cannot resolve user id');
    return { ok: false, error: 'NO_BOT_TOKEN' };
  }

  try {
    const uname = username.startsWith('@') ? username : `@${username}`;
    const url = `${API_URL}/getChat?chat_id=${encodeURIComponent(uname)}`;

    const resp = await fetch(url);
    const data = (await resp.json()) as TgGetChatResponse;

    if (!data.ok || !data.result?.id) {
      console.warn('resolveUserId failed:', data.description || 'NO_RESULT');
      return {
        ok: false,
        error: data.description || 'TG_GETCHAT_FAILED',
      };
    }

    return { ok: true, userId: data.result.id };
  } catch (err) {
    console.error('resolveUserId error:', err);
    return { ok: false, error: 'TG_ERROR' };
  }
}

/**
 * Заглушка под будущую выдачу Stars.
 *
 * Сейчас:
 *  - резолвит user_id по username
 *  - логирует намерение отправить Stars
 *  - НЕ вызывает реальный sendGiftStars (он пока не задокументирован стабильно)
 *
 * Позже сюда добавим реальный запрос к Telegram Bot API.
 */
export async function sendGiftStars(username: string, stars: number): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!BOT_TOKEN || !API_URL) {
    console.warn('TELEGRAM_BOT_TOKEN is not set, cannot send stars');
    return { ok: false, error: 'NO_BOT_TOKEN' };
  }

  // 1. Резолвим user_id
  const res = await resolveUserId(username);
  if (!res.ok || !res.userId) {
    console.warn('sendGiftStars: cannot resolve user id', res.error);
    return { ok: false, error: res.error || 'USER_RESOLVE_FAILED' };
  }

  const userId = res.userId;

  // 2. Пока только логируем — реальный sendGiftStars добавим позже
  console.log('sendGiftStars STUB => would send', {
    to: username,
    userId,
    stars,
  });

  // Здесь позже будет реальный запрос типа:
  // await fetch(`${API_URL}/sendGiftStars`, { method: 'POST', body: ... })

  return { ok: true };
}
