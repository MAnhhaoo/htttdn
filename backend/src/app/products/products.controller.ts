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
import { ProductService } from './products.service';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import {
  GetProductsPaginationDto,
  GetVendorProductsPaginationDto,
} from './dto/get-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User as CurrentUser } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { SkipAuth } from 'src/app/auth/auth.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(UserRole.vendor)
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productService.createProduct(createProductDto, user.userID);
  }
  @Get('vendor/mine')
  @Roles(UserRole.vendor)
  getVendorProducts(
    @Query() query: GetVendorProductsPaginationDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productService.getVendorProducts(query, user.userID);
  }

  @Get()
  @SkipAuth()
  getProducts(@Query() query: GetProductsPaginationDto) {
    return this.productService.getProducts(query);
  }
  @Get('category/:categorySlug')
  @SkipAuth()
  getProductsByCategory(
    @Param('categorySlug') categorySlug: string,
    @Query() query: GetProductsPaginationDto,
  ) {
    return this.productService.getProductsByCategory(categorySlug, query);
  }
  @Get(':id')
  @SkipAuth()
  getProductById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.getProductById(id);
  }
  @Patch(':id')
  @Roles(UserRole.vendor)
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productService.updateProduct(id, updateProductDto, user.userID);
  }
  @Delete(':id')
  @Roles(UserRole.vendor)
  deleteProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productService.deleteProduct(id, user.userID);
  }
}
