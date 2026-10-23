/*
  Warnings:

  - You are about to drop the `Survey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SurveyResponse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Survey" DROP CONSTRAINT "Survey_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SurveyResponse" DROP CONSTRAINT "SurveyResponse_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SurveyResponse" DROP CONSTRAINT "SurveyResponse_userId_fkey";

-- DropTable
DROP TABLE "public"."Survey";

-- DropTable
DROP TABLE "public"."SurveyResponse";
