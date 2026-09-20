/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `ProductColor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductColor" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
