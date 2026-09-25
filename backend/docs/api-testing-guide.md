# Hướng dẫn test toàn bộ Backend API

Tài liệu này được đối chiếu trực tiếp với controller, DTO, guard và service hiện tại.

## 1. Cấu hình chung

- Base URL mặc định: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`
- Socket.IO namespace: `http://localhost:3000/realtime`
- API bảo vệ nhận một trong hai cách:
  - Header `Authorization: Bearer <accessToken>`
  - Cookie `accessToken=<accessToken>`
- Access token sống `6h`; refresh token sống `1d`.
- POST mặc định trả HTTP `201`; GET, PATCH và DELETE thường trả `200`.

Chạy backend:

```bash
npm install
npx prisma migrate deploy
npm run start:dev
```

## 2. Tài khoản test bắt buộc

Hệ thống không có API đăng ký admin. Chuẩn bị ba tài khoản:

```json
{
  "customer": {
    "fullName": "Customer Test",
    "email": "customer.test@example.com",
    "password": "Test@123456",
    "phone": "0900000001",
    "address": "1 Đường Khách Hàng, TP.HCM"
  },
  "vendor": {
    "fullName": "Vendor Test",
    "email": "vendor.test@example.com",
    "password": "Test@123456",
    "phone": "0900000002",
    "address": "2 Đường Nhà Bán, TP.HCM"
  },
  "adminCandidate": {
    "fullName": "Admin Test",
    "email": "admin.test@example.com",
    "password": "Test@123456",
    "phone": "0900000003",
    "address": "3 Đường Quản Trị, TP.HCM"
  }
}
```

Tạo customer và admin candidate bằng `/auth/sign-up`; tạo vendor bằng `/auth/sign-up/vendor`. Sau đó mở Prisma Studio:

```bash
npx prisma studio
```

Đổi `role` của `admin.test@example.com` từ `customer` thành `admin`, rồi mới đăng nhập admin. Nếu đã có admin thì bỏ qua bước này.

## 3. Các ID cần lưu khi test

| Biến | Lấy từ response |
|---|---|
| `categoryId` | `POST /categories` → `id` |
| `productAId` | `POST /products` sản phẩm A → `id` |
| `productBId` | `POST /products` sản phẩm B → `id` |
| `colorAId` | `POST /productColors` → `id` |
| `colorBId` | `POST /productColors` → `id` |
| `variantAId` | `POST /productVariant` → `id` |
| `variantBId` | `POST /productVariant` → `id` |
| `vendorVoucherId` | Vendor `POST /vouchers` → `id` |
| `platformVoucherId` | Admin `POST /vouchers` → `id` |
| `cartItemId` | `POST /cart/items` → `items[0].id` |
| `orderId` | `POST /orders/checkout` → `id` |
| `orderDetailId` | Checkout → `details[0].id` |
| `paymentId` | Checkout → `payment.id` |
| `reviewId` | `POST /reviews` → `id` |

## 4. Danh sách toàn bộ 64 HTTP API

### System

| # | Method | Endpoint | Quyền | Body |
|---:|---|---|---|---|
| 1 | GET | `/api` | Đăng nhập | Không |
| 2 | GET | `/api/health` | Công khai | Không |

### Auth

| # | Method | Endpoint | Quyền | Body |
|---:|---|---|---|---|
| 3 | POST | `/api/auth/sign-up` | Công khai | `SignUp` |
| 4 | POST | `/api/auth/sign-up/vendor` | Công khai | `SignUp` |
| 5 | POST | `/api/auth/sign-in` | Công khai | `SignIn` |
| 6 | POST | `/api/auth/refresh-token` | Cookie refresh token | Không |
| 7 | POST | `/api/auth/sign-out` | Công khai | Không |

### Users

| # | Method | Endpoint | Quyền | Body hoặc query |
|---:|---|---|---|---|
| 8 | GET | `/api/users?page=1&itemPerPage=10&search=Test&status=active&role=customer` | Admin | Query |
| 9 | GET | `/api/users/options?limit=10&select=id,fullName,email&role=vendor` | Admin | Query |
| 10 | GET | `/api/users/profile` | Đăng nhập | Không |
| 11 | PATCH | `/api/users/profile` | Customer, vendor, admin | `UpdateProfile` |
| 12 | GET | `/api/users/:id` | Admin | Không |
| 13 | PATCH | `/api/users/:id` | Admin | `UpdateUser` |
| 14 | DELETE | `/api/users/:id` | Admin | Không |

