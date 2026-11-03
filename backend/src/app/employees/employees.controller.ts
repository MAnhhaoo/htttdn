import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
  CreateEmployeeDto,
  GetEmployeesPaginationDto,
  SendEmployeeNotificationDto,
  UpdateEmployeeDto,
  UpdateEmployeeProfileDto,
  UpdateEmployeeScheduleDto,
  UpdateEmployeeStatusDto,
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
    @Body() body: UpdateEmployeeProfileDto,
  ) {
    return this.employeesService.updateEmployeeProfile(user.userID, body);
  }

  @Post('notifications/send')
  @Roles('admin')
  sendNotification(@User() user: UserInfo, @Body() body: SendEmployeeNotificationDto) {
    return this.employeesService.sendNotification(user.userID, {
      ...body,
      employeeId: body.employeeId ?? undefined,
    });
  }

  @Get('notifications/mine')
  @Roles('employee')
  getMyNotifications(@User() user: UserInfo) {
    return this.employeesService.getMyNotifications(user.userID);
  }

  @Patch('notifications/read-all')
  @Roles('employee')
  markAllNotificationsRead(@User() user: UserInfo) {
    return this.employeesService.markAllNotificationsRead(user.userID);
  }

  @Patch('notifications/:notifId/read')
  @Roles('employee')
  markNotificationRead(
    @User() user: UserInfo,
    @Param('notifId') notifId: string,
  ) {
    return this.employeesService.markNotificationRead(user.userID, notifId);
  }

  @Get()
  @Roles('admin')
  getEmployees(@Query() query: GetEmployeesPaginationDto) {
    return this.employeesService.getEmployees(query);
  }

  @Get('departments')
  @Roles('admin', 'employee')
  getDepartments() {
    return this.employeesService.getDepartments();
  }

  @Get(':id')
  @Roles('admin', 'employee')
  getEmployee(@Param('id', ParseUUIDPipe) id: string, @User() user: UserInfo) {
    this.assertSelfOrAdmin(id, user);
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
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.updateEmployee(user.userID, id, dto);
  }

  @Patch(':id/schedule')
  @Roles('admin')
  updateSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateEmployeeScheduleDto,
  ) {
    return this.employeesService.updateSchedule(id, body);
  }

  @Patch(':id/status')
  @Roles('admin')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateEmployeeStatusDto,
  ) {
    return this.employeesService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @Roles('admin')
  deleteEmployee(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.deleteEmployee(id);
  }

  @Get(':id/salary-history')
  @Roles('admin', 'employee')
  getSalaryHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: UserInfo,
  ) {
    this.assertSelfOrAdmin(id, user);
    return this.employeesService.getSalaryHistory(id);
  }

  private assertSelfOrAdmin(id: string, user: UserInfo) {
    if (user.role !== 'admin' && id !== user.userID) {
      throw new ForbiddenException('Bạn chỉ được xem hồ sơ và lịch sử lương của chính mình');
    }
  }
}
