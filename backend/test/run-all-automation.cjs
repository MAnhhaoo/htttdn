#!/usr/bin/env node
/**
 * Trình điều phối Automation Test 1 lệnh cho toàn hệ thống MIVA E-Commerce.
 *
 * Cách sử dụng:
 *   node test/run-all-automation.cjs                     # Chạy toàn bộ 3 tầng (tự động bật server nếu chưa chạy)
 *   node test/run-all-automation.cjs --tier=quick        # Chỉ chạy Unit + Supertest E2E (rất nhanh, không cần 4 cổng UI)
 *   node test/run-all-automation.cjs --tier=api          # Chạy các luồng API đa vai trò & Concurrency
 *   node test/run-all-automation.cjs --tier=browser      # Chạy toàn bộ kịch bản trình duyệt Playwright 4 cổng
 *   node test/run-all-automation.cjs --tier=soft-delete  # Chạy kịch bản kiểm thử Xóa mềm 100%
 *   node test/run-all-automation.cjs --demo              # Mở trình duyệt Edge trực quan + SlowMo + Quay Video .webm
 *   node test/run-all-automation.cjs --filter=voucher    # Chỉ chạy các kịch bản có tên chứa 'voucher'
 */

const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');

const BACKEND_DIR = path.resolve(__dirname, '..');
const MONOREPO_DIR = path.resolve(BACKEND_DIR, '..');
const REPORT_PATH = path.resolve(__dirname, 'LATEST_AUTOMATION_REPORT.md');
const THESIS_REPORT_PATH = path.resolve(__dirname, 'THESIS_DEMO_REPORT.md');

const args = process.argv.slice(2);
function getArgValue(prefix, fallback = '') {
  const hit = args.find((a) => a.startsWith(`${prefix}=`));
  return hit ? hit.slice(prefix.length + 1) : fallback;
}

const tier = getArgValue('--tier', 'all').toLowerCase();
const filterKeyword = getArgValue('--filter', '').toLowerCase();
const isThesis = args.includes('--thesis');
const isDemo = args.includes('--demo');
const isHeaded = isThesis || isDemo || args.includes('--headed');
const recordVideo = isThesis || isDemo || args.includes('--video');
const slowMo = getArgValue('--slow-mo', isThesis ? '800' : isDemo ? '400' : '');
const stepPause = getArgValue('--step-pause', isThesis ? '1400' : '');
const noAutoStart = args.includes('--no-auto-start');

const SERVICES = [
  {
    id: 'postgres',
    name: 'PostgreSQL Database',
    port: 5433,
    autoStart: false,
  },
  {
    id: 'backend',
    name: 'NestJS Backend API',
    port: 3000,
    cwd: BACKEND_DIR,
    healthUrl: 'http://localhost:3000/api/health',
    autoStart: true,
    startCmd: fs.existsSync(path.join(BACKEND_DIR, 'dist/main.js'))
      ? ['node', ['dist/main.js']]
      : ['npx', ['nest', 'start']],
  },
  {
    id: 'frontend',
    name: 'Storefront (Khách hàng)',
    port: 5173,
    cwd: path.join(MONOREPO_DIR, 'frontend'),
    healthUrl: 'http://localhost:5173',
    autoStart: true,
    startCmd: ['node', ['node_modules/vite/bin/vite.js', '--port', '5173', '--strictPort']],
  },
  {
    id: 'admin',
    name: 'Admin Portal (Quản trị)',
    port: 5174,
    cwd: path.join(MONOREPO_DIR, 'admin'),
    healthUrl: 'http://localhost:5174',
    autoStart: true,
    startCmd: ['node', ['node_modules/vite/bin/vite.js', '--port', '5174', '--strictPort']],
  },
  {
    id: 'vendor',
    name: 'Vendor Portal (Người bán)',
    port: 5175,
    cwd: path.join(MONOREPO_DIR, 'vendor'),
    healthUrl: 'http://localhost:5175',
    autoStart: true,
    startCmd: ['node', ['node_modules/vite/bin/vite.js', '--port', '5175', '--strictPort']],
  },
  {
    id: 'employee',
    name: 'Employee Portal (Nhân viên)',
    port: 5176,
    cwd: path.join(MONOREPO_DIR, 'employee'),
    healthUrl: 'http://localhost:5176',
    autoStart: true,
    startCmd: ['node', ['node_modules/vite/bin/vite.js', '--port', '5176', '--strictPort']],
  },
];

