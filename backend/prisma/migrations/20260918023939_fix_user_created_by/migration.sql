/*
  Warnings:

  - You are about to drop the column `createBy` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "createBy",
ADD COLUMN     "createdBy" VARCHAR(255);
