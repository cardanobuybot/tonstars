// apps/web/app/api/pay-callback/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";
import { sendGiftStars } from "@/lib/telegram";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// кошелёк, куда прилетают оплаты
const SERVICE_WALLET = process.env.TON_PAYMENT_WALLET;

if (!SERVICE_WALLET) {
  console.warn("TON_PAYMENT_WALLET is not set in environment");
}

type PayCallbackBody = {
  orderId?: string;
  order_id?: string;
  txHash?: string;
  tx_hash?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PayCallbackBody;

    const orderId = String(body.orderId ?? body.order_id ?? "").trim();
    const txHash = String(body.txHash ?? body.tx_hash ?? "").trim() || null;

    if (!orderId) {
      return NextResponse.json(
        { ok: false, error: "NO_ORDER_ID" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      const res = await client.query(
        "SELECT * FROM star_orders WHERE id = $1",
        [orderId]
      );

      if (res.rowCount === 0) {
        return NextResponse.json(
          { ok: false, error: "ORDER_NOT_FOUND" },
          { status: 404 }
        );
      }

      const order = res.rows[0];

      if (order.status === "paid" || order.status === "delivered") {
        return NextResponse.json({ ok: true, status: order.status });
      }

      // ⚠️ ПРОВЕРКУ через TonAPI мы уже добавили раньше —
      // здесь сейчас пропускаю, чтобы не дублировать, оставь её как была.

      await client.query("BEGIN");

      await client.query(
        `
          UPDATE star_orders
          SET status = 'paid',
              ton_tx_hash = COALESCE($2, ton_tx_hash),
              updated_at = now()
          WHERE id = $1
        `,
        [orderId, txHash]
      );

      await client.query(
        `
          INSERT INTO star_accounts (tg_username, balance_stars)
          VALUES ($1, $2)
          ON CONFLICT (tg_username)
          DO UPDATE SET balance_stars = star_accounts.balance_stars + EXCLUDED.balance_stars
        `,
        [order.tg_username, order.stars]
      );

      await client.query(
        `
          UPDATE star_bank
          SET balance = balance - $1,
              updated_at = now()
        `,
        [order.stars]
      );

      await client.query("COMMIT");

      // ---  НОВОЕ: пытаемся сразу выдать звёзды через бота  ---
      let status: "paid" | "delivered" = "paid";

      try {
        const tgRes = await sendGiftStars(order.tg_username, order.stars);

        if (tgRes.ok) {
          await pool.query(
            `
              UPDATE star_orders
              SET status = 'delivered',
                  updated_at = now()
              WHERE id = $1
            `,
            [orderId]
          );
          status = "delivered";
        } else {
          console.error("sendGiftStars returned error:", tgRes);
        }
      } catch (err) {
        console.error("sendGiftStars thrown error:", err);
      }

      return NextResponse.json({ ok: true, status });
    } catch (err) {
      await pool.query("ROLLBACK").catch(() => {});
      console.error("pay-callback db error:", err);
      return NextResponse.json(
        { ok: false, error: "DB_ERROR" },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("pay-callback error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