### Categories

| # | Method | Endpoint | Quyền | Body hoặc query |
|---:|---|---|---|---|
| 15 | GET | `/api/categories?page=1&itemPerPage=10&search=Áo` | Công khai | Query |
| 16 | POST | `/api/categories` | Admin | `CreateCategory` |
| 17 | PATCH | `/api/categories/:id` | Admin | `UpdateCategory` |
| 18 | DELETE | `/api/categories/:id` | Admin | Không |

### Products

| # | Method | Endpoint | Quyền | Body hoặc query |
|---:|---|---|---|---|
| 19 | POST | `/api/products` | Vendor | `CreateProduct` |
| 20 | GET | `/api/products/vendor/mine?page=1&itemPerPage=10&status=active` | Vendor | Query |
| 21 | GET | `/api/products?page=1&itemPerPage=10&search=Áo` | Công khai | Query |
| 22 | GET | `/api/products/category/:categorySlug?page=1&itemPerPage=10` | Công khai | Query |
| 23 | GET | `/api/products/:id` | Công khai | Không |
| 24 | PATCH | `/api/products/:id` | Vendor sở hữu | `UpdateProduct` |
| 25 | DELETE | `/api/products/:id` | Vendor sở hữu | Không |

### Product colors

| # | Method | Endpoint | Quyền | Body |
|---:|---|---|---|---|
| 26 | POST | `/api/productColors` | Vendor sở hữu product | Multipart |
| 27 | GET | `/api/productColors/product/:productId` | Đăng nhập | Không |
| 28 | GET | `/api/productColors/:id` | Đăng nhập | Không |
| 29 | PATCH | `/api/productColors/:id` | Vendor sở hữu | Multipart |
| 30 | POST | `/api/productColors/:id/images` | Vendor sở hữu | Multipart images |
| 31 | PATCH | `/api/productColors/:id/restore` | Vendor sở hữu | Không |
| 32 | DELETE | `/api/productColors/:id` | Vendor sở hữu | Không |

### Product variants

| # | Method | Endpoint | Quyền | Body |
|---:|---|---|---|---|
| 33 | POST | `/api/productVariant` | Vendor sở hữu color | `CreateVariant` |
| 34 | GET | `/api/productVariant/productColor/:productColorId` | Đăng nhập | Không |
| 35 | PATCH | `/api/productVariant/:id` | Vendor sở hữu | `UpdateVariant` |
| 36 | DELETE | `/api/productVariant/:id` | Vendor sở hữu | Không |

### Vouchers

| # | Method | Endpoint | Quyền | Body |
|---:|---|---|---|---|
| 37 | POST | `/api/vouchers` | Admin hoặc vendor | `CreateVoucher` |
| 38 | POST | `/api/vouchers/preview` | Đăng nhập | `PreviewVoucher` |
| 39 | GET | `/api/vouchers/mine` | Admin hoặc vendor | Không |
| 40 | GET | `/api/vouchers/admin/all` | Admin | Không |
| 41 | GET | `/api/vouchers/available` | Đăng nhập | Không |
| 42 | GET | `/api/vouchers/:id` | Admin hoặc vendor | Không |
| 43 | PATCH | `/api/vouchers/:id` | Chủ voucher | `UpdateVoucher` |
| 44 | PATCH | `/api/vouchers/:id/status` | Chủ voucher hoặc admin moderation | `VoucherStatus` |
| 45 | DELETE | `/api/vouchers/:id` | Chủ voucher | Không |

### Cart

| # | Method | Endpoint | Quyền | Body |
|---:|---|---|---|---|
| 46 | GET | `/api/cart` | Customer | Không |
| 47 | POST | `/api/cart/items` | Customer | `AddCartItem` |
| 48 | PATCH | `/api/cart/items/:id` | Customer sở hữu | `UpdateCartItem` |
| 49 | DELETE | `/api/cart/items/:id` | Customer sở hữu | Không |
| 50 | DELETE | `/api/cart` | Customer | Không |

### Orders

