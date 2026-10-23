# Kết quả kiểm thử MIVA — 23/10/2026

## Phạm vi và kết quả

| Hạng mục | Kết quả |
|---|---|
| Backend unit tests | **58/58 PASS**, 9 suites |
| Backend HTTP e2e | **25/25 PASS**, 3 suites; fixture auth/catalog đã đồng bộ với 4 bảng tài khoản |
| Build | Backend, frontend, admin, vendor, employee đều **PASS** |
| Lint | Frontend, admin, vendor exit code 0; còn cảnh báo unused variables/React hooks |
| Dataset | `tsc --noEmit` **PASS** |
| Luồng trình duyệt | Đăng ký/đăng nhập, danh mục realtime, voucher admin/vendor, đặt hàng–đóng gói–giao hàng, định giá voucher: **6/6 scripts PASS** |
| Smoke giao diện | **40/40 route PASS** trên admin, vendor, employee, client; không gặp trang trắng, JavaScript exception hoặc API 5xx khi mở trang |
| Desktop local server | File build, API proxy, Socket.IO polling và WebSocket **PASS**; chưa chạy cửa sổ Electron/installer |
| Database migration | **PASS**: baseline mới chạy trên database trống; `migrate status` và so sánh schema trên DB hiện có đều đạt |

## Phát hiện và sửa trong lượt này

1. `GET /api/products` cho phép khách vãng lai dùng `status=inactive` hoặc `status=all` để liệt kê sản phẩm ẩn. Đã giới hạn endpoint công khai ở sản phẩm `active`; admin dùng `GET /api/products/admin/all` có kiểm tra quyền. Kiểm tra thực tế: public status ẩn trả 400, anonymous admin route trả 401, admin đăng nhập đọc được 200. Test public catalog và build lại đều đạt.
2. Desktop local server chưa chuyển tiếp `/socket.io`, nên realtime trên bản build không hoạt động. Đã bổ sung proxy cho HTTP polling và WebSocket upgrade. Script kiểm thử cả hai transport đạt.
3. Script `vendor-sync.manual.cjs` chờ nút đóng gói ở trạng thái đơn chưa xác nhận, trong khi UI hiện hiển thị nút “Xác nhận đơn hàng” bị khóa. Đã cập nhật bước kiểm thử; chạy lại toàn bộ luồng đạt.
4. Hai suite HTTP e2e cũ dùng fixture bảng `User` và giả định có thể đổi `role` trên cùng bản ghi. Đã chuyển sang `Client`, `Vendor`, `Admin`, `Employee`, cập nhật kỳ vọng đăng ký/phiên/quyền và các mock catalog. Toàn bộ 25 ca đạt.
5. Đã lưu 31 migration cũ để tra cứu, tạo baseline active từ Prisma schema và thử triển khai trên database PostgreSQL trống. Database `ecommerce` được sao lưu trước khi đưa lịch sử migration về baseline; dữ liệu nghiệp vụ không được sửa. Cột `Vendor.address` được mô tả trong Prisma và mặc định `commissionRate` của DB được chỉnh từ 5 sang 8 theo schema. Chi tiết tại [MIGRATION_BASELINE.md](backend/prisma/MIGRATION_BASELINE.md).

## Việc còn mở

- Database khác còn dùng lịch sử migration cũ cần đối chiếu schema và sao lưu trước khi đánh dấu baseline mới đã áp dụng. Không chạy SQL baseline trực tiếp trên database đã có dữ liệu.
- Chưa kiểm thử thao tác ghi đầy đủ cho khảo sát, thông báo, chấm công/lương, thanh toán demo, tình huống mất mạng và mua đồng thời; 40 route smoke chỉ chứng minh trang tải được. Chưa kiểm thử cửa sổ Electron hoặc installer vì dependencies Electron chưa sẵn có; phép thử desktop ở trên chỉ bao phủ local server.
- Lệnh cài dependencies desktop được dừng khi tải Electron chưa hoàn tất. Thư mục `desktop/node_modules` cài dở còn trên máy; thao tác xóa đệ quy thư mục này bị chính sách thực thi tự động từ chối (`blocked by policy`).

Các script dùng bản ghi test tạm và tự dọn. Kiểm tra sau chạy: 0 khách, sản phẩm và voucher còn lại theo các prefix test đã dùng. Những thay đổi có sẵn trong workspace trước lượt kiểm thử được giữ nguyên.

## Kiểm tra sau đồng bộ migration

- `prisma validate`, `prisma migrate status` và `prisma migrate diff` đều đạt; database hiện tại khớp schema.
- Backend chạy với database thật: health, danh sách sản phẩm và danh mục đều trả HTTP 200; đăng nhập tài khoản admin và vendor mẫu đều trả HTTP 201.
- Hai database tạm `miva_migration_shadow_20261023142914` và `miva_fresh_baseline_20261023` còn trên PostgreSQL. Thao tác xóa chúng bị hệ thống xét duyệt tự động từ chối với lý do `blocked by policy`.
