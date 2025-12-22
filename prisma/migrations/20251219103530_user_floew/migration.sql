-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NONE', 'PARTIAL', 'FULL');

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NONE';

-- CreateIndex
CREATE INDEX "Request_paymentStatus_idx" ON "Request"("paymentStatus");
