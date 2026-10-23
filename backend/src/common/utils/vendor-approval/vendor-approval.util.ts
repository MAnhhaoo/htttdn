import { ForbiddenException } from '@nestjs/common';

export function assertVendorApproved(approvalStatus?: string | null): void {
  // Existing vendor accounts use the schema default, approved.
  if (!approvalStatus || approvalStatus === 'approved') return;

  throw new ForbiddenException(
    approvalStatus === 'rejected'
      ? 'Hồ sơ gian hàng đã bị từ chối. Vui lòng liên hệ quản trị viên.'
      : 'Tài khoản đang chờ admin duyệt. Bạn chỉ có thể đăng nhập sau khi được duyệt.',
  );
}
