import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SubscriptionPlan = z.enum(['1_year', '2_years'], {
  message: 'Gói đăng ký chỉ được là 1_year hoặc 2_years',
});

export class RenewSubscriptionDto extends createZodDto(
  z.object({
    plan: SubscriptionPlan.default('1_year'),
  }),
) {}

export class ApproveRegistrationDto extends createZodDto(
  z.object({
    plan: SubscriptionPlan.optional(),
    commissionRate: z.coerce
      .number()
      .min(0, 'Hoa hồng không được âm')
      .max(100, 'Hoa hồng tối đa 100%')
      .optional(),
    note: z.string().max(1000).optional().nullable(),
  }),
) {}

export class RejectRegistrationDto extends createZodDto(
  z.object({
    reason: z.string().trim().max(1000).optional().nullable(),
  }),
) {}