const SUITES = [
  // Tầng 1: Unit Tests
  {
    id: 'jest-unit',
    tier: 'unit',
    name: 'Jest Unit Tests (11 suites / Services & Controllers)',
    cmd: 'node',
    cmdArgs: ['node_modules/jest/bin/jest.js'],
    needs: [],
  },
  // Tầng 2: Supertest HTTP E2E
  {
    id: 'jest-http-e2e',
    tier: 'http',
    name: 'Supertest HTTP E2E (Health, Catalog, Public Catalog)',
    cmd: 'node',
    cmdArgs: ['node_modules/jest/bin/jest.js', '--config', './test/jest-e2e.json', '--runInBand'],
    needs: ['postgres'],
  },
  // Tầng 2B: Playwright API Context Workflows
  {
    id: 'api-detail',
    tier: 'api',
    name: 'API Detail & Client CRUD (Addresses, Favorites, Cart, Profile)',
    cmd: 'node',
    cmdArgs: ['test/api-detail.manual.cjs'],
    needs: ['postgres', 'backend'],
  },
  {
    id: 'api-workflows',
    tier: 'api',
    name: 'API Workflows (Employee, Attendance, Payroll, Survey CRUD)',
    cmd: 'node',
    cmdArgs: ['test/api-workflows.manual.cjs'],
    needs: ['postgres', 'backend'],
  },
  {
    id: 'checkout-concurrency',
    tier: 'api',
    name: 'Checkout Concurrency & Anti-Oversell Race Protection',
    cmd: 'node',
    cmdArgs: ['test/checkout-concurrency.manual.cjs'],
    needs: ['postgres', 'backend'],
  },
  {
    id: 'order-assignment',
    tier: 'api',
    name: 'Order & Shipment Carrier Assignment Rules',
    cmd: 'node',
    cmdArgs: ['test/order-assignment.manual.cjs'],
    needs: ['postgres', 'backend'],
  },
  {
    id: 'product-upload',
    tier: 'api',
    name: 'Vendor Product Image Upload & MIME Security Validation',
    cmd: 'node',
    cmdArgs: ['test/product-upload.manual.cjs'],
    needs: ['postgres', 'backend'],
  },
  {
    id: 'vendor-approval',
    tier: 'api',
    name: 'Vendor Registration Approval, RBAC & Subscription Renewal',
    cmd: 'node',
    cmdArgs: ['test/vendor-approval.manual.cjs'],
    needs: ['postgres', 'backend'],
  },
  {
    id: 'survey-inbox',
    tier: 'api',
    name: 'Post-Checkout Survey Delivery & Respondent Isolation',
    cmd: 'node',
    cmdArgs: ['test/survey-inbox.manual.cjs'],
    needs: ['postgres', 'backend'],
  },
  // Tầng 3: Multi-Portal Browser E2E + 100% Soft-Delete
  {
    id: 'soft-delete',
    tier: 'browser',
    name: '100% System-Wide Soft-Delete (UI + API + PostgreSQL Audit)',
    cmd: 'node',
    cmdArgs: ['test/soft-delete.manual.cjs'],
    needs: ['postgres', 'backend', 'frontend', 'admin', 'vendor'],
  },
  {
    id: 'portal-smoke',
    tier: 'browser',
    name: '4-Portal Route & Layout Smoke Check (Admin/Vendor/Employee/Client)',
    cmd: 'node',
    cmdArgs: ['test/portal-smoke.manual.cjs'],
    needs: ['postgres', 'backend', 'frontend', 'admin', 'vendor', 'employee'],
  },
  {
    id: 'api-calls',
    tier: 'browser',
    name: '4-Portal Live Network & Zero-Error API Audit',
    cmd: 'node',
    cmdArgs: ['test/api-calls.manual.cjs'],
    needs: ['postgres', 'backend', 'frontend', 'admin', 'vendor', 'employee'],
  },
  {
    id: 'registration-login',
    tier: 'browser',
    name: 'Client & 2-Step Vendor Registration + Approval Login Gate',
    cmd: 'node',
    cmdArgs: ['test/registration-login.manual.cjs'],
    needs: ['postgres', 'backend', 'frontend', 'vendor'],
  },
  {
    id: 'category-realtime',
    tier: 'browser',
    name: 'Category Management, Soft-Lock & Realtime Storefront Sync',
    cmd: 'node',
    cmdArgs: ['test/category-realtime.manual.cjs'],
    needs: ['postgres', 'backend', 'frontend', 'admin'],
  },
  {
    id: 'admin-voucher',
    tier: 'browser',
    name: 'Admin Platform Voucher CRUD & Validation Rules',
    cmd: 'node',
    cmdArgs: ['test/admin-voucher.manual.cjs'],
    needs: ['postgres', 'backend', 'admin'],
  },
  {
    id: 'vendor-voucher',
    tier: 'browser',
    name: 'Vendor Shop Voucher CRUD, Ownership & Product Eligibility',
    cmd: 'node',
    cmdArgs: ['test/vendor-voucher.manual.cjs'],
    needs: ['postgres', 'backend', 'vendor'],
  },
  {
    id: 'voucher-pricing',
    tier: 'browser',
    name: 'Dual Shop + Platform Voucher Stacking Formula (Card -> Cart -> Checkout)',
    cmd: 'node',
    cmdArgs: ['test/voucher-pricing.manual.cjs'],
    needs: ['postgres', 'backend', 'frontend', 'admin', 'vendor'],
  },
  {
    id: 'multi-vendor-payment',
    tier: 'browser',
    name: 'Multi-Vendor Split Checkout & Sequential Payment Recovery',
    cmd: 'node',
    cmdArgs: ['test/multi-vendor-payment.manual.cjs'],
    needs: ['postgres', 'backend', 'frontend'],
  },
  {
    id: 'vendor-sync',
    tier: 'browser',
    name: 'Full Order Lifecycle & Realtime 3-Portal Revenue/Stock Sync',
    cmd: 'node',
    cmdArgs: ['test/vendor-sync.manual.cjs'],
    needs: ['postgres', 'backend', 'frontend', 'admin', 'vendor'],
  },
  // Tầng 4: Master Thesis Showcase (8 Chương Liên Hoàn Qua 4 Cổng & 5 Vai Trò)
  {
    id: 'thesis-showcase',
    tier: 'thesis',
    name: 'Chế Độ Đồ Án — 8 Chương Liên Hoàn (4 Cổng • 5 Vai trò • HUD • Soft-Delete)',
    cmd: 'node',
    cmdArgs: ['test/thesis-showcase.manual.cjs'],
    needs: ['postgres', 'backend', 'frontend', 'admin', 'vendor', 'employee'],
  },
];

