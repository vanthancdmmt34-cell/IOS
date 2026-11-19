/**
 * @file tests/e2e/helpers.mjs
 * Shared E2E browser navigation, role switching, viewport, DOM/style inspection,
 * and PNG screenshot helpers for Tiers 1-4.
 */

import assert from 'node:assert/strict';
import path from 'node:path';

export const VIEWPORTS = {
  mobile: { width: 390, height: 844, dpr: 3, isMobile: true },
  narrow: { width: 320, height: 844, dpr: 2, isMobile: true },
  tablet: { width: 900, height: 700, dpr: 1, isMobile: false },
  tabletWide: { width: 1000, height: 700, dpr: 1, isMobile: false },
  desktop: { width: 1440, height: 900, dpr: 1, isMobile: false },
};

export const ADMIN_ROUTES = [
  { tab: 'tong-quan', path: '/app/quan-tri/tong-quan', dock: 'Tổng quan', dockEn: 'Overview' },
  { tab: 'hoc-vien', path: '/app/quan-tri/hoc-vien', dock: 'Người dùng', dockEn: 'Users' },
  { tab: 'giao-vien', path: '/app/quan-tri/giao-vien', dock: 'Người dùng', dockEn: 'Users' },
  { tab: 'lop-giay-phep', path: '/app/quan-tri/lop-giay-phep', dock: 'Người dùng', dockEn: 'Users' },
  { tab: 'ngoai-ngu', path: '/app/quan-tri/ngoai-ngu', dock: 'Nội dung', dockEn: 'Content' },
  { tab: 'thong-bao', path: '/app/quan-tri/thong-bao', dock: 'Nội dung', dockEn: 'Content' },
  { tab: 'kinh-doanh', path: '/app/quan-tri/kinh-doanh', dock: 'Kinh doanh', dockEn: 'Business' },
  { tab: 'ma-qua-tang', path: '/app/quan-tri/ma-qua-tang', dock: 'Kinh doanh', dockEn: 'Business' },
  { tab: 'cai-dat', path: '/app/quan-tri/cai-dat', dock: 'Hệ thống', dockEn: 'System' },
  { tab: 'he-thong', path: '/app/quan-tri/he-thong', dock: 'Hệ thống', dockEn: 'System' },
  { tab: 'song-ngu', path: '/app/quan-tri/song-ngu', dock: 'Nội dung', dockEn: 'Content' },
  { tab: 'du-lieu', path: '/app/quan-tri/du-lieu', dock: 'Hệ thống', dockEn: 'System' },
  { tab: 'giam-sat', path: '/app/quan-tri/giam-sat', dock: 'Hệ thống', dockEn: 'System' },
];

