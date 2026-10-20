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
    price: z.coerce.number().min(0, 'Giá không được nhỏ hơn 0'),
    stock: z.coerce.number().int().min(0, 'Số lượng tồn không được nhỏ hơn 0').default(0),
  })
  .strict();

export const CreateProductColorItemSchema = z
  .object({
    id: z.string().optional(),
    color: z.string().trim().min(1, 'Tên màu không được để trống').max(100),
    imageUrls: z.array(z.string()).optional().default([]),
    variants: z.array(CreateProductVariantItemSchema).optional().default([]),
  })
  .strict();

export const CreateProductObjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Tên sản phẩm không được để trống').max(255),
    description: z.string().nullable().optional(),
    status: z.enum(ProductStatus).optional(),
    category: CategoryConnectSchema.optional(),
    categoryId: z.string().uuid().optional(),
    colors: z.array(CreateProductColorItemSchema).optional(),
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


