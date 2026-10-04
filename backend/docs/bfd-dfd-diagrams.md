# BFD và DFD của hệ thống thương mại điện tử

Tài liệu được dựng từ các module đang được đăng ký trong `AppModule`, các controller/service đang chạy và `prisma/schema.prisma`.

Quy ước DFD:

- Hình chữ nhật: tác nhân ngoài.
- Hình tròn: tiến trình xử lý.
- Hình trụ: kho dữ liệu logic, tương ứng với các nhóm bảng Prisma.
- DFD bậc 2 phân rã tiến trình `4.0 Đơn hàng`, là tiến trình nghiệp vụ trung tâm và phức tạp nhất của backend hiện tại.

## 1. BFD - Biểu đồ phân rã chức năng

```mermaid
flowchart LR
    system["Hệ thống thương mại điện tử"]

    auth["1. Quản lý tài khoản"]
    catalog["2. Quản lý danh mục và sản phẩm"]
    cartVoucher["3. Quản lý giỏ hàng và voucher"]
    order["4. Quản lý đơn hàng"]
    payment["5. Quản lý thanh toán"]
    review["6. Quản lý đánh giá"]
    realtime["7. Thông báo thời gian thực"]

    sign["Đăng ký, đăng nhập, làm mới token, đăng xuất"]
    profile["Xem và cập nhật hồ sơ"]
    userAdmin["Admin quản lý người dùng"]
    category["Admin quản lý danh mục"]
    productPublic["Tra cứu danh mục và sản phẩm"]
    productVendor["Vendor quản lý sản phẩm, màu, ảnh, biến thể và tồn kho"]
    cart["Customer quản lý giỏ hàng"]
    voucherManage["Admin và vendor quản lý voucher"]
    voucherPreview["Kiểm tra và tính giảm giá"]
    checkout["Checkout và tạo đơn"]
    orderQuery["Tra cứu đơn theo vai trò"]
    orderStatus["Cập nhật trạng thái, hủy và hoàn tài nguyên"]
    paymentQuery["Tra cứu thanh toán theo đơn"]
    paymentStatus["Admin cập nhật trạng thái thanh toán"]
    reviewPublic["Xem đánh giá sản phẩm"]
    reviewCustomer["Customer tạo, sửa và xóa đánh giá"]
    reviewModerate["Admin kiểm duyệt đánh giá"]
    socketAuth["Xác thực kết nối Socket.IO"]
    eventNotify["Phát sự kiện đơn hàng và thanh toán"]

    system --> auth
    system --> catalog
    system --> cartVoucher
    system --> order
    system --> payment
    system --> review
    system --> realtime
    auth --> sign
    auth --> profile
    auth --> userAdmin
    catalog --> category
    catalog --> productPublic
    catalog --> productVendor
    cartVoucher --> cart
    cartVoucher --> voucherManage
    cartVoucher --> voucherPreview
    order --> checkout
    order --> orderQuery
    order --> orderStatus
    payment --> paymentQuery
    payment --> paymentStatus
    review --> reviewPublic
    review --> reviewCustomer
    review --> reviewModerate
    realtime --> socketAuth
    realtime --> eventNotify
```

## 2. DFD bậc 0 - Sơ đồ ngữ cảnh

```mermaid
flowchart LR
    customer["Khách hàng"]
    vendor["Nhà bán hàng"]
    admin["Quản trị viên"]
    system(("0. Hệ thống thương mại điện tử"))

    customer -->|"Đăng ký, đăng nhập, hồ sơ, giỏ hàng, checkout, đánh giá"| system
    system -->|"Danh mục, sản phẩm, voucher, đơn hàng, thanh toán, thông báo"| customer
    vendor -->|"Hồ sơ, sản phẩm, tồn kho, voucher, trạng thái đơn"| system
    system -->|"Dữ liệu sản phẩm, đơn liên quan, thanh toán, thông báo"| vendor
    admin -->|"Quản lý người dùng, danh mục, voucher, đơn, thanh toán, đánh giá"| system
    system -->|"Danh sách quản trị, trạng thái và thông báo"| admin
```

## 3. DFD bậc 1 - Các tiến trình chính