export function createE2EContext({ cdp, srv, shotsDir }) {
  const { baseUrl, seed } = srv;
  const capturedShots = [];
  let activeRole = null;
  let activeViewport = null;

  function getSessionForRole(role) {
    if (role === 'admin') return seed.admin;
    if (role === 'teacher') return seed.teacher;
    if (role === 'parent') return seed.parent;
    if (role === 'student') return seed.student;
    if (role === 'zeroStudent') return seed.zeroStudent;
    if (role === 'peer1') return seed.peer1;
    throw new Error(`Unknown test role: ${role}`);
  }

  async function setViewport(preset = 'mobile') {
    const vp = typeof preset === 'string' ? VIEWPORTS[preset] : preset;
    if (!vp) throw new Error(`Unknown viewport preset: ${preset}`);
    if (
      activeViewport &&
      activeViewport.width === vp.width &&
      activeViewport.height === vp.height &&
      activeViewport.dpr === vp.dpr &&
      activeViewport.isMobile === vp.isMobile
    ) {
      return;
    }
    await cdp.setViewport(vp.width, vp.height, vp.dpr, vp.isMobile);
    activeViewport = { ...vp };
  }

  async function switchRole(role, { forceReset = false } = {}) {
    if (!role) {
      await cdp.clearSession();
      activeRole = null;
      return;
    }
    if (activeRole === role && !forceReset) return;
    const sess = getSessionForRole(role);
    await cdp.clearSession();
    await cdp.setAuthCookie(baseUrl, sess.token);
    activeRole = role;
  }

  async function ensureStorageState({ lang = 'vi', theme = 'light', subject = undefined } = {}) {
    const changed = await cdp.evalJs(
      (wantLang, wantTheme, wantSubj) => {
        let dirty = false;
        const curLang = localStorage.getItem('pl-lang');
        if (curLang !== wantLang) {
          localStorage.setItem('pl-lang', wantLang);
          dirty = true;
        }
        const curTheme = localStorage.getItem('me:theme');
        if (curTheme !== wantTheme) {
          localStorage.setItem('me:theme', wantTheme);
          dirty = true;
        }
        if (wantSubj !== undefined) {
          const curSubj = localStorage.getItem('pl:subject');
          if (wantSubj === null && curSubj !== null) {
            localStorage.removeItem('pl:subject');
            dirty = true;
          } else if (wantSubj !== null && curSubj !== wantSubj) {
            localStorage.setItem('pl:subject', wantSubj);
            dirty = true;
          }
        }
        return dirty;
      },
      lang,
      theme,
      subject
    );
    return !!changed;
  }

  async function visit(
    routePath,
    {
      role = 'student',
      viewport = 'mobile',
      lang = 'vi',
      theme = 'light',
      subject = undefined,
      expectAdmin = false,
      allowDenied = false,
      dismissGuide = true,
      selector = null,
      forceReset = false,
    } = {}
  ) {
    await setViewport(viewport);
    const roleChanged = activeRole !== role || forceReset;
    await switchRole(role, { forceReset });
    const initScript = `try {
      localStorage.setItem('pl-lang', ${JSON.stringify(lang)});
      localStorage.setItem('me:theme', ${JSON.stringify(theme)});
      ${subject === null ? "localStorage.removeItem('pl:subject');" : subject !== undefined ? `localStorage.setItem('pl:subject', ${JSON.stringify(subject)});` : ""}
    } catch {}`;
    const { identifier } = await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: initScript });
    try {
      await cdp.goto(`${baseUrl}${routePath}`);
    } finally {
      if (identifier) {
        await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier }).catch(() => {});
      }
    }
    const storageDirty = await ensureStorageState({ lang, theme, subject });
    if (storageDirty) {
      await cdp.reload();
    }
    await cdp.waitForAppSettled({ expectAdmin, allowDenied, dismissGuide, selector });
  }

  async function visitLanding({
    viewport = 'mobile',
    pathName = '/',
    clearAuth = true,
    lang = undefined,
    theme = undefined,
    selector = '#landingPage',
  } = {}) {
    await setViewport(viewport);
    if (clearAuth) {
      await switchRole(null);
    }
    const seedLines = [];
    if (lang !== undefined) seedLines.push(`localStorage.setItem('pl-lang', ${JSON.stringify(lang)});`);
    if (theme !== undefined) seedLines.push(`localStorage.setItem('me:theme', ${JSON.stringify(theme)});`);
    let identifier = null;
    if (seedLines.length) {
      const res = await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
        source: `try { ${seedLines.join(' ')} } catch {}`,
      });
      identifier = res?.identifier || null;
    }
    try {
      await cdp.goto(`${baseUrl}${pathName}`);
    } finally {
      if (identifier) {
        await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier }).catch(() => {});
      }
    }
    if (lang !== undefined || theme !== undefined) {
      const dirty = await cdp.evalJs((wLang, wTheme) => {
        let changed = false;
        if (wLang !== undefined && localStorage.getItem('pl-lang') !== wLang) {
          localStorage.setItem('pl-lang', wLang);
          changed = true;
        }
        if (wTheme !== undefined && localStorage.getItem('me:theme') !== wTheme) {
          localStorage.setItem('me:theme', wTheme);
          changed = true;
        }
        return changed;
      }, lang, theme);
      if (dirty) {
        await cdp.reload();
      }
    }
    await cdp.waitForLandingSettled({ selector });
  }

  async function visitPublic(
    routePath,
    {
      viewport = 'desktop',
      lang = undefined,
      theme = undefined,
      clearAuth = true,
      selector = '.dl-public-shell, #landingPage, main',
    } = {}
  ) {
    await setViewport(viewport);
    if (clearAuth) {
      await switchRole(null);
    }
    const seedLines = [];
    if (lang !== undefined) seedLines.push(`localStorage.setItem('pl-lang', ${JSON.stringify(lang)});`);
    if (theme !== undefined) seedLines.push(`localStorage.setItem('me:theme', ${JSON.stringify(theme)});`);
    let identifier = null;
    if (seedLines.length) {
      const res = await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
        source: `try { ${seedLines.join(' ')} } catch {}`,
      });
      identifier = res?.identifier || null;
    }
    try {
      await cdp.goto(`${baseUrl}${routePath}`);
    } finally {
      if (identifier) {
        await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier }).catch(() => {});
      }
    }
    if (lang !== undefined || theme !== undefined) {
      const dirty = await cdp.evalJs((wLang, wTheme) => {
        let changed = false;
        if (wLang !== undefined && localStorage.getItem('pl-lang') !== wLang) {
          localStorage.setItem('pl-lang', wLang);
          changed = true;
        }
        if (wTheme !== undefined && localStorage.getItem('me:theme') !== wTheme) {
          localStorage.setItem('me:theme', wTheme);
          changed = true;
        }
        return changed;
      }, lang, theme);
      if (dirty) {
        await cdp.reload();
      }
    }
    await cdp.waitForLandingSettled({ selector });
  }

  async function measureOverflow() {
    return cdp.evalJs(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    }));
  }

  async function assertNoOverflow(label) {
    const m = await measureOverflow();
    assert.ok(
      m.scrollWidth <= m.innerWidth,
      `${label}: horizontal overflow detected (scrollWidth=${m.scrollWidth} > innerWidth=${m.innerWidth})`
    );
  }

  async function existsVisible(selector) {
    return cdp.evalJs((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }, selector);
  }

  async function waitForVisible(selector, timeoutMs = 1200) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await existsVisible(selector)) return true;
      await new Promise((r) => setTimeout(r, 60));
    }
    return false;
  }

  async function waitForFanPill(btnId, href, timeoutMs = 1200) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const ok = await cdp.evalJs((bid, h) => {
        const btn = document.getElementById(bid);
        const ctrl = btn?.getAttribute('aria-controls');
        const root = (ctrl && document.getElementById(ctrl)) || document.querySelector('#mLearnSheet, #mAcctFan, .m-fan-learn, .m-fan-acct');
        if (!root || root.hidden) return false;
        const a = root.querySelector(`a[href="${h}"]`);
        if (!a) return false;
        const st = getComputedStyle(a);
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
        const r = a.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      }, btnId, href);
      if (ok) return true;
      await new Promise((r) => setTimeout(r, 60));
    }
    return false;
  }

  async function clickFanPill(btnId, href) {
    const clicked = await cdp.evalJs((bid, h) => {
      const btn = document.getElementById(bid);
      const ctrl = btn?.getAttribute('aria-controls');
      const root = (ctrl && document.getElementById(ctrl)) || document.querySelector('#mLearnSheet, #mAcctFan, .m-fan-learn, .m-fan-acct');
      const a = root?.querySelector(`a[href="${h}"]`);
      if (!a) return false;
      a.click();
      return true;
    }, btnId, href);
    if (!clicked) throw new Error(`clickFanPill: "${href}" not found under #${btnId}`);
    await new Promise((r) => setTimeout(r, 80));
  }

  async function assertFanMenuGeometry(btnId, { minLeft = 10, minRightMargin = 10, expectedCount = null } = {}) {
    const fan = await cdp.evalJs((bid) => {
      const btn = document.getElementById(bid);
      const ctrl = btn?.getAttribute('aria-controls');
      const menu = (ctrl && document.getElementById(ctrl)) || null;
      if (!menu || menu.hidden) return { open: false };
      const items = [...menu.querySelectorAll('a')].map((a) => {
        const r = a.getBoundingClientRect();
        const orb = a.querySelector('.m-fan-orb');
        const or = orb ? orb.getBoundingClientRect() : null;
        const pill = a.querySelector('.m-fan-pill');
        return {
          label: a.textContent.trim().replace(/\s+/g, ' '),
          href: a.getAttribute('href') || '',
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
          orbW: or ? or.width : 0,
          orbH: or ? or.height : 0,
          orbRadius: orb ? parseFloat(getComputedStyle(orb).borderTopLeftRadius) || 0 : 0,
          pillClipped: pill ? pill.scrollWidth > pill.clientWidth + 1 : false,
        };
      });
      const hasModalBox = !!menu.querySelector('.m-sheet-card, .m-learn-card');
      const distinctX = new Set(items.map((x) => Math.round(x.left / 15))).size;
      const distinctY = new Set(items.map((x) => Math.round(x.top / 15))).size;
      const scrim = menu.querySelector('.m-fan-scrim, .m-sheet-scrim') || menu;
      const scrimSt = getComputedStyle(scrim);
      const scrimBlur = scrimSt.backdropFilter || scrimSt.webkitBackdropFilter || '';
      const dockTop = document.getElementById('mTab')?.getBoundingClientRect().top ?? window.innerHeight;
      return {
        open: true,
        expanded: btn?.getAttribute('aria-expanded') === 'true',
        hasModalBox,
        distinctX,
        distinctY,
        scrimBlur,
        items,
        dockTop,
        innerW: window.innerWidth,
      };
    }, btnId);

    assert.ok(fan.open && fan.expanded, `#${btnId} fan-out menu must be open and aria-expanded="true"`);
    assert.strictEqual(fan.hasModalBox, false, `#${btnId} must render floating radial pills, NOT a rectangular modal box`);
    if (expectedCount != null) {
      assert.strictEqual(fan.items.length, expectedCount, `Expected ${expectedCount} pills in #${btnId} (got ${fan.items.length})`);
    }
    for (let i = 0; i < fan.items.length; i++) {
      const it = fan.items[i];
      assert.ok(it.orbW >= 24 && it.orbH >= 24, `Pill "${it.label}" orb too small (${it.orbW}x${it.orbH}px < 24px)`);
      assert.ok(it.orbRadius >= 20, `Pill "${it.label}" orb radius < 20px (${it.orbRadius}px)`);
      assert.strictEqual(it.pillClipped, false, `Pill "${it.label}" text clipped`);
      assert.ok(it.top >= 8, `Pill "${it.label}" clipped at top (${it.top})`);
      assert.ok(it.left >= minLeft && it.right <= fan.innerW - minRightMargin, `Pill "${it.label}" out of [${minLeft}, ${fan.innerW - minRightMargin}] bounds: [${it.left}, ${it.right}]`);
      assert.ok(it.bottom <= fan.dockTop, `Pill "${it.label}" overlaps #mTab (bottom=${it.bottom}, dockTop=${fan.dockTop})`);
      for (let j = i + 1; j < fan.items.length; j++) {
        const other = fan.items[j];
        const overlaps = !(it.right <= other.left || other.right <= it.left || it.bottom <= other.top || other.bottom <= it.top);
        assert.strictEqual(overlaps, false, `#${btnId} fan-out pills "${it.label}" and "${other.label}" overlap at width ${fan.innerW}px`);
      }
    }
    return fan;
  }

  async function inspectAdminVisuals() {
    return cdp.evalJs(() => {
      const isVis = (el) => {
        if (!el) return false;
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      const bodySt = getComputedStyle(document.body);
      const adEl = document.querySelector('.ad');
      const adSt = adEl ? getComputedStyle(adEl) : null;
      const h1 = document.querySelector('.ad h1');
      const h1St = h1 ? getComputedStyle(h1) : null;

      const skIcCount = document.querySelectorAll('.ad .sk-ic').length;
      const chibiSvgs = [...document.querySelectorAll('.ad svg')].filter((svg) =>
        svg.querySelector('[stroke="#4A3728"], [fill="#FDA4AF"]')
      ).length;

      const yellowControls = [...document.querySelectorAll(
        '.ad .btn-primary, .ad .ad-btn.pri, .ad .chips .chip.on, .ad .ad-nav a.on'
      )]
        .filter(isVis)
        .filter((el) => getComputedStyle(el).backgroundColor === 'rgb(253, 224, 71)')
        .map((el) => el.className);

      const creamInputs = [...document.querySelectorAll(
        '.ad-content input:not([type=checkbox]):not([type=radio]), .ad-content select, .ad-content textarea, .modal input, .modal select, .modal textarea'
      )]
        .filter(isVis)
        .filter((el) => getComputedStyle(el).backgroundColor === 'rgb(250, 246, 236)')
        .map((el) => el.tagName + '#' + el.id);

      const nonWhiteCards = [...document.querySelectorAll(
        '.ad-kpi, .ad-m-qcard, .ad-content .stats > div, .ad-content .biz-stats > div'
      )]
        .filter(isVis)
        .map((el) => ({ cls: el.className, bg: getComputedStyle(el).backgroundColor }))
        .filter((x) => x.bg !== 'rgb(255, 255, 255)');

      return {
        bodyBg: bodySt.backgroundColor,
        bodyBgImg: bodySt.backgroundImage,
        adBg: adSt?.backgroundColor || '',
        adBgImg: adSt?.backgroundImage || '',
        bodyFont: bodySt.fontFamily,
        h1Font: h1St?.fontFamily || '',
        skIcCount,
        chibiSvgs,
        yellowControls,
        creamInputs,
        nonWhiteCards,
      };
    });
  }

  async function shot(fileName) {
    const outPath = path.join(shotsDir, fileName);
    const res = await cdp.capturePng(outPath);
    capturedShots.push({ fileName, outPath, bytes: res.bytes });
    return res;
  }

  function invalidateRoleCache() {
    activeRole = null;
  }

  async function getThemeState() {
    return cdp.evalJs(() => ({
      attr: document.documentElement.getAttribute('data-theme'),
      storage: localStorage.getItem('me:theme'),
    }));
  }

  async function toggleThemeViaUi(selector = '[data-theme-toggle]') {
    const found = await cdp.evalJs((sel) => {
      const els = [...document.querySelectorAll(sel)];
      const vis = els.find((el) => {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      if (!vis) return false;
      vis.scrollIntoView({ block: 'center', inline: 'center' });
      vis.click();
      return true;
    }, selector);
    assert.ok(found, `Expected visible theme toggle matching "${selector}"`);
    await new Promise((r) => setTimeout(r, 120));
    return getThemeState();
  }

  async function switchThemeAndAssert(expectedNext, selector = '[data-theme-toggle]') {
    const st = await toggleThemeViaUi(selector);
    assert.strictEqual(st.attr, expectedNext, `Expected html[data-theme="${expectedNext}"] after toggle, got "${st.attr}"`);
    assert.strictEqual(st.storage, expectedNext, `Expected localStorage["me:theme"]="${expectedNext}" after toggle, got "${st.storage}"`);
    return st;
  }

  async function restoreLightAndVi() {
    await cdp.evalJs(() => {
      try {
        localStorage.setItem('me:theme', 'light');
        localStorage.setItem('pl-lang', 'vi');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.lang = 'vi';
      } catch {}
    }).catch(() => {});
  }

  async function measureContrast(selector, opts = {}) {
    return cdp.evalJs((sel, options) => {
      const parseColor = (str) => {
        if (!str || str === 'transparent') return [0, 0, 0, 0];
        const m = /rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*(\d+(?:\.\d+)?))?\s*\)/i.exec(str);
        if (!m) return null;
        return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
      };
      const composite = (fg, bg) => {
        const a = fg[3];
        if (a >= 0.999) return [fg[0], fg[1], fg[2], 1];
        if (a <= 0.001) return bg;
        return [
          fg[0] * a + bg[0] * (1 - a),
          fg[1] * a + bg[1] * (1 - a),
          fg[2] * a + bg[2] * (1 - a),
          1,
        ];
      };
      const resolveBg = (el) => {
        const layers = [];
        let cur = el;
        while (cur && cur.nodeType === 1) {
          const c = parseColor(getComputedStyle(cur).backgroundColor);
          if (c && c[3] > 0.001) layers.push(c);
          cur = cur.parentElement;
        }
        let acc = [255, 255, 255, 1];
        for (let i = layers.length - 1; i >= 0; i--) {
          acc = composite(layers[i], acc);
        }
        return acc;
      };
      const relLum = ([r, g, b]) => {
        const lin = (c) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      };
      const ratioOf = (c1, c2) => {
        const l1 = relLum(c1);
        const l2 = relLum(c2);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      };
      const isVis = (el) => {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };

      const includeNonText = !!options?.includeNonText;
      const els = [...document.querySelectorAll(sel)].filter(isVis);
      const samples = [];
      for (const el of els) {
        const tag = el.tagName;
        const isInput = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
        const txt = (isInput ? (el.value || el.getAttribute('placeholder') || el.tagName) : (el.textContent || '')).trim().replace(/\s+/g, ' ');
        if (!includeNonText && !isInput && !txt) continue;
        const st = getComputedStyle(el);
        const fg = parseColor(st.color);
        if (!fg) continue;
        const bg = resolveBg(el);
        const effFg = composite(fg, bg);
        const ratio = Math.round(ratioOf(effFg, bg) * 100) / 100;
        samples.push({
          tag,
          text: txt.slice(0, 48),
          fg: `rgb(${Math.round(effFg[0])}, ${Math.round(effFg[1])}, ${Math.round(effFg[2])})`,
          bg: `rgb(${Math.round(bg[0])}, ${Math.round(bg[1])}, ${Math.round(bg[2])})`,
          ratio,
        });
      }
      const minRatio = samples.length ? Math.min(...samples.map((s) => s.ratio)) : 0;
      return { count: samples.length, minRatio, samples };
    }, selector, opts);
  }

  async function assertContrast(selector, minRatio = 4.5, label = selector, opts = {}) {
    const res = await measureContrast(selector, opts);
    assert.ok(res.count > 0, `${label}: no visible elements matched "${selector}" for contrast check`);
    const bad = res.samples.filter((s) => s.ratio < minRatio);
    assert.strictEqual(
      bad.length,
      0,
      `${label}: WCAG contrast < ${minRatio}:1 on ${bad.length}/${res.count} element(s): ${bad.slice(0, 3).map((b) => `"${b.text}" (${b.fg} on ${b.bg} = ${b.ratio}:1)`).join('; ')}`
    );
    return res;
  }

  async function getSurfaceLuminance(selector = 'body') {
    const res = await cdp.evalJs((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { found: false };
      const parseColor = (str) => {
        if (!str || str === 'transparent') return [0, 0, 0, 0];
        const m = /rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*(\d+(?:\.\d+)?))?\s*\)/i.exec(str);
        if (!m) return null;
        return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
      };
      const composite = (fg, bg) => {
        const a = fg[3];
        if (a >= 0.999) return [fg[0], fg[1], fg[2], 1];
        if (a <= 0.001) return bg;
        return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
      };
      const layers = [];
      let cur = el;
      while (cur && cur.nodeType === 1) {
        const c = parseColor(getComputedStyle(cur).backgroundColor);
        if (c && c[3] > 0.001) layers.push(c);
        cur = cur.parentElement;
      }
      let acc = [255, 255, 255, 1];
      for (let i = layers.length - 1; i >= 0; i--) acc = composite(layers[i], acc);
      const lin = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      const luminance = 0.2126 * lin(acc[0]) + 0.7152 * lin(acc[1]) + 0.0722 * lin(acc[2]);
      return {
        found: true,
        bg: `rgb(${Math.round(acc[0])}, ${Math.round(acc[1])}, ${Math.round(acc[2])})`,
        luminance: Math.round(luminance * 10000) / 10000,
      };
    }, selector);
    assert.ok(res.found, `getSurfaceLuminance: element not found for "${selector}"`);
    return res;
  }

  async function assertAllVisibleInViewport(selector, label = selector, { allowEmpty = false } = {}) {
    const res = await cdp.evalJs((sel) => {
      const els = [...document.querySelectorAll(sel)].filter((el) => {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      const vw = window.innerWidth;
      const oob = els
        .map((el) => {
          const r = el.getBoundingClientRect();
          return {
            tag: el.tagName,
            id: el.id || '',
            cls: String(el.className || '').slice(0, 40),
            left: Math.round(r.left),
            right: Math.round(r.right),
            vw,
          };
        })
        .filter((x) => x.left < -1 || x.right > vw + 1);
      return { count: els.length, oob };
    }, selector);
    if (!allowEmpty) {
      assert.ok(res.count > 0, `${label}: expected >= 1 visible element matching "${selector}"`);
    }
    assert.strictEqual(
      res.oob.length,
      0,
      `${label}: element(s) outside viewport [0..${res.oob[0]?.vw}]: ${JSON.stringify(res.oob.slice(0, 3))}`
    );
    return res;
  }

  async function assertNoElementOverlap(selectorA, selectorB, label = `${selectorA} vs ${selectorB}`) {
    const res = await cdp.evalJs((selA, selB) => {
      const visRects = (sel) => [...document.querySelectorAll(sel)]
        .filter((el) => {
          const st = getComputedStyle(el);
          if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        })
        .map((el) => ({ tag: el.tagName, id: el.id || '', r: el.getBoundingClientRect() }));
      const a = visRects(selA);
      const b = visRects(selB);
      const overlaps = [];
      for (const ea of a) {
        for (const eb of b) {
          const inter = !(ea.r.right <= eb.r.left + 1 || eb.r.right <= ea.r.left + 1 || ea.r.bottom <= eb.r.top + 1 || eb.r.bottom <= ea.r.top + 1);
          if (inter) {
            overlaps.push({ a: ea.id || ea.tag, b: eb.id || eb.tag, aRect: [ea.r.left, ea.r.top, ea.r.right, ea.r.bottom], bRect: [eb.r.left, eb.r.top, eb.r.right, eb.r.bottom] });
          }
        }
      }
      return { aCount: a.length, bCount: b.length, overlaps };
    }, selectorA, selectorB);
    assert.strictEqual(
      res.overlaps.length,
      0,
      `${label}: overlapping elements detected: ${JSON.stringify(res.overlaps.slice(0, 3))}`
    );
    return res;
  }

  function consoleErrorCount() {
    return cdp.consoleErrors.length;
  }

  function assertNoConsoleErrors(sinceIdx, label = 'console') {
    const errs = cdp.consoleErrors.slice(sinceIdx);
    assert.strictEqual(
      errs.length,
      0,
      `${label}: unexpected console.error(s): ${errs.map((e) => e.text).join(' | ')}`
    );
  }

  async function trackRequests(fn, { urlPattern = /\/api\//, method = null } = {}) {
    const requests = [];
    const status4xx = [];
    const byEndpoint = {};
    const wantMethod = method ? String(method).toUpperCase() : null;
    const unsubReq = cdp.on('Network.requestWillBeSent', (params) => {
      const req = params?.request;
      if (!req?.url) return;
      let urlPath = req.url;
      try { urlPath = new URL(req.url).pathname + new URL(req.url).search; } catch {}
      if (urlPattern && !urlPattern.test(urlPath) && !urlPattern.test(req.url)) return;
      const m = String(req.method || 'GET').toUpperCase();
      if (wantMethod && m !== wantMethod) return;
      requests.push({ url: urlPath, method: m, ts: Date.now() });
      const key = `${m} ${urlPath.split('?')[0]}`;
      byEndpoint[key] = (byEndpoint[key] || 0) + 1;
    });
    const unsubRes = cdp.on('Network.responseReceived', (params) => {
      const resp = params?.response;
      if (!resp?.url) return;
      if (typeof resp.status === 'number' && resp.status >= 400 && resp.status < 500) {
        status4xx.push({ status: resp.status, url: resp.url });
      }
    });
    try {
      await fn();
    } finally {
      unsubReq();
      unsubRes();
    }
    return { total: requests.length, requests, byEndpoint, status4xx };
  }

  async function probeBeforeUnloadLeak(leaveFn) {
    let dialogCount = 0;
    const unsubDlg = cdp.on('Page.javascriptDialogOpening', (params) => {
      if (params?.type === 'beforeunload') dialogCount++;
      cdp.send('Page.handleJavaScriptDialog', { accept: true }).catch(() => {});
    });
    try {
      await leaveFn();
    } finally {
      unsubDlg();
    }
    const probe = await cdp.evalJs(() => {
      const hadOnBeforeUnload = typeof window.onbeforeunload === 'function';
      const ev = new Event('beforeunload', { cancelable: true });
      let returnValSet = false;
      try {
        Object.defineProperty(ev, 'returnValue', {
          configurable: true,
          get() { return ''; },
          set(v) { if (v !== undefined && v !== true) returnValSet = true; },
        });
      } catch {}
      const dispatchRes = window.dispatchEvent(ev);
      const syntheticPrevented = !dispatchRes || ev.defaultPrevented || returnValSet;
      return { hadOnBeforeUnload, syntheticPrevented };
    });
    const leaked = dialogCount > 0 || probe.hadOnBeforeUnload || probe.syntheticPrevented;
    return { leaked, dialogCount, ...probe };
  }

  async function switchLangViaUi(targetLang) {
    const clicked = await cdp.evalJs((lang) => {
      const els = [...document.querySelectorAll(`.lang-switch [data-lang="${lang}"], [data-set-lang="${lang}"]`)];
      const vis = els.find((el) => {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      if (!vis) return false;
      vis.scrollIntoView({ block: 'center', inline: 'center' });
      vis.click();
      return true;
    }, targetLang);
    assert.ok(clicked, `Expected visible language switch button for "${targetLang}"`);
    await cdp.waitForCondition(
      (lang) => document.documentElement.lang === lang && localStorage.getItem('pl-lang') === lang,
      8000,
      80,
      targetLang
    );
    await new Promise((r) => setTimeout(r, 150));
  }

  async function detectMixedViEn(
    rootSelector = '#main',
    { excludeSelectors = ['[data-i18n="off"]', 'code', 'pre', 'script', 'style'], allowTexts = ['Tiếng Việt'] } = {}
  ) {
    return cdp.evalJs((rootSel, excludes, allowed) => {
      const root = document.querySelector(rootSel);
      if (!root) return { foundRoot: false, count: 0, leaks: [] };
      const viRe = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
      const isVis = (el) => {
        if (!el || el.nodeType !== 1) return false;
        if (el.closest('[hidden]')) return false;
        for (const ex of excludes) {
          if (el.closest(ex)) return false;
        }
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const leaks = [];
      let node;
      while ((node = walker.nextNode())) {
        const txt = (node.nodeValue || '').trim().replace(/\s+/g, ' ');
        if (!txt || !viRe.test(txt)) continue;
        if (/^@[\w.-]+$/.test(txt)) continue;
        if (allowed.some((a) => txt === a || txt.includes(a))) continue;
        const el = node.parentElement;
        if (!isVis(el)) continue;
        const tag = el.tagName.toLowerCase();
        const idPart = el.id ? `#${el.id}` : '';
        leaks.push({ text: txt.slice(0, 80), selector: `${tag}${idPart}` });
      }
      return { foundRoot: true, count: leaks.length, leaks };
    }, rootSelector, excludeSelectors, allowTexts);
  }

  async function assertNoViLeaksInEn(rootSelector = '#main', opts = {}) {
    const lang = await cdp.evalJs(() => document.documentElement.lang);
    assert.strictEqual(lang, 'en', `Expected html[lang="en"], got "${lang}"`);
    const res = await detectMixedViEn(rootSelector, opts);
    assert.ok(res.foundRoot, `assertNoViLeaksInEn: root selector "${rootSelector}" not found`);
    assert.strictEqual(
      res.count,
      0,
      `Mixed VI text leaked in EN (${rootSelector}): ${res.leaks.slice(0, 5).map((l) => `"${l.text}" (${l.selector})`).join(' | ')}`
    );
    return res;
  }

  return {
    cdp,
    srv,
    baseUrl,
    seed,
    shotsDir,
    capturedShots,
    setViewport,
    switchRole,
    visit,
    visitLanding,
    visitPublic,
    measureOverflow,
    assertNoOverflow,
    existsVisible,
    waitForVisible,
    waitForFanPill,
    clickFanPill,
    assertFanMenuGeometry,
    inspectAdminVisuals,
    shot,
    invalidateRoleCache,
    getThemeState,
    toggleThemeViaUi,
    switchThemeAndAssert,
    restoreLightAndVi,
    measureContrast,
    assertContrast,
    getSurfaceLuminance,
    assertAllVisibleInViewport,
    assertNoElementOverlap,
    consoleErrorCount,
    assertNoConsoleErrors,
    trackRequests,
    probeBeforeUnloadLeak,
    switchLangViaUi,
    detectMixedViEn,
    assertNoViLeaksInEn,
  };
}
