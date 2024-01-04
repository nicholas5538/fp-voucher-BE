-- DropForeignKey
ALTER TABLE "Voucher" DROP CONSTRAINT "Voucher_userId_fkey";

-- AlterTable
ALTER TABLE "Voucher" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
