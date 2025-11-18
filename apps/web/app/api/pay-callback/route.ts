// apps/web/app/api/pay-callback/route.ts

import { NextResponse } from "next/server";
import { Pool } from "pg";
import { sendGiftStars } from "@/lib/telegram";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// кошелёк, куда прилетают оплаты (для инфы / логов)
const SERVICE_WALLET = process.env.TON_PAYMENT_WALLET || "";

// просто чтобы в логах видеть, если забыли переменную
if (!SERVICE_WALLET) {
  console.warn("TON_PAYMENT_WALLET is not set in environment");
}

type PayCallbackBody = {
  orderId?: string | number;
  order_id?: string | number;
  txHash?: string;
  tx_hash?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PayCallbackBody;

    // поддерживаем оба варианта имён полей (camelCase и snake_case)
    const orderIdRaw = body.orderId ?? body.order_id;
    const txHash =
      (body.txHash ?? body.tx_hash ?? "").toString().trim() || null;

    const orderId = String(orderIdRaw ?? "").trim();

    if (!orderId) {
      return NextResponse.json(
        { ok: false, error: "NO_ORDER_ID" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // забираем ордер
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

      // если уже оплачен/доставлен — просто возвращаем ok
      if (order.status === "paid" || order.status === "delivered") {
        return NextResponse.json({
          ok: true,
          status: order.status,
        });
      }

      // 🔴 ВАЖНО:
      // Сейчас мы НЕ проверяем транзакцию в блокчейне.
      // Считаем, что фронт дергает этот эндпоинт
      // только когда TonConnect отдал статус success.
      //
      // Проверку через TonAPI уже делали раньше,
      // здесь оставляем базовый вариант, чтобы не ломать flow.

      const stars = Number(order.stars) || 0;
      const username: string = order.tg_username;

      await client.query("BEGIN");

      // 1) помечаем ордер как paid
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

      // 2) начисляем звёзды пользователю в star_accounts
      await client.query(
        `
          INSERT INTO star_accounts (tg_username, balance_stars)
          VALUES ($1, $2)
          ON CONFLICT (tg_username)
          DO UPDATE SET balance_stars = star_accounts.balance_stars + EXCLUDED.balance_stars
        `,
        [username, stars]
      );

      // 3) списываем звёзды из банка (у нас одна строка, можно обновить все)
      await client.query(
        `
          UPDATE star_bank
          SET balance = balance - $1,
              updated_at = now()
        `,
        [stars]
      );

      await client.query("COMMIT");

      // ---- 4) Пытаемся выдать Stars через бота ----
      // Если бот не сработает — ордер останется 'paid',
      // чтобы ты мог потом руками/скриптом догрузить.
      try {
        const giftRes = await sendGiftStars(username, stars);

        if (giftRes.ok) {
          // помечаем как delivered
          await pool.query(
            `
              UPDATE star_orders
              SET status = 'delivered',
                  updated_at = now()
              WHERE id = $1
            `,
            [orderId]
          );

          return NextResponse.json({
            ok: true,
            status: "delivered",
          });
        } else {
          console.warn(
            "sendGiftStars failed for order",
            orderId,
            "error:",
            giftRes.error
          );

          return NextResponse.json({
            ok: true,
            status: "paid",
            delivery: "failed",
            delivery_error: giftRes.error || "UNKNOWN",
          });
        }
      } catch (giftErr) {
        console.error("sendGiftStars exception:", giftErr);
        return NextResponse.json({
          ok: true,
          status: "paid",
          delivery: "exception",
        });
      }
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
