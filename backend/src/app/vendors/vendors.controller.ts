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
  UsePipes} from '@nestjs/common';

import { Roles } from '../../common/guards/access-control/roles.decorator';
import { SkipAuth } from '../auth/auth.decorator';

import { User } from '../../common/decorators/user.decorator';

import type { UserInfo as VendorInfo } from '../../common/decorators/user.decorator';

import { ParseParamsOptionPipe } from '../../common/pipes/parse-params-option.pipe';

import type { GetOptionsParams } from '../../common/query/options.interface';

import { VendorsService } from './vendors.service';

import { UpdateProfileDto, UpdateVendorDto } from './dto/update-vendor.dto';

import { GetVendorsPaginationDto } from './dto/get-vendor.dto';

import {
  ApproveRegistrationDto,
  RejectRegistrationDto,
  RenewSubscriptionDto,
} from './dto/registration.dto';

import type { Vendor as VendorEntity } from './entities/vendor.entity';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  /**
   * Danh sách vendor:
   * - phân trang
   * - tìm kiếm
   * - lọc status
   * - lọc role
   */
  @Get()
  @Roles('admin')
  getVendors(@Query() query: GetVendorsPaginationDto) {
    return this.vendorsService.getVendors(query);
  }

  /**
   * Danh sách vendor rút gọn.
   * Dùng cho dropdown/select.
   *
   * Phải đặt trước @Get(':id').
   */
  @Get('options')
  @Roles('admin')
  @UsePipes(ParseParamsOptionPipe)
  getVendorOptions(
    @Query()
    query: GetOptionsParams<VendorEntity>,
  ) {
    return this.vendorsService.getOptions(query);
  }

  /**
   * Lấy thông tin người dùng
   * đang đăng nhập.
   */
  @Get('profile')
  getProfile(
    @User()
    vendor: VendorInfo,
  ) {
    return this.vendorsService.getVendor({
      id: vendor.userID});
  }

  /**
   * Cập nhật thông tin người dùng
   * đang đăng nhập.
   */
  @Patch('profile')
  @Roles('client', 'vendor', 'admin')
  updateProfile(
    @User()
    vendor: VendorInfo,

    @Body()
    updateVendorDto: UpdateProfileDto,
  ) {
    return this.vendorsService.updateVendor({
      where: {
        id: vendor.userID},

      data: updateVendorDto});
  }

  /**
   * Vendor lấy thông tin gói đăng ký & hạn sử dụng của chính mình
   */
  @Get('subscription/me')
  @Roles('vendor')
  getSubscriptionMe(@User() user: VendorInfo) {
    return this.vendorsService.getSubscriptionMe(user.userID);
  }

  /**
   * Vendor gửi yêu cầu gia hạn kinh doanh
   */
  @Post('subscription/renew')
  @Roles('vendor')
  renewSubscription(
    @User() user: VendorInfo,
    @Body() body: RenewSubscriptionDto,
  ) {
    return this.vendorsService.renewSubscription(user.userID, body?.plan || '1_year');
  }

  /**
   * Admin / Employee xem danh sách đăng ký và gia hạn của vendor
   */
  @Get('admin/registrations')
  @Roles('admin', 'employee')
  getRegistrations(@Query() query: { page?: number; itemPerPage?: number; tab?: string; search?: string }) {
    return this.vendorsService.getRegistrations(query);
  }

  /**
   * Admin / Employee phê duyệt đăng ký hoặc gia hạn
   */
  @Patch('admin/registrations/:id/approve')
  @Roles('admin', 'employee')
  approveRegistration(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: VendorInfo,
    @Body() body: ApproveRegistrationDto,
  ) {
    return this.vendorsService.approveRegistration(id, user, {
      ...body,
      note: body?.note ?? undefined,
    });
  }

  /**
   * Admin / Employee từ chối đăng ký hoặc gia hạn
   */
  @Patch('admin/registrations/:id/reject')
  @Roles('admin', 'employee')
  rejectRegistration(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: VendorInfo,
    @Body() body: RejectRegistrationDto,
  ) {
    return this.vendorsService.rejectRegistration(id, user, body?.reason || '');
  }

  /**
   * Khách hàng / người dùng xem thông tin công khai của người bán
   */
  @Get('public/:id')
  @SkipAuth()
  getPublicVendorProfile(@Param('id') id: string) {
    return this.vendorsService.getPublicVendorProfile(id);
  }

  /**
   * Admin lấy một vendor theo ID.
   */
  @Get(':id')
  @Roles('admin')
  getVendor(
    @Param('id')
    id: string,
  ) {
    return this.vendorsService.getVendor({
      id});
  }

  /**
   * Admin cập nhật vendor theo ID.
   */
  @Patch(':id')
  @Roles('admin')
  updateVendor(
    @Param('id')
    id: string,

    @Body()
    updateVendorDto: UpdateVendorDto,
  ) {
    return this.vendorsService.updateVendor({
      where: {
        id},

      data: updateVendorDto});
  }

  /**
   * Admin vô hiệu hóa vendor.
   */
  @Delete(':id')
  @Roles('admin')
  deleteVendor(
    @Param('id')
    id: string,
  ) {
    return this.vendorsService.deleteVendor({
      id});
  }
}
