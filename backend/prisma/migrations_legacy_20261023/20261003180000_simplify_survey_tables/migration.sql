-- Merge campaign/recipient delivery data into Survey and SurveyResponse.
CREATE TYPE "SurveyResponseStatus" AS ENUM ('pending', 'submitted', 'skipped', 'expired');

ALTER TABLE "Survey"
ADD COLUMN "audienceType" "SurveyAudienceType",
ADD COLUMN "triggerType" "SurveyTriggerType" NOT NULL DEFAULT 'manual';

ALTER TABLE "SurveyResponse"
ALTER COLUMN "submittedAt" DROP NOT NULL,
ALTER COLUMN "submittedAt" DROP DEFAULT,
ADD COLUMN "surveyId" UUID,
ADD COLUMN "orderId" UUID,
ADD COLUMN "deliveryKey" VARCHAR(255),
ADD COLUMN "status" "SurveyResponseStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN "notifiedAt" TIMESTAMP(3),
ADD COLUMN "openedAt" TIMESTAMP(3),
ADD COLUMN "skippedAt" TIMESTAMP(3),
ADD COLUMN "expiresAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3);

ALTER TABLE "Notification" ADD COLUMN "surveyResponseId" UUID;

-- Every old survey receives the delivery settings from its first campaign.
UPDATE "Survey" AS survey
SET
  "audienceType" = COALESCE(
    (
      SELECT campaign."audienceType"
      FROM "SurveyCampaign" AS campaign
      WHERE campaign."surveyId" = survey."id"
      ORDER BY campaign."createdAt" ASC
      LIMIT 1
    ),
    CASE
      WHEN survey."scope" = 'vendor' THEN 'vendor_buyers'::"SurveyAudienceType"
      ELSE 'all_users'::"SurveyAudienceType"
    END
  ),
  "triggerType" = COALESCE(
    (
      SELECT campaign."triggerType"
      FROM "SurveyCampaign" AS campaign
      WHERE campaign."surveyId" = survey."id"
      ORDER BY campaign."createdAt" ASC
      LIMIT 1
    ),
    'manual'::"SurveyTriggerType"
  );

UPDATE "Survey"
SET
  "audienceType" = CASE
    WHEN "scope" = 'vendor' THEN 'vendor_buyers'::"SurveyAudienceType"
    ELSE 'all_users'::"SurveyAudienceType"
  END
WHERE "audienceType" IS NULL;

-- Backfill submitted responses from their old recipient records.
UPDATE "SurveyResponse" AS response
SET
  "surveyId" = recipient."surveyId",
  "orderId" = recipient."orderId",
  "deliveryKey" = recipient."deliveryKey",
  "status" = 'submitted'::"SurveyResponseStatus",
  "notifiedAt" = recipient."notifiedAt",
  "openedAt" = recipient."openedAt",
  "skippedAt" = recipient."skippedAt",
  "expiresAt" = recipient."expiresAt",
  "updatedAt" = recipient."updatedAt"
FROM "SurveyRecipient" AS recipient
WHERE response."recipientId" = recipient."id";

-- Recipients that had not submitted an answer become pending/skipped response rows.
INSERT INTO "SurveyResponse" (
  "id", "recipientId", "userId", "submittedAt", "createdAt",
  "surveyId", "orderId", "deliveryKey", "status", "notifiedAt",
  "openedAt", "skippedAt", "expiresAt", "updatedAt"
)
SELECT
  gen_random_uuid(), recipient."id", recipient."userId", NULL, recipient."createdAt",
  recipient."surveyId", recipient."orderId", recipient."deliveryKey",
  CASE
    WHEN recipient."status" = 'skipped' THEN 'skipped'::"SurveyResponseStatus"
    WHEN recipient."status" = 'expired' THEN 'expired'::"SurveyResponseStatus"
    ELSE 'pending'::"SurveyResponseStatus"
  END,
  recipient."notifiedAt", recipient."openedAt", recipient."skippedAt",
  recipient."expiresAt", recipient."updatedAt"
FROM "SurveyRecipient" AS recipient
LEFT JOIN "SurveyResponse" AS response ON response."recipientId" = recipient."id"
WHERE response."id" IS NULL;

UPDATE "Notification" AS notification
SET "surveyResponseId" = response."id"
FROM "SurveyResponse" AS response
WHERE response."recipientId" = notification."surveyRecipientId";

ALTER TABLE "Notification" DROP CONSTRAINT "Notification_campaignId_fkey";
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_surveyRecipientId_fkey";
ALTER TABLE "SurveyResponse" DROP CONSTRAINT "SurveyResponse_recipientId_fkey";

DROP INDEX "Notification_campaignId_idx";
DROP INDEX "Notification_surveyRecipientId_key";
DROP INDEX "Survey_status_startDate_endDate_idx";
DROP INDEX "SurveyResponse_recipientId_key";
DROP INDEX "SurveyResponse_userId_idx";

ALTER TABLE "Notification"
DROP COLUMN "campaignId",
DROP COLUMN "surveyRecipientId";

ALTER TABLE "Survey"
ALTER COLUMN "audienceType" SET NOT NULL;

ALTER TABLE "SurveyResponse"
DROP COLUMN "recipientId",
ALTER COLUMN "surveyId" SET NOT NULL,
ALTER COLUMN "deliveryKey" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

DROP TABLE "SurveyCampaignProduct";
DROP TABLE "SurveyCampaignTarget";
DROP TABLE "SurveyRecipient";
DROP TABLE "SurveyCampaign";

DROP TYPE "SurveyCampaignStatus";
DROP TYPE "SurveyRecipientStatus";

CREATE UNIQUE INDEX "Notification_surveyResponseId_key"
ON "Notification"("surveyResponseId");

CREATE INDEX "Survey_status_triggerType_startDate_endDate_idx"
ON "Survey"("status", "triggerType", "startDate", "endDate");

CREATE UNIQUE INDEX "SurveyResponse_deliveryKey_key"
ON "SurveyResponse"("deliveryKey");

CREATE INDEX "SurveyResponse_surveyId_status_idx"
ON "SurveyResponse"("surveyId", "status");

CREATE INDEX "SurveyResponse_userId_status_createdAt_idx"
ON "SurveyResponse"("userId", "status", "createdAt");

CREATE INDEX "SurveyResponse_orderId_status_idx"
ON "SurveyResponse"("orderId", "status");

ALTER TABLE "SurveyResponse"
ADD CONSTRAINT "SurveyResponse_surveyId_fkey"
FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SurveyResponse"
ADD CONSTRAINT "SurveyResponse_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_surveyResponseId_fkey"
FOREIGN KEY ("surveyResponseId") REFERENCES "SurveyResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
