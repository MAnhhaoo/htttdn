import { Injectable } from '@nestjs/common';
import { Pagination } from './pagination-util.interface';

@Injectable()
export class PaginationUtilService extends Pagination {
  paging({ page = 1, itemPerPage = 5, totalItems = 0 }) {
    const skip = (page - 1) * itemPerPage;
    const totalPages = Math.ceil(totalItems / itemPerPage);

    return {
      skip,
      format<T>(list: T) {
        return { list, totalPages, totalItems };
      },
    };
  }
}
