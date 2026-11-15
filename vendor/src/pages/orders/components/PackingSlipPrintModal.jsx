import { Printer } from 'lucide-react';
import { Button, Modal } from '../../../components/ui';
import { formatCurrency, formatShortOrderCode } from '../../../utils/formatHelpers';

export default function PackingSlipPrintModal({ vendorOrder, storeName, isOpen, onClose }) {
  if (!vendorOrder) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Phiếu Đóng Gói & Bàn Giao Kiện Hàng MIVA"
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-400">Biểu mẫu bàn giao tiêu chuẩn MIVA Express</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Đóng
            </Button>
            <Button
              onClick={() => window.print()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              In Phiếu Đóng Gói
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-slate-800 dark:text-slate-100 p-2 print:p-0">
        <div className="border-b-2 border-slate-900 dark:border-slate-200 pb-3 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">PHIẾU ĐÓNG GÓI KIỆN HÀNG</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">
              SÀN THƯƠNG MẠI ĐIỆN TỬ MIVA
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold text-sm text-indigo-700 dark:text-indigo-400">
              {vendorOrder.vendorOrderCode}
            </p>
            <p className="text-[11px] text-slate-400" title={vendorOrder.order?.orderCode}>
              Đơn gốc: #{formatShortOrderCode(vendorOrder.order?.orderCode || vendorOrder.orderId)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="space-y-1">
            <p>
              <span className="text-slate-500">Đơn vị gửi:</span>{' '}
              <span className="font-bold">{storeName || 'Shop đối tác MIVA'}</span>
            </p>
            <p>
              <span className="text-slate-500">Mã vận đơn:</span>{' '}
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {vendorOrder.shipment?.trackingNumber || 'MIVA-EXPRESS'}
              </span>
            </p>
            <p>
              <span className="text-slate-500">Ngày in phiếu:</span>{' '}
              {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div className="space-y-1">
            <p>
              <span className="text-slate-500">Đơn vị vận chuyển:</span>{' '}
              <span className="font-bold">MIVA Express (Nội bộ)</span>
            </p>
            <p>
              <span className="text-slate-500">Bưu tá tiếp nhận:</span>{' '}
              {vendorOrder.shipment?.carrier?.fullName || 'Bưu tá MIVA'}
            </p>
            <p>
              <span className="text-slate-500">Địa chỉ giao:</span> Khách hàng MIVA (Bảo mật)
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-2">
            Danh mục hàng hóa đóng gói:
          </h4>
          <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-2 w-8 text-center">✓</th>
                <th className="p-2">Tên sản phẩm</th>
                <th className="p-2">Phân loại</th>
                <th className="p-2 text-center">SL</th>
                <th className="p-2 text-right">Đơn giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {(vendorOrder.details || []).map((d, i) => (
                <tr key={d.id || i}>
                  <td className="p-2 text-center">
                    <div className="w-4 h-4 border border-slate-400 rounded-sm mx-auto" />
                  </td>
                  <td className="p-2 font-medium">{d.productName}</td>
                  <td className="p-2 text-slate-500">
                    {d.colorName} {d.sizeName ? `• Size ${d.sizeName}` : ''}
                  </td>
                  <td className="p-2 text-center font-bold">{d.quantity}</td>
                  <td className="p-2 text-right">{formatCurrency(d.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-300">ĐẠI DIỆN SHOP ĐÓNG GÓI</p>
            <p className="text-[10px] text-slate-400 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
            <div className="h-16" />
          </div>
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-300">BƯU TÁ MIVA NHẬN KIỆN</p>
            <p className="text-[10px] text-slate-400 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
            <div className="h-16" />
          </div>
        </div>
      </div>
    </Modal>
  );
}
