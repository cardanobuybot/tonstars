import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// =============================
//   ADMIN AUTH
// =============================
function checkAdmin(req: Request): boolean {
  const adminKey = process.env.ADMIN_PANEL_TOKEN;
  if (!adminKey) {
    console.error("ADMIN_PANEL_TOKEN is NOT set");
    return false;
  }

  // 1) Проверяем header
  const hdr = req.headers.get("x-admin-token");
  if (hdr && hdr === adminKey) return true;

  // 2) Проверяем ?key=...
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (key && key === adminKey) return true;

  return false;
}

// =========================================================
// GET  — либо список заказов, либо статистика (?mode=stats)
// =========================================================
export async function GET(req: Request) {
  if (!checkAdmin(req)) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "list";

  const client = await pool.connect();

  try {
    if (mode === "stats") {
      // простая агрегированная статистика
      const res = await client.query(
        `
        SELECT
          COALESCE(SUM(stars), 0)                    AS total_stars,
          COALESCE(SUM(ton_amount), 0)              AS total_ton,
          COUNT(*)                                  AS total_orders,
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)       AS paid_orders,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)  AS delivered_orders,
          SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END)   AS refunded_orders
        FROM star_orders
        WHERE status IN ('paid','delivered','refunded')
        `
      );

      const row = res.rows[0] || {};

      return NextResponse.json({
        ok: true,
        stats: {
          total_stars: Number(row.total_stars || 0),
          total_ton: Number(row.total_ton || 0),
          total_orders: Number(row.total_orders || 0),
          paid_orders: Number(row.paid_orders || 0),
          delivered_orders: Number(row.delivered_orders || 0),
          refunded_orders: Number(row.refunded_orders || 0)
        }
      });
    }

    // режим "list" — обычный список заказов
    const status = url.searchParams.get("status") || "open";

    let query = `
      SELECT *
      FROM star_orders
    `;

    const params: any[] = [];

    if (status !== "all") {
      query += ` WHERE status = $1 `;
      params.push(status);
    }

    query += ` ORDER BY id DESC `;

    const res = await client.query(query, params);

    return NextResponse.json({
      ok: true,
      orders: res.rows
    });
  } catch (err) {
    console.error("ADMIN GET error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// =========================================================
// POST — действия над заказом: mark_delivered / refund
// =========================================================
export async function POST(req: Request) {
  if (!checkAdmin(req)) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const id = Number(body?.id);
    const action = String(body?.action || "").trim();

    if (!id || !action) {
      return NextResponse.json(
        { ok: false, error: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      if (action === "mark_delivered") {
        const res = await client.query(
          `
          UPDATE star_orders
          SET status = 'delivered',
              updated_at = now()
          WHERE id = $1
          RETURNING id, status
          `,
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
          new_status: res.rows[0].status
        });
      }

      if (action === "refund") {
        // ВАЖНО: здесь мы только помечаем заказ как refunded.
        // Сам возврат TON ты делаешь руками из кошелька.
        const res = await client.query(
          `
          UPDATE star_orders
          SET status = 'refunded',
              updated_at = now()
          WHERE id = $1
          RETURNING id, status
          `,
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
          new_status: res.rows[0].status
        });
      }

      return NextResponse.json(
        { ok: false, error: "UNKNOWN_ACTION" },
        { status: 400 }
      );
    } catch (err) {
      console.error("ADMIN POST error:", err);
      return NextResponse.json(
        { ok: false, error: "DB_ERROR" },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("JSON parse error:", err);
    return NextResponse.json(
      { ok: false, error: "BAD_JSON" },
      { status: 400 }
    );
  }
}
