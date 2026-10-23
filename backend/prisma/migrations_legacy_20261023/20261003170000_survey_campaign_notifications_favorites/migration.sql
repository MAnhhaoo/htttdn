-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- CreateEnum
CREATE TYPE "SurveyScope" AS ENUM ('platform', 'vendor');

-- CreateEnum
CREATE TYPE "SurveyAudienceType" AS ENUM ('all_users', 'all_vendors', 'all_system', 'selected_users', 'vendor_buyers', 'vendor_completed_buyers', 'vendor_product_buyers');

-- CreateEnum
CREATE TYPE "SurveyTriggerType" AS ENUM ('manual', 'after_checkout', 'after_order_completed');

-- CreateEnum
CREATE TYPE "SurveyCampaignStatus" AS ENUM ('draft', 'scheduled', 'running', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "SurveyRecipientStatus" AS ENUM ('pending', 'notified', 'opened', 'submitted', 'skipped', 'expired');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('survey_invitation', 'order_update', 'system');

-- DropForeignKey
ALTER TABLE "SurveyResponse" DROP CONSTRAINT "SurveyResponse_orderId_fkey";

-- DropForeignKey
ALTER TABLE "SurveyResponse" DROP CONSTRAINT "SurveyResponse_surveyId_fkey";

-- DropIndex
DROP INDEX "SurveyResponse_orderId_status_idx";

-- DropIndex
DROP INDEX "SurveyResponse_surveyId_orderId_userId_key";

-- AlterTable
ALTER TABLE "Survey" ADD COLUMN     "scope" "SurveyScope" NOT NULL DEFAULT 'platform';

-- Add the new response link as nullable while legacy prompts are backfilled.
ALTER TABLE "SurveyResponse" ADD COLUMN "recipientId" UUID;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateOfBirth" DATE,
ADD COLUMN     "gender" "Gender";

-- CreateTable
CREATE TABLE "SurveyCampaign" (
    "id" UUID NOT NULL,
    "surveyId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "audienceType" "SurveyAudienceType" NOT NULL,
    "triggerType" "SurveyTriggerType" NOT NULL DEFAULT 'manual',
    "status" "SurveyCampaignStatus" NOT NULL DEFAULT 'draft',
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyCampaignTarget" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "SurveyCampaignTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyCampaignProduct" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "productId" UUID NOT NULL,

    CONSTRAINT "SurveyCampaignProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyRecipient" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "surveyId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "orderId" UUID,
    "deliveryKey" VARCHAR(255) NOT NULL,
    "status" "SurveyRecipientStatus" NOT NULL DEFAULT 'pending',
    "notifiedAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "skippedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "surveyId" UUID,
    "campaignId" UUID,
    "surveyRecipientId" UUID,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFavorite" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductFavorite_pkey" PRIMARY KEY ("id")
);

-- Existing surveys inherit their scope from the creator role.
UPDATE "Survey" AS survey
SET "scope" = CASE
    WHEN creator."role" = 'vendor' THEN 'vendor'::"SurveyScope"
    ELSE 'platform'::"SurveyScope"
END
FROM "User" AS creator
WHERE creator."id" = survey."createdById";

-- Preserve all old order prompts by placing each existing survey in a legacy campaign.
INSERT INTO "SurveyCampaign" (
    "id", "surveyId", "createdById", "audienceType", "triggerType", "status",
    "publishedAt", "expiresAt", "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid(), survey."id", survey."createdById",
    CASE
        WHEN creator."role" = 'vendor'
            THEN 'vendor_buyers'::"SurveyAudienceType"
        ELSE 'all_users'::"SurveyAudienceType"
    END,
    'after_checkout'::"SurveyTriggerType",
    CASE
        WHEN survey."status" = 'closed'
            THEN 'completed'::"SurveyCampaignStatus"
        ELSE 'running'::"SurveyCampaignStatus"
    END,
    survey."createdAt", survey."endDate", survey."createdAt", survey."updatedAt"
FROM "Survey" AS survey
JOIN "User" AS creator ON creator."id" = survey."createdById";

INSERT INTO "SurveyRecipient" (
    "id", "campaignId", "surveyId", "userId", "orderId", "deliveryKey", "status",
    "notifiedAt", "submittedAt", "skippedAt", "expiresAt", "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid(), campaign."id", response."surveyId", response."userId", response."orderId",
    'legacy:' || response."id"::text,
    CASE response."status"
        WHEN 'submitted' THEN 'submitted'::"SurveyRecipientStatus"
        WHEN 'skipped' THEN 'skipped'::"SurveyRecipientStatus"
        ELSE 'notified'::"SurveyRecipientStatus"
    END,
    response."createdAt", response."submittedAt", response."skippedAt", campaign."expiresAt",
    response."createdAt", response."createdAt"
FROM "SurveyResponse" AS response
JOIN "SurveyCampaign" AS campaign ON campaign."surveyId" = response."surveyId";

UPDATE "SurveyResponse" AS response
SET "recipientId" = recipient."id"
FROM "SurveyRecipient" AS recipient
WHERE recipient."deliveryKey" = 'legacy:' || response."id"::text;

INSERT INTO "Notification" (
    "id", "userId", "surveyId", "campaignId", "surveyRecipientId", "type", "title",
    "content", "data", "isRead", "readAt", "expiresAt", "createdAt"
)
SELECT
    gen_random_uuid(), recipient."userId", recipient."surveyId", recipient."campaignId", recipient."id",
    'survey_invitation'::"NotificationType", survey."title", survey."description",
    jsonb_build_object('recipientId', recipient."id", 'surveyId', recipient."surveyId", 'orderId', recipient."orderId"),
    recipient."status" IN ('submitted', 'skipped'),
    CASE WHEN recipient."status" IN ('submitted', 'skipped') THEN COALESCE(recipient."submittedAt", recipient."skippedAt") END,
    recipient."expiresAt", recipient."createdAt"
FROM "SurveyRecipient" AS recipient
JOIN "Survey" AS survey ON survey."id" = recipient."surveyId";

-- Pending and skipped legacy rows are invitations, not submitted responses.
DELETE FROM "SurveyResponse" WHERE "status" <> 'submitted';

ALTER TABLE "SurveyResponse"
ALTER COLUMN "recipientId" SET NOT NULL,
ALTER COLUMN "submittedAt" SET NOT NULL,
ALTER COLUMN "submittedAt" SET DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "orderId",
DROP COLUMN "skippedAt",
DROP COLUMN "status",
DROP COLUMN "surveyId";

-- CreateIndex
CREATE INDEX "SurveyCampaign_surveyId_idx" ON "SurveyCampaign"("surveyId");

-- CreateIndex
CREATE INDEX "SurveyCampaign_createdById_idx" ON "SurveyCampaign"("createdById");

-- CreateIndex
CREATE INDEX "SurveyCampaign_status_triggerType_idx" ON "SurveyCampaign"("status", "triggerType");

-- CreateIndex
CREATE INDEX "SurveyCampaignTarget_userId_idx" ON "SurveyCampaignTarget"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyCampaignTarget_campaignId_userId_key" ON "SurveyCampaignTarget"("campaignId", "userId");

-- CreateIndex
CREATE INDEX "SurveyCampaignProduct_productId_idx" ON "SurveyCampaignProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyCampaignProduct_campaignId_productId_key" ON "SurveyCampaignProduct"("campaignId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyRecipient_deliveryKey_key" ON "SurveyRecipient"("deliveryKey");

-- CreateIndex
CREATE INDEX "SurveyRecipient_campaignId_status_idx" ON "SurveyRecipient"("campaignId", "status");

-- CreateIndex
CREATE INDEX "SurveyRecipient_surveyId_status_idx" ON "SurveyRecipient"("surveyId", "status");

-- CreateIndex
CREATE INDEX "SurveyRecipient_userId_status_createdAt_idx" ON "SurveyRecipient"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SurveyRecipient_orderId_status_idx" ON "SurveyRecipient"("orderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_surveyRecipientId_key" ON "Notification"("surveyRecipientId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_surveyId_idx" ON "Notification"("surveyId");

-- CreateIndex
CREATE INDEX "Notification_campaignId_idx" ON "Notification"("campaignId");

-- CreateIndex
CREATE INDEX "ProductFavorite_userId_createdAt_idx" ON "ProductFavorite"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductFavorite_productId_idx" ON "ProductFavorite"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFavorite_userId_productId_key" ON "ProductFavorite"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_recipientId_key" ON "SurveyResponse"("recipientId");

-- AddForeignKey
ALTER TABLE "SurveyCampaign" ADD CONSTRAINT "SurveyCampaign_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyCampaign" ADD CONSTRAINT "SurveyCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyCampaignTarget" ADD CONSTRAINT "SurveyCampaignTarget_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "SurveyCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyCampaignTarget" ADD CONSTRAINT "SurveyCampaignTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyCampaignProduct" ADD CONSTRAINT "SurveyCampaignProduct_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "SurveyCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyCampaignProduct" ADD CONSTRAINT "SurveyCampaignProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyRecipient" ADD CONSTRAINT "SurveyRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "SurveyCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyRecipient" ADD CONSTRAINT "SurveyRecipient_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyRecipient" ADD CONSTRAINT "SurveyRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyRecipient" ADD CONSTRAINT "SurveyRecipient_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "SurveyRecipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "SurveyCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_surveyRecipientId_fkey" FOREIGN KEY ("surveyRecipientId") REFERENCES "SurveyRecipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFavorite" ADD CONSTRAINT "ProductFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFavorite" ADD CONSTRAINT "ProductFavorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TYPE "SurveyResponseStatus";
