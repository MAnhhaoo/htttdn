// Tiện ích khởi tạo trình duyệt Playwright, đăng nhập 4 cổng & dọn dữ liệu kiểm thử dùng chung cho MIVA.
// Hỗ trợ 2 chế độ:
//   1. Headless nhanh (mặc định): headless: true
//   2. Visual Demo / Quay Video bảo vệ đồ án: MIVA_HEADED=1, MIVA_SLOW_MO=400, MIVA_RECORD_VIDEO=1
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('../../../frontend/node_modules/playwright');

function isTruthyEnv(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

function getBrowserLaunchOptions(overrides = {}) {
  const thesisDemo = isTruthyEnv(process.env.MIVA_THESIS_DEMO);
  const headed =
    isTruthyEnv(process.env.MIVA_HEADED) ||
    isTruthyEnv(process.env.MIVA_DEMO) ||
    thesisDemo;
  const rawSlowMo = process.env.MIVA_SLOW_MO;
  const slowMo =
    rawSlowMo !== undefined && rawSlowMo !== ''
      ? Math.max(0, Number(rawSlowMo) || 0)
      : thesisDemo
        ? 800
        : headed
          ? 350
          : 0;

  return {
    channel: process.env.MIVA_BROWSER_CHANNEL || 'msedge',
    headless: !headed,
    slowMo,
    ...overrides,
  };
}

async function launchBrowser(overrides = {}) {
  return chromium.launch(getBrowserLaunchOptions(overrides));
}

function getRecordingsDir(suiteName = 'general') {
  const raw = String(suiteName || 'general');
  const thesisDemo = isTruthyEnv(process.env.MIVA_THESIS_DEMO);
  const parts = raw
    .split(/[\\/]+/)
    .map((segment) => segment.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean);
  const relativeSegments = parts.length ? parts : ['general'];
  const dir = thesisDemo && relativeSegments[0] !== 'do-an'
    ? path.resolve(__dirname, '../../../test-recordings/do-an/videos', ...relativeSegments)
    : path.resolve(__dirname, '../../../test-recordings', ...relativeSegments);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function newPortalContext(browser, suiteName = 'general', options = {}) {
  const recordVideoEnabled =
    isTruthyEnv(process.env.MIVA_RECORD_VIDEO) ||
    isTruthyEnv(process.env.MIVA_DEMO) ||
    isTruthyEnv(process.env.MIVA_THESIS_DEMO);
  const contextOptions = {
    viewport: { width: 1440, height: 900 },
    ...options,
  };

  if (recordVideoEnabled && !contextOptions.recordVideo) {
    contextOptions.recordVideo = {
      dir: getRecordingsDir(suiteName),
      size: contextOptions.viewport || { width: 1440, height: 900 },
    };
  }

  return browser.newContext(contextOptions);
}

async function submitLoginForm(page, loginUrl, email, password, targetUrlMatcher) {
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
  const emailInput = page.locator('input[type="email"]');
  const passInput = page.locator('input[type="password"]');
  const submitBtn = page.locator('button[type="submit"]');
  await emailInput.waitFor({ state: 'visible', timeout: 15000 });

  for (let attempt = 1; attempt <= 2; attempt++) {
    await emailInput.fill(email);
    await passInput.fill(password);
    const signInWait = page
      .waitForResponse(
        (res) =>
          res.request().method() === 'POST' && res.url().includes('/api/auth/sign-in'),
        { timeout: 10000 },
      )
      .catch(() => null);
    await submitBtn.click();
    const res = await signInWait;
    if (res && res.status() < 400) {
      await page.waitForURL(targetUrlMatcher, { waitUntil: 'commit', timeout: 15000 });
      return;
    }
    if (attempt === 2) {
      const statusInfo = res ? `status=${res.status()}` : 'no /api/auth/sign-in request';
      throw new Error(`UI Login failed at ${loginUrl} for ${email} (${statusInfo})`);
    }
  }
}

async function loginAdminUI(page, email, password, baseUrl = 'http://localhost:5174') {
  const adminEmail = email || process.env.MIVA_TEST_ADMIN_EMAIL || 'admin1@miva.vn';
  const adminPass = password || process.env.MIVA_TEST_ADMIN_PASSWORD || 'admin123';
  const target = new RegExp(`^${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(analytics|dashboard)`);
  await submitLoginForm(page, `${baseUrl}/login`, adminEmail, adminPass, target);
}

async function loginVendorUI(page, email, password, baseUrl = 'http://localhost:5175') {
  const vendorEmail = email || process.env.MIVA_TEST_VENDOR_EMAIL || 'vendor1@miva.vn';
  const vendorPass = password || process.env.MIVA_TEST_VENDOR_PASSWORD || 'admin123';
  await submitLoginForm(page, `${baseUrl}/login`, vendorEmail, vendorPass, `${baseUrl}/dashboard`);
}

async function loginClientUI(page, email, password, baseUrl = 'http://localhost:5173') {
  await submitLoginForm(page, `${baseUrl}/login`, email, password, `${baseUrl}/`);
}

async function loginEmployeeUI(page, email, password, baseUrl = 'http://localhost:5176') {
  const empEmail = email || process.env.MIVA_TEST_EMPLOYEE_EMAIL;
  const empPass = password || process.env.MIVA_TEST_EMPLOYEE_PASSWORD || 'admin123';
  const target = new RegExp(`^${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(orders|shipping|profile)`);
  await submitLoginForm(page, `${baseUrl}/login`, empEmail, empPass, target);
}

async function authenticatePortalContext(context, role, email, password, baseUrl) {
  const res = await context.request.post(`${baseUrl}/api/auth/sign-in`, {
    headers: { 'x-app-role': role },
    data: { email, password },
  });
  assert.equal(res.status(), 201, `${role} sign-in failed (${res.status()}): ${await res.text()}`);
  const payload = await res.json();
  const data = payload?.data ?? payload;

  if (role === 'employee') {
    await context.addInitScript((session) => {
      if (session?.accessToken) localStorage.setItem('employee_token', session.accessToken);
      if (session?.employee || session?.user) {
        localStorage.setItem('employee_user', JSON.stringify(session.employee || session.user));
      }
    }, data);
  }

  return data;
}

/**
 * Dọn sạch các bản ghi kiểm thử tạm thời theo đúng thứ tự khóa ngoại (kể cả khi đã xóa mềm).
 */
async function cleanupProductTree(prisma, productIds = []) {
  const ids = [...new Set(productIds.filter(Boolean))];
  if (!ids.length) return;
  await prisma.productFavorite.deleteMany({ where: { productId: { in: ids } } });
  await prisma.voucherDetail.deleteMany({ where: { productId: { in: ids }, orderId: null } });
  await prisma.cartItem.deleteMany({
    where: { productVariant: { productColor: { productId: { in: ids } } } },
  });
  await prisma.review.deleteMany({ where: { productId: { in: ids } } });
  await prisma.product.deleteMany({ where: { id: { in: ids } } });
}

async function cleanupClientTree(prisma, clientIds = []) {
  const ids = [...new Set(clientIds.filter(Boolean))];
  if (!ids.length) return;
  await prisma.notification.deleteMany({ where: { clientId: { in: ids } } });
  await prisma.surveyResponse.deleteMany({ where: { clientId: { in: ids } } });
  await prisma.productFavorite.deleteMany({ where: { clientId: { in: ids } } });
  await prisma.order.deleteMany({ where: { clientId: { in: ids } } });
  await prisma.cartItem.deleteMany({ where: { cart: { clientId: { in: ids } } } });
  await prisma.cart.deleteMany({ where: { clientId: { in: ids } } });
  await prisma.clientAddress.deleteMany({ where: { clientId: { in: ids } } });
  await prisma.client.deleteMany({ where: { id: { in: ids } } });
}

module.exports = {
  isTruthyEnv,
  getBrowserLaunchOptions,
  launchBrowser,
  getRecordingsDir,
  newPortalContext,
  loginAdminUI,
  loginVendorUI,
  loginClientUI,
  loginEmployeeUI,
  authenticatePortalContext,
  cleanupProductTree,
  cleanupClientTree,
};
