-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "shipmentNumber" TEXT NOT NULL,
    "bulkOrderId" TEXT NOT NULL,
    "shippingLine" TEXT NOT NULL,
    "containerNumber" TEXT,
    "vesselName" TEXT,
    "trackingNumber" TEXT,
    "portOfLoading" TEXT NOT NULL,
    "destinationPort" TEXT NOT NULL,
    "etd" TIMESTAMP(3),
    "eta" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_shipmentNumber_key" ON "Shipment"("shipmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_bulkOrderId_key" ON "Shipment"("bulkOrderId");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_bulkOrderId_fkey" FOREIGN KEY ("bulkOrderId") REFERENCES "BulkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
