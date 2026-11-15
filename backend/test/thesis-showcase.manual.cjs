// Kịch bản Trình Diễn Toàn Hệ Thống Chế Độ Bảo Vệ Đồ Án (MIVA Master Thesis Showcase — 8 Chương Liên Hoàn).
// Đi qua 100% giao diện thực tế của 4 Cổng & 5 Vai trò:
//   - Khách hàng (:5173) | Admin Sàn (:5174) | Người bán (:5175) | Nhân viên Điều phối & Bưu tá (:5176)
// Chạy lệnh trực quan mở trình duyệt + HUD thuyết minh + quay video .webm:
//   npm run test:doan

require('dotenv').config();
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const {
  launchBrowser,
  newPortalContext,
  loginAdminUI,
  loginVendorUI,
  loginClientUI,
  loginEmployeeUI,
  cleanupProductTree,
  cleanupClientTree,
} = require('./helpers/browser-helper.cjs');
const {
  resetEvidenceManifest,
  getThesisOutputDirs,
  installThesisOverlay,
  narrateStep,
  spotlightAndClick,
  spotlightAndFill,
  showSoftDeleteAuditBoard,
  captureEvidence,
} = require('./helpers/thesis-presenter.cjs');

async function main() {
  const prisma = new PrismaClient();
  resetEvidenceManifest();
  const { screenshotsDir, videosDir } = getThesisOutputDirs();

  const tag = String(Date.now()).slice(-5);
  const demoPass = 'Miva@DoAn2026!';
  const hashedPass = await bcrypt.hash(demoPass, 10);

  // Định danh nghiệp vụ tiếng Việt chuyên nghiệp phục vụ trình chiếu trước Hội đồng
  const storeName = `MIVA Atelier Bảo Ngọc #${tag}`;
  const vendorOwnerName = `Lê Hoàng Bảo Ngọc`;
  const vendorEmail = `atelier.baongoc.${tag}@miva-demo.vn`;

  const categoryName = `Bộ Sưu Tập Đồ Án #${tag}`;
  const productName = `Túi Da Thủ Công Emerald #${tag}`;
  const platformVoucherCode = `MIVASAN${tag}`;
  const shopVoucherCode = `SHOPVIP${tag}`;
  const surveyTitle = `Khảo sát Trải nghiệm Đồ án #${tag}`;

  const clientName = `Nguyễn Minh Khuê (${tag})`;
  const clientEmail = `khachhang.doan.${tag}@miva-demo.vn`;

  const dispatcherDept = `Điều phối Đơn hàng - Đồ Án ${tag}`;
  const dispatcherEmail = `dieuphoi.doan.${tag}@miva-demo.vn`;
  const carrierDept = `Vận chuyển Nội bộ - Đồ Án ${tag}`;
  const carrierEmail = `buuta.doan.${tag}@miva-demo.vn`;

  // Theo dõi ID sinh ra để dọn sạch an toàn 100% trong khối finally
  const createdVendorIds = [];
  const createdEmployeeIds = [];
  const createdClientIds = [];
  const createdCategoryIds = [];
  const createdProductIds = [];
  const createdVoucherIds = [];
  const createdSurveyIds = [];
  let payrollSnapshotBefore = [];
  let payrollMonth = new Date().getMonth() + 1;
  let payrollYear = new Date().getFullYear();

  const openContexts = [];
  const browserErrors = [];
  let browser;

  async function expectJson(res, expectedStatus = 200) {
    const text = await res.text();
    const methodLabel = typeof res.request === 'function' ? res.request().method() : 'API';
    assert.equal(
      res.status(),
      expectedStatus,
      `HTTP ${methodLabel} ${new URL(res.url()).pathname} trả về ${res.status()}: ${text.slice(0, 400)}`,
    );
    const parsed = text ? JSON.parse(text) : {};
    return parsed.data ?? parsed;
  }

  async function createTrackedContext(roleSlug) {
    const ctx = await newPortalContext(browser, roleSlug, {
      viewport: { width: 1440, height: 900 },
      timezoneId: 'Asia/Bangkok',
    });
    await installThesisOverlay(ctx);
    openContexts.push(ctx);
    return ctx;
  }

  function attachErrorMonitor(page, label) {
    page.on('pageerror', (err) => {
      browserErrors.push(`[${label}] ${err.message}`);
    });
  }

  try {
    // Tự động thu hồi các bản ghi mồ côi nếu lần chạy trước bị ngắt ngang (Ctrl+C)
    const [staleVendors, staleEmployees, staleClients, staleCategories, stalePlatVouchers] =
      await Promise.all([
        prisma.vendor.findMany({ where: { email: { endsWith: '@miva-demo.vn' } }, select: { id: true } }),
        prisma.employee.findMany({ where: { email: { endsWith: '@miva-demo.vn' } }, select: { id: true } }),
        prisma.client.findMany({ where: { email: { endsWith: '@miva-demo.vn' } }, select: { id: true } }),
        prisma.category.findMany({ where: { name: { startsWith: 'Bộ Sưu Tập Đồ Án #' } }, select: { id: true } }),
        prisma.voucher.findMany({ where: { code: { startsWith: 'MIVASAN' } }, select: { id: true } }),
      ]);
    const staleVIds = staleVendors.map((v) => v.id);
    if (staleVIds.length > 0) {
      const [staleSurveys, staleShopVouchers, staleProducts] = await Promise.all([
        prisma.survey.findMany({ where: { vendorId: { in: staleVIds } }, select: { id: true } }),
        prisma.voucher.findMany({ where: { vendorId: { in: staleVIds } }, select: { id: true } }),
        prisma.product.findMany({ where: { vendorId: { in: staleVIds } }, select: { id: true } }),
      ]);
      createdSurveyIds.push(...staleSurveys.map((s) => s.id));
      createdVoucherIds.push(...staleShopVouchers.map((v) => v.id));
      createdProductIds.push(...staleProducts.map((p) => p.id));
    }
    createdVendorIds.push(...staleVIds);
    createdEmployeeIds.push(...staleEmployees.map((e) => e.id));
    createdClientIds.push(...staleClients.map((c) => c.id));
    createdCategoryIds.push(...staleCategories.map((c) => c.id));
    createdVoucherIds.push(...stalePlatVouchers.map((v) => v.id));

    // Khởi tạo sẵn tài khoản Khách hàng (có địa chỉ giao mặc định) + 2 Nhân sự nội bộ (Điều phối & Bưu tá)
    const now = new Date();
    const shiftStartStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const client = await prisma.client.create({
      data: {
        fullName: clientName,
        email: clientEmail,
        phone: '0909888777',
        password: hashedPass,
        addresses: {
          create: {
            receiverName: clientName,
            phone: '0909888777',
            addressLine: '268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh',
            isDefault: true,
          },
        },
      },
    });
    createdClientIds.push(client.id);

    const dispatcherEmp = await prisma.employee.create({
      data: {
        employeeCode: `NV-DP-${tag}`,
        fullName: `Trần Quốc Bảo (Điều phối #${tag})`,
        email: dispatcherEmail,
        password: hashedPass,
        phone: '0911222333',
        department: dispatcherDept,
        position: 'Chuyên viên Điều phối Đơn hàng',
        employmentType: 'full_time',
        salary: 14000000,
        hireDate: new Date('2025-01-15'),
        status: 'active',
        assignedOrderScope: 'all_orders',
        permissions: {
          assignedOrderScope: 'all_orders',
          schedule: {
            shiftName: 'Ca Trực Điều Phối Đồ Án',
            shiftStart: shiftStartStr,
            shiftEnd: '23:59',
            shiftHours: 8,
          },
        },
      },
    });
    createdEmployeeIds.push(dispatcherEmp.id);

    const carrierEmp = await prisma.employee.create({
      data: {
        employeeCode: `NV-VC-${tag}`,
        fullName: `Phạm Gia Huy (Bưu tá #${tag})`,
        email: carrierEmail,
        password: hashedPass,
        phone: '0933444555',
        department: carrierDept,
        position: 'Nhân viên Giao nhận MIVA Express',
        employmentType: 'full_time',
        salary: 12000000,
        hireDate: new Date('2025-02-01'),
        status: 'active',
        assignedOrderScope: 'assigned_orders',
        permissions: {
          assignedOrderScope: 'assigned_orders',
        },
      },
    });
    createdEmployeeIds.push(carrierEmp.id);

    browser = await launchBrowser();

    const adminCtx = await createTrackedContext('01-admin-portal');
    const vendorCtx = await createTrackedContext('02-vendor-portal');
    const clientCtx = await createTrackedContext('03-customer-storefront');
    const dispatcherCtx = await createTrackedContext('04-employee-dispatcher');
    const carrierCtx = await createTrackedContext('05-employee-carrier');

    const adminPage = await adminCtx.newPage();
    const vendorPage = await vendorCtx.newPage();
    const clientPage = await clientCtx.newPage();
    const dispatcherPage = await dispatcherCtx.newPage();
    const carrierPage = await carrierCtx.newPage();

    attachErrorMonitor(adminPage, 'Admin :5174');
    attachErrorMonitor(vendorPage, 'Vendor :5175');
    attachErrorMonitor(clientPage, 'Customer :5173');
    attachErrorMonitor(dispatcherPage, 'Dispatcher :5176');
    attachErrorMonitor(carrierPage, 'Carrier :5176');

    adminPage.on('dialog', (dialog) => dialog.accept());
    vendorPage.on('dialog', (dialog) => dialog.accept());
    clientPage.on('dialog', (dialog) => dialog.accept());
    dispatcherPage.on('dialog', (dialog) => dialog.accept());
    carrierPage.on('dialog', (dialog) => dialog.accept());

    // =========================================================================
    // CHƯƠNG 1: TUYỂN SINH ĐỐI TÁC 2 BƯỚC & PHÊ DUYỆT HỒ SƠ GIAN HÀNG
    // =========================================================================
    await vendorPage.goto('http://localhost:5175/register', { waitUntil: 'domcontentloaded' });
    await narrateStep(vendorPage, {
      chapter: 1,
      portal: 'NGƯỜI BÁN :5175',
      title: 'Chương 1 — Đăng ký Hồ sơ Đối tác Bán hàng (Bước 1/2)',
      detail: `Điền thông tin người đại diện "${vendorOwnerName}" cho gian hàng mới trên sàn MIVA.`,
    });

    await spotlightAndFill(
      vendorPage.getByPlaceholder('Ví dụ: Nguyễn Văn An'),
      vendorOwnerName,
      'Họ tên chủ gian hàng',
    );
    await spotlightAndFill(
      vendorPage.getByPlaceholder('Ví dụ: 0912345678'),
      '0988777666',
      'Số điện thoại liên hệ',
    );
    await spotlightAndFill(
      vendorPage.getByPlaceholder('vendor@store.com'),
      vendorEmail,
      'Email đăng nhập Vendor',
    );
    await spotlightAndFill(
      vendorPage.getByPlaceholder('Tối thiểu 6 ký tự'),
      demoPass,
      'Mật khẩu bảo mật',
    );
    await spotlightAndClick(
      vendorPage.getByRole('button', { name: 'Tiếp tục: Đăng ký kinh doanh' }),
      'Chuyển sang Bước 2',
    );

    await narrateStep(vendorPage, {
      chapter: 1,
      portal: 'NGƯỜI BÁN :5175',
      title: 'Chương 1 — Khai báo Pháp lý Gian hàng & Gửi Hồ sơ (Bước 2/2)',
      detail: `Đăng ký thương hiệu "${storeName}", mã số thuế & địa chỉ kho xuất hàng.`,
    });

    await spotlightAndFill(
      vendorPage.getByPlaceholder('Ví dụ: Cửa Hàng Thời Trang An Phát'),
      storeName,
      'Tên gian hàng thương mại',
    );
    await spotlightAndFill(
      vendorPage.getByPlaceholder('Ví dụ: 0101234567 hoặc 0312345678'),
      `03188${tag}`,
      'Mã số thuế doanh nghiệp',
    );
    await spotlightAndFill(
      vendorPage.getByPlaceholder('Số nhà, tên đường, phường/xã, quận/huyện...'),
      '88 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      'Địa chỉ kho lấy hàng',
    );
    await vendorPage.locator('input[type="checkbox"]').check();

    const vendorSignupWait = vendorPage.waitForResponse(
      (res) =>
        res.request().method() === 'POST' && new URL(res.url()).pathname === '/api/auth/sign-up/vendor',
    );
    await spotlightAndClick(
      vendorPage.getByRole('button', { name: 'Hoàn tất Đăng ký kinh doanh', exact: true }),
      'Gửi hồ sơ đăng ký',
    );
    const vendorSignupData = await expectJson(await vendorSignupWait, 201);
    const newVendor = vendorSignupData.user ?? vendorSignupData;
    assert.ok(newVendor?.id, 'Vendor mới phải có ID hợp lệ');
    createdVendorIds.push(newVendor.id);

    await vendorPage.waitForURL('http://localhost:5175/login', { waitUntil: 'commit' });
    await narrateStep(vendorPage, {
      chapter: 1,
      portal: 'NGƯỜI BÁN :5175',
      title: 'Kiểm chứng Cổng Chặn Bảo mật RBAC Khi Chưa Phê Duyệt',
      detail: 'Gian hàng mới chưa được Admin duyệt phải bị chặn đăng nhập (HTTP 403) kèm thông báo rõ ràng.',
    });

    await spotlightAndFill(vendorPage.locator('input[type="password"]'), demoPass, 'Thử đăng nhập ngay');
    const blockedSignInWait = vendorPage.waitForResponse(
      (res) => res.request().method() === 'POST' && res.url().includes('/api/auth/sign-in'),
    );
    await spotlightAndClick(vendorPage.locator('button[type="submit"]'), 'Kiểm tra chặn chờ duyệt');
    assert.equal((await blockedSignInWait).status(), 403, 'Vendor chờ duyệt phải bị chặn 403');
    await vendorPage.getByText('Tài khoản đang chờ admin duyệt', { exact: false }).first().waitFor();

    // Admin đăng nhập & phê duyệt hồ sơ đối tác
    await loginAdminUI(adminPage);
    await adminPage.goto('http://localhost:5174/vendors?tab=registrations', {
      waitUntil: 'domcontentloaded',
    });
    await narrateStep(adminPage, {
      chapter: 1,
      portal: 'ADMIN SÀN :5174',
      title: 'Admin Sàn Thẩm định & Phê duyệt Hồ sơ Đối tác (Gói 1 Năm • Hoa hồng 8%)',
      detail: `Ban Quản Trị mở danh sách chờ duyệt, kích hoạt gian hàng "${storeName}".`,
    });

    const regSearchInput = adminPage.locator('input[placeholder*="Tìm"]').first();
    if (await regSearchInput.isVisible().catch(() => false)) {
      await spotlightAndFill(regSearchInput, storeName, 'Tìm hồ sơ gian hàng mới');
    }
    const vendorRegRow = adminPage.locator('tr').filter({ hasText: storeName }).first();
    await vendorRegRow.waitFor({ timeout: 15000 });
    await spotlightAndClick(
      vendorRegRow.locator('button[title="Phê duyệt hồ sơ / gia hạn"]'),
      'Mở hộp thoại Phê duyệt',
    );

    const approveApiWait = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/api/vendors/admin/registrations/${newVendor.id}/approve`),
    );
    await captureEvidence(
      adminPage,
      'ch01-admin-duyet-gian-hang',
      `Chương 1: Admin phê duyệt hồ sơ đối tác "${storeName}" (Gói 1 Năm, chiết khấu 8%)`,
      1,
    );
    await spotlightAndClick(
      adminPage.getByRole('button', { name: 'Xác nhận Phê duyệt & Kích hoạt', exact: true }),
      'Xác nhận kích hoạt đối tác',
    );
    await expectJson(await approveApiWait, 200);

    // Vendor đăng nhập lại thành công vào Dashboard
    await narrateStep(vendorPage, {
      chapter: 1,
      portal: 'NGƯỜI BÁN :5175',
      title: 'Hoàn tất Chương 1 — Gian hàng Đăng nhập Thành công vào Kênh Người Bán',
      detail: 'Sau khi Admin phê duyệt, đối tác đăng nhập thẳng vào Dashboard quản trị gian hàng.',
      status: 'pass',
    });
    await loginVendorUI(vendorPage, vendorEmail, demoPass, 'http://localhost:5175');
    await vendorPage
      .getByRole('heading', { name: /Tổng quan & Phân tích Doanh thu/i })
      .first()
      .waitFor();

    // =========================================================================
    // CHƯƠNG 2: DANH MỤC REALTIME, SẢN PHẨM ĐA BIẾN THỂ, VOUCHER KÉP & KHẢO SÁT
    // =========================================================================
    await clientPage.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await clientPage.getByRole('heading', { level: 3 }).first().waitFor({ timeout: 15000 });
    let homeReloadCount = 0;
    clientPage.on('framenavigated', (frame) => {
      if (frame === clientPage.mainFrame()) homeReloadCount++;
    });

    await adminPage.goto('http://localhost:5174/catalog?tab=categories', {
      waitUntil: 'domcontentloaded',
    });
    await narrateStep(adminPage, {
      chapter: 2,
      portal: 'ADMIN SÀN :5174',
      title: 'Chương 2 — Admin Tạo Danh mục Ngành hàng & Phát sóng Realtime (Socket.IO)',
      detail: `Tạo danh mục "${categoryName}" tại Admin -> Trang chủ Khách hàng tự cập nhật không cần F5.`,
    });

    await spotlightAndClick(adminPage.getByRole('button', { name: 'Thêm danh mục' }), 'Thêm danh mục');
    await spotlightAndFill(adminPage.getByPlaceholder('VD: Sneakers'), categoryName, 'Tên danh mục mới');
    const createCatWait = adminPage.waitForResponse(
      (res) => res.request().method() === 'POST' && new URL(res.url()).pathname === '/api/categories',
    );
    await spotlightAndClick(adminPage.getByRole('button', { name: 'Lưu danh mục' }), 'Lưu danh mục');
    const createdCat = await expectJson(await createCatWait, 201);
    createdCategoryIds.push(createdCat.id);

    await narrateStep(clientPage, {
      chapter: 2,
      portal: 'KHÁCH HÀNG :5173',
      title: 'Kiểm chứng Trang chủ Khách hàng Tự hiện Danh mục Mới qua WebSocket',
      detail: `Danh mục "${categoryName}" xuất hiện tức thì trên Storefront với số lần tải lại trang = 0.`,
    });
    await clientPage.getByRole('heading', { name: categoryName, exact: true }).waitFor({
      state: 'visible',
      timeout: 15000,
    });
    assert.equal(homeReloadCount, 0, 'Trang chủ không được reload khi đồng bộ danh mục realtime');

    // Admin tạo Voucher Toàn Sàn -10%
    await adminPage.goto('http://localhost:5174/catalog?tab=vouchers', {
      waitUntil: 'domcontentloaded',
    });
    await narrateStep(adminPage, {
      chapter: 2,
      portal: 'ADMIN SÀN :5174',
      title: 'Admin Phát hành Mã Giảm Giá Toàn Sàn (-10%)',
      detail: `Tạo mã "${platformVoucherCode}" giảm 10% áp dụng toàn sàn để cộng dồn với Voucher Gian hàng.`,
    });
    await spotlightAndClick(
      adminPage.getByRole('button', { name: 'Thêm Voucher', exact: true }),
      'Mở form Voucher Sàn',
    );
    await spotlightAndFill(
      adminPage.getByRole('textbox', { name: 'Voucher Code', exact: true }),
      platformVoucherCode,
      'Mã Voucher Sàn',
    );
    await spotlightAndFill(
      adminPage.getByRole('textbox', { name: 'Voucher Name', exact: true }),
      `Ưu đãi Sàn MIVA Đồ Án -10% (${tag})`,
      'Tên chương trình',
    );
    await adminPage.getByRole('combobox', { name: 'Discount Type', exact: true }).selectOption('percentage');
    await spotlightAndFill(
      adminPage.getByRole('spinbutton', { name: 'Discount Value', exact: true }),
      '10',
      'Giảm 10%',
    );
    await adminPage.getByRole('spinbutton', { name: 'Quantity Limit', exact: true }).fill('50');
    await adminPage.getByLabel('Start Date', { exact: true }).fill('2025-01-01');
    await adminPage.getByLabel('End Date', { exact: true }).fill('2030-12-31');
    const createPlatVoucherWait = adminPage.waitForResponse(
      (res) => res.request().method() === 'POST' && new URL(res.url()).pathname === '/api/vouchers',
    );
    await spotlightAndClick(
      adminPage.getByRole('button', { name: 'Lưu Voucher', exact: true }),
      'Phát hành Voucher Sàn',
    );
    const createdPlatVoucher = await expectJson(await createPlatVoucherWait, 201);
    createdVoucherIds.push(createdPlatVoucher.id);

    // Vendor tạo Sản phẩm đa biến thể trên UI
    await vendorPage.goto('http://localhost:5175/products', { waitUntil: 'domcontentloaded' });
    await narrateStep(vendorPage, {
      chapter: 2,
      portal: 'NGƯỜI BÁN :5175',
      title: 'Gian hàng Đăng bán Sản phẩm Đa Biến thể (2 Màu • Nhiều Size)',
      detail: `Tạo "${productName}" thuộc "${categoryName}" với giá niêm yết 100.000 ₫ (Size M).`,
    });

    await spotlightAndClick(
      vendorPage.getByRole('button', { name: 'Thêm sản phẩm' }),
      'Mở form Thêm sản phẩm',
    );
    await spotlightAndFill(
      vendorPage.getByPlaceholder('Ví dụ: Áo thun Cotton cao cấp'),
      productName,
      'Tên sản phẩm',
    );
    await vendorPage
      .locator('select')
      .filter({ has: vendorPage.locator('option', { hasText: 'Chọn danh mục' }) })
      .first()
      .selectOption(createdCat.id);
    await vendorPage
      .getByPlaceholder('Nhập thông tin chất liệu, kiểu dáng, hướng dẫn bảo quản...')
      .fill('Chế tác thủ công từ da thật cao cấp phối khóa mạ vàng Champagne chuẩn MIVA.');

    // Màu 1: Xanh Rừng MIVA (Size M, 100.000đ, tồn kho 20)
    await spotlightAndClick(
      vendorPage.getByRole('button', { name: 'Thêm màu sắc' }),
      'Thêm phân loại Màu #1',
    );
    await spotlightAndFill(
      vendorPage.getByPlaceholder('Ví dụ: Đen, Trắng, Xanh Navy...'),
      'Xanh Rừng MIVA',
      'Tên màu #1',
    );
    await vendorPage
      .getByPlaceholder('Hoặc dán đường dẫn ảnh trực tiếp (https://...)')
      .fill('https://placehold.co/600x600/1A3A2C/DEC47E.png?text=MIVA+Emerald+Bag');
    await vendorPage.getByRole('button', { name: 'Thêm URL' }).click();
    await spotlightAndClick(
      vendorPage.getByRole('button', { name: 'Thêm kích cỡ' }),
      'Thêm kích cỡ Size M',
    );
    await vendorPage.getByPlaceholder('VD: M, L, XL...').first().fill('M');
    const numberInputsColor1 = vendorPage.locator('input[type="number"]');
    await spotlightAndFill(numberInputsColor1.nth(0), '100000', 'Giá bán 100.000 ₫');
    await spotlightAndFill(numberInputsColor1.nth(1), '20', 'Tồn kho 20 SP');

    // Màu 2: Vàng Champagne (Size L, 120.000đ, tồn kho 15) — dùng kiểm chứng xóa mềm biến thể ở Chương 8
    await spotlightAndClick(
      vendorPage.getByRole('button', { name: 'Thêm màu sắc' }),
      'Thêm phân loại Màu #2',
    );
    await spotlightAndFill(
      vendorPage.getByPlaceholder('Ví dụ: Đen, Trắng, Xanh Navy...'),
      'Vàng Champagne',
      'Tên màu #2',
    );
    await spotlightAndClick(
      vendorPage.getByRole('button', { name: 'Thêm kích cỡ' }),
      'Thêm kích cỡ Size L',
    );
    await vendorPage.getByPlaceholder('VD: M, L, XL...').first().fill('L');
    const numberInputsColor2 = vendorPage.locator('input[type="number"]');
    await numberInputsColor2.nth(0).fill('120000');
    await numberInputsColor2.nth(1).fill('15');

    const createProdWait = vendorPage.waitForResponse(
      (res) => res.request().method() === 'POST' && new URL(res.url()).pathname === '/api/products',
    );
    await spotlightAndClick(
      vendorPage.getByRole('button', { name: 'Lưu sản phẩm', exact: true }),
      'Lưu sản phẩm lên sàn',
    );
    const createdProduct = await expectJson(await createProdWait, 201);
    createdProductIds.push(createdProduct.id);

    // Vendor tạo Voucher Gian hàng -20% và kiểm chứng khung xem trước 80.000 ₫
    await vendorPage.goto('http://localhost:5175/vouchers', { waitUntil: 'domcontentloaded' });
    await narrateStep(vendorPage, {
      chapter: 2,
      portal: 'NGƯỜI BÁN :5175',
      title: 'Gian hàng Tạo Mã Giảm Giá Shop (-20%) & Xem trước Giá Sau Giảm',
      detail: `Mã "${shopVoucherCode}" giảm 20% trên giá gốc 100.000 ₫ -> khung Preview báo 80.000 ₫ tức thì.`,
    });

    await spotlightAndClick(
      vendorPage.getByRole('button', { name: 'Tạo Voucher mới', exact: true }),
      'Tạo Voucher Shop',
    );
    await spotlightAndFill(
      vendorPage.getByRole('textbox', { name: 'Voucher Code', exact: true }),
      shopVoucherCode,
      'Mã Voucher Shop',
    );
    await spotlightAndFill(
      vendorPage.getByRole('textbox', { name: 'Voucher Name', exact: true }),
      `Ưu đãi Gian hàng Bảo Ngọc -20% (${tag})`,
      'Tên Voucher Shop',
    );
    await spotlightAndFill(
      vendorPage.getByRole('spinbutton', { name: 'Discount Value', exact: true }),
      '20',
      'Giảm 20%',
    );
    await vendorPage.getByRole('spinbutton', { name: 'Quantity Limit', exact: true }).fill('50');
    await vendorPage.getByLabel('Start Date', { exact: true }).fill('2025-01-01');
    await vendorPage.getByLabel('End Date', { exact: true }).fill('2030-12-31');
    await vendorPage.getByRole('checkbox', { name: productName, exact: true }).check();
    await vendorPage
      .getByRole('region', { name: 'Giá sau giảm dự kiến', exact: true })
      .getByText('80.000 ₫', { exact: true })
      .waitFor();

    await captureEvidence(
      vendorPage,
      'ch02-vendor-preview-voucher-80k',
      `Chương 2: Khung xem trước Voucher Gian hàng -20% tính chuẩn giá dự kiến 80.000 ₫`,
      2,
    );

    const createShopVoucherWait = vendorPage.waitForResponse(
      (res) => res.request().method() === 'POST' && new URL(res.url()).pathname === '/api/vouchers',
    );
    await spotlightAndClick(
      vendorPage.getByRole('button', { name: 'Lưu Voucher', exact: true }),
      'Phát hành Voucher Shop',
    );
    const createdShopVoucher = await expectJson(await createShopVoucherWait, 201);
    createdVoucherIds.push(createdShopVoucher.id);

    // Vendor tạo & kích hoạt Khảo sát tự động sau Đặt hàng (after_checkout)
    await vendorPage.goto('http://localhost:5175/surveys', { waitUntil: 'domcontentloaded' });
    await narrateStep(vendorPage, {
      chapter: 2,
      portal: 'NGƯỜI BÁN :5175',
      title: 'Hoàn tất Chương 2 — Kích hoạt Khảo sát Tự động Gửi Sau Đặt hàng',
      detail: `Tạo "${surveyTitle}" với cơ chế tự động gửi phiếu tới hộp thư khách ngay sau Checkout.`,
      status: 'pass',
    });

    await spotlightAndClick(
      vendorPage.getByRole('button', { name: '+ Tạo khảo sát khách hàng' }),
      'Tạo khảo sát hậu mãi',
    );
    const surveyTitleInput = vendorPage.getByPlaceholder(
      'Nhập tiêu đề hoặc chọn từ danh sách chủ đề trên...',
    );
    await surveyTitleInput.waitFor();
    // Chờ bộ câu hỏi mẫu từ API được nạp vào biểu mẫu
    await vendorPage.waitForFunction(
      () => document.querySelectorAll('input[type="radio"][name="audienceType"]').length >= 2,
    );
    await spotlightAndFill(surveyTitleInput, surveyTitle, 'Tiêu đề khảo sát');
    await vendorPage.locator('input[type="radio"][value="vendor_buyers"]').check();
    await vendorPage
      .locator('select')
      .filter({ has: vendorPage.locator('option[value="after_checkout"]') })
      .first()
      .selectOption('after_checkout');

    const createSurveyWait = vendorPage.waitForResponse(
      (res) => res.request().method() === 'POST' && new URL(res.url()).pathname === '/api/surveys',
    );
    const activateSurveyWait = vendorPage.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        /\/api\/surveys\/[^/]+\/status$/.test(new URL(res.url()).pathname),
    );
    await spotlightAndClick(
      vendorPage.getByRole('button', { name: 'Kích hoạt & Gửi thông báo ngay' }),
      'Kích hoạt khảo sát ngay',
    );
    const createdSurvey = await expectJson(await createSurveyWait, 201);
    await expectJson(await activateSurveyWait, 200);
    createdSurveyIds.push(createdSurvey.id);

    // =========================================================================
    // CHƯƠNG 3: MUA SẮM, ĐỔI SÁNG/TỐI, THẢ TIM & CÔNG THỨC GỘP VOUCHER KÉP
    // =========================================================================
    await narrateStep(clientPage, {
      chapter: 3,
      portal: 'KHÁCH HÀNG :5173',
      title: 'Chương 3 — Khách hàng Đăng nhập & Trải nghiệm Giao diện Sáng/Tối Đồng bộ',
      detail: `Khách hàng "${clientName}" đăng nhập Storefront, kiểm tra chuyển đổi Dark/Light Mode mượt mà.`,
    });
    await loginClientUI(clientPage, clientEmail, demoPass, 'http://localhost:5173');

    const themeBtn = clientPage.locator('button[aria-label*="chế độ"]').first();
    await spotlightAndClick(themeBtn, 'Chuyển sang Giao diện Tối');
    await spotlightAndClick(themeBtn, 'Chuyển về Giao diện Sáng');

    await clientPage.goto(`http://localhost:5173/products/${createdProduct.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await clientPage.getByRole('heading', { name: productName }).waitFor();

    await narrateStep(clientPage, {
      chapter: 3,
      portal: 'KHÁCH HÀNG :5173',
      title: 'Xem Chi tiết Sản phẩm — Giá Gộp Voucher, Thả tim & Chọn Số lượng 2',
      detail:
        'Hiển thị đồng bộ tông màu Xanh Rừng & Vàng Champagne, giá dự kiến sau gộp 2 tầng Voucher (72.000 ₫/SP).',
    });

    await clientPage.getByRole('region', { name: 'Giá sau giảm', exact: true }).waitFor();
    // Bấm nút Yêu thích sản phẩm (cạnh nút Mua Với Voucher)
    const favWait = clientPage.waitForResponse(
      (res) => res.request().method() === 'POST' && res.url().includes('/favorite'),
    );
    await spotlightAndClick(
      clientPage.getByRole('button', { name: 'Yêu thích', exact: true }),
      'Thêm vào Yêu thích',
    );
    await favWait;

    // Tăng số lượng lên 2 sản phẩm (2 x 100.000 = 200.000 ₫)
    await spotlightAndClick(
      clientPage.locator('button[aria-label="Tăng số lượng"]'),
      'Chọn số lượng = 2',
    );
    const addCartWait = clientPage.waitForResponse(
      (res) => res.request().method() === 'POST' && res.url().includes('/api/cart'),
    );
    await spotlightAndClick(
      clientPage.getByRole('button', { name: /Thêm Vào Giỏ Hàng/i }),
      'Thêm 2 SP vào Giỏ hàng',
    );
    await addCartWait;

    await clientPage.goto('http://localhost:5173/cart', { waitUntil: 'domcontentloaded' });
    await narrateStep(clientPage, {
      chapter: 3,
      portal: 'KHÁCH HÀNG :5173',
      title: 'Kiểm chứng Công thức Cộng dồn Voucher Kép: 200.000 ₫ → 160.000 ₫ → 144.000 ₫',
      detail: `Áp mã Shop "${shopVoucherCode}" (-20% = -40k) còn 160.000 ₫, tiếp tục áp mã Sàn "${platformVoucherCode}" (-10% = -16k) còn đúng 144.000 ₫!`,
    });

    await spotlightAndClick(
      clientPage.getByRole('button', { name: `Dùng mã ${shopVoucherCode}`, exact: true }),
      `Áp mã Shop (-40.000 ₫)`,
    );
    await clientPage.getByTestId('cart-total').filter({ hasText: /160\.000/ }).waitFor();

    await spotlightAndClick(
      clientPage.getByRole('button', { name: `Dùng mã ${platformVoucherCode}`, exact: true }),
      `Áp mã Sàn (-16.000 ₫)`,
    );
    await clientPage.getByTestId('cart-total').filter({ hasText: /144\.000/ }).waitFor();

    await captureEvidence(
      clientPage,
      'ch03-gio-hang-gop-voucher-144k',
      `Chương 3: Giỏ hàng cộng dồn chuẩn xác Voucher Shop (-20%) + Voucher Sàn (-10%): 200.000 ₫ -> 160.000 ₫ -> 144.000 ₫`,
      3,
    );

    await spotlightAndClick(
      clientPage.getByRole('button', { name: 'Mua hàng (1)', exact: true }),
      'Tiến hành Thanh toán',
    );
    await clientPage.waitForURL('http://localhost:5173/checkout', { waitUntil: 'commit' });
    await clientPage.getByTestId('checkout-total').filter({ hasText: /144\.000/ }).waitFor();

    await narrateStep(clientPage, {
      chapter: 3,
      portal: 'KHÁCH HÀNG :5173',
      title: 'Hoàn tất Chương 3 — Đặt hàng COD & Khấu trừ Tồn kho Tức thì',
      detail: 'Xác nhận đặt đơn hàng 144.000 ₫, tự động tách kiện VendorOrder & tạo vận đơn Shipment.',
      status: 'pass',
    });

    const checkoutWait = clientPage.waitForResponse(
      (res) => res.request().method() === 'POST' && new URL(res.url()).pathname === '/api/orders/checkout',
    );
    await spotlightAndClick(
      clientPage.getByRole('button', { name: 'Xác nhận đặt 1 đơn hàng', exact: true }),
      'Xác nhận Đặt hàng',
    );
    await expectJson(await checkoutWait, 201);
    await clientPage.waitForURL('http://localhost:5173/orders', { waitUntil: 'commit' });

    const order = await prisma.order.findFirstOrThrow({
      where: { clientId: client.id },
      include: { details: true, vendorOrders: true, shipments: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
    assert.equal(Number(order.totalAmount), 144000, 'Tổng thanh toán đơn hàng phải đúng 144.000 ₫');
    const vendorOrder = order.vendorOrders[0];
    const shipment = order.shipments[0];
    assert.ok(vendorOrder && shipment, 'Phải tự động sinh VendorOrder và Shipment');
    const shortOrderCode = String(order.orderCode).slice(-6);

    // =========================================================================
    // CHƯƠNG 4: CỔNG NHÂN VIÊN ĐIỀU PHỐI (:5176/orders) — DUYỆT ĐƠN, SLA & NHẬT KÝ
    // =========================================================================
    await narrateStep(dispatcherPage, {
      chapter: 4,
      portal: 'NHÂN VIÊN MIVA :5176',
      title: 'Chương 4 — Nhân viên Điều phối Đăng nhập Cổng Nội bộ (:5176)',
      detail: `Chuyên viên "${dispatcherEmp.fullName}" đăng nhập qua giao diện Cổng Nhân Viên MIVA.`,
    });
    await loginEmployeeUI(dispatcherPage, dispatcherEmail, demoPass, 'http://localhost:5176');
    await dispatcherPage
      .getByRole('heading', { name: /Điều Phối & Giám Sát Đơn Hàng/i })
      .first()
      .waitFor();

    const empSearchInput = dispatcherPage.locator('input[placeholder*="Tìm"]').first();
    if (await empSearchInput.isVisible().catch(() => false)) {
      await spotlightAndFill(empSearchInput, order.orderCode, `Tra cứu mã đơn #${shortOrderCode}`);
      await dispatcherPage.waitForTimeout(350);
    }

    const empOrderRow = dispatcherPage.locator('tr').filter({ hasText: clientName }).first();
    await empOrderRow.waitFor({ timeout: 15000 });

    await narrateStep(dispatcherPage, {
      chapter: 4,
      portal: 'NHÂN VIÊN MIVA :5176',
      title: `Điều phối viên Kiểm duyệt & Xác nhận Đơn hàng #${shortOrderCode}`,
      detail: 'Kiểm tra tồn kho + thông tin người nhận hợp lệ, bấm duyệt chuyển đơn sang Gian hàng đóng gói.',
    });

    await spotlightAndClick(
      empOrderRow.locator('button[title="Duyệt đơn hàng hợp lệ"]'),
      'Mở hộp thoại Duyệt đơn',
    );
    const confirmOrderWait = dispatcherPage.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/api/orders/${order.id}/status`),
    );
    await captureEvidence(
      dispatcherPage,
      'ch04-nhan-vien-dieu-phoi-duyet-don',
      `Chương 4: Nhân viên Điều phối (:5176) kiểm tra danh mục an toàn và xác nhận đơn hàng #${shortOrderCode}`,
      4,
    );
    await spotlightAndClick(
      dispatcherPage.getByRole('button', { name: 'Xác nhận đơn ngay', exact: true }),
      'Xác nhận đơn hợp lệ',
    );
    await expectJson(await confirmOrderWait, 200);

    // Chuyển qua xem tab Theo dõi SLA Vendor & Nhật ký thao tác
    await spotlightAndClick(
      dispatcherPage.getByRole('button', { name: /Theo dõi SLA Vendor/i }),
      'Kiểm tra bảng Giám sát SLA >6h',
    );
    await spotlightAndClick(
      dispatcherPage.getByRole('button', { name: /Nhật ký thao tác/i }),
      'Xem Nhật ký Kiểm toán (Audit Trail)',
    );

    // Admin phân công vận đơn cho Nhân viên Bưu tá nội bộ để sẵn sàng lấy & giao hàng
    const assignShipmentRes = await adminCtx.request.patch(
      `http://localhost:5174/api/shipping/shipments/${shipment.id}/assign`,
      {
        headers: { 'x-app-role': 'admin' },
        data: { carrierId: carrierEmp.id },
      },
    );
    await expectJson(assignShipmentRes, 200);

    await narrateStep(dispatcherPage, {
      chapter: 4,
      portal: 'NHÂN VIÊN MIVA :5176',
      title: 'Hoàn tất Chương 4 — Đã Lưu Nhật ký Kiểm toán & Phân công Bưu tá MIVA Express',
      detail: `Vận đơn ${shipment.trackingNumber} đã được gán cho bưu tá "${carrierEmp.fullName}".`,
      status: 'pass',
    });

    // =========================================================================
    // CHƯƠNG 5: KÊNH NGƯỜI BÁN (:5175/orders) — ĐÓNG GÓI & BÀN GIAO BƯU TÁ
    // =========================================================================
    // Giữ thêm 1 tab Dashboard của Vendor để lát nữa kiểm chứng Doanh thu nhảy 0 ₫ -> 144.000 ₫ realtime
    const vendorDashboardPage = await vendorCtx.newPage();
    attachErrorMonitor(vendorDashboardPage, 'Vendor Dashboard :5175');
    await vendorDashboardPage.goto('http://localhost:5175/dashboard', {
      waitUntil: 'domcontentloaded',
    });
    await vendorDashboardPage
      .getByRole('heading', { name: /Tổng quan & Phân tích Doanh thu/i })
      .first()
      .waitFor();

    await vendorPage.goto('http://localhost:5175/orders', { waitUntil: 'domcontentloaded' });
    await vendorPage.getByRole('heading', { name: /Đóng gói Xuất kho/i }).first().waitFor();

    await narrateStep(vendorPage, {
      chapter: 5,
      portal: 'NGƯỜI BÁN :5175',
      title: `Chương 5 — Gian hàng Đóng gói Xuất kho Kiện hàng ${vendorOrder.vendorOrderCode}`,
      detail: 'Thực hiện quy trình 3 bước chuẩn kho vận: Tiếp nhận đóng gói → Đóng gói xong → Bàn giao bưu tá.',
    });

    await spotlightAndFill(
      vendorPage.getByPlaceholder(/Tìm theo Mã kiện/),
      vendorOrder.vendorOrderCode,
      'Lọc mã kiện hàng',
    );
    await vendorPage.getByText('Hiển thị 1 kiện hàng', { exact: true }).waitFor();

    async function advanceVendorParcel(btnLabel) {
      const waitPatch = vendorPage.waitForResponse(
        (res) =>
          res.request().method() === 'PATCH' &&
          new URL(res.url()).pathname === `/api/orders/vendor-orders/${vendorOrder.id}/status`,
      );
      await spotlightAndClick(
        vendorPage.getByRole('button', { name: btnLabel, exact: true }),
        btnLabel,
      );
      await expectJson(await waitPatch, 200);
    }

    const initialVendorConfirmBtn = vendorPage.getByRole('button', {
      name: 'Xác nhận đơn hàng',
      exact: true,
    });
    if (await initialVendorConfirmBtn.isVisible().catch(() => false)) {
      await advanceVendorParcel('Xác nhận đơn hàng');
    }
    await advanceVendorParcel('Tiếp nhận & Bắt đầu đóng gói');
    await advanceVendorParcel('Đã đóng gói xong - Sẵn sàng bàn giao');
    await captureEvidence(
      vendorPage,
      'ch05-vendor-dong-goi-xuat-kho',
      `Chương 5: Gian hàng hoàn tất đóng gói kiện ${vendorOrder.vendorOrderCode}, sẵn sàng bàn giao Bưu tá MIVA`,
      5,
    );
    await advanceVendorParcel('Xác nhận bưu tá đã lấy hàng');

    await narrateStep(clientPage, {
      chapter: 5,
      portal: 'KHÁCH HÀNG :5173',
      title: 'Hoàn tất Chương 5 — Trang Đơn mua của Khách Tự chuyển sang "Đang giao hàng"',
      detail: 'Không cần tải lại trang, Khách hàng thấy trạng thái kiện hàng cập nhật trực tiếp qua Socket.IO.',
      status: 'pass',
    });
    await clientPage.getByText('Đang giao hàng', { exact: true }).first().waitFor({ timeout: 15000 });

    // =========================================================================
    // CHƯƠNG 6: BƯU TÁ NỘI BỘ (:5176/shipping) GIAO THÀNH CÔNG & QUYẾT TOÁN REALTIME
    // =========================================================================
    await narrateStep(carrierPage, {
      chapter: 6,
      portal: 'BƯU TÁ MIVA :5176',
      title: 'Chương 6 — Nhân viên Bưu tá Đăng nhập Cổng Giao nhận Nội bộ (:5176/shipping)',
      detail: `Bưu tá "${carrierEmp.fullName}" đăng nhập -> hệ thống tự định tuyến thẳng vào màn hình MIVA Logistics.`,
    });
    await loginEmployeeUI(carrierPage, carrierEmail, demoPass, 'http://localhost:5176');
    await carrierPage
      .getByRole('heading', { name: /Quản Lý Giao Hàng Bưu Tá/i })
      .first()
      .waitFor({ timeout: 15000 });

    await spotlightAndFill(
      carrierPage.getByPlaceholder('Tìm mã vận đơn, người nhận, ĐT...'),
      shipment.trackingNumber,
      `Tìm vận đơn ${shipment.trackingNumber}`,
    );
    await carrierPage.getByText(shipment.trackingNumber, { exact: true }).first().waitFor();

    async function advanceCarrierStepIfVisible(btnLabel, spotlightTag) {
      const btn = carrierPage.getByRole('button', { name: btnLabel, exact: true });
      if (await btn.isVisible().catch(() => false)) {
        await spotlightAndClick(btn, spotlightTag);
        const stepWait = carrierPage.waitForResponse(
          (res) =>
            res.request().method() === 'PATCH' &&
            res.url().includes(`/api/shipping/shipments/${shipment.id}/status`),
        );
        await spotlightAndClick(carrierPage.locator('form button[type="submit"]'), spotlightTag);
        await expectJson(await stepWait, 200);
      }
    }

    await advanceCarrierStepIfVisible(
      'Tiếp nhận & Bắt đầu lấy hàng (Vendor)',
      'Tiếp nhận lấy hàng từ kho Vendor',
    );
    await advanceCarrierStepIfVisible(
      'Nhập kho Hub & Luân chuyển',
      'Nhập kho Hub phân loại MIVA',
    );

    // Xuất kho giao cho khách (out_for_delivery)
    await narrateStep(carrierPage, {
      chapter: 6,
      portal: 'BƯU TÁ MIVA :5176',
      title: `Bưu tá Xuất kho Hub & Đi giao Tuyến cuối (${shipment.trackingNumber})`,
      detail: 'Cập nhật hành trình vận đơn sang "Đang giao hàng" (out_for_delivery).',
    });
    await spotlightAndClick(
      carrierPage.getByRole('button', { name: 'Xuất kho giao cho khách', exact: true }),
      'Xuất kho đi giao',
    );
    const outDeliveryWait = carrierPage.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/api/shipping/shipments/${shipment.id}/status`),
    );
    await spotlightAndClick(carrierPage.locator('form button[type="submit"]'), 'Xác nhận xuất kho');
    await expectJson(await outDeliveryWait, 200);

    // Bước 2 của Bưu tá: Xác nhận giao thành công (delivered) -> Tự quyết toán COD & cộng doanh thu
    await narrateStep(carrierPage, {
      chapter: 6,
      portal: 'BƯU TÁ MIVA :5176',
      title: 'Bưu tá Xác nhận Giao Thành Công — Tự động Quyết toán COD & Đồng bộ Doanh thu',
      detail: 'Khi giao thành công, Payment chuyển sang paid, Đơn hàng Hoàn tất & Doanh thu Shop tăng +144.000 ₫.',
    });
    await spotlightAndClick(
      carrierPage.getByRole('button', { name: 'Xác nhận giao thành công', exact: true }),
      'Xác nhận giao tận tay khách',
    );
    await captureEvidence(
      carrierPage,
      'ch06-buu-ta-giao-thanh-cong',
      `Chương 6: Bưu tá MIVA Logistics (:5176/shipping) xác nhận giao thành công vận đơn ${shipment.trackingNumber}`,
      6,
    );

    const vendorDashRefreshWait = vendorDashboardPage.waitForResponse(
      (res) => res.url().includes('/api/orders/vendor') && res.status() === 200,
    );
    const deliveredWait = carrierPage.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/api/shipping/shipments/${shipment.id}/status`),
    );
    await spotlightAndClick(
      carrierPage.locator('form button[type="submit"]'),
      'Hoàn tất giao hàng & thu COD',
    );
    await expectJson(await deliveredWait, 200);
    await vendorDashRefreshWait;

    const updatedPayment = await prisma.payment.findUniqueOrThrow({ where: { orderId: order.id } });
    assert.equal(updatedPayment.status, 'paid', 'Thanh toán COD phải tự động chuyển sang paid');

    await narrateStep(vendorDashboardPage, {
      chapter: 6,
      portal: 'NGƯỜI BÁN :5175',
      title: 'Hoàn tất Chương 6 — Doanh thu Thuần Gian hàng Tự động Nhảy 0 ₫ → 144.000 ₫!',
      detail: 'Dashboard Người bán nhận sự kiện Socket.IO và cộng chuẩn xác 144.000 ₫ doanh thu sau Voucher.',
      status: 'pass',
    });

    await vendorDashboardPage.waitForFunction(
      () => {
        const node = [...document.querySelectorAll('h3')].find(
          (el) => el.textContent.trim() === 'Doanh thu thuần (Kỳ chọn)',
        );
        const card = node?.closest('div.p-6');
        const h2Text = card?.querySelector('h2')?.innerText || '0';
        return Number(h2Text.replace(/\D/g, '')) === 144000;
      },
      undefined,
      { timeout: 15000 },
    );
    await captureEvidence(
      vendorDashboardPage,
      'ch06-vendor-doanh-thu-realtime-144k',
      `Chương 6: Doanh thu thuần trên Dashboard Gian hàng tự động cập nhật lên 144.000 ₫ theo thời gian thực`,
      6,
    );

    // =========================================================================
    // CHƯƠNG 7: HẬU MÃI (ĐÁNH GIÁ 5 SAO + KHẢO SÁT) & NHÂN SỰ (CHẤM CÔNG + BẢNG LƯƠNG)
    // =========================================================================
    await clientPage.getByText('Đã giao thành công', { exact: true }).first().waitFor({ timeout: 15000 });
    await narrateStep(clientPage, {
      chapter: 7,
      portal: 'KHÁCH HÀNG :5173',
      title: 'Chương 7 — Khách hàng Đánh giá 5 Sao Cho Sản phẩm Đã Mua',
      detail: 'Chỉ đơn hàng đã giao thành công mới mở khóa nút Đánh giá chất lượng sản phẩm xác thực.',
    });

    await spotlightAndClick(
      clientPage.getByRole('button', { name: /Đánh giá/i }).first(),
      'Mở hộp thoại Đánh giá 5★',
    );
    await spotlightAndFill(
      clientPage.getByPlaceholder(/Chia sẻ trải nghiệm về chất lượng sản phẩm/),
      'Túi da thủ công MIVA cực kỳ sắc sảo, áp gộp 2 mã giảm giá tiết kiệm và bưu tá giao rất lịch sự!',
      'Nhập nhận xét thực tế',
    );
    const reviewSubmitWait = clientPage.waitForResponse(
      (res) => res.request().method() === 'POST' && new URL(res.url()).pathname === '/api/reviews',
    );
    await spotlightAndClick(
      clientPage.getByRole('button', { name: 'Gửi đánh giá', exact: true }),
      'Gửi đánh giá 5 sao',
    );
    await expectJson(await reviewSubmitWait, 201);
    await clientPage.getByText(/Đã đánh giá \(5★\)/).first().waitFor();

    // Khách hàng mở hộp thư Khảo sát (/surveys) & gửi câu trả lời
    await clientPage.goto('http://localhost:5173/surveys', { waitUntil: 'domcontentloaded' });
    await narrateStep(clientPage, {
      chapter: 7,
      portal: 'KHÁCH HÀNG :5173',
      title: 'Khách hàng Thực hiện Phiếu Khảo sát Hậu mãi Tự động Trong Hộp thư',
      detail: `Phiếu "${surveyTitle}" đã được gửi tự động vào tài khoản ngay sau khi đặt hàng.`,
    });

    const surveyInboxCard = clientPage.locator('div').filter({ hasText: surveyTitle }).first();
    await surveyInboxCard.waitFor({ timeout: 15000 });
    await spotlightAndClick(
      clientPage.getByRole('link', { name: /Bắt đầu khảo sát/i }).first(),
      'Mở phiếu khảo sát',
    );
    await clientPage.getByRole('heading', { name: surveyTitle }).waitFor();

    // Trả lời đầy đủ các loại câu hỏi trong biểu mẫu khảo sát (Rating, Trắc nghiệm, Tự luận)
    const fiveStarBtns = clientPage.locator('button[title="5 sao"]');
    const starCount = await fiveStarBtns.count();
    for (let i = 0; i < starCount; i++) {
      await fiveStarBtns.nth(i).click();
    }
    const questionCards = clientPage.locator('form div.rounded-3xl');
    const qCount = await questionCards.count();
    for (let i = 0; i < qCount; i++) {
      const qCard = questionCards.nth(i);
      const firstOption = qCard.locator('div.group').first();
      if ((await firstOption.count()) > 0) {
        await firstOption.click();
      }
      const textArea = qCard.locator('textarea').first();
      if ((await textArea.count()) > 0) {
        await textArea.fill('Dịch vụ chăm sóc khách hàng và đóng gói của gian hàng đạt điểm 10/10!');
      }
    }

    const submitSurveyRespWait = clientPage.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/api\/surveys\/inbox\/[^/]+\/responses$/.test(new URL(res.url()).pathname),
    );
    await spotlightAndClick(
      clientPage.getByRole('button', { name: /Gửi câu trả lời khảo sát/i }),
      'Gửi phản hồi khảo sát',
    );
    await expectJson(await submitSurveyRespWait, 201);
    await clientPage.getByText('Cảm ơn bạn đã tham gia khảo sát!').waitFor();

    await captureEvidence(
      clientPage,
      'ch07-khach-hang-hoan-tat-khao-sat',
      `Chương 7: Khách hàng hoàn tất Đánh giá 5 sao & gửi phản hồi Khảo sát hậu mãi thành công`,
      7,
    );

    // Nhân viên thực hiện Chấm công vào ca trên :5176/profile -> Admin tính bảng lương trên :5174/employees?tab=payroll
    await dispatcherPage.goto('http://localhost:5176/profile', { waitUntil: 'domcontentloaded' });
    await narrateStep(dispatcherPage, {
      chapter: 7,
      portal: 'NHÂN VIÊN MIVA :5176',
      title: 'Nhân viên Nội bộ Chấm Công Vào Ca Trực Tiếp Trên Hồ sơ Nhân sự',
      detail: `Chuyên viên "${dispatcherEmp.fullName}" điểm danh ca trực 8 giờ để ghi nhận dữ liệu công lương.`,
    });

    await spotlightAndClick(
      dispatcherPage.getByRole('button', { name: /Chấm Công \(/i }),
      'Mở tab Bảng chấm công',
    );
    await spotlightAndClick(
      dispatcherPage.getByRole('button', { name: /Chấm Công Vào Ca/i }),
      'Bấm Chấm công vào ca',
    );

    const lateReasonBox = dispatcherPage.locator('textarea[placeholder*="Kẹt xe"]');
    if (await lateReasonBox.isVisible().catch(() => false)) {
      await lateReasonBox.fill('Điều phối ca tăng cường phục vụ buổi bảo vệ đồ án.');
    }
    await spotlightAndFill(
      dispatcherPage.getByPlaceholder(/Nhận ca kiểm kê kho hàng/),
      'Hoàn thành điều phối đơn hàng Đồ án MIVA đúng cam kết SLA.',
      'Ghi chú ca làm việc',
    );
    const checkInWait = dispatcherPage.waitForResponse(
      (res) =>
        res.request().method() === 'POST' && new URL(res.url()).pathname === '/api/payroll/attendance',
    );
    await spotlightAndClick(
      dispatcherPage.locator('form button[type="submit"]'),
      'Xác nhận điểm danh ca trực',
    );
    await expectJson(await checkInWait, 201);

    // Snapshot bảng lương hiện có trước khi bấm Tính lương trên UI để bảo toàn nguyên trạng dữ liệu cũ
    payrollMonth = now.getMonth() + 1;
    payrollYear = now.getFullYear();
    payrollSnapshotBefore = await prisma.employeePayroll.findMany({
      where: { month: payrollMonth, year: payrollYear },
    });

    await adminPage.goto('http://localhost:5174/employees?tab=payroll', {
      waitUntil: 'domcontentloaded',
    });
    await narrateStep(adminPage, {
      chapter: 7,
      portal: 'ADMIN SÀN :5174',
      title: `Hoàn tất Chương 7 — Admin Chạy Động cơ Tính Bảng Lương Tháng ${payrollMonth}/${payrollYear}`,
      detail: 'Tự động tổng hợp dữ liệu chấm công, hợp đồng & phụ cấp để xuất phiếu lương nhân sự.',
      status: 'pass',
    });

    const calcPayrollWait = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'POST' && new URL(res.url()).pathname === '/api/payroll/calculate',
    );
    await spotlightAndClick(
      adminPage.getByRole('button', {
        name: new RegExp(`Tính lương Tháng ${payrollMonth}/${payrollYear}`),
      }),
      'Chạy Payroll Engine tự động',
    );
    await expectJson(await calcPayrollWait, 201);

    const deptSelect = adminPage
      .locator('select')
      .filter({ has: adminPage.locator('option', { hasText: 'Tất cả phòng ban' }) })
      .first();
    if (await deptSelect.locator(`option[value="${dispatcherDept}"]`).count()) {
      await deptSelect.selectOption(dispatcherDept);
    }
    await adminPage.getByText(dispatcherEmp.employeeCode).first().waitFor({ timeout: 15000 });
    await captureEvidence(
      adminPage,
      'ch07-admin-tinh-bang-luong',
      `Chương 7: Payroll Engine tính lương tự động cho nhân sự chấm công (${dispatcherEmp.employeeCode})`,
      7,
    );

    // =========================================================================
    // CHƯƠNG 8: KIỂM TOÁN XÓA MỀM 100% (UI + API + BẢNG CHỨNG NHẬN POSTGRESQL)
    // =========================================================================
    // 8.1 Cập nhật sản phẩm bỏ bớt Màu #2 ("Vàng Champagne") để kiểm chứng xóa mềm biến thể con
    const productBeforeSync = await prisma.product.findUniqueOrThrow({
      where: { id: createdProduct.id },
      include: { colors: { include: { variants: true } } },
    });
    const color1 = productBeforeSync.colors.find((c) => c.color === 'Xanh Rừng MIVA');
    const color2 = productBeforeSync.colors.find((c) => c.color === 'Vàng Champagne');
    assert.ok(color1 && color2, 'Sản phẩm phải có đủ 2 màu trước khi kiểm thử xóa mềm');

    const syncVariantRes = await vendorCtx.request.patch(
      `http://localhost:5175/api/products/${createdProduct.id}`,
      {
        headers: { 'x-app-role': 'vendor' },
        data: {
          colors: [
            {
              id: color1.id,
              color: color1.color,
              imageUrls: color1.imageUrls,
              variants: color1.variants.map((v) => ({
                id: v.id,
                size: v.size,
                price: Number(v.price),
                stock: v.stock,
              })),
            },
          ],
        },
      },
    );
    await expectJson(syncVariantRes, 200);

    // 8.2 Xóa mềm Khảo sát trên giao diện Vendor (:5175/surveys)
    await vendorPage.goto('http://localhost:5175/surveys', { waitUntil: 'domcontentloaded' });
    await narrateStep(vendorPage, {
      chapter: 8,
      portal: 'NGƯỜI BÁN :5175',
      title: 'Chương 8 — Xóa Mềm Khảo sát Trên Giao diện (Bảo toàn Câu hỏi & Phản hồi)',
      detail: `Xóa mềm "${surveyTitle}" -> ẩn khỏi UI nhưng giữ nguyên Survey, SurveyQuestion, SurveyOption & SurveyResponse.`,
    });

    const surveyRow = vendorPage.locator('tr').filter({ hasText: surveyTitle }).first();
    await surveyRow.waitFor();
    await spotlightAndClick(
      surveyRow.locator('button[title="Xóa mềm khảo sát"]'),
      'Bấm Xóa mềm khảo sát',
    );
    const delSurveyWait = vendorPage.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        new URL(res.url()).pathname === `/api/surveys/${createdSurvey.id}`,
    );
    await spotlightAndClick(
      vendorPage.getByRole('button', { name: 'Xác nhận xóa mềm', exact: true }),
      'Xác nhận xóa mềm Khảo sát',
    );
    await expectJson(await delSurveyWait, 200);
    await surveyRow.waitFor({ state: 'hidden', timeout: 10000 });

    // 8.3 Xóa mềm Voucher Gian hàng trên giao diện Vendor (:5175/vouchers)
    await vendorPage.goto('http://localhost:5175/vouchers', { waitUntil: 'domcontentloaded' });
    await narrateStep(vendorPage, {
      chapter: 8,
      portal: 'NGƯỜI BÁN :5175',
      title: 'Xóa Mềm Mã Giảm Giá Shop Trên Giao diện (Bảo toàn Lịch sử Đơn Đã Áp Mã)',
      detail: `Xóa mềm "${shopVoucherCode}" -> ẩn khỏi danh sách, bảo toàn Voucher & VoucherDetail trong PostgreSQL.`,
    });

    const voucherRow = vendorPage.locator('tr').filter({ hasText: shopVoucherCode }).first();
    await voucherRow.waitFor();
    await spotlightAndClick(
      voucherRow.locator('button[title="Xóa mềm voucher gian hàng"]'),
      'Bấm Xóa mềm Voucher',
    );
    const delVoucherWait = vendorPage.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        new URL(res.url()).pathname === `/api/vouchers/${createdShopVoucher.id}`,
    );
    await spotlightAndClick(
      vendorPage.getByRole('button', { name: 'Xác nhận xóa mềm', exact: true }),
      'Xác nhận xóa mềm Voucher',
    );
    await expectJson(await delVoucherWait, 200);
    await voucherRow.waitFor({ state: 'hidden', timeout: 10000 });

    // 8.4 Xóa mềm Sản phẩm trên giao diện Vendor (:5175/products)
    await vendorPage.goto('http://localhost:5175/products', { waitUntil: 'domcontentloaded' });
    await narrateStep(vendorPage, {
      chapter: 8,
      portal: 'NGƯỜI BÁN :5175',
      title: 'Xóa Mềm Sản phẩm Trên Giao diện (Ẩn Khỏi Storefront • Giữ Nguyên DB)',
      detail: `Xóa "${productName}" -> trả về 404 với khách vãng lai nhưng 100% dòng dữ liệu vẫn còn trong PostgreSQL.`,
    });

    const productRow = vendorPage.locator('tr').filter({ hasText: productName }).first();
    await productRow.waitFor();
    await spotlightAndClick(
      productRow.locator('button[title="Xóa sản phẩm (Ẩn khỏi gian hàng)"]'),
      'Bấm Xóa mềm Sản phẩm',
    );
    const delProdWait = vendorPage.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        new URL(res.url()).pathname === `/api/products/${createdProduct.id}`,
    );
    await spotlightAndClick(
      vendorPage.getByRole('button', { name: 'Xóa sản phẩm', exact: true }),
      'Xác nhận xóa mềm Sản phẩm',
    );
    await expectJson(await delProdWait, 200);
    await productRow.waitFor({ state: 'hidden', timeout: 10000 });

    // Kiểm tra API công khai xác nhận sản phẩm đã ẩn hoàn toàn (404)
    const publicDeletedCheck = await clientCtx.request.get(
      `http://localhost:5173/api/products/${createdProduct.id}`,
    );
    assert.equal(publicDeletedCheck.status(), 404, 'Sản phẩm đã xóa mềm phải ẩn khỏi Storefront (404)');

    // Truy vấn trực tiếp PostgreSQL (:5433) để chứng minh 100% bản ghi vẫn tồn tại với dấu thời gian xóa mềm
    const [
      dbProduct,
      dbRemovedColor,
      dbRemovedVariant,
      dbShopVoucher,
      dbSurvey,
    ] = await Promise.all([
      prisma.product.findUnique({ where: { id: createdProduct.id } }),
      prisma.productColor.findUnique({ where: { id: color2.id } }),
      prisma.productVariant.findUnique({ where: { id: color2.variants[0].id } }),
      prisma.voucher.findUnique({
        where: { id: createdShopVoucher.id },
        include: { details: true },
      }),
      prisma.survey.findUnique({
        where: { id: createdSurvey.id },
        include: { questions: { include: { options: true } }, responses: true },
      }),
    ]);

    assert.ok(dbProduct?.deletedAt, 'Product phải còn trong DB với deletedAt !== null');
    assert.ok(dbRemovedColor?.deletedAt, 'ProductColor phải còn trong DB với deletedAt !== null');
    assert.ok(dbRemovedVariant?.deletedAt, 'ProductVariant phải còn trong DB với deletedAt !== null');
    assert.ok(dbShopVoucher?.deletedAt, 'Voucher phải còn trong DB với deletedAt !== null');
    const productBindingDetail = dbShopVoucher.details.find((d) => d.orderId === null);
    const redeemedOrderDetail = dbShopVoucher.details.find((d) => d.orderId === order.id);
    assert.ok(
      productBindingDetail?.reversedAt,
      'Liên kết VoucherDetail chưa dùng phải được đánh dấu reversedAt !== null',
    );
    assert.ok(redeemedOrderDetail, 'Lịch sử VoucherDetail đã áp cho đơn hàng phải được giữ nguyên');
    assert.ok(dbSurvey?.deletedAt, 'Survey phải còn trong DB với deletedAt !== null');
    assert.ok(
      dbSurvey.questions.length > 0 && dbSurvey.questions.every((q) => q.deletedAt !== null),
      'Tất cả SurveyQuestion con phải có deletedAt !== null',
    );
    const allSurveyOptions = dbSurvey.questions.flatMap((q) => q.options);
    assert.ok(
      allSurveyOptions.length > 0 && allSurveyOptions.every((o) => o.deletedAt !== null),
      'Tất cả SurveyOption con phải có deletedAt !== null',
    );
    assert.equal(dbSurvey.responses.length, 1, 'Phản hồi khảo sát của khách phải được bảo toàn 100%');

    const fmtTs = (dt) => (dt ? new Date(dt).toISOString().replace('T', ' ').slice(0, 19) : '—');
    await showSoftDeleteAuditBoard(vendorPage, [
      {
        table: 'Product',
        recordKey: `${productName} (${dbProduct.id.slice(0, 8)})`,
        uiState: 'Đã ẩn (HTTP 404)',
        dbTimestamp: `deletedAt = ${fmtTs(dbProduct.deletedAt)}`,
      },
      {
        table: 'ProductColor & Variant',
        recordKey: `${dbRemovedColor.color} / Size ${dbRemovedVariant.size}`,
        uiState: 'Đã ẩn khỏi bộ chọn',
        dbTimestamp: `deletedAt = ${fmtTs(dbRemovedVariant.deletedAt)}`,
      },
      {
        table: 'Voucher (Shop)',
        recordKey: `${shopVoucherCode} (${dbShopVoucher.id.slice(0, 8)})`,
        uiState: 'Đã ẩn khỏi Kênh bán',
        dbTimestamp: `deletedAt = ${fmtTs(dbShopVoucher.deletedAt)}`,
      },
      {
        table: 'VoucherDetail',
        recordKey: `Binding SP + Đơn #${shortOrderCode}`,
        uiState: 'Ngưng áp đơn mới',
        dbTimestamp: `reversedAt = ${fmtTs(productBindingDetail.reversedAt)}`,
      },
      {
        table: 'Survey & Questions',
        recordKey: `${dbSurvey.questions.length} câu hỏi • ${allSurveyOptions.length} lựa chọn`,
        uiState: 'Đã ẩn danh sách',
        dbTimestamp: `deletedAt = ${fmtTs(dbSurvey.deletedAt)}`,
      },
      {
        table: 'Order & SurveyResponse',
        recordKey: `Đơn #${shortOrderCode} (144.000 ₫) + 1 Phản hồi`,
        uiState: 'Lưu trữ Kiểm toán',
        dbTimestamp: `status = completed / submitted`,
      },
    ]);

    await narrateStep(vendorPage, {
      chapter: 8,
      portal: 'KIỂM TOÁN POSTGRESQL',
      title: 'HOÀN TẤT 8/8 CHƯƠNG BẢO VỆ ĐỒ ÁN — 100% NGHIỆP VỤ & XÓA MỀM ĐẠT CHUẨN!',
      detail:
        'Toàn bộ 4 Cổng, 5 Vai trò, Đồng bộ Realtime Socket.IO và Cơ chế Xóa Mềm PostgreSQL vận hành hoàn hảo.',
      status: 'pass',
      pauseMs: 2400,
    });

    await captureEvidence(
      vendorPage,
      'ch08-bang-chung-nhan-xoa-mem-postgresql',
      'Chương 8: Bảng kiểm toán trực tiếp từ PostgreSQL chứng nhận 100% thực thể xóa mềm được bảo toàn trọn vẹn',
      8,
    );

    assert.deepEqual(
      browserErrors,
      [],
      `Phát hiện lỗi runtime trên trình duyệt: ${browserErrors.join(' | ')}`,
    );

    console.log('\n================================================================================');
    console.log('  CHẾ ĐỘ ĐỒ ÁN (8 CHƯƠNG LIÊN HOÀN QUA 4 CỔNG & 5 VAI TRÒ): PASS 100%!');
    console.log(`  Ảnh minh chứng 8 Chương : ${screenshotsDir}`);
    console.log(`  Thư mục Video (.webm)   : ${videosDir}`);
    console.log('================================================================================');
  } finally {
    // 1. Đóng tuần tự tất cả Context trước để Playwright kết xuất hoàn chỉnh file Video .webm
    for (const ctx of openContexts) {
      await ctx.close().catch(() => {});
    }
    await browser?.close().catch(() => {});

    // 2. Khôi phục nguyên trạng bảng lương hiện có & dọn sạch 100% dữ liệu kiểm thử tạm theo đúng khóa ngoại
    try {
      if (payrollSnapshotBefore.length > 0) {
        const beforeIds = payrollSnapshotBefore.map((p) => p.id);
        await prisma.employeePayroll.deleteMany({
          where: {
            month: payrollMonth,
            year: payrollYear,
            id: { notIn: beforeIds },
          },
        });
        for (const snap of payrollSnapshotBefore) {
          await prisma.employeePayroll
            .update({
              where: { id: snap.id },
              data: {
                baseSalary: snap.baseSalary,
                hourlyRate: snap.hourlyRate,
                totalHours: snap.totalHours,
                allowances: snap.allowances,
                deductions: snap.deductions,
                bonus: snap.bonus,
                netSalary: snap.netSalary,
                status: snap.status,
                notes: snap.notes,
              },
            })
            .catch(() => {});
        }
      } else if (createdEmployeeIds.length > 0) {
        await prisma.employeePayroll.deleteMany({
          where: { month: payrollMonth, year: payrollYear },
        });
      }

      if (createdSurveyIds.length > 0) {
        await prisma.surveyAnswer.deleteMany({
          where: { response: { surveyId: { in: createdSurveyIds } } },
        });
      }
      if (
        createdSurveyIds.length > 0 ||
        createdClientIds.length > 0 ||
        createdVendorIds.length > 0
      ) {
        await prisma.notification.deleteMany({
          where: {
            OR: [
              ...(createdSurveyIds.length ? [{ surveyId: { in: createdSurveyIds } }] : []),
              ...(createdClientIds.length ? [{ clientId: { in: createdClientIds } }] : []),
              ...(createdVendorIds.length ? [{ vendorId: { in: createdVendorIds } }] : []),
            ],
          },
        });
      }
      if (createdSurveyIds.length > 0 || createdClientIds.length > 0) {
        await prisma.surveyResponse.deleteMany({
          where: {
            OR: [
              ...(createdSurveyIds.length ? [{ surveyId: { in: createdSurveyIds } }] : []),
              ...(createdClientIds.length ? [{ clientId: { in: createdClientIds } }] : []),
            ],
          },
        });
      }
      if (createdSurveyIds.length > 0) {
        await prisma.survey.deleteMany({ where: { id: { in: createdSurveyIds } } });
      }
      if (createdClientIds.length > 0 || createdProductIds.length > 0) {
        await prisma.review.deleteMany({
          where: {
            OR: [
              ...(createdClientIds.length ? [{ clientId: { in: createdClientIds } }] : []),
              ...(createdProductIds.length ? [{ productId: { in: createdProductIds } }] : []),
            ],
          },
        });
      }
      if (createdClientIds.length > 0) {
        await prisma.order.deleteMany({ where: { clientId: { in: createdClientIds } } });
      }
      if (createdVoucherIds.length > 0) {
        await prisma.voucher.deleteMany({ where: { id: { in: createdVoucherIds } } });
      }
      if (createdProductIds.length > 0) {
        await cleanupProductTree(prisma, createdProductIds);
      }
      if (createdCategoryIds.length > 0) {
        await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
      }
      if (createdClientIds.length > 0) {
        await cleanupClientTree(prisma, createdClientIds);
      }
      if (createdVendorIds.length > 0) {
        await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
      }
      if (createdEmployeeIds.length > 0) {
        await prisma.employee.deleteMany({ where: { id: { in: createdEmployeeIds } } });
      }
    } finally {
      await prisma.$disconnect();
    }
  }
}

main().catch((err) => {
  console.error('\n[THESIS SHOWCASE ERROR]:', err.stack || err.message);
  process.exitCode = 1;
});
