import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const startedAt = Date.now();
    const logContext = `${context.getClass().name} > ${context.getHandler().name}`;
    Logger.log({
      context: logContext,
      method: req.method,
    });

    return next.handle().pipe(
      map((value) => {
        Logger.log({ context: logContext, durationMs: Date.now() - startedAt });
        return value;
      }),
      catchError((err) => {
        Logger.error({
          context: logContext,
          durationMs: Date.now() - startedAt,
          errorType: err instanceof Error ? err.name : 'UnknownError',
        });
        return throwError(() => err);
      }),
    );
  }
}
