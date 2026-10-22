import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { User } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import {
  AssignCarrierDto,
  GetShipmentsQueryDto,
  UpdateShipmentStatusDto,
} from './dto/shipping.dto';
import { ShippingService } from './shipping.service';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('shipments')
  @Roles('admin', 'employee')
  listShipments(@Query() query: GetShipmentsQueryDto, @User() user: UserInfo) {
    return this.shippingService.listShipments(query, user);
  }

  @Get('shipments/:id')
  @Roles('admin', 'employee')
  getShipment(@Param('id', ParseUUIDPipe) id: string, @User() user: UserInfo) {
    return this.shippingService.getShipmentById(id, user);
  }

  @Patch('shipments/:id/status')
  @Roles('admin', 'employee')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShipmentStatusDto,
    @User() user: UserInfo,
  ) {
    return this.shippingService.updateShipmentStatus(id, dto, user);
  }

  @Patch('shipments/:id/assign')
  @Roles('admin')
  assignCarrier(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignCarrierDto,
    @User() user: UserInfo,
  ) {
    return this.shippingService.assignCarrier(id, dto, user);
  }
}
