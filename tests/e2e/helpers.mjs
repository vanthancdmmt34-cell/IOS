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
  desktop: { width: 1440, height: 900, dpr: 1, isMobile: false },
};

export const ADMIN_ROUTES = [
  { tab: 'tong-quan', path: '/app/quan-tri/tong-quan', dock: 'Tổng quan', dockEn: 'Overview' },
  { tab: 'hoc-vien', path: '/app/quan-tri/hoc-vien', dock: 'Người dùng', dockEn: 'Users' },
  { tab: 'giao-vien', path: '/app/quan-tri/giao-vien', dock: 'Người dùng', dockEn: 'Users' },
  { tab: 'lop-giay-phep', path: '/app/quan-tri/lop-giay-phep', dock: 'Người dùng', dockEn: 'Users' },
  { tab: 'ngoai-ngu', path: '/app/quan-tri/ngoai-ngu', dock: 'Nội dung', dockEn: 'Content' },
  { tab: 'thong-bao', path: '/app/quan-tri/thong-bao', dock: 'Menu', dockEn: 'Menu' },
  { tab: 'kinh-doanh', path: '/app/quan-tri/kinh-doanh', dock: 'Menu', dockEn: 'Menu' },
  { tab: 'ma-qua-tang', path: '/app/quan-tri/ma-qua-tang', dock: 'Menu', dockEn: 'Menu' },
  { tab: 'cai-dat', path: '/app/quan-tri/cai-dat', dock: 'Menu', dockEn: 'Menu' },
  { tab: 'he-thong', path: '/app/quan-tri/he-thong', dock: 'Menu', dockEn: 'Menu' },
  { tab: 'song-ngu', path: '/app/quan-tri/song-ngu', dock: 'Nội dung', dockEn: 'Content' },
  { tab: 'du-lieu', path: '/app/quan-tri/du-lieu', dock: 'Menu', dockEn: 'Menu' },
  { tab: 'giam-sat', path: '/app/quan-tri/giam-sat', dock: 'Menu', dockEn: 'Menu' },
];

export function createE2EContext({ cdp, srv, shotsDir }) {
  const { baseUrl, seed } = srv;
  const capturedShots = [];
  let activeRole = null;
  let activeViewport = null;

  function getSessionForRole(role) {
    if (role === 'admin') return seed.admin;
    if (role === 'teacher') return seed.teacher;
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
        const curLang = localStorage.getItem('pl-lang') || 'vi';
        if (curLang !== wantLang) {
          localStorage.setItem('pl-lang', wantLang);
          dirty = true;
        }
        const curTheme = localStorage.getItem('me:theme') || 'light';
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
    await cdp.goto(`${baseUrl}${routePath}`);
    const storageDirty = await ensureStorageState({ lang, theme, subject });
    if (storageDirty || (roleChanged && lang !== 'vi')) {
      await cdp.reload();
    }
    await cdp.waitForAppSettled({ expectAdmin, allowDenied, dismissGuide, selector });
  }

  async function visitLanding({ viewport = 'mobile', pathName = '/', clearAuth = true } = {}) {
    await setViewport(viewport);
    if (clearAuth) {
      await switchRole(null);
    }
    await cdp.goto(`${baseUrl}${pathName}`);
    await cdp.waitForLandingSettled({ selector: '#landingPage' });
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
    measureOverflow,
    assertNoOverflow,
    existsVisible,
    waitForVisible,
    inspectAdminVisuals,
    shot,
    invalidateRoleCache,
  };
}
