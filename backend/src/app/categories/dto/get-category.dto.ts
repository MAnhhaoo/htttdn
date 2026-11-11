import { createZodDto } from 'nestjs-zod';
import { PaginationQuerySchema } from '../../../common/utils/paginaton-util/pagination-util.interface';
import { z } from 'zod';

const GetCategoriesSchema = PaginationQuerySchema.extend({
  includeAll: z.coerce.boolean().optional(),
  status: z.enum(['all', 'active', 'inactive']).optional(),
});

class GetCategoriesPaginationDto extends createZodDto(GetCategoriesSchema) {}

export { GetCategoriesPaginationDto };
