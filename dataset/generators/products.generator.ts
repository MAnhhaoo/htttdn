/**
 * Products generator — creates products by combining catalog templates × brands.
 * Each product is assigned to a random vendor.
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { PRODUCT_CATALOG } from '../data/productCatalog';
import type { GeneratedCategory } from './categories.generator';
import type { GeneratedUser } from './users.generator';

export interface GeneratedProduct {
  id: string;
  categoryId: string;
  vendorId: string | null;
  name: string;
  slug: string;
  description: string | null;
  status: 'draft' | 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
  /** Helper references (not inserted into DB) */
  _categorySlug: string;
}

export function generateProducts(
  categories: GeneratedCategory[],
  vendors: GeneratedUser[],
) {
  const data: GeneratedProduct[] = [];
  const usedSlugs = new Set<string>();

  for (const category of categories) {
    const catalog = PRODUCT_CATALOG[category.slug];
    if (!catalog) continue;

    for (const template of catalog.templates) {
      // Create one product per brand for this template
      for (const brand of catalog.brands) {
        const rawName = `${template.name} ${brand}`;
        let slug = toSlug(rawName);

        // Ensure slug uniqueness
        let suffix = 1;
        const baseSlug = slug;
        while (usedSlugs.has(slug)) {
          slug = `${baseSlug}-${++suffix}`;
        }
        usedSlugs.add(slug);

        const created = faker.date.between({
          from: new Date('2025-03-01'),
          to: new Date('2026-06-01'),
        });

        data.push({
          id: faker.string.uuid(),
          categoryId: category.id,
          vendorId: faker.helpers.arrayElement(vendors).id,
          name: rawName,
          slug,
          description: template.descriptionVi,
          status: faker.helpers.weightedArrayElement([
            { value: 'active' as const, weight: 85 },
            { value: 'draft' as const, weight: 10 },
            { value: 'inactive' as const, weight: 5 },
          ]),
          createdAt: created,
          updatedAt: created,
          deletedAt: null,
          _categorySlug: category.slug,
        });
      }
    }
  }

  // Build SQL rows without the helper field
  const sqlRows = data.map(({ _categorySlug, ...row }) => row);
  const sql = sqlSection('Products', data.length) + buildInsert('Product', sqlRows);

  return { data, sql };
}

// ── Helpers ──────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}
