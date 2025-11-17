import { NextResponse } from "next/server";
import { Pool } from "pg";

// один общий Pool для всех запросов
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// временный курс: 1 звезда ≈ 0.0002 TON
const STAR_TON_RATE = 0.0002;

// кошелёк, куда прилетают оплаты (env-переменная на Vercel)
const SERVICE_WALLET = process.env.TON_PAYMENT_WALLET;

if (!SERVICE_WALLET) {
  console.warn("TON_PAYMENT_WALLET is not set in environment");
}

type CreateOrderBody = {
  username?: string;
  stars?: number;
};

export async function POST(req: Request) {
  try {
    // safety: проверяем, что кошелёк вообще есть
    if (!SERVICE_WALLET) {
      return NextResponse.json(
        { ok: false, error: "NO_SERVICE_WALLET" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as CreateOrderBody;

    const rawUsername = String(body.username || "").trim();
    const stars = Number(body.stars);

    // --- валидация юзернейма ---
    if (!rawUsername || !/^[a-z0-9_]{5,32}$/i.test(rawUsername.replace(/^@/, ""))) {
      return NextResponse.json(
        { ok: false, error: "BAD_USERNAME" },
        { status: 400 }
      );
    }

    // --- валидация количества звёзд ---
    if (!Number.isFinite(stars) || stars < 1 || !Number.isInteger(stars)) {
      return NextResponse.json(
        { ok: false, error: "BAD_STARS" },
        { status: 400 }
      );
    }

    const username = rawUsername.replace(/^@/, "").toLowerCase();

    // считаем сумму в TON
    const tonAmount = Number((stars * STAR_TON_RATE).toFixed(4));

    // вставляем ордер в star_orders
    const client = await pool.connect();
    let orderId: string;

    try {
      const res = await client.query(
        `
        INSERT INTO star_orders (tg_username, stars, ton_amount, status, comment)
        VALUES ($1, $2, $3, 'pending', '')
        RETURNING id
      `,
        [username, stars, tonAmount]
      );
      orderId = String(res.rows[0].id);
    } finally {
      client.release();
    }

    // формируем комментарий для TON-транзакции
    const comment = `order:${orderId};user:@${username};stars:${stars}`;

    // ответ фронту
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
      {
        ok: false,
        error: err?.code || err?.message || "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
