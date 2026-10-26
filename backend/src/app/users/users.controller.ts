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
import { User, type UserInfo } from '../../common/decorators/user.decorator';
import { UsersService } from './users.service';
import {
  GetUsersPaginationDto,
  UpdateUserDto,
  UpdateUserProfileDto,
  UpdateUserStatusDto,
} from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  getUsers(@Query() query: GetUsersPaginationDto) {
    return this.usersService.getUsers(query);
  }

  @Get('profile')
  @Roles('admin', 'client', 'vendor', 'employee')
  getProfile(@User() user: UserInfo) {
    return this.usersService.getUser(user.userID);
  }

  @Patch('profile')
  @Roles('admin', 'client', 'vendor', 'employee')
  updateProfile(@User() user: UserInfo, @Body() data: UpdateUserProfileDto) {
    return this.usersService.updateUser(user.userID, data, user);
  }

  @Get(':id')
  @Roles('admin')
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUser(id);
  }

  @Patch(':id')
  @Roles('admin')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateUserDto,
    @User() user: UserInfo,
  ) {
    return this.usersService.updateUser(id, data, user);
  }

  @Patch(':id/status')
  @Roles('admin')
  updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserStatusDto,
    @User() user: UserInfo,
  ) {
    return this.usersService.updateUserStatus(id, body.status, user);
  }

  @Delete(':id')
  @Roles('admin')
  deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: UserInfo,
  ) {
    return this.usersService.deleteUser(id, user);
  }
}
