import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  formatPaginatedList,
  normalizePagination,
} from 'src/common/utils/paginaton-util/pagintion-util.service';
import { GetNotificationsQueryDto } from './dto/get-notification.dto';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  private getTargetWhere(user: UserInfo) {
    if (user.role === 'admin') return { adminId: user.userID };
    if (user.role === 'vendor') return { vendorId: user.userID };
    return { clientId: user.userID };
  }

  async list(user: UserInfo, query: GetNotificationsQueryDto) {
    const { page, itemPerPage, skip } = normalizePagination({
      page: query.page,
      itemPerPage: query.itemPerPage,
      defaultItemPerPage: 20,
    });
    const { unreadOnly } = query;
    const targetWhere = this.getTargetWhere(user);
    const where = { ...targetWhere, ...(unreadOnly ? { isRead: false } : {}) };

    const [totalItems, list] = await Promise.all([
      this.prisma.extended.notification.count({ where }),
      this.prisma.extended.notification.findMany({
        where,
        skip,
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

    return formatPaginatedList(list, totalItems, { page, itemPerPage });
  }

  async unreadCount(user: UserInfo) {
    const targetWhere = this.getTargetWhere(user);
    return {
      count: await this.prisma.extended.notification.count({
        where: { ...targetWhere, isRead: false },
      }),
    };
  }

  async markRead(id: string, user: UserInfo) {
    const targetWhere = this.getTargetWhere(user);
    const changed = await this.prisma.extended.notification.updateMany({
      where: { id, ...targetWhere },
      data: { isRead: true, readAt: new Date() },
    });
    if (!changed.count) {
      throw new NotFoundException('Thông báo không tồn tại');
    }
    const notification = await this.prisma.extended.notification.findUniqueOrThrow({
      where: { id },
    });
    this.realtime.emitToUser(user.userID, 'notification:updated', { id });
    return notification;
  }

  async markAllRead(user: UserInfo) {
    const targetWhere = this.getTargetWhere(user);
    const now = new Date();
    const result = await this.prisma.extended.notification.updateMany({
      where: { ...targetWhere, isRead: false },
      data: { isRead: true, readAt: now },
    });
    if (result.count)
      this.realtime.emitToUser(user.userID, 'notification:updated', {
        updatedCount: result.count,
      });
    return { updatedCount: result.count, readAt: now };
  }
}
