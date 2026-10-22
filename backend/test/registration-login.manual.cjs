// Run against backend, frontend and vendor dev servers:
// node test/registration-login.manual.cjs
require('dotenv').config();
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');
const { chromium } = require('../../frontend/node_modules/playwright');

async function main() {
  const prisma = new PrismaClient();
  const createdAccounts = [];
  let browser;
  try {
    browser = await chromium.launch({ channel: process.env.MIVA_BROWSER_CHANNEL || 'msedge', headless: true });
    for (const role of ['client', 'vendor']) {
      const context = await browser.newContext();
      const base = role === 'client' ? 'http://localhost:5173' : 'http://localhost:5175';
      const email = `test-registration-${role}-${Date.now()}@example.com`;
      const password = 'Test-password-123!';
      const headers = { 'x-app-role': role };
      const missingAccount = await context.request.post(`${base}/api/auth/sign-in`, { headers, data: { email, password } });
      assert.equal(missingAccount.status(), 401, 'An unregistered account must not log in');

      const page = await context.newPage();
      await page.goto(`${base}/register`);
      if (role === 'client') {
        await page.getByPlaceholder('Nguyễn Minh Anh').fill('Test Customer Registration');
        await page.getByPlaceholder('ban@email.com').fill(email);
        await page.getByPlaceholder('0912 345 678').fill('0912345678');
        await page.getByPlaceholder('Nhập địa chỉ của bạn').fill('123 Test Street');
        await page.getByPlaceholder('Nhập mật khẩu').fill(password);
        await page.locator('#terms').check();
      } else {
        await page.getByPlaceholder('Ví dụ: Nguyễn Văn An').fill('Test Vendor Registration');
        await page.getByPlaceholder('Ví dụ: 0912345678').fill('0912345678');
        await page.getByPlaceholder('vendor@store.com').fill(email);
        await page.getByPlaceholder('Tối thiểu 6 ký tự').fill(password);
        await page.getByRole('button', { name: 'Tiếp tục: Đăng ký kinh doanh' }).click();
        await page.getByPlaceholder('Ví dụ: Cửa Hàng Thời Trang An Phát').fill(`TEST Registration ${Date.now()}`);
        await page.getByPlaceholder('Ví dụ: 0101234567 hoặc 0312345678').fill('0101234567');
        await page.getByPlaceholder('Số nhà, tên đường, phường/xã, quận/huyện...').fill('123 Test Street');
        await page.locator('input[type="checkbox"]').check();
      }

      const signupPath = role === 'client' ? '/api/auth/sign-up' : '/api/auth/sign-up/vendor';
      const signupResponse = page.waitForResponse((response) =>
        response.request().method() === 'POST' && new URL(response.url()).pathname === signupPath);
      await page.getByRole('button', { name: role === 'client' ? 'Tạo tài khoản' : 'Hoàn tất Đăng ký kinh doanh', exact: true }).click();
      const signup = await signupResponse;
      assert.equal(signup.status(), 201, `${role} registration failed`);
      const body = await signup.json();
      const account = role === 'vendor' ? body.user : body;
      assert.ok(account.id, 'No account ID');
      createdAccounts.push({ role, id: account.id, email });
      await page.waitForURL(`${base}/login`);
      await page.getByRole('status').waitFor();
      assert.match(await page.getByRole('status').innerText(), /Đăng ký.*thành công/);
      assert.equal(await page.locator('input[type="email"]').inputValue(), email);
      assert.equal(await page.locator('input[type="password"]').inputValue(), '');
      assert.equal((await context.cookies()).filter((cookie) => /^(accessToken|refreshToken)/.test(cookie.name)).length, 0);
      assert.equal((await context.request.get(`${base}/api/users/profile`, { headers })).status(), 401);
      console.log(`PASS: ${role} registration redirects to login without a session`);

      await page.goto(`${base}/${role === 'client' ? 'orders' : 'dashboard'}`);
      await page.waitForURL(`${base}/login`);
      const wrongPassword = await context.request.post(`${base}/api/auth/sign-in`, { headers, data: { email, password: 'Wrong-password' } });
      assert.equal(wrongPassword.status(), 401);
      await page.locator('input[type="email"]').fill(email);
      await page.locator('input[type="password"]').fill(password);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(role === 'client' ? `${base}/` : `${base}/dashboard`);
      assert.ok((await context.cookies()).some((cookie) => cookie.name === `accessToken_${role}`));
      const profile = await context.request.get(`${base}/api/users/profile`, { headers });
      assert.equal(profile.status(), 200);
      const profileBody = await profile.json();
      assert.equal((profileBody.data ?? profileBody).email, email);
      console.log(`PASS: ${role} protected pages require login, correct credentials then grant access`);
      await context.close();
    }
  } finally {
    await browser?.close();
    for (const { role, id, email } of createdAccounts.reverse()) {
      const scope = role === 'client' ? { orders: { none: {} } } : { products: { none: {} }, vendorOrders: { none: {} } };
      await prisma[role].deleteMany({ where: { id, email, ...scope } });
    }
    await prisma.$disconnect();
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