```mermaid
flowchart LR
    customer["Khách hàng"]
    vendor["Nhà bán hàng"]
    admin["Quản trị viên"]

    p1(("1.0 Tài khoản và người dùng"))
    p2(("2.0 Danh mục và sản phẩm"))
    p3(("3.0 Giỏ hàng và voucher"))
    p4(("4.0 Đơn hàng"))
    p5(("5.0 Thanh toán"))
    p6(("6.0 Đánh giá"))
    p7(("7.0 Thông báo realtime"))

    d1[("D1 Users")]
    d2[("D2 Catalog")]
    d3[("D3 Cart")]
    d4[("D4 Vouchers")]
    d5[("D5 Orders và StatusHistory")]
    d6[("D6 Payments")]
    d7[("D7 Reviews")]

    customer -->|"Đăng ký, đăng nhập, hồ sơ"| p1
    vendor -->|"Đăng ký, đăng nhập, hồ sơ"| p1
    admin -->|"Quản lý user"| p1
    p1 -->|"Token, hồ sơ và dữ liệu user"| customer
    p1 -->|"Token và hồ sơ"| vendor
    p1 -->|"Danh sách và trạng thái user"| admin
    p1 -->|"Tạo, cập nhật user"| d1
    d1 -->|"Tài khoản và quyền"| p1

    customer -->|"Tìm kiếm và xem sản phẩm"| p2
    vendor -->|"Sản phẩm, ảnh, giá, tồn kho"| p2
    admin -->|"Quản lý danh mục"| p2
    p2 -->|"Catalog"| customer
    p2 -->|"Sản phẩm của vendor"| vendor
    p2 -->|"Danh mục"| admin
    p2 -->|"Ghi catalog"| d2
    d2 -->|"Đọc catalog"| p2

    customer -->|"Giỏ hàng và mã voucher"| p3
    vendor -->|"Quản lý voucher vendor"| p3
    admin -->|"Quản lý voucher toàn sàn"| p3
    p3 -->|"Giỏ và kết quả giảm giá"| customer
    p3 -->|"Voucher của vendor"| vendor
    p3 -->|"Danh sách voucher"| admin
    p3 -->|"Ghi giỏ"| d3
    d3 -->|"Đọc giỏ"| p3
    p3 -->|"Ghi voucher"| d4
    d4 -->|"Quy tắc voucher"| p3
    d2 -->|"Giá, tồn kho, sản phẩm hợp lệ"| p3

    customer -->|"Checkout, xem hoặc hủy đơn"| p4
    vendor -->|"Xem và cập nhật đơn liên quan"| p4
    admin -->|"Xem và cập nhật đơn"| p4
    p4 -->|"Đơn của customer"| customer
    p4 -->|"Đơn liên quan"| vendor
    p4 -->|"Toàn bộ đơn"| admin
    d3 -->|"Mặt hàng checkout"| p4
    d4 -->|"Voucher áp dụng"| p4
    d2 -->|"Giá và tồn kho"| p4
    p4 -->|"Đơn, chi tiết và lịch sử"| d5
    d5 -->|"Dữ liệu đơn"| p4
    p4 -->|"Payment pending"| d6
    p4 -->|"Sự kiện order"| p7

    customer -->|"Xem thanh toán"| p5
    vendor -->|"Xem thanh toán liên quan"| p5
    admin -->|"Tra cứu và cập nhật trạng thái"| p5
    p5 -->|"Thông tin thanh toán"| customer
    p5 -->|"Thông tin thanh toán"| vendor
    p5 -->|"Danh sách và trạng thái"| admin
    d5 -->|"Quyền truy cập theo đơn"| p5
    p5 -->|"Cập nhật payment"| d6
    d6 -->|"Dữ liệu payment"| p5
    p5 -->|"Sự kiện payment"| p7

    customer -->|"Nội dung và điểm đánh giá"| p6
    admin -->|"Yêu cầu kiểm duyệt"| p6
    p6 -->|"Đánh giá sản phẩm"| customer
    p6 -->|"Kết quả kiểm duyệt"| admin
    d5 -->|"Đơn đã hoàn thành"| p6
    p6 -->|"Tạo, sửa, xóa review"| d7
    d7 -->|"Danh sách review"| p6

    p7 -->|"Thông báo đơn và thanh toán"| customer
    p7 -->|"Thông báo đơn liên quan"| vendor
    p7 -->|"Thông báo quản trị"| admin
```

## 4. DFD bậc 2 - Phân rã tiến trình 4.0 Đơn hàng

