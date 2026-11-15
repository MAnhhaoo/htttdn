import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  DiscountType,
  Prisma,
  ProductStatus,
  VoucherScope,
  VoucherStatus,
} from '@prisma/client';

import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { RealtimeService } from '../realtime/realtime.service';
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
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly realtime?: RealtimeService,
  ) {}

  async catalogOffers(productIds: string[]) {
    const now = new Date();
    const offers = await this.prisma.extended.voucher.findMany({
      where: {
        deletedAt: null,
        status: 'active',
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          {
            scope: 'platform',
            details: {
              none: {
                productId: { not: null },
                orderId: null,
                reversedAt: null,
              },
            },
          },
          {
            details: {
              some: {
                productId: { in: productIds },
                orderId: null,
                reversedAt: null,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        code: true,
        name: true,
        scope: true,
        vendorId: true,
        discountType: true,
        discountValue: true,
        minOrderAmount: true,
        maxDiscountAmount: true,
        startDate: true,
        endDate: true,
        perUserLimit: true,
        quantity: true,
        usedQuantity: true,
        details: {
          where: {
            productId: { in: productIds },
            orderId: null,
            reversedAt: null,
          },
          select: { productId: true },
        },
      },
    });
    return offers
      .filter((offer) => offer.usedQuantity < offer.quantity)
      .map(({ quantity: _q, usedQuantity: _u, details, ...offer }) => ({
        ...offer,
        productIds: details.map((detail) => detail.productId),
      }));
  }

  private emitUpdated(voucher: { id: string; vendorId: string | null }) {
    const payload = { voucherId: voucher.id };
    this.realtime?.emitToCatalog('voucher:updated', payload);
    this.realtime?.emitToAdmins('voucher:updated', payload);
    if (voucher.vendorId)
      this.realtime?.emitToVendor(voucher.vendorId, 'voucher:updated', payload);
  }

  async create(dto: CreateVoucherDto, user: UserInfo) {
    if (user.role !== 'admin' && user.role !== 'vendor') {
      throw new ForbiddenException('Chỉ admin hoặc vendor được tạo voucher');
    }

    const scope =
      user.role === 'admin' ? VoucherScope.platform : VoucherScope.vendor;
    let productIds = [...new Set(dto.productIds ?? [])];
    const categoryIds = [...new Set(dto.categoryIds ?? [])];

    if (scope === VoucherScope.vendor) {
      if (!productIds.length) {
        throw new BadRequestException('Vendor phải chọn ít nhất một sản phẩm');
      }
      await this.assertOwnedProducts(productIds, user.userID);
    } else {
      if (productIds.length) {
        throw new BadRequestException('Voucher toàn sàn không nhận productIds');
      }
      if (categoryIds.length) {
        productIds = await this.resolveCategoryProductIds(categoryIds);
      }
    }

    const duplicate = await this.prisma.extended.voucher.findUnique({
      where: { code: dto.code },
    });
    if (duplicate) throw new ConflictException('Mã voucher đã tồn tại');

    const { productIds: _productIds, categoryIds: _categoryIds, ...data } = dto;
    const created = await this.prisma.extended.voucher.create({
      data: {
        ...data,
        scope,
        adminId: user.role === 'admin' ? user.userID : undefined,
        vendorId: user.role === 'vendor' ? user.userID : undefined,
        details: productIds.length
          ? {
              create: productIds.map((productId) => ({ productId })),
            }
          : undefined,
      },
      include: this.detailsInclude(),
    });
    this.emitUpdated(created);
    return this.enrichVoucher(created);
  }

  async getMine(userId: string) {
    const list = await this.prisma.extended.voucher.findMany({
      where: {
        OR: [{ adminId: userId }, { vendorId: userId }],
        deletedAt: null,
      },
      include: this.detailsInclude(),
      orderBy: { createdAt: 'desc' },
    });
    return list.map((v) => this.enrichVoucher(v));
  }

  async getAll() {
    const list = await this.prisma.extended.voucher.findMany({
      where: { deletedAt: null },
      include: {
        ...this.detailsInclude(),
        admin: { select: { id: true, fullName: true } },
        vendor: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((v) => this.enrichVoucher(v));
  }

  async getAvailable() {
    const now = new Date();
    const vouchers = await this.prisma.extended.voucher.findMany({
      where: {
        deletedAt: null,
        status: VoucherStatus.active,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        ...this.detailsInclude(),
        admin: { select: { id: true, fullName: true } },
        vendor: { select: { id: true, fullName: true } },
      },
      orderBy: { endDate: 'asc' },
    });
    return vouchers
      .filter((voucher) => voucher.usedQuantity < voucher.quantity)
      .map((v) => this.enrichVoucher(v));
  }

  async getById(id: string, user: UserInfo) {
    const voucher = await this.prisma.extended.voucher.findFirst({
      where: { id, deletedAt: null },
      include: this.detailsInclude(),
    });
    if (!voucher) throw new NotFoundException('Voucher không tồn tại');
    if (
      user.role !== 'admin' &&
      voucher.vendorId !== user.userID &&
      voucher.adminId !== user.userID
    ) {
      throw new ForbiddenException('Bạn không có quyền xem voucher này');
    }
    return this.enrichVoucher(voucher);
  }

  async update(id: string, dto: UpdateVoucherDto, user: UserInfo) {
    const current = await this.getById(id, user);
    if (user.role !== 'admin' && current.vendorId !== user.userID && current.adminId !== user.userID) {
      throw new ForbiddenException(
        'Admin chỉ được vô hiệu hóa voucher của vendor',
      );
    }

    let productIds = dto.productIds
      ? [...new Set(dto.productIds)]
      : undefined;
    if (current.scope === VoucherScope.vendor && productIds) {
      await this.assertOwnedProducts(productIds, current.vendorId!);
    }
    if (current.scope === VoucherScope.platform) {
      if (productIds) {
        throw new BadRequestException('Voucher toàn sàn không nhận productIds');
      }
      if (dto.categoryIds !== undefined) {
        const categoryIds = [...new Set(dto.categoryIds)];
        productIds = categoryIds.length
          ? await this.resolveCategoryProductIds(categoryIds)
          : [];
      }
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
      const duplicate = await this.prisma.extended.voucher.findUnique({
        where: { code: dto.code },
      });
      if (duplicate) throw new ConflictException('Mã voucher đã tồn tại');
    }

    const { productIds: _productIds, categoryIds: _categoryIds, ...data } = dto;
    const updated = await this.prisma.extendedTransaction(async (tx) => {
      if (productIds !== undefined) {
        const existingDetails = await tx.voucherDetail.findMany({
          where: {
            voucherId: id,
            productId: { not: null },
            orderId: null,
          },
        });
        const targetProductIds = new Set(productIds);
        const existingByProductId = new Map<
          string,
          (typeof existingDetails)[number]
        >();
        for (const detail of existingDetails) {
          if (detail.productId) {
            existingByProductId.set(detail.productId, detail);
          }
        }

        const toReverseIds = existingDetails
          .filter(
            (d) =>
              d.productId !== null &&
              !targetProductIds.has(d.productId) &&
              d.reversedAt === null,
          )
          .map((d) => d.id);

        const toRestoreIds = existingDetails
          .filter(
            (d) =>
              d.productId !== null &&
              targetProductIds.has(d.productId) &&
              d.reversedAt !== null,
          )
          .map((d) => d.id);

        const newProductIds = productIds.filter(
          (pid) => !existingByProductId.has(pid),
        );

        if (toReverseIds.length > 0) {
          await tx.voucherDetail.updateMany({
            where: { id: { in: toReverseIds } },
            data: { reversedAt: new Date() },
          });
        }
        if (toRestoreIds.length > 0) {
          await tx.voucherDetail.updateMany({
            where: { id: { in: toRestoreIds } },
            data: { reversedAt: null },
          });
        }
        if (newProductIds.length > 0) {
          await tx.voucherDetail.createMany({
            data: newProductIds.map((productId) => ({
              voucherId: id,
              productId,
            })),
          });
        }
      }

      return tx.voucher.update({
        where: { id },
        data,
        include: this.detailsInclude(),
      });
    });
    this.emitUpdated(updated);
    return this.enrichVoucher(updated);
  }

  async setStatus(
    id: string,
    status: VoucherStatus,
    user: UserInfo,
    moderation = false,
  ) {
    const voucher = await this.getById(id, user);
    if (
      !moderation &&
      voucher.vendorId !== user.userID &&
      voucher.adminId !== user.userID
    ) {
      throw new ForbiddenException('Bạn không có quyền cập nhật voucher này');
    }
    const updated = await this.prisma.extended.voucher.update({
      where: { id },
      data: { status },
    });
    this.emitUpdated(updated);
    return updated;
  }

  async extend(id: string, newEndDateStr: string, user: UserInfo) {
    const voucher = await this.getById(id, user);
    if (
      user.role !== 'admin' &&
      voucher.vendorId !== user.userID &&
      voucher.adminId !== user.userID
    ) {
      throw new ForbiddenException('Bạn không có quyền gia hạn voucher này');
    }

    const newEndDate = new Date(newEndDateStr);
    if (isNaN(newEndDate.getTime()) || newEndDate <= new Date()) {
      throw new BadRequestException('Hạn kết thúc mới phải ở tương lai');
    }
    if (new Date(voucher.startDate) >= newEndDate) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    const updated = await this.prisma.extended.voucher.update({
      where: { id },
      data: {
        endDate: newEndDate,
        status: VoucherStatus.active,
      },
      include: this.detailsInclude(),
    });

    this.emitUpdated(updated);
    return this.enrichVoucher(updated);
  }

  async remove(id: string, user: UserInfo) {
    const voucher = await this.getById(id, user);
    if (voucher.vendorId !== user.userID && voucher.adminId !== user.userID) {
      throw new ForbiddenException('Bạn không có quyền xóa voucher này');
    }
    const now = new Date();
    const updated = await this.prisma.extendedTransaction(async (tx) => {
      await tx.voucherDetail.updateMany({
        where: { voucherId: id, orderId: null, reversedAt: null },
        data: { reversedAt: now },
      });
      return tx.voucher.update({
        where: { id },
        data: { status: VoucherStatus.inactive, deletedAt: now },
      });
    });
    this.emitUpdated(updated);
    return updated;
  }

  preview(dto: PreviewVoucherDto, userId: string) {
    return this.calculate(
      dto.codes,
      userId,
      dto.items,
      this.prisma.extended as unknown as Prisma.TransactionClient,
    );
  }

  async calculate(
    codes: string[],
    userId: string,
    requestedItems: Array<{
      productVariantId: string;
      quantity: number;
    }>,
    db: DatabaseClient,
    plannedUses = new Map<string, number>(),
  ) {
    const normalizedCodes = [
      ...new Set(codes.map((code) => code.trim().toUpperCase())),
    ];
    if (normalizedCodes.length !== codes.length) {
      throw new BadRequestException('Voucher bị trùng lặp');
    }

    const [variants, vouchers] = await Promise.all([
      db.productVariant.findMany({
        where: {
          id: {
            in: requestedItems.map((item) => item.productVariantId),
          },
          deletedAt: null,
        },
        select: {
          id: true,
          productColorId: true,
          size: true,
          stock: true,
          price: true,
          deletedAt: true,
          productColor: {
            select: {
              id: true,
              productId: true,
              color: true,
              imageUrls: true,
              deletedAt: true,
              product: {
                select: {
                  id: true,
                  vendorId: true,
                  categoryId: true,
                  name: true,
                  slug: true,
                  status: true,
                  deletedAt: true,
                },
              },
            },
          },
        },
      }),
      normalizedCodes.length > 0
        ? db.voucher.findMany({
            where: { code: { in: normalizedCodes }, deletedAt: null },
            include: {
              details: {
                where: {
                  productId: { not: null },
                  orderId: null,
                  reversedAt: null,
                },
              },
            },
          })
        : Promise.resolve([]),
    ]);
    if (variants.length !== requestedItems.length) {
      throw new BadRequestException('Có biến thể sản phẩm không tồn tại');
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));
    const items = requestedItems.map((requested) => {
      const variant = variantMap.get(requested.productVariantId)!;
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

    const usageGroups =
      ordered.length > 0
        ? await db.voucherDetail.groupBy({
            by: ['voucherId'],
            where: {
              voucherId: { in: ordered.map((v) => v.id) },
              order: { clientId: userId },
              reversedAt: null,
            },
            _count: { _all: true },
          })
        : [];
    const usedByCustomerMap = new Map<string, number>(
      usageGroups.map((group) => [group.voucherId, group._count._all ?? 0]),
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
        voucher.usedQuantity + (plannedUses.get(voucher.id) || 0) >=
          voucher.quantity
      ) {
        throw new BadRequestException(
          `Voucher ${voucher.code} không còn hiệu lực`,
        );
      }

      const usedByCustomer = usedByCustomerMap.get(voucher.id) ?? 0;
      if (
        usedByCustomer + (plannedUses.get(voucher.id) || 0) >=
        voucher.perUserLimit
      ) {
        throw new BadRequestException(
          `Bạn đã hết lượt dùng voucher ${voucher.code}`,
        );
      }

      const productIds = new Set(
        voucher.details.flatMap((detail) =>
          detail.productId && !detail.reversedAt ? [detail.productId] : [],
        ),
      );
      const isAllPlatform =
        voucher.scope === VoucherScope.platform && productIds.size === 0;
      const eligibleItems = isAllPlatform
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

      const discountBase = isAllPlatform
        ? remaining
        : Prisma.Decimal.min(remaining, originalEligible);
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
        expectedUsedQuantity:
          voucher.usedQuantity + (plannedUses.get(voucher.id) || 0),
      });
    }

    for (const application of applications)
      plannedUses.set(
        application.voucherId,
        (plannedUses.get(application.voucherId) || 0) + 1,
      );

    return {
      subtotalAmount: subtotal,
      discountAmount: subtotal.minus(remaining),
      totalAmount: remaining,
      applications,
      items,
    };
  }

  private async assertOwnedProducts(productIds: string[], vendorId: string) {
    const count = await this.prisma.extended.product.count({
      where: { id: { in: productIds }, vendorId, deletedAt: null },
    });
    if (count !== productIds.length) {
      throw new ForbiddenException('Có sản phẩm không thuộc cửa hàng của bạn');
    }
  }

  private async resolveCategoryProductIds(categoryIds: string[]): Promise<string[]> {
    const [validCategories, products] = await Promise.all([
      this.prisma.extended.category.count({
        where: { id: { in: categoryIds }, deletedAt: null },
      }),
      this.prisma.extended.product.findMany({
        where: { categoryId: { in: categoryIds }, deletedAt: null },
        select: { id: true },
      }),
    ]);
    if (validCategories !== categoryIds.length) {
      throw new BadRequestException('Có danh mục áp dụng không tồn tại');
    }
    if (products.length === 0) {
      throw new BadRequestException('Các danh mục đã chọn hiện chưa có sản phẩm nào');
    }
    return products.map((p) => p.id);
  }

  private enrichVoucher<
    T extends {
      details?: Array<{
        product?: {
          categoryId?: string | null;
          category?: { id: string; name: string; slug: string } | null;
        } | null;
      }>;
    },
  >(voucher: T) {
    const categoryMap = new Map<string, { id: string; name: string; slug: string }>();
    for (const detail of voucher.details ?? []) {
      const cat = detail.product?.category;
      if (cat?.id && !categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, cat);
      }
    }
    const categories = Array.from(categoryMap.values());
    return {
      ...voucher,
      categoryIds: categories.map((c) => c.id),
      categories,
    };
  }

  private detailsInclude() {
    return {
      details: {
        where: { productId: { not: null }, orderId: null, reversedAt: null },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              categoryId: true,
              category: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      },
    } satisfies Prisma.VoucherInclude;
  }
}
