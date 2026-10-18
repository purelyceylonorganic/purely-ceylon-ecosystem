// 💱 பணம் காட்டும் ஒரே இடம் — எல்லாப் பக்கங்களும் இதையே பயன்படுத்த வேண்டும்

export type Currency = "LKR" | "USD";
export const CURRENCIES: Currency[] = ["LKR", "USD"];

// எ.கா. formatMoney(4500, "LKR") → "LKR 4,500.00"
export function formatMoney(
  amount: number | string | null | undefined,
  currency: string = "LKR"
): string {
  const n = Number(amount ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  const code = currency === "USD" ? "USD" : "LKR";

  return `${code} ${safe.toLocaleString(code === "LKR" ? "en-LK" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// தேர்ந்தெடுத்த currency-க்கு ஏற்ற விலையை variant-இலிருந்து எடுக்கும்.
// விலை அமைக்கப்படவில்லை (0) என்றால் null தரும்.
export function variantPrice(
  variant: { price?: number; priceLKR?: number } | null | undefined,
  currency: Currency
): number | null {
  if (!variant) return null;
  const value = Number(currency === "LKR" ? variant.priceLKR : variant.price);
  return Number.isFinite(value) && value > 0 ? value : null;
}