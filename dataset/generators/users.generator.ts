/**
 * Users generator — Admin, Vendor, Client users.
 */
import { faker, vnPhone, vnAddress, vnFullName } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { CONFIG } from '../config/dataset.config';
import bcrypt from 'bcryptjs';

export interface GeneratedAdmin {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string | null;
  avatarUrl: string | null;
  department: string | null;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
}

export interface GeneratedVendor {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string | null;
  avatarUrl: string | null;
  storeName: string | null;
  taxId: string | null;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
}

export interface GeneratedClient {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string | null;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  loyaltyPoints: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
}

const VENDOR_NAMES = [
  'Thời trang Hà Nội', 'Shop Minh Phát', 'Cửa hàng Đại Phong',
  'Store Thanh Tâm', 'Digital World VN', 'TechZone Việt Nam',
  'Công nghệ Bình Minh', 'Fashion Style SG', 'Giày Việt Premium',
  'Balo Sài Gòn', 'Mỹ phẩm Hàn Quốc', 'Gia dụng Thông Minh',
  'Sport Plus VN', 'Sách Hay Online', 'Baby Shop Việt Nam',
  'Phụ kiện Trendy', 'Laptop Store HCM', 'Đồ gia dụng Nhật',
  'Audio House VN', 'Nhà sách Tri Thức', 'Beauty Corner VN',
  'Outdoor Gear VN', 'Mom & Baby Care', 'Watch Gallery VN',
  'Điện thoại Số 1',
];

export function generateUsers() {
  const passwordHash = bcrypt.hashSync(CONFIG.defaultPassword, 10);
  const baseDate = CONFIG.dateRange.start;

  // ── Admins ──
  const admins: GeneratedAdmin[] = [];
  for (let i = 1; i <= CONFIG.counts.adminUsers; i++) {
    const created = faker.date.between({ from: baseDate, to: new Date('2025-03-01') });
    admins.push({
      id: faker.string.uuid(),
      fullName: `Admin ${i}`,
      email: `admin${i}@miva.vn`,
      password: passwordHash,
      phone: vnPhone(),
      avatarUrl: faker.image.avatar(),
      department: 'System',
      status: 'active',
      createdAt: created,
      updatedAt: created,
      deletedAt: null,
    });
  }

  // ── Vendors ──
  const vendors: GeneratedVendor[] = [];
  for (let i = 0; i < CONFIG.counts.vendorUsers; i++) {
    const created = faker.date.between({ from: baseDate, to: new Date('2025-06-01') });
    vendors.push({
      id: faker.string.uuid(),
      fullName: VENDOR_NAMES[i],
      email: `vendor${i + 1}@miva.vn`,
      password: passwordHash,
      phone: vnPhone(),
      avatarUrl: faker.image.avatar(),
      storeName: VENDOR_NAMES[i],
      taxId: `TAX${faker.number.int({ min: 100000, max: 999999 })}`,
      status: 'active',
      createdAt: created,
      updatedAt: created,
      deletedAt: null,
    });
  }

  // ── Clients ──
  const clients: GeneratedClient[] = [];
  const usedEmails = new Set();
  for (let i = 0; i < CONFIG.counts.customerUsers; i++) {
    let email: string;
    do {
      email = faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.person.lastName() }).toLowerCase();
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const created = faker.date.between({ from: new Date('2025-03-01'), to: CONFIG.dateRange.end });
    clients.push({
      id: faker.string.uuid(),
      fullName: vnFullName(),
      email,
      password: passwordHash,
      phone: faker.datatype.boolean(0.9) ? vnPhone() : null,
      avatarUrl: faker.image.avatar(),
      dateOfBirth: faker.date.past({ years: 30 }),
      gender: faker.helpers.arrayElement(['male', 'female']),
      loyaltyPoints: faker.number.int({ min: 0, max: 1000 }),
      status: faker.datatype.boolean(0.95) ? 'active' : 'inactive',
      createdAt: created,
      updatedAt: created,
      deletedAt: null,
    });
  }

  let sql = '';
  sql += sqlSection('Admins', admins.length) + buildInsert('Admin', admins);
  sql += sqlSection('Clients', clients.length) + buildInsert('Client', clients);
  sql += sqlSection('Vendors', vendors.length) + buildInsert('Vendor', vendors);

  return { admins, vendors, clients, sql };
}
