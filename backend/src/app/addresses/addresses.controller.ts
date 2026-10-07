import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { Roles } from '../../common/guards/access-control/roles.decorator';
import { User as CurrentUser } from '../../common/decorators/user.decorator';
import type { UserInfo } from '../../common/decorators/user.decorator';

import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @Roles(UserRole.customer, UserRole.vendor, UserRole.admin)
  createAddress(
    @CurrentUser() user: UserInfo,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressesService.createAddress(user.userID, createAddressDto);
  }

  @Get()
  @Roles(UserRole.customer, UserRole.vendor, UserRole.admin)
  getUserAddresses(@CurrentUser() user: UserInfo) {
    return this.addressesService.getUserAddresses(user.userID);
  }

  @Get(':id')
  @Roles(UserRole.customer, UserRole.vendor, UserRole.admin)
  getAddress(@CurrentUser() user: UserInfo, @Param('id') id: string) {
    return this.addressesService.getAddress(user.userID, id);
  }

  @Patch(':id')
  @Roles(UserRole.customer, UserRole.vendor, UserRole.admin)
  updateAddress(
    @CurrentUser() user: UserInfo,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.updateAddress(user.userID, id, updateAddressDto);
  }

  @Delete(':id')
  @Roles(UserRole.customer, UserRole.vendor, UserRole.admin)
  deleteAddress(@CurrentUser() user: UserInfo, @Param('id') id: string) {
    return this.addressesService.deleteAddress(user.userID, id);
  }
}
