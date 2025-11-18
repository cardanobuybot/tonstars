import { NextResponse } from "next/server";
import { Pool } from "pg";
import { getTonTransaction } from "@/lib/ton";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Кошелёк, на который должны приходить оплаты
const SERVICE_WALLET = (process.env.TON_PAYMENT_WALLET || "").toLowerCase();

// Допустимая погрешность по сумме (на случай округлений)
const AMOUNT_EPS = 0.0000001;

type Body = {
  order_id?: number | string;
  tx_hash?: string;
};

export async function POST(req: Request) {
  if (!SERVICE_WALLET) {
    console.error("TON_PAYMENT_WALLET is not set");
    return NextResponse.json(
      { ok: false, error: "NO_SERVICE_WALLET" },
      { status: 500 },
    );
  }

  let client = await pool.connect();

  try {
    const body = (await req.json()) as Body;
    const orderId = Number(body.order_id);
    const txHash = String(body.tx_hash || "").trim();

    if (!Number.isFinite(orderId) || orderId <= 0) {
      return NextResponse.json(
        { ok: false, error: "BAD_ORDER_ID" },
        { status: 400 },
      );
    }

    if (!txHash) {
      return NextResponse.json(
        { ok: false, error: "BAD_TX_HASH" },
        { status: 400 },
      );
    }

    // 1) Берём ордер из БД
    const orderRes = await client.query(
      `
        SELECT id, tg_username, stars, ton_amount, ton_wallet_addr, ton_tx_hash, status
        FROM star_orders
        WHERE id = $1
      `,
      [orderId],
    );

    if (orderRes.rowCount === 0) {
      return NextResponse.json(
        { ok: false, error: "ORDER_NOT_FOUND" },
        { status: 404 },
      );
    }

    const order = orderRes.rows[0] as {
      id: number;
      tg_username: string;
      stars: number;
      ton_amount: string;
      ton_wallet_addr: string;
      ton_tx_hash: string | null;
      status: string;
    };

    if (order.status !== "pending") {
      return NextResponse.json(
        { ok: false, error: "ORDER_NOT_PENDING" },
        { status: 400 },
      );
    }

    // 2) Проверяем транзакцию через TonAPI
    const tx = await getTonTransaction(txHash);

    const amountTon = tx.amountTon;
    const recipient = tx.recipient;
    const comment = tx.comment || "";

    // 2.1) Проверяем получателя
    if (recipient !== SERVICE_WALLET) {
      console.error("Recipient mismatch:", recipient, SERVICE_WALLET);
      return NextResponse.json(
        { ok: false, error: "BAD_RECIPIENT" },
        { status: 400 },
      );
    }

    // 2.2) Проверяем сумму
    const requiredTon = Number(order.ton_amount);
    if (!Number.isFinite(requiredTon)) {
      throw new Error("ORDER_TON_AMOUNT_INVALID");
    }

    if (amountTon + AMOUNT_EPS < requiredTon) {
      console.error("Amount too small:", amountTon, "need:", requiredTon);
      return NextResponse.json(
        { ok: false, error: "AMOUNT_TOO_SMALL" },
        { status: 400 },
      );
    }

    // 2.3) Проверяем, что в комментарии есть наш order:id
    const orderTag = `order:${orderId}`;
    if (!comment.includes(orderTag)) {
      console.error("Comment does not contain order tag", {
        comment,
        orderTag,
      });
      return NextResponse.json(
        { ok: false, error: "BAD_COMMENT" },
        { status: 400 },
      );
    }

    // 3) Всё ок — начинаем транзакцию в БД
    await client.query("BEGIN");

    // 3.1) Помечаем ордер как paid и сохраняем hash
    const updOrderRes = await client.query(
      `
        UPDATE star_orders
        SET status = 'paid',
            ton_tx_hash = $2,
            updated_at = now()
        WHERE id = $1
          AND status = 'pending'
        RETURNING id, tg_username, stars
      `,
      [orderId, txHash],
    );

    if (updOrderRes.rowCount === 0) {
      // кто-то уже обновил
      await client.query("ROLLBACK");
      return NextResponse.json(
        { ok: false, error: "ORDER_ALREADY_UPDATED" },
        { status: 400 },
      );
    }

    const { tg_username, stars } = updOrderRes.rows[0] as {
      tg_username: string;
      stars: number;
    };

    // 3.2) Списываем звёзды с банка
    const bankRes = await client.query(
      `
        UPDATE star_bank
        SET balance = balance - $1,
            updated_at = now()
        WHERE id = 1
          AND balance >= $1
        RETURNING balance
      `,
      [stars],
    );

    if (bankRes.rowCount === 0) {
      // не хватает звёзд в банке
      await client.query("ROLLBACK");
      return NextResponse.json(
        { ok: false, error: "BANK_NOT_ENOUGH_STARS" },
        { status: 400 },
      );
    }

    // 3.3) Начисляем звёзды пользователю
    await client.query(
      `
        INSERT INTO star_accounts (tg_username, balance_stars)
        VALUES ($1, $2)
        ON CONFLICT (tg_username)
        DO UPDATE SET
          balance_stars = star_accounts.balance_stars + EXCLUDED.balance_stars,
          updated_at = now()
      `,
      [tg_username, stars],
    );

    await client.query("COMMIT");

    // TODO: здесь позже добавим реальный вызов Telegram Bot API,
    // чтобы бот реально отправлял Stars пользователю.
    // Сейчас наша модель: "банк" пополнен заранее, учёт в БД ведётся.

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("pay-callback error:", err);
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore
    }
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", detail: String(err?.message || err) },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
