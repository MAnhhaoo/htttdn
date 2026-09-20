import { Module } from '@nestjs/common';
import { PaginationUtilService } from './pagintion-util.service';

@Module({
  providers: [PaginationUtilService],
  exports: [PaginationUtilService],
})
export class PaginationUtilModule {}
