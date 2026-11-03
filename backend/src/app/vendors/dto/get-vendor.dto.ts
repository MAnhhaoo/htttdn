import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { PaginationQuerySchema } from '../../../common/utils/paginaton-util/pagination-util.interface';
const UserStatusSchema = z.enum(['active', 'inactive']);

const GetVendorsPaginationSchema = PaginationQuerySchema.extend({
  status: UserStatusSchema.optional(),
}).strict();

class GetVendorsPaginationDto extends createZodDto(GetVendorsPaginationSchema) {}

export { GetVendorsPaginationDto };
