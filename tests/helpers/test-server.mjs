/**
 * @file tests/helpers/test-server.mjs
 * Ephemeral test server and fetch harness for MyEvolve Study E2E testing.
 * Supports Windows Named Pipes, Unix Domain Sockets, and external TEST_BASE_URL.
 */

import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';

export function createPipePath() {
  const id = `study-test-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;
  return os.platform() === 'win32'
    ? `\\\\.\\pipe\\${id}`
    : path.join(os.tmpdir(), `${id}.sock`);
}

let activeInstance = null;

export async function getTestServer() {
  if (activeInstance) {
    return activeInstance;
  }

  // Mode B: External server mode via TEST_BASE_URL
  if (process.env.TEST_BASE_URL) {
    const baseUrl = process.env.TEST_BASE_URL.replace(/\/+$/, '');
    activeInstance = {
      baseUrl,
      pipePath: null,
      server: null,
      fetch: async (endpoint, options = {}) => {
        const fullUrl = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
        const res = await globalThis.fetch(fullUrl, options);
        const text = await res.text();
        return {
          status: res.status,
          statusText: res.statusText,
          ok: res.ok,
          headers: Object.fromEntries(res.headers.entries()),
          text: async () => text,
          json: async () => JSON.parse(text),
          body: text
        };
      },
      close: async () => {
        activeInstance = null;
      }
    };
    return activeInstance;
  }

  // Mode A: In-process ephemeral IPC socket / Named Pipe mode
  const pipePath = createPipePath();
  let capturedServer = null;

  const origListen = http.Server.prototype.listen;
  http.Server.prototype.listen = function(...args) {
    capturedServer = this;
    return origListen.call(this, pipePath);
  };

  // Dữ liệu test luôn nằm trong thư mục tạm, không bao giờ trong data/ của repo (không ghi đè DB thật của máy dev)
  process.env.DATA_DIR = process.env.DATA_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'liferivo-test-data-'));
  // Test cần người đăng ký đầu tiên là admin (fixture); production không bật biến này (AUDIT P1-5)
  process.env.ALLOW_FIRST_USER_ADMIN = process.env.ALLOW_FIRST_USER_ADMIN || '1';

  try {
    const serverPath = path.resolve(process.cwd(), 'server.js');
    await import(pathToFileURL(serverPath).href);
  } finally {
    http.Server.prototype.listen = origListen;
  }

  if (capturedServer) {
    capturedServer.on('connection', (socket) => {
      try {
        Object.defineProperty(socket, 'remoteAddress', {
          value: '127.0.0.1',
          configurable: true,
          writable: true
        });
      } catch (e) {
        // Ignore if unable to override
      }
    });
  }

  if (capturedServer && !capturedServer.listening) {
    await new Promise((resolve) => capturedServer.once('listening', resolve));
  } else {
    // Small delay to ensure pipe listener is ready
    await new Promise((r) => setTimeout(r, 200));
  }

  async function testFetch(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      const headers = { ...(options.headers || {}) };
      let bodyData = null;

      if (options.body !== undefined && options.body !== null) {
        if (typeof options.body === 'string') {
          bodyData = options.body;
        } else {
          bodyData = JSON.stringify(options.body);
          if (!headers['Content-Type'] && !headers['content-type']) {
            headers['Content-Type'] = 'application/json';
          }
        }
        if (!headers['Content-Length'] && !headers['content-length']) {
          headers['Content-Length'] = Buffer.byteLength(bodyData);
        }
      }

      const reqPath = endpoint.startsWith('http://') || endpoint.startsWith('https://')
        ? new URL(endpoint).pathname + new URL(endpoint).search
        : endpoint;

      const req = http.request({
        socketPath: pipePath,
        path: reqPath,
        method: options.method || 'GET',
        headers
      }, (res) => {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          let buf = Buffer.concat(chunks);
          const enc = res.headers['content-encoding'];
          try {
            if (enc === 'gzip') buf = zlib.gunzipSync(buf);
            else if (enc === 'br') buf = zlib.brotliDecompressSync(buf);
          } catch (e) {
            // Keep original buffer if decompression fails
          }
          const text = buf.toString('utf8');
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            headers: res.headers,
            text: async () => text,
            json: async () => JSON.parse(text),
            buffer: async () => buf,
            body: text
          });
        });
      });

      req.on('error', reject);
      if (bodyData) {
        req.write(bodyData);
      }
      req.end();
    });
  }

  activeInstance = {
    server: capturedServer,
    pipePath,
    baseUrl: null,
    fetch: testFetch,
    close: async () => {
      if (capturedServer) {
        await new Promise((resolve) => capturedServer.close(resolve));
      }
      activeInstance = null;
    }
  };

  return activeInstance;
}
