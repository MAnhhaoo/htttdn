import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  UserRole,
} from '@prisma/client';

import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RealtimeService } from 'src/app/realtime/realtime.service';
import { VouchersService } from 'src/app/vouchers/vouchers.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

const orderInclude = {
  details: {
    include: {
      productVariant: {
        include: { productColor: { include: { product: true } } },
      },
      review: true,
    },
  },
  payment: true,
  voucherDetails: {
    where: { productId: null },
    include: { voucher: true },
    orderBy: { sequence: 'asc' as const },
  },
  statusHistory: { orderBy: { createdAt: 'asc' as const } },
};

const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: [OrderStatus.confirmed, OrderStatus.cancelled],
  confirmed: [OrderStatus.processing, OrderStatus.cancelled],
  processing: [OrderStatus.shipping, OrderStatus.cancelled],
  shipping: [OrderStatus.completed],
  completed: [],
  cancelled: [],
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vouchersService: VouchersService,
    private readonly realtime: RealtimeService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto) {
    const result = await this.prisma
      .$transaction(
        async (tx) => {
          const cart = await tx.cart.findUnique({
            where: { userId },
            include: { items: true },
          });
          if (!cart?.items.length)
            throw new BadRequestException('Giỏ hàng đang trống');

          const calculated = await this.vouchersService.calculate(
            dto.voucherCodes,
            userId,
            cart.items.map((item) => ({
              productVariantId: item.productVariantId,
              quantity: item.quantity,
            })),
            tx,
          );

          const order = await tx.order.create({
            data: {
              userId,
              subtotalAmount: calculated.subtotalAmount,
              discountAmount: calculated.discountAmount,
              shippingFee: 0,
              totalAmount: calculated.totalAmount,
              receiverName: dto.receiverName,
              receiverPhone: dto.receiverPhone,
              shippingAddress: dto.shippingAddress,
              notes: dto.notes,
            },
          });

          for (const item of calculated.items) {
            const changed = await tx.productVariant.updateMany({
              where: {
                id: item.productVariantId,
                deletedAt: null,
                stock: { gte: item.quantity },
              },
              data: { stock: { decrement: item.quantity } },
            });
            if (!changed.count)
              throw new ConflictException(
                'Tồn kho vừa thay đổi, vui lòng thử lại',
              );

            await tx.orderDetail.create({
              data: {
                orderId: order.id,
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                price: item.variant.price,
                productName: item.variant.productColor.product.name,
                colorName: item.variant.productColor.color,
                sizeName: item.variant.size,
                imageUrl: item.variant.productColor.imageUrls[0],
              },
            });
          }

          for (const application of calculated.applications) {
            const reserved = await tx.voucher.updateMany({
              where: {
                id: application.voucherId,
                usedQuantity: application.expectedUsedQuantity,
                quantity: { gt: application.expectedUsedQuantity },
                status: 'active',
              },
              data: { usedQuantity: { increment: 1 } },
            });
            if (!reserved.count)
              throw new ConflictException('Voucher vừa hết lượt sử dụng');
            await tx.voucherDetail.create({
              data: {
                voucherId: application.voucherId,
                orderId: order.id,
                eligibleAmount: application.eligibleAmount,
                discountAmount: application.discountAmount,
                sequence: application.sequence,
              },
            });
          }

          await tx.payment.create({
            data: {
              orderId: order.id,
              method: dto.paymentMethod,
              amount: calculated.totalAmount,
            },
          });
          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              actorId: userId,
              toStatus: OrderStatus.pending,
            },
          });
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

          return tx.order.findUniqueOrThrow({
            where: { id: order.id },
            include: orderInclude,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      )
      .catch((error: unknown) => {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034'
        ) {
          throw new ConflictException(
            'Dữ liệu vừa thay đổi, vui lòng thực hiện checkout lại',
          );
        }
        throw error;
      });

    this.emitOrder(result, 'order:created');
    return result;
  }

  listMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  listForVendor(vendorId: string) {
    return this.prisma.order.findMany({
      where: {
        details: {
          some: { productVariant: { productColor: { product: { vendorId } } } },
        },
      },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  listAll() {
    return this.prisma.order.findMany({
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string, user: UserInfo) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    this.assertCanView(order, user);
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, user: UserInfo) {
    const current = await this.getById(id, user);
    if (user.role === UserRole.vendor) {
      const vendorIds = new Set(
        current.details.map(
          (item) => item.productVariant.productColor.product.vendorId,
        ),
      );
      if (vendorIds.size !== 1 || !vendorIds.has(user.userID)) {
        throw new ForbiddenException(
          'Vendor không thể cập nhật đơn có sản phẩm từ nhiều cửa hàng',
        );
      }
    }
    if (user.role === UserRole.customer) {
      if (
        dto.status !== OrderStatus.cancelled ||
        current.status !== OrderStatus.pending
      ) {
        throw new ForbiddenException(
          'Khách hàng chỉ được hủy đơn đang chờ xác nhận',
        );
      }
    }
    if (!transitions[current.status].includes(dto.status)) {
      throw new BadRequestException(
        `Không thể chuyển từ ${current.status} sang ${dto.status}`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.status === OrderStatus.cancelled) {
        for (const detail of current.details) {
          await tx.productVariant.update({
            where: { id: detail.productVariantId },
            data: { stock: { increment: detail.quantity } },
          });
        }
        const usages = current.voucherDetails.filter(
          (detail) => !detail.reversedAt,
        );
        for (const usage of usages) {
          await tx.voucherDetail.update({
            where: { id: usage.id },
            data: { reversedAt: new Date() },
          });
          await tx.voucher.update({
            where: { id: usage.voucherId },
            data: { usedQuantity: { decrement: 1 } },
          });
        }
        await tx.payment.update({
          where: { orderId: id },
          data: {
            status:
              current.payment?.status === PaymentStatus.paid
                ? PaymentStatus.refunded
                : PaymentStatus.cancelled,
          },
        });
      }
      if (
        dto.status === OrderStatus.completed &&
        current.payment?.method === PaymentMethod.cod &&
        current.payment.status === PaymentStatus.pending
      ) {
        await tx.payment.update({
          where: { orderId: id },
          data: { status: PaymentStatus.paid, paidAt: new Date() },
        });
      }
      await tx.order.update({
        where: { id },
        data: {
          status: dto.status,
          cancelledAt:
            dto.status === OrderStatus.cancelled ? new Date() : undefined,
        },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          actorId: user.userID,
          fromStatus: current.status,
          toStatus: dto.status,
          note: dto.note,
        },
      });
      return tx.order.findUniqueOrThrow({
        where: { id },
        include: orderInclude,
      });
    });

    this.emitOrder(updated, 'order:updated');
    return updated;
  }

  private assertCanView(
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
    const vendorIds = new Set(
      order.details.map(
        (item) => item.productVariant.productColor.product.vendorId,
      ),
    );
    if (user.role !== UserRole.vendor || !vendorIds.has(user.userID)) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }
  }

  private emitOrder(
    order: {
      id: string;
      orderCode: string;
      userId: string;
      status: OrderStatus;
      details: Array<{
        productVariant: {
          productColor: { product: { vendorId: string | null } };
        };
      }>;
    },
    event: string,
  ) {
    const payload = {
      orderId: order.id,
      orderCode: order.orderCode,
      status: order.status,
    };
    this.realtime.emitToUser(order.userId, event, payload);
    this.realtime.emitToAdmins(event, payload);
    for (const vendorId of new Set(
      order.details.map(
        (item) => item.productVariant.productColor.product.vendorId,
      ),
    )) {
      if (vendorId) this.realtime.emitToVendor(vendorId, event, payload);
    }
  }
}
