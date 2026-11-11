import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RefreshCw,
  X
} from 'lucide-react';
import { ordersApi, employeesApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';
import {
  extractOrderEmployees,
  formatShortOrderCode,
  groupOrdersByCheckoutBatch,
  isOrderAssignedToEmployee,
} from '../../utils/orderHelpers';
import { usePaginatedCacheList } from '../../hooks/usePaginatedCacheList';
import { Button, Select } from '../../components/ui';
import OrderDetailModal from './OrderDetailModal';

export default function OrderManagement() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [employeeList, setEmployeeList] = useState([]);

  useEffect(() => {
    employeesApi
      .getEmployees({ limit: 100 })
      .then((res) => {
        const list = res?.data?.list || res?.list || (Array.isArray(res) ? res : []);
        setEmployeeList(list);
      })
      .catch(() => {});
  }, []);

  const employeeOptions = useMemo(() => {
    return employeeList.map((emp) => ({
      value: emp.id,
      label: `${emp.fullName} (${emp.employeeCode || 'NV'}) - ${emp.department || 'Nhân viên'}`,
    }));
  }, [employeeList]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const extraParams = useMemo(
    () => ({
      sortOrder,
      groupByBatch: true,
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(employeeFilter !== 'all' ? { employeeId: employeeFilter } : {}),
    }),
    [statusFilter, employeeFilter, sortOrder]
  );

  // [YÊU CẦU 3 & 4 - ĐỌC DANH SÁCH HÓA ĐƠN & TÁI SỬ DỤNG BỘ NHỚ ĐỆM DÙNG CHUNG]:
  const {
    list: orders,
    search,
    setSearch,
    loading,
    page,
    setPage,
    totalPages,
    totalItems,
    reusedFromCache,
    fetchList: fetchOrders,
    handleResetAndReuseList: resetPaginatedList,
  } = usePaginatedCacheList({
    fetcher: ordersApi.getOrders,
    itemsPerPage: 10,
    extraParams,
    isDefaultExtraParams:
      statusFilter === 'all' && employeeFilter === 'all' && sortOrder === 'asc',
    realtimeEvent: 'miva:orders',
  });

  const handleResetAndReuseList = () => {
    resetPaginatedList(() => {
      setStatusFilter('all');
      setEmployeeFilter('all');
      setSortOrder('asc');
    });
  };

  // Gộp các đơn hàng cùng 1 lượt checkout của cùng khách hàng thành 1 dòng hiển thị
  const rawGrouped = useMemo(() => groupOrdersByCheckoutBatch(orders), [orders]);

  // Lọc chỉ hiển thị đơn hàng thuộc về nhân viên được chọn (hoặc tất cả nếu chọn 'all')
  const groupedOrders = useMemo(() => {
    if (!employeeFilter || employeeFilter === 'all') return rawGrouped;

    const selectedEmp = employeeList.find((e) => e.id === employeeFilter);
    const empDept = (selectedEmp?.department || '').toLowerCase();
    const isCourierFilter =
      selectedEmp &&
      selectedEmp.assignedOrderScope !== 'all_orders' &&
      (empDept.includes('vận chuyển') || empDept.includes('giao nhận'));

    return rawGrouped
      .map((gOrder) => {
        const subOrders = gOrder.subOrders || [gOrder];
        // Lọc các đơn con mà nhân viên đó phụ trách
        const matchedSub = subOrders.filter((so) =>
          isOrderAssignedToEmployee(so, employeeFilter, Boolean(isCourierFilter))
        );
        if (matchedSub.length === 0) return null;

        if (matchedSub.length === 1) {
          return {
            ...matchedSub[0],
            isMergedGroup: false,
            subOrders: matchedSub,
          };
        }

        return {
          ...gOrder,
          subOrders: matchedSub,
        };
      })
      .filter(Boolean);
  }, [rawGrouped, employeeFilter, employeeList]);

  const handleStatusChange = async (orderId, newStatus, note) => {
    try {
      await ordersApi.updateOrderStatus(orderId, newStatus, note);
      await fetchOrders(true);
      setSelectedOrder((prev) => {
        if (!prev) return prev;
        const updatedSubs = (prev.subOrders || [prev]).map((so) =>
          so.id === orderId ? { ...so, status: newStatus } : so
        );
        return {
          ...prev,
          status: prev.id === orderId ? newStatus : prev.status,
          subOrders: updatedSubs,
        };
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật trạng thái đơn hàng thất bại');
    }
  };

  const isFiltered = Boolean(
    search.trim() ||
      statusFilter !== 'all' ||
      employeeFilter !== 'all' ||
      sortOrder !== 'asc' ||
      page !== 1
  );

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quản lý đơn hàng &amp; Hóa đơn</h1>
            {reusedFromCache && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800">
                ⚡ Tái sử dụng DS gốc (Cache)
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            {totalItems} hóa đơn trong hệ thống • Tự động gộp các đơn cùng lượt đặt và tách chi tiết từng đơn khi bấm xem
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAndReuseList}
              className="flex items-center gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
              title="Khôi phục danh sách gốc từ bộ nhớ đệm mà không cần truy vấn lại CSDL"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Bỏ tìm kiếm (Dùng lại DS gốc)
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(true)}
            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
            title="Chủ động đọc lại danh sách mới nhất từ CSDL PostgreSQL"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Tải lại từ CSDL
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 flex-1">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Tìm theo mã đơn (#...), tên khách hàng, số điện thoại, hoặc tên sản phẩm..." 
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none outline-none text-sm w-full text-slate-800 dark:text-slate-100" 
              />
              {search && (
                <button
                  type="button"
                  onClick={handleResetAndReuseList}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
                  title="Xóa tìm kiếm và dùng lại danh sách đã tải"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select 
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'pending', label: 'Chờ xử lý (Pending)' },
                  { value: 'confirmed', label: 'Đã xác nhận (Confirmed)' },
                  { value: 'processing', label: 'Vendor đang xử lý (Processing)' },
                  { value: 'shipping', label: 'Đang vận chuyển (Shipping)' },
                  { value: 'completed', label: 'Hoàn tất (Completed)' },
                  { value: 'cancelled', label: 'Đã hủy (Cancelled)' }
                ]}
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full"
              />

              <Select 
                options={[
                  { value: 'all', label: 'Tất cả nhân viên phụ trách' },
                  ...employeeOptions
                ]}
                value={employeeFilter}
                onChange={e => {
                  setEmployeeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full"
              />

              <Select
                options={[
                  { value: 'asc', label: 'Sắp xếp: Cũ nhất (ASC)' },
                  { value: 'desc', label: 'Sắp xếp: Mới nhất (DESC)' },
                ]}
                value={sortOrder}
                onChange={e => {
                  setSortOrder(e.target.value);
                  setPage(1);
                }}
                className="w-full"
              />
            </div>
          </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex items-center justify-center py-20">
               <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
               <span className="ml-2 text-slate-500">Đang tải...</span>
             </div>
          ) : groupedOrders.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              Không tìm thấy đơn hàng nào.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Mã đơn hàng</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ngày tạo</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Tổng tiền đơn hàng</th>
                </tr>
              </thead>
              <tbody>
                {groupedOrders.map(order => {
                  const subOrders = order.subOrders || [order];
                  const isMerged = subOrders.length > 1;
                  const userName = order.client?.fullName || order.receiverName || order.user?.fullName || 'Khách hàng';
                  const fullOrderCode = order.orderCode || order.id;
                  const displayOrderCode = `#${formatShortOrderCode(fullOrderCode)}`;
                  const isSelected = selectedOrder?.id === order.id;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder({ ...order, userName })}
                      className={`border-b border-slate-100 dark:border-slate-800 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/35'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="px-4 py-3.5 text-sm font-mono font-bold text-blue-600 dark:text-blue-400" title={fullOrderCode}>
                        <div className="flex items-center gap-2">
                          <span>{displayOrderCode}</span>
                          {isMerged && (
                            <span className="text-[11px] font-sans font-medium px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              {subOrders.length} đơn
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-right font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(order.totalAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Server Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Trang {page} / {totalPages}
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

        <div className="lg:col-span-1">
          {selectedOrder ? (
            <OrderDetailModal
              inline
              isOpen
              onClose={() => setSelectedOrder(null)}
              order={selectedOrder}
              onStatusChange={handleStatusChange}
              onOrderUpdated={(updated, meta = {}) => {
                setSelectedOrder((prev) => {
                  if (!prev) return updated;
                  const existingSubs = prev.subOrders || [prev];
                  if (existingSubs.length <= 1) return updated;
                  const updatedHandlingHist = extractOrderEmployees(updated).handlingHistory;
                  const nextSubs = existingSubs.map((so) => {
                    if (so.id === updated.id) return updated;
                    if (meta.syncHandlingAllSiblings && updatedHandlingHist) {
                      return {
                        ...so,
                        statusHistory: [...(so.statusHistory || []), updatedHandlingHist],
                      };
                    }
                    return so;
                  });
                  return {
                    ...prev,
                    ...(prev.id === updated.id ? updated : {}),
                    subOrders: nextSubs,
                  };
                });
                fetchOrders(true);
              }}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[520px]" />
          )}
        </div>
      </div>
    </div>
  );
}
