-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetExpire" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT;
