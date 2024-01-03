-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Pick-up', 'Delivery', 'Dine-in', 'Pandamart', 'Pandago');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "_id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "category" "Category" NOT NULL,
    "description" TEXT NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 5,
    "minSpending" DECIMAL(2,2) NOT NULL,
    "promoCode" VARCHAR(255) NOT NULL,
    "startDate" DATE NOT NULL,
    "expiryDate" DATE NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
