export const REJECTION_RULES = [
  {
    code: 'OUT_OF_STOCK',
    title: 'Hết hàng tồn kho / Kho hàng hư hỏng',
    description: 'Sản phẩm trong kho đã hết đột xuất hoặc bị biến chất, vỡ trong lúc đóng gói kiểm tra.',
  },
  {
    code: 'INVALID_CONTACT',
    title: 'Không thể liên lạc khách hàng xác nhận',
    description: 'Gọi điện xác nhận thông tin 3 lần không nghe máy hoặc số điện thoại không tồn tại.',
  },
  {
    code: 'INCORRECT_ADDRESS',
    title: 'Địa chỉ giao hàng không có thực / sai khu vực giao',
    description: 'Địa chỉ cung cấp không đầy đủ (thiếu số nhà, thôn xóm) hoặc nằm ngoài bán kính phục vụ.',
  },
  {
    code: 'SUSPICIOUS_SPAM',
    title: 'Nghi vấn đơn hàng ảo / Gian lận Voucher',
    description: 'Tài khoản trùng địa chỉ IP, tạo hàng loạt đơn COD ảo hoặc trục lợi mã giảm giá.',
  },
  {
    code: 'VENDOR_SUSPENDED',
    title: 'Nhà cung cấp đối tác tạm dừng tiếp nhận đơn',
    description: 'Vendor sản xuất đang quá tải hoặc tạm thời bảo trì hệ thống tiếp nhận.',
  },
  {
    code: 'CUSTOMER_CANCEL_REQUEST',
    title: 'Khách hàng liên hệ hủy đơn trước khi duyệt',
    description: 'Khách hàng gọi điện hoặc gửi chat yêu cầu hủy đơn vì thay đổi ý định mua sắm.',
  },
];

