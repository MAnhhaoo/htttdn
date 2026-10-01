/**
 * Users generator — Admin, Vendor, Customer users.
 */
import { faker, vnPhone, vnAddress, vnFullName } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import { CONFIG } from '../config/dataset.config';
import bcrypt from 'bcryptjs';

export interface GeneratedUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  address: string | null;
  phone: string | null;
  role: 'customer' | 'vendor' | 'admin';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
  createdBy: string | null;
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
  const users: GeneratedUser[] = [];
  const baseDate = CONFIG.dateRange.start;

  // ── Admins ──
  for (let i = 1; i <= CONFIG.counts.adminUsers; i++) {
    const created = faker.date.between({ from: baseDate, to: new Date('2025-03-01') });
    users.push({
      id: faker.string.uuid(),
      fullName: `Admin ${i}`,
      email: `admin${i}@miva.vn`,
      password: passwordHash,
      address: vnAddress(),
      phone: vnPhone(),
      role: 'admin',
      status: 'active',
      createdAt: created,
      updatedAt: created,
      deletedAt: null,
      createdBy: null,
    });
  }

  // ── Vendors ──
  for (let i = 0; i < CONFIG.counts.vendorUsers; i++) {
    const created = faker.date.between({ from: baseDate, to: new Date('2025-06-01') });
    users.push({
      id: faker.string.uuid(),
      fullName: VENDOR_NAMES[i],
      email: `vendor${i + 1}@miva.vn`,
      password: passwordHash,
      address: vnAddress(),
      phone: vnPhone(),
      role: 'vendor',
      status: 'active',
      createdAt: created,
      updatedAt: created,
      deletedAt: null,
      createdBy: null,
    });
  }

  // ── Customers ──
  const usedEmails = new Set(users.map((u) => u.email));
  for (let i = 0; i < CONFIG.counts.customerUsers; i++) {
    let email: string;
    do {
      email = faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.person.lastName() }).toLowerCase();
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const created = faker.date.between({ from: new Date('2025-03-01'), to: CONFIG.dateRange.end });
    users.push({
      id: faker.string.uuid(),
      fullName: vnFullName(),
      email,
      password: passwordHash,
      address: faker.datatype.boolean(0.8) ? vnAddress() : null,
      phone: faker.datatype.boolean(0.9) ? vnPhone() : null,
      role: 'customer',
      status: faker.datatype.boolean(0.95) ? 'active' : 'inactive',
      createdAt: created,
      updatedAt: created,
      deletedAt: null,
      createdBy: null,
    });
  }

  const admins = users.filter((u) => u.role === 'admin');
  const vendors = users.filter((u) => u.role === 'vendor');
  const customers = users.filter((u) => u.role === 'customer');

  const sql = sqlSection('Users', users.length) + buildInsert('User', users);

  return { data: users, admins, vendors, customers, sql };
}
