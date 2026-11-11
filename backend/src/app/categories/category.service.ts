import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaBaseService } from 'src/common/service/prisma-base.service';
import { PaginationUtilService } from 'src/common/utils/paginaton-util/pagintion-util.service';
import { QueryUtilService } from 'src/common/utils/query-util/query-util.service';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { RealtimeService } from '../realtime/realtime.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { GetCategoriesPaginationDto } from './dto/get-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService extends PrismaBaseService<'category'> {
  constructor(
    prismaService: PrismaService,
    private readonly paginationUtilService: PaginationUtilService,
    private readonly queryUtil: QueryUtilService,
    private readonly stringUtilService: StringUtilService,
    private readonly realtime: RealtimeService,
  ) {
    super(prismaService, 'category');
  }

  /**
   * Danh sách category:
   * - phân trang
   * - tìm kiếm
   * - lọc trạng thái (all, active, inactive)
   */
  async getCategories(dto: GetCategoriesPaginationDto) {
    const { page = 1, itemPerPage = 10, search, includeAll, status } = dto as any;
    const searchCondition = this.queryUtil.createStringSearchCondition(search, [
      'name',
      'slug',
    ]) as Prisma.CategoryWhereInput;

    if (includeAll || status === 'all' || status === 'inactive' || status === 'active') {
      const where: Prisma.CategoryWhereInput = { ...searchCondition };
      if (status === 'active') {
        where.deletedAt = null;
      } else if (status === 'inactive') {
        where.deletedAt = { not: null };
      }

      const totalItems = await this.prismaService.category.count({ where });
      const paging = this.paginationUtilService.paging({
        page,
        itemPerPage,
        totalItems,
      });

      const list = await this.prismaService.category.findMany({
        where,
        skip: paging.skip,
        take: itemPerPage,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const formattedList = list.map((cat) => ({
        ...cat,
        status: cat.deletedAt ? 'inactive' : 'active',
      }));

      return paging.format(formattedList);
    }

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

    const formattedList = list.map((cat: any) => ({
      ...cat,
      status: 'active',
    }));

    return paging.format(formattedList);
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const slug = this.stringUtilService.toSlug(createCategoryDto.name);

    const existingCategory = await this.extended.findUnique({
      where: { slug },
    });

    const restoredCategory = await this.restoreOrThrowIfActive({
      existing: existingCategory,
      conflictMessage: `Danh mục "${createCategoryDto.name}" đã tồn tại`,
      restoreData: { name: createCategoryDto.name },
    });

    if (restoredCategory) {
      this.realtime.emitCategoryUpdated(restoredCategory.id);
      return restoredCategory;
    }

    const category = await this.extended.create({
      data: {
        name: createCategoryDto.name,
        slug,
      },
    });
    this.realtime.emitCategoryUpdated(category.id);
    return category;
  }

  async updateCategory(params: {
    where: Prisma.CategoryWhereUniqueInput;
    data: UpdateCategoryDto;
  }) {
    const { where, data: dataUpdate } = params;
    const data = await this.prismaService.category.update({
      data: { name: dataUpdate.name },
      where,
    });
    this.realtime.emitCategoryUpdated(data.id);
    return data;
  }

  async toggleLock(where: Prisma.CategoryWhereUniqueInput) {
    const existing = await this.prismaService.category.findUnique({
      where: { id: where.id },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    let isLockedNow = false;
    if (existing.deletedAt) {
      await this.extended.restore({ id: where.id });
      isLockedNow = false;
    } else {
      await this.extended.softDelete({ id: where.id });
      isLockedNow = true;
    }

    this.realtime.emitCategoryUpdated(where.id!);
    return {
      id: where.id,
      status: isLockedNow ? 'inactive' : 'active',
      isLocked: isLockedNow,
    };
  }

  async deleteCategory(where: Prisma.CategoryWhereUniqueInput) {
    const data = await this.extended.softDelete(where);
    if (data.count) this.realtime.emitCategoryUpdated(where.id);
    return data;
  }
}
