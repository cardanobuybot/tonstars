import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

// Тот же пул, что и в order/create
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

type PayCallbackBody = {
  order_id?: number | string;
  ton_tx_hash?: string;
  ton_wallet_addr?: string;
};

/**
 * POST /api/pay-callback
 *
 * Текущая логика (упрощённая):
 *  - принимает order_id (+ опционально tx_hash и адрес)
 *  - если ордер найден и не был оплачен — ставит статус 'paid'
 *  - возвращает текущий статус ордера
 *
 * Позже сюда добавим:
 *  - проверку транзакции в блокчейне
 *  - авто-выдачу звёзд
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PayCallbackBody;
    const rawId = body.order_id;

    const id = Number(rawId);
    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { ok: false, error: "BAD_ORDER_ID" },
        { status: 400 }
      );
    }

    const tonTxHash = body.ton_tx_hash?.toString().trim() || null;
    const tonWalletAddr = body.ton_wallet_addr?.toString().trim() || null;

    const client = await pool.connect();

    try {
      // 1) читаем ордер
      const res = await client.query(
        "SELECT * FROM star_orders WHERE id = $1",
        [id]
      );

      if (res.rowCount === 0) {
        return NextResponse.json(
          { ok: false, error: "ORDER_NOT_FOUND" },
          { status: 404 }
        );
      }

      const order = res.rows[0] as any;

      // если уже оплачен/доставлен — просто возвращаем статус
      if (order.status === "paid" || order.status === "delivered") {
        return NextResponse.json({
          ok: true,
          order_id: order.id,
          status: order.status,
        });
      }

      // 2) обновляем ордер: ставим paid, записываем tx / адрес (если пришли)
      const upd = await client.query(
        `
        UPDATE star_orders
        SET
          status = 'paid',
          ton_wallet_addr = COALESCE($2, ton_wallet_addr),
          ton_tx_hash     = COALESCE($3, ton_tx_hash),
          updated_at      = now()
        WHERE id = $1
        RETURNING id, tg_username, stars, ton_amount, status,
                  ton_wallet_addr, ton_tx_hash, created_at, updated_at
      `,
        [id, tonWalletAddr, tonTxHash]
      );

      const updated = upd.rows[0];

      return NextResponse.json({
        ok: true,
        order_id: updated.id,
        status: updated.status,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("pay-callback error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pay-callback?order_id=123
 *
 * Просто узнать текущий статус ордера (для отладки / ручной проверки)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("order_id");

    const id = Number(rawId);
    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { ok: false, error: "BAD_ORDER_ID" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT id, status, tg_username, stars, ton_amount, ton_wallet_addr, ton_tx_hash FROM star_orders WHERE id = $1",
        [id]
      );

      if (res.rowCount === 0) {
        return NextResponse.json(
          { ok: false, error: "ORDER_NOT_FOUND" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ok: true,
        order: res.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("pay-callback GET error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
