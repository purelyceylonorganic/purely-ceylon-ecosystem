-- CreateTable
CREATE TABLE "ExportInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "bulkOrderId" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExportInvoice_invoiceNumber_key" ON "ExportInvoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ExportInvoice_bulkOrderId_key" ON "ExportInvoice"("bulkOrderId");

-- AddForeignKey
ALTER TABLE "ExportInvoice" ADD CONSTRAINT "ExportInvoice_bulkOrderId_fkey" FOREIGN KEY ("bulkOrderId") REFERENCES "BulkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
