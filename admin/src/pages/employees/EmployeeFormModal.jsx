import { useState } from 'react';
import { Modal, Button, Input, Select } from '../../components/ui';
import { 
  User, Mail, Phone, Lock, DollarSign, Clock, ShieldCheck, 
  Building2, Briefcase, Calendar, MapPin, CreditCard, AlertCircle
} from 'lucide-react';

const PERMISSION_OPTIONS = [
  { key: 'orders_read', label: 'Xem danh sách & chi tiết đơn hàng', desc: 'Cho phép nhân viên xem danh sách các đơn hàng được phân quyền' },
  { key: 'orders_confirm', label: 'Xác nhận đơn hàng', desc: 'Cho phép duyệt đơn hàng từ trạng thái chờ duyệt sang đã xác nhận' },
  { key: 'orders_dispatch', label: 'Chuyển đơn cho Vendor', desc: 'Cho phép chia tách và gửi đơn hàng cho các đối tác bán hàng' },
  { key: 'orders_reject', label: 'Từ chối đơn chưa xác nhận', desc: 'Hủy hoặc từ chối các đơn vi phạm chính sách hoặc sai lệch thông tin' },
  { key: 'orders_issue_handle', label: 'Xử lý sự cố / Khiếu nại đơn', desc: 'Xử lý phản hồi đơn hàng, sự cố phát sinh trong phạm vi quyền hạn' },
  { key: 'shipping_manage', label: 'Điều phối & Xử lý vận chuyển nội bộ', desc: 'Tiếp nhận đơn điều phối vận chuyển, chuyển trạng thái giao hàng' },
];

