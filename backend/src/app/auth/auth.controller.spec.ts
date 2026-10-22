import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('Registration requires a separate login', () => {
  let app: INestApplication;
  const credentials = { fullName: 'Test Registration', email: 'registration@example.com', password: 'Test-password-123!' };
  const auth = {
    signUp: jest.fn().mockResolvedValue({ id: 'new-client', email: credentials.email }),
    signUpVendor: jest.fn().mockResolvedValue({ id: 'new-vendor', email: credentials.email, role: 'vendor' }),
    signIn: jest.fn().mockResolvedValue({ data: { accessToken: 'access-token', refreshToken: 'refresh-token' } }),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: auth }],
    }).compile();
    app = module.createNestApplication();
    app.useLogger(false);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
  });

  afterEach(() => jest.clearAllMocks());
  afterAll(async () => app?.close());

  it('registers a customer without signing in or issuing session cookies', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up')
      .set('x-app-role', 'client')
      .send(credentials)
      .expect(201);
    expect(response.body.email).toBe(credentials.email);
    expect(response.headers['set-cookie']).toBeUndefined();
    expect(auth.signIn).not.toHaveBeenCalled();
    expect(response.body).not.toHaveProperty('accessToken');
  });

  it('registers a vendor without signing in or issuing session cookies', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/vendor')
      .set('x-app-role', 'vendor')
      .send(credentials)
      .expect(201);
    expect(response.body.user.email).toBe(credentials.email);
    expect(response.headers['set-cookie']).toBeUndefined();
    expect(auth.signIn).not.toHaveBeenCalled();
    expect(response.body).not.toHaveProperty('accessToken');
  });

  it('issues the appropriate role session cookies only on explicit login', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .set('x-app-role', 'client')
      .send({ email: credentials.email, password: credentials.password })
      .expect(201);
    expect(response.headers['set-cookie']).toEqual(expect.arrayContaining([
      expect.stringContaining('accessToken_client='),
      expect.stringContaining('refreshToken_client='),
    ]));
    expect(auth.signIn).toHaveBeenCalledTimes(1);
  });

  it('rejects an incomplete registration without creating an account or a session', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up')
      .send({ email: credentials.email })
      .expect(400);
    expect(auth.signUp).not.toHaveBeenCalled();
    expect(auth.signIn).not.toHaveBeenCalled();
    expect(response.headers['set-cookie']).toBeUndefined();
  });
});
