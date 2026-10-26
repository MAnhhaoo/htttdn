import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Edit, Lock, Unlock, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { usersApi } from '../../api';
import { formatDate } from '../../utils/formatHelpers';
import { Button, Input, Select } from '../../components/ui';
import UserFormModal from './UserFormModal';
import UserDetailModal from './UserDetailModal';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [userToView, setUserToView] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, itemPerPage: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await usersApi.getUsers(params);
      const data = res.data;
      setUsers(data.list || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 text-red-700',
      vendor: 'bg-purple-100 text-purple-700',
      employee: 'bg-amber-100 text-amber-700',
      customer: 'bg-blue-100 text-blue-700',
    };
    return styles[role] || 'bg-slate-100 text-slate-700 dark:text-slate-300';
  };

  const getStatusBadge = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-700'
      : 'bg-slate-100 text-slate-500 dark:text-slate-400';
  };

  const handleEditClick = (user) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleViewClick = (user) => {
    setUserToView(user);
    setIsDetailModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    const actionLabel = nextStatus === 'inactive' ? 'khóa' : 'mở khóa';
    if (window.confirm(`Bạn có chắc chắn muốn ${actionLabel} tài khoản ${user.fullName || user.email}?`)) {
      try {
        await usersApi.updateUserStatus(user.id, nextStatus);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || `Không thể ${actionLabel} tài khoản`);
      }
    }
  };

  const handleSave = async (savedData) => {
    try {
      if (userToEdit) {
        await usersApi.updateUser(userToEdit.id, savedData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Lưu thất bại');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400">{totalItems} users</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input 
              placeholder="Tìm kiếm user..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select 
            options={[
              { value: '', label: 'Tất cả vai trò' },
              { value: 'customer', label: 'Customer (Khách hàng)' },
              { value: 'vendor', label: 'Vendor (Người bán)' },
              { value: 'employee', label: 'Employee (Nhân viên)' },
              { value: 'admin', label: 'Admin (Quản trị)' }
            ]}
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-48"
          />
          <Select 
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'active', label: 'Active (Hoạt động)' },
              { value: 'inactive', label: 'Inactive (Đã khóa)' }
            ]}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-48"
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-slate-500">Đang tải...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              Không tìm thấy user nào.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Mã người dùng</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">User</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Role</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Created</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const code = user.userCode || (user.role === 'vendor' ? `VND-${user.id.slice(0, 8).toUpperCase()}` : user.role === 'admin' ? `ADM-${user.id.slice(0, 8).toUpperCase()}` : user.role === 'employee' ? (user.employeeCode || `EMP-${user.id.slice(0, 8).toUpperCase()}`) : `CUS-${user.id.slice(0, 8).toUpperCase()}`);
                  const isLocked = user.status === 'inactive';
                  return (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                        {code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400 mr-3">
                          {user.fullName?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                        {isLocked ? 'inactive (Đã khóa)' : 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" icon={Eye} className="text-slate-400 hover:text-blue-600" onClick={() => handleViewClick(user)} title="Xem chi tiết" />
                        <Button variant="ghost" size="sm" icon={Edit} className="text-slate-400 hover:text-amber-600" onClick={() => handleEditClick(user)} title="Chỉnh sửa" />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={isLocked ? Unlock : Lock}
                          className={isLocked ? 'text-slate-400 hover:text-emerald-600' : 'text-slate-400 hover:text-rose-600'}
                          onClick={() => handleToggleStatus(user)}
                          title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        />
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Trang {page} / {totalPages} ({totalItems} user)
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                icon={ChevronLeft} 
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              />
              <Button 
                variant="outline" 
                size="sm" 
                icon={ChevronRight}
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              />
            </div>
          </div>
        )}
      </div>

      <UserFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={userToEdit}
        onSave={handleSave}
      />

      <UserDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={userToView}
      />
    </div>
  );
}
