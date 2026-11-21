# Báo Cáo Chi Tiết Những Gì Đã Sửa: `nhatlongdev` + Code Hiện Tại so với `master`

- **Ngày lập báo cáo:** 21/11/2026
- **Nhánh gốc so sánh:** `master`
- **Phạm vi kiểm tra:** Commit `6eaee2b` trên nhánh `nhatlongdev` **+** toàn bộ thay đổi hiện tại trong working tree (chưa commit)
- **Tổng số file nguồn thay đổi:** **263 file** *(không tính việc dọn thư mục `employee/node_modules` đã từng bị commit nhầm trên `master`)*

---

## 1. Tóm Tắt Theo Nhóm Tính Năng & Mốc Thời Gian

| Nhóm thay đổi | Trạng thái Git | Nội dung chính |
| :--- | :--- | :--- |
| **1. Đồng bộ 4 cổng, tạo `@shared`, xóa mềm 100%, Admin 7 Workspace** | Đã commit (`6eaee2b`) | Gom component/hook/realtime dùng chung vào `shared/`, đồng bộ theme MIVA (`#1A3A2C` / `#C9A84C`), hợp nhất Admin thành 7 Workspace, hoàn thiện xóa mềm 100%, bổ sung bộ Automation Test 3 tầng & Demo 8 chương |
| **2. Tối ưu hiệu năng toàn hệ thống** | Working Tree (chưa commit) | Thêm `pg_trgm` GIN + 7 composite B-tree index, tối ưu truy vấn Prisma/Backend, tách `GET /reviews/vendor/mine`, `manualChunks` Vite cho 4 cổng, `ErrorBoundary`, tối ưu Electron `desktop/main.js` |
| **3. Tinh chỉnh UI Storefront** | Working Tree (chưa commit) | Bộ lọc danh mục thu gọn 5 mục mượt ở `ProductSearch.jsx`, bố cục 2 cột cân đối ở `Profile.jsx` |
| **4. Mua lại đơn hàng hoàn thành (`Reorder`)** | Working Tree (chưa commit) | Thêm `POST /orders/reorder` + nút **Mua lại** trên trang đơn hàng khách, tự điền lại sản phẩm/địa chỉ/thanh toán/voucher ở `/checkout` |
| **5. Cô lập đơn hàng nhân viên nghiêm ngặt** | Working Tree (chưa commit) | Thêm `Order.assignedEmployeeId` + backfill DB; nhân viên chỉ thấy/xử lý đúng đơn mình được phân công (chặn `403` đơn người khác); đổi cột bảng Employee thành **Nhân viên vận chuyển** |
| **6. Chuông thông báo đơn hàng realtime 4 cổng** | Working Tree (chưa commit) | Thêm `Notification.employeeId`, hàm `notifyOrderUpdates()` bắn Socket.IO realtime tới Vendor/Employee/Client/Admin trên toàn vòng đời đơn hàng, click thông báo tự đọc và chuyển trang `/orders` hoặc `/shipping` |
| **7. Kịch bản Automation Test trình duyệt 4 cổng mới** | Working Tree (chưa commit) | Thêm `notification-bell-e2e.manual.cjs` (Playwright + Edge) kiểm thử toàn bộ chuông realtime 4 cổng + cô lập nhân viên + nút Mua lại (**6/6 PASS**) |

---

## 2. Bảng Kê Chi Tiết Từng File Đã Sửa

> Ký hiệu trạng thái: **`[Mới]`** = File tạo mới | **`[Sửa]`** = File chỉnh sửa | **`[Xóa]`** = File đã gỡ bỏ / gộp sang `@shared` | **`[Di chuyển]`** = Đổi vị trí

