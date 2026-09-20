import { Product as ProductPrisma, ProductStatus } from '@prisma/client';

export class Product implements ProductPrisma {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
