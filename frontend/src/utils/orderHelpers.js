import {
  computeBatchOrderFinancials,
  groupOrdersByCheckoutBatch as sharedGroupOrdersByCheckoutBatch,
} from '@shared/utils/orderBatchHelpers';
import { formatShortOrderCode } from '@shared/utils/formatHelpers';

export { computeBatchOrderFinancials, formatShortOrderCode };

export function getOrderStoreName(order) {
  return (
    order?.vendorOrders?.[0]?.vendor?.storeName ||
    order?.details?.[0]?.productVariant?.productColor?.product?.vendor?.storeName ||
    order?.details?.[0]?.product?.vendor?.storeName ||
    null
  );
}

/**
 * Gộp các đơn hàng được đặt cùng 1 lượt thanh toán của khách hàng hiện tại
 * (cùng địa chỉ nhận, thời gian tạo cách nhau <= 60 giây) thành 1 Đơn hàng gộp.
 */
export function groupOrdersByCheckoutBatch(rawOrders) {
  return sharedGroupOrdersByCheckoutBatch(rawOrders, { matchClientKey: false });
}
