// @ts-nocheck
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { hashSync } from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { initApp } from '../src/init';

// Exercise the HTTP guards, auth service, DTOs and users service. Only Prisma
// is replaced, so these tests cannot alter the developer database.
describe('Authentication and users (four-table HTTP integration)', () => {
  let app: INestApplication;
  let records: any[];
  const password = 'Test-password-123!';
  const passwordHash = hashSync(password, 4);
  const ids = {
    client: '11111111-1111-4111-8111-111111111111',
    vendor: '22222222-2222-4222-8222-222222222222',
    admin: '33333333-3333-4333-8333-333333333333',
  };
  const roles = ['client', 'vendor', 'admin', 'employee'] as const;

  const project = (row: any, args: any = {}) => {
    if (!row) return null;
    if (args.select) {
      return Object.fromEntries(Object.keys(args.select)
        .filter(key => args.select[key])
        .map(key => [key, row[key]]));
    }
    return Object.fromEntries(Object.entries(row)
      .filter(([key]) => !args.omit?.[key] && key !== 'role'));
  };
  const matches = (row: any, where: any = {}) =>
    Object.entries(where).every(([key, value]) => {
      if (key === 'email' && typeof value === 'object')
        return row.email.toLowerCase() === value.equals.toLowerCase();
      if (key === 'id' && value && typeof value === 'object' && 'not' in value)
        return row.id !== value.not;
      return row[key] === value;
    });
  const accountDelegate = (role: string) => ({
    findFirst: jest.fn((args) => project(records.find(row => row.role === role && matches(row, args.where)), args)),
    findUnique: jest.fn((args) => project(records.find(row => row.role === role && matches(row, args.where)), args)),
    findMany: jest.fn((args) => records.filter(row => row.role === role && matches(row, args?.where))
      .map(row => project(row, args))),
    count: jest.fn((args) => records.filter(row => row.role === role && matches(row, args?.where)).length),
    create: jest.fn((args) => {
      const row = {
        id: randomUUID(), role, status: 'active', deletedAt: null,
        phone: null, avatarUrl: null, addresses: [], createdAt: new Date(), updatedAt: new Date(),
        ...args.data,
      };
      records.push(row);
      return project(row, args);
    }),
    update: jest.fn((args) => {
      const row = records.find(item => item.role === role && matches(item, args.where));
      if (!row) throw new Error('Record not found');
      Object.assign(row, args.data);
      return project(row, args);
    }),
  });
  const delegates = Object.fromEntries(roles.map(role => [role, accountDelegate(role)]));

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({ ...delegates, extended: delegates })
      .compile();
    app = moduleFixture.createNestApplication();
    app.useLogger(false);
    initApp(app);
    await app.init();
  });

  beforeEach(() => {
    records = Object.entries(ids).map(([role, id]) => ({
      id, role, email: `${role}@example.com`, fullName: role,
      password: passwordHash, phone: null, avatarUrl: null,
      storeName: role === 'vendor' ? 'Test Store' : undefined,
      taxId: role === 'vendor' ? '0101234567' : undefined,
      approvalStatus: role === 'vendor' ? 'approved' : undefined,
      addresses: [], status: 'active', deletedAt: null,
      createdAt: new Date(), updatedAt: new Date(),
    }));
    jest.clearAllMocks();
  });

  afterAll(async () => app?.close());

  const login = async (role: keyof typeof ids) => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .set('x-app-role', role)
      .send({ email: `${role}@example.com`, password })
      .expect(201);
    return response.body.data as { accessToken: string; refreshToken: string };
  };

  it('rejects anonymous profile and administration requests', async () => {
    const response = await request(app.getHttpServer()).get('/api/users/profile').expect(401);
    expect(response.body.message).toBe(response.body.errors[0].message);
    expect(response.body.message).not.toBe('ERROR');
    await request(app.getHttpServer()).get('/api/users').expect(401);
  });

  it('registers a pending vendor without issuing a session', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/vendor')
      .send({ fullName: 'New Vendor', email: 'new-vendor@example.com', password })
      .expect(201);
    expect(response.body.user).toMatchObject({ role: 'vendor', approvalStatus: 'pending_approval' });
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.headers['set-cookie']).toBeUndefined();
    await request(app.getHttpServer()).post('/api/auth/sign-up/seller').send({}).expect(404);
  });

  it('logs a client in and returns a profile without a password hash', async () => {
    const tokens = await login('client');
    const response = await request(app.getHttpServer())
      .get('/api/users/profile')
      .auth(tokens.accessToken, { type: 'bearer' })
      .expect(200);
    expect(response.body).toMatchObject({ email: 'client@example.com', role: 'customer' });
    expect(response.body).not.toHaveProperty('password');
  });

  it.each(['client', 'vendor'] as const)(
    'lets %s update their profile but rejects privileged fields', async (role) => {
      const tokens = await login(role);
      const payload = role === 'vendor'
        ? { fullName: 'Updated', storeName: 'Updated Store', taxId: '0999888777' }
        : { fullName: 'Updated' };
      const response = await request(app.getHttpServer())
        .patch('/api/users/profile')
        .auth(tokens.accessToken, { type: 'bearer' })
        .send(payload)
        .expect(200);
      expect(response.body.fullName).toBe('Updated');
      if (role === 'vendor') {
        expect(response.body.storeName).toBe('Updated Store');
        expect(response.body.taxId).toBe('0999888777');
      }
      expect(response.body).not.toHaveProperty('password');
      for (const body of [
        { role: 'admin' }, { status: 'inactive' },
        { password: 'plaintext' }, { deletedAt: new Date().toISOString() },
      ]) {
        await request(app.getHttpServer())
          .patch('/api/users/profile')
          .auth(tokens.accessToken, { type: 'bearer' })
          .send(body)
          .expect(400);
      }
      expect(records.find(row => row.id === ids[role]).role).toBe(role);
    },
  );

  it('blocks a client from editing another account', async () => {
    const tokens = await login('client');
    await request(app.getHttpServer())
      .patch(`/api/users/${ids.vendor}`)
      .auth(tokens.accessToken, { type: 'bearer' })
      .send({ fullName: 'Hijacked' })
      .expect(403);
    expect(records.find(row => row.id === ids.vendor).fullName).toBe('vendor');
  });

  it('allows admin list and lock-only status changes without exposing password hashes', async () => {
    const tokens = await login('admin');
    const list = await request(app.getHttpServer())
      .get('/api/users?role=client')
      .auth(tokens.accessToken, { type: 'bearer' })
      .expect(200);
    expect(list.body.list).toHaveLength(1);
    expect(list.body).toMatchObject({ page: 1, currentPage: 1, itemPerPage: 10, totalItems: 1, totalPages: 1 });
    expect(JSON.stringify(list.body)).not.toContain(passwordHash);
    const update = await request(app.getHttpServer())
      .patch(`/api/users/${ids.client}/status`)
      .auth(tokens.accessToken, { type: 'bearer' })
      .send({ status: 'inactive' })
      .expect(200);
    expect(update.body.status).toBe('inactive');
    expect(update.body.deletedAt).toBeNull();
    expect(update.body).not.toHaveProperty('password');

    // Unlock account
    const unlocked = await request(app.getHttpServer())
      .patch(`/api/users/${ids.client}/status`)
      .auth(tokens.accessToken, { type: 'bearer' })
      .send({ status: 'active' })
      .expect(200);
    expect(unlocked.body.status).toBe('active');
    expect(unlocked.body.deletedAt).toBeNull();

    // DELETE soft-deletes the account and marks it inactive.
    const lockedViaDelete = await request(app.getHttpServer())
      .delete(`/api/users/${ids.client}`)
      .auth(tokens.accessToken, { type: 'bearer' })
      .expect(200);
    expect(lockedViaDelete.body.status).toBe('inactive');
    expect(lockedViaDelete.body.deletedAt).toEqual(expect.any(String));

    // Prevent admin self-lock
    await request(app.getHttpServer())
      .patch(`/api/users/${ids.admin}/status`)
      .auth(tokens.accessToken, { type: 'bearer' })
      .send({ status: 'inactive' })
      .expect(400);
  });

  it('rejects access and refresh tokens used for the wrong purpose', async () => {
    const tokens = await login('client');
    await request(app.getHttpServer())
      .get('/api/users/profile')
      .auth(tokens.refreshToken, { type: 'bearer' })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/refresh-token')
      .set('x-app-role', 'client')
      .set('Cookie', `refreshToken_client=${tokens.accessToken}`)
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/refresh-token')
      .set('x-app-role', 'client')
      .set('Cookie', `refreshToken_client=${tokens.refreshToken}`)
      .expect(201);
  });

  it('revokes a disabled account immediately', async () => {
    const tokens = await login('admin');
    records.find(row => row.id === ids.admin).status = 'inactive';
    await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .set('x-app-role', 'admin')
      .send({ email: 'admin@example.com', password })
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/users/profile')
      .auth(tokens.accessToken, { type: 'bearer' })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/refresh-token')
      .set('x-app-role', 'admin')
      .set('Cookie', `refreshToken_admin=${tokens.refreshToken}`)
      .expect(401);
  });

  it('blocks a pending vendor and a client using the vendor portal', async () => {
    records.find(row => row.id === ids.vendor).approvalStatus = 'pending_approval';
    await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .set('x-app-role', 'vendor')
      .send({ email: 'vendor@example.com', password })
      .expect(403);
    await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .set('x-app-role', 'vendor')
      .send({ email: 'client@example.com', password })
      .expect(401);
  });
});
