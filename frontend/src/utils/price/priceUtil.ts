

export interface HasPriceFields {
  price: number | string;
  discount_price?: number | string | null;
  discount_expiry?: string | null;
}

export interface ActivePricingResult {
  finalPrice: number; // price to display / use for subtotal
  originalPrice?: number; // original (striked) price if discounted
  percent?: number; // discount percent rounded
  isDiscount: boolean;
  expiresAt?: Date; // parsed expiry if provided
}

export const parseNumber = (v: number | string | undefined | null): number | null => {
  if (v === undefined || v === null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return isFinite(n) ? n : null;
};

export function isDiscountActive(prod: HasPriceFields, now: Date = new Date()): boolean {
  const price = parseNumber(prod.price);
  const dPrice = parseNumber(prod.discount_price);
  if (price === null || dPrice === null) return false;
  if (dPrice >= price) return false;
  if (prod.discount_expiry) {
    const exp = new Date(prod.discount_expiry);
    if (isNaN(exp.getTime()) || exp <= now) return false; // expired or invalid
  }
  return true;
}

export function getActivePricing(prod: HasPriceFields, now: Date = new Date()): ActivePricingResult {
  const price = parseNumber(prod.price) ?? 0;
  const dPrice = parseNumber(prod.discount_price);
  let expiresAt: Date | undefined;
  if (prod.discount_expiry) {
    const dt = new Date(prod.discount_expiry);
    if (!isNaN(dt.getTime())) expiresAt = dt;
  }

  if (dPrice !== null && dPrice < price && (!expiresAt || expiresAt > now)) {
    const percent = Math.round(((price - dPrice) / price) * 100);
    return {
      finalPrice: dPrice,
      originalPrice: price,
      percent,
      isDiscount: true,
      expiresAt,
    };
  }
  return { finalPrice: price, isDiscount: false };
}

export function formatCurrency(value: number | string, locale = "vi-VN", currency = "VND"): string {
  const num = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(isFinite(num) ? num : 0);
}

// Convenience function returning formatted strings for UI
export function getFormattedPricing(prod: HasPriceFields): {
  final: string;
  original?: string;
  percent?: number;
  isDiscount: boolean;
} {
  const r = getActivePricing(prod);
  return {
    final: formatCurrency(r.finalPrice),
    original: r.isDiscount && r.originalPrice !== undefined ? formatCurrency(r.originalPrice) : undefined,
    percent: r.percent,
    isDiscount: r.isDiscount,
  };
}
