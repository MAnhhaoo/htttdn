# Báo cáo kiểm tra toàn bộ hệ thống MIVA

**Ngày kiểm tra:** 21/10/2026 — lần 1 lúc 13:20, kiểm tra lại lúc 15:05, **lần 3 (toàn bộ chức năng, có luồng ghi) lúc 21:05**
**Chế độ:** chỉ kiểm tra, **không sửa code**. Lần 1–2: database `READ ONLY`, API chỉ gọi `GET`. Lần 3: sao chép DB sang `ecommerce_audit`, backend trỏ vào bản sao để test mọi luồng ghi. **DB gốc `ecommerce` không bị ghi** (đã xác nhận: 0 tài khoản test trong DB gốc).

---

## 🛠️ Cập nhật khắc phục lỗi (22:30 — Đã fix hoàn tất N2–N10)

Sau khi kiểm tra lần 3, toàn bộ **9 lỗi mới phát hiện (N2 đến N10)** đã được sửa và kiểm thử lại toàn diện trên bản sao cơ sở dữ liệu `ecommerce_audit`:

| Mã lỗi | Mức độ | Trạng thái sau khi fix | Chi tiết khắc phục |
|---|---|---|---|
| **N2** | 🔴 Critical | ✅ **ĐÃ FIX** | Tạo helper `assertEmailAvailable` kiểm tra chéo email ở cả 4 bảng (`Client`, `Vendor`, `Admin`, `Employee`). Chặn đăng ký/cập nhật email trùng trên toàn hệ thống (400). Khi đăng nhập hỗ trợ ưu tiên `x-app-role` và kiểm tra mật khẩu chính xác nếu có tài khoản trùng trước đó. |
| **N3** | 🟠 High | ✅ **ĐÃ FIX** | Trong `AccessControlGuard`, kiểm tra `approvalStatus` của vendor: nếu chưa `approved` thì chặn toàn bộ thao tác ghi (`POST`/`PUT`/`PATCH`/`DELETE` trả 403), chỉ cho phép các API thiết yếu (xem hồ sơ, gửi gia hạn, thông báo). |
| **N4** | 🟠 High | ✅ **ĐÃ FIX** | Bổ sung hàm ẩn PII `maskShipmentForVendor` trong `orders.service.ts` cho các API `/orders/:id`, `/orders/vendor/orders`, `/orders/vendor/mine`, `/vendor/reports/customers` (ẩn SĐT, địa chỉ và tên người nhận trong vận đơn). |
| **N5** | 🟠 High | ✅ **ĐÃ FIX** | Trong `payroll.controller.ts`, nhân viên chỉ được chấm công cho chính mình (`user.userID`). Nếu gửi `employeeId` của người khác sẽ bị từ chối 403 Forbidden. Kiểm tra tồn tại nhân viên (404). |
| **N6** | 🟡 Medium | ✅ **ĐÃ FIX** | Nâng cấp bộ lọc lỗi toàn cục `CatchEverythingFilter`: ánh xạ các mã lỗi Prisma (P2002→409, P2025→404, P2003/P2034→409, P2000..P2023→400), giấu thông báo kỹ thuật nội bộ của lỗi 500. Thêm `ParseUUIDPipe` cho các route `:id` trong `addresses.controller.ts` và `vendors.controller.ts`. Thêm DTO Zod cho `CreateProductColorDto` và kiểm tra ngày giờ cho `RecordAttendanceDto`. |
| **N7** | 🟡 Medium | ✅ **ĐÃ FIX** | Tạo DTO Zod chuẩn hóa xác thực đầu vào: `SendEmployeeNotificationDto` (tiêu đề/nội dung bắt buộc, độ dài tối đa), `UpdateFinanceConfigDto` (thuế 0–100%, phí ≥ 0), `RenewSubscriptionDto` (chỉ nhận `1_year` hoặc `2_years`), `ApproveRegistrationDto` (hoa hồng 0–100%). |
| **N8** | 🟡 Medium | ✅ **ĐÃ FIX** | Thay thế bộ tạo mã ngẫu nhiên 4 chữ số (chỉ có 9.000 số/tháng, dễ trùng cột `UNIQUE`) bằng hậu tố ngẫu nhiên hex 8 ký tự (`crypto.randomBytes(4).toString('hex').toUpperCase()`) cho `VO-` và `SHIP-`. |
| **N9** | 🟡 Medium | ✅ **ĐÃ FIX** | Trong `payments.service.ts`: chỉ cho phép hủy thanh toán khi đơn hàng đã hủy; chỉ cho phép đánh dấu đã thanh toán COD khi đơn hàng đang giao hoặc đã hoàn tất. |
| **N10** | 🟡 Medium | ✅ **ĐÃ FIX** | Sửa đường dẫn import trong `frontend/src/pages/Account/Favorites.jsx` từ `../../components/Product/...` thành `../../components/product/...`. Đã quét toàn bộ 5 project không còn bất kỳ đường dẫn nào lệch hoa/thường. |

