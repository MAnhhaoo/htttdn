import { ForbiddenException } from '@nestjs/common';

export type VendorSubscriptionPlan = '1_year' | '2_years';

export const SUBSCRIPTION_PLAN_FEES: Record<VendorSubscriptionPlan, number> = {
  '1_year': 1200000,
  '2_years': 2000000,
};

export function normalizeSubscriptionPlan(
  plan?: string | null,
): VendorSubscriptionPlan {
  return plan === '2_years' ? '2_years' : '1_year';
}

export function computeVendorSubscriptionStatus(
  subscriptionExpiresAt?: Date | string | null,
  now = new Date(),
): {
  isExpired: boolean;
  daysRemaining: number | null;
  isExpiringSoon: boolean;
} {
  if (!subscriptionExpiresAt) {
    return {
      isExpired: false,
      daysRemaining: null,
      isExpiringSoon: false,
    };
  }
  const expiresDate =
    subscriptionExpiresAt instanceof Date
      ? subscriptionExpiresAt
      : new Date(subscriptionExpiresAt);
  const isExpired = expiresDate < now;
  const daysRemaining = Math.ceil(
    (expiresDate.getTime() - now.getTime()) / (1000 * 3600 * 24),
  );
  const isExpiringSoon =
    daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30;
  return {
    isExpired,
    daysRemaining,
    isExpiringSoon,
  };
}

export function assertVendorApproved(approvalStatus?: string | null): void {
  // Existing vendor accounts use the schema default, approved.
  if (!approvalStatus || approvalStatus === 'approved') return;

  throw new ForbiddenException(
    approvalStatus === 'rejected'
      ? 'Hồ sơ gian hàng đã bị từ chối. Vui lòng liên hệ quản trị viên.'
      : 'Tài khoản đang chờ admin duyệt. Bạn chỉ có thể đăng nhập sau khi được duyệt.',
  );
}
