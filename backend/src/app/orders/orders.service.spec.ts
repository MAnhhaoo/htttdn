import { ForbiddenException } from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ShipmentStatus,
  SurveyResponseStatus,
} from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { RealtimeService } from 'src/app/realtime/realtime.service';
import { VouchersService } from 'src/app/vouchers/vouchers.service';
import { OrdersService } from './orders.service';
import { SurveysService } from 'src/app/surveys/surveys.service';

describe('OrdersService', () => {
  it('creates order survey prompts for active vendor surveys during checkout', async () => {
    const clientId = '11111111-1111-4111-8111-111111111111';
    const vendorId = '22222222-2222-4222-8222-222222222222';
    const orderId = '33333333-3333-4333-8333-333333333333';
    const surveyId = '44444444-4444-4444-8444-444444444444';
    const variantId = '55555555-5555-4555-8555-555555555555';
    const cartId = '66666666-6666-4666-8666-666666666666';
    const order = {
      id: orderId,
      orderCode: 'ORDER-SURVEY',
      clientId,
      status: OrderStatus.pending,
      vendorOrders: [], shipments: [],
      details: [
        {
          productVariant: {
            productColor: { product: { vendorId } }}},
      ]};
    const prompt = {
      id: '77777777-7777-4777-8777-777777777777',
      orderId,
      status: SurveyResponseStatus.pending,
      survey: { id: surveyId, title: 'Khảo sát sau mua hàng' }};
    const tx = {
      cart: {
        findUnique: jest.fn().mockResolvedValue({
          id: cartId,
          items: [{ id: 'cart-item', productVariantId: variantId, quantity: 1,
            productVariant: { productColor: { product: { vendorId } } } }]})},
      order: {
        create: jest.fn().mockResolvedValue(order),
        findUniqueOrThrow: jest.fn().mockResolvedValue(order)},
      productVariant: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      orderDetail: { create: jest.fn(), updateMany: jest.fn() },
      vendorOrder: { create: jest.fn().mockResolvedValue({ id: 'vendor-order' }) },
      employee: { findMany: jest.fn().mockResolvedValue([]) },
      shipment: { create: jest.fn().mockResolvedValue({ id: 'shipment' }) },
      payment: { create: jest.fn() },
      orderStatusHistory: { create: jest.fn() },
      cartItem: { deleteMany: jest.fn() },
      surveyResponse: {
        findMany: jest.fn().mockResolvedValue([prompt])}};
    const prisma = {
      $transaction: jest.fn(
        (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
      )};
    Object.assign(prisma, { extended: prisma, extendedTransaction: prisma.$transaction });
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
                product: { name: 'Áo', vendorId }}}},
        ]})};
    const realtime = {
      emitToUser: jest.fn(),
      emitToAdmins: jest.fn(),
      emitToVendor: jest.fn(),
      emitToEmployees: jest.fn(),
      emitProductUpdated: jest.fn()};
    const surveys = {
      deliverForOrder: jest.fn().mockResolvedValue([]),
      emitNotifications: jest.fn()};
    const service = new OrdersService(
      prisma as unknown as PrismaService,
      vouchers as unknown as VouchersService,
      realtime as unknown as RealtimeService,
      surveys as unknown as SurveysService,
    );

    const result = await service.checkout(clientId, {
      receiverName: 'Khách hàng',
      receiverPhone: '0901234567',
      shippingAddress: '123 Đường ABC, TP.HCM',
      paymentMethod: PaymentMethod.cod,
      voucherCodes: []});

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
    const clientId = '11111111-1111-4111-8111-111111111111';
    const orderId = '22222222-2222-4222-8222-222222222222';
    const variantId = '33333333-3333-4333-8333-333333333333';
    const voucherId = '44444444-4444-4444-8444-444444444444';
    const current = {
      id: orderId,
      orderCode: 'ORDER-1',
      clientId,
      status: OrderStatus.pending,
      vendorOrders: [], shipments: [],
      payment: {
        status: PaymentStatus.pending,
        method: PaymentMethod.cod},
      details: [
        {
          productVariantId: variantId,
          quantity: 2,
          productVariant: {
            productColor: { product: { vendorId: null } }}},
      ],
      voucherDetails: [
        {
          id: '55555555-5555-4555-8555-555555555555',
          voucherId,
          reversedAt: null},
      ]};
    const tx = {
      productVariant: { update: jest.fn() },
      vendorOrder: { updateMany: jest.fn() },
      shipment: { updateMany: jest.fn() },
      voucherDetail: { update: jest.fn() },
      voucher: { updateMany: jest.fn() },
      payment: { update: jest.fn() },
      order: {
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          ...current,
          status: OrderStatus.cancelled})},
      employee: { findMany: jest.fn().mockResolvedValue([]) },
      orderStatusHistory: { create: jest.fn() }};
    const prisma = {
      order: { findUnique: jest.fn().mockResolvedValue(current) },
      $transaction: jest.fn(
        (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
      )};
    Object.assign(prisma, { extended: prisma, extendedTransaction: prisma.$transaction });
    const realtime = {
      emitToUser: jest.fn(),
      emitToAdmins: jest.fn(),
      emitToVendor: jest.fn(),
      emitToEmployees: jest.fn(),
      emitProductUpdated: jest.fn()};
    const service = new OrdersService(
      prisma as unknown as PrismaService,
      {} as VouchersService,
      realtime as unknown as RealtimeService,
      {
        deliverForOrder: jest.fn().mockResolvedValue([]),
        emitNotifications: jest.fn()} as unknown as SurveysService,
    );

    await service.updateStatus(
      orderId,
      { status: OrderStatus.cancelled },
      {
        userID: clientId,
        userEmail: 'customer@example.com',
        fullName: 'Customer',
        phone: null,
        avatar: null,
        gender: null,
        address: null,
        role: 'client'},
    );

    expect(tx.productVariant.update).toHaveBeenCalledWith({
      where: { id: variantId },
      data: { stock: { increment: 2 } }});
    expect(tx.voucherDetail.update).toHaveBeenCalledWith({
      where: { id: current.voucherDetails[0].id },
      data: { reversedAt: expect.any(Date) as Date }});
    expect(tx.voucher.updateMany).toHaveBeenCalledWith({
      where: { id: voucherId, usedQuantity: { gt: 0 } },
      data: { usedQuantity: { decrement: 1 } }});
    expect(tx.payment.update).toHaveBeenCalledWith({
      where: { orderId },
      data: { status: PaymentStatus.cancelled }});
    expect(realtime.emitToUser).toHaveBeenCalledWith(
      clientId,
      'order:updated',
      expect.objectContaining({ status: OrderStatus.cancelled }),
    );
  });

  it('aggregates status counts via groupBy and reads paginated invoices in listAll', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        orderCode: 'INV-2026-001',
        status: OrderStatus.completed,
        subtotalAmount: new Prisma.Decimal(500000),
        discountAmount: new Prisma.Decimal(50000),
        totalAmount: new Prisma.Decimal(450000),
        details: [{ id: 'd1', quantity: 2, price: new Prisma.Decimal(250000) }],
        voucherDetails: [{ id: 'vd1', discountAmount: new Prisma.Decimal(50000), voucher: { code: 'SALE50K', scope: 'platform' } }],
      },
    ];

    const prisma = {
      order: {
        findMany: jest.fn().mockResolvedValue(mockOrders),
        count: jest.fn().mockResolvedValue(1),
        groupBy: jest.fn().mockResolvedValue([
          { status: OrderStatus.completed, _count: { _all: 5 } },
          { status: OrderStatus.pending, _count: { _all: 2 } },
          { status: OrderStatus.cancelled, _count: { _all: 1 } },
        ]),
      },
    };
    Object.assign(prisma, { extended: prisma });

    const service = new OrdersService(
      prisma as unknown as PrismaService,
      {} as VouchersService,
      {} as RealtimeService,
      {} as SurveysService,
    );

    const result = await service.listAll(
      { page: 1, itemPerPage: 10 },
      {
        userID: 'admin-1',
        userEmail: 'admin@example.com',
        fullName: 'Admin',
        phone: null,
        avatar: null,
        gender: null,
        address: null,
        role: 'admin',
      },
    );

    expect(prisma.order.groupBy).toHaveBeenCalledTimes(1);
    expect(prisma.order.findMany).toHaveBeenCalledTimes(1);
    expect(result.list).toHaveLength(1);
    expect(result.countsByStatus).toEqual({
      all: 8,
      pending: 2,
      confirmed: 0,
      processing: 0,
      shipping: 0,
      completed: 5,
      cancelled: 1,
    });
  });

  it('defaults listAll to ASC and paginates by grouped checkout batches when groupByBatch=true', async () => {
    const tBatch = new Date('2026-10-01T10:00:00Z');
    const tSingle = new Date('2026-10-02T10:00:00Z');
    const headers = [
      { id: 'o1', clientId: 'c1', receiverName: 'A', receiverPhone: '090', shippingAddress: '123 Lê Lợi', createdAt: tBatch },
      { id: 'o2', clientId: 'c1', receiverName: 'A', receiverPhone: '090', shippingAddress: '123 Lê Lợi', createdAt: new Date(tBatch.getTime() + 1000) },
      { id: 'o3', clientId: 'c1', receiverName: 'A', receiverPhone: '090', shippingAddress: '123 Lê Lợi', createdAt: new Date(tBatch.getTime() + 2000) },
      { id: 'o4', clientId: 'c2', receiverName: 'B', receiverPhone: '091', shippingAddress: '456 Hai Bà Trưng', createdAt: tSingle },
    ];
    const fullOrders = headers.map((h) => ({
      ...h,
      orderCode: `code_${h.id}`,
      status: OrderStatus.pending,
      details: [],
      shipments: [],
      statusHistory: [],
      vendorOrders: [],
    }));

    const findManyMock = jest
      .fn()
      .mockResolvedValueOnce(headers)
      .mockResolvedValueOnce(fullOrders);

    const prisma = {
      order: {
        findMany: findManyMock,
        count: jest.fn().mockResolvedValue(4),
        groupBy: jest.fn().mockResolvedValue([
          { status: OrderStatus.pending, _count: { _all: 4 } },
        ]),
      },
    };
    Object.assign(prisma, { extended: prisma });

    const service = new OrdersService(
      prisma as unknown as PrismaService,
      {} as VouchersService,
      {} as RealtimeService,
      {} as SurveysService,
    );

    const result = await service.listAll(
      { page: 1, itemPerPage: 2, groupByBatch: true },
      { userID: 'admin-1', role: 'admin' } as any,
    );

    expect(findManyMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }),
    );
    expect(findManyMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: { in: ['o1', 'o2', 'o3', 'o4'] } },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }),
    );
    expect(result.list).toHaveLength(4);
    expect(result.totalItems).toBe(2);
    expect(result.totalPages).toBe(1);
    expect((result as any).rawTotalItems).toBe(4);
  });

  it('assigns 1 shared coordinator and separate couriers per sub-order in multi-vendor checkout', async () => {
    const clientId = '11111111-1111-4111-8111-111111111111';
    const handlers = [
      { id: 'h1', fullName: 'Điều phối 1', employeeCode: 'EMP004', department: 'Bộ phận Điều phối & Liên kết Vendor', phone: '0901' },
      { id: 'h2', fullName: 'Điều phối 2', employeeCode: 'EMP005', department: 'Bộ phận Điều phối & Liên kết Vendor', phone: '0902' },
    ];
    const shippers = [
      { id: 's1', fullName: 'Bưu tá 1', employeeCode: 'EMP010', department: 'Phòng Vận chuyển & Giao nhận', phone: '0911', assignedOrderScope: 'assigned_orders', assignedShipments: [] },
      { id: 's2', fullName: 'Bưu tá 2', employeeCode: 'EMP011', department: 'Phòng Vận chuyển & Giao nhận', phone: '0912', assignedOrderScope: 'assigned_orders', assignedShipments: [] },
      { id: 's3', fullName: 'Bưu tá 3', employeeCode: 'EMP012', department: 'Phòng Vận chuyển & Giao nhận', phone: '0913', assignedOrderScope: 'assigned_orders', assignedShipments: [] },
      { id: 's4', fullName: 'Bưu tá 4', employeeCode: 'EMP013', department: 'Phòng Vận chuyển & Giao nhận', phone: '0914', assignedOrderScope: 'assigned_orders', assignedShipments: [] },
    ];

    const vendorIds = ['v1', 'v2', 'v3', 'v4'];
    const cartItems = vendorIds.map((vId, idx) => ({
      id: `ci-${idx}`,
      productVariantId: `var-${idx}`,
      quantity: 1,
      productVariant: { productColor: { product: { vendorId: vId } } },
    }));

    let orderSeq = 0;
    const createdShipments: any[] = [];
    const createdHistory: any[] = [];

    const tx = {
      cart: { findUnique: jest.fn().mockResolvedValue({ id: 'cart-1', items: cartItems }) },
      order: {
        create: jest.fn().mockImplementation(async () => {
          orderSeq += 1;
          return {
            id: `ord-${orderSeq}`,
            orderCode: `code-${orderSeq}`,
            clientId,
            status: OrderStatus.pending,
            shippingAddress: '123 ABC',
            receiverName: 'Khách',
            receiverPhone: '0900000000',
          };
        }),
        findUniqueOrThrow: jest.fn().mockImplementation(async ({ where }: any) => ({
          id: where.id,
          orderCode: `code-${where.id}`,
          clientId,
          status: OrderStatus.pending,
          details: [{ productVariant: { productColor: { product: { id: 'p1', vendorId: 'v1' } } } }],
          shipments: [],
          vendorOrders: [],
        })),
      },
      productVariant: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      orderDetail: { create: jest.fn(), updateMany: jest.fn() },
      vendorOrder: { create: jest.fn().mockResolvedValue({ id: 'vo-1' }) },
      employee: {
        findMany: jest.fn().mockImplementation(async ({ where }: any) => {
          if (where?.department?.contains === 'Điều phối') return handlers;
          return shippers;
        }),
      },
      shipment: {
        create: jest.fn().mockImplementation(async ({ data }: any) => {
          createdShipments.push(data);
          return { id: `ship-${createdShipments.length}`, ...data };
        }),
      },
      shipmentEvent: { create: jest.fn() },
      payment: { create: jest.fn() },
      orderStatusHistory: {
        create: jest.fn().mockImplementation(async ({ data }: any) => {
          createdHistory.push(data);
          return data;
        }),
      },
      cartItem: { deleteMany: jest.fn() },
      surveyResponse: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const prisma = {
      $transaction: jest.fn((cb: any) => cb(tx)),
    };
    Object.assign(prisma, { extended: prisma, extendedTransaction: prisma.$transaction });

    const vouchers = {
      calculate: jest.fn().mockImplementation(async (_codes: any, _cid: any, items: any[]) => ({
        subtotalAmount: new Prisma.Decimal(100),
        discountAmount: new Prisma.Decimal(0),
        totalAmount: new Prisma.Decimal(100),
        applications: [],
        items: items.map((i) => ({
          productVariantId: i.productVariantId,
          quantity: i.quantity,
          variant: {
            price: new Prisma.Decimal(100),
            size: 'M',
            productColor: { color: 'Đen', imageUrls: ['img.jpg'], product: { name: 'SP', vendorId: 'v1' } },
          },
        })),
      })),
    };
    const realtime = {
      emitToUser: jest.fn(),
      emitToAdmins: jest.fn(),
      emitToVendor: jest.fn(),
      emitToEmployees: jest.fn(),
      emitProductUpdated: jest.fn(),
    };
    const surveys = {
      deliverForOrder: jest.fn().mockResolvedValue([]),
      emitNotifications: jest.fn(),
    };

    const service = new OrdersService(
      prisma as any,
      vouchers as any,
      realtime as any,
      surveys as any,
    );

    const res = await service.checkout(clientId, {
      receiverName: 'Khách',
      receiverPhone: '0900000000',
      shippingAddress: '123 ABC',
      paymentMethod: PaymentMethod.cod,
      voucherCodes: [],
    });

    expect(res.totalOrders).toBe(4);
    // 4 sub-orders must have 4 distinct couriers
    const assignedCarrierIds = createdShipments.map((s) => s.carrierId);
    expect(new Set(assignedCarrierIds).size).toBe(4);
    // All 4 sub-orders must share 1 single coordinator
    const handlerAssignments = createdHistory
      .filter((h) => h.note?.includes('[Phân công tiếp nhận]'))
      .map((h) => h.employeeId);
    expect(handlerAssignments).toHaveLength(4);
    expect(new Set(handlerAssignments).size).toBe(1);
  });

  it('syncs coordinator across batch siblings while keeping courier assignment per sub-order', async () => {
    const t = new Date('2026-11-10T07:00:00Z');
    const subOrders = [
      { id: 'ord-1', clientId: 'c1', shippingAddress: '174 Láng Hạ', createdAt: t, status: OrderStatus.pending },
      { id: 'ord-2', clientId: 'c1', shippingAddress: '174 Láng Hạ', createdAt: t, status: OrderStatus.pending },
      { id: 'ord-3', clientId: 'c1', shippingAddress: '174 Láng Hạ', createdAt: t, status: OrderStatus.pending },
      { id: 'ord-4', clientId: 'c1', shippingAddress: '174 Láng Hạ', createdAt: t, status: OrderStatus.pending },
    ];
    const coordinator = {
      id: 'coord-1',
      fullName: 'Vương Gia Phùng',
      employeeCode: 'EMP004',
      phone: '0978',
      department: 'Bộ phận Điều phối & Liên kết Vendor',
      status: 'active',
      deletedAt: null,
    };
    const courier = {
      id: 'ship-1',
      fullName: 'Nhật Quang Trương',
      employeeCode: 'EMP014',
      phone: '0933',
      department: 'Phòng Vận chuyển & Giao nhận',
      status: 'active',
      deletedAt: null,
    };

    const createdHistory: any[] = [];
    const updatedShipments: any[] = [];
    const tx = {
      order: {
        findMany: jest.fn()
          .mockResolvedValueOnce(subOrders)
          .mockResolvedValueOnce(
            subOrders.slice(1).map((s) => ({ ...s, orderCode: s.id, details: [], shipments: [] })),
          ),
        findUniqueOrThrow: jest.fn().mockImplementation(async ({ where }: any) => ({
          id: where.id,
          orderCode: where.id,
          clientId: 'c1',
          status: OrderStatus.pending,
          details: [],
          shipments: [{ id: 's1', carrierId: courier.id, trackingNumber: 'SHIP-1' }],
        })),
      },
      orderStatusHistory: {
        create: jest.fn().mockImplementation(async ({ data }: any) => {
          createdHistory.push(data);
          return data;
        }),
      },
      shipment: {
        findMany: jest.fn().mockResolvedValue([{ id: 's1', orderId: 'ord-1', status: ShipmentStatus.assigned, notes: '' }]),
        update: jest.fn().mockImplementation(async (args: any) => {
          updatedShipments.push(args);
          return args;
        }),
      },
      shipmentEvent: { create: jest.fn() },
    };

    const prisma = {
      order: {
        findUnique: jest.fn().mockResolvedValue({ ...subOrders[0], shipments: [], vendorOrders: [] }),
      },
      employee: {
        findUnique: jest.fn()
          .mockResolvedValueOnce(coordinator)
          .mockResolvedValueOnce(courier),
      },
      $transaction: jest.fn((cb: any) => cb(tx)),
    };
    Object.assign(prisma, { extended: prisma, extendedTransaction: prisma.$transaction });

    const realtime = {
      emitToUser: jest.fn(),
      emitToAdmins: jest.fn(),
      emitToEmployees: jest.fn(),
      emitToVendor: jest.fn(),
      emitProductUpdated: jest.fn(),
    };

    const service = new OrdersService(prisma as any, {} as any, realtime as any, {} as any);
    const adminUser = { userID: 'adm-1', role: 'admin' } as any;

    await service.assignOrder('ord-1', { employeeId: coordinator.id }, adminUser);
    expect(createdHistory.map((h) => h.orderId)).toEqual(['ord-1', 'ord-2', 'ord-3', 'ord-4']);

    createdHistory.length = 0;
    await service.assignOrder('ord-1', { employeeId: courier.id }, adminUser);
    expect(createdHistory.map((h) => h.orderId)).toEqual(['ord-1']);
    expect(updatedShipments).toHaveLength(1);
  });

  it('strictly isolates couriers from viewing or managing other couriers small sub-orders', async () => {
    const courierId = 'courier-1';
    const otherCourierId = 'courier-2';
    const orderOwnedByOther = {
      id: 'ord-other',
      orderCode: 'ORDER-OTHER',
      clientId: 'c1',
      status: OrderStatus.shipping,
      shipments: [{ id: 's-other', carrierId: otherCourierId, vendorOrderId: 'vo-other' }],
      // Even if courierId appeared in historical statusHistory prior to reassignment, access must be denied!
      statusHistory: [{ id: 'h1', employeeId: courierId }],
      vendorOrders: [{ id: 'vo-other' }],
      details: [],
    };

    const prisma = {
      order: {
        findUnique: jest.fn().mockResolvedValue(orderOwnedByOther),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      employee: {
        findUnique: jest.fn().mockResolvedValue({
          id: courierId,
          department: 'Phòng Vận chuyển & Giao nhận',
          assignedOrderScope: 'assigned_orders',
        }),
      },
    };
    Object.assign(prisma, { extended: prisma });

    const service = new OrdersService(prisma as any, {} as any, {} as any, {} as any);
    const courierUser = { userID: courierId, role: 'employee' } as any;

    await expect(service.getById('ord-other', courierUser)).rejects.toThrow(ForbiddenException);

    await service.listAll({ page: 1, itemPerPage: 10 }, courierUser);
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          shipments: { some: { carrierId: courierId } },
        }),
      }),
    );
  });
});
