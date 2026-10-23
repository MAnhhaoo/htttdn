// Browser regression: split checkout must process every demo payment.
require('dotenv').config();
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { chromium } = require('../../frontend/node_modules/playwright');

async function main() {
  const prisma = new PrismaClient();
  const marker = `MULTI-PAY-${Date.now()}`;
  let browser, client, category;
  const products = [];
  const errors = [];
  try {
    const vendors = await prisma.vendor.findMany({ where: { deletedAt: null, status: 'active', approvalStatus: 'approved' }, take: 2, select: { id: true } });
    assert.equal(vendors.length, 2, 'Need two approved vendors');
    category = await prisma.category.create({ data: { name: marker, slug: marker.toLowerCase() } });
    for (let i = 0; i < 2; i++) {
      products.push(await prisma.product.create({ data: {
        categoryId: category.id, vendorId: vendors[i].id, name: `${marker}-${i}`,
        slug: `${marker}-${i}`.toLowerCase(), status: 'active',
        colors: { create: { color: 'Test', variants: { create: { size: 'M', stock: 3, price: 100000 } } } },
      }, include: { colors: { include: { variants: true } } } }));
    }
    client = await prisma.client.create({ data: { email: `${marker.toLowerCase()}@example.com`, fullName: marker, password: await bcrypt.hash('Multi-pay-123!', 10) } });
    await prisma.clientAddress.create({ data: { clientId: client.id, receiverName: marker, phone: '0900000000', addressLine: '1 Test Street', isDefault: true } });
    await prisma.cart.create({ data: { clientId: client.id, items: { create: products.map(product => ({ productVariantId: product.colors[0].variants[0].id, quantity: 1 })) } } });
    browser = await chromium.launch({ channel: process.env.MIVA_BROWSER_CHANNEL || 'msedge', headless: true });
    const page = await browser.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.accept());
    await page.goto('http://localhost:5173/login');
    await page.locator('input[type=email]').fill(client.email);
    await page.locator('input[type=password]').fill('Multi-pay-123!');
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await page.waitForURL('http://localhost:5173/');
    await page.goto('http://localhost:5173/checkout');
    await page.locator('input[name=payment][value=credit_card]').check();
    const submit = page.getByRole('button', { name: 'Xác nhận đặt 2 đơn hàng', exact: true });
    await submit.waitFor();
    await submit.click();
    await page.waitForURL(url => url.pathname.startsWith('/payment-demo/') && url.searchParams.has('remaining'));
    const firstId = new URL(page.url()).pathname.split('/').pop();
    const secondId = new URL(page.url()).searchParams.get('remaining');
    assert.notEqual(firstId, secondId);
    await page.getByText('Còn 1 đơn hàng cần thanh toán sau đơn này.').waitFor();
    await page.getByText('Thanh toán Thẻ tín dụng', { exact: false }).waitFor();

    await page.getByRole('button', { name: 'Mô phỏng Thanh toán THẤT BẠI' }).click();
    await page.waitForURL(`http://localhost:5173/payment-demo/${secondId}`);
    assert.equal((await prisma.payment.findUniqueOrThrow({ where: { orderId: firstId } })).status, 'failed');
    await page.reload();
    await page.getByRole('button', { name: 'Mô phỏng Thanh toán THÀNH CÔNG' }).click();
    await page.waitForURL('http://localhost:5173/orders');
    assert.equal((await prisma.payment.findUniqueOrThrow({ where: { orderId: secondId } })).status, 'paid');

    await page.goto(`http://localhost:5173/payment-demo/${firstId}`);
    await page.getByRole('button', { name: 'Mô phỏng Thanh toán THÀNH CÔNG' }).click();
    await page.waitForURL('http://localhost:5173/orders');
    assert.equal((await prisma.payment.findUniqueOrThrow({ where: { orderId: firstId } })).status, 'paid');
    assert.deepEqual(errors, []);
    console.log('PASS: two-shop checkout queues both payments, failure does not hide next order, reload and retry succeed');
  } finally {
    await browser?.close();
    if (client) await prisma.order.deleteMany({ where: { clientId: client.id } });
    for (const product of products) await prisma.product.deleteMany({ where: { id: product.id, name: product.name } });
    if (client) await prisma.client.deleteMany({ where: { id: client.id, email: client.email } });
    if (category) await prisma.category.deleteMany({ where: { id: category.id, products: { none: {} } } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
