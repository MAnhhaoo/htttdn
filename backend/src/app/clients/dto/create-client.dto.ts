import { Gender, Prisma, UserStatus } from '@prisma/client';

export class CreateClientDto implements Prisma.ClientCreateInput {
  id?: string;

  fullName: string;
  email: string;
  password: string;

  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | Date | null;
  gender?: Gender | null;
  status?: UserStatus;
  role?: string;
  createdBy?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  deletedAt?: string | Date | null;
}
