// apps/web/lib/telegram.ts

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Базовый URL к Telegram Bot API
const API_URL = BOT_TOKEN
  ? `https://api.telegram.org/bot${BOT_TOKEN}`
  : '';

/**
 * Заглушка под будущую выдачу Stars.
 * Сейчас просто логирует, без реального sendGiftStars.
 * Потом сюда добавим реальный вызов Telegram API.
 */
export async function sendGiftStars(username: string, stars: number) {
  if (!BOT_TOKEN || !API_URL) {
    console.warn('TELEGRAM_BOT_TOKEN is not set, cannot send stars');
    return { ok: false as const, error: 'NO_BOT_TOKEN' as const };
  }

  try {
    console.log('sendGiftStars STUB called', { username, stars });

    // TODO: здесь позже сделаем настоящий запрос к Telegram Bot API:
    // POST https://api.telegram.org/bot<TOKEN>/sendGiftStars (или нужный метод)

    return { ok: true as const };
  } catch (err) {
    console.error('sendGiftStars error:', err);
    return { ok: false as const, error: 'TG_ERROR' as const };
  }
}
