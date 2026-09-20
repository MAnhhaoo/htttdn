/*
  Warnings:

  - A unique constraint covering the columns `[orderDetailId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderDetailId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Review_userId_productId_key";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "orderDetailId" UUID NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderDetailId_key" ON "Review"("orderDetailId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderDetailId_fkey" FOREIGN KEY ("orderDetailId") REFERENCES "OrderDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
