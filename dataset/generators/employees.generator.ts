/**
 * Employees generator.
 * Realistic employees with salary, departments, positions,
 * and order-management restricted permissions.
 */
import bcrypt from 'bcryptjs';
import { faker, vnPhone, vnAddress, vnFullName } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { CONFIG } from '../config/dataset.config';
import type { GeneratedAdmin } from './users.generator';

export interface GeneratedEmployee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  password: string;
  phone: string | null;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
  gender: 'male' | 'female' | 'other' | null;
  citizenId: string | null;
  address: string | null;
  department: string;
  position: string;
  salary: number;
  hireDate: Date;
  status: 'active' | 'inactive';
  assignedOrderScope: string;
  permissions: Record<string, unknown>;
  adminId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
}

const EMPLOYEE_ROLES_CATALOG = [
  {
    department: 'Phòng Quản lý & Vận hành Đơn hàng',
    position: 'Trưởng nhóm Vận hành Đơn hàng',
    salaryMin: 16000000,
    salaryMax: 18500000,
    scope: 'all_orders',
  },
  {
    department: 'Phòng Quản lý & Vận hành Đơn hàng',
    position: 'Chuyên viên Quản lý & Phê duyệt Đơn',
    salaryMin: 13000000,
    salaryMax: 15500000,
    scope: 'assigned_orders',
  },
  {
    department: 'Phòng Quản lý & Vận hành Đơn hàng',
    position: 'Nhân viên Xác nhận & Kiểm tra Đơn hàng',
    salaryMin: 10000000,
    salaryMax: 12500000,
    scope: 'assigned_orders',
  },
  {
    department: 'Tổ Kiểm duyệt & Xác nhận Đơn hàng',
    position: 'Nhân viên Kiểm duyệt Đơn Miền Bắc',
    salaryMin: 9500000,
    salaryMax: 11500000,
    scope: 'region_north',
  },
  {
    department: 'Tổ Kiểm duyệt & Xác nhận Đơn hàng',
    position: 'Nhân viên Kiểm duyệt Đơn Miền Trung',
    salaryMin: 9500000,
    salaryMax: 11500000,
    scope: 'region_central',
  },
  {
    department: 'Tổ Kiểm duyệt & Xác nhận Đơn hàng',
    position: 'Nhân viên Kiểm duyệt Đơn Miền Nam',
    salaryMin: 9500000,
    salaryMax: 11500000,
    scope: 'region_south',
  },
  {
    department: 'Bộ phận Điều phối & Liên kết Vendor',
    position: 'Chuyên viên Điều phối Đơn cho Vendor',
    salaryMin: 12500000,
    salaryMax: 15000000,
    scope: 'assigned_orders',
  },
  {
    department: 'Bộ phận Điều phối & Liên kết Vendor',
    position: 'Nhân viên Giám sát Tiến độ VendorOrder',
    salaryMin: 10500000,
    salaryMax: 12500000,
    scope: 'assigned_orders',
  },
  {
    department: 'Bộ phận Xử lý Sự cố & Ngoại lệ Đơn',
    position: 'Chuyên viên Xử lý Ngoại lệ & Tranh chấp Đơn',
    salaryMin: 13500000,
    salaryMax: 16500000,
    scope: 'high_value_orders',
  },
  {
    department: 'Bộ phận Xử lý Sự cố & Ngoại lệ Đơn',
    position: 'Nhân viên Tiếp nhận & Chuyển tiếp Sự cố',
    salaryMin: 9500000,
    salaryMax: 11500000,
    scope: 'assigned_orders',
  },
];

export const EMPLOYEE_DEFAULT_PERMISSIONS = {
  auth: {
    canLogin: true,
  },
  orders: {
    canViewAssignedList: true,
    canViewDetail: true,
    canConfirmOrder: true,
    canRejectUnconfirmed: true,
    canTransferToVendor: true,
    canTrackVendorOrder: true,
    canViewStatusHistory: true,
    canHandleExceptions: true,
  },
  restrictions: {
    canManageUsers: false,
    canManageVendors: false,
    canManageEmployees: false,
    canManageProducts: false,
    canManageCategories: false,
    canManageVouchers: false,
    canManageSurveys: false,
    canAccessAdminPanel: false,
  },
};

export function generateEmployees(admins: GeneratedAdmin[]) {
  const passwordHash = bcrypt.hashSync(CONFIG.defaultPassword, 10);
  const baseDate = CONFIG.dateRange.start;
  const count = CONFIG.counts.employeeUsers;

  const employees: GeneratedEmployee[] = [];

  for (let i = 1; i <= count; i++) {
    const roleInfo = EMPLOYEE_ROLES_CATALOG[(i - 1) % EMPLOYEE_ROLES_CATALOG.length];
    const created = faker.date.between({ from: baseDate, to: new Date('2025-06-01') });
    const hireDate = faker.date.between({ from: new Date('2024-01-01'), to: created });
    const birthDate = faker.date.between({ from: new Date('1990-01-01'), to: new Date('2002-12-31') });
    const gender = faker.helpers.arrayElement(['male', 'female'] as const);

    // 13 active, 2 inactive (e.g. employee 14, 15 are locked by Admin for demo)
    const isLocked = i >= count - 1;
    const status: 'active' | 'inactive' = isLocked ? 'inactive' : 'active';

    // Salary rounded to hundred thousand VND
    const rawSalary = faker.number.int({ min: roleInfo.salaryMin, max: roleInfo.salaryMax });
    const salary = Math.round(rawSalary / 100000) * 100000;

    // 12-digit citizen ID (CCCD)
    const citizenId = `0${faker.number.int({ min: 10, max: 99 })}0${faker.number.int({ min: 1990, max: 2002 })}${faker.string.numeric(6)}`;

    // Associated creator Admin
    const creatorAdmin = faker.helpers.arrayElement(admins);

    employees.push({
      id: faker.string.uuid(),
      employeeCode: `EMP${String(i).padStart(3, '0')}`,
      fullName: vnFullName(),
      email: `employee${i}@miva.vn`,
      password: passwordHash,
      phone: vnPhone(),
      avatarUrl: faker.image.avatar(),
      dateOfBirth: birthDate,
      gender,
      citizenId,
      address: vnAddress(),
      department: roleInfo.department,
      position: roleInfo.position,
      employmentType: i > 12 ? 'part_time' : 'full_time',
      salary: i > 12 ? 0 : salary,
      hourlyRate: i > 12 ? 50000 : null,
      hireDate,
      status,
      assignedOrderScope: roleInfo.scope,
      permissions: EMPLOYEE_DEFAULT_PERMISSIONS,
      adminId: creatorAdmin.id,
      createdAt: created,
      updatedAt: created,
      deletedAt: null,
    });
  }

  const sql = sqlSection('Employees', employees.length) + buildInsert('Employee', employees);

  return { employees, sql };
}
