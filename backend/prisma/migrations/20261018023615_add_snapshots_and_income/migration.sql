-- CreateEnum
CREATE TYPE "IncomeSource" AS ENUM ('MANUAL', 'EXPORT', 'OTHER');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "shippingAddressSnapshot" JSONB,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "costPriceLKR" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'LKR',
ADD COLUMN     "productName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "sku" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "variantLabel" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Income" (
    "id" TEXT NOT NULL,
    "source" "IncomeSource" NOT NULL DEFAULT 'MANUAL',
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'LKR',
    "incomeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);
