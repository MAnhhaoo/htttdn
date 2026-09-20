import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { Pagination } from '../../../common/utils/paginaton-util/pagination-util.interface';
import { Category } from '../entities/category.entity';

class GetCategoriesPaginationDto extends IntersectionType(
  Pagination,
  PartialType(Category),
) {}

class ExportCategoriesDto {
  ids: NonNullable<Prisma.CategoryWhereUniqueInput['id']>[];
}

export { GetCategoriesPaginationDto, ExportCategoriesDto };