```mermaid
flowchart LR
    customer["Khách hàng"]
    vendor["Nhà bán hàng"]
    admin["Quản trị viên"]

    p41(("4.1 Kiểm tra giỏ hàng"))
    p42(("4.2 Tính tiền và áp dụng voucher"))
    p43(("4.3 Tạo đơn, payment và lịch sử"))
    p44(("4.4 Trừ tồn kho và dọn giỏ"))
    p45(("4.5 Tra cứu đơn theo vai trò"))
    p46(("4.6 Cập nhật trạng thái hoặc hủy đơn"))
    p47(("4.7 Phát thông báo realtime"))

    d2[("D2 Catalog và tồn kho")]
    d3[("D3 Cart")]
    d4[("D4 Vouchers")]
    d5[("D5 Orders và StatusHistory")]
    d6[("D6 Payments")]

    customer -->|"Người nhận, phương thức thanh toán, mã voucher"| p41
    d3 -->|"CartItems"| p41
    d2 -->|"Biến thể, giá và tồn kho"| p41
    p41 -->|"Giỏ hợp lệ"| p42
    d4 -->|"Quy tắc, thời hạn, giới hạn sử dụng"| p42
    d2 -->|"Sản phẩm thuộc voucher"| p42
    p42 -->|"Subtotal, discount, shipping fee, total"| p43
    p43 -->|"Order, OrderDetail, trạng thái pending"| d5
    p43 -->|"Payment pending"| d6
    p43 -->|"Đơn vừa tạo"| p44
    p44 -->|"Giảm stock nguyên tử"| d2
    p44 -->|"Xóa mặt hàng đã mua"| d3
    p44 -->|"Tăng lượt dùng, lưu voucher sử dụng"| d4
    p44 -->|"Checkout thành công"| customer
    p44 -->|"order created"| p47

    customer -->|"Xem đơn của mình"| p45
    vendor -->|"Xem đơn chứa sản phẩm của mình"| p45
    admin -->|"Xem toàn bộ đơn"| p45
    d5 -->|"Đơn, chi tiết, payment, voucher, lịch sử"| p45
    p45 -->|"Chi tiết đơn"| customer
    p45 -->|"Đơn liên quan"| vendor
    p45 -->|"Danh sách đơn"| admin

    customer -->|"Hủy đơn pending"| p46
    vendor -->|"Cập nhật confirmed đến completed"| p46
    admin -->|"Cập nhật trạng thái"| p46
    d5 -->|"Trạng thái và chi tiết hiện tại"| p46
    p46 -->|"Trạng thái mới và lịch sử"| d5
    p46 -->|"Hoàn stock khi hủy"| d2
    p46 -->|"Hoàn lượt dùng voucher khi hủy"| d4
    p46 -->|"Cancelled, refunded hoặc COD paid"| d6
    p46 -->|"Kết quả cập nhật"| customer
    p46 -->|"Kết quả cập nhật"| vendor
    p46 -->|"Kết quả cập nhật"| admin
    p46 -->|"order updated"| p47

    p47 -->|"order created hoặc updated"| customer
    p47 -->|"order liên quan"| vendor
    p47 -->|"order created hoặc updated"| admin
```

## 5. Đối chiếu với source code

| Nhóm DFD | Module/bảng tương ứng |
|---|---|
| 1.0 Tài khoản và người dùng | `AuthModule`, `UserModule`, `User` |
| 2.0 Danh mục và sản phẩm | `CategoryModule`, `ProductsModule`, `ProductColorModule`, `ProductVariantModule`; `Category`, `Product`, `ProductColor`, `ProductVariant` |
| 3.0 Giỏ hàng và voucher | `CartModule`, `VouchersModule`; `Cart`, `CartItem`, `Voucher`, `VoucherDetail` |
| 4.0 Đơn hàng | `OrdersModule`; `Order`, `OrderDetail`, `OrderStatusHistory` |
| 5.0 Thanh toán | `PaymentsModule`; `Payment` |
| 6.0 Đánh giá | `ReviewsModule`; `Review` |
| 7.0 Thông báo realtime | `RealtimeModule`, Socket.IO; không có kho dữ liệu riêng |

Backend hiện chưa tích hợp callback trực tiếp từ VNPay, Momo hoặc ZaloPay, vì vậy cổng thanh toán ngoài không được đưa vào DFD.