### 2.1. Database & Prisma Migrations (`backend/prisma/`)
| Trạng thái | Đường dẫn file | Nội dung đã sửa |
| :---: | :--- | :--- |
| `[Sửa]` | `backend/prisma/schema.prisma` | Thêm cột `Order.assignedEmployeeId` (+ FK tới `Employee`), thêm `Notification.employeeId` (+ FK tới `Employee`), bổ sung nhiều composite index cho `Order`, `Shipment`, `VendorOrder`, `Notification`, `Product`, `Review` |
| `[Mới]` | `backend/prisma/migrations/20261121000000_optimize_query_indexes/migration.sql` | Bật extension `pg_trgm`, tạo GIN trigram index tìm kiếm text + 7 composite B-tree index + partial JSON index cho `Notification` |
| `[Mới]` | `backend/prisma/migrations/20261121010000_add_order_assigned_employee/migration.sql` | Thêm cột `Order.assignedEmployeeId`, khóa ngoại `ON DELETE SET NULL`, 2 index và câu lệnh SQL backfill dữ liệu cho các đơn cũ từ `OrderStatusHistory` |
| `[Mới]` | `backend/prisma/migrations/20261121020000_add_notification_employee_id/migration.sql` | Thêm cột `Notification.employeeId`, khóa ngoại `ON DELETE CASCADE` và 2 index `(employeeId, isRead, createdAt)`, `(employeeId, createdAt)` |
| `[Sửa]` | `backend/src/generated/zod/index.ts` | Tự động cập nhật Zod schema tương ứng với các trường mới trong `schema.prisma` |

---

