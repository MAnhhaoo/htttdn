/**
 * Generates validate.sql — a set of PostgreSQL queries that verify
 * the integrity and consistency of the seeded data.
 */
export function generateValidationSql(): string {
  return `-- ============================================================
-- MIVA Dataset Validation Queries
-- Run these in pgAdmin 4 after importing seed.sql
-- ============================================================

-- 1. Users by role
SELECT "role", COUNT(*) AS count FROM "User" WHERE "deletedAt" IS NULL GROUP BY "role" ORDER BY "role";

-- 2. Products by category
SELECT c."name" AS category, COUNT(p."id") AS products
FROM "Category" c LEFT JOIN "Product" p ON p."categoryId" = c."id" AND p."deletedAt" IS NULL
WHERE c."deletedAt" IS NULL GROUP BY c."name" ORDER BY products DESC;

-- 3. Products by vendor
SELECT u."fullName" AS vendor, COUNT(p."id") AS products
FROM "User" u LEFT JOIN "Product" p ON p."vendorId" = u."id" AND p."deletedAt" IS NULL
WHERE u."role" = 'vendor' GROUP BY u."fullName" ORDER BY products DESC;

-- 4. Product colors count
SELECT COUNT(*) AS total_colors FROM "ProductColor" WHERE "deletedAt" IS NULL;

-- 5. Product variants count
SELECT COUNT(*) AS total_variants FROM "ProductVariant" WHERE "deletedAt" IS NULL;

-- 6. Orders by status
SELECT "status", COUNT(*) AS count FROM "Order" GROUP BY "status" ORDER BY count DESC;

-- 7. Order totals (should all be positive)
SELECT COUNT(*) AS negative_totals FROM "Order" WHERE "totalAmount" < 0;

-- 8. Voucher relationships
SELECT v."code", v."scope", COUNT(vd."id") AS linked_products
FROM "Voucher" v LEFT JOIN "VoucherDetail" vd ON vd."voucherId" = v."id" AND vd."productId" IS NOT NULL
WHERE v."deletedAt" IS NULL GROUP BY v."code", v."scope" ORDER BY v."scope", v."code";

-- 9. Review relationships (should all reference completed orders)
SELECT r."id" AS review_id, o."status" AS order_status
FROM "Review" r
JOIN "OrderDetail" od ON od."id" = r."orderDetailId"
JOIN "Order" o ON o."id" = od."orderId"
WHERE o."status" != 'completed';

-- 10. Duplicate emails (should return 0)
SELECT "email", COUNT(*) FROM "User" GROUP BY "email" HAVING COUNT(*) > 1;

-- 11. Duplicate product slugs (should return 0)
SELECT "slug", COUNT(*) FROM "Product" GROUP BY "slug" HAVING COUNT(*) > 1;

-- 12. Duplicate category slugs (should return 0)
SELECT "slug", COUNT(*) FROM "Category" GROUP BY "slug" HAVING COUNT(*) > 1;

-- 13. Duplicate voucher codes (should return 0)
SELECT "code", COUNT(*) FROM "Voucher" GROUP BY "code" HAVING COUNT(*) > 1;

-- 14. Invalid foreign keys — Products referencing non-existent categories
SELECT p."id" FROM "Product" p LEFT JOIN "Category" c ON c."id" = p."categoryId" WHERE c."id" IS NULL;

-- 15. Invalid foreign keys — ProductColors referencing non-existent products
SELECT pc."id" FROM "ProductColor" pc LEFT JOIN "Product" p ON p."id" = pc."productId" WHERE p."id" IS NULL;

-- 16. Invalid foreign keys — ProductVariants referencing non-existent colors
SELECT pv."id" FROM "ProductVariant" pv LEFT JOIN "ProductColor" pc ON pc."id" = pv."productColorId" WHERE pc."id" IS NULL;

-- 17. Invalid foreign keys — Orders referencing non-existent users
SELECT o."id" FROM "Order" o LEFT JOIN "User" u ON u."id" = o."userId" WHERE u."id" IS NULL;

-- 18. Invalid stock (negative values — should return 0)
SELECT COUNT(*) AS negative_stock FROM "ProductVariant" WHERE "stock" < 0;

-- 19. Invalid prices (non-positive — should return 0)
SELECT COUNT(*) AS bad_prices FROM "ProductVariant" WHERE "price" <= 0;

-- 20. Surveys by creator role
SELECT u."role", COUNT(s."id") AS surveys FROM "Survey" s JOIN "User" u ON u."id" = s."createdById" GROUP BY u."role";

-- 21. Survey Questions by Type
SELECT "type", COUNT(*) FROM "SurveyQuestion" GROUP BY "type";

-- 22. Survey Responses
SELECT COUNT(*) AS total_responses FROM "SurveyResponse";

-- 23. Invalid Survey Responses (Customer has no completed/shipping order from Vendor)
SELECT sr."id" AS response_id, sr."userId" AS customer_id, s."createdById" AS vendor_id
FROM "SurveyResponse" sr
JOIN "Survey" s ON s."id" = sr."surveyId"
JOIN "User" u ON u."id" = s."createdById"
WHERE u."role" = 'vendor'
  AND NOT EXISTS (
    SELECT 1 FROM "Order" o
    JOIN "OrderDetail" od ON od."orderId" = o."id"
    JOIN "ProductVariant" pv ON pv."id" = od."productVariantId"
    JOIN "ProductColor" pc ON pc."id" = pv."productColorId"
    JOIN "Product" p ON p."id" = pc."productId"
    WHERE o."userId" = sr."userId" AND p."vendorId" = s."createdById" AND o."status" IN ('completed', 'shipping')
  );

-- 24. Invalid Survey Answers (Option doesn't belong to Question)
SELECT sa."id"
FROM "SurveyAnswer" sa
JOIN "SurveyOption" so ON so."id" = sa."optionId"
WHERE sa."optionId" IS NOT NULL AND so."questionId" != sa."questionId";

-- 25. Summary report
SELECT 'Users' AS entity, COUNT(*) AS count FROM "User"
UNION ALL SELECT 'Categories', COUNT(*) FROM "Category"
UNION ALL SELECT 'Products', COUNT(*) FROM "Product"
UNION ALL SELECT 'ProductColors', COUNT(*) FROM "ProductColor"
UNION ALL SELECT 'ProductVariants', COUNT(*) FROM "ProductVariant"
UNION ALL SELECT 'Vouchers', COUNT(*) FROM "Voucher"
UNION ALL SELECT 'VoucherDetails', COUNT(*) FROM "VoucherDetail"
UNION ALL SELECT 'Carts', COUNT(*) FROM "Cart"
UNION ALL SELECT 'CartItems', COUNT(*) FROM "CartItem"
UNION ALL SELECT 'Orders', COUNT(*) FROM "Order"
UNION ALL SELECT 'OrderDetails', COUNT(*) FROM "OrderDetail"
UNION ALL SELECT 'Payments', COUNT(*) FROM "Payment"
UNION ALL SELECT 'OrderStatusHistory', COUNT(*) FROM "OrderStatusHistory"
UNION ALL SELECT 'Reviews', COUNT(*) FROM "Review"
UNION ALL SELECT 'Surveys', COUNT(*) FROM "Survey"
UNION ALL SELECT 'SurveyQuestions', COUNT(*) FROM "SurveyQuestion"
UNION ALL SELECT 'SurveyOptions', COUNT(*) FROM "SurveyOption"
UNION ALL SELECT 'SurveyResponses', COUNT(*) FROM "SurveyResponse"
UNION ALL SELECT 'SurveyAnswers', COUNT(*) FROM "SurveyAnswer"
ORDER BY entity;
`;
}
