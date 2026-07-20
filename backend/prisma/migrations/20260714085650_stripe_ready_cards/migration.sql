/*
  Warnings:

  - You are about to drop the column `cardBrand` on the `SavedPaymentMethod` table. All the data in the column will be lost.
  - Added the required column `brand` to the `SavedPaymentMethod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SavedPaymentMethod" DROP COLUMN "cardBrand",
ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "stripePaymentMethodId" TEXT,
ALTER COLUMN "cardHolderName" DROP NOT NULL,
ALTER COLUMN "expiryMonth" DROP NOT NULL,
ALTER COLUMN "expiryYear" DROP NOT NULL;
