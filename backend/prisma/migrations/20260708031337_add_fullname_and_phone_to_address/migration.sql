/*
  Warnings:

  - The values [VENDOR,STAFF] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `fullName` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EXPORT_MANAGER', 'FINANCE', 'WAREHOUSE_MANAGER', 'FARM_MANAGER', 'BUYER', 'CUSTOMER');
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "province" DROP NOT NULL,
ALTER COLUMN "postalCode" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
