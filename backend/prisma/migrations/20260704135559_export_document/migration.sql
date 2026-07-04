-- CreateTable
CREATE TABLE "ExportDocument" (
    "id" TEXT NOT NULL,
    "bulkOrderId" TEXT NOT NULL,
    "commercialInvoice" BOOLEAN NOT NULL DEFAULT false,
    "packingList" BOOLEAN NOT NULL DEFAULT false,
    "certificateOfOrigin" BOOLEAN NOT NULL DEFAULT false,
    "billOfLading" TEXT,
    "customsReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExportDocument_bulkOrderId_key" ON "ExportDocument"("bulkOrderId");

-- AddForeignKey
ALTER TABLE "ExportDocument" ADD CONSTRAINT "ExportDocument_bulkOrderId_fkey" FOREIGN KEY ("bulkOrderId") REFERENCES "BulkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
