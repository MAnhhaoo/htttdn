import { Module } from '@nestjs/common';
import { ProductVariantController } from './productVariant.controller';
import { ProductVariantService } from './productVariant.service';

@Module({
  controllers: [ProductVariantController],
  providers: [ProductVariantService],
})
export class ProductVariantModule {}
