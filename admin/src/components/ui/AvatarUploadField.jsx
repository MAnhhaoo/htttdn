import { useState } from 'react';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { usersApi } from '../../api';

/**
 * Component dùng chung cho tải lên & xóa ảnh đại diện (Avatar) trong các form Admin.
 */
export function AvatarUploadField({
  label = 'Ảnh đại diện',
  avatarUrl = '',
  altName = 'Avatar',
  onChange,
  onError,
  labelClassName = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5',
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const uploadedUrl = await usersApi.uploadAvatar(file);
      if (uploadedUrl) {
        onChange?.(uploadedUrl);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tải ảnh đại diện lên';
      if (onError) {
        onError(msg);
      } else {
        alert(msg);
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      {label && <label className={labelClassName}>{label}</label>}
      <div className="flex items-center gap-3">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={altName || 'Avatar'}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
          />
        )}
        <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors">
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          ) : (
            <Upload className="w-4 h-4 text-indigo-600" />
          )}
          {uploading ? 'Đang tải...' : 'Chọn ảnh'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {avatarUrl && (
          <button
            type="button"
            onClick={() => onChange?.('')}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa ảnh
          </button>
        )}
      </div>
    </div>
  );
}

export default AvatarUploadField;
