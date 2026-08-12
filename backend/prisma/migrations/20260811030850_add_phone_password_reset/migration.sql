-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phonePasswordResetAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phonePasswordResetExpiresAt" TIMESTAMP(3),
ADD COLUMN     "phonePasswordResetLastSentAt" TIMESTAMP(3),
ADD COLUMN     "phonePasswordResetLockedUntil" TIMESTAMP(3),
ADD COLUMN     "phonePasswordResetOtp" TEXT;
