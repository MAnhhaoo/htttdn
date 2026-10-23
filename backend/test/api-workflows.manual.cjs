// Disposable HTTP workflows for employee, payroll and survey APIs.
require('dotenv').config();
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');
const { request } = require('../../frontend/node_modules/playwright');

async function main() {
  const prisma = new PrismaClient();
  const contexts = [];
  const calls = [];
  const tag = `API-WORKFLOW-${Date.now()}`;
  let employeeId, surveyId;
  async function login(role, email, password) {
    const api = await request.newContext({ baseURL: 'http://localhost:3000' });
    contexts.push(api);
    const response = await api.post('/api/auth/sign-in', { headers: { 'x-app-role': role }, data: { email, password } });
    assert.equal(response.status(), 201, `${role} sign-in: ${await response.text()}`);
    return api;
  }
  async function call(api, role, method, path, data) {
    const response = await api[method](path, { headers: { 'x-app-role': role }, ...(data === undefined ? {} : { data }) });
    const body = await response.json();
    calls.push({ role, method: method.toUpperCase(), path, status: response.status() });
    assert.ok(response.ok(), `${role} ${method.toUpperCase()} ${path}: ${response.status()} ${JSON.stringify(body).slice(0, 500)}`);
    return body.data ?? body;
  }
  try {
    const admin = await login('admin', process.env.MIVA_TEST_ADMIN_EMAIL || 'admin1@miva.vn', process.env.MIVA_TEST_ADMIN_PASSWORD || 'admin123');
    const vendor = await login('vendor', process.env.MIVA_TEST_VENDOR_EMAIL || 'vendor1@miva.vn', process.env.MIVA_TEST_VENDOR_PASSWORD || 'admin123');
    const password = 'Api-workflow-123!';
    const employee = await call(admin, 'admin', 'post', '/api/employees', { fullName: tag, email: `${tag.toLowerCase()}@example.com`, password, department: tag, position: 'QA', salary: 1000000, employmentType: 'full_time' });
    employeeId = employee.id;
    assert.ok(employeeId);
    await call(admin, 'admin', 'get', `/api/employees/${employeeId}`);
    await call(admin, 'admin', 'patch', `/api/employees/${employeeId}`, { fullName: `${tag} Updated` });
    await call(admin, 'admin', 'patch', `/api/employees/${employeeId}/schedule`, { shiftStart: '08:00', shiftEnd: '17:00' });
    await call(admin, 'admin', 'patch', `/api/employees/${employeeId}/status`, { status: 'inactive' });
    await call(admin, 'admin', 'patch', `/api/employees/${employeeId}/status`, { status: 'active' });
    const employeeApi = await login('employee', `${tag.toLowerCase()}@example.com`, password);
    await call(employeeApi, 'employee', 'get', '/api/employees/profile');
    await call(employeeApi, 'employee', 'patch', '/api/employees/profile', { phone: '0900000000' });
    const notification = await call(admin, 'admin', 'post', '/api/employees/notifications/send', { employeeId, title: tag, content: 'API test', type: 'info' });
    assert.ok(notification.notification?.id);
    await call(employeeApi, 'employee', 'get', '/api/employees/notifications/mine');
    await call(employeeApi, 'employee', 'patch', `/api/employees/notifications/${notification.notification.id}/read`);
    await call(employeeApi, 'employee', 'patch', '/api/employees/notifications/read-all');
    await call(employeeApi, 'employee', 'post', '/api/payroll/attendance', { date: '2026-10-21', checkIn: '2026-10-21T08:00:00.000Z', checkOut: '2026-10-21T16:00:00.000Z', hoursWorked: 8, status: 'present' });
    await call(employeeApi, 'employee', 'get', '/api/payroll/attendance?month=10&year=2026');
    const payroll = await call(admin, 'admin', 'post', '/api/payroll/calculate', { month: 10, year: 2026, department: tag });
    const payrollItem = Array.isArray(payroll) ? payroll[0] : payroll.payrolls?.[0] || payroll.list?.[0] || payroll.results?.[0];
    assert.ok(payrollItem?.id, `payroll item missing: ${JSON.stringify(payroll).slice(0, 500)}`);
    await call(admin, 'admin', 'patch', `/api/payroll/${payrollItem.id}`, { bonus: 1000, notes: tag });
    await call(employeeApi, 'employee', 'get', '/api/payroll/my-payslips');
    await call(admin, 'admin', 'get', `/api/employees/${employeeId}/salary-history`);

    const survey = await call(vendor, 'vendor', 'post', '/api/surveys', { title: tag, triggerType: 'manual', questions: [{ question: 'API hoạt động?', type: 'text', required: false, position: 0, options: [] }] });
    surveyId = survey.id;
    assert.ok(surveyId);
    await call(vendor, 'vendor', 'get', `/api/surveys/${surveyId}/manage`);
    await call(vendor, 'vendor', 'patch', `/api/surveys/${surveyId}`, { title: `${tag} Updated` });
    await call(vendor, 'vendor', 'get', `/api/surveys/${surveyId}/results`);
    await call(vendor, 'vendor', 'delete', `/api/surveys/${surveyId}`);
    await call(admin, 'admin', 'delete', `/api/employees/${employeeId}`);
  } finally {
    for (const api of contexts) await api.dispose();
    if (surveyId) await prisma.survey.deleteMany({ where: { id: surveyId, title: { startsWith: tag } } });
    if (employeeId) await prisma.employee.deleteMany({ where: { id: employeeId, email: `${tag.toLowerCase()}@example.com` } });
    await prisma.$disconnect();
  }
  console.log(JSON.stringify({ calls: calls.length, calls }, null, 2));
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
