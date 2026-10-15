import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class GetShipmentsQueryDto extends createZodDto(
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    itemPerPage: z.coerce.number().int().min(1).max(100).default(10),
    q: z.string().optional(),
    status: z
      .enum([
        'pending',
        'assigned',
        'picking_up',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'failed',
        'returned',
      ])
      .optional(),
    carrierId: z.string().uuid().optional(),
  }),
) {}

export class UpdateShipmentStatusDto extends createZodDto(
  z.object({
    status: z.enum([
      'pending',
      'assigned',
      'picking_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'failed',
      'returned',
    ]),
    location: z.string().max(255).optional(),
    description: z.string().max(500).optional(),
    failedReason: z.string().max(500).optional(),
    notes: z.string().max(1000).optional(),
  }),
) {}

export class AssignCarrierDto extends createZodDto(
  z.object({
    carrierId: z.string().uuid('ID nhân viên không hợp lệ'),
    carrierType: z.enum(['employee', 'admin']).default('employee'),
    notes: z.string().max(1000).optional(),
  }),
) {}
