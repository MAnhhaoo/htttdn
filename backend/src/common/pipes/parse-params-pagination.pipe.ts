import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class ParseParamsPaginationPipe implements PipeTransform {
  transform(value: Record<string, unknown>, _metadata: ArgumentMetadata) {
    value.page = this.parsePositiveInteger(value.page, 1, 'page');

    value.itemPerPage = this.parsePositiveInteger(
      value.itemPerPage,
      10,
      'itemPerPage',
    );

    // Validate enum role
    if (value.role !== undefined && value.role !== '') {
      const validRoles = Object.values(UserRole);
      if (!validRoles.includes(value.role as UserRole)) {
        throw new BadRequestException(
          `role không hợp lệ. Giá trị hợp lệ: ${validRoles.join(', ')}`,
        );
      }
    } else if (value.role === '') {
      value.role = undefined;
    }

    // Validate enum status
    if (value.status !== undefined && value.status !== '') {
      const validStatuses = Object.values(UserStatus);
      if (!validStatuses.includes(value.status as UserStatus)) {
        throw new BadRequestException(
          `status không hợp lệ. Giá trị hợp lệ: ${validStatuses.join(', ')}`,
        );
      }
    } else if (value.status === '') {
      value.status = undefined;
    }

    return value;
  }

  private parsePositiveInteger(
    value: unknown,
    defaultValue: number,
    fieldName: string,
  ) {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }

    const result = Number(value);

    if (!Number.isInteger(result) || result <= 0) {
      throw new BadRequestException(`${fieldName} phải là số nguyên lớn hơn 0`);
    }

    return result;
  }
}
