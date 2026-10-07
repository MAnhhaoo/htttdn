import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaBaseService } from '../../common/service/prisma-base.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService extends PrismaBaseService<'userAddress'> {
  constructor(prismaService: PrismaService) {
    super(prismaService, 'userAddress');
  }

  async createAddress(userId: string, data: CreateAddressDto) {
    // If this is set as default, we need to unset the others
    if (data.isDefault) {
      await this.extended.updateMany({
        where: { userId, deletedAt: null },
        data: { isDefault: false },
      });
    }

    return this.extended.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getUserAddresses(userId: string) {
    return this.extended.findMany({
      where: { userId, deletedAt: null },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async getAddress(userId: string, id: string) {
    const address = await this.extended.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async updateAddress(userId: string, id: string, data: UpdateAddressDto) {
    const address = await this.getAddress(userId, id);

    if (data.isDefault) {
      await this.extended.updateMany({
        where: { userId, deletedAt: null, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.extended.update({
      where: { id },
      data,
    });
  }

  async deleteAddress(userId: string, id: string) {
    const address = await this.getAddress(userId, id);

    return this.extended.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
