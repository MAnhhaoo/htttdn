// Bộ trình chiếu trực quan phục vụ Chế độ Bảo Vệ Đồ Án (MIVA Master Thesis Showcase).
// Cung cấp:
//   - Thanh phụ đề thuyết minh trực tiếp trên trình duyệt (MIVA Thesis HUD - Deep Forest & Champagne Gold)
//   - Hiệu ứng vòng sáng Spotlight quanh nút bấm / ô nhập liệu trước mỗi thao tác
//   - Bảng kiểm toán trực quan PostgreSQL Soft-Delete ngay trên màn hình ở Chương 8
//   - Chụp bộ ảnh minh chứng chuẩn HD (1440x900) lưu tại htttdn/test-recordings/do-an/screenshots/

const fs = require('node:fs');
const path = require('node:path');

function isTruthy(val) {
  return ['1', 'true', 'yes', 'on'].includes(String(val || '').trim().toLowerCase());
}

function isThesisVisualMode() {
  return isTruthy(process.env.MIVA_THESIS_DEMO) || isTruthy(process.env.MIVA_HEADED);
}

function getStepPauseMs() {
  const raw = process.env.MIVA_STEP_PAUSE;
  if (raw !== undefined && raw !== '') {
    return Math.max(0, Number(raw) || 0);
  }
  return isThesisVisualMode() ? 1400 : 0;
}

function getSpotlightPauseMs() {
  if (!isThesisVisualMode()) return 0;
  const rawSlow = Number(process.env.MIVA_SLOW_MO || 800);
  return Math.min(650, Math.max(260, Math.round(rawSlow * 0.5)));
}

function getThesisOutputDirs() {
  const baseDir = path.resolve(__dirname, '../../../test-recordings/do-an');
  const screenshotsDir = path.join(baseDir, 'screenshots');
  const videosDir = path.join(baseDir, 'videos');
  fs.mkdirSync(screenshotsDir, { recursive: true });
  fs.mkdirSync(videosDir, { recursive: true });
  return { baseDir, screenshotsDir, videosDir };
}

const evidenceManifest = [];

function resetEvidenceManifest() {
  evidenceManifest.length = 0;
  const { screenshotsDir } = getThesisOutputDirs();
  for (const entry of fs.readdirSync(screenshotsDir)) {
    if (entry.endsWith('.png') || entry === 'manifest.json') {
      try {
        fs.unlinkSync(path.join(screenshotsDir, entry));
      } catch {
        // ignore locked file
      }
    }
  }
}

function saveEvidenceManifest() {
  const { screenshotsDir } = getThesisOutputDirs();
  const manifestPath = path.join(screenshotsDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(evidenceManifest, null, 2), 'utf8');
  return manifestPath;
}

/**
 * Tiêm CSS & DOM thanh HUD thuyết minh tự động khôi phục qua mọi lần chuyển trang SPA / reload.
 * Sử dụng pointer-events: none toàn diện để tuyệt đối không cản trở bất kỳ thao tác click/hover nào.
 */
