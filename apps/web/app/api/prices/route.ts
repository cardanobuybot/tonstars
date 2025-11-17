// apps/web/app/api/prices/route.ts
import { NextResponse } from "next/server";
import { PRICE_TIERS, applyMarkup } from "@/lib/pricing";

export async function GET() {
  const tiers = PRICE_TIERS.map((tier) => ({
    stars: tier.stars,
    base_ton: tier.baseTon,
    sell_ton: applyMarkup(tier.baseTon),
  }));

  return NextResponse.json({
    ok: true,
    markup_percent: 3,
    tiers,
  });
}
