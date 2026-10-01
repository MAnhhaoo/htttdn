/**
 * Voucher generator — platform vouchers (from admins) + vendor vouchers.
 * Respects the business rule: vendor vouchers must have productIds,
 * platform vouchers must NOT.
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { CONFIG } from '../config/dataset.config';
import type { GeneratedUser } from './users.generator';

export interface GeneratedVoucher {
  id: string;
  userId: string;
  code: string;
  name: string;
  scope: 'platform' | 'vendor';
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  quantity: number;
  usedQuantity: number;
  perUserLimit: number;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'inactive' | 'expired';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
}

export function generateVouchers(
  admins: GeneratedUser[],
  vendors: GeneratedUser[],
) {
  const data: GeneratedVoucher[] = [];
  const usedCodes = new Set<string>();

  function uniqueCode(prefix: string): string {
    let code: string;
    do {
      code = `${prefix}${faker.string.alphanumeric(6).toUpperCase()}`;
    } while (usedCodes.has(code));
    usedCodes.add(code);
    return code;
  }

  // ── Platform vouchers (created by admins) ──
  for (let i = 0; i < CONFIG.counts.platformVouchers; i++) {
    const admin = faker.helpers.arrayElement(admins);
    const isPercentage = faker.datatype.boolean(0.6);
    const startDate = faker.date.between({
      from: new Date('2025-06-01'),
      to: new Date('2026-06-01'),
    });
    const endDate = new Date(startDate.getTime() + faker.number.int({ min: 7, max: 90 }) * 86400000);
    const quantity = faker.number.int({ min: 50, max: 500 });
    const usedQty = faker.number.int({ min: 0, max: Math.floor(quantity * 0.4) });

    data.push({
      id: faker.string.uuid(),
      userId: admin.id,
      code: uniqueCode('MIVA'),
      name: `Giảm giá toàn sàn ${i + 1}`,
      scope: 'platform',
      discountType: isPercentage ? 'percentage' : 'fixed_amount',
      discountValue: isPercentage
        ? faker.helpers.arrayElement([5, 10, 15, 20, 25, 30])
        : faker.helpers.arrayElement([20000, 30000, 50000, 100000]),
      minOrderAmount: faker.datatype.boolean(0.7)
        ? faker.helpers.arrayElement([100000, 200000, 300000, 500000])
        : null,
      maxDiscountAmount: isPercentage
        ? faker.helpers.arrayElement([50000, 100000, 200000, 300000])
        : null,
      quantity,
      usedQuantity: usedQty,
      perUserLimit: faker.helpers.arrayElement([1, 2, 3]),
      startDate,
      endDate,
      status: faker.helpers.weightedArrayElement([
        { value: 'active' as const, weight: 50 },
        { value: 'draft' as const, weight: 20 },
        { value: 'expired' as const, weight: 20 },
        { value: 'inactive' as const, weight: 10 },
      ]),
      createdAt: startDate,
      updatedAt: startDate,
      deletedAt: null,
    });
  }

  // ── Vendor vouchers ──
  for (let i = 0; i < CONFIG.counts.vendorVouchers; i++) {
    const vendor = faker.helpers.arrayElement(vendors);
    const isPercentage = faker.datatype.boolean(0.5);
    const startDate = faker.date.between({
      from: new Date('2025-06-01'),
      to: new Date('2026-08-01'),
    });
    const endDate = new Date(startDate.getTime() + faker.number.int({ min: 7, max: 60 }) * 86400000);
    const quantity = faker.number.int({ min: 20, max: 200 });
    const usedQty = faker.number.int({ min: 0, max: Math.floor(quantity * 0.3) });

    data.push({
      id: faker.string.uuid(),
      userId: vendor.id,
      code: uniqueCode('VD'),
      name: `Khuyến mãi cửa hàng ${vendor.fullName.substring(0, 20)}`,
      scope: 'vendor',
      discountType: isPercentage ? 'percentage' : 'fixed_amount',
      discountValue: isPercentage
        ? faker.helpers.arrayElement([5, 10, 15, 20])
        : faker.helpers.arrayElement([10000, 20000, 30000, 50000]),
      minOrderAmount: faker.datatype.boolean(0.5)
        ? faker.helpers.arrayElement([100000, 200000, 300000])
        : null,
      maxDiscountAmount: isPercentage
        ? faker.helpers.arrayElement([30000, 50000, 100000])
        : null,
      quantity,
      usedQuantity: usedQty,
      perUserLimit: faker.helpers.arrayElement([1, 2]),
      startDate,
      endDate,
      status: faker.helpers.weightedArrayElement([
        { value: 'active' as const, weight: 50 },
        { value: 'draft' as const, weight: 25 },
        { value: 'expired' as const, weight: 15 },
        { value: 'inactive' as const, weight: 10 },
      ]),
      createdAt: startDate,
      updatedAt: startDate,
      deletedAt: null,
    });
  }

  const sql = sqlSection('Vouchers', data.length) + buildInsert('Voucher', data);
  return { data, sql };
}
