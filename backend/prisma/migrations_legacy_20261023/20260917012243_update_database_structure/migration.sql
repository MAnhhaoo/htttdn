/*
  Warnings:

  - You are about to drop the column `icon` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Category` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Category_slug_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "icon",
DROP COLUMN "imageUrl",
DROP COLUMN "slug";
