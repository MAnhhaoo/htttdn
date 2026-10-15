import { useState, useEffect } from 'react';
import { Modal, Button, Badge } from '../../components/ui';
import { employeesApi } from '../../api';
import { 
  TrendingUp, Calendar, ArrowRight, UserCheck, Clock, FileText, 
  Loader2, AlertCircle, DollarSign
} from 'lucide-react';

export default function SalaryHistoryModal({ isOpen, onClose, employee }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employee?.id) {
      setLoading(true);
      employeesApi.getSalaryHistory(employee.id)
        .then((res) => {
          setHistory(res.data || []);
        })
        .catch((err) => {
          console.error('Error fetching salary history:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, employee]);

  const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Lịch sử Lương & Hợp Đồng - ${employee?.fullName || ''} (${employee?.employeeCode || ''})`}
      maxWidth="max-w-2xl"
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Current status card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Mức lương hiện tại
            </span>
            <h4 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {employee?.employmentType === 'part_time'
                ? `${formatVND(employee?.hourlyRate)} / giờ`
                : `${formatVND(employee?.salary)} / tháng`}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={employee?.employmentType === 'part_time' ? 'border-amber-300 text-amber-700 bg-amber-50' : 'border-indigo-300 text-indigo-700 bg-indigo-50'}>
                {employee?.employmentType === 'part_time' ? 'Bán thời gian (Part-time)' : 'Toàn thời gian (Full-time)'}
              </Badge>
              <span className="text-xs text-slate-400">• Phòng: {employee?.department}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400">Ngày vào làm</span>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {employee?.hireDate ? new Date(employee.hireDate).toLocaleDateString('vi-VN') : '---'}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Nhật Ký Các Lần Điều Chỉnh Lương
          </h4>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : history.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              Chưa có lịch sử điều chỉnh nào được ghi nhận.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {history.map((item, idx) => (
                <div key={item.id || idx} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 shadow-sm" />

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {item.employmentType === 'part_time'
                            ? `${formatVND(item.newHourlyRate)} / giờ`
                            : `${formatVND(item.newSalary)} / tháng`}
                        </span>
                        {item.oldSalary !== null && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            (cũ: {formatVND(item.oldSalary)})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.effectiveDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <strong>Lý do:</strong> {item.reason || 'Điều chỉnh lương'}
                    </p>

                    {item.admin && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <UserCheck className="w-3 h-3 text-emerald-500" />
                        Người phê duyệt: <strong>{item.admin.fullName}</strong> ({item.admin.email})
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
