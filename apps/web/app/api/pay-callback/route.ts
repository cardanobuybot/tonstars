import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// сразу приводим к нижнему регистру и гарантируем строку
const SERVICE_WALLET = (process.env.TON_PAYMENT_WALLET || "").toLowerCase();
const TONAPI_KEY = process.env.TONAPI_KEY || "";

type PayCallbackBody = {
  order_id?: string;
  tx_hash?: string;
};

export async function POST(req: Request) {
  try {
    if (!SERVICE_WALLET) {
      console.error("TON_PAYMENT_WALLET is not set");
      return NextResponse.json(
        { ok: false, error: "SERVICE_WALLET_NOT_SET" },
        { status: 500 }
      );
    }

    if (!TONAPI_KEY) {
      console.error("TONAPI_KEY is not set");
      return NextResponse.json(
        { ok: false, error: "TONAPI_KEY_NOT_SET" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as PayCallbackBody;
    const orderId = String(body.order_id || "").trim();
    const txHash = String(body.tx_hash || "").trim();

    if (!orderId || !txHash) {
      return NextResponse.json(
        { ok: false, error: "BAD_PARAMS" },
        { status: 400 }
      );
    }

    // 1) достаём ордер
    const client1 = await pool.connect();
    let order: any;

    try {
      const res = await client1.query(
        "SELECT * FROM star_orders WHERE id = $1",
        [orderId]
      );

      if (res.rowCount === 0) {
        return NextResponse.json(
          { ok: false, error: "ORDER_NOT_FOUND" },
          { status: 404 }
        );
      }

      order = res.rows[0];

      if (order.status !== "pending") {
        return NextResponse.json(
          { ok: false, error: "ORDER_NOT_PENDING" },
          { status: 400 }
        );
      }
    } finally {
      client1.release();
    }

    const expectedNano = BigInt(
      Math.round(Number(order.ton_amount) * 1e9)
    );

    // 2) проверяем транзакцию через TonAPI
    const txUrl = `https://tonapi.io/v2/blockchain/transactions/${txHash}`;
    const txRes = await fetch(txUrl, {
      headers: {
        Authorization: `Bearer ${TONAPI_KEY}`,
        Accept: "application/json",
      },
    });

    if (!txRes.ok) {
      const txt = await txRes.text();
      console.error("TonAPI error:", txt);
      return NextResponse.json(
        { ok: false, error: "TONAPI_ERROR" },
        { status: 502 }
      );
    }

    const txData: any = await txRes.json();

    const msgs: any[] = [
      ...(txData?.in_msg ? [txData.in_msg] : []),
      ...(Array.isArray(txData?.out_msgs) ? txData.out_msgs : []),
    ];

    let okRecipient = false;
    let okAmount = false;
    let okComment = false;

    for (const m of msgs) {
      const rawAddr =
        m?.destination ||
        m?.recipient?.address ||
        m?.recipient ||
        m?.to_address;

      const addr =
        typeof rawAddr === "string" ? rawAddr.toLowerCase() : "";

      if (addr === SERVICE_WALLET) {
        okRecipient = true;

        const valueNano = BigInt(
          m?.value ??
            m?.amount ??
            m?.value_ ??
            m?.msg_data?.amount ??
            0
        );
        if (valueNano >= expectedNano) {
          okAmount = true;
        }

        const cmt: string =
          m?.message ||
          m?.comment ||
          m?.msg_data?.text ||
          m?.msg_data?.decoded?.text ||
          "";

        if (
          typeof cmt === "string" &&
          cmt.startsWith(`order:${orderId};`)
        ) {
          okComment = true;
        }
      }
    }

    if (!okRecipient || !okAmount || !okComment) {
      return NextResponse.json(
        { ok: false, error: "TX_NOT_MATCH_ORDER" },
        { status: 400 }
      );
    }

    // 3) обновляем статус
    const client2 = await pool.connect();
    try {
      await client2.query(
        `
        UPDATE star_orders
        SET status = 'paid',
            ton_tx_hash = $2,
            updated_at = now()
        WHERE id = $1
      `,
        [orderId, txHash]
      );
    } finally {
      client2.release();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("pay-callback error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
