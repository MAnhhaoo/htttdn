// Run against the local dev servers: node test/category-realtime.manual.cjs
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
  let browser;
  let created;
  let restored;
  try {
    browser = await launchBrowser();
    const customerContext = await newPortalContext(browser, 'category-realtime-customer', {
      viewport: { width: 1440, height: 960 },
    });
    const adminContext = await newPortalContext(browser, 'category-realtime-admin', {
      viewport: { width: 1440, height: 960 },
    });

    const home = await customerContext.newPage();
    await home.goto('http://localhost:5173/');
    await home.getByRole('heading', { level: 3 }).first().waitFor();
    let navigations = 0;
    home.on('framenavigated', (frame) => {
      if (frame === home.mainFrame()) navigations++;
    });

    const admin = await adminContext.newPage();
    await loginAdminUI(admin);
    await admin.goto('http://localhost:5174/catalog?tab=categories');

    const name = `TEST-REALTIME-CATEGORY-${Date.now()}`;
    await admin.getByRole('button', { name: 'Thêm danh mục' }).click();
    await admin.getByPlaceholder('VD: Sneakers').fill(name);
    const createResponse = admin.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/categories',
    );
    await admin.getByRole('button', { name: 'Lưu danh mục' }).click();
    const response = await createResponse;
    assert.equal(response.status(), 201, 'Category creation failed');
    const body = await response.json();
    created = body.data ?? body;
    assert.ok(created.id, 'No created category ID');
    await home.getByRole('heading', { name, exact: true }).waitFor({ state: 'visible', timeout: 12000 });
    console.log('PASS: admin creates category, customer homepage updates without reload');

    // Khóa mềm trên giao diện Admin -> ẩn ngay trên trang chủ khách hàng mà không F5
    await admin.getByPlaceholder('Tìm kiếm danh mục...').fill(name);
    const originalRow = admin.locator('tr').filter({ has: admin.getByRole('cell', { name, exact: true }) });
    admin.once('dialog', (dialog) => dialog.accept());
    const lockResponse = admin.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        new URL(res.url()).pathname === `/api/categories/${created.id}/toggle-lock`,
    );
    await originalRow.locator('button[title="Khóa danh mục"]').click();
    assert.equal((await lockResponse).status(), 200);
    await home.getByRole('heading', { name, exact: true }).waitFor({ state: 'hidden', timeout: 12000 });
    console.log('PASS: admin locks category on UI, homepage hides it in realtime while DB row remains');

    // Mở khóa lại trên giao diện Admin -> hiện lại ngay trên trang chủ khách hàng
    admin.once('dialog', (dialog) => dialog.accept());
    const unlockResponse = admin.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        new URL(res.url()).pathname === `/api/categories/${created.id}/toggle-lock`,
    );
    await originalRow.locator('button[title="Mở khóa danh mục"]').click();
    assert.equal((await unlockResponse).status(), 200);
    await home.getByRole('heading', { name, exact: true }).waitFor({ state: 'visible', timeout: 12000 });

    const duplicateResponse = await adminContext.request.post('http://localhost:5174/api/categories', {
      headers: { 'x-app-role': 'admin' },
      data: { name },
    });
    assert.equal(duplicateResponse.status(), 409, 'Active duplicate categories must still be rejected');
    console.log('PASS: an active category still rejects duplicate creation');

    // Đổi tên danh mục -> đồng bộ realtime sang trang chủ
    const row = admin.locator('tr').filter({ has: admin.getByRole('cell', { name, exact: true }) });
    await row.locator('button[title="Chỉnh sửa tên danh mục"]').click();
    const renamed = `${name}-RENAMED`;
    await admin.getByPlaceholder('VD: Sneakers').fill(renamed);
    const editResponse = admin.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        new URL(res.url()).pathname === `/api/categories/${created.id}`,
    );
    await admin.getByRole('button', { name: 'Lưu danh mục' }).click();
    assert.equal((await editResponse).status(), 200);
    await home.getByRole('heading', { name: renamed, exact: true }).waitFor({ state: 'visible', timeout: 12000 });
    console.log('PASS: admin renames category, customer homepage updates without reload');

    // Xóa mềm qua API -> ẩn khỏi trang chủ, giữ bản ghi lịch sử trong DB và giải phóng slug để tạo lại cùng tên
    const softDelRes = await adminContext.request.delete(
      `http://localhost:5174/api/categories/${created.id}`,
      { headers: { 'x-app-role': 'admin' } },
    );
    assert.equal(softDelRes.status(), 200);
    await home.getByRole('heading', { name: renamed, exact: true }).waitFor({ state: 'hidden', timeout: 12000 });
    const dbAfterSoftDelete = await prisma.category.findUniqueOrThrow({ where: { id: created.id } });
    assert.ok(dbAfterSoftDelete.deletedAt, 'Category must be soft-deleted with deletedAt populated');

    const recreateRes = await adminContext.request.post('http://localhost:5174/api/categories', {
      headers: { 'x-app-role': 'admin' },
      data: { name: renamed },
    });
    assert.equal(recreateRes.status(), 201);
    const restoredBody = await recreateRes.json();
    restored = restoredBody.data ?? restoredBody;
    assert.notEqual(
      restored.id,
      created.id,
      'Recreating soft-deleted category creates a new active category while preserving soft-deleted row',
    );
    assert.equal(restored.deletedAt, null);
    const oldStillInDb = await prisma.category.findUniqueOrThrow({ where: { id: created.id } });
    assert.ok(oldStillInDb.deletedAt, 'Original soft-deleted category must still exist in DB');
    await home.getByRole('heading', { name: renamed, exact: true }).waitFor({ state: 'visible', timeout: 12000 });

    // Xóa mềm lần cuối để kiểm tra menu lọc cũng ẩn sạch mà không reload trang
    assert.equal(
      (
        await adminContext.request.delete(`http://localhost:5174/api/categories/${restored.id}`, {
          headers: { 'x-app-role': 'admin' },
        })
      ).status(),
      200,
    );
    await home.getByRole('heading', { name: renamed, exact: true }).waitFor({ state: 'hidden', timeout: 12000 });
    assert.equal(await home.locator(`a[href="/products?category=${restored.slug}"]`).count(), 0);
    assert.equal(navigations, 0, 'Customer page reloaded during the test');
    console.log('PASS: soft-delete preserves historical row, releases slug for recreate, and updates homepage with zero reloads');

    await customerContext.close();
    await adminContext.close();
  } finally {
    await browser?.close();
    const catIds = [created?.id, restored?.id].filter(Boolean);
    if (catIds.length) {
      await prisma.category.deleteMany({
        where: { id: { in: catIds }, products: { none: {} } },
      });
    }
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
