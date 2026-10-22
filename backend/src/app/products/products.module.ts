import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductService } from './products.service';
import { PaginationUtilModule } from 'src/common/utils/paginaton-util/pagination-util.module';
import { StringUtilModule } from 'src/common/utils/string-util/string-util.module';
import { FavoritesController } from './favorites.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [PaginationUtilModule, StringUtilModule, RealtimeModule],
  controllers: [ProductsController, FavoritesController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductsModule {}
