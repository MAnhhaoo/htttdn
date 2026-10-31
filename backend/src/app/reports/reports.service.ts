import { Injectable, Logger } from '@nestjs/common';
import {
  formatPaginatedList,
  normalizePagination,
} from 'src/common/utils/paginaton-util/pagintion-util.service';
import { OrderStatus, Prisma} from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CustomerReportQueryDto } from './dto/customer-report.dto';
import { AnalyticsReportQueryDto } from './dto/analytics-report.dto';

export interface FinanceConfigTier {
  id: string;
  effectiveFrom: string;
  commissionTaxRate: number;
  vendorRegistrationFee: number;
  note?: string;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  constructor(private readonly prisma: PrismaService) {}

  private getFinanceConfigFile(): string {
    return path.join(process.cwd(), 'data', 'finance-config.json');
  }

  getFinanceConfigHistory(): FinanceConfigTier[] {
    try {
      const filePath = this.getFinanceConfigFile();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.history) && parsed.history.length > 0) {
          return parsed.history.sort(
            (a: FinanceConfigTier, b: FinanceConfigTier) =>
              new Date(a.effectiveFrom).getTime() - new Date(b.effectiveFrom).getTime(),
          );
        }
      }
    } catch (e) {
      this.logger.warn(`Error reading finance config history: ${(e as Error).message}`);
    }
    return [
      {
        id: 'init-config-2020',
        effectiveFrom: '2020-01-01T00:00:00.000Z',
        commissionTaxRate: 8,
        vendorRegistrationFee: 2000000,
        note: 'Cấu hình tài chính khởi tạo ban đầu (8% thuế sàn, 2tr phí đăng ký vendor)',
      },
    ];
  }

  getCurrentFinanceConfig(): FinanceConfigTier {
    const history = this.getFinanceConfigHistory();
    return history[history.length - 1];
  }

  getFinanceTierForDate(date: Date | string, history: FinanceConfigTier[]): FinanceConfigTier {
    const targetTime = new Date(date).getTime();
    for (let i = history.length - 1; i >= 0; i--) {
      if (new Date(history[i].effectiveFrom).getTime() <= targetTime) {
        return history[i];
      }
    }
    return history[0];
  }

  saveNewFinanceConfig(dto: {
    commissionTaxRate: number;
    vendorRegistrationFee: number;
    note?: string;
  }): { current: FinanceConfigTier; history: FinanceConfigTier[] } {
    const history = this.getFinanceConfigHistory();
    const current = history[history.length - 1];

    const newTier: FinanceConfigTier = {
      id: `config-${Date.now()}`,
      effectiveFrom: new Date().toISOString(),
      commissionTaxRate: Math.max(
        0,
        Math.min(100, Number(dto.commissionTaxRate) || current.commissionTaxRate),
      ),
      vendorRegistrationFee: Math.max(
        0,
        Number(dto.vendorRegistrationFee) || current.vendorRegistrationFee,
      ),
      note:
        dto.note ||
        `Điều chỉnh cấu hình mới: Thuế sàn ${dto.commissionTaxRate}%, Phí đăng ký vendor ${dto.vendorRegistrationFee}đ`,
    };

    history.push(newTier);
    const dir = path.dirname(this.getFinanceConfigFile());
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      this.getFinanceConfigFile(),
      JSON.stringify({ history }, null, 2),
      'utf-8',
    );

    return {
      current: newTier,
      history,
    };
  }

  async customerReport(user: UserInfo, query: CustomerReportQueryDto) {
    const vendorId = user.role === 'vendor' ? user.userID : undefined;
    const dateWhere = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {})};
    const orderScope: Prisma.OrderWhereInput = {
      status: OrderStatus.completed,
      ...(Object.keys(dateWhere).length ? { createdAt: dateWhere } : {}),
      ...(vendorId
        ? {
            details: {
              some: {
                productVariant: {
                  productColor: { product: { vendorId } }}}}}
        : {})};
    const buyers = await this.prisma.extended.order.findMany({
      where: orderScope,
      select: { clientId: true },
      distinct: ['clientId']});
    const customerIds = buyers.map((buyer) => buyer.clientId);
    const customers = await this.prisma.extended.client.findMany({
      where: {
        
        deletedAt: null,
        ...(vendorId ? { id: { in: customerIds } } : {})},
      select: { id: true, dateOfBirth: true, gender: true }});
    const reportCustomerIds = customers.map((customer) => customer.id);
    const favorites = await this.prisma.extended.productFavorite.findMany({
      where: {
        clientId: { in: reportCustomerIds },
        ...(Object.keys(dateWhere).length ? { createdAt: dateWhere } : {}),
        ...(vendorId ? { product: { vendorId } } : {})},
      select: {
        product: {
          select: {
            id: true,
            name: true,
            category: { select: { id: true, name: true } }}}}});
    const details = await this.prisma.extended.orderDetail.findMany({
      where: {
        order: orderScope,
        ...(vendorId
          ? {
              productVariant: {
                productColor: { product: { vendorId } }}}
          : {})},
      select: {
        quantity: true,
        price: true,
        orderId: true,
        productVariant: {
          select: {
            productColor: {
              select: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    category: { select: { id: true, name: true } }}}}}}}}});

    const favoriteProducts = new Map<string, { name: string; count: number }>();
    const favoriteCategories = new Map<
      string,
      { name: string; count: number }
    >();
    for (const favorite of favorites) {
      this.increment(
        favoriteProducts,
        favorite.product.id,
        favorite.product.name,
      );
      this.increment(
        favoriteCategories,
        favorite.product.category.id,
        favorite.product.category.name,
      );
    }
    const purchasedProducts = new Map<
      string,
      { name: string; count: number }
    >();
    const purchasedCategories = new Map<
      string,
      { name: string; count: number }
    >();
    let revenue = new Prisma.Decimal(0);
    for (const detail of details) {
      const product = detail.productVariant.productColor.product;
      this.increment(
        purchasedProducts,
        product.id,
        product.name,
        detail.quantity,
      );
      this.increment(
        purchasedCategories,
        product.category.id,
        product.category.name,
        detail.quantity,
      );
      revenue = revenue.plus(detail.price.mul(detail.quantity));
    }
    const orderCount = new Set(details.map((detail) => detail.orderId)).size;

    return {
      customerCount: customers.length,
      demographics: {
        ageGroups: this.ageGroups(customers.map((item) => item.dateOfBirth)),
        genders: Object.entries(
          customers.reduce<Record<string, number>>((result, customer) => {
            const key = customer.gender ?? 'unknown';
            result[key] = (result[key] ?? 0) + 1;
            return result;
          }, {}),
        ).map(([gender, count]) => ({ gender, count }))},
      interests: {
        favoriteProducts: this.top(favoriteProducts, query.limit),
        favoriteCategories: this.top(favoriteCategories, query.limit),
        purchasedProducts: this.top(purchasedProducts, query.limit),
        purchasedCategories: this.top(purchasedCategories, query.limit)},
      commerce: {
        completedOrderCount: orderCount,
        revenue: revenue.toString(),
        averageOrderValue: orderCount
          ? revenue.div(orderCount).toDecimalPlaces(2).toString()
          : '0'}};
  }

  async analyticsOverview(query: AnalyticsReportQueryDto) {
    const financeHistory = this.getFinanceConfigHistory();
    const currentTier = financeHistory[financeHistory.length - 1];
    const feePerVendor = query.vendorRegistrationFee ? Number(query.vendorRegistrationFee) : currentTier.vendorRegistrationFee;
    const taxRatePercent = query.commissionTaxRate ? Number(query.commissionTaxRate) : currentTier.commissionTaxRate;

    const orderDateRange = await this.prisma.extended.order.aggregate({
      _min: { createdAt: true },
      _max: { createdAt: true },
    });

    const minYear = orderDateRange._min.createdAt
      ? new Date(orderDateRange._min.createdAt).getFullYear()
      : 2025;
    const maxYear = orderDateRange._max.createdAt
      ? new Date(orderDateRange._max.createdAt).getFullYear()
      : new Date().getFullYear();
    const availableYears: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      availableYears.push(y);
    }
    if (availableYears.length === 0) availableYears.push(new Date().getFullYear());

    const targetYear = query.year ? Number(query.year) : availableYears[0];
    const period = query.period || 'month';

    let startDate: Date;
    let endDate: Date;
    let chartBuckets: Array<{
      key: string;
      label: string;
      date?: string;
      gmv: number;
      cashIn: number;
      adminTax: number;
      orders: number;
      completedOrders: number;
      cancelledOrders: number;
    }>;

    if (period === 'year') {
      startDate = new Date(Date.UTC(targetYear, 0, 1, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59, 999));
      chartBuckets = Array.from({ length: 12 }, (_, i) => ({
        key: `${targetYear}-${String(i + 1).padStart(2, '0')}`,
        label: `Tháng ${i + 1}`,
        gmv: 0,
        cashIn: 0,
        adminTax: 0,
        orders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
      }));
    } else if (period === 'quarter') {
      const quarter = query.quarter ? Number(query.quarter) : 3;
      const startMonth = (quarter - 1) * 3;
      const endMonth = startMonth + 2;
      startDate = new Date(Date.UTC(targetYear, startMonth, 1, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(targetYear, endMonth + 1, 0, 23, 59, 59, 999));
      chartBuckets = [
        {
          key: `${targetYear}-${String(startMonth + 1).padStart(2, '0')}`,
          label: `Tháng ${startMonth + 1}`,
          gmv: 0,
          cashIn: 0,
          adminTax: 0,
          orders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
        },
        {
          key: `${targetYear}-${String(startMonth + 2).padStart(2, '0')}`,
          label: `Tháng ${startMonth + 2}`,
          gmv: 0,
          cashIn: 0,
          adminTax: 0,
          orders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
        },
        {
          key: `${targetYear}-${String(startMonth + 3).padStart(2, '0')}`,
          label: `Tháng ${startMonth + 3}`,
          gmv: 0,
          cashIn: 0,
          adminTax: 0,
          orders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
        },
      ];
    } else if (period === 'month') {
      const month = query.month
        ? Number(query.month)
        : orderDateRange._max.createdAt &&
          new Date(orderDateRange._max.createdAt).getFullYear() === targetYear
        ? new Date(orderDateRange._max.createdAt).getMonth() + 1
        : 9;
      startDate = new Date(Date.UTC(targetYear, month - 1, 1, 0, 0, 0, 0));
      const lastDay = new Date(Date.UTC(targetYear, month, 0)).getUTCDate();
      endDate = new Date(Date.UTC(targetYear, month - 1, lastDay, 23, 59, 59, 999));

      chartBuckets = Array.from({ length: lastDay }, (_, i) => {
        const dayStr = String(i + 1).padStart(2, '0');
        const monthStr = String(month).padStart(2, '0');
        return {
          key: `${targetYear}-${monthStr}-${dayStr}`,
          label: `${dayStr}/${monthStr}`,
          gmv: 0,
          cashIn: 0,
          adminTax: 0,
          orders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
        };
      });
    } else if (period === 'week') {
      const refDate =
        orderDateRange._max.createdAt &&
        new Date(orderDateRange._max.createdAt).getFullYear() === targetYear
          ? new Date(orderDateRange._max.createdAt)
          : new Date(Date.UTC(targetYear, 8, 20));

      const dayOfWeek = refDate.getUTCDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(refDate);
      monday.setUTCDate(refDate.getUTCDate() + diffToMonday);
      monday.setUTCHours(0, 0, 0, 0);

      startDate = monday;
      endDate = new Date(monday);
      endDate.setUTCDate(monday.getUTCDate() + 6);
      endDate.setUTCHours(23, 59, 59, 999);

      const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      chartBuckets = Array.from({ length: 7 }, (_, i) => {
        const cur = new Date(monday);
        cur.setUTCDate(monday.getUTCDate() + i);
        const curDateStr = cur.toISOString().split('T')[0];
        return {
          key: curDateStr,
          label: `${dayNames[i]} (${cur.getUTCDate()}/${cur.getUTCMonth() + 1})`,
          date: curDateStr,
          gmv: 0,
          cashIn: 0,
          adminTax: 0,
          orders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
        };
      });
    } else if (period === 'custom') {
      const sStr = query.startDate || '2026-09-19';
      const eStr = query.endDate || '2026-09-29';
      const [sYear, sMonth, sDay] = sStr.split('-').map(Number);
      const [eYear, eMonth, eDay] = eStr.split('-').map(Number);

      startDate = new Date(Date.UTC(sYear, sMonth - 1, sDay, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(eYear, eMonth - 1, eDay, 23, 59, 59, 999));

      chartBuckets = [];
      const cur = new Date(startDate);
      while (cur <= endDate) {
        const curDateStr = cur.toISOString().split('T')[0];
        const day = cur.getUTCDate();
        const m = cur.getUTCMonth() + 1;
        chartBuckets.push({
          key: curDateStr,
          label: `${String(day).padStart(2, '0')}/${String(m).padStart(2, '0')}`,
          date: curDateStr,
          gmv: 0,
          cashIn: 0,
          adminTax: 0,
          orders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
        });
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    } else {
      startDate = new Date(Date.UTC(2020, 0, 1, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(2035, 11, 31, 23, 59, 59, 999));
      chartBuckets = availableYears
        .map((y) => ({
          key: `${y}`,
          label: `Năm ${y}`,
          gmv: 0,
          cashIn: 0,
          adminTax: 0,
          orders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
        }))
        .reverse();
    }

    const [
      activeVendorsCount,
      activeClientsCount,
      totalClientsCount,
      totalProductsCount,
      totalSystemOrdersCount,
      newVendorsInPeriod,
    ] = await Promise.all([
      this.prisma.extended.vendor.count({
        where: { deletedAt: null, status: 'active' },
      }),
      this.prisma.extended.client.count({
        where: { deletedAt: null, status: 'active' },
      }),
      this.prisma.extended.client.count({
        where: { deletedAt: null },
      }),
      this.prisma.extended.product.count({ where: { deletedAt: null } }),
      this.prisma.extended.order.count(),
      this.prisma.extended.vendor.count({
        where: {
          deletedAt: null,
          status: 'active',
          approvalStatus: 'approved',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const orders = await this.prisma.extended.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        payment: true,
        details: {
          include: {
            productVariant: {
              include: {
                productColor: {
                  include: {
                    product: {
                      include: {
                        vendor: {
                          select: {
                            id: true,
                            storeName: true,
                            fullName: true,
                          },
                        },
                        category: {
                          select: {
                            id: true,
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    let totalGmv = 0;
    let totalCashIn = 0;
    let orderTaxRevenueTotal = 0;
    let completedOrdersCount = 0;
    let cancelledOrdersCount = 0;
    const bucketMap = new Map(chartBuckets.map((b) => [b.key, b]));

    const vendorMap = new Map<
      string,
      {
        id: string;
        name: string;
        sales: number;
        orderCount: Set<string>;
        itemsSold: number;
        tax: number;
      }
    >();
    const productMap = new Map<
      string,
      {
        id: string;
        name: string;
        category: string;
        quantity: number;
        revenue: number;
      }
    >();

    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      let bucketKey = '';
      if (period === 'year' || period === 'quarter') {
        bucketKey = `${orderDate.getUTCFullYear()}-${String(
          orderDate.getUTCMonth() + 1,
        ).padStart(2, '0')}`;
      } else if (period === 'month' || period === 'week' || period === 'custom') {
        bucketKey = orderDate.toISOString().split('T')[0];
      } else {
        bucketKey = `${orderDate.getUTCFullYear()}`;
      }

      const bucket = bucketMap.get(bucketKey);
      if (bucket) {
        bucket.orders += 1;
      }

      const orderAmount = Number(order.totalAmount || 0);

      let orderCashIn = 0;
      if (order.payment?.status === 'paid') {
        orderCashIn = Number(order.payment.amount || orderAmount);
      } else if (
        order.payment?.method === 'cod' &&
        order.status === OrderStatus.completed
      ) {
        orderCashIn = orderAmount;
      }
      totalCashIn += orderCashIn;
      if (bucket) {
        bucket.cashIn += orderCashIn;
      }

      if (order.status === OrderStatus.completed) {
        completedOrdersCount++;
        totalGmv += orderAmount;

        // Apply tax rate effective at order creation time
        const effectiveTier = this.getFinanceTierForDate(order.createdAt, financeHistory);
        const effectiveTaxRate = effectiveTier.commissionTaxRate;
        const tax = Math.round((orderAmount * effectiveTaxRate) / 100);
        orderTaxRevenueTotal += tax;

        if (bucket) {
          bucket.completedOrders += 1;
          bucket.gmv += orderAmount;
          bucket.adminTax += tax;
        }

        const orderSubtotal = Number(order.subtotalAmount || 0);
        const orderDiscount = Number(order.discountAmount || 0);
        const netRatio =
          orderSubtotal > 0 && orderDiscount > 0
            ? Math.max(0, orderSubtotal - orderDiscount) / orderSubtotal
            : 1;

        for (const detail of order.details) {
          const product = detail.productVariant?.productColor?.product;
          if (product) {
            const itemRevenue = Math.round(
              Number(detail.price || 0) * (detail.quantity || 1) * netRatio,
            );
            const pId = product.id;
            const pItem = productMap.get(pId) || {
              id: pId,
              name: product.name,
              category: product.category?.name || 'Khác',
              quantity: 0,
              revenue: 0,
            };
            pItem.quantity += detail.quantity || 1;
            pItem.revenue += itemRevenue;
            productMap.set(pId, pItem);

            const vendor = product.vendor;
            if (vendor) {
              const vId = vendor.id;
              const vName =
                vendor.storeName || vendor.fullName || 'Gian hàng đối tác';
              const vItem = vendorMap.get(vId) || {
                id: vId,
                name: vName,
                sales: 0,
                orderCount: new Set(),
                itemsSold: 0,
                tax: 0,
              };
              vItem.sales += itemRevenue;
              vItem.orderCount.add(order.id);
              vItem.itemsSold += detail.quantity || 1;
              vItem.tax += Math.round((itemRevenue * effectiveTaxRate) / 100);
              vendorMap.set(vId, vItem);
            }
          }
        }
      } else if (order.status === OrderStatus.cancelled) {
        cancelledOrdersCount++;
        if (bucket) {
          bucket.cancelledOrders += 1;
        }
      }
    }

    const isAllTime = period === 'all';
    const periodVendors = await this.prisma.extended.vendor.findMany({
      where: {
        deletedAt: null,
        status: 'active',
        approvalStatus: 'approved',
        ...(isAllTime ? {} : { createdAt: { gte: startDate, lte: endDate } }),
      },
      select: { id: true, createdAt: true, subscriptionFee: true },
    });

    let vendorFeeRevenue = 0;
    for (const v of periodVendors) {
      const vTier = this.getFinanceTierForDate(v.createdAt, financeHistory);
      const fee = Number(v.subscriptionFee) || vTier.vendorRegistrationFee;
      vendorFeeRevenue += fee;
    }

    const allVendors = await this.prisma.extended.vendor.findMany({
      where: {
        deletedAt: null,
        status: 'active',
        approvalStatus: 'approved',
      },
      select: { id: true, createdAt: true, subscriptionFee: true },
    });
    let allTimeVendorFeeRevenue = 0;
    for (const v of allVendors) {
      const vTier = this.getFinanceTierForDate(v.createdAt, financeHistory);
      const fee = Number(v.subscriptionFee) || vTier.vendorRegistrationFee;
      allTimeVendorFeeRevenue += fee;
    }

    const orderTaxRevenue = orderTaxRevenueTotal;
    const totalAdminRevenue = vendorFeeRevenue + orderTaxRevenue;
    const vendorNetRevenue = totalGmv - orderTaxRevenue;

    const topVendors = Array.from(vendorMap.values())
      .map((v) => ({
        id: v.id,
        name: v.name,
        sales: v.sales,
        orderCount: v.orderCount.size,
        itemsSold: v.itemsSold,
        tax: v.tax,
        netEarnings: v.sales - v.tax,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // [TỐI ƯU THỐNG KÊ ĐA CHIỀU BẰNG SQL GROUP BY - YÊU CẦU 3 & 5]:
    // Tổng hợp bảng thống kê tổng tiền hóa đơn theo:
    // 1. Theo Tháng (1..12 của năm targetYear)
    // 2. Theo Quý (Quý 1..4 của năm targetYear)
    // 3. Theo Năm / Các năm (availableYears)
    // 4. Theo Nhân viên phụ trách (byEmployee - khử trùng lặp orderId bằng UNION CTE)
    // 5. Theo Sản phẩm (byProduct - GROUP BY productId)
    const statisticsTables = await this.buildMultiDimensionStatistics(
      targetYear,
      availableYears,
      startDate,
      endDate,
      orders,
    );

    return {
      period,
      year: targetYear,
      availableYears,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      financeConfig: {
        vendorRegistrationFee: feePerVendor,
        commissionTaxRate: taxRatePercent,
        history: financeHistory,
      },
      summary: {
        totalGmv,
        totalCashIn,
        totalAdminRevenue,
        vendorFeeRevenue,
        allTimeVendorFeeRevenue,
        newVendorsInPeriod,
        orderTaxRevenue,
        vendorNetRevenue,
        totalOrdersCount: orders.length,
        totalSystemOrdersCount,
        completedOrdersCount,
        cancelledOrdersCount,
        conversionRate:
          orders.length > 0
            ? Number(((completedOrdersCount / orders.length) * 100).toFixed(1))
            : 0,
        activeVendorsCount,
        activeClientsCount,
        totalClientsCount,
        totalProductsCount,
      },
      chartData: chartBuckets,
      topVendors,
      topProducts,
      statisticsTables,
    };
  }

  /**
   * [ĐỌC DATABASE & TỐI ƯU BẢNG THỐNG KÊ HÓA ĐƠN - YÊU CẦU 3 & 5]
   * Sử dụng SQL GROUP BY + FILTER ngay tại PostgreSQL để lập 5 bảng thống kê:
   * - byMonth: Tổng tiền hóa đơn theo 12 tháng trong năm
   * - byQuarter: Tổng tiền hóa đơn theo 4 quý trong năm (suy ra O(1) từ 12 tháng, không tốn thêm query)
   * - byYear: Tổng tiền hóa đơn theo năm / qua các năm
   * - byEmployee: Tổng tiền hóa đơn theo nhân viên phụ trách (khử trùng lặp hóa đơn bằng UNION CTE)
   * - byProduct: Tổng tiền hóa đơn theo sản phẩm
   */
  private async buildMultiDimensionStatistics(
    targetYear: number,
    availableYears: number[],
    startDate: Date,
    endDate: Date,
    fallbackOrders: any[] = [],
  ) {
    const yearStart = new Date(Date.UTC(targetYear, 0, 1, 0, 0, 0, 0));
    const yearEnd = new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59, 999));

    const defaultMonths = Array.from({ length: 12 }, (_, idx) => {
      const m = idx + 1;
      return {
        month: m,
        quarter: Math.ceil(m / 3),
        label: `Tháng ${m}/${targetYear}`,
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        subtotalAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        allOrdersAmount: 0,
      };
    });

    try {
      if (typeof this.prisma.extended.$queryRaw === 'function') {
        const [monthRows, yearRows, employeeRows, productRows] =
          await Promise.all([
            // 1. SQL GROUP BY Tháng (của năm targetYear) -> Dùng chung cho cả Bảng Tháng & Bảng Quý
            this.prisma.extended.$queryRaw<
              Array<{
                month: number;
                totalOrders: number;
                completedOrders: number;
                cancelledOrders: number;
                subtotalAmount: number;
                discountAmount: number;
                totalAmount: number;
                allOrdersAmount: number;
              }>
            >`
              SELECT
                EXTRACT(MONTH FROM o."createdAt" AT TIME ZONE 'UTC')::int AS month,
                COUNT(*)::int AS "totalOrders",
                COUNT(*) FILTER (WHERE o.status = 'completed')::int AS "completedOrders",
                COUNT(*) FILTER (WHERE o.status = 'cancelled')::int AS "cancelledOrders",
                COALESCE(SUM(o."subtotalAmount") FILTER (WHERE o.status = 'completed'), 0)::float8 AS "subtotalAmount",
                COALESCE(SUM(o."discountAmount") FILTER (WHERE o.status = 'completed'), 0)::float8 AS "discountAmount",
                COALESCE(SUM(o."totalAmount") FILTER (WHERE o.status = 'completed'), 0)::float8 AS "totalAmount",
                COALESCE(SUM(o."totalAmount"), 0)::float8 AS "allOrdersAmount"
              FROM "Order" o
              WHERE o."createdAt" >= ${yearStart} AND o."createdAt" <= ${yearEnd}
              GROUP BY EXTRACT(MONTH FROM o."createdAt" AT TIME ZONE 'UTC')
              ORDER BY month ASC
            `,

            // 2. SQL GROUP BY Năm (qua tất cả các năm)
            this.prisma.extended.$queryRaw<
              Array<{
                year: number;
                totalOrders: number;
                completedOrders: number;
                cancelledOrders: number;
                subtotalAmount: number;
                discountAmount: number;
                totalAmount: number;
                allOrdersAmount: number;
              }>
            >`
              SELECT
                EXTRACT(YEAR FROM o."createdAt" AT TIME ZONE 'UTC')::int AS year,
                COUNT(*)::int AS "totalOrders",
                COUNT(*) FILTER (WHERE o.status = 'completed')::int AS "completedOrders",
                COUNT(*) FILTER (WHERE o.status = 'cancelled')::int AS "cancelledOrders",
                COALESCE(SUM(o."subtotalAmount") FILTER (WHERE o.status = 'completed'), 0)::float8 AS "subtotalAmount",
                COALESCE(SUM(o."discountAmount") FILTER (WHERE o.status = 'completed'), 0)::float8 AS "discountAmount",
                COALESCE(SUM(o."totalAmount") FILTER (WHERE o.status = 'completed'), 0)::float8 AS "totalAmount",
                COALESCE(SUM(o."totalAmount"), 0)::float8 AS "allOrdersAmount"
              FROM "Order" o
              GROUP BY EXTRACT(YEAR FROM o."createdAt" AT TIME ZONE 'UTC')
              ORDER BY year DESC
            `,

            // 3. SQL GROUP BY Nhân viên (khử trùng lặp (employeeId, orderId) bằng CTE UNION)
            this.prisma.extended.$queryRaw<
              Array<{
                employeeId: string;
                employeeCode: string;
                fullName: string;
                department: string;
                position: string;
                totalOrders: number;
                completedOrders: number;
                cancelledOrders: number;
                subtotalAmount: number;
                discountAmount: number;
                completedAmount: number;
                totalOrderAmount: number;
              }>
            >`
              WITH emp_orders AS (
                SELECT s."carrierId" AS "employeeId", s."orderId" AS "orderId"
                FROM "Shipment" s
                WHERE s."carrierId" IS NOT NULL
                UNION
                SELECT h."employeeId" AS "employeeId", h."orderId" AS "orderId"
                FROM "OrderStatusHistory" h
                WHERE h."employeeId" IS NOT NULL
              )
              SELECT
                e.id AS "employeeId",
                e."employeeCode" AS "employeeCode",
                e."fullName" AS "fullName",
                e.department AS "department",
                e.position AS "position",
                COUNT(o.id)::int AS "totalOrders",
                COUNT(o.id) FILTER (WHERE o.status = 'completed')::int AS "completedOrders",
                COUNT(o.id) FILTER (WHERE o.status = 'cancelled')::int AS "cancelledOrders",
                COALESCE(SUM(o."subtotalAmount") FILTER (WHERE o.status = 'completed'), 0)::float8 AS "subtotalAmount",
                COALESCE(SUM(o."discountAmount") FILTER (WHERE o.status = 'completed'), 0)::float8 AS "discountAmount",
                COALESCE(SUM(o."totalAmount") FILTER (WHERE o.status = 'completed'), 0)::float8 AS "completedAmount",
                COALESCE(SUM(o."totalAmount"), 0)::float8 AS "totalOrderAmount"
              FROM "Employee" e
              LEFT JOIN emp_orders eo ON eo."employeeId" = e.id
              LEFT JOIN "Order" o ON o.id = eo."orderId"
                AND o."createdAt" >= ${startDate}
                AND o."createdAt" <= ${endDate}
              WHERE e."deletedAt" IS NULL
              GROUP BY e.id, e."employeeCode", e."fullName", e.department, e.position
              ORDER BY "completedAmount" DESC, "totalOrders" DESC, e."employeeCode" ASC
            `,

            // 4. SQL GROUP BY Sản phẩm trong kỳ đã chọn
            this.prisma.extended.$queryRaw<
              Array<{
                productId: string;
                productName: string;
                categoryName: string;
                vendorName: string;
                orderCount: number;
                completedOrderCount: number;
                totalQuantity: number;
                allQuantity: number;
                unitPrice: number;
                grossAmount: number;
                netAmount: number;
                allGrossAmount: number;
              }>
            >`
              SELECT
                p.id AS "productId",
                p.name AS "productName",
                COALESCE(c.name, 'Khác') AS "categoryName",
                COALESCE(v."storeName", v."fullName", 'MIVA') AS "vendorName",
                COUNT(DISTINCT o.id)::int AS "orderCount",
                COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'completed')::int AS "completedOrderCount",
                COALESCE(SUM(od.quantity) FILTER (WHERE o.status = 'completed'), 0)::int AS "totalQuantity",
                COALESCE(SUM(od.quantity), 0)::int AS "allQuantity",
                COALESCE(AVG(od.price), 0)::float8 AS "unitPrice",
                COALESCE(SUM(od.price * od.quantity) FILTER (WHERE o.status = 'completed'), 0)::float8 AS "grossAmount",
                COALESCE(
                  SUM(
                    (od.price * od.quantity) *
                    CASE
                      WHEN o."subtotalAmount" > 0 AND o."discountAmount" > 0
                      THEN GREATEST(0, (o."subtotalAmount" - o."discountAmount") / o."subtotalAmount")
                      ELSE 1
                    END
                  ) FILTER (WHERE o.status = 'completed'),
                  0
                )::float8 AS "netAmount",
                COALESCE(SUM(od.price * od.quantity), 0)::float8 AS "allGrossAmount"
              FROM "OrderDetail" od
              INNER JOIN "Order" o ON o.id = od."orderId"
              INNER JOIN "ProductVariant" pv ON pv.id = od."productVariantId"
              INNER JOIN "ProductColor" pc ON pc.id = pv."productColorId"
              INNER JOIN "Product" p ON p.id = pc."productId"
              LEFT JOIN "Category" c ON c.id = p."categoryId"
              LEFT JOIN "Vendor" v ON v.id = p."vendorId"
              WHERE o."createdAt" >= ${startDate} AND o."createdAt" <= ${endDate}
              GROUP BY p.id, p.name, c.name, v."storeName", v."fullName"
              ORDER BY "netAmount" DESC, "totalQuantity" DESC
            `,
          ]);

        for (const r of monthRows) {
          const target = defaultMonths[r.month - 1];
          if (target) {
            target.totalOrders = Number(r.totalOrders || 0);
            target.completedOrders = Number(r.completedOrders || 0);
            target.cancelledOrders = Number(r.cancelledOrders || 0);
            target.subtotalAmount = Math.round(Number(r.subtotalAmount || 0));
            target.discountAmount = Math.round(Number(r.discountAmount || 0));
            target.totalAmount = Math.round(Number(r.totalAmount || 0));
            target.allOrdersAmount = Math.round(Number(r.allOrdersAmount || 0));
          }
        }

        // Suy ra Bảng Quý (Quý 1..4) trực tiếp từ 12 tháng trong O(1), không tốn thêm truy vấn DB
        const byQuarter = [1, 2, 3, 4].map((q) => {
          const monthsInQ = defaultMonths.filter((m) => m.quarter === q);
          return {
            quarter: q,
            label: `Quý ${q}/${targetYear} (T${(q - 1) * 3 + 1} - T${q * 3})`,
            totalOrders: monthsInQ.reduce((s, m) => s + m.totalOrders, 0),
            completedOrders: monthsInQ.reduce((s, m) => s + m.completedOrders, 0),
            cancelledOrders: monthsInQ.reduce((s, m) => s + m.cancelledOrders, 0),
            subtotalAmount: monthsInQ.reduce((s, m) => s + m.subtotalAmount, 0),
            discountAmount: monthsInQ.reduce((s, m) => s + m.discountAmount, 0),
            totalAmount: monthsInQ.reduce((s, m) => s + m.totalAmount, 0),
            allOrdersAmount: monthsInQ.reduce((s, m) => s + m.allOrdersAmount, 0),
          };
        });

        const yearMap = new Map(
          availableYears.map((y) => [
            y,
            {
              year: y,
              label: `Năm ${y}`,
              totalOrders: 0,
              completedOrders: 0,
              cancelledOrders: 0,
              subtotalAmount: 0,
              discountAmount: 0,
              totalAmount: 0,
              allOrdersAmount: 0,
            },
          ]),
        );
        for (const r of yearRows) {
          const y = Number(r.year);
          yearMap.set(y, {
            year: y,
            label: `Năm ${y}`,
            totalOrders: Number(r.totalOrders || 0),
            completedOrders: Number(r.completedOrders || 0),
            cancelledOrders: Number(r.cancelledOrders || 0),
            subtotalAmount: Math.round(Number(r.subtotalAmount || 0)),
            discountAmount: Math.round(Number(r.discountAmount || 0)),
            totalAmount: Math.round(Number(r.totalAmount || 0)),
            allOrdersAmount: Math.round(Number(r.allOrdersAmount || 0)),
          });
        }

        return {
          byMonth: defaultMonths,
          byQuarter,
          byYear: Array.from(yearMap.values()).sort((a, b) => b.year - a.year),
          byEmployee: employeeRows.map((e) => ({
            ...e,
            totalOrders: Number(e.totalOrders || 0),
            completedOrders: Number(e.completedOrders || 0),
            cancelledOrders: Number(e.cancelledOrders || 0),
            subtotalAmount: Math.round(Number(e.subtotalAmount || 0)),
            discountAmount: Math.round(Number(e.discountAmount || 0)),
            completedAmount: Math.round(Number(e.completedAmount || 0)),
            totalOrderAmount: Math.round(Number(e.totalOrderAmount || 0)),
          })),
          byProduct: productRows.map((p) => ({
            ...p,
            orderCount: Number(p.orderCount || 0),
            completedOrderCount: Number(p.completedOrderCount || 0),
            totalQuantity: Number(p.totalQuantity || 0),
            allQuantity: Number(p.allQuantity || 0),
            unitPrice: Math.round(Number(p.unitPrice || 0)),
            grossAmount: Math.round(Number(p.grossAmount || 0)),
            netAmount: Math.round(Number(p.netAmount || 0)),
            allGrossAmount: Math.round(Number(p.allGrossAmount || 0)),
          })),
        };
      }
    } catch (error) {
      this.logger.warn(
        `Fallback sang tổng hợp bộ nhớ cho statisticsTables: ${(error as Error).message}`,
      );
    }

    // Fallback an toàn cho môi trường mock unit test không có $queryRaw
    for (const o of fallbackOrders) {
      const d = new Date(o.createdAt);
      if (d.getUTCFullYear() === targetYear) {
        const mItem = defaultMonths[d.getUTCMonth()];
        if (mItem) {
          mItem.totalOrders += 1;
          mItem.allOrdersAmount += Number(o.totalAmount || 0);
          if (o.status === OrderStatus.completed) {
            mItem.completedOrders += 1;
            mItem.subtotalAmount += Number(o.subtotalAmount || 0);
            mItem.discountAmount += Number(o.discountAmount || 0);
            mItem.totalAmount += Number(o.totalAmount || 0);
          } else if (o.status === OrderStatus.cancelled) {
            mItem.cancelledOrders += 1;
          }
        }
      }
    }
    const byQuarter = [1, 2, 3, 4].map((q) => {
      const monthsInQ = defaultMonths.filter((m) => m.quarter === q);
      return {
        quarter: q,
        label: `Quý ${q}/${targetYear} (T${(q - 1) * 3 + 1} - T${q * 3})`,
        totalOrders: monthsInQ.reduce((s, m) => s + m.totalOrders, 0),
        completedOrders: monthsInQ.reduce((s, m) => s + m.completedOrders, 0),
        cancelledOrders: monthsInQ.reduce((s, m) => s + m.cancelledOrders, 0),
        subtotalAmount: monthsInQ.reduce((s, m) => s + m.subtotalAmount, 0),
        discountAmount: monthsInQ.reduce((s, m) => s + m.discountAmount, 0),
        totalAmount: monthsInQ.reduce((s, m) => s + m.totalAmount, 0),
        allOrdersAmount: monthsInQ.reduce((s, m) => s + m.allOrdersAmount, 0),
      };
    });

    return {
      byMonth: defaultMonths,
      byQuarter,
      byYear: availableYears.map((y) => ({
        year: y,
        label: `Năm ${y}`,
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        subtotalAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        allOrdersAmount: 0,
      })),
      byEmployee: [],
      byProduct: [],
    };
  }

  private increment(
    map: Map<string, { name: string; count: number }>,
    id: string,
    name: string,
    amount = 1,
  ) {
    const item = map.get(id) ?? { name, count: 0 };
    item.count += amount;
    map.set(id, item);
  }

  private top(
    map: Map<string, { name: string; count: number }>,
    limit: number,
  ) {
    return [...map.entries()]
      .map(([id, item]) => ({ id, ...item }))
      .sort((left, right) => right.count - left.count)
      .slice(0, limit);
  }

  private ageGroups(values: Array<Date | null>) {
    const groups = [
      { label: 'under_18', min: 0, max: 17, count: 0 },
      { label: '18_24', min: 18, max: 24, count: 0 },
      { label: '25_34', min: 25, max: 34, count: 0 },
      { label: '35_44', min: 35, max: 44, count: 0 },
      { label: '45_54', min: 45, max: 54, count: 0 },
      { label: '55_plus', min: 55, max: Number.MAX_SAFE_INTEGER, count: 0 },
    ];
    let unknown = 0;
    const today = new Date();
    for (const birthDate of values) {
      if (!birthDate) {
        unknown += 1;
        continue;
      }
      let age = today.getFullYear() - birthDate.getFullYear();
      if (
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
          today.getDate() < birthDate.getDate())
      ) {
        age -= 1;
      }
      const group = groups.find((item) => age >= item.min && age <= item.max);
      if (group) group.count += 1;
    }
    return [
      ...groups.map(({ label, count }) => ({ label, count })),
      { label: 'unknown', count: unknown },
    ];
  }

  async customerDemographicsAndPreferences(query: {
    page?: number;
    itemPerPage?: number;
    search?: string;
    ageGroup?: string;
  }) {
    const { page, itemPerPage, skip } = normalizePagination(query);

    const search = query.search?.trim().toLowerCase();
    const filterAgeGroup = query.ageGroup;
    const now = new Date();

    const groupsConfig = [
      { key: 'under_18', label: 'Dưới 18 tuổi', min: 0, max: 17 },
      { key: '18_24', label: '18 - 24 tuổi', min: 18, max: 24 },
      { key: '25_34', label: '25 - 34 tuổi', min: 25, max: 34 },
      { key: '35_44', label: '35 - 44 tuổi', min: 35, max: 44 },
      { key: '45_54', label: '45 - 54 tuổi', min: 45, max: 54 },
      { key: '55_plus', label: 'Từ 55 tuổi trở lên', min: 55, max: 150 },
    ];

    // 1. Fetch all clients
    const clients = await this.prisma.extended.client.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        gender: true,
        dateOfBirth: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const ageGroups = groupsConfig.map((g) => ({
      ...g,
      count: 0,
      percentage: 0,
      clientIds: new Set<string>(),
    }));

    let totalAgeSum = 0;
    let ageCount = 0;
    const clientAgeMap = new Map<string, { age: number; groupKey: string; groupLabel: string }>();

    for (const c of clients) {
      if (!c.dateOfBirth) continue;
      const dob = new Date(c.dateOfBirth);
      let age = now.getFullYear() - dob.getFullYear();
      if (
        now.getMonth() < dob.getMonth() ||
        (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())
      ) {
        age--;
      }
      totalAgeSum += age;
      ageCount++;

      const grp = ageGroups.find((g) => age >= g.min && age <= g.max);
      if (grp) {
        grp.count++;
        grp.clientIds.add(c.id);
        clientAgeMap.set(c.id, { age, groupKey: grp.key, groupLabel: grp.label });
      }
    }

    const averageAge = ageCount > 0 ? (totalAgeSum / ageCount).toFixed(1) : '0';
    ageGroups.forEach((g) => {
      g.percentage = ageCount > 0 ? Number(((g.count / ageCount) * 100).toFixed(1)) : 0;
    });

    const dominantGroup = [...ageGroups].sort((a, b) => b.count - a.count)[0];

    // Gender distribution
    const genderLabels: Record<string, string> = {
      male: 'Nam',
      female: 'Nữ',
      other: 'Khác',
      prefer_not_to_say: 'Không tiết lộ',
      unknown: 'Chưa cập nhật',
    };
    const genderMap: Record<string, number> = {};
    for (const c of clients) {
      const g = c.gender || 'unknown';
      genderMap[g] = (genderMap[g] || 0) + 1;
    }
    const genderStats = Object.entries(genderMap).map(([gender, count]) => ({
      gender,
      label: genderLabels[gender] || 'Khác',
      count,
      percentage: Number(((count / (clients.length || 1)) * 100).toFixed(1)),
    }));

    // 2. Favorites: ProductFavorite -> Product -> Vendor
    const favorites = await this.prisma.extended.productFavorite.findMany({
      select: {
        clientId: true,
        productId: true,
        product: {
          select: {
            id: true,
            name: true,
            categoryId: true,
            category: { select: { name: true } },
            vendorId: true,
            vendor: { select: { id: true, storeName: true, fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    const vendorFavMap = new Map<string, any>();
    const clientFavCountMap = new Map<string, number>();

    for (const f of favorites) {
      clientFavCountMap.set(f.clientId, (clientFavCountMap.get(f.clientId) || 0) + 1);

      const v = f.product?.vendor;
      if (!v) continue;
      if (!vendorFavMap.has(v.id)) {
        vendorFavMap.set(v.id, {
          vendorId: v.id,
          storeName: v.storeName || v.fullName,
          avatarUrl: v.avatarUrl,
          favoriteCount: 0,
          clients: new Set<string>(),
          topProducts: new Map<string, number>(),
        });
      }
      const item = vendorFavMap.get(v.id);
      item.favoriteCount++;
      item.clients.add(f.clientId);
      const prodCount = (item.topProducts.get(f.product.name) || 0) + 1;
      item.topProducts.set(f.product.name, prodCount);
    }

    const topFavoriteVendors = Array.from(vendorFavMap.values())
      .map((v) => ({
        vendorId: v.vendorId,
        storeName: v.storeName,
        avatarUrl: v.avatarUrl,
        favoriteCount: v.favoriteCount,
        uniqueClientsCount: v.clients.size,
        topProduct: Array.from(v.topProducts.entries()).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '',
      }))
      .sort((a, b) => b.favoriteCount - a.favoriteCount)
      .slice(0, 10);

    // 3. Purchases: OrderDetail -> ProductVariant -> ProductColor -> Product -> Vendor
    const orderDetails = await this.prisma.extended.orderDetail.findMany({
      where: {
        order: {
          status: OrderStatus.completed,
        },
      },
      select: {
        quantity: true,
        price: true,
        order: {
          select: {
            id: true,
            clientId: true,
            status: true,
            subtotalAmount: true,
            discountAmount: true,
          },
        },
        productVariant: {
          select: {
            productColor: {
              select: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    categoryId: true,
                    category: { select: { name: true } },
                    vendorId: true,
                    vendor: { select: { id: true, storeName: true, fullName: true, avatarUrl: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const vendorPurchaseMap = new Map<string, any>();
    const clientPurchaseMap = new Map<string, any>();

    for (const d of orderDetails) {
      const prod = d.productVariant?.productColor?.product;
      const v = prod?.vendor;
      if (!v) continue;

      const clientId = d.order.clientId;
      const orderSubtotal = Number(d.order.subtotalAmount || 0);
      const orderDiscount = Number(d.order.discountAmount || 0);
      const netRatio =
        orderSubtotal > 0 && orderDiscount > 0
          ? Math.max(0, orderSubtotal - orderDiscount) / orderSubtotal
          : 1;
      const lineTotal = Math.round(Number(d.price) * d.quantity * netRatio);

      // Vendor stats
      if (!vendorPurchaseMap.has(v.id)) {
        vendorPurchaseMap.set(v.id, {
          vendorId: v.id,
          storeName: v.storeName || v.fullName,
          avatarUrl: v.avatarUrl,
          ordersSet: new Set<string>(),
          totalUnits: 0,
          totalRevenue: 0,
          buyers: new Set<string>(),
        });
      }
      const vItem = vendorPurchaseMap.get(v.id);
      vItem.ordersSet.add(d.order.id);
      vItem.totalUnits += d.quantity;
      vItem.totalRevenue += lineTotal;
      vItem.buyers.add(clientId);

      // Client stats
      if (!clientPurchaseMap.has(clientId)) {
        clientPurchaseMap.set(clientId, {
          ordersSet: new Set<string>(),
          totalSpent: 0,
          vendorCounts: new Map<string, number>(),
        });
      }
      const cItem = clientPurchaseMap.get(clientId);
      cItem.ordersSet.add(d.order.id);
      cItem.totalSpent += lineTotal;
      const storeName = v.storeName || v.fullName;
      const vCount = (cItem.vendorCounts.get(storeName) || 0) + d.quantity;
      cItem.vendorCounts.set(storeName, vCount);
    }

    const topPurchasedVendors = Array.from(vendorPurchaseMap.values())
      .map((v) => ({
        vendorId: v.vendorId,
        storeName: v.storeName,
        avatarUrl: v.avatarUrl,
        purchaseCount: v.ordersSet.size,
        totalUnits: v.totalUnits,
        totalRevenue: Math.round(v.totalRevenue),
        uniqueBuyersCount: v.buyers.size,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // 4. Cart stats
    const cartItems = await this.prisma.extended.cartItem.findMany({
      select: {
        quantity: true,
        cart: { select: { clientId: true } },
        productVariant: {
          select: {
            productColor: {
              select: {
                product: {
                  select: {
                    vendorId: true,
                    vendor: { select: { id: true, storeName: true, fullName: true, avatarUrl: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const vendorCartMap = new Map<string, any>();
    for (const ci of cartItems) {
      const v = ci.productVariant?.productColor?.product?.vendor;
      if (!v) continue;
      if (!vendorCartMap.has(v.id)) {
        vendorCartMap.set(v.id, {
          vendorId: v.id,
          storeName: v.storeName || v.fullName,
          avatarUrl: v.avatarUrl,
          cartCount: 0,
          totalItems: 0,
          clients: new Set<string>(),
        });
      }
      const item = vendorCartMap.get(v.id);
      item.cartCount++;
      item.totalItems += ci.quantity;
      if (ci.cart?.clientId) item.clients.add(ci.cart.clientId);
    }

    const topCartedVendors = Array.from(vendorCartMap.values())
      .map((v) => ({
        vendorId: v.vendorId,
        storeName: v.storeName,
        avatarUrl: v.avatarUrl,
        cartCount: v.cartCount,
        totalItems: v.totalItems,
        uniqueClientsCount: v.clients.size,
      }))
      .sort((a, b) => b.cartCount - a.cartCount)
      .slice(0, 10);

    // 5. Cross-analysis: Age groups vs Vendor Preferences
    const ageGroupAnalysis = ageGroups.map((grp) => {
      const clientIds = grp.clientIds;
      const vendorFavInGroup = new Map<string, number>();
      const vendorBuyInGroup = new Map<string, number>();
      let totalSpentInGroup = 0;

      for (const f of favorites) {
        if (clientIds.has(f.clientId) && f.product?.vendor) {
          const name = f.product.vendor.storeName || f.product.vendor.fullName;
          vendorFavInGroup.set(name, (vendorFavInGroup.get(name) || 0) + 1);
        }
      }

      for (const d of orderDetails) {
        if (clientIds.has(d.order.clientId) && d.productVariant?.productColor?.product?.vendor) {
          const name = d.productVariant.productColor.product.vendor.storeName || d.productVariant.productColor.product.vendor.fullName;
          const orderSubtotal = Number(d.order.subtotalAmount || 0);
          const orderDiscount = Number(d.order.discountAmount || 0);
          const netRatio =
            orderSubtotal > 0 && orderDiscount > 0
              ? Math.max(0, orderSubtotal - orderDiscount) / orderSubtotal
              : 1;
          vendorBuyInGroup.set(name, (vendorBuyInGroup.get(name) || 0) + d.quantity);
          totalSpentInGroup += Math.round(Number(d.price) * d.quantity * netRatio);
        }
      }

      const topFav = Array.from(vendorFavInGroup.entries()).sort((a, b) => b[1] - a[1])[0];
      const topBuy = Array.from(vendorBuyInGroup.entries()).sort((a, b) => b[1] - a[1])[0];

      return {
        key: grp.key,
        label: grp.label,
        clientCount: grp.count,
        percentage: grp.percentage,
        topFavoriteVendor: topFav ? { name: topFav[0], count: topFav[1] } : null,
        topPurchasedVendor: topBuy ? { name: topBuy[0], count: topBuy[1] } : null,
        totalSpent: Math.round(totalSpentInGroup),
      };
    });

    // 6. Enriched Client List
    let enrichedClients = clients.map((c) => {
      const ageInfo = clientAgeMap.get(c.id);
      const purchaseInfo = clientPurchaseMap.get(c.id);
      const topStorePurchased = purchaseInfo?.vendorCounts
        ? Array.from(purchaseInfo.vendorCounts.entries()).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'Chưa mua'
        : 'Chưa mua';

      return {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        gender: c.gender,
        dateOfBirth: c.dateOfBirth,
        age: ageInfo?.age ?? null,
        ageGroupKey: ageInfo?.groupKey ?? 'unknown',
        ageGroupLabel: ageInfo?.groupLabel ?? 'Không xác định',
        totalOrders: purchaseInfo ? purchaseInfo.ordersSet.size : 0,
        totalSpent: purchaseInfo ? Math.round(purchaseInfo.totalSpent) : 0,
        topStorePurchased,
        favoritesCount: clientFavCountMap.get(c.id) || 0,
        createdAt: c.createdAt,
      };
    });

    if (filterAgeGroup && filterAgeGroup !== 'all') {
      enrichedClients = enrichedClients.filter((c) => c.ageGroupKey === filterAgeGroup);
    }

    if (search) {
      enrichedClients = enrichedClients.filter(
        (c) =>
          c.fullName.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          (c.phone && c.phone.includes(search)) ||
          c.topStorePurchased.toLowerCase().includes(search),
      );
    }

    const totalClientsCount = enrichedClients.length;
    const paginatedClients = enrichedClients.slice(skip, skip + itemPerPage);

    return {
      overview: {
        totalClients: clients.length,
        clientsWithAgeCount: ageCount,
        unknownAgeCount: clients.length - ageCount,
        averageAge,
        dominantGroup: {
          key: dominantGroup && dominantGroup.count > 0 ? dominantGroup.key : '',
          label: dominantGroup && dominantGroup.count > 0 ? dominantGroup.label : 'Chưa xác định',
          count: dominantGroup?.count || 0,
          percentage: dominantGroup?.percentage || 0,
        },
        genderStats,
      },
      ageGroups: ageGroups.map(({ key, label, count, percentage }) => ({ key, label, count, percentage })),
      ageGroupAnalysis,
      topFavoriteVendors,
      topPurchasedVendors,
      topCartedVendors,
      clients: {
        list: paginatedClients,
        page,
        itemPerPage,
        totalItems: totalClientsCount,
        totalPages: Math.ceil(totalClientsCount / itemPerPage) || 1,
      },
    };
  }
}

