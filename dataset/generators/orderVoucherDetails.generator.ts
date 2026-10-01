/**
 * VoucherDetail (order-linked) generator.
 * Applies vouchers to ~25% of orders.
 * Respects CHECK constraint: orderId set, productId null.
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import type { GeneratedOrder } from './orders.generator';
import type { GeneratedVoucher } from './vouchers.generator';

export interface GeneratedOrderVoucherDetail {
  id: string;
  voucherId: string;
  productId: null;
  orderId: string;
  eligibleAmount: number;
  discountAmount: number;
  sequence: number;
  createdAt: Date;
  reversedAt: Date | null;
}

export function generateOrderVoucherDetails(
  orders: GeneratedOrder[],
  vouchers: GeneratedVoucher[],
) {
  const data: GeneratedOrderVoucherDetail[] = [];

  // Only active vouchers can be applied
  const activeVouchers = vouchers.filter((v) => v.status === 'active');
  if (activeVouchers.length === 0) return { data, sql: '' };

  // Apply voucher to ~25% of non-cancelled orders
  const eligibleOrders = orders.filter((o) => o.status !== 'cancelled');
  const ordersWithVouchers = faker.helpers.arrayElements(
    eligibleOrders,
    Math.min(Math.floor(eligibleOrders.length * 0.25), eligibleOrders.length),
  );

  // Track unique (voucherId, orderId) and (orderId, sequence)
  const usedVoucherOrder = new Set<string>();
  const usedOrderSequence = new Set<string>();

  for (const order of ordersWithVouchers) {
    const voucher = faker.helpers.arrayElement(activeVouchers);
    const pairKey = `${voucher.id}:${order.id}`;
    const seqKey = `${order.id}:1`;

    if (usedVoucherOrder.has(pairKey) || usedOrderSequence.has(seqKey)) continue;
    usedVoucherOrder.add(pairKey);
    usedOrderSequence.add(seqKey);

    // Calculate discount
    let discountAmount: number;
    if (voucher.discountType === 'percentage') {
      discountAmount = Math.round(order.subtotalAmount * voucher.discountValue / 100);
      if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
        discountAmount = voucher.maxDiscountAmount;
      }
    } else {
      discountAmount = voucher.discountValue;
    }
    discountAmount = Math.min(discountAmount, order.subtotalAmount);

    const isCancelled = order.status === 'cancelled';
    data.push({
      id: faker.string.uuid(),
      voucherId: voucher.id,
      productId: null,
      orderId: order.id,
      eligibleAmount: order.subtotalAmount,
      discountAmount,
      sequence: 1,
      createdAt: order.createdAt,
      reversedAt: isCancelled ? new Date(order.createdAt.getTime() + 3600000) : null,
    });
  }

  const sql = data.length > 0
    ? sqlSection('VoucherDetails (order-linked)', data.length) + buildInsert('VoucherDetail', data)
    : '';
  return { data, sql };
}
