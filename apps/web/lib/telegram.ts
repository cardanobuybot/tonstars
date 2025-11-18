// apps/web/lib/telegram.ts

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.warn("TELEGRAM_BOT_TOKEN is not set");
}

const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Отправка обычного текстового сообщения
 */
export async function sendTelegramMessage(to: string, text: string) {
  if (!BOT_TOKEN) {
    console.warn("NO TOKEN, cannot send telegram message");
    return { ok: false, error: "NO_TOKEN" };
  }

  try {
    const res = await fetch(`${API_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: to,       // username или chat_id
        text,
        parse_mode: "HTML"
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      console.error("Telegram API error:", data);
      return { ok: false, error: data.description };
    }

    return { ok: true };
  } catch (err: any) {
    console.error("sendTelegramMessage error:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Заглушка под выдачу Stars.
 * Позже поставим реальный sendGiftStars
 */
export async function sendGiftStars(username: string, stars: number) {
  if (!BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN is not set, cannot send stars");
    return { ok: false as const, error: "NO_BOT_TOKEN" as const };
  }

  try {
    console.log("sendGiftStars STUB called", { username, stars });

    // TODO: реальный метод sendGiftStars здесь

    return { ok: true as const };
  } catch (err) {
    console.error("sendGiftStars error:", err);
    return { ok: false as const, error: "TG_ERROR" as const };
  }
}
