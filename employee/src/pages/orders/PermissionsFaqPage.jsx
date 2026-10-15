import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Info } from 'lucide-react';

export const PermissionsFaqPage = () => {
  const allowedPermissions = [
    { title: 'Đăng nhập hệ thống', desc: 'Sử dụng tài khoản email nội bộ @miva.vn và mã nhân viên để truy cập cổng port 5176.' },
    { title: 'Xem danh sách đơn hàng được phân quyền', desc: 'Truy cập các đơn hàng thuộc phạm vi quản lý (assignedOrderScope: Toàn quốc, Miền Bắc, Miền Trung, Miền Nam, hoặc Đơn giá trị cao).' },
    { title: 'Xem chi tiết đơn hàng', desc: 'Xem thông tin khách hàng, địa chỉ giao hàng, danh sách sản phẩm, thanh toán và lịch sử trạng thái.' },
    { title: 'Xác nhận đơn hàng (Pending → Confirmed)', desc: 'Xác minh tồn kho, gọi điện xác nhận thông tin người nhận trước khi duyệt đơn.' },
    { title: 'Từ chối đơn chưa xác nhận theo quy tắc', desc: 'Chỉ được phép từ chối đơn hàng đang ở trạng thái Pending nếu thỏa mãn quy tắc (hết hàng, spam, sai địa chỉ, không nghe máy).' },
    { title: 'Chuyển đơn cho Vendor (Confirmed → Processing)', desc: 'Chỉ định kho/nhà cung cấp đối tác xuất hàng và thiết lập thời hạn cam kết đóng gói (SLA).' },
    { title: 'Theo dõi tiến độ VendorOrder', desc: 'Giám sát quá trình chuẩn bị hàng, đốc thúc đối tác khi có nguy cơ trễ SLA cam kết.' },
    { title: 'Xem lịch sử trạng thái (Audit Log)', desc: 'Theo dõi toàn bộ nhật ký thao tác kiểm toán từ lúc tạo đơn đến khi hoàn thành.' },
    { title: 'Xử lý hoặc chuyển tiếp sự cố trong thẩm quyền', desc: 'Tự khắc phục các sự cố điều phối thông thường hoặc báo cáo chuyển tiếp lên Quản trị viên (Admin) đối với tranh chấp lớn.' },
  ];

  const restrictedPermissions = [
    { title: 'Quản lý người dùng (User Management)', desc: 'Không được tạo, sửa, xóa hoặc khóa tài khoản khách hàng.' },
    { title: 'Quản lý nhà cung cấp (Vendor Management)', desc: 'Không được duyệt hồ sơ, tạo mới hoặc đình chỉ tài khoản đối tác Vendor.' },
    { title: 'Quản lý nhân viên (Employee Management)', desc: 'Không được xem danh sách tuyển dụng, tạo mới, chỉnh sửa thông tin hoặc phân bổ lương nhân viên.' },
    { title: 'Quản lý sản phẩm (Product Management)', desc: 'Không được tạo mới, chỉnh sửa giá bán hoặc xóa sản phẩm khỏi sàn.' },
    { title: 'Quản lý danh mục (Category Management)', desc: 'Không được can thiệp vào cấu trúc danh mục ngành hàng của sàn.' },
    { title: 'Quản lý mã giảm giá (Voucher Management)', desc: 'Không được tạo, kích hoạt hoặc phân bổ mã khuyến mãi của nền tảng.' },
    { title: 'Quản lý khảo sát (Survey CRM)', desc: 'Không được tạo hoặc gửi chiến dịch khảo sát CRM đến khách hàng.' },
    { title: 'Truy cập trung tâm quản trị Admin (:5174)', desc: 'Bị từ chối truy cập mọi trang điều hành cấp cao của Quản trị viên tối cao.' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <h2 className="text-xl font-black text-slate-800">Quy Định Phân Quyền & Giới Hạn Nghiệp Vụ Nhân Viên</h2>
        <p className="text-xs text-slate-500 mt-1">
          Hệ thống Miva tuân thủ nguyên tắc đặc quyền tối thiểu (Principle of Least Privilege - PoLP) nhằm đảm bảo an toàn vận hành.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Allowed */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center space-x-2.5 text-emerald-700 font-bold border-b border-emerald-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm">Quyền hạn ĐƯỢC PHÉP thực hiện</h3>
          </div>
          <div className="space-y-3">
            {allowedPermissions.map((perm, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">{perm.title}</p>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{perm.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Restricted */}
        <div className="bg-white rounded-2xl border border-rose-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center space-x-2.5 text-rose-700 font-bold border-b border-rose-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm">Hành vi KHÔNG ĐƯỢC PHÉP (Bị chặn)</h3>
          </div>
          <div className="space-y-3">
            {restrictedPermissions.map((perm, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 text-xs">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">{perm.title}</p>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{perm.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
