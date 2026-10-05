import { useState, useEffect } from 'react';
import { Store, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';

export default function StoreSettings() {
  const { user, checkAuth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await userService.updateProfile({
        fullName: form.fullName,
        phone: form.phone || null,
        address: form.address || null,
      });
      // Refresh context user data
      await checkAuth();
      alert('Đã cập nhật thông tin cửa hàng (hồ sơ)');
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Store Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Quản lý thông tin cửa hàng (hồ sơ tài khoản) của bạn</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <Store className="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{user?.fullName || 'Tên cửa hàng'}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tên cửa hàng (Full Name)</label>
            <input type="text" value={form.fullName}
              onChange={e => handleChange('fullName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Số điện thoại</label>
            <input type="text" value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Địa chỉ</label>
            <textarea value={form.address}
              onChange={e => handleChange('address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
          </div>

          <button onClick={handleSave} disabled={isSubmitting}
            className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