### 2.2. Backend API & Services (`backend/src/`)
| Trạng thái | Đường dẫn file | Nội dung đã sửa |
| :---: | :--- | :--- |
| `[Sửa]` | `backend/package.json` | Bổ sung các script chạy Automation Test (`test:auto`, `test:auto:quick`, `test:auto:api`, `test:auto:ui`, `test:auto:demo`, `test:soft-delete`, `test:doan`, ...) |
| `[Sửa]` | `backend/src/app/app.module.ts` | Đăng ký `AccountDirectoryModule` dùng chung |
| `[Mới]` | `backend/src/common/account/account-directory.module.ts` | Module tra cứu tài khoản tập trung đa bảng (Admin/Employee/Vendor/Client) |
| `[Mới]` | `backend/src/common/account/account-directory.service.ts` | Service kiểm tra trùng email, trạng thái khóa/xóa mềm thống nhất |
| `[Mới]` | `backend/src/common/prisma/prisma-selects.const.ts` | Tập hợp các object `select` chuẩn tái sử dụng (`CARRIER_SUMMARY_SELECT`, `EMPLOYEE_ACTOR_SELECT`, `PRODUCT_VARIANT_SUMMARY_SELECT`, `VENDOR_SUMMARY_SELECT`) để tránh over-fetching |
| `[Sửa]` | `backend/src/common/prisma/prisma.service.ts` | Hoàn thiện middleware/extension **xóa mềm 100%** (tự lọc `deletedAt: null`, chặn xóa cứng nhầm) và tối ưu kết nối |
| `[Sửa]` | `backend/src/common/guards/access-control/access-control.guard.ts` | Kiểm tra role/tài khoản active/xóa mềm đồng bộ cho cả 4 vai trò |
| `[Sửa]` | `backend/src/common/utils/paginaton-util/pagintion-util.service.ts` | Chuẩn hóa tham số phân trang, giới hạn `itemPerPage` an toàn |
| `[Sửa]` | `backend/src/common/utils/vendor-approval/vendor-approval.util.ts` | Chuẩn hóa logic kiểm tra duyệt & gia hạn tài khoản Vendor |
| `[Sửa]` | `backend/src/app/auth/auth.service.ts` & `auth.service.spec.ts` | Chặn đăng nhập tài khoản xóa mềm/chưa duyệt; đồng bộ payload JWT & unit test |
| `[Sửa]` | `backend/src/app/admins/admins.service.ts` | Áp dụng xóa mềm và tối ưu select/truy vấn |
| `[Sửa]` | `backend/src/app/clients/clients.service.ts` | Áp dụng xóa mềm khách hàng và tối ưu select |
| `[Sửa]` | `backend/src/app/users/users.service.ts` | Tối ưu truy vấn hồ sơ/danh sách người dùng & chuẩn hóa xóa mềm |
| `[Sửa]` | `backend/src/app/vendors/vendors.service.ts` | Tối ưu truy vấn danh sách/chi tiết Vendor & duyệt đăng ký |
| `[Sửa]` | `backend/src/app/categories/category.service.ts` | Chuyển xóa danh mục sang xóa mềm/khóa mềm và đồng bộ realtime |
| `[Sửa]` | `backend/src/app/product-colors/productColor.service.ts` | Đồng bộ xóa mềm biến thể/màu sắc sản phẩm |
| `[Sửa]` | `backend/src/app/products/products.service.ts` & `products.service.spec.ts` | Tối ưu truy vấn danh sách/tìm kiếm sản phẩm, tính `soldQuantity` theo nhóm gộp thay vì N+1, chuẩn hóa xóa mềm |
| `[Sửa]` | `backend/src/app/cart/cart.service.ts` | Lọc sản phẩm đã xóa mềm/ngừng bán, tối ưu select giỏ hàng |
| `[Sửa]` | `backend/src/app/vouchers/vouchers.service.ts` & `vouchers.service.spec.ts` | Chuẩn hóa logic gộp Voucher Shop + Sàn, gia hạn voucher, xóa mềm |
| `[Sửa]` | `backend/src/app/payments/payments.controller.ts` & `payments.service.ts` | Tối ưu xử lý thanh toán tách đơn đa shop & đồng bộ trạng thái |
| `[Sửa]` | `backend/src/app/payroll/payroll.service.ts` | Tối ưu truy vấn bảng lương, chấm công & lọc nhân viên xóa mềm |
| `[Sửa]` | `backend/src/app/reports/reports.service.ts` & `reports.service.spec.ts` | Tối ưu các truy vấn thống kê doanh thu/khách hàng, giảm quét bảng thừa |
| `[Sửa]` | `backend/src/app/reviews/reviews.controller.ts` & `reviews.service.ts` | Thêm endpoint `GET /reviews/vendor/mine` lọc đánh giá theo Vendor trực tiếp tại DB |
| `[Sửa]` | `backend/src/app/surveys/surveys.service.ts` & `surveys.service.spec.ts` | Tối ưu phát khảo sát sau đặt hàng/hoàn thành và truy vấn kết quả khảo sát |
| `[Sửa]` | `backend/src/app/realtime/realtime.gateway.ts` | Ổn định xác thực kết nối Socket.IO và phân phòng (`user:`, `vendor:`, `admins`, `employees`, `catalog`) |
| `[Mới]` | `backend/src/app/orders/order-assignment.helper.ts` | Tách logic cân bằng tải bưu tá & nhận diện phòng ban (Điều phối / Vận chuyển / Sự cố) |
| `[Mới]` | `backend/src/app/orders/dto/reorder.dto.ts` | DTO cho API mua lại đơn hàng (`orderIds: string[]`) |
| `[Sửa]` | `backend/src/app/orders/orders.module.ts` | Import `NotificationsModule` để bắn thông báo đơn hàng |
| `[Sửa]` | `backend/src/app/orders/orders.controller.ts` | Thêm endpoint `POST /orders/reorder` cho khách hàng |
| `[Sửa]` | `backend/src/app/orders/orders.service.ts` | (1) Gán & lưu `Order.assignedEmployeeId` khi checkout/assign; (2) Cô lập nghiêm ngặt đơn của từng nhân viên trong `listAll`, `assertCanView`, `updateStatus`; (3) Cài đặt `reorder()`; (4) Bắn thông báo chuông realtime cho Vendor, Điều phối, Bưu tá, Client, Chuyên viên sự cố trên `checkout`, `updateStatus`, `updateVendorOrderStatus`, `assignOrder`; (5) Tối ưu truy vấn & transaction |
| `[Sửa]` | `backend/src/app/orders/orders.service.spec.ts` & `orders.fulfillment.spec.ts` | Bổ sung unit test cho cô lập đơn nhân viên, `reorder`, và luồng xử lý đơn |
| `[Sửa]` | `backend/src/app/shipping/shipping.module.ts` | Import `NotificationsModule` |
| `[Sửa]` | `backend/src/app/shipping/shipping.service.ts` | (1) Siết quyền bưu tá chỉ thấy/cập nhật vận đơn mang `carrierId` của mình; (2) Bắn chuông thông báo realtime trong `updateShipmentStatus`, `executeAssignCarrier`, `randomAssignAll`; (3) Tối ưu truy vấn danh sách vận đơn |
| `[Sửa]` | `backend/src/app/employees/employees.service.ts` | Gộp thông báo từ bảng `Notification` (theo `employeeId`) với thông báo nội bộ cũ trong `getMyNotifications`, `markNotificationRead`, `markAllNotificationsRead` |
| `[Sửa]` | `backend/src/app/notifications/notifications.controller.ts` | Mở quyền role `'employee'` trên cả 4 endpoint `/notifications` |
| `[Sửa]` | `backend/src/app/notifications/notifications.service.ts` | Hỗ trợ `employeeId` trong `getTargetWhere`, bổ sung `notifyOrderUpdates()` + bộ nhãn trạng thái tiếng Việt + emit realtime cho cả Vendor & User |
| `[Mới]` | `backend/src/app/notifications/notifications.service.spec.ts` | Unit test kiểm chứng scope `employeeId`, lưu & emit realtime `notifyOrderUpdates()`, và chống lỗi lan truyền khi DB bận |

