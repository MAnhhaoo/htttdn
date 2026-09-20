import { User as UserPrisma, UserRole, UserStatus } from '@prisma/client';

export class User implements UserPrisma {
  id: string;
  fullName: string;
  email: string;
  password: string;

  phone: string | null;
  address: string | null;

  role: UserRole;
  status: UserStatus;

  createdBy: string | null;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
