import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AddCartItemSchema = z
  .object({
    productVariantId: z.uuid(),
    quantity: z.number().int().positive().max(999).default(1),
  })
  .strict();

export class AddCartItemDto extends createZodDto(AddCartItemSchema) {}
