import { Controller, Get, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { User } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { CustomerReportQueryDto } from './dto/customer-report.dto';
import { ReportsService } from './reports.service';

@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('admin/reports/customers')
  @Roles(UserRole.admin)
  adminCustomers(
    @Query() query: CustomerReportQueryDto,
    @User() user: UserInfo,
  ) {
    return this.reportsService.customerReport(user, query);
  }

  @Get('vendor/reports/customers')
  @Roles(UserRole.vendor)
  vendorCustomers(
    @Query() query: CustomerReportQueryDto,
    @User() user: UserInfo,
  ) {
    return this.reportsService.customerReport(user, query);
  }
}
