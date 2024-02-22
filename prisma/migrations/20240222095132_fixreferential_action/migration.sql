/*
  Warnings:

  - Made the column `userId` on table `Voucher` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Voucher" DROP CONSTRAINT "Voucher_userId_fkey";

-- AlterTable
ALTER TABLE "Voucher" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
