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

import type { UserInfo as ClientInfo } from '../../common/decorators/user.decorator';

import { ClientsService } from './clients.service';

import { UpdateClientProfileDto, UpdateClientDto } from './dto/update-client.dto';

import { GetClientsPaginationDto } from './dto/get-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Danh sách client:
   * - phân trang
   * - tìm kiếm
   * - lọc status
   */
  @Get()
  @Roles('admin')
  getClients(@Query() query: GetClientsPaginationDto) {
    return this.clientsService.getClients(query);
  }

  /**
   * Lấy thông tin người dùng
   * đang đăng nhập.
   */
  @Get('profile')
  @Roles('client')
  getProfile(
    @User()
    client: ClientInfo,
  ) {
    return this.clientsService.getClient({
      id: client.userID,
    });
  }

  /**
   * Cập nhật thông tin người dùng
   * đang đăng nhập.
   */
  @Patch('profile')
  @Roles('client')
  updateProfile(
    @User()
    client: ClientInfo,

    @Body()
    updateClientDto: UpdateClientProfileDto,
  ) {
    return this.clientsService.updateClient({
      where: {
        id: client.userID,
      },

      data: updateClientDto,
    });
  }

  /**
   * Admin lấy một client theo ID.
   */
  @Get(':id')
  @Roles('admin')
  getClient(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.clientsService.getClient({
      id,
    });
  }

  /**
   * Admin cập nhật client theo ID.
   */
  @Patch(':id')
  @Roles('admin')
  updateClient(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.updateClient({
      where: {
        id,
      },

      data: updateClientDto,
    });
  }

  /**
   * Admin khóa tài khoản client.
   */
  @Delete(':id')
  @Roles('admin')
  deleteClient(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.clientsService.deleteClient({
      id,
    });
  }
}
