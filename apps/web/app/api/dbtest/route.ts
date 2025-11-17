import { NextResponse } from "next/server";
import { Client } from "pg";

export async function GET() {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    const res = await client.query("SELECT NOW()");

    await client.end();

    return NextResponse.json({
      ok: true,
      message: "DB connected",
      time: res.rows[0].now
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err.message
    });
  }
}
