import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateReviewSchema = z
  .object({
    orderDetailId: z.uuid(),
    rating: z.number().int().min(1).max(5),
    content: z.string().trim().max(3000).optional(),
  })
  .strict();

export class CreateReviewDto extends createZodDto(CreateReviewSchema) {}
