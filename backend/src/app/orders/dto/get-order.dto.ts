import { Pagination } from 'src/common/utils/paginaton-util/pagination-util.interface';

export class GetOrdersPaginationDto extends Pagination {
  status?: string;
  sortOrder?: 'asc' | 'desc';
  groupByBatch?: boolean | string;
  employeeId?: string;
}
