/**
 * @file tests/e2e/cdp.mjs
 * Zero-dependency headless Chromium CDP driver for Windows & Node v24.
 * Uses --remote-debugging-pipe (\0-delimited JSON-RPC over stdio[3]/stdio[4]).
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';

const CHROME_CANDIDATES = [
  process.env.E2E_CHROME_PATH,
  'C:\\Users\\THAN\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

export function findChromeExecutable() {
  for (const p of CHROME_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`No Chromium/Chrome/Edge executable found. Checked: ${CHROME_CANDIDATES.join(', ')}`);
}

export class CdpClient {
  constructor({ chromePath, userDataDir }) {
    this.chromePath = chromePath;
    this.userDataDir = userDataDir;
    this.proc = null;
    this.nextId = 1;
    this.pending = new Map();
    this.eventListeners = new Map();
    this.sessionId = null;
    this.targetId = null;
    this.closed = false;
    this.stderrLogs = [];
    this.runtimeExceptions = [];
    this.consoleErrors = [];
    this.http5xx = [];
    this._readBuf = Buffer.alloc(0);
  }

  async launch() {
    const args = [
      '--headless=new',
      '--remote-debugging-pipe',
      `--user-data-dir=${this.userDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--disable-extensions',
      '--no-sandbox',
      '--disable-background-timer-throttling',
      '--disable-dev-shm-usage',
      'about:blank',
    ];

    this.proc = spawn(this.chromePath, args, {
      stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe'],
    });

    this.proc.stderr.on('data', (d) => {
      this.stderrLogs.push(d.toString('utf8'));
    });

    const pipeWrite = this.proc.stdio[3];
    const pipeRead = this.proc.stdio[4];
    if (!pipeWrite || !pipeRead) {
      throw new Error('Chromium did not expose stdio[3]/stdio[4] for --remote-debugging-pipe');
    }
    this.pipeWrite = pipeWrite;
    this.pipeRead = pipeRead;

    pipeRead.on('data', (chunk) => {
      this._readBuf = Buffer.concat([this._readBuf, chunk]);
      let idx;
      while ((idx = this._readBuf.indexOf(0)) !== -1) {
        const raw = this._readBuf.subarray(0, idx).toString('utf8');
        this._readBuf = this._readBuf.subarray(idx + 1);
        if (raw) this._onMessage(raw);
      }
    });

    this.proc.on('exit', () => {
      this.closed = true;
      for (const [, p] of this.pending) {
        clearTimeout(p.timer);
        p.reject(new Error('Chromium process exited while CDP command was pending'));
      }
      this.pending.clear();
    });

    // Attach to a clean page target
    const { targetId } = await this.sendBrowser('Target.createTarget', { url: 'about:blank' });
    this.targetId = targetId;
    const { sessionId } = await this.sendBrowser('Target.attachToTarget', { targetId, flatten: true });
    this.sessionId = sessionId;

    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Network.enable');
    await this.send('DOM.enable');

    this.on('Runtime.exceptionThrown', (params) => {
      const details = params?.exceptionDetails;
      const msg = details?.exception?.description || details?.text || 'Unknown Runtime exception';
      this.runtimeExceptions.push({ ts: Date.now(), message: msg, url: details?.url || '' });
    });

    this.on('Runtime.consoleAPICalled', (params) => {
      if (params?.type === 'error') {
        const text = (params.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
        this.consoleErrors.push({ ts: Date.now(), text });
      }
    });

    this.on('Network.responseReceived', (params) => {
      const status = params?.response?.status;
      if (typeof status === 'number' && status >= 500) {
        this.http5xx.push({ ts: Date.now(), status, url: params.response.url });
      }
    });
  }

  _onMessage(raw) {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    if (msg.id !== undefined) {
      const p = this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      clearTimeout(p.timer);
      if (msg.error) {
        p.reject(new Error(`CDP ${p.method} error (${msg.error.code}): ${msg.error.message}`));
      } else {
        p.resolve(msg.result || {});
      }
      return;
    }
    if (msg.method) {
      const set = this.eventListeners.get(msg.method);
      if (set) {
        for (const fn of set) {
          try { fn(msg.params || {}, msg.sessionId); } catch {}
        }
      }
    }
  }

  on(method, fn) {
    let set = this.eventListeners.get(method);
    if (!set) {
      set = new Set();
      this.eventListeners.set(method, set);
    }
    set.add(fn);
    return () => set.delete(fn);
  }

  _rawSend(payload, method, timeoutMs = 15000) {
    if (this.closed || !this.pipeWrite || this.pipeWrite.destroyed) {
      return Promise.reject(new Error(`CDP pipe closed before ${method}`));
    }
    const id = this.nextId++;
    const frame = JSON.stringify({ ...payload, id }) + '\0';
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout after ${timeoutMs}ms on ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer, method });
      this.pipeWrite.write(frame, 'utf8');
    });
  }

  sendBrowser(method, params = {}, timeoutMs = 15000) {
    return this._rawSend({ method, params }, method, timeoutMs);
  }

  send(method, params = {}, timeoutMs = 15000) {
    return this._rawSend({ method, params, sessionId: this.sessionId }, method, timeoutMs);
  }

  clearDiagnostics() {
    this.runtimeExceptions = [];
    this.consoleErrors = [];
    this.http5xx = [];
  }

  async setViewport(width, height, deviceScaleFactor = 2, mobile = true) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor,
      mobile,
    });
  }

  async setAuthCookie(baseUrl, token) {
    const ok = await this.send('Network.setCookie', {
      name: 'hoc_session',
      value: token,
      url: baseUrl,
      httpOnly: true,
      path: '/',
      sameSite: 'Lax',
    });
    if (!ok || ok.success === false) {
      throw new Error('Failed to set hoc_session cookie via CDP');
    }
  }

  async clearSession() {
    await this.send('Network.clearBrowserCookies');
    try {
      await this.evalJs(() => {
        try { localStorage.clear(); } catch {}
        try { sessionStorage.clear(); } catch {}
      });
    } catch {
      // Ignore if on about:blank where storage is inaccessible
    }
  }

  async evalJs(fnOrExpr, ...args) {
    const expression = typeof fnOrExpr === 'function'
      ? `(${fnOrExpr.toString()})(...${JSON.stringify(args)})`
      : String(fnOrExpr);
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      const desc = res.exceptionDetails.exception?.description || res.exceptionDetails.text || 'Eval exception';
      throw new Error(`Browser eval error: ${desc}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async waitForCondition(fnOrExpr, timeoutMs = 10000, pollMs = 80, ...args) {
    const deadline = Date.now() + timeoutMs;
    let lastErr = null;
    while (Date.now() < deadline) {
      try {
        const val = await this.evalJs(fnOrExpr, ...args);
        if (val) return val;
      } catch (err) {
        lastErr = err;
      }
      await new Promise((r) => setTimeout(r, pollMs));
    }
    throw new Error(`waitForCondition timed out after ${timeoutMs}ms${lastErr ? ` (${lastErr.message})` : ''}`);
  }

  async goto(url, { timeoutMs = 15000 } = {}) {
    await this.send('Page.navigate', { url }, timeoutMs);
    await this.waitForCondition(() => document.readyState === 'complete', timeoutMs, 60);
  }

  async reload({ timeoutMs = 15000 } = {}) {
    await this.send('Page.reload', { ignoreCache: false }, timeoutMs);
    await this.waitForCondition(() => document.readyState === 'complete', timeoutMs, 60);
  }

  async waitForAppSettled({ expectAdmin = false, allowDenied = false, dismissGuide = true, selector = null, timeoutMs = 12000 } = {}) {
    await this.waitForCondition(
      (expAdm, allowDen, dismissGd, sel) => {
        if (!document.body || !document.body.classList.contains('in-app')) return false;
        const main = document.getElementById('main');
        if (!main || main.children.length === 0 || !main.textContent.trim()) return false;
        if (dismissGd) {
          const gdSkip = document.getElementById('gdSkip') || document.getElementById('gsSkip');
          if (gdSkip) gdSkip.click();
        }
        if (document.querySelector('.boot')) return false;
        const loaders = main.querySelectorAll('.skel, .sk, .lx-loading, .sw-loading, .ad-skel');
        for (const l of loaders) {
          if (l.offsetParent !== null || getComputedStyle(l).display !== 'none') return false;
        }
        if (expAdm) {
          const hasAx = document.body.classList.contains('ax-on');
          const hasDenied = allowDen && !!main.querySelector('.sheet.empty');
          if (!hasAx && !hasDenied) return false;
        }
        if (sel && !document.querySelector(sel)) return false;
        return true;
      },
      timeoutMs,
      80,
      expectAdmin,
      allowDenied,
      dismissGuide,
      selector
    );
    // Let microtasks/MutationObservers (e.g. i18n) flush
    await new Promise((r) => setTimeout(r, 120));
  }

  async waitForLandingSettled({ selector = '#landingPage', timeoutMs = 12000 } = {}) {
    await this.waitForCondition(
      (sel) => {
        if (document.readyState !== 'complete') return false;
        if (document.querySelector('.boot')) return false;
        return !!document.querySelector(sel);
      },
      timeoutMs,
      80,
      selector
    );
    await new Promise((r) => setTimeout(r, 120));
  }

  async click(selector) {
    const found = await this.evalJs((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      el.click();
      return true;
    }, selector);
    if (!found) {
      throw new Error(`click: element not found for selector "${selector}"`);
    }
    await new Promise((r) => setTimeout(r, 80));
  }

  async clickText(selector, text) {
    const found = await this.evalJs((sel, txt) => {
      const els = [...document.querySelectorAll(sel)];
      const match = els.find((el) => {
        const s = getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden') return false;
        return (el.textContent || '').trim().includes(txt);
      });
      if (!match) return false;
      match.scrollIntoView({ block: 'center', inline: 'center' });
      match.click();
      return true;
    }, selector, text);
    if (!found) {
      throw new Error(`clickText: no visible "${selector}" matching "${text}"`);
    }
    await new Promise((r) => setTimeout(r, 80));
  }

  async fill(selector, value) {
    const found = await this.evalJs((sel, val) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      el.focus();
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }, selector, value);
    if (!found) {
      throw new Error(`fill: input not found for selector "${selector}"`);
    }
    await new Promise((r) => setTimeout(r, 50));
  }

  async capturePng(outPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' }, 15000);
    const buf = Buffer.from(res.data, 'base64');
    // Verify PNG magic signature
    const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    if (buf.length < 100 || !buf.subarray(0, 8).equals(sig)) {
      throw new Error(`Invalid PNG buffer captured (length=${buf.length})`);
    }
    if (outPath) {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, buf);
    }
    return { bytes: buf.length, outPath };
  }

  async close() {
    if (!this.proc) return;
    if (!this.closed) {
      try {
        await Promise.race([
          this.sendBrowser('Browser.close', {}, 2000),
          new Promise((r) => setTimeout(r, 2000)),
        ]);
      } catch {}
    }
    try { this.pipeWrite?.destroy(); } catch {}
    try { this.pipeRead?.destroy(); } catch {}

    const waitExit = Date.now() + 2000;
    while (!this.closed && Date.now() < waitExit) {
      await new Promise((r) => setTimeout(r, 80));
    }
    if (!this.closed && this.proc.pid) {
      if (process.platform === 'win32') {
        try {
          execFileSync('taskkill', ['/F', '/T', '/PID', String(this.proc.pid)], { stdio: 'ignore' });
        } catch {}
      } else {
        try { this.proc.kill('SIGKILL'); } catch {}
      }
      await new Promise((r) => setTimeout(r, 200));
    }
  }
}

export async function launchCdpBrowser(userDataDir) {
  const chromePath = findChromeExecutable();
  const cdp = new CdpClient({ chromePath, userDataDir });
  await cdp.launch();
  return cdp;
}
