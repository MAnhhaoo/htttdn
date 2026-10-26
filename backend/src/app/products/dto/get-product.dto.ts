import { ProductStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationQuerySchema } from '../../../common/utils/paginaton-util/pagination-util.interface';

const GetProductsPaginationSchema = PaginationQuerySchema.extend({
  createdAfter: z.string().datetime().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  category: z.string().optional(),
  q: z.string().optional(),
  search: z.string().optional(),
  vendorId: z.string().optional(),
}).strict();

const GetAdminProductsPaginationSchema = GetProductsPaginationSchema.extend({
  status: z.union([z.enum(ProductStatus), z.literal('all')]).optional(),
}).strict();

const GetVendorProductsPaginationSchema = PaginationQuerySchema.extend({
  status: z.enum(ProductStatus).optional(),
  createdAfter: z.string().datetime().optional()}).strict();

class GetProductsPaginationDto extends createZodDto(
  GetProductsPaginationSchema,
) {}

class GetAdminProductsPaginationDto extends createZodDto(
  GetAdminProductsPaginationSchema,
) {}

class GetVendorProductsPaginationDto extends createZodDto(
  GetVendorProductsPaginationSchema,
) {}

export {
  GetProductsPaginationDto,
  GetAdminProductsPaginationDto,
  GetVendorProductsPaginationDto,
};
