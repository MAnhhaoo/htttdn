import { Global, Injectable } from '@nestjs/common';

@Global()
@Injectable()
export class QueryUtilService {
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
