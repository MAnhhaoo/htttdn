import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { voucherService } from '../../services/voucherService';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';
import { Button, Input } from '../../components/ui';
import VoucherFormModal from './VoucherFormModal';

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voucherToEdit, setVoucherToEdit] = useState(null);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const data = await voucherService.getVendorVouchers();
      // data might be wrapped in `{ list }` or returned directly as an array depending on backend formatting
      setVouchers(Array.isArray(data) ? data : (data.list || []));
    } catch (error) {
      console.error('Failed to fetch vouchers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const filtered = vouchers.filter(v =>
    v.code.toLowerCase().includes(search.toLowerCase()) ||
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddClick = () => {
    setVoucherToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (voucher) => {
    setVoucherToEdit(voucher);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (voucherId) => {
    if (window.confirm('Are you sure you want to delete this shop voucher?')) {
      try {
        await voucherService.deleteVoucher(voucherId);
        fetchVouchers();
      } catch (error) {
        console.error('Failed to delete voucher', error);
        alert('Có lỗi xảy ra khi xóa voucher');
      }
    }
  };

  const handleSave = async (savedData) => {
    // We can just refetch after save
    await fetchVouchers();
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Shop Vouchers</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage vouchers for your products</p>
        </div>
        <Button icon={Plus} className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAddClick}>
          Create Voucher
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input 
              placeholder="Search by code or name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Code</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Discount</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Usage</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Valid Period</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">No vouchers found</td>
                </tr>
              ) : (
                filtered.map(v => (
                  <tr key={v.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded font-mono text-sm font-medium">{v.code}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">{v.name}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                      {v.discountType === 'percentage' ? `${v.discountValue}%` : formatCurrency(v.discountValue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{v.usedQuantity || 0}/{v.quantity}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(v.startDate)} → {formatDate(v.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${v.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500 dark:text-slate-400'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" icon={Edit} className="text-slate-400 hover:text-indigo-600" onClick={() => handleEditClick(v)} />
                        <Button variant="ghost" size="sm" icon={Trash2} className="text-slate-400 hover:text-red-600" onClick={() => handleDeleteClick(v.id)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VoucherFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        voucherToEdit={voucherToEdit}
        onSave={handleSave}
      />
    </div>
  );
}
