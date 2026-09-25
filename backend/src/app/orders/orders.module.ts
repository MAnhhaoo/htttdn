import { Module } from '@nestjs/common';
import { RealtimeModule } from 'src/app/realtime/realtime.module';
import { VouchersModule } from 'src/app/vouchers/vouchers.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [VouchersModule, RealtimeModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
