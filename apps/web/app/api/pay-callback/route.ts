// apps/web/app/api/pay-callback/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// кошелёк, куда прилетают оплаты
// делаем строку, чтобы TypeScript не ныл
const SERVICE_WALLET: string = process.env.TON_PAYMENT_WALLET || "";

if (!SERVICE_WALLET) {
  console.warn("TON_PAYMENT_WALLET is not set in environment");
}

/**
 * Ищем входящую транзакцию на наш сервисный кошелёк
 * через toncenter getTransactions.
 * Проверяем:
 *  - что есть входящее сообщение
 *  - что сумма примерно равна ожидаемой (±1%)
 *  - что транзакция свежая (меньше часа)
 */
async function findIncomingPayment(
  expectedTon: number
): Promise<{ ok: true; txHash: string } | { ok: false }> {
  if (!SERVICE_WALLET) return { ok: false };

  const url = `https://toncenter.com/api/v2/getTransactions?address=${encodeURIComponent(
    SERVICE_WALLET
  )}&limit=20`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("toncenter getTransactions HTTP error", res.status);
    return { ok: false };
  }

  const data = await res.json().catch((e) => {
    console.error("toncenter getTransactions JSON error", e);
    return null;
  });

  if (!data || !Array.isArray(data.result)) {
    console.error("toncenter getTransactions: bad format", data);
    return { ok: false };
  }

  const expectedNano = Math.round(expectedTon * 1e9);
  const now = Math.floor(Date.now() / 1000);

  for (const tx of data.result) {
    const utime: number | undefined = tx.utime;
    const inMsg = tx.in_msg || tx.in_msg_value || tx.in_message;
    const valueStr: string | undefined =
      inMsg?.value ?? inMsg?.amount ?? inMsg?.raw_value;

    if (!utime || !valueStr) continue;

    // свежесть: не старше часа
    if (now - utime > 3600) continue;

    const valueNano = Number(valueStr);
    if (!Number.isFinite(valueNano)) continue;

    // допуск ±1%
    const diff = Math.abs(valueNano - expectedNano);
    const tolerance = Math.floor(expectedNano * 0.01);

    if (diff <= tolerance) {
      const txHash: string =
        tx.transaction_id?.hash ||
        tx.hash ||
        tx.tx_hash ||
        "unknown_hash";

      return { ok: true, txHash };
    }
  }

  return { ok: false };
}

type PayCallbackBody = {
  orderId?: string;
  order_id?: string;

  txHash?: string;
  tx_hash?: string;
  tonTxHash?: string;
  ton_tx_hash?: string;

  fromWallet?: string;
  from_wallet?: string;
  ton_wallet_addr?: string;
};

export async function POST(req: Request) {
  try {
    if (!SERVICE_WALLET) {
      return NextResponse.json(
        { ok: false, error: "NO_SERVICE_WALLET" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as PayCallbackBody;

    const orderId = String(body.orderId ?? body.order_id ?? "").trim();
    const txHashFromClient =
      String(
        body.txHash ??
          body.tx_hash ??
          body.tonTxHash ??
          body.ton_tx_hash ??
          ""
      ).trim() || null;

    const fromWallet =
      String(
        body.fromWallet ??
          body.from_wallet ??
          body.ton_wallet_addr ??
          ""
      ).trim() || null;

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

      const order = res.rows[0] as {
        id: number;
        tg_username: string;
        stars: number;
        ton_amount: number;
        status: string;
      };

      // если уже оплачен/доставлен — просто возвращаем ок
      if (order.status === "paid" || order.status === "delivered") {
        return NextResponse.json({ ok: true, status: order.status });
      }

      // 1) проверяем платёж через блокчейн (toncenter)
      const verify = await findIncomingPayment(order.ton_amount);

      if (!verify.ok) {
        return NextResponse.json(
          { ok: false, error: "PAYMENT_NOT_FOUND" },
          { status: 400 }
        );
      }

      const finalTxHash = txHashFromClient ?? verify.txHash;

      // 2) транзакция в БД: пометить как paid,
      //    начислить звёзды пользователю, списать из банка
      await client.query("BEGIN");

      // помечаем ордер как paid
      await client.query(
        `
          UPDATE star_orders
          SET status = 'paid',
              ton_tx_hash = COALESCE($2, ton_tx_hash),
              updated_at = now()
          WHERE id = $1
        `,
        [orderId, finalTxHash]
      );

      // начисляем звёзды пользователю
      await client.query(
        `
          INSERT INTO star_accounts (tg_username, balance_stars)
          VALUES ($1, $2)
          ON CONFLICT (tg_username)
          DO UPDATE
          SET balance_stars = star_accounts.balance_stars + EXCLUDED.balance_stars
        `,
        [order.tg_username, order.stars]
      );

      // списываем из star_bank
      await client.query(
        `
          UPDATE star_bank
          SET balance = balance - $1,
              updated_at = now()
        `,
        [order.stars]
      );

      await client.query("COMMIT");

      return NextResponse.json({
        ok: true,
        status: "paid",
        tx_hash: finalTxHash,
        from_wallet: fromWallet
      });
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
