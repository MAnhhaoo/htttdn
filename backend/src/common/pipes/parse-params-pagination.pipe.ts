import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseParamsPaginationPipe implements PipeTransform {
  transform(value: Record<string, unknown>, _metadata: ArgumentMetadata) {
    value.page = this.parsePositiveInteger(value.page, 1, 'page');

    value.itemPerPage = this.parsePositiveInteger(
      value.itemPerPage,
      10,
      'itemPerPage',
    );

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
