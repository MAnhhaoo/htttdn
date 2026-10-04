import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class GetNotificationsQueryDto extends createZodDto(
  z
    .object({
      page: z.coerce.number().int().positive().default(1),
      itemPerPage: z.coerce.number().int().positive().max(100).default(20),
      unreadOnly: z
        .enum(['true', 'false'])
        .transform((value) => value === 'true')
        .optional(),
    })
    .strict(),
) {}