---

### 2.3. Thư Viện Dùng Chung `@shared` (`shared/`)
| Trạng thái | Đường dẫn file | Nội dung đã sửa |
| :---: | :--- | :--- |
| `[Mới]` | `shared/api/createApiClient.js` | Factory tạo Axios client chuẩn (interceptor token, xử lý lỗi mạng, timeout) |
| `[Mới]` | `shared/components/ui/Badge.jsx`, `Button.jsx`, `Modal.jsx`, `Select.jsx`, `PaginationFooter.jsx`, `AvatarUploadField.jsx`, `ToastProvider.jsx`, `ErrorBoundary.jsx`, `index.js` | Bộ UI component dùng chung cho 4 cổng (có `ErrorBoundary` bắt lỗi crash trang & `ToastProvider` tối ưu render) |
| `[Di chuyển]` | `vendor/src/components/ui/Input.jsx` → `shared/components/ui/Input.jsx` | Gom component `Input` về `@shared` |
| `[Mới]` | `shared/components/common/NotificationDropdown.jsx` | Component chuông thông báo dùng chung cho Admin/Vendor/Employee (lắng nghe realtime `miva:notification`, hiển thị icon `Package` + badge `Đơn hàng` cho `order_update`, hỗ trợ click điều hướng) |
| `[Mới]` | `shared/components/common/BaseVoucherFormModal.jsx`, `ExtendEndDateModal.jsx` | Form tạo/sửa & gia hạn Voucher dùng chung Admin/Vendor |
| `[Mới]` | `shared/components/surveys/SurveyPreviewModal.jsx`, `SurveyQuestionBuilder.jsx`, `SurveyResultsPanel.jsx` | Bộ công cụ xây dựng, xem trước và thống kê Khảo sát dùng chung Admin/Vendor |
| `[Mới]` | `shared/contexts/createThemeContext.jsx` | Quản lý Dark/Light mode dùng chung |
| `[Mới]` | `shared/hooks/useDebouncedValue.js`, `usePaginatedCacheList.js` | Hook debounce tìm kiếm và cache phân trang danh sách dùng chung |
| `[Mới]` | `shared/realtime/RealtimeBridge.jsx` | Cầu nối Socket.IO realtime chuẩn, quản lý reconnect và bắn sự kiện `miva:notification`, `miva:order`, ... |
| `[Mới]` | `shared/styles/miva-theme.css` | Biến CSS & màu sắc nhận diện thương hiệu MIVA thống nhất |
| `[Mới]` | `shared/utils/formatHelpers.js`, `orderBatchHelpers.js`, `statusConfig.js`, `voucherFormHelpers.js` | Hàm định dạng tiền/ngày, gom nhóm đơn hàng, cấu hình màu trạng thái, validate voucher |

