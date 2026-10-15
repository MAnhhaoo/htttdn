import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { User } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import {
  CalculatePayrollDto,
  RecordAttendanceDto,
  UpdatePayrollItemDto,
} from './dto/payroll.dto';
import { PayrollService } from './payroll.service';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('calculate')
  @Roles('admin')
  calculate(@Body() dto: CalculatePayrollDto) {
    return this.payrollService.calculateMonthlyPayroll(dto);
  }

  @Get()
  @Roles('admin')
  list(
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Query('department') department?: string,
    @Query('status') status?: string,
  ) {
    return this.payrollService.listPayrolls(month, year, department, status);
  }

  @Patch(':id')
  @Roles('admin')
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePayrollItemDto,
  ) {
    return this.payrollService.updatePayrollItem(id, dto);
  }

  @Get('my-payslips')
  @Roles('employee')
  getMyPayslips(@User() user: UserInfo) {
    return this.payrollService.getMyPayrolls(user.userID);
  }

  @Post('attendance')
  @Roles('admin', 'employee')
  recordAttendance(@Body() dto: RecordAttendanceDto) {
    return this.payrollService.recordAttendance(dto);
  }

  @Get('attendance')
  @Roles('admin', 'employee')
  listAttendance(
    @Query('employeeId') employeeId?: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
    @User() user?: UserInfo,
  ) {
    const targetEmployeeId = user?.role === 'employee' ? user.userID : employeeId;
    return this.payrollService.listAttendance(targetEmployeeId, month, year);
  }
}
