/*
  Warnings:

  - You are about to drop the column `total` on the `BulkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `BulkOrderItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rfqId]` on the table `BulkOrder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rfqId` to the `BulkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `BulkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BulkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bulkOrderId` to the `BulkOrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BulkOrderItem" DROP CONSTRAINT "BulkOrderItem_orderId_fkey";

-- AlterTable
ALTER TABLE "BulkOrder" DROP COLUMN "total",
ADD COLUMN     "rfqId" TEXT NOT NULL,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "BulkOrderItem" DROP COLUMN "orderId",
ADD COLUMN     "bulkOrderId" TEXT NOT NULL,
ADD COLUMN     "totalPrice" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "BulkOrder_rfqId_key" ON "BulkOrder"("rfqId");

-- AddForeignKey
ALTER TABLE "BulkOrder" ADD CONSTRAINT "BulkOrder_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "RFQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkOrderItem" ADD CONSTRAINT "BulkOrderItem_bulkOrderId_fkey" FOREIGN KEY ("bulkOrderId") REFERENCES "BulkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
