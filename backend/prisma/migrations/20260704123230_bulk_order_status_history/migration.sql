-- CreateTable
CREATE TABLE "BulkOrderStatusHistory" (
    "id" TEXT NOT NULL,
    "bulkOrderId" TEXT NOT NULL,
    "previousStatus" TEXT NOT NULL,
    "currentStatus" TEXT NOT NULL,
    "remarks" TEXT,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BulkOrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BulkOrderStatusHistory" ADD CONSTRAINT "BulkOrderStatusHistory_bulkOrderId_fkey" FOREIGN KEY ("bulkOrderId") REFERENCES "BulkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
