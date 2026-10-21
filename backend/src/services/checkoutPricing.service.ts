import { prisma } from "../config/prisma";

// ======================================================
// 💰 CHECKOUT PRICING  (ஒரே இடத்தில் எல்லாக் கணக்கும்)
// Cart preview-ம், Place Order-ம் இதே function-ஐப் பயன்படுத்தும்.
// அதனால் வாடிக்கையாளர் பார்க்கும் தொகை = database-ல் சேமிக்கும் தொகை.
// ======================================================

export type Currency = "LKR" | "USD";
export const SUPPORTED_CURRENCIES: Currency[] = ["LKR", "USD"];

// Exchange rate convention: CurrencyRate("LKR").rate = எத்தனை LKR = 1 USD (எ.கா. 300)

// ---------- 🚚 Shipping விலைகள் ----------
// ⚠️ இந்தத் தொகைகள் உங்கள் பழைய code-லிருந்து எடுத்தவை.
// உண்மையான courier விலையுடன் சரிபார்த்து இங்கே மாற்றுங்கள்.
type ShippingRule = { amount: number; currency: Currency; days: number };

const SL_WESTERN: ShippingRule = { amount: 350, currency: "LKR", days: 3 };
const SL_OTHER: ShippingRule = { amount: 500, currency: "LKR", days: 3 };

const INTERNATIONAL_SHIPPING: Record<string, ShippingRule> = {
  india: { amount: 25, currency: "USD", days: 5 },
  uae: { amount: 35, currency: "USD", days: 6 },
  uk: { amount: 50, currency: "USD", days: 10 },
  usa: { amount: 60, currency: "USD", days: 12 },
};
const DEFAULT_SHIPPING: ShippingRule = { amount: 20, currency: "USD", days: 7 };

const COUNTRY_ALIASES: Record<string, string> = {
  "united arab emirates": "uae",
  "united kingdom": "uk",
  "united states": "usa",
  "united states of america": "usa",
};

function isSriLanka(country: string) {
  return country.trim().toLowerCase() === "sri lanka";
}

function pickShippingRule(country: string, province?: string | null): ShippingRule {
  if (isSriLanka(country)) {
    const p = (province || "").trim().toLowerCase();
    const isWestern = p.includes("western") || p.includes("மேல்");
    return isWestern ? SL_WESTERN : SL_OTHER;
  }
  const key = country.trim().toLowerCase();
  return INTERNATIONAL_SHIPPING[COUNTRY_ALIASES[key] ?? key] ?? DEFAULT_SHIPPING;
}

// ---------- 🧮 சிறு உதவி functions ----------
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

function convert(amount: number, from: Currency, to: Currency, lkrPerUsd: number) {
  if (from === to) return amount;
  return to === "LKR" ? amount * lkrPerUsd : amount / lkrPerUsd;
}

export function pickCurrencyForCountry(country: string): Currency {
  return isSriLanka(country) ? "LKR" : "USD";
}

// ---------- 🌐 Exchange rate / Tax ஏற்றுதல் ----------
export async function loadLkrPerUsd(): Promise<number> {
  const rateRow = await prisma.currencyRate.findUnique({ where: { code: "LKR" } });
  const lkrPerUsd = Number(rateRow?.rate);

  if (!Number.isFinite(lkrPerUsd) || lkrPerUsd <= 0) {
    throw new Error("LKR exchange rate is missing. Please update the CurrencyRate table.");
  }
  if (lkrPerUsd < 100) {
    console.warn(`⚠️ CurrencyRate LKR = ${lkrPerUsd} — இது தவறாக இருக்கலாம் (சுமார் 300 இருக்க வேண்டும்)`);
  }
  return lkrPerUsd;
}

async function loadTaxPercent(country: string): Promise<number> {
  const taxRow = await prisma.taxRate.findFirst({
    where: { country: { equals: country.trim(), mode: "insensitive" }, isActive: true },
    orderBy: { updatedAt: "desc" },
  });

  if (!taxRow) {
    throw new Error(
      `Tax rate is not configured for ${country.trim()}. Add an active row in the TaxRate table.`
    );
  }
  return Number(taxRow.rate);
}

// ---------- 📦 Input வகை ----------
export type PricingVariant = {
  id: string;
  sku: string;
  weight: string;
  productName: string;
  price: number; // USD விலை
  priceLKR: number; // LKR விலை
  costPrice: number; // உங்கள் செலவு (LKR என்று கணக்கு)
  quantity: number;
};

export type PricingInput = {
  country: string;
  province?: string | null;
  currency: Currency;
  userId: string;
  couponCode?: string | null;
  variants: PricingVariant[];
};

