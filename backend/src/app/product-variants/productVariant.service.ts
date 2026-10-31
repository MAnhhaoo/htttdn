import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaBaseService } from 'src/common/service/prisma-base.service';
import { CreateProductVariantDto } from './dto/createProductVariant.dto';
import { UpdateProductVariantDto } from './dto/updateProductVariant.dto';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class ProductVariantService extends PrismaBaseService<'productVariant'> {
  constructor(
    private readonly prismaDb: PrismaService,
    private readonly realtime: RealtimeService,
  ) {
    super(prismaDb, 'productVariant');
  }

  async createProductVariant(
    createProductVariantDto: CreateProductVariantDto,
    vendorId: string,
  ) {
    const { productColorId, size, price, stock = 0 } = createProductVariantDto;

    await this.getActiveProductColor(productColorId, vendorId);

    const existing = await this.prismaDb.extended.productVariant.findUnique({
      where: { productColorId_size: { productColorId, size } },
    });

    // Kiểm tra trùng hoặc khôi phục size đã xóa mềm qua PrismaBaseService.
    const restored = await this.restoreOrThrowIfActive({
      existing,
      conflictMessage: `Size "${size}" đã tồn tại trong màu này`,
      restoreData: { price, stock },
    });

    if (restored) {
      await this.emitForColor(productColorId, vendorId);
      return restored;
    }

    const created = await this.extended.create({
      data: {
        size,
        price,
        stock,

        productColor: {
          connect: {
            id: productColorId,
          },
        },
      },
    });
    await this.emitForColor(productColorId, vendorId);
    return created;
  }

  async getProductVariantsByProductColorId(productColorId: string) {
    await this.getActiveProductColor(productColorId);

    return this.extended.findMany({
      where: { productColorId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateProductVariant(
    id: string,
    data: UpdateProductVariantDto,
    vendorId: string,
  ) {
    const variant = await this.getActiveVariant(id, vendorId);

    if (data.size !== undefined && data.size !== variant.size) {
      await this.checkDuplicateSize(variant.productColorId, data.size, id, true);
    }

    const updated = await this.extended.update({
      where: { id, productColorId: variant.productColorId, deletedAt: null },
      data,
    });
    await this.emitForColor(variant.productColorId, vendorId);
    return updated;
  }

  async deleteProductVariant(id: string, vendorId: string) {
    const variant = await this.getActiveVariant(id, vendorId);

    const deleted = await this.extended.update({
      where: { id, productColorId: variant.productColorId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    await this.emitForColor(variant.productColorId, vendorId);
    return deleted;
  }

  private async emitForColor(productColorId: string, vendorId: string) {
    const color = await this.prismaDb.extended.productColor.findUnique({
      where: { id: productColorId },
      select: { productId: true },
    });
    if (color) this.realtime.emitProductUpdated(color.productId, vendorId);
  }

  private async getActiveProductColor(
    productColorId: string,
    vendorId?: string,
  ) {
    const productColor = await this.prismaDb.extended.productColor.findFirst({
      where: {
        id: productColorId,
        product: { deletedAt: null, ...(vendorId ? { vendorId } : {}) },
      },
      select: { id: true },
    });

    if (!productColor) {
      throw new NotFoundException('Màu sản phẩm không tồn tại');
    }

    return productColor;
  }

  private async getActiveVariant(id: string, vendorId: string) {
    const variant = await this.extended.findFirst({
      where: {
        id,
        deletedAt: null,
        productColor: {
          deletedAt: null,
          product: { deletedAt: null, vendorId },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Biến thể sản phẩm không tồn tại');
    }

    return variant;
  }

  private async checkDuplicateSize(
    productColorId: string,
    size: string,
    excludingId?: string,
    includeDeleted = false,
  ) {
    // Bản ghi đã xóa mềm vẫn nằm trong ràng buộc unique, nên khi đổi size phải tính cả chúng.
    const duplicate = await this.prismaDb.extended.productVariant.findFirst({
      where: {
        productColorId,
        size,
        ...(includeDeleted ? {} : { deletedAt: null }),
        ...(excludingId ? { id: { not: excludingId } } : {}),
      },
      select: { id: true, deletedAt: true },
    });

    if (duplicate) {
      throw new ConflictException(
        duplicate.deletedAt
          ? `Size "${size}" từng tồn tại trong màu này, hãy tạo lại size đó để khôi phục`
          : `Size "${size}" đã tồn tại trong màu này`,
      );
    }
  }
}
