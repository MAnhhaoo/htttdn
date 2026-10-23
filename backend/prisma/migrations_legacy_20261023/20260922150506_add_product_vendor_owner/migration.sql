ALTER TABLE "Product" ADD COLUMN "vendorId" UUID;

CREATE INDEX "Product_vendorId_idx" ON "Product"("vendorId");

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
