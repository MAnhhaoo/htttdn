import { PrismaClient } from '@prisma/client/extension';
import { PrismaService } from '../prisma/prisma.service';

// lấy kiểu dữ liệu của thuộc tính extanded nằm trong PrismaService
type ExtendedClient = PrismaService['extended'];
export class PrismaBaseService<
  K extends keyof PrismaClient & keyof ExtendedClient,
> {
  constructor(
    protected prismaService: PrismaService,
    private readonly model: K,
  ) {}

  protected get client(): PrismaClient[K] {
    return this.prismaService[this.model];
  }
  protected get extended(): ExtendedClient[K] {
    return this.prismaService.extended[this.model];
  }
}
