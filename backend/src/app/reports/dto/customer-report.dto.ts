import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class CustomerReportQueryDto extends createZodDto(
  z
    .object({
      from: z.iso.datetime({ offset: true }).optional(),
      to: z.iso.datetime({ offset: true }).optional(),
      limit: z.coerce.number().int().positive().max(50).default(10),
    })
    .strict()
    .refine(
      (data) =>
        !data.from || !data.to || new Date(data.to) > new Date(data.from),
      { path: ['to'], message: 'to phải sau from' },
    ),
) {}
