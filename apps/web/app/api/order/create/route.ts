import { NextResponse } from "next/server";
import { Pool } from "pg";

/**
 * Подключение к базе Neon через переменную Vercel: DATABASE_URL
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// базовая цена звезды в TON
const BASE_PRICE_TON = 0.0002;

// твоя комиссия
const FEE_PERCENT = 0.03; // 3%

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, stars } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json({ ok: false, error: "NO_USERNAME" }, { status: 400 });
    }
    if (!stars || typeof stars !== "number" || stars < 1) {
      return NextResponse.json({ ok: false, error: "BAD_STARS" }, { status: 400 });
    }

    // итоговая цена (TON)
    const base = stars * BASE_PRICE_TON;
    const withFee = base * (1 + FEE_PERCENT);
    const amountTon = Number(withFee.toFixed(4));

    // создаём заказ в БД
    const result = await pool.query(
      `INSERT INTO orders (username, stars, amount_ton, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING id`,
      [username, stars, amountTon]
    );

    const orderId = result.rows[0].id;

    // сервисный кошелёк (из Vercel переменной)
    const wallet = process.env.MY_TON_WALLET;
    if (!wallet) {
      return NextResponse.json({ ok: false, error: "NO_SERVICE_WALLET" });
    }

    // комментарий для TonConnect транзакции
    const memo = `order:${orderId};user:@${username};stars:${stars}`;

    return NextResponse.json({
      ok: true,
      orderId,
      amountTon,
      wallet,
      memo
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
