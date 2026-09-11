import { $Enums, Prisma } from '@prisma/client';

export class CreateUserDto implements Prisma.UserCreateInput {
  id?: string | undefined;
  email: string;
  password: string;
  firstName: string;
  lastName?: string | null | undefined;
  fullAddress: string;
  city?: string | null | undefined;
  province?: string | null | undefined;
  country?: string | null | undefined;
  phone?: string | null | undefined;
  status?: $Enums.UserStatus | undefined;
  createdAt?: string | Date | undefined;
  createdBy?: string | null | undefined;
  updatedAt?: string | Date | undefined;
  deletedAt?: string | Date | null | undefined;
}