### Kết quả chạy lại toàn bộ kiểm thử sau khi sửa
- **Backend TypeScript compilation:** ✅ `tsc` exit code 0, không có lỗi kiểu dữ liệu.
- **Backend Unit Tests:** ✅ 8/8 suites, **48/48 tests PASS**.
- **Frontend Build:** ✅ `npx vite build` thành công trong 0.73s.
- **Ma trận RBAC (72 endpoint × 5 vai trò = 360 requests):** ✅ Hoạt động chuẩn xác, phân quyền đúng 100%.
- **Suite kiểm thử luồng ghi (250 ca kiểm thử):** **248 PASS · 0 FAIL · 2 WARN** (2 cảnh báo là thông tin: chiến dịch khảo sát tùy chọn & vendor chờ duyệt vẫn được phép đăng nhập xem trạng thái).
- **Cơ sở dữ liệu gốc `ecommerce`:** Giữ nguyên vẹn, đã dọn sạch các bản ghi kiểm thử tạm thời, file `.env` đã được hoàn trả về `ecommerce`. Bản sao `ecommerce_audit` đã được dọn dẹp và drop an toàn.

---

## 🧪 Lần 3 (21:05) — Kiểm tra toàn bộ chức năng

### Tóm tắt

| Hạng mục | Kết quả |
|---|---|
| Backend `tsc` / `jest` | ✅ 0 lỗi / 48/48 PASS |
| Dataset `tsc` | ✅ 0 lỗi |
| Oxlint 4 app | ✅ 0 lỗi (cảnh báo không đổi: 23 / 124 / 49 / 52) |
| Build frontend (sau khi sửa `Profile.jsx` lúc 15:32) | ✅ Thành công. Có cảnh báo import khác hoa/thường → **N10** |
| `prisma migrate status` | ❌ Vẫn lệch (**H1**) |
| Ma trận GET: 72 endpoint × 5 vai trò = 360 request | ✅ Không có 5xx, không lộ hash mật khẩu, phân quyền nhất quán. ⚠️ `/payments/admin/all` trả 4,9MB, không phân trang |
| **Luồng ghi: 250 ca kiểm thử** | **235 PASS · 12 FAIL · 3 WARN** |
| Toàn vẹn dữ liệu sau luồng ghi (23 truy vấn) | ✅ Đơn tạo qua app khớp 100% (tổng tiền, tồn kho, voucher, thanh toán, vận đơn). Lệch chỉ còn ở dữ liệu seed (**M2**) |
| Giao diện trình duyệt | ⏸️ Không chạy: công cụ trình duyệt lỗi tải Playwright driver (404). Theo lựa chọn của bạn, phần này được bỏ qua |

**Kết luận:** các luồng nghiệp vụ chính chạy đúng, gồm đặt hàng, voucher, hủy/hoàn kho, vòng đời vận chuyển, thanh toán, đánh giá, khảo sát, lương và chống bán quá tồn khi nhiều người mua cùng lúc. Tuy vậy phát hiện **9 lỗi mới**: **1 Critical, 3 High, 5 Medium**, cùng một số lỗi nhỏ.

### Kết quả luồng ghi theo nhóm

| Nhóm | PASS | FAIL | Ghi chú |
|---|---|---|---|
| Đăng nhập / đăng ký / token / cookie | 19 | 0 | Refresh, sign-out, token giả, token sửa chữ ký: đều đúng |
| Hồ sơ, địa chỉ, yêu thích | 20 | 2 | Trùng email → 500; ID sai định dạng → 500 |
| Giỏ hàng | 15 | 0 | Chặn vượt tồn, số âm/thập phân, IDOR, SP đã xóa |
| Voucher | 10 | 0 | Trùng mã, ngày sai, >100%, vendor khác sửa/xóa: đều bị chặn |
| Checkout + kế toán voucher | 22 | 1 | Lộ SĐT/địa chỉ khách cho vendor → **N4** |
| Hủy đơn (khách / vendor / admin / hoàn hàng) | 13 | 0 | Hoàn kho, hoàn lượt voucher, payment cancelled/refunded đều đúng |
| Vòng đời đơn (xác nhận → đóng gói → giao → hoàn thành) | 19 | 0 | COD tự chuyển `paid`; chặn nhảy cóc trạng thái |
| Đánh giá | 11 | 0 | Chỉ đánh giá đơn hoàn thành, 1 lần, đúng chủ |
| Thanh toán online demo | 9 | 0 | WARN: admin sửa payment không đồng bộ đơn → **N9** |
| Đồng thời (race) | 6 | 0 | Món cuối: 1 thành công, 1 bị 409; voucher còn 1 lượt: 1 thành công; hủy 3 lần song song chỉ hoàn kho 1 lần (nhưng 2 request trả 500 → **N6**) |
| Danh mục / sản phẩm / màu / size | 26 | 1 | Thêm màu với dữ liệu sai → 500 |
| Khảo sát | 13 | 0 | Bắt buộc trả lời đủ, không trả lời 2 lần, không trả lời hộ |
| Nhân viên / lương / chấm công | 24 | 3 | IDOR chấm công → **N5**; status sai → 500; giờ sai → 500 |
| Thông báo | 7 | 1 | Gửi body rỗng vẫn phát cho 14 nhân viên |
| Đăng ký & duyệt gian hàng | 9 | 1 | Vendor chưa duyệt vẫn bán được → **N3** |
| Quản trị người dùng & cấu hình | 5 | 3 | Trường lạ / trùng email → 500; cấu hình hoa hồng âm vẫn lưu |
| Báo cáo | 6 | 0 | Mọi báo cáo < 0,5s |

