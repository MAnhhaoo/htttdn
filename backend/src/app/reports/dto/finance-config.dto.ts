import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class UpdateFinanceConfigDto extends createZodDto(
  z.object({
    commissionTaxRate: z.coerce
      .number()
      .min(0, 'Thuế sàn không được âm')
      .max(100, 'Thuế sàn tối đa 100%'),
    vendorRegistrationFee: z.coerce
      .number()
      .min(0, 'Phí đăng ký không được âm')
      .max(1_000_000_000_000),
    note: z.string().max(1000).optional().nullable(),
  }),
) {}
