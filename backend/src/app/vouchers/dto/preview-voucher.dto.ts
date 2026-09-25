import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class PreviewVoucherDto extends createZodDto(
  z
    .object({
      codes: z.array(z.string().trim().min(3).max(50)).min(1).max(2),
      items: z
        .array(
          z
            .object({
              productVariantId: z.uuid(),
              quantity: z.number().int().positive(),
            })
            .strict(),
        )
        .min(1),
    })
    .strict(),
) {}
