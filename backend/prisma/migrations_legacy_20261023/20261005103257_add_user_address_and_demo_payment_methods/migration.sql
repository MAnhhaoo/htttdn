-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'credit_card';
ALTER TYPE "PaymentMethod" ADD VALUE 'pay_later';

-- CreateTable
CREATE TABLE "UserAddress" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "receiverName" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "addressLine" VARCHAR(500) NOT NULL,
    "ward" VARCHAR(255),
    "district" VARCHAR(255),
    "province" VARCHAR(255),
    "label" VARCHAR(100),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UserAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAddress_userId_deletedAt_idx" ON "UserAddress"("userId", "deletedAt");

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