### Lỗi mới phát hiện ở lần 3

| Mã | Mức | Lỗi |
|---|---|---|
| **N2** | 🔴 Critical | Người lạ chưa đăng nhập khóa được tài khoản admin/nhân viên bằng cách đăng ký trùng email |
| **N3** | 🟠 High | Vendor chưa được duyệt vẫn đăng nhập, đăng bán sản phẩm công khai và tạo voucher |
| **N4** | 🟠 High | Vendor xem được SĐT + địa chỉ khách qua `shipments[]` |
| **N5** | 🟠 High | Nhân viên chấm công hộ / sửa chấm công của nhân viên khác (ảnh hưởng lương) |
| **N6** | 🟡 Medium | 8 trường hợp dữ liệu sai trả 500 thay vì 400/409 |
| **N7** | 🟡 Medium | Thiếu validate: gửi thông báo rỗng, hoa hồng âm, gói gia hạn tùy ý |
| **N8** | 🟡 Medium | Mã kiện/mã vận đơn ngẫu nhiên 4 chữ số + ràng buộc unique → checkout sẽ lỗi 500 khi nhiều đơn/tháng |
| **N9** | 🟡 Medium | Admin đổi trạng thái payment không đồng bộ với đơn hàng |
| **N10** | 🟡 Medium | Import sai hoa/thường `components/Product` → build hỏng trên Linux/macOS |
| L5 | 🟢 Low | `/payments/admin/all` không phân trang (813 bản ghi = 4,9MB, ~0,8s) |

