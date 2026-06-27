export const calculateTierPrice = (
  originalPrice: number,
  tier: string
) => {

  let discount = 0;

  switch (tier) {

    case "SILVER":
      discount = 5;
      break;

    case "GOLD":
      discount = 10;
      break;

    case "DISTRIBUTOR":
      discount = 15;
      break;

    default:
      discount = 0;
  }

  const finalPrice =
    originalPrice -
    (originalPrice * discount / 100);

  return {
    originalPrice,
    discount,
    finalPrice
  };
};