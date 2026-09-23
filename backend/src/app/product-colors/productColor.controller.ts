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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { diskStorage } from 'multer';
import { unlink } from 'node:fs/promises';
import { extname } from 'path';

import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { CreateProductColorDto } from './dto/create-productColor.dto';
import { UpdateProductColorDto } from './dto/update-productColor.dto';
import { ProductColorService } from './productColor.service';
import { User as CurrentUser } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';

/**
 * Cấu hình upload ảnh dùng chung.
 */
const ProductImagesInterceptor = FilesInterceptor('images', 10, {
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException('Chỉ chấp nhận ảnh JPEG, PNG hoặc WEBP'),
        false,
      );
    }

    callback(null, true);
  },

  limits: {
    // Mỗi file tối đa 5 MB.
    fileSize: 5 * 1024 * 1024,

    // Mỗi request tối đa 10 ảnh.
    files: 10,
  },
});

@Controller('productColors')
export class ProductColorController {
  constructor(private readonly productColorService: ProductColorService) {}

  /**
   * Tạo màu và upload ảnh.
   *
   * POST /api/productColors
   */
  @Post()
  @Roles(UserRole.vendor)
  @UseInterceptors(ProductImagesInterceptor)
  createProductColor(
    @Body() dto: CreateProductColorDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: UserInfo,
  ) {
    const imageUrls = this.createImageUrls(files);

    return this.withFileCleanup(files, () =>
      this.productColorService.createProductColor(
        { ...dto, imageUrls },
        user.userID,
      ),
    );
  }

  /**
   * Lấy danh sách màu của một sản phẩm.
   *
   * GET /api/productColors/product/:productId
   */
  @Get('product/:productId')
  getProductColorsByProductId(
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.productColorService.getProductColorsByProductId(productId);
  }

  /**
   * Lấy chi tiết một màu.
   *
   * GET /api/productColors/:id
   */
  @Get(':id')
  getProductColorById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productColorService.getProductColorById({
      id,
    });
  }

  /**
   * Cập nhật tên màu hoặc thay danh sách ảnh.
   *
   * Nếu không upload ảnh mới thì giữ ảnh cũ.
   * Nếu upload ảnh mới thì thay toàn bộ ảnh cũ.
   *
   * PATCH /api/productColors/:id
   */
  @Patch(':id')
  @Roles(UserRole.vendor)
  @UseInterceptors(ProductImagesInterceptor)
  updateProductColor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductColorDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: UserInfo,
  ) {
    const imageUrls = this.createImageUrls(files);

    return this.withFileCleanup(files, () =>
      this.productColorService.updateProductColor({
        id,
        data: {
          ...dto,

          ...(imageUrls.length > 0 && {
            imageUrls,
          }),
        },
        vendorId: user.userID,
      }),
    );
  }

  /**
   * Thêm ảnh mới và giữ nguyên ảnh cũ.
   *
   * POST /api/productColors/:id/images
   */
  @Post(':id/images')
  @Roles(UserRole.vendor)
  @UseInterceptors(ProductImagesInterceptor)
  addImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: UserInfo,
  ) {
    const imageUrls = this.createImageUrls(files);

    if (!imageUrls.length) {
      throw new BadRequestException('Vui lòng chọn ít nhất một ảnh');
    }

    return this.withFileCleanup(files, () =>
      this.productColorService.addImages(id, imageUrls, user.userID),
    );
  }

  /**
   * Khôi phục màu đã xóa mềm.
   *
   * PATCH /api/productColors/:id/restore
   */
  @Patch(':id/restore')
  @Roles(UserRole.vendor)
  restoreProductColor(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productColorService.restoreProductColor(id, user.userID);
  }

  /**
   * Xóa mềm màu sản phẩm.
   *
   * Chỉ cập nhật deletedAt.
   * Không xóa imageUrls và không xóa file ảnh.
   *
   * DELETE /api/productColors/:id
   */
  @Delete(':id')
  @Roles(UserRole.vendor)
  deleteProductColor(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.productColorService.deleteProductColor(id, user.userID);
  }

  /**
   * Chuyển danh sách file thành danh sách URL.
   */
  private createImageUrls(files?: Express.Multer.File[]): string[] {
    return (files ?? []).map((file) => `/uploads/products/${file.filename}`);
  }

  private async withFileCleanup<T>(
    files: Express.Multer.File[] | undefined,
    action: () => Promise<T>,
  ): Promise<T> {
    try {
      return await action();
    } catch (error) {
      await Promise.allSettled((files ?? []).map((file) => unlink(file.path)));
      throw error;
    }
  }
}
