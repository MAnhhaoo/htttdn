import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaBaseService } from 'src/common/service/prisma-base.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationUtilService } from 'src/common/utils/paginaton-util/pagintion-util.service';
import { QueryUtilService } from 'src/common/utils/query-util/query-util.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { GetProductsPaginationDto } from './dto/get-product.dto';
import { Prisma } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';

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

  async createProduct(createProductDto: CreateProductDto) {
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
        ...createProductDto,
        slug,
      },
    });
  }
  async getProducts({
    page = 1,
    itemPerPage = 10,
    search,
    status,
  }: GetProductsPaginationDto) {
    const searchCondition = this.queryUtil.createStringSearchCondition(search, [
      'name',
      'slug',
      'description',
    ]) as Prisma.ProductWhereInput;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(status ? { status } : {}),
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
    });

    return paging.format(list);
  }
  async updateProduct(params: {
    where: Prisma.ProductWhereUniqueInput;
    data: UpdateProductDto;
  }) {
    const { where, data: dataUpdate } = params;
    const data = await this.extended.update({
      data: dataUpdate,
      where,
    });
    return data;
  }
  async deleteProduct(where: Prisma.ProductWhereUniqueInput) {
    const product = await this.extended.findUnique({
      where,
    });
    if (!product) {
      throw new NotFoundException('Product khong ton tai');
    }
    return this.extended.update({
      where,
      data: {
        status: 'inactive',
      },
    });
  }
}
