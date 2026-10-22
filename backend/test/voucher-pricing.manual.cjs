// End-to-end voucher prices: node test/voucher-pricing.manual.cjs
require('dotenv').config();
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { chromium } = require('../../frontend/node_modules/playwright');

async function main() {
  const prisma = new PrismaClient();
  const prefix = `TEST-PRICES-${Date.now()}`;
  let browser, client, category, vendor, admin;
  const products = [];
  const base = 'http://localhost:5173';
  const code = `${prefix}-SHOP`;
  const adminCode = `${prefix}-ADMIN`;
  const expiry = new Date(Date.now() + 86400000).toISOString();
  const start = new Date(Date.now() - 86400000).toISOString();
  async function checked(response, status = 200) {
    const body = await response.json();
    assert.equal(response.status(), status, JSON.stringify(body));
    return body.data ?? body;
  }
  try {
    vendor = await prisma.vendor.findUniqueOrThrow({ where: { email: process.env.MIVA_TEST_VENDOR_EMAIL || 'vendor1@miva.vn' } });
    admin = await prisma.admin.findUniqueOrThrow({ where: { email: process.env.MIVA_TEST_ADMIN_EMAIL || 'admin1@miva.vn' } });
    const otherVendor = await prisma.vendor.findFirstOrThrow({ where: { id: { not: vendor.id }, deletedAt: null } });
    category = await prisma.category.create({ data: { name: prefix, slug: prefix.toLowerCase() } });
    for (const [suffix, vendorId] of [['P1', vendor.id], ['P2', vendor.id], ['P3', otherVendor.id]]) products.push(await prisma.product.create({ data: {
      name: `${prefix}-${suffix}`, slug: `${prefix}-${suffix}`.toLowerCase(), vendorId, categoryId: category.id, status: 'active',
      colors: { create: { color: 'Test', variants: { create: [{ size: 'M', price: 100000, stock: 20 }, { size: 'L', price: 120000, stock: 20 }] } } },
    }, include: { colors: { include: { variants: true } } } }));
    const [p1, p2, p3] = products;
    const variant = p1.colors[0].variants.find(value => value.size === 'M');
    const otherVariant = p3.colors[0].variants.find(value => value.size === 'M');
    client = await prisma.client.create({ data: { fullName: prefix, email: `${prefix.toLowerCase()}@example.com`, password: await bcrypt.hash('Test-prices-123!', 10),
      addresses: { create: { receiverName: prefix, phone: '0901234567', addressLine: '123 Test Street', isDefault: true } },
      cart: { create: { items: { create: { productVariantId: variant.id, quantity: 2 } } } },
    } });
    browser = await chromium.launch({ channel: process.env.MIVA_BROWSER_CHANNEL || 'msedge', headless: true });
    const vendorContext = await browser.newContext();
    const adminContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const clientContext = await browser.newContext();
    const errors = [];
    browser.on('page', page => page.on('pageerror', error => errors.push(error.message)));
    const shop = await vendorContext.newPage();
    shop.on('pageerror', error => errors.push(error.message));
    await shop.goto('http://localhost:5175/login');
    await shop.locator('input[type=email]').fill(vendor.email);
    await shop.locator('input[type=password]').fill(process.env.MIVA_TEST_VENDOR_PASSWORD || 'admin123');
    await shop.getByRole('button', { name: 'Sign In', exact: true }).click();
    await shop.waitForURL('http://localhost:5175/dashboard');
    await shop.goto('http://localhost:5175/vouchers');
    const detail = await guestContext.newPage();
    detail.on('pageerror', error => errors.push(error.message));
    await detail.goto(`${base}/products/${p1.id}`);
    await detail.getByRole('heading', { name: p1.name, exact: true }).waitFor();
    const listing = await guestContext.newPage();
    listing.on('pageerror', error => errors.push(error.message));
    await listing.goto(`${base}/products?q=${prefix}`);
    const card = listing.locator(`a[href="/products/${p1.id}"]`).filter({ has: listing.getByRole('heading', { name: p1.name, exact: true }) });
    await card.waitFor();
    let navigations = 0;
    detail.on('framenavigated', frame => { if (frame === detail.mainFrame()) navigations++; });
    await shop.getByRole('button', { name: 'Create Voucher', exact: true }).click();
    await shop.getByRole('textbox', { name: 'Voucher Code', exact: true }).fill(code);
    await shop.getByRole('textbox', { name: 'Voucher Name', exact: true }).fill(prefix);
    await shop.getByRole('spinbutton', { name: 'Discount Value', exact: true }).fill('20');
    await shop.getByRole('spinbutton', { name: 'Quantity Limit', exact: true }).fill('10');
    await shop.getByLabel('Start Date', { exact: true }).fill('2020-01-02');
    await shop.getByLabel('End Date', { exact: true }).fill('2030-01-03');
    await shop.getByRole('checkbox', { name: p1.name, exact: true }).check();
    await shop.getByRole('region', { name: 'Giá sau giảm dự kiến', exact: true }).getByText('80.000 ₫', { exact: true }).waitFor();
    const creation = shop.waitForResponse(response => response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/vouchers');
    await shop.getByRole('button', { name: 'Save Voucher', exact: true }).click();
    const shopVoucher = await checked(await creation, 201);
    const detailsToggle = detail.getByText('Xem các mã khác', { exact: true });
    if (await detailsToggle.count()) await detailsToggle.click();
    await detail.getByRole('region', { name: 'Giá sau giảm', exact: true }).getByText(new RegExp(code)).first().waitFor();
    assert.match(await detail.getByRole('region', { name: 'Giá sau giảm', exact: true }).innerText(), /80\.000/);
    await card.getByText(code, { exact: true }).waitFor();
    assert.match(await card.innerText(), /80\.000/);
    assert.equal(navigations, 0);
    console.log('PASS: vendor sees preview and guest product detail receives voucher price without reload');

    const publicOffers = await checked(await guestContext.request.get(`${base}/api/vouchers/catalog?productIds=${p1.id}`));
    assert.ok(publicOffers.some(value => value.code === code));
    assert.ok(publicOffers.every(value => !('usedQuantity' in value) && !('adminId' in value)));
    const forbiddenOffers = await checked(await guestContext.request.get(`${base}/api/vouchers/catalog?productIds=${p2.id}`));
    assert.equal(forbiddenOffers.some(value => value.code === code), false);

    await checked(await adminContext.request.post('http://localhost:5174/api/auth/sign-in', { headers: { 'x-app-role': 'admin' }, data: { email: admin.email, password: process.env.MIVA_TEST_ADMIN_PASSWORD || 'admin123' } }), 201);
    const platformVoucher = await checked(await adminContext.request.post('http://localhost:5174/api/vouchers', { headers: { 'x-app-role': 'admin' }, data: {
      code: adminCode, name: prefix, discountType: 'percentage', discountValue: 10, quantity: 10, perUserLimit: 1, startDate: start, endDate: expiry, status: 'active',
    } }), 201);
    const customer = await clientContext.newPage();
    customer.on('pageerror', error => errors.push(error.message));
    customer.on('dialog', dialog => dialog.accept());
    await customer.goto(`${base}/login`);
    await customer.locator('input[type=email]').fill(client.email);
    await customer.locator('input[type=password]').fill('Test-prices-123!');
    await customer.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await customer.waitForURL(`${base}/`);
    await customer.goto(`${base}/cart`);
    await customer.getByRole('button', { name: `Dùng mã ${code}`, exact: true }).click();
    await customer.getByTestId('cart-total').filter({ hasText: /160\.000/ }).waitFor();
    await customer.getByRole('button', { name: `Dùng mã ${adminCode}`, exact: true }).click();
    await customer.getByTestId('cart-total').filter({ hasText: /144\.000/ }).waitFor();
    await customer.getByRole('button', { name: `Tăng số lượng ${p1.name}`, exact: true }).click();
    await customer.getByTestId('cart-total').filter({ hasText: /216\.000/ }).waitFor();
    await customer.getByRole('button', { name: `Giảm số lượng ${p1.name}`, exact: true }).click();
    await customer.getByTestId('cart-total').filter({ hasText: /144\.000/ }).waitFor();
    await customer.getByRole('button', { name: 'Mua hàng (1)', exact: true }).click();
    await customer.waitForURL(`${base}/checkout`);
    await customer.getByTestId('checkout-total').filter({ hasText: /144\.000/ }).waitFor();
    console.log('PASS: cart and checkout preserve selected shop + platform codes; 200,000 -> 160,000 -> 144,000');

    const headers = { 'x-app-role': 'client' };
    const cart = await prisma.cart.findUniqueOrThrow({ where: { clientId: client.id }, include: { items: true } });
    const selection = [{ vendorId: vendor.id, codes: [code, adminCode] }];
    const previewPayload = { cartItemIds: cart.items.map(item => item.id), voucherCodes: [], voucherSelections: selection };
    const before = await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } });
    const invalidTotal = await clientContext.request.post(`${base}/api/orders/checkout`, { headers, data: { ...previewPayload,
      expectedTotalAmount: 1, receiverName: prefix, receiverPhone: '0901234567', shippingAddress: '123 Test Street', paymentMethod: 'cod' } });
    assert.equal(invalidTotal.status(), 409);
    assert.equal(await prisma.order.count({ where: { clientId: client.id } }), 0);
    assert.equal((await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock, before.stock);
    assert.equal((await prisma.voucher.findUniqueOrThrow({ where: { id: shopVoucher.id } })).usedQuantity, 0);
    const unknown = await clientContext.request.post(`${base}/api/orders/preview`, { headers, data: { ...previewPayload, voucherSelections: [{ vendorId: vendor.id, codes: [`${prefix}-UNKNOWN`] }] } });
    assert.equal(unknown.status(), 400);
    const legacyUnknown = await clientContext.request.post(`${base}/api/orders/checkout`, { headers, data: { voucherCodes: [`${prefix}-UNKNOWN`], receiverName: prefix,
      receiverPhone: '0901234567', shippingAddress: '123 Test Street', paymentMethod: 'cod' } });
    assert.equal(legacyUnknown.status(), 400);
    console.log('PASS: stale/tampered totals and unknown codes are rejected with no stock, voucher usage or order changes');

    const extraItem = await prisma.cartItem.create({ data: { cartId: cart.id, productVariantId: otherVariant.id, quantity: 1 } });
    const multiPayload = { ...previewPayload, cartItemIds: [...previewPayload.cartItemIds, extraItem.id], voucherSelections: [
      ...selection, { vendorId: otherVendor.id, codes: [adminCode] },
    ] };
    assert.equal((await clientContext.request.post(`${base}/api/orders/preview`, { headers, data: multiPayload })).status(), 400);
    const multiValid = await checked(await clientContext.request.post(`${base}/api/orders/preview`, { headers, data: { ...multiPayload,
      voucherSelections: [...selection, { vendorId: otherVendor.id, codes: [] }],
    } }), 201);
    assert.equal(Number(multiValid.totalAmount), 244000);
    await prisma.cartItem.delete({ where: { id: extraItem.id } });
    console.log('PASS: multiple shops have separate voucher choices; per-customer limits are checked across the entire cart');

    await checked(await vendorContext.request.patch(`http://localhost:5175/api/vouchers/${shopVoucher.id}`, { headers: { 'x-app-role': 'vendor' }, data: { status: 'inactive' } }));
    await customer.getByRole('alert').filter({ hasText: 'không còn hiệu lực' }).waitFor();
    assert.equal(await customer.getByRole('button', { name: 'Xác nhận đặt 1 đơn hàng', exact: true }).isDisabled(), true);
    await checked(await vendorContext.request.patch(`http://localhost:5175/api/vouchers/${shopVoucher.id}`, { headers: { 'x-app-role': 'vendor' }, data: { status: 'active' } }));
    await customer.getByTestId('checkout-total').filter({ hasText: /144\.000/ }).waitFor();
    const orderResponse = customer.waitForResponse(response => response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/orders/checkout');
    await customer.getByRole('button', { name: 'Xác nhận đặt 1 đơn hàng', exact: true }).click();
    await checked(await orderResponse, 201);
    await customer.waitForURL(`${base}/orders`);
    const order = await prisma.order.findFirstOrThrow({ where: { clientId: client.id }, include: { payment: true, vendorOrders: true, voucherDetails: true } });
    assert.equal(Number(order.subtotalAmount), 200000);
    assert.equal(Number(order.discountAmount), 56000);
    assert.equal(Number(order.totalAmount), 144000);
    assert.equal(Number(order.payment.amount), 144000);
    assert.equal(Number(order.vendorOrders[0].totalAmount), 144000);
    assert.equal(order.voucherDetails.length, 2);
    assert.equal((await prisma.voucher.findUniqueOrThrow({ where: { id: platformVoucher.id } })).usedQuantity, 1);
    assert.deepEqual(errors, []);
    console.log('PASS: realtime voucher disable/re-enable refreshes checkout; final order, payment and parcel match displayed discounted total');
  } finally {
    await browser?.close();
    if (client) await prisma.order.deleteMany({ where: { clientId: client.id } });
    await prisma.voucher.deleteMany({ where: { code: { startsWith: prefix }, name: prefix } });
    for (const product of products) await prisma.product.deleteMany({ where: { id: product.id, categoryId: category.id } });
    if (client) await prisma.client.deleteMany({ where: { id: client.id, email: client.email } });
    if (category) await prisma.category.deleteMany({ where: { id: category.id, products: { none: {} } } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
