import {
  Gender,
  Admin as AdminPrisma,
  UserStatus} from '@prisma/client';

export class Admin implements AdminPrisma {
  id: string;
  fullName: string;
  email: string;
  password: string;

  phone: string | null;
  address: string | null;
  dateOfBirth: Date | null;
  gender: Gender | null;

  role: string;
  status: UserStatus;

  createdBy: string | null;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  avatarUrl: string | null;
  department: string | null;
  taxId: string | null;
  storeName: string | null;
  identityNumber: string | null;
}
