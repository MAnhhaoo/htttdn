// Disposable order assignment regression using a synthetic order and shipment.
require('dotenv').config();
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { request } = require('../../frontend/node_modules/playwright');

async function main() {
  const prisma = new PrismaClient();
  const api = await request.newContext({ baseURL: 'http://localhost:3000' });
  const marker = `ASSIGN-${Date.now()}`;
  let client, order, inactiveEmployee, activeEmployee;
  async function call(method, path, data, expected) {
    const response = await api[method](path, { headers: { 'x-app-role': 'admin' }, ...(data === undefined ? {} : { data }) });
    assert.equal(response.status(), expected, `${method.toUpperCase()} ${path}: ${await response.text()}`);
    return response.json();
  }
  try {
    await call('post', '/api/auth/sign-in', { email: process.env.MIVA_TEST_ADMIN_EMAIL || 'admin1@miva.vn', password: process.env.MIVA_TEST_ADMIN_PASSWORD || 'admin123' }, 201);
    activeEmployee = await prisma.employee.create({ data: {
      employeeCode: `${marker}-active`, fullName: `${marker}-active`, email: `${marker.toLowerCase()}-active@example.com`,
      password: await bcrypt.hash('Assign-123!', 10), department: 'Phòng Vận chuyển & Giao nhận',
      position: 'QA', status: 'active', salary: 0, hireDate: new Date(),
    } });
    inactiveEmployee = await prisma.employee.create({ data: {
      employeeCode: marker, fullName: marker, email: `${marker.toLowerCase()}@example.com`,
      password: await bcrypt.hash('Assign-123!', 10), department: 'Phòng Vận chuyển & Giao nhận',
      position: 'QA', status: 'inactive', salary: 0, hireDate: new Date(),
    } });
    client = await prisma.client.create({ data: { email: `${marker.toLowerCase()}-client@example.com`, fullName: marker, password: await bcrypt.hash('Assign-123!', 10) } });
    order = await prisma.order.create({ data: {
      clientId: client.id, totalAmount: 100000, notes: marker,
      shipments: { create: { trackingNumber: marker, status: 'pending', carrierType: 'employee' } },
    }, include: { shipments: true } });
    const assignPath = `/api/orders/${order.id}/assign`;
    await call('patch', assignPath, { employeeId: inactiveEmployee.id }, 400);
    assert.equal(await prisma.orderStatusHistory.count({ where: { orderId: order.id } }), 0);
    await call('patch', assignPath, { employeeId: activeEmployee.id }, 200);
    assert.equal((await prisma.shipment.findUniqueOrThrow({ where: { id: order.shipments[0].id } })).carrierId, activeEmployee.id);
    await call('post', `/api/orders/${order.id}/auto-assign?department=shipping`, undefined, 201);
    await call('post', `/api/shipping/shipments/${order.shipments[0].id}/random-assign`, undefined, 201);
    await call('patch', `/api/shipping/shipments/${order.shipments[0].id}/assign`, { carrierId: activeEmployee.id }, 200);
    await prisma.order.update({ where: { id: order.id }, data: { status: 'completed' } });
    await call('patch', assignPath, { employeeId: activeEmployee.id }, 400);
    console.log('PASS: inactive employee and closed order rejected; direct, automatic and shipping assignments work');
  } finally {
    await api.dispose();
    if (order) await prisma.order.deleteMany({ where: { id: order.id, notes: marker } });
    if (client) await prisma.client.deleteMany({ where: { id: client.id, email: client.email } });
    if (inactiveEmployee) await prisma.employee.deleteMany({ where: { id: inactiveEmployee.id, email: inactiveEmployee.email } });
    if (activeEmployee) await prisma.employee.deleteMany({ where: { id: activeEmployee.id, email: activeEmployee.email } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
