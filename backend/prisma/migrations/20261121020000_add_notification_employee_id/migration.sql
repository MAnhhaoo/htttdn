-- Add employeeId to Notification table so employees receive persisted order/shipment/system notifications
ALTER TABLE "Notification"
  ADD COLUMN IF NOT EXISTS "employeeId" UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Notification_employeeId_fkey'
  ) THEN
    ALTER TABLE "Notification"
      ADD CONSTRAINT "Notification_employeeId_fkey"
      FOREIGN KEY ("employeeId") REFERENCES "Employee"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Notification_employeeId_isRead_createdAt_idx"
  ON "Notification"("employeeId", "isRead", "createdAt");

CREATE INDEX IF NOT EXISTS "Notification_employeeId_createdAt_idx"
  ON "Notification"("employeeId", "createdAt");
