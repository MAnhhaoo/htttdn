import { Injectable } from '@nestjs/common';
import { Pagination } from './pagination-util.interface';

export function normalizePagination(params?: {
  page?: number | string;
  itemPerPage?: number | string;
  defaultItemPerPage?: number;
  maxItemPerPage?: number;
}) {
  const defaultTake = params?.defaultItemPerPage ?? 10;
  const maxTake = params?.maxItemPerPage ?? 100;
  const rawPage = Number(params?.page);
  const rawTake = Number(params?.itemPerPage);
  const page =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const itemPerPage =
    Number.isFinite(rawTake) && rawTake >= 1
      ? Math.min(maxTake, Math.floor(rawTake))
      : defaultTake;
  const skip = (page - 1) * itemPerPage;
  return { page, itemPerPage, skip };
}

export function formatPaginatedList<T>(
  list: T,
  totalItems: number,
  params?: { page?: number | string; itemPerPage?: number | string; defaultItemPerPage?: number },
) {
  const { page, itemPerPage } = normalizePagination(params);
  const totalPages = Math.ceil(totalItems / itemPerPage) || 1;
  return {
    list,
    page,
    currentPage: page,
    itemPerPage,
    totalItems,
    totalPages,
  };
}

@Injectable()
export class PaginationUtilService extends Pagination {
  paging({ page = 1, itemPerPage = 5, totalItems = 0 }) {
    const normalized = normalizePagination({
      page,
      itemPerPage,
      defaultItemPerPage: 5,
    });
    const totalPages = Math.ceil(totalItems / normalized.itemPerPage);

    return {
      page: normalized.page,
      itemPerPage: normalized.itemPerPage,
      skip: normalized.skip,
      totalPages,
      format<T>(list: T) {
        return {
          list,
          page: normalized.page,
          currentPage: normalized.page,
          itemPerPage: normalized.itemPerPage,
          totalPages: totalPages || 1,
          totalItems,
        };
      },
    };
  }
}
