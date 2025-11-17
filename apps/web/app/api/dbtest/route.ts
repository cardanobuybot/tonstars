import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    const result = await pool.query("SELECT NOW()");
    return NextResponse.json({
      ok: true,
      db_time: result.rows[0].now,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
