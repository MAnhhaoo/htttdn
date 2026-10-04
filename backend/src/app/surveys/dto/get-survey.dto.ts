import { SurveyStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { PaginationQuerySchema } from 'src/common/utils/paginaton-util/pagination-util.interface';

export const GetSurveysQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(SurveyStatus).optional(),
}).strict();

export class GetSurveysQueryDto extends createZodDto(GetSurveysQuerySchema) {}

export class GetSurveyResultsQueryDto extends createZodDto(
  PaginationQuerySchema.pick({ page: true, itemPerPage: true }).strict(),
) {}
