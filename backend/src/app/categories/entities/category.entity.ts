import { Category as CategoryPrisma } from '@prisma/client';

export class Category implements CategoryPrisma {
  id: string;

  name: string;

  slug: string;

  description: string | null;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;
}
