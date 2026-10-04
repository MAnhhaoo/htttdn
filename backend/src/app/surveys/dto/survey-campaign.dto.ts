import { SurveyResponseStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class GetSurveyInboxQueryDto extends createZodDto(
  z
    .object({
      page: z.coerce.number().int().positive().default(1),
      itemPerPage: z.coerce.number().int().positive().max(100).default(10),
      status: z.enum(SurveyResponseStatus).optional(),
    })
    .strict(),
) {}
