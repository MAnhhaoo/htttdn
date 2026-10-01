/**
 * Orders, OrderDetails, and Payments generator.
 *
 * Business rules:
 *  - Each order belongs to a customer
 *  - Each order has 1–4 order details (unique variant per order)
 *  - Each order has exactly 1 payment
 *  - OrderDetail snapshots product name, color, size, image
 *  - Order totals are computed from item prices × quantities
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { CONFIG } from '../config/dataset.config';
import { createId } from '@paralleldrive/cuid2';
import type { GeneratedUser } from './users.generator';
import type { GeneratedProduct } from './products.generator';
import type { GeneratedProductColor } from './productColors.generator';
import type { GeneratedProductVariant } from './productVariants.generator';

export interface GeneratedOrder {
  id: string;
  orderCode: string;
  userId: string;
  subtotalAmount: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: string;
  notes: string | null;
  receiverName: string | null;
  receiverPhone: string | null;
  shippingAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt: Date | null;
}

export interface GeneratedOrderDetail {
  id: string;
  orderId: string;
  productVariantId: string;
  quantity: number;
  price: number;
  productName: string | null;
  colorName: string | null;
  sizeName: string | null;
  imageUrl: string | null;
}

export interface GeneratedPayment {
  id: string;
  orderId: string;
  method: string;
  amount: number;
  status: string;
  transactionCode: string | null;
  gateway: string | null;
  gatewayResponse: null;
  paidAt: Date | null;
  failedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function generateOrders(
  customers: GeneratedUser[],
  products: GeneratedProduct[],
  colors: GeneratedProductColor[],
  variants: GeneratedProductVariant[],
) {
  const orders: GeneratedOrder[] = [];
  const orderDetails: GeneratedOrderDetail[] = [];
  const payments: GeneratedPayment[] = [];

  if (variants.length === 0 || customers.length === 0) {
    return { orders, orderDetails, payments, sql: '' };
  }

  // Build lookups
  const colorById = new Map(colors.map((c) => [c.id, c]));
  const productById = new Map(products.map((p) => [p.id, p]));

  // ── Determine status for each order ──
  const statuses = distributeStatuses(CONFIG.counts.orders, CONFIG.orderStatusDistribution);

  const VN_STREETS = [
    'Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng',
    'Điện Biên Phủ', 'Nguyễn Trãi', 'Lý Thường Kiệt', 'Bà Triệu',
    'Phạm Ngũ Lão', 'Lê Duẩn', 'Hoàng Diệu',
  ];
  const VN_CITIES = [
    'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  ];

  for (let i = 0; i < CONFIG.counts.orders; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const status = statuses[i];

    const created = faker.date.between({
      from: new Date('2025-06-01'),
      to: CONFIG.dateRange.end,
    });

    const orderId = faker.string.uuid();
    const orderCode = createId();

    // ── Order details (1–4 unique variants) ──
    const itemCount = faker.number.int({
      min: CONFIG.counts.orderItemsPerOrder.min,
      max: CONFIG.counts.orderItemsPerOrder.max,
    });
    const selectedVariants = faker.helpers.arrayElements(
      variants,
      Math.min(itemCount, variants.length),
    );

    let subtotal = 0;
    const usedVariantIds = new Set<string>();

    for (const variant of selectedVariants) {
      if (usedVariantIds.has(variant.id)) continue; // unique(orderId, productVariantId)
      usedVariantIds.add(variant.id);

      const qty = faker.number.int({ min: 1, max: 3 });
      const lineTotal = variant.price * qty;
      subtotal += lineTotal;

      // Resolve snapshot info
      const color = colorById.get(variant.productColorId);
      const product = color ? productById.get(color.productId) : undefined;

      orderDetails.push({
        id: faker.string.uuid(),
        orderId,
        productVariantId: variant.id,
        quantity: qty,
        price: variant.price,
        productName: product?.name ?? null,
        colorName: color?.color ?? null,
        sizeName: variant.size,
        imageUrl: color?.imageUrls[0] ?? null,
      });
    }

    const shippingFee = faker.helpers.arrayElement([0, 15000, 25000, 30000, 40000]);
    const discountAmount = 0; // will be filled if voucher applied later
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    const receiverName = customer.fullName;
    const receiverPhone = customer.phone ?? `090${faker.string.numeric(7)}`;
    const receiverAddr = `${faker.number.int({ min: 1, max: 200 })} ${faker.helpers.arrayElement(VN_STREETS)}, ${faker.helpers.arrayElement(VN_CITIES)}`;

    orders.push({
      id: orderId,
      orderCode,
      userId: customer.id,
      subtotalAmount: subtotal,
      discountAmount,
      shippingFee,
      totalAmount,
      status,
      notes: faker.datatype.boolean(0.2) ? faker.lorem.sentence() : null,
      receiverName,
      receiverPhone,
      shippingAddress: receiverAddr,
      createdAt: created,
      updatedAt: created,
      cancelledAt: status === 'cancelled' ? new Date(created.getTime() + 3600000) : null,
    });

    // ── Payment ──
    const payMethod = pickWeighted(CONFIG.paymentMethodDistribution);
    const paymentStatus = derivePaymentStatus(status, payMethod);

    payments.push({
      id: faker.string.uuid(),
      orderId,
      method: payMethod,
      amount: totalAmount,
      status: paymentStatus,
      transactionCode: payMethod !== 'cod'
        ? `TXN${faker.string.alphanumeric(16).toUpperCase()}`
        : null,
      gateway: payMethod !== 'cod' ? payMethod : null,
      gatewayResponse: null,
      paidAt: paymentStatus === 'paid'
        ? new Date(created.getTime() + faker.number.int({ min: 60000, max: 86400000 }))
        : null,
      failedAt: paymentStatus === 'failed'
        ? new Date(created.getTime() + faker.number.int({ min: 60000, max: 3600000 }))
        : null,
      createdAt: created,
      updatedAt: created,
    });
  }

  // Ensure transactionCode uniqueness
  const seenTxn = new Set<string>();
  for (const p of payments) {
    if (p.transactionCode) {
      while (seenTxn.has(p.transactionCode!)) {
        p.transactionCode = `TXN${faker.string.alphanumeric(16).toUpperCase()}`;
      }
      seenTxn.add(p.transactionCode);
    }
  }

  const sql =
    sqlSection('Orders', orders.length) + buildInsert('Order', orders) + '\n' +
    sqlSection('OrderDetails', orderDetails.length) + buildInsert('OrderDetail', orderDetails) + '\n' +
    sqlSection('Payments', payments.length) + buildInsert('Payment', payments);

  return { orders, orderDetails, payments, sql };
}

// ── Helpers ──────────────────────────────────────────────────────

function distributeStatuses(count: number, distribution: Record<string, number>): string[] {
  const result: string[] = [];
  for (const [status, ratio] of Object.entries(distribution)) {
    const n = Math.round(count * ratio);
    for (let i = 0; i < n; i++) result.push(status);
  }
  // Fill or trim to exact count
  while (result.length < count) result.push('completed');
  while (result.length > count) result.pop();
  // Shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = faker.number.int({ min: 0, max: i });
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickWeighted(distribution: Record<string, number>): string {
  const entries = Object.entries(distribution);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let rand = faker.number.float({ min: 0, max: total });
  for (const [key, weight] of entries) {
    rand -= weight;
    if (rand <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function derivePaymentStatus(orderStatus: string, payMethod: string): string {
  if (orderStatus === 'cancelled') return 'cancelled';
  if (orderStatus === 'completed') {
    return payMethod === 'cod' ? 'paid' : 'paid';
  }
  if (['shipping', 'processing', 'confirmed'].includes(orderStatus)) {
    return payMethod === 'cod' ? 'pending' : 'paid';
  }
  // pending order
  return 'pending';
}
