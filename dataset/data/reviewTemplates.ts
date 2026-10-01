/**
 * Vietnamese review content templates.
 * Grouped by rating (1–5 stars).
 */

export const REVIEW_TEMPLATES: Record<number, string[]> = {
  5: [
    'Sản phẩm rất tuyệt vời, chất lượng vượt mong đợi! Sẽ ủng hộ shop dài dài.',
    'Hàng đẹp, đúng mô tả, giao hàng nhanh. 5 sao không cần suy nghĩ!',
    'Mình rất hài lòng với sản phẩm này. Chất liệu tốt, màu sắc đẹp.',
    'Đóng gói cẩn thận, sản phẩm y hình. Shop phục vụ rất nhiệt tình.',
    'Sản phẩm chất lượng cao, giá hợp lý. Đã mua lần 2 và vẫn rất ưng ý.',
    'Xuất sắc! Thiết kế đẹp, sử dụng rất tiện lợi. Recommend cho mọi người.',
    'Chất lượng tuyệt hảo, đáng đồng tiền bát gạo. Sẽ giới thiệu bạn bè.',
    'Shop giao hàng siêu nhanh, sản phẩm đúng như mô tả. Rất đáng mua!',
    'Lần đầu mua ở shop và rất ấn tượng. Sản phẩm xịn, dịch vụ tốt.',
    'Mua cho cả nhà dùng, ai cũng thích. Giá cả phải chăng, chất lượng ok.',
  ],
  4: [
    'Sản phẩm khá tốt, đáng giá tiền. Có vài chi tiết nhỏ cần cải thiện.',
    'Hàng đẹp, giao hàng nhanh. Trừ 1 sao vì đóng gói hơi sơ sài.',
    'Sản phẩm ổn, dùng được. Chất liệu tạm ổn so với giá tiền.',
    'Nhìn chung sản phẩm tốt, chỉ hơi khác một chút so với hình.',
    'Chất lượng 4/5. Sẽ mua lại nếu shop cải thiện thêm bao bì.',
    'Hài lòng với sản phẩm, ship hơi chậm 1 ngày nhưng hàng ok.',
    'Sản phẩm đẹp, chất lượng tốt. Giá hơi cao nhưng xứng đáng.',
    'Dùng được 2 tuần rồi, khá ưng ý. Nếu bền hơn thì cho 5 sao.',
  ],
  3: [
    'Sản phẩm tạm được, không quá nổi bật nhưng cũng không tệ.',
    'Chất lượng trung bình, đúng với giá tiền. Không có gì đặc biệt.',
    'Hàng nhận được hơi khác so với hình. Chất lượng bình thường.',
    'Giao hàng chậm, sản phẩm tạm ổn. Cần cải thiện nhiều hơn.',
    'Dùng được nhưng không wow. Mong shop nâng cấp chất lượng.',
    'Sản phẩm OK, đóng gói cẩn thận. Tuy nhiên chất liệu chưa xịn lắm.',
  ],
  2: [
    'Sản phẩm không như mong đợi. Chất liệu kém hơn mô tả nhiều.',
    'Giao hàng chậm, hàng bị xước nhẹ. Không hài lòng lắm.',
    'Mua về dùng thấy chất lượng không tốt. Mong shop cải thiện.',
    'Hàng nhận khác xa hình ảnh. Thất vọng, khó có mua lại.',
  ],
  1: [
    'Sản phẩm kém chất lượng, không đúng mô tả. Rất thất vọng.',
    'Hàng lỗi, đã liên hệ shop nhưng hỗ trợ chậm. Không recommend.',
    'Chất lượng quá tệ so với giá tiền. Không nên mua sản phẩm này.',
  ],
};

/** Rating distribution weights (index 0 = 1 star, index 4 = 5 stars) */
export const RATING_WEIGHTS = [0.03, 0.05, 0.12, 0.30, 0.50];
