import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma, UserRole } from '@prisma/client';

import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CustomerReportQueryDto } from './dto/customer-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async customerReport(user: UserInfo, query: CustomerReportQueryDto) {
    const vendorId = user.role === UserRole.vendor ? user.userID : undefined;
    const dateWhere = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    };
    const orderScope: Prisma.OrderWhereInput = {
      status: OrderStatus.completed,
      ...(Object.keys(dateWhere).length ? { createdAt: dateWhere } : {}),
      ...(vendorId
        ? {
            details: {
              some: {
                productVariant: {
                  productColor: { product: { vendorId } },
                },
              },
            },
          }
        : {}),
    };
    const buyers = await this.prisma.order.findMany({
      where: orderScope,
      select: { userId: true },
      distinct: ['userId'],
    });
    const customerIds = buyers.map((buyer) => buyer.userId);
    const customers = await this.prisma.user.findMany({
      where: {
        role: UserRole.customer,
        deletedAt: null,
        ...(vendorId ? { id: { in: customerIds } } : {}),
      },
      select: { id: true, dateOfBirth: true, gender: true },
    });
    const reportCustomerIds = customers.map((customer) => customer.id);
    const favorites = await this.prisma.productFavorite.findMany({
      where: {
        userId: { in: reportCustomerIds },
        ...(Object.keys(dateWhere).length ? { createdAt: dateWhere } : {}),
        ...(vendorId ? { product: { vendorId } } : {}),
      },
      select: {
        product: {
          select: {
            id: true,
            name: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });
    const details = await this.prisma.orderDetail.findMany({
      where: {
        order: orderScope,
        ...(vendorId
          ? {
              productVariant: {
                productColor: { product: { vendorId } },
              },
            }
          : {}),
      },
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
                    category: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

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
        ).map(([gender, count]) => ({ gender, count })),
      },
      interests: {
        favoriteProducts: this.top(favoriteProducts, query.limit),
        favoriteCategories: this.top(favoriteCategories, query.limit),
        purchasedProducts: this.top(purchasedProducts, query.limit),
        purchasedCategories: this.top(purchasedCategories, query.limit),
      },
      commerce: {
        completedOrderCount: orderCount,
        revenue: revenue.toString(),
        averageOrderValue: orderCount
          ? revenue.div(orderCount).toDecimalPlaces(2).toString()
          : '0',
      },
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
}
