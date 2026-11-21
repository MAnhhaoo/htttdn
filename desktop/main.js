const { app, BrowserWindow, shell, dialog } = require('electron')
const http = require('http')
const https = require('https')
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
const isDev = process.argv.includes('--dev') || (!app.isPackaged && process.env.NODE_ENV === 'development')

// URL Vite dev server của folder frontend
const DEV_URL = process.env.FRONTEND_DEV_URL || 'http://localhost:5173'

// URL backend NestJS (đổi bằng biến môi trường BACKEND_URL khi deploy thật)
const BACKEND_URL = new URL(process.env.BACKEND_URL || 'http://localhost:3000')
const isHttpsBackend = BACKEND_URL.protocol === 'https:'
const proxyClient = isHttpsBackend ? https : http
const proxyAgent = new proxyClient.Agent({ keepAlive: true, maxSockets: 32 })

// Thư mục chứa bản build của frontend
//  - Khi đóng gói: <resources>/web (được copy qua extraResources)
//  - Khi chạy thử local (npm start): ../frontend/dist
const WEB_DIR = path.resolve(
  app.isPackaged
    ? path.join(process.resourcesPath, 'web')
    : path.join(__dirname, '..', 'frontend', 'dist')
)

let localServer = null
let localServerPort = null

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
// Local server (production): phục vụ file tĩnh của frontend + proxy API/realtime
// -> Giữ nguyên BrowserRouter và baseURL '/api' của frontend, không cần sửa code web.
// ---------------------------------------------------------------------------
function buildProxyHeaders(reqHeaders) {
  const headers = { ...reqHeaders, host: BACKEND_URL.host }
  if (typeof headers.origin === 'string' && /^http:\/\/127\.0\.0\.1:\d+$/i.test(headers.origin)) {
    delete headers.origin
  }
  return headers
}

function proxyToBackend(req, res) {
  const options = {
    protocol: BACKEND_URL.protocol,
    hostname: BACKEND_URL.hostname,
    port: BACKEND_URL.port || (isHttpsBackend ? 443 : 80),
    path: req.url,
    method: req.method,
    headers: buildProxyHeaders(req.headers),
    agent: proxyAgent,
    timeout: 30000,
  }
  const proxyReq = proxyClient.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers)
    proxyRes.pipe(res)
  })
  proxyReq.on('timeout', () => {
    proxyReq.destroy(new Error('Backend proxy timeout'))
  })
  proxyReq.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
    }
    if (!res.writableEnded) {
      res.end(JSON.stringify({ message: 'Không kết nối được tới backend', error: err.message }))
    }
  })
  req.on('aborted', () => proxyReq.destroy())
  req.pipe(proxyReq)
}

function serveStatic(req, res) {
  let urlPath = '/'
  try {
    urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  } catch {
    res.writeHead(400)
    return res.end('Bad Request')
  }

  let filePath = path.resolve(WEB_DIR, '.' + urlPath)
  const rel = path.relative(WEB_DIR, filePath)

  // Chặn path traversal an toàn (kể cả thư mục anh em cùng tiền tố)
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    res.writeHead(403)
    return res.end('Forbidden')
  }

  // SPA fallback: route không có file -> index.html
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(WEB_DIR, 'index.html')
  }

  const ext = path.extname(filePath).toLowerCase()
  const isHashedAsset = urlPath.startsWith('/assets/') && ext !== '.html'
  const cacheControl =
    ext === '.html'
      ? 'no-cache, no-store, must-revalidate'
      : isHashedAsset
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=3600'

  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': cacheControl,
  })
  const stream = fs.createReadStream(filePath)
  stream.on('error', (err) => {
    if (!res.headersSent) res.writeHead(500)
    if (!res.writableEnded) res.end('Không đọc được file: ' + err.message)
  })
  stream.pipe(res)
}

function ensureLocalServer() {
  if (localServer && localServerPort) {
    return Promise.resolve(localServerPort)
  }
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.url.startsWith('/api') || req.url.startsWith('/uploads') || req.url.startsWith('/socket.io')) {
        return proxyToBackend(req, res)
      }
      serveStatic(req, res)
    })
    server.on('upgrade', (req, socket, head) => {
      if (!req.url.startsWith('/socket.io')) return socket.destroy()

      const proxyReq = proxyClient.request({
        protocol: BACKEND_URL.protocol,
        hostname: BACKEND_URL.hostname,
        port: BACKEND_URL.port || (isHttpsBackend ? 443 : 80),
        path: req.url,
        method: req.method,
        headers: buildProxyHeaders(req.headers),
      })
      proxyReq.on('upgrade', (response, upstream, upstreamHead) => {
        socket.write(`HTTP/1.1 ${response.statusCode} ${response.statusMessage}\r\n`)
        for (const [name, value] of Object.entries(response.headers)) {
          socket.write(`${name}: ${value}\r\n`)
        }
        socket.write('\r\n')
        if (head.length) upstream.write(head)
        if (upstreamHead.length) socket.write(upstreamHead)
        upstream.pipe(socket).pipe(upstream)
      })
      proxyReq.on('response', (response) => {
        socket.end(`HTTP/1.1 ${response.statusCode} ${response.statusMessage}\r\n\r\n`)
      })
      proxyReq.on('error', () => socket.destroy())
      socket.on('error', () => proxyReq.destroy())
      proxyReq.end()
    })
    server.on('error', reject)
    // port 0 = hệ điều hành tự chọn port trống
    server.listen(0, '127.0.0.1', () => {
      localServer = server
      localServerPort = server.address().port
      resolve(localServerPort)
    })
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
    show: false,
    backgroundColor: '#faf8f5',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  // Link ra ngoài (chỉ cho phép http/https) -> mở bằng trình duyệt mặc định
  win.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        shell.openExternal(url)
      }
    } catch {
      // ignore invalid URLs
    }
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
    const port = await ensureLocalServer()
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

    // Chỉ kiểm tra cập nhật ở bản đã đóng gói (.exe/.dmg)
    if (app.isPackaged) {
      autoUpdater.checkForUpdatesAndNotify()
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('before-quit', () => {
    if (localServer) {
      localServer.close()
      localServer = null
      localServerPort = null
    }
    proxyAgent.destroy()
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
      detail: 'Một phiên bản mới đã được tải xuống. Khởi động lại ứng dụng để áp dụng bản cập nhật.',
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
  })

  autoUpdater.on('error', (message) => {
    log.error('Lỗi khi cập nhật ứng dụng: ' + message)
  })
}
