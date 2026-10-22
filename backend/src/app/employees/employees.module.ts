import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

import { StringUtilModule } from 'src/common/utils/string-util/string-util.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [StringUtilModule, RealtimeModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
