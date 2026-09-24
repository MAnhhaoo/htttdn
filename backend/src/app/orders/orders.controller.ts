import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { User } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @Roles(UserRole.customer)
  checkout(@Body() dto: CheckoutDto, @User() user: UserInfo) {
    return this.ordersService.checkout(user.userID, dto);
  }

  @Get('mine')
  @Roles(UserRole.customer)
  mine(@User() user: UserInfo) {
    return this.ordersService.listMine(user.userID);
  }

  @Get('vendor/mine')
  @Roles(UserRole.vendor)
  vendor(@User() user: UserInfo) {
    return this.ordersService.listForVendor(user.userID);
  }

  @Get('admin/all')
  @Roles(UserRole.admin)
  all() {
    return this.ordersService.listAll();
  }

  @Get(':id')
  @Roles(UserRole.customer, UserRole.vendor, UserRole.admin)
  get(@Param('id', ParseUUIDPipe) id: string, @User() user: UserInfo) {
    return this.ordersService.getById(id, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.customer, UserRole.vendor, UserRole.admin)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
    @User() user: UserInfo,
  ) {
    return this.ordersService.updateStatus(id, dto, user);
  }
}
