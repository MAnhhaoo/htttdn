import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaBaseService } from 'src/common/service/prisma-base.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  PaginationUtilService,
  formatPaginatedList,
  normalizePagination,
} from 'src/common/utils/paginaton-util/pagintion-util.service';
import { QueryUtilService } from 'src/common/utils/query-util/query-util.service';
import { CreateProductDto } from './dto/create-product.dto';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import {
  GetProductsPaginationDto,
  GetVendorProductsPaginationDto,
} from './dto/get-product.dto';
import { Prisma, ProductStatus } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';
import { RealtimeService } from '../realtime/realtime.service';
import {
  MAX_IMAGES_PER_COLOR,
  normalizeProductColorImages,
} from 'src/common/utils/product-image/product-image.util';

const productRelations = {
  category: {
    select: { id: true, name: true, slug: true },
  },
  vendor: {
    select: {
      id: true,
      storeName: true,
      fullName: true,
      avatarUrl: true,
      address: true,
      createdAt: true,
    },
  },
  colors: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
    include: {
      variants: {
        where: { deletedAt: null },
        orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
      },
    },
  },
} satisfies Prisma.ProductInclude;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productRelations;
}>;

@Injectable()
export class ProductService extends PrismaBaseService<'product'> {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    prismaService: PrismaService,
    private readonly paginationUtilService: PaginationUtilService,
    private readonly queryUtil: QueryUtilService,
    private readonly stringUtilService: StringUtilService,
    private readonly realtime: RealtimeService,
  ) {
    super(prismaService, 'product');
  }

  async createProduct(createProductDto: CreateProductDto, vendorId?: string) {
    const slug = this.stringUtilService.toSlug(createProductDto.name);

    const existingProduct = await this.extended.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      throw new ConflictException(
        `Sản phẩm "${createProductDto.name}" đã tồn tại`,
      );
    }

    const categoryConnect =
      createProductDto.category ??
      (createProductDto.categoryId
        ? {
            connect: { id: createProductDto.categoryId },
          }
        : undefined);

    if (!categoryConnect) {
      throw new BadRequestException('Vui lòng chọn danh mục sản phẩm');
    }

    const hasColors =
      createProductDto.colors && createProductDto.colors.length > 0;

    const created = await this.extended.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        status: createProductDto.status,
        category: categoryConnect,
        ...(vendorId && { vendor: { connect: { id: vendorId } } }),
        slug,
        ...(hasColors && {
          colors: {
            create: createProductDto.colors!.map((c) => ({
              color: c.color,
              imageUrls: this.normalizeImages(c.imageUrls),
              variants: {
                create: (c.variants || []).map((v) => ({
                  size: v.size,
                  price: v.price,
                  stock: v.stock ?? 0,
                })),
              },
            })),
          },
        }),
      },
      include: productRelations,
    });
    this.realtime.emitProductUpdated(created.id, created.vendorId);
    return created;
  }
  async getProducts(query: GetProductsPaginationDto) {
    const { category, vendorId, ...rest } = query;

    return this.findProducts(rest, {
      status: ProductStatus.active,
      ...(vendorId ? { vendorId } : {}),
      category: this.buildCategoryCondition(category),
    });
  }

  /**
   * Điều kiện lọc danh mục theo slug hoặc UUID, dùng chung cho trang public và admin.
   */
  private buildCategoryCondition(category?: string): Prisma.CategoryWhereInput {
    if (!category || category === 'all') {
      return { deletedAt: null };
    }

    return {
      OR: [
        { slug: category },
        ...(UUID_PATTERN.test(category) ? [{ id: category }] : []),
      ],
      deletedAt: null,
    };
  }

  async getBestSellingProducts(limit = 4) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 4, 50));
    const topProducts = await this.prismaService.extended.$queryRaw<
      Array<{ productId: string; soldQty: number }>
    >(Prisma.sql`
      SELECT
        color."productId" AS "productId",
        COALESCE(SUM(od.quantity), 0)::int AS "soldQty"
      FROM "OrderDetail" od
      JOIN "Order" o ON o.id = od."orderId"
      JOIN "ProductVariant" variant ON variant.id = od."productVariantId"
      JOIN "ProductColor" color ON color.id = variant."productColorId"
      JOIN "Product" p ON p.id = color."productId"
      JOIN "Category" c ON c.id = p."categoryId"
      WHERE o.status <> 'cancelled'
        AND p."deletedAt" IS NULL
        AND p.status = 'active'
        AND c."deletedAt" IS NULL
      GROUP BY color."productId"
      ORDER BY "soldQty" DESC
      LIMIT ${safeLimit}
    `);

    const productQuantityMap = new Map<string, number>(
      topProducts.map((row) => [row.productId, Number(row.soldQty) || 0]),
    );
    const sortedProductIds = topProducts.map((row) => row.productId);

    const products = sortedProductIds.length
      ? await this.extended.findMany({
          where: {
            id: { in: sortedProductIds },
            deletedAt: null,
            status: ProductStatus.active,
            category: { deletedAt: null },
          },
          include: productRelations,
        })
      : [];

    const productMap = new Map(products.map((p) => [p.id, p]));
    const result: any[] = [];
    for (const id of sortedProductIds) {
      if (result.length >= safeLimit) break;
      const p = productMap.get(id);
      if (p) {
        const catalogProd = this.toCatalogProduct(p);
        result.push({
          ...catalogProd,
          soldQuantity: productQuantityMap.get(id) || 0,
        });
      }
    }

    if (result.length < limit) {
      const remainingCount = limit - result.length;
      const existingIds = result.map((r) => r.id);
      const fillerProducts = await this.extended.findMany({
        where: {
          id: { notIn: existingIds },
          deletedAt: null,
          status: ProductStatus.active,
          category: { deletedAt: null },
        },
        take: remainingCount,
        orderBy: { createdAt: 'desc' },
        include: productRelations,
      });
      for (const p of fillerProducts) {
        result.push({
          ...this.toCatalogProduct(p),
          soldQuantity: 0,
        });
      }
    }

    return result;
  }

  async getProductsByCategory(
    categorySlug: string,
    query: GetProductsPaginationDto,
  ) {
    const { vendorId, ...rest } = query as any;
    return this.findProducts(rest, {
      status: ProductStatus.active,
      ...(vendorId ? { vendorId } : {}),
      category: { slug: categorySlug, deletedAt: null },
    });
  }

  async getVendorProducts(
    { status, ...query }: GetVendorProductsPaginationDto,
    vendorId: string,
  ) {
    return this.findProducts(query, {
      vendorId,

      ...(status && status !== 'all' ? { status } : {}),
    });

  }

  async getProductById(id: string) {
    const [product, soldMap] = await Promise.all([
      this.extended.findFirst({
        where: {
          id,
          deletedAt: null,
          status: ProductStatus.active,
          category: { deletedAt: null },
        },
        include: productRelations,
      }),
      this.getSoldQuantityMap([id]),
    ]);

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return this.toCatalogProduct(product, soldMap.get(product.id) ?? 0);
  }

  async addFavorite(productId: string, clientId: string) {
    const exists = await this.extended.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        status: ProductStatus.active,
        category: { deletedAt: null },
      },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }
    const favorite = await this.prismaService.extended.productFavorite.upsert({
      where: { clientId_productId: { clientId, productId } },
      create: { clientId, productId },
      update: { deletedAt: null },
      include: { product: { include: productRelations } },
    });
    return { ...favorite, favorited: true };
  }

  async removeFavorite(productId: string, clientId: string) {
    await this.prismaService.extended.productFavorite.updateMany({
      where: { clientId, productId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return { productId, favorited: false };
  }

  async favoriteStatus(productId: string, clientId: string) {
    const favorite = await this.prismaService.extended.productFavorite.findFirst({
      where: { clientId, productId, deletedAt: null },
      select: { id: true },
    });
    return { productId, favorited: Boolean(favorite) };
  }

  async listFavorites(clientId: string) {
    const favorites = await this.prismaService.extended.productFavorite.findMany({
      where: {
        clientId,
        deletedAt: null,
        product: {
          deletedAt: null,
          status: ProductStatus.active,
          category: { deletedAt: null },
        },
      },
      include: { product: { include: productRelations } },
      orderBy: { createdAt: 'desc' },
    });
    const soldMap = await this.getSoldQuantityMap(
      favorites.map((favorite) => favorite.product.id),
    );
    return favorites.map((favorite) => ({
      id: favorite.id,
      createdAt: favorite.createdAt,
      product: this.toCatalogProduct(
        favorite.product,
        soldMap.get(favorite.product.id) ?? 0,
      ),
    }));
  }

  private async findProducts(
    {
      page = 1,
      itemPerPage = 10,
      search,
      q,
      createdAfter,
      minPrice,
      maxPrice,
    }: any,
    scope: Prisma.ProductWhereInput,
  ) {
    const keyword = search || q;
    const searchCondition = this.queryUtil.createStringSearchCondition(
      keyword,
      ['name', 'slug', 'description'],
    ) as Prisma.ProductWhereInput;

    const hasPriceFilter =
      (minPrice !== undefined &&
        minPrice !== null &&
        !isNaN(Number(minPrice))) ||
      (maxPrice !== undefined && maxPrice !== null && !isNaN(Number(maxPrice)));

    const priceCondition: Prisma.ProductColorListRelationFilter = {
      some: {
        deletedAt: null,
        variants: {
          some: {
            deletedAt: null,
            ...(minPrice !== undefined &&
            minPrice !== null &&
            !isNaN(Number(minPrice))
              ? { price: { gte: Number(minPrice) } }
              : {}),
            ...(maxPrice !== undefined &&
            maxPrice !== null &&
            !isNaN(Number(maxPrice))
              ? { price: { lte: Number(maxPrice) } }
              : {}),
          },
        },
      },
    };

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...scope,
      ...searchCondition,
      ...(createdAfter ? { createdAt: { gte: new Date(createdAfter) } } : {}),
      ...(hasPriceFilter ? { colors: priceCondition } : {}),
    };

    const normalized = normalizePagination({ page, itemPerPage });
    const [totalItems, list] = await Promise.all([
      this.extended.count({ where }),
      this.extended.findMany({
        where,
        skip: normalized.skip,
        take: normalized.itemPerPage,
        orderBy: {
          createdAt: 'desc',
        },
        include: productRelations,
      }),
    ]);

    const soldMap = await this.getSoldQuantityMap(list.map((p) => p.id));

    return formatPaginatedList(
      list.map((product) =>
        this.toCatalogProduct(product, soldMap.get(product.id) ?? 0),
      ),
      totalItems,
      { page: normalized.page, itemPerPage: normalized.itemPerPage },
    );
  }

  private async getSoldQuantityMap(
    productIds: string[],
  ): Promise<Map<string, number>> {
    const validIds = [
      ...new Set(productIds.filter((id) => UUID_PATTERN.test(id))),
    ];
    if (
      !validIds.length ||
      typeof this.prismaService?.extended?.$queryRaw !== 'function'
    ) {
      return new Map();
    }

    try {
      const rows = await this.prismaService.extended.$queryRaw<
        Array<{ productId: string; soldQuantity: bigint | number | string }>
      >(Prisma.sql`
        SELECT color."productId" AS "productId", COALESCE(SUM(od.quantity), 0) AS "soldQuantity"
        FROM "OrderDetail" AS od
        JOIN "Order" AS o ON o.id = od."orderId"
        JOIN "ProductVariant" AS variant ON variant.id = od."productVariantId"
        JOIN "ProductColor" AS color ON color.id = variant."productColorId"
        WHERE color."productId" IN (${Prisma.join(validIds.map((id) => Prisma.sql`${id}::uuid`))})
          AND o.status <> 'cancelled'::"OrderStatus"
        GROUP BY color."productId"
      `);

      return new Map(
        rows.map((row) => [row.productId, Number(row.soldQuantity) || 0]),
      );
    } catch (error) {
      this.logger.warn(
        `Không thể tính soldQuantity qua truy vấn gộp: ${(error as Error).message}`,
      );
      return new Map();
    }
  }

  private toCatalogProduct(product: ProductWithRelations, soldQuantity = 0) {
    const variants = product.colors.flatMap((color) => color.variants);
    let minPrice: Prisma.Decimal | null = null;
    let maxPrice: Prisma.Decimal | null = null;

    for (const variant of variants) {
      if (minPrice === null || variant.price.lessThan(minPrice)) {
        minPrice = variant.price;
      }
      if (maxPrice === null || variant.price.greaterThan(maxPrice)) {
        maxPrice = variant.price;
      }
    }

    return {
      ...product,
      thumbnail:
        product.colors.find((color) => color.imageUrls.length > 0)
          ?.imageUrls[0] ?? null,
      minPrice: minPrice?.toString() ?? null,
      maxPrice: maxPrice?.toString() ?? null,
      totalStock: variants.reduce((total, variant) => total + variant.stock, 0),
      soldQuantity,
    };
  }
  async updateProduct(
    id: string,
    data: UpdateProductDto,
    vendorId?: string,
    isAdmin = false,
  ) {
    await this.assertCanManage(id, vendorId, isAdmin);

    const categoryConnect =
      data.category ??
      (data.categoryId
        ? {
            connect: { id: data.categoryId },
          }
        : undefined);

    // Toàn bộ thay đổi sản phẩm, màu và biến thể nằm trong một transaction để không bị cập nhật dở.
    const updated = await this.prismaService.extendedTransaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.status !== undefined && { status: data.status }),
          ...(categoryConnect !== undefined && { category: categoryConnect }),
        },
      });

      if (data.colors && Array.isArray(data.colors)) {
        await this.syncColors(tx, id, data.colors);
      }

      return product;
    });

    this.realtime.emitProductUpdated(updated.id, updated.vendorId);
    return updated;
  }

  async deleteProduct(id: string, vendorId?: string, isAdmin = false) {
    const target = await this.assertCanManage(id, vendorId, isAdmin);
    const archivedSlug = target?.slug
      ? `${target.slug.replace(/-deleted-\d+$/, '').slice(0, 210)}-deleted-${Date.now()}`
      : undefined;

    const deleted = await this.prismaService.extended.product.update({
      where: { id },
      data: {
        status: ProductStatus.inactive,
        deletedAt: new Date(),
        ...(archivedSlug ? { slug: archivedSlug } : {}),
      },
    });
    this.realtime.emitProductUpdated(deleted.id, deleted.vendorId);
    return deleted;
  }

  /**
   * Vendor chỉ được thao tác sản phẩm của mình, admin được thao tác mọi sản phẩm chưa xóa.
   */
  private async assertCanManage(
    id: string,
    vendorId: string | undefined,
    isAdmin: boolean,
  ): Promise<{ id: string; slug?: string }> {
    if (!isAdmin) {
      return this.getOwnedProduct(id, vendorId!);
    }

    const product = await this.extended.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, slug: true },
    });
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }
    return product;
  }

  /**
   * Đồng bộ màu và biến thể gửi lên với sản phẩm.
   * Mọi id màu/biến thể đều phải thuộc đúng sản phẩm, tránh sửa dữ liệu của sản phẩm khác.
   */
  private async syncColors(
    tx: Prisma.TransactionClient,
    productId: string,
    colors: NonNullable<UpdateProductDto['colors']>,
  ) {
    const preparedColors = colors.map((color) => ({
      ...color,
      normalizedImages: this.normalizeImages(color.imageUrls),
    }));

    const existingColors = await tx.productColor.findMany({
      where: { productId },
      include: { variants: true },
    });

    type CachedVariant = {
      id: string;
      size: string;
      deletedAt: Date | null;
    };
    type CachedColor = {
      id: string;
      color: string;
      deletedAt: Date | null;
      variantsById: Map<string, CachedVariant>;
      variantsBySize: Map<string, CachedVariant>;
    };

    const colorById = new Map<string, CachedColor>();
    const colorByName = new Map<string, CachedColor>();

    const registerRawColor = (rawColor: {
      id: string;
      color: string;
      deletedAt?: Date | null;
      variants?: Array<{ id: string; size: string; deletedAt?: Date | null }>;
    }): CachedColor => {
      const variantsById = new Map<string, CachedVariant>();
      const variantsBySize = new Map<string, CachedVariant>();
      for (const v of rawColor.variants ?? []) {
        const cachedV: CachedVariant = {
          id: v.id,
          size: v.size,
          deletedAt: v.deletedAt ?? null,
        };
        variantsById.set(v.id, cachedV);
        variantsBySize.set(v.size, cachedV);
      }
      const cachedColor: CachedColor = {
        id: rawColor.id,
        color: rawColor.color,
        deletedAt: rawColor.deletedAt ?? null,
        variantsById,
        variantsBySize,
      };
      colorById.set(rawColor.id, cachedColor);
      colorByName.set(rawColor.color, cachedColor);
      return cachedColor;
    };

    for (const rawColor of existingColors) {
      registerRawColor(rawColor);
    }

    const keptColorIds = new Set<string>();
    const incomingColorIds = new Set(
      preparedColors
        .filter((c) => c.id && !c.id.startsWith('temp-'))
        .map((c) => c.id!),
    );

    for (const color of preparedColors) {
      const imageUrls = color.normalizedImages;
      let targetColor: CachedColor;

      if (color.id && !color.id.startsWith('temp-')) {
        const owned = colorById.get(color.id);
        if (!owned) {
          throw new NotFoundException(
            'Màu sản phẩm không tồn tại trong sản phẩm này',
          );
        }

        await tx.productColor.update({
          where: { id: owned.id },
          data: {
            color: color.color,
            imageUrls,
            ...(owned.deletedAt ? { deletedAt: null } : {}),
          },
        });
        owned.deletedAt = null;
        if (owned.color !== color.color) {
          colorByName.delete(owned.color);
          owned.color = color.color;
          colorByName.set(owned.color, owned);
        }
        keptColorIds.add(owned.id);
        targetColor = owned;
      } else {
        let existing = colorByName.get(color.color);
        if (
          !existing &&
          typeof (tx.productColor as any).findUnique === 'function'
        ) {
          const foundDeleted = await tx.productColor.findUnique({
            where: { productId_color: { productId, color: color.color } },
            include: { variants: true },
          });
          if (foundDeleted) {
            existing = registerRawColor(foundDeleted);
          }
        }

        if (
          existing &&
          !existing.deletedAt &&
          (keptColorIds.has(existing.id) || incomingColorIds.has(existing.id))
        ) {
          throw new ConflictException(
            `Màu "${color.color}" đã tồn tại trong sản phẩm`,
          );
        }

        // Màu đã xóa mềm (hoặc gửi lại theo tên) được khôi phục/cập nhật thay vì tạo trùng khóa unique.
        if (existing) {
          await tx.productColor.update({
            where: { id: existing.id },
            data: { deletedAt: null, imageUrls },
          });
          existing.deletedAt = null;
          keptColorIds.add(existing.id);
          targetColor = existing;
        } else {
          const saved = await tx.productColor.create({
            data: { productId, color: color.color, imageUrls },
          });
          const createdCached: CachedColor = {
            id: saved.id,
            color: color.color,
            deletedAt: null,
            variantsById: new Map(),
            variantsBySize: new Map(),
          };
          colorById.set(saved.id, createdCached);
          colorByName.set(color.color, createdCached);
          if (saved.id) {
            keptColorIds.add(saved.id);
          }
          targetColor = createdCached;
        }
      }

      const keptVariantIds = new Set<string>();
      const incomingVariantIds = new Set(
        (color.variants ?? [])
          .filter((v) => v.id && !v.id.startsWith('temp-'))
          .map((v) => v.id!),
      );

      for (const variant of color.variants ?? []) {
        await this.syncVariant(
          tx,
          targetColor,
          variant,
          keptVariantIds,
          incomingVariantIds,
        );
      }

      const removedVariantIds = Array.from(targetColor.variantsById.values())
        .filter((v) => !v.deletedAt && !keptVariantIds.has(v.id))
        .map((v) => v.id);
      if (removedVariantIds.length > 0) {
        const now = new Date();
        await tx.productVariant.updateMany({
          where: { id: { in: removedVariantIds } },
          data: { deletedAt: now },
        });
        for (const vid of removedVariantIds) {
          const cached = targetColor.variantsById.get(vid);
          if (cached) cached.deletedAt = now;
        }
      }
    }

    const removedColorIds = existingColors
      .filter((c) => !c.deletedAt && !keptColorIds.has(c.id))
      .map((c) => c.id);
    if (removedColorIds.length > 0) {
      const now = new Date();
      await tx.productVariant.updateMany({
        where: { productColorId: { in: removedColorIds }, deletedAt: null },
        data: { deletedAt: now },
      });
      await tx.productColor.updateMany({
        where: { id: { in: removedColorIds } },
        data: { deletedAt: now },
      });
    }
  }

  private async syncVariant(
    tx: Prisma.TransactionClient,
    colorCache: {
      id: string;
      variantsById: Map<
        string,
        { id: string; size: string; deletedAt: Date | null }
      >;
      variantsBySize: Map<
        string,
        { id: string; size: string; deletedAt: Date | null }
      >;
    },
    variant: { id?: string; size: string; price: number; stock?: number },
    keptVariantIds: Set<string>,
    incomingVariantIds: Set<string>,
  ) {
    const productColorId = colorCache.id;
    const stock = variant.stock ?? 0;

    if (variant.id && !variant.id.startsWith('temp-')) {
      const owned = colorCache.variantsById.get(variant.id);
      if (!owned) {
        throw new NotFoundException(
          'Biến thể sản phẩm không tồn tại trong màu này',
        );
      }

      await tx.productVariant.update({
        where: { id: owned.id },
        data: {
          size: variant.size,
          price: variant.price,
          stock,
          ...(owned.deletedAt ? { deletedAt: null } : {}),
        },
      });
      owned.deletedAt = null;
      if (owned.size !== variant.size) {
        colorCache.variantsBySize.delete(owned.size);
        owned.size = variant.size;
        colorCache.variantsBySize.set(owned.size, owned);
      }
      keptVariantIds.add(owned.id);
      return;
    }

    let existing = colorCache.variantsBySize.get(variant.size);
    if (
      !existing &&
      typeof (tx.productVariant as any).findUnique === 'function'
    ) {
      const foundDeleted = await tx.productVariant.findUnique({
        where: {
          productColorId_size: { productColorId, size: variant.size },
        },
      });
      if (foundDeleted) {
        const cached = {
          id: foundDeleted.id,
          size: foundDeleted.size,
          deletedAt: foundDeleted.deletedAt ?? null,
        };
        colorCache.variantsById.set(cached.id, cached);
        colorCache.variantsBySize.set(cached.size, cached);
        existing = cached;
      }
    }

    if (
      existing &&
      !existing.deletedAt &&
      (keptVariantIds.has(existing.id) || incomingVariantIds.has(existing.id))
    ) {
      throw new ConflictException(
        `Size "${variant.size}" đã tồn tại trong màu này`,
      );
    }

    // Size đã xóa mềm (hoặc gửi lại theo tên) được khôi phục/cập nhật thay vì tạo trùng khóa unique.
    if (existing) {
      await tx.productVariant.update({
        where: { id: existing.id },
        data: { deletedAt: null, price: variant.price, stock },
      });
      existing.deletedAt = null;
      keptVariantIds.add(existing.id);
      return;
    }

    const created = await tx.productVariant.create({
      data: { productColorId, size: variant.size, price: variant.price, stock },
    });
    if (created?.id) {
      const cached = { id: created.id, size: variant.size, deletedAt: null };
      colorCache.variantsById.set(created.id, cached);
      colorCache.variantsBySize.set(variant.size, cached);
      keptVariantIds.add(created.id);
    }
  }

  /**
   * Loại URL ảnh trống/trùng và giới hạn số ảnh mỗi màu (tái sử dụng hàm dùng chung).
   */
  private normalizeImages(imageUrls?: string[]): string[] {
    return normalizeProductColorImages(imageUrls, MAX_IMAGES_PER_COLOR);
  }

  private async getOwnedProduct(id: string, vendorId: string) {
    const product = await this.extended.findFirst({
      where: { id, vendorId, deletedAt: null },
      select: { id: true, slug: true },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return product;
  }
}
