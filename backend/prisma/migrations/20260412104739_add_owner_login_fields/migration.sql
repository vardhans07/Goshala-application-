/*
  Warnings:

  - A unique constraint covering the columns `[ownerEmail]` on the table `Goshala` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerMobile]` on the table `Goshala` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mobile]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Goshala" ADD COLUMN     "ownerEmail" TEXT,
ADD COLUMN     "ownerMobile" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "mobile" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Goshala_ownerEmail_key" ON "Goshala"("ownerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Goshala_ownerMobile_key" ON "Goshala"("ownerMobile");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE INDEX "User_goshalaId_idx" ON "User"("goshalaId");
