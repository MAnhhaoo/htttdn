import { Prisma } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { User } from '../entities/user.entity';

import { PaginationQuerySchema } from '../../../common/utils/paginaton-util/pagination-util.interface';
import { UserStatusSchema, UserRoleSchema } from '../../../generated/zod';

class ExportUsersDto {
  ids: NonNullable<Prisma.UserWhereUniqueInput['id']>[];
}

class IsExistPermissionKeyDto {
  userID: User['id'];
  permissionKey: string;
}

const GetUsersPaginationSchema = PaginationQuerySchema.extend({
  status: UserStatusSchema.optional(),
  role: UserRoleSchema.optional(),
}).strict();

class GetUsersPaginationDto extends createZodDto(GetUsersPaginationSchema) {}

export { ExportUsersDto, IsExistPermissionKeyDto, GetUsersPaginationDto };
