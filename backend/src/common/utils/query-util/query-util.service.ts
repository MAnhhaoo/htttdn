import { Global, Injectable } from '@nestjs/common';

@Global()
@Injectable()
export class QueryUtilService {
  convertFieldsSelectOption(value?: string) {
    if (!value?.trim()) {
      return undefined;
    }

    return value
      .split(',')
      .map((field) => field.trim())
      .filter(Boolean)
      .reduce<Record<string, boolean>>((result, field) => {
        result[field] = true;
        return result;
      }, {});
  }

  createStringSearchCondition(search: string | undefined, fields: string[]) {
    const keyword = search?.trim();

    if (!keyword) {
      return {};
    }

    return {
      OR: fields.map((field) => ({
        [field]: {
          contains: keyword,
          mode: 'insensitive',
        },
      })),
    };
  }
}
