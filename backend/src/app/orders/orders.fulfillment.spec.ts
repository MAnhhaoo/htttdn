import { OrderStatus, VendorOrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';

const vendorId = '11111111-1111-4111-8111-111111111111';
const parcelId = '22222222-2222-4222-8222-222222222222';
const user = { userID: vendorId, role: 'vendor' as const };

function setup(status: VendorOrderStatus = 'confirmed', parentStatus: OrderStatus = 'confirmed') {
  const parent = {
    id: '33333333-3333-4333-8333-333333333333', orderCode: 'TEST-FULFILLMENT',
    clientId: 'client', status: parentStatus, vendorOrders: [] as any[], shipments: [],
    details: [{ id: 'detail', price: 100, quantity: 1,
      productVariant: { productColor: { product: { id: 'product', vendorId } } } }],
  };
  const parcel = {
    id: parcelId, vendorId, orderId: parent.id, vendorOrderCode: 'TEST-PARCEL',
    status, notes: null, order: parent, details: [], shipment: { id: 'shipment' },
  };
  parent.vendorOrders = [parcel];
  const tx = {
    vendorOrder: {
      update: jest.fn().mockImplementation(({ data }) => ({ ...parcel, ...data })),
      findFirst: jest.fn().mockResolvedValue(parcel), create: jest.fn(),
    },
    order: {
      update: jest.fn().mockResolvedValue(parent),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findUniqueOrThrow: jest.fn().mockResolvedValue(parent),
    },
    shipment: { update: jest.fn(), findFirst: jest.fn().mockResolvedValue(parcel.shipment), create: jest.fn() },
    shipmentEvent: { create: jest.fn() }, orderStatusHistory: { create: jest.fn() },
    orderDetail: { update: jest.fn() }, productVariant: { update: jest.fn() },
  };
  const prisma = {
    vendorOrder: { findFirst: jest.fn().mockResolvedValue(parcel) },
    order: { findUnique: jest.fn().mockResolvedValue(parent) },
    $transaction: jest.fn(callback => callback(tx)),
  };
  const realtime = {
    emitToUser: jest.fn(), emitToAdmins: jest.fn(), emitToEmployees: jest.fn(),
    emitToVendor: jest.fn(), emitProductUpdated: jest.fn(),
  };
  const service = new OrdersService(prisma as any, {} as any, realtime as any,
    { emitNotifications: jest.fn() } as any);
  return { service, tx, prisma, realtime, parcel, parent };
}

describe('Vendor fulfillment synchronization', () => {
  it.each([
    ['pending', 'confirmed'], ['confirmed', 'processing'], ['processing', 'processing'],
  ] as const)('synchronizes an existing pending parcel when operations updates %s -> %s', async (parentStatus, nextStatus) => {
    const { service, parent, tx } = setup('pending', parentStatus);
    jest.spyOn(service, 'getById').mockResolvedValue(parent as any);
    await service.updateStatus(parent.id, { status: nextStatus }, { userID: 'admin', role: 'admin' });
    expect(tx.vendorOrder.update).toHaveBeenCalledWith({ where: { id: parcelId }, data: { status: 'confirmed' } });
    expect(tx.vendorOrder.create).not.toHaveBeenCalled();
    expect(tx.shipment.create).not.toHaveBeenCalled();
  });

  it.each(['confirmed', 'pending'] as const)('starts packaging for a %s parcel on a confirmed order', async status => {
    const { service, tx, realtime, parent } = setup(status);
    await service.updateVendorOrderStatus(parcelId, { status: 'processing' }, user);
    expect(tx.order.update).toHaveBeenCalledWith({ where: { id: parent.id }, data: { status: 'processing' } });
    expect(tx.vendorOrder.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'processing' }) }));
    expect(realtime.emitToVendor).toHaveBeenCalledWith(vendorId, 'order:updated', expect.objectContaining({ orderId: parent.id }));
    expect(realtime.emitToUser).toHaveBeenCalled();
    expect(realtime.emitToAdmins).toHaveBeenCalled();
    expect(realtime.emitToEmployees).toHaveBeenCalled();
  });

  it('waits for operations confirmation before packaging', async () => {
    const { service, prisma } = setup('pending', 'pending');
    await expect(service.updateVendorOrderStatus(parcelId, { status: 'processing' }, user)).rejects.toThrow('xác nhận đơn hàng');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it.each(['cancelled', 'completed'] as const)('does not package a %s parent order', async status => {
    const { service, prisma } = setup('confirmed', status);
    await expect(service.updateVendorOrderStatus(parcelId, { status: 'processing' }, user)).rejects.toThrow('đã kết thúc');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('keeps the order processing while the packed parcel awaits pickup', async () => {
    const { service, tx } = setup('processing', 'processing');
    await service.updateVendorOrderStatus(parcelId, { status: 'ready_for_pickup' }, user);
    expect(tx.shipment.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'picking_up' }) }));
    expect(tx.order.update).not.toHaveBeenCalled();
    expect(tx.orderStatusHistory.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ toStatus: 'processing' }) }));
  });

  it('moves the order and shipment to shipping on courier handover', async () => {
    const { service, tx, parent } = setup('ready_for_pickup', 'processing');
    await service.updateVendorOrderStatus(parcelId, { status: 'shipping' }, user);
    expect(tx.shipment.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'in_transit' }) }));
    expect(tx.order.update).toHaveBeenCalledWith({ where: { id: parent.id }, data: { status: 'shipping' } });
  });

  it('does not mark all parcels shipped when another parcel still awaits pickup', async () => {
    const { service, tx, parent } = setup('ready_for_pickup', 'processing');
    parent.vendorOrders.push({ id: 'other', status: 'ready_for_pickup' });
    await service.updateVendorOrderStatus(parcelId, { status: 'shipping' }, user);
    expect(tx.order.update).not.toHaveBeenCalled();
  });

  it('ignores a repeated status without duplicating stock or shipment events', async () => {
    const { service, prisma } = setup('cancelled', 'cancelled');
    const result = await service.updateVendorOrderStatus(parcelId, { status: 'cancelled' }, user);
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(result.vendorOrder).not.toHaveProperty('order');
  });

  it('does not skip packaging steps', async () => {
    const { service, prisma } = setup();
    await expect(service.updateVendorOrderStatus(parcelId, { status: 'ready_for_pickup' }, user)).rejects.toThrow('Không thể chuyển kiện hàng');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('only looks up parcels owned by the signed-in vendor', async () => {
    const { service, prisma } = setup();
    prisma.vendorOrder.findFirst.mockResolvedValue(null as any);
    await expect(service.updateVendorOrderStatus(parcelId, { status: 'processing' }, user)).rejects.toThrow('Không tìm thấy kiện hàng');
    expect(prisma.vendorOrder.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ vendorId }) }));
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
