import React, { useState, useEffect } from 'react';
import { 
  Clock, AlertTriangle, CheckCircle2, X, Calendar, DollarSign, 
  HelpCircle, AlertCircle, Info, Sparkles 
} from 'lucide-react';
import { payrollApi } from '../../api/axiosClient';

export const AttendanceCheckInModal = ({ isOpen, onClose, profile, onSuccess }) => {
  const schedule = profile?.permissions?.schedule || {};
  const shiftName = schedule.shiftName || 'Ca hành chính';
  const shiftStart = schedule.shiftStart || '08:30';
  const shiftEnd = schedule.shiftEnd || '16:30';
  const standardHours = Number(schedule.shiftHours || 8);

  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [isLate, setIsLate] = useState(false);
  const [lateMinutes, setLateMinutes] = useState(0);
  const [lateHours, setLateHours] = useState(0);
  const [actualHours, setActualHours] = useState(standardHours);
  const [lateReason, setLateReason] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate times
  useEffect(() => {
    if (!isOpen) return;

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setCurrentTimeStr(`${hh}:${mm}`);
    setCurrentDateStr(now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }));

    // Compare with shiftStart
    const [startH, startM] = shiftStart.split(':').map(Number);
    const [endH, endM] = shiftEnd.split(':').map(Number);

    const shiftStartMinutes = startH * 60 + startM;
    const shiftEndMinutes = endH * 60 + endM;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Check if late (5 mins grace period)
    if (currentMinutes > shiftStartMinutes + 5) {
      setIsLate(true);
      const diffMins = currentMinutes - shiftStartMinutes;
      setLateMinutes(diffMins);
      const diffHours = Number((diffMins / 60).toFixed(1));
      setLateHours(diffHours);

      // Remaining working hours until shift end
      const remainingMins = Math.max(0, shiftEndMinutes - currentMinutes);
      const remainingHours = Number((remainingMins / 60).toFixed(1));
      setActualHours(Math.min(standardHours, remainingHours));
    } else {
      setIsLate(false);
      setLateMinutes(0);
      setLateHours(0);
      setActualHours(standardHours);
    }

    setLateReason('');
    setErrorMsg('');
  }, [isOpen, shiftStart, shiftEnd, standardHours]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;

    if (isLate && !lateReason.trim()) {
      setErrorMsg('Theo quy định, nhân viên đi trễ bắt buộc phải điền lý do đi trễ.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const now = new Date();
      const todayIsoDate = now.toISOString().split('T')[0];

      await payrollApi.recordAttendance({
        employeeId: profile.id,
        date: todayIsoDate,
        checkIn: now.toISOString(),
        shiftStart,
        shiftEnd,
        hoursWorked: actualHours,
        status: isLate ? 'late' : 'present',
        lateReason: isLate ? lateReason.trim() : null,
        note: note ? note.trim() : null,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi khi điểm danh');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm ${
              isLate ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Chấm Công / Điểm Danh Vào Ca</h3>
              <p className="text-xs text-slate-500">{currentDateStr}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Shift Details Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Ca làm việc phân công:</span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                {shiftName}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Giờ vào ca</span>
                <span className="text-sm font-bold font-mono text-slate-800">{shiftStart}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Giờ tan ca</span>
                <span className="text-sm font-bold font-mono text-slate-800">{shiftEnd}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Định mức ca</span>
                <span className="text-sm font-bold font-mono text-indigo-600">{standardHours} tiếng</span>
              </div>
            </div>
          </div>

          {/* Real-time Status Card */}
          <div className={`p-4 rounded-xl border ${
            isLate 
              ? 'bg-amber-50 border-amber-200 text-amber-900' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-start gap-3">
              {isLate ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-xs">
                <p className="font-bold text-sm">
                  {isLate ? `Chấm công TRỄ ${lateMinutes} phút (~${lateHours} tiếng)` : 'Chấm công ĐÚNG GIỜ'}
                </p>
                <p className="text-slate-600">
                  Thời điểm điểm danh: <span className="font-mono font-bold text-slate-800">{currentTimeStr}</span>
                </p>
                {isLate ? (
                  <div className="mt-2 p-2.5 bg-white/80 rounded-lg border border-amber-300 space-y-1 text-[11px]">
                    <p className="font-semibold text-amber-900">
                      ⚖️ Quy định tính lương theo giờ làm thực tế:
                    </p>
                    <p className="text-slate-700">
                      Do vào trễ, hôm nay bạn chỉ được ghi nhận <span className="font-bold text-amber-700">{actualHours} giờ làm</span> (thay vì {standardHours} giờ).
                    </p>
                    <p className="text-slate-500 italic">
                      Tiền lương tháng sẽ tính dựa trên {actualHours} giờ làm thực tế của ca hôm nay.
                    </p>
                  </div>
                ) : (
                  <p className="text-emerald-700">
                    Bạn được ghi nhận trọn vẹn <span className="font-bold">{actualHours} giờ làm</span> cho ca trực hôm nay.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Late Reason Input (Mandatory if Late) */}
          {isLate && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-amber-900 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Lý do đi trễ (Bắt buộc theo quy định) *
              </label>
              <textarea
                rows={3}
                value={lateReason}
                onChange={(e) => setLateReason(e.target.value)}
                placeholder="VD: Kẹt xe giờ cao điểm, hỏng xe giữa đường, giải quyết việc gia đình đột xuất..."
                className="w-full px-3 py-2 text-xs border border-amber-300 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-amber-50/30"
                required
              />
              <span className="text-[11px] text-slate-400">
                Lý do này sẽ được chuyển tới Ban Giám Đốc và phòng Quản Lý Nhân Sự xem xét.
              </span>
            </div>
          )}

          {/* Optional Note */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Ghi chú công việc hôm nay (Tùy chọn)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Nhận ca kiểm kê kho hàng B, xử lý đơn ưu tiên..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition flex items-center gap-1.5 ${
                isLate 
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Đang ghi nhận...' : isLate ? `Xác Nhận Điểm Danh Trễ (${actualHours}h)` : `Xác Nhận Đúng Giờ (${actualHours}h)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