export default function EmployeeFormModal({ isOpen, onClose, onSave, employeeToEdit }) {
  const isEditing = Boolean(employeeToEdit);

  const [formData, setFormData] = useState(() => {
    if (employeeToEdit) {
      return {
        fullName: employeeToEdit.fullName || '',
        email: employeeToEdit.email || '',
        password: '',
        phone: employeeToEdit.phone || '',
        citizenId: employeeToEdit.citizenId || '',
        address: employeeToEdit.address || '',
        department: employeeToEdit.department || 'Vận hành',
        position: employeeToEdit.position || 'Nhân viên',
        employmentType: employeeToEdit.employmentType || 'full_time',
        salary: employeeToEdit.salary ? Number(employeeToEdit.salary) : 0,
        hourlyRate: employeeToEdit.hourlyRate ? Number(employeeToEdit.hourlyRate) : 0,
        salaryAdjustmentReason: '',
        permissions: employeeToEdit.permissions || {
          orders_read: true,
          orders_confirm: true,
          orders_dispatch: true,
          orders_reject: false,
          orders_issue_handle: false,
          shipping_manage: true,
        },
      };
    }
    return {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      citizenId: '',
      address: '',
      department: 'Vận hành',
      position: 'Nhân viên xử lý đơn',
      employmentType: 'full_time',
      salary: 10000000,
      hourlyRate: 35000,
      salaryAdjustmentReason: '',
      permissions: {
        orders_read: true,
        orders_confirm: true,
        orders_dispatch: true,
        orders_reject: false,
        orders_issue_handle: false,
        shipping_manage: true,
      },
    };
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleTextChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions?.[key],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên nhân viên');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg('Vui lòng nhập email');
      return;
    }
    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      setErrorMsg('Mật khẩu ban đầu phải từ 6 ký tự');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        citizenId: formData.citizenId || null,
        address: formData.address || null,
        department: formData.department,
        position: formData.position,
        employmentType: formData.employmentType,
        salary: Number(formData.salary) || 0,
        hourlyRate: formData.employmentType === 'part_time' ? Number(formData.hourlyRate) || 0 : null,
        permissions: formData.permissions,
      };

      if (formData.password) {
        payload.password = formData.password;
      }
      if (isEditing && formData.salaryAdjustmentReason) {
        payload.salaryAdjustmentReason = formData.salaryAdjustmentReason;
      }

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi lưu nhân viên');
    } finally {
      setSubmitting(false);
    }
  };

  const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Chỉnh sửa nhân viên: ${employeeToEdit.employeeCode}` : 'Thêm Nhân Viên Mới'}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button 
            size="sm" 
            onClick={handleSubmit} 
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {submitting ? 'Đang lưu...' : isEditing ? 'Cập nhật thông tin' : 'Tạo tài khoản'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Thông tin cơ bản */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-600" />
            Thông Tin Cá Nhân &amp; Tài Khoản
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Họ và Tên <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleTextChange('fullName', e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Đăng Nhập <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleTextChange('email', e.target.value)}
                placeholder="employee@miva.vn"
                disabled={isEditing}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isEditing ? 'Đổi Mật Khẩu (để trống nếu giữ nguyên)' : 'Mật Khẩu Ban Đầu *'}
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleTextChange('password', e.target.value)}
                placeholder={isEditing ? '••••••••' : 'Tối thiểu 6 ký tự'}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Số Điện Thoại
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleTextChange('phone', e.target.value)}
                placeholder="0912345678"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Số CCCD / Định danh
              </label>
              <Input
                value={formData.citizenId}
                onChange={(e) => handleTextChange('citizenId', e.target.value)}
                placeholder="079200000001"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Địa Chỉ
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleTextChange('address', e.target.value)}
                placeholder="Số nhà, đường, quận/huyện..."
              />
            </div>
          </div>
        </div>

        {/* Vị trí & Hợp đồng Lương */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Vị Trí, Hình Thức Làm Việc &amp; Bảng Lương
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phòng Ban
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleTextChange('department', e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Vận hành">Phòng Vận Hành (Operations)</option>
                <option value="CSKH">Chăm Sóc Khách Hàng (Customer Care)</option>
                <option value="Kho vận">Kho Vận &amp; Giao Nhận (Logistics)</option>
                <option value="Kiểm duyệt">Kiểm Duyệt Sản Phẩm (Quality Control)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Chức Vụ
              </label>
              <Input
                value={formData.position}
                onChange={(e) => handleTextChange('position', e.target.value)}
                placeholder="VD: Điều phối viên đơn hàng"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Hình Thức Hợp Đồng Lao Động
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.employmentType === 'full_time'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="employmentType"
                    value="full_time"
                    checked={formData.employmentType === 'full_time'}
                    onChange={() => handleTextChange('employmentType', 'full_time')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">Toàn Thời Gian (Full-time)</span>
                    <span className="text-[11px] text-slate-500">Lương cố định tháng + phụ cấp</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.employmentType === 'part_time'
                    ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="employmentType"
                    value="part_time"
                    checked={formData.employmentType === 'part_time'}
                    onChange={() => handleTextChange('employmentType', 'part_time')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">Bán Thời Gian (Part-time)</span>
                    <span className="text-[11px] text-slate-500">Tính lương theo số giờ làm việc thực tế</span>
                  </div>
                </label>
              </div>
            </div>

            {formData.employmentType === 'full_time' ? (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mức Lương Cơ Bản Tháng (VNĐ / Tháng)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="500000"
                  value={formData.salary}
                  onChange={(e) => handleTextChange('salary', e.target.value)}
                  placeholder="10000000"
                />
                <span className="text-[11px] text-indigo-600 font-medium mt-1 block">
                  Định dạng: {formatVND(formData.salary)}
                </span>
              </div>
            ) : (
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đơn Giá Lương Theo Giờ (VNĐ / Giờ)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="5000"
                    value={formData.hourlyRate}
                    onChange={(e) => handleTextChange('hourlyRate', e.target.value)}
                    placeholder="35000"
                  />
                  <span className="text-[11px] text-amber-600 font-medium mt-1 block">
                    Định dạng: {formatVND(formData.hourlyRate)} / giờ
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lương Cơ Bản Dự Trù (Tối thiểu)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="500000"
                    value={formData.salary}
                    onChange={(e) => handleTextChange('salary', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {isEditing && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lý Do Điều Chỉnh Lương (Lưu vào lịch sử)
                </label>
                <Input
                  value={formData.salaryAdjustmentReason}
                  onChange={(e) => handleTextChange('salaryAdjustmentReason', e.target.value)}
                  placeholder="VD: Đánh giá hiệu suất định kỳ Quý 3, thăng chức..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Phân Quyền Hạn (Permissions Matrix) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Phân Quyền Thao Tác Nghiệp Vụ
          </h4>
          <p className="text-[11px] text-slate-400 mb-3">
            Admin toàn quyền thiết lập các hành động nhân viên này được phép thực hiện trên portal riêng của họ.
          </p>

          <div className="space-y-2">
            {PERMISSION_OPTIONS.map((perm) => (
              <label
                key={perm.key}
                className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={Boolean(formData.permissions?.[perm.key])}
                  onChange={() => handlePermissionToggle(perm.key)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {perm.label}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {perm.desc}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
