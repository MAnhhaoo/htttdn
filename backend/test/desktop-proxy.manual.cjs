// Exercise the desktop app's local HTTP and Socket.IO proxy without opening a window.
// Run with the backend and a built frontend available.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');
const { io } = require('../../frontend/node_modules/socket.io-client');

async function main() {
  const desktopDir = path.resolve(__dirname, '../../desktop');
  let server;
  const app = { isPackaged: false, requestSingleInstanceLock: () => false, quit() {} };
  const log = { transports: { file: {} } };
  const context = {
    __dirname: desktopDir, process, URL, console,
    require(name) {
      if (name === 'electron') return { app };
      if (name === 'electron-log') return log;
      if (name === 'electron-updater') return { autoUpdater: {} };
      if (name === 'http') return { ...http, createServer(...args) { server = http.createServer(...args); return server; } };
      return require(name);
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(desktopDir, 'main.js'), 'utf8') + '\nthis.startServer = startLocalServer;', context);
  const port = await context.startServer();
  const base = `http://127.0.0.1:${port}`;
  async function socketReady(transport) {
    const socket = io(`${base}/realtime`, { transports: [transport], auth: { role: 'guest' }, reconnection: false });
    try {
      const role = await Promise.race([
        new Promise((resolve, reject) => {
          socket.once('realtime:ready', payload => resolve(payload.role));
          socket.once('connect_error', reject);
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`${transport} timed out`)), 8000)),
      ]);
      assert.equal(role, 'guest');
    } finally {
      socket.disconnect();
    }
  }
  try {
    assert.equal((await fetch(base)).status, 200);
    assert.equal((await fetch(`${base}/products`)).status, 200);
    assert.equal((await fetch(`${base}/api/health`)).status, 200);
    await socketReady('polling');
    await socketReady('websocket');
    console.log('PASS: desktop built pages, API proxy, Socket.IO polling and WebSocket');
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
