import { Module } from '@nestjs/common';
import { ProductVariantController } from './productVariant.controller';
import { ProductVariantService } from './productVariant.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  controllers: [ProductVariantController],
  providers: [ProductVariantService],
})
export class ProductVariantModule {}
