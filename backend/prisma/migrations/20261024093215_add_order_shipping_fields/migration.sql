/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `DeliveryRoute` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DeliveryRoute" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingCarrier" TEXT,
ADD COLUMN     "shippingDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "shippingMaxDays" INTEGER,
ADD COLUMN     "shippingMethodCode" TEXT,
ADD COLUMN     "shippingMethodName" TEXT,
ADD COLUMN     "shippingMinDays" INTEGER,
ADD COLUMN     "shippingWeightGrams" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "weightGrams" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ShippingZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countries" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingMethod" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "carrier" TEXT,
    "description" TEXT,
    "hasTracking" BOOLEAN NOT NULL DEFAULT false,
    "minDays" INTEGER NOT NULL DEFAULT 5,
    "maxDays" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingZoneMethod" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "freeOverAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingZoneMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingRateBand" (
    "id" TEXT NOT NULL,
    "zoneMethodId" TEXT NOT NULL,
    "minGrams" INTEGER NOT NULL,
    "maxGrams" INTEGER,
    "price" DOUBLE PRECISION NOT NULL,
    "extraPerKg" DOUBLE PRECISION,

    CONSTRAINT "ShippingRateBand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingZone_name_key" ON "ShippingZone"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingMethod_code_key" ON "ShippingMethod"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingZoneMethod_zoneId_methodId_key" ON "ShippingZoneMethod"("zoneId", "methodId");

-- CreateIndex
CREATE INDEX "ShippingRateBand_zoneMethodId_idx" ON "ShippingRateBand"("zoneMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryRoute_name_key" ON "DeliveryRoute"("name");

-- CreateIndex
CREATE INDEX "User_deliveryRouteId_idx" ON "User"("deliveryRouteId");

-- AddForeignKey
ALTER TABLE "ShippingZoneMethod" ADD CONSTRAINT "ShippingZoneMethod_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "ShippingZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingZoneMethod" ADD CONSTRAINT "ShippingZoneMethod_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "ShippingMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingRateBand" ADD CONSTRAINT "ShippingRateBand_zoneMethodId_fkey" FOREIGN KEY ("zoneMethodId") REFERENCES "ShippingZoneMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
