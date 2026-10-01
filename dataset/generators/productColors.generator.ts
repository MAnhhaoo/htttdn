/**
 * ProductColor generator — assigns colors and image URLs to products.
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { PRODUCT_CATALOG } from '../data/productCatalog';
import { PRODUCT_IMAGES } from '../data/productImages';
import type { GeneratedProduct } from './products.generator';

export interface GeneratedProductColor {
  id: string;
  productId: string;
  color: string;
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
  /** Helper refs */
  _productIndex: number;
  _categorySlug: string;
}

export function generateProductColors(products: GeneratedProduct[]) {
  const data: GeneratedProductColor[] = [];

  for (let pi = 0; pi < products.length; pi++) {
    const product = products[pi];
    const catalog = PRODUCT_CATALOG[product._categorySlug];
    if (!catalog) continue;

    // Find the matching template for this product
    const template = catalog.templates.find((t) =>
      product.name.startsWith(t.name),
    );
    const availableColors = template?.colors ?? ['Đen', 'Trắng'];
    const categoryImages = PRODUCT_IMAGES[product._categorySlug] ?? [];

    // Pick 1–3 unique colors for this product
    const colorCount = faker.number.int({ min: 1, max: Math.min(3, availableColors.length) });
    const selectedColors = faker.helpers.arrayElements(availableColors, colorCount);

    const usedColorsForProduct = new Set<string>();
    for (const color of selectedColors) {
      if (usedColorsForProduct.has(color)) continue;
      usedColorsForProduct.add(color);

      // Assign 1–2 image URLs from category pool
      const imageCount = faker.number.int({ min: 1, max: Math.min(2, categoryImages.length || 1) });
      const images = categoryImages.length > 0
        ? faker.helpers.arrayElements(categoryImages, imageCount).map((img) => img.url)
        : [];

      data.push({
        id: faker.string.uuid(),
        productId: product.id,
        color,
        imageUrls: images,
        createdAt: product.createdAt,
        updatedAt: product.createdAt,
        deletedAt: null,
        _productIndex: pi,
        _categorySlug: product._categorySlug,
      });
    }
  }

  const sqlRows = data.map(({ _productIndex, _categorySlug, ...row }) => row);
  const sql = sqlSection('ProductColors', data.length) + buildInsert('ProductColor', sqlRows);

  return { data, sql };
}
