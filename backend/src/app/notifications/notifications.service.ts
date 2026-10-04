import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { GetNotificationsQueryDto } from './dto/get-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: GetNotificationsQueryDto) {
    const { page = 1, itemPerPage = 20, unreadOnly } = query;
    const where = { userId, ...(unreadOnly ? { isRead: false } : {}) };
    const [totalItems, list] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * itemPerPage,
        take: itemPerPage,
        orderBy: { createdAt: 'desc' },
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

  async unreadCount(userId: string) {
    return {
      count: await this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    };
  }

  async markRead(id: string, userId: string) {
    const changed = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
    if (!changed.count) {
      throw new NotFoundException('Thông báo không tồn tại');
    }
    return this.prisma.notification.findUniqueOrThrow({ where: { id } });
  }

  async markAllRead(userId: string) {
    const now = new Date();
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: now },
    });
    return { updatedCount: result.count, readAt: now };
  }
}
