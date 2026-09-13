import { User as UserPrisma, UserRole, UserStatus } from '@prisma/client';

export class User implements UserPrisma {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  password: string;
  avatar: string | null;
  gender: string | null;
  address: string | null;
  status: UserStatus;

  role: UserRole;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
