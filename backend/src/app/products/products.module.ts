import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductService } from './products.service';
import { PaginationUtilModule } from 'src/common/utils/paginaton-util/pagination-util.module';
import { StringUtilModule } from 'src/common/utils/string-util/string-util.module';

@Module({
  imports: [PaginationUtilModule, StringUtilModule],
  controllers: [ProductsController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductsModule {}
