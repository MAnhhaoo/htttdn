import {
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AdminsService } from '../admins/admins.service';
import { ClientsService } from '../clients/clients.service';
import { VendorsService } from '../vendors/vendors.service';
import { StringUtilService } from '../../common/utils/string-util/string-util.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AccountDirectoryService } from '../../common/account/account-directory.service';
import { SignInDto, SignUpDto } from './dto/sign.dto';
import { JWTToken, TokenKeys } from './consts/jwt.const';
import {
  SUBSCRIPTION_PLAN_FEES,
  assertVendorApproved,
  normalizeSubscriptionPlan,
} from '../../common/utils/vendor-approval/vendor-approval.util';
import {
  ACCOUNT_ROLES,
  AccountRole,
  assertEmailAvailable,
  findAccountsByEmail,
} from '../../common/utils/account-email/account-email.util';

export type TokenPayload = {
  userID: string;
  userEmail: string;
  fullName: string;
  phone: string | null;
  address: string | null;
  role: 'admin' | 'client' | 'vendor' | 'employee';
};

@Injectable()
export class AuthService {
  private readonly fallbackDirectory: AccountDirectoryService;

  constructor(
    private readonly adminsService: AdminsService,
    private readonly clientsService: ClientsService,
    private readonly vendorsService: VendorsService,
    private readonly stringUtilService: StringUtilService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Optional() private readonly accountDirectory?: AccountDirectoryService,
  ) {
    this.fallbackDirectory = new AccountDirectoryService(this.prisma);
  }

  private get directory(): AccountDirectoryService {
    return this.accountDirectory ?? this.fallbackDirectory;
  }

  async createToken(payload: TokenPayload) {
    const accessToken = await this.jwtService.signAsync(
      { ...payload, tokenType: 'access' },
      {
        expiresIn: JWTToken.ACCESS_TOKEN_EXPIRE_IN,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { ...payload, tokenType: 'refresh' },
      {
        expiresIn: JWTToken.REFRESH_TOKEN_EXPIRE_IN,
      },
    );

    return {
      [TokenKeys.ACCESS_TOKEN_KEY]: accessToken,
      [TokenKeys.REFRESH_TOKEN_KEY]: refreshToken,
    };
  }

  async verifyToken(
    token: string,
    tokenType: 'access' | 'refresh' = 'access',
  ): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<
        TokenPayload & { tokenType: string }
      >(token);
      if (payload.tokenType !== tokenType || !payload.userID) {
        throw new UnauthorizedException();
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  async signUp(signUpDto: SignUpDto) {
    return this.registerClient(signUpDto);
  }

  async signUpVendor(signUpDto: SignUpDto) {
    return this.registerVendor(signUpDto);
  }

  private async registerClient(signUpDto: SignUpDto) {
    const {
      email,
      password,
      storeName: _sn,
      taxId: _tax,
      subscriptionPlan: _sp,
      businessType: _bt,
      dateOfBirth,
      gender,
      ...otherInformation
    } = signUpDto;
    // Email phải chưa thuộc về bất kỳ tài khoản nào (kể cả admin/vendor/nhân viên).
    await assertEmailAvailable(this.prisma.extended, email);
    const passwordHashed = await this.stringUtilService.hash(password);
    const parsedDob =
      typeof dateOfBirth === 'string' && dateOfBirth.trim()
        ? new Date(`${dateOfBirth.slice(0, 10)}T00:00:00.000Z`)
        : null;

    const userCreated = await this.clientsService.createClient({
      ...otherInformation,
      ...(parsedDob ? { dateOfBirth: parsedDob } : {}),
      ...(gender ? { gender } : {}),
      email,
      password: passwordHashed,
    } as any); // cast to any temporarily to avoid typing issue with missing fields

    const { password: _password, ...userResponse } =
      userCreated as typeof userCreated & { password?: string };
    return userResponse;
  }

  private async registerVendor(signUpDto: SignUpDto) {
    const {
      email,
      password,
      address: _addr,
      businessType: _bt,
      dateOfBirth: _dob,
      gender: _gender,
      ...otherInformation
    } = signUpDto;
    await assertEmailAvailable(this.prisma.extended, email);
    const passwordHashed = await this.stringUtilService.hash(password);
    const storeName = (otherInformation as any).storeName || otherInformation.fullName;
    const plan = normalizeSubscriptionPlan((otherInformation as any).subscriptionPlan);
    const fee = SUBSCRIPTION_PLAN_FEES[plan];

    const userCreated = await this.vendorsService.createVendor({
      ...otherInformation,
      storeName,
      commissionRate: 8.0,
      subscriptionPlan: plan,
      subscriptionFee: fee,
      approvalStatus: 'pending_approval',
      email,
      password: passwordHashed,
    } as any);

    const { password: _password, ...userResponse } =
      userCreated as typeof userCreated & { password?: string };
    return {
      ...userResponse,
      role: 'vendor',
    };
  }

  async signIn(signInDto: SignInDto, appRole?: string) {
    const { email, password } = signInDto;

    // Một email có thể (do dữ liệu cũ) tồn tại ở nhiều bảng. Không lấy bản ghi
    // đầu tiên tìm thấy, mà thử lần lượt các tài khoản đang hoạt động — ưu tiên
    // vai trò của ứng dụng đang đăng nhập — và chỉ chấp nhận tài khoản khớp mật khẩu.
    // Nhờ vậy một tài khoản đăng ký trùng email không thể khóa tài khoản thật.
    const preferred = ACCOUNT_ROLES.includes(appRole as AccountRole)
      ? (appRole as AccountRole)
      : undefined;
    const candidates = (await findAccountsByEmail(this.prisma.extended, email))
      .filter(({ role }) => appRole !== 'vendor' || role === 'vendor')
      .filter(({ user }) => user.status === 'active' && !user.deletedAt)
      .sort((a, b) => Number(b.role === preferred) - Number(a.role === preferred));

    let user: any = null;
    let role: AccountRole = 'client';
    for (const candidate of candidates) {
      if (await this.stringUtilService.compare(password, candidate.user.password)) {
        user = candidate.user;
        role = candidate.role;
        break;
      }
    }

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (role === 'vendor') assertVendorApproved(user.approvalStatus);

    const tokens = await this.createToken({
      userID: user.id,
      userEmail: user.email,
      fullName: user.fullName,
      phone: user.phone || null,
      address: user.address || null,
      role: role,
    });

    return {
      data: tokens,
    };
  }

  async refreshToken(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Không tìm thấy refresh token');
    }
    const payload = await this.verifyToken(refreshToken, 'refresh');

    const user = await this.directory.getAccountAuthSummary(
      payload.userID,
      payload.role,
    );

    if (!user || user.status !== 'active' || user.deletedAt) {
      throw new UnauthorizedException('Tài khoản không còn hoạt động');
    }

    if (payload.role === 'vendor') assertVendorApproved(user.approvalStatus);

    const tokens = await this.createToken({
      userID: user.id,
      userEmail: user.email,
      fullName: user.fullName,
      phone: user.phone || null,
      address: null,
      role: payload.role,
    });

    return {
      data: tokens,
    };
  }

  async getMe(userInfo: { userID: string; role: string }) {
    const profile = await this.directory.getAccountAuthSummary(
      userInfo.userID,
      userInfo.role,
    );
    if (profile) {
      return { data: { ...userInfo, ...profile } };
    }
    return { data: userInfo };
  }
}
