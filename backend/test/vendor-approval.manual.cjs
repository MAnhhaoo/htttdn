// HTTP regression for vendor approval authorization, renewal rejection and replay.
require('dotenv').config();
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { request } = require('../../frontend/node_modules/playwright');

async function main() {
  const prisma = new PrismaClient();
  const apiContexts = [];
  const marker = `approval-${Date.now()}`;
  const password = 'Approval-123!';
  const vendors = [];
  const employees = [];
  async function api() {
    const context = await request.newContext({ baseURL: 'http://localhost:3000' });
    apiContexts.push(context);
    return context;
  }
  async function login(context, role, email, passwordValue) {
    const response = await context.post('/api/auth/sign-in', { headers: { 'x-app-role': role }, data: { email, password: passwordValue } });
    assert.equal(response.status(), 201, `${role} sign-in: ${await response.text()}`);
  }
  async function status(context, method, path, role, data, expected) {
    const response = await context[method](path, { headers: { 'x-app-role': role }, ...(data === undefined ? {} : { data }) });
    assert.equal(response.status(), expected, `${method.toUpperCase()} ${path}: ${await response.text()}`);
    return response.json();
  }
  try {
    const publicApi = await api();
    const adminApi = await api();
    const allowedApi = await api();
    const deniedApi = await api();
    await login(adminApi, 'admin', process.env.MIVA_TEST_ADMIN_EMAIL || 'admin1@miva.vn', process.env.MIVA_TEST_ADMIN_PASSWORD || 'admin123');
    for (const [suffix, department] of [['allowed', 'Bộ phận Điều phối & Liên kết Vendor'], ['denied', 'Phòng Quản lý & Vận hành Đơn hàng']]) {
      const employee = await prisma.employee.create({ data: {
        employeeCode: `${marker}-${suffix}`, fullName: `${marker}-${suffix}`,
        email: `${marker}-${suffix}@example.com`, password: await bcrypt.hash(password, 10),
        department, position: 'QA', salary: 0, hireDate: new Date(),
        permissions: { restrictions: { canManageVendors: false } },
      } });
      employees.push(employee);
    }
    await login(allowedApi, 'employee', employees[0].email, password);
    await login(deniedApi, 'employee', employees[1].email, password);

    async function register(suffix) {
      const email = `${marker}-${suffix}-vendor@example.com`;
      await status(publicApi, 'post', '/api/auth/sign-up/vendor', 'vendor', {
        fullName: `${marker}-${suffix}`, storeName: `${marker}-${suffix}`,
        email, password, phone: '0900000000', subscriptionPlan: '1_year',
      }, 201);
      const vendor = await prisma.vendor.findUniqueOrThrow({ where: { email } });
      vendors.push(vendor);
      return vendor;
    }

    const approved = await register('approved');
    const path = `/api/vendors/admin/registrations/${approved.id}`;
    await status(deniedApi, 'patch', `${path}/approve`, 'employee', {}, 403);
    assert.equal((await prisma.vendor.findUniqueOrThrow({ where: { id: approved.id } })).approvalStatus, 'pending_approval');
    await status(allowedApi, 'patch', `${path}/approve`, 'employee', {}, 200);
    await status(allowedApi, 'patch', `${path}/approve`, 'employee', {}, 409);
    const initial = await prisma.vendor.findUniqueOrThrow({ where: { id: approved.id } });
    assert.equal(initial.approvalStatus, 'approved');
    assert.equal(initial.status, 'active');

    const vendorApi = await api();
    await login(vendorApi, 'vendor', approved.email, password);
    await status(vendorApi, 'post', '/api/vendors/subscription/renew', 'vendor', { plan: '2_years' }, 201);
    await status(deniedApi, 'patch', `${path}/reject`, 'employee', { reason: marker }, 403);
    await status(allowedApi, 'patch', `${path}/reject`, 'employee', { reason: marker }, 200);
    await status(allowedApi, 'patch', `${path}/reject`, 'employee', { reason: marker }, 409);
    const afterRejectedRenewal = await prisma.vendor.findUniqueOrThrow({ where: { id: approved.id } });
    assert.equal(afterRejectedRenewal.approvalStatus, 'approved');
    assert.equal(afterRejectedRenewal.status, 'active');
    assert.equal(afterRejectedRenewal.renewalRequested, false);
    assert.equal(afterRejectedRenewal.subscriptionExpiresAt.getTime(), initial.subscriptionExpiresAt.getTime());
    assert.equal(Number(afterRejectedRenewal.subscriptionFee), 1200000);

    await status(vendorApi, 'post', '/api/vendors/subscription/renew', 'vendor', { plan: '2_years' }, 201);
    await status(adminApi, 'patch', `${path}/approve`, 'admin', { plan: '2_years', commissionRate: 8 }, 200);
    await status(adminApi, 'patch', `${path}/approve`, 'admin', { plan: '2_years' }, 409);
    const afterRenewal = await prisma.vendor.findUniqueOrThrow({ where: { id: approved.id } });
    assert.ok(afterRenewal.subscriptionExpiresAt.getTime() > initial.subscriptionExpiresAt.getTime() + 700 * 86400000);
    assert.equal(afterRenewal.renewalRequested, false);

    const rejected = await register('rejected');
    const rejectPath = `/api/vendors/admin/registrations/${rejected.id}/reject`;
    await status(adminApi, 'patch', rejectPath, 'admin', { reason: marker }, 200);
    await status(adminApi, 'patch', rejectPath, 'admin', { reason: marker }, 409);
    const rejectedRecord = await prisma.vendor.findUniqueOrThrow({ where: { id: rejected.id } });
    assert.equal(rejectedRecord.approvalStatus, 'rejected');
    assert.equal(rejectedRecord.status, 'inactive');
    const rejectedApi = await api();
    await status(rejectedApi, 'post', '/api/auth/sign-in', 'vendor', { email: rejected.email, password }, 401);
    console.log('PASS: restricted employee denied, vendor-link employee allowed, replay rejected, renewal rejection keeps active account, approval extends once');
  } finally {
    for (const context of apiContexts) await context.dispose();
    for (const vendor of vendors) await prisma.vendor.deleteMany({ where: { id: vendor.id, email: vendor.email } });
    for (const employee of employees) await prisma.employee.deleteMany({ where: { id: employee.id, email: employee.email } });
    await prisma.$disconnect();
  }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
