import { UserStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(255),
  email: z.email().max(255),
  phone: z.string().max(255).nullable(),
  avatarUrl: z.string().max(2048).nullable(),
  department: z.string().trim().max(255).nullable(),
});

export class UpdateAdminProfileDto extends createZodDto(
  ProfileSchema.partial().strict(),
) {}

export class UpdateAdminDto extends createZodDto(
  ProfileSchema.extend({
    status: z.enum(UserStatus),
  })
    .partial()
    .strict(),
) {}
