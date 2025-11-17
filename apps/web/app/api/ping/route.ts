// apps/web/app/api/ping/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'tonstars-backend',
    time: new Date().toISOString(),
  });
}
