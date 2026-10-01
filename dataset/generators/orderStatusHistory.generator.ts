/**
 * OrderStatusHistory generator.
 * Builds a realistic transition log from 'pending' → current status,
 * respecting the valid transition graph from the backend.
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import type { GeneratedOrder } from './orders.generator';
import type { GeneratedUser } from './users.generator';

export interface GeneratedOrderStatusHistory {
  id: string;
  orderId: string;
  actorId: string | null;
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
  admins: GeneratedUser[],
  vendors: GeneratedUser[],
) {
  const data: GeneratedOrderStatusHistory[] = [];
  const staffUsers = [...admins, ...vendors];

  for (const order of orders) {
    const path = STATUS_PATHS[order.status] ?? ['pending'];
    let lastTime = order.createdAt.getTime();

    for (let i = 0; i < path.length; i++) {
      const fromStatus = i === 0 ? null : path[i - 1];
      const toStatus = path[i];

      // First entry is by customer, subsequent by admin/vendor
      const actorId = i === 0
        ? order.userId
        : faker.helpers.arrayElement(staffUsers).id;

      const createdAt = new Date(lastTime + faker.number.int({ min: 60000, max: 86400000 }));
      lastTime = createdAt.getTime();

      data.push({
        id: faker.string.uuid(),
        orderId: order.id,
        actorId,
        fromStatus,
        toStatus,
        note: i === 0 ? null : faker.datatype.boolean(0.3)
          ? `Chuyển trạng thái sang ${toStatus}`
          : null,
        createdAt,
      });
    }
  }

  const sql = sqlSection('OrderStatusHistory', data.length) + buildInsert('OrderStatusHistory', data);
  return { data, sql };
}
