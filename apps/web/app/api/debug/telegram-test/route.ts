// apps/web/app/api/debug/telegram-test/route.ts
import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // Кому слать тест — берём из ?to=, иначе твой юзернейм по умолчанию
    const to = url.searchParams.get("to") || "@my_sigma_baby";

    await sendTelegramMessage(
      to,
      "🚀 TonStars test: бот жив и умеет слать сообщения!"
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("telegram-test error:", err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
