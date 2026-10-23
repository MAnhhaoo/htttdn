CREATE TYPE "VoucherScope" AS ENUM ('platform', 'vendor');
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'cancelled', 'refunded');

ALTER TABLE "CartItem"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "CartItem" ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "Order"
ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "orderCode" VARCHAR(50),
ADD COLUMN "receiverName" VARCHAR(255),
ADD COLUMN "receiverPhone" VARCHAR(50),
ADD COLUMN "shippingAddress" VARCHAR(500),
ADD COLUMN "shippingFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "subtotalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "Order" SET "orderCode" = 'legacy-' || "id"::text WHERE "orderCode" IS NULL;
ALTER TABLE "Order" ALTER COLUMN "orderCode" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "OrderDetail"
ADD COLUMN "colorName" VARCHAR(100),
ADD COLUMN "imageUrl" VARCHAR(1000),
ADD COLUMN "productName" VARCHAR(255),
ADD COLUMN "sizeName" VARCHAR(100);

ALTER TABLE "Payment"
ADD COLUMN "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "failedAt" TIMESTAMP(3),
ADD COLUMN "gateway" VARCHAR(100),
ADD COLUMN "gatewayResponse" JSONB,
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN "transactionCode" VARCHAR(255),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Payment" ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "Review" ADD COLUMN "deletedAt" TIMESTAMP(3);

ALTER TABLE "Voucher"
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "perUserLimit" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "scope" "VoucherScope";
UPDATE "Voucher" AS voucher
SET "scope" = CASE
  WHEN owner."role" = 'vendor' THEN 'vendor'::"VoucherScope"
  ELSE 'platform'::"VoucherScope"
END
FROM "User" AS owner
WHERE owner."id" = voucher."userId" AND voucher."scope" IS NULL;
UPDATE "Voucher" SET "scope" = 'platform' WHERE "scope" IS NULL;
ALTER TABLE "Voucher" ALTER COLUMN "scope" SET NOT NULL;

ALTER TABLE "VoucherDetail"
ADD COLUMN "discountAmount" DECIMAL(12,2),
ADD COLUMN "eligibleAmount" DECIMAL(12,2),
ADD COLUMN "reversedAt" TIMESTAMP(3),
ADD COLUMN "sequence" INTEGER;

ALTER TABLE "VoucherDetail"
ADD CONSTRAINT "VoucherDetail_target_check" CHECK (
  ("productId" IS NOT NULL AND "orderId" IS NULL)
  OR ("productId" IS NULL AND "orderId" IS NOT NULL)
);

CREATE TABLE "OrderStatusHistory" (
  "id" UUID NOT NULL,
  "orderId" UUID NOT NULL,
  "actorId" UUID,
  "fromStatus" "OrderStatus",
  "toStatus" "OrderStatus" NOT NULL,
  "note" VARCHAR(1000),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory"("orderId", "createdAt");
CREATE INDEX "OrderStatusHistory_actorId_idx" ON "OrderStatusHistory"("actorId");
CREATE UNIQUE INDEX "Order_orderCode_key" ON "Order"("orderCode");
CREATE UNIQUE INDEX "Payment_transactionCode_key" ON "Payment"("transactionCode");
CREATE INDEX "Voucher_scope_idx" ON "Voucher"("scope");
CREATE UNIQUE INDEX "VoucherDetail_voucherId_productId_key" ON "VoucherDetail"("voucherId", "productId");
CREATE UNIQUE INDEX "VoucherDetail_voucherId_orderId_key" ON "VoucherDetail"("voucherId", "orderId");
CREATE UNIQUE INDEX "VoucherDetail_orderId_sequence_key" ON "VoucherDetail"("orderId", "sequence");

ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
