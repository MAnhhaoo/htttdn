/**
 * VendorOrders generator.
 * Groups order items by vendor, creating corresponding VendorOrder entries
 * and linking orderDetail.vendorOrderId.
 */
import { createId } from '@paralleldrive/cuid2';
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import type { GeneratedOrder, GeneratedOrderDetail } from './orders.generator';
import type { GeneratedProduct } from './products.generator';
import type { GeneratedProductColor } from './productColors.generator';
import type { GeneratedProductVariant } from './productVariants.generator';

export interface GeneratedVendorOrder {
  id: string;
  vendorOrderCode: string;
  orderId: string;
  vendorId: string;
  subtotalAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: string; // pending, confirmed, processing, ready_for_pickup, shipping, delivered, cancelled
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function generateVendorOrders(
  orders: GeneratedOrder[],
  orderDetails: GeneratedOrderDetail[],
  products: GeneratedProduct[],
  colors: GeneratedProductColor[],
  variants: GeneratedProductVariant[],
) {
  const vendorOrders: GeneratedVendorOrder[] = [];

  const colorById = new Map(colors.map((c) => [c.id, c]));
  const productById = new Map(products.map((p) => [p.id, p]));
  const variantById = new Map(variants.map((v) => [v.id, v]));

  // Map orderId -> details
  const detailsByOrder = new Map<string, GeneratedOrderDetail[]>();
  for (const d of orderDetails) {
    const list = detailsByOrder.get(d.orderId) || [];
    list.push(d);
    detailsByOrder.set(d.orderId, list);
  }

  const mapOrderStatusToVendorStatus = (status: string): string => {
    switch (status) {
      case 'pending': return 'pending';
      case 'confirmed': return 'confirmed';
      case 'processing': return faker.helpers.arrayElement(['processing', 'ready_for_pickup']);
      case 'shipping': return 'shipping';
      case 'completed': return 'delivered';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  for (const order of orders) {
    const details = detailsByOrder.get(order.id) || [];
    // Group details by vendorId
    const vendorItems = new Map<string, GeneratedOrderDetail[]>();

    for (const detail of details) {
      const variant = variantById.get(detail.productVariantId);
      const color = variant ? colorById.get(variant.productColorId) : undefined;
      const product = color ? productById.get(color.productId) : undefined;
      const vendorId = product?.vendorId;
      if (!vendorId) continue;

      const items = vendorItems.get(vendorId) || [];
      items.push(detail);
      vendorItems.set(vendorId, items);
    }

    for (const [vendorId, items] of vendorItems.entries()) {
      const vendorOrderId = faker.string.uuid();
      const vendorOrderCode = `VO-${createId()}`;

      let subtotal = 0;
      for (const item of items) {
        subtotal += item.price * item.quantity;
        (item as any).vendorOrderId = vendorOrderId; // Link detail to vendorOrder
      }

      const shippingFee = faker.helpers.arrayElement([0, 15000, 20000]);
      const totalAmount = subtotal + shippingFee;
      const voStatus = mapOrderStatusToVendorStatus(order.status);

      vendorOrders.push({
        id: vendorOrderId,
        vendorOrderCode,
        orderId: order.id,
        vendorId,
        subtotalAmount: subtotal,
        shippingFee,
        totalAmount,
        status: voStatus,
        notes: null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      });
    }
  }

  const sql = vendorOrders.length > 0
    ? sqlSection('Vendor Orders', vendorOrders.length) + buildInsert('VendorOrder', vendorOrders)
    : '';

  return { data: vendorOrders, sql };
}
