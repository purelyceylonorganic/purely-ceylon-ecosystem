-- DropForeignKey
ALTER TABLE "BulkOrder" DROP CONSTRAINT "BulkOrder_rfqId_fkey";

-- AlterTable
ALTER TABLE "RFQ" ADD COLUMN     "bulkOrderId" TEXT;

-- AddForeignKey
ALTER TABLE "RFQ" ADD CONSTRAINT "RFQ_bulkOrderId_fkey" FOREIGN KEY ("bulkOrderId") REFERENCES "BulkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
