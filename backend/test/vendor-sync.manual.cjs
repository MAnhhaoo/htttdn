// Local browser integration check: node test/vendor-sync.manual.cjs
// Uses disposable products/customer/orders; existing business data is not modified.
require('dotenv').config();
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { chromium } = require('../../frontend/node_modules/playwright');

async function main() {
  const prisma = new PrismaClient();
  const prefix = `TEST-VENDOR-SYNC-${Date.now()}`;
  const password = 'Test-sync-123!';
  let browser, client, category, product;
  const errors = [];
  const navigationCounts = new Map();
  async function checked(response, expected = 200) {
    assert.equal(response.status(), expected, `${new URL(response.url()).pathname}: ${await response.text()}`);
    const body = await response.json();
    return body.data ?? body;
  }
  async function pageAt(context, url) {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    return page;
  }
  function trackNavigation(page) {
    navigationCounts.set(page, 0);
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) navigationCounts.set(page, navigationCounts.get(page) + 1);
    });
  }
  async function waitText(page, value) {
    await page.getByText(value, { exact: true }).first().waitFor({ timeout: 15000 });
  }
  try {
    const vendorEmail = process.env.MIVA_TEST_VENDOR_EMAIL || 'vendor1@miva.vn';
    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { email: vendorEmail } });
    client = await prisma.client.create({ data: {
      email: `${prefix.toLowerCase()}@example.com`, fullName: prefix,
      password: await bcrypt.hash(password, 10),
    } });
    category = await prisma.category.create({ data: { name: prefix, slug: prefix.toLowerCase() } });
    browser = await chromium.launch({ channel: process.env.MIVA_BROWSER_CHANNEL || 'msedge', headless: true });
    const vendorContext = await browser.newContext();
    const adminContext = await browser.newContext();
    const clientContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const vendorHeaders = { 'x-app-role': 'vendor' };
    const adminHeaders = { 'x-app-role': 'admin' };
    const clientHeaders = { 'x-app-role': 'client' };
    const vbase = 'http://localhost:5175';
    const abase = 'http://localhost:5174';
    const cbase = 'http://localhost:5173';

    const fulfillment = await pageAt(vendorContext, `${vbase}/login`);
    await fulfillment.locator('input[type=email]').fill(vendorEmail);
    await fulfillment.locator('input[type=password]').fill(process.env.MIVA_TEST_VENDOR_PASSWORD || 'admin123');
    await fulfillment.getByRole('button', { name: 'Sign In', exact: true }).click();
    await fulfillment.waitForURL(`${vbase}/dashboard`);
    await fulfillment.goto(`${vbase}/fulfillment`);
    await fulfillment.getByRole('heading', { name: /Đóng Gói/ }).waitFor();

    const adminOrders = await pageAt(adminContext, `${abase}/login`);
    await adminOrders.locator('input[type=email]').fill(process.env.MIVA_TEST_ADMIN_EMAIL || 'admin1@miva.vn');
    await adminOrders.locator('input[type=password]').fill(process.env.MIVA_TEST_ADMIN_PASSWORD || 'admin123');
    await adminOrders.getByRole('button', { name: 'Sign In to Dashboard' }).click();
    await adminOrders.waitForURL(`${abase}/dashboard`);
    await adminOrders.goto(`${abase}/orders`);
    await adminOrders.getByRole('table').waitFor();

    const customerOrders = await pageAt(clientContext, `${cbase}/login`);
    await customerOrders.locator('input[type=email]').fill(client.email);
    await customerOrders.locator('input[type=password]').fill(password);
    await customerOrders.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await customerOrders.waitForURL(`${cbase}/`);
    await customerOrders.goto(`${cbase}/orders`);

    const vendorProducts = await pageAt(vendorContext, `${vbase}/products`);
    await vendorProducts.getByRole('table').waitFor();
    const renamedCategory = `${prefix}-CATEGORY`;
    trackNavigation(vendorProducts);
    await checked(await adminContext.request.patch(`${abase}/api/categories/${category.id}`, {
      headers: adminHeaders, data: { name: renamedCategory },
    }));
    await vendorProducts.getByRole('option', { name: renamedCategory, exact: true }).waitFor({ state: 'attached', timeout: 15000 });
    console.log('PASS: admin category changes reach vendor selects without reload');

    product = await checked(await vendorContext.request.post(`${vbase}/api/products`, {
      headers: vendorHeaders,
      data: { name: prefix, categoryId: category.id, status: 'active',
        colors: [{ color: 'Test', variants: [{ size: 'Test', stock: 5, price: 100000 }] }] },
    }), 201);
    assert.ok(product.id);
    await waitText(vendorProducts, prefix);
    const variant = await prisma.productVariant.findFirstOrThrow({ where: { productColor: { productId: product.id } } });
    const productDetail = await pageAt(guestContext, `${cbase}/products/${product.id}`);
    await waitText(productDetail, 'Còn 5 sản phẩm trong kho');
    trackNavigation(productDetail);
    await checked(await vendorContext.request.patch(`${vbase}/api/productVariant/${variant.id}`, {
      headers: vendorHeaders, data: { stock: 6, price: 123456 },
    }));
    await waitText(productDetail, 'Còn 6 sản phẩm trong kho');
    assert.match(await productDetail.locator('body').innerText(), /123[.,]456/);
    console.log('PASS: vendor product creation, stock and price changes reach open pages without reload');

    const vendorOrders = await pageAt(vendorContext, `${vbase}/orders`);
    const dashboard = await pageAt(vendorContext, `${vbase}/dashboard`);
    await dashboard.getByRole('heading', { level: 1 }).last().waitFor();
    const revenueBefore = Number((await dashboard.getByText('Revenue', { exact: true }).locator('../..').getByRole('heading', { level: 2 }).innerText()).replace(/\D/g, ''));
    const analytics = await pageAt(vendorContext, `${vbase}/analytics`);
    await analytics.getByRole('heading', { name: 'Store Analytics', exact: true }).waitFor();
    const analyticsRevenueBefore = Number((await analytics.getByText('Total Revenue', { exact: true }).locator('..').getByRole('heading', { level: 3 }).innerText()).replace(/\D/g, ''));
    for (const page of [vendorOrders, fulfillment, adminOrders, customerOrders, dashboard, analytics]) trackNavigation(page);
    const cartItems = { create: { productVariantId: variant.id, quantity: 2 } };
    await prisma.cart.upsert({ where: { clientId: client.id },
      create: { clientId: client.id, items: cartItems }, update: { items: cartItems } });
    const order = await checked(await clientContext.request.post(`${cbase}/api/orders/checkout`, {
      headers: clientHeaders, data: {
        receiverName: prefix, receiverPhone: '0901234567', shippingAddress: '123 Test Street',
        paymentMethod: 'cod', voucherCodes: [], notes: prefix,
      },
    }), 201);
    assert.ok(order.id);
    const parcel = await prisma.vendorOrder.findFirstOrThrow({ where: { orderId: order.id, vendorId: vendor.id } });
    const shipment = await prisma.shipment.findFirstOrThrow({ where: { vendorOrderId: parcel.id } });
    await waitText(vendorOrders, `#${order.orderCode}`);
    await waitText(fulfillment, parcel.vendorOrderCode);
    await waitText(adminOrders, `#${order.orderCode}`);
    await customerOrders.getByText(`MÃ ĐƠN #${order.orderCode}`, { exact: true }).waitFor({ timeout: 15000 });
    await waitText(productDetail, 'Còn 4 sản phẩm trong kho');
    console.log('PASS: checkout creates one parcel/shipment, updates vendor/admin/customer and decrements stock in realtime');

    await fulfillment.getByPlaceholder(/Tìm theo Mã kiện/).fill(order.orderCode);
    const pendingConfirmation = fulfillment.getByRole('button', { name: 'Xác nhận đơn hàng', exact: true });
    await pendingConfirmation.waitFor();
    assert.equal(await pendingConfirmation.isDisabled(), true);
    assert.equal((await vendorContext.request.patch(`${vbase}/api/orders/vendor-orders/${parcel.id}/status`, {
      headers: vendorHeaders, data: { status: 'processing' },
    })).status(), 400);

    await checked(await adminContext.request.patch(`${abase}/api/orders/${order.id}/status`, {
      headers: adminHeaders, data: { status: 'confirmed' },
    }));
    assert.equal((await prisma.vendorOrder.findUniqueOrThrow({ where: { id: parcel.id } })).status, 'confirmed');
    const start = fulfillment.getByRole('button', { name: 'Tiếp nhận & Bắt đầu đóng gói', exact: true });
    await start.waitFor();
    await fulfillment.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent.includes('Tiếp nhận & Bắt đầu đóng gói') && !button.disabled));
    assert.equal(await prisma.vendorOrder.count({ where: { orderId: order.id } }), 1);
    assert.equal(await prisma.shipment.count({ where: { orderId: order.id } }), 1);

    fulfillment.on('dialog', dialog => dialog.type() === 'confirm' ? dialog.accept() : dialog.dismiss());
    async function clickStatus(name, status, parentStatus, shipmentStatus) {
      const responsePromise = fulfillment.waitForResponse(response => response.request().method() === 'PATCH' && new URL(response.url()).pathname === `/api/orders/vendor-orders/${parcel.id}/status`);
      await fulfillment.getByRole('button', { name, exact: true }).click();
      await checked(await responsePromise);
      assert.equal((await prisma.vendorOrder.findUniqueOrThrow({ where: { id: parcel.id } })).status, status);
      assert.equal((await prisma.order.findUniqueOrThrow({ where: { id: order.id } })).status, parentStatus);
      if (shipmentStatus) assert.equal((await prisma.shipment.findUniqueOrThrow({ where: { id: shipment.id } })).status, shipmentStatus);
      const row = vendorOrders.locator('tr').filter({ hasText: order.orderCode });
      await row.getByText(parentStatus, { exact: true }).waitFor({ timeout: 15000 });
      const adminRow = adminOrders.locator('tr').filter({ hasText: order.orderCode });
      await adminRow.getByText(parentStatus.toUpperCase(), { exact: true }).waitFor({ timeout: 15000 });
    }
    await clickStatus('Tiếp nhận & Bắt đầu đóng gói', 'processing', 'processing');
    await waitText(customerOrders, 'Người bán đang chuẩn bị hàng');
    await clickStatus('Đã đóng gói xong - Sẵn sàng bàn giao', 'ready_for_pickup', 'processing', 'picking_up');
    await waitText(customerOrders, 'Người bán đang chuẩn bị hàng');
    await clickStatus('Xác nhận bưu tá đã lấy hàng', 'shipping', 'shipping', 'in_transit');
    await waitText(customerOrders, 'Đang giao hàng');
    console.log('PASS: confirmation -> packaging -> ready -> handover synchronizes parcel/order/shipment and open UIs');

    const dashboardRefresh = dashboard.waitForResponse(response => response.url().includes('/api/orders/vendor/mine') && response.status() === 200);
    await checked(await adminContext.request.patch(`${abase}/api/shipping/shipments/${shipment.id}/status`, {
      headers: adminHeaders, data: { status: 'delivered' },
    }));
    await dashboardRefresh;
    await waitText(fulfillment, 'Giao thành công');
    await waitText(customerOrders, 'Đã giao thành công');
    await vendorOrders.locator('tr').filter({ hasText: order.orderCode }).getByText('completed', { exact: true }).waitFor({ timeout: 15000 });
    assert.equal((await prisma.payment.findUniqueOrThrow({ where: { orderId: order.id } })).status, 'paid');
    await dashboard.waitForFunction(expected => {
      const title = [...document.querySelectorAll('h3')].find(node => node.textContent === 'Revenue');
      return Number((title?.parentElement.parentElement.querySelector('h2')?.textContent || '').replace(/\D/g, '')) === expected;
    }, revenueBefore + 2 * 123456);
    await analytics.waitForFunction(expected => {
      const title = [...document.querySelectorAll('p')].find(node => node.textContent === 'Total Revenue');
      return Number((title?.parentElement.querySelector('h3')?.textContent || '').replace(/\D/g, '')) === expected;
    }, analyticsRevenueBefore + 2 * 123456);
    console.log('PASS: delivery updates vendor fulfillment, lists, dashboard/analytics revenue, customer and COD payment');

    const foreignParcel = await prisma.vendorOrder.findFirst({ where: { vendorId: { not: vendor.id } }, select: { id: true } });
    if (foreignParcel) assert.equal((await vendorContext.request.patch(`${vbase}/api/orders/vendor-orders/${foreignParcel.id}/status`, {
      headers: vendorHeaders, data: { status: 'processing' },
    })).status(), 404);
    assert.equal((await clientContext.request.get(`${cbase}/api/orders/vendor/orders`, { headers: clientHeaders })).status(), 403);
    for (const count of navigationCounts.values()) assert.equal(count, 0, 'A tested page reloaded during synchronization');
    assert.deepEqual(errors, [], 'Unexpected browser JavaScript errors');
    console.log('PASS: role/ownership restrictions and zero page reloads; no browser JavaScript errors');
  } finally {
    await browser?.close();
    // Cleanup by exact disposable owner/IDs even if an assertion failed.
    if (client) await prisma.order.deleteMany({ where: { clientId: client.id, notes: prefix } });
    if (product?.id) await prisma.product.deleteMany({ where: { id: product.id, name: prefix } });
    if (category) await prisma.category.deleteMany({ where: { id: category.id, products: { none: {} } } });
    if (client) await prisma.client.deleteMany({ where: { id: client.id, email: client.email, orders: { none: {} } } });
    await prisma.$disconnect();
  }
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
