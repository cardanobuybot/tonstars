import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    ton_payme: process.env.TON_PAYME ?? "missing",
    database_url_exists: !!process.env.DATABASE_URL,
  });
}
