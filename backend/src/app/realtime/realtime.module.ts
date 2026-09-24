import { Module } from '@nestjs/common';
import { AuthModule } from 'src/app/auth/auth.module';
import { UserModule } from 'src/app/users/users.module';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';

@Module({
  imports: [AuthModule, UserModule],
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
