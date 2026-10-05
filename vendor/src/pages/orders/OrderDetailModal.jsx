import { Modal, Button, Badge } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';

export default function OrderDetailModal({ isOpen, onClose, order, onStatusChange, vendorId }) {
  if (!order) return null;

  // Retrieve all items for this order that belong to this vendor
  const orderItems = order.details.filter(
    od => od.productVariant?.productColor?.product?.vendorId === vendorId
  );

  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'shipping': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Subtotal for the items that belong to the vendor
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details #${order.orderCode}`}
      maxWidth="max-w-4xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          {onStatusChange && (
            <div className="flex gap-2 ml-auto">
              {order.status === 'pending' && <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => onStatusChange('shipping')}>Mark as Shipping</Button>}
              {order.status === 'shipping' && <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onStatusChange('completed')}>Mark as Completed</Button>}
              {(order.status === 'pending' || order.status === 'shipping') && 
                <Button variant="danger" onClick={() => onStatusChange('cancelled')}>Cancel Order</Button>}
            </div>
          )}
        </>
      }
    >
      <div className="space-y-6">
        
        {/* Top Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Order Information</h4>
            <div className="space-y-1">
              <p className="text-sm"><span className="text-slate-500 dark:text-slate-400">Date:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{formatDate(order.createdAt)}</span></p>
              <p className="text-sm flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Status:</span> 
                <Badge variant={getStatusBadgeVariant(order.status)}>{order.status.toUpperCase()}</Badge>
              </p>
              <p className="text-sm"><span className="text-slate-500 dark:text-slate-400">Payment Method:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{order.payment?.method || 'N/A'}</span></p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Customer Details</h4>
            <div className="space-y-1">
              <p className="text-sm"><span className="text-slate-500 dark:text-slate-400">Name:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{order.receiverName || 'Unknown'}</span></p>
              <p className="text-sm"><span className="text-slate-500 dark:text-slate-400">Phone:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{order.receiverPhone || 'N/A'}</span></p>
              <p className="text-sm"><span className="text-slate-500 dark:text-slate-400">Shipping Address:</span> <span className="font-medium text-slate-800 dark:text-slate-100">{order.shippingAddress || 'No address provided'}</span></p>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div>
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3 border-b pb-2">Your Items in this Order</h4>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 transition-colors">
                {orderItems.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 rounded object-cover border border-slate-200 dark:border-slate-800" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 dark:border-slate-800"></div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{item.productName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.colorName} • Size {item.sizeName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">x{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-slate-100">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500 dark:text-slate-400">Items Subtotal</span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Note</span>
              <span className="font-medium text-slate-800 dark:text-slate-100 line-clamp-1">{order.notes || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-100">Your Share Total</span>
              <span className="font-bold text-blue-600 text-lg">{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
}
