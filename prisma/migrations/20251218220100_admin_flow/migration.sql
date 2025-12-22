-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RequestStatus" ADD VALUE 'PAID_PARTIALLY';
ALTER TYPE "RequestStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "RequestStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "RequestStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "cancelReason" TEXT;
