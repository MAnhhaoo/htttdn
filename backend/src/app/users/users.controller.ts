import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UsePipes,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { Roles } from '../../common/guards/access-control/roles.decorator';

import { User as CurrentUser } from '../../common/decorators/user.decorator';

import type { UserInfo } from '../../common/decorators/user.decorator';

import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe';

import { ParseParamsOptionPipe } from '../../common/pipes/parse-params-option.pipe';

import type { GetOptionsParams } from '../../common/query/options.interface';

import { UsersService } from './users.service';

import { UpdateUserDto } from './dto/update-user.dto';

import type { GetUsersPaginationDto } from './dto/get-user.dto';

import type { User as UserEntity } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Danh sách user:
   * - phân trang
   * - tìm kiếm
   * - lọc status
   * - lọc role
   */
  @Get()
  @Roles(UserRole.admin)
  @UsePipes(ParseParamsPaginationPipe)
  getUsers(
    @Query()
    query: GetUsersPaginationDto,
  ) {
    return this.usersService.getUsers(query);
  }

  /**
   * Danh sách user rút gọn.
   * Dùng cho dropdown/select.
   *
   * Phải đặt trước @Get(':id').
   */
  @Get('options')
  @Roles(UserRole.admin)
  @UsePipes(ParseParamsOptionPipe)
  getUserOptions(
    @Query()
    query: GetOptionsParams<UserEntity>,
  ) {
    return this.usersService.getOptions(query);
  }

  /**
   * Lấy thông tin người dùng
   * đang đăng nhập.
   */
  @Get('profile')
  getProfile(
    @CurrentUser()
    user: UserInfo,
  ) {
    return this.usersService.getUser({
      id: user.userID,
    });
  }

  /**
   * Cập nhật thông tin người dùng
   * đang đăng nhập.
   */
  @Patch('profile')
  updateProfile(
    @CurrentUser()
    user: UserInfo,

    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser({
      where: {
        id: user.userID,
      },

      data: updateUserDto,
    });
  }

  /**
   * Admin lấy một user theo ID.
   */
  @Get(':id')
  @Roles(UserRole.admin)
  getUser(
    @Param('id')
    id: string,
  ) {
    return this.usersService.getUser({
      id,
    });
  }

  /**
   * Admin cập nhật user theo ID.
   */
  @Patch(':id')
  @Roles(UserRole.admin)
  updateUser(
    @Param('id')
    id: string,

    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser({
      where: {
        id,
      },

      data: updateUserDto,
    });
  }

  /**
   * Admin vô hiệu hóa user.
   */
  @Delete(':id')
  @Roles(UserRole.admin)
  deleteUser(
    @Param('id')
    id: string,
  ) {
    return this.usersService.deleteUser({
      id,
    });
  }
}
