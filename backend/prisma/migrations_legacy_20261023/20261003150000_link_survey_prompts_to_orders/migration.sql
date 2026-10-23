-- CreateEnum
CREATE TYPE "SurveyResponseStatus" AS ENUM ('pending', 'submitted', 'skipped');

-- DropIndex
DROP INDEX "SurveyResponse_surveyId_userId_key";

-- AlterTable
ALTER TABLE "SurveyResponse"
ADD COLUMN "orderId" UUID,
ADD COLUMN "status" "SurveyResponseStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN "skippedAt" TIMESTAMP(3),
ALTER COLUMN "submittedAt" DROP NOT NULL,
ALTER COLUMN "submittedAt" DROP DEFAULT;

-- Existing rows were created by the old direct-submit flow.
UPDATE "SurveyResponse"
SET "status" = 'submitted'
WHERE "submittedAt" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_surveyId_orderId_userId_key"
ON "SurveyResponse"("surveyId", "orderId", "userId");

-- CreateIndex
CREATE INDEX "SurveyResponse_orderId_status_idx"
ON "SurveyResponse"("orderId", "status");

-- AddForeignKey
ALTER TABLE "SurveyResponse"
ADD CONSTRAINT "SurveyResponse_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
