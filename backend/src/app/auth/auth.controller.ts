import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
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
   * Đăng nhập và lưu token vào cookie.
   */
  @Post('sign-in')
  @SkipAuth()
  @ZodResponse({
    type: SignInResponseDto,
  })
  async signIn(
    @Body() signInDto: SignInDto,

    @Res({ passthrough: true })
    response: Response,
  ) {
    const result = await this.authService.signIn(signInDto);

    response.cookie(TokenKeys.ACCESS_TOKEN_KEY, result.data.accessToken, {
      ...COOKIE_CONFIG_DEFAULT,

      maxAge: ms(CookiesToken.ACCESS_TOKEN_EXPIRE_IN),
    });

    response.cookie(TokenKeys.REFRESH_TOKEN_KEY, result.data.refreshToken, {
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
    @Cookies(TokenKeys.REFRESH_TOKEN_KEY)
    refreshToken: string | undefined,

    @Res({ passthrough: true })
    response: Response,
  ) {
    const result = await this.authService.refreshToken(refreshToken);

    response.cookie(TokenKeys.ACCESS_TOKEN_KEY, result.data.accessToken, {
      ...COOKIE_CONFIG_DEFAULT,

      maxAge: ms(CookiesToken.ACCESS_TOKEN_EXPIRE_IN),
    });

    response.cookie(TokenKeys.REFRESH_TOKEN_KEY, result.data.refreshToken, {
      ...COOKIE_CONFIG_DEFAULT,

      maxAge: ms(CookiesToken.REFRESH_TOKEN_EXPIRE_IN),
    });

    return result;
  }

  /**
   * Đăng xuất.
   *
   * @remarks
   * **Stateless logout** – Chỉ xóa cookie access_token và refresh_token phía client.
   * Token phía server KHÔNG bị revoke (không dùng blacklist/denylist).
   * Điều này có nghĩa là nếu ai đó giữ token hợp lệ, họ vẫn có thể dùng cho đến khi token hết hạn.
   * Nếu cần revoke token (vd: force logout, đổi mật khẩu), hãy triển khai token blacklist (Redis,...).
   */
  @Post('sign-out')
  @SkipAuth()
  signOut(
    @Res({ passthrough: true })
    response: Response,
  ) {
    response.clearCookie(TokenKeys.ACCESS_TOKEN_KEY, COOKIE_CONFIG_DEFAULT);

    response.clearCookie(TokenKeys.REFRESH_TOKEN_KEY, COOKIE_CONFIG_DEFAULT);

    return {
      message: 'Đăng xuất thành công',
    };
  }
}
