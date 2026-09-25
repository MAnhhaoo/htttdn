import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';

import { AppModule } from './app/app.module';
import { initApp } from './init';
import { LoggerModule } from './logger/logger.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: LoggerModule.createLogger(),
  });

  const {
    PORT = 3000,
    HOST = 'localhost',
    APP_PREFIX = '/api',
    APP_NAME = 'nestjs_ecommerce',
    NODE_ENV = 'development',
  } = process.env;

  // Cho phép truy cập file trong thư mục uploads
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  if (NODE_ENV !== 'production') {
    app.getHttpAdapter().getInstance().set('json spaces', 2);
  }

  initApp(app);

  await app.listen(PORT, HOST);

  const protocol = NODE_ENV === 'production' ? 'https' : 'http';

  Logger.log(
    `Service is running at ${protocol}://${HOST}:${PORT}${APP_PREFIX}`,
    APP_NAME,
  );
}

void bootstrap();
