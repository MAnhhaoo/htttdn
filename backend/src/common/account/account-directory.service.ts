import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UserRole } from '../guards/access-control/access-control.const';
import { computeVendorSubscriptionStatus } from '../utils/vendor-approval/vendor-approval.util';

const GUARD_ROLES_ORDER: readonly UserRole[] = [
  'admin',
  'client',
  'vendor',
  'employee',
];

const GUARD_BASE_SELECT = {
  id: true,
  status: true,
  deletedAt: true,
} as const;

const GUARD_VENDOR_SELECT = {
  ...GUARD_BASE_SELECT,
  approvalStatus: true,
} as const;

const ADMIN_AUTH_SUMMARY_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  department: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.AdminSelect;

const EMPLOYEE_AUTH_SUMMARY_SELECT = {
  id: true,
  employeeCode: true,
  fullName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  dateOfBirth: true,
  gender: true,
  citizenId: true,
  address: true,
  department: true,
  position: true,
  employmentType: true,
  salary: true,
  hourlyRate: true,
  hireDate: true,
  status: true,
  assignedOrderScope: true,
  permissions: true,
  adminId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.EmployeeSelect;

const CLIENT_AUTH_SUMMARY_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  dateOfBirth: true,
  gender: true,
  loyaltyPoints: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  addresses: {
    where: { deletedAt: null },
    orderBy: [{ isDefault: 'desc' as const }, { createdAt: 'desc' as const }],
    take: 1,
    select: { addressLine: true },
  },
} satisfies Prisma.ClientSelect;

const VENDOR_AUTH_SUMMARY_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  storeName: true,
  taxId: true,
  address: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  subscriptionPlan: true,
  subscriptionFee: true,
  subscriptionExpiresAt: true,
  commissionRate: true,
  approvalStatus: true,
  approvedAt: true,
  approvedBy: true,
  rejectedReason: true,
  renewalRequested: true,
  renewalPlan: true,
  renewalRequestedAt: true,
} satisfies Prisma.VendorSelect;

@Injectable()
export class AccountDirectoryService {
  constructor(private readonly prisma: PrismaService) {}

  private get db(): any {
    return (this.prisma as any)?.extended ?? this.prisma;
  }

  private queryGuardAccountByRole(userId: string, role: UserRole): Promise<any> {
    if (role === 'vendor') {
      return this.db.vendor.findUnique({
        where: { id: userId },
        select: GUARD_VENDOR_SELECT,
      });
    }
    return this.db[role].findUnique({
      where: { id: userId },
      select: GUARD_BASE_SELECT,
    });
  }

  /**
   * Ưu tiên truy vấn đúng bảng ứng với `roleHint` (1 PK lookup thay vì tối đa 4 truy vấn tuần tự).
   * Chỉ fallback sang các bảng còn lại nếu không có `roleHint` hoặc không tìm thấy bản ghi.
   * Không bao giờ đọc cột `password`.
   */
  async resolveAccountForGuard(
    userId: string,
    roleHint?: UserRole,
  ): Promise<{ user: any; role: UserRole }> {
    const validHint =
      roleHint && GUARD_ROLES_ORDER.includes(roleHint) ? roleHint : undefined;

    if (validHint) {
      const hit = await this.queryGuardAccountByRole(userId, validHint);
      if (hit) {
        const { password: _p, ...safeHit } = hit;
        return { user: safeHit, role: validHint };
      }
    }

    for (const candidateRole of GUARD_ROLES_ORDER) {
      if (candidateRole === validHint) continue;
      const found = await this.queryGuardAccountByRole(userId, candidateRole);
      if (found) {
        const { password: _p, ...safeFound } = found;
        return { user: safeFound, role: candidateRole };
      }
    }

    return { user: null, role: validHint ?? 'employee' };
  }

  /**
   * Truy vấn hồ sơ xác thực gọn nhẹ dùng cho `AuthService.getMe` và `AuthService.refreshToken`
   * (tránh đọc toàn bộ `products`, `vendorOrders`, `vouchers` của Vendor hay cột `password`).
   */
  async getAccountAuthSummary(
    userId: string,
    role: UserRole | string,
  ): Promise<any | null> {
    try {
      if (role === 'admin') {
        const admin = await this.db.admin.findUnique({
          where: { id: userId },
          select: ADMIN_AUTH_SUMMARY_SELECT,
        });
        if (!admin) return null;
        const { password: _p, ...safeAdmin } = admin as any;
        return safeAdmin;
      }

      if (role === 'employee') {
        const emp = await this.db.employee.findUnique({
          where: { id: userId },
          select: EMPLOYEE_AUTH_SUMMARY_SELECT,
        });
        if (!emp) return null;
        const { password: _p, ...safeEmp } = emp as any;
        return safeEmp;
      }

      if (role === 'client') {
        const client = await this.db.client.findUnique({
          where: { id: userId },
          select: CLIENT_AUTH_SUMMARY_SELECT,
        });
        if (!client) return null;
        const { password: _p, addresses, ...safeClient } = client as any;
        return {
          ...safeClient,
          address: addresses?.[0]?.addressLine || safeClient.address || null,
        };
      }

      if (role === 'vendor') {
        const vendor = await this.db.vendor.findUnique({
          where: { id: userId },
          select: VENDOR_AUTH_SUMMARY_SELECT,
        });
        if (!vendor) return null;
        const { password: _p, ...safeVendor } = vendor as any;
        return {
          ...safeVendor,
          ...computeVendorSubscriptionStatus(safeVendor.subscriptionExpiresAt),
        };
      }
    } catch {
      return null;
    }

    return null;
  }

  /**
   * Đảm bảo không tự khóa tài khoản của chính mình và không khóa quản trị viên hoạt động cuối cùng.
   * Dùng `admin.count` thay vì `findMany`.
   */
  async assertCanLockAdmin(
    targetId: string | undefined,
    actorId?: string,
  ): Promise<void> {
    if (!targetId) return;
    if (actorId && targetId === actorId) {
      throw new BadRequestException(
        'Không thể tự khóa tài khoản của chính mình',
      );
    }

    const remaining =
      typeof this.db.admin.count === 'function'
        ? await this.db.admin.count({
            where: {
              status: 'active',
              deletedAt: null,
              id: { not: targetId },
            },
          })
        : (
            await this.db.admin.findMany({
              where: { status: 'active' },
              select: { id: true },
            })
          ).filter((a: { id: string }) => a.id !== targetId).length;

    if (remaining === 0) {
      throw new BadRequestException(
        'Không thể khóa tài khoản quản trị viên đang hoạt động cuối cùng',
      );
    }
  }
}

