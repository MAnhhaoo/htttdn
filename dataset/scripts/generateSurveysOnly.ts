import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('../../backend/node_modules/@prisma/client');
import { generateSurveys } from '../generators/surveys.generator.js';
import { buildSqlFile } from '../utils/sqlBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'output');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 MIVA Survey-Only Dataset Generator (Live DB)');
  console.log('='.repeat(60));

  console.log('Fetching existing data from database...');
  
  const admins = await prisma.user.findMany({ where: { role: 'admin' } });
  const vendors = await prisma.user.findMany({ where: { role: 'vendor' } });
  const customers = await prisma.user.findMany({ where: { role: 'customer' } });
  const orders = await prisma.order.findMany();
  const orderDetails = await prisma.orderDetail.findMany();
  const products = await prisma.product.findMany();
  const colors = await prisma.productColor.findMany();
  const variants = await prisma.productVariant.findMany();

  console.log(`Loaded ${admins.length} admins, ${vendors.length} vendors, ${customers.length} customers.`);
  console.log(`Loaded ${orders.length} orders, ${products.length} products.`);

  console.log('\n📝 Generating surveys...');
  const { surveys, surveyResponses, surveyAnswers, sql: surveysSql } = generateSurveys(
    admins, vendors, customers, orders, orderDetails, products, colors, variants
  );

  console.log(`   ✅ ${surveys.length} surveys, ${surveyResponses.length} responses, ${surveyAnswers.length} answers`);

  const deleteSql = `
-- ============================================================
-- CLEAR EXISTING SURVEY DATA
-- Safe to rerun because of CASCADE or explicit ordering
-- ============================================================
DELETE FROM "SurveyAnswer";
DELETE FROM "SurveyResponse";
DELETE FROM "SurveyOption";
DELETE FROM "SurveyQuestion";
DELETE FROM "Survey";

`;

  const finalSql = deleteSql + buildSqlFile([surveysSql]);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(join(OUTPUT_DIR, 'survey_seed.sql'), finalSql, 'utf-8');

  console.log('\n✅ Generation complete!');
  console.log(`   📄 output/survey_seed.sql`);
  
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
