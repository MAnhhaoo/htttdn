import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodResponse } from 'nestjs-zod';
import ms from 'ms';

import { AuthService } from './auth.service';
import { SkipAuth } from './auth.decorator';
import { SignInDto, SignInResponseDto, SignUpDto } from './dto/sign.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
import { TokenKeys } from './consts/jwt.const';

import { Cookies } from '../../common/decorators/cookie/cookie.decorator';
import {
  COOKIE_CONFIG_DEFAULT,
  CookiesToken,
} from '../../common/decorators/cookie/cookie.const';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Đăng ký tài khoản.
   */
  @Post('sign-up')
  @SkipAuth()
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  /**
   * Đăng ký tài khoản vendor.
   */
  @Post('sign-up/vendor')
  @SkipAuth()
  signUpVendor(@Body() signUpDto: SignUpDto) {
    return this.authService.signUpVendor(signUpDto);
  }

  /**
   * Đăng nhập và lưu token vào cookie.
   */
  @Post('sign-in')
  @SkipAuth()
  @ZodResponse({
    type: SignInResponseDto,
  })
  async signIn(
    @Body() signInDto: SignInDto,

    @Req() request: Request,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const result = await this.authService.signIn(signInDto);

    const appRole = request.headers['x-app-role'] as string;
    const suffix = appRole ? `_${appRole}` : '';
    const accessKey = `${TokenKeys.ACCESS_TOKEN_KEY}${suffix}`;
    const refreshKey = `${TokenKeys.REFRESH_TOKEN_KEY}${suffix}`;

    response.cookie(accessKey, result.data.accessToken, {
      ...COOKIE_CONFIG_DEFAULT,

      maxAge: ms(CookiesToken.ACCESS_TOKEN_EXPIRE_IN),
    });

    response.cookie(refreshKey, result.data.refreshToken, {
      ...COOKIE_CONFIG_DEFAULT,

      maxAge: ms(CookiesToken.REFRESH_TOKEN_EXPIRE_IN),
    });

    return result;
  }

  /**
   * Dùng refresh token để cấp cặp token mới.
   */
  @Post('refresh-token')
  @SkipAuth()
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const appRole = request.headers['x-app-role'] as string;
    const suffix = appRole ? `_${appRole}` : '';
    const accessKey = `${TokenKeys.ACCESS_TOKEN_KEY}${suffix}`;
    const refreshKey = `${TokenKeys.REFRESH_TOKEN_KEY}${suffix}`;

    const refreshToken = (request.cookies as Record<string, string>)?.[refreshKey];

    const result = await this.authService.refreshToken(refreshToken);

    response.cookie(accessKey, result.data.accessToken, {
      ...COOKIE_CONFIG_DEFAULT,

      maxAge: ms(CookiesToken.ACCESS_TOKEN_EXPIRE_IN),
    });

    response.cookie(refreshKey, result.data.refreshToken, {
      ...COOKIE_CONFIG_DEFAULT,

      maxAge: ms(CookiesToken.REFRESH_TOKEN_EXPIRE_IN),
    });

    return result;
  }

  /**
   * Đăng xuất.
   */
  @Post('sign-out')
  @SkipAuth()
  signOut(
    @Req() request: Request,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const appRole = request.headers['x-app-role'] as string;
    const suffix = appRole ? `_${appRole}` : '';
    const accessKey = `${TokenKeys.ACCESS_TOKEN_KEY}${suffix}`;
    const refreshKey = `${TokenKeys.REFRESH_TOKEN_KEY}${suffix}`;

    response.clearCookie(accessKey, COOKIE_CONFIG_DEFAULT);
    response.clearCookie(refreshKey, COOKIE_CONFIG_DEFAULT);

    return {
      message: 'Đăng xuất thành công',
    };
  }
}
