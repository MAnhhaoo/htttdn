// End-to-End 4-Portal Browser UI + Realtime Automation Test:
//   1. Chuông thông báo đơn hàng realtime trên 4 cổng (Vendor, Employee Điều phối, Bưu tá, Client)
//   2. Click thông báo tự động đánh dấu đã đọc & điều hướng đúng trang (/orders hoặc /shipping)
//   3. Cô lập đơn hàng nhân viên (Employee chỉ thấy đơn được phân công, bị chặn 403 với đơn người khác)
//   4. Nút "Mua lại" (Reorder) sau khi đơn hàng hoàn thành trên giao diện Storefront
//
// Cách chạy:
//   node test/notification-bell-e2e.manual.cjs
//   node test/run-all-automation.cjs --filter=notification-bell --demo
require('dotenv').config();
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const {
  launchBrowser,
  newPortalContext,
  loginVendorUI,
  loginClientUI,
  loginEmployeeUI,
  authenticatePortalContext,
  cleanupProductTree,
  cleanupClientTree,
} = require('./helpers/browser-helper.cjs');

async function checked(response, expectedStatuses = [200, 201]) {
  const allowed = Array.isArray(expectedStatuses) ? expectedStatuses : [expectedStatuses];
  assert.ok(
    allowed.includes(response.status()),
    `${new URL(response.url()).pathname} -> HTTP ${response.status()}: ${await response.text()}`,
  );
  const body = await response.json();
  return body.data ?? body;
}

async function openBellAndWaitText(page, bellTitle, expectedText, timeout = 15000) {
  const bellBtn = page.locator(`button[title="${bellTitle}"]`).first();
  await bellBtn.waitFor({ state: 'visible', timeout });

  // Wait briefly for realtime badge or notification to arrive
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    // Open dropdown if not already showing expected text
    const textLoc = page.getByText(expectedText, { exact: false }).first();
    if (await textLoc.isVisible().catch(() => false)) {
      return textLoc;
    }
    await bellBtn.click();
    await page.waitForTimeout(450);
    if (await textLoc.isVisible().catch(() => false)) {
      return textLoc;
    }
    // Close dropdown and retry after a short pause for Socket.IO delivery
    await bellBtn.click().catch(() => null);
    await page.waitForTimeout(550);
  }

  // Final attempt so Playwright throws a clear timeout message
  await bellBtn.click();
  const finalLoc = page.getByText(expectedText, { exact: false }).first();
  await finalLoc.waitFor({ state: 'visible', timeout: 5000 });
  return finalLoc;
}

