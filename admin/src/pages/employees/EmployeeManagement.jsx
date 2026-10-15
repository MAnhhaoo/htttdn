import { useState, useEffect, useCallback } from 'react';
import { 
  Users, UserPlus, Search, Filter, Shield, MoreHorizontal, 
  Lock, Unlock, Edit, Trash2, TrendingUp, CheckCircle, XCircle, 
  Clock, DollarSign, Briefcase, RefreshCw, Loader2, ChevronLeft, ChevronRight,
  ShieldCheck, AlertCircle
} from 'lucide-react';
import { employeesApi } from '../../api';
import { Button, Input, Badge } from '../../components/ui';
import EmployeeFormModal from './EmployeeFormModal';
import SalaryHistoryModal from './SalaryHistoryModal';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [employeeForHistory, setEmployeeForHistory] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        itemPerPage: 10,
        ...(search ? { q: search } : {}),
        ...(departmentFilter ? { department: departmentFilter } : {}),
        ...(typeFilter ? { employmentType: typeFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      };

      const res = await employeesApi.getEmployees(params);
      if (res.data) {
        setEmployees(res.data.list || []);
        setTotalItems(res.data.totalItems || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, departmentFilter, typeFilter, statusFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handle Save (Create or Update)
  const handleSaveEmployee = async (formData) => {
    if (employeeToEdit) {
      await employeesApi.updateEmployee(employeeToEdit.id, formData);
    } else {
      await employeesApi.createEmployee(formData);
    }
    fetchEmployees();
  };

  // Toggle Lock/Unlock
  const handleToggleStatus = async (emp) => {
    const newStatus = emp.status === 'active' ? 'inactive' : 'active';
    try {
      await employeesApi.updateStatus(emp.id, newStatus);
      fetchEmployees();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Không thể cập nhật trạng thái nhân viên');
    }
  };

  // Delete
  const handleDelete = async (emp) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ${emp.fullName} (${emp.employeeCode})?`)) {
      try {
        await employeesApi.deleteEmployee(emp.id);
        fetchEmployees();
      } catch (err) {
        console.error('Error deleting employee:', err);
        alert('Không thể xóa nhân viên');
      }
    }
  };

  const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Quản Lý Nhân Viên (Employees)
            <Badge variant="outline" className="text-xs font-normal border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-300">
              Admin Portal
            </Badge>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Tạo tài khoản, phân quyền thao tác đơn hàng, quản lý hợp đồng Full-time / Part-time &amp; lịch sử lương
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchEmployees}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>

          <Button
            onClick={() => {
              setEmployeeToEdit(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none"
          >
            <UserPlus className="w-4 h-4" />
            Thêm Nhân Viên
          </Button>
        </div>
      </div>

      {/* Stats Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Tổng Nhân Viên',
            value: totalItems.toLocaleString(),
            sub: 'Đang quản lý trên hệ thống',
            icon: Users,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50 dark:bg-indigo-950/50',
          },
          {
            title: 'Đang Hoạt Động',
            value: employees.filter((e) => e.status === 'active').length.toString(),
            sub: 'Được phép đăng nhập portal',
            icon: CheckCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-950/50',
          },
          {
            title: 'Toàn Thời Gian',
            value: employees.filter((e) => e.employmentType === 'full_time').length.toString(),
            sub: 'Hợp đồng lương tháng cố định',
            icon: Briefcase,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-950/50',
          },
          {
            title: 'Bán Thời Gian',
            value: employees.filter((e) => e.employmentType === 'part_time').length.toString(),
            sub: 'Tính lương theo ca làm việc',
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-950/50',
          },
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {item.title}
              </span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                {item.value}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo Mã NV, Tên, Email, SĐT..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Tất cả phòng ban</option>
            <option value="Vận hành">Vận hành</option>
            <option value="CSKH">CSKH</option>
            <option value="Kho vận">Kho vận</option>
            <option value="Kiểm duyệt">Kiểm duyệt</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Tất cả hình thức</option>
            <option value="full_time">Toàn thời gian (Full-time)</option>
            <option value="part_time">Bán thời gian (Part-time)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động (Active)</option>
            <option value="inactive">Đã khóa (Inactive)</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : employees.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
            <Users className="w-12 h-12 mb-2 text-slate-300 stroke-1" />
            <p>Không tìm thấy nhân viên nào phù hợp tiêu chí lọc</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Mã NV</th>
                  <th className="py-3 px-4">Nhân viên</th>
                  <th className="py-3 px-4">Phòng ban &amp; Vị trí</th>
                  <th className="py-3 px-4">Loại hợp đồng</th>
                  <th className="py-3 px-4">Mức lương hiện tại</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Phân quyền</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => {
                  const perms = emp.permissions || {};
                  const activePermCount = Object.values(perms).filter(Boolean).length;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {emp.employeeCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                            {emp.avatarUrl ? (
                              <img src={emp.avatarUrl} alt={emp.fullName} className="w-full h-full object-cover" />
                            ) : (
                              emp.fullName?.[0]?.toUpperCase() || 'E'
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-100 block">
                              {emp.fullName}
                            </span>
                            <span className="text-slate-400 text-[11px] block">{emp.email}</span>
                            {emp.phone && <span className="text-slate-400 text-[10px] block">{emp.phone}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 dark:text-slate-300 block">
                          {emp.department}
                        </span>
                        <span className="text-slate-400 text-[11px] block">{emp.position}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            emp.employmentType === 'part_time'
                              ? 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40'
                              : 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/40'
                          }
                        >
                          {emp.employmentType === 'part_time' ? 'Part-time' : 'Full-time'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                        {emp.employmentType === 'part_time' ? (
                          <span>
                            {formatVND(emp.hourlyRate)} <span className="text-[10px] text-slate-400 font-normal">/giờ</span>
                          </span>
                        ) : (
                          <span>
                            {formatVND(emp.salary)} <span className="text-[10px] text-slate-400 font-normal">/tháng</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                            emp.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                          title={emp.status === 'active' ? 'Nhấn để khóa tài khoản' : 'Nhấn để mở khóa tài khoản'}
                        >
                          {emp.status === 'active' ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Hoạt động
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-rose-600" />
                              Đã khóa
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="border-slate-200 text-slate-600 bg-slate-50 text-[10px]">
                          <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                          {activePermCount} quyền
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEmployeeForHistory(emp);
                              setIsHistoryOpen(true);
                            }}
                            title="Lịch sử điều chỉnh lương"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEmployeeToEdit(emp);
                              setIsFormOpen(true);
                            }}
                            title="Chỉnh sửa thông tin"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(emp)}
                            title={emp.status === 'active' ? 'Khóa nhân viên' : 'Mở khóa'}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            {emp.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleDelete(emp)}
                            title="Xóa nhân viên"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Trang {page} / {totalPages} (Tổng số {totalItems} nhân viên)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <EmployeeFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveEmployee}
          employeeToEdit={employeeToEdit}
        />
      )}

      {/* Salary History Modal */}
      {isHistoryOpen && (
        <SalaryHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          employee={employeeForHistory}
        />
      )}
    </div>
  );
}
