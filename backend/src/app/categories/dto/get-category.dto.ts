import { createZodDto } from 'nestjs-zod';
import { PaginationQuerySchema } from '../../../common/utils/paginaton-util/pagination-util.interface';

class GetCategoriesPaginationDto extends createZodDto(
  PaginationQuerySchema.strict(),
) {}

export { GetCategoriesPaginationDto };
