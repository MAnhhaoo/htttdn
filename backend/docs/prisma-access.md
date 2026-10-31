# Truy cập cơ sở dữ liệu qua Prisma mở rộng

`PrismaService` là provider toàn cục của NestJS và quản lý kết nối PostgreSQL.
Các service nghiệp vụ dùng `prisma.extended.<model>`; những service kế thừa
`PrismaBaseService` dùng `this.extended`. Không tạo `PrismaClient` riêng trong
luồng xử lý API.

```ts
const products = await this.prisma.extended.product.findMany({
  where: { status: 'active' },
});
```

Với thao tác cần transaction, gọi `extendedTransaction`. Tham số `tx` được
kiểu hóa như `Prisma.TransactionClient`, nhưng client thực thi bên trong là
client mở rộng nên các query hook vẫn chạy trong cùng transaction.

```ts
return this.prisma.extendedTransaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });
  await tx.orderDetail.create({ data: { orderId: order.id, ...detailData } });
  return order;
});
```

Quy tắc mở rộng lấy danh sách trường từ Prisma DMMF. `findFirst`, `findMany`
và `count` tự lọc `deletedAt: null` cho model có trường này, trừ các model
tài khoản (`Admin`, `Client`, `Vendor`, `Employee`) vì chúng có luồng quản lý
trạng thái riêng. `findMany` chỉ thêm thứ tự mặc định với các trường thời gian
thực sự tồn tại. `findUnique`, `findUniqueOrThrow`, `update`, `updateMany`,
`deleteMany`, `groupBy`, `aggregate` và truy vấn quan hệ lồng nhau **không**
được tự lọc; viết điều kiện `deletedAt` rõ ràng khi nghiệp vụ cần.

`create` và `upsert` tự tạo `slug` cho `Product` và `Category` khi đầu vào có
`name`. Các service phải chọn trường đầu vào hợp lệ trước khi gọi Prisma;
extension không tự xóa các trường như `id` hoặc `createdBy`.

Các truy vấn SQL đặc thù vẫn dùng API `$queryRaw` của client mở rộng: health
check (`SELECT 1`), tìm mã vendor bằng PostgreSQL `ILIKE`, và ánh xạ biến thể
đã xóa mềm về sản phẩm khi tính danh sách bán chạy từ lịch sử đơn hàng. Các
giá trị động được truyền qua tagged template để Prisma tham số hóa. File seed
và các script kiểm thử có thể dùng Prisma Client riêng để chuẩn bị/kiểm tra
fixture; chúng không nằm trong luồng API của ứng dụng.

Kiểm chứng sau khi sửa quy tắc Prisma: `npm run build`, `npm test -- --runInBand`
và `npm run test:e2e -- --runInBand` trong thư mục `backend`.
