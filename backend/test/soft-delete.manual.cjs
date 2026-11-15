// Kiểm thử tự động toàn diện cơ chế Xóa mềm 100% (Soft-Delete) trên Giao diện + API + CSDL PostgreSQL.
// Chạy lệnh: node test/soft-delete.manual.cjs
require('dotenv').config();
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const {
  launchBrowser,
  newPortalContext,
  loginAdminUI,
  loginVendorUI,
  authenticatePortalContext,
  cleanupProductTree,
  cleanupClientTree,
} = require('./helpers/browser-helper.cjs');

async function main() {
  const prisma = new PrismaClient();
  const prefix = `TEST-SOFTDEL-${Date.now()}`;
  let browser, category, client, admin, vendor;
  const productIds = [];
  const voucherIds = [];
  const surveyIds = [];
  const browserErrors = [];

  try {
    vendor = await prisma.vendor.findUniqueOrThrow({
      where: { email: process.env.MIVA_TEST_VENDOR_EMAIL || 'vendor1@miva.vn' },
    });
    admin = await prisma.admin.findUniqueOrThrow({
      where: { email: process.env.MIVA_TEST_ADMIN_EMAIL || 'admin1@miva.vn' },
    });
    category = await prisma.category.create({
      data: { name: prefix, slug: prefix.toLowerCase() },
    });
    client = await prisma.client.create({
      data: {
        email: `${prefix.toLowerCase()}@example.com`,
        fullName: prefix,
        password: await bcrypt.hash('Soft-del-123!', 10),
      },
    });

    browser = await launchBrowser();
    const vendorContext = await newPortalContext(browser, 'soft-delete-vendor');
    const adminContext = await newPortalContext(browser, 'soft-delete-admin');
    const clientContext = await newPortalContext(browser, 'soft-delete-client');

    const vendorPage = await vendorContext.newPage();
    const adminPage = await adminContext.newPage();
    vendorPage.on('pageerror', (err) => browserErrors.push(`vendor: ${err.message}`));
    adminPage.on('pageerror', (err) => browserErrors.push(`admin: ${err.message}`));

    await loginVendorUI(vendorPage, vendor.email);
    await loginAdminUI(adminPage, admin.email);
    await authenticatePortalContext(
      clientContext,
      'client',
      client.email,
      'Soft-del-123!',
      'http://localhost:5173',
    );

    const vendorHeaders = { 'x-app-role': 'vendor' };
    const adminHeaders = { 'x-app-role': 'admin' };
    const clientHeaders = { 'x-app-role': 'client' };

    // =========================================================================
    // 1. KIỂM THỬ XÓA MỀM BIẾN THỂ MÀU / SIZE & SẢN PHẨM TRÊN GIAO DIỆN VENDOR
    // =========================================================================
    const productOriginalName = `${prefix}-PRODUCT`;
    const createProdRes = await vendorContext.request.post('http://localhost:5175/api/products', {
      headers: vendorHeaders,
      data: {
        name: productOriginalName,
        categoryId: category.id,
        status: 'active',
        colors: [
          { color: 'Xanh Rừng', variants: [{ size: 'M', stock: 8, price: 250000 }] },
          { color: 'Vàng Kim', variants: [{ size: 'L', stock: 5, price: 270000 }] },
        ],
      },
    });
    assert.equal(createProdRes.status(), 201, await createProdRes.text());
    const createProdBody = await createProdRes.json();
    const p1 = createProdBody.data ?? createProdBody;
    productIds.push(p1.id);
    const originalSlug = p1.slug;
    const goldColor = p1.colors.find((c) => c.color === 'Vàng Kim');
    assert.ok(goldColor?.id, 'Missing second color');

    // Cập nhật sản phẩm bỏ màu 'Vàng Kim' -> Kiểm tra xóa mềm ProductColor & ProductVariant
    const syncColorRes = await vendorContext.request.patch(
      `http://localhost:5175/api/products/${p1.id}`,
      {
        headers: vendorHeaders,
        data: {
          colors: [{ color: 'Xanh Rừng', variants: [{ size: 'M', stock: 8, price: 250000 }] }],
        },
      },
    );
    assert.equal(syncColorRes.status(), 200);
    const removedColorInDb = await prisma.productColor.findUnique({ where: { id: goldColor.id } });
    const removedVariantInDb = await prisma.productVariant.findUnique({
      where: { id: goldColor.variants[0].id },
    });
    assert.ok(removedColorInDb && removedColorInDb.deletedAt !== null, 'ProductColor must be soft-deleted');
    assert.ok(
      removedVariantInDb && removedVariantInDb.deletedAt !== null,
      'ProductVariant must be soft-deleted',
    );
    console.log('PASS [1/5]: Removing a color during product update soft-deletes ProductColor & ProductVariant in DB');

    // Vendor nhấn nút Thùng rác trên UI Quản lý Sản phẩm -> Xác nhận xóa mềm
    await vendorPage.goto('http://localhost:5175/products');
    await vendorPage.getByPlaceholder('Tìm kiếm tên sản phẩm...').fill(productOriginalName);
    const prodRow = vendorPage.locator('tr').filter({ hasText: productOriginalName });
    await prodRow.waitFor();
    await prodRow.locator('button[title="Xóa sản phẩm (Ẩn khỏi gian hàng)"]').click();
    const delProdApi = vendorPage.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        new URL(res.url()).pathname === `/api/products/${p1.id}`,
    );
    await vendorPage.getByRole('button', { name: 'Xóa sản phẩm', exact: true }).click();
    assert.equal((await delProdApi).status(), 200);
    await prodRow.waitFor({ state: 'hidden', timeout: 10000 });

    // Kiểm tra API công khai trả về 404 (đã ẩn khỏi khách hàng), nhưng trong DB vẫn còn nguyên!
    const publicGetDeleted = await clientContext.request.get(
      `http://localhost:5173/api/products/${p1.id}`,
    );
    assert.equal(publicGetDeleted.status(), 404);
    const p1InDb = await prisma.product.findUnique({ where: { id: p1.id } });
    assert.ok(p1InDb, 'Product row must remain in PostgreSQL');
    assert.ok(p1InDb.deletedAt !== null, 'Product.deletedAt must be populated');
    assert.equal(p1InDb.status, 'inactive');
    assert.notEqual(p1InDb.slug, originalSlug, 'Deleted product slug must be released');

    // Tạo lại sản phẩm mới trùng tên (kiểm chứng giải phóng slug thành công)
    const recreateProdRes = await vendorContext.request.post('http://localhost:5175/api/products', {
      headers: vendorHeaders,
      data: {
        name: productOriginalName,
        categoryId: category.id,
        status: 'active',
        colors: [{ color: 'Đen', variants: [{ size: 'Freesize', stock: 12, price: 180000 }] }],
      },
    });
    assert.equal(recreateProdRes.status(), 201, 'Must allow reusing slug after soft-delete');
    const p2Body = await recreateProdRes.json();
    const p2 = p2Body.data ?? p2Body;
    productIds.push(p2.id);
    assert.equal(p2.slug, originalSlug);
    console.log(
      'PASS [2/5]: Deleting product on Vendor UI hides it from Storefront/Vendor, preserves DB row, and releases slug',
    );

    // =========================================================================
    // 2. KIỂM THỬ XÓA MỀM VOUCHER SÀN (ADMIN UI) & VOUCHER SHOP (VENDOR UI)
    // =========================================================================
    const start = new Date(Date.now() - 86400000).toISOString();
    const end = new Date(Date.now() + 7 * 86400000).toISOString();

    const adminVoucherCode = `${prefix}-ADM`;
    const createAdminVRes = await adminContext.request.post('http://localhost:5174/api/vouchers', {
      headers: adminHeaders,
      data: {
        code: adminVoucherCode,
        name: `${prefix} Admin Voucher`,
        discountType: 'percentage',
        discountValue: 10,
        quantity: 20,
        startDate: start,
        endDate: end,
        status: 'active',
      },
    });
    assert.equal(createAdminVRes.status(), 201);
    const createAdminVBody = await createAdminVRes.json();
    const adminVoucher = createAdminVBody.data ?? createAdminVBody;
    voucherIds.push(adminVoucher.id);

    await adminPage.goto('http://localhost:5174/catalog?tab=vouchers');
    await adminPage.getByPlaceholder('Tìm theo mã, tên hoặc danh mục...').fill(adminVoucherCode);
    const adminVRow = adminPage.locator('tr').filter({ hasText: adminVoucherCode });
    await adminVRow.waitFor();
    await adminVRow.locator('button[title="Xóa mềm mã giảm giá"]').click();
    const delAdminVApi = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        new URL(res.url()).pathname === `/api/vouchers/${adminVoucher.id}`,
    );
    await adminPage.getByRole('button', { name: 'Xác nhận xóa mềm', exact: true }).click();
    assert.equal((await delAdminVApi).status(), 200);
    await adminVRow.waitFor({ state: 'hidden', timeout: 10000 });

    const adminVInDb = await prisma.voucher.findUnique({ where: { id: adminVoucher.id } });
    assert.ok(adminVInDb && adminVInDb.deletedAt !== null, 'Admin voucher must remain in DB with deletedAt');

    const shopVoucherCode = `${prefix}-SHP`;
    const createShopVRes = await vendorContext.request.post('http://localhost:5175/api/vouchers', {
      headers: vendorHeaders,
      data: {
        code: shopVoucherCode,
        name: `${prefix} Shop Voucher`,
        discountType: 'percentage',
        discountValue: 15,
        quantity: 20,
        startDate: start,
        endDate: end,
        status: 'active',
        productIds: [p2.id],
      },
    });
    assert.equal(createShopVRes.status(), 201);
    const createShopVBody = await createShopVRes.json();
    const shopVoucher = createShopVBody.data ?? createShopVBody;
    voucherIds.push(shopVoucher.id);

    await vendorPage.goto('http://localhost:5175/vouchers');
    await vendorPage
      .getByPlaceholder('Tìm theo mã hoặc tên chương trình voucher...')
      .fill(shopVoucherCode);
    const shopVRow = vendorPage.locator('tr').filter({ hasText: shopVoucherCode });
    await shopVRow.waitFor();
    await shopVRow.locator('button[title="Xóa mềm voucher gian hàng"]').click();
    const delShopVApi = vendorPage.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        new URL(res.url()).pathname === `/api/vouchers/${shopVoucher.id}`,
    );
    await vendorPage.getByRole('button', { name: 'Xác nhận xóa mềm', exact: true }).click();
    assert.equal((await delShopVApi).status(), 200);
    await shopVRow.waitFor({ state: 'hidden', timeout: 10000 });

    const shopVInDb = await prisma.voucher.findUnique({
      where: { id: shopVoucher.id },
      include: { details: true },
    });
    assert.ok(shopVInDb && shopVInDb.deletedAt !== null, 'Shop voucher must remain in DB with deletedAt');
    assert.ok(
      shopVInDb.details.length > 0 && shopVInDb.details.every((d) => d.reversedAt !== null),
      'Unredeemed VoucherDetail bindings must be soft-reversed (reversedAt !== null)',
    );
    console.log(
      'PASS [3/5]: Admin & Vendor Voucher UI soft-delete hides vouchers while preserving Voucher & VoucherDetail in DB',
    );

    // =========================================================================
    // 3. KIỂM THỬ XÓA MỀM KHẢO SÁT + CÂU HỎI + ĐÁP ÁN TRÊN GIAO DIỆN VENDOR
    // =========================================================================
    const surveyTitle = `${prefix} Khảo sát Dịch vụ`;
    const createSurveyRes = await vendorContext.request.post('http://localhost:5175/api/surveys', {
      headers: vendorHeaders,
      data: {
        title: surveyTitle,
        audienceType: 'vendor_buyers',
        triggerType: 'manual',
        questions: [
          {
            question: 'Bạn đánh giá chất lượng đóng gói thế nào?',
            type: 'single_choice',
            required: true,
            position: 0,
            options: [
              { content: 'Rất hài lòng', position: 0 },
              { content: 'Bình thường', position: 1 },
            ],
          },
        ],
      },
    });
    assert.equal(createSurveyRes.status(), 201, await createSurveyRes.text());
    const surveyBody = await createSurveyRes.json();
    const survey = surveyBody.data ?? surveyBody;
    surveyIds.push(survey.id);

    await vendorPage.goto('http://localhost:5175/surveys');
    const surveyRow = vendorPage.locator('tr').filter({ hasText: surveyTitle });
    await surveyRow.waitFor();
    await surveyRow.locator('button[title="Xóa mềm khảo sát"]').click();
    const delSurveyApi = vendorPage.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        new URL(res.url()).pathname === `/api/surveys/${survey.id}`,
    );
    await vendorPage.getByRole('button', { name: 'Xác nhận xóa mềm', exact: true }).click();
    assert.equal((await delSurveyApi).status(), 200);
    await surveyRow.waitFor({ state: 'hidden', timeout: 10000 });

    const surveyInDb = await prisma.survey.findUnique({
      where: { id: survey.id },
      include: { questions: { include: { options: true } } },
    });
    assert.ok(surveyInDb && surveyInDb.deletedAt !== null, 'Survey must remain in DB with deletedAt');
    assert.ok(
      surveyInDb.questions.length === 1 && surveyInDb.questions[0].deletedAt !== null,
      'SurveyQuestion must remain in DB with deletedAt',
    );
    assert.ok(
      surveyInDb.questions[0].options.length === 2 &&
        surveyInDb.questions[0].options.every((opt) => opt.deletedAt !== null),
      'SurveyOption rows must remain in DB with deletedAt',
    );
    console.log(
      'PASS [4/5]: Survey UI soft-delete hides survey while preserving Survey, SurveyQuestion & SurveyOption in DB',
    );

    // =========================================================================
    // 4. KIỂM THỬ XÓA MỀM & KHÔI PHỤC GIỎ HÀNG (CartItem) + YÊU THÍCH (ProductFavorite)
    // =========================================================================
    const activeVariantId = p2.colors[0].variants[0].id;

    // Favorite -> Unfavorite -> Re-favorite
    const fav1 = await clientContext.request.post(
      `http://localhost:5173/api/products/${p2.id}/favorite`,
      { headers: clientHeaders },
    );
    assert.equal(fav1.status(), 201);
    const favRow1 = await prisma.productFavorite.findUniqueOrThrow({
      where: { clientId_productId: { clientId: client.id, productId: p2.id } },
    });
    assert.equal(favRow1.deletedAt, null);

    const unfav = await clientContext.request.delete(
      `http://localhost:5173/api/products/${p2.id}/favorite`,
      { headers: clientHeaders },
    );
    assert.equal(unfav.status(), 200);
    const favStatusAfterDel = await clientContext.request.get(
      `http://localhost:5173/api/products/${p2.id}/favorite-status`,
      { headers: clientHeaders },
    );
    const favStatusJson = await favStatusAfterDel.json();
    assert.equal((favStatusJson.data ?? favStatusJson).favorited, false);

    const favRowAfterDel = await prisma.productFavorite.findUnique({ where: { id: favRow1.id } });
    assert.ok(favRowAfterDel && favRowAfterDel.deletedAt !== null, 'ProductFavorite must be soft-deleted');

    const fav2 = await clientContext.request.post(
      `http://localhost:5173/api/products/${p2.id}/favorite`,
      { headers: clientHeaders },
    );
    assert.equal(fav2.status(), 201);
    const favRowRestored = await prisma.productFavorite.findUniqueOrThrow({ where: { id: favRow1.id } });
    assert.equal(favRowRestored.deletedAt, null, 'Re-favoriting must restore soft-deleted row');

    // Add CartItem -> Remove CartItem -> Re-add same variant
    const addCart1 = await clientContext.request.post('http://localhost:5173/api/cart/items', {
      headers: clientHeaders,
      data: { productVariantId: activeVariantId, quantity: 2 },
    });
    assert.equal(addCart1.status(), 201);
    const addCart1Body = await addCart1.json();
    const cart1Data = addCart1Body.data ?? addCart1Body;
    const cartItemId = cart1Data.items[0].id;

    const delCartItem = await clientContext.request.delete(
      `http://localhost:5173/api/cart/items/${cartItemId}`,
      { headers: clientHeaders },
    );
    assert.equal(delCartItem.status(), 200);
    const emptyCartBody = await delCartItem.json();
    const emptyCartData = emptyCartBody.data ?? emptyCartBody;
    assert.equal(emptyCartData.items.length, 0);

    const cartItemInDb = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
    assert.ok(cartItemInDb && cartItemInDb.deletedAt !== null, 'CartItem must remain in DB with deletedAt');

    const addCart2 = await clientContext.request.post('http://localhost:5173/api/cart/items', {
      headers: clientHeaders,
      data: { productVariantId: activeVariantId, quantity: 3 },
    });
    assert.equal(addCart2.status(), 201);
    const cartItemRestored = await prisma.cartItem.findUniqueOrThrow({ where: { id: cartItemId } });
    assert.equal(cartItemRestored.deletedAt, null, 'Re-adding variant must restore soft-deleted CartItem');
    assert.equal(cartItemRestored.quantity, 3);
    console.log(
      'PASS [5/5]: CartItem & ProductFavorite soft-delete in DB and cleanly restore without unique constraint errors',
    );

    assert.deepEqual(browserErrors, []);
    await vendorContext.close();
    await adminContext.close();
    await clientContext.close();
  } finally {
    await browser?.close();
    if (surveyIds.length) {
      await prisma.notification.deleteMany({ where: { surveyId: { in: surveyIds } } });
      await prisma.surveyResponse.deleteMany({ where: { surveyId: { in: surveyIds } } });
      await prisma.survey.deleteMany({ where: { id: { in: surveyIds } } });
    }
    if (voucherIds.length) {
      await prisma.voucherDetail.deleteMany({ where: { voucherId: { in: voucherIds }, orderId: null } });
      await prisma.voucher.deleteMany({ where: { id: { in: voucherIds } } });
    }
    if (client) await cleanupClientTree(prisma, [client.id]);
    await cleanupProductTree(prisma, productIds);
    if (category) {
      await prisma.category.deleteMany({ where: { id: category.id, products: { none: {} } } });
    }
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.stack);
  process.exitCode = 1;
});
