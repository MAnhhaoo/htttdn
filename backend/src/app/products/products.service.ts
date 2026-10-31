import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaBaseService } from 'src/common/service/prisma-base.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationUtilService } from 'src/common/utils/paginaton-util/pagintion-util.service';
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
    const topVariants = await this.prismaService.extended.orderDetail.groupBy({
      by: ['productVariantId'],
      where: {
        order: {
          status: { not: 'cancelled' },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
    });

    const variantIds = topVariants.map((tv) => tv.productVariantId);
    // Sales history can reference a soft-deleted variant or color.
    const variants = variantIds.length
      ? await this.prismaService.extended.$queryRaw<
          Array<{ id: string; productId: string }>
        >(Prisma.sql`
          SELECT variant.id, color."productId"
          FROM "ProductVariant" AS variant
          JOIN "ProductColor" AS color ON color.id = variant."productColorId"
          WHERE variant.id IN (${Prisma.join(variantIds.map((id) => Prisma.sql`${id}::uuid`))})
        `)
      : [];

    const variantToProduct = new Map<string, string>();
    for (const v of variants) {
      if (v.productId) {
        variantToProduct.set(v.id, v.productId);
      }
    }

    const productQuantityMap = new Map<string, number>();
    for (const item of topVariants) {
      const productId = variantToProduct.get(item.productVariantId);
      if (productId) {
        const current = productQuantityMap.get(productId) || 0;
        productQuantityMap.set(productId, current + (item._sum.quantity || 0));
      }
    }

    const sortedProductIds = Array.from(productQuantityMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([productId]) => productId);

    const products = await this.extended.findMany({
      where: {
        id: { in: sortedProductIds.slice(0, limit * 2) },
        deletedAt: null,
        status: ProductStatus.active,
        category: { deletedAt: null },
      },
      include: productRelations,
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const result: any[] = [];
    for (const id of sortedProductIds) {
      if (result.length >= limit) break;
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
      ...(status ? { status } : {}),
    });
  }

  async getProductById(id: string) {
    const product = await this.extended.findFirst({
      where: {
        id,
        deletedAt: null,
        status: ProductStatus.active,
        category: { deletedAt: null },
      },
      include: productRelations,
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return this.toCatalogProduct(product);
  }

  async addFavorite(productId: string, clientId: string) {
    await this.getProductById(productId);
    const favorite = await this.prismaService.extended.productFavorite.upsert({
      where: { clientId_productId: { clientId, productId } },
      create: { clientId, productId },
      update: {},
      include: { product: { include: productRelations } },
    });
    return { ...favorite, favorited: true };
  }

  async removeFavorite(productId: string, clientId: string) {
    await this.prismaService.extended.productFavorite.deleteMany({
      where: { clientId, productId },
    });
    return { productId, favorited: false };
  }

  async favoriteStatus(productId: string, clientId: string) {
    const favorite = await this.prismaService.extended.productFavorite.findUnique({
      where: { clientId_productId: { clientId, productId } },
      select: { id: true },
    });
    return { productId, favorited: Boolean(favorite) };
  }

  async listFavorites(clientId: string) {
    const favorites = await this.prismaService.extended.productFavorite.findMany({
      where: {
        clientId,
        product: {
          deletedAt: null,
          status: ProductStatus.active,
          category: { deletedAt: null },
        },
      },
      include: { product: { include: productRelations } },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((favorite) => ({
      id: favorite.id,
      createdAt: favorite.createdAt,
      product: this.toCatalogProduct(favorite.product),
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

    const totalItems = await this.extended.count({
      where,
    });

    const paging = this.paginationUtilService.paging({
      page,
      itemPerPage,
      totalItems,
    });

    const list = await this.extended.findMany({
      where,
      skip: paging.skip,
      take: itemPerPage,
      orderBy: {
        createdAt: 'desc',
      },

      include: productRelations,
    });

    return paging.format(list.map((product) => this.toCatalogProduct(product)));
  }

  private toCatalogProduct(product: ProductWithRelations) {
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
    await this.assertCanManage(id, vendorId, isAdmin);

    const deleted = await this.prismaService.extended.product.update({
      where: { id },
      data: {
        status: 'inactive',
        deletedAt: new Date(),
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
  ) {
    if (!isAdmin) {
      await this.getOwnedProduct(id, vendorId!);
      return;
    }

    const product = await this.extended.findFirst({
      where: { id },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }
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
    for (const color of colors) {
      const imageUrls = this.normalizeImages(color.imageUrls);
      let colorId: string;

      if (color.id && !color.id.startsWith('temp-')) {
        const owned = await tx.productColor.findFirst({
          where: { id: color.id, productId, deletedAt: null },
          select: { id: true },
        });
        if (!owned) {
          throw new NotFoundException(
            'Màu sản phẩm không tồn tại trong sản phẩm này',
          );
        }

        await tx.productColor.update({
          where: { id: owned.id },
          data: { color: color.color, imageUrls },
        });
        colorId = owned.id;
      } else {
        const existing = await tx.productColor.findUnique({
          where: { productId_color: { productId, color: color.color } },
        });
        if (existing && !existing.deletedAt) {
          throw new ConflictException(
            `Màu "${color.color}" đã tồn tại trong sản phẩm`,
          );
        }

        // Màu đã xóa mềm vẫn chịu ràng buộc unique nên được khôi phục thay vì tạo mới.
        const saved = existing
          ? await tx.productColor.update({
              where: { id: existing.id },
              data: { deletedAt: null, imageUrls },
            })
          : await tx.productColor.create({
              data: { productId, color: color.color, imageUrls },
            });
        colorId = saved.id;
      }

      for (const variant of color.variants ?? []) {
        await this.syncVariant(tx, colorId, variant);
      }
    }
  }

  private async syncVariant(
    tx: Prisma.TransactionClient,
    productColorId: string,
    variant: { id?: string; size: string; price: number; stock?: number },
  ) {
    const stock = variant.stock ?? 0;

    if (variant.id && !variant.id.startsWith('temp-')) {
      const owned = await tx.productVariant.findFirst({
        where: { id: variant.id, productColorId, deletedAt: null },
        select: { id: true },
      });
      if (!owned) {
        throw new NotFoundException(
          'Biến thể sản phẩm không tồn tại trong màu này',
        );
      }

      await tx.productVariant.update({
        where: { id: owned.id },
        data: { size: variant.size, price: variant.price, stock },
      });
      return;
    }

    const existing = await tx.productVariant.findUnique({
      where: { productColorId_size: { productColorId, size: variant.size } },
    });
    if (existing && !existing.deletedAt) {
      throw new ConflictException(
        `Size "${variant.size}" đã tồn tại trong màu này`,
      );
    }

    // Size đã xóa mềm vẫn chịu ràng buộc unique nên được khôi phục thay vì tạo mới.
    if (existing) {
      await tx.productVariant.update({
        where: { id: existing.id },
        data: { deletedAt: null, price: variant.price, stock },
      });
      return;
    }

    await tx.productVariant.create({
      data: { productColorId, size: variant.size, price: variant.price, stock },
    });
  }

  /**
   * Loại URL ảnh trống/trùng và giới hạn số ảnh mỗi màu (tái sử dụng hàm dùng chung).
   */
  private normalizeImages(imageUrls?: string[]): string[] {
    return normalizeProductColorImages(imageUrls, MAX_IMAGES_PER_COLOR);
  }

  private async getOwnedProduct(id: string, vendorId: string) {
    const product = await this.extended.findFirst({
      where: { id, vendorId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return product;
  }
}
