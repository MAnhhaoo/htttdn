import { Prisma } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { Admin } from '../entities/admin.entity';

import { PaginationQuerySchema } from '../../../common/utils/paginaton-util/pagination-util.interface';
const UserStatusSchema = z.enum(['active', 'inactive']);

class ExportAdminsDto {
  ids: NonNullable<Prisma.AdminWhereUniqueInput['id']>[];
}

class IsExistPermissionKeyDto {
  adminID: Admin['id'];
  permissionKey: string;
}

const GetAdminsPaginationSchema = PaginationQuerySchema.extend({
  status: UserStatusSchema.optional(),
  role: z.string().optional()}).strict();

class GetAdminsPaginationDto extends createZodDto(GetAdminsPaginationSchema) {}

export { ExportAdminsDto, IsExistPermissionKeyDto, GetAdminsPaginationDto };
