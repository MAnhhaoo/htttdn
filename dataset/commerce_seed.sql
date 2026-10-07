-- MIVA Dataset Incremental Seed
-- Adds UserAddress records for existing customers and demo payment records

BEGIN;

-- 1. Insert UserAddresses for existing customers
-- We will select up to 5 customers and give them addresses
INSERT INTO "UserAddress" ("id", "userId", "receiverName", "phone", "addressLine", "ward", "district", "province", "label", "isDefault", "createdAt", "updatedAt")
SELECT
    gen_random_uuid(),
    id,
    "fullName",
    COALESCE("phone", '0987654321'),
    '123 Đường Trần Phú',
    'Phường 4',
    'Quận 5',
    'Hồ Chí Minh',
    'Nhà riêng',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User"
WHERE "role" = 'customer'
LIMIT 10;

INSERT INTO "UserAddress" ("id", "userId", "receiverName", "phone", "addressLine", "ward", "district", "province", "label", "isDefault", "createdAt", "updatedAt")
SELECT
    gen_random_uuid(),
    id,
    "fullName",
    COALESCE("phone", '0987654321'),
    'Toà nhà MIVA, 456 Lê Lợi',
    'Phường Bến Nghé',
    'Quận 1',
    'Hồ Chí Minh',
    'Công ty',
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User"
WHERE "role" = 'customer'
LIMIT 10;

-- 2. Update some existing Payments to use demo methods
UPDATE "Payment"
SET "method" = 'credit_card'
WHERE "id" IN (
    SELECT "id" FROM "Payment" WHERE "method" = 'cod' LIMIT 10
);

UPDATE "Payment"
SET "method" = 'pay_later'
WHERE "id" IN (
    SELECT "id" FROM "Payment" WHERE "method" = 'cod' LIMIT 10
);

COMMIT;
