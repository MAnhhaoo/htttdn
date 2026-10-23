// Read-only browser smoke check for the main routes in all four portals.
// Run while backend and the four Vite servers are available.
require('dotenv').config();
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { chromium } = require('../../frontend/node_modules/playwright');

const portals = [
  { role: 'admin', port: 5174, email: process.env.MIVA_TEST_ADMIN_EMAIL || 'admin1@miva.vn', password: process.env.MIVA_TEST_ADMIN_PASSWORD || 'admin123', routes: ['/dashboard', '/users', '/products', '/categories', '/orders', '/shipping', '/vouchers', '/reviews', '/vendors', '/vendor-registrations', '/employees', '/payroll', '/surveys', '/analytics', '/customer-analytics'] },
  { role: 'vendor', port: 5175, email: process.env.MIVA_TEST_VENDOR_EMAIL || 'vendor1@miva.vn', password: process.env.MIVA_TEST_VENDOR_PASSWORD || 'admin123', routes: ['/dashboard', '/analytics', '/products', '/orders', '/fulfillment', '/vouchers', '/reviews', '/surveys', '/settings'] },
  { role: 'employee', port: 5176, email: process.env.MIVA_TEST_EMPLOYEE_EMAIL || 'employee1@miva.vn', password: process.env.MIVA_TEST_EMPLOYEE_PASSWORD || 'admin123', routes: ['/orders', '/vendor-tracking', '/vendor-approvals', '/shipping', '/audit-history', '/permissions-faq', '/profile'] },
  { role: 'client', port: 5173, routes: ['/', '/products', '/cart', '/profile', '/orders', '/favorites', '/surveys', '/about', '/contact'] },
];

async function main() {
  const prisma = new PrismaClient();
  const browser = await chromium.launch({ channel: process.env.MIVA_BROWSER_CHANNEL || 'msedge', headless: true });
  let client;
  const results = [];
  try {
    client = await prisma.client.create({ data: {
      email: `portal-smoke-${Date.now()}@example.com`,
      fullName: 'Portal Smoke Test',
      password: await bcrypt.hash('Smoke-test-123!', 10),
    } });
    portals[3].email = client.email;
    portals[3].password = 'Smoke-test-123!';

    for (const portal of portals) {
      const base = `http://localhost:${portal.port}`;
      const context = await browser.newContext();
      const login = await context.request.post(`${base}/api/auth/sign-in`, {
        headers: { 'x-app-role': portal.role },
        data: { email: portal.email, password: portal.password },
      });
      assert.equal(login.status(), 201, `${portal.role} login: ${await login.text()}`);
      const page = await context.newPage();
      for (const route of portal.routes) {
        const errors = [];
        const onError = error => errors.push(`JS: ${error.message}`);
        const onResponse = response => {
          if (new URL(response.url()).pathname.startsWith('/api/') && response.status() >= 500)
            errors.push(`HTTP ${response.status()}: ${new URL(response.url()).pathname}`);
        };
        page.on('pageerror', onError);
        page.on('response', onResponse);
        try {
          const response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(1200);
          const text = await page.locator('body').innerText();
          if (response.status() !== 200) errors.push(`page HTTP ${response.status()}`);
          if (text.trim().length < 30) errors.push('blank/near-blank page');
          if (new URL(page.url()).pathname === '/login') errors.push('redirected to login');
        } catch (error) {
          errors.push(`navigation: ${error.message}`);
        } finally {
          page.off('pageerror', onError);
          page.off('response', onResponse);
        }
        results.push({ role: portal.role, route, errors: [...new Set(errors)] });
      }
      await context.close();
    }
  } finally {
    await browser.close();
    if (client) await prisma.client.deleteMany({ where: { id: client.id, email: client.email } });
    await prisma.$disconnect();
  }
  for (const result of results) console.log(`${result.errors.length ? 'FAIL' : 'PASS'} ${result.role} ${result.route}${result.errors.length ? `: ${result.errors.join('; ')}` : ''}`);
  console.log(`Routes checked: ${results.length}; failed: ${results.filter(result => result.errors.length).length}`);
  if (results.some(result => result.errors.length)) process.exitCode = 1;
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
