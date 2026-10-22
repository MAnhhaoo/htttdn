import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaBaseService } from '../../common/service/prisma-base.service';

import { PrismaService } from '../../common/prisma/prisma.service';

import { PaginationUtilService } from '../../common/utils/paginaton-util/pagintion-util.service';

import { QueryUtilService } from '../../common/utils/query-util/query-util.service';

import { assertEmailAvailable } from '../../common/utils/account-email/account-email.util';

import {
  GetOptionsParams,
  Options} from '../../common/query/options.interface';

import { CreateAdminDto } from './dto/create-admin.dto';

import { UpdateAdminDto } from './dto/update-admin.dto';

import { GetAdminsPaginationDto } from './dto/get-admin.dto';

import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminsService
  extends PrismaBaseService<'admin'>
  implements Options<Admin>
{
  constructor(
    prismaService: PrismaService,

    private readonly paginationUtilService: PaginationUtilService,

    private readonly queryUtil: QueryUtilService,
  ) {
    super(prismaService, 'admin');
  }

  async getAdmins({ status, role, ...query }: GetAdminsPaginationDto) {
    return this.findAdmins(query, {
      ...(status ? { status } : {}),
      ...(role ? { role } : {})});
  }

  private async findAdmins(
    { page = 1, itemPerPage = 10, search }: GetAdminsPaginationDto,
    scope: Prisma.AdminWhereInput,
  ) {
    const searchCondition = this.queryUtil.createStringSearchCondition(search, [
      'fullName',
      'email',
      'phone',
      'address',
    ]) as Prisma.AdminWhereInput;

    const where: Prisma.AdminWhereInput = {
      deletedAt: null,
      ...scope,
      ...searchCondition};

    const totalItems = await this.extended.count({
      where});

    const paging = this.paginationUtilService.paging({
      page,
      itemPerPage,
      totalItems});

    const list = await this.extended.findMany({
      omit: { password: true },
      where,
      skip: paging.skip,
      take: Number(itemPerPage),
      orderBy: {
        createdAt: 'desc'}});

    return paging.format(list);
  }

  /**
   * Lấy danh sách rút gọn.
   * Thường dùng cho dropdown/select.
   */
  async getOptions(params: GetOptionsParams<Admin>) {
    const { limit = 10, select = 'id,fullName', ...searchFields } = params;

    const requestedFields =
      this.queryUtil.convertFieldsSelectOption(select) ?? {};
    const publicFields = [
      'id',
      'fullName',
      'email',
      'phone',
      'address',
      'role',
      'status',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'createdBy',
    ];
    const fieldsSelect = Object.fromEntries(
      Object.entries(requestedFields).filter(([field]) =>
        publicFields.includes(field),
      ),
    );
    if (!Object.values(fieldsSelect).some(Boolean)) {
      fieldsSelect.id = true;
    }

    return this.extended.findMany({
      select: fieldsSelect,

      where: {
        deletedAt: null,
        ...searchFields},

      take: Number(limit),

      orderBy: {
        fullName: 'asc'}});
  }

  async getAdmin(where: Prisma.AdminWhereUniqueInput) {
    const admin = await this.extended.findUnique({
      where,
      omit: { password: true }});

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    const adminData = { ...createAdminDto } as any;
    if (typeof adminData.email === 'string') {
      adminData.email = adminData.email.trim().toLowerCase();
      await assertEmailAvailable(this.prismaService, adminData.email);
    }
    return this.extended.create({
      data: adminData});
  }

  async getAdminByEmail(email: string) {
    return this.extended.findUnique({
      where: {
        email}});
  }

  async getstring(adminID: string) {
    return this.prismaService.admin.findUnique({
      where: {
        id: adminID},

      select: {
        id: true,
        
        status: true,
        deletedAt: true}});
  }

  async updateAdmin(params: {
    where: Prisma.AdminWhereUniqueInput;
    data: UpdateAdminDto;
  }) {
    const { where } = params;
    const dataUpdate = { ...params.data } as any;

    if (typeof dataUpdate.email === 'string') {
      dataUpdate.email = dataUpdate.email.trim().toLowerCase();
      const current = where.id
        ? { id: where.id }
        : await this.prismaService.admin.findUnique({ where, select: { id: true } });
      await assertEmailAvailable(
        this.prismaService,
        dataUpdate.email,
        current ? { role: 'admin', id: current.id } : undefined,
      );
    }

    const data = await this.extended.update({
      data: dataUpdate,
      where,
      omit: { password: true }});

    return data;
  }

  async deleteAdmin(where: Prisma.AdminWhereUniqueInput) {
    const admin = await this.extended.findUnique({
      where});

    if (!admin) {
      throw new NotFoundException('Admin không tồn tại');
    }

    return this.extended.update({
      where,
      omit: { password: true },

      data: {
        status: 'inactive'}});
  }
}