---

### 2.4. Customer Storefront (`frontend/`)
| Trạng thái | Đường dẫn file | Nội dung đã sửa |
| :---: | :--- | :--- |
| `[Sửa]` | `frontend/index.html`, `frontend/src/index.css`, `frontend/tailwind.config.js`, `frontend/vite.config.js` | Cập nhật font/theme MIVA, cấu hình `manualChunks` tối ưu bundle Vite |
| `[Sửa]` | `frontend/src/routes/AppRoutes.jsx` | Lazy-load các trang & bọc `ErrorBoundary` |
| `[Sửa]` | `frontend/src/realtime/RealtimeBridge.jsx` | Tối ưu kết nối Socket.IO, phát sự kiện cập nhật thông báo/đơn hàng/sản phẩm không cần reload |
| `[Sửa]` | `frontend/src/components/layout/Header/Header.jsx` | Đồng bộ header theme MIVA |
| `[Sửa]` | `frontend/src/components/layout/Header/NotificationBellDropdown.jsx` | Hiển thị icon `Package` + badge `Đơn hàng` cho `order_update`, bấm vào tự đánh dấu đã đọc và điều hướng tới `/orders` |
| `[Mới]` | `frontend/src/components/cart/OrderSummaryPanel.jsx`, `frontend/src/components/product/ProductGrid/ProductGrid.jsx`, `frontend/src/components/product/VoucherBadges.jsx`, `frontend/src/components/survey/SurveyFormContent.jsx` | Tách component hiển thị tóm tắt đơn, lưới sản phẩm, nhãn voucher, nội dung khảo sát |
| `[Sửa]` | `frontend/src/components/cart/VoucherPricing.jsx`, `frontend/src/utils/voucherPrice.js`, `frontend/src/hooks/useCheckoutPricing.js`, `useVoucherOffers.js` | Chuẩn hóa & tối ưu tính toán gộp Voucher Shop + Voucher Sàn |
| `[Sửa]` | `frontend/src/components/product/ProductCard/ProductCard.jsx`, `QuickAddModal/QuickAddModal.jsx`, `frontend/src/pages/Home/Home.jsx`, `ProductDetail.jsx`, `Shop/VendorShop.jsx` | Đồng bộ giao diện, hiển thị badge voucher và tối ưu re-render |
| `[Sửa]` | `frontend/src/pages/Product/ProductSearch.jsx` | Thêm bộ lọc 5 danh mục có nút thu gọn/mở rộng mượt bằng CSS Grid transition |
| `[Sửa]` | `frontend/src/pages/Account/Profile.jsx` | Tối ưu bố cục thẻ hồ sơ cá nhân 2 cột cân đối |
| `[Mới]` | `frontend/src/layouts/AccountLayout.jsx`, `frontend/src/pages/Account/components/OrderCancelModal.jsx`, `OrderItemRow.jsx`, `OrderReviewModal.jsx`, `frontend/src/hooks/useSurveyResponseForm.js` | Tách layout tài khoản và các modal hủy đơn, đánh giá, dòng sản phẩm |
| `[Sửa]` | `frontend/src/pages/Account/Orders.jsx`, `frontend/src/services/orderService.js`, `frontend/src/pages/Cart/Cart.jsx`, `Checkout.jsx` | Thêm nút **Mua lại** cho đơn hoàn thành, gọi `POST /orders/reorder`, tự nạp sẵn sản phẩm/địa chỉ/thanh toán/voucher cũ vào `/checkout` |
| `[Sửa]` | `frontend/src/hooks/useCart.js`, `useFavorites.js`, `useOrders.js`, `useProducts.js`, `services/favoriteService.js`, `utils/orderHelpers.js` | Tối ưu đồng bộ state giỏ hàng, đơn hàng và danh sách yêu thích |
| `[Sửa]` | `frontend/src/pages/Account/Favorites.jsx`, `Auth/Login.jsx`, `Auth/Register.jsx`, `layouts/AuthLayout.jsx`, `pages/Survey/SurveyPage.jsx`, `components/survey/SurveyModal.jsx` | Đồng bộ giao diện theme MIVA và luồng khảo sát |

