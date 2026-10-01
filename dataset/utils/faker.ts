/**
 * Deterministic Faker instance.
 * All generators import from this file to ensure reproducible output.
 */
import { Faker, vi, en } from '@faker-js/faker';
import { CONFIG } from '../config/dataset.config';

export const faker = new Faker({ locale: [vi, en] });
faker.seed(CONFIG.fakerSeed);

// ── Vietnamese helpers ──────────────────────────────────────────

const PHONE_PREFIXES = [
  '090', '091', '093', '094', '096', '097', '098',
  '032', '033', '034', '035', '036', '037', '038', '039',
  '070', '076', '077', '078', '079',
  '081', '082', '083', '084', '085', '086', '088', '089',
  '056', '058', '059',
];

const VN_STREETS = [
  'Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng',
  'Điện Biên Phủ', 'Nguyễn Trãi', 'Lý Thường Kiệt', 'Ngô Quyền',
  'Bà Triệu', 'Phạm Ngũ Lão', 'Lê Duẩn', 'Hoàng Diệu',
  'Phan Đình Phùng', 'Cách Mạng Tháng 8', 'Pasteur',
  'Nguyễn Đình Chiểu', 'Võ Văn Tần', 'Nam Kỳ Khởi Nghĩa',
  'Nguyễn Thị Minh Khai', 'Lê Văn Sỹ', 'Trường Chinh',
];

const VN_DISTRICTS = [
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10',
  'Quận Bình Thạnh', 'Quận Tân Bình', 'Quận Phú Nhuận',
  'Quận Gò Vấp', 'Quận Thủ Đức', 'Quận Hoàn Kiếm',
  'Quận Ba Đình', 'Quận Đống Đa', 'Quận Cầu Giấy',
  'Quận Hải Châu', 'Quận Thanh Khê', 'Quận Ninh Kiều',
];

const VN_CITIES = [
  'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng',
  'Cần Thơ', 'Nha Trang', 'Huế', 'Biên Hòa', 'Bắc Ninh',
  'Vũng Tàu', 'Buôn Ma Thuột', 'Đà Lạt',
];

export function vnPhone(): string {
  return faker.helpers.arrayElement(PHONE_PREFIXES) + faker.string.numeric(7);
}

export function vnAddress(): string {
  const num = faker.number.int({ min: 1, max: 300 });
  const street = faker.helpers.arrayElement(VN_STREETS);
  const district = faker.helpers.arrayElement(VN_DISTRICTS);
  const city = faker.helpers.arrayElement(VN_CITIES);
  return `${num} ${street}, ${district}, ${city}`;
}

export function vnFullName(): string {
  return faker.person.fullName();
}
