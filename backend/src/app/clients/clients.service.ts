import {
  Injectable,
  Logger,
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

import { CreateClientDto } from './dto/create-client.dto';

import { UpdateClientDto } from './dto/update-client.dto';

import { GetClientsPaginationDto } from './dto/get-client.dto';

@Injectable()
export class ClientsService extends PrismaBaseService<'client'> {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    prismaService: PrismaService,

    private readonly paginationUtilService: PaginationUtilService,

    private readonly queryUtil: QueryUtilService,

    @Optional() private readonly realtime?: RealtimeService,
  ) {
    super(prismaService, 'client');
  }

  async getClients({ status, ...query }: GetClientsPaginationDto) {
    return this.findClients(query, {
      ...(status ? { status } : {}),
    });
  }

  private async findClients(
    { page = 1, itemPerPage = 10, search }: GetClientsPaginationDto,
    scope: Prisma.ClientWhereInput,
  ) {
    const trimmedSearch = search?.trim();
    const baseSearch = this.queryUtil.createStringSearchCondition(
      trimmedSearch,
      ['fullName', 'email', 'phone'],
    ) as Prisma.ClientWhereInput;

    const searchCondition: Prisma.ClientWhereInput =
      trimmedSearch && baseSearch.OR
        ? {
            OR: [
              ...baseSearch.OR,
              {
                addresses: {
                  some: {
                    deletedAt: null,
                    addressLine: {
                      contains: trimmedSearch,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            ],
          }
        : baseSearch;

    const where: Prisma.ClientWhereInput = {
      ...scope,
      ...searchCondition,
    };
    // đếm tổng người dùng
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

    if (address && String(address).trim() && this.prismaService.clientAddress) {
      await this.prismaService.clientAddress
        .create({
          data: {
            clientId: client.id,
            receiverName: client.fullName,
            phone: client.phone || '',
            addressLine: String(address).trim(),
            isDefault: true,
          },
        })
        .catch((err) => {
          this.logger.warn(
            `Không thể tạo địa chỉ mặc định ban đầu cho client ${client.id}: ${(err as Error).message}`,
          );
        });
    }

    return {
      ...client,
      address: address ? String(address).trim() : null,
    };
  }

  async updateClient(params: {
    where: Prisma.ClientWhereUniqueInput;
    data: UpdateClientDto;
  }) {
    const { where, data: dataUpdate } = params;
    const { address, ...clientData } = dataUpdate as any;

    if (clientData.status) {
      clientData.deletedAt = null;
    }

    if (typeof clientData.email === 'string') {
      clientData.email = clientData.email.trim().toLowerCase();
      const current = where.id
        ? { id: where.id }
        : await this.prismaService.client.findUnique({
            where,
            select: { id: true },
          });
      await assertEmailAvailable(
        this.prismaService,
        clientData.email,
        current ? { role: 'client', id: current.id } : undefined,
      );
    }

    const data = await this.extended.update({
      data: clientData,
      where,
      omit: { password: true },
    });

    if (clientData.status === 'inactive') {
      this.realtime?.disconnectUser(data.id);
    }

    if (address !== undefined && where.id && this.prismaService.clientAddress) {
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

  /**
   * Tài khoản client chỉ khóa (status = inactive), không xóa.
   */
  async deleteClient(where: Prisma.ClientWhereUniqueInput) {
    const client = await this.extended.findUnique({
      where,
    });

    if (!client) {
      throw new NotFoundException('Client không tồn tại');
    }

    const updated = await this.extended.update({
      where,
      omit: { password: true },

      data: {
        status: 'inactive',
        deletedAt: null,
      },
    });

    this.realtime?.disconnectUser(client.id);
    return updated;
  }
}
