/*
  Warnings:

  - The primary key for the `Voucher` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Voucher" DROP CONSTRAINT "Voucher_pkey",
ALTER COLUMN "_id" DROP DEFAULT,
ALTER COLUMN "_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Voucher_pkey" PRIMARY KEY ("_id");
DROP SEQUENCE "Voucher__id_seq";
