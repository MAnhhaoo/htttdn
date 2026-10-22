import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { PaginationUtilModule } from 'src/common/utils/paginaton-util/pagination-util.module';
import { QueryUtilModule } from 'src/common/utils/query-util/query-util.module';
import { StringUtilModule } from 'src/common/utils/string-util/string-util.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [PaginationUtilModule, QueryUtilModule, StringUtilModule, RealtimeModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
