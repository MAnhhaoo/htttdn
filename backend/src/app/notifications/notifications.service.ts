import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  formatPaginatedList,
  normalizePagination,
} from 'src/common/utils/paginaton-util/pagintion-util.service';
import { GetNotificationsQueryDto } from './dto/get-notification.dto';
import { RealtimeService } from '../realtime/realtime.service';

export interface OrderNotificationInput {
  clientId?: string | null;
  vendorId?: string | null;
  employeeId?: string | null;
  adminId?: string | null;
  title: string;
  content: string;
  data?: Record<string, unknown>;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang chuẩn bị hàng',
  shipping: 'Đang giao hàng',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

export const VENDOR_ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang đóng gói',
  ready_for_pickup: 'Sẵn sàng lấy hàng',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
};

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ tiếp nhận',
  assigned: 'Đã phân công bưu tá',
  picking_up: 'Đang lấy hàng tại shop',
  in_transit: 'Đang luân chuyển',
  out_for_delivery: 'Đang giao đến khách',
  delivered: 'Giao hàng thành công',
  failed: 'Giao hàng thất bại',
  returned: 'Hoàn hàng về kho',
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  private getTargetWhere(user: UserInfo) {
    if (user.role === 'admin') return { adminId: user.userID };
    if (user.role === 'vendor') return { vendorId: user.userID };
    if (user.role === 'employee') return { employeeId: user.userID };
    return { clientId: user.userID };
  }

  private emitUpdatedToRecipient(user: UserInfo, payload: unknown) {
    this.realtime.emitToUser(user.userID, 'notification:updated', payload);
    if (user.role === 'vendor') {
      this.realtime.emitToVendor(user.userID, 'notification:updated', payload);
    }
  }

  /**
   * Lưu hàng loạt thông báo cập nhật đơn hàng / vận đơn vào DB và đẩy realtime tới chuông của từng người nhận.
   * Lỗi thông báo không bao giờ làm gián đoạn giao dịch chính của đơn hàng.
   */
  async notifyOrderUpdates(items: OrderNotificationInput[]) {
    const validItems = items.filter(
      (item) =>
        Boolean(item.title) &&
        Boolean(item.clientId || item.vendorId || item.employeeId || item.adminId),
    );
    if (!validItems.length) return;

    try {
      await this.prisma.extended.notification.createMany({
        data: validItems.map((item) => ({
          ...(item.clientId ? { clientId: item.clientId } : {}),
          ...(item.vendorId ? { vendorId: item.vendorId } : {}),
          ...(item.employeeId ? { employeeId: item.employeeId } : {}),
          ...(item.adminId ? { adminId: item.adminId } : {}),
          type: NotificationType.order_update,
          title: item.title.slice(0, 255),
          content: item.content,
          data: (item.data || {}) as Prisma.InputJsonValue,
        })),
      });

      const notifiedUsers = new Set<string>();
      const notifiedVendors = new Set<string>();
      let shouldEmitAdmins = false;

      for (const item of validItems) {
        const payload = {
          type: NotificationType.order_update,
          title: item.title,
          ...(item.data || {}),
        };
        if (item.clientId && !notifiedUsers.has(item.clientId)) {
          notifiedUsers.add(item.clientId);
          this.realtime.emitToUser(item.clientId, 'notification:created', payload);
        }
        if (item.employeeId && !notifiedUsers.has(item.employeeId)) {
          notifiedUsers.add(item.employeeId);
          this.realtime.emitToUser(item.employeeId, 'notification:created', payload);
        }
        if (item.vendorId && !notifiedVendors.has(item.vendorId)) {
          notifiedVendors.add(item.vendorId);
          this.realtime.emitToVendor(item.vendorId, 'notification:created', payload);
          this.realtime.emitToUser(item.vendorId, 'notification:created', payload);
        }
        if (item.adminId) {
          shouldEmitAdmins = true;
          if (!notifiedUsers.has(item.adminId)) {
            notifiedUsers.add(item.adminId);
            this.realtime.emitToUser(item.adminId, 'notification:created', payload);
          }
        }
      }

      if (shouldEmitAdmins) {
        this.realtime.emitToAdmins('notification:created', {
          type: NotificationType.order_update,
        });
      }
    } catch (error) {
      this.logger.warn(
        `Không thể ghi hoặc gửi thông báo đơn hàng: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
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
    this.emitUpdatedToRecipient(user, { id });
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
      this.emitUpdatedToRecipient(user, {
        updatedCount: result.count,
      });
    return { updatedCount: result.count, readAt: now };
  }
}