---

### 2.5. Admin Portal (`admin/`)
| Trạng thái | Đường dẫn file | Nội dung đã sửa |
| :---: | :--- | :--- |
| `[Sửa]` | `admin/src/App.jsx`, `admin/vite.config.js`, `admin/src/index.css`, `admin/src/api/axiosClient.js`, `api/index.js` | Lazy-load 7 Workspace, `ErrorBoundary`, `manualChunks` Vite, chuẩn hóa API client |
| `[Mới]` | `admin/src/components/layout/workspaceConfig.js`, `admin/src/components/ui/WorkspaceTabs.jsx` | Cấu hình điều hướng & thanh tab cho 7 Workspace hợp nhất |
| `[Mới]` | `admin/src/pages/analytics/AnalyticsWorkspace.jsx`, `categories/CatalogWorkspace.jsx`, `employees/EmployeeWorkspace.jsx`, `orders/OrderWorkspace.jsx`, `surveys/SurveyWorkspace.jsx`, `vendors/VendorWorkspace.jsx` | 6 file wrapper gom nhóm các màn hình liên quan thành Workspace theo tab |
| `[Sửa]` | `admin/src/components/layout/DashboardLayout.jsx`, `Header.jsx`, `Sidebar.jsx`, `ProtectedRoute.jsx` | Đồng bộ layout theme MIVA & menu sidebar 7 mục gọn gàng |
| `[Sửa]` | `admin/src/components/layout/NotificationDropdown.jsx` | Dùng `SharedNotificationDropdown` + bấm thông báo `order_update` điều hướng tới `/orders` |
| `[Xóa]` | `admin/src/components/ui/Badge.jsx`, `Button.jsx`, `Input.jsx`, `Modal.jsx`, `Select.jsx`, `data/surveyTemplates.js`, `pages/dashboard/Dashboard.jsx` | Xóa các file trùng lặp sau khi chuyển sang `@shared` và hợp nhất vào `AnalyticsWorkspace` |
| `[Sửa]` | `admin/src/components/ui/AvatarUploadField.jsx`, `index.js`, `contexts/ThemeContext.jsx`, `hooks/usePaginatedCacheList.js`, `realtime/RealtimeBridge.jsx`, `utils/formatHelpers.js`, `orderHelpers.js`, `voucherFormHelpers.js` | Tái xuất/ủy quyền sang `@shared` |
| `[Sửa]` | `admin/src/pages/analytics/Analytics.jsx`, `CustomerAnalytics.jsx`, `auth/Login.jsx`, `categories/CategoryManagement.jsx`, `employees/*`, `orders/*`, `payroll/PayrollManagement.jsx`, `reviews/ReviewManagement.jsx`, `shipping/ShippingManagement.jsx`, `surveys/SurveyManagement.jsx`, `users/*`, `vendors/*`, `vouchers/*` | Đồng bộ theme MIVA, tối ưu phân trang/cache, chuẩn hóa thao tác xóa mềm và phân công đơn hàng |

---

