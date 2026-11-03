import { UserStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(255),
  email: z.email().max(255),
  phone: z.string().max(255).nullable(),
  avatarUrl: z.string().max(2048).nullable(),
  storeName: z.string().trim().max(255).nullable(),
  taxId: z.string().trim().max(100).nullable(),
  address: z.string().max(500).nullable(),
});

export class UpdateVendorProfileDto extends createZodDto(
  ProfileSchema.partial().strict(),
) {}

export class UpdateVendorDto extends createZodDto(
  ProfileSchema.extend({
    status: z.enum(UserStatus),
  })
    .partial()
    .strict(),
) {}
