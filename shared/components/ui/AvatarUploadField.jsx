import { useState } from 'react';
import { Loader2, Upload, Trash2 } from 'lucide-react';

/**
 * Component dùng chung cho tải lên & xóa ảnh đại diện / logo (Admin & Vendor).
 */
export function AvatarUploadField({
  label = 'Ảnh đại diện',
  avatarUrl = '',
  altName = 'Avatar',
  uploadFn,
  onChange,
  onError,
  labelClassName = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5',
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadFn) return;
    try {
      setUploading(true);
      const uploaded = await uploadFn(file);
      const uploadedUrl =
        typeof uploaded === 'string'
          ? uploaded
          : uploaded?.avatarUrl || uploaded?.logoUrl || uploaded?.url || uploaded?.data?.avatarUrl;
      if (uploadedUrl) {
        onChange?.(uploadedUrl);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể tải ảnh lên';
      if (onError) {
        onError(msg);
      } else {
        console.error(msg);
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
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
          />
        )}
        <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors">
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#1A3A2C] dark:text-[#8BBAA1]" />
          ) : (
            <Upload className="w-4 h-4 text-[#1A3A2C] dark:text-[#8BBAA1]" />
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
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa ảnh
          </button>
        )}
      </div>
    </div>
  );
}

export default AvatarUploadField;

