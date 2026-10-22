// Run against the local dev servers: node test/category-realtime.manual.cjs
require('dotenv').config();
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');
const { chromium } = require('../../frontend/node_modules/playwright');

async function main() {
  const prisma = new PrismaClient();
  let browser;
  let created;
  try {
    browser = await chromium.launch({ channel: process.env.MIVA_BROWSER_CHANNEL || 'msedge', headless: true });
    const customerContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const home = await customerContext.newPage();
    await home.goto('http://localhost:5173/');
    await home.getByRole('heading', { level: 3 }).first().waitFor();
    let navigations = 0;
    home.on('framenavigated', (frame) => { if (frame === home.mainFrame()) navigations++; });

    const admin = await adminContext.newPage();
    await admin.goto('http://localhost:5174/login');
    await admin.locator('input[type="email"]').fill(process.env.MIVA_TEST_ADMIN_EMAIL || 'admin1@miva.vn');
    await admin.locator('input[type="password"]').fill(process.env.MIVA_TEST_ADMIN_PASSWORD || 'admin123');
    await admin.getByRole('button', { name: 'Sign In to Dashboard' }).click();
    await admin.waitForURL('http://localhost:5174/dashboard');
    await admin.goto('http://localhost:5174/categories');

    const name = `TEST-REALTIME-CATEGORY-${Date.now()}`;
    await admin.getByRole('button', { name: 'Add Category' }).click();
    await admin.getByPlaceholder('VD: Sneakers').fill(name);
    const createResponse = admin.waitForResponse((response) =>
      response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/categories');
    await admin.getByRole('button', { name: 'Lưu danh mục' }).click();
    const response = await createResponse;
    assert.equal(response.status(), 201, 'Category creation failed');
    const body = await response.json();
    created = body.data ?? body;
    assert.ok(created.id, 'No created category ID');
    await home.getByRole('heading', { name, exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    console.log('PASS: admin creates category, customer homepage updates without reload');

    const originalRow = admin.locator('tr').filter({ has: admin.getByRole('cell', { name, exact: true }) });
    admin.once('dialog', (dialog) => dialog.accept());
    const firstDeleteResponse = admin.waitForResponse((response) =>
      response.request().method() === 'DELETE' && new URL(response.url()).pathname === `/api/categories/${created.id}`);
    await originalRow.getByRole('button').nth(1).click();
    assert.equal((await firstDeleteResponse).status(), 200);
    await home.getByRole('heading', { name, exact: true }).waitFor({ state: 'hidden', timeout: 10000 });

    await admin.getByRole('button', { name: 'Add Category' }).click();
    await admin.getByPlaceholder('VD: Sneakers').fill(name);
    const recreateResponse = admin.waitForResponse((response) =>
      response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/categories');
    await admin.getByRole('button', { name: 'Lưu danh mục' }).click();
    const restoredResponse = await recreateResponse;
    assert.equal(restoredResponse.status(), 201, 'Recreating the deleted category failed');
    const restoredBody = await restoredResponse.json();
    const restored = restoredBody.data ?? restoredBody;
    assert.equal(restored.id, created.id, 'The restored category must retain existing product relationships');
    assert.equal(restored.deletedAt, null);
    assert.equal(await prisma.category.count({ where: { slug: created.slug } }), 1);
    await home.getByRole('heading', { name, exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    console.log('PASS: recreate deleted category restores the same ID and updates homepage without reload');

    const duplicateResponse = await adminContext.request.post('http://localhost:5174/api/categories', {
      headers: { 'x-app-role': 'admin' },
      data: { name },
    });
    assert.equal(duplicateResponse.status(), 409, 'Active duplicate categories must still be rejected');
    console.log('PASS: an active category still rejects duplicate creation');

    const row = admin.locator('tr').filter({ has: admin.getByRole('cell', { name, exact: true }) });
    await row.getByRole('button').nth(0).click();
    const renamed = `${name}-RENAMED`;
    await admin.getByPlaceholder('VD: Sneakers').fill(renamed);
    const editResponse = admin.waitForResponse((response) =>
      response.request().method() === 'PATCH' && new URL(response.url()).pathname === `/api/categories/${created.id}`);
    await admin.getByRole('button', { name: 'Lưu danh mục' }).click();
    assert.equal((await editResponse).status(), 200);
    await home.getByRole('heading', { name: renamed, exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    console.log('PASS: admin renames category, customer homepage updates without reload');

    const renamedRow = admin.locator('tr').filter({ has: admin.getByRole('cell', { name: renamed, exact: true }) });
    admin.once('dialog', (dialog) => dialog.accept());
    const deleteResponse = admin.waitForResponse((response) =>
      response.request().method() === 'DELETE' && new URL(response.url()).pathname === `/api/categories/${created.id}`);
    await renamedRow.getByRole('button').nth(1).click();
    assert.equal((await deleteResponse).status(), 200);
    await home.getByRole('heading', { name: renamed, exact: true }).waitFor({ state: 'hidden', timeout: 10000 });
    assert.equal(await home.locator(`a[href="/products?category=${created.slug}"]`).count(), 0);
    assert.equal(navigations, 0, 'Customer page reloaded during the test');
    console.log('PASS: admin deletes category, homepage and category menu update without reload');
  } finally {
    await browser?.close();
    if (created?.id) {
      await prisma.category.deleteMany({ where: { id: created.id, slug: created.slug, products: { none: {} } } });
    }
    await prisma.$disconnect();
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
