/*
  Warnings:

  - A unique constraint covering the columns `[promoCode]` on the table `Voucher` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "User_name_idx" ON "User"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_promoCode_key" ON "Voucher"("promoCode");

-- CreateIndex
CREATE INDEX "Voucher_promoCode_idx" ON "Voucher"("promoCode" ASC);
