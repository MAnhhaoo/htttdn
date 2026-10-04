import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  SurveyResponseStatus,
  UserRole,
} from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { RealtimeService } from 'src/app/realtime/realtime.service';
import { VouchersService } from 'src/app/vouchers/vouchers.service';
import { OrdersService } from './orders.service';
import { SurveysService } from 'src/app/surveys/surveys.service';

describe('OrdersService', () => {
  it('creates order survey prompts for active vendor surveys during checkout', async () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    const vendorId = '22222222-2222-4222-8222-222222222222';
    const orderId = '33333333-3333-4333-8333-333333333333';
    const surveyId = '44444444-4444-4444-8444-444444444444';
    const variantId = '55555555-5555-4555-8555-555555555555';
    const cartId = '66666666-6666-4666-8666-666666666666';
    const order = {
      id: orderId,
      orderCode: 'ORDER-SURVEY',
      userId,
      status: OrderStatus.pending,
      details: [
        {
          productVariant: {
            productColor: { product: { vendorId } },
          },
        },
      ],
    };
    const prompt = {
      id: '77777777-7777-4777-8777-777777777777',
      orderId,
      status: SurveyResponseStatus.pending,
      survey: { id: surveyId, title: 'Khảo sát sau mua hàng' },
    };
    const tx = {
      cart: {
        findUnique: jest.fn().mockResolvedValue({
          id: cartId,
          items: [{ productVariantId: variantId, quantity: 1 }],
        }),
      },
      order: {
        create: jest.fn().mockResolvedValue(order),
        findUniqueOrThrow: jest.fn().mockResolvedValue(order),
      },
      productVariant: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      orderDetail: { create: jest.fn() },
      payment: { create: jest.fn() },
      orderStatusHistory: { create: jest.fn() },
      cartItem: { deleteMany: jest.fn() },
      surveyResponse: {
        findMany: jest.fn().mockResolvedValue([prompt]),
      },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
      ),
    };
    const vouchers = {
      calculate: jest.fn().mockResolvedValue({
        subtotalAmount: new Prisma.Decimal(100),
        discountAmount: new Prisma.Decimal(0),
        totalAmount: new Prisma.Decimal(100),
        applications: [],
        items: [
          {
            productVariantId: variantId,
            quantity: 1,
            variant: {
              price: new Prisma.Decimal(100),
              size: 'M',
              productColor: {
                color: 'Đen',
                imageUrls: ['image.jpg'],
                product: { name: 'Áo', vendorId },
              },
            },
          },
        ],
      }),
    };
    const realtime = {
      emitToUser: jest.fn(),
      emitToAdmins: jest.fn(),
      emitToVendor: jest.fn(),
    };
    const surveys = {
      deliverForOrder: jest.fn().mockResolvedValue([]),
      emitNotifications: jest.fn(),
    };
    const service = new OrdersService(
      prisma as unknown as PrismaService,
      vouchers as unknown as VouchersService,
      realtime as unknown as RealtimeService,
      surveys as unknown as SurveysService,
    );

    const result = await service.checkout(userId, {
      receiverName: 'Khách hàng',
      receiverPhone: '0901234567',
      shippingAddress: '123 Đường ABC, TP.HCM',
      paymentMethod: PaymentMethod.cod,
      voucherCodes: [],
    });

    expect(surveys.deliverForOrder).toHaveBeenCalledWith(
      tx,
      orderId,
      'after_checkout',
    );
    expect(result).toEqual(
      expect.objectContaining({ surveyPrompts: [prompt] }),
    );
  });

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
      {
        deliverForOrder: jest.fn().mockResolvedValue([]),
        emitNotifications: jest.fn(),
      } as unknown as SurveysService,
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
