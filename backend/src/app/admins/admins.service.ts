import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaBaseService } from '../../common/service/prisma-base.service';

import { PrismaService } from '../../common/prisma/prisma.service';

import { PaginationUtilService } from '../../common/utils/paginaton-util/pagintion-util.service';

import { QueryUtilService } from '../../common/utils/query-util/query-util.service';

import { assertEmailAvailable } from '../../common/utils/account-email/account-email.util';

import { RealtimeService } from '../realtime/realtime.service';

import type { UserInfo } from '../../common/decorators/user.decorator';

import { UpdateAdminDto } from './dto/update-admin.dto';

import { GetAdminsPaginationDto } from './dto/get-admin.dto';

@Injectable()
export class AdminsService extends PrismaBaseService<'admin'> {
  constructor(
    prismaService: PrismaService,

    private readonly paginationUtilService: PaginationUtilService,

    private readonly queryUtil: QueryUtilService,

    @Optional() private readonly realtime?: RealtimeService,
  ) {
    super(prismaService, 'admin');
  }

  async getAdmins({ status, ...query }: GetAdminsPaginationDto) {
    return this.findAdmins(query, {
      ...(status ? { status } : {}),
    });
  }

  private async findAdmins(
    { page = 1, itemPerPage = 10, search }: GetAdminsPaginationDto,
    scope: Prisma.AdminWhereInput,
  ) {
    const searchCondition = this.queryUtil.createStringSearchCondition(search, [
      'fullName',
      'email',
      'phone',
      'department',
    ]) as Prisma.AdminWhereInput;

    const where: Prisma.AdminWhereInput = {
      ...scope,
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
      omit: { password: true },
      where,
      skip: paging.skip,
      take: paging.itemPerPage,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return paging.format(list);
  }

  async getAdmin(where: Prisma.AdminWhereUniqueInput) {
    const admin = await this.extended.findUnique({
      where,
      omit: { password: true },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  private async assertCanLockAdmin(
    targetId: string | undefined,
    currentUser?: UserInfo,
  ) {
    if (!targetId) return;
    if (currentUser?.userID && targetId === currentUser.userID) {
      throw new BadRequestException(
        'Không thể tự khóa tài khoản của chính mình',
      );
    }
    const activeAdmins = await this.prismaService.admin.findMany({
      where: { status: 'active' },
      select: { id: true },
    });
    const remaining = activeAdmins.filter((a) => a.id !== targetId).length;
    if (remaining === 0) {
      throw new BadRequestException(
        'Không thể khóa tài khoản quản trị viên đang hoạt động cuối cùng',
      );
    }
  }

  async updateAdmin(params: {
    where: Prisma.AdminWhereUniqueInput;
    data: UpdateAdminDto;
    currentUser?: UserInfo;
  }) {
    const { where, currentUser } = params;
    const dataUpdate = { ...params.data } as any;

    if (dataUpdate.status) {
      dataUpdate.deletedAt = null;
    }

    if (dataUpdate.status === 'inactive') {
      await this.assertCanLockAdmin(where.id, currentUser);
    }

    if (typeof dataUpdate.email === 'string') {
      dataUpdate.email = dataUpdate.email.trim().toLowerCase();
      const current = where.id
        ? { id: where.id }
        : await this.prismaService.admin.findUnique({
            where,
            select: { id: true },
          });
      await assertEmailAvailable(
        this.prismaService,
        dataUpdate.email,
        current ? { role: 'admin', id: current.id } : undefined,
      );
    }

    const data = await this.extended.update({
      data: dataUpdate,
      where,
      omit: { password: true },
    });

    if (dataUpdate.status === 'inactive') {
      this.realtime?.disconnectUser(data.id);
    }

    return data;
  }

  /**
   * Tài khoản admin chỉ khóa (status = inactive), không xóa.
   */
  async deleteAdmin(
    where: Prisma.AdminWhereUniqueInput,
    currentUser?: UserInfo,
  ) {
    const admin = await this.extended.findUnique({
      where,
    });

    if (!admin) {
      throw new NotFoundException('Admin không tồn tại');
    }

    await this.assertCanLockAdmin(admin.id, currentUser);

    const updated = await this.extended.update({
      where,
      omit: { password: true },

      data: {
        status: 'inactive',
        deletedAt: null,
      },
    });

    this.realtime?.disconnectUser(admin.id);
    return updated;
  }
}
