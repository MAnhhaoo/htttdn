import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { User } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import {
  CreateEmployeeDto,
  GetEmployeesPaginationDto,
  UpdateEmployeeDto,
} from './dto/employee.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('profile')
  @Roles('employee')
  getProfile(@User() user: UserInfo) {
    return this.employeesService.getEmployeeProfile(user.userID);
  }

  @Patch('profile')
  @Roles('employee')
  updateProfile(
    @User() user: UserInfo,
    @Body() body: { phone?: string; address?: string; avatarUrl?: string },
  ) {
    return this.employeesService.updateEmployeeProfile(user.userID, body);
  }

  @Get()
  @Roles('admin')
  getEmployees(@Query() query: GetEmployeesPaginationDto) {
    return this.employeesService.getEmployees(query);
  }

  @Get(':id')
  @Roles('admin', 'employee')
  getEmployee(@Param('id') id: string) {
    return this.employeesService.getEmployeeById(id);
  }

  @Post()
  @Roles('admin')
  createEmployee(@User() user: UserInfo, @Body() dto: CreateEmployeeDto) {
    return this.employeesService.createEmployee(user.userID, dto);
  }

  @Patch(':id')
  @Roles('admin')
  updateEmployee(
    @User() user: UserInfo,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.updateEmployee(user.userID, id, dto);
  }

  @Patch(':id/status')
  @Roles('admin')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'inactive',
  ) {
    return this.employeesService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('admin')
  deleteEmployee(@Param('id') id: string) {
    return this.employeesService.deleteEmployee(id);
  }

  @Get(':id/salary-history')
  @Roles('admin', 'employee')
  getSalaryHistory(@Param('id') id: string) {
    return this.employeesService.getSalaryHistory(id);
  }
}
