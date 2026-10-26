import { Gender, UserStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationQuerySchema } from '../../../common/utils/paginaton-util/pagination-util.interface';

const GetUsersPaginationSchema = PaginationQuerySchema.extend({
  role: z.string().trim().optional(),
  status: z.enum(UserStatus).optional(),
});

export class GetUsersPaginationDto extends createZodDto(
  GetUsersPaginationSchema,
) {}

const BaseAccountUpdateSchema = z.object({
  fullName: z.string().trim().min(1).max(255),
  email: z.email().max(255),
  phone: z.string().max(255).nullable(),
  avatarUrl: z.string().max(2048).nullable(),
  address: z.string().max(500).nullable(),
  dateOfBirth: z.iso.date().nullable(),
  gender: z.enum(Gender).nullable(),
  storeName: z.string().trim().max(255).nullable(),
  taxId: z.string().trim().max(100).nullable(),
});

export class UpdateUserProfileDto extends createZodDto(
  BaseAccountUpdateSchema.partial().strict(),
) {}

export class UpdateUserDto extends createZodDto(
  BaseAccountUpdateSchema.extend({
    department: z.string().trim().max(255).nullable(),
    status: z.enum(UserStatus),
    role: z.string().trim(),
  })
    .partial()
    .strict(),
) {}

export class UpdateUserStatusDto extends createZodDto(
  z
    .object({
      status: z.enum(UserStatus),
    })
    .strict(),
) {}
