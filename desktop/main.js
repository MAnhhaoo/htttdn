const { app, BrowserWindow, shell, dialog } = require('electron')
const http = require('http')
const fs = require('fs')
const path = require('path')
const log = require('electron-log')
const { autoUpdater } = require('electron-updater')

// Cấu hình log cho auto-updater
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

// ---------------------------------------------------------------------------
// Cấu hình
// ---------------------------------------------------------------------------
const isDev = process.argv.includes('--dev') || !app.isPackaged && process.env.NODE_ENV === 'development'

// URL Vite dev server của folder frontend
const DEV_URL = process.env.FRONTEND_DEV_URL || 'http://localhost:5173'

// URL backend NestJS (đổi bằng biến môi trường BACKEND_URL khi deploy thật)
const BACKEND_URL = new URL(process.env.BACKEND_URL || 'http://localhost:3000')

// Thư mục chứa bản build của frontend
//  - Khi đóng gói: <resources>/web (được copy qua extraResources)
//  - Khi chạy thử local (npm start): ../frontend/dist
const WEB_DIR = app.isPackaged
  ? path.join(process.resourcesPath, 'web')
  : path.join(__dirname, '..', 'frontend', 'dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
}

// ---------------------------------------------------------------------------
// Local server (production): phục vụ file tĩnh của frontend + proxy /api, /uploads
// -> Giữ nguyên BrowserRouter và baseURL '/api' của frontend, không cần sửa code web.
// ---------------------------------------------------------------------------
function proxyToBackend(req, res) {
  const options = {
    protocol: BACKEND_URL.protocol,
    hostname: BACKEND_URL.hostname,
    port: BACKEND_URL.port || (BACKEND_URL.protocol === 'https:' ? 443 : 80),
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: BACKEND_URL.host },
  }
  const client = BACKEND_URL.protocol === 'https:' ? require('https') : http
  const proxyReq = client.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers)
    proxyRes.pipe(res)
  })
  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Không kết nối được tới backend', error: err.message }))
  })
  req.pipe(proxyReq)
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  let filePath = path.normalize(path.join(WEB_DIR, urlPath))

  // Chặn path traversal
  if (!filePath.startsWith(WEB_DIR)) {
    res.writeHead(403)
    return res.end('Forbidden')
  }

  // SPA fallback: route không có file -> index.html
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(WEB_DIR, 'index.html')
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500)
      return res.end('Không đọc được file: ' + err.message)
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    })
    res.end(data)
  })
}

function startLocalServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
        return proxyToBackend(req, res)
      }
      serveStatic(req, res)
    })
    server.on('error', reject)
    // port 0 = hệ điều hành tự chọn port trống
    server.listen(0, '127.0.0.1', () => resolve(server.address().port))
  })
}

// ---------------------------------------------------------------------------
// Cửa sổ chính
// ---------------------------------------------------------------------------
async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: 'HTTT Shop',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  // Link ra ngoài (http khác origin) -> mở bằng trình duyệt mặc định
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    await win.loadURL(DEV_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    if (!fs.existsSync(path.join(WEB_DIR, 'index.html'))) {
      await win.loadURL(
        'data:text/html;charset=utf-8,' +
          encodeURIComponent(
            '<h3>Chưa có bản build của frontend.</h3><p>Chạy <code>npm run build</code> trong folder <b>frontend</b> trước.</p>'
          )
      )
      return
    }
    const port = await startLocalServer()
    await win.loadURL(`http://127.0.0.1:${port}`)
  }
}

// Chỉ cho chạy 1 cửa sổ app
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows()
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  app.whenReady().then(() => {
    createWindow()

    // Kiểm tra bản cập nhật mới (Chỉ chạy ở bản đã đóng gói)
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify()
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  // ---------------------------------------------------------------------------
  // Sự kiện của Auto Updater
  // ---------------------------------------------------------------------------
  autoUpdater.on('update-available', () => {
    log.info('Đã tìm thấy bản cập nhật mới. Đang tải xuống...')
  })

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Đã tải xong bản cập nhật.')
    const dialogOpts = {
      type: 'info',
      buttons: ['Khởi động lại', 'Để sau'],
      title: 'Cập nhật ứng dụng',
      message: process.platform === 'win32' ? info.releaseNotes : info.releaseName,
      detail: 'Một phiên bản mới đã được tải xuống. Khởi động lại ứng dụng để áp dụng bản cập nhật.'
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
  })

  autoUpdater.on('error', message => {
    log.error('Lỗi khi cập nhật ứng dụng: ' + message)
  })
}