| # | Method | Endpoint | Quyền | Body |
|---:|---|---|---|---|
| 51 | POST | `/api/orders/checkout` | Customer | `Checkout` |
| 52 | GET | `/api/orders/mine` | Customer | Không |
| 53 | GET | `/api/orders/vendor/mine` | Vendor | Không |
| 54 | GET | `/api/orders/admin/all` | Admin | Không |
| 55 | GET | `/api/orders/:id` | Customer chủ đơn, vendor liên quan, admin | Không |
| 56 | PATCH | `/api/orders/:id/status` | Theo role và transition | `OrderStatus` |

### Payments

| # | Method | Endpoint | Quyền | Body |
|---:|---|---|---|---|
| 57 | GET | `/api/payments/admin/all` | Admin | Không |
| 58 | GET | `/api/payments/order/:orderId` | Customer chủ đơn, vendor liên quan, admin | Không |
| 59 | PATCH | `/api/payments/:id/status` | Admin | `PaymentStatus` |

### Reviews

| # | Method | Endpoint | Quyền | Body |
|---:|---|---|---|---|
| 60 | GET | `/api/reviews/product/:productId` | Công khai | Không |
| 61 | POST | `/api/reviews` | Customer đã mua và hoàn tất | `CreateReview` |
| 62 | PATCH | `/api/reviews/:id` | Customer sở hữu | `UpdateReview` |
| 63 | DELETE | `/api/reviews/:id` | Customer sở hữu | Không |
| 64 | DELETE | `/api/reviews/admin/:id` | Admin | Không |

Ngoài 64 API trên còn có `/docs`, `/uploads/products/*` và Socket.IO `/realtime`; chúng không phải controller API nghiệp vụ.

## 5. JSON mẫu chính xác theo DTO

### SignUp

```json
{
  "fullName": "Customer Test",
  "email": "customer.test@example.com",
  "password": "Test@123456",
  "phone": "0900000001",
  "address": "1 Đường Khách Hàng, TP.HCM"
}
```

### SignIn

```json
{
  "email": "customer.test@example.com",
  "password": "Test@123456"
}
```

### UpdateProfile

```json
{
  "fullName": "Customer Test Updated",
  "phone": "0900000011",
  "address": "11 Đường Mới, TP.HCM"
}
```

### UpdateUser dành cho admin

```json
{
  "role": "vendor",
  "status": "active",
  "fullName": "User Updated"
}
```

Giá trị role: `customer`, `vendor`, `admin`. Giá trị status: `active`, `inactive`.

### CreateCategory và UpdateCategory

```json
{
  "name": "Áo thời trang"
}
```

### CreateProduct

```json
{
  "name": "Áo thun Basic Test",
  "description": "Sản phẩm dùng để test API",
  "status": "active",
  "category": {
    "connect": {
      "id": "{{categoryId}}"
    }
  }
}
```

### UpdateProduct

```json
{
  "description": "Mô tả đã cập nhật",
  "status": "active"
}
```

Product status: `draft`, `active`, `inactive`.

### ProductColor multipart

Không gửi JSON. Dùng `multipart/form-data`:

| Field | Kiểu | Bắt buộc |
|---|---|---:|
| `productId` | UUID string | Có khi tạo |
| `color` | string | Có khi tạo |
| `images` | JPEG, PNG hoặc WEBP | Không khi tạo, có ở API add images |

Mỗi request tối đa 10 file, mỗi file tối đa 5 MB, tổng ảnh trên một màu tối đa 20.

### CreateVariant

```json
{
  "productColorId": "{{colorAId}}",
  "size": "M",
  "price": 100000,
  "stock": 20
}
```

### UpdateVariant

```json
{
  "size": "L",
  "price": 120000,
  "stock": 25
}
```

### Vendor CreateVoucher

```json
{
  "code": "VENDOR10",
  "name": "Giảm 10% sản phẩm A",
  "discountType": "percentage",
  "discountValue": 10,
  "minOrderAmount": 50000,
  "maxDiscountAmount": 30000,
  "quantity": 100,
  "perUserLimit": 2,
  "startDate": "2026-01-01T00:00:00.000Z",
  "endDate": "2027-12-31T23:59:59.000Z",
  "status": "active",
  "productIds": ["{{productAId}}"]
}
```

