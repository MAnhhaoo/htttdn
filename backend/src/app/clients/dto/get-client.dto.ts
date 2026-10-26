import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { PaginationQuerySchema } from '../../../common/utils/paginaton-util/pagination-util.interface';
const UserStatusSchema = z.enum(['active', 'inactive']);

const GetClientsPaginationSchema = PaginationQuerySchema.extend({
  status: UserStatusSchema.optional(),
}).strict();

class GetClientsPaginationDto extends createZodDto(GetClientsPaginationSchema) {}

export { GetClientsPaginationDto };
