/*
  Warnings:

  - You are about to drop the column `delivaryTime` on the `Proposal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "delivaryTime",
ADD COLUMN     "deliveryTime" INTEGER;
