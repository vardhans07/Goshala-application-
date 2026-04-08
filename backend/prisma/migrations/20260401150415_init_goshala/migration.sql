/*
  Warnings:

  - You are about to drop the `Donation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `goshalaId` to the `Animal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goshalaId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_animalId_fkey";

-- AlterTable
ALTER TABLE "Animal" ADD COLUMN     "goshalaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "goshalaId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Donation";

-- CreateTable
CREATE TABLE "Goshala" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goshala_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Goshala_name_key" ON "Goshala"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_goshalaId_fkey" FOREIGN KEY ("goshalaId") REFERENCES "Goshala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_goshalaId_fkey" FOREIGN KEY ("goshalaId") REFERENCES "Goshala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
