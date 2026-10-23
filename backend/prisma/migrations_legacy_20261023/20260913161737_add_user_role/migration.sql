/*
  Warnings:

  - You are about to drop the column `brandId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Seller` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'seller', 'admin');

-- DropForeignKey
ALTER TABLE "public"."Admin" DROP CONSTRAINT "Admin_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Seller" DROP CONSTRAINT "Seller_userId_fkey";

-- DropIndex
DROP INDEX "public"."Product_brandId_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "brandId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "dateOfBirth",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'customer';

-- DropTable
DROP TABLE "public"."Admin";

-- DropTable
DROP TABLE "public"."Seller";

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
