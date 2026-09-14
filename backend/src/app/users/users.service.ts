import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaBaseService } from '../../common/service/prisma-base.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService extends PrismaBaseService<'user'> {
  constructor(prismaService: PrismaService) {
    super(prismaService, 'user');
  }

  async getUsers() {
    return this.extended.findMany();
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
      where: { email },
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
  async deleteUser(where: Prisma.UserWhereInput) {
    const data = await this.extended.softDelete(where);
    return data;
  }
}
