import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const STAR_TON_RATE = 0.0002;

const SERVICE_WALLET = process.env.TON_PAYMENT_WALLET;
if (!SERVICE_WALLET) {
  console.warn("TON_PAYMENT_WALLET is NOT set!");
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

    if (!rawUsername || !/^[a-z0-9_]{5,32}$/i.test(rawUsername.replace(/^@/, ""))) {
      return NextResponse.json({ ok: false, error: "BAD_USERNAME" }, { status: 400 });
    }

    if (!Number.isFinite(stars) || stars < 1 || !Number.isInteger(stars)) {
      return NextResponse.json({ ok: false, error: "BAD_STARS" }, { status: 400 });
    }

    const username = rawUsername.replace(/^@/, "").toLowerCase();

    const tonAmount = Number((stars * STAR_TON_RATE).toFixed(4));

    const client = await pool.connect();
    let orderId: string;

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
        [username, stars, tonAmount, SERVICE_WALLET]
      );
      orderId = String(res.rows[0].id);
    } finally {
      client.release();
    }

    const comment = `order:${orderId};user:@${username};stars:${stars}`;

    return NextResponse.json({
      ok: true,
      order_id: orderId,
      to_address: SERVICE_WALLET,
      ton_amount: tonAmount,
      comment,
    });
  } catch (err: any) {
    console.error("order/create error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
