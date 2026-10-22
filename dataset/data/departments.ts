/**
 * Master catalog of organizational departments and position definitions for MIVA Marketplace.
 * Simplified strictly to 3 core operational departments as required:
 *  1. Bộ phận Điều phối & Liên kết Vendor (Tiếp nhận & chuyển đơn cho Vendor)
 *  2. Phòng Vận chuyển & Giao nhận (Nhận đơn từ Vendor & đi giao hàng)
 *  3. Bộ phận Xử lý Sự cố & Ngoại lệ Đơn (Quản lý các đơn hàng có sự cố, tranh chấp)
 */

export interface PositionSpec {
  title: string;
  salaryMin: number;
  salaryMax: number;
  assignedOrderScope: string;
  isManager?: boolean;
  isShipping?: boolean;
}

export interface DepartmentDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  positions: PositionSpec[];
}

export const DEPARTMENTS: DepartmentDefinition[] = [
  // 1. Ban Điều phối & Liên kết Vendor
  {
    id: 'dept-vendor-link',
    name: 'Bộ phận Điều phối & Liên kết Vendor',
    code: 'VENDOR_LINK',
    description: 'Chịu trách nhiệm tiếp nhận đơn hàng mới từ người mua, kiểm duyệt tính hợp lệ, xác nhận đơn và điều phối chia kiện chuyển cho đối tác Vendor đóng gói.',
    positions: [
      {
        title: 'Trưởng nhóm Điều phối & Liên kết Vendor',
        salaryMin: 16000000,
        salaryMax: 19000000,
        assignedOrderScope: 'all_orders',
        isManager: true,
      },
      {
        title: 'Chuyên viên Điều phối Đơn cho Vendor',
        salaryMin: 13000000,
        salaryMax: 15500000,
        assignedOrderScope: 'assigned_orders',
      },
      {
        title: 'Nhân viên Tiếp nhận & Xác nhận Đơn hàng',
        salaryMin: 10500000,
        salaryMax: 13000000,
        assignedOrderScope: 'assigned_orders',
      },
      {
        title: 'Nhân viên Giám sát Tiến độ VendorOrder',
        salaryMin: 10000000,
        salaryMax: 12500000,
        assignedOrderScope: 'assigned_orders',
      },
    ],
  },

  // 2. Ban Giao hàng (Phòng Vận chuyển & Giao nhận)
  {
    id: 'dept-shipping',
    name: 'Phòng Vận chuyển & Giao nhận',
    code: 'SHIPPING',
    description: 'Tiếp nhận kiện hàng từ Vendor sau khi đóng gói hoàn tất, tiến hành luân chuyển qua Hub logistics MIVA Express và đi giao hàng tận nơi cho người mua, cập nhật tiến độ vận đơn.',
    positions: [
      {
        title: 'Trưởng nhóm Điều phối Vận chuyển',
        salaryMin: 15000000,
        salaryMax: 18000000,
        assignedOrderScope: 'all_orders',
        isManager: true,
        isShipping: true,
      },
      {
        title: 'Nhân viên Giao hàng Nội bộ (Shipper Hà Nội)',
        salaryMin: 11500000,
        salaryMax: 14000000,
        assignedOrderScope: 'assigned_orders',
        isShipping: true,
      },
      {
        title: 'Nhân viên Giao hàng Nội bộ (Shipper TP.HCM)',
        salaryMin: 12000000,
        salaryMax: 14500000,
        assignedOrderScope: 'assigned_orders',
        isShipping: true,
      },
      {
        title: 'Nhân viên Giao hàng Nội bộ (Shipper Đà Nẵng)',
        salaryMin: 11000000,
        salaryMax: 13500000,
        assignedOrderScope: 'assigned_orders',
        isShipping: true,
      },
      {
        title: 'Bưu tá Giao hàng Nhanh MIVA Express',
        salaryMin: 12500000,
        salaryMax: 15000000,
        assignedOrderScope: 'assigned_orders',
        isShipping: true,
      },
    ],
  },

  // 3. Ban Quản lý Sự cố (Bộ phận Xử lý Sự cố & Ngoại lệ Đơn)
  {
    id: 'dept-exceptions',
    name: 'Bộ phận Xử lý Sự cố & Ngoại lệ Đơn',
    code: 'EXCEPTIONS',
    description: 'Quản lý và giải quyết toàn bộ các tình huống phát sinh sự cố, khiếu nại khách hàng, bom hàng, lỗi giao nhận, hoàn trả hàng và chuyển tiếp hồ sơ lên Admin khi cần thiết.',
    positions: [
      {
        title: 'Trưởng bộ phận Xử lý Sự cố Đơn hàng',
        salaryMin: 16500000,
        salaryMax: 19500000,
        assignedOrderScope: 'all_orders',
        isManager: true,
      },
      {
        title: 'Chuyên viên Xử lý Tranh chấp & Bom hàng',
        salaryMin: 13500000,
        salaryMax: 16000000,
        assignedOrderScope: 'assigned_orders',
      },
      {
        title: 'Chuyên viên Đối soát Hoàn hàng & Bồi hoàn',
        salaryMin: 12500000,
        salaryMax: 15000000,
        assignedOrderScope: 'assigned_orders',
      },
      {
        title: 'Nhân viên Tiếp nhận Khiếu nại & Sự cố Vận đơn',
        salaryMin: 10000000,
        salaryMax: 12000000,
        assignedOrderScope: 'assigned_orders',
      },
    ],
  },
];
