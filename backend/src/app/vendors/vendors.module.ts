import { Module } from '@nestjs/common';

import { PaginationUtilModule } from '../../common/utils/paginaton-util/pagination-util.module';
import { QueryUtilModule } from '../../common/utils/query-util/query-util.module';

import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

@Module({
  imports: [PaginationUtilModule, QueryUtilModule],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorModule {}
