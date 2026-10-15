import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaBaseService } from '../../common/service/prisma-base.service';

import { PrismaService } from '../../common/prisma/prisma.service';

import { PaginationUtilService } from '../../common/utils/paginaton-util/pagintion-util.service';

import { QueryUtilService } from '../../common/utils/query-util/query-util.service';

import {
  GetOptionsParams,
  Options} from '../../common/query/options.interface';

import { CreateClientDto } from './dto/create-client.dto';

import { UpdateClientDto } from './dto/update-client.dto';

import { GetClientsPaginationDto } from './dto/get-client.dto';

import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService
  extends PrismaBaseService<'client'>
  implements Options<Client>
{
  constructor(
    prismaService: PrismaService,

    private readonly paginationUtilService: PaginationUtilService,

    private readonly queryUtil: QueryUtilService,
  ) {
    super(prismaService, 'client');
  }

  async getClients({ status, role, ...query }: GetClientsPaginationDto) {
    return this.findClients(query, {
      ...(status ? { status } : {}),
      ...(role ? { role } : {})});
  }

  private async findClients(
    { page = 1, itemPerPage = 10, search }: GetClientsPaginationDto,
    scope: Prisma.ClientWhereInput,
  ) {
    const searchCondition = this.queryUtil.createStringSearchCondition(search, [
      'fullName',
      'email',
      'phone',
      'address',
    ]) as Prisma.ClientWhereInput;

    const where: Prisma.ClientWhereInput = {
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
  async getOptions(params: GetOptionsParams<Client>) {
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

  async getClient(where: Prisma.ClientWhereUniqueInput) {
    const client = await this.extended.findUnique({
      where,
      omit: { password: true }});

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async createClient(createClientDto: CreateClientDto) {
    return this.extended.create({
      data: createClientDto});
  }

  async getClientByEmail(email: string) {
    return this.extended.findUnique({
      where: {
        email}});
  }

  async getstring(clientID: string) {
    return this.prismaService.client.findUnique({
      where: {
        id: clientID},

      select: {
        id: true,
        
        status: true,
        deletedAt: true}});
  }

  async updateClient(params: {
    where: Prisma.ClientWhereUniqueInput;
    data: UpdateClientDto;
  }) {
    const { where, data: dataUpdate } = params;

    const data = await this.extended.update({
      data: dataUpdate,
      where,
      omit: { password: true }});

    return data;
  }

  async deleteClient(where: Prisma.ClientWhereUniqueInput) {
    const client = await this.extended.findUnique({
      where});

    if (!client) {
      throw new NotFoundException('Client không tồn tại');
    }

    return this.extended.update({
      where,
      omit: { password: true },

      data: {
        status: 'inactive'}});
  }
}
