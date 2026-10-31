import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaBaseService } from 'src/common/service/prisma-base.service';
import {
  MAX_IMAGES_PER_COLOR,
  normalizeProductColorImages,
} from 'src/common/utils/product-image/product-image.util';

import { CreateProductColorDto } from './dto/create-productColor.dto';
import { UpdateProductColorDto } from './dto/update-productColor.dto';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class ProductColorService extends PrismaBaseService<'productColor'> {
  private readonly maxImages = MAX_IMAGES_PER_COLOR;

  constructor(
    private readonly prismaDb: PrismaService,
    private readonly realtime: RealtimeService,
  ) {
    super(prismaDb, 'productColor');
  }

  /**
   * Chuẩn hóa danh sách URL ảnh và kiểm tra giới hạn tối đa mỗi màu (tái sử dụng hàm dùng chung).
   */
  private normalizeImages(imageUrls: string[]): string[] {
    return normalizeProductColorImages(imageUrls, this.maxImages);
  }

  /**
   * Tạo màu sản phẩm.
   *
   * Nếu màu đã bị xóa mềm thì khôi phục lại bản ghi cũ.
   */
  async createProductColor(dto: CreateProductColorDto, vendorId: string) {
    const { productId, color, imageUrls = [] } = dto;

    const uniqueImageUrls = this.normalizeImages(imageUrls);

    // Kiểm tra sản phẩm có tồn tại và chưa bị xóa.
    const product = await this.prismaDb.extended.product.findFirst({
      where: {
        id: productId,
        vendorId,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Tìm màu theo khóa unique productId + color.
    const existingColor = await this.extended.findUnique({
      where: {
        productId_color: {
          productId,
          color: dto.color,
        },
      },
    });

    // Kiểm tra trùng hoặc khôi phục bản ghi đã xóa mềm qua PrismaBaseService.
    const restored = await this.restoreOrThrowIfActive({
      existing: existingColor,
      conflictMessage: `Màu "${dto.color}" đã tồn tại trong sản phẩm`,
      restoreData: {
        color,
        // Có ảnh mới thì thay ảnh cũ. Không có ảnh mới thì giữ nguyên ảnh cũ.
        ...(uniqueImageUrls.length > 0 && {
          imageUrls: uniqueImageUrls,
        }),
      },
    });

    if (restored) {
      this.realtime.emitProductUpdated(productId, vendorId);
      return restored;
    }

    // Màu chưa từng tồn tại thì tạo mới.
    const created = await this.extended.create({
      data: {
        color,
        imageUrls: uniqueImageUrls,

        product: {
          connect: {
            id: productId,
          },
        },
      },
    });
    this.realtime.emitProductUpdated(productId, vendorId);
    return created;
  }

  /**
   * Lấy danh sách màu chưa bị xóa của một sản phẩm.
   */
  async getProductColorsByProductId(productId: string) {
    // Kiểm tra sản phẩm có tồn tại.
    const product = await this.prismaDb.extended.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return this.extended.findMany({
      where: {
        productId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        variants: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Lấy chi tiết một màu chưa bị xóa.
   */
  async getProductColorById(where: Prisma.ProductColorWhereUniqueInput) {
    const productColor = await this.prismaDb.extended.productColor.findFirst({
      where: { ...where, product: { deletedAt: null } },
    });

    if (!productColor || productColor.deletedAt) {
      throw new NotFoundException('Màu sản phẩm không tồn tại');
    }

    return productColor;
  }

  /**
   * Cập nhật tên màu hoặc thay toàn bộ danh sách ảnh.
   */
  async updateProductColor(params: {
    id: string;
    data: UpdateProductColorDto;
    vendorId: string;
  }) {
    const { id, data: updateDto, vendorId } = params;

    const currentColor = await this.getOwnedActiveColor(id, vendorId);

    const { color, imageUrls } = updateDto;

    // Nếu đổi tên màu thì kiểm tra trùng.
    if (color && color !== currentColor.color) {
      const duplicateColor = await this.extended.findUnique({
        where: {
          productId_color: {
            productId: currentColor.productId,
            color,
          },
        },
      });

      /*
       * Dù màu trùng đã bị xóa mềm, bản ghi vẫn còn trong database
       * và vẫn chịu ràng buộc @@unique([productId, color]).
       */
      if (duplicateColor && duplicateColor.id !== currentColor.id) {
        throw new ConflictException(
          `Màu "${color}" đã từng tồn tại trong sản phẩm`,
        );
      }
    }

    let uniqueImageUrls: string[] | undefined;

    // Chỉ xử lý ảnh nếu request có gửi imageUrls.
    if (imageUrls !== undefined) {
      uniqueImageUrls = this.normalizeImages(imageUrls);
    }

    const updated = await this.extended.update({
      where: { id, productId: currentColor.productId, deletedAt: null },
      data: {
        // Chỉ cập nhật tên màu nếu client gửi color.
        ...(color !== undefined && {
          color,
        }),

        // Chỉ thay ảnh nếu client upload ảnh mới.
        ...(uniqueImageUrls !== undefined && {
          imageUrls: uniqueImageUrls,
        }),
      },
    });
    this.realtime.emitProductUpdated(currentColor.productId, vendorId);
    return updated;
  }

  /**
   * Thêm ảnh mới và giữ nguyên ảnh cũ.
   */
  async addImages(id: string, newImageUrls: string[], vendorId: string) {
    const cleanedNewImageUrls = this.normalizeImages(newImageUrls);

    if (!cleanedNewImageUrls.length) {
      throw new BadRequestException('Bạn chưa chọn ảnh');
    }

    const productColor = await this.getOwnedActiveColor(id, vendorId);

    // Kết hợp ảnh cũ với ảnh mới và kiểm tra giới hạn qua hàm dùng chung.
    const uniqueImageUrls = this.normalizeImages([
      ...productColor.imageUrls,
      ...cleanedNewImageUrls,
    ]);

    const updated = await this.extended.update({
      where: { id, productId: productColor.productId, deletedAt: null },
      data: {
        imageUrls: uniqueImageUrls,
      },
    });
    this.realtime.emitProductUpdated(productColor.productId, vendorId);
    return updated;
  }

  /**
   * Xóa mềm màu sản phẩm.
   *
   * Chỉ cập nhật deletedAt.
   * imageUrls vẫn được giữ nguyên trong database.
   */
  async deleteProductColor(id: string, vendorId: string) {
    const productColor = await this.getOwnedActiveColor(id, vendorId);

    const deleted = await this.extended.update({
      where: { id, productId: productColor.productId, deletedAt: null },
      data: {
        deletedAt: new Date(),
      },
    });
    this.realtime.emitProductUpdated(productColor.productId, vendorId);
    return deleted;
  }

  /**
   * Khôi phục màu đã xóa mềm.
   *
   * Ảnh cũ trong imageUrls vẫn được giữ nguyên.
   */
  async restoreProductColor(id: string, vendorId: string) {
    const productColor = await this.prismaDb.extended.productColor.findFirst({
      where: { id, product: { vendorId, deletedAt: null } },
    });

    if (!productColor) {
      throw new NotFoundException('Màu sản phẩm không tồn tại');
    }

    if (!productColor.deletedAt) {
      throw new ConflictException('Màu sản phẩm chưa bị xóa');
    }

    const restored = await this.extended.update({
      where: { id, productId: productColor.productId },
      data: {
        deletedAt: null,
      },
    });
    this.realtime.emitProductUpdated(productColor.productId, vendorId);
    return restored;
  }

  private async getOwnedActiveColor(id: string, vendorId: string) {
    const productColor = await this.extended.findFirst({
      where: {
        id,
        product: { vendorId, deletedAt: null },
      },
    });

    if (!productColor) {
      throw new NotFoundException('Màu sản phẩm không tồn tại');
    }

    return productColor;
  }
}
