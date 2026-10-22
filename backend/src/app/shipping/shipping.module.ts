import { Module } from '@nestjs/common';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [RealtimeModule, OrdersModule],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
