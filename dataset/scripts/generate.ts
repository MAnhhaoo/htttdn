/**
 * Main dataset generation orchestrator.
 *
 * Runs all generators in dependency order, resolves cross-references,
 * and writes the output SQL files.
 *
 * Usage: npm run generate
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { buildInsert, sqlSection, buildSqlFile } from '../utils/sqlBuilder';
import { generateValidationSql } from '../utils/validateDataset';

import { generateUsers } from '../generators/users.generator';
import { generateCategories } from '../generators/categories.generator';
import { generateProducts } from '../generators/products.generator';
import { generateProductColors } from '../generators/productColors.generator';
import { generateProductVariants } from '../generators/productVariants.generator';
import { generateVouchers } from '../generators/vouchers.generator';
import { generateVoucherDetails } from '../generators/voucherDetails.generator';
import { generateCarts } from '../generators/carts.generator';
import { generateOrders } from '../generators/orders.generator';
import { generateOrderStatusHistory } from '../generators/orderStatusHistory.generator';
import { generateOrderVoucherDetails } from '../generators/orderVoucherDetails.generator';
import { generateReviews } from '../generators/reviews.generator';
import { generateSurveys } from '../generators/surveys.generator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'output');

function main() {
  console.log('🚀 MIVA Dataset Generator');
  console.log('='.repeat(60));

  // ── 1. Users ──
  console.log('\n👤 Generating users...');
  const { admins, vendors, customers, sql: usersSql, data: allUsers } = generateUsers();
  console.log(`   ✅ ${admins.length} admins, ${vendors.length} vendors, ${customers.length} customers`);

  // ── 2. Categories ──
  console.log('\n📁 Generating categories...');
  const { data: categories, sql: categoriesSql } = generateCategories();
  console.log(`   ✅ ${categories.length} categories`);

  // ── 3. Products ──
  console.log('\n📦 Generating products...');
  const { data: products, sql: productsSql } = generateProducts(categories, vendors);
  console.log(`   ✅ ${products.length} products`);

  // ── 4. ProductColors ──
  console.log('\n🎨 Generating product colors...');
  const { data: colors, sql: colorsSql } = generateProductColors(products);
  console.log(`   ✅ ${colors.length} product colors`);

  // ── 5. ProductVariants ──
  console.log('\n📐 Generating product variants...');
  const { data: variants, sql: variantsSql } = generateProductVariants(products, colors);
  console.log(`   ✅ ${variants.length} product variants`);

  // ── 6. Vouchers ──
  console.log('\n🎟️  Generating vouchers...');
  const { data: vouchers, sql: vouchersSql } = generateVouchers(admins, vendors);
  console.log(`   ✅ ${vouchers.length} vouchers`);

  // ── 7. VoucherDetails (product-linked) ──
  console.log('\n🔗 Generating voucher details (product-linked)...');
  const { data: voucherDetails, sql: voucherDetailsSql } = generateVoucherDetails(vouchers, products);
  console.log(`   ✅ ${voucherDetails.length} voucher details`);

  // ── 8. Carts ──
  console.log('\n🛒 Generating carts...');
  const { carts, cartItems, sql: cartsSql } = generateCarts(customers, variants);
  console.log(`   ✅ ${carts.length} carts, ${cartItems.length} cart items`);

  // ── 9. Orders + OrderDetails + Payments ──
  console.log('\n📋 Generating orders...');
  const { orders, orderDetails, payments, sql: ordersSql } = generateOrders(
    customers, products, colors, variants,
  );
  console.log(`   ✅ ${orders.length} orders, ${orderDetails.length} order details, ${payments.length} payments`);

  // ── 10. OrderStatusHistory ──
  console.log('\n📜 Generating order status history...');
  const { data: statusHistory, sql: statusHistorySql } = generateOrderStatusHistory(
    orders, admins, vendors,
  );
  console.log(`   ✅ ${statusHistory.length} status history entries`);

  // ── 11. VoucherDetails (order-linked) ──
  console.log('\n🏷️  Generating voucher details (order-linked)...');
  const { data: orderVoucherDetails, sql: orderVoucherDetailsSql } = generateOrderVoucherDetails(
    orders, vouchers,
  );
  console.log(`   ✅ ${orderVoucherDetails.length} order voucher details`);

  // ── 12. Surveys ──
  console.log('\n📝 Generating surveys...');
  const { surveys, surveyQuestions, surveyOptions, surveyResponses, surveyAnswers, sql: surveysSql } = generateSurveys(
    admins, vendors, customers, orders, orderDetails, products, colors, variants
  );
  console.log(`   ✅ ${surveys.length} surveys, ${surveyResponses.length} responses, ${surveyAnswers.length} answers`);

  // ── 13. Reviews ──
  console.log('\n⭐ Generating reviews...');
  const { data: reviewsRaw } = generateReviews(orders, orderDetails, colors);

  // Resolve productId for each review (variant → color → product)
  const variantById = new Map(variants.map((v) => [v.id, v]));
  const colorById = new Map(colors.map((c) => [c.id, c]));
  const detailById = new Map(orderDetails.map((d) => [d.id, d]));

  const resolvedReviews = reviewsRaw.map((r) => {
    const detail = detailById.get(r.orderDetailId);
    if (!detail) return null;
    const variant = variantById.get(detail.productVariantId);
    if (!variant) return null;
    const color = colorById.get(variant.productColorId);
    if (!color) return null;

    // Find order createdAt for review timestamp
    const order = orders.find((o) => o.id === detail.orderId);
    const reviewDate = order
      ? new Date(order.createdAt.getTime() + 86400000 * (1 + Math.random() * 14))
      : new Date();

    return {
      ...r,
      productId: color.productId,
      createdAt: reviewDate,
      updatedAt: reviewDate,
    };
  }).filter((r): r is NonNullable<typeof r> => r !== null);

  const reviewsSql = resolvedReviews.length > 0
    ? sqlSection('Reviews', resolvedReviews.length) + buildInsert('Review', resolvedReviews)
    : '';
  console.log(`   ✅ ${resolvedReviews.length} reviews`);

  // ── Write output files ──
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // seed.sql
  const allSql = buildSqlFile([
    usersSql,
    categoriesSql,
    productsSql,
    colorsSql,
    variantsSql,
    vouchersSql,
    voucherDetailsSql,
    cartsSql,
    ordersSql,
    statusHistorySql,
    orderVoucherDetailsSql,
    reviewsSql,
    surveysSql,
  ]);
  writeFileSync(join(OUTPUT_DIR, 'seed.sql'), allSql, 'utf-8');

  // validate.sql
  writeFileSync(join(OUTPUT_DIR, 'validate.sql'), generateValidationSql(), 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Generation complete!');
  console.log(`   📄 output/seed.sql`);
  console.log(`   📄 output/validate.sql`);
  console.log('='.repeat(60));

  // Summary table
  console.log('\n📊 Summary:');
  console.log(`   Users:              ${allUsers.length}`);
  console.log(`     Admins:           ${admins.length}`);
  console.log(`     Vendors:          ${vendors.length}`);
  console.log(`     Customers:        ${customers.length}`);
  console.log(`   Categories:         ${categories.length}`);
  console.log(`   Products:           ${products.length}`);
  console.log(`   Product Colors:     ${colors.length}`);
  console.log(`   Product Variants:   ${variants.length}`);
  console.log(`   Vouchers:           ${vouchers.length}`);
  console.log(`   Voucher Details:    ${voucherDetails.length + orderVoucherDetails.length}`);
  console.log(`   Carts:              ${carts.length}`);
  console.log(`   Cart Items:         ${cartItems.length}`);
  console.log(`   Orders:             ${orders.length}`);
  console.log(`   Order Details:      ${orderDetails.length}`);
  console.log(`   Payments:           ${payments.length}`);
  console.log(`   Status History:     ${statusHistory.length}`);
  console.log(`   Reviews:            ${resolvedReviews.length}`);
  console.log(`   Surveys:            ${surveys.length}`);
  console.log(`   Survey Responses:   ${surveyResponses.length}`);
}

main();
