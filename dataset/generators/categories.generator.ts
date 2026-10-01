/**
 * Categories generator — 15 Vietnamese marketplace categories.
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { CATEGORIES, type CategoryDefinition } from '../data/categories';

export interface GeneratedCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
}

export function generateCategories() {
  const baseDate = new Date('2025-01-01T00:00:00Z');
  const data: GeneratedCategory[] = CATEGORIES.map((cat: CategoryDefinition) => {
    const created = faker.date.between({ from: baseDate, to: new Date('2025-02-01') });
    return {
      id: faker.string.uuid(),
      name: cat.name,
      slug: cat.slug,
      createdAt: created,
      updatedAt: created,
      deletedAt: null,
    };
  });

  const sql = sqlSection('Categories', data.length) + buildInsert('Category', data);
  return { data, sql };
}
