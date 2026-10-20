import { Prisma, ProductStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationQuerySchema } from '../../../common/utils/paginaton-util/pagination-util.interface';

const GetProductsPaginationSchema = PaginationQuerySchema.extend({
  createdAfter: z.string().datetime().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  q: z.string().optional(),
  search: z.string().optional(),
  vendorId: z.string().optional(),
}).strict();

const GetVendorProductsPaginationSchema = PaginationQuerySchema.extend({
  status: z.enum(ProductStatus).optional(),
  createdAfter: z.string().datetime().optional()}).strict();

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
  ExportProductsDto};
