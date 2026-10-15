import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { GetNotificationsQueryDto } from './dto/get-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private getTargetWhere(user: UserInfo) {
    if (user.role === 'admin') return { adminId: user.userID };
    if (user.role === 'vendor') return { vendorId: user.userID };
    return { clientId: user.userID };
  }

  async list(user: UserInfo, query: GetNotificationsQueryDto) {
    const { page = 1, itemPerPage = 20, unreadOnly } = query;
    const targetWhere = this.getTargetWhere(user);
    const where = { ...targetWhere, ...(unreadOnly ? { isRead: false } : {}) };

    const [totalItems, list] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * itemPerPage,
        take: itemPerPage,
        orderBy: { createdAt: 'desc' },
        include: {
          survey: {
            select: {
              id: true,
              title: true,
              description: true,
              imageUrl: true,
              status: true,
              scope: true,
              admin: { select: { fullName: true } },
              vendor: { select: { storeName: true, fullName: true } },
            },
          },
          response: {
            select: {
              id: true,
              status: true,
              submittedAt: true,
              expiresAt: true,
            },
          },
        },
      }),
    ]);

    return {
      list,
      page,
      itemPerPage,
      totalItems,
      totalPages: Math.ceil(totalItems / itemPerPage) || 1,
    };
  }

  async unreadCount(user: UserInfo) {
    const targetWhere = this.getTargetWhere(user);
    return {
      count: await this.prisma.notification.count({
        where: { ...targetWhere, isRead: false },
      }),
    };
  }

  async markRead(id: string, user: UserInfo) {
    const targetWhere = this.getTargetWhere(user);
    const changed = await this.prisma.notification.updateMany({
      where: { id, ...targetWhere },
      data: { isRead: true, readAt: new Date() },
    });
    if (!changed.count) {
      throw new NotFoundException('Thông báo không tồn tại');
    }
    return this.prisma.notification.findUniqueOrThrow({ where: { id } });
  }

  async markAllRead(user: UserInfo) {
    const targetWhere = this.getTargetWhere(user);
    const now = new Date();
    const result = await this.prisma.notification.updateMany({
      where: { ...targetWhere, isRead: false },
      data: { isRead: true, readAt: now },
    });
    return { updatedCount: result.count, readAt: now };
  }
}
