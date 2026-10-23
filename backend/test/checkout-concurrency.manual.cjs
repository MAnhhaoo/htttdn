// Concurrent checkout regression: stock cannot go negative or produce duplicate orders.
require('dotenv').config();
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { request } = require('../../frontend/node_modules/playwright');

async function main() {
  const prisma = new PrismaClient();
  const marker = `CONCURRENT-${Date.now()}`;
  const clients = [];
  const contexts = [];
  let category, product;
  try {
    const vendor = await prisma.vendor.findFirstOrThrow({ where: { approvalStatus: 'approved', status: 'active', deletedAt: null }, select: { id: true } });
    category = await prisma.category.create({ data: { name: marker, slug: marker.toLowerCase() } });
    product = await prisma.product.create({ data: {
      categoryId: category.id, vendorId: vendor.id, name: marker, slug: marker.toLowerCase(), status: 'active',
      colors: { create: { color: 'Test', variants: { create: { size: 'M', stock: 1, price: 100000 } } } },
    }, include: { colors: { include: { variants: true } } } });
    const variantId = product.colors[0].variants[0].id;
    const password = 'Concurrent-123!';
    async function newClient(suffix) {
      const client = await prisma.client.create({ data: { email: `${marker}-${suffix}@example.com`.toLowerCase(), fullName: marker, password: await bcrypt.hash(password, 10) } });
      clients.push(client);
      await prisma.cart.create({ data: { clientId: client.id, items: { create: { productVariantId: variantId, quantity: 1 } } } });
      const api = await request.newContext({ baseURL: 'http://localhost:3000' });
      contexts.push(api);
      const login = await api.post('/api/auth/sign-in', { headers: { 'x-app-role': 'client' }, data: { email: client.email, password } });
      assert.equal(login.status(), 201);
      return { client, api };
    }
    const first = await newClient('a');
    const second = await newClient('b');
    const body = { receiverName: marker, receiverPhone: '0900000000', shippingAddress: '1 Test Street', paymentMethod: 'cod', voucherCodes: [], notes: marker };
    const response = await Promise.all([first, second].map(({ api }) => api.post('/api/orders/checkout', { headers: { 'x-app-role': 'client' }, data: body })));
    const statuses = response.map(value => value.status()).sort();
    assert.equal(statuses.filter(status => status === 201).length, 1, `parallel stock-one checkout: ${statuses}`);
    assert.ok(statuses.every(status => [201, 400, 409].includes(status)), `parallel stock-one checkout: ${statuses}`);
    assert.equal((await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } })).stock, 0);
    assert.equal(await prisma.order.count({ where: { clientId: { in: clients.map(value => value.id) }, notes: marker } }), 1);

    // Restore only this disposable product, then race two clicks from the same cart.
    await prisma.productVariant.update({ where: { id: variantId }, data: { stock: 2 } });
    const winner = response[0].status() === 201 ? first : second;
    const loser = winner === first ? second : first;
    const duplicate = await Promise.all([1, 2].map(() => loser.api.post('/api/orders/checkout', { headers: { 'x-app-role': 'client' }, data: body })));
    assert.equal(duplicate.filter(value => value.status() === 201).length, 1, `same-cart duplicate: ${duplicate.map(value => value.status())}`);
    assert.ok(duplicate.every(value => [201, 400, 409].includes(value.status())));
    assert.equal(await prisma.order.count({ where: { clientId: loser.client.id, notes: marker } }), 1);
    assert.equal((await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } })).stock, 1);
    console.log('PASS: parallel buyers cannot oversell; duplicate checkout from one cart creates one order');
  } finally {
    for (const context of contexts) await context.dispose();
    if (clients.length) await prisma.order.deleteMany({ where: { clientId: { in: clients.map(value => value.id) }, notes: marker } });
    if (product) await prisma.product.deleteMany({ where: { id: product.id, name: marker } });
    if (clients.length) await prisma.client.deleteMany({ where: { id: { in: clients.map(value => value.id) }, fullName: marker } });
    if (category) await prisma.category.deleteMany({ where: { id: category.id, products: { none: {} } } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
