-- DropIndex
DROP INDEX "Request_userId_idx";

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "repeatSourceId" TEXT;

-- CreateIndex
CREATE INDEX "Request_userId_repeatSourceId_idx" ON "Request"("userId", "repeatSourceId");
