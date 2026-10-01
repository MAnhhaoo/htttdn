/**
 * VoucherDetail generator (product-linked).
 * For vendor vouchers, links them to products owned by that vendor.
 * Platform vouchers do NOT get product-linked details.
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { CONFIG } from '../config/dataset.config';
import type { GeneratedVoucher } from './vouchers.generator';
import type { GeneratedProduct } from './products.generator';

export interface GeneratedVoucherDetail {
  id: string;
  voucherId: string;
  productId: string | null;
  orderId: null; // product-linked only
  eligibleAmount: null;
  discountAmount: null;
  sequence: null;
  createdAt: Date;
  reversedAt: null;
}

export function generateVoucherDetails(
  vouchers: GeneratedVoucher[],
  products: GeneratedProduct[],
) {
  const data: GeneratedVoucherDetail[] = [];
  const vendorVouchers = vouchers.filter((v) => v.scope === 'vendor');

  // Group products by vendorId
  const productsByVendor = new Map<string, GeneratedProduct[]>();
  for (const p of products) {
    if (!p.vendorId) continue;
    const list = productsByVendor.get(p.vendorId) ?? [];
    list.push(p);
    productsByVendor.set(p.vendorId, list);
  }

  for (const voucher of vendorVouchers) {
    const vendorProducts = productsByVendor.get(voucher.userId) ?? [];
    if (vendorProducts.length === 0) continue;

    // Link 2–4 products to this vendor voucher
    const count = faker.number.int({
      min: CONFIG.counts.productsPerVendorVoucher.min,
      max: Math.min(CONFIG.counts.productsPerVendorVoucher.max, vendorProducts.length),
    });

    const selected = faker.helpers.arrayElements(vendorProducts, count);
    const usedPairs = new Set<string>();

    for (const product of selected) {
      const pairKey = `${voucher.id}:${product.id}`;
      if (usedPairs.has(pairKey)) continue; // enforce unique (voucherId, productId)
      usedPairs.add(pairKey);

      data.push({
        id: faker.string.uuid(),
        voucherId: voucher.id,
        productId: product.id,
        orderId: null,
        eligibleAmount: null,
        discountAmount: null,
        sequence: null,
        createdAt: voucher.createdAt,
        reversedAt: null,
      });
    }
  }

  const sql = data.length > 0
    ? sqlSection('VoucherDetails (product-linked)', data.length) + buildInsert('VoucherDetail', data)
    : '';
  return { data, sql };
}
