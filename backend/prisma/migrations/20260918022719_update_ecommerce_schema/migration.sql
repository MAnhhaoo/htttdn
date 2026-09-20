/*
  Warnings:

  - Added the required column `createBy` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createBy" TIMESTAMP(3) NOT NULL;
