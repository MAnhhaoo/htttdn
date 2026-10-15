import { Module } from '@nestjs/common';

import { PaginationUtilModule } from '../../common/utils/paginaton-util/pagination-util.module';
import { QueryUtilModule } from '../../common/utils/query-util/query-util.module';

import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';

@Module({
  imports: [PaginationUtilModule, QueryUtilModule],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminModule {}
