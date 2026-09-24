import { OrderStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateOrderStatusSchema = z
  .object({
    status: z.enum(OrderStatus),
    note: z.string().trim().max(1000).optional(),
  })
  .strict();

export class UpdateOrderStatusDto extends createZodDto(
  UpdateOrderStatusSchema,
) {}
