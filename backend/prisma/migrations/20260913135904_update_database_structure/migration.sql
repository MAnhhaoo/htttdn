/*
  Warnings:

  - You are about to drop the column `parentId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `receiverName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `receiverPhone` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddress` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingCity` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingCountry` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingFee` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingProvince` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `variantName` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `failedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentUrl` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `colorCode` on the `ProductColor` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ProductColor` table. All the data in the column will be lost.
  - You are about to drop the column `orderItemId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Seller` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fullAddress` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Attribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttributeValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Brand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductColorImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariantAttributeValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WishlistItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[productId,color]` on the table `ProductColor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,productId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `color` to the `ProductColor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."AttributeValue" DROP CONSTRAINT "AttributeValue_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_brandId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductColorImage" DROP CONSTRAINT "ProductColorImage_productColorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_orderItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Seller" DROP CONSTRAINT "Seller_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VariantAttributeValue" DROP CONSTRAINT "VariantAttributeValue_attributeValueId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VariantAttributeValue" DROP CONSTRAINT "VariantAttributeValue_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WishlistItem" DROP CONSTRAINT "WishlistItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WishlistItem" DROP CONSTRAINT "WishlistItem_userId_fkey";

-- DropIndex
DROP INDEX "public"."Category_parentId_idx";

-- DropIndex
DROP INDEX "public"."Order_createdAt_idx";

-- DropIndex
DROP INDEX "public"."Product_createdAt_idx";

-- DropIndex
DROP INDEX "public"."ProductColor_productId_name_key";

-- DropIndex
DROP INDEX "public"."ProductVariant_price_idx";

-- DropIndex
DROP INDEX "public"."Review_orderItemId_key";

-- DropIndex
DROP INDEX "public"."Seller_slug_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "parentId";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "discount",
DROP COLUMN "receiverName",
DROP COLUMN "receiverPhone",
DROP COLUMN "shippingAddress",
DROP COLUMN "shippingCity",
DROP COLUMN "shippingCountry",
DROP COLUMN "shippingFee",
DROP COLUMN "shippingProvince",
DROP COLUMN "subtotal",
ADD COLUMN     "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "imageUrl",
DROP COLUMN "productName",
DROP COLUMN "sku",
DROP COLUMN "totalPrice",
DROP COLUMN "variantName";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "failedAt",
DROP COLUMN "paidAt",
DROP COLUMN "paymentUrl";

-- AlterTable
ALTER TABLE "ProductColor" DROP COLUMN "colorCode",
DROP COLUMN "name",
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "storage" TEXT;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "orderItemId";

-- AlterTable
ALTER TABLE "Seller" DROP COLUMN "logoUrl",
DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "createdBy",
DROP COLUMN "firstName",
DROP COLUMN "fullAddress",
DROP COLUMN "lastName",
DROP COLUMN "province",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Attribute";

-- DropTable
DROP TABLE "public"."AttributeValue";

-- DropTable
DROP TABLE "public"."Brand";

-- DropTable
DROP TABLE "public"."ProductColorImage";

-- DropTable
DROP TABLE "public"."VariantAttributeValue";

-- DropTable
DROP TABLE "public"."WishlistItem";

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE INDEX "Admin_userId_idx" ON "Admin"("userId");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Order_orderDate_idx" ON "Order"("orderDate");

-- CreateIndex
CREATE UNIQUE INDEX "ProductColor_productId_color_key" ON "ProductColor"("productId", "color");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seller" ADD CONSTRAINT "Seller_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
