import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

export const applyMiddlewares = (app: INestApplication): void => {
  app.use(helmet());
  app.use(cookieParser());
};
