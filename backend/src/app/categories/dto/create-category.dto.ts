import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCategorySchema = z
  .object({
    name: z
      .string({ error: 'Tên danh mục phải là chuỗi' })
      .trim()
      .min(1, 'Tên danh mục là bắt buộc')
      .max(255, 'Tên danh mục không được vượt quá 255 ký tự'),
  })
  .strict();

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}
