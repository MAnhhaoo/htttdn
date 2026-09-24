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

import { User } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
@Roles(UserRole.customer)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  get(@User() user: UserInfo) {
    return this.cartService.get(user.userID);
  }

  @Post('items')
  add(@Body() dto: AddCartItemDto, @User() user: UserInfo) {
    return this.cartService.add(user.userID, dto);
  }

  @Patch('items/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCartItemDto,
    @User() user: UserInfo,
  ) {
    return this.cartService.update(user.userID, id, dto.quantity);
  }

  @Delete('items/:id')
  remove(@Param('id', ParseUUIDPipe) id: string, @User() user: UserInfo) {
    return this.cartService.remove(user.userID, id);
  }

  @Delete()
  clear(@User() user: UserInfo) {
    return this.cartService.clear(user.userID);
  }
}
