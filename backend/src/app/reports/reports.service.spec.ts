import { PrismaService } from 'src/common/prisma/prisma.service';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  it('returns multi-dimension invoice statistics tables (byMonth, byQuarter, byYear, byEmployee, byProduct) using SQL GROUP BY', async () => {
    const queryRawMock = jest
      .fn()
      // 1. monthRows
      .mockResolvedValueOnce([
        {
          month: 10,
          totalOrders: 4,
          completedOrders: 3,
          cancelledOrders: 1,
          subtotalAmount: 2000000,
          discountAmount: 200000,
          totalAmount: 1500000,
          allOrdersAmount: 1800000,
        },
      ])
      // 2. yearRows
      .mockResolvedValueOnce([
        {
          year: 2026,
          totalOrders: 10,
          completedOrders: 8,
          cancelledOrders: 2,
          subtotalAmount: 5000000,
          discountAmount: 400000,
          totalAmount: 3900000,
          allOrdersAmount: 4600000,
        },
      ])
      // 3. employeeRows
      .mockResolvedValueOnce([
        {
          employeeId: 'emp-1',
          employeeCode: 'NV001',
          fullName: 'Nguyễn Văn A',
          department: 'Phòng Vận chuyển & Giao nhận',
          position: 'Bưu tá',
          totalOrders: 6,
          completedOrders: 5,
          cancelledOrders: 1,
          subtotalAmount: 3000000,
          discountAmount: 150000,
          completedAmount: 2500000,
          totalOrderAmount: 2850000,
        },
      ])
      // 4. productRows
      .mockResolvedValueOnce([
        {
          productId: 'prod-1',
          productName: 'Áo Khoác Nam',
          categoryName: 'Áo Khoác',
          vendorName: 'Routine Official',
          orderCount: 5,
          completedOrderCount: 4,
          totalQuantity: 9,
          allQuantity: 10,
          unitPrice: 350000,
          grossAmount: 3150000,
          netAmount: 2800000,
          allGrossAmount: 3500000,
        },
      ]);

    const prisma = {
      order: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(10),
        aggregate: jest.fn().mockResolvedValue({
          _min: { createdAt: new Date('2025-01-01T00:00:00.000Z') },
          _max: { createdAt: new Date('2026-10-31T00:00:00.000Z') },
        }),
      },
      vendor: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(5),
      },
      client: {
        count: jest.fn().mockResolvedValue(20),
      },
      product: {
        count: jest.fn().mockResolvedValue(15),
      },
      employee: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $queryRaw: queryRawMock,
    };
    Object.assign(prisma, { extended: prisma });

    const service = new ReportsService(prisma as unknown as PrismaService);
    const result = await service.analyticsOverview({
      period: 'year',
      year: 2026,
      vendorRegistrationFee: 2000000,
      commissionTaxRate: 8,
    });

    expect(queryRawMock).toHaveBeenCalledTimes(4);
    expect(result.statisticsTables).toBeDefined();
    expect(result.statisticsTables.byMonth).toHaveLength(12);
    const octRow = result.statisticsTables.byMonth.find((m) => m.month === 10);
    expect(octRow).toEqual(
      expect.objectContaining({
        month: 10,
        label: 'Tháng 10/2026',
        totalOrders: 4,
        completedOrders: 3,
        totalAmount: 1500000,
        allOrdersAmount: 1800000,
      }),
    );

    // Quarter 4 derived in O(1) from months 10-12
    expect(result.statisticsTables.byQuarter).toHaveLength(4);
    const q4Row = result.statisticsTables.byQuarter.find((q) => q.quarter === 4);
    expect(q4Row).toEqual(
      expect.objectContaining({
        quarter: 4,
        totalOrders: 4,
        completedOrders: 3,
        totalAmount: 1500000,
        allOrdersAmount: 1800000,
      }),
    );

    expect(result.statisticsTables.byYear).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          year: 2026,
          label: 'Năm 2026',
          totalOrders: 10,
          totalAmount: 3900000,
          allOrdersAmount: 4600000,
        }),
      ]),
    );

    expect(result.statisticsTables.byEmployee).toEqual([
      expect.objectContaining({
        employeeId: 'emp-1',
        employeeCode: 'NV001',
        fullName: 'Nguyễn Văn A',
        totalOrders: 6,
        completedAmount: 2500000,
        totalOrderAmount: 2850000,
      }),
    ]);

    expect(result.statisticsTables.byProduct).toEqual([
      expect.objectContaining({
        productId: 'prod-1',
        productName: 'Áo Khoác Nam',
        totalQuantity: 9,
        grossAmount: 3150000,
        netAmount: 2800000,
      }),
    ]);
  });

  it('customerReport avoids unbounded clientId IN (...) in platform view and aggregates accurately', async () => {
    const prisma = {
      order: {
        findMany: jest.fn(),
      },
      client: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'c-1', dateOfBirth: new Date('2000-05-10'), gender: 'female' },
          { id: 'c-2', dateOfBirth: null, gender: null },
        ]),
      },
      productFavorite: {
        findMany: jest.fn().mockResolvedValue([
          {
            product: {
              id: 'p-1',
              name: 'Đầm Lụa',
              category: { id: 'cat-1', name: 'Đầm' },
            },
          },
        ]),
      },
      orderDetail: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    Object.assign(prisma, { extended: prisma });

    const service = new ReportsService(prisma as unknown as PrismaService);
    const report = await service.customerReport(
      { userID: 'admin-1', role: 'admin' } as any,
      { limit: 5 } as any,
    );

    expect(prisma.order.findMany).not.toHaveBeenCalled();
    expect(prisma.productFavorite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          client: { deletedAt: null },
        }),
      }),
    );
    expect(report.customerCount).toBe(2);
    expect(report.interests.favoriteProducts).toEqual([
      { id: 'p-1', name: 'Đầm Lụa', count: 1 },
    ]);
  });

  it('customerDemographicsAndPreferences computes ageGroupAnalysis in single O(F + D) pass', async () => {
    const dob25 = new Date();
    dob25.setFullYear(dob25.getFullYear() - 28);

    const prisma = {
      client: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'c-1',
            fullName: 'Trần Thị B',
            email: 'b@example.com',
            phone: '0901234567',
            gender: 'female',
            dateOfBirth: dob25,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            status: 'active',
          },
        ]),
      },
      productFavorite: {
        findMany: jest.fn().mockResolvedValue([
          {
            clientId: 'c-1',
            productId: 'p-1',
            product: {
              id: 'p-1',
              name: 'Áo Sơ Mi',
              categoryId: 'cat-1',
              category: { name: 'Áo' },
              vendorId: 'v-1',
              vendor: {
                id: 'v-1',
                storeName: 'Routine Official',
                fullName: 'Routine',
                avatarUrl: null,
              },
            },
          },
        ]),
      },
      orderDetail: {
        findMany: jest.fn().mockResolvedValue([
          {
            quantity: 2,
            price: 250000,
            order: {
              id: 'ord-1',
              clientId: 'c-1',
              status: 'completed',
              subtotalAmount: 500000,
              discountAmount: 50000,
            },
            productVariant: {
              productColor: {
                product: {
                  id: 'p-1',
                  name: 'Áo Sơ Mi',
                  categoryId: 'cat-1',
                  category: { name: 'Áo' },
                  vendorId: 'v-1',
                  vendor: {
                    id: 'v-1',
                    storeName: 'Routine Official',
                    fullName: 'Routine',
                    avatarUrl: null,
                  },
                },
              },
            },
          },
        ]),
      },
      cartItem: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    Object.assign(prisma, { extended: prisma });

    const service = new ReportsService(prisma as unknown as PrismaService);
    const res = await service.customerDemographicsAndPreferences({
      page: 1,
      itemPerPage: 10,
    });

    const group25 = res.ageGroupAnalysis.find((g) => g.key === '25_34');
    expect(group25).toEqual({
      key: '25_34',
      label: '25 - 34 tuổi',
      clientCount: 1,
      percentage: 100,
      topFavoriteVendor: { name: 'Routine Official', count: 1 },
      topPurchasedVendor: { name: 'Routine Official', count: 2 },
      totalSpent: 450000,
    });
    expect(res.clients.list[0]).toEqual(
      expect.objectContaining({
        id: 'c-1',
        totalOrders: 1,
        totalSpent: 450000,
        topStorePurchased: 'Routine Official',
        favoritesCount: 1,
      }),
    );
  });
});
