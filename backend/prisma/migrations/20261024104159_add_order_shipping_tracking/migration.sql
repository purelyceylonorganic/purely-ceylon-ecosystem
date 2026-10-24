-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "shippingBaseCost" DOUBLE PRECISION,
ADD COLUMN     "shippingOverrideMode" TEXT,
ADD COLUMN     "shippingOverrideReason" TEXT,
ADD COLUMN     "shippingOverrideValue" DOUBLE PRECISION,
ADD COLUMN     "trackingCarrier" TEXT,
ADD COLUMN     "trackingUrl" TEXT;

-- CreateTable
CREATE TABLE "ShippingEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "location" TEXT,
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShippingEvent_orderId_createdAt_idx" ON "ShippingEvent"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "ShippingEvent" ADD CONSTRAINT "ShippingEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