function selectSuites() {
  const keywords = filterKeyword
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  return SUITES.filter((s) => {
    if (
      keywords.length > 0 &&
      !keywords.some((kw) => s.id.includes(kw) || s.name.toLowerCase().includes(kw))
    ) {
      return false;
    }
    if (tier === 'all') return true;
    if (tier === 'quick') return s.tier === 'unit' || s.tier === 'http';
    if (tier === 'unit') return s.tier === 'unit';
    if (tier === 'http') return s.tier === 'http';
    if (tier === 'api') return s.tier === 'api';
    if (tier === 'browser' || tier === 'ui') return s.tier === 'browser';
    if (tier === 'thesis' || tier === 'doan') return s.tier === 'thesis';
    if (tier === 'soft-delete') return s.id === 'soft-delete';
    return s.id === tier;
  });
}

function checkSingleHost(port, host, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}

async function checkPort(port) {
  if (await checkSingleHost(port, 'localhost')) return true;
  if (await checkSingleHost(port, '127.0.0.1')) return true;
  if (await checkSingleHost(port, '::1')) return true;
  return false;
}

async function waitForService(service, child, getBootLog, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child && child.exitCode !== null) {
      return false;
    }
    const open = await checkPort(service.port);
    if (open) {
      if (!service.healthUrl) return true;
      try {
        const res = await fetch(service.healthUrl);
        if (res.status < 500) return true;
      } catch {
        // retry
      }
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  return false;
}

function runSuiteProcess(suite, extraEnv) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const child = spawn(suite.cmd, suite.cmdArgs, {
      cwd: BACKEND_DIR,
      env: { ...process.env, ...extraEnv },
      shell: process.platform === 'win32' && suite.cmd !== 'node',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });
    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });

    child.on('close', (code) => {
      resolve({
        ...suite,
        ok: code === 0,
        exitCode: code,
        durationMs: Date.now() - startedAt,
        output,
      });
    });
  });
}

