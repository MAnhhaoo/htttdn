import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DiscountType,
  Prisma,
  ProductStatus,
  UserRole,
  VoucherScope,
  VoucherStatus,
} from '@prisma/client';

import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { PreviewVoucherDto } from './dto/preview-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

type DatabaseClient = Pick<
  Prisma.TransactionClient,
  'productVariant' | 'voucher' | 'voucherDetail'
>;

export type VoucherApplication = {
  voucherId: string;
  code: string;
  scope: VoucherScope;
  eligibleAmount: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  sequence: number;
  expectedUsedQuantity: number;
};

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVoucherDto, user: UserInfo) {
    if (user.role !== UserRole.admin && user.role !== UserRole.vendor) {
      throw new ForbiddenException('Chỉ admin hoặc vendor được tạo voucher');
    }

    const scope =
      user.role === UserRole.admin
        ? VoucherScope.platform
        : VoucherScope.vendor;
    const productIds = [...new Set(dto.productIds ?? [])];

    if (scope === VoucherScope.vendor) {
      if (!productIds.length) {
        throw new BadRequestException('Vendor phải chọn ít nhất một sản phẩm');
      }
      await this.assertOwnedProducts(productIds, user.userID);
    } else if (productIds.length) {
      throw new BadRequestException('Voucher toàn sàn không nhận productIds');
    }

    const duplicate = await this.prisma.voucher.findUnique({
      where: { code: dto.code },
    });
    if (duplicate) throw new ConflictException('Mã voucher đã tồn tại');

    const { productIds: _productIds, ...data } = dto;
    return this.prisma.voucher.create({
      data: {
        ...data,
        scope,
        userId: user.userID,
        details: productIds.length
          ? {
              create: productIds.map((productId) => ({ productId })),
            }
          : undefined,
      },
      include: this.detailsInclude(),
    });
  }

  getMine(userId: string) {
    return this.prisma.voucher.findMany({
      where: { userId, deletedAt: null },
      include: this.detailsInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  getAll() {
    return this.prisma.voucher.findMany({
      where: { deletedAt: null },
      include: {
        ...this.detailsInclude(),
        user: { select: { id: true, fullName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAvailable() {
    const now = new Date();
    const vouchers = await this.prisma.voucher.findMany({
      where: {
        deletedAt: null,
        status: VoucherStatus.active,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        ...this.detailsInclude(),
        user: { select: { id: true, fullName: true, role: true } },
      },
      orderBy: { endDate: 'asc' },
    });
    return vouchers.filter(
      (voucher) => voucher.usedQuantity < voucher.quantity,
    );
  }

  async getById(id: string, user: UserInfo) {
    const voucher = await this.prisma.voucher.findFirst({
      where: { id, deletedAt: null },
      include: this.detailsInclude(),
    });
    if (!voucher) throw new NotFoundException('Voucher không tồn tại');
    if (user.role !== UserRole.admin && voucher.userId !== user.userID) {
      throw new ForbiddenException('Bạn không có quyền xem voucher này');
    }
    return voucher;
  }

  async update(id: string, dto: UpdateVoucherDto, user: UserInfo) {
    const current = await this.getById(id, user);
    if (current.userId !== user.userID) {
      throw new ForbiddenException(
        'Admin chỉ được vô hiệu hóa voucher của vendor',
      );
    }

    const productIds = dto.productIds
      ? [...new Set(dto.productIds)]
      : undefined;
    if (current.scope === VoucherScope.vendor && productIds) {
      await this.assertOwnedProducts(productIds, current.userId);
    }
    if (current.scope === VoucherScope.platform && productIds) {
      throw new BadRequestException('Voucher toàn sàn không nhận productIds');
    }
    const quantity = dto.quantity ?? current.quantity;
    const perUserLimit = dto.perUserLimit ?? current.perUserLimit;
    if (quantity < current.usedQuantity) {
      throw new BadRequestException(
        'Số lượng voucher không được nhỏ hơn số lượt đã dùng',
      );
    }
    if (perUserLimit > quantity) {
      throw new BadRequestException(
        'Giới hạn mỗi người không được vượt quá số lượng voucher',
      );
    }
    const startDate = new Date(dto.startDate ?? current.startDate);
    const endDate = new Date(dto.endDate ?? current.endDate);
    if (endDate <= startDate) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }
    const discountType = dto.discountType ?? current.discountType;
    const discountValue = Number(dto.discountValue ?? current.discountValue);
    if (discountType === DiscountType.percentage && discountValue > 100) {
      throw new BadRequestException('Phần trăm giảm không được vượt quá 100');
    }
    if (dto.code && dto.code !== current.code) {
      const duplicate = await this.prisma.voucher.findUnique({
        where: { code: dto.code },
      });
      if (duplicate) throw new ConflictException('Mã voucher đã tồn tại');
    }

    const { productIds: _productIds, ...data } = dto;
    return this.prisma.$transaction(async (tx) => {
      if (productIds) {
        await tx.voucherDetail.deleteMany({
          where: {
            voucherId: id,
            productId: { not: null },
            orderId: null,
          },
        });
        await tx.voucherDetail.createMany({
          data: productIds.map((productId) => ({
            voucherId: id,
            productId,
          })),
        });
      }

      return tx.voucher.update({
        where: { id },
        data,
        include: this.detailsInclude(),
      });
    });
  }

  async setStatus(
    id: string,
    status: VoucherStatus,
    user: UserInfo,
    moderation = false,
  ) {
    const voucher = await this.getById(id, user);
    if (!moderation && voucher.userId !== user.userID) {
      throw new ForbiddenException('Bạn không có quyền cập nhật voucher này');
    }
    return this.prisma.voucher.update({ where: { id }, data: { status } });
  }

  async remove(id: string, user: UserInfo) {
    const voucher = await this.getById(id, user);
    if (voucher.userId !== user.userID) {
      throw new ForbiddenException('Bạn không có quyền xóa voucher này');
    }
    return this.prisma.voucher.update({
      where: { id },
      data: { status: VoucherStatus.inactive, deletedAt: new Date() },
    });
  }

  preview(dto: PreviewVoucherDto, userId: string) {
    return this.calculate(dto.codes, userId, dto.items, this.prisma);
  }

  async calculate(
    codes: string[],
    userId: string,
    requestedItems: Array<{
      productVariantId: string;
      quantity: number;
    }>,
    db: DatabaseClient,
  ) {
    const normalizedCodes = [
      ...new Set(codes.map((code) => code.trim().toUpperCase())),
    ];
    if (normalizedCodes.length !== codes.length) {
      throw new BadRequestException('Voucher bị trùng lặp');
    }

    const variants = await db.productVariant.findMany({
      where: {
        id: {
          in: requestedItems.map((item) => item.productVariantId),
        },
        deletedAt: null,
      },
      include: {
        productColor: { include: { product: true } },
      },
    });
    if (variants.length !== requestedItems.length) {
      throw new BadRequestException('Có biến thể sản phẩm không tồn tại');
    }

    const items = requestedItems.map((requested) => {
      const variant = variants.find(
        (item) => item.id === requested.productVariantId,
      )!;
      if (
        variant.stock < requested.quantity ||
        variant.productColor.deletedAt ||
        variant.productColor.product.deletedAt ||
        variant.productColor.product.status !== ProductStatus.active
      ) {
        throw new BadRequestException(
          'Sản phẩm không còn hợp lệ hoặc không đủ tồn kho',
        );
      }
      return {
        ...requested,
        variant,
        amount: variant.price.mul(requested.quantity),
      };
    });

    const vouchers = await db.voucher.findMany({
      where: { code: { in: normalizedCodes }, deletedAt: null },
      include: {
        details: {
          where: { productId: { not: null }, orderId: null },
        },
      },
    });
    if (vouchers.length !== normalizedCodes.length) {
      throw new BadRequestException('Voucher không tồn tại');
    }

    const now = new Date();
    const scopes = new Set<VoucherScope>();
    const ordered = [...vouchers].sort((left, right) =>
      left.scope === right.scope
        ? 0
        : left.scope === VoucherScope.vendor
          ? -1
          : 1,
    );
    const subtotal = items.reduce(
      (sum, item) => sum.plus(item.amount),
      new Prisma.Decimal(0),
    );
    let remaining = subtotal;
    const applications: VoucherApplication[] = [];

    for (const voucher of ordered) {
      if (scopes.has(voucher.scope)) {
        throw new BadRequestException('Mỗi loại chỉ được dùng một voucher');
      }
      scopes.add(voucher.scope);

      if (
        voucher.status !== VoucherStatus.active ||
        voucher.startDate > now ||
        voucher.endDate < now ||
        voucher.usedQuantity >= voucher.quantity
      ) {
        throw new BadRequestException(
          `Voucher ${voucher.code} không còn hiệu lực`,
        );
      }

      const usedByCustomer = await db.voucherDetail.count({
        where: {
          voucherId: voucher.id,
          order: { userId },
          reversedAt: null,
        },
      });
      if (usedByCustomer >= voucher.perUserLimit) {
        throw new BadRequestException(
          `Bạn đã hết lượt dùng voucher ${voucher.code}`,
        );
      }

      const productIds = new Set(
        voucher.details.flatMap((detail) =>
          detail.productId ? [detail.productId] : [],
        ),
      );
      const eligibleItems =
        voucher.scope === VoucherScope.platform
          ? items
          : items.filter((item) =>
              productIds.has(item.variant.productColor.productId),
            );
      const originalEligible = eligibleItems.reduce(
        (sum, item) => sum.plus(item.amount),
        new Prisma.Decimal(0),
      );

      if (originalEligible.isZero()) {
        throw new BadRequestException(
          `Giỏ hàng không có sản phẩm áp dụng voucher ${voucher.code}`,
        );
      }
      if (
        voucher.minOrderAmount &&
        originalEligible.lessThan(voucher.minOrderAmount)
      ) {
        throw new BadRequestException(
          `Chưa đạt giá trị tối thiểu của voucher ${voucher.code}`,
        );
      }

      const discountBase =
        voucher.scope === VoucherScope.platform ? remaining : originalEligible;
      let discount =
        voucher.discountType === DiscountType.percentage
          ? discountBase.mul(voucher.discountValue).div(100)
          : new Prisma.Decimal(voucher.discountValue);

      if (
        voucher.maxDiscountAmount &&
        discount.greaterThan(voucher.maxDiscountAmount)
      ) {
        discount = voucher.maxDiscountAmount;
      }
      if (discount.greaterThan(remaining)) discount = remaining;
      if (discount.greaterThan(discountBase)) discount = discountBase;
      discount = discount.toDecimalPlaces(2);
      remaining = remaining.minus(discount);
      applications.push({
        voucherId: voucher.id,
        code: voucher.code,
        scope: voucher.scope,
        eligibleAmount: discountBase,
        discountAmount: discount,
        sequence: applications.length + 1,
        expectedUsedQuantity: voucher.usedQuantity,
      });
    }

    return {
      subtotalAmount: subtotal,
      discountAmount: subtotal.minus(remaining),
      totalAmount: remaining,
      applications,
      items,
    };
  }

  private async assertOwnedProducts(productIds: string[], vendorId: string) {
    const count = await this.prisma.product.count({
      where: { id: { in: productIds }, vendorId, deletedAt: null },
    });
    if (count !== productIds.length) {
      throw new ForbiddenException('Có sản phẩm không thuộc cửa hàng của bạn');
    }
  }

  private detailsInclude() {
    return {
      details: {
        where: { productId: { not: null }, orderId: null },
        include: {
          product: {
            select: { id: true, name: true, slug: true, status: true },
          },
        },
      },
    } satisfies Prisma.VoucherInclude;
  }
}
