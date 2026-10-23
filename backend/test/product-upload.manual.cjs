// Upload a disposable PNG through the vendor API, verify serving, then remove it.
require('dotenv').config();
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { request } = require('../../frontend/node_modules/playwright');

async function main() {
  const api = await request.newContext({ baseURL: 'http://localhost:3000' });
  let uploadedPath;
  try {
    const login = await api.post('/api/auth/sign-in', {
      headers: { 'x-app-role': 'vendor' },
      data: { email: process.env.MIVA_TEST_VENDOR_EMAIL || 'vendor1@miva.vn', password: process.env.MIVA_TEST_VENDOR_PASSWORD || 'admin123' },
    });
    assert.equal(login.status(), 201);
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l1sAAAAASUVORK5CYII=', 'base64');
    const upload = await api.post('/api/products/upload-image', {
      headers: { 'x-app-role': 'vendor' },
      multipart: { files: { name: 'api-upload-test.png', mimeType: 'image/png', buffer: png } },
    });
    assert.equal(upload.status(), 201, await upload.text());
    const body = await upload.json();
    const url = (body.data ?? body).url;
    assert.match(url, /^\/uploads\/products\/[a-zA-Z0-9_.-]+\.png$/);
    const root = path.resolve('uploads/products');
    uploadedPath = path.resolve(root, path.basename(url));
    assert.equal(path.dirname(uploadedPath), root);
    const served = await api.get(url);
    assert.equal(served.status(), 200);
    assert.deepEqual(await served.body(), png);

    const invalid = await api.post('/api/products/upload-image', {
      headers: { 'x-app-role': 'vendor' },
      multipart: { files: { name: 'api-upload-test.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') } },
    });
    assert.equal(invalid.status(), 400, await invalid.text());
    console.log('PASS: PNG upload and static download work; invalid MIME rejected');
  } finally {
    if (uploadedPath) await fs.unlink(uploadedPath);
    await api.dispose();
  }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
