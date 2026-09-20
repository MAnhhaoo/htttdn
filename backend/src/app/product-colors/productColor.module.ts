import { Module } from '@nestjs/common';
import { StringUtilModule } from 'src/common/utils/string-util/string-util.module';
import { ProductColorController } from './productColor.controller';
import { ProductColorService } from './productColor.service';

@Module({
  imports: [StringUtilModule],
  controllers: [ProductColorController],
  providers: [ProductColorService],
})
export class ProductColorModule {}
