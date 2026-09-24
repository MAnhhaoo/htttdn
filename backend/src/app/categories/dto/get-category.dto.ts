import { Prisma } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { PaginationQuerySchema } from '../../../common/utils/paginaton-util/pagination-util.interface';

class GetCategoriesPaginationDto extends createZodDto(
  PaginationQuerySchema.strict(),
) {}

class ExportCategoriesDto {
  ids: NonNullable<Prisma.CategoryWhereUniqueInput['id']>[];
}

export { GetCategoriesPaginationDto, ExportCategoriesDto };
