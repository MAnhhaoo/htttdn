import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { User } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('admin/all')
  @Roles(UserRole.admin)
  all() {
    return this.paymentsService.listAll();
  }

  @Get('order/:orderId')
  @Roles(UserRole.customer, UserRole.vendor, UserRole.admin)
  getByOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @User() user: UserInfo,
  ) {
    return this.paymentsService.getByOrder(orderId, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.admin)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.updateStatus(id, dto);
  }
}
