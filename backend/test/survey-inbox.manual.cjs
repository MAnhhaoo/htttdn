// HTTP regression for checkout survey delivery and response ownership.
require('dotenv').config();
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { request } = require('../../frontend/node_modules/playwright');

async function main() {
  const prisma = new PrismaClient();
  const marker = `SURVEY-QA-${Date.now()}`;
  const contexts = [];
  const clients = [];
  let survey, product, category;
  try {
    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { email: process.env.MIVA_TEST_VENDOR_EMAIL || 'vendor1@miva.vn' }, select: { id: true, email: true } });
    const vendorApi = await request.newContext({ baseURL: 'http://localhost:3000' });
    contexts.push(vendorApi);
    const vendorLogin = await vendorApi.post('/api/auth/sign-in', { headers: { 'x-app-role': 'vendor' }, data: { email: vendor.email, password: process.env.MIVA_TEST_VENDOR_PASSWORD || 'admin123' } });
    assert.equal(vendorLogin.status(), 201, `vendor login: ${await vendorLogin.text()}`);
    async function check(api, method, path, role, data, expected) {
      const response = await api[method](path, { headers: { 'x-app-role': role }, ...(data === undefined ? {} : { data }) });
      assert.equal(response.status(), expected, `${method.toUpperCase()} ${path}: ${await response.text()}`);
      return response.json();
    }
    const created = await check(vendorApi, 'post', '/api/surveys', 'vendor', {
      title: marker, audienceType: 'vendor_buyers', triggerType: 'after_checkout',
      questions: [{ question: 'Test answer?', type: 'text', required: true, position: 0, options: [] }],
    }, 201);
    survey = created;
    await check(vendorApi, 'patch', `/api/surveys/${survey.id}/status`, 'vendor', { status: 'active' }, 200);
    category = await prisma.category.create({ data: { name: marker, slug: marker.toLowerCase() } });
    product = await prisma.product.create({ data: {
      categoryId: category.id, vendorId: vendor.id, name: marker, slug: marker.toLowerCase(), status: 'active',
      colors: { create: { color: 'Test', variants: { create: { size: 'M', stock: 3, price: 100000 } } } },
    }, include: { colors: { include: { variants: true } } } });
    const password = 'Survey-QA-123!';
    async function makeClient(suffix, withCart) {
      const client = await prisma.client.create({ data: { email: `${marker}-${suffix}@example.com`.toLowerCase(), fullName: marker, password: await bcrypt.hash(password, 10) } });
      clients.push(client);
      if (withCart) await prisma.cart.create({ data: { clientId: client.id, items: { create: { productVariantId: product.colors[0].variants[0].id, quantity: 1 } } } });
      const api = await request.newContext({ baseURL: 'http://localhost:3000' });
      contexts.push(api);
      await check(api, 'post', '/api/auth/sign-in', 'client', { email: client.email, password }, 201);
      return api;
    }
    const owner = await makeClient('owner', true);
    const other = await makeClient('other', false);
    const checkout = await check(owner, 'post', '/api/orders/checkout', 'client', {
      receiverName: marker, receiverPhone: '0900000000', shippingAddress: '1 Test Street',
      paymentMethod: 'cod', voucherCodes: [], notes: marker,
    }, 201);
    const orderId = checkout.orders?.[0]?.id || checkout.id;
    assert.ok(orderId, JSON.stringify(checkout));
    const response = await prisma.surveyResponse.findFirstOrThrow({ where: { surveyId: survey.id, orderId, clientId: clients[0].id } });
    const path = `/api/surveys/inbox/${response.id}`;
    await check(other, 'get', path, 'client', undefined, 404);
    await check(other, 'patch', `${path}/open`, 'client', {}, 404);
    await check(other, 'patch', `${path}/skip`, 'client', {}, 404);
    await check(other, 'post', `${path}/responses`, 'client', { answers: [{ questionId: survey.questions[0].id, textAnswer: marker }] }, 404);
    assert.equal((await prisma.surveyResponse.findUniqueOrThrow({ where: { id: response.id } })).status, 'pending');
    const inbox = await check(owner, 'get', '/api/surveys/inbox', 'client', undefined, 200);
    assert.ok(inbox.list.some(item => item.id === response.id));
    await check(owner, 'get', path, 'client', undefined, 200);
    await check(owner, 'patch', `${path}/open`, 'client', {}, 200);
    await check(owner, 'post', `${path}/responses`, 'client', { answers: [{ questionId: survey.questions[0].id, textAnswer: marker }] }, 201);
    assert.equal((await prisma.surveyResponse.findUniqueOrThrow({ where: { id: response.id } })).status, 'submitted');
    const results = await check(vendorApi, 'get', `/api/surveys/${survey.id}/results`, 'vendor', undefined, 200);
    assert.ok(results, 'vendor can read results');
    console.log('PASS: checkout survey delivered, other client cannot read/open/skip/submit, owner submits and vendor sees results');
  } finally {
    for (const context of contexts) await context.dispose();
    if (survey) {
      await prisma.notification.deleteMany({ where: { surveyId: survey.id } });
      await prisma.surveyResponse.deleteMany({ where: { surveyId: survey.id } });
      await prisma.survey.deleteMany({ where: { id: survey.id, title: marker } });
    }
    if (clients.length) await prisma.order.deleteMany({ where: { clientId: { in: clients.map(client => client.id) }, notes: marker } });
    if (product) await prisma.product.deleteMany({ where: { id: product.id, name: marker } });
    if (clients.length) await prisma.client.deleteMany({ where: { id: { in: clients.map(client => client.id) }, fullName: marker } });
    if (category) await prisma.category.deleteMany({ where: { id: category.id, products: { none: {} } } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
