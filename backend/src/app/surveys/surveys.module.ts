import { Module } from '@nestjs/common';

import { RealtimeModule } from 'src/app/realtime/realtime.module';
import { SurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';

@Module({
  imports: [RealtimeModule],
  controllers: [SurveysController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}
