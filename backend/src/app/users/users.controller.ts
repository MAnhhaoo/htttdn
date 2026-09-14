import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { AccessControlGuard } from '../../common/guards/access-control/access-control.guard';
import { Roles } from '../../common/guards/access-control/roles.decorator';
import { User as CurrentUser } from '../../common/decorators/user.decorator';
import type { UserInfo } from '../../common/decorators/user.decorator';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(AccessControlGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.admin)
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get('profile')
  getProfile(@CurrentUser() user: UserInfo) {
    return this.usersService.getUser({
      id: user.userID,
    });
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: UserInfo,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser({
      where: { id: user.userID },
      data: updateUserDto,
    });
  }

  @Get(':id')
  @Roles(UserRole.admin)
  getUser(@Param('id') id: string) {
    return this.usersService.getUser({
      id,
    });
  }

  @Patch(':id')
  @Roles(UserRole.admin)
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser({
      where: { id },
      data: updateUserDto,
    });
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser({
      id,
    });
  }
}
