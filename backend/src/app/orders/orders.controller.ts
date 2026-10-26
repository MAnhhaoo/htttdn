import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { User } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { ParseParamsPaginationPipe } from 'src/common/pipes/parse-params-pagination.pipe';
import { CheckoutDto, PreviewCheckoutDto } from './dto/checkout.dto';
import {
  UpdateOrderStatusDto,
  UpdateVendorOrderStatusDto,
} from './dto/update-order-status.dto';
import { AssignOrderDto } from './dto/assign-order.dto';
import { GetOrdersPaginationDto } from './dto/get-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('preview')
  @Roles('client')
  preview(@Body() dto: PreviewCheckoutDto, @User() user: UserInfo) {
    return this.ordersService.previewCheckout(user.userID, dto);
  }

  @Post('checkout')
  @Roles('client')
  checkout(@Body() dto: CheckoutDto, @User() user: UserInfo) {
    return this.ordersService.checkout(user.userID, dto);
  }

  @Get('mine')
  @Roles('client')
  mine(@User() user: UserInfo) {
    return this.ordersService.listMine(user.userID);
  }

  @Get('vendor/mine')
  @Roles('vendor')
  vendor(@User() user: UserInfo) {
    return this.ordersService.listForVendor(user.userID);
  }

  @Get('vendor/orders')
  @Roles('vendor')
  vendorOrders(@User() user: UserInfo) {
    return this.ordersService.listVendorOrders(user.userID);
  }

  @Patch('vendor-orders/:id/status')
  @Roles('vendor')
  updateVendorOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVendorOrderStatusDto,
    @User() user: UserInfo,
  ) {
    return this.ordersService.updateVendorOrderStatus(id, dto, user);
  }

  @Get('admin/all')
  @Roles('admin', 'employee')
  all(
    @Query(new ParseParamsPaginationPipe()) query: GetOrdersPaginationDto,
    @User() user: UserInfo,
  ) {
    return this.ordersService.listAll(query, user);
  }

  @Post('admin/auto-assign-all')
  @Roles('admin')
  autoAssignAll(@User() user: UserInfo) {
    return this.ordersService.autoAssignAll(user);
  }

  @Post(':id/auto-assign')
  @Roles('admin')
  autoAssignOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('department')
    department: 'handling' | 'shipping' | 'exception' | undefined,
    @User() user: UserInfo,
  ) {
    return this.ordersService.autoAssignOrder(id, user, department);
  }

  @Patch(':id/assign')
  @Roles('admin')
  assignOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignOrderDto,
    @User() user: UserInfo,
  ) {
    return this.ordersService.assignOrder(id, dto, user);
  }

  @Get(':id')
  @Roles('client', 'vendor', 'admin', 'employee')
  get(@Param('id', ParseUUIDPipe) id: string, @User() user: UserInfo) {
    return this.ordersService.getById(id, user);
  }

  @Patch(':id/status')
  @Roles('client', 'vendor', 'admin', 'employee')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
    @User() user: UserInfo,
  ) {
    return this.ordersService.updateStatus(id, dto, user);
  }
}
