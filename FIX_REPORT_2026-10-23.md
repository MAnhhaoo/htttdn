# Kết quả sửa và kiểm tra ngày 23/10/2026

## Cập nhật thông báo lỗi

- API trả nội dung lỗi cụ thể trong `message` thay cho chuỗi `ERROR`, nên các alert ở bốn cổng hiển thị đúng nguyên nhân từ backend.
- Client và vendor không ghi mọi lỗi API đã xử lý vào console. Cả bốn cổng hiển thị thông báo tiếng Việt khi mất kết nối hoặc request quá thời gian.
- Checkout không tải lại giỏ hàng ngay sau khi tạo đơn, tránh request thừa báo giỏ trống. Trang thanh toán demo hiển thị nguyên nhân API khi thất bại.
- Đã kiểm tra 25/25 e2e backend, build cả bốn giao diện, và trình duyệt: đăng nhập sai hiện đúng thông điệp API, không ghi log `API Error`.

## Đã sửa

- Chặn nhân viên không có quyền duyệt vendor; chống duyệt/từ chối lặp lại. Từ chối gia hạn giữ vendor đang hoạt động và ngày hết hạn cũ. Đồng bộ quyền hiển thị nút ở cổng nhân viên, gói đăng ký và tỷ lệ hoa hồng mặc định ở giao diện.
- Trang checkout đợi giỏ hàng tải xong trước khi quyết định chuyển trang. Checkout nhiều vendor dẫn người mua qua từng khoản thanh toán demo; trạng thái thanh toán đọc đúng phản hồi API, giữ được hàng đợi sau khi tải lại trang, và cho phép thử lại khoản thanh toán thất bại.
- Checkout tự thử lại tối đa hai lần khi transaction bị tranh chấp ở database; kiểm tra tồn kho vẫn chặn bán vượt số lượng.
- API phân công đơn từ chối nhân viên không hoạt động và đơn đã hoàn tất/hủy.
- API phản hồi khảo sát chỉ truy vấn phản hồi thuộc tài khoản hiện tại; trước đây biết ID là có thể đọc hoặc thay đổi phản hồi của khách khác qua một số endpoint.

## Đã chạy

| Kiểm tra | Kết quả |
|---|---|
| Build backend, frontend, admin, employee | Đạt |
| Unit test backend | 58/58 đạt |
| E2E backend | 25/25 đạt |
| Duyệt/từ chối vendor và gia hạn | Đạt |
| Phân công đơn, nhân viên ngừng hoạt động, đơn đóng | Đạt |
| Hai khách mua đồng thời sản phẩm còn 1 chiếc; hai lần checkout cùng giỏ | Đạt cả khi chạy 3 bộ song song |
| Upload PNG, tải tệp, từ chối MIME không hợp lệ | Đạt |
| Checkout hai vendor, thanh toán thất bại/thành công, tải lại và thử lại | Đạt |
| Checkout gửi khảo sát; khách khác bị chặn xem/mở/bỏ qua/gửi; khách đúng trả lời | Đạt |

Các ca HTTP/trình duyệt trên dùng dữ liệu tạm và dọn sau khi chạy. Script nằm trong `backend/test/*.manual.cjs`.

## Giới hạn còn lại

- Chưa có nhân viên đang hoạt động thuộc phòng Vận chuyển & Giao nhận trong dữ liệu hiện tại, nên đơn mới có thể chờ phân công người giao hàng. Cần tạo hoặc kích hoạt nhân viên đúng phòng ban trong môi trường vận hành.
- Khảo sát admin gửi đến `all_vendors` hiện chỉ tạo thông báo cho vendor; schema phản hồi chỉ liên kết với client, nên vendor chưa thể gửi câu trả lời qua inbox. Luồng này cần mở rộng schema, migration và giao diện vendor.
- Chưa kiểm tra mất mạng, vận hành Electron đóng gói, và phân công hàng loạt trên dữ liệu thật. Phân công hàng loạt có thể thay đổi nhiều đơn sẵn có nên chưa chạy trên database đang dùng.
- Khi hết hàng sau lần thử lại, API có thể trả `400` hoặc `409` tùy điểm phát hiện. Cả hai đều từ chối đơn vượt tồn kho; nếu giao diện cần xử lý thống nhất, nên chuẩn hóa mã lỗi này.
