// Run with backend/admin dev servers: node test/admin-voucher.manual.cjs
require('dotenv').config();
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');
const {
  launchBrowser,
  newPortalContext,
  loginAdminUI,
} = require('./helpers/browser-helper.cjs');

async function main() {
  const prisma = new PrismaClient();
  const prefix = `TEST-ADMIN-VOUCHER-${Date.now()}`;
  const email = process.env.MIVA_TEST_ADMIN_EMAIL || 'admin1@miva.vn';
  let browser, admin;
  try {
    admin = await prisma.admin.findUniqueOrThrow({ where: { email }, select: { id: true } });
    browser = await launchBrowser();
    const context = await newPortalContext(browser, 'admin-voucher', {
      timezoneId: 'Asia/Bangkok',
    });
    const page = await context.newPage();
    const browserErrors = [];
    page.on('pageerror', (error) => browserErrors.push(error.message));
    page.on('dialog', (dialog) => dialog.dismiss());

    await loginAdminUI(page, email);
    await page.goto('http://localhost:5174/catalog?tab=vouchers');
    await page.getByRole('button', { name: 'Thêm Voucher', exact: true }).waitFor();

    const codeInput = () => page.getByRole('textbox', { name: 'Voucher Code', exact: true });
    const nameInput = () => page.getByRole('textbox', { name: 'Voucher Name', exact: true });
    const typeSelect = () => page.getByRole('combobox', { name: 'Discount Type', exact: true });
    const discountInput = () => page.getByRole('spinbutton', { name: 'Discount Value', exact: true });
    const quantityInput = () => page.getByRole('spinbutton', { name: 'Quantity Limit', exact: true });
    const startDateInput = () => page.getByLabel('Start Date', { exact: true });
    const endDateInput = () => page.getByLabel('End Date', { exact: true });

    async function fill(code, type = 'percentage', value = '10') {
      await codeInput().fill(code);
      await nameInput().fill(`${code} name`);
      await typeSelect().selectOption(type);
      await discountInput().fill(value);
      await quantityInput().fill('10');
      await startDateInput().fill('2030-01-02');
      await endDateInput().fill('2030-01-03');
    }

    async function save(method, expectedStatus) {
      const pending = page.waitForResponse(
        (response) =>
          response.request().method() === method &&
          /^\/api\/vouchers(?:\/[^/]+)?$/.test(new URL(response.url()).pathname),
      );
      await page.getByRole('button', { name: 'Lưu Voucher', exact: true }).click();
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
    await page.getByPlaceholder('Tìm theo mã, tên hoặc danh mục...').fill(percentageCode);
    const row = page.locator('tr').filter({ hasText: percentageCode });
    await row.getByText('10%', { exact: true }).waitFor();
    assert.equal(created.voucher.scope, 'platform');
    assert.equal(created.voucher.adminId, admin.id);
    console.log(
      'PASS: admin creates a percentage voucher with numeric fields, correct platform ownership and local day boundaries',
    );

    await row.locator('button[title="Chỉnh sửa voucher"]').click();
    assert.equal(await startDateInput().inputValue(), '2030-01-02');
    assert.equal(await endDateInput().inputValue(), '2030-01-03');
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
    await endDateInput().fill('2030-01-02');
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
    page.on('request', (req) => {
      if (req.method() === 'POST' && new URL(req.url()).pathname === '/api/vouchers') submits++;
    });
    await fill(`${prefix}-INVALID`);
    await endDateInput().fill('2030-01-01');
    await page.getByRole('button', { name: 'Lưu Voucher', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: /Ngày kết thúc/ }).waitFor();
    await endDateInput().fill('2030-01-03');
    await discountInput().fill('101');
    await page.getByRole('button', { name: 'Lưu Voucher', exact: true }).click();
    assert.equal(await discountInput().evaluate((input) => input.validity.rangeOverflow), true);
    await discountInput().fill('10');
    await quantityInput().fill('0');
    await page.getByRole('button', { name: 'Lưu Voucher', exact: true }).click();
    assert.equal(await quantityInput().evaluate((input) => input.validity.rangeUnderflow), true);
    assert.equal(submits, 0, 'Invalid form data should be rejected before reaching the API');
    assert.equal(await prisma.voucher.count({ where: { code: `${prefix}-INVALID` } }), 0);
    console.log(
      'PASS: duplicate errors remain visible in the form; invalid dates, >100% and zero quantity do not create vouchers',
    );
    assert.deepEqual(browserErrors, []);
    await context.close();
  } finally {
    await browser?.close();
    if (admin) {
      await prisma.voucherDetail.deleteMany({
        where: { voucher: { adminId: admin.id, code: { startsWith: prefix } }, orderId: null },
      });
      await prisma.voucher.deleteMany({
        where: { adminId: admin.id, code: { startsWith: prefix }, details: { none: {} } },
      });
    }
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.stack);
  process.exitCode = 1;
});
