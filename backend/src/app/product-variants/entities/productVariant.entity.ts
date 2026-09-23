import { ProductVariant as ProductVariantPrisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductVariant implements ProductVariantPrisma {
  id: string;
  productColorId: string;
  stock: number;
  size: string;
  price: Decimal;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