### 2.6. Vendor Portal (`vendor/`)
| Trạng thái | Đường dẫn file | Nội dung đã sửa |
| :---: | :--- | :--- |
| `[Sửa]` | `vendor/src/App.jsx`, `vendor/vite.config.js`, `vendor/src/index.css`, `vendor/src/api/client.js`, `contexts/AuthContext.jsx`, `ThemeContext.jsx`, `realtime/RealtimeBridge.jsx` | Lazy-load, `ErrorBoundary`, `manualChunks` Vite, đồng bộ `@shared` |
| `[Sửa]` | `vendor/src/components/layout/DashboardLayout.jsx`, `Header.jsx`, `Sidebar.jsx` | Đồng bộ giao diện theme MIVA |
| `[Sửa]` | `vendor/src/components/layout/NotificationDropdown.jsx` | Dùng `SharedNotificationDropdown` + bấm thông báo `order_update` điều hướng thẳng tới `/orders` |
| `[Mới]` | `vendor/src/pages/orders/components/CancelVendorOrderModal.jsx`, `PackingSlipPrintModal.jsx` | Modal hủy kiện hàng và in phiếu đóng gói cho shop |
| `[Xóa]` | `vendor/src/components/ui/Badge.jsx`, `Button.jsx`, `Modal.jsx`, `Select.jsx`, `data/surveyTemplates.js`, `pages/analytics/Analytics.jsx`, `pages/orders/OrderDetailModal.jsx`, `OrderManagement.jsx` | Gỡ file trùng lặp sau khi chuyển sang `@shared` và hợp nhất vào `Dashboard` / `OrderFulfillmentPage` |
| `[Sửa]` | `vendor/src/pages/reviews/ReviewManagement.jsx`, `vendor/src/services/reviewService.js` | Gọi endpoint mới `GET /reviews/vendor/mine` thay vì tải toàn bộ reviews |
| `[Sửa]` | `vendor/src/pages/dashboard/Dashboard.jsx`, `orders/OrderFulfillmentPage.jsx`, `products/*`, `settings/StoreSettings.jsx`, `surveys/SurveyManagement.jsx`, `vouchers/*`, `auth/Login.jsx`, `Register.jsx` | Đồng bộ theme MIVA, tối ưu doanh thu/tồn kho realtime và xóa mềm |

---

### 2.7. Employee Portal (`employee/`)
| Trạng thái | Đường dẫn file | Nội dung đã sửa |
| :---: | :--- | :--- |
| `[Sửa]` | `employee/index.html`, `employee/src/index.css`, `employee/vite.config.js`, `employee/src/App.jsx`, `api/axiosClient.js`, `contexts/AuthContext.jsx`, `realtime/RealtimeBridge.jsx` | Lazy-load, `ErrorBoundary`, `manualChunks`, đồng bộ theme MIVA & realtime |
| `[Mới]` | `employee/src/contexts/ThemeContext.jsx`, `employee/src/components/orders/OrderActionModal.jsx` | Hỗ trợ Dark/Light mode và hợp nhất các modal xử lý đơn về 1 modal gọn |
| `[Xóa]` | `employee/dist/index.html`, `employee/node_modules/*` (6,544 file), `components/notifications/EmployeeNotificationsModal.jsx`, `components/orders/ConfirmOrderModal.jsx`, `ExceptionModal.jsx`, `RejectOrderModal.jsx`, `TransferVendorModal.jsx`, `pages/orders/AuditHistoryPage.jsx`, `PermissionsFaqPage.jsx`, `VendorTrackingPage.jsx`, `pages/vendors/VendorApprovalPage.jsx` | Dọn `node_modules` + build output khỏi Git; gỡ các trang/modal thừa đã hợp nhất |
| `[Sửa]` | `employee/src/components/layout/DashboardLayout.jsx`, `Sidebar.jsx`, `Navbar.jsx` | Tích hợp `SharedNotificationDropdown` trên Navbar; bấm thông báo `order_update` tự điều hướng `/shipping` (Bưu tá) hoặc `/orders` (Điều phối/Sự cố); hiển thị phạm vi *"Đơn được phân công"* |
| `[Sửa]` | `employee/src/pages/orders/OrdersPage.jsx`, `employee/src/utils/orderFormat.js` | Đổi cột bảng sang **Nhân viên vận chuyển** (hiển thị trực tiếp bưu tá giao hàng), tách rõ `assignedEmployee` và `assignedCarrier` |
| `[Sửa]` | `employee/src/pages/shipping/InternalShippingPage.jsx`, `profile/MyProfilePage.jsx`, `auth/LoginPage.jsx`, `components/attendance/AttendanceCheckInModal.jsx`, `components/orders/OrderDetailModal.jsx` | Đồng bộ giao diện & luồng chỉ hiển thị vận đơn được phân công cho bưu tá |

