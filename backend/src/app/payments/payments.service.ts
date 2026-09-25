import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, UserRole } from '@prisma/client';

import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RealtimeService } from 'src/app/realtime/realtime.service';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

const paymentInclude = {
  order: {
    include: {
      details: {
        include: {
          productVariant: {
            include: { productColor: { include: { product: true } } },
          },
        },
      },
    },
  },
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  listAll() {
    return this.prisma.payment.findMany({
      include: paymentInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByOrder(orderId: string, user: UserInfo) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: paymentInclude,
    });
    if (!payment) throw new NotFoundException('Thanh toán không tồn tại');
    this.assertAccess(payment.order, user);
    return payment;
  }

  async updateStatus(id: string, dto: UpdatePaymentStatusDto) {
    const current = await this.prisma.payment.findUnique({
      where: { id },
      include: paymentInclude,
    });
    if (!current) throw new NotFoundException('Thanh toán không tồn tại');
    if (
      current.order.status === OrderStatus.cancelled &&
      dto.status === PaymentStatus.paid
    ) {
      throw new BadRequestException('Không thể thanh toán đơn đã hủy');
    }
    const now = new Date();
    const payment = await this.prisma.payment.update({
      where: { id },
      data: {
        ...dto,
        paidAt: dto.status === PaymentStatus.paid ? now : undefined,
        failedAt: dto.status === PaymentStatus.failed ? now : undefined,
      },
      include: paymentInclude,
    });
    const payload = {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: payment.status,
    };
    this.realtime.emitToUser(payment.order.userId, 'payment:updated', payload);
    this.realtime.emitToAdmins('payment:updated', payload);
    for (const vendorId of new Set(
      payment.order.details.map(
        (item) => item.productVariant.productColor.product.vendorId,
      ),
    )) {
      if (vendorId)
        this.realtime.emitToVendor(vendorId, 'payment:updated', payload);
    }
    return payment;
  }

  private assertAccess(
    order: {
      userId: string;
      details: Array<{
        productVariant: {
          productColor: { product: { vendorId: string | null } };
        };
      }>;
    },
    user: UserInfo,
  ) {
    if (user.role === UserRole.admin || order.userId === user.userID) return;
    const ownsProduct = order.details.some(
      (item) =>
        item.productVariant.productColor.product.vendorId === user.userID,
    );
    if (user.role !== UserRole.vendor || !ownsProduct) {
      throw new ForbiddenException('Bạn không có quyền xem thanh toán này');
    }
  }
}
