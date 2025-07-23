/*
  Warnings:

  - Added the required column `domain` to the `DeveloperProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeveloperProfile" ADD COLUMN     "domain" TEXT NOT NULL;
