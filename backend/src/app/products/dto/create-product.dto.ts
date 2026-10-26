import { ProductStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CategoryConnectSchema = z
  .object({ connect: z.object({ id: z.string().uuid() }).strict() })
  .strict();

export const CreateProductVariantItemSchema = z
  .object({
    id: z.string().optional(),
    size: z.string().trim().min(1, 'Kích cỡ không được để trống').max(50),
    price: z.coerce.number().positive('Giá phải lớn hơn 0'),
    stock: z.coerce.number().int().min(0, 'Số lượng tồn không được nhỏ hơn 0').default(0),
  })
  .strict();

export const CreateProductColorItemSchema = z
  .object({
    id: z.string().optional(),
    color: z.string().trim().min(1, 'Tên màu không được để trống').max(100),
    imageUrls: z.array(z.string()).max(20, 'Mỗi màu chỉ được có tối đa 20 ảnh').optional().default([]),
    variants: z.array(CreateProductVariantItemSchema).optional().default([]),
  })
  .strict()
  .refine(
    (color) => new Set(color.variants.map((variant) => variant.size)).size === color.variants.length,
    { message: 'Các size trong cùng một màu không được trùng nhau', path: ['variants'] },
  );

export const CreateProductObjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Tên sản phẩm không được để trống').max(255),
    description: z.string().nullable().optional(),
    status: z.enum(ProductStatus).optional(),
    category: CategoryConnectSchema.optional(),
    categoryId: z.string().uuid().optional(),
    colors: z
      .array(CreateProductColorItemSchema)
      .refine(
        (colors) => new Set(colors.map((color) => color.color)).size === colors.length,
        { message: 'Tên màu không được trùng nhau trong cùng một sản phẩm' },
      )
      .optional(),
  })
  .strict();

export const CreateProductSchema = CreateProductObjectSchema.refine(
  (data) => data.category !== undefined || data.categoryId !== undefined,
  {
    message: 'Cần cung cấp category hoặc categoryId',
    path: ['category'],
  },
);

export class CreateProductDto extends createZodDto(CreateProductSchema) {}


