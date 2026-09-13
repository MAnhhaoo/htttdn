import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { StringUtilService } from '../../common/utils/string-util/string-util.service';
// import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { SignInDto, SignUpDto } from './dto/sign.dto';
// import { UserInfo } from '../../common/decorators/user.decorator';
import { JWTToken, TokenKeys } from './consts/jwt.const';
// import { MailTemplate } from '../../common/utils/mail-util/mail-util.const';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
// import { MailUtilService } from '../../common/utils/mail-util/mail-util.service';

@Injectable()
export class AuthService {
  // constructor(
  //   private usersService: UsersService,
  //   private stringUtilService: StringUtilService,
  //   private jwtService: JwtService,
  //   private mailUtilService: MailUtilService,
  // ) {}
  // async createToken<T extends Record<string, any>>(payload: T) {
  //   const accessToken = await this.jwtService.signAsync(payload, {
  //     expiresIn: JWTToken.ACCESS_TOKEN_EXPIRE_IN,
  //   });
  //   const refreshToken = await this.jwtService.signAsync(payload, {
  //     expiresIn: JWTToken.REFRESH_TOKEN_EXPIRE_IN,
  //   });
  //   return {
  //     [TokenKeys.ACCESS_TOKEN_KEY]: accessToken,
  //     [TokenKeys.REFRESH_TOKEN_KEY]: refreshToken,
  //   };
  // }
  // async verifyToken(token: string) {
  //   try {
  //     const decoded = await this.jwtService.verifyAsync(token);
  //     return decoded;
  //   } catch (error) {
  //     if (error instanceof TokenExpiredError)
  //       throw new UnauthorizedException(error);
  //   }
  // }
  // async signUp(signUpDto: SignUpDto) {
  //   const { email, password, ...otherInfo } = signUpDto;
  //   const user = await this.usersService.getUser({ email });
  //   if (user) throw new BadRequestException('User already exist!');
  //   const passwordHashed = await this.stringUtilService.hash(password);
  //   const userCreated = await this.usersService.createUser({
  //     email,
  //     password: passwordHashed,
  //     ...otherInfo,
  //   });
  //   const { password: passwordCreated, ...userResponse } = userCreated;
  //   return userResponse;
  // }
  // async signIn(signInDto: SignInDto) {
  //   const { email, password } = signInDto;
  //   const user = await this.usersService.getUser({ email });
  //   const passwordHashed = user?.password;
  //   if (!passwordHashed) throw new UnauthorizedException();
  //   const isMatch = await this.stringUtilService.compare(
  //     password,
  //     passwordHashed,
  //   );
  //   if (!isMatch) throw new UnauthorizedException();
  //   const { id: userID, email: userEmail } = user;
  //   return await this.createToken({ userID, userEmail });
  // }
  // async refreshToken(refreshToken: string) {
  //   const decoded = await this.verifyToken(refreshToken);
  //   const { iat, exp, ...user } = decoded;
  //   return this.createToken(user as UserInfo);
  // }
  // sendSMS() {
  //   return {};
  // }
  // async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
  //   const { email, phone, redirectTo } = forgotPasswordDto;
  //   const user = await this.usersService.extended.findFirst({
  //     where: {
  //       OR: [{ email }, { phone }],
  //     },
  //   });
  //   if (!user) throw new UnauthorizedException('Not found user');
  //   const userEmail = user.email;
  //   if (userEmail) {
  //     await this.mailUtilService.sendMail({
  //       to: userEmail,
  //       subject: 'Reset password',
  //       template: MailTemplate.RESET_PASSWORD,
  //       context: {
  //         redirectTo,
  //       },
  //     });
  //   } else {
  //     this.sendSMS();
  //   }
  // }
  // async resetPassword(resetPasswordDto: ResetPasswordDto) {
  //   const { userID, password, user } = resetPasswordDto;
  //   const dataUpdate = {
  //     password: await this.stringUtilService.hash(password),
  //     user,
  //   };
  //   return await this.usersService.extended.update({
  //     data: dataUpdate,
  //     where: { id: userID },
  //   });
  // }
}
