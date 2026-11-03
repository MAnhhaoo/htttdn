import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';

export type AccountRole = 'client' | 'vendor' | 'admin' | 'employee';

type AccountDb = Pick<
  PrismaService['extended'],
  'client' | 'vendor' | 'admin' | 'employee'
>;

export const ACCOUNT_ROLES: AccountRole[] = ['client', 'vendor', 'admin', 'employee'];

const emailWhere = (email: string) => ({
  email: { equals: email.trim(), mode: 'insensitive' as const },
});

/**
 * Tìm mọi tài khoản (ở cả 4 bảng) dùng email này, không phân biệt hoa/thường.
 * Mỗi bảng có unique email riêng nên cần kiểm tra chéo để một email
 * chỉ thuộc về đúng một tài khoản trong toàn hệ thống.
 */
export async function findAccountsByEmail(db: AccountDb, email: string) {
  const where = emailWhere(email);
  const [client, vendor, admin, employee] = await Promise.all([
    db.client.findFirst({ where }),
    db.vendor.findFirst({ where }),
    db.admin.findFirst({ where }),
    db.employee.findFirst({ where }),
  ]);
  const rows: Record<AccountRole, any> = { client, vendor, admin, employee };
  return ACCOUNT_ROLES.filter((role) => rows[role]).map((role) => ({
    role,
    user: rows[role],
  }));
}

/**
 * Chặn tạo/đổi email nếu email đã được dùng bởi bất kỳ tài khoản nào khác
 * (khách hàng, người bán, quản trị viên, nhân viên).
 */
export async function assertEmailAvailable(
  db: AccountDb,
  email: string | null | undefined,
  exclude?: { role: AccountRole; id: string },
) {
  if (!email) return;
  const owners = await findAccountsByEmail(db, email);
  const conflict = owners.some(
    ({ role, user }) => !(exclude && exclude.role === role && exclude.id === user.id),
  );
  if (conflict) {
    throw new BadRequestException('Email đã được sử dụng');
  }
}
