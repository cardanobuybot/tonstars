// apps/web/app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

type StatusFilter =
  | "open"
  | "pending"
  | "paid"
  | "delivered"
  | "refunded"
  | "all";

function isAuthorized(req: Request): boolean {
  const headerKey = req.headers.get("x-admin-key") ?? "";
  if (!ADMIN_PASSWORD) {
    console.warn("ADMIN_PASSWORD is not set in environment");
    return false;
  }
  return headerKey === ADMIN_PASSWORD;
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const status = (url.searchParams.get("status") || "open") as StatusFilter;

    const client = await pool.connect();
    try {
      let query = "SELECT * FROM star_orders";
      const params: any[] = [];

      if (status === "open") {
        // открытые: pending + paid
        query += " WHERE status IN ('pending','paid')";
      } else if (status !== "all") {
        query += " WHERE status = $1";
        params.push(status);
      }

      query += " ORDER BY created_at DESC LIMIT 200";

      const res = await client.query(query, params);

      return NextResponse.json({
        ok: true,
        orders: res.rows,
      });
    } catch (err) {
      console.error("admin/orders GET db error:", err);
      return NextResponse.json(
        { ok: false, error: "DB_ERROR" },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("admin/orders GET error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

type AdminActionBody = {
  id?: number;
  action?: "mark_delivered";
};

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as AdminActionBody;
    const id = body.id;
    const action = body.action;

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
          RETURNING *
        `,
          [id]
        );

        if (res.rowCount === 0) {
          return NextResponse.json(
            { ok: false, error: "ORDER_NOT_FOUND" },
            { status: 404 }
          );
        }

        const order = res.rows[0];

        return NextResponse.json({
          ok: true,
          new_status: order.status,
          order,
        });
      }

      return NextResponse.json(
        { ok: false, error: "UNKNOWN_ACTION" },
        { status: 400 }
      );
    } catch (err) {
      console.error("admin/orders POST db error:", err);
      return NextResponse.json(
        { ok: false, error: "DB_ERROR" },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("admin/orders POST error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
