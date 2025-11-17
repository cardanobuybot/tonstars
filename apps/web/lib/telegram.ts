// apps/web/lib/telegram.ts
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEBUG_CHAT_ID = process.env.DEBUG_TELEGRAM_CHAT_ID;

if (!BOT_TOKEN) {
  console.warn("TELEGRAM_BOT_TOKEN is not set");
}

const API_BASE = BOT_TOKEN
  ? `https://api.telegram.org/bot${BOT_TOKEN}`
  : "";

export async function sendTelegramMessage(chatId: string | number, text: string) {
  if (!BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const res = await fetch(`${API_BASE}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.ok) {
    console.error("Telegram sendMessage error:", data);
    throw new Error("TELEGRAM_SEND_ERROR");
  }

  return data;
}

// Удобная обёртка для тестов — шлём самому себе
export async function sendDebugMessage(text: string) {
  if (!DEBUG_CHAT_ID) {
    console.warn("DEBUG_TELEGRAM_CHAT_ID is not set");
    return;
  }
  return sendTelegramMessage(DEBUG_CHAT_ID, text);
}
