import { Module } from '@nestjs/common';

import { PaginationUtilModule } from '../../common/utils/paginaton-util/pagination-util.module';
import { QueryUtilModule } from '../../common/utils/query-util/query-util.module';

import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  imports: [PaginationUtilModule, QueryUtilModule],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientModule {}
