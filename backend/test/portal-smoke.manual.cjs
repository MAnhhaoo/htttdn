// Read-only browser smoke check for the main routes in all four portals.
// Run while backend and the four Vite servers are available:
//   node test/portal-smoke.manual.cjs
require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const {
  launchBrowser,
  newPortalContext,
  authenticatePortalContext,
  cleanupClientTree,
} = require('./helpers/browser-helper.cjs');

const portals = [
  {
    role: 'admin',
    port: 5174,
    email: process.env.MIVA_TEST_ADMIN_EMAIL || 'admin1@miva.vn',
    password: process.env.MIVA_TEST_ADMIN_PASSWORD || 'admin123',
    routes: [
      '/analytics',
      '/analytics?tab=customers',
      '/vendors',
      '/vendors?tab=registrations',
      '/orders',
      '/orders?tab=shipping',
      '/catalog?tab=categories',
      '/catalog?tab=vouchers',
      '/employees',
      '/employees?tab=payroll',
      '/users',
      '/surveys',
      '/surveys?tab=reviews',
      '/dashboard',
    ],
  },
  {
    role: 'vendor',
    port: 5175,
    email: process.env.MIVA_TEST_VENDOR_EMAIL || 'vendor1@miva.vn',
    password: process.env.MIVA_TEST_VENDOR_PASSWORD || 'admin123',
    routes: [
      '/dashboard',
      '/orders',
      '/products',
      '/products?tab=reviews',
      '/vouchers',
      '/surveys',
      '/settings',
      '/analytics',
      '/fulfillment',
    ],
  },
  {
    role: 'employee',
    port: 5176,
    email: process.env.MIVA_TEST_EMPLOYEE_EMAIL || 'employee1@miva.vn',
    password: process.env.MIVA_TEST_EMPLOYEE_PASSWORD || 'admin123',
    routes: [
      '/orders',
      '/vendor-tracking',
      '/shipping',
      '/audit-history',
      '/permissions-faq',
      '/profile',
    ],
  },
  {
    role: 'client',
    port: 5173,
    routes: [
      '/',
      '/products',
      '/cart',
      '/profile',
      '/orders',
      '/favorites',
      '/surveys',
      '/about',
      '/contact',
    ],
  },
];

async function main() {
  const prisma = new PrismaClient();
  const browser = await launchBrowser();
  let client;
  const results = [];
  try {
    client = await prisma.client.create({
      data: {
        email: `portal-smoke-${Date.now()}@example.com`,
        fullName: 'Portal Smoke Test',
        password: await bcrypt.hash('Smoke-test-123!', 10),
      },
    });
    portals[3].email = client.email;
    portals[3].password = 'Smoke-test-123!';

    for (const portal of portals) {
      const base = `http://localhost:${portal.port}`;
      const context = await newPortalContext(browser, `portal-smoke-${portal.role}`);
      await authenticatePortalContext(context, portal.role, portal.email, portal.password, base);

      const page = await context.newPage();
      for (const route of portal.routes) {
        const errors = [];
        const onError = (error) => errors.push(`JS: ${error.message}`);
        const onResponse = (response) => {
          if (new URL(response.url()).pathname.startsWith('/api/') && response.status() >= 500) {
            errors.push(`HTTP ${response.status()}: ${new URL(response.url()).pathname}`);
          }
        };
        page.on('pageerror', onError);
        page.on('response', onResponse);
        try {
          const response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(1100);
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
    if (client) await cleanupClientTree(prisma, [client.id]);
    await prisma.$disconnect();
  }
  for (const result of results) {
    console.log(
      `${result.errors.length ? 'FAIL' : 'PASS'} ${result.role} ${result.route}${
        result.errors.length ? `: ${result.errors.join('; ')}` : ''
      }`,
    );
  }
  console.log(
    `Routes checked: ${results.length}; failed: ${results.filter((r) => r.errors.length).length}`,
  );
  if (results.some((r) => r.errors.length)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack);
  process.exitCode = 1;
});
