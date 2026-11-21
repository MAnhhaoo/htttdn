-- Add assignedEmployeeId column to Order for strict current-assignee isolation
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "assignedEmployeeId" UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Order_assignedEmployeeId_fkey'
  ) THEN
    ALTER TABLE "Order"
      ADD CONSTRAINT "Order_assignedEmployeeId_fkey"
      FOREIGN KEY ("assignedEmployeeId") REFERENCES "Employee"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Order_assignedEmployeeId_createdAt_idx" ON "Order"("assignedEmployeeId", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_assignedEmployeeId_status_idx" ON "Order"("assignedEmployeeId", "status");

-- Backfill assignedEmployeeId from the latest non-shipping employee assignment in OrderStatusHistory
WITH latest_handler AS (
  SELECT DISTINCT ON (h."orderId")
    h."orderId",
    h."employeeId"
  FROM "OrderStatusHistory" h
  JOIN "Employee" e ON e.id = h."employeeId"
  WHERE h."employeeId" IS NOT NULL
    AND e."deletedAt" IS NULL
    AND COALESCE(e.department, '') NOT ILIKE '%Vận chuyển%'
    AND COALESCE(e.department, '') NOT ILIKE '%Giao nhận%'
  ORDER BY
    h."orderId",
    CASE
      WHEN COALESCE(h.note, '') LIKE '[Chỉ định Điều phối]%'
        OR COALESCE(h.note, '') LIKE '[Chỉ định Xử lý Sự cố]%'
        OR COALESCE(h.note, '') LIKE '[Điều phối Admin]%'
        OR COALESCE(h.note, '') LIKE '[Phân công tiếp nhận]%'
      THEN 0
      ELSE 1
    END ASC,
    h."createdAt" DESC
)
UPDATE "Order" o
SET "assignedEmployeeId" = lh."employeeId"
FROM latest_handler lh
WHERE o.id = lh."orderId"
  AND o."assignedEmployeeId" IS NULL;
