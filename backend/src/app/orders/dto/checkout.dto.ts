import { PaymentMethod } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CheckoutSchema = z
  .object({
    receiverName: z.string().trim().min(2).max(255),
    receiverPhone: z.string().trim().min(8).max(50),
    shippingAddress: z.string().trim().min(5).max(500),
    notes: z.string().trim().max(1000).optional(),
    paymentMethod: z.enum(PaymentMethod).default(PaymentMethod.cod),
    voucherCodes: z.array(z.string().trim().min(1).max(50)).max(2).default([]),
  })
  .strict();

export class CheckoutDto extends createZodDto(CheckoutSchema) {}
