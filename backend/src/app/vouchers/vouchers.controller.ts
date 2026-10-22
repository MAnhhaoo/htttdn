// @ts-nocheck
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';


import { User as CurrentUser } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { PreviewVoucherDto } from './dto/preview-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { VoucherStatusDto } from './dto/voucher-status.dto';
import { VouchersService } from './vouchers.service';
import { SkipAuth } from '../auth/auth.decorator';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

class CatalogOffersDto extends createZodDto(z.object({
  productIds: z.string().transform(value => value.split(',')).pipe(z.array(z.uuid()).min(1).max(100)),
}).strict()) {}

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get('catalog')
  @SkipAuth()
  catalog(@Query() query: CatalogOffersDto) {
    return this.vouchersService.catalogOffers(query.productIds);
  }

  @Post()
  @Roles('admin', 'vendor')
  create(@Body() dto: CreateVoucherDto, @CurrentUser() user: UserInfo) {
    return this.vouchersService.create(dto, user);
  }

  @Post('preview')
  @Roles('client', 'vendor', 'admin')
  preview(@Body() dto: PreviewVoucherDto, @CurrentUser() user: UserInfo) {
    return this.vouchersService.preview(dto, user.userID);
  }

  @Get('mine')
  @Roles('admin', 'vendor')
  getMine(@CurrentUser() user: UserInfo) {
    return this.vouchersService.getMine(user.userID);
  }

  @Get('admin/all')
  @Roles('admin')
  getAll() {
    return this.vouchersService.getAll();
  }

  @Get('available')
  @Roles('client', 'vendor', 'admin')
  getAvailable() {
    return this.vouchersService.getAvailable();
  }

  @Get(':id')
  @Roles('admin', 'vendor')
  getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.vouchersService.getById(id, user);
  }

  @Patch(':id')
  @Roles('admin', 'vendor')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVoucherDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.vouchersService.update(id, dto, user);
  }

  @Patch(':id/status')
  @Roles('admin', 'vendor')
  setStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VoucherStatusDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.vouchersService.setStatus(
      id,
      dto.status,
      user,
      user.role === 'admin',
    );
  }

  @Delete(':id')
  @Roles('admin', 'vendor')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.vouchersService.remove(id, user);
  }
}
