import { Prisma, UserRole, UserStatus } from '@prisma/client';

export class CreateUserDto implements Prisma.UserCreateInput {
  id?: string;

  fullName: string;
  email: string;
  password: string;

  phone?: string | null;
  address?: string | null;
  status?: UserStatus;
  role?: UserRole;
  createdBy?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  deletedAt?: string | Date | null;
}
