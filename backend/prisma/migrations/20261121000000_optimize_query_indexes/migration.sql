-- Composite B-tree indexes for frequent query patterns
CREATE INDEX IF NOT EXISTS "SurveyResponse_clientId_createdAt_idx" ON "SurveyResponse"("clientId", "createdAt");
CREATE INDEX IF NOT EXISTS "ProductFavorite_deletedAt_createdAt_idx" ON "ProductFavorite"("deletedAt", "createdAt");
CREATE INDEX IF NOT EXISTS "CartItem_deletedAt_productVariantId_idx" ON "CartItem"("deletedAt", "productVariantId");
CREATE INDEX IF NOT EXISTS "VendorOrder_orderId_vendorId_idx" ON "VendorOrder"("orderId", "vendorId");
CREATE INDEX IF NOT EXISTS "Shipment_createdAt_idx" ON "Shipment"("createdAt");
CREATE INDEX IF NOT EXISTS "Shipment_carrierId_createdAt_idx" ON "Shipment"("carrierId", "createdAt");
CREATE INDEX IF NOT EXISTS "Shipment_carrierId_orderId_idx" ON "Shipment"("carrierId", "orderId");

-- Partial expression index for vendor survey status inside Notification.data JSON
CREATE INDEX IF NOT EXISTS "Notification_surveyId_vendorId_status_idx"
  ON "Notification" ("surveyId", "vendorId", ((data->>'status')))
  WHERE "vendorId" IS NOT NULL;

-- Trigram GIN indexes to accelerate leading-wildcard ILIKE '%...%' search queries
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Order_orderCode_trgm_idx" ON "Order" USING GIN ("orderCode" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Order_receiverName_trgm_idx" ON "Order" USING GIN ("receiverName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Order_receiverPhone_trgm_idx" ON "Order" USING GIN ("receiverPhone" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "OrderDetail_productName_trgm_idx" ON "OrderDetail" USING GIN ("productName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Shipment_trackingNumber_trgm_idx" ON "Shipment" USING GIN ("trackingNumber" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Shipment_receiverName_trgm_idx" ON "Shipment" USING GIN ("receiverName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Shipment_receiverPhone_trgm_idx" ON "Shipment" USING GIN ("receiverPhone" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "VendorOrder_vendorOrderCode_trgm_idx" ON "VendorOrder" USING GIN ("vendorOrderCode" gin_trgm_ops);
