import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateCartItemSchema = z
  .object({ quantity: z.number().int().positive().max(999) })
  .strict();

export class UpdateCartItemDto extends createZodDto(UpdateCartItemSchema) {}
