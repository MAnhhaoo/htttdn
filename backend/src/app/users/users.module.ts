import { Module } from '@nestjs/common';

import { PaginationUtilModule } from '../../common/utils/paginaton-util/pagination-util.module';
import { QueryUtilModule } from '../../common/utils/query-util/query-util.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PaginationUtilModule, QueryUtilModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UserModule {}