// ---------- 🎟️ Coupon ----------
// ⚠️ FIXED தள்ளுபடி, minOrderAmount, maxDiscountAmount ஆகியவை LKR தொகைகள் என்று கருதப்படுகின்றன.
async function resolveCoupon(
  code: string,
  userId: string,
  subtotal: number,
  currency: Currency,
  lkrPerUsd: number
) {
  const coupon = await prisma.coupon.findFirst({
    where: { code: { equals: code.trim(), mode: "insensitive" } },
  });

  if (!coupon) throw new Error("Coupon not found");
  if (!coupon.isActive) throw new Error("Coupon inactive");

  const now = new Date();
  if (now < coupon.startDate) throw new Error("Coupon is not active yet");
  if (now > coupon.endDate) throw new Error("Coupon expired");

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit reached");
  }

  if (coupon.perUserLimit !== null) {
    const used = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (used >= coupon.perUserLimit) {
      throw new Error("You have already used this coupon");
    }
  }

  const subtotalLKR = convert(subtotal, currency, "LKR", lkrPerUsd);
  if (coupon.minOrderAmount !== null && subtotalLKR < coupon.minOrderAmount) {
    throw new Error(`Minimum order amount for this coupon is LKR ${coupon.minOrderAmount}`);
  }

  let discount = 0;
  let freeShipping = false;

  if (coupon.discountType === "PERCENTAGE") {
    discount = (subtotal * coupon.discountValue) / 100;
  } else if (coupon.discountType === "FIXED") {
    discount = convert(coupon.discountValue, "LKR", currency, lkrPerUsd);
  } else if (coupon.discountType === "FREE_SHIPPING") {
    freeShipping = true;
  }

  if (coupon.maxDiscountAmount !== null) {
    discount = Math.min(discount, convert(coupon.maxDiscountAmount, "LKR", currency, lkrPerUsd));
  }
  discount = Math.min(discount, subtotal);

  return { couponId: coupon.id, code: coupon.code, discount: round2(discount), freeShipping };
}

// ======================================================
// 🧾 முக்கிய function
// ======================================================
export async function calculateCheckoutPricing(input: PricingInput) {
  const { country, province, currency, userId, couponCode, variants } = input;

  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    throw new Error("Unsupported currency");
  }

  // 1) Exchange rate (LKR per 1 USD)
  const lkrPerUsd = await loadLkrPerUsd();
  const exchangeRate = currency === "LKR" ? lkrPerUsd : 1;

  // 2) Tax (வாடிக்கையாளரின் நாடு)
  const taxPercent = await loadTaxPercent(country);

  // 3) Items + subtotal
  let subtotal = 0;
  const orderItems = variants.map((v) => {
    if (!Number.isInteger(v.quantity) || v.quantity < 1) {
      throw new Error("Invalid product quantity");
    }

    const unit = Number(currency === "LKR" ? v.priceLKR : v.price);
    if (!Number.isFinite(unit) || unit <= 0) {
      throw new Error(`${v.productName} (${v.weight}) has no ${currency} price`);
    }

    subtotal += unit * v.quantity;

    return {
      productVariantId: v.id,
      quantity: v.quantity,
      price: unit,
      unitPrice: unit,
      productName: v.productName,
      variantLabel: v.weight,
      sku: v.sku,
      costPriceLKR: Number(v.costPrice) || 0,
      currency,
    };
  });
  subtotal = round2(subtotal);

  // 4) Coupon
  let discountAmount = 0;
  let freeShipping = false;
  let couponId: string | null = null;
  let appliedCode: string | null = null;

  if (couponCode && couponCode.trim()) {
    const c = await resolveCoupon(couponCode, userId, subtotal, currency, lkrPerUsd);
    discountAmount = c.discount;
    freeShipping = c.freeShipping;
    couponId = c.couponId;
    appliedCode = c.code;
  }

  // 5) Shipping
  const rule = pickShippingRule(country, province);
  const shippingCost = freeShipping
    ? 0
    : round2(convert(rule.amount, rule.currency, currency, lkrPerUsd));

  // 6) Tax (தள்ளுபடிக்குப் பின் உள்ள தொகை மீது)
  const taxable = Math.max(subtotal - discountAmount, 0);
  const taxAmount = round2((taxable * taxPercent) / 100);

  // 7) Total
  const totalFinal = round2(taxable + taxAmount + shippingCost);
  const totalUSD = round2(convert(totalFinal, currency, "USD", lkrPerUsd));

  return {
    currency,
    exchangeRate,
    subtotal,
    discountAmount,
    couponId,
    couponCode: appliedCode,
    shippingCost,
    estimatedDays: rule.days,
    taxPercent,
    taxAmount,
    totalFinal,
    totalUSD,
    orderItems,
  };
}

// ======================================================
// 🧾 Admin (Draft) order-களுக்கு: subtotal ஏற்கனவே தெரியும்;
// shipping, tax, மொத்தம் ஆகியவற்றை Checkout-ன் அதே விதிகளில் கணக்கிடும்.
// ======================================================
export async function calculateOrderCharges(input: {
  country: string;
  province?: string | null;
  currency: Currency;
  subtotal: number;
  discountAmount?: number;
}) {
  const { country, province, currency, subtotal } = input;
  const discountAmount = input.discountAmount ?? 0;

  const lkrPerUsd = await loadLkrPerUsd();
  const taxPercent = await loadTaxPercent(country);

  const rule = pickShippingRule(country, province);
  const shippingCost = round2(convert(rule.amount, rule.currency, currency, lkrPerUsd));

  const taxable = Math.max(subtotal - discountAmount, 0);
  const taxAmount = round2((taxable * taxPercent) / 100);

  const totalFinal = round2(taxable + taxAmount + shippingCost);

  return {
    exchangeRate: currency === "LKR" ? lkrPerUsd : 1,
    shippingCost,
    estimatedDays: rule.days,
    taxPercent,
    taxAmount,
    totalFinal,
    totalUSD: round2(convert(totalFinal, currency, "USD", lkrPerUsd)),
  };
}