Vendor bắt buộc có `productIds` từ 1 đến 100 sản phẩm thuộc chính vendor.

### Admin CreateVoucher

```json
{
  "code": "PLATFORM5",
  "name": "Giảm 5% toàn sàn",
  "discountType": "percentage",
  "discountValue": 5,
  "minOrderAmount": 100000,
  "maxDiscountAmount": 50000,
  "quantity": 100,
  "perUserLimit": 2,
  "startDate": "2026-01-01T00:00:00.000Z",
  "endDate": "2027-12-31T23:59:59.000Z",
  "status": "active"
}
```

Voucher admin không được gửi `productIds`.

Discount type: `percentage`, `fixed_amount`. Voucher status: `draft`, `active`, `inactive`, `expired`.

### UpdateVoucher

```json
{
  "name": "Tên voucher đã cập nhật",
  "quantity": 120,
  "perUserLimit": 2,
  "productIds": ["{{productAId}}", "{{productBId}}"]
}
```

`productIds` chỉ hợp lệ cho voucher vendor.

### VoucherStatus

```json
{
  "status": "inactive"
}
```

### PreviewVoucher

```json
{
  "codes": ["VENDOR10", "PLATFORM5"],
  "items": [
    {
      "productVariantId": "{{variantAId}}",
      "quantity": 2
    },
    {
      "productVariantId": "{{variantBId}}",
      "quantity": 1
    }
  ]
}
```

Tối đa một voucher vendor và một voucher platform. Vendor được tính trước; platform tính trên tổng còn lại.

### AddCartItem và UpdateCartItem

```json
{
  "productVariantId": "{{variantAId}}",
  "quantity": 2
}
```

```json
{
  "quantity": 3
}
```

### Checkout

```json
{
  "receiverName": "Customer Test",
  "receiverPhone": "0900000001",
  "shippingAddress": "1 Đường Khách Hàng, TP.HCM",
  "notes": "Giao giờ hành chính",
  "paymentMethod": "cod",
  "voucherCodes": ["VENDOR10", "PLATFORM5"]
}
```

Payment method: `cod`, `vnpay`, `momo`, `zalopay`, `bank_transfer`. Hiện backend chỉ có xử lý trạng thái nội bộ và COD, chưa tích hợp callback gateway.

### OrderStatus

```json
{
  "status": "confirmed",
  "note": "Vendor đã xác nhận đơn"
}
```

Transition hợp lệ:

```text
pending -> confirmed -> processing -> shipping -> completed
pending -> cancelled
confirmed -> cancelled
processing -> cancelled
```

Customer chỉ được `pending -> cancelled`. Vendor không cập nhật được đơn chứa sản phẩm từ nhiều vendor.

### PaymentStatus

```json
{
  "status": "paid",
  "transactionCode": "BANK-TEST-0001",
  "gateway": "manual_test"
}
```

Payment status: `pending`, `paid`, `failed`, `cancelled`, `refunded`.

### CreateReview và UpdateReview

```json
{
  "orderDetailId": "{{orderDetailId}}",
  "rating": 5,
  "content": "Sản phẩm đúng mô tả"
}
```

```json
{
  "rating": 4,
  "content": "Đã cập nhật nội dung đánh giá"
}
```

## 6. Thứ tự test end-to-end đề xuất

### Giai đoạn A — hệ thống và tài khoản

1. `GET /api/health` → phải trả `status=ok`, `database=up`.
2. Đăng ký customer bằng `POST /api/auth/sign-up`.
3. Đăng ký vendor bằng `POST /api/auth/sign-up/vendor`.
4. Đăng ký admin candidate bằng `POST /api/auth/sign-up`.
5. Đổi role admin candidate bằng Prisma Studio.
6. Đăng nhập ba tài khoản và lưu ba access token.
7. Test `GET /api/users/profile` với từng token.
8. Test refresh token bằng cookie rồi test sign-out.

### Giai đoạn B — dữ liệu catalog

9. Admin tạo category, lưu `categoryId`.
10. Vendor tạo Product A và Product B ở trạng thái `active`.
11. Vendor tạo một ProductColor cho mỗi product.
12. Vendor tạo Variant A giá `100000`, stock `20`.
13. Vendor tạo Variant B giá `200000`, stock `20`.
14. Test toàn bộ GET catalog công khai.
15. Test GET color và variant bằng tài khoản đăng nhập.

