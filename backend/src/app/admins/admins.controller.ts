import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UsePipes} from '@nestjs/common';



import { Roles } from '../../common/guards/access-control/roles.decorator';

import { User } from '../../common/decorators/user.decorator';

import type { UserInfo as AdminInfo } from '../../common/decorators/user.decorator';

import { ParseParamsOptionPipe } from '../../common/pipes/parse-params-option.pipe';

import type { GetOptionsParams } from '../../common/query/options.interface';

import { AdminsService } from './admins.service';

import { UpdateProfileDto, UpdateAdminDto } from './dto/update-admin.dto';

import { GetAdminsPaginationDto } from './dto/get-admin.dto';

import type { Admin as AdminEntity } from './entities/admin.entity';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  /**
   * Danh sách admin:
   * - phân trang
   * - tìm kiếm
   * - lọc status
   * - lọc role
   */
  @Get()
  @Roles('admin')
  getAdmins(@Query() query: GetAdminsPaginationDto) {
    return this.adminsService.getAdmins(query);
  }

  /**
   * Danh sách admin rút gọn.
   * Dùng cho dropdown/select.
   *
   * Phải đặt trước @Get(':id').
   */
  @Get('options')
  @Roles('admin')
  @UsePipes(ParseParamsOptionPipe)
  getAdminOptions(
    @Query()
    query: GetOptionsParams<AdminEntity>,
  ) {
    return this.adminsService.getOptions(query);
  }

  /**
   * Lấy thông tin người dùng
   * đang đăng nhập.
   */
  @Get('profile')
  getProfile(
    @User()
    admin: AdminInfo,
  ) {
    return this.adminsService.getAdmin({
      id: admin.userID});
  }

  /**
   * Cập nhật thông tin người dùng
   * đang đăng nhập.
   */
  @Patch('profile')
  @Roles('client', 'vendor', 'admin')
  updateProfile(
    @User()
    admin: AdminInfo,

    @Body()
    updateAdminDto: UpdateProfileDto,
  ) {
    return this.adminsService.updateAdmin({
      where: {
        id: admin.userID},

      data: updateAdminDto});
  }

  /**
   * Admin lấy một admin theo ID.
   */
  @Get(':id')
  @Roles('admin')
  getAdmin(
    @Param('id')
    id: string,
  ) {
    return this.adminsService.getAdmin({
      id});
  }

  /**
   * Admin cập nhật admin theo ID.
   */
  @Patch(':id')
  @Roles('admin')
  updateAdmin(
    @Param('id')
    id: string,

    @Body()
    updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminsService.updateAdmin({
      where: {
        id},

      data: updateAdminDto});
  }

  /**
   * Admin vô hiệu hóa admin.
   */
  @Delete(':id')
  @Roles('admin')
  deleteAdmin(
    @Param('id')
    id: string,
  ) {
    return this.adminsService.deleteAdmin({
      id});
  }
}
