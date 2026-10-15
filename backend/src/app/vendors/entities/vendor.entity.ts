import {
  Gender,
  Vendor as VendorPrisma,
  UserStatus} from '@prisma/client';

export class Vendor implements VendorPrisma {
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
  department?: string | null;
  taxId: string | null;
  storeName: string | null;
  identityNumber?: string | null;

  subscriptionPlan: string | null;
  subscriptionFee: any;
  subscriptionExpiresAt: Date | null;
  commissionRate: any;
  approvalStatus: string;
  approvedAt: Date | null;
  approvedBy: string | null;
  rejectedReason: string | null;
  renewalRequested: boolean;
  renewalPlan: string | null;
  renewalRequestedAt: Date | null;
}