async function main() {
  const prisma = new PrismaClient();
  const ts = Date.now();
  const prefix = `TEST-BELL-${ts}`;
  const clientPassword = 'Test-bell-123!';
  const empPassword = process.env.MIVA_TEST_EMPLOYEE_PASSWORD || 'admin123';
  const vendorEmail = process.env.MIVA_TEST_VENDOR_EMAIL || 'vendor1@miva.vn';

  const cbase = 'http://localhost:5173';
  const abase = 'http://localhost:5174';
  const vbase = 'http://localhost:5175';
  const ebase = 'http://localhost:5176';

  let browser;
  let client;
  let category;
  let product;
  let disposableOtherEmp;
  const createdOrderIds = [];
  const createdNotificationEmployeeIds = [];
  const pageErrors = [];

  function watchErrors(page, label) {
    page.on('pageerror', (err) => pageErrors.push(`[${label}] ${err.message}`));
  }

  try {
    console.log('\n=== BẮT ĐẦU AUTOMATION TEST: CHUÔNG THÔNG BÁO 4 CỔNG + CÔ LẬP NHÂN VIÊN + MUA LẠI ===');

    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { email: vendorEmail } });

    client = await prisma.client.create({
      data: {
        email: `${prefix.toLowerCase()}@example.com`,
        fullName: prefix,
        phone: '0909123456',
        password: await bcrypt.hash(clientPassword, 10),
      },
    });

    category = await prisma.category.create({
      data: { name: prefix, slug: prefix.toLowerCase() },
    });

    browser = await launchBrowser();
    const vendorContext = await newPortalContext(browser, 'bell-vendor');
    const clientContext = await newPortalContext(browser, 'bell-client');
    const adminContext = await newPortalContext(browser, 'bell-admin');

    // Đăng nhập Admin qua API để hỗ trợ kiểm chứng nhanh
    await authenticatePortalContext(
      adminContext,
      'admin',
      process.env.MIVA_TEST_ADMIN_EMAIL || 'admin1@miva.vn',
      process.env.MIVA_TEST_ADMIN_PASSWORD || 'admin123',
      abase,
    );

    // 1. Mở sẵn trình duyệt Vendor (/dashboard) và Client (/) trước khi có đơn mới
    const vendorPage = await vendorContext.newPage();
    watchErrors(vendorPage, 'Vendor');
    await loginVendorUI(vendorPage, vendorEmail, undefined, vbase);

    const clientPage = await clientContext.newPage();
    watchErrors(clientPage, 'Client');
    await loginClientUI(clientPage, client.email, clientPassword, cbase);

    // Tạo sản phẩm test thuộc Vendor
    product = await checked(
      await vendorContext.request.post(`${vbase}/api/products`, {
        headers: { 'x-app-role': 'vendor' },
        data: {
          name: `${prefix} Áo Khoác Test`,
          categoryId: category.id,
          status: 'active',
          colors: [{ color: 'Xanh Rêu', variants: [{ size: 'L', stock: 10, price: 150000 }] }],
        },
      }),
      201,
    );

    const variant = await prisma.productVariant.findFirstOrThrow({
      where: { productColor: { productId: product.id } },
    });

    // Thêm vào giỏ hàng của khách test
    await prisma.cart.upsert({
      where: { clientId: client.id },
      create: {
        clientId: client.id,
        items: { create: { productVariantId: variant.id, quantity: 2 } },
      },
      update: {
        items: { create: { productVariantId: variant.id, quantity: 2 } },
      },
    });

    // -------------------------------------------------------------------------
    // STEP 1: Khách đặt đơn mới -> Kiểm tra chuông realtime Vendor, Điều phối, Bưu tá
    // -------------------------------------------------------------------------
    const checkoutRes = await checked(
      await clientContext.request.post(`${cbase}/api/orders/checkout`, {
        headers: { 'x-app-role': 'client' },
        data: {
          receiverName: prefix,
          receiverPhone: '0909123456',
          shippingAddress: '123 Đường Test Chuông, Quận 1, TP.HCM',
          paymentMethod: 'cod',
          notes: 'Đơn test automation chuông thông báo',
        },
      }),
      201,
    );

    const order = checkoutRes.orders?.[0] || checkoutRes;
    assert.ok(order.id && order.orderCode, 'Checkout phải trả về order.id và orderCode');
    createdOrderIds.push(order.id);
    const orderCode = order.orderCode;
    const vendorOrder = order.vendorOrders?.[0];
    const shipment = order.shipments?.[0];
    assert.ok(vendorOrder?.id, 'Đơn hàng phải có vendorOrder');
    assert.ok(shipment?.id, 'Đơn hàng phải có shipment');
    assert.ok(order.assignedEmployeeId, 'Đơn hàng phải được phân công nhân viên điều phối');
    assert.ok(shipment.carrierId, 'Vận đơn phải được phân công bưu tá');

    console.log(
      `[INFO] Đã tạo đơn #${orderCode} | Điều phối=${order.assignedEmployeeId} | Bưu tá=${shipment.carrierId}`,
    );

    // 1A. Kiểm tra chuông Vendor rung realtime (không cần reload từ /dashboard) & click -> /orders
    const vendorNewOrderNotif = await openBellAndWaitText(
      vendorPage,
      'Thông báo Đối tác',
      `Đơn hàng mới #${orderCode}`,
    );
    await vendorNewOrderNotif.click();
    await vendorPage.waitForURL(/\/orders/, { timeout: 10000 });
    console.log('PASS [1/6]: Chuông Vendor nhận realtime "Đơn hàng mới" và click điều hướng sang /orders');

    // 1B. Đăng nhập cổng Employee bằng đúng nhân viên Điều phối & Bưu tá được phân công
    const [handlingEmp, courierEmp] = await Promise.all([
      prisma.employee.findUniqueOrThrow({ where: { id: order.assignedEmployeeId } }),
      prisma.employee.findUniqueOrThrow({ where: { id: shipment.carrierId } }),
    ]);
    createdNotificationEmployeeIds.push(handlingEmp.id, courierEmp.id);

    const handlingContext = await newPortalContext(browser, 'bell-handling-emp');
    const handlingPage = await handlingContext.newPage();
    watchErrors(handlingPage, 'HandlingEmployee');
    await loginEmployeeUI(handlingPage, handlingEmp.email, empPassword, ebase);
    await handlingPage.goto(`${ebase}/profile`, { waitUntil: 'domcontentloaded' });

    const handlingNotif = await openBellAndWaitText(
      handlingPage,
      'Thông báo Nội bộ',
      `#${orderCode}`,
    );
    await handlingNotif.click();
    await handlingPage.waitForURL(/\/orders/, { timeout: 10000 });
    // Xác minh cột bảng đơn hàng đã đổi tên sang "Nhân viên vận chuyển"
    await handlingPage.getByText('Nhân viên vận chuyển', { exact: false }).first().waitFor({ timeout: 10000 });
    console.log('PASS [2/6]: Chuông Nhân viên điều phối hiển thị đơn được phân công, click -> /orders & thấy cột "Nhân viên vận chuyển"');

    // 1C. Kiểm tra Cô lập đơn hàng nhân viên (Employee khác KHÔNG thấy đơn này và bị 403 khi xem chi tiết)
    disposableOtherEmp = await prisma.employee.create({
      data: {
        employeeCode: `EMP-ISO-${String(ts).slice(-6)}`,
        fullName: `Nhân viên Cô Lập ${ts}`,
        email: `iso-${ts}@miva.vn`,
        password: await bcrypt.hash(empPassword, 10),
        department: 'Bộ phận Điều phối & Liên kết Vendor',
        position: 'Chuyên viên',
        hireDate: new Date(),
        status: 'active',
        assignedOrderScope: 'all_orders', // Dù DB có all_orders vẫn phải bị cô lập nghiêm ngặt
      },
    });
    const otherEmpContext = await newPortalContext(browser, 'bell-other-emp');
    await authenticatePortalContext(otherEmpContext, 'employee', disposableOtherEmp.email, empPassword, ebase);
    const otherListRes = await checked(
      await otherEmpContext.request.get(`${ebase}/api/orders/admin/all?page=1&itemPerPage=50`, {
        headers: { 'x-app-role': 'employee' },
      }),
      200,
    );
    const otherOrders = otherListRes.list || [];
    assert.equal(
      otherOrders.some((o) => o.id === order.id),
      false,
      'Nhân viên không được phân công tuyệt đối không được thấy đơn hàng của người khác',
    );
    const forbiddenRes = await otherEmpContext.request.get(`${ebase}/api/orders/${order.id}`, {
      headers: { 'x-app-role': 'employee' },
    });
    assert.equal(forbiddenRes.status(), 403, 'Nhân viên khác xem chi tiết đơn phải bị trả về 403 Forbidden');
    await otherEmpContext.close();
    console.log('PASS [3/6]: Cô lập đơn hàng nhân viên nghiêm ngặt (không thấy trong danh sách & chặn 403 chi tiết)');

    // Mở sẵn trình duyệt Bưu tá tại /profile trước khi Vendor đóng gói
    const courierContext = await newPortalContext(browser, 'bell-courier-emp');
    const courierPage = await courierContext.newPage();
    watchErrors(courierPage, 'CourierEmployee');
    await loginEmployeeUI(courierPage, courierEmp.email, empPassword, ebase);
    await courierPage.goto(`${ebase}/profile`, { waitUntil: 'domcontentloaded' });

    // -------------------------------------------------------------------------
    // STEP 2: Nhân viên Điều phối duyệt đơn (pending -> confirmed) -> Chuông Client rung realtime
    // -------------------------------------------------------------------------
    await checked(
      await handlingContext.request.patch(`${ebase}/api/orders/${order.id}/status`, {
        headers: { 'x-app-role': 'employee' },
        data: { status: 'confirmed', note: 'Điều phối xác nhận đơn test' },
      }),
      200,
    );

    const clientConfirmNotif = await openBellAndWaitText(
      clientPage,
      'Thông báo',
      `Đơn hàng #${orderCode}: Đã xác nhận`,
    );
    await clientConfirmNotif.click();
    await clientPage.waitForURL(/\/orders/, { timeout: 10000 });
    console.log('PASS [4/6]: Chuông Client nhận realtime "Đã xác nhận" và click điều hướng sang /orders');

    // -------------------------------------------------------------------------
    // STEP 3: Vendor đóng gói (processing -> ready_for_pickup) -> Chuông Bưu tá rung realtime & click -> /shipping
    // -------------------------------------------------------------------------
    await checked(
      await vendorContext.request.patch(`${vbase}/api/orders/vendor-orders/${vendorOrder.id}/status`, {
        headers: { 'x-app-role': 'vendor' },
        data: { status: 'processing', note: 'Shop bắt đầu đóng gói' },
      }),
      200,
    );
    await checked(
      await vendorContext.request.patch(`${vbase}/api/orders/vendor-orders/${vendorOrder.id}/status`, {
        headers: { 'x-app-role': 'vendor' },
        data: { status: 'ready_for_pickup', note: 'Đã đóng gói xong, mời bưu tá tới lấy' },
      }),
      200,
    );

    const courierReadyNotif = await openBellAndWaitText(
      courierPage,
      'Thông báo Nội bộ',
      `sẵn sàng lấy hàng`,
    );
    await courierReadyNotif.click();
    await courierPage.waitForURL(/\/shipping/, { timeout: 10000 });
    console.log('PASS [5/6]: Chuông Bưu tá nhận realtime "sẵn sàng lấy hàng" và click điều hướng sang /shipping');

    // -------------------------------------------------------------------------
    // STEP 4: Bưu tá giao hàng thành công (out_for_delivery -> delivered) -> Chuông Client + Vendor + Điều phối & test nút "Mua lại"
    // -------------------------------------------------------------------------
    await checked(
      await courierContext.request.patch(`${ebase}/api/shipping/shipments/${shipment.id}/status`, {
        headers: { 'x-app-role': 'employee' },
        data: { status: 'out_for_delivery', description: 'Đang giao đến khách test' },
      }),
      200,
    );
    await checked(
      await courierContext.request.patch(`${ebase}/api/shipping/shipments/${shipment.id}/status`, {
        headers: { 'x-app-role': 'employee' },
        data: { status: 'delivered', description: 'Giao hàng thành công' },
      }),
      200,
    );

    // Xác minh chuông Client nhận "Giao hàng thành công"
    await openBellAndWaitText(clientPage, 'Thông báo', 'Giao hàng thành công');

    // Xác minh trên trang /orders của Client xuất hiện nút "Mua lại" và bấm vào chuyển sang /checkout
    await clientPage.goto(`${cbase}/orders`, { waitUntil: 'domcontentloaded' });
    const reorderBtn = clientPage.getByRole('button', { name: /Mua lại/i }).first();
    await reorderBtn.waitFor({ state: 'visible', timeout: 15000 });
    await reorderBtn.click();
    await clientPage.waitForURL(/\/checkout/, { timeout: 15000 });
    await clientPage.getByText(`${prefix} Áo Khoác Test`, { exact: false }).first().waitFor({ timeout: 15000 });
    console.log('PASS [6/6]: Bưu tá giao thành công -> Chuông Client rung & nút "Mua lại" nạp lại đúng sản phẩm ở /checkout');

    assert.deepEqual(pageErrors, [], `Phát hiện lỗi JS trên trình duyệt: ${pageErrors.join(' | ')}`);
    console.log('\n✅ HOÀN TẤT 6/6 KỊCH BẢN AUTOMATION TEST TRÌNH DUYỆT (0 LỖI JS)!\n');
  } finally {
    if (browser) await browser.close().catch(() => null);

    // Dọn sạch toàn bộ dữ liệu test tạm trong PostgreSQL
    if (createdOrderIds.length) {
      await prisma.notification
        .deleteMany({
          where: {
            OR: createdOrderIds.map((orderId) => ({
              data: { path: ['orderId'], equals: orderId },
            })),
          },
        })
        .catch(() => null);
    }
    if (client?.id) {
      await cleanupClientTree(prisma, [client.id]).catch(() => null);
    }
    if (product?.id) {
      await cleanupProductTree(prisma, [product.id]).catch(() => null);
    }
    if (category?.id) {
      await prisma.category.deleteMany({ where: { id: category.id } }).catch(() => null);
    }
    if (disposableOtherEmp?.id) {
      await prisma.employee.deleteMany({ where: { id: disposableOtherEmp.id } }).catch(() => null);
    }
    await prisma.$disconnect().catch(() => null);
  }
}

main().catch((err) => {
  console.error('\n❌ AUTOMATION TEST THẤT BẠI:', err);
  process.exit(1);
});
