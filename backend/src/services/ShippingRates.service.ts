import { prisma } from "../config/prisma";
import { COUNTRIES, canonicalCountryName } from "../utils/countries";
import { loadLkrPerUsd } from "./exchangeRate.service";
import type { Currency } from "./checkoutPricing.service";

// ======================================================
// 🚚 SHIPPING RATE ENGINE
// Admin அமைத்த Zone × Method × எடை வரம்பு (Rate Table)-இலிருந்து
// வாடிக்கையாளருக்குக் கிடைக்கும் Shipping Options-ஐக் கணக்கிடும்.
// ======================================================

export type ShippingOption = {
  methodCode: string;
  name: string;
  carrier: string | null;
  description: string | null;
  hasTracking: boolean;
  minDays: number;
  maxDays: number;
  cost: number; // order currency-ல்
  originalCost: number; // இலவசமாக்கும் முன் (free என்றால் இங்கே பழைய விலை)
  isFree: boolean;
  currency: Currency;
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

function convert(amount: number, from: string, to: Currency, lkrPerUsd: number) {
  const source = from === "USD" ? "USD" : "LKR";
  if (source === to) return amount;
  return to === "LKR" ? amount * lkrPerUsd : amount / lkrPerUsd;
}

// எடைக்கு ஏற்ற விலை. Bands: [minGrams, maxGrams] (இரண்டும் உட்பட); maxGrams = null → திறந்த வரம்பு
export function priceForWeight(
  bands: { minGrams: number; maxGrams: number | null; price: number; extraPerKg: number | null }[],
  grams: number
): number | null {
  for (const band of bands) {
    const inRange = grams >= band.minGrams && (band.maxGrams === null || grams <= band.maxGrams);

    if (!inRange) continue;

    // திறந்த வரம்பு: அடிப்படை விலை + ஒவ்வொரு கூடுதல் kg-க்கும் extraPerKg
    if (band.maxGrams === null && band.extraPerKg) {
      const extraKg = Math.ceil(Math.max(grams - band.minGrams, 0) / 1000);
      return band.price + extraKg * band.extraPerKg;
    }

    return band.price;
  }

  return null;
}

// நாட்டுக்கான Zone (இல்லையென்றால் "Rest of World" fallback)
async function resolveZone(country: string) {
  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    include: {
      zoneMethods: {
        where: { isEnabled: true, method: { isActive: true } },
        include: {
          method: true,
          bands: { orderBy: { minGrams: "asc" } },
        },
      },
    },
  });

  const wanted = canonicalCountryName(country).toLowerCase();

  return (
    zones.find((zone) => zone.countries.some((c) => c.toLowerCase() === wanted)) ??
    zones.find((zone) => zone.isFallback) ??
    null
  );
}

export async function getShippingOptions(input: {
  country: string;
  currency: Currency;
  subtotal: number; // order currency-ல்
  totalGrams: number;
}) {
  const { country, currency, subtotal, totalGrams } = input;

  const zone = await resolveZone(country);

  if (!zone) {
    return { zone: null, options: [] as ShippingOption[] };
  }

  const lkrPerUsd = await loadLkrPerUsd();
  const options: ShippingOption[] = [];

  for (const zm of zone.zoneMethods) {
    const basePrice = priceForWeight(zm.bands, totalGrams);

    // இந்த எடைக்கு விலை அமைக்கப்படவில்லை → இந்த முறை காட்டப்படாது
    if (basePrice === null) continue;

    const cost = round2(convert(basePrice, zm.currency, currency, lkrPerUsd));

    const freeOver =
      zm.freeOverAmount !== null
        ? convert(zm.freeOverAmount, zm.currency, currency, lkrPerUsd)
        : null;

    const isFree = freeOver !== null && subtotal >= freeOver;

    options.push({
      methodCode: zm.method.code,
      name: zm.method.name,
      carrier: zm.method.carrier,
      description: zm.method.description,
      hasTracking: zm.method.hasTracking,
      minDays: zm.method.minDays,
      maxDays: zm.method.maxDays,
      cost: isFree ? 0 : cost,
      originalCost: cost,
      isFree,
      currency,
    });
  }

  // முறைகளின் வரிசை (sortOrder), பிறகு விலை
  const order = new Map<string, number>(
    zone.zoneMethods.map((zm): [string, number] => [zm.method.code, zm.method.sortOrder])
  );
  options.sort(
    (a, b) =>
      (order.get(a.methodCode) ?? 0) - (order.get(b.methodCode) ?? 0) || a.cost - b.cost
  );

  return { zone: { id: zone.id, name: zone.name }, options };
}

