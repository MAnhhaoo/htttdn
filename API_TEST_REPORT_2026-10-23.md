# Kiểm tra API thực tế — 23/10/2026

## Kết quả

| Phép thử | Kết quả |
|---|---:|
| Mở 40 trang trên client, admin, vendor, employee và ghi request API | 665 request; không có HTTP 4xx/5xx hoặc lỗi JavaScript |
| Gọi API chi tiết và thao tác client bằng HTTP trực tiếp | 35/35 đạt |
| Gọi API nhân viên, thông báo, chấm công, lương và khảo sát bằng HTTP trực tiếp | 24/24 đạt |
| Sáu luồng trình duyệt có ghi dữ liệu tạm | 6/6 đạt |

Các phép thử trực tiếp và khi mở trang bao phủ **84 tổ hợp phương thức + mẫu đường dẫn API**. Response được kiểm tra theo mã HTTP; những thao tác địa chỉ, yêu thích, giỏ hàng và sản phẩm còn được đối chiếu nội dung dữ liệu. Các luồng trình duyệt kiểm tra tạo/sửa/xóa danh mục và voucher, đăng ký/đăng nhập, tạo sản phẩm, đặt hàng, trạng thái đơn, giao hàng, thanh toán COD và cập nhật realtime.

Những request của cổng nhân viên cần phiên đăng nhập được lưu vào `localStorage`; script đã thiết lập đúng token và hồ sơ trước khi mở trang. Cả bảy trang nhân viên sau đó phát sinh API và đều đạt.

Script có thể chạy lại khi backend và bốn Vite server hoạt động:

```bash
cd backend
node test/api-calls.manual.cjs
node test/api-detail.manual.cjs
node test/api-workflows.manual.cjs
```

Các script dùng tài khoản và bản ghi tạm, rồi dọn dữ liệu. Kiểm tra sau chạy: không còn client `api-detail-*`, employee `api-workflow-*` hoặc survey `API-WORKFLOW-*`.

## Giới hạn

Kết quả trên xác nhận các API được gọi khi mở trang và các thao tác đã thực hiện, chưa xác nhận mọi nhánh của toàn bộ controller. Chưa chạy thao tác upload ảnh, phê duyệt/từ chối vendor, phân công đơn hàng hàng loạt, thanh toán demo, gửi phản hồi khảo sát, trường hợp nhiều người mua đồng thời và tình huống mất mạng. Các chức năng này cần ca kiểm thử riêng trước khi kết luận toàn bộ API đều hoạt động.