### Giai đoạn C — voucher

16. Vendor tạo `VENDOR10`, chỉ chọn Product A.
17. Admin tạo `PLATFORM5`, không gửi `productIds`.
18. Test `mine`, `admin/all`, `available` và `:id`.
19. Test preview với A + B và hai voucher.
20. Xác nhận voucher vendor chỉ giảm phần Product A; platform giảm số tiền còn lại của toàn giỏ.

### Giai đoạn D — cart và checkout hoàn tất

21. Customer thêm Variant A và Variant B vào cart.
22. Test GET cart và PATCH số lượng một CartItem.
23. Kết nối Socket.IO bằng customer, vendor và admin token.
24. Customer checkout COD với hai voucher.
25. Xác nhận nhận `order:created` ở ba nhóm client.
26. Xác nhận cart rỗng, stock giảm, VoucherDetail usage được tạo.
27. Test order detail bằng customer, vendor và admin.
28. Vendor cập nhật lần lượt `confirmed`, `processing`, `shipping`, `completed`.
29. Sau mỗi lần cập nhật phải nhận `order:updated`.
30. Khi `completed`, payment COD phải tự chuyển thành `paid`.
31. Customer tạo review từ `orderDetailId`, sau đó update review.
32. Test GET reviews công khai; admin có thể moderate delete review.

### Giai đoạn E — payment update và hủy đơn

33. Customer thêm lại một variant vào cart.
34. Checkout đơn thứ hai với `paymentMethod=bank_transfer`.
35. Admin PATCH payment thành `paid`; phải nhận `payment:updated`.
36. Customer hủy đơn khi vẫn `pending`.
37. Xác nhận stock được hoàn trực tiếp, payment chuyển `refunded` và voucher usage có `reversedAt`.
38. Xác nhận nhận `order:updated` sau khi transaction hủy commit.

### Giai đoạn F — CRUD và cleanup cuối cùng

39. Test update/status/delete voucher bằng đúng chủ sở hữu.
40. Test admin đổi status voucher vendor.
41. Test update Product, ProductColor, ProductVariant.
42. Test delete và restore ProductColor.
43. Test delete ProductVariant.
44. Test delete Product để chuyển status `inactive`.
45. Test admin update user và DELETE user để chuyển status `inactive`.
46. Cuối cùng mới DELETE category vì category bị soft delete sẽ làm catalog công khai không còn trả product đó.

## 7. Test phân quyền và lỗi bắt buộc

| Test | Kết quả mong đợi |
|---|---|
| Không token gọi `/cart` | `401` |
| Customer gọi POST `/products` | `403` |
| Vendor sửa product của vendor khác | `404` hoặc bị từ chối |
| Vendor voucher chọn product vendor khác | `403` |
| Admin voucher gửi `productIds` | `400` |
| Hai voucher cùng scope | `400` |
| Cart quantity lớn hơn stock | `400` |
| Checkout cart rỗng | `400` |
| Customer chuyển pending thẳng completed | `403` |
| Chuyển sai state machine | `400` |
| Mark paid cho order cancelled | `400` |
| Review order chưa completed | `403` |
| Review hai lần cùng OrderDetail | `409` |
| Dùng refresh token làm access token | `401` |
| Socket token sai hoặc user inactive | Bị disconnect |

## 8. Kiểm tra realtime

Client Socket.IO mẫu:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000/realtime", {
  auth: { token: accessToken }
});

socket.on("realtime:ready", console.log);
socket.on("order:created", console.log);
socket.on("order:updated", console.log);
socket.on("payment:updated", console.log);
```

Khi hoàn thành đơn COD, hệ thống cập nhật payment trong transaction order nhưng chỉ emit `order:updated`. `payment:updated` chỉ emit khi admin gọi Payment API.

## 9. Lưu ý khi xem sequence diagram

Nếu Markdown preview chỉ hiện code như ảnh chụp, dùng `Ctrl+Shift+V` trong VS Code và cài extension hỗ trợ Mermaid nếu editor hiện tại chưa render. Nội dung sequence đã được tách theo runtime để tránh gộp GET, POST, PATCH và DELETE thành một transaction giả.

