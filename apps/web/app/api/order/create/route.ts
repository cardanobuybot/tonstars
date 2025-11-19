import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ------------------------
//  КУРС ЗВЕЗД
// ------------------------
//
// В .env / Vercel уже должны быть:
//
// NEXT_PUBLIC_BASE_STAR_RATE=0.008556   // 1 Star по Fragment
// NEXT_PUBLIC_MARKUP_PERCENT=3          // твоя наценка в %
//
// Важно: эти переменные доступны и на сервере.
const RAW_BASE = Number(process.env.NEXT_PUBLIC_BASE_STAR_RATE || "0.008556");
const RAW_MARKUP = Number(process.env.NEXT_PUBLIC_MARKUP_PERCENT || "3");

// Немного защиты от кривых значений:
const BASE_RATE =
  Number.isFinite(RAW_BASE) && RAW_BASE > 0 ? RAW_BASE : 0.008556;
const MARKUP =
  Number.isFinite(RAW_MARKUP) && RAW_MARKUP >= 0 ? RAW_MARKUP : 3;

// Итоговый курс 1 Star в TON с учётом наценки.
// Пример: 0.008556 * 1.03 = 0.008812
export const STAR_TON_RATE = Number(
  (BASE_RATE * (1 + MARKUP / 100)).toFixed(6)
);

console.log(
  "[TonStars] STAR_TON_RATE:",
  STAR_TON_RATE,
  "(base=",
  BASE_RATE,
  "markup=",
  MARKUP,
  "%)"
);

// Кошелёк, куда летят TON за заказ
const SERVICE_WALLET = process.env.TON_PAYMENT_WALLET;
if (!SERVICE_WALLET) {
  console.warn("[TonStars] TON_PAYMENT_WALLET is NOT set!");
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

    // username можно с @ или без, приводим к нижнему регистру
    const norm = rawUsername.replace(/^@/, "").toLowerCase();

    if (!norm || !/^[a-z0-9_]{4,32}$/i.test(norm)) {
      return NextResponse.json(
        { ok: false, error: "BAD_USERNAME" },
        { status: 400 }
      );
    }

    // Защита: минимум 50 звёзд и целое число
    if (!Number.isFinite(stars) || !Number.isInteger(stars) || stars < 50) {
      return NextResponse.json(
        { ok: false, error: "BAD_STARS_MIN_50" },
        { status: 400 }
      );
    }

    const username = norm;

    // Считаем сумму в TON с твоей наценкой
    const tonAmount = Number((stars * STAR_TON_RATE).toFixed(4));

    if (!SERVICE_WALLET) {
      return NextResponse.json(
        { ok: false, error: "NO_SERVICE_WALLET" },
        { status: 500 }
      );
    }

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

    // Коммент — пока просто для дебага (можно не использовать)
    const comment = `order:${orderId};user:@${username};stars:${stars}`;

    return NextResponse.json({
      ok: true,
      order_id: orderId,
      to_address: SERVICE_WALLET,
      ton_amount: tonAmount,
      comment,
      // отдаём ещё служебную инфу (на будущее, на фронте можно показать)
      meta: {
        base_rate: BASE_RATE,
        markup_percent: MARKUP,
        star_rate: STAR_TON_RATE
      }
    });
  } catch (err: any) {
    console.error("order/create error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
