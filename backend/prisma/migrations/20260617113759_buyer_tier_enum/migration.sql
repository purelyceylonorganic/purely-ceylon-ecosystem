/*
  Warnings:

  - The `tier` column on the `WholesaleBuyer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BuyerTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'DISTRIBUTOR');

-- AlterTable
ALTER TABLE "WholesaleBuyer" DROP COLUMN "tier",
ADD COLUMN     "tier" "BuyerTier" NOT NULL DEFAULT 'BRONZE';
