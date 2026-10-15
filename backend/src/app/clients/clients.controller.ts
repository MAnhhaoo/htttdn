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

import type { UserInfo as ClientInfo } from '../../common/decorators/user.decorator';

import { ParseParamsOptionPipe } from '../../common/pipes/parse-params-option.pipe';

import type { GetOptionsParams } from '../../common/query/options.interface';

import { ClientsService } from './clients.service';

import { UpdateProfileDto, UpdateClientDto } from './dto/update-client.dto';

import { GetClientsPaginationDto } from './dto/get-client.dto';

import type { Client as ClientEntity } from './entities/client.entity';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Danh sách client:
   * - phân trang
   * - tìm kiếm
   * - lọc status
   * - lọc role
   */
  @Get()
  @Roles('admin')
  getClients(@Query() query: GetClientsPaginationDto) {
    return this.clientsService.getClients(query);
  }

  /**
   * Danh sách client rút gọn.
   * Dùng cho dropdown/select.
   *
   * Phải đặt trước @Get(':id').
   */
  @Get('options')
  @Roles('admin')
  @UsePipes(ParseParamsOptionPipe)
  getClientOptions(
    @Query()
    query: GetOptionsParams<ClientEntity>,
  ) {
    return this.clientsService.getOptions(query);
  }

  /**
   * Lấy thông tin người dùng
   * đang đăng nhập.
   */
  @Get('profile')
  getProfile(
    @User()
    client: ClientInfo,
  ) {
    return this.clientsService.getClient({
      id: client.userID});
  }

  /**
   * Cập nhật thông tin người dùng
   * đang đăng nhập.
   */
  @Patch('profile')
  @Roles('client', 'vendor', 'admin')
  updateProfile(
    @User()
    client: ClientInfo,

    @Body()
    updateClientDto: UpdateProfileDto,
  ) {
    return this.clientsService.updateClient({
      where: {
        id: client.userID},

      data: updateClientDto});
  }

  /**
   * Admin lấy một client theo ID.
   */
  @Get(':id')
  @Roles('admin')
  getClient(
    @Param('id')
    id: string,
  ) {
    return this.clientsService.getClient({
      id});
  }

  /**
   * Admin cập nhật client theo ID.
   */
  @Patch(':id')
  @Roles('admin')
  updateClient(
    @Param('id')
    id: string,

    @Body()
    updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.updateClient({
      where: {
        id},

      data: updateClientDto});
  }

  /**
   * Admin vô hiệu hóa client.
   */
  @Delete(':id')
  @Roles('admin')
  deleteClient(
    @Param('id')
    id: string,
  ) {
    return this.clientsService.deleteClient({
      id});
  }
}