async function main() {
  const selected = selectSuites();
  if (!selected.length) {
    console.error(`Không tìm thấy kịch bản phù hợp với --tier=${tier} --filter=${filterKeyword}`);
    process.exit(1);
  }

  console.log('================================================================================');
  console.log('  HỆ THỐNG KIỂM THỬ TỰ ĐỘNG MIVA E-COMMERCE (3-TIER AUTOMATION RUNNER)');
  console.log('================================================================================');
  console.log(
    `  Chế độ: tier=${tier} | trình duyệt=${isHeaded ? `Trực quan (slowMo=${slowMo || 350}ms)` : 'Headless nhanh'}${
      recordVideo ? ' | Quay Video=.webm' : ''
    }`,
  );
  console.log(`  Số bộ kịch bản sẽ chạy: ${selected.length}`);
  console.log('--------------------------------------------------------------------------------');

  const requiredIds = new Set(selected.flatMap((s) => s.needs));
  const spawnedChildren = [];

  try {
    // 1. Pre-flight check & Auto-boot missing services if allowed
    for (const svc of SERVICES) {
      if (!requiredIds.has(svc.id)) continue;
      const alreadyUp = await checkPort(svc.port);
      if (alreadyUp) {
        console.log(`  [READY] ${svc.name} (:${svc.port}) đang hoạt động.`);
        continue;
      }

      if (!svc.autoStart || noAutoStart) {
        console.error(
          `\n  [LỖI] Dịch vụ "${svc.name}" tại cổng :${svc.port} chưa được bật! Vui lòng khởi động trước khi chạy test.`,
        );
        process.exitCode = 1;
        return;
      }

      console.log(`  [BOOT ] Đang tự động khởi chạy ${svc.name} (:${svc.port})...`);
      const [bin, binArgs] = svc.startCmd;
      let bootLog = '';
      const child = spawn(bin, binArgs, {
        cwd: svc.cwd,
        env: { ...process.env },
        shell: process.platform === 'win32' && bin !== 'node',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const appendLog = (chunk) => {
        bootLog = (bootLog + chunk.toString()).slice(-4000);
      };
      child.stdout.on('data', appendLog);
      child.stderr.on('data', appendLog);
      spawnedChildren.push({ name: svc.name, port: svc.port, proc: child });

      const ready = await waitForService(svc, child, () => bootLog, 50000);
      if (!ready) {
        if (bootLog.includes('EADDRINUSE') && (await checkPort(svc.port))) {
          spawnedChildren.pop();
          console.log(`  [READY] ${svc.name} (:${svc.port}) đã hoạt động sẵn từ tiến trình ngoài.`);
          continue;
        }
        console.error(`  [FAIL ] Không thể khởi động ${svc.name} trên cổng :${svc.port} (exit=${child.exitCode}).`);
        if (bootLog.trim()) {
          console.error(`  --- Nhật ký khởi động ${svc.name} ---\n${bootLog.trim()}\n  -----------------------------------`);
        }
        process.exitCode = 1;
        return;
      }
      console.log(`  [READY] ${svc.name} (:${svc.port}) đã sẵn sàng.`);
    }

    const extraEnv = {};
    if (isThesis) {
      extraEnv.MIVA_THESIS_DEMO = '1';
      const doAnVideosDir = path.resolve(MONOREPO_DIR, 'test-recordings/do-an/videos');
      if (fs.existsSync(doAnVideosDir)) {
        fs.rmSync(doAnVideosDir, { recursive: true, force: true });
      }
      fs.mkdirSync(doAnVideosDir, { recursive: true });
    }
    if (isHeaded) extraEnv.MIVA_HEADED = '1';
    if (slowMo) extraEnv.MIVA_SLOW_MO = String(slowMo);
    if (stepPause) extraEnv.MIVA_STEP_PAUSE = String(stepPause);
    if (recordVideo) extraEnv.MIVA_RECORD_VIDEO = '1';

    // 2. Run selected suites sequentially
    const results = [];
    const totalStart = Date.now();

    for (let i = 0; i < selected.length; i++) {
      const suite = selected[i];
      console.log(
        `\n>>> [${i + 1}/${selected.length}] Đang chạy: ${suite.name} (${suite.id}) ...`,
      );
      const res = await runSuiteProcess(suite, extraEnv);
      results.push(res);
      const sec = (res.durationMs / 1000).toFixed(1);
      console.log(
        `<<< [${res.ok ? 'PASS' : 'FAIL'}] ${suite.id} hoàn tất sau ${sec}s (exit=${res.exitCode})`,
      );
    }

    const totalSec = ((Date.now() - totalStart) / 1000).toFixed(1);
    const passed = results.filter((r) => r.ok).length;
    const failed = results.length - passed;

    console.log('\n================================================================================');
    console.log('  BẢNG TỔNG KẾT KẾT QUẢ AUTOMATION TEST');
    console.log('================================================================================');
    for (const r of results) {
      const statusTag = r.ok ? 'PASS' : 'FAIL';
      const sec = `${(r.durationMs / 1000).toFixed(1)}s`.padStart(7, ' ');
      console.log(`  [${statusTag}] ${sec} | ${r.id.padEnd(22, ' ')} | ${r.name}`);
    }
    console.log('--------------------------------------------------------------------------------');
    console.log(
      `  TỔNG CỘNG: ${passed}/${results.length} bộ kịch bản PASS | Thất bại: ${failed} | Tổng thời gian: ${totalSec}s`,
    );
    if (recordVideo) {
      console.log(`  Video ghi hình (.webm): ${path.resolve(MONOREPO_DIR, 'test-recordings')}`);
    }
    console.log('================================================================================');

    // Ghi báo cáo Markdown mới nhất
    const mdLines = [
      '# Báo cáo Kết quả Chạy Automation Test Mới nhất (MIVA)',
      '',
      `- **Thời điểm chạy**: ${new Date().toLocaleString('vi-VN')}`,
      `- **Chế độ**: \`tier=${tier}\` (${isHeaded ? 'Visual Demo' : 'Headless'})`,
      `- **Tổng kết**: **${passed}/${results.length} PASS** (${failed} FAIL) trong **${totalSec}s**`,
      '',
      '| Trạng thái | Mã kịch bản | Tầng | Thời gian | Mô tả nghiệp vụ |',
      '| :---: | :--- | :---: | :---: | :--- |',
      ...results.map(
        (r) =>
          `| ${r.ok ? 'PASS' : 'FAIL'} | \`${r.id}\` | \`${r.tier}\` | ${(r.durationMs / 1000).toFixed(1)}s | ${r.name} |`,
      ),
      '',
    ];
    fs.writeFileSync(REPORT_PATH, mdLines.join('\n'), 'utf8');

    // Nếu có chạy kịch bản Chế độ Đồ Án (thesis-showcase), xuất thêm báo cáo chuyên biệt THESIS_DEMO_REPORT.md
    if (isThesis || selected.some((s) => s.id === 'thesis-showcase')) {
      const doAnDir = path.resolve(MONOREPO_DIR, 'test-recordings/do-an');
      const manifestFile = path.join(doAnDir, 'screenshots/manifest.json');
      const screenshots = fs.existsSync(manifestFile)
        ? JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
        : [];

      const videoFiles = [];
      const videosRoot = path.join(doAnDir, 'videos');
      if (fs.existsSync(videosRoot)) {
        for (const sub of fs.readdirSync(videosRoot, { withFileTypes: true })) {
          if (sub.isDirectory()) {
            const subDir = path.join(videosRoot, sub.name);
            for (const vf of fs.readdirSync(subDir)) {
              if (vf.endsWith('.webm')) {
                videoFiles.push({ role: sub.name, filePath: path.join(subDir, vf) });
              }
            }
          }
        }
      }

      const thesisMd = [
        '# Báo Cáo Tổng Kết Trình Diễn "Chế Độ Đồ Án" (MIVA Master Thesis Showcase)',
        '',
        `- **Thời điểm thực thi**: ${new Date().toLocaleString('vi-VN')}`,
        `- **Chế độ trình chiếu**: ${isThesis || isHeaded ? `Mở trình duyệt trực quan (slowMo=${slowMo || 800}ms, stepPause=${stepPause || 1400}ms)` : 'Headless kiểm chứng nhanh'}`,
        `- **Kết quả tổng thể**: **${passed}/${results.length} PASS** trong **${totalSec}s**`,
        `- **Thư mục tư liệu Đồ Án**: \`${doAnDir}\``,
        '',
        '## 1. Bảng Minh Chứng Ảnh Chụp Màn Hình 8 Chương (`1440×900`)',
        '',
        '| Chương | Tên file ảnh | Mô tả nghiệm thu nghiệp vụ |',
        '| :---: | :--- | :--- |',
        ...screenshots.map(
          (item) => `| Chương ${item.chapter} | \`${item.fileName}\` | ${item.caption} |`,
        ),
        '',
        '## 2. Danh Sách Video Ghi Hình Trực Tiếp Từng Vai Trò (`.webm`)',
        '',
        ...(videoFiles.length > 0
          ? videoFiles.map((v) => `- **\`${v.role}\`**: \`${v.filePath}\``)
          : ['- *(Chạy lệnh `npm run test:doan` để xuất trọn bộ video `.webm` chuẩn HD)*']),
        '',
      ];
      fs.writeFileSync(THESIS_REPORT_PATH, thesisMd.join('\n'), 'utf8');
      console.log(`  Báo cáo Chế độ Đồ Án    : ${THESIS_REPORT_PATH}`);
    }

    if (failed > 0) process.exitCode = 1;
  } finally {
    for (const item of spawnedChildren.reverse()) {
      if (process.platform === 'win32') {
        try {
          spawnSync('taskkill', ['/PID', String(item.proc.pid), '/T', '/F'], { stdio: 'ignore' });
        } catch {
          // ignore taskkill error
        }
      }
      try {
        item.proc.kill();
      } catch {
        // ignore kill error
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
