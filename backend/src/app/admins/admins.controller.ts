import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';

import { Roles } from '../../common/guards/access-control/roles.decorator';

import { User } from '../../common/decorators/user.decorator';

import type { UserInfo as AdminInfo } from '../../common/decorators/user.decorator';

import { AdminsService } from './admins.service';

import { UpdateAdminProfileDto, UpdateAdminDto } from './dto/update-admin.dto';

import { GetAdminsPaginationDto } from './dto/get-admin.dto';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  /**
   * Danh sách admin:
   * - phân trang
   * - tìm kiếm
   * - lọc status
   */
  @Get()
  @Roles('admin')
  getAdmins(@Query() query: GetAdminsPaginationDto) {
    return this.adminsService.getAdmins(query);
  }

  /**
   * Lấy thông tin người dùng
   * đang đăng nhập.
   */
  @Get('profile')
  @Roles('admin')
  getProfile(
    @User()
    admin: AdminInfo,
  ) {
    return this.adminsService.getAdmin({
      id: admin.userID,
    });
  }

  /**
   * Cập nhật thông tin người dùng
   * đang đăng nhập.
   */
  @Patch('profile')
  @Roles('admin')
  updateProfile(
    @User()
    admin: AdminInfo,

    @Body()
    updateAdminDto: UpdateAdminProfileDto,
  ) {
    return this.adminsService.updateAdmin({
      where: {
        id: admin.userID,
      },

      data: updateAdminDto,
      currentUser: admin,
    });
  }

  /**
   * Admin lấy một admin theo ID.
   */
  @Get(':id')
  @Roles('admin')
  getAdmin(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.adminsService.getAdmin({
      id,
    });
  }

  /**
   * Admin cập nhật admin theo ID.
   */
  @Patch(':id')
  @Roles('admin')
  updateAdmin(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    updateAdminDto: UpdateAdminDto,

    @User()
    admin: AdminInfo,
  ) {
    return this.adminsService.updateAdmin({
      where: {
        id,
      },

      data: updateAdminDto,
      currentUser: admin,
    });
  }

  /**
   * Admin khóa tài khoản admin.
   */
  @Delete(':id')
  @Roles('admin')
  deleteAdmin(
    @Param('id', ParseUUIDPipe)
    id: string,

    @User()
    admin: AdminInfo,
  ) {
    return this.adminsService.deleteAdmin({ id }, admin);
  }
}
