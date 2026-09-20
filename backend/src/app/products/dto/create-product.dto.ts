import { ProductStatus, Prisma } from '@prisma/client';

export class CreateProductDto implements Omit<
  Prisma.ProductCreateInput,
  'slug'
> {
  name: string;
  description?: string | null;
  status?: ProductStatus;
  category: Prisma.CategoryCreateNestedOneWithoutProductsInput;
  colors?: Prisma.ProductColorCreateNestedManyWithoutProductInput;
  reviews?: Prisma.ReviewCreateNestedManyWithoutProductInput;
  voucherDetails?: Prisma.VoucherDetailCreateNestedManyWithoutProductInput;
}
