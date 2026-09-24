import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    content: z.string().trim().max(3000).nullable().optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    'Cần ít nhất một trường cập nhật',
  );

export class UpdateReviewDto extends createZodDto(UpdateReviewSchema) {}
