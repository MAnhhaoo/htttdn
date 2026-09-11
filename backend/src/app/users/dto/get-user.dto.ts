import { Prisma } from '@prisma/client';
import { User } from '../entities/user.entity';
// import { Pagination } from '../../../common/utils/pagination-util/pagination-util.interface';
import { IntersectionType, PartialType } from '@nestjs/mapped-types';

class ExportUsersDto {
  ids: NonNullable<Prisma.UserWhereUniqueInput['id']>[];
}

class IsExistPermissionKeyDto {
  userID: User['id'];
  permissionKey: string;
}

class GetUsersPaginationDto extends IntersectionType(
  //   Pagination,
  PartialType(User),
) {}

export { ExportUsersDto, IsExistPermissionKeyDto, GetUsersPaginationDto };
