// src/utils/volumeDiscount.ts

export function calculateVolumeDiscount(quantity: number) {
  let discount = 0;

  if (quantity >= 500) {
    discount = 15;
  } else if (quantity >= 200) {
    discount = 10;
  } else if (quantity >= 50) {
    discount = 5;
  } else {
    discount = 0;
  }

  return {
    quantity,
    discount
  };
}