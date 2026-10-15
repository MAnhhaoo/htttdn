import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { Roles } from '../../common/guards/access-control/roles.decorator';
import { User, type UserInfo } from '../../common/decorators/user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from '../clients/dto/update-client.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  getUsers(
    @Query('page') page?: number,
    @Query('itemPerPage') itemPerPage?: number,
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.getUsers({
      page,
      itemPerPage,
      role,
      search,
      status,
    });
  }

  @Get('profile')
  @Roles('admin', 'client', 'vendor', 'employee')
  getProfile(@User() user: UserInfo) {
    return this.usersService.getUser(user.userID);
  }

  @Patch('profile')
  @Roles('admin', 'client', 'vendor', 'employee')
  updateProfile(@User() user: UserInfo, @Body() data: UpdateProfileDto) {
    return this.usersService.updateUser(user.userID, data);
  }

  @Get(':id')
  @Roles('admin')
  getUser(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @Patch(':id')
  @Roles('admin')
  updateUser(@Param('id') id: string, @Body() data: any) {
    return this.usersService.updateUser(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
