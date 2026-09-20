/*
  Warnings:

  - You are about to drop the column `productVariantId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `minOrder` on the `Voucher` table. All the data in the column will be lost.
  - Added the required column `subtotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `discountAmount` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `sellerId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scope` to the `Voucher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VoucherScope" AS ENUM ('platform', 'shop');

-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('draft', 'active', 'closed');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('text', 'single_choice', 'multiple_choice', 'rating');

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductVariant" DROP CONSTRAINT "ProductVariant_sellerId_fkey";

-- DropIndex
DROP INDEX "public"."Order_productVariantId_idx";

-- DropIndex
DROP INDEX "public"."ProductVariant_sellerId_idx";

-- DropIndex
DROP INDEX "public"."User_email_idx";

-- DropIndex
DROP INDEX "public"."Voucher_code_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "productVariantId",
ADD COLUMN     "subtotal" DECIMAL(15,2) NOT NULL,
ALTER COLUMN "discountAmount" SET NOT NULL,
ALTER COLUMN "discountAmount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "productName" TEXT,
ADD COLUMN     "productVariantId" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "variantName" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sellerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "sellerId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateOfBirth" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Voucher" DROP COLUMN "minOrder",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "minPurchaseAmount" DECIMAL(15,2),
ADD COLUMN     "name" TEXT,
ADD COLUMN     "scope" "VoucherScope" NOT NULL,
ADD COLUMN     "sellerId" TEXT,
ADD COLUMN     "usageLimitPerUser" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "VoucherProduct" (
    "voucherId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoucherProduct_pkey" PRIMARY KEY ("voucherId","productId")
);

-- CreateTable
CREATE TABLE "VoucherUsage" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoucherUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "SurveyStatus" NOT NULL DEFAULT 'draft',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyQuestion" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SurveyOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyRecipient" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SurveyRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "textAnswer" TEXT,
    "ratingAnswer" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyAnswerOption" (
    "answerId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "SurveyAnswerOption_pkey" PRIMARY KEY ("answerId","optionId")
);

-- CreateIndex
CREATE INDEX "VoucherProduct_productId_idx" ON "VoucherProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherUsage_orderId_key" ON "VoucherUsage"("orderId");

-- CreateIndex
CREATE INDEX "VoucherUsage_voucherId_idx" ON "VoucherUsage"("voucherId");

-- CreateIndex
CREATE INDEX "VoucherUsage_userId_idx" ON "VoucherUsage"("userId");

-- CreateIndex
CREATE INDEX "VoucherUsage_voucherId_userId_idx" ON "VoucherUsage"("voucherId", "userId");

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Survey_status_idx" ON "Survey"("status");

-- CreateIndex
CREATE INDEX "SurveyQuestion_surveyId_idx" ON "SurveyQuestion"("surveyId");

-- CreateIndex
CREATE INDEX "SurveyOption_questionId_idx" ON "SurveyOption"("questionId");

-- CreateIndex
CREATE INDEX "SurveyRecipient_surveyId_idx" ON "SurveyRecipient"("surveyId");

-- CreateIndex
CREATE INDEX "SurveyRecipient_userId_idx" ON "SurveyRecipient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyRecipient_surveyId_userId_key" ON "SurveyRecipient"("surveyId", "userId");

-- CreateIndex
CREATE INDEX "SurveyAnswer_questionId_idx" ON "SurveyAnswer"("questionId");

-- CreateIndex
CREATE INDEX "SurveyAnswer_userId_idx" ON "SurveyAnswer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyAnswer_questionId_userId_key" ON "SurveyAnswer"("questionId", "userId");

-- CreateIndex
CREATE INDEX "SurveyAnswerOption_optionId_idx" ON "SurveyAnswerOption"("optionId");

-- CreateIndex
CREATE INDEX "OrderItem_productVariantId_idx" ON "OrderItem"("productVariantId");

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "Product"("sellerId");

-- CreateIndex
CREATE INDEX "User_dateOfBirth_idx" ON "User"("dateOfBirth");

-- CreateIndex
CREATE INDEX "Voucher_scope_idx" ON "Voucher"("scope");

-- CreateIndex
CREATE INDEX "Voucher_sellerId_idx" ON "Voucher"("sellerId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherProduct" ADD CONSTRAINT "VoucherProduct_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherProduct" ADD CONSTRAINT "VoucherProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUsage" ADD CONSTRAINT "VoucherUsage_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUsage" ADD CONSTRAINT "VoucherUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUsage" ADD CONSTRAINT "VoucherUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyQuestion" ADD CONSTRAINT "SurveyQuestion_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyOption" ADD CONSTRAINT "SurveyOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SurveyQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyRecipient" ADD CONSTRAINT "SurveyRecipient_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyRecipient" ADD CONSTRAINT "SurveyRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAnswer" ADD CONSTRAINT "SurveyAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SurveyQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAnswer" ADD CONSTRAINT "SurveyAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAnswerOption" ADD CONSTRAINT "SurveyAnswerOption_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "SurveyAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAnswerOption" ADD CONSTRAINT "SurveyAnswerOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "SurveyOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
