/**
 * OrderStatusHistory generator.
 * Builds a realistic transition log from 'pending' → current status,
 * strictly mapped to the 3 functional operational departments:
 *  1. Bộ phận Điều phối & Liên kết Vendor: Tiếp nhận, xác nhận & chuyển giao cho Vendor
 *  2. Phòng Vận chuyển & Giao nhận: Tiếp nhận kiện hàng từ Vendor & đi giao hàng
 *  3. Bộ phận Xử lý Sự cố & Ngoại lệ Đơn: Quản lý các đơn hàng có sự cố, khiếu nại, hủy/hoàn hàng
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import type { GeneratedOrder } from './orders.generator';
import type { GeneratedAdmin, GeneratedVendor, GeneratedClient } from './users.generator';
import type { GeneratedEmployee } from './employees.generator';

export interface GeneratedOrderStatusHistory {
  id: string;
  orderId: string;
  adminId: string | null;
  clientId: string | null;
  vendorId: string | null;
  employeeId: string | null;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: Date;
}

// Valid transition path from pending to each terminal status
const STATUS_PATHS: Record<string, string[]> = {
  pending: ['pending'],
  confirmed: ['pending', 'confirmed'],
  processing: ['pending', 'confirmed', 'processing'],
  shipping: ['pending', 'confirmed', 'processing', 'shipping'],
  completed: ['pending', 'confirmed', 'processing', 'shipping', 'completed'],
  cancelled: ['pending', 'cancelled'], // can cancel from pending
};

export function generateOrderStatusHistory(
  orders: GeneratedOrder[],
  admins: GeneratedAdmin[],
  vendors: GeneratedVendor[],
  clients: GeneratedClient[],
  employees?: GeneratedEmployee[],
) {
  const data: GeneratedOrderStatusHistory[] = [];

  // Phân chia rõ ràng đúng 3 ban nghiệp vụ
  const vendorLinkEmployees = employees?.filter(
    (e) => e.status === 'active' && e.department === 'Bộ phận Điều phối & Liên kết Vendor',
  ) || [];

  const shippingEmployees = employees?.filter(
    (e) => e.status === 'active' && e.department === 'Phòng Vận chuyển & Giao nhận',
  ) || [];

  const exceptionEmployees = employees?.filter(
    (e) => e.status === 'active' && e.department === 'Bộ phận Xử lý Sự cố & Ngoại lệ Đơn',
  ) || [];

  for (const order of orders) {
    const path = STATUS_PATHS[order.status] ?? ['pending'];
    let lastTime = order.createdAt.getTime();

    // Mỗi đơn hàng phân định rạch ròi nhân sự của 3 ban:
    const vendorLinkEmp = vendorLinkEmployees.length > 0
      ? faker.helpers.arrayElement(vendorLinkEmployees)
      : null;

    const deliveryEmp = shippingEmployees.length > 0
      ? faker.helpers.arrayElement(shippingEmployees)
      : null;

    const exceptionEmp = exceptionEmployees.length > 0
      ? faker.helpers.arrayElement(exceptionEmployees)
      : null;

    for (let i = 0; i < path.length; i++) {
      const fromStatus = i === 0 ? null : path[i - 1];
      const toStatus = path[i];

      let adminId: string | null = null;
      let clientId: string | null = null;
      let vendorId: string | null = null;
      let employeeId: string | null = null;
      let noteText: string | null = null;

      // 1. Khách hàng đặt đơn
      if (i === 0) {
        clientId = order.clientId;
        noteText = 'Khách hàng hoàn tất đặt đơn hàng trên sàn MIVA';
      }
      // 2. Tiếp nhận, xác nhận và chuyển qua Vendor (BẮT BUỘC: Bộ phận Điều phối & Liên kết Vendor)
      else if (toStatus === 'confirmed') {
        if (vendorLinkEmp && faker.datatype.boolean(0.85)) {
          employeeId = vendorLinkEmp.id;
          noteText = `Chuyên viên [${vendorLinkEmp.fullName}] (Bộ phận Điều phối & Liên kết Vendor) đã kiểm duyệt, xác nhận đơn hàng và tạo kiện chuyển cho Vendor`;
        } else {
          adminId = faker.helpers.arrayElement(admins).id;
          noteText = 'Quản trị viên đã phê duyệt đơn hàng và chuyển giao cho Vendor';
        }
      }
      // 3. Vendor nhận kiện hàng và tiến hành đóng gói
      else if (toStatus === 'processing') {
        vendorId = faker.helpers.arrayElement(vendors).id;
        noteText = 'Đối tác Vendor đã tiếp nhận đơn hàng từ bộ phận điều phối và đang tiến hành đóng gói';
      }
      // 4. Bưu tá giao nhận (BẮT BUỘC: Phòng Vận chuyển & Giao nhận) nhận hàng từ kho Vendor và giao
      else if (toStatus === 'shipping') {
        if (deliveryEmp && faker.datatype.boolean(0.9)) {
          employeeId = deliveryEmp.id;
          noteText = `Bưu tá [${deliveryEmp.fullName}] (Phòng Vận chuyển & Giao nhận) đã lấy hàng tại kho Vendor và bắt đầu vận chuyển`;
        } else {
          adminId = faker.helpers.arrayElement(admins).id;
          noteText = 'Đơn vị vận chuyển MIVA Express đã điều phối bưu tá và đang luân chuyển kiện hàng';
        }
      }
      // 5. Giao hàng thành công (BẮT BUỘC: Bưu tá xác nhận hoặc khách hàng nhận)
      else if (toStatus === 'completed') {
        if (deliveryEmp && faker.datatype.boolean(0.85)) {
          employeeId = deliveryEmp.id;
          noteText = `Bưu tá [${deliveryEmp.fullName}] (Phòng Vận chuyển & Giao nhận) đã giao hàng thành công đến người nhận`;
        } else {
          clientId = order.clientId;
          noteText = 'Người mua đã nhận hàng và xác nhận hoàn tất đơn hàng';
        }
      }
      // 6. Hủy đơn / Xử lý sự cố (BẮT BUỘC: Bộ phận Xử lý Sự cố & Ngoại lệ Đơn, hoặc khách hàng / Admin)
      else if (toStatus === 'cancelled') {
        const cancelType = faker.number.int({ min: 1, max: 3 });
        if (cancelType === 1 && exceptionEmp) {
          employeeId = exceptionEmp.id;
          noteText = `Chuyên viên [${exceptionEmp.fullName}] (Bộ phận Xử lý Sự cố & Ngoại lệ Đơn) đã tiếp nhận ngoại lệ và phê duyệt hủy/hoàn đơn`;
        } else if (cancelType === 2) {
          clientId = order.clientId;
          noteText = 'Khách hàng đã hủy đơn hàng';
        } else {
          adminId = faker.helpers.arrayElement(admins).id;
          noteText = 'Đơn hàng đã bị hủy bởi quản trị viên';
        }
      } else {
        adminId = faker.helpers.arrayElement(admins).id;
      }

      const createdAt = new Date(lastTime + faker.number.int({ min: 60000, max: 86400000 }));
      lastTime = createdAt.getTime();

      data.push({
        id: faker.string.uuid(),
        orderId: order.id,
        adminId,
        clientId,
        vendorId,
        employeeId,
        fromStatus,
        toStatus,
        note: noteText,
        createdAt,
      });
    }
  }

  const sql = sqlSection('OrderStatusHistory', data.length) + buildInsert('OrderStatusHistory', data);
  return { data, sql };
}
