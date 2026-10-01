/**
 * Preview Reset Script.
 *
 * Generates a reset_preview.sql that shows which tables would be affected
 * and provides DELETE statements in correct FK order.
 *
 * ⚠️  This script does NOT execute anything against the database.
 * ⚠️  Review the generated SQL carefully before running it manually.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'output');

function main() {
  console.log('🔄 MIVA Dataset — Preview Reset Script');
  console.log('='.repeat(60));
  console.log('');
  console.log('⚠️  This generates a PREVIEW SQL file for deleting existing data.');
  console.log('⚠️  It does NOT execute anything against the database.');
  console.log('⚠️  Always BACKUP your database before running the reset SQL.');
  console.log('');

  // Tables in reverse FK dependency order (delete children first)
  const TABLES_DELETE_ORDER = [
    'Review',
    'OrderStatusHistory',
    'VoucherDetail',
    'Payment',
    'OrderDetail',
    'Order',
    'CartItem',
    'Cart',
    'ProductVariant',
    'ProductColor',
    'Product',
    'Voucher',
    'Category',
    'User',
  ];

  const sql = `-- ============================================================
-- MIVA Dataset — Reset Preview SQL
-- Generated: ${new Date().toISOString()}
-- ============================================================
--
-- ⚠️  WARNING: This script DELETES ALL DATA from the tables below.
-- ⚠️  This is intended for DEVELOPMENT databases ONLY.
-- ⚠️  CREATE A BACKUP before running this script.
--
-- ⚠️  DO NOT run this on production databases.
-- ⚠️  DO NOT run this without reviewing each statement.
--
-- ============================================================

-- Step 1: Verify this is a development database
-- Run this query first to confirm the database name:
SELECT current_database();

-- Step 2: Count existing records (review before deleting)
${TABLES_DELETE_ORDER.map(
  (table) => `SELECT '${table}' AS "table", COUNT(*) AS "records" FROM "${table}";`,
).join('\n')}

-- Step 3: Delete data in correct FK order
-- Uncomment the lines below ONLY after reviewing Step 2 results.

BEGIN;

${TABLES_DELETE_ORDER.map(
  (table) => `-- DELETE FROM "${table}";  -- Uncomment to delete all ${table} records`,
).join('\n')}

-- COMMIT;  -- Uncomment after uncommenting DELETE statements above
-- ROLLBACK;  -- Use ROLLBACK instead of COMMIT to test safely first

-- Step 4: After deletion, import fresh data:
-- Open seed.sql in pgAdmin 4 and execute it.

-- ============================================================
-- Reset preview complete.
-- ============================================================
`;

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(join(OUTPUT_DIR, 'reset_preview.sql'), sql, 'utf-8');

  console.log('✅ Generated: output/reset_preview.sql');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Open reset_preview.sql in pgAdmin 4');
  console.log('  2. Run Step 1 to verify database name');
  console.log('  3. Run Step 2 to review existing record counts');
  console.log('  4. BACKUP your database');
  console.log('  5. Uncomment DELETE statements in Step 3');
  console.log('  6. Use ROLLBACK first to test, then COMMIT to apply');
  console.log('  7. Import seed.sql to add fresh data');
}

main();
