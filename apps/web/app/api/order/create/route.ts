import { NextResponse, type NextRequest } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 1 Star = 0.0002 TON
const STAR_TON_RATE = 0.0002;
// В нанотонах: 0.0002 * 1e9 = 200000
const STAR_PRICE_NANO = 200_000n;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

type CreateOrderBody = {
  username?: string;
  starsAmount?: number;
  lang?: "ru" | "en";
};

export async function POST(req: NextRequest) {
  try {
    const merchantWallet = process.env.TON_PAYMENT_WALLET;
    if (!merchantWallet) {
      return NextResponse.json(
        { ok: false, error: "TON_PAYMENT_WALLET is not set" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as CreateOrderBody;

    const username = (body.username || "").trim().toLowerCase();
    const starsAmount = Number(body.starsAmount || 0);
    const lang: "ru" | "en" = body.lang === "en" ? "en" : "ru";

    // Простая валидация
    if (!/^[a-z0-9_]{5,32}$/i.test(username)) {
      return NextResponse.json(
        { ok: false, error: "INVALID_USERNAME" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(starsAmount) || starsAmount < 1) {
      return NextResponse.json(
        { ok: false, error: "INVALID_STARS_AMOUNT" },
        { status: 400 }
      );
    }

    // Считаем сумму в TON
    const tonAmount = Number((starsAmount * STAR_TON_RATE).toFixed(4));
    const tonAmountStr = tonAmount.toFixed(4);

    // В нанотонах для deeplink
    const nanoAmount = BigInt(Math.trunc(starsAmount)) * STAR_PRICE_NANO;

    // Сохраняем заказ в БД
    const client = await pool.connect();
    try {
      const insertRes = await client.query(
        `
        INSERT INTO orders (
          tg_username,
          stars_amount,
          ton_amount,
          pay_wallet_address,
          status,
          lang
        )
        VALUES ($1, $2, $3, $4, 'pending', $5)
        RETURNING id;
        `,
        [username, starsAmount, tonAmountStr, merchantWallet, lang]
      );

      const orderId: number = insertRes.rows[0].id;
      const comment = `order:${orderId}`;

      const tonDeeplink = `ton://transfer/${merchantWallet}?amount=${nanoAmount.toString()}&text=${encodeURIComponent(
        comment
      )}`;

      return NextResponse.json(
        {
          ok: true,
          order_id: orderId,
          username,
          stars_amount: starsAmount,
          ton_amount: tonAmountStr,
          comment,
          ton_deeplink: tonDeeplink,
        },
        { status: 201 }
      );
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("create order error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
