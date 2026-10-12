
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Existing shipping amounts from the project, treated as USD base rates.
// Verify these amounts against your actual courier prices before production.
const SHIPPING_USD: Record<string, number> = {
  "Sri Lanka": 15,
  India: 25,
  "United Arab Emirates": 35,
  UAE: 35,
  "United Kingdom": 50,
  UK: 50,
  "United States": 60,
  USA: 60,
};

const DEFAULT_SHIPPING_USD = 20;

export async function calculateCheckoutPricing(
  country: string,
  variants: Array<{
    id: string;
    price: number;
    priceLKR: number;
    quantity: number;
  }>
) {
  const normalizedCountry = country.trim();
  const isSriLanka =
    normalizedCountry.toLowerCase() === "sri lanka";

  const currency = isSriLanka ? "LKR" : "USD";

  const rateData = await prisma.currencyRate.findUnique({
    where: { code: currency },
  });

  if (!rateData || !Number.isFinite(rateData.rate) || rateData.rate <= 0) {
    throw new Error(`Valid currency rate not found for ${currency}`);
  }

  const taxRate = await prisma.taxRate.findFirst({
    where: {
      country: normalizedCountry,
      isActive: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!taxRate) {
    throw new Error(
      `No active tax rate configured for ${normalizedCountry}`
    );
  }

  let subtotal = 0;
  let subtotalUSD = 0;

  const orderItems = variants.map((variant) => {
    if (!Number.isInteger(variant.quantity) || variant.quantity < 1) {
      throw new Error("Invalid product quantity");
    }

    const price = isSriLanka
      ? Number(variant.priceLKR)
      : Number(variant.price);

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(
        `Valid ${currency} price is missing for variant ${variant.id}`
      );
    }

    subtotal += price * variant.quantity;

    // CurrencyRate is assumed to mean units of currency per USD.
    subtotalUSD +=
      (isSriLanka ? price / rateData.rate : price) *
      variant.quantity;

    return {
      productVariantId: variant.id,
      quantity: variant.quantity,
      price,
    };
  });

  const shippingUSD =
    SHIPPING_USD[normalizedCountry] ?? DEFAULT_SHIPPING_USD;

  const shippingCost =
    isSriLanka ? shippingUSD * rateData.rate : shippingUSD;

  const taxAmount = (subtotal * Number(taxRate.rate)) / 100;
  const totalFinal = subtotal + taxAmount + shippingCost;

  return {
    currency,
    exchangeRate: rateData.rate,
    subtotal,
    subtotalUSD,
    taxRate: Number(taxRate.rate),
    taxAmount,
    shippingCost,
    totalFinal,
    orderItems,
  };
}
