import { OrderStatus, VendorOrderStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateOrderStatusSchema = z
  .object({
    status: z.enum(OrderStatus),
    note: z.string().trim().max(1000).optional(),
    notifyTarget: z.enum(['vendor', 'admin', 'both', 'none']).optional(),
    title: z.string().trim().max(255).optional(),
  })
  .strict();

export class UpdateOrderStatusDto extends createZodDto(
  UpdateOrderStatusSchema,
) {}

export const UpdateVendorOrderStatusSchema = z
  .object({
    status: z.enum(VendorOrderStatus),
    note: z.string().trim().max(1000).optional(),
  })
  .strict();

export class UpdateVendorOrderStatusDto extends createZodDto(
  UpdateVendorOrderStatusSchema,
) {}