---

### 2.8. Desktop App, Dataset, Tài Liệu & Automation Tests
| Trạng thái | Đường dẫn file | Nội dung đã sửa |
| :---: | :--- | :--- |
| `[Sửa]` | `desktop/main.js` | Tối ưu khởi động/đóng tiến trình Electron và proxy các cổng |
| `[Sửa]` | `dataset/generators/vouchers.generator.ts` | Cập nhật bộ sinh dữ liệu voucher phù hợp schema mới |
| `[Sửa]` | `.gitignore` | Bổ sung bỏ qua `node_modules`, bản build, video test |
| `[Mới]` | `HUONG_DAN_AUTOMATION_TEST.md` | Tài liệu hướng dẫn chạy Automation Test 3 tầng & chế độ Demo đồ án |
| `[Mới]` | `backend/test/run-all-automation.cjs`, `helpers/browser-helper.cjs`, `helpers/thesis-presenter.cjs` | Trình điều phối tự động bật server + chạy toàn bộ test + tiện ích Playwright 4 cổng |
| `[Mới]` | `backend/test/soft-delete.manual.cjs` | Kịch bản kiểm chứng xóa mềm 100% (UI + API + PostgreSQL) |
| `[Mới]` | `backend/test/thesis-showcase.manual.cjs` | Kịch bản trình chiếu bảo vệ đồ án 8 chương liên hoàn qua 4 cổng |
| `[Mới]` | `backend/test/notification-bell-e2e.manual.cjs` | **Kịch bản Playwright 4 cổng mới**: kiểm thử chuông thông báo đơn hàng realtime (Vendor, Điều phối, Bưu tá, Client), click điều hướng, cô lập đơn nhân viên (`403`) và nút Mua lại (**6/6 PASS**) |
| `[Sửa]` | `backend/test/admin-voucher.manual.cjs`, `api-calls.manual.cjs`, `category-realtime.manual.cjs`, `multi-vendor-payment.manual.cjs`, `portal-smoke.manual.cjs`, `registration-login.manual.cjs`, `vendor-sync.manual.cjs`, `vendor-voucher.manual.cjs`, `voucher-pricing.manual.cjs` | Chuẩn hóa dùng `browser-helper.cjs` chung, hỗ trợ `--demo` quay video |
| `[Mới]` | `backend/test/LATEST_AUTOMATION_REPORT.md`, `THESIS_DEMO_REPORT.md` | Báo cáo kết quả chạy Automation Test mới nhất |

---

## 3. Kết Quả Kiểm Thử Xác Nhận

| Hạng mục | Kết quả |
| :--- | :--- |
| **TypeScript Check (`npx tsc --noEmit`)** | PASS (0 lỗi) |
| **Backend Unit Tests (`npm test`)** | **12/12 suites (86/86 tests) PASS** |
| **Production Build 4 Cổng (`frontend`, `vendor`, `admin`, `employee`)** | **4/4 PASS** (0 lỗi) |
| **Browser Automation Test (`notification-bell`)** | **6/6 bước PASS** (12.4s, 0 lỗi JS) |

### Lưu ý khi đồng đội pull code hoặc merge vào `master`
Sau khi commit và merge nhánh `nhatlongdev` vào `master`, cần chạy lệnh sau tại thư mục `backend` để đồng bộ 3 migration mới lên PostgreSQL:
```powershell
cd backend
npx prisma migrate deploy
npx prisma generate
```
