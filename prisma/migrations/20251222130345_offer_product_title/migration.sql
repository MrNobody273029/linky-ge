/*
  Warnings:

  - Made the column `adminSourceUrl` on table `Offer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "productTitle" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "imageUrl" DROP NOT NULL,
ALTER COLUMN "adminSourceUrl" SET NOT NULL,
ALTER COLUMN "adminSourceUrl" SET DEFAULT '';
