import { ProductStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CategoryConnectSchema = z
  .object({ connect: z.object({ id: z.uuid() }).strict() })
  .strict();

export const CreateProductSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    description: z.string().nullable().optional(),
    status: z.enum(ProductStatus).optional(),
    category: CategoryConnectSchema,
  })
  .strict();

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
