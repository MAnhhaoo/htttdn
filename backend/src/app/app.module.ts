import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/users.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from 'src/logger/logging.interceptor';
import { CatchEverythingFilter } from 'src/catch-everything/carch-everything.filter';
import { ZodExceptionFilter } from 'src/catch-everything/zod-exception/zod-exception.filter';
import { ApiUtilModule } from 'src/common/utils/api-util/api-until.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // cho phép sử dụng config service
      expandVariables: true, // cho phép tái sử dụng các biến trong env
      // validate: validate,
    }),
    PrismaModule,
    UserModule,
    ApiUtilModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ZodExceptionFilter,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
  ],
})
export class AppModule {}
