// Run with backend/admin dev servers: node test/admin-voucher.manual.cjs
require('dotenv').config();
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');
const { chromium } = require('../../frontend/node_modules/playwright');

async function main() {
  const prisma = new PrismaClient();
  const prefix = `TEST-ADMIN-VOUCHER-${Date.now()}`;
  const email = process.env.MIVA_TEST_ADMIN_EMAIL || 'admin1@miva.vn';
  let browser, admin;
  try {
    admin = await prisma.admin.findUniqueOrThrow({ where: { email }, select: { id: true } });
    browser = await chromium.launch({ channel: process.env.MIVA_BROWSER_CHANNEL || 'msedge', headless: true });
    const context = await browser.newContext({ timezoneId: 'Asia/Bangkok' });
    const page = await context.newPage();
    const browserErrors = [];
    page.on('pageerror', error => browserErrors.push(error.message));
    page.on('dialog', dialog => dialog.dismiss());
    await page.goto('http://localhost:5174/login');
    await page.locator('input[type=email]').fill(email);
    await page.locator('input[type=password]').fill(process.env.MIVA_TEST_ADMIN_PASSWORD || 'admin123');
    await page.getByRole('button', { name: 'Sign In to Dashboard' }).click();
    await page.waitForURL('http://localhost:5174/dashboard');
    await page.goto('http://localhost:5174/vouchers');
    await page.getByRole('button', { name: 'Thêm Voucher', exact: true }).waitFor();

    const codeInput = () => page.getByPlaceholder('e.g. SUMMER2024');
    const nameInput = () => page.getByPlaceholder('e.g. Summer Sale 20%');
    const dates = () => page.locator('input[type=date]');
    const numbers = () => page.locator('input[type=number]');
    async function fill(code, type = 'percentage', value = '10') {
      await codeInput().fill(code);
      await nameInput().fill(`${code} name`);
      await page.locator('select').filter({ has: page.locator('option[value=percentage]') }).selectOption(type);
      await numbers().nth(0).fill(value);
      await numbers().nth(1).fill('10');
      await dates().nth(0).fill('2030-01-02');
      await dates().nth(1).fill('2030-01-03');
    }
    async function save(method, expectedStatus) {
      const pending = page.waitForResponse(response => response.request().method() === method && /^\/api\/vouchers(?:\/[^/]+)?$/.test(new URL(response.url()).pathname));
      await page.getByRole('button', { name: 'Save Voucher', exact: true }).click();
      const response = await pending;
      const body = await response.json();
      assert.equal(response.status(), expectedStatus, JSON.stringify(body));
      return { payload: response.request().postDataJSON(), voucher: body.data ?? body };
    }
    const percentageCode = `${prefix}-P`;
    await page.getByRole('button', { name: 'Thêm Voucher', exact: true }).click();
    await fill(percentageCode);
    const created = await save('POST', 201);
    assert.equal(created.payload.discountType, 'percentage');
    assert.equal(typeof created.payload.quantity, 'number');
    assert.equal(created.payload.startDate, '2030-01-01T17:00:00.000Z');
    assert.equal(created.payload.endDate, '2030-01-03T16:59:59.999Z');
    await page.getByPlaceholder('Tìm kiếm theo mã hoặc tên...').fill(percentageCode);
    let row = page.locator('tr').filter({ hasText: percentageCode });
    await row.getByText('10%', { exact: true }).waitFor();
    assert.equal(created.voucher.scope, 'platform');
    assert.equal(created.voucher.adminId, admin.id);
    console.log('PASS: admin creates a percentage voucher with numeric fields, correct platform ownership and local day boundaries');

    await row.getByRole('button').nth(0).click();
    assert.equal(await dates().nth(0).inputValue(), '2030-01-02');
    assert.equal(await dates().nth(1).inputValue(), '2030-01-03');
    await nameInput().fill(`${percentageCode} edited`);
    const edited = await save('PATCH', 200);
    assert.equal(edited.payload.startDate, created.payload.startDate);
    assert.equal(edited.payload.endDate, created.payload.endDate);
    for (const field of ['id', 'scope', 'adminId', 'vendorId', 'details', 'createdAt', 'usedQuantity']) {
      assert.equal(field in edited.payload, false, `System field ${field} leaked into update`);
    }
    await row.getByText(`${percentageCode} edited`, { exact: true }).waitFor();
    console.log('PASS: edit keeps calendar dates and timestamps, and sends no system fields');

    await page.getByRole('button', { name: 'Thêm Voucher', exact: true }).click();
    await fill(`${prefix}-F`, 'fixed_amount', '20000');
    await dates().nth(1).fill('2030-01-02');
    const fixed = await save('POST', 201);
    assert.equal(fixed.payload.discountType, 'fixed_amount');
    assert.equal(fixed.payload.discountValue, 20000);
    assert.equal(fixed.payload.endDate, '2030-01-02T16:59:59.999Z');
    assert.equal(new Date(fixed.payload.endDate) - new Date(fixed.payload.startDate), 86400000 - 1);
    console.log('PASS: admin creates a fixed amount voucher valid for the entire selected single day');

    await page.getByRole('button', { name: 'Thêm Voucher', exact: true }).click();
    await fill(percentageCode);
    await save('POST', 409);
    await page.getByRole('alert').filter({ hasText: 'Mã voucher đã tồn tại' }).waitFor();
    await codeInput().waitFor();
    let submits = 0;
    page.on('request', request => { if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/vouchers') submits++; });
    await fill(`${prefix}-INVALID`);
    await dates().nth(1).fill('2030-01-01');
    await page.getByRole('button', { name: 'Save Voucher', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: /Ngày kết thúc/ }).waitFor();
    await dates().nth(1).fill('2030-01-03');
    await numbers().nth(0).fill('101');
    await page.getByRole('button', { name: 'Save Voucher', exact: true }).click();
    assert.equal(await numbers().nth(0).evaluate(input => input.validity.rangeOverflow), true);
    await numbers().nth(0).fill('10');
    await numbers().nth(1).fill('0');
    await page.getByRole('button', { name: 'Save Voucher', exact: true }).click();
    assert.equal(await numbers().nth(1).evaluate(input => input.validity.rangeUnderflow), true);
    assert.equal(submits, 0, 'Invalid form data should be rejected before reaching the API');
    assert.equal(await prisma.voucher.count({ where: { code: `${prefix}-INVALID` } }), 0);
    console.log('PASS: duplicate errors remain visible in the form; invalid dates, >100% and zero quantity do not create vouchers');
    assert.deepEqual(browserErrors, []);
  } finally {
    await browser?.close();
    if (admin) await prisma.voucher.deleteMany({ where: { adminId: admin.id, code: { startsWith: prefix }, details: { none: {} } } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
