import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';

import { UsersService } from '../users/users.service';
import { StringUtilService } from '../../common/utils/string-util/string-util.service';
import { SignInDto, SignUpDto } from './dto/sign.dto';
import { JWTToken, TokenKeys } from './consts/jwt.const';

export type TokenPayload = {
  userID: string;
  userEmail: string;
  fullName: string;
  phone: string | null;
  address: string | null;
  role: UserRole;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly stringUtilService: StringUtilService,
    private readonly jwtService: JwtService,
  ) {}

  async createToken(payload: TokenPayload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: JWTToken.ACCESS_TOKEN_EXPIRE_IN,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: JWTToken.REFRESH_TOKEN_EXPIRE_IN,
    });

    return {
      [TokenKeys.ACCESS_TOKEN_KEY]: accessToken,

      [TokenKeys.REFRESH_TOKEN_KEY]: refreshToken,
    };
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  async signUp(signUpDto: SignUpDto) {
    const { email, password, ...otherInformation } = signUpDto;

    const existingUser = await this.usersService.getUserByEmail(email);

    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    const passwordHashed = await this.stringUtilService.hash(password);

    const userCreated = await this.usersService.createUser({
      ...otherInformation,
      email,
      password: passwordHashed,
      role: UserRole.customer,
    });

    const { password: _password, ...userResponse } = userCreated;

    return userResponse;
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
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
      phone: user.phone,
      address: user.address,
      role: user.role,
    });

    return {
      data: tokens,
    };
  }
  async refreshToken(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Không tìm thấy refresh token');
    }
    const payload = await this.verifyToken(refreshToken);
    const tokens = await this.createToken({
      userID: payload.userID,
      userEmail: payload.userEmail,
      fullName: payload.fullName,
      phone: payload.phone,
      address: payload.address,
      role: payload.role,
    });
    return {
      data: tokens,
    };
  }
}
