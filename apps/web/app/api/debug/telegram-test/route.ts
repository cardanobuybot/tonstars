// apps/web/app/api/debug/telegram-test/route.ts
import { NextResponse } from "next/server";
import { sendDebugMessage } from "@/lib/telegram";

export async function GET() {
  try {
    await sendDebugMessage("✅ TonStars bot test: всё работает!");

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("telegram-test error:", err);
    return NextResponse.json(
      { ok: false, error: "TELEGRAM_TEST_ERROR" },
      { status: 500 }
    );
  }
}
