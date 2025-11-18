// apps/web/lib/telegram.ts

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.warn("TELEGRAM_BOT_TOKEN is not set – Telegram features disabled");
}

const API_URL = BOT_TOKEN
  ? `https://api.telegram.org/bot${BOT_TOKEN}`
  : "";

/**
 * Отправка обычного текстового сообщения (для отладки).
 */
export async function sendTelegramMessage(to: string, text: string) {
  if (!BOT_TOKEN || !API_URL) {
    console.warn("NO TOKEN, cannot send telegram message");
    return { ok: false as const, error: "NO_TOKEN" as const };
  }

  try {
    const res = await fetch(`${API_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: to, // username с @ или numeric chat_id
        text,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      console.error("sendTelegramMessage TG error:", data);
      return { ok: false as const, error: "TG_API_ERROR" as const, data };
    }

    return { ok: true as const, data };
  } catch (err) {
    console.error("sendTelegramMessage error:", err);
    return { ok: false as const, error: "TG_REQUEST_ERROR" as const };
  }
}

/**
 * ПОДГОТОВКА под реальную выдачу Stars ботом.
 *
 * ⚠️ ВАЖНО:
 * - Здесь мы делаем «честный» запрос на метод sendGiftStars в Bot API.
 * - Точный набор параметров может отличаться — смотри актуальную доку Telegram
 *   и при необходимости поправь payload.
 *
 * Сейчас:
 * - считаем, что у бота уже есть нужные звезды;
 * - пользователь уже писал боту / стартовал его;
 * - мы можем сослаться на пользователя по @username.
 */
export async function sendGiftStars(username: string, stars: number) {
  if (!BOT_TOKEN || !API_URL) {
    console.warn("NO TOKEN, cannot send gift stars");
    return { ok: false as const, error: "NO_TOKEN" as const };
  }

  if (!username || stars <= 0) {
    return { ok: false as const, error: "BAD_PARAMS" as const };
  }

  // Telegram обычно ждёт либо numeric user_id, либо @username.
  const userRef = username.startsWith("@") ? username : `@${username}`;

  try {
    const payload: Record<string, any> = {
      // ⚠️ эту структуру проверь по официальной доке sendGiftStars
      user_id: userRef,
      star_count: stars,
    };

    const res = await fetch(`${API_URL}/sendGiftStars`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      console.error("sendGiftStars TG error:", data);
      return { ok: false as const, error: "TG_API_ERROR" as const, data };
    }

    return { ok: true as const, data };
  } catch (err) {
    console.error("sendGiftStars error:", err);
    return { ok: false as const, error: "TG_REQUEST_ERROR" as const };
  }
}
