import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AdminsService } from '../admins/admins.service';
import { ClientsService } from '../clients/clients.service';
import { VendorsService } from '../vendors/vendors.service';
import { StringUtilService } from '../../common/utils/string-util/string-util.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto/sign.dto';
import { JWTToken, TokenKeys } from './consts/jwt.const';

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
  constructor(
    private readonly adminsService: AdminsService,
    private readonly clientsService: ClientsService,
    private readonly vendorsService: VendorsService,
    private readonly stringUtilService: StringUtilService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

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
    const { email, password, ...otherInformation } = signUpDto;
    const existingClient = await this.clientsService.getClientByEmail(email);
    if (existingClient) {
      throw new BadRequestException('Email đã được sử dụng');
    }
    const passwordHashed = await this.stringUtilService.hash(password);
    const userCreated = await this.clientsService.createClient({
      ...otherInformation,
      email,
      password: passwordHashed,
    } as any); // cast to any temporarily to avoid typing issue with missing fields

    const { password: _password, ...userResponse } = userCreated;
    return userResponse;
  }

  private async registerVendor(signUpDto: SignUpDto) {
    const { email, password, ...otherInformation } = signUpDto;
    const existingVendor = await this.vendorsService.getVendorByEmail(email);
    if (existingVendor) {
      throw new BadRequestException('Email đã được sử dụng');
    }
    const passwordHashed = await this.stringUtilService.hash(password);
    const userCreated = await this.vendorsService.createVendor({
      ...otherInformation,
      email,
      password: passwordHashed,
    } as any);

    const { password: _password, ...userResponse } = userCreated;
    return userResponse;
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    let user: any = await this.clientsService.getClientByEmail(email);
    let role: 'admin' | 'client' | 'vendor' | 'employee' = 'client';

    if (!user) {
      user = await this.vendorsService.getVendorByEmail(email);
      role = 'vendor';
    }
    if (!user) {
      user = await this.adminsService.getAdminByEmail(email);
      role = 'admin';
    }
    if (!user) {
      user = await this.prisma.employee.findUnique({
        where: { email },
      });
      if (user) {
        role = 'employee';
      }
    }

    if (!user || user.status !== 'active' || user.deletedAt) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordMatched = await this.stringUtilService.compare(
      password,
      user.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

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
    
    let user: any = null;
    if (payload.role === 'client') {
      user = await this.clientsService.getClient({ id: payload.userID }).catch(() => null);
    } else if (payload.role === 'vendor') {
      user = await this.vendorsService.getVendor({ id: payload.userID }).catch(() => null);
    } else if (payload.role === 'admin') {
      user = await this.adminsService.getAdmin({ id: payload.userID }).catch(() => null);
    } else if (payload.role === 'employee') {
      user = await this.prisma.employee.findUnique({ where: { id: payload.userID } }).catch(() => null);
    }

    if (!user || user.status !== 'active' || user.deletedAt) {
      throw new UnauthorizedException('Tài khoản không còn hoạt động');
    }

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
    if (userInfo.role === 'employee') {
      const emp = await this.prisma.employee.findUnique({
        where: { id: userInfo.userID },
      });
      if (emp) {
        const { password: _p, ...safeEmp } = emp;
        return { data: { ...userInfo, ...safeEmp } };
      }
    }
    if (userInfo.role === 'admin') {
      const admin = await this.adminsService.getAdmin({ id: userInfo.userID }).catch(() => null);
      if (admin) {
        return { data: { ...userInfo, ...admin } };
      }
    }
    if (userInfo.role === 'vendor') {
      const vendor = await this.vendorsService.getVendor({ id: userInfo.userID }).catch(() => null);
      if (vendor) {
        return { data: { ...userInfo, ...vendor } };
      }
    }
    if (userInfo.role === 'client') {
      const client = await this.clientsService.getClient({ id: userInfo.userID }).catch(() => null);
      if (client) {
        return { data: { ...userInfo, ...client } };
      }
    }
    return { data: userInfo };
  }
}
