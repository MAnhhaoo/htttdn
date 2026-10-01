/**
 * Cart & CartItem generator.
 * Creates carts for a subset of customers and adds 1–4 items per cart.
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { CONFIG } from '../config/dataset.config';
import type { GeneratedUser } from './users.generator';
import type { GeneratedProductVariant } from './productVariants.generator';

export interface GeneratedCart {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
}

export interface GeneratedCartItem {
  id: string;
  productVariantId: string;
  cartId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export function generateCarts(
  customers: GeneratedUser[],
  variants: GeneratedProductVariant[],
) {
  const carts: GeneratedCart[] = [];
  const cartItems: GeneratedCartItem[] = [];

  if (variants.length === 0) return { carts, cartItems, sql: '' };

  // Select a subset of customers to have carts
  const customersWithCarts = faker.helpers.arrayElements(
    customers,
    Math.min(CONFIG.counts.cartsToCreate, customers.length),
  );

  for (const customer of customersWithCarts) {
    const created = faker.date.between({
      from: new Date('2026-06-01'),
      to: CONFIG.dateRange.end,
    });
    const cart: GeneratedCart = {
      id: faker.string.uuid(),
      userId: customer.id,
      createdAt: created,
      updatedAt: created,
      deletedAt: null,
    };
    carts.push(cart);

    // Add 1–4 unique items to this cart
    const itemCount = faker.number.int({
      min: CONFIG.counts.cartItemsPerCart.min,
      max: CONFIG.counts.cartItemsPerCart.max,
    });
    const selectedVariants = faker.helpers.arrayElements(
      variants,
      Math.min(itemCount, variants.length),
    );

    const usedVariants = new Set<string>();
    for (const variant of selectedVariants) {
      if (usedVariants.has(variant.id)) continue; // enforce unique(cartId, productVariantId)
      usedVariants.add(variant.id);

      cartItems.push({
        id: faker.string.uuid(),
        productVariantId: variant.id,
        cartId: cart.id,
        quantity: faker.number.int({ min: 1, max: 5 }),
        createdAt: created,
        updatedAt: created,
      });
    }
  }

  const sql =
    sqlSection('Carts', carts.length) + buildInsert('Cart', carts) + '\n' +
    sqlSection('CartItems', cartItems.length) + buildInsert('CartItem', cartItems);

  return { carts, cartItems, sql };
}