// ======================================================
// 🌱 Starter setup: Zones + Methods (விலைகள் வெற்று — நீங்கள் உங்கள் courier விலைப் பட்டியலை நிரப்ப வேண்டும்)
// ======================================================
const STARTER_ZONES: { name: string; currency: Currency; codes: string[] }[] = [
  { name: "Sri Lanka", currency: "LKR", codes: ["LK"] },
  { name: "South Asia", currency: "USD", codes: ["IN", "PK", "BD", "NP", "BT", "MV", "AF"] },
  {
    name: "Middle East",
    currency: "USD",
    codes: ["AE", "SA", "QA", "KW", "OM", "BH", "JO", "LB", "IL", "IQ", "IR", "YE", "SY", "TR"],
  },
  {
    name: "South-East & East Asia",
    currency: "USD",
    codes: ["SG", "MY", "TH", "ID", "PH", "VN", "KH", "LA", "MM", "BN", "TL", "CN", "HK", "MO", "TW", "JP", "KR", "MN"],
  },
  { name: "United Kingdom", currency: "USD", codes: ["GB", "IM", "JE", "GG"] },
  {
    name: "Europe",
    currency: "USD",
    codes: [
      "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT",
      "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "NO", "CH", "IS", "LI", "AL", "BA", "MK",
      "ME", "RS", "MD", "UA", "RU", "BY", "XK", "AD", "MC", "SM", "VA", "GI",
    ],
  },
  { name: "North America", currency: "USD", codes: ["US", "CA", "PR", "GU", "VI", "MX"] },
  {
    name: "Australia & Oceania",
    currency: "USD",
    codes: ["AU", "NZ", "FJ", "PG", "WS", "TO", "VU", "SB", "NC", "PF", "KI", "NR", "TV", "CK", "FM", "MH", "PW"],
  },
];

// ⚠️ நாட்கள் தோராயமானவை — உண்மையான courier சேவைக்கு ஏற்ப Admin-ல் மாற்றுங்கள்
const STARTER_METHODS = [
  {
    code: "ECONOMY",
    name: "Economy",
    carrier: "Sri Lanka Post",
    description: "Lowest cost. Slower delivery, no tracking.",
    hasTracking: false,
    minDays: 14,
    maxDays: 30,
    sortOrder: 1,
  },
  {
    code: "STANDARD",
    name: "Standard (Tracked)",
    carrier: "Sri Lanka Post",
    description: "Delivery with a tracking number.",
    hasTracking: true,
    minDays: 7,
    maxDays: 14,
    sortOrder: 2,
  },
  {
    code: "EXPRESS",
    name: "Express",
    carrier: "DHL Express",
    description: "Fastest delivery with full tracking.",
    hasTracking: true,
    minDays: 3,
    maxDays: 6,
    sortOrder: 3,
  },
];


export async function seedStarterShipping() {
  const existingZones = await prisma.shippingZone.count();
  const existingMethods = await prisma.shippingMethod.count();

  if (existingZones > 0 || existingMethods > 0) {
    throw new Error(
      "Shipping is already set up. Starter setup only works on an empty configuration."
    );
  }

  const nameOf = (code: string) =>
    COUNTRIES.find((c) => c.code === code)?.name;

  return prisma.$transaction(
    async (tx) => {
      const methods = await Promise.all(
        STARTER_METHODS.map((method) =>
          tx.shippingMethod.create({ data: method })
        )
      );

      const zones: {
        currency: Currency;
        zone: { id: string };
      }[] = [];

      let order = 0;

      for (const z of STARTER_ZONES) {
        const zone = await tx.shippingZone.create({
          data: {
            name: z.name,
            countries: z.codes
              .map(nameOf)
              .filter((name): name is string => Boolean(name)),
            sortOrder: order++,
          },
        });

        zones.push({ currency: z.currency, zone });
      }

      const fallbackZone = await tx.shippingZone.create({
        data: {
          name: "Rest of World",
          countries: [],
          isFallback: true,
          sortOrder: order++,
        },
      });

      zones.push({ currency: "USD", zone: fallbackZone });

      for (const { zone, currency } of zones) {
        await tx.shippingZoneMethod.createMany({
          data: methods.map((method) => ({
            zoneId: zone.id,
            methodId: method.id,
            currency,
            isEnabled: true,
          })),
        });
      }

      return {
        zonesCreated: zones.length,
        methodsCreated: methods.length,
      };
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );
}
