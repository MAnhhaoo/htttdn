import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AssignOrderSchema = z
  .object({
    employeeId: z.string().uuid('Mã nhân viên không hợp lệ'),
    note: z.string().trim().max(1000).optional(),
  })
  .strict();

export class AssignOrderDto extends createZodDto(AssignOrderSchema) {}
