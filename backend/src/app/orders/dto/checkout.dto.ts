import { PaymentMethod } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CheckoutSelectionSchema = z.object({
  voucherCodes: z.array(z.string().trim().min(3).max(50).toUpperCase()).max(5).default([]),
  voucherSelections: z.array(z.object({
    vendorId: z.union([z.uuid(), z.literal('platform')]),
    codes: z.array(z.string().trim().min(3).max(50).toUpperCase()).max(2),
  }).strict()).max(50).optional(),
  vendorId: z.string().uuid().optional(),
  cartItemIds: z.array(z.string().uuid()).min(1).max(200).optional(),
}).strict();

export class PreviewCheckoutDto extends createZodDto(CheckoutSelectionSchema) {}

export const CheckoutSchema = CheckoutSelectionSchema
  .extend({
    receiverName: z.string().trim().min(2).max(255),
    receiverPhone: z.string().trim().min(8).max(50),
    shippingAddress: z.string().trim().min(5).max(500),
    notes: z.string().trim().max(1000).optional(),
    paymentMethod: z.enum(PaymentMethod).default(PaymentMethod.cod),
    expectedTotalAmount: z.number().finite().nonnegative().optional(),
  });

export class CheckoutDto extends createZodDto(CheckoutSchema) {}
