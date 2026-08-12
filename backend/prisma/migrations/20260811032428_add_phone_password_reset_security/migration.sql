-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phonePasswordResetOtpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phonePasswordResetOtpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "phonePasswordResetOtpHash" TEXT,
ADD COLUMN     "phonePasswordResetOtpLockedUntil" TIMESTAMP(3),
ADD COLUMN     "phonePasswordResetToken" TEXT,
ADD COLUMN     "phonePasswordResetTokenExpiresAt" TIMESTAMP(3);
