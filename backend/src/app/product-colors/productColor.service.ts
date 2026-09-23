import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaBaseService } from 'src/common/service/prisma-base.service';

import { CreateProductColorDto } from './dto/create-productColor.dto';
import { UpdateProductColorDto } from './dto/update-productColor.dto';

@Injectable()
export class ProductColorService extends PrismaBaseService<'productColor'> {
  private readonly maxImages = 20;

  constructor(private readonly prismaDb: PrismaService) {
    super(prismaDb, 'productColor');
  }

  /**
   * Loại bỏ URL ảnh trùng và chuỗi rỗng.
   */
  private removeDuplicateImageUrls(imageUrls: string[]): string[] {
    return [
      ...new Set(imageUrls.map((imageUrl) => imageUrl.trim()).filter(Boolean)),
    ];
  }

  /**
   * Kiểm tra giới hạn tổng số ảnh của một màu.
   */
  private validateImageLimit(imageUrls: string[]) {
    if (imageUrls.length > this.maxImages) {
      throw new BadRequestException(
        `Mỗi màu chỉ được có tối đa ${this.maxImages} ảnh`,
      );
    }
  }

  /**
   * Tạo màu sản phẩm.
   *
   * Nếu màu đã bị xóa mềm thì khôi phục lại bản ghi cũ.
   */
  async createProductColor(dto: CreateProductColorDto, vendorId: string) {
    const { productId, color, imageUrls = [] } = dto;

    const uniqueImageUrls = this.removeDuplicateImageUrls(imageUrls);

    this.validateImageLimit(uniqueImageUrls);

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

    // Màu đang tồn tại và chưa bị xóa.
    if (existingColor && !existingColor.deletedAt) {
      throw new ConflictException(
        `Màu "${dto.color}" đã tồn tại trong sản phẩm`,
      );
    }

    // Màu đã bị xóa mềm thì khôi phục.
    if (existingColor?.deletedAt) {
      return this.extended.update({
        where: {
          id: existingColor.id,
        },
        data: {
          color,
          deletedAt: null,

          // Có ảnh mới thì thay ảnh cũ.
          // Không có ảnh mới thì giữ nguyên ảnh cũ.
          ...(uniqueImageUrls.length > 0 && {
            imageUrls: uniqueImageUrls,
          }),
        },
      });
    }

    // Màu chưa từng tồn tại thì tạo mới.
    return this.extended.create({
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
  }

  /**
   * Lấy danh sách màu chưa bị xóa của một sản phẩm.
   */
  async getProductColorsByProductId(productId: string) {
    // Kiểm tra sản phẩm có tồn tại.
    const product = await this.prismaDb.product.findFirst({
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
    });
  }

  /**
   * Lấy chi tiết một màu chưa bị xóa.
   */
  async getProductColorById(where: Prisma.ProductColorWhereUniqueInput) {
    const productColor = await this.extended.findUnique({
      where,
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
      uniqueImageUrls = this.removeDuplicateImageUrls(imageUrls);

      this.validateImageLimit(uniqueImageUrls);
    }

    return this.extended.update({
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
  }

  /**
   * Thêm ảnh mới và giữ nguyên ảnh cũ.
   */
  async addImages(id: string, newImageUrls: string[], vendorId: string) {
    const cleanedNewImageUrls = this.removeDuplicateImageUrls(newImageUrls);

    if (!cleanedNewImageUrls.length) {
      throw new BadRequestException('Bạn chưa chọn ảnh');
    }

    const productColor = await this.getOwnedActiveColor(id, vendorId);

    // Kết hợp ảnh cũ với ảnh mới.
    const combinedImageUrls = [
      ...productColor.imageUrls,
      ...cleanedNewImageUrls,
    ];

    // Loại bỏ URL bị trùng.
    const uniqueImageUrls = this.removeDuplicateImageUrls(combinedImageUrls);

    this.validateImageLimit(uniqueImageUrls);

    return this.extended.update({
      where: { id, productId: productColor.productId, deletedAt: null },
      data: {
        imageUrls: uniqueImageUrls,
      },
    });
  }

  /**
   * Xóa mềm màu sản phẩm.
   *
   * Chỉ cập nhật deletedAt.
   * imageUrls vẫn được giữ nguyên trong database.
   */
  async deleteProductColor(id: string, vendorId: string) {
    const productColor = await this.getOwnedActiveColor(id, vendorId);

    return this.extended.update({
      where: { id, productId: productColor.productId, deletedAt: null },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Khôi phục màu đã xóa mềm.
   *
   * Ảnh cũ trong imageUrls vẫn được giữ nguyên.
   */
  async restoreProductColor(id: string, vendorId: string) {
    const productColor = await this.prismaDb.productColor.findFirst({
      where: { id, product: { vendorId, deletedAt: null } },
    });

    if (!productColor) {
      throw new NotFoundException('Màu sản phẩm không tồn tại');
    }

    if (!productColor.deletedAt) {
      throw new ConflictException('Màu sản phẩm chưa bị xóa');
    }

    return this.extended.update({
      where: { id, productId: productColor.productId },
      data: {
        deletedAt: null,
      },
    });
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
