import { Controller, Get } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { User } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { ProductService } from './products.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Roles(UserRole.customer)
  list(@User() user: UserInfo) {
    return this.productService.listFavorites(user.userID);
  }
}
