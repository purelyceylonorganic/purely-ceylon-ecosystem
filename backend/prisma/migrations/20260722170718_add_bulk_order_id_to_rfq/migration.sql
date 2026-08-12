/*
  Warnings:

  - A unique constraint covering the columns `[bulkOrderId]` on the table `RFQ` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "RFQItem" DROP CONSTRAINT "RFQItem_rfqId_fkey";

-- AlterTable
ALTER TABLE "BulkOrderItem" ALTER COLUMN "price" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "RFQ_bulkOrderId_key" ON "RFQ"("bulkOrderId");

-- AddForeignKey
ALTER TABLE "RFQItem" ADD CONSTRAINT "RFQItem_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "RFQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;
