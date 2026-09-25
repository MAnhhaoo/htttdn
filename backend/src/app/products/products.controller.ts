import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ProductService } from './products.service';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { ParseParamsPaginationPipe } from 'src/common/pipes/parse-params-pagination.pipe';
import { SkipAuth } from 'src/app/auth/auth.decorator';
import { GetProductsPaginationDto } from './dto/get-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(UserRole.seller)
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }
  @Get()
  @SkipAuth()
  @UsePipes(ParseParamsPaginationPipe)
  getProducts(
    @Query()
    query: GetProductsPaginationDto,
  ) {
    return this.productService.getProducts(query);
  }
  @Patch(':id')
  @Roles(UserRole.seller)
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.updateProduct({
      where: {
        id,
      },
      data: updateProductDto,
    });
  }
  @Delete(':id')
  @Roles(UserRole.seller)
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct({ id });
  }
}
