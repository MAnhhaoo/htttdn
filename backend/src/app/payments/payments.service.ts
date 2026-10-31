import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException} from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

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
            include: { productColor: { include: { product: true } } }}}}}}};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  listAll() {
    return this.prisma.extended.payment.findMany({
      include: paymentInclude,
      orderBy: { createdAt: 'desc' }});
  }

  async getByOrder(orderId: string, user: UserInfo) {
    const payment = await this.prisma.extended.payment.findUnique({
      where: { orderId },
      include: paymentInclude});
    if (!payment) throw new NotFoundException('Thanh toán không tồn tại');
    this.assertAccess(payment.order, user);
    return payment;
  }

  async processDemoPayment(id: string, success: boolean, user: UserInfo) {
    const payment = await this.prisma.extended.payment.findUnique({ where: { id }, include: paymentInclude });
    if (!payment) throw new NotFoundException('Thanh toán không tồn tại');
    if (payment.order.clientId !== user.userID) throw new ForbiddenException('Bạn không có quyền thanh toán đơn hàng này');
    if (payment.method === PaymentMethod.cod) throw new BadRequestException('Đơn COD được thanh toán khi giao hàng');
    return this.updateStatus(id, { status: success ? PaymentStatus.paid : PaymentStatus.failed });
  }

  async updateStatus(id: string, dto: UpdatePaymentStatusDto) {
    const current = await this.prisma.extended.payment.findUnique({
      where: { id },
      include: paymentInclude});
    if (!current) throw new NotFoundException('Thanh toán không tồn tại');
    if (current.status === dto.status) return current;
    const transitions: Record<PaymentStatus, PaymentStatus[]> = {
      pending: ['paid', 'failed', 'cancelled'], failed: ['pending', 'paid', 'cancelled'],
      paid: ['refunded'], cancelled: [], refunded: [],
    };
    if (!transitions[current.status].includes(dto.status)) throw new BadRequestException('Không thể chuyển trạng thái thanh toán này');
    if (
      current.order.status === OrderStatus.cancelled &&
      dto.status === PaymentStatus.paid
    ) {
      throw new BadRequestException('Không thể thanh toán đơn đã hủy');
    }
    // Giữ trạng thái thanh toán đồng bộ với đơn hàng
    if (
      dto.status === PaymentStatus.cancelled &&
      current.order.status !== OrderStatus.cancelled
    ) {
      throw new BadRequestException(
        'Chỉ hủy thanh toán khi đơn hàng đã hủy. Hãy hủy đơn hàng để hệ thống tự đồng bộ thanh toán, voucher và tồn kho',
      );
    }
    if (
      dto.status === PaymentStatus.paid &&
      current.method === PaymentMethod.cod &&
      current.order.status !== OrderStatus.shipping &&
      current.order.status !== OrderStatus.completed
    ) {
      throw new BadRequestException(
        'Đơn COD chỉ được xác nhận đã thanh toán khi đang giao hoặc đã hoàn tất',
      );
    }
    const now = new Date();
    const payment = await this.prisma.extended.payment.update({
      where: { id },
      data: {
        ...dto,
        paidAt: dto.status === PaymentStatus.paid ? now : undefined,
        failedAt: dto.status === PaymentStatus.failed ? now : undefined},
      include: paymentInclude});
    const payload = {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: payment.status};
    this.realtime.emitToUser(payment.order.clientId, 'payment:updated', payload);
    this.realtime.emitToAdmins('payment:updated', payload);
    this.realtime.emitToEmployees('payment:updated', payload);
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
      clientId: string;
      details: Array<{
        productVariant: {
          productColor: { product: { vendorId: string | null } };
        };
      }>;
    },
    user: UserInfo,
  ) {
    if (user.role === 'admin' || order.clientId === user.userID) return;
    const ownsProduct = order.details.some(
      (item) =>
        item.productVariant.productColor.product.vendorId === user.userID,
    );
    if (user.role !== 'vendor' || !ownsProduct) {
      throw new ForbiddenException('Bạn không có quyền xem thanh toán này');
    }
  }
}
