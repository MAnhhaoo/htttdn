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

import { Roles } from '../../common/guards/access-control/roles.decorator';
import { SkipAuth } from '../auth/auth.decorator';

import { User } from '../../common/decorators/user.decorator';

import type { UserInfo as VendorInfo } from '../../common/decorators/user.decorator';

import { VendorsService } from './vendors.service';

import { UpdateVendorProfileDto, UpdateVendorDto } from './dto/update-vendor.dto';

import { GetVendorsPaginationDto } from './dto/get-vendor.dto';

import {
  ApproveRegistrationDto,
  RejectRegistrationDto,
  RenewSubscriptionDto,
} from './dto/registration.dto';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  /**
   * Danh sách vendor:
   * - phân trang
   * - tìm kiếm
   * - lọc status
   */
  @Get()
  @Roles('admin')
  getVendors(@Query() query: GetVendorsPaginationDto) {
    return this.vendorsService.getVendors(query);
  }

  /**
   * Lấy thông tin người dùng
   * đang đăng nhập.
   */
  @Get('profile')
  @Roles('vendor')
  getProfile(
    @User()
    vendor: VendorInfo,
  ) {
    return this.vendorsService.getVendor({
      id: vendor.userID,
    });
  }

  /**
   * Cập nhật thông tin người dùng
   * đang đăng nhập.
   */
  @Patch('profile')
  @Roles('vendor')
  updateProfile(
    @User()
    vendor: VendorInfo,

    @Body()
    updateVendorDto: UpdateVendorProfileDto,
  ) {
    return this.vendorsService.updateVendor({
      where: {
        id: vendor.userID,
      },

      data: updateVendorDto,
    });
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
    return this.vendorsService.renewSubscription(
      user.userID,
      body?.plan || '1_year',
    );
  }

  /**
   * Admin / Employee xem danh sách đăng ký và gia hạn của vendor
   */
  @Get('admin/registrations')
  @Roles('admin', 'employee')
  getRegistrations(
    @Query()
    query: {
      page?: number;
      itemPerPage?: number;
      tab?: string;
      search?: string;
    },
  ) {
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
    return this.vendorsService.rejectRegistration(
      id,
      user,
      body?.reason || '',
    );
  }

  /**
   * Khách hàng / người dùng xem thông tin công khai của người bán
   */
  @Get('public/:id')
  @SkipAuth()
  getPublicVendorProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.vendorsService.getPublicVendorProfile(id);
  }

  /**
   * Admin lấy một vendor theo ID.
   */
  @Get(':id')
  @Roles('admin')
  getVendor(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.vendorsService.getVendor({
      id,
    });
  }

  /**
   * Admin cập nhật vendor theo ID.
   */
  @Patch(':id')
  @Roles('admin')
  updateVendor(
    @Param('id', ParseUUIDPipe)
    id: string,

    @Body()
    updateVendorDto: UpdateVendorDto,
  ) {
    return this.vendorsService.updateVendor({
      where: {
        id,
      },

      data: updateVendorDto,
    });
  }

  /**
   * Admin khóa tài khoản vendor.
   */
  @Delete(':id')
  @Roles('admin')
  deleteVendor(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    return this.vendorsService.deleteVendor({
      id,
    });
  }
}
