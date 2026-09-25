import { UserRole, UserStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(255),
  email: z.email().max(255),
  phone: z.string().max(255).nullable(),
  address: z.string().max(500).nullable(),
});

export class UpdateProfileDto extends createZodDto(
  ProfileSchema.partial().strict(),
) {}

export class UpdateUserDto extends createZodDto(
  ProfileSchema.extend({
    role: z.enum(UserRole),
    status: z.enum(UserStatus),
  })
    .partial()
    .strict(),
) {}
