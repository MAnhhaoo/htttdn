/**
 * Employees generator.
 * Uses official real corporate dataset definitions from ../data/employeeCatalog and ../data/departments.
 */
import bcrypt from 'bcryptjs';
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { CONFIG } from '../config/dataset.config';
import type { GeneratedAdmin } from './users.generator';
import { EMPLOYEE_CATALOG } from '../data/employeeCatalog';

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
  employmentType: 'full_time' | 'part_time';
  salary: number;
  hourlyRate: number | null;
  hireDate: Date;
  status: 'active' | 'inactive';
  assignedOrderScope: string;
  permissions: Record<string, unknown>;
  adminId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
}

export function getPermissionsByDepartment(department: string): Record<string, unknown> {
  const isVendorLink = department === 'Bộ phận Điều phối & Liên kết Vendor';
  const isShipping = department === 'Phòng Vận chuyển & Giao nhận';
  const isExceptions = department === 'Bộ phận Xử lý Sự cố & Ngoại lệ Đơn';

  return {
    auth: {
      canLogin: true,
    },
    orders: {
      canViewAssignedList: true,
      canViewDetail: true,
      canConfirmOrder: isVendorLink,
      canRejectUnconfirmed: isExceptions,
      canTransferToVendor: isVendorLink,
      canTrackVendorOrder: isVendorLink || isExceptions,
      canViewStatusHistory: true,
      canHandleExceptions: isExceptions,
    },
    shipping: {
      canViewShipments: isShipping,
      canPickupParcel: isShipping,
      canDeliverParcel: isShipping,
      canReportDeliveryException: isShipping,
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
}

export function generateEmployees(admins: GeneratedAdmin[]) {
  const passwordHash = bcrypt.hashSync(CONFIG.defaultPassword, 10);
  const baseDate = CONFIG.dateRange.start;
  const count = Math.min(CONFIG.counts.employeeUsers, EMPLOYEE_CATALOG.length);

  const employees: GeneratedEmployee[] = [];

  for (let i = 0; i < count; i++) {
    const raw = EMPLOYEE_CATALOG[i];
    const created = faker.date.between({ from: baseDate, to: new Date('2025-06-01') });
    const hireDate = faker.date.between({ from: new Date('2024-01-01'), to: created });
    const birthDate = faker.date.between({ from: new Date('1990-01-01'), to: new Date('2002-12-31') });
    const creatorAdmin = faker.helpers.arrayElement(admins);

    employees.push({
      id: faker.string.uuid(),
      employeeCode: raw.employeeCode,
      fullName: raw.fullName,
      email: raw.email,
      password: passwordHash,
      phone: raw.phone,
      avatarUrl: faker.image.avatar(),
      dateOfBirth: birthDate,
      gender: raw.gender,
      citizenId: raw.citizenId,
      address: raw.address,
      department: raw.department,
      position: raw.position,
      employmentType: raw.employmentType,
      salary: raw.salary,
      hourlyRate: raw.hourlyRate,
      hireDate,
      status: raw.status,
      assignedOrderScope: raw.assignedOrderScope,
      permissions: getPermissionsByDepartment(raw.department),
      adminId: creatorAdmin.id,
      createdAt: created,
      updatedAt: created,
      deletedAt: null,
    });
  }

  const sql = sqlSection('Employees', employees.length) + buildInsert('Employee', employees);

  return { employees, sql };
}
