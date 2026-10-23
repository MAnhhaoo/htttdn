import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { ProductService } from './products.service';
import { Roles } from 'src/common/guards/access-control/roles.decorator';

import { CreateProductDto } from './dto/create-product.dto';

import {
  GetProductsPaginationDto,
  GetAdminProductsPaginationDto,
  GetVendorProductsPaginationDto,
} from './dto/get-product.dto';

import { UpdateProductDto } from './dto/update-product.dto';
import { User as CurrentUser } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { SkipAuth } from 'src/app/auth/auth.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Post('upload-image')
  @Roles('vendor', 'admin')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/products',
        filename: (_req, file, callback) => {
          const fileName =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
            extname(file.originalname);
          callback(null, fileName);
        },
      }),
      fileFilter: (_req, file, callback) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/jpg',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Chỉ chấp nhận ảnh JPEG, PNG, WEBP hoặc GIF'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10,
      },
    }),
  )
  uploadProductImage(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một file ảnh');
    }
    const urls = files.map((file) => `/uploads/products/${file.filename}`);
    return {
      urls,
      url: urls[0],
    };
  }

  @Post()
  @Roles('vendor', 'admin')
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: UserInfo,
  ) {
    const vendorId = user.role === 'vendor' ? user.userID : undefined;
    return this.productService.createProduct(createProductDto, vendorId);
  }

  @Get('vendor/mine')
  @Roles('vendor')
  getVendorProducts(
    @Query() query: GetVendorProductsPaginationDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productService.getVendorProducts(query, user.userID);
  }

  @Get('admin/all')
  @Roles('admin')
  getAdminProducts(@Query() query: GetAdminProductsPaginationDto) {
    return this.productService.getAdminProducts(query);
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
  @Get('favorites')
  @Roles('client')
  listFavorites(@CurrentUser() user: UserInfo) {
    return this.productService.listFavorites(user.userID);
  }

  @Get(':id/favorite-status')
  @Roles('client')
  favoriteStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productService.favoriteStatus(id, user.userID);
  }
  @Post(':id/favorite')
  @Roles('client')
  addFavorite(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productService.addFavorite(id, user.userID);
  }
  @Delete(':id/favorite')
  @Roles('client')
  removeFavorite(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productService.removeFavorite(id, user.userID);
  }
  @Get('best-sellers')
  @SkipAuth()
  getBestSellers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 4;
    return this.productService.getBestSellingProducts(
      isNaN(limitNum) ? 4 : limitNum,
    );
  }

  @Get(':id')
  @SkipAuth()
  getProductById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.getProductById(id);
  }
  @Patch(':id')
  @Roles('vendor', 'admin')
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productService.updateProduct(
      id,
      updateProductDto,
      user.userID,
      user.role === 'admin',
    );
  }
  @Delete(':id')
  @Roles('vendor', 'admin')
  deleteProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productService.deleteProduct(
      id,
      user.userID,
      user.role === 'admin',
    );
  }
}
