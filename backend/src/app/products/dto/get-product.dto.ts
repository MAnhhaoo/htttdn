import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { Pagination } from '../../../common/utils/paginaton-util/pagination-util.interface';
import { Product } from '../entities/product.entity';

class GetProductsPaginationDto extends IntersectionType(
  Pagination,
  PartialType(Product),
) {}

class ExportProductsDto {
  ids: NonNullable<Prisma.ProductWhereUniqueInput['id']>[];
}

export { GetProductsPaginationDto, ExportProductsDto };
