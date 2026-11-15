// Exercise API requests made while opening the main pages in all four portals.
// Run with the backend and Vite servers on ports 3000 and 5173-5176.
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
  let browser, client;
  const calls = [];
  const pages = [];
  try {
    client = await prisma.client.create({
      data: {
        email: `api-calls-${Date.now()}@example.com`,
        fullName: 'API Calls Test',
        password: await bcrypt.hash('Api-calls-123!', 10),
      },
    });
    portals[3].email = client.email;
    portals[3].password = 'Api-calls-123!';

    browser = await launchBrowser();
    for (const portal of portals) {
      const base = `http://localhost:${portal.port}`;
      const context = await newPortalContext(browser, `api-calls-${portal.role}`);
      await authenticatePortalContext(context, portal.role, portal.email, portal.password, base);

      const page = await context.newPage();
      for (const route of portal.routes) {
        const issues = [];
        const onResponse = (response) => {
          const url = new URL(response.url());
          if (!url.pathname.startsWith('/api/')) return;
          calls.push({
            role: portal.role,
            page: route,
            method: response.request().method(),
            path: url.pathname + url.search,
            status: response.status(),
          });
          if (response.status() >= 400) {
            issues.push(`${response.status()} ${response.request().method()} ${url.pathname}`);
          }
        };
        page.on('response', onResponse);
        page.on('pageerror', (error) => issues.push(`JS ${error.message}`));
        try {
          const response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(1200);
          if (response.status() !== 200) issues.push(`PAGE ${response.status()}`);
          if (new URL(page.url()).pathname === '/login') issues.push('redirected to login');
        } catch (error) {
          issues.push(`navigation ${error.message}`);
        }
        page.removeAllListeners('response');
        page.removeAllListeners('pageerror');
        pages.push({ role: portal.role, route, issues: [...new Set(issues)] });
      }
      await context.close();
    }
  } finally {
    if (browser) await browser.close();
    if (client) await cleanupClientTree(prisma, [client.id]);
    await prisma.$disconnect();
  }
  const unique = new Map();
  for (const call of calls) unique.set(`${call.role} ${call.method} ${call.path}`, call);
  console.log(
    JSON.stringify(
      {
        pages: pages.length,
        apiCalls: calls.length,
        uniqueCalls: unique.size,
        failures: pages.filter((page) => page.issues.length),
      },
      null,
      2,
    ),
  );
  if (pages.some((page) => page.issues.length)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack);
  process.exitCode = 1;
});
