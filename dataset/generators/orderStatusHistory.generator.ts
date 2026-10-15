/**
 * OrderStatusHistory generator.
 * Builds a realistic transition log from 'pending' → current status,
 * respecting the valid transition graph and attributing actors (Client, Employee, Vendor, Admin).
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import type { GeneratedOrder } from './orders.generator';
import type { GeneratedAdmin, GeneratedVendor, GeneratedClient } from './users.generator';
import type { GeneratedEmployee } from './employees.generator';

export interface GeneratedOrderStatusHistory {
  id: string;
  orderId: string;
  adminId: string | null;
  clientId: string | null;
  vendorId: string | null;
  employeeId: string | null;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: Date;
}

// Valid transition path from pending to each terminal status
const STATUS_PATHS: Record<string, string[]> = {
  pending: ['pending'],
  confirmed: ['pending', 'confirmed'],
  processing: ['pending', 'confirmed', 'processing'],
  shipping: ['pending', 'confirmed', 'processing', 'shipping'],
  completed: ['pending', 'confirmed', 'processing', 'shipping', 'completed'],
  cancelled: ['pending', 'cancelled'], // can cancel from pending
};

export function generateOrderStatusHistory(
  orders: GeneratedOrder[],
  admins: GeneratedAdmin[],
  vendors: GeneratedVendor[],
  clients: GeneratedClient[],
  employees?: GeneratedEmployee[],
) {
  const data: GeneratedOrderStatusHistory[] = [];

  const activeEmployees = employees?.filter((e) => e.status === 'active') || [];

  for (const order of orders) {
    const path = STATUS_PATHS[order.status] ?? ['pending'];
    let lastTime = order.createdAt.getTime();

    for (let i = 0; i < path.length; i++) {
      const fromStatus = i === 0 ? null : path[i - 1];
      const toStatus = path[i];

      let adminId: string | null = null;
      let clientId: string | null = null;
      let vendorId: string | null = null;
      let employeeId: string | null = null;

      // First entry is by customer
      if (i === 0) {
        clientId = order.clientId;
      } else if (toStatus === 'confirmed' || toStatus === 'shipping') {
        // Operational steps handled by employee (or admin)
        if (activeEmployees.length > 0 && faker.datatype.boolean(0.75)) {
          employeeId = faker.helpers.arrayElement(activeEmployees).id;
        } else {
          adminId = faker.helpers.arrayElement(admins).id;
        }
      } else if (toStatus === 'processing') {
        // Preparation handled by vendor
        vendorId = faker.helpers.arrayElement(vendors).id;
      } else if (toStatus === 'completed') {
        // Completion confirmed by delivery employee or client
        if (activeEmployees.length > 0 && faker.datatype.boolean(0.7)) {
          employeeId = faker.helpers.arrayElement(activeEmployees).id;
        } else {
          clientId = order.clientId;
        }
      } else if (toStatus === 'cancelled') {
        if (faker.datatype.boolean(0.6)) {
          clientId = order.clientId;
        } else {
          adminId = faker.helpers.arrayElement(admins).id;
        }
      } else {
        adminId = faker.helpers.arrayElement(admins).id;
      }

      const createdAt = new Date(lastTime + faker.number.int({ min: 60000, max: 86400000 }));
      lastTime = createdAt.getTime();

      let noteText: string | null = null;
      if (toStatus === 'confirmed') noteText = 'Nhân viên vận hành đã xác nhận đơn hàng';
      else if (toStatus === 'processing') noteText = 'Vendor đã tiếp nhận và đang đóng gói sản phẩm';
      else if (toStatus === 'shipping') noteText = 'Đơn hàng đã bàn giao cho đơn vị vận chuyển';
      else if (toStatus === 'completed') noteText = 'Giao hàng thành công cho người nhận';
      else if (toStatus === 'cancelled') noteText = 'Đơn hàng đã bị hủy';

      data.push({
        id: faker.string.uuid(),
        orderId: order.id,
        adminId,
        clientId,
        vendorId,
        employeeId,
        fromStatus,
        toStatus,
        note: noteText,
        createdAt,
      });
    }
  }

  const sql = sqlSection('OrderStatusHistory', data.length) + buildInsert('OrderStatusHistory', data);
  return { data, sql };
}
