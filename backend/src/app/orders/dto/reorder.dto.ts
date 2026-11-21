import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ReorderSchema = z
  .object({
    orderIds: z.array(z.string().uuid()).min(1).max(20),
  })
  .strict();

export class ReorderDto extends createZodDto(ReorderSchema) {}
