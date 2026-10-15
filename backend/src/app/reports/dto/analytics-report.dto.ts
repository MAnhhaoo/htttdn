import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class AnalyticsReportQueryDto extends createZodDto(
  z.object({
    period: z.enum(['week', 'month', 'quarter', 'year', 'custom', 'all']).default('all'),
    year: z.coerce.number().int().min(2020).max(2035).optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    quarter: z.coerce.number().int().min(1).max(4).optional(),
    week: z.coerce.number().int().min(1).max(53).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    vendorRegistrationFee: z.coerce.number().min(0).default(2000000),
    commissionTaxRate: z.coerce.number().min(0).max(100).default(8),
  }),
) {}
