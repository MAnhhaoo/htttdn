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
import { ProductVariantService } from './productVariant.service';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateProductVariantDto } from './dto/createProductVariant.dto';
import { UpdateProductVariantDto } from './dto/updateProductVariant.dto';
import { User as CurrentUser } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';

@Controller('productVariant')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}
  @Post()
  @Roles(UserRole.vendor)
  createProductVariant(
    @Body() createProductVariantDto: CreateProductVariantDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productVariantService.createProductVariant(
      createProductVariantDto,
      user.userID,
    );
  }

  @Get('productColor/:productColorId')
  getProductVariantsByProductColorId(
    @Param('productColorId', ParseUUIDPipe) productColorId: string,
  ) {
    return this.productVariantService.getProductVariantsByProductColorId(
      productColorId,
    );
  }

  @Patch(':id')
  @Roles(UserRole.vendor)
  updateProductVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductVariantDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productVariantService.updateProductVariant(
      id,
      updateDto,
      user.userID,
    );
  }

  @Delete(':id')
  @Roles(UserRole.vendor)
  deleteProductVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productVariantService.deleteProductVariant(id, user.userID);
  }
}
