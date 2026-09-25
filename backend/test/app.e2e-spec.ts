import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { initApp } from '../src/init';
import { hashSync } from 'bcrypt';
import { User } from '@prisma/client';

// Exercise the real HTTP stack, services, validation and JWT/bcrypt logic.
// Only persistence is replaced so the suite never edits a developer database.
describe('Backend authentication and users (HTTP integration)', () => {
  let app: INestApplication;
  let records: User[];
  const password = 'Test-password-123!';
  const passwordHash = hashSync(password, 4);
  const ids = {
    customer: '11111111-1111-4111-8111-111111111111',
    vendor: '22222222-2222-4222-8222-222222222222',
    admin: '33333333-3333-4333-8333-333333333333',
  };
  const project = (user: User | undefined, args: any) => {
    if (!user) return null;
    return Object.fromEntries(
      Object.entries(user).filter(([key]) =>
        args.select ? args.select[key] === true : !args.omit?.[key],
      ),
    );
  };
  const matches = (user: User, where: any = {}) =>
    Object.entries(where).every(([key, value]) => user[key] === value);
  const delegate = {
    findUnique: jest.fn((args) =>
      project(
        records.find((user) => matches(user, args.where)),
        args,
      ),
    ),
    findMany: jest.fn((args) =>
      records
        .filter((user) => matches(user, args.where))
        .map((user) => project(user, args)),
    ),
    count: jest.fn(
      (args) => records.filter((user) => matches(user, args.where)).length,
    ),
    update: jest.fn((args) => {
      const user = records.find((item) => matches(item, args.where));
      if (!user) throw new Error('Record not found');
      Object.assign(user, args.data);
      return project(user, args);
    }),
    create: jest.fn((args) => {
      const user = {
        ...args.data,
        id: '44444444-4444-4444-8444-444444444444',
        phone: args.data.phone ?? null,
        address: args.data.address ?? null,
        status: 'active',
        deletedAt: null,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      records.push(user);
      return user;
    }),
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ user: delegate, extended: { user: delegate } })
      .compile();
    app = moduleFixture.createNestApplication();
    app.useLogger(false);
    initApp(app);
    await app.init();
  });

  beforeEach(() => {
    records = Object.entries(ids).map(([role, id]) => ({
      id,
      role: role as User['role'],
      email: `${role}@example.com`,
      fullName: role,
      password: passwordHash,
      status: 'active',
      deletedAt: null,
      phone: null,
      address: null,
      createdBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app?.close();
  });

  const login = async (role: keyof typeof ids) => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .send({ email: `${role}@example.com`, password })
      .expect(201);
    return response.body.data as { accessToken: string; refreshToken: string };
  };

  it('rejects anonymous requests', async () => {
    await request(app.getHttpServer()).get('/api/users/profile').expect(401);
  });
  it('registers a vendor through the renamed route', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/vendor')
      .send({
        fullName: 'New Vendor',
        email: 'new-vendor@example.com',
        password,
      })
      .expect(201);
    expect(response.body.role).toBe('vendor');
    expect(response.body).not.toHaveProperty('password');
    await request(app.getHttpServer())
      .post('/api/auth/sign-up/seller')
      .send({})
      .expect(404);
  });
  it('logs in and returns a profile without a password hash', async () => {
    const tokens = await login('customer');
    const response = await request(app.getHttpServer())
      .get('/api/users/profile')
      .set('Cookie', `accessToken=${tokens.accessToken}`)
      .expect(200);
    expect(response.body.email).toBe('customer@example.com');
    expect(response.body).not.toHaveProperty('password');
  });
  it.each(['customer', 'vendor'] as const)(
    'lets %s edit their profile but blocks privilege escalation',
    async (role) => {
      const tokens = await login(role);
      const response = await request(app.getHttpServer())
        .patch('/api/users/profile')
        .auth(tokens.accessToken, { type: 'bearer' })
        .send({ fullName: 'Updated' })
        .expect(200);
      expect(response.body.fullName).toBe('Updated');
      expect(response.body).not.toHaveProperty('password');
      for (const body of [
        { role: 'admin' },
        { status: 'inactive' },
        { password: 'plaintext' },
        { deletedAt: new Date().toISOString() },
      ]) {
        await request(app.getHttpServer())
          .patch('/api/users/profile')
          .auth(tokens.accessToken, { type: 'bearer' })
          .send(body)
          .expect(400);
      }
      expect(records.find((user) => user.id === ids[role])?.role).toBe(role);
    },
  );
  it('prevents customers from changing another user', async () => {
    const tokens = await login('customer');
    await request(app.getHttpServer())
      .patch(`/api/users/${ids.vendor}`)
      .auth(tokens.accessToken, { type: 'bearer' })
      .send({ role: 'admin' })
      .expect(403);
  });
  it('allows admin changes and excludes password hashes from list/options/update/delete', async () => {
    const tokens = await login('admin');
    const list = await request(app.getHttpServer())
      .get('/api/users')
      .auth(tokens.accessToken, { type: 'bearer' })
      .expect(200);
    expect(JSON.stringify(list.body)).not.toContain(passwordHash);
    const options = await request(app.getHttpServer())
      .get('/api/users/options?select=id,password')
      .auth(tokens.accessToken, { type: 'bearer' })
      .expect(200);
    expect(options.body).toHaveLength(3);
    expect(options.body[0]).toEqual({ id: ids.customer });
    const update = await request(app.getHttpServer())
      .patch(`/api/users/${ids.customer}`)
      .auth(tokens.accessToken, { type: 'bearer' })
      .send({ role: 'vendor' })
      .expect(200);
    expect(update.body.role).toBe('vendor');
    expect(update.body).not.toHaveProperty('password');
    const removed = await request(app.getHttpServer())
      .delete(`/api/users/${ids.customer}`)
      .auth(tokens.accessToken, { type: 'bearer' })
      .expect(200);
    expect(removed.body.status).toBe('inactive');
    expect(removed.body).not.toHaveProperty('password');
  });
  it('rejects a refresh token as an access token and vice versa', async () => {
    const tokens = await login('customer');
    await request(app.getHttpServer())
      .get('/api/users/profile')
      .auth(tokens.refreshToken, { type: 'bearer' })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/refresh-token')
      .set('Cookie', `refreshToken=${tokens.accessToken}`)
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/refresh-token')
      .set('Cookie', `refreshToken=${tokens.refreshToken}`)
      .expect(201);
  });
  it('blocks login, refresh and protected routes after disabling a user', async () => {
    const tokens = await login('admin');
    records.find((user) => user.id === ids.admin)!.status = 'inactive';
    await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .send({ email: 'admin@example.com', password })
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/users/profile')
      .auth(tokens.accessToken, { type: 'bearer' })
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/users')
      .auth(tokens.accessToken, { type: 'bearer' })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/refresh-token')
      .set('Cookie', `refreshToken=${tokens.refreshToken}`)
      .expect(401);
  });
  it('revokes admin route access immediately after demotion', async () => {
    const tokens = await login('admin');
    records.find((user) => user.id === ids.admin)!.role = 'customer';
    await request(app.getHttpServer())
      .get('/api/users')
      .auth(tokens.accessToken, { type: 'bearer' })
      .expect(403);
  });
});
