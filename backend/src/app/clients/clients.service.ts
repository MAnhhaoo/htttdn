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
      omit: { password: true },
      include: {
        addresses: {
          where: { deletedAt: null },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
          take: 1,
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const { addresses, ...rest } = client as any;
    return {
      ...rest,
      address: addresses?.[0]?.addressLine || null,
    };
  }

  async createClient(createClientDto: CreateClientDto) {
    const { address, ...clientData } = createClientDto as any;
    if (typeof clientData.email === 'string') {
      clientData.email = clientData.email.trim().toLowerCase();
      await assertEmailAvailable(this.prismaService, clientData.email);
    }
    const client = await this.extended.create({
      data: clientData,
    });

    if (address && String(address).trim()) {
      await this.prismaService.clientAddress.create({
        data: {
          clientId: client.id,
          receiverName: client.fullName,
          phone: client.phone || '',
          addressLine: String(address).trim(),
          isDefault: true,
        },
      }).catch((err) => {
        console.error('Failed to create initial client address:', err);
      });
    }

    return {
      ...client,
      address: address ? String(address).trim() : null,
    };
  }

  async getClientByEmail(email: string) {
    const client = await this.extended.findUnique({
      where: {
        email,
      },
      include: {
        addresses: {
          where: { deletedAt: null },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
          take: 1,
        },
      },
    });

    if (!client) return null;

    const { addresses, ...rest } = client as any;
    return {
      ...rest,
      address: addresses?.[0]?.addressLine || null,
    };
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
    const { address, ...clientData } = dataUpdate as any;

    if (typeof clientData.email === 'string') {
      clientData.email = clientData.email.trim().toLowerCase();
      const current = where.id
        ? { id: where.id }
        : await this.prismaService.client.findUnique({ where, select: { id: true } });
      await assertEmailAvailable(
        this.prismaService,
        clientData.email,
        current ? { role: 'client', id: current.id } : undefined,
      );
    }

    const data = await this.extended.update({
      data: clientData,
      where,
      omit: { password: true }});

    if (address !== undefined && where.id) {
      if (address) {
        const defaultAddr = await this.prismaService.clientAddress.findFirst({
          where: { clientId: where.id, isDefault: true, deletedAt: null },
        });
        if (defaultAddr) {
          await this.prismaService.clientAddress.update({
            where: { id: defaultAddr.id },
            data: { addressLine: address },
          });
        } else {
          await this.prismaService.clientAddress.create({
            data: {
              clientId: where.id,
              receiverName: data.fullName,
              phone: data.phone || '',
              addressLine: address,
              isDefault: true,
            },
          });
        }
      }
    }

    return { ...data, address: address ?? null };
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
