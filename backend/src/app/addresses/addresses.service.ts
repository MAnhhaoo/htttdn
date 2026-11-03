import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaBaseService } from '../../common/service/prisma-base.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService extends PrismaBaseService<'clientAddress'> {
  constructor(prismaService: PrismaService) {
    super(prismaService, 'clientAddress');
  }

  async createAddress(clientId: string, data: CreateAddressDto) {
    // If this is set as default, we need to unset the others
    if (data.isDefault) {
      await this.extended.updateMany({
        where: { clientId, deletedAt: null },
        data: { isDefault: false }});
    }

    return this.extended.create({
      data: {
        ...data,
        clientId}});
  }

  async getUserAddresses(clientId: string) {
    return this.extended.findMany({
      where: { clientId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ]});
  }

  async getAddress(clientId: string, id: string) {
    const address = await this.extended.findFirst({
      where: { id, clientId }});

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async updateAddress(clientId: string, id: string, data: UpdateAddressDto) {
    await this.getAddress(clientId, id);

    if (data.isDefault) {
      await this.extended.updateMany({
        where: { clientId, deletedAt: null, id: { not: id } },
        data: { isDefault: false }});
    }

    return this.extended.update({
      where: { id },
      data});
  }

  async deleteAddress(clientId: string, id: string) {
    await this.getAddress(clientId, id);

    return this.extended.update({
      where: { id },
      data: { deletedAt: new Date() }});
  }
}
