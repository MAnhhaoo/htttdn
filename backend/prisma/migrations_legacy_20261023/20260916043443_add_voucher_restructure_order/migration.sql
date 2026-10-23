/*
  Warnings:

  - You are about to drop the column `price` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `productVariantId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `Product` table. All the data in the column will be lost.
  - Added the required column `productVariantId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subTotal` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('percentage', 'fixed');

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_sellerId_fkey";

-- DropIndex
DROP INDEX "public"."OrderItem_productVariantId_idx";

-- DropIndex
DROP INDEX "public"."Product_sellerId_idx";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discountAmount" DECIMAL(15,2),
ADD COLUMN     "productVariantId" TEXT NOT NULL,
ADD COLUMN     "voucherId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "price",
DROP COLUMN "productVariantId",
ADD COLUMN     "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "subTotal" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "unitPrice" DECIMAL(15,2) NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "sellerId";

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "sellerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "VoucherType" NOT NULL,
    "value" DECIMAL(15,2) NOT NULL,
    "minOrder" DECIMAL(15,2),
    "maxDiscount" DECIMAL(15,2),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_code_idx" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_isActive_idx" ON "Voucher"("isActive");

-- CreateIndex
CREATE INDEX "Voucher_startDate_endDate_idx" ON "Voucher"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Order_productVariantId_idx" ON "Order"("productVariantId");

-- CreateIndex
CREATE INDEX "Order_voucherId_idx" ON "Order"("voucherId");

-- CreateIndex
CREATE INDEX "ProductVariant_sellerId_idx" ON "ProductVariant"("sellerId");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
