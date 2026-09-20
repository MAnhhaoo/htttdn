import { ProductColor as ProductColorPrisma } from '@prisma/client';

export class ProductColor implements ProductColorPrisma {
  id: string;
  productId: string;
  color: string;
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
