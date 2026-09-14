import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../users/users.module';
import { StringUtilService } from '../../common/utils/string-util/string-util.service';
import { JWTEnvs } from './consts/jwt.const';

@Module({
  imports: [
    UserModule,

    JwtModule.registerAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>(JWTEnvs.JWT_SECRET),
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService, StringUtilService],

  exports: [AuthService],
})
export class AuthModule {}
