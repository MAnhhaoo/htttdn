import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaBaseService } from '../../common/service/prisma-base.service';

import { PrismaService } from '../../common/prisma/prisma.service';

import { PaginationUtilService } from '../../common/utils/paginaton-util/pagintion-util.service';

import { QueryUtilService } from '../../common/utils/query-util/query-util.service';

import {
  GetOptionsParams,
  Options,
} from '../../common/query/options.interface';

import { CreateUserDto } from './dto/create-user.dto';

import { UpdateUserDto } from './dto/update-user.dto';

import { GetUsersPaginationDto } from './dto/get-user.dto';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService
  extends PrismaBaseService<'user'>
  implements Options<User>
{
  constructor(
    prismaService: PrismaService,

    private readonly paginationUtilService: PaginationUtilService,

    private readonly queryUtil: QueryUtilService,
  ) {
    super(prismaService, 'user');
  }

  /**
   * Lấy danh sách user:
   * - phân trang
   * - tìm kiếm
   * - lọc trạng thái
   * - lọc role
   */
  async getUsers({
    page = 1,
    itemPerPage = 10,
    search,
    status,
    role,
  }: GetUsersPaginationDto) {
    const searchCondition = this.queryUtil.createStringSearchCondition(search, [
      'fullName',
      'email',
      'phone',
      'address',
    ]) as Prisma.UserWhereInput;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      status,
      role,
      ...searchCondition,
    };

    const totalItems = await this.extended.count({
      where,
    });

    const paging = this.paginationUtilService.paging({
      page,
      itemPerPage,
      totalItems,
    });

    const list = await this.extended.findMany({
      where,
      skip: paging.skip,
      take: itemPerPage,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return paging.format(list);
  }

  /**
   * Lấy danh sách rút gọn.
   * Thường dùng cho dropdown/select.
   */
  async getOptions(params: GetOptionsParams<User>) {
    const { limit = 10, select = 'id,fullName', ...searchFields } = params;

    const fieldsSelect = this.queryUtil.convertFieldsSelectOption(select);

    return this.extended.findMany({
      select: fieldsSelect,

      where: {
        deletedAt: null,
        ...searchFields,
      },

      take: limit,

      orderBy: {
        fullName: 'asc',
      },
    });
  }

  async getUser(where: Prisma.UserWhereUniqueInput) {
    const user = await this.extended.findUnique({
      where,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    return this.extended.create({
      data: createUserDto,
    });
  }

  async getUserByEmail(email: string) {
    return this.extended.findUnique({
      where: {
        email,
      },
    });
  }

  async getUserRole(userID: string) {
    return this.prismaService.user.findUnique({
      where: {
        id: userID,
      },

      select: {
        id: true,
        role: true,
      },
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: UpdateUserDto;
  }) {
    const { where, data: dataUpdate } = params;

    const data = await this.extended.update({
      data: dataUpdate,
      where,
    });

    return data;
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput) {
    const user = await this.extended.findUnique({
      where,
    });

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    return this.extended.update({
      where,

      data: {
        status: 'inactive',
      },
    });
  }
}
