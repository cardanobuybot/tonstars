// apps/web/lib/pricing.ts

// Базовые цены как на Fragment (в TON)
// Если что — потом легко подправим вручную.
export type PriceTier = {
  stars: number;
  baseTon: number; // сколько TON стоит такой пакет на Fragment
};

// TODO: при желании можно расширить до 10000 звёзд
export const PRICE_TIERS: PriceTier[] = [
  { stars: 50, baseTon: 0.4094 },
  { stars: 75, baseTon: 0.6142 },
  { stars: 100, baseTon: 0.8189 },
  { stars: 150, baseTon: 1.2284 },
  { stars: 250, baseTon: 2.0474 },
  { stars: 350, baseTon: 2.8663 },
  { stars: 500, baseTon: 4.0948 },
  { stars: 750, baseTon: 6.1422 },
  // при желании добавишь ещё уровни
];

// Твоя наценка — 3%
const MARKUP_PERCENT = 3;

// Считаем цену с наценкой и аккуратно округляем до 4 знаков,
// чтобы не было странных хвостов.
export function applyMarkup(baseTon: number): number {
  const withMarkup = baseTon * (1 + MARKUP_PERCENT / 100);
  return Number(withMarkup.toFixed(4));
}

// Удобная функция: найти тариф по количеству звёзд
export function getTierByStars(stars: number): PriceTier | undefined {
  return PRICE_TIERS.find((t) => t.stars === stars);
}
