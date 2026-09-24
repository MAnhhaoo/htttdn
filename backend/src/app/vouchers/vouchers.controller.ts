import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { User as CurrentUser } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { PreviewVoucherDto } from './dto/preview-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { VoucherStatusDto } from './dto/voucher-status.dto';
import { VouchersService } from './vouchers.service';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.vendor)
  create(@Body() dto: CreateVoucherDto, @CurrentUser() user: UserInfo) {
    return this.vouchersService.create(dto, user);
  }

  @Post('preview')
  @Roles(UserRole.customer, UserRole.vendor, UserRole.admin)
  preview(@Body() dto: PreviewVoucherDto, @CurrentUser() user: UserInfo) {
    return this.vouchersService.preview(dto, user.userID);
  }

  @Get('mine')
  @Roles(UserRole.admin, UserRole.vendor)
  getMine(@CurrentUser() user: UserInfo) {
    return this.vouchersService.getMine(user.userID);
  }

  @Get('admin/all')
  @Roles(UserRole.admin)
  getAll() {
    return this.vouchersService.getAll();
  }

  @Get('available')
  @Roles(UserRole.customer, UserRole.vendor, UserRole.admin)
  getAvailable() {
    return this.vouchersService.getAvailable();
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.vendor)
  getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.vouchersService.getById(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.vendor)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVoucherDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.vouchersService.update(id, dto, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.admin, UserRole.vendor)
  setStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VoucherStatusDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.vouchersService.setStatus(
      id,
      dto.status,
      user,
      user.role === UserRole.admin,
    );
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.vendor)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.vouchersService.remove(id, user);
  }
}
