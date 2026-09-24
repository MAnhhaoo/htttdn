import { PaymentStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdatePaymentStatusSchema = z
  .object({
    status: z.enum(PaymentStatus),
    transactionCode: z.string().trim().max(255).optional(),
    gateway: z.string().trim().max(100).optional(),
  })
  .strict();

export class UpdatePaymentStatusDto extends createZodDto(
  UpdatePaymentStatusSchema,
) {}
