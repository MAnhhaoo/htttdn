// Run with backend/vendor dev servers: node test/vendor-voucher.manual.cjs
require('dotenv').config();
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');
const { chromium } = require('../../frontend/node_modules/playwright');

async function main() {
  const prisma = new PrismaClient();
  const prefix = `TEST-SHOP-VOUCHER-${Date.now()}`;
  const email = process.env.MIVA_TEST_VENDOR_EMAIL || 'vendor1@miva.vn';
  const products = [];
  let browser, vendor, category;
  try {
    vendor = await prisma.vendor.findUniqueOrThrow({ where: { email }, select: { id: true } });
    const otherVendor = await prisma.vendor.findFirstOrThrow({ where: { id: { not: vendor.id }, deletedAt: null }, select: { id: true } });
    category = await prisma.category.create({ data: { name: prefix, slug: prefix.toLowerCase() } });
    for (const [suffix, vendorId] of [['P1', vendor.id], ['P2', vendor.id], ['FOREIGN', otherVendor.id]]) {
      products.push(await prisma.product.create({ data: {
        name: `${prefix}-${suffix}`, slug: `${prefix}-${suffix}`.toLowerCase(), categoryId: category.id, vendorId, status: 'active',
        colors: { create: { color: 'Test', variants: { create: { size: 'Test', price: 100000, stock: 10 } } } },
      }, include: { colors: { include: { variants: true } } } }));
    }
    const [p1, p2, foreign] = products;
    browser = await chromium.launch({ channel: process.env.MIVA_BROWSER_CHANNEL || 'msedge', headless: true });
    const context = await browser.newContext({ timezoneId: 'Asia/Bangkok' });
    const page = await context.newPage();
    const browserErrors = [];
    page.on('pageerror', error => browserErrors.push(error.message));
    page.on('dialog', dialog => dialog.dismiss());
    await page.goto('http://localhost:5175/login');
    await page.locator('input[type=email]').fill(email);
    await page.locator('input[type=password]').fill(process.env.MIVA_TEST_VENDOR_PASSWORD || 'admin123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.waitForURL('http://localhost:5175/dashboard');
    await page.goto('http://localhost:5175/vouchers');
    await page.getByRole('button', { name: 'Create Voucher', exact: true }).waitFor();

    async function fill(code, type = 'percentage', value = '20') {
      await page.getByRole('textbox', { name: 'Voucher Code', exact: true }).fill(code);
      await page.getByRole('textbox', { name: 'Voucher Name', exact: true }).fill(`${code} name`);
      await page.getByRole('combobox', { name: 'Discount Type', exact: true }).selectOption(type);
      await page.getByRole('spinbutton', { name: 'Discount Value', exact: true }).fill(value);
      await page.getByRole('spinbutton', { name: 'Quantity Limit', exact: true }).fill('10');
      await page.getByLabel('Start Date', { exact: true }).fill('2020-01-02');
      await page.getByLabel('End Date', { exact: true }).fill('2030-01-03');
    }
    async function save(method, status) {
      const pending = page.waitForResponse(response => response.request().method() === method && /^\/api\/vouchers(?:\/[^/]+)?$/.test(new URL(response.url()).pathname));
      await page.getByRole('button', { name: 'Save Voucher', exact: true }).click();
      const response = await pending;
      const body = await response.json();
      assert.equal(response.status(), status, JSON.stringify(body));
      return { payload: response.request().postDataJSON(), voucher: body.data ?? body };
    }
    const headers = { 'x-app-role': 'vendor' };
    const preview = (code, product) => context.request.post('http://localhost:5175/api/vouchers/preview', {
      headers, data: { codes: [code], items: [{ productVariantId: product.colors[0].variants[0].id, quantity: 2 }] },
    });
    await page.getByRole('button', { name: 'Create Voucher', exact: true }).click();
    const code = `${prefix}-P`;
    await fill(code);
    await page.getByRole('textbox', { name: 'Tìm sản phẩm áp dụng', exact: true }).fill(prefix);
    await page.getByRole('checkbox', { name: p1.name, exact: true }).waitFor();
    assert.equal(await page.getByRole('checkbox', { name: foreign.name, exact: true }).count(), 0);
    let submits = 0;
    const countSubmit = request => { if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/vouchers') submits++; };
    page.on('request', countSubmit);
    await page.getByRole('button', { name: 'Save Voucher', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Vui lòng chọn ít nhất một sản phẩm' }).waitFor();
    assert.equal(submits, 0);
    page.off('request', countSubmit);
    await page.getByRole('checkbox', { name: p1.name, exact: true }).check();
    const created = await save('POST', 201);
    assert.deepEqual(created.payload.productIds, [p1.id]);
    assert.equal(created.payload.startDate, '2020-01-01T17:00:00.000Z');
    assert.equal(created.payload.endDate, '2030-01-03T16:59:59.999Z');
    assert.equal(created.voucher.scope, 'vendor');
    assert.equal(created.voucher.vendorId, vendor.id);
    assert.equal(created.voucher.adminId, null);
    const previewResponse = await preview(code, p1);
    assert.equal(previewResponse.status(), 201, await previewResponse.text());
    const previewBody = await previewResponse.json();
    const calculation = previewBody.data ?? previewBody;
    assert.equal(Number(calculation.discountAmount), 40000);
    assert.equal(Number(calculation.totalAmount), 160000);
    assert.equal((await preview(code, p2)).status(), 400);
    assert.equal((await preview(code, foreign)).status(), 400);
    console.log('PASS: vendor selects only owned products, creates 20% voucher, and API discounts only selected products');

    await page.getByPlaceholder('Search by code or name...').fill(code);
    let row = page.locator('tr').filter({ hasText: code });
    await row.getByText('20%', { exact: true }).waitFor();
    await row.getByRole('button').nth(0).click();
    assert.equal(await page.getByLabel('Start Date', { exact: true }).inputValue(), '2020-01-02');
    assert.equal(await page.getByLabel('End Date', { exact: true }).inputValue(), '2030-01-03');
    await page.getByRole('checkbox', { name: p1.name, exact: true }).waitFor();
    assert.equal(await page.getByRole('checkbox', { name: p1.name, exact: true }).isChecked(), true);
    await page.getByRole('checkbox', { name: p1.name, exact: true }).uncheck();
    await page.getByRole('checkbox', { name: p2.name, exact: true }).check();
    await page.getByRole('textbox', { name: 'Voucher Name', exact: true }).fill(`${code} edited`);
    const edited = await save('PATCH', 200);
    assert.deepEqual(edited.payload.productIds, [p2.id]);
    assert.equal(edited.payload.startDate, created.payload.startDate);
    assert.equal(edited.payload.endDate, created.payload.endDate);
    for (const field of ['id', 'scope', 'adminId', 'vendorId', 'details', 'createdAt', 'usedQuantity']) assert.equal(field in edited.payload, false);
    assert.deepEqual((await prisma.voucherDetail.findMany({ where: { voucherId: created.voucher.id, productId: { not: null } } })).map(detail => detail.productId), [p2.id]);
    assert.equal((await preview(code, p1)).status(), 400);
    assert.equal((await preview(code, p2)).status(), 201);
    console.log('PASS: editing restores selected products, changes eligibility, preserves dates and excludes system fields');

    await page.getByRole('button', { name: 'Create Voucher', exact: true }).click();
    await fill(`${prefix}-F`, 'fixed_amount', '20000');
    await page.getByRole('checkbox', { name: p1.name, exact: true }).check();
    const fixed = await save('POST', 201);
    assert.equal(fixed.payload.discountType, 'fixed_amount');
    const fixedResponse = await preview(`${prefix}-F`, p1);
    assert.equal(fixedResponse.status(), 201);
    const fixedBody = await fixedResponse.json();
    assert.equal(Number((fixedBody.data ?? fixedBody).discountAmount), 20000);
    const badOwnership = await context.request.post('http://localhost:5175/api/vouchers', { headers, data: { ...fixed.payload, code: `${prefix}-FOREIGN`, productIds: [foreign.id] } });
    assert.equal(badOwnership.status(), 403);
    const missingProduct = { ...fixed.payload, code: `${prefix}-MISSING` };
    delete missingProduct.productIds;
    assert.equal((await context.request.post('http://localhost:5175/api/vouchers', { headers, data: missingProduct })).status(), 400);
    console.log('PASS: fixed amount voucher calculates correctly; API rejects missing products and products owned by another shop');

    await page.getByRole('button', { name: 'Create Voucher', exact: true }).click();
    await fill(code);
    await page.getByRole('checkbox', { name: p1.name, exact: true }).check();
    await save('POST', 409);
    await page.getByRole('alert').filter({ hasText: 'Mã voucher đã tồn tại' }).waitFor();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    const productRoute = '**/api/products/vendor/mine*';
    await page.route(productRoute, route => route.abort());
    await page.getByRole('button', { name: 'Create Voucher', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Không tải được sản phẩm' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Save Voucher', exact: true }).isDisabled(), true);
    await page.unroute(productRoute);
    await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
    await page.getByRole('checkbox', { name: p1.name, exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Save Voucher', exact: true }).isDisabled(), false);
    await fill(`${prefix}-DELETED`);
    await page.getByRole('checkbox', { name: p2.name, exact: true }).check();
    assert.equal((await context.request.delete(`http://localhost:5175/api/products/${p2.id}`, { headers })).status(), 200);
    const unavailable = page.getByRole('checkbox', { name: `${p2.name} (không còn khả dụng)`, exact: true });
    await unavailable.waitFor();
    await page.getByRole('button', { name: 'Save Voucher', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Có sản phẩm không còn khả dụng' }).waitFor();
    await unavailable.click();
    await unavailable.waitFor({ state: 'hidden' });
    await page.getByRole('checkbox', { name: p1.name, exact: true }).check();
    await save('POST', 201);
    assert.deepEqual(browserErrors, []);
    console.log('PASS: duplicate errors, product load retry and products removed during editing are handled; no browser JavaScript errors');
  } finally {
    await browser?.close();
    if (vendor) await prisma.voucher.deleteMany({ where: { vendorId: vendor.id, code: { startsWith: prefix }, details: { none: { orderId: { not: null } } } } });
    for (const product of products) await prisma.product.deleteMany({ where: { id: product.id, slug: product.slug, categoryId: category.id } });
    if (category) await prisma.category.deleteMany({ where: { id: category.id, products: { none: {} } } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
