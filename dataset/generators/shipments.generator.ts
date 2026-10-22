/**
 * Shipments and ShipmentEvents generator.
 * Associates orders/vendorOrders with carrier employees and produces realistic tracking events.
 */
import { createId } from '@paralleldrive/cuid2';
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import type { GeneratedOrder } from './orders.generator';
import type { GeneratedVendorOrder } from './vendorOrders.generator';
import type { GeneratedEmployee } from './employees.generator';
import type { GeneratedVendor } from './users.generator';

export interface GeneratedShipment {
  id: string;
  trackingNumber: string;
  orderId: string;
  vendorOrderId: string | null;
  carrierId: string | null;
  carrierType: string;
  status: string; // pending, assigned, picking_up, in_transit, out_for_delivery, delivered, failed, returned
  pickupAddress: string | null;
  shippingAddress: string | null;
  receiverName: string | null;
  receiverPhone: string | null;
  estimatedDelivery: Date | null;
  deliveredAt: Date | null;
  failedReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedShipmentEvent {
  id: string;
  shipmentId: string;
  status: string;
  location: string | null;
  description: string | null;
  actorRole: string | null;
  actorId: string | null;
  createdAt: Date;
}

export function generateShipments(
  orders: GeneratedOrder[],
  vendorOrders: GeneratedVendorOrder[],
  employees: GeneratedEmployee[],
  vendors: GeneratedVendor[],
) {
  const shipments: GeneratedShipment[] = [];
  const events: GeneratedShipmentEvent[] = [];

  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  const orderById = new Map(orders.map((o) => [o.id, o]));

  // Carriers (bưu tá): BẮT BUỘC là nhân viên thuộc Phòng Vận chuyển & Giao nhận (5 nhân sự thật EMP016 - EMP020)
  const shippingEmployees = employees.filter(
    (e) => e.status === 'active' && e.department === 'Phòng Vận chuyển & Giao nhận',
  );
  const carrierPool = shippingEmployees.length > 0 ? shippingEmployees : employees.filter((e) => e.status === 'active');

  const mapStatusToShipmentStatus = (orderStatus: string): string => {
    switch (orderStatus) {
      case 'pending': return 'pending';
      case 'confirmed': return 'assigned';
      case 'processing': return 'picking_up';
      case 'shipping': return faker.helpers.arrayElement(['in_transit', 'out_for_delivery']);
      case 'completed': return 'delivered';
      case 'cancelled': return faker.helpers.arrayElement(['failed', 'returned']);
      default: return 'pending';
    }
  };

  // Generate a shipment for each vendorOrder
  for (const vo of vendorOrders) {
    const order = orderById.get(vo.orderId);
    if (!order) continue;

    const vendor = vendorById.get(vo.vendorId);
    const carrier = carrierPool.length > 0 ? faker.helpers.arrayElement(carrierPool) : null;
    const shipmentStatus = mapStatusToShipmentStatus(order.status);
    const shipmentId = faker.string.uuid();
    const trackingNumber = `VNPOST-${faker.string.alphanumeric(8).toUpperCase()}`;

    const estDate = new Date(order.createdAt.getTime() + 86400000 * 3);
    const deliveredDate = shipmentStatus === 'delivered' ? new Date(order.createdAt.getTime() + 86400000 * 2.5) : null;

    const pickupAddress = vendor?.storeName ? `Kho hàng ${vendor.storeName}, ${vendor.phone || '0900000000'}` : 'Kho hàng trung tâm MIVA';

    shipments.push({
      id: shipmentId,
      trackingNumber,
      orderId: order.id,
      vendorOrderId: vo.id,
      carrierId: carrier?.id ?? null,
      carrierType: 'employee',
      status: shipmentStatus,
      pickupAddress,
      shippingAddress: order.shippingAddress,
      receiverName: order.receiverName,
      receiverPhone: order.receiverPhone,
      estimatedDelivery: estDate,
      deliveredAt: deliveredDate,
      failedReason: shipmentStatus === 'failed' ? 'Khách hàng hẹn lại ngày giao' : null,
      notes: carrier
        ? `Bưu tá phụ trách: ${carrier.fullName} (${carrier.employeeCode}) - ${carrier.department}`
        : 'Kiện hàng đã được điều phối và tạo vận đơn nội bộ',
      createdAt: order.createdAt,
      updatedAt: deliveredDate || order.updatedAt,
    });

    // Tracking events
    const eventTimes = [
      { status: 'assigned', desc: `Đã phân công bưu tá ${carrier?.fullName || ''} (Phòng Vận chuyển & Giao nhận) phụ trách lấy hàng`, delayHrs: 1 },
      { status: 'picking_up', desc: `Bưu tá ${carrier?.fullName || ''} đang đến lấy hàng tại kho Vendor`, delayHrs: 4 },
      { status: 'in_transit', desc: 'Đang trung chuyển qua bưu cục MIVA Express', delayHrs: 14 },
      { status: 'out_for_delivery', desc: `Bưu tá ${carrier?.fullName || ''} đang trên đường giao hàng đến địa chỉ người nhận`, delayHrs: 28 },
      { status: 'delivered', desc: `Bưu tá ${carrier?.fullName || ''} đã giao hàng thành công và người nhận ký xác nhận`, delayHrs: 32 },
    ];

    const currentIdx = ['pending', 'assigned', 'picking_up', 'in_transit', 'out_for_delivery', 'delivered'].indexOf(shipmentStatus);

    for (let i = 0; i < eventTimes.length; i++) {
      if (currentIdx !== -1 && i > currentIdx - 1 && shipmentStatus !== 'delivered') {
        break;
      }
      const ev = eventTimes[i];
      const evTime = new Date(order.createdAt.getTime() + 3600000 * ev.delayHrs);

      events.push({
        id: faker.string.uuid(),
        shipmentId,
        status: ev.status,
        location: order.shippingAddress?.split(',').slice(-1)[0]?.trim() || 'TP. Hồ Chí Minh',
        description: ev.desc,
        actorRole: 'employee',
        actorId: carrier?.id ?? null,
        createdAt: evTime,
      });

      if (ev.status === shipmentStatus) break;
    }
  }

  const shipmentsSql = shipments.length > 0
    ? sqlSection('Shipments', shipments.length) + buildInsert('Shipment', shipments)
    : '';

  const eventsSql = events.length > 0
    ? sqlSection('Shipment Events', events.length) + buildInsert('ShipmentEvent', events)
    : '';

  return { shipments, events, sql: shipmentsSql + '\n' + eventsSql };
}
