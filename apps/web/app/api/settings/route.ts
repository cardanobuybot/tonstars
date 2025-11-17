import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      ton_payment_wallet: process.env.TON_PAYMENT_WALLET || "missing",
      db_url_present: !!process.env.DATABASE_URL,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
