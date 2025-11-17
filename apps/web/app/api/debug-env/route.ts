import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    ton_payme: process.env.TON_PAYME ? "set" : "missing",
  });
}
