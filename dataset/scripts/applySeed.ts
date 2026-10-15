/**
 * Apply Seed Script.
 *
 * 1. Connects to PostgreSQL using PrismaClient.
 * 2. Deletes data in reverse foreign-key dependency order.
 * 3. Reads dataset/output/seed.sql and executes each INSERT statement.
 * 4. Verifies and displays the final counts of all tables.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PrismaClient } = require('../../backend/node_modules/@prisma/client');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SEED_FILE = join(__dirname, '..', 'output', 'seed.sql');

const prisma = new PrismaClient();

const TABLES_DELETE_ORDER = [
  'Notification',
  'SurveyAnswer',
  'SurveyResponse',
  'SurveyOption',
  'SurveyQuestion',
  'Survey',
  'Review',
  'OrderStatusHistory',
  'ShipmentEvent',
  'Shipment',
  'VoucherDetail',
  'Payment',
  'OrderDetail',
  'VendorOrder',
  'Order',
  'CartItem',
  'Cart',
  'ProductFavorite',
  'ProductVariant',
  'ProductColor',
  'Product',
  'Voucher',
  'Category',
  'ClientAddress',
  'EmployeePayroll',
  'EmployeeAttendance',
  'EmployeeSalaryHistory',
  'Employee',
  'Client',
  'Vendor',
  'Admin',
];

async function main() {
  console.log('🚀 MIVA Dataset — Applying Fresh Seed to Database');
  console.log('='.repeat(60));

  // 1. Wipe existing data in reverse FK order
  console.log('\n🧹 Clearing existing records across 31 tables in reverse FK order...');
  for (const table of TABLES_DELETE_ORDER) {
    try {
      const count = await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
      console.log(`   ✓ Cleared "${table}" (${count} deleted)`);
    } catch (err: any) {
      console.warn(`   ⚠️ Warning clearing "${table}":`, err.message);
    }
  }

  // 2. Read and parse seed.sql
  console.log(`\n📖 Reading seed file: ${SEED_FILE}...`);
  const content = readFileSync(SEED_FILE, 'utf8');

  // Extract individual INSERT statements
  const rawChunks = content.split(/;\s*[\r\n]+/);
  const statements: { table: string; sql: string }[] = [];

  for (const chunk of rawChunks) {
    // Strip leading/trailing whitespace and comments
    const lines = chunk.split('\n').filter((l) => !l.trim().startsWith('--'));
    const sql = lines.join('\n').trim();
    if (!sql || sql === 'BEGIN' || sql === 'COMMIT') continue;

    if (sql.toUpperCase().startsWith('INSERT INTO')) {
      const match = sql.match(/INSERT INTO\s+"?([A-Za-z0-9_]+)"?/i);
      const table = match ? match[1] : 'Unknown';
      statements.push({ table, sql });
    }
  }

  console.log(`📋 Found ${statements.length} SQL INSERT statements to execute.`);

  // 3. Execute statements sequentially
  let executed = 0;
  for (const { table, sql } of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      executed++;
      if (executed % 5 === 0 || executed === statements.length) {
        process.stdout.write(`   ⚙️  Inserted ${executed}/${statements.length} statements (${table})...\r`);
      }
    } catch (err: any) {
      console.error(`\n❌ Error inserting into "${table}":`, err.message);
      console.error('Snippet:', sql.slice(0, 200));
      throw err;
    }
  }

  console.log(`\n\n✅ Successfully executed ${executed} INSERT statement blocks!`);

  // 4. Verify table counts
  console.log('\n📊 Database Verification — Current Table Counts:');
  console.log('='.repeat(60));
  const models = [
    { name: 'Admin', count: () => prisma.admin.count() },
    { name: 'Client', count: () => prisma.client.count() },
    { name: 'ClientAddress', count: () => prisma.clientAddress.count() },
    { name: 'Vendor', count: () => prisma.vendor.count() },
    { name: 'Employee', count: () => prisma.employee.count() },
    { name: 'EmployeePayroll', count: () => prisma.employeePayroll.count() },
    { name: 'EmployeeAttendance', count: () => prisma.employeeAttendance.count() },
    { name: 'EmployeeSalaryHistory', count: () => prisma.employeeSalaryHistory.count() },
    { name: 'Category', count: () => prisma.category.count() },
    { name: 'Product', count: () => prisma.product.count() },
    { name: 'ProductColor', count: () => prisma.productColor.count() },
    { name: 'ProductVariant', count: () => prisma.productVariant.count() },
    { name: 'Cart', count: () => prisma.cart.count() },
    { name: 'CartItem', count: () => prisma.cartItem.count() },
    { name: 'Order', count: () => prisma.order.count() },
    { name: 'OrderDetail', count: () => prisma.orderDetail.count() },
    { name: 'Payment', count: () => prisma.payment.count() },
    { name: 'VendorOrder', count: () => prisma.vendorOrder.count() },
    { name: 'Shipment', count: () => prisma.shipment.count() },
    { name: 'ShipmentEvent', count: () => prisma.shipmentEvent.count() },
    { name: 'OrderStatusHistory', count: () => prisma.orderStatusHistory.count() },
    { name: 'Voucher', count: () => prisma.voucher.count() },
    { name: 'VoucherDetail', count: () => prisma.voucherDetail.count() },
    { name: 'Survey', count: () => prisma.survey.count() },
    { name: 'SurveyQuestion', count: () => prisma.surveyQuestion.count() },
    { name: 'SurveyOption', count: () => prisma.surveyOption.count() },
    { name: 'SurveyResponse', count: () => prisma.surveyResponse.count() },
    { name: 'SurveyAnswer', count: () => prisma.surveyAnswer.count() },
    { name: 'Review', count: () => prisma.review.count() },
    { name: 'Notification', count: () => prisma.notification.count() },
  ];

  for (const m of models) {
    try {
      const c = await m.count();
      console.log(`   - ${m.name.padEnd(25)}: ${c} records`);
    } catch (e: any) {
      console.log(`   - ${m.name.padEnd(25)}: [Error: ${e.message}]`);
    }
  }

  console.log('='.repeat(60));
  console.log('🎉 Seed application completed successfully!');
}

main()
  .catch((err) => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
