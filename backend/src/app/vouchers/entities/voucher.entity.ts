import { Voucher as PrismaVoucher } from '@prisma/client';

export class Voucher implements PrismaVoucher {
  id: string;
  userId: string;
  code: string;
  name: string;
  scope: PrismaVoucher['scope'];
  discountType: PrismaVoucher['discountType'];
  discountValue: PrismaVoucher['discountValue'];
  minOrderAmount: PrismaVoucher['minOrderAmount'];
  maxDiscountAmount: PrismaVoucher['maxDiscountAmount'];
  quantity: number;
  usedQuantity: number;
  perUserLimit: number;
  startDate: Date;
  endDate: Date;
  status: PrismaVoucher['status'];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
