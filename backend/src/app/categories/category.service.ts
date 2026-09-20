import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';

import { PrismaBaseService } from 'src/common/service/prisma-base.service';

import { PaginationUtilService } from 'src/common/utils/paginaton-util/pagintion-util.service';

import { QueryUtilService } from 'src/common/utils/query-util/query-util.service';

import { GetOptionsParams, Options } from 'src/common/query/options.interface';

import { CreateCategoryDto } from './dto/create-category.dto';

import { GetCategoriesPaginationDto } from './dto/get-category.dto';

import { Category } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';

@Injectable()
export class CategoryService
  extends PrismaBaseService<'category'>
  implements Options<Category>
{
  constructor(
    prismaService: PrismaService,

    private readonly paginationUtilService: PaginationUtilService,

    private readonly queryUtil: QueryUtilService,
    private readonly stringUtilService: StringUtilService,
  ) {
    super(prismaService, 'category');
  }

  /**
   * Danh sách category:
   * - phân trang
   * - tìm kiếm
   */
  async getCategories({
    page = 1,
    itemPerPage = 10,
    search,
  }: GetCategoriesPaginationDto) {
    const searchCondition = this.queryUtil.createStringSearchCondition(search, [
      'name',
      'slug',
      'description',
    ]) as Prisma.CategoryWhereInput;

    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
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

  /**
   * Danh sách category rút gọn
   * dùng cho dropdown/select.
   */
  async getOptions(params: GetOptionsParams<Category>) {
    const { limit = 10, select = 'id,name', ...searchFields } = params;

    const fieldsSelect = this.queryUtil.convertFieldsSelectOption(select);

    return this.extended.findMany({
      select: fieldsSelect,

      where: {
        deletedAt: null,
        ...searchFields,
      },

      take: limit,

      orderBy: {
        name: 'asc',
      },
    });
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const slug = this.stringUtilService.toSlug(createCategoryDto.name);

    const existingCategory = await this.extended.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw new ConflictException(
        `Danh mục "${createCategoryDto.name}" đã tồn tại`,
      );
    }

    return this.extended.create({
      data: {
        ...createCategoryDto,
        slug,
      },
    });
  }
  async updateCategory(params: {
    where: Prisma.CategoryWhereUniqueInput;
    data: UpdateCategoryDto;
  }) {
    const { where, data: dataUpdate } = params;
    const data = await this.extended.update({
      data: dataUpdate,
      where,
    });
    return data;
  }
  async deleteCategory(where: Prisma.CategoryWhereUniqueInput) {
    const data = await this.extended.softDelete(where);
    return data;
  }
}
