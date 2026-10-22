import { Module } from '@nestjs/common';

import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  controllers: [VouchersController],
  providers: [VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}
