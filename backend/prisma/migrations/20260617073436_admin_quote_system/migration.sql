/*
  Warnings:

  - You are about to drop the column `totalQty` on the `RFQ` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RFQ" DROP COLUMN "totalQty",
ADD COLUMN     "quoteNote" TEXT,
ADD COLUMN     "quotedAt" TIMESTAMP(3),
ADD COLUMN     "quotedPrice" DOUBLE PRECISION;
