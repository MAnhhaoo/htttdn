/**
 * Reviews generator.
 * Reviews can only exist for completed orders (business rule).
 * Each review references one orderDetail, and orderDetail→review is 1:1.
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { CONFIG } from '../config/dataset.config';
import { REVIEW_TEMPLATES, RATING_WEIGHTS } from '../data/reviewTemplates';
import type { GeneratedOrder, GeneratedOrderDetail } from './orders.generator';
import type { GeneratedProductColor } from './productColors.generator';

export interface GeneratedReview {
  id: string;
  userId: string;
  productId: string;
  orderDetailId: string;
  content: string | null;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
}

export function generateReviews(
  orders: GeneratedOrder[],
  orderDetails: GeneratedOrderDetail[],
  colors: GeneratedProductColor[],
) {
  const data: GeneratedReview[] = [];

  // Build lookups
  const colorById = new Map(colors.map((c) => [c.id, c]));
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const detailsByOrder = new Map<string, GeneratedOrderDetail[]>();
  for (const d of orderDetails) {
    const list = detailsByOrder.get(d.orderId) ?? [];
    list.push(d);
    detailsByOrder.set(d.orderId, list);
  }

  // Need to resolve variant → productColor → productId
  // Since we don't have the full variant→color lookup here,
  // we need to pass colors and build a productColorId→productId map
  const colorProductMap = new Map<string, string>();
  for (const c of colors) {
    colorProductMap.set(c.id, c.productId);
  }

  // Collect all eligible order details (from completed orders)
  const eligibleDetails: Array<{ detail: GeneratedOrderDetail; userId: string }> = [];
  for (const order of completedOrders) {
    const details = detailsByOrder.get(order.id) ?? [];
    for (const d of details) {
      eligibleDetails.push({ detail: d, userId: order.userId });
    }
  }

  // Randomly pick a subset to review
  const reviewCount = Math.min(CONFIG.counts.reviewsTarget, eligibleDetails.length);
  const toReview = faker.helpers.arrayElements(eligibleDetails, reviewCount);

  // Track used orderDetailIds (unique constraint)
  const usedOrderDetailIds = new Set<string>();

  for (const { detail, userId } of toReview) {
    if (usedOrderDetailIds.has(detail.id)) continue;
    usedOrderDetailIds.add(detail.id);

    // Pick rating using weighted distribution
    const rating = pickWeightedRating();
    const templates = REVIEW_TEMPLATES[rating] ?? REVIEW_TEMPLATES[3];
    const content = faker.helpers.arrayElement(templates);

    // We need productId — we'll use the productName from snapshot to find it
    // But since we need a real productId FK, let's use a workaround:
    // Store productId resolution in the generate.ts orchestrator
    // For now, we leave productId as a placeholder that generate.ts will resolve

    data.push({
      id: faker.string.uuid(),
      userId,
      productId: '', // Will be resolved in generate.ts
      orderDetailId: detail.id,
      content: faker.datatype.boolean(0.85) ? content : null,
      rating,
      createdAt: new Date(Date.now()), // Will be set properly in generate.ts
      updatedAt: new Date(Date.now()),
      deletedAt: null,
    });
  }

  return { data };
}

function pickWeightedRating(): number {
  const rand = faker.number.float({ min: 0, max: 1 });
  let cumulative = 0;
  for (let i = 0; i < RATING_WEIGHTS.length; i++) {
    cumulative += RATING_WEIGHTS[i];
    if (rand <= cumulative) return i + 1;
  }
  return 5;
}
