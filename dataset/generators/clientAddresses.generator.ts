/**
 * Client Addresses generator.
 * Generates realistic delivery addresses for all clients.
 */
import { faker, vnPhone } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import type { GeneratedClient } from './users.generator';

export interface GeneratedClientAddress {
  id: string;
  clientId: string;
  receiverName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  province: string;
  label: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
}

const VN_LOCATIONS = [
  { province: 'TP. Hồ Chí Minh', district: 'Quận 1', ward: 'Phường Bến Nghé', streets: ['Nguyễn Huệ', 'Lê Lợi', 'Đồng Khởi', 'Pasteur'] },
  { province: 'TP. Hồ Chí Minh', district: 'Quận 3', ward: 'Phường Võ Thị Sáu', streets: ['Nam Kỳ Khởi Nghĩa', 'Võ Văn Tần', 'Nguyễn Thị Minh Khai'] },
  { province: 'TP. Hồ Chí Minh', district: 'Quận 7', ward: 'Phường Tân Phong', streets: ['Nguyễn Văn Linh', 'Nguyễn Thị Thập', 'Lê Văn Lương'] },
  { province: 'TP. Hồ Chí Minh', district: 'Quận Bình Thạnh', ward: 'Phường 25', streets: ['Điện Biên Phủ', 'Xô Viết Nghệ Tĩnh', 'Đinh Bộ Lĩnh'] },
  { province: 'TP. Hồ Chí Minh', district: 'Quận Tân Bình', ward: 'Phường 2', streets: ['Trường Sơn', 'Cộng Hòa', 'Hoàng Văn Thụ'] },
  { province: 'Hà Nội', district: 'Quận Hoàn Kiếm', ward: 'Phường Tràng Tiền', streets: ['Tràng Tiền', 'Đinh Tiên Hoàng', 'Bà Triệu', 'Hai Bà Trưng'] },
  { province: 'Hà Nội', district: 'Quận Ba Đình', ward: 'Phường Điện Biên', streets: ['Hoàng Diệu', 'Điện Biên Phủ', 'Đội Cấn', 'Kim Mã'] },
  { province: 'Hà Nội', district: 'Quận Cầu Giấy', ward: 'Phường Dịch Vọng', streets: ['Xuân Thủy', 'Cầu Giấy', 'Trần Thái Tông', 'Duy Tân'] },
  { province: 'Hà Nội', district: 'Quận Đống Đa', ward: 'Phường Láng Hạ', streets: ['Láng Hạ', 'Thái Hà', 'Huỳnh Thúc Kháng', 'Chùa Bộc'] },
  { province: 'Đà Nẵng', district: 'Quận Hải Châu', ward: 'Phường Hải Châu 1', streets: ['Bạch Đằng', 'Trần Phú', 'Lê Duẩn', 'Nguyễn Văn Linh'] },
  { province: 'Đà Nẵng', district: 'Quận Thanh Khê', ward: 'Phường Chính Gián', streets: ['Điện Biên Phủ', 'Hà Huy Tập', 'Lê Độ'] },
  { province: 'Hải Phòng', district: 'Quận Hồng Bàng', ward: 'Phường Hoàng Văn Thụ', streets: ['Đinh Tiên Hoàng', 'Hoàng Văn Thụ', 'Lạch Tray'] },
  { province: 'Cần Thơ', district: 'Quận Ninh Kiều', ward: 'Phường Tân An', streets: ['Đại Lộ Hòa Bình', '30 Tháng 4', 'Nguyễn Trãi'] },
];

export function generateClientAddresses(clients: GeneratedClient[]) {
  const addresses: GeneratedClientAddress[] = [];

  for (const client of clients) {
    const loc1 = faker.helpers.arrayElement(VN_LOCATIONS);
    const street1 = faker.helpers.arrayElement(loc1.streets);
    const num1 = faker.number.int({ min: 1, max: 250 });
    const defaultPhone = client.phone || vnPhone();

    // Default Home Address
    addresses.push({
      id: faker.string.uuid(),
      clientId: client.id,
      receiverName: client.fullName,
      phone: defaultPhone,
      addressLine: `${num1} ${street1}`,
      ward: loc1.ward,
      district: loc1.district,
      province: loc1.province,
      label: 'Nhà riêng',
      isDefault: true,
      createdAt: client.createdAt,
      updatedAt: client.createdAt,
      deletedAt: null,
    });

    // 40% chance of a second (Office) address
    if (faker.datatype.boolean(0.4)) {
      const loc2 = faker.helpers.arrayElement(VN_LOCATIONS);
      const street2 = faker.helpers.arrayElement(loc2.streets);
      const num2 = faker.number.int({ min: 1, max: 250 });

      addresses.push({
        id: faker.string.uuid(),
        clientId: client.id,
        receiverName: client.fullName,
        phone: defaultPhone,
        addressLine: `Tòa nhà văn phòng, ${num2} ${street2}`,
        ward: loc2.ward,
        district: loc2.district,
        province: loc2.province,
        label: 'Văn phòng',
        isDefault: false,
        createdAt: new Date(client.createdAt.getTime() + 86400000 * 5),
        updatedAt: new Date(client.createdAt.getTime() + 86400000 * 5),
        deletedAt: null,
      });
    }
  }

  const sql = addresses.length > 0
    ? sqlSection('Client Addresses', addresses.length) + buildInsert('ClientAddress', addresses)
    : '';

  return { data: addresses, sql };
}
