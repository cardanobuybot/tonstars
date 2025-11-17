import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// сервисный кошелёк (куда платят)
const SERVICE_WALLET = process.env.TON_PAYMENT_WALLET;
// ключ tonapi
const TONAPI_KEY = process.env.TONAPI_KEY;

if (!SERVICE_WALLET) {
  console.error("TON_PAYMENT_WALLET not set");
}
if (!TONAPI_KEY) {
  console.error("TONAPI_KEY not set");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = body.order_id;
    const txHash = body.tx_hash;

    if (!orderId || !txHash) {
      return NextResponse.json(
        { ok: false, error: "BAD_BODY" },
        { status: 400 }
      );
    }

    // ------------------------
    // 1. Получаем заказ из базы
    // ------------------------
    const client = await pool.connect();
    let order;
    try {
      const q = await client.query(
        `SELECT * FROM star_orders WHERE id = $1`,
        [orderId]
      );
      if (q.rowCount === 0) {
        return NextResponse.json(
          { ok: false, error: "ORDER_NOT_FOUND" },
          { status: 404 }
        );
      }
      order = q.rows[0];
    } finally {
      client.release();
    }

    if (order.status !== "pending") {
      return NextResponse.json(
        { ok: false, error: "ALREADY_PROCESSED" },
        { status: 400 }
      );
    }

    // ------------------------
    // 2. Проверяем транзакцию в tonapi
    // ------------------------
    const url = `https://tonapi.io/v2/blockchain/transactions/${txHash}`;
    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TONAPI_KEY}`,
      },
    });

    if (!r.ok) {
      return NextResponse.json(
        { ok: false, error: "TONAPI_FAIL" },
        { status: 500 }
      );
    }

    const tx = await r.json();

    // ------------------------
    // 3. Проверяем получателя
    // ------------------------

    let okRecipient = false;
    for (const msg of tx.messages || []) {
      if (
        msg.recipient?.address?.toLowerCase() ===
        SERVICE_WALLET.toLowerCase()
      ) {
        okRecipient = true;
        break;
      }
    }

    if (!okRecipient) {
      return NextResponse.json(
        { ok: false, error: "BAD_RECIPIENT" },
        { status: 400 }
      );
    }

    // ------------------------
    // 4. Проверяем сумму
    // ------------------------
    let received = 0;

    for (const msg of tx.messages || []) {
      if (
        msg.recipient?.address?.toLowerCase() ===
        SERVICE_WALLET.toLowerCase()
      ) {
        received += Number(msg.amount || 0);
      }
    }

    const receivedTon = received / 1e9;

    if (Math.abs(receivedTon - Number(order.ton_amount)) > 0.0001) {
      return NextResponse.json(
        { ok: false, error: "BAD_AMOUNT" },
        { status: 400 }
      );
    }

    // ------------------------
    // 5. Проверяем комментарий
    // ------------------------

    const commentText = tx.comment || "";

    if (!commentText.includes(`order:${orderId}`)) {
      return NextResponse.json(
        { ok: false, error: "BAD_COMMENT" },
        { status: 400 }
      );
    }

    // ------------------------
    // 6. Все ок → обновляем заказ
    // ------------------------

    const client2 = await pool.connect();
    try {
      await client2.query(
        `
        UPDATE star_orders
        SET status = 'paid',
            ton_wallet_addr = $1,
            ton_tx_hash = $2,
            updated_at = NOW()
        WHERE id = $3
      `,
        [SERVICE_WALLET, txHash, orderId]
      );
    } finally {
      client2.release();
    }

    return NextResponse.json({ ok: true, status: "paid" });
  } catch (err) {
    console.error("/pay-callback error", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
