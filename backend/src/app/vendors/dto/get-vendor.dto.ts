import { Prisma } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { Vendor } from '../entities/vendor.entity';

import { PaginationQuerySchema } from '../../../common/utils/paginaton-util/pagination-util.interface';
const UserStatusSchema = z.enum(['active', 'inactive']);

class ExportVendorsDto {
  ids: NonNullable<Prisma.VendorWhereUniqueInput['id']>[];
}

class IsExistPermissionKeyDto {
  vendorID: Vendor['id'];
  permissionKey: string;
}

const GetVendorsPaginationSchema = PaginationQuerySchema.extend({
  status: UserStatusSchema.optional(),
  role: z.string().optional()}).strict();

class GetVendorsPaginationDto extends createZodDto(GetVendorsPaginationSchema) {}

export { ExportVendorsDto, IsExistPermissionKeyDto, GetVendorsPaginationDto };
