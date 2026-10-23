// Direct HTTP checks for detail routes and disposable client write operations.
require('dotenv').config();
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { request } = require('../../frontend/node_modules/playwright');

async function main() {
  const prisma = new PrismaClient();
  const contexts = [];
  const results = [];
  let client;
  async function context(role, email, password) {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    contexts.push(api);
    const response = await api.post('/api/auth/sign-in', { headers: { 'x-app-role': role }, data: { email, password } });
    assert.equal(response.status(), 201, `${role} sign-in: ${await response.text()}`);
    return api;
  }
  async function call(api, role, method, path, data) {
    const response = await api[method](path, { headers: { 'x-app-role': role }, ...(data === undefined ? {} : { data }) });
    let body;
    try { body = await response.json(); } catch { body = null; }
    results.push({ role, method: method.toUpperCase(), path, status: response.status() });
    assert.ok(response.status() >= 200 && response.status() < 300, `${role} ${method.toUpperCase()} ${path}: ${response.status()} ${JSON.stringify(body).slice(0, 400)}`);
    return body?.data ?? body;
  }
  try {
    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { email: process.env.MIVA_TEST_VENDOR_EMAIL || 'vendor1@miva.vn' } });
    const admin = await prisma.admin.findUniqueOrThrow({ where: { email: process.env.MIVA_TEST_ADMIN_EMAIL || 'admin1@miva.vn' } });
    const employee = await prisma.employee.findUniqueOrThrow({ where: { email: process.env.MIVA_TEST_EMPLOYEE_EMAIL || 'employee1@miva.vn' } });
    const product = await prisma.product.findFirstOrThrow({ where: { status: 'active', deletedAt: null, colors: { some: { deletedAt: null, variants: { some: { stock: { gt: 2 }, deletedAt: null } } } } }, include: { category: true, colors: { where: { deletedAt: null }, include: { variants: { where: { stock: { gt: 2 }, deletedAt: null } } } } } });
    const color = product.colors.find(value => value.variants.length);
    const variant = color.variants[0];
    const vendorProduct = await prisma.product.findFirst({ where: { vendorId: vendor.id, deletedAt: null }, select: { id: true } });
    const voucher = await prisma.voucher.findFirst({ where: { vendorId: vendor.id }, select: { id: true } });
    const vendorSurvey = await prisma.survey.findFirst({ where: { vendorId: vendor.id, deletedAt: null }, select: { id: true } });
    const adminSurvey = await prisma.survey.findFirst({ where: { adminId: admin.id, deletedAt: null }, select: { id: true } });
    const order = await prisma.order.findFirst({ select: { id: true } });
    const shipment = await prisma.shipment.findFirst({ select: { id: true } });
    client = await prisma.client.create({ data: { email: `api-detail-${Date.now()}@example.com`, fullName: 'API Detail Test', password: await bcrypt.hash('Api-detail-123!', 10) } });
    const guest = await request.newContext({ baseURL: 'http://localhost:3000' });
    contexts.push(guest);
    const adminApi = await context('admin', admin.email, process.env.MIVA_TEST_ADMIN_PASSWORD || 'admin123');
    const vendorApi = await context('vendor', vendor.email, process.env.MIVA_TEST_VENDOR_PASSWORD || 'admin123');
    const employeeApi = await context('employee', employee.email, process.env.MIVA_TEST_EMPLOYEE_PASSWORD || 'admin123');
    const clientApi = await context('client', client.email, 'Api-detail-123!');

    const publicProduct = await call(guest, 'guest', 'get', `/api/products/${product.id}`);
    assert.equal(publicProduct.id, product.id);
    for (const path of [`/api/products/category/${product.category.slug}`, `/api/vendors/public/${vendor.id}`, `/api/reviews/product/${product.id}`, `/api/vouchers/catalog?productIds=${product.id}`]) await call(guest, 'guest', 'get', path);
    for (const path of [`/api/productColors/product/${product.id}`, `/api/productColors/${color.id}`, `/api/productVariant/productColor/${color.id}`]) await call(vendorApi, 'vendor', 'get', path);
    for (const path of [`/api/vendors/${vendor.id}`, `/api/clients/${client.id}`, `/api/admins/${admin.id}`, `/api/employees/${employee.id}`, `/api/employees/${employee.id}/salary-history`, `/api/users/${client.id}`, `/api/orders/${order.id}`, `/api/payments/order/${order.id}`, `/api/shipping/shipments/${shipment.id}`]) await call(adminApi, 'admin', 'get', path);
    if (adminSurvey) for (const path of [`/api/surveys/${adminSurvey.id}/manage`, `/api/surveys/${adminSurvey.id}/results`]) await call(adminApi, 'admin', 'get', path);
    if (vendorProduct) await call(vendorApi, 'vendor', 'get', `/api/products/${vendorProduct.id}`);
    if (voucher) await call(vendorApi, 'vendor', 'get', `/api/vouchers/${voucher.id}`);
    if (vendorSurvey) for (const path of [`/api/surveys/${vendorSurvey.id}/manage`, `/api/surveys/${vendorSurvey.id}/results`]) await call(vendorApi, 'vendor', 'get', path);
    await call(employeeApi, 'employee', 'get', `/api/employees/${employee.id}/salary-history`);

    const address = await call(clientApi, 'client', 'post', '/api/addresses', { receiverName: 'API Detail Test', phone: '0900000000', addressLine: '1 Test Street', isDefault: true });
    await call(clientApi, 'client', 'get', `/api/addresses/${address.id}`);
    const updatedAddress = await call(clientApi, 'client', 'patch', `/api/addresses/${address.id}`, { label: 'Updated' });
    assert.equal(updatedAddress.label, 'Updated');
    await call(clientApi, 'client', 'delete', `/api/addresses/${address.id}`);
    await call(clientApi, 'client', 'post', `/api/products/${product.id}/favorite`);
    assert.equal((await call(clientApi, 'client', 'get', `/api/products/${product.id}/favorite-status`)).favorited, true);
    await call(clientApi, 'client', 'delete', `/api/products/${product.id}/favorite`);
    const cart = await call(clientApi, 'client', 'post', '/api/cart/items', { productVariantId: variant.id, quantity: 1 });
    const cartItem = cart.items?.[0];
    assert.ok(cartItem?.id, `cart item missing: ${JSON.stringify(cart).slice(0, 400)}`);
    const updatedCart = await call(clientApi, 'client', 'patch', `/api/cart/items/${cartItem.id}`, { quantity: 2 });
    assert.equal(updatedCart.items.find(item => item.id === cartItem.id)?.quantity, 2);
    const emptyCart = await call(clientApi, 'client', 'delete', `/api/cart/items/${cartItem.id}`);
    assert.equal(emptyCart.items.length, 0);
    await call(clientApi, 'client', 'patch', '/api/users/profile', { fullName: 'API Detail Updated' });
    await call(clientApi, 'client', 'get', '/api/users/profile');
    await call(clientApi, 'client', 'patch', '/api/notifications/read-all');
  } finally {
    for (const api of contexts) await api.dispose();
    if (client) await prisma.client.deleteMany({ where: { id: client.id } });
    await prisma.$disconnect();
  }
  console.log(JSON.stringify({ calls: results.length, failures: results.filter(value => value.status >= 400), results }, null, 2));
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
