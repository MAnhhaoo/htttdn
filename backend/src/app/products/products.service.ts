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
import { GetProductsPaginationDto } from './dto/get-product.dto';
import { Prisma } from '@prisma/client';
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
    return this.findProducts(query);
  }

  async getProductsByCategory(
    categorySlug: string,
    query: GetProductsPaginationDto,
  ) {
    return this.findProducts(query, categorySlug);
  }

  async getProductById(id: string) {
    const product = await this.extended.findFirst({
      where: { id, deletedAt: null },
      include: productRelations,
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return product;
  }

  private async findProducts(
    { page = 1, itemPerPage = 10, search, status }: GetProductsPaginationDto,
    categorySlug?: string,
  ) {
    const searchCondition = this.queryUtil.createStringSearchCondition(search, [
      'name',
      'slug',
      'description',
    ]) as Prisma.ProductWhereInput;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(categorySlug
        ? { category: { slug: categorySlug, deletedAt: null } }
        : {}),
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

    return paging.format(list);
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
