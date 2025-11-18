import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

type OrderRow = {
  id: number;
  tg_username: string;
  stars: number;
  ton_amount: string;
  ton_wallet_addr?: string | null;
  ton_tx_hash?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

const ALLOWED_STATUSES = ["pending", "paid", "delivered", "refunded"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

/**
 * GET /api/admin/orders?status=open|pending|paid|delivered|refunded|all
 *
 *  - open  => pending + paid (по умолчанию)
 *  - all   => все статусы
 *  - иначе => только один статус
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = (searchParams.get("status") || "open").toLowerCase();

    let statuses: AllowedStatus[];

    if (statusParam === "all") {
      statuses = [...ALLOWED_STATUSES];
    } else if (statusParam === "open") {
      statuses = ["pending", "paid"];
    } else if (ALLOWED_STATUSES.includes(statusParam as AllowedStatus)) {
      statuses = [statusParam as AllowedStatus];
    } else {
      statuses = ["pending", "paid"];
    }

    const client = await pool.connect();
    try {
      const res = await client.query<OrderRow>(
        `
        SELECT
          id,
          tg_username,
          stars,
          ton_amount,
          ton_wallet_addr,
          ton_tx_hash,
          status,
          created_at,
          updated_at
        FROM star_orders
        WHERE status = ANY($1)
        ORDER BY created_at DESC
        LIMIT 100
        `,
        [statuses]
      );

      return NextResponse.json({
        ok: true,
        orders: res.rows,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("admin orders GET error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

type AdminPostBody = {
  id?: number;
  action?: "mark_delivered";
};

/**
 * POST /api/admin/orders
 * body: { id: number, action: "mark_delivered" }
 *
 * Логика простая:
 *  - можно помечать как delivered ТОЛЬКО заказы в статусе "paid"
 *  - балансы мы уже обновили в pay-callback (там stars ушли в star_accounts, из star_bank списались)
 *  - здесь только меняем статус заказа
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AdminPostBody;
    const id = body.id;
    const action = body.action;

    if (!id || !Number.isInteger(id)) {
      return NextResponse.json(
        { ok: false, error: "BAD_ID" },
        { status: 400 }
      );
    }

    if (action !== "mark_delivered") {
      return NextResponse.json(
        { ok: false, error: "BAD_ACTION" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const res = await client.query<OrderRow>(
        "SELECT id, status FROM star_orders WHERE id = $1 FOR UPDATE",
        [id]
      );

      if (res.rowCount === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { ok: false, error: "NOT_FOUND" },
          { status: 404 }
        );
      }

      const order = res.rows[0];

      if (order.status !== "paid") {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { ok: false, error: "BAD_STATUS", status: order.status },
          { status: 400 }
        );
      }

      await client.query(
        `
        UPDATE star_orders
        SET status = 'delivered',
            updated_at = now()
        WHERE id = $1
        `,
        [id]
      );

      await client.query("COMMIT");

      return NextResponse.json({
        ok: true,
        id,
        new_status: "delivered",
      });
    } catch (err) {
      await pool.query("ROLLBACK").catch(() => {});
      console.error("admin orders POST error:", err);
      return NextResponse.json(
        { ok: false, error: "DB_ERROR" },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("admin orders POST parse error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
