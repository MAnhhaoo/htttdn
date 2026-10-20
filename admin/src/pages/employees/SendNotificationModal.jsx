import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '../../components/ui';
import { Bell, Send, AlertTriangle, Info, AlertOctagon, Zap, CheckCircle2 } from 'lucide-react';
import { employeesApi } from '../../api';

const NOTIF_TYPES = [
  { value: 'info', label: 'Thông báo chung', icon: Info, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'warning', label: 'Cảnh báo kỷ luật / Đi trễ', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'alert', label: 'Khiển trách & Xử lý vi phạm', icon: AlertOctagon, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { value: 'urgent', label: 'Khẩn cấp / Phân công đột xuất', icon: Zap, color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

const QUICK_TEMPLATES = [
  {
    type: 'warning',
    title: 'Cảnh báo chấm công đi trễ so với ca làm việc',
    content: 'Ban Giám Đốc ghi nhận bạn đã có nhiều lần chấm công trễ so với ca làm việc được phân công. Vui lòng nghiêm túc tuân thủ đúng giờ giấc ca trực để không bị trừ lương theo giờ thực tế.',
  },
  {
    type: 'info',
    title: 'Thông báo phân công lịch làm việc & chấm công mới',
    content: 'Quản trị viên đã cập nhật ca làm việc mới của bạn. Vui lòng kiểm tra mục Hồ sơ & Ca làm việc và thực hiện chấm công đúng giờ quy định.',
  },
  {
    type: 'alert',
    title: 'Yêu cầu giải trình lý do vắng mặt / trễ ca',
    content: 'Đề nghị nhân viên liên hệ ngay phòng Vận hành để giải trình lý do không hoàn thành đủ số giờ làm trong ca trực vừa qua.',
  },
  {
    type: 'urgent',
    title: 'Nhiệm vụ phân công đột xuất hỗ trợ kho / đơn hàng',
    content: 'Có khối lượng đơn hàng tăng đột biến trong hôm nay. Đề nghị nhân viên tập trung hỗ trợ xử lý đúng tiến độ SLA.',
  },
];

export default function SendNotificationModal({
  isOpen,
  onClose,
  allEmployees = [],
  selectedEmployee = null,
  onSent,
}) {
  const [recipient, setRecipient] = useState('all');
  const [type, setType] = useState('warning');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (selectedEmployee) {
      setRecipient(selectedEmployee.id);
    } else {
      setRecipient('all');
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [selectedEmployee, isOpen]);

  const handleApplyTemplate = (tmpl) => {
    setType(tmpl.type);
    setTitle(tmpl.title);
    setContent(tmpl.content);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo');
      return;
    }

    try {
      setSending(true);
      setErrorMsg('');
      const res = await employeesApi.sendNotification({
        employeeId: recipient === 'all' ? undefined : recipient,
        type,
        title: title.trim(),
        content: content.trim(),
      });

      setSuccessMsg(res.data?.message || 'Đã gửi thông báo thành công!');
      setTimeout(() => {
        if (onSent) onSent();
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Không thể gửi thông báo');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gửi Thông Báo / Cảnh Báo Cho Nhân Viên"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSend} className="space-y-4">
        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Recipient Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Người nhận thông báo *
          </label>
          <select
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg outline-none focus:border-indigo-500 font-medium"
          >
            <option value="all">📢 Tất cả nhân viên đang hoạt động ({allEmployees.length} nhân viên)</option>
            <optgroup label="Từng nhân viên cụ thể">
              {allEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  👤 {emp.fullName} ({emp.employeeCode}) - {emp.department}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Phân loại thông báo / Mức độ cảnh báo *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {NOTIF_TYPES.map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all flex flex-col gap-1 items-start ${
                    isSelected
                      ? `border-indigo-600 ${t.color} font-bold ring-2 ring-indigo-500/20`
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="leading-tight">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Template Picker */}
        <div>
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Mẫu nội dung soạn sẵn:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
              >
                + {tmpl.title.slice(0, 35)}...
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <Input
          label="Tiêu đề thông báo / Cảnh báo *"
          placeholder="VD: Cảnh báo đi làm trễ ngày 20/10..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Content */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nội dung chi tiết thông báo *
          </label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung thông báo, cảnh báo hoặc hướng dẫn xử lý..."
            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg outline-none focus:border-indigo-500"
            required
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={sending}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={sending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            {sending ? 'Đang gửi...' : recipient === 'all' ? 'Gửi Cho Toàn Bộ Nhân Viên' : 'Gửi Thông Báo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
