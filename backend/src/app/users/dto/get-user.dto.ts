import { Prisma, UserRole, UserStatus } from '@prisma/client';

import { User } from '../entities/user.entity';

import { Pagination } from '../../../common/utils/paginaton-util/pagination-util.interface';

class ExportUsersDto {
  ids: NonNullable<Prisma.UserWhereUniqueInput['id']>[];
}

class IsExistPermissionKeyDto {
  userID: User['id'];
  permissionKey: string;
}

class GetUsersPaginationDto extends Pagination {
  status?: UserStatus;
  role?: UserRole;
}

export { ExportUsersDto, IsExistPermissionKeyDto, GetUsersPaginationDto };
