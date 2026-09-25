import {
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

const productRelations = {
  category: {
    select: { id: true, name: true, slug: true },
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
  ) {
    super(prismaService, 'product');
  }

  async createProduct(createProductDto: CreateProductDto, vendorId: string) {
    const slug = this.stringUtilService.toSlug(createProductDto.name);

    const existingProduct = await this.extended.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      throw new ConflictException(
        `Sản phẩm "${createProductDto.name}" đã tồn tại`,
      );
    }

    return this.extended.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        status: createProductDto.status,
        category: createProductDto.category,
        vendor: { connect: { id: vendorId } },
        slug,
      },
    });
  }
  async getProducts(query: GetProductsPaginationDto) {
    return this.findProducts(query, {
      status: ProductStatus.active,
      category: { deletedAt: null },
    });
  }

  async getProductsByCategory(
    categorySlug: string,
    query: GetProductsPaginationDto,
  ) {
    return this.findProducts(query, {
      status: ProductStatus.active,
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

  private async findProducts(
    { page = 1, itemPerPage = 10, search }: GetProductsPaginationDto,
    scope: Prisma.ProductWhereInput,
  ) {
    const searchCondition = this.queryUtil.createStringSearchCondition(search, [
      'name',
      'slug',
      'description',
    ]) as Prisma.ProductWhereInput;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...scope,
      ...searchCondition,
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
  async updateProduct(id: string, data: UpdateProductDto, vendorId: string) {
    await this.getOwnedProduct(id, vendorId);

    return this.extended.update({
      where: { id, vendorId, deletedAt: null },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        category: data.category,
      },
    });
  }

  async deleteProduct(id: string, vendorId: string) {
    await this.getOwnedProduct(id, vendorId);

    return this.extended.update({
      where: { id, vendorId, deletedAt: null },
      data: {
        status: 'inactive',
      },
    });
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
