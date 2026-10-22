import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';


import { User } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaymentsService } from './payments.service';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

class DemoPaymentDto extends createZodDto(z.object({ success: z.boolean() }).strict()) {}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('admin/all')
  @Roles('admin')
  all() {
    return this.paymentsService.listAll();
  }

  @Get('order/:orderId')
  @Roles('client', 'vendor', 'admin')
  getByOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @User() user: UserInfo,
  ) {
    return this.paymentsService.getByOrder(orderId, user);
  }

  @Patch(':id/status')
  @Roles('admin')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.updateStatus(id, dto);
  }

  @Post('demo/:id')
  @Roles('client')
  async processDemoPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DemoPaymentDto,
    @User() user: UserInfo,
  ) {
    return this.paymentsService.processDemoPayment(id, dto.success, user);
  }
}
