import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessControlGuard } from '../../common/guards/access-control/access-control.guard';

describe('Vendor approval before login', () => {
  const account = {
    id: 'vendor-id', email: 'vendor@example.com', password: 'hashed',
    fullName: 'Vendor', status: 'active', deletedAt: null, approvalStatus: 'approved',
  };
  const credentials = { email: account.email, password: 'password' };
  let service: AuthService;
  let db: any;
  let vendors: any;
  let jwt: any;
  let strings: any;

  beforeEach(() => {
    db = Object.fromEntries(['admin', 'client', 'vendor', 'employee'].map(role => [role, {
      findFirst: jest.fn().mockResolvedValue(null), findUnique: jest.fn().mockResolvedValue(null),
    }]));
    vendors = {
      createVendor: jest.fn(async data => ({ id: 'new-vendor', ...data })),
      getVendor: jest.fn().mockResolvedValue(account),
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('token'), verifyAsync: jest.fn() };
    strings = { compare: jest.fn().mockResolvedValue(true), hash: jest.fn().mockResolvedValue('hashed') };
    service = new AuthService({} as any, {} as any, vendors, strings, jwt, db);
  });

  it('registers new vendors as pending without issuing tokens', async () => {
    const result = await service.signUpVendor({ ...credentials, fullName: 'New Vendor' });
    expect(vendors.createVendor).toHaveBeenCalledWith(expect.objectContaining({ approvalStatus: 'pending_approval' }));
    expect(result.approvalStatus).toBe('pending_approval');
    expect(result).not.toHaveProperty('password');
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('allows an existing approved vendor to log in', async () => {
    db.vendor.findFirst.mockResolvedValue(account);
    await expect(service.signIn(credentials, 'vendor')).resolves.toHaveProperty('data.accessToken', 'token');
  });

  it.each(['pending_approval', 'rejected'])('does not issue tokens for a %s vendor', async approvalStatus => {
    db.vendor.findFirst.mockResolvedValue({ ...account, approvalStatus });
    await expect(service.signIn(credentials, 'vendor')).rejects.toBeInstanceOf(ForbiddenException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('allows login once admin approves a pending vendor', async () => {
    const pending = { ...account, approvalStatus: 'pending_approval' };
    db.vendor.findFirst.mockResolvedValue(pending);
    await expect(service.signIn(credentials, 'vendor')).rejects.toBeInstanceOf(ForbiddenException);
    pending.approvalStatus = 'approved';
    await expect(service.signIn(credentials, 'vendor')).resolves.toHaveProperty('data.accessToken');
  });

  it('checks the password before reporting approval status', async () => {
    db.vendor.findFirst.mockResolvedValue({ ...account, approvalStatus: 'pending_approval' });
    strings.compare.mockResolvedValue(false);
    await expect(service.signIn(credentials, 'vendor')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('does not sign a customer into the vendor portal', async () => {
    db.client.findFirst.mockResolvedValue(account);
    await expect(service.signIn(credentials, 'vendor')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('does not refresh tokens for a pending vendor', async () => {
    jwt.verifyAsync.mockResolvedValue({ userID: account.id, role: 'vendor', tokenType: 'refresh' });
    vendors.getVendor.mockResolvedValue({ ...account, approvalStatus: 'pending_approval' });
    await expect(service.refreshToken('old-token')).rejects.toBeInstanceOf(ForbiddenException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('blocks a pending vendor with an old session from reading protected pages', async () => {
    db.vendor.findUnique.mockResolvedValue({ ...account, approvalStatus: 'pending_approval' });
    const guard = new AccessControlGuard(db, { getAllAndOverride: () => undefined } as any);
    const context = {
      getHandler: () => null, getClass: () => null,
      switchToHttp: () => ({ getRequest: () => ({ method: 'GET', user: { userID: account.id } }) }),
    };
    await expect(guard.canActivate(context as any)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
