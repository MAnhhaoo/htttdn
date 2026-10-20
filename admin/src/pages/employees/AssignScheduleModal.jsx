import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../../components/ui';
import { Clock, Calendar, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { employeesApi } from '../../api';

const SHIFT_PRESETS = [
  { name: 'Ca Hành Chính', start: '08:30', end: '16:30', hours: 8, desc: 'Ca tiêu chuẩn 8h30 - 16h30 (8 tiếng)' },
  { name: 'Ca Sáng Sớm', start: '06:00', end: '14:00', hours: 8, desc: 'Ca sáng sớm 6h00 - 14h00 (8 tiếng)' },
  { name: 'Ca Chiều Tối', start: '14:00', end: '22:00', hours: 8, desc: 'Ca chiều tối 14h00 - 22h00 (8 tiếng)' },
  { name: 'Ca Part-time Sáng', start: '08:30', end: '12:30', hours: 4, desc: 'Ca 4 tiếng sáng (8h30 - 12h30)' },
  { name: 'Ca Part-time Chiều', start: '13:00', end: '17:00', hours: 4, desc: 'Ca 4 tiếng chiều (13h00 - 17h00)' },
  { name: 'Ca Linh Hoạt 5 Giờ', start: '09:00', end: '14:00', hours: 5, desc: 'Ca 5 tiếng theo nhu cầu (9h00 - 14h00)' },
];

export default function AssignScheduleModal({ isOpen, onClose, employee, onSaved }) {
  const currentSchedule = employee?.permissions?.schedule || {};

  const [shiftName, setShiftName] = useState('Ca Hành Chính');
  const [shiftStart, setShiftStart] = useState('08:30');
  const [shiftEnd, setShiftEnd] = useState('16:30');
  const [shiftHours, setShiftHours] = useState(8);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (employee) {
      const sch = employee.permissions?.schedule || {};
      setShiftName(sch.shiftName || 'Ca Hành Chính');
      setShiftStart(sch.shiftStart || '08:30');
      setShiftEnd(sch.shiftEnd || '16:30');
      setShiftHours(sch.shiftHours ? Number(sch.shiftHours) : 8);
      setNote(sch.note || '');
      setErrorMsg('');
    }
  }, [employee, isOpen]);

  const handleApplyPreset = (preset) => {
    setShiftName(preset.name);
    setShiftStart(preset.start);
    setShiftEnd(preset.end);
    setShiftHours(preset.hours);
    setNote(`Phân công ${preset.name} (${preset.start} - ${preset.end})`);
  };

  const calculateHours = (start, end) => {
    if (!start || !end) return;
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diffMs = (h2 * 60 + m2 - (h1 * 60 + m1));
    if (diffMs < 0) diffMs += 24 * 60; // overnight
    const hrs = Number((diffMs / 60).toFixed(1));
    setShiftHours(hrs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shiftStart || !shiftEnd) {
      setErrorMsg('Vui lòng nhập giờ bắt đầu và giờ kết thúc ca làm');
      return;
    }
    try {
      setSaving(true);
      await employeesApi.updateSchedule(employee.id, {
        shiftName,
        shiftStart,
        shiftEnd,
        shiftHours: Number(shiftHours) || 8,
        note,
      });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi phân công ca làm');
    } finally {
      setSaving(false);
    }
  };

  if (!employee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Phân Công Lịch Làm Việc Cho Nhân Viên"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Employee Summary Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300">
              {employee.fullName?.charAt(0) || 'E'}
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{employee.fullName}</p>
              <p className="text-xs text-slate-500 font-mono">
                {employee.employeeCode} • {employee.department} • {employee.employmentType === 'part_time' ? 'Part-time' : 'Full-time'}
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
            {currentSchedule.shiftStart ? `${currentSchedule.shiftStart} - ${currentSchedule.shiftEnd}` : 'Chưa phân ca'}
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Chọn nhanh mẫu ca làm việc:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SHIFT_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  shiftStart === p.start && shiftEnd === p.end
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-semibold">{p.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {p.start} - {p.end} ({p.hours}h)
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Configuration */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Input
            label="Tên ca / Mô tả ngắn"
            placeholder="VD: Ca hành chính, Ca kiểm hàng..."
            value={shiftName}
            onChange={(e) => setShiftName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Giờ bắt đầu ca *
              </label>
              <input
                type="time"
                value={shiftStart}
                onChange={(e) => {
                  setShiftStart(e.target.value);
                  calculateHours(e.target.value, shiftEnd);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Giờ kết thúc ca *
              </label>
              <input
                type="time"
                value={shiftEnd}
                onChange={(e) => {
                  setShiftEnd(e.target.value);
                  calculateHours(shiftStart, e.target.value);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tổng số giờ làm định mức (tiếng) *
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="24"
                value={shiftHours}
                onChange={(e) => setShiftHours(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg outline-none focus:border-indigo-500 font-mono font-bold"
                required
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Dùng làm mốc so sánh khi nhân viên điểm danh trễ
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ghi chú thêm
              </label>
              <input
                type="text"
                placeholder="VD: Không áp dụng Chủ Nhật..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Explain Rule */}
        <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-200 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Quy định chấm công theo lịch này:
          </p>
          <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-700 dark:text-amber-300">
            <li>Nhân viên điểm danh sau {shiftStart} sẽ bắt buộc nhập lý do đi trễ.</li>
            <li>Hệ thống tính lương dựa trên số giờ làm thực tế còn lại (ví dụ vào trễ 3 tiếng trong ca {shiftHours} tiếng thì chỉ nhận lương {Math.max(1, shiftHours - 3)} tiếng).</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {saving ? 'Đang lưu phân công...' : 'Lưu Phân Công Ca Làm'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
