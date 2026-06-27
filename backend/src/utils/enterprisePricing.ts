// 🧠 Enterprise Tier + Volume Pricing Engine

export type BuyerTier =
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "DISTRIBUTOR";

export function getTierDiscount(tier: BuyerTier): number {
  switch (tier) {
    case "BRONZE":
      return 0;
    case "SILVER":
      return 5;
    case "GOLD":
      return 10;
    case "DISTRIBUTOR":
      return 15;
    default:
      return 0;
  }
}

// 📦 Volume discount logic
export function getVolumeDiscount(quantity: number): number {
  if (quantity >= 1000) return 15;
  if (quantity >= 500) return 10;
  if (quantity >= 100) return 5;
  return 0;
}

// 🧮 FINAL ENGINE (IMPORTANT)
export function calculateEnterprisePrice(params: {
  basePrice: number;
  quantity: number;
  tier: BuyerTier;
}) {
  const tierDiscount = getTierDiscount(params.tier);
  const volumeDiscount = getVolumeDiscount(params.quantity);

  // combine safely (NOT simple addition in real enterprise)
  const totalDiscount = Math.min(tierDiscount + volumeDiscount, 25);

  const discountAmount =
    (params.basePrice * totalDiscount) / 100;

  const finalPrice = params.basePrice - discountAmount;

  return {
    basePrice: params.basePrice,
    tierDiscount,
    volumeDiscount,
    totalDiscount,
    finalPrice,
  };
}