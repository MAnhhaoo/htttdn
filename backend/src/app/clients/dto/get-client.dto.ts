import { Prisma } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { Client } from '../entities/client.entity';

import { PaginationQuerySchema } from '../../../common/utils/paginaton-util/pagination-util.interface';
const UserStatusSchema = z.enum(['active', 'inactive']);

class ExportClientsDto {
  ids: NonNullable<Prisma.ClientWhereUniqueInput['id']>[];
}

class IsExistPermissionKeyDto {
  clientID: Client['id'];
  permissionKey: string;
}

const GetClientsPaginationSchema = PaginationQuerySchema.extend({
  status: UserStatusSchema.optional(),
  role: z.string().optional()}).strict();

class GetClientsPaginationDto extends createZodDto(GetClientsPaginationSchema) {}

export { ExportClientsDto, IsExistPermissionKeyDto, GetClientsPaginationDto };
