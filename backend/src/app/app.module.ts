import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/users.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { LoggingInterceptor } from 'src/logger/logging.interceptor';
import { CatchEverythingFilter } from 'src/catch-everything/carch-everything.filter';
import { ZodExceptionFilter } from 'src/catch-everything/zod-exception/zod-exception.filter';
import { ApiUtilModule } from 'src/common/utils/api-util/api-until.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AccessControlGuard } from 'src/common/guards/access-control/access-control.guard';
import { AuthGuard } from './auth/auth.guard';
import { validate } from 'src/common/envs/validate.env';
import { CategoryModule } from './categories/category.module';
import { StringUtilModule } from 'src/common/utils/string-util/string-util.module';
import { ProductsModule } from './products/products.module';
import { ProductColorModule } from './product-colors/productColor.module';
import { ProductVariantModule } from './product-variants/productVariant.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { CartModule } from './cart/cart.module';
import { RealtimeModule } from './realtime/realtime.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // cho phép sử dụng config service
      expandVariables: true, // cho phép tái sử dụng các biến trong env
      validate: validate,
    }),
    PrismaModule,
    UserModule,
    ApiUtilModule,
    AuthModule,
    CategoryModule,
    StringUtilModule,
    ProductsModule,
    ProductColorModule,
    ProductVariantModule,
    VouchersModule,
    CartModule,
    RealtimeModule,
    OrdersModule,
    PaymentsModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ZodExceptionFilter,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AccessControlGuard,
    },
  ],
})
export class AppModule {}
