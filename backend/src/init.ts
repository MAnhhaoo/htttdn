import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

// import { applyMiddlewares } from './catch-everything/middlewares/common.middleware';
import { LoggingInterceptor } from './logger/logging.interceptor';

const initOpenAPI = (app: INestApplication) => {
  const { APP_NAME = 'Ecommerce' } = process.env;

  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(`${APP_NAME} API`)
      .setDescription(`${APP_NAME} API description`)
      .setVersion('1.0.0')
      .build(),
  );

  SwaggerModule.setup('api', app, cleanupOpenApiDoc(openApiDoc));
};

const initApp = (app: INestApplication) => {
  const { APP_PREFIX = 'api', FE_URL } = process.env;

  app.setGlobalPrefix(APP_PREFIX);

  if (FE_URL) {
    app.enableCors({
      origin: FE_URL,
    });
  }

  // applyMiddlewares(app);

  // Đăng ký LoggingInterceptor cho toàn bộ API
  app.useGlobalInterceptors(new LoggingInterceptor());

  initOpenAPI(app);
  app.enableShutdownHooks();

  return app;
};

export { initApp };
