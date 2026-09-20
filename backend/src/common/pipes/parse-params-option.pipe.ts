import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseParamsOptionPipe implements PipeTransform {
  transform(value: Record<string, unknown>, _metadata: ArgumentMetadata) {
    if (
      value.limit === undefined ||
      value.limit === null ||
      value.limit === ''
    ) {
      value.limit = 10;
      return value;
    }

    const limit = Number(value.limit);

    if (!Number.isInteger(limit) || limit <= 0) {
      throw new BadRequestException('limit phải là số nguyên lớn hơn 0');
    }

    value.limit = limit;

    return value;
  }
}