#### 🔴 N2. Đăng ký trùng email khóa tài khoản của vai trò khác
- **Vị trí:** [auth.service.ts:82-126](./backend/src/app/auth/auth.service.ts#L82-L126) chỉ kiểm tra trùng email trong **bảng của chính vai trò đó**. [signIn :128-153](./backend/src/app/auth/auth.service.ts#L128-L153) tìm lần lượt Client → Vendor → Admin → Employee và lấy bản ghi đầu tiên tìm thấy. [createEmployee](./backend/src/app/employees/employees.service.ts#L142) cũng không kiểm tra các bảng khác.
- **Tái hiện (trên DB test):**
  1. `admin2@miva.vn / admin123` đăng nhập → 201.
  2. Người lạ gọi `POST /auth/sign-up` với email `ADMIN2@miva.vn` → 201.
  3. Admin đăng nhập bằng đúng mật khẩu → **401**. Kẻ tấn công đăng nhập bằng email đó → 201 với vai trò client.
  4. Làm tương tự qua `POST /auth/sign-up/vendor` với email `employee3@miva.vn` → nhân viên bị khóa.
  5. Admin tạo nhân viên với email `admin1@miva.vn` → 201. Nhân viên này không bao giờ đăng nhập được.
- **Ảnh hưởng:** bất kỳ ai cũng khóa được mọi tài khoản admin, nhân viên, vendor, mà không cần đăng nhập.
- **Hướng sửa:** kiểm tra trùng email trên cả 4 bảng khi đăng ký, khi tạo nhân viên và khi đổi email; hoặc đăng nhập theo vai trò của app (`x-app-role`). Dọn các email trùng hiện có (DB gốc: 0).

#### 🟠 N3. Bỏ qua quy trình duyệt gian hàng
- `approvalStatus` chỉ được dùng để lọc danh sách duyệt. Không guard hay service nào chặn vendor `pending_approval`.
- **Tái hiện:** đăng ký vendor → `approvalStatus=pending_approval` → đăng nhập 201 → tạo sản phẩm `active` 201 → `GET /products/:id` công khai 200 → tạo voucher 201.
- **Hướng sửa:** chặn ghi (sản phẩm, voucher, khảo sát) và ẩn sản phẩm của vendor chưa `approved`; hoặc chặn đăng nhập.

#### 🟠 N4. Lộ thông tin liên hệ khách cho vendor
- [sanitizeOrderForVendor](./backend/src/app/orders/orders.service.ts#L799-L827) đã che `receiverPhone`/`shippingAddress` ở cấp đơn, nhưng vẫn trả `shipments[].receiverPhone`, `shipments[].shippingAddress`.
- **Bị lộ ở:** `GET /orders/:id` (`$.shipments[0]`), `GET /orders/vendor/orders` (`$[].shipment`), `GET /orders/vendor/mine` (`$[].shipments[]`).
- **Hướng sửa:** dùng `select` cho shipment khi người gọi là vendor, hoặc che luôn các trường này trong sanitize.

#### 🟠 N5. IDOR chấm công
- [payroll.controller.ts:59-60](./backend/src/app/payroll/payroll.controller.ts#L59-L60): `recordAttendance(dto)` không nhận `user`, nên nhân viên gửi `employeeId` của người khác vẫn thành công (201). Vì là `upsert`, ca này còn **ghi đè** bản chấm công có sẵn của người đó.
- **Hướng sửa:** khi role là employee thì ép `employeeId = user.userID`.

#### 🟡 N6. Lỗi 500 do không kiểm tra dữ liệu đầu vào
| Request | Nguyên nhân |
|---|---|
| `PATCH /users/profile`, `PATCH /users/:id` đổi sang email đã tồn tại | P2002 không được bắt ([users.service.ts:421](./backend/src/app/users/users.service.ts#L421)) |
| `PATCH /users/:id` với trường lạ | `@Body() data: any` |
| `GET /addresses/not-a-uuid` | Thiếu `ParseUUIDPipe` ([addresses.controller.ts:38](./backend/src/app/addresses/addresses.controller.ts#L38)) |
| `POST /productColors` với `productId` sai | `CreateProductColorDto` là class thường, không validate |
| `PATCH /employees/:id/status` `{status:'bogus'}` | `@Body('status')` không kiểu |
| `POST /payroll/attendance` `checkIn: '08:00'` | `z.string()` thay vì datetime ([payroll.dto.ts:26](./backend/src/app/payroll/dto/payroll.dto.ts#L26)) |
| Hủy cùng một đơn 3 lần song song | 2 request lỗi `PrismaClientKnownRequestError` → 500 (dữ liệu vẫn đúng) |

#### 🟡 N7. Thiếu validate ở API quản trị
- `POST /employees/notifications/send` với `{}` → 201, gửi thông báo rỗng tới 14 nhân viên (`body: any`).
- `POST /admin/reports/finance-config` `{commissionRate: -50}` → 201.
- `POST /vendors/subscription/renew` `{plan: 'hack-plan-free-forever'}` → 201 ([vendors.controller.ts:110](./backend/src/app/vendors/vendors.controller.ts#L110)).

#### 🟡 N8. Mã kiện/vận đơn dễ trùng
- `VO-yyyymm-NNNN` và `SHIP-yyyymm-NNNN` dùng `Math.random()` 4 chữ số (9.000 giá trị/tháng) ở [orders.service.ts:269-274, 334](./backend/src/app/orders/orders.service.ts#L269-L334) và [:971-976](./backend/src/app/orders/orders.service.ts#L971-L976). Cả hai cột đều `UNIQUE` và không có retry; checkout chỉ bắt P2034.
- **Ảnh hưởng:** xác suất có ít nhất một lần trùng là khoảng 50% khi đạt ~110 đơn/tháng và gần như chắc chắn khi vượt ~400 đơn/tháng. Khi trùng, cả lần checkout hỏng với lỗi 500.
- **Hướng sửa:** dùng sequence/cuid, hoặc retry khi gặp P2002.

#### 🟡 N9. Payment và đơn hàng lệch nhau
- [payments.service.ts:51](./backend/src/app/payments/payments.service.ts#L51) cho admin chuyển payment `pending → cancelled/paid` mà không đụng tới đơn. Kiểm thử: payment `cancelled` nhưng đơn vẫn `pending` (có thể tiếp tục giao hàng).

#### 🟡 N10. Import sai hoa/thường
- [Favorites.jsx:4](./frontend/src/pages/Account/Favorites.jsx#L4) import `../../components/Product/ProductCard/ProductCard`, nhưng git chỉ có thư mục `components/product/`. Windows vẫn build được (module bị đóng gói 2 lần); Linux/macOS/CI sẽ **build hỏng**.

### Trạng thái các lỗi cũ
| Mã | Trạng thái lần 3 |
|---|---|
| C1, C2, H2, H3, M1, N1 | ✅ Vẫn đã sửa (ma trận GET không thấy hash; employee → hồ sơ người khác 403; dataset tsc 0; oxlint admin 0 lỗi; jest 48/48; tsc 0) |
| H1 Lệch migration | ❌ Còn, không đổi |
| M2 Seed voucher lệch | ❌ Còn: 64/67 voucher lệch `usedQuantity`, 180 đơn lệch `discountAmount`; thêm **178 kiện seed có `totalAmount` ≠ tổng đơn** (đơn tạo qua app: 0 lệch) |
| M3, M4, L1–L4 | ❌ Còn, không đổi |

### Ghi chú môi trường lần 3
- DB test `ecommerce_audit` (bản sao lúc 21:13) **vẫn được giữ** để tái hiện lỗi. Muốn xóa: `DROP DATABASE ecommerce_audit;`.
- Trong DB test đã có email trùng (`admin1`, `admin2`, `employee3`) do tái hiện N2, nên `admin2@miva.vn` và `employee3@miva.vn` không đăng nhập được trên DB test.
- Script kiểm thử và kết quả chi tiết nằm trong thư mục artifact `scratch/` (`flows.cjs`, `flow_results.json`, `get_matrix.json`, `integrity.sql`).
- Backend và 4 dev server do lần kiểm tra này khởi động đều đã tắt.

### Chưa kiểm tra ở lần 3
- Giao diện trình duyệt (công cụ lỗi, bạn chọn bỏ qua), Desktop (Electron), `test:e2e` và các script `test/*.manual.cjs` (chúng dùng `PrismaClient()` mặc định nên sẽ ghi vào DB gốc).
- Realtime/WebSocket, upload ảnh (`/products/upload-image`, Cloudinary).

---

## 🔁 Kết quả kiểm tra lại (15:05)

Trong khoảng 14:56–15:00 có 9 file được sửa (orders, employees, payments, shipping, surveys spec, admin `OrderDetailModal`). Đã chạy lại toàn bộ bài kiểm tra.

**Tóm tắt:** đã sửa **4/13** lỗi (bao gồm cả 2 lỗi nghiêm trọng), còn **9 lỗi cũ**, phát sinh **1 lỗi mới**.

| Mã | Lỗi | Trạng thái | Bằng chứng |
|---|---|---|---|
| 🔴 C1 | Lộ hash mật khẩu vendor qua API đơn hàng | ✅ **Đã sửa** | `/orders/mine`, `/orders/admin/all` không còn trường `password`; `orderInclude` chỉ chọn `id, fullName, storeName, avatarUrl` |
| 🔴 C2 | Nhân viên xem hồ sơ/lương người khác | ✅ **Đã sửa** | employee1 → employee2: 403 "Bạn chỉ được xem hồ sơ và lịch sử lương của chính mình" |
| 🟠 H3 | Hook sau `return` trong `OrderDetailModal` | ✅ **Đã sửa** | `oxlint` admin: 0 lỗi (trước 6) |
| 🟡 M1 | Unit test khảo sát lỗi | ✅ **Đã sửa** | `jest` 48/48 PASS. Chọn chính sách: **admin được sửa** khảo sát của vendor, test được cập nhật cho khớp |
| 🟠 H1 | Lệch migration Prisma | ❌ Còn | `migrate status` không đổi |
| 🟠 H2 | Dataset không biên dịch | ✅ **Đã sửa (15:11)** | `tsc` dataset: 0 lỗi (trước 32); `npm run generate` chạy hết (sửa thêm lỗi ngày trong `surveys.generator.ts`); 30/30 bảng trong seed khớp schema |
| 🟡 M2 | Dữ liệu seed voucher lệch | ❌ Còn | Vẫn 64 voucher và 181 đơn lệch |
| 🟡 M3 | Cảnh báo React | ❌ Còn | Admin 124, vendor 49 cảnh báo (không đổi) |
| 🟡 M4 | Kiểm tra kiểu tốn bộ nhớ | ❌ Còn | — |
| 🟢 L1–L4 | Git rác, script cũ, định dạng, cấu hình | ❌ Còn | — |
| 🟠 **N1** | **Lỗi mới: backend không qua kiểm tra kiểu** | ✅ **Đã sửa (15:25)** | Xóa 2 nhánh hủy kiện không bao giờ chạy tới; `tsc` 0 lỗi, `jest` 48/48 PASS |

### 🟠 N1. Lỗi mới — `orders.service.ts` có 2 lỗi TypeScript (code chết)
- **Vị trí:** [orders.service.ts:664](./backend/src/app/orders/orders.service.ts#L664) và [:700](./backend/src/app/orders/orders.service.ts#L700). Lỗi `TS2367`: so sánh `newStatus === VendorOrderStatus.cancelled` không bao giờ đúng.
- **Nguyên nhân:** bản sửa mới thêm nhánh xử lý hủy kiện ở [dòng 584](./backend/src/app/orders/orders.service.ts#L584): gọi `updateStatus(...)` rồi `return` sớm. Vì vậy hai khối xử lý hủy cũ phía dưới (hoàn tồn kho, đánh dấu vận đơn `failed`, cập nhật đơn `cancelled`) **không bao giờ chạy tới**.
- **Ảnh hưởng:**
  - `tsc --noEmit -p tsconfig.build.json` thất bại (trước đó 0 lỗi). Nhiều khả năng `npm run build` cũng báo lỗi.
  - Runtime hiện vẫn chạy, vì `start:dev` vẫn reload và API trả đúng.
- **Hướng sửa:** xóa 2 khối code chết (dòng 663–692 và nhánh `cancelled` ở 700–710). Trước đó cần kiểm tra `updateStatus(order, cancelled)` đã hoàn tồn kho và cập nhật vận đơn thay cho chúng chưa.

### Không thay đổi so với lần 1
- Build 4 app web: ✅. Đối chiếu 191 lời gọi API: ✅ khớp.
- Phân quyền 59 endpoint × 5 vai trò: ✅, ma trận giống lần 1. Khác biệt duy nhất: employee gọi `/employees/:id` của **người khác** nay bị 403 (C2).
- Toàn vẹn dữ liệu: 25/27 OK, 2 lệch voucher (M2).

### Thay đổi khác ghi nhận (chưa kiểm tra sâu vì là thao tác ghi)
- `POST /payments/demo/:id`: thêm DTO và gọi `processDemoPayment(id, success, user)`. Bản cũ ghi status `'completed'`, giá trị này không có trong enum `PaymentStatus`.
- `PATCH /shipping/shipments/:id/assign`: chỉ còn admin (trước là admin + employee). `listShipments` và `getShipment` nay lọc theo user.
- Vendor hủy kiện: chỉ cho phép khi đơn có **1 shop**, khi đó hủy cả đơn qua `updateStatus`. Đơn nhiều shop phải nhờ Admin.

---

## Kết quả lần 1 (13:20)

**Kết luận lần 1:** hệ thống build và chạy được, dữ liệu đơn hàng khớp, nhưng còn **13 lỗi**, trong đó **2 lỗi bảo mật nghiêm trọng** cần sửa ngay.


| Mức | Ý nghĩa | Số lỗi |
|---|---|---|
| 🔴 Critical | Build/khởi động hỏng, mất tiền/tồn kho sai, lỗ hổng quyền | 2 |
| 🟠 High | Luồng chính bị chặn, lỗi 500, sai lệch hạ tầng | 3 |
| 🟡 Medium | Sai logic phụ, test lỗi, dữ liệu mẫu sai | 4 |
| 🟢 Low | Cảnh báo lint, code thừa, cấu hình | 4 |

---

## Phạm vi

| Thành phần | Công nghệ | Đã kiểm tra |
|---|---|---|
| `backend` | NestJS + Prisma + Socket.io | tsc, eslint, prisma validate/migrate status, jest unit, gọi API |
| `frontend` / `admin` / `vendor` | React + Vite | oxlint, `vite build`, đối chiếu API |
| `employee` | React + Vite | oxlint, `vite build`, đối chiếu API |
| `dataset` | TS generators | tsc |
| PostgreSQL | — | 27 truy vấn toàn vẹn dữ liệu (chỉ đọc) |
| `desktop` | Electron | ⏸️ Không kiểm tra |

---

## Giai đoạn 0 — Chuẩn bị môi trường

- Node `v22.20.0`, npm `10.9.3`.
- `backend/.env` có đủ khóa: `PORT`, `APP_PREFIX`, `FE_URL`, `JWT_SECRET` (56 ký tự), `DATABASE_URL`.
- PostgreSQL chạy ở `localhost:5433`, database `ecommerce`. Backend (`:3000`) và 4 app web (`:5173`–`:5176`) đều đang chạy.
- `prisma validate`: ✅ schema hợp lệ.
- `prisma migrate status`: ❌ **lệch migration** → xem **H1**.

## Giai đoạn 1 — Kiểm tra tĩnh

| Hạng mục | Kết quả |
|---|---|
| Backend `tsc --noEmit -p tsconfig.build.json` (heap 8GB) | ✅ 0 lỗi |
| Backend `tsc -p tsconfig.json` (heap mặc định) | ❌ Hết bộ nhớ → **M4** |
| Backend ESLint (không `--fix`) | ⚠️ 1.027 lỗi, 46 cảnh báo (1.015 lỗi là định dạng prettier) → **L3** |
| Build frontend / admin / vendor / employee | ✅ Cả 4 thành công (cảnh báo bundle > 500kB) |
| Oxlint frontend | ⚠️ 23 cảnh báo (biến/import thừa) |
| Oxlint admin | ❌ 6 lỗi `rules-of-hooks` → **H3**; 124 cảnh báo |
| Oxlint vendor | ⚠️ 49 cảnh báo → **M3** |
| Oxlint employee | ⚠️ 52 cảnh báo (biến/import thừa) |
| Dataset `tsc --noEmit` | ❌ 32 lỗi → **H2** |
| Đối chiếu 191 lời gọi API ở frontend với 167 route backend | ✅ Không có endpoint sai hoặc sai method |

## Giai đoạn 2 — Test tự động

| Hạng mục | Kết quả |
|---|---|
| `jest` backend (8 suite, 48 test) | ⚠️ 7/8 suite PASS, **46/48 test PASS** |
| Suite lỗi | `surveys.service.spec.ts` lỗi 2 ca → **M1** |
| `test:e2e`, `test/*.manual.cjs` | ⏸️ Không chạy (có ghi dữ liệu vào DB) |

## Giai đoạn 3 — Kiểm tra khi chạy thật

| Hạng mục | Kết quả |
|---|---|
| Đăng nhập admin / vendor / employee / client | ✅ 201, cookie `accessToken_<role>` đúng |
| 59 endpoint GET × 5 vai trò (anon, client, vendor, employee, admin) | ✅ Không lỗi 5xx, không có request chậm > 3s |
| Giao diện trên trình duyệt | ⏸️ Không chạy được: công cụ trình duyệt tự động không tải được Playwright driver (404, offline) |

## Giai đoạn 4 — Luồng nghiệp vụ

⏸️ **Không chạy**, vì các luồng đặt hàng, voucher, hủy đơn, realtime, bán quá tồn đều ghi dữ liệu. Tham khảo kịch bản trong [MANUAL_TEST_PLAN.md](./MANUAL_TEST_PLAN.md).

## Giai đoạn 5 — Toàn vẹn dữ liệu

Dữ liệu hiện có: 804 đơn, 1.952 kiện vendor, 1.954 vận đơn, 67 voucher, 2.622 biến thể. Đã chạy 27 truy vấn, **25 OK, 2 lệch**.

| Kiểm tra | Kết quả |
|---|---|
| Tồn kho âm, giá ≤ 0, số lượng giỏ ≤ 0 | ✅ 0 |
| Tổng đơn = tạm tính − giảm giá + phí ship; tạm tính = tổng dòng hàng | ✅ 0 lệch |
| Đơn thiếu dòng hàng / thiếu payment; payment ≠ tổng đơn | ✅ 0 |
| Đơn `completed` nhưng COD chưa `paid` / kiện chưa `delivered` | ✅ 0 |
| Đơn hủy nhưng kiện còn hoạt động / payment `paid` | ✅ 0 |
| Kiện `pending` trong đơn đã xác nhận; kiện thiếu vận đơn; trùng vận đơn | ✅ 0 |
| Vận đơn `delivered` thiếu ngày giao; vận đơn đang giao thiếu nhân viên | ✅ 0 |
| Đánh giá trên đơn chưa hoàn thành | ✅ 0 |
| `usedQuantity` voucher khớp số đơn thực tế | ❌ 64/67 lệch → **M2** |
| `discountAmount` của đơn khớp `VoucherDetail` | ❌ 181 lệch (179 đơn seed) → **M2** |

## Giai đoạn 6 — Phân quyền & bảo mật

| Hạng mục | Kết quả |
|---|---|
| Không đăng nhập gọi API cần quyền | ✅ 401 |
| Gọi API sai vai trò | ✅ 403 |
| Nhân viên xem dữ liệu nhân viên khác | ❌ 200 → **C2** |
| Response có lộ mật khẩu/token không | ❌ Lộ hash mật khẩu vendor → **C1** |
| `.env` có bị commit không | ✅ Không |
| File rác trong git | ❌ `employee/node_modules`, `dist/` bị commit → **L1** |

---

## Giai đoạn 7 — Danh sách lỗi

### 🔴 C1. API đơn hàng trả về hash mật khẩu của vendor cho khách hàng
- **Vị trí:** [orders.service.ts:46](./backend/src/app/orders/orders.service.ts#L44-L48): `product: { include: { vendor: true } }` lấy nguyên bản ghi Vendor.
- **Cách tái hiện:** đăng nhập khách hàng, gọi `GET /api/orders/mine`, tìm trường `details[].productVariant.productColor.product.vendor.password`.
- **Kết quả thực tế:**
  - `GET /orders/mine` (khách hàng): 28 lần xuất hiện bcrypt hash.
  - `GET /orders/admin/all` (admin): 16 lần.
  - `GET /orders/vendor/orders`: không bị.
- **Nguyên nhân:** include cả bản ghi vendor thay vì chỉ chọn trường công khai.
- **Liên quan:** [orders.service.ts:139](./backend/src/app/orders/orders.service.ts#L139) (`prepareCheckout`) cũng include `vendor: true`. Chưa kiểm tra `POST /orders/preview` có trả về phần này không.
- **Hướng sửa:** dùng `vendor: { select: { id, shopName/fullName, avatarUrl } }`, hoặc cấu hình `omit: { password: true }` toàn cục cho Prisma.

### 🔴 C2. IDOR: nhân viên xem được hồ sơ và lịch sử lương của nhân viên khác
- **Vị trí:** [employees.controller.ts:73-77, 116-120](./backend/src/app/employees/employees.controller.ts#L73-L120).
- **Cách tái hiện:** đăng nhập `employee1@miva.vn`, gọi `GET /api/employees/<id của employee2>` và `/salary-history`.
- **Kết quả thực tế:** cả hai trả 200 kèm đủ dữ liệu.
- **Nguyên nhân:** có `@Roles('admin','employee')` nhưng không kiểm tra `id === user.userID`.
- **Hướng sửa:** khi role là employee thì bắt buộc là chính chủ, ngược lại trả 403.

### 🟠 H1. Lịch sử migration Prisma lệch so với database
- DB có 2 migration **không có trong repo**: `20261016142000_restructure_users_and_add_employees`, `20261017000000_add_vendor_address`.
- Repo có `20261013190000_add_employee_table` **chưa được apply**.
- **Hậu quả:** máy khác chạy `migrate deploy` sẽ ra schema khác. Chạy `migrate dev` sẽ đòi reset DB (mất dữ liệu).

### 🟠 H2. Dataset generator không biên dịch được (32 lỗi TypeScript)
- `GeneratedUser` không còn được export từ [users.generator.ts](./dataset/generators/users.generator.ts) nhưng vẫn được import ở carts, orders, products.
- `employmentType` và `hourlyRate` không còn trong `GeneratedEmployee` (employees, payrolls).
- `GeneratedVoucher.userId` không tồn tại (voucherDetails:41).
- [generate.ts:125, 209, 212](./dataset/scripts/generate.ts#L125): có thể gọi hàm hoặc dùng giá trị `undefined`.
- 22 lỗi còn lại cùng một kiểu: interface không gán được cho `Record<string, unknown>`.
- **Nhận định:** generator chưa theo kịp schema mới (tách Admin/Client/Vendor/Employee). Đây cũng là nguyên nhân của **M2**.

### 🟠 H3. Admin `OrderDetailModal` gọi hook sau `return` có điều kiện
- **Vị trí:** [OrderDetailModal.jsx:24-32](./admin/src/pages/orders/OrderDetailModal.jsx#L24-L32): `if (!order) return null;` đứng trước 6 lần gọi `useState`.
- **Rủi ro:** hiện component chỉ mount khi modal mở nên chưa lộ lỗi. Nếu `order` thành null trong lúc modal đang mở, React sẽ crash với lỗi "Rendered fewer hooks…".

### 🟡 M1. Unit test khảo sát lỗi 2/48
1. Test chờ trường `createdById`, nhưng service đã đổi sang `vendorId`/`adminId` → test đã lỗi thời.
2. Test chờ admin **không** được sửa khảo sát của vendor (403), nhưng [assertOwnerOrAdmin](./backend/src/app/surveys/surveys.service.ts#L881-L888) cho admin qua → logic khác yêu cầu. Cần chốt chính sách.

### 🟡 M2. Dữ liệu seed voucher không nhất quán
- 64/67 voucher có `usedQuantity` khác số đơn thực tế (ví dụ `VDP9BBMM`: 33 lượt nhưng 0 đơn).
- 179 đơn seed có `discountAmount = 0` nhưng `VoucherDetail` lại ghi có giảm giá.
- Đơn tạo qua ứng dụng thì khớp. Lỗi làm sai báo cáo voucher/giảm giá.

### 🟡 M3. Cảnh báo React có thể gây render thừa
- Admin: 29 `set-state-in-effect`, 3 `immutability`.
- Vendor: 7 `set-state-in-effect`, 4 `immutability`, 1 `purity`.

### 🟡 M4. Kiểm tra kiểu backend rất nặng
- `tsconfig.json` hết bộ nhớ ở mức ~4GB. Script `build` đang đặt 4096MB nên có thể OOM trên máy yếu.
- Nghi do kiểu sinh ra từ zod-prisma-types/nestjs-zod.

### 🟢 L1. Rác trong git
`employee/node_modules` (6.515 file) và `dist/` (4.575 file) đã bị commit dù `.gitignore` có loại trừ.

### 🟢 L2. Script cũ
[query.cjs](./backend/query.cjs) và [update_pwd.cjs](./backend/update_pwd.cjs) dùng `prisma.user`, model này không còn. `update_pwd.cjs` chứa sẵn một hash mật khẩu.

### 🟢 L3. Định dạng code
- Backend: 1.015 lỗi prettier, 46 `no-unsafe-argument`, 5 `no-unnecessary-type-assertion`, 4 `ban-ts-comment`, 3 `prefer-const`.
- Web: khoảng 200 biến/import thừa.

### 🟢 L4. Cảnh báo cấu hình
Bundle Vite của cả 4 app > 500kB. Khai báo `package.json#prisma` sẽ bị bỏ ở Prisma 7.

---

## Kế hoạch sửa lỗi (đề xuất, chưa thực hiện)

| Đợt | Mã lỗi | Việc cần làm | Cách xác nhận đã sửa |
|---|---|---|---|
| 1 – Bảo mật | C1 | Thay `vendor: true` bằng `select` các trường công khai trong `orders.service.ts` (dòng 46, 139); cân nhắc `omit: { password: true }` toàn cục | Gọi lại `GET /orders/mine`, `/orders/admin/all`, `POST /orders/preview`: không còn trường `password` |
| 1 – Bảo mật | C2 | Thêm kiểm tra chính chủ cho role employee ở `GET /employees/:id` và `/:id/salary-history` | employee1 gọi id employee2 → 403; gọi id của mình → 200 |
| 2 – Hạ tầng | H1 | Lấy 2 migration còn thiếu về repo, xử lý `20261013190000_add_employee_table` | `prisma migrate status` báo "Database schema is up to date" |
| 2 – Hạ tầng | H2, M2 | Cập nhật dataset generator theo schema mới; sinh `usedQuantity`, `discountAmount` từ `VoucherDetail` | `tsc` dataset = 0 lỗi; truy vấn kiểm tra voucher = 0 lệch |
| 3 – Frontend | H3, M3 | Đưa `return null` xuống sau các hook; rà `set-state-in-effect`, `immutability` | `oxlint` admin/vendor = 0 lỗi |
| 4 – Test | M1 | Chốt chính sách sửa khảo sát; cập nhật service hoặc spec | `npx jest` 48/48 PASS |
| 5 – Dọn dẹp | M4, L1–L4 | Tăng heap/giảm kiểu sinh ra; `git rm -r --cached` node_modules và dist; xóa script cũ; chạy prettier | Build không OOM; git sạch |
| 6 – Kiểm thử bổ sung | — | Kiểm tra giao diện trên trình duyệt, e2e, manual scripts, luồng ghi dữ liệu, desktop | Cập nhật lại báo cáo này |

## Chưa kiểm tra
- Giao diện trên trình duyệt (lỗi console, trang trắng).
- Các luồng có ghi dữ liệu và e2e/manual scripts.
- Desktop (Electron), chạy thử `dataset generate`.