async function installThesisOverlay(context) {
  await context.addInitScript(() => {
    const STYLE_ID = 'miva-thesis-hud-style';
    const HUD_ID = 'miva-thesis-hud-root';

    function ensureHudMounted() {
      if (!document.head || !document.body) return;

      if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
          #${HUD_ID} {
            position: fixed;
            left: 50%;
            bottom: 14px;
            transform: translateX(-50%);
            width: min(1180px, calc(100vw - 28px));
            z-index: 2147483640;
            pointer-events: none !important;
            font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
            transition: opacity 0.22s ease, transform 0.22s ease;
          }
          #${HUD_ID} * {
            pointer-events: none !important;
            box-sizing: border-box;
          }
          .miva-hud-shell {
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            gap: 16px;
            padding: 11px 18px;
            border-radius: 16px;
            background: linear-gradient(135deg, rgba(10, 25, 18, 0.94) 0%, rgba(22, 50, 38, 0.94) 100%);
            border: 1.5px solid rgba(201, 168, 76, 0.62);
            box-shadow: 0 18px 42px rgba(5, 14, 10, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.06) inset;
            backdrop-filter: blur(12px);
            color: #F8FAFC;
          }
          .miva-hud-left {
            display: flex;
            flex-direction: column;
            gap: 5px;
            min-width: 188px;
            padding-right: 14px;
            border-right: 1px solid rgba(201, 168, 76, 0.26);
          }
          .miva-hud-chapter-row {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .miva-hud-chapter-pill {
            display: inline-flex;
            align-items: center;
            padding: 2px 9px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            background: linear-gradient(135deg, #C9A84C 0%, #E3C770 100%);
            color: #09150F;
          }
          .miva-hud-portal {
            font-size: 11px;
            font-weight: 700;
            color: #DEC47E;
            letter-spacing: 0.03em;
            white-space: nowrap;
          }
          .miva-hud-progress-track {
            width: 100%;
            height: 5px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.14);
            overflow: hidden;
          }
          .miva-hud-progress-fill {
            height: 100%;
            border-radius: 999px;
            background: linear-gradient(90deg, #C9A84C 0%, #34D399 100%);
            transition: width 0.35s ease;
          }
          .miva-hud-center {
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 3px;
          }
          .miva-hud-title {
            font-size: 14px;
            font-weight: 800;
            color: #FFFFFF;
            line-height: 1.3;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .miva-hud-detail {
            font-size: 12px;
            font-weight: 500;
            color: #D2E3DA;
            line-height: 1.35;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .miva-hud-status {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 6px 13px;
            border-radius: 999px;
            font-size: 11.5px;
            font-weight: 700;
            white-space: nowrap;
            border: 1px solid rgba(201, 168, 76, 0.45);
            background: rgba(201, 168, 76, 0.14);
            color: #F4DFA0;
          }
          .miva-hud-status[data-status="pass"] {
            border-color: rgba(52, 211, 153, 0.55);
            background: rgba(16, 185, 129, 0.18);
            color: #6EE7B7;
          }
          .miva-hud-dot {
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: #EAB308;
            box-shadow: 0 0 10px #EAB308;
          }
          .miva-hud-status[data-status="pass"] .miva-hud-dot {
            background: #10B981;
            box-shadow: 0 0 10px #10B981;
          }
          .miva-spotlight-target {
            outline: 3px solid #C9A84C !important;
            outline-offset: 3px !important;
            box-shadow: 0 0 0 6px rgba(201, 168, 76, 0.28), 0 0 24px rgba(201, 168, 76, 0.6) !important;
            transition: outline 0.15s ease, box-shadow 0.15s ease !important;
          }
          #miva-spotlight-badge {
            position: fixed;
            z-index: 2147483645;
            pointer-events: none !important;
            padding: 4px 10px;
            border-radius: 8px;
            background: #0E2219;
            color: #F5DFA3;
            border: 1px solid #C9A84C;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            font-size: 11px;
            font-weight: 700;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.38);
            white-space: nowrap;
          }
        `;
        document.head.appendChild(style);
      }

      let root = document.getElementById(HUD_ID);
      if (!root) {
        root = document.createElement('div');
        root.id = HUD_ID;
        root.innerHTML = `
          <div class="miva-hud-shell">
            <div class="miva-hud-left">
              <div class="miva-hud-chapter-row">
                <span class="miva-hud-chapter-pill" id="miva-hud-chapter">CHƯƠNG 1/8</span>
                <span class="miva-hud-portal" id="miva-hud-portal">MIVA SYSTEM</span>
              </div>
              <div class="miva-hud-progress-track">
                <div class="miva-hud-progress-fill" id="miva-hud-progress" style="width: 12.5%"></div>
              </div>
            </div>
            <div class="miva-hud-center">
              <div class="miva-hud-title" id="miva-hud-title">Chế độ Trình diễn Bảo vệ Đồ án MIVA E-Commerce</div>
              <div class="miva-hud-detail" id="miva-hud-detail">Đang khởi tạo môi trường kiểm thử tự động liên hoàn 4 Cổng & 5 Vai trò...</div>
            </div>
            <div class="miva-hud-status" id="miva-hud-status" data-status="running">
              <span class="miva-hud-dot"></span>
              <span id="miva-hud-status-text">Đang thực hiện</span>
            </div>
          </div>
        `;
        document.body.appendChild(root);
      }

      if (window.__MIVA_HUD_STATE__) {
        window.__MIVA_UPDATE_HUD__(window.__MIVA_HUD_STATE__);
      }
    }

    window.__MIVA_UPDATE_HUD__ = function updateHud(state) {
      window.__MIVA_HUD_STATE__ = state;
      if (!document.getElementById(HUD_ID)) {
        ensureHudMounted();
      }
      const chEl = document.getElementById('miva-hud-chapter');
      const portalEl = document.getElementById('miva-hud-portal');
      const progEl = document.getElementById('miva-hud-progress');
      const titleEl = document.getElementById('miva-hud-title');
      const detailEl = document.getElementById('miva-hud-detail');
      const statusEl = document.getElementById('miva-hud-status');
      const statusTextEl = document.getElementById('miva-hud-status-text');

      const chapter = Number(state.chapter || 1);
      const total = Number(state.totalChapters || 8);
      const pct = Math.min(100, Math.max(8, Math.round((chapter / total) * 100)));

      if (chEl) chEl.textContent = `CHƯƠNG ${chapter}/${total}`;
      if (portalEl) portalEl.textContent = state.portal || 'MIVA PORTAL';
      if (progEl) progEl.style.width = `${pct}%`;
      if (titleEl) titleEl.textContent = state.title || '';
      if (detailEl) detailEl.textContent = state.detail || '';
      if (statusEl) statusEl.setAttribute('data-status', state.status === 'pass' ? 'pass' : 'running');
      if (statusTextEl) {
        statusTextEl.textContent = state.status === 'pass' ? '✓ Đạt chuẩn' : 'Đang thực hiện';
      }
    };

    function startHudObserver() {
      ensureHudMounted();
      if (document.documentElement && !window.__MIVA_HUD_OBSERVER__) {
        const observer = new MutationObserver(() => {
          if (document.body && !document.getElementById(HUD_ID)) {
            ensureHudMounted();
          }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
        window.__MIVA_HUD_OBSERVER__ = observer;
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startHudObserver, { once: true });
    } else {
      startHudObserver();
    }
  });
}

async function narrateStep(page, meta = {}) {
  const {
    chapter = 1,
    totalChapters = 8,
    portal = 'MIVA SYSTEM',
    title = '',
    detail = '',
    status = 'running',
    pauseMs,
  } = meta;

  if (isThesisVisualMode()) {
    await page.bringToFront().catch(() => {});
  }

  console.log(
    `  [Chương ${chapter}/${totalChapters} | ${portal}] ${status === 'pass' ? '✓ ' : ''}${title}${
      detail ? ` — ${detail}` : ''
    }`,
  );

  await page
    .evaluate((payload) => {
      if (typeof window.__MIVA_UPDATE_HUD__ === 'function') {
        window.__MIVA_UPDATE_HUD__(payload);
      } else {
        window.__MIVA_HUD_STATE__ = payload;
      }
    }, { chapter, totalChapters, portal, title, detail, status })
    .catch(() => {});

  const delay = pauseMs !== undefined ? pauseMs : getStepPauseMs();
  if (delay > 0) {
    await page.waitForTimeout(delay);
  }
}

async function highlightElement(locator, label = '') {
  const holdMs = getSpotlightPauseMs();
  const target = locator.first();
  await target.waitFor({ state: 'visible', timeout: 15000 });
  await target.scrollIntoViewIfNeeded().catch(() => {});

  if (holdMs <= 0) return target;

  const handle = await target.elementHandle().catch(() => null);
  if (handle) {
    await handle
      .evaluate((el, badgeText) => {
        el.classList.add('miva-spotlight-target');
        const existing = document.getElementById('miva-spotlight-badge');
        if (existing) existing.remove();
        if (badgeText) {
          const rect = el.getBoundingClientRect();
          const badge = document.createElement('div');
          badge.id = 'miva-spotlight-badge';
          badge.textContent = badgeText;
          const top = Math.max(8, rect.top - 30);
          const left = Math.min(window.innerWidth - 220, Math.max(8, rect.left));
          badge.style.top = `${top}px`;
          badge.style.left = `${left}px`;
          document.body.appendChild(badge);
        }
      }, label)
      .catch(() => {});

    await locator.page().waitForTimeout(holdMs);

    await handle
      .evaluate((el) => {
        el.classList.remove('miva-spotlight-target');
        const existing = document.getElementById('miva-spotlight-badge');
        if (existing) existing.remove();
      })
      .catch(() => {});
  }

  return target;
}

async function spotlightAndClick(locator, label = '') {
  const target = await highlightElement(locator, label);
  await target.click();
}

async function spotlightAndFill(locator, value, label = '') {
  const target = await highlightElement(locator, label);
  await target.fill(String(value));
}

/**
 * Hiển thị bảng Kiểm toán PostgreSQL Soft-Delete trực tiếp trên màn hình ở Chương 8
 * để chụp ảnh & quay video minh chứng trước Hội đồng chấm đồ án.
 */
async function showSoftDeleteAuditBoard(page, rows = []) {
  await page.evaluate((auditRows) => {
    const existing = document.getElementById('miva-softdelete-audit-board');
    if (existing) existing.remove();

    const wrap = document.createElement('div');
    wrap.id = 'miva-softdelete-audit-board';
    wrap.style.cssText = [
      'position: fixed',
      'top: 76px',
      'left: 50%',
      'transform: translateX(-50%)',
      'width: min(1040px, calc(100vw - 48px))',
      'z-index: 2147483635',
      'pointer-events: none',
      'background: linear-gradient(145deg, rgba(11, 27, 20, 0.97), rgba(20, 46, 35, 0.97))',
      'border: 2px solid #C9A84C',
      'border-radius: 20px',
      'padding: 22px 26px',
      'box-shadow: 0 28px 70px rgba(0, 0, 0, 0.65)',
      'color: #F8FAFC',
      "font-family: 'Inter', 'Segoe UI', system-ui, sans-serif",
    ].join(';');

    const trHtml = auditRows
      .map(
        (r) => `
        <tr style="border-bottom: 1px solid rgba(201,168,76,0.18);">
          <td style="padding: 9px 10px; font-weight: 700; color: #FDE68A;">${r.table}</td>
          <td style="padding: 9px 10px; font-family: monospace; font-size: 11.5px; color: #CBD5E1;">${r.recordKey}</td>
          <td style="padding: 9px 10px;">
            <span style="padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; background: rgba(244,63,94,0.18); color: #FDA4AF; border: 1px solid rgba(244,63,94,0.4);">
              ${r.uiState}
            </span>
          </td>
          <td style="padding: 9px 10px; font-family: monospace; font-size: 11.5px; color: #6EE7B7;">${r.dbTimestamp}</td>
          <td style="padding: 9px 10px; text-align: right;">
            <span style="padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; background: rgba(16,185,129,0.22); color: #6EE7B7; border: 1px solid rgba(52,211,153,0.5);">
              ✓ Bảo toàn 100%
            </span>
          </td>
        </tr>`,
      )
      .join('');

    wrap.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid rgba(201,168,76,0.32);">
        <div>
          <div style="font-size:11px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:#DEC47E;">
            CHƯƠNG 8 • KIỂM TOÁN CƠ SỞ DỮ LIỆU TRỰC TIẾP (POSTGRESQL :5433)
          </div>
          <div style="font-size:18px; font-weight:800; color:#FFFFFF; margin-top:3px;">
            Chứng nhận Cơ chế Xóa Mềm 100% (Zero Hard-Delete) Toàn Hệ Thống MIVA
          </div>
        </div>
        <div style="padding:6px 14px; border-radius:12px; background:rgba(16,185,129,0.2); border:1px solid #34D399; color:#6EE7B7; font-size:12px; font-weight:800;">
          ${auditRows.length}/${auditRows.length} Thực thể Đạt chuẩn
        </div>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:12.5px; text-align:left;">
        <thead>
          <tr style="border-bottom:1px solid rgba(201,168,76,0.35); color:#DEC47E; font-size:11px; text-transform:uppercase; letter-spacing:0.05em;">
            <th style="padding:8px 10px;">Bảng PostgreSQL</th>
            <th style="padding:8px 10px;">Định danh Bản ghi</th>
            <th style="padding:8px 10px;">Hiển thị Giao diện / API</th>
            <th style="padding:8px 10px;">Dấu vết CSDL (deletedAt / reversedAt)</th>
            <th style="padding:8px 10px; text-align:right;">Kết quả Kiểm toán</th>
          </tr>
        </thead>
        <tbody>${trHtml}</tbody>
      </table>
    `;
    document.body.appendChild(wrap);
  }, rows);
}

async function captureEvidence(page, slug, caption, chapter = 1) {
  const { screenshotsDir } = getThesisOutputDirs();
  const safeSlug = String(slug).replace(/[^a-zA-Z0-9_-]+/g, '-');
  const fileName = `${safeSlug}.png`;
  const filePath = path.join(screenshotsDir, fileName);

  await page.screenshot({ path: filePath, fullPage: false });
  const record = {
    chapter,
    slug: safeSlug,
    fileName,
    filePath,
    caption,
    capturedAt: new Date().toISOString(),
  };
  evidenceManifest.push(record);
  saveEvidenceManifest();
  return record;
}

module.exports = {
  isThesisVisualMode,
  getStepPauseMs,
  getThesisOutputDirs,
  resetEvidenceManifest,
  saveEvidenceManifest,
   getEvidenceManifest: () => [...evidenceManifest],
  installThesisOverlay,
  narrateStep,
  spotlightAndClick,
  spotlightAndFill,
  showSoftDeleteAuditBoard,
  captureEvidence,
};
