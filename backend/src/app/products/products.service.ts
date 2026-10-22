import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException} from '@nestjs/common';
import { PrismaBaseService } from 'src/common/service/prisma-base.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationUtilService } from 'src/common/utils/paginaton-util/pagintion-util.service';
import { QueryUtilService } from 'src/common/utils/query-util/query-util.service';
import { CreateProductDto } from './dto/create-product.dto';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import {
  GetProductsPaginationDto,
  GetVendorProductsPaginationDto} from './dto/get-product.dto';
import { Prisma, ProductStatus } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';
import { RealtimeService } from '../realtime/realtime.service';

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
        orderBy: { createdAt: 'asc' },
      },
    },
  },
} satisfies Prisma.ProductInclude;

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
      where: { slug }});

    if (existingProduct) {
      throw new ConflictException(
        `Sản phẩm "${createProductDto.name}" đã tồn tại`,
      );
    }

    const categoryConnect = createProductDto.category ?? (createProductDto.categoryId ? {
      connect: { id: createProductDto.categoryId },
    } : undefined);

    if (!categoryConnect) {
      throw new BadRequestException('Vui lòng chọn danh mục sản phẩm');
    }

    const hasColors = createProductDto.colors && createProductDto.colors.length > 0;

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
              imageUrls: c.imageUrls || [],
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
    const { category, status, vendorId, ...rest } = query as any;
    const isStatusAll = status === 'all';
    const isValidStatus = status && Object.values(ProductStatus).includes(status);
    const targetStatus = isStatusAll ? undefined : (isValidStatus ? status : (status ? undefined : ProductStatus.active));

    const isUUID = category && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
    const categoryCondition = category && category !== 'all'
      ? {
          OR: [
            { slug: category },
            ...(isUUID ? [{ id: category }] : []),
          ],
          deletedAt: null,
        }
      : { deletedAt: null };

    return this.findProducts(rest, {
      ...(targetStatus ? { status: targetStatus } : {}),
      ...(vendorId ? { vendorId } : {}),
      category: categoryCondition,
    });
  }

  async getBestSellingProducts(limit = 4) {
    const topVariants = await this.prismaService.orderDetail.groupBy({
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
    const variants = await this.prismaService.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: {
        id: true,
        productColor: {
          select: {
            productId: true,
          },
        },
      },
    });

    const variantToProduct = new Map<string, string>();
    for (const v of variants) {
      if (v.productColor?.productId) {
        variantToProduct.set(v.id, v.productColor.productId);
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
      ...(status ? { status } : {})});
  }

  async getProductById(id: string) {
    const product = await this.extended.findFirst({
      where: {
        id,
        deletedAt: null,
        status: ProductStatus.active,
        category: { deletedAt: null }},
      include: productRelations});

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return this.toCatalogProduct(product);
  }

  async addFavorite(productId: string, clientId: string) {
    await this.getProductById(productId);
    const favorite = await this.prismaService.productFavorite.upsert({
      where: { clientId_productId: { clientId, productId } },
      create: { clientId, productId },
      update: {},
      include: { product: { include: productRelations } }});
    return { ...favorite, favorited: true };
  }

  async removeFavorite(productId: string, clientId: string) {
    await this.prismaService.productFavorite.deleteMany({
      where: { clientId, productId }});
    return { productId, favorited: false };
  }

  async favoriteStatus(productId: string, clientId: string) {
    const favorite = await this.prismaService.productFavorite.findUnique({
      where: { clientId_productId: { clientId, productId } },
      select: { id: true }});
    return { productId, favorited: Boolean(favorite) };
  }

  async listFavorites(clientId: string) {
    const favorites = await this.prismaService.productFavorite.findMany({
      where: {
        clientId,
        product: {
          deletedAt: null,
          status: ProductStatus.active,
          category: { deletedAt: null }}},
      include: { product: { include: productRelations } },
      orderBy: { createdAt: 'desc' }});
    return favorites.map((favorite) => ({
      id: favorite.id,
      createdAt: favorite.createdAt,
      product: this.toCatalogProduct(favorite.product)}));
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
    const searchCondition = this.queryUtil.createStringSearchCondition(keyword, [
      'name',
      'slug',
      'description',
    ]) as Prisma.ProductWhereInput;

    const hasPriceFilter =
      (minPrice !== undefined && minPrice !== null && !isNaN(Number(minPrice))) ||
      (maxPrice !== undefined && maxPrice !== null && !isNaN(Number(maxPrice)));

    const priceCondition: Prisma.ProductColorListRelationFilter = {
      some: {
        deletedAt: null,
        variants: {
          some: {
            deletedAt: null,
            ...(minPrice !== undefined && minPrice !== null && !isNaN(Number(minPrice))
              ? { price: { gte: Number(minPrice) } }
              : {}),
            ...(maxPrice !== undefined && maxPrice !== null && !isNaN(Number(maxPrice))
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
      where});

    const paging = this.paginationUtilService.paging({
      page,
      itemPerPage,
      totalItems});

    const list = await this.extended.findMany({
      where,
      skip: paging.skip,
      take: itemPerPage,
      orderBy: {
        createdAt: 'desc'},

      include: productRelations});

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
      totalStock: variants.reduce((total, variant) => total + variant.stock, 0)};
  }
  async updateProduct(
    id: string,
    data: UpdateProductDto,
    vendorId?: string,
    isAdmin = false,
  ) {
    if (!isAdmin) {
      await this.getOwnedProduct(id, vendorId!);
    } else {
      const prod = await this.extended.findFirst({ where: { id } });
      if (!prod) {
        throw new NotFoundException('Sản phẩm không tồn tại');
      }
    }

    const categoryConnect = data.category ?? (data.categoryId ? {
      connect: { id: data.categoryId },
    } : undefined);

    const updated = await this.prismaService.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(categoryConnect !== undefined && { category: categoryConnect }),
      },
    });

    if (data.colors && Array.isArray(data.colors)) {
      for (const c of data.colors) {
        if (c.id && !c.id.startsWith('temp-')) {
          await this.prismaService.productColor.update({
            where: { id: c.id },
            data: {
              color: c.color,
              imageUrls: c.imageUrls || [],
            },
          });
          if (c.variants && Array.isArray(c.variants)) {
            for (const v of c.variants) {
              if (v.id && !v.id.startsWith('temp-')) {
                await this.prismaService.productVariant.update({
                  where: { id: v.id },
                  data: {
                    size: v.size,
                    price: v.price,
                    stock: v.stock ?? 0,
                  },
                });
              } else {
                await this.prismaService.productVariant.create({
                  data: {
                    productColorId: c.id,
                    size: v.size,
                    price: v.price,
                    stock: v.stock ?? 0,
                  },
                });
              }
            }
          }
        } else {
          await this.prismaService.productColor.create({
            data: {
              productId: id,
              color: c.color,
              imageUrls: c.imageUrls || [],
              variants: {
                create: (c.variants || []).map((v) => ({
                  size: v.size,
                  price: v.price,
                  stock: v.stock ?? 0,
                })),
              },
            },
          });
        }
      }
    }

    this.realtime.emitProductUpdated(updated.id, updated.vendorId);
    return updated;
  }

  async deleteProduct(id: string, vendorId?: string, isAdmin = false) {
    if (!isAdmin) {
      await this.getOwnedProduct(id, vendorId!);
    } else {
      const prod = await this.extended.findFirst({ where: { id } });
      if (!prod) {
        throw new NotFoundException('Sản phẩm không tồn tại');
      }
    }

    const deleted = await this.prismaService.product.update({
      where: { id },
      data: {
        status: 'inactive',
        deletedAt: new Date(),
      },
    });
    this.realtime.emitProductUpdated(deleted.id, deleted.vendorId);
    return deleted;
  }

  private async getOwnedProduct(id: string, vendorId: string) {
    const product = await this.extended.findFirst({
      where: { id, vendorId },
      select: { id: true }});

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return product;
  }
}
