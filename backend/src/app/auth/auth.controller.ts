import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/sign.dto';
import { SkipAuth } from './auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('sign-up')
  // @SkipAuth()
  // signUp(@Body() signUpDto: SignUpDto) {
  //   return this.authService.signUp(signUpDto);
  // }
  @Post('sign-in')
  // @SkipAuth()
  // @ZodResponse({ type: SignInResponseDto })
  async signIn(
    @Body() SignInDto: SignInDto,
    // @Res({ passthrough: true }) res: Response,
  ) {
    // const data = await this.authService.signIn(signInDto);
    // res.cookie(TokenKeys.ACCESS_TOKEN_KEY, data.accessToken, {
    //   ...COOKIE_CONFIG_DEFAULT,
    //   maxAge: ms(CookiesToken.ACCESS_TOKEN_EXPIRE_IN),
    // });
    // res.cookie(TokenKeys.REFRESH_TOKEN_KEY, data.refreshToken, {
    //   ...COOKIE_CONFIG_DEFAULT,
    //   maxAge: ms(CookiesToken.REFRESH_TOKEN_EXPIRE_IN),
    // });
    // return data;
  }
}
