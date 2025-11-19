import { NextResponse } from "next/server";
import { Pool } from "pg";

// DB pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// читаем ENV
const BASE_RATE = Number(process.env.NEXT_PUBLIC_BASE_STAR_RATE || "0.008556"); // TON за 1 звезду
const MARKUP_PERCENT = Number(process.env.NEXT_PUBLIC_MARKUP_PERCENT || "3");   // %
const SERVICE_WALLET = process.env.TON_PAYMENT_WALLET;

if (!SERVICE_WALLET) {
  console.warn("TON_PAYMENT_WALLET is NOT set!");
}

// итоговая цена за 1 звезду TON
function calcPricePerStar() {
  return Number((BASE_RATE * (1 + MARKUP_PERCENT / 100)).toFixed(8));
}

type CreateOrderBody = {
  username?: string;
  stars?: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateOrderBody;

    const rawUsername = String(body.username || "").trim();
    const stars = Number(body.stars);

    if (!rawUsername) {
      return NextResponse.json(
        { ok: false, error: "NO_USERNAME" },
        { status: 400 }
      );
    }

    const clean = rawUsername.replace(/^@/, "").toLowerCase();

    if (!/^[a-z0-9_]{4,32}$/i.test(clean)) {
      return NextResponse.json(
        { ok: false, error: "BAD_USERNAME" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(stars) || stars < 50) {
      return NextResponse.json(
        { ok: false, error: "BAD_STARS" },
        { status: 400 }
      );
    }

    // пересчитываем цену — всегда одинаково с фронтом
    const pricePerStar = calcPricePerStar();
    const tonAmount = Number((stars * pricePerStar).toFixed(4));

    const client = await pool.connect();
    let orderId: number;

    try {
      const res = await client.query(
        `
        INSERT INTO star_orders (
          tg_username,
          stars,
          ton_amount,
          ton_wallet_addr,
          status
        )
        VALUES ($1, $2, $3, $4, 'pending')
        RETURNING id
      `,
        [clean, stars, tonAmount, SERVICE_WALLET]
      );

      orderId = res.rows[0].id;
    } finally {
      client.release();
    }

    return NextResponse.json({
      ok: true,
      order_id: orderId,
      to_address: SERVICE_WALLET,
      ton_amount: tonAmount
    });
  } catch (err) {
    console.error("order/create error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
