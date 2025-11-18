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

  // 2) Проверяем query-параметр: ?key=...
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (key && key === adminKey) return true;

  return false;
}

// =========================================================
// GET  — получить список заказов
// =========================================================
export async function GET(req: Request) {
  if (!checkAdmin(req)) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "open";

  const client = await pool.connect();
  try {
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
// POST — действия над заказом
//   "mark_delivered" / "mark_refunded"
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

      if (action === "mark_refunded") {
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
