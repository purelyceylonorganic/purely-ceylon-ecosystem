/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `Order` table. All the data in the column will be lost.
  - Added the required column `currency` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exchangeRate` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalFinal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalUSD` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "totalAmount",
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "exchangeRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalFinal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalUSD" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "paymentMethod" DROP NOT NULL,
ALTER COLUMN "shippingCost" SET DEFAULT 0,
ALTER COLUMN "taxAmount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
