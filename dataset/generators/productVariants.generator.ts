/**
 * ProductVariant generator — size / stock / price per color.
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { PRODUCT_CATALOG } from '../data/productCatalog';
import type { GeneratedProduct } from './products.generator';
import type { GeneratedProductColor } from './productColors.generator';

export interface GeneratedProductVariant {
  id: string;
  productColorId: string;
  size: string;
  stock: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
}

export function generateProductVariants(
  products: GeneratedProduct[],
  colors: GeneratedProductColor[],
) {
  const data: GeneratedProductVariant[] = [];

  // Build a product lookup
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const color of colors) {
    const product = productById.get(color.productId);
    if (!product) continue;

    const catalog = PRODUCT_CATALOG[product._categorySlug];
    const template = catalog?.templates.find((t) =>
      product.name.startsWith(t.name),
    );
    const availableSizes = template?.sizes ?? ['Free size'];
    const [minPrice, maxPrice] = template?.priceRange ?? [100000, 500000];

    // Base price for this product (consistent across variants)
    const basePrice = faker.number.int({
      min: Math.round(minPrice / 1000) * 1000,
      max: Math.round(maxPrice / 1000) * 1000,
    });

    // Pick 2–4 sizes (or fewer if not enough available)
    const maxSizes = Math.min(4, availableSizes.length);
    const minSizes = Math.min(2, maxSizes);
    const sizeCount = minSizes === maxSizes ? minSizes : faker.number.int({
      min: minSizes,
      max: maxSizes,
    });
    const selectedSizes = faker.helpers.arrayElements(availableSizes, sizeCount);

    for (const size of selectedSizes) {
      data.push({
        id: faker.string.uuid(),
        productColorId: color.id,
        size,
        stock: faker.number.int({ min: 0, max: 100 }),
        price: basePrice,
        createdAt: product.createdAt,
        updatedAt: product.createdAt,
        deletedAt: null,
      });
    }
  }

  const sql = sqlSection('ProductVariants', data.length) + buildInsert('ProductVariant', data);
  return { data, sql };
}
