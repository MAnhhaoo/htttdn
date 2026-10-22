import {
  ExceptionFilter,
  Catch,
  HttpStatus,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { ZodExceptionFilter } from './zod-exception/zod-exception.filter';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import { ApiUtilService } from '../common/utils/api-util/api-util.service';

/**
 * Chuyển lỗi Prisma thành mã HTTP + thông báo thân thiện,
 * tránh trả 500 kèm thông điệp nội bộ của Prisma ra client.
 */
function mapPrismaError(
  exception: unknown,
): { status: number; message: string } | null {
  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    const target = String((exception.meta as any)?.target ?? '');
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: target.includes('email')
            ? 'Email đã được sử dụng'
            : 'Dữ liệu đã tồn tại (trùng giá trị duy nhất)',
        };
      case 'P2025':
        return { status: HttpStatus.NOT_FOUND, message: 'Không tìm thấy dữ liệu' };
      case 'P2003':
        return {
          status: HttpStatus.CONFLICT,
          message: 'Dữ liệu liên kết không hợp lệ hoặc đang được sử dụng',
        };
      case 'P2034':
        return {
          status: HttpStatus.CONFLICT,
          message: 'Dữ liệu vừa được cập nhật bởi thao tác khác, vui lòng thử lại',
        };
      case 'P2000':
      case 'P2006':
      case 'P2007':
      case 'P2011':
      case 'P2012':
      case 'P2023':
        return { status: HttpStatus.BAD_REQUEST, message: 'Dữ liệu không hợp lệ' };
      default:
        return null;
    }
  }
  if (exception instanceof Prisma.PrismaClientValidationError) {
    return { status: HttpStatus.BAD_REQUEST, message: 'Dữ liệu không hợp lệ' };
  }
  return null;
}

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  private readonly logger = new Logger(CatchEverythingFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly zodFilter: ZodExceptionFilter,
    private apiUtilService: ApiUtilService,
  ) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const exceptionValue: {
      status: number;
      exceptions: any;
    } = {
      status: exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR,
      exceptions: [{ message: exception.message ?? exception.error?.message }],
    };

    if (
      exception instanceof ZodValidationException ||
      exception instanceof ZodSerializationException
    ) {
      const zodErrors = this.zodFilter.catch(exception);
      if (zodErrors) {
        exceptionValue.exceptions = zodErrors;
        exceptionValue.status = HttpStatus.BAD_REQUEST;
      }
    } else if (typeof exception?.getStatus !== 'function') {
      const prismaError = mapPrismaError(exception);
      const rawStatus = Number(exception?.status ?? exception?.statusCode);
      if (prismaError) {
        exceptionValue.status = prismaError.status;
        exceptionValue.exceptions = [{ message: prismaError.message }];
      } else if (rawStatus >= 400 && rawStatus < 500) {
        exceptionValue.status = rawStatus;
      } else {
        // Lỗi không xác định: ghi log đầy đủ, chỉ trả thông báo chung cho client
        this.logger.error(exception?.message ?? exception, exception?.stack);
        exceptionValue.exceptions = [{ message: 'Lỗi hệ thống, vui lòng thử lại sau' }];
      }
    }

    const responseBody = this.apiUtilService.formatResponse({
      errors: exceptionValue.exceptions,
    });

    httpAdapter.reply(ctx.getResponse(), responseBody, exceptionValue.status);
  }
}
