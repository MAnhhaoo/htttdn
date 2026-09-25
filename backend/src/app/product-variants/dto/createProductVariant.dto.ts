import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ProductVariantFieldsSchema = z.object({
  size: z.string().trim().min(1).max(100),
  price: z
    .number()
    .finite()
    .positive()
    .max(9_999_999_999.99)
    .refine((price) => Math.abs(price * 100 - Math.round(price * 100)) < 1e-6, {
      message: 'Giá chỉ được có tối đa 2 chữ số thập phân',
    }),
  stock: z.number().int().nonnegative(),
});

export class CreateProductVariantDto extends createZodDto(
  ProductVariantFieldsSchema.extend({
    productColorId: z.uuid(),
    stock: ProductVariantFieldsSchema.shape.stock.optional(),
  }).strict(),
) {}
