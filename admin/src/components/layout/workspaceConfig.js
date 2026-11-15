import {
  LineChart,
  Store,
  ShoppingCart,
  Tags,
  UserCheck,
  Users,
  ClipboardList,
} from 'lucide-react';

export const WORKSPACE_GROUPS = [
  {
    title: 'PHÂN TÍCH & TĂNG TRƯỞNG',
    items: [
      {
        name: 'Tổng quan & Phân tích',
        path: '/analytics',
        icon: LineChart,
        subtitle: 'Doanh thu sàn, hiệu suất vận hành và phân tích hành vi khách hàng',
      },
    ],
  },
  {
    title: 'THƯƠNG MẠI & VẬN HÀNH SÀN',
    items: [
      {
        name: 'Đối tác Vendor',
        path: '/vendors',
        icon: Store,
        subtitle: 'Quản lý gian hàng đang hoạt động, duyệt đăng ký và gia hạn gói',
      },
      {
        name: 'Đơn hàng & Vận chuyển',
        path: '/orders',
        icon: ShoppingCart,
        subtitle: 'Điều phối hóa đơn tổng, đối soát tài chính và hành trình vận đơn',
      },
      {
        name: 'Danh mục & Khuyến mãi',
        path: '/catalog',
        icon: Tags,
        subtitle: 'Quản trị danh mục ngành hàng và chương trình mã giảm giá toàn sàn',
      },
    ],
  },
  {
    title: 'NHÂN SỰ & KHÁCH HÀNG',
    items: [
      {
        name: 'Nhân sự & Tiền lương',
        path: '/employees',
        icon: UserCheck,
        subtitle: 'Hồ sơ nhân viên, phân quyền ca trực và chốt bảng lương hàng tháng',
      },
      {
        name: 'Khách hàng',
        path: '/users',
        icon: Users,
        subtitle: 'Quản lý tài khoản người dùng, phân loại vai trò và trạng thái hoạt động',
      },
      {
        name: 'Khảo sát & Đánh giá',
        path: '/surveys',
        icon: ClipboardList,
        subtitle: 'Chiến dịch khảo sát trải nghiệm CRM và kiểm duyệt đánh giá sao sản phẩm',
      },
    ],
  },
];

export const ALL_WORKSPACES = WORKSPACE_GROUPS.flatMap((group) => group.items);

export function getWorkspaceByPathname(pathname = '') {
  return (
    ALL_WORKSPACES.find(
      (ws) => pathname === ws.path || pathname.startsWith(`${ws.path}/`),
    ) || ALL_WORKSPACES[0]
  );
}
