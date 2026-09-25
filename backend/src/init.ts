import { cleanupOpenApiDoc } from 'nestjs-zod';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { applyMiddlewares } from './common/middlewares/common.middleware';

const initOpenAPI = (app: INestApplication) => {
  const { APP_NAME } = process.env;
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
  const { APP_PREFIX = '/api', FE_URL, NODE_ENV } = process.env;
  app.setGlobalPrefix(APP_PREFIX);

  // Cho phép tất cả localhost trong development, hoặc FE_URL cụ thể trong production
  const allowedOrigins = NODE_ENV === 'development'
    ? [/^http:\/\/localhost:\d+$/]  // cho phép mọi port localhost
    : FE_URL
      ? FE_URL.split(',').map(u => u.trim())
      : [];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  // app.enableVersioning({
  //   type: VersioningType.HEADER,
  //   header: 'x-api-version',
  //   defaultVersion: '1',
  // });
  applyMiddlewares(app);
  initOpenAPI(app);
  app.enableShutdownHooks();
  return app;
};
export { initApp };
