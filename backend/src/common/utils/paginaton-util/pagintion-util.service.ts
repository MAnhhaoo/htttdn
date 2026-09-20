import { Injectable } from '@nestjs/common';
import { Pagination } from './pagination-util.interface';

@Injectable()
export class PaginationUtilService extends Pagination {
  private _skip: number;
  public get skip(): number {
    return this._skip;
  }
  public set skip(value: number) {
    this._skip = value;
  }

  private _totalPages: number;
  public get totalPages(): number {
    return this._totalPages;
  }
  public set totalPages(value: number) {
    this._totalPages = value;
  }
  private totalItems: number;

  paging({ page = 1, itemPerPage = 5, totalItems = 0 }) {
    this.totalItems = totalItems;
    const skip = (page - 1) * itemPerPage;
    this.skip = skip;
    const totalPages = Math.ceil(totalItems / itemPerPage);
    this.totalPages = totalPages;
    return this;
  }

  format<T>(list: T) {
    return {
      list,
      totalPages: this.totalPages,
      totalItems: this.totalItems,
    };
  }
}
