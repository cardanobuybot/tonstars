// apps/web/app/api/pay-callback/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";
import { Resend } from "resend";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Resend + e-mail для уведомлений
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_NOTIFY_EMAIL =
  process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || "";

// инициализируем Resend, если ключ задан
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

type PayCallbackBody = {
  orderId?: string;
  order_id?: string;
  txHash?: string;
  tx_hash?: string;
  ton_wallet_addr?: string;
};

/**
 * Отправка письма о новом оплаченной покупке.
 * Если что-то падает — просто пишем в лог, API-ответ не ломаем.
 */
async function sendPaidOrderEmail(order: any) {
  try {
    if (!resend) {
      console.warn("Resend not configured, skip email");
      return;
    }
    if (!ADMIN_NOTIFY_EMAIL) {
      console.warn("ADMIN_NOTIFY_EMAIL not set, skip email");
      return;
    }

    const subject = `TonStars: оплаченный заказ #${order.id} (${order.stars} Stars)`;

    const textLines = [
      `Новый оплаченный заказ на TonStars:`,
      ``,
      `ID заказа: ${order.id}`,
      `Пользователь: @${order.tg_username}`,
      `Stars: ${order.stars}`,
      `Сумма (TON): ${order.ton_amount}`,
      ``,
      `Статус: ${order.status}`,
      order.ton_wallet_addr ? `От кошелька: ${order.ton_wallet_addr}` : "",
      order.ton_tx_hash ? `Tx hash / BOC: ${order.ton_tx_hash}` : "",
      ``,
      `created_at: ${order.created_at}`,
      `updated_at: ${order.updated_at}`,
    ].filter(Boolean);

    await resend.emails.send({
      from: "TonStars <notify@tonstars.io>", // тут впиши домен, который верифицируешь в Resend
      to: [ADMIN_NOTIFY_EMAIL],
      subject,
      text: textLines.join("\n"),
    });
  } catch (err) {
    console.error("sendPaidOrderEmail error:", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PayCallbackBody;

    // поддерживаем оба варианта имён полей (camelCase и snake_case)
    const orderId = String(body.orderId ?? body.order_id ?? "").trim();
    const txHash = String(body.txHash ?? body.tx_hash ?? "").trim() || null;
    const fromWallet = body.ton_wallet_addr || null;

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
        // на всякий случай можем попытаться отправить письмо
        await sendPaidOrderEmail(order).catch(() => {});
        return NextResponse.json({ ok: true, status: order.status });
      }

      // ⚠️ ПРОВЕРКУ через TonAPI ты можешь вставить здесь, если она у тебя уже была.
      // Например:
      // const ok = await verifyWithTonAPI(...);
      // if (!ok) { return NextResponse.json({ ok: false, error: "TX_NOT_FOUND" }, { status: 400 }); }

      await client.query("BEGIN");

      // помечаем ордер как paid + сохраняем tx_hash и кошелёк отправителя
      const updateRes = await client.query(
        `
          UPDATE star_orders
          SET status = 'paid',
              ton_tx_hash = COALESCE($2, ton_tx_hash),
              ton_wallet_addr = COALESCE($3, ton_wallet_addr),
              updated_at = now()
          WHERE id = $1
          RETURNING *
        `,
        [orderId, txHash, fromWallet]
      );

      const updatedOrder = updateRes.rows[0];

      // начисляем звёзды пользователю в star_accounts
      await client.query(
        `
          INSERT INTO star_accounts (tg_username, balance_stars)
          VALUES ($1, $2)
          ON CONFLICT (tg_username)
          DO UPDATE SET balance_stars = star_accounts.balance_stars + EXCLUDED.balance_stars
        `,
        [updatedOrder.tg_username, updatedOrder.stars]
      );

      // списываем звёзды из банка
      await client.query(
        `
          UPDATE star_bank
          SET balance = balance - $1,
              updated_at = now()
        `,
        [updatedOrder.stars]
      );

      await client.query("COMMIT");

      // отправляем письмо об оплаченной покупке
      await sendPaidOrderEmail(updatedOrder).catch(() => {});

      // авто-выдачи звёзд ботом тут уже нет — ты сам решаешь, когда их отправлять
      return NextResponse.json({ ok: true, status: "paid" });
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
