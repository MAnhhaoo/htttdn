import { NotificationType } from '@prisma/client';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  const createDeps = () => {
    const prisma = {
      extended: {
        notification: {
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
          count: jest.fn().mockResolvedValue(2),
          findMany: jest.fn().mockResolvedValue([]),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'n-1' }),
        },
      },
    };
    const realtime = {
      emitToUser: jest.fn(),
      emitToVendor: jest.fn(),
      emitToAdmins: jest.fn(),
    };
    const service = new NotificationsService(prisma as any, realtime as any);
    return { service, prisma, realtime };
  };

  it('scopes employee unreadCount queries by employeeId', async () => {
    const { service, prisma } = createDeps();
    const res = await service.unreadCount({
      userID: 'emp-1',
      role: 'employee',
    } as any);

    expect(res).toEqual({ count: 2 });
    expect(prisma.extended.notification.count).toHaveBeenCalledWith({
      where: { employeeId: 'emp-1', isRead: false },
    });
  });

  it('persists order_update notifications and emits realtime events to vendor, employee, client, and admin', async () => {
    const { service, prisma, realtime } = createDeps();
    await service.notifyOrderUpdates([
      {
        vendorId: 'vendor-1',
        title: 'Đơn hàng mới #ORD-001',
        content: 'Bạn có đơn hàng mới',
        data: { orderId: 'order-1' },
      },
      {
        employeeId: 'emp-1',
        title: 'Phân công xử lý đơn #ORD-001',
        content: 'Bạn được phân công xử lý đơn',
        data: { orderId: 'order-1' },
      },
      {
        clientId: 'client-1',
        title: 'Đơn hàng #ORD-001: Đã xác nhận',
        content: 'Đơn hàng đã được xác nhận',
        data: { orderId: 'order-1' },
      },
      {
        adminId: 'admin-1',
        title: 'Cảnh báo đơn #ORD-001',
        content: 'Cần kiểm tra',
        data: { orderId: 'order-1' },
      },
    ]);

    expect(prisma.extended.notification.createMany).toHaveBeenCalledTimes(1);
    const callArg = prisma.extended.notification.createMany.mock.calls[0][0];
    expect(callArg.data).toHaveLength(4);
    expect(callArg.data.every((row: any) => row.type === NotificationType.order_update)).toBe(true);
    expect(callArg.data[1]).toMatchObject({ employeeId: 'emp-1' });

    expect(realtime.emitToVendor).toHaveBeenCalledWith(
      'vendor-1',
      'notification:created',
      expect.objectContaining({ type: NotificationType.order_update, orderId: 'order-1' }),
    );
    expect(realtime.emitToUser).toHaveBeenCalledWith(
      'emp-1',
      'notification:created',
      expect.objectContaining({ type: NotificationType.order_update, orderId: 'order-1' }),
    );
    expect(realtime.emitToUser).toHaveBeenCalledWith(
      'client-1',
      'notification:created',
      expect.objectContaining({ type: NotificationType.order_update, orderId: 'order-1' }),
    );
    expect(realtime.emitToAdmins).toHaveBeenCalledWith(
      'notification:created',
      expect.objectContaining({ type: NotificationType.order_update }),
    );
  });

  it('swallows persistence errors so core order transactions never fail', async () => {
    const { service, prisma } = createDeps();
    prisma.extended.notification.createMany.mockRejectedValueOnce(new Error('DB busy'));

    await expect(
      service.notifyOrderUpdates([
        { vendorId: 'vendor-1', title: 'Test', content: 'Test' },
      ]),
    ).resolves.toBeUndefined();
  });
});
