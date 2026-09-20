import { Prisma } from '@prisma/client';

export class CreateCategoryDto implements Omit<
  Prisma.CategoryCreateInput,
  'slug'
> {
  name: string;

  description?: string | null | undefined;

  createdAt?: string | Date | undefined;

  updatedAt?: string | Date | undefined;

  deletedAt?: string | Date | null | undefined;

  products?: Prisma.ProductCreateNestedManyWithoutCategoryInput | undefined;

  id?: string | undefined;
}
