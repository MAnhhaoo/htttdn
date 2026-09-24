import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  UserRole,
} from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { RealtimeService } from 'src/app/realtime/realtime.service';
import { VouchersService } from 'src/app/vouchers/vouchers.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  it('restores stock and voucher usage directly when a pending order is cancelled', async () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    const orderId = '22222222-2222-4222-8222-222222222222';
    const variantId = '33333333-3333-4333-8333-333333333333';
    const voucherId = '44444444-4444-4444-8444-444444444444';
    const current = {
      id: orderId,
      orderCode: 'ORDER-1',
      userId,
      status: OrderStatus.pending,
      payment: {
        status: PaymentStatus.pending,
        method: PaymentMethod.cod,
      },
      details: [
        {
          productVariantId: variantId,
          quantity: 2,
          productVariant: {
            productColor: { product: { vendorId: null } },
          },
        },
      ],
      voucherDetails: [
        {
          id: '55555555-5555-4555-8555-555555555555',
          voucherId,
          reversedAt: null,
        },
      ],
    };
    const tx = {
      productVariant: { update: jest.fn() },
      voucherDetail: { update: jest.fn() },
      voucher: { update: jest.fn() },
      payment: { update: jest.fn() },
      order: {
        update: jest.fn(),
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          ...current,
          status: OrderStatus.cancelled,
        }),
      },
      orderStatusHistory: { create: jest.fn() },
    };
    const prisma = {
      order: { findUnique: jest.fn().mockResolvedValue(current) },
      $transaction: jest.fn(
        (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
      ),
    };
    const realtime = {
      emitToUser: jest.fn(),
      emitToAdmins: jest.fn(),
      emitToVendor: jest.fn(),
    };
    const service = new OrdersService(
      prisma as unknown as PrismaService,
      {} as VouchersService,
      realtime as unknown as RealtimeService,
    );

    await service.updateStatus(
      orderId,
      { status: OrderStatus.cancelled },
      {
        userID: userId,
        userEmail: 'customer@example.com',
        fullName: 'Customer',
        phone: null,
        avatar: null,
        gender: null,
        address: null,
        role: UserRole.customer,
      },
    );

    expect(tx.productVariant.update).toHaveBeenCalledWith({
      where: { id: variantId },
      data: { stock: { increment: 2 } },
    });
    expect(tx.voucherDetail.update).toHaveBeenCalledWith({
      where: { id: current.voucherDetails[0].id },
      data: { reversedAt: expect.any(Date) as Date },
    });
    expect(tx.voucher.update).toHaveBeenCalledWith({
      where: { id: voucherId },
      data: { usedQuantity: { decrement: 1 } },
    });
    expect(tx.payment.update).toHaveBeenCalledWith({
      where: { orderId },
      data: { status: PaymentStatus.cancelled },
    });
    expect(realtime.emitToUser).toHaveBeenCalledWith(
      userId,
      'order:updated',
      expect.objectContaining({ status: OrderStatus.cancelled }),
    );
  });
});
