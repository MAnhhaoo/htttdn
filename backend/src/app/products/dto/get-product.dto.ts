import { Prisma, ProductStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationQuerySchema } from '../../../common/utils/paginaton-util/pagination-util.interface';

const GetProductsPaginationSchema = PaginationQuerySchema.strict();

const GetVendorProductsPaginationSchema = PaginationQuerySchema.extend({
  status: z.enum(ProductStatus).optional(),
}).strict();

class GetProductsPaginationDto extends createZodDto(
  GetProductsPaginationSchema,
) {}

class GetVendorProductsPaginationDto extends createZodDto(
  GetVendorProductsPaginationSchema,
) {}

class ExportProductsDto {
  ids: NonNullable<Prisma.ProductWhereUniqueInput['id']>[];
}

export {
  GetProductsPaginationDto,
  GetVendorProductsPaginationDto,
  ExportProductsDto,
};
