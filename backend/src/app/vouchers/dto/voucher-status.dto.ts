import { VoucherStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class VoucherStatusDto extends createZodDto(
  z.object({ status: z.enum(VoucherStatus) }).strict(),
) {}
