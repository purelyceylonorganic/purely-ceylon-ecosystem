/*
  Warnings:

  - You are about to drop the column `minStockLevel` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `StockAlert` table. All the data in the column will be lost.
  - Made the column `productVariantId` on table `Inventory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_productVariantId_fkey";

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "minStockLevel",
ALTER COLUMN "productVariantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "StockAlert" DROP COLUMN "productId",
ADD COLUMN     "inventoryId" TEXT;

-- CreateTable
CREATE TABLE "Farmer" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Farmer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlert" ADD CONSTRAINT "StockAlert_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
