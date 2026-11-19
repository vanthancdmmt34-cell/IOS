/**
 * @file tests/e2e/tier1.mjs
 * Tier 1: Isolated Feature Coverage (71 tests, >= 5 per feature F1-F14).
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ADMIN_ROUTES } from './helpers.mjs';
import { apiRequest, assertWorkspaceFilesUntouched } from './server-seed.mjs';

export function registerTier1(suite, ctx) {
  const { cdp, srv, baseUrl, seed } = ctx;

  // ================= F1: Core Line Icons & i18n EN Keys =================
  suite.test(
    { id: 'T1-F1-01', tier: 1, feature: 'F1', milestone: 'M1', name: 'Core lineIcon stroke SVGs in #mTab and #sideNav without .sk-ic' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      const res = await cdp.evalJs(() => {
        const dockSvgs = [...document.querySelectorAll('#mTab svg')];
        const navSvgs = [...document.querySelectorAll('#sideNav svg')];
        const dockValid = dockSvgs.length >= 5 && dockSvgs.every((s) => s.classList.contains('line-ic') && s.getAttribute('fill') === 'none' && s.children.length > 0);
        const navValid = navSvgs.length >= 5 && navSvgs.every((s) => s.classList.contains('line-ic') && s.getAttribute('fill') === 'none' && s.children.length > 0);
        const skInDockNav = document.querySelectorAll('#mTab .sk-ic, #sideNav .sk-ic').length;
        return { dockCount: dockSvgs.length, navCount: navSvgs.length, dockValid, navValid, skInDockNav };
      });
      assert.ok(res.dockValid, `Expected >=5 valid line-ic SVGs in #mTab (got ${res.dockCount})`);
      assert.ok(res.navValid, `Expected >=5 valid line-ic SVGs in #sideNav (got ${res.navCount})`);
      assert.strictEqual(res.skInDockNav, 0, 'Dock and sideNav must not contain .sk-ic icons');
    }
  );

  suite.test(
    { id: 'T1-F1-02', tier: 1, feature: 'F1', milestone: 'M1', name: 'EN i18n translates html lang and 5 student #mTab dock labels' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile', lang: 'en' });
      const res = await cdp.evalJs(() => ({
        htmlLang: document.documentElement.lang,
        labels: [...document.querySelectorAll('#mTab .mtab-lbl')].map((el) => el.textContent.trim()),
      }));
      assert.strictEqual(res.htmlLang, 'en', 'html[lang] must be "en"');
      assert.deepStrictEqual(res.labels, ['Overview', 'Roadmap', 'Learn now', 'Interview', 'Profile']);
    }
  );

  suite.test(
    { id: 'T1-F1-03', tier: 1, feature: 'F1', milestone: 'M1', name: 'EN i18n translates Học ngay fan-out 5 learning pill labels' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile', lang: 'en' });
      await cdp.click('#mTabLearnBtn');
      const labels = await cdp.evalJs(() => {
        const ctrl = document.getElementById('mTabLearnBtn')?.getAttribute('aria-controls');
        const root = (ctrl && document.getElementById(ctrl)) || document.querySelector('#mLearnSheet, .m-fan-learn');
        if (!root) return [];
        return [...root.querySelectorAll('a')].map((a) => a.textContent.trim().replace(/\s+/g, ' '));
      });
      assert.deepStrictEqual(labels, ['AI Chat', 'Speaking', 'Learn', 'Review', 'TOEIC']);
    }
  );

  suite.test(
    { id: 'T1-F1-04', tier: 1, feature: 'F1', milestone: 'M1', name: 'EN i18n translates /app/cai-dat settings page strings' },
    async () => {
      await ctx.visit('/app/cai-dat', { role: 'student', viewport: 'mobile', lang: 'en' });
      const text = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(text.includes('Settings'), 'Settings heading should translate to "Settings"');
      assert.ok(/Theme|Appearance/i.test(text), 'Theme section should translate in EN');
      assert.ok(/Interface language/i.test(text), 'Interface language section should translate in EN');
    }
  );

  suite.test(
    { id: 'T1-F1-05', tier: 1, feature: 'F1', milestone: 'M3', name: 'EN i18n covers Admin drawer and modernized Admin mobile labels' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'mobile', lang: 'en', expectAdmin: true });
      const res = await cdp.evalJs(() => ({
        drawerTitle: document.querySelector('.ad-m-drawer-user b')?.textContent.trim() || '',
        dockLabels: [...document.querySelectorAll('.ad-m-tab-it span:last-child')].map((s) => s.textContent.trim()),
        navText: document.querySelector('.ad-nav')?.textContent || '',
      }));
      assert.ok(!/Quản trị viên/.test(res.drawerTitle), `Drawer title "${res.drawerTitle}" should be translated to EN`);
      assert.ok(!/Lớp học và giấy phép/.test(res.navText), 'Drawer item "Lớp học và giấy phép" should be translated to EN');
      assert.ok(res.dockLabels.includes('Overview') && res.dockLabels.length === 5, `Expected 5 EN dock labels, got ${JSON.stringify(res.dockLabels)}`);
    }
  );

  // ================= F2: Consolidated Navigation & Drawer Removal =================
  suite.test(
    { id: 'T1-F2-01', tier: 1, feature: 'F2', milestone: 'M1', name: 'Redundant ••• triggers (.hm-more-btn, #mTopMore) removed and mobile #side/#scrim hidden' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      const homeCheck = await cdp.evalJs(() => ({
        hasHmMore: !!document.querySelector('.hm-more-btn, [data-open-nav]'),
        hasTopMore: !!document.getElementById('mTopMore'),
        sideDisp: getComputedStyle(document.getElementById('side')).display,
        scrimDisp: getComputedStyle(document.getElementById('scrim')).display,
      }));
      assert.strictEqual(homeCheck.hasHmMore, false, '.hm-more-btn / [data-open-nav] must be removed');
      assert.strictEqual(homeCheck.hasTopMore, false, '#mTopMore must be removed');
      assert.strictEqual(homeCheck.sideDisp, 'none', '#side must be hidden on <=760px mobile');
      assert.strictEqual(homeCheck.scrimDisp, 'none', '#scrim must be hidden on <=760px mobile');

      await ctx.visit('/app/ca-nhan', { role: 'student', viewport: 'mobile' });
      const hub = await cdp.evalJs(() => ({
        hasTopMore: !!document.getElementById('mTopMore'),
        hasTopAcct: !!document.getElementById('mTopAcct'),
        personalLinks: [...document.querySelectorAll('.pf-hub-nav a, .pf-hub-nav button')].map((e) => e.getAttribute('href') || e.dataset.pfOpen || (e.hasAttribute('data-logout') ? 'logout' : e.id || '')),
      }));
      assert.strictEqual(hub.hasTopMore, false, '#mTopMore must be absent on inner mobile pages');
      assert.strictEqual(hub.hasTopAcct, false, '#mTopAcct must be removed so Cá nhân is the single entry');
      assert.ok(hub.personalLinks.includes('/app/lop'), 'Cá nhân hub must expose /app/lop');
      assert.ok(hub.personalLinks.includes('/app/so-tay'), 'Cá nhân hub must expose /app/so-tay');
      assert.ok(hub.personalLinks.includes('/app/tro-choi/en'), 'Cá nhân hub must expose /app/tro-choi/en');
      assert.ok(hub.personalLinks.includes('/app/ngoai-ngu/xep-hang/en'), 'Cá nhân hub must expose /app/ngoai-ngu/xep-hang/en');
      assert.ok(hub.personalLinks.includes('/app/ngoai-ngu/huy-hieu/en'), 'Cá nhân hub must expose /app/ngoai-ngu/huy-hieu/en');
      assert.ok(hub.personalLinks.includes('/app/cai-dat') && hub.personalLinks.includes('/app/thong-bao') && hub.personalLinks.includes('/app/ho-tro') && hub.personalLinks.includes('logout'), 'Cá nhân hub must expose settings, notices, support, and logout');
    }
  );

  suite.test(
    { id: 'T1-F2-02', tier: 1, feature: 'F2', milestone: 'M1', name: 'Desktop 1440x900 Learner #sideNav consolidates Học tập & Cá nhân (with Cài đặt) and deduplicates .me-card' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'desktop' });
      const nav = await cdp.evalJs(() => {
        const cats = [...document.querySelectorAll('#sideNav details.nav-cat')].map((d) => ({
          id: d.dataset.cat,
          label: d.querySelector('.nav-cat-lbl')?.textContent.trim() || '',
          hrefs: [...d.querySelectorAll('a')].map((a) => a.getAttribute('href')),
        }));
        return {
          cats,
          hasSbSearch: !!document.getElementById('sbSearch'),
          hasSideTheme: !!document.querySelector('.side-foot [data-theme-toggle]'),
          hasSbGuide: !!document.getElementById('sbGuide'),
          hasLogoutBtn: !!document.getElementById('logoutBtn'),
        };
      });
      assert.deepStrictEqual(nav.cats.map((c) => c.label), ['Học tập', 'Cá nhân']);
      const learn = nav.cats.find((c) => c.id === 'learn')?.hrefs || [];
      const personal = nav.cats.find((c) => c.id === 'personal')?.hrefs || [];
      assert.ok(learn.length <= 7, `Learner Học tập must stay concise (got ${learn.length})`);
      assert.ok(personal.includes('/app/ca-nhan') && personal.includes('/app/co-vu') && personal.includes('/app/lop'), 'Cá nhân group missing expected learner links');
      assert.ok(personal.includes('/app/thong-bao') && personal.includes('/app/cai-dat') && personal.includes('/app/ho-tro'), 'Cá nhân group must expose thong-bao, cai-dat, and ho-tro');
      assert.strictEqual(nav.hasSbSearch, false, 'Redundant #sbSearch must be removed from .me-card');
      assert.strictEqual(nav.hasSideTheme, false, 'Redundant [data-theme-toggle] must be removed from .me-card');
      assert.ok(nav.hasSbGuide && nav.hasLogoutBtn, '.me-card must retain #sbGuide and #logoutBtn');
    }
  );

  suite.test(
    { id: 'T1-F2-03', tier: 1, feature: 'F2', milestone: 'M1', name: 'Desktop 1440x900 Admin #sideNav unifies Giảng dạy, Học tập, Cá nhân (incl. quan-tri & cai-dat)' },
    async () => {
      await ctx.visit('/app/en', { role: 'admin', viewport: 'desktop' });
      const cats = await cdp.evalJs(() =>
        [...document.querySelectorAll('#sideNav details.nav-cat')].map((d) => ({
          id: d.dataset.cat,
          label: d.querySelector('.nav-cat-lbl')?.textContent.trim() || '',
          hrefs: [...d.querySelectorAll('a')].map((a) => a.getAttribute('href')),
        }))
      );
      assert.deepStrictEqual(cats.map((c) => c.label), ['Giảng dạy', 'Học tập', 'Cá nhân']);
      const teach = cats.find((c) => c.id === 'teach')?.hrefs || [];
      const personal = cats.find((c) => c.id === 'personal')?.hrefs || [];
      assert.ok(teach.includes('/app/giao-vien/bai-tap') && teach.includes('/app/giao-vien/tien-do') && teach.includes('/app/lop'), 'Admin Giảng dạy must include bai-tap, tien-do, and lop');
      assert.ok(personal.includes('/app/quan-tri') && personal.includes('/app/ho-tro') && personal.includes('/app/cai-dat'), 'Admin Cá nhân must include quan-tri, ho-tro, cai-dat');
    }
  );

  suite.test(
    { id: 'T1-F2-04', tier: 1, feature: 'F2', milestone: 'M1', name: 'Parent role accesses Gia đình, Lớp học, Thông báo, Cá nhân fan-out & Hệ thống hub cleanly' },
    async () => {
      await ctx.visit('/app/gia-dinh', { role: 'parent', viewport: 'mobile' });
      await ctx.assertNoOverflow('T1-F2-04 parent mobile gia-dinh');
      const dock = await cdp.evalJs(() => ({
        count: document.querySelectorAll('#mTab > a, #mTab > button').length,
        labels: [...document.querySelectorAll('#mTab .mtab-lbl')].map((e) => e.textContent.trim()),
        hasAcctBtn: document.getElementById('mTabAcctBtn')?.tagName === 'BUTTON',
        hasTopMore: !!document.getElementById('mTopMore'),
      }));
      assert.strictEqual(dock.count, 4);
      assert.deepStrictEqual(dock.labels, ['Gia đình', 'Lớp học', 'Thông báo', 'Cá nhân']);
      assert.ok(dock.hasAcctBtn, 'Parent Cá nhân dock tab must open #mAcctFan');
      assert.strictEqual(dock.hasTopMore, false);

      await cdp.click('#mTabAcctBtn');
      await new Promise((r) => setTimeout(r, 200));
      await ctx.assertFanMenuGeometry('mTabAcctBtn', { expectedCount: 4 });

      await ctx.clickFanPill('mTabAcctBtn', '/app/ca-nhan');
      await cdp.waitForAppSettled({ selector: '.pf-hub-nav' });
      await ctx.assertNoOverflow('T1-F2-04 parent mobile ca-nhan');
      const hasFamilyHub = await cdp.evalJs(() => !!document.querySelector('.pf-hub-nav a[href="/app/gia-dinh"]'));
      assert.ok(hasFamilyHub, 'Parent /app/ca-nhan hub must link /app/gia-dinh');
    }
  );

  suite.test(
    { id: 'T1-F2-05', tier: 1, feature: 'F2', milestone: 'M1', name: 'Tablet 900x700 preserves #menuBtn toggle of #side drawer and closes via #scrim' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: { width: 900, height: 700, dpr: 1, isMobile: false } });
      assert.ok(await ctx.existsVisible('#menuBtn'), '#menuBtn must remain visible on tablet 900x700');
      await cdp.click('#menuBtn');
      await cdp.waitForCondition(() => {
        const r = document.getElementById('side')?.getBoundingClientRect();
        return document.body.classList.contains('nav-open') && !!r && r.left >= -2;
      }, 2000, 40);
      const sideRect = await cdp.evalJs(() => {
        const r = document.getElementById('side')?.getBoundingClientRect();
        return r ? { left: r.left, width: r.width } : null;
      });
      assert.ok(sideRect && sideRect.left >= -2 && sideRect.width >= 240, 'Tablet #side drawer must open on #menuBtn click');
      await cdp.click('#scrim');
      assert.strictEqual(await cdp.evalJs(() => document.body.classList.contains('nav-open')), false, 'Tablet #side drawer must close on #scrim click');
    }
  );

  // ================= F3: Teacher Consolidated Navigation & Routes =================
  suite.test(
    { id: 'T1-F3-01', tier: 1, feature: 'F3', milestone: 'M1', name: 'Teacher uses Cá nhân #mTabAcctBtn fan-out without redundant #mTopAcct and zero learner cert leak' },
    async () => {
      await ctx.visit('/app/giao-vien', { role: 'teacher', viewport: 'mobile' });
      assert.strictEqual(await cdp.evalJs(() => !!document.getElementById('mTopMore')), false, '#mTopMore must be removed for teacher');
      assert.strictEqual(await cdp.evalJs(() => !!document.getElementById('mTopAcct')), false, '#mTopAcct must be removed for teacher');
      await cdp.click('#mTabAcctBtn');
      await new Promise((r) => setTimeout(r, 180));
      const fan = await ctx.assertFanMenuGeometry('mTabAcctBtn', { expectedCount: 4 });
      const hrefs = fan.items.map((x) => x.href);
      assert.ok(hrefs.includes('/app/giao-vien/hoc-vien') && hrefs.includes('/app/thong-bao') && hrefs.includes('/app/ca-nhan') && hrefs.includes('/app/cai-dat'), `Unexpected teacher fan hrefs: ${JSON.stringify(hrefs)}`);
      assert.strictEqual(hrefs.some((h) => h.includes('chung-nhan')), false, 'Teacher Cá nhân fan-out must NOT leak learner Chứng nhận');
    }
  );

  suite.test(
    { id: 'T1-F3-02', tier: 1, feature: 'F3', milestone: 'M1', name: 'Teacher desktop 1440x900 #sideNav uses unified Giảng dạy & Cá nhân without learner clutter' },
    async () => {
      await ctx.visit('/app/giao-vien', { role: 'teacher', viewport: 'desktop' });
      const data = await cdp.evalJs(() =>
        [...document.querySelectorAll('#sideNav details.nav-cat')].map((d) => ({
          id: d.dataset.cat,
          label: d.querySelector('.nav-cat-lbl')?.textContent.trim() || '',
          links: [...d.querySelectorAll('a')].map((el) => ({
            text: el.querySelector('.nav-lbl span')?.textContent.trim() || el.textContent.trim(),
            href: el.getAttribute('href') || '',
          })),
        }))
      );
      assert.deepStrictEqual(data.map((c) => c.label), ['Giảng dạy', 'Cá nhân']);
      assert.strictEqual(data[0].links.length, 5, `Giảng dạy must have 5 items (got ${data[0].links.length})`);
      const allHrefs = data.flatMap((c) => c.links.map((l) => l.href));
      assert.ok(allHrefs.includes('/app/giao-vien/bai-tap'), 'Missing /app/giao-vien/bai-tap');
      assert.ok(allHrefs.includes('/app/giao-vien/tien-do'), 'Missing /app/giao-vien/tien-do');
      assert.ok(allHrefs.includes('/app/thong-bao') && allHrefs.includes('/app/cai-dat') && allHrefs.includes('/app/ho-tro'), 'Missing Cá nhân items');
      assert.ok(!allHrefs.some((h) => h.includes('phong-van') || h.includes('toeic')), 'Teacher #sideNav must not leak student routes');
    }
  );

  suite.test(
    { id: 'T1-F3-03', tier: 1, feature: 'F3', milestone: 'M1', name: 'Teacher /app/lop renders j.teaching classroom list' },
    async () => {
      await ctx.visit('/app/lop', { role: 'teacher', viewport: 'mobile' });
      const text = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(text.includes(seed.classroom.name), `Teacher /app/lop must display "${seed.classroom.name}"`);
      assert.ok(text.includes('ĐANG DẠY'), 'Teacher class card must display ĐANG DẠY badge');
    }
  );

  suite.test(
    { id: 'T1-F3-04', tier: 1, feature: 'F3', milestone: 'M1', name: 'Teacher route /app/giao-vien/bai-tap renders assignment & test workspace' },
    async () => {
      await ctx.visit('/app/giao-vien/bai-tap', { role: 'teacher', viewport: 'mobile' });
      const text = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(!/Không tìm thấy trang/i.test(text), '/app/giao-vien/bai-tap must not hit 404');
      assert.ok(/Bài tập|Kiểm tra|Lớp/i.test(text), 'Expected assignment/test content on /app/giao-vien/bai-tap');
    }
  );

  suite.test(
    { id: 'T1-F3-05', tier: 1, feature: 'F3', milestone: 'M1', name: 'Teacher route /app/giao-vien/tien-do renders grading & progress view' },
    async () => {
      await ctx.visit('/app/giao-vien/tien-do', { role: 'teacher', viewport: 'mobile' });
      const text = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(!/Không tìm thấy trang/i.test(text), '/app/giao-vien/tien-do must not hit 404');
      assert.ok(/Tiến độ|Chấm|Học viên/i.test(text), 'Expected progress/grading content on /app/giao-vien/tien-do');
    }
  );

  // ================= F4: Student 5-Tab #mTab & "Học ngay" Radial Fan-Out =================
  suite.test(
    { id: 'T1-F4-01', tier: 1, feature: 'F4', milestone: 'M1', name: 'Student #mTab has 5 symmetric tabs (incl. #mTabLearnBtn & #mTabAcctBtn) without .mtab-9' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      const dock = await cdp.evalJs(() => {
        const nav = document.getElementById('mTab');
        return {
          hasMtab9: nav?.classList.contains('mtab-9') || false,
          count: nav?.querySelectorAll(':scope > a, :scope > button').length || 0,
          labels: [...(nav?.querySelectorAll('.mtab-lbl') || [])].map((e) => e.textContent.trim()),
          hasLearnBtn: document.getElementById('mTabLearnBtn')?.tagName === 'BUTTON',
          hasAcctBtn: document.getElementById('mTabAcctBtn')?.tagName === 'BUTTON',
        };
      });
      assert.strictEqual(dock.hasMtab9, false, '#mTab must NOT have .mtab-9');
      assert.strictEqual(dock.count, 5, `#mTab must have 5 tabs (got ${dock.count})`);
      assert.deepStrictEqual(dock.labels, ['Tổng quan', 'Lộ trình', 'Học ngay', 'Phỏng vấn', 'Cá nhân']);
      assert.ok(dock.hasLearnBtn, 'Center tab #mTabLearnBtn must be a <button>');
      assert.ok(dock.hasAcctBtn, '5th tab #mTabAcctBtn must be a <button>');
    }
  );

  suite.test(
    { id: 'T1-F4-02', tier: 1, feature: 'F4', milestone: 'M1', name: 'Tapping #mTabLearnBtn opens radial fan-out ("xòe quạt") of 5 floating study pills (no Tổng quan / Lộ trình duplicate)' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('#mTabLearnBtn');
      await new Promise((r) => setTimeout(r, 220));
      const fan = await ctx.assertFanMenuGeometry('mTabLearnBtn', { expectedCount: 5 });
      assert.ok(!fan.items.some((x) => x.label === 'Tổng quan' || x.label === 'Lộ trình'), 'Tổng quan and Lộ trình must NOT be duplicated inside Học ngay fan-out');
      assert.deepStrictEqual(fan.items.map((x) => x.label), ['Hội thoại AI', 'Luyện nói', 'Học', 'Ôn tập', 'TOEIC']);
      assert.ok(fan.distinctX >= 3 && fan.distinctY >= 2, `Expected symmetric fan-out arc across X/Y (distinctX=${fan.distinctX}, distinctY=${fan.distinctY})`);
      assert.ok(/blur\(/i.test(fan.scrimBlur), `Expected blurred scrim backdrop-filter on fan-out (got "${fan.scrimBlur}")`);
    }
  );

  suite.test(
    { id: 'T1-F4-03', tier: 1, feature: 'F4', milestone: 'M1', name: 'Học ngay 5 fan-out pills dynamically reflect active subject (en) routes' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('#mTabLearnBtn');
      const hrefs = await cdp.evalJs(() => {
        const ctrl = document.getElementById('mTabLearnBtn')?.getAttribute('aria-controls');
        const menu = (ctrl && document.getElementById(ctrl)) || document.querySelector('#mLearnSheet, .m-fan-learn');
        return menu && !menu.hidden ? [...menu.querySelectorAll('a')].map((a) => a.getAttribute('href')) : [];
      });
      assert.deepStrictEqual(hrefs, [
        '/app/ngoai-ngu/tro-chuyen/en',
        '/app/ngoai-ngu/luyen-noi/en',
        '/app/ngoai-ngu/en',
        '/app/ngoai-ngu/on-tap/en',
        '/app/toeic',
      ]);
    }
  );

  suite.test(
    { id: 'T1-F4-04', tier: 1, feature: 'F4', milestone: 'M1', name: 'Tapping "Luyện nói" pill in Học ngay fan-out navigates & marks #mTabLearnBtn active' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('#mTabLearnBtn');
      const hasSpeak = await ctx.waitForFanPill('mTabLearnBtn', '/app/ngoai-ngu/luyen-noi/en');
      assert.ok(hasSpeak, 'Expected visible Luyện nói fan-out pill');
      await ctx.clickFanPill('mTabLearnBtn', '/app/ngoai-ngu/luyen-noi/en');
      await cdp.waitForAppSettled({ selector: '#main h1' });
      const info = await cdp.evalJs(() => ({
        path: location.pathname,
        learnOn: document.getElementById('mTabLearnBtn')?.classList.contains('on') || false,
      }));
      assert.strictEqual(info.path, '/app/ngoai-ngu/luyen-noi/en');
      assert.strictEqual(info.learnOn, true);
    }
  );

  suite.test(
    { id: 'T1-F4-05', tier: 1, feature: 'F4', milestone: 'M1', name: 'Phỏng vấn standalone tab navigates to /app/phong-van and marks active' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('#mTab a[data-mt="phong-van"]');
      await cdp.waitForAppSettled({ selector: '.iv-m-intro, h1' });
      const info = await cdp.evalJs(() => ({
        path: location.pathname,
        on: document.querySelector('#mTab a[data-mt="phong-van"]')?.classList.contains('on') || false,
      }));
      assert.strictEqual(info.path, '/app/phong-van');
      assert.strictEqual(info.on, true, 'Phỏng vấn dock tab must have .on class');
    }
  );

  suite.test(
    { id: 'T1-F4-06', tier: 1, feature: 'F4', milestone: 'M1', name: 'Student #mTab uses modern floating glass pill dock aesthetic with crisp monochrome SVGs' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      const dock = await cdp.evalJs(() => {
        const nav = document.getElementById('mTab');
        const st = getComputedStyle(nav);
        const r = nav.getBoundingClientRect();
        const svgs = [...nav.querySelectorAll('svg')];
        return {
          radius: parseFloat(st.borderTopLeftRadius) || 0,
          left: r.left,
          right: r.right,
          bottom: r.bottom,
          vw: window.innerWidth,
          vh: window.innerHeight,
          backdrop: st.backdropFilter || st.webkitBackdropFilter || '',
          skIcCount: nav.querySelectorAll('.sk-ic').length,
          monoSvgs: svgs.length >= 5 && svgs.every((s) => s.getAttribute('fill') === 'none'),
        };
      });
      assert.ok(dock.radius >= 20, `Expected floating pill borderRadius >= 20px (got ${dock.radius}px)`);
      assert.ok(dock.left >= 8 && dock.right <= dock.vw - 8 && dock.bottom < dock.vh, `Expected floating inset dock (${dock.left}..${dock.right}, bottom=${dock.bottom}/${dock.vh})`);
      assert.ok(/blur\(/i.test(dock.backdrop), `Expected glass backdropFilter blur on #mTab (got "${dock.backdrop}")`);
      assert.strictEqual(dock.skIcCount, 0);
      assert.ok(dock.monoSvgs, 'Expected clean monochrome stroke SVGs on #mTab');
    }
  );

  // ================= F5: "Cá nhân" Fan-Out Menu, Separate /app/co-vu & /app/cai-dat =================
  suite.test(
    { id: 'T1-F5-01', tier: 1, feature: 'F5', milestone: 'M1', name: 'Tapping #mTabAcctBtn ("Cá nhân") fans out 5 floating pills right above Cá nhân within bounds' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      assert.ok(await ctx.existsVisible('#mTabAcctBtn'), 'Expected #mTabAcctBtn button on #mTab');
      await cdp.click('#mTabAcctBtn');
      await new Promise((r) => setTimeout(r, 220));
      const fan = await ctx.assertFanMenuGeometry('mTabAcctBtn', { expectedCount: 5 });
      assert.deepStrictEqual(fan.items.map((x) => x.href), ['/app/co-vu', '/app/lop', '/app/ca-nhan', '/app/goi-cua-toi', '/app/cai-dat']);
      assert.deepStrictEqual(fan.items.map((x) => x.label), ['Cổ vũ', 'Lớp học', 'Hồ sơ', 'Gói của tôi', 'Cài đặt']);
    }
  );

  suite.test(
    { id: 'T1-F5-02', tier: 1, feature: 'F5', milestone: 'M1', name: '/app/ca-nhan stays short & focused without merged #hmPetCard companion widget' },
    async () => {
      await ctx.visit('/app/ca-nhan', { role: 'student', viewport: 'mobile' });
      const res = await cdp.evalJs(() => ({
        hasPetCard: !!document.querySelector('#main #hmPetCard, #main .pf-companion-wrap'),
        hasCheerBtn: !!document.querySelector('#main #hmPetCheerBtn'),
        hasProfileHero: !!document.querySelector('#main .pf-m-hero, #main .pf-desk-head'),
      }));
      assert.ok(res.hasProfileHero, 'Profile hero must render on /app/ca-nhan');
      assert.strictEqual(res.hasPetCard, false, '/app/ca-nhan MUST NOT merge #hmPetCard companion section');
      assert.strictEqual(res.hasCheerBtn, false, '/app/ca-nhan MUST NOT merge #hmPetCheerBtn');
    }
  );

  suite.test(
    { id: 'T1-F5-03', tier: 1, feature: 'F5', milestone: 'M1', name: 'Tapping "Cổ vũ" from Cá nhân fan-out navigates to /app/co-vu and cheers "5 sao = +2 tri thức"' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      assert.ok(await ctx.existsVisible('#mTabAcctBtn'), 'Expected #mTabAcctBtn button');
      await cdp.click('#mTabAcctBtn');
      const hasCheerPill = await ctx.waitForFanPill('mTabAcctBtn', '/app/co-vu');
      assert.ok(hasCheerPill, 'Expected Cổ vũ floating pill in Cá nhân fan-out');
      await ctx.clickFanPill('mTabAcctBtn', '/app/co-vu');
      await cdp.waitForAppSettled({ selector: '#hmPetCard' });

      const before = await cdp.evalJs(() => ({
        path: location.pathname,
        stars: Number(document.querySelector('.hm-star-pill b, #hmPetCard [data-pet-stars]')?.textContent.replace(/\D/g, '') || 0),
        know: parseInt(document.getElementById('hmPetKnowVal')?.textContent || '0', 10),
        cheerTxt: document.getElementById('hmPetCheerBtn')?.textContent.trim() || '',
      }));
      assert.strictEqual(before.path, '/app/co-vu');
      assert.ok(before.cheerTxt.includes('5 sao = +2 tri thức'));
      assert.ok(before.stars >= 5);

      await cdp.click('#hmPetCheerBtn');
      await cdp.waitForCondition(
        (prev) => parseInt(document.getElementById('hmPetKnowVal')?.textContent || '0', 10) >= prev + 2,
        6000,
        80,
        before.know
      );
      const after = await cdp.evalJs(() => ({
        stars: Number(document.querySelector('.hm-star-pill b, #hmPetCard [data-pet-stars]')?.textContent.replace(/\D/g, '') || 0),
        know: parseInt(document.getElementById('hmPetKnowVal')?.textContent || '0', 10),
      }));
      assert.strictEqual(after.know, before.know + 2);
      assert.strictEqual(after.stars, before.stars - 5);
    }
  );

  suite.test(
    { id: 'T1-F5-04', tier: 1, feature: 'F5', milestone: 'M1', name: 'Companion pet switcher on /app/co-vu updates active pet card' },
    async () => {
      await ctx.visit('/app/co-vu', { role: 'student', viewport: 'mobile' });
      const prevName = await cdp.evalJs(() => document.getElementById('hmPetName')?.textContent.trim() || '');
      await cdp.click('#hmPetCard [data-pet="dragon"]');
      const next = await cdp.evalJs(() => ({
        name: document.getElementById('hmPetName')?.textContent.trim() || '',
        on: document.querySelector('#hmPetCard [data-pet="dragon"]')?.classList.contains('on') || false,
      }));
      assert.ok(next.on, 'Dragon pet tab must be marked .on');
      assert.notStrictEqual(next.name, prevName, 'Companion name should update when switching pet');
    }
  );

  suite.test(
    { id: 'T1-F5-05', tier: 1, feature: 'F5', milestone: 'M1', name: '/app/cai-dat renders theme, language, goal stepper, and security links' },
    async () => {
      await ctx.visit('/app/cai-dat', { role: 'student', viewport: 'mobile' });
      const info = await cdp.evalJs(() => ({
        h1: document.querySelector('#main h1')?.textContent.trim() || '',
        hasTheme: !!document.getElementById('stThemeBtn'),
        hasVi: !!document.querySelector('[data-set-lang="vi"]'),
        hasEn: !!document.querySelector('[data-set-lang="en"]'),
        goal: document.getElementById('stGoalVal')?.textContent.trim() || '',
      }));
      assert.strictEqual(info.h1, 'Cài đặt');
      assert.ok(info.hasTheme && info.hasVi && info.hasEn);
      assert.match(info.goal, /\d+\s*bài/);
    }
  );

  // ================= F6: Quick Account Menu (Mobile) =================
  suite.test(
    { id: 'T1-F6-01', tier: 1, feature: 'F6', milestone: 'M1', name: 'Tapping home avatar opens #mAcctSheet instead of leaving page' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      const state = await cdp.evalJs(() => ({
        hidden: document.getElementById('mAcctSheet')?.hidden ?? true,
        path: location.pathname,
      }));
      assert.strictEqual(state.hidden, false, '#mAcctSheet must become visible');
      assert.strictEqual(state.path, '/app/en', 'Should stay on /app/en when opening quick account menu');
    }
  );

  suite.test(
    { id: 'T1-F6-02', tier: 1, feature: 'F6', milestone: 'M1', name: 'Inner mobile pages remove redundant #mTopAcct avatar and use Cá nhân #mTabAcctBtn fan-out' },
    async () => {
      await ctx.visit('/app/phong-van', { role: 'student', viewport: 'mobile' });
      assert.strictEqual(await cdp.evalJs(() => !!document.getElementById('mTopAcct')), false, '#mTopAcct must be removed on inner mobile pages');
      await cdp.click('#mTabAcctBtn');
      await new Promise((r) => setTimeout(r, 180));
      await ctx.assertFanMenuGeometry('mTabAcctBtn', { expectedCount: 5 });
    }
  );

  suite.test(
    { id: 'T1-F6-03', tier: 1, feature: 'F6', milestone: 'M1', name: '#mAcctSheet shows Chibi bunny avatar, name, and @username · role' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      const info = await cdp.evalJs(() => ({
        src: document.querySelector('#mAcctSheet .m-acct-av')?.getAttribute('src') || '',
        name: document.getElementById('mAcctName')?.textContent.trim() || '',
        sub: document.querySelector('#mAcctSheet .m-acct-who small')?.textContent.trim() || '',
      }));
      assert.ok(info.src.includes('chibi-bunny.webp'));
      assert.ok(info.name.includes('Minh Anh'));
      assert.ok(info.sub.includes('@e2e_student') && info.sub.includes('Học viên'), `Unexpected sub: "${info.sub}"`);
    }
  );

  suite.test(
    { id: 'T1-F6-04', tier: 1, feature: 'F6', milestone: 'M1', name: '#mAcctSheet lists consolidated learner Cá nhân & Hệ thống actions with scrollable card' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      const info = await cdp.evalJs(() => {
        const card = document.querySelector('#mAcctSheet .m-acct-card');
        const st = card ? getComputedStyle(card) : null;
        return {
          rows: [...document.querySelectorAll('#mAcctSheet .m-acct-item')].map((el) => el.textContent.trim()),
          overflowY: st?.overflowY || '',
        };
      });
      for (const req of ['Hồ sơ của tôi', 'Lớp của tôi', 'Xếp hạng', 'Huy hiệu', 'Chứng nhận', 'Gói của tôi', 'Thông báo', 'Hỗ trợ', 'Xem lại hướng dẫn', 'Cài đặt', 'Đăng xuất']) {
        assert.ok(info.rows.includes(req), `Missing "${req}" in learner #mAcctSheet: ${JSON.stringify(info.rows)}`);
      }
      assert.strictEqual(info.overflowY, 'auto', 'Expected overflow-y: auto on .m-acct-card');
    }
  );

  suite.test(
    { id: 'T1-F6-05', tier: 1, feature: 'F6', milestone: 'M1', name: 'Clicking #mAcctGuide closes quick menu and launches guide modal' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      await cdp.click('#mAcctGuide');
      await cdp.waitForCondition(() => !!document.querySelector('.gd'), 5000, 60);
      const res = await cdp.evalJs(() => ({
        acctHidden: document.getElementById('mAcctSheet')?.hidden ?? false,
        gdVisible: !!document.querySelector('.gd'),
      }));
      assert.strictEqual(res.acctHidden, true, '#mAcctSheet must close');
      assert.strictEqual(res.gdVisible, true, 'Guide modal .gd must appear');
      await cdp.click('#gdSkip');
    }
  );

  // ================= F7: Certificates Mobile UI =================
  suite.test(
    { id: 'T1-F7-01', tier: 1, feature: 'F7', milestone: 'M2', name: 'Certificates mobile displays "Chứng nhận của bạn" and hides .lx-cert-list' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/chung-nhan-cua-toi/en', { role: 'student', viewport: 'mobile' });
      const res = await cdp.evalJs(() => {
        const text = document.getElementById('main')?.textContent || '';
        const listEl = document.querySelector('.lx-cert-list');
        return {
          hasMobileHeading: text.includes('Chứng nhận của bạn'),
          listDisplay: listEl ? getComputedStyle(listEl).display : 'missing',
        };
      });
      assert.ok(res.hasMobileHeading, 'M2: Mobile certificates must show "Chứng nhận của bạn"');
      assert.strictEqual(res.listDisplay, 'none', 'M2: .lx-cert-list must be hidden on mobile');
    }
  );

  suite.test(
    { id: 'T1-F7-02', tier: 1, feature: 'F7', milestone: 'M2', name: 'Featured A1 card shows "Chứng nhận A1", "Tiếng Anh · Hoàn thành cấp độ", and #EAF4FB "Đã đạt" pill' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/chung-nhan-cua-toi/en', { role: 'student', viewport: 'mobile' });
      const card = await cdp.evalJs(() => {
        const box = document.querySelector('.lx-cert-featured');
        const tag = box?.querySelector('.lx-cert-feat-tag');
        return {
          h2: box?.querySelector('h2')?.textContent.trim() || '',
          sub: box?.querySelector('p')?.textContent.trim() || '',
          tagText: tag?.textContent.trim() || '',
          tagBg: tag ? getComputedStyle(tag).backgroundColor : '',
          tagWidth: tag ? tag.getBoundingClientRect().width : 0,
          boxWidth: box ? box.getBoundingClientRect().width : 0,
        };
      });
      assert.ok(card.h2.includes('Chứng nhận A1'), `Expected "Chứng nhận A1", got "${card.h2}"`);
      assert.ok(card.sub.includes('Tiếng Anh · Hoàn thành cấp độ'), `Expected "Tiếng Anh · Hoàn thành cấp độ", got "${card.sub}"`);
      assert.strictEqual(card.tagText, 'Đã đạt');
      assert.strictEqual(card.tagBg, 'rgb(234, 244, 251)', `Expected #EAF4FB tag background, got ${card.tagBg}`);
      assert.ok(card.tagWidth >= card.boxWidth * 0.75, 'Expected full-width "Đã đạt" status bar');
    }
  );

  suite.test(
    { id: 'T1-F7-03', tier: 1, feature: 'F7', milestone: 'M2', name: 'Featured A1 CTA "Xem chứng nhận" is a 999px pill button' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/chung-nhan-cua-toi/en', { role: 'student', viewport: 'mobile' });
      const cta = await cdp.evalJs(() => {
        const el = document.querySelector('.lx-cert-feat-btn');
        return {
          text: el?.textContent.trim() || '',
          href: el?.getAttribute('href') || '',
          radius: el ? parseFloat(getComputedStyle(el).borderTopLeftRadius) : 0,
        };
      });
      assert.strictEqual(cta.text, 'Xem chứng nhận');
      assert.strictEqual(cta.href, '/app/ngoai-ngu/chung-nhan/en/a1');
      assert.ok(cta.radius >= 90, `Expected pill radius (>=90px), got ${cta.radius}px`);
    }
  );

  suite.test(
    { id: 'T1-F7-04', tier: 1, feature: 'F7', milestone: 'M2', name: 'Next-level progress card has split row and #3F97D3 progress bar > 0%' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/chung-nhan-cua-toi/en', { role: 'student', viewport: 'mobile' });
      const nxt = await cdp.evalJs(() => {
        const el = document.querySelector('.lx-cert-next');
        const barFill = el?.querySelector('.bar i, .lx-bar i, .cds-prog i');
        return {
          text: el?.textContent || '',
          barBg: barFill ? getComputedStyle(barFill).backgroundColor : '',
          barWidth: barFill ? parseFloat(barFill.style.width || '0') : 0,
        };
      });
      assert.ok(nxt.text.includes('Tiến độ cấp độ tiếp theo'), 'Missing next-level progress label');
      assert.ok(nxt.barWidth > 0, `Expected >0% next-level progress from seeded A2 items (got ${nxt.barWidth}%)`);
      assert.strictEqual(nxt.barBg, 'rgb(63, 151, 211)', `Expected #3F97D3 bar color, got ${nxt.barBg}`);
    }
  );

  suite.test(
    { id: 'T1-F7-05', tier: 1, feature: 'F7', milestone: 'M2', name: 'Clicking "Xem chứng nhận" opens /app/ngoai-ngu/chung-nhan/en/a1 with valid certificate' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/chung-nhan-cua-toi/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.lx-cert-feat-btn');
      await cdp.waitForAppSettled({ selector: '#main' });
      const certText = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(certText.includes('Minh Anh'), 'Certificate must show student name');
      assert.ok(/LX-EN-A1-/.test(certText), 'Certificate must show verification code LX-EN-A1-...');
    }
  );

  // ================= F8: Leaderboard Mobile UI =================
  suite.test(
    { id: 'T1-F8-01', tier: 1, feature: 'F8', milestone: 'M2', name: 'Leaderboard hero card is centered vertically with rank #4' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/xep-hang/en', { role: 'student', viewport: 'mobile' });
      const hero = await cdp.evalJs(() => {
        const el = document.querySelector('.lx-lb-hero');
        const st = el ? getComputedStyle(el) : null;
        return {
          text: el?.textContent || '',
          flexDir: st?.flexDirection || '',
          textAlign: st?.textAlign || '',
        };
      });
      assert.ok(hero.text.includes('Tuần này bạn đang ở hạng #4'), `Expected rank #4 hero, got "${hero.text}"`);
      assert.strictEqual(hero.flexDir, 'column', `M2: .lx-lb-hero must stack vertically (got ${hero.flexDir})`);
      assert.strictEqual(hero.textAlign, 'center', `M2: .lx-lb-hero must be centered (got ${hero.textAlign})`);
    }
  );

  suite.test(
    { id: 'T1-F8-02', tier: 1, feature: 'F8', milestone: 'M2', name: '.lx-lb-row keeps all 4 columns aligned on one horizontal band without wrapping' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/xep-hang/en', { role: 'student', viewport: 'mobile' });
      const rows = await cdp.evalJs(() =>
        [...document.querySelectorAll('.lx-lb-row')].map((r) => {
          const children = [...r.children].map((c) => c.getBoundingClientRect());
          const minTop = Math.min(...children.map((x) => x.top));
          const maxTop = Math.max(...children.map((x) => x.top));
          return {
            cols: getComputedStyle(r).gridTemplateColumns.trim().split(/\s+/).length,
            childCount: children.length,
            wrapped: maxTop - minTop > 28,
          };
        })
      );
      assert.ok(rows.length >= 4, `Expected >=4 leaderboard rows (got ${rows.length})`);
      for (const r of rows) {
        assert.ok(r.cols >= 4, `M2: .lx-lb-row grid must have >=4 columns (got ${r.cols})`);
        assert.strictEqual(r.wrapped, false, 'M2: .lx-lb-row children must not wrap onto extra row');
      }
    }
  );

  suite.test(
    { id: 'T1-F8-03', tier: 1, feature: 'F8', milestone: 'M2', name: 'Leaderboard shows #1/#2/#3/#4 rank markers and highlights current user' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/xep-hang/en', { role: 'student', viewport: 'mobile' });
      const data = await cdp.evalJs(() => ({
        ranks: [...document.querySelectorAll('.lx-lb-rank')].map((e) => e.textContent.trim()),
        meRowText: document.querySelector('.lx-lb-row.me')?.textContent || '',
      }));
      assert.ok(data.ranks[0].includes('1') && data.ranks[1].includes('2') && data.ranks[2].includes('3') && data.ranks[3].includes('4'));
      assert.ok(data.meRowText.includes('Minh Anh'), 'Row 4 must highlight Minh Anh (.me)');
    }
  );

  suite.test(
    { id: 'T1-F8-04', tier: 1, feature: 'F8', milestone: 'M2', name: 'Leaderboard API exposes points and UI renders XP values' },
    async () => {
      const apiRes = await apiRequest(baseUrl, 'GET', '/api/lang/leaderboard/en', { session: seed.student });
      assert.strictEqual(apiRes.status, 200);
      assert.ok(Array.isArray(apiRes.json?.top) && apiRes.json.top.length >= 4);
      assert.ok(typeof apiRes.json.top[0].points === 'number' && apiRes.json.top[0].points > 0, 'M2: /api/lang/leaderboard/en must expose numeric points');
      await ctx.visit('/app/ngoai-ngu/xep-hang/en', { role: 'student', viewport: 'mobile' });
      const lbText = await cdp.evalJs(() => document.querySelector('.lx-lb')?.textContent || '');
      assert.match(lbText, /XP/i, 'M2: Leaderboard rows must display XP');
    }
  );

  suite.test(
    { id: 'T1-F8-05', tier: 1, feature: 'F8', milestone: 'M2', name: 'Leaderboard avatars load cleanly with zero horizontal overflow' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/xep-hang/en', { role: 'student', viewport: 'mobile' });
      await ctx.assertNoOverflow('T1-F8-05 leaderboard 390px');
      const imgs = await cdp.evalJs(() =>
        [...document.querySelectorAll('.lx-lb-av')].map((img) => ({ complete: img.complete, w: img.naturalWidth }))
      );
      assert.ok(imgs.length >= 4 && imgs.every((i) => i.complete && i.w > 0), 'All leaderboard avatars must load cleanly');
    }
  );

  // ================= F9: Badges Mobile UI =================
  suite.test(
    { id: 'T1-F9-01', tier: 1, feature: 'F9', milestone: 'M2', name: 'Badges mobile displays clean intro "Huy hiệu của bạn" with unlock tally' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/huy-hieu/en', { role: 'student', viewport: 'mobile' });
      const text = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(text.includes('Huy hiệu của bạn'), 'M2: Expected mobile heading "Huy hiệu của bạn"');
      assert.match(text, /\d+\/\d+/, 'Expected unlocked/total badge tally');
    }
  );

  suite.test(
    { id: 'T1-F9-02', tier: 1, feature: 'F9', milestone: 'M2', name: 'Badges render 2-column pastel .cds-ach card grid on 390x844 mobile' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/huy-hieu/en', { role: 'student', viewport: 'mobile' });
      const grid = await cdp.evalJs(() => {
        const el = document.querySelector('.lx-badges');
        const cols = el ? getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length : 0;
        const cards = [...document.querySelectorAll('.lx-badges .cds-ach')].slice(0, 4).map((c) => getComputedStyle(c).backgroundColor);
        return { cols, cards };
      });
      assert.strictEqual(grid.cols, 2, `Expected 2-column badge grid on mobile (got ${grid.cols})`);
      assert.ok(new Set(grid.cards).size >= 2, 'Expected distinct pastel tints across 2x2 badge cards');
    }
  );

  suite.test(
    { id: 'T1-F9-03', tier: 1, feature: 'F9', milestone: 'M2', name: 'Seeded achievements show "Đã mở khóa" status pills' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/huy-hieu/en', { role: 'student', viewport: 'mobile' });
      const unlocked = await cdp.evalJs(() =>
        [...document.querySelectorAll('.cds-ach .cds-ach-done.is-ok')].map((e) => ({
          pill: e.textContent.trim(),
          title: e.closest('.cds-ach')?.querySelector('b, h3, .cds-ach-t')?.textContent.trim() || '',
        }))
      );
      assert.ok(unlocked.length >= 4, `Expected >= 4 unlocked badges from seeded data (got ${unlocked.length})`);
      assert.ok(unlocked.every((u) => u.pill.includes('Đã mở khóa')));
    }
  );

  suite.test(
    { id: 'T1-F9-04', tier: 1, feature: 'F9', milestone: 'M2', name: 'Locked badges show "Chưa mở khóa" and hide .cds-prog bar on mobile' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/huy-hieu/en', { role: 'student', viewport: 'mobile' });
      const locked = await cdp.evalJs(() => {
        const lockCards = [...document.querySelectorAll('.cds-ach .cds-ach-done.is-lock')];
        const progs = [...document.querySelectorAll('.cds-ach .cds-prog')];
        const visProgs = progs.filter((p) => getComputedStyle(p).display !== 'none');
        return { lockCount: lockCards.length, totalProg: progs.length, visProg: visProgs.length };
      });
      assert.ok(locked.lockCount >= 1, 'Expected at least 1 locked badge (e.g. Chuỗi 30 ngày)');
      assert.strictEqual(locked.visProg, 0, `M2: .cds-prog inside .cds-ach must be hidden on mobile (found ${locked.visProg} visible)`);
    }
  );

  suite.test(
    { id: 'T1-F9-05', tier: 1, feature: 'F9', milestone: 'M2', name: 'Badges view has crisp titles/descriptions and zero horizontal overflow' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/huy-hieu/en', { role: 'student', viewport: 'mobile' });
      await ctx.assertNoOverflow('T1-F9-05 badges 390px');
      const cardCount = await cdp.evalJs(() => document.querySelectorAll('.lx-badges .cds-ach').length);
      assert.ok(cardCount >= 12, `Expected >=12 badge cards (got ${cardCount})`);
    }
  );

  // ================= F10: Classroom Test Taking Mobile UI =================
  suite.test(
    { id: 'T1-F10-01', tier: 1, feature: 'F10', milestone: 'M2', name: 'Classroom test intro shows "BÀI KIỂM TRA" pill, KPIs, and #start button' },
    async () => {
      await ctx.visit(`/app/kiem-tra-lop/${seed.testMain.id}`, { role: 'student', viewport: 'mobile' });
      const intro = await cdp.evalJs(() => ({
        pill: document.querySelector('.cl-test-intro .lx-ex-pill')?.textContent.trim() || '',
        title: document.querySelector('.cl-test-intro h1')?.textContent.trim() || '',
        kpis: [...document.querySelectorAll('.cl-test-intro .cl-m-kpi')].map((k) => k.textContent.trim()),
        hasStart: !!document.getElementById('start'),
      }));
      assert.strictEqual(intro.pill, 'BÀI KIỂM TRA');
      assert.strictEqual(intro.title, seed.testMain.title);
      assert.ok(intro.hasStart, '#start button must be present');
      assert.ok(intro.kpis.some((k) => k.includes('15')) && intro.kpis.some((k) => k.includes('5')));
    }
  );

  suite.test(
    { id: 'T1-F10-02', tier: 1, feature: 'F10', milestone: 'M2', name: 'Active test paginates 1 question at a time ("Câu 1/5") with 20% progress bar' },
    async () => {
      await ctx.visit(`/app/kiem-tra-lop/${seed.testMain.id}`, { role: 'student', viewport: 'mobile' });
      await cdp.click('#start');
      await cdp.waitForCondition(() => !!document.querySelector('.modal [data-ok]'), 4000, 60);
      await cdp.click('.modal [data-ok]');
      await cdp.waitForCondition(() => !!document.getElementById('tf'), 6000, 80);
      const state = await cdp.evalJs(() => {
        const cnt = document.querySelector('.lx-ex-cnt')?.textContent.trim() || '';
        const progW = document.querySelector('.lx-ex-prog i')?.style.width || '';
        const visBlocks = [...document.querySelectorAll('#tf .q-block')].filter((b) => getComputedStyle(b).display !== 'none').length;
        return { cnt, progW, visBlocks };
      });
      assert.ok(state.cnt.includes('Câu 1/5'), `M2: Expected "Câu 1/5" counter, got "${state.cnt}"`);
      assert.strictEqual(state.visBlocks, 1, `M2: Expected 1 visible question block per page, got ${state.visBlocks}`);
      assert.ok(state.progW === '20%', `M2: Expected 20% progress bar width on Q1/5, got "${state.progW}"`);
    }
  );

  suite.test(
    { id: 'T1-F10-03', tier: 1, feature: 'F10', milestone: 'M2', name: 'Active test keeps #timer alive while hiding .test-head on mobile' },
    async () => {
      await ctx.visit(`/app/kiem-tra-lop/${seed.testMain.id}`, { role: 'student', viewport: 'mobile' });
      // testMain may already be in "doing" state -> click #start (no confirm modal if already doing, else confirm)
      await cdp.click('#start');
      await new Promise((r) => setTimeout(r, 200));
      const hasModal = await ctx.existsVisible('.modal [data-ok]');
      if (hasModal) await cdp.click('.modal [data-ok]');
      await cdp.waitForCondition(() => !!document.getElementById('tf'), 6000, 80);
      const timerInfo = await cdp.evalJs(() => {
        const th = document.querySelector('.test-head');
        const timer = document.getElementById('timer');
        return {
          testHeadDisplay: th ? getComputedStyle(th).display : 'missing',
          timerText: timer?.textContent.trim() || '',
          kpiTimer: document.getElementById('timerKpi')?.textContent.trim() || '',
        };
      });
      assert.strictEqual(timerInfo.testHeadDisplay, 'none', 'M2: .test-head must be hidden on mobile');
      assert.match(timerInfo.timerText, /\d{1,2}:\d{2}/, '#timer must stay alive with MM:SS countdown');
    }
  );

  suite.test(
    { id: 'T1-F10-04', tier: 1, feature: 'F10', milestone: 'M2', name: 'Active test shows "Bài kiểm tra lớp · Không có trợ giúp AI" and "Tiếp theo" pill' },
    async () => {
      await ctx.visit(`/app/kiem-tra-lop/${seed.testMain.id}`, { role: 'student', viewport: 'mobile' });
      await cdp.click('#start');
      await new Promise((r) => setTimeout(r, 200));
      if (await ctx.existsVisible('.modal [data-ok]')) await cdp.click('.modal [data-ok]');
      await cdp.waitForCondition(() => !!document.getElementById('tf'), 6000, 80);
      const foot = await cdp.evalJs(() => {
        const text = document.getElementById('main')?.textContent || '';
        const btns = [...document.querySelectorAll('#tf button, #main button')].filter((b) => getComputedStyle(b).display !== 'none').map((b) => b.textContent.trim());
        return { text, btns };
      });
      assert.ok(foot.text.includes('Bài kiểm tra lớp · Không có trợ giúp AI'), 'M2: Missing AI-free exam footer note');
      assert.ok(foot.btns.some((b) => b.includes('Tiếp theo')), `M2: Expected "Tiếp theo" button, got ${JSON.stringify(foot.btns)}`);
    }
  );

  suite.test(
    { id: 'T1-F10-05', tier: 1, feature: 'F10', milestone: 'M2', name: 'Stepping through Q1..Q5 with label.cl-test-opt and submitting yields 10/10 score' },
    async () => {
      await ctx.visit(`/app/kiem-tra-lop/${seed.testMain.id}`, { role: 'student', viewport: 'mobile' });
      await cdp.click('#start');
      await new Promise((r) => setTimeout(r, 200));
      if (await ctx.existsVisible('.modal [data-ok]')) await cdp.click('.modal [data-ok]');
      await cdp.waitForCondition(() => !!document.getElementById('tf'), 6000, 80);

      const hasNextBtn = await cdp.evalJs(() =>
        [...document.querySelectorAll('#tf button, #main button')].some((b) => b.textContent.includes('Tiếp theo'))
      );
      assert.ok(hasNextBtn, 'M2: Single-question "Tiếp theo" pagination button must exist');

      const correctIdx = [0, 1, 2, 1, 1];
      for (let qi = 0; qi < 5; qi++) {
        await cdp.evalJs((ansIdx) => {
          const visBlock = [...document.querySelectorAll('#tf .q-block')].find((b) => getComputedStyle(b).display !== 'none');
          const opts = visBlock ? [...visBlock.querySelectorAll('label.cl-test-opt')] : [];
          opts[ansIdx]?.click();
        }, correctIdx[qi]);
        if (qi < 4) {
          await cdp.clickText('#tf button, #main button', 'Tiếp theo');
        } else {
          await cdp.clickText('#tf button, #main button', 'Nộp bài');
        }
      }
      await cdp.waitForCondition(() => !!document.querySelector('.modal [data-ok]'), 4000, 60);
      await cdp.click('.modal [data-ok]');
      await cdp.waitForCondition(() => (document.getElementById('main')?.textContent || '').includes('Đã nộp bài'), 6000, 80);
      const resultText = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(resultText.includes('10/10'), `Expected perfect 10/10 score, got "${resultText.slice(0, 200)}"`);
    }
  );

  // ================= F11: Admin Unified 5-Pillar Architecture & Line Icons =================
  suite.test(
    { id: 'T1-F11-01', tier: 1, feature: 'F11', milestone: 'M3', name: 'Admin shell displays Finn dragon avatar, "Quản trị viên", "LifeRivo · Admin", and zero duplicate menu buttons' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const head = await cdp.evalJs(() => {
        const av = document.querySelector('.ad-m-drawer-av');
        return {
          noDupMenuBtns: !document.getElementById('adMMore') && !document.getElementById('adMTabMenu'),
          dockCount: document.querySelectorAll('.ad-m-tab .ad-m-tab-it').length,
          src: av?.getAttribute('src') || '',
          title: document.querySelector('.ad-m-drawer-user b')?.textContent.trim() || '',
          sub: document.querySelector('.ad-m-drawer-user span')?.textContent.trim() || '',
        };
      });
      assert.ok(head.noDupMenuBtns, 'Must eliminate duplicate #adMMore / #adMTabMenu menu triggers');
      assert.strictEqual(head.dockCount, 5, 'Expected 5 unified pillars on .ad-m-tab dock');
      assert.ok(head.src.includes('chibi-dragon.webp'), `Expected Finn dragon avatar, got ${head.src}`);
      assert.strictEqual(head.title, 'Quản trị viên');
      assert.ok(head.sub.includes('LifeRivo · Admin'), `M3: Expected "LifeRivo · Admin", got "${head.sub}"`);
    }
  );

  suite.test(
    { id: 'T1-F11-02', tier: 1, feature: 'F11', milestone: 'M3', name: 'Admin navigation displays "Lớp học và giấy phép" and all 5 unified groups' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const nav = await cdp.evalJs(() => ({
        groups: [...document.querySelectorAll('.ad-grp-l')].map((e) => e.textContent.trim()),
        items: [...document.querySelectorAll('.ad-nav a span')].map((e) => e.textContent.trim()),
      }));
      assert.strictEqual(nav.groups.length, 5, `Expected 5 unified Admin nav groups, got ${nav.groups.length}`);
      assert.ok(nav.items.includes('Lớp học và giấy phép'), `M3: Expected "Lớp học và giấy phép" label, got ${JSON.stringify(nav.items)}`);
    }
  );

  suite.test(
    { id: 'T1-F11-03', tier: 1, feature: 'F11', milestone: 'M3', name: 'Admin mobile hides .ad-back ("Về trang học") inside .ad-side on mobile' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const backDisp = await cdp.evalJs(() => {
        const el = document.querySelector('.ad-back');
        return el ? getComputedStyle(el).display : 'missing';
      });
      assert.strictEqual(backDisp, 'none', `M3: .ad-back must be hidden on mobile (got ${backDisp})`);
    }
  );

  suite.test(
    { id: 'T1-F11-04', tier: 1, feature: 'F11', milestone: 'M3', name: 'Admin shell & navigation contain ZERO .sk-ic or Chibi-face SVGs' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const v = await ctx.inspectAdminVisuals();
      assert.strictEqual(v.skIcCount, 0, `M3: Found ${v.skIcCount} .sk-ic icons inside .ad`);
      assert.strictEqual(v.chibiSvgs, 0, `M3: Found ${v.chibiSvgs} Chibi-face SVGs inside .ad`);
    }
  );

  suite.test(
    { id: 'T1-F11-05', tier: 1, feature: 'F11', milestone: 'Core', name: 'Non-admin student is denied /app/quan-tri without mounting .ad shell' },
    async () => {
      await ctx.visit('/app/quan-tri', { role: 'student', viewport: 'mobile', expectAdmin: true, allowDenied: true });
      const state = await cdp.evalJs(() => ({
        hasAxOn: document.body.classList.contains('ax-on'),
        hasAd: !!document.getElementById('ad'),
        text: document.getElementById('main')?.textContent || '',
      }));
      assert.strictEqual(state.hasAxOn, false);
      assert.strictEqual(state.hasAd, false);
      assert.ok(state.text.includes('không có quyền'), 'Expected access denied message for student');
    }
  );

  // ================= F12: Admin Mobile Modernization Core & Nav Fixes =================
  suite.test(
    { id: 'T1-F12-01', tier: 1, feature: 'F12', milestone: 'M3', name: 'Admin mobile uses #F4F7FB light blue-gray canvas with zero dotted background' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const v = await ctx.inspectAdminVisuals();
      assert.strictEqual(v.bodyBg, 'rgb(244, 247, 251)', `M3: Expected #F4F7FB body background, got ${v.bodyBg}`);
      assert.strictEqual(v.bodyBgImg, 'none', `M3: Expected body backgroundImage "none", got ${v.bodyBgImg}`);
      assert.strictEqual(v.adBgImg, 'none', `M3: Expected .ad backgroundImage "none", got ${v.adBgImg}`);
    }
  );

  suite.test(
    { id: 'T1-F12-02', tier: 1, feature: 'F12', milestone: 'M3', name: 'Admin mobile typography uses clean sans-serif (no Mali or Patrick Hand)' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const v = await ctx.inspectAdminVisuals();
      assert.doesNotMatch(v.bodyFont, /Mali|Patrick Hand/i, `M3: Body font leaked handwritten font: ${v.bodyFont}`);
      assert.doesNotMatch(v.h1Font, /Mali|Patrick Hand/i, `M3: H1 font leaked handwritten font: ${v.h1Font}`);
    }
  );

  suite.test(
    { id: 'T1-F12-03', tier: 1, feature: 'F12', milestone: 'M3', name: 'Admin mobile uses crisp white cards & inputs with zero #FDE047 yellow buttons/chips' },
    async () => {
      await ctx.visit('/app/quan-tri/hoc-vien', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const v = await ctx.inspectAdminVisuals();
      assert.deepStrictEqual(v.yellowControls, [], `M3: Found #FDE047 yellow controls: ${JSON.stringify(v.yellowControls)}`);
      assert.deepStrictEqual(v.creamInputs, [], `M3: Found #FAF6EC cream inputs: ${JSON.stringify(v.creamInputs)}`);
      assert.deepStrictEqual(v.nonWhiteCards, [], `M3: Found non-white cards: ${JSON.stringify(v.nonWhiteCards)}`);
    }
  );

  suite.test(
    { id: 'T1-F12-04', tier: 1, feature: 'F12', milestone: 'M3', name: '4-tab Admin dock highlights Người dùng on lop-giay-phep and Nội dung on song-ngu' },
    async () => {
      await ctx.visit('/app/quan-tri/lop-giay-phep', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const tab1 = await cdp.evalJs(() => document.querySelector('.ad-m-tab-it.on')?.textContent.trim() || '');
      assert.strictEqual(tab1, 'Người dùng', `M3: lop-giay-phep must activate Người dùng dock tab (got "${tab1}")`);

      await ctx.visit('/app/quan-tri/song-ngu', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const tab2 = await cdp.evalJs(() => document.querySelector('.ad-m-tab-it.on')?.textContent.trim() || '');
      assert.strictEqual(tab2, 'Nội dung', `M3: song-ngu must activate Nội dung dock tab (got "${tab2}")`);
    }
  );

  suite.test(
    { id: 'T1-F12-05', tier: 1, feature: 'F12', milestone: 'M3', name: '#adMBack uses SPA navigation to tong-quan and quick card "Hệ thống" links to valid route' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const sysHref = await cdp.evalJs(() => {
        const cards = [...document.querySelectorAll('.ad-m-qcard')];
        const sys = cards.find((c) => c.textContent.includes('Hệ thống'));
        const a = sys?.tagName === 'A' ? sys : sys?.querySelector('a.ad-m-qhead, a');
        return a?.getAttribute('href') || '';
      });
      assert.ok(sysHref && !sysHref.includes('cai-dat-he-thong'), `M3: Hệ thống quick card has broken href "${sysHref}"`);

      await ctx.visit('/app/quan-tri/hoc-vien', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      await cdp.evalJs(() => { window.__e2eSpaMarker = 1; });
      await cdp.click('#adMBack');
      await cdp.waitForAppSettled({ expectAdmin: true });
      const after = await cdp.evalJs(() => ({
        path: location.pathname,
        marker: window.__e2eSpaMarker || 0,
      }));
      assert.ok(after.path.endsWith('/tong-quan') || after.path === '/app/quan-tri', `Expected tong-quan, got ${after.path}`);
      assert.strictEqual(after.marker, 1, 'M3: #adMBack must use SPA pushState navigation (not full page reload)');
    }
  );

  suite.test(
    { id: 'T1-F12-06', tier: 1, feature: 'F12', milestone: 'M3', name: 'Admin .ad-m-tab uses unified floating glass pill dock aesthetic with crisp monochrome SVGs' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const dock = await cdp.evalJs(() => {
        const nav = document.querySelector('.ad-m-tab');
        const st = nav ? getComputedStyle(nav) : null;
        const r = nav?.getBoundingClientRect();
        const svgs = nav ? [...nav.querySelectorAll('svg')] : [];
        return {
          exists: !!nav,
          radius: st ? parseFloat(st.borderTopLeftRadius) || 0 : 0,
          left: r?.left ?? 0,
          right: r?.right ?? 999,
          bottom: r?.bottom ?? 999,
          vw: window.innerWidth,
          vh: window.innerHeight,
          backdrop: st ? (st.backdropFilter || st.webkitBackdropFilter || '') : '',
          skIcCount: nav ? nav.querySelectorAll('.sk-ic').length : 0,
          monoSvgs: svgs.length >= 4 && svgs.every((s) => s.getAttribute('fill') === 'none'),
        };
      });
      assert.ok(dock.exists);
      assert.ok(dock.radius >= 20, `M3: Expected floating pill borderRadius >= 20px on .ad-m-tab (got ${dock.radius}px)`);
      assert.ok(dock.left >= 8 && dock.right <= dock.vw - 8 && dock.bottom < dock.vh, `M3: Expected floating inset .ad-m-tab (${dock.left}..${dock.right}, bottom=${dock.bottom}/${dock.vh})`);
      assert.ok(/blur\(/i.test(dock.backdrop), `M3: Expected glass backdropFilter blur on .ad-m-tab (got "${dock.backdrop}")`);
      assert.strictEqual(dock.skIcCount, 0);
      assert.ok(dock.monoSvgs, 'M3: Expected monochrome stroke SVGs on .ad-m-tab');
    }
  );

  // ================= F13: All 13 Admin Mobile Routes =================
  suite.test(
    { id: 'T1-F13-01', tier: 1, feature: 'F13', milestone: 'M3', name: 'Admin user & class routes (tong-quan, hoc-vien, hoc-vien/:uid, giao-vien, lop-giay-phep) clean' },
    async () => {
      for (const p of ['/app/quan-tri/tong-quan', '/app/quan-tri/hoc-vien', `/app/quan-tri/hoc-vien/${seed.student.user.id}`, '/app/quan-tri/giao-vien', '/app/quan-tri/lop-giay-phep']) {
        await ctx.visit(p, { role: 'admin', viewport: 'mobile', expectAdmin: true });
        await ctx.assertNoOverflow(`T1-F13-01 ${p}`);
        const v = await ctx.inspectAdminVisuals();
        assert.strictEqual(v.skIcCount, 0, `${p}: found .sk-ic`);
        assert.deepStrictEqual(v.yellowControls, [], `${p}: found #FDE047 controls`);
      }
    }
  );

  suite.test(
    { id: 'T1-F13-02', tier: 1, feature: 'F13', milestone: 'M3', name: 'Admin kinh-doanh mobile renders business hub and sub-views cleanly' },
    async () => {
      await ctx.visit('/app/quan-tri/kinh-doanh', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      await ctx.assertNoOverflow('T1-F13-02 kinh-doanh');
      const v = await ctx.inspectAdminVisuals();
      assert.strictEqual(v.skIcCount, 0, 'M3: kinh-doanh must have 0 .sk-ic');
      assert.deepStrictEqual(v.yellowControls, [], 'M3: kinh-doanh must have 0 #FDE047 controls');
      const text = await cdp.evalJs(() => document.querySelector('.ad-content')?.textContent || '');
      assert.ok(text.includes('Doanh thu và gói Pro'), 'Expected Doanh thu và gói Pro heading');
    }
  );

  suite.test(
    { id: 'T1-F13-03', tier: 1, feature: 'F13', milestone: 'M3', name: 'Admin cai-dat & he-thong mobile render settings hub and 4 panels cleanly' },
    async () => {
      await ctx.visit('/app/quan-tri/cai-dat', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      await ctx.assertNoOverflow('T1-F13-03 cai-dat');
      let v = await ctx.inspectAdminVisuals();
      assert.strictEqual(v.skIcCount, 0, 'M3: cai-dat must have 0 .sk-ic');

      await ctx.visit('/app/quan-tri/he-thong', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      await ctx.assertNoOverflow('T1-F13-03 he-thong');
      v = await ctx.inspectAdminVisuals();
      assert.strictEqual(v.skIcCount, 0, 'M3: he-thong must have 0 .sk-ic');
      const panels = await cdp.evalJs(() => document.querySelectorAll('.chips button[data-panel]').length);
      assert.strictEqual(panels, 4, `Expected 4 panels on he-thong (got ${panels})`);
    }
  );

  suite.test(
    { id: 'T1-F13-04', tier: 1, feature: 'F13', milestone: 'M3', name: 'Admin song-ngu mobile renders 2 KPIs, pill search, and status translation cards' },
    async () => {
      await ctx.visit('/app/quan-tri/song-ngu', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      await ctx.assertNoOverflow('T1-F13-04 song-ngu');
      const v = await ctx.inspectAdminVisuals();
      assert.strictEqual(v.skIcCount, 0, 'M3: song-ngu must have 0 .sk-ic');
      const info = await cdp.evalJs(() => ({
        hasQ: !!document.getElementById('q'),
        text: document.querySelector('.ad-content')?.textContent || '',
      }));
      assert.ok(info.hasQ, 'Expected #q search input on song-ngu');
      assert.ok(info.text.includes('Bản dịch giao diện'));
    }
  );

  suite.test(
    { id: 'T1-F13-05', tier: 1, feature: 'F13', milestone: 'M3', name: 'Admin giam-sat, ngoai-ngu, thong-bao, ma-qua-tang, du-lieu mobile clean' },
    async () => {
      await ctx.visit('/app/quan-tri/giam-sat', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const monText = await cdp.evalJs(() => document.querySelector('.ad-content')?.textContent || '');
      assert.ok(monText.includes('Chi phí AI hôm nay') || monText.includes('Bình thường'), 'M3: giam-sat mobile must show modernized service/AI cost cards');

      for (const p of ['/app/quan-tri/giam-sat', '/app/quan-tri/ngoai-ngu', '/app/quan-tri/thong-bao', '/app/quan-tri/ma-qua-tang', '/app/quan-tri/du-lieu']) {
        await ctx.visit(p, { role: 'admin', viewport: 'mobile', expectAdmin: true });
        await ctx.assertNoOverflow(`T1-F13-05 ${p}`);
        const v = await ctx.inspectAdminVisuals();
        assert.strictEqual(v.skIcCount, 0, `${p}: found .sk-ic`);
        assert.deepStrictEqual(v.yellowControls, [], `${p}: found #FDE047 controls`);
      }
    }
  );

  // ================= F14: Desktop Intactness & Workspace Safety =================
  suite.test(
    { id: 'T1-F14-01', tier: 1, feature: 'F14', milestone: 'Core', name: 'Landing / preserves .aw #FAF6EC tokens and SSR theme-color meta on desktop & mobile' },
    async () => {
      const ssr = await apiRequest(baseUrl, 'GET', '/');
      assert.strictEqual(ssr.status, 200);
      assert.match(ssr.text, /<meta\s+name="theme-color"\s+content="#FAF6EC"/i, 'SSR HTML must contain <meta name="theme-color" content="#FAF6EC">');

      await ctx.visitLanding({ viewport: 'desktop', pathName: '/' });
      const d = await cdp.evalJs(() => {
        const aw = document.querySelector('#landingPage.aw');
        const st = aw ? getComputedStyle(aw) : null;
        return {
          hasAw: !!aw,
          paperToken: st ? st.getPropertyValue('--paper').trim().toUpperCase() : '',
          awBg: st?.backgroundColor || '',
        };
      });
      assert.ok(d.hasAw, '#landingPage.aw must exist');
      assert.strictEqual(d.paperToken, '#FAF6EC', `Expected .aw --paper #FAF6EC, got ${d.paperToken}`);
      assert.ok(['rgb(250, 246, 236)', 'rgb(250, 249, 255)'].includes(d.awBg), `Expected light landing .aw bg, got ${d.awBg}`);
    }
  );

  suite.test(
    { id: 'T1-F14-02', tier: 1, feature: 'F14', milestone: 'Core', name: 'Desktop 1440x900 Learner /app/en keeps #side, .side-foot, .topbar visible and #mTab hidden' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'desktop' });
      await ctx.assertNoOverflow('T1-F14-02 desktop learner');
      const d = await cdp.evalJs(() => ({
        sideW: document.getElementById('side')?.getBoundingClientRect().width || 0,
        footDisp: getComputedStyle(document.querySelector('#side .side-foot')).display,
        topDisp: getComputedStyle(document.querySelector('.topbar')).display,
        mTabDisp: getComputedStyle(document.getElementById('mTab')).display,
      }));
      assert.ok(d.sideW >= 240, `Expected desktop sidebar >=240px (got ${d.sideW})`);
      assert.notStrictEqual(d.footDisp, 'none', '.side-foot must be visible on desktop');
      assert.notStrictEqual(d.topDisp, 'none', '.topbar must be visible on desktop');
      assert.strictEqual(d.mTabDisp, 'none', '#mTab must be hidden on desktop');
    }
  );

  suite.test(
    { id: 'T1-F14-03', tier: 1, feature: 'F14', milestone: 'Core', name: 'Desktop 1440x900 Teacher /app/giao-vien keeps desktop shell intact' },
    async () => {
      await ctx.visit('/app/giao-vien', { role: 'teacher', viewport: 'desktop' });
      await ctx.assertNoOverflow('T1-F14-03 desktop teacher');
      const d = await cdp.evalJs(() => ({
        sideW: document.getElementById('side')?.getBoundingClientRect().width || 0,
        mTabDisp: getComputedStyle(document.getElementById('mTab')).display,
      }));
      assert.ok(d.sideW >= 240);
      assert.strictEqual(d.mTabDisp, 'none');
    }
  );

  suite.test(
    { id: 'T1-F14-04', tier: 1, feature: 'F14', milestone: 'Core', name: 'Desktop 1440x900 Admin keeps 252px .ad-side, .ad-back visible, and .ad-m-* hidden' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'desktop', expectAdmin: true });
      await ctx.assertNoOverflow('T1-F14-04 desktop admin');
      const d = await cdp.evalJs(() => {
        const mobEls = ['.ad-m-tab', '.ad-m-back', '.ad-m-titles', '.ad-m-more', '.ad-m-drawer-head', '.ad-m-dash-head', '.ad-m-quick'];
        return {
          sideW: document.querySelector('.ad-side')?.getBoundingClientRect().width || 0,
          adBackDisp: getComputedStyle(document.querySelector('.ad-back')).display,
          mobHidden: mobEls.every((s) => {
            const el = document.querySelector(s);
            return !el || getComputedStyle(el).display === 'none';
          }),
        };
      });
      assert.strictEqual(Math.round(d.sideW), 252, `Expected 252px .ad-side on desktop (got ${d.sideW})`);
      assert.notStrictEqual(d.adBackDisp, 'none', '.ad-back must be visible on desktop');
      assert.ok(d.mobHidden, 'All .ad-m-* mobile elements must be hidden on desktop');
    }
  );

  suite.test(
    { id: 'T1-F14-05', tier: 1, feature: 'F14', milestone: 'Core', name: 'Workspace safety: .env, data/app.db, data/secret.key untouched & ephemeral port != 8090' },
    async () => {
      assert.notStrictEqual(srv.port, 8090, 'Ephemeral server must never bind port 8090');
      assertWorkspaceFilesUntouched(srv.workspaceSnap);
      const h = await apiRequest(baseUrl, 'GET', '/api/health');
      assert.strictEqual(h.status, 200);
      assert.strictEqual(h.json?.ok, true);
    }
  );

  suite.test(
    { id: 'T1-F14-06', tier: 1, feature: 'F14', milestone: 'Core', name: 'All 13 Admin routes render with zero 5xx or runtime exceptions on desktop 1440x900' },
    async () => {
      for (const r of ADMIN_ROUTES) {
        await ctx.visit(r.path, { role: 'admin', viewport: 'desktop', expectAdmin: true });
        await ctx.assertNoOverflow(`T1-F14-06 desktop ${r.tab}`);
      }
    }
  );

  // ================= F11/F12/F13 Admin Theme, Dark Mode, Modal, Tablet, Gift Codes & EN Parity =================
  suite.test(
    { id: 'T1-F11-06', tier: 1, feature: 'F11', milestone: 'M3', name: 'Admin .ad-top renders visible [data-theme-toggle] and switches Light <-> Dark cleanly' },
    async () => {
      try {
        await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'desktop', expectAdmin: true, theme: 'light' });
        assert.ok(await ctx.existsVisible('.ad-top [data-theme-toggle]'), 'M3: Expected visible [data-theme-toggle] inside .ad-top');
        await ctx.switchThemeAndAssert('dark', '.ad-top [data-theme-toggle]');
        await ctx.switchThemeAndAssert('light', '.ad-top [data-theme-toggle]');
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );

  suite.test(
    { id: 'T1-F12-07', tier: 1, feature: 'F12', milestone: 'M3', name: 'Admin Dark Mode renders dark canvas and >= 4.5:1 text contrast on desktop & mobile' },
    async () => {
      try {
        for (const vp of ['desktop', 'mobile']) {
          await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: vp, expectAdmin: true, theme: 'dark' });
          const lum = await ctx.getSurfaceLuminance('.ad');
          assert.ok(lum.luminance < 0.2, `M3: Expected dark .ad surface on ${vp} (luminance=${lum.luminance}, bg=${lum.bg})`);
          await ctx.assertContrast('.ad h1, .ad-kpi b, .ad-kpi span, .ad-card h2, .ad-card p', 4.5, `T1-F12-07 ${vp}`);
          await ctx.assertNoOverflow(`T1-F12-07 admin dark ${vp}`);
        }
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );

  suite.test(
    { id: 'T1-F12-08', tier: 1, feature: 'F12', milestone: 'M3', name: 'Admin #addU modal in Dark Mode maintains dark surface and >= 4.5:1 contrast across desktop, tablet, mobile' },
    async () => {
      try {
        for (const vp of ['desktop', 'tablet', 'mobile']) {
          await ctx.visit('/app/quan-tri/hoc-vien', { role: 'admin', viewport: vp, expectAdmin: true, theme: 'dark' });
          assert.ok(await ctx.existsVisible('#addU'), `Expected visible #addU on ${vp}`);
          await cdp.click('#addU');
          assert.ok(await ctx.waitForVisible('.modal', 3000), `Expected .modal to open on ${vp}`);
          const modalLum = await ctx.getSurfaceLuminance('.modal');
          assert.ok(modalLum.luminance < 0.2, `M3: Expected dark .modal background in Dark Mode on ${vp} (got ${modalLum.bg}, lum=${modalLum.luminance})`);
          await ctx.assertContrast('.modal h2, .modal .lead, .modal label.field, .modal input[name="u"], .modal select[name="r"]', 4.5, `T1-F12-08 modal ${vp}`, { includeNonText: true });
          if (await ctx.existsVisible('.modal .modal-x, .modal [data-close]')) {
            await cdp.click('.modal .modal-x, .modal [data-close]');
          }
        }
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );

  suite.test(
    { id: 'T1-F13-06', tier: 1, feature: 'F13', milestone: 'M3', name: 'Admin Tablet (900x700) keeps sidebar/content non-overlapping and overflow-free in Light & Dark modes' },
    async () => {
      const routes = ['tong-quan', 'hoc-vien', 'kinh-doanh', 'ma-qua-tang', 'cai-dat', 'he-thong', 'song-ngu'];
      try {
        for (const theme of ['light', 'dark']) {
          for (const tab of routes) {
            await ctx.visit(`/app/quan-tri/${tab}`, { role: 'admin', viewport: 'tablet', expectAdmin: true, theme });
            await ctx.assertNoOverflow(`T1-F13-06 ${tab} ${theme} 900x700`);
            await ctx.assertNoElementOverlap('.ad-side', '.ad-content', `T1-F13-06 ${tab} ${theme} sidebar vs content`);
            const mTabVis = await ctx.existsVisible('.ad-m-tab');
            assert.strictEqual(mTabVis, false, `T1-F13-06 ${tab}: .ad-m-tab must stay hidden on 900x700 tablet`);
          }
        }
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );

  suite.test(
    { id: 'T1-F13-07', tier: 1, feature: 'F13', milestone: 'M3', name: 'Admin /app/quan-tri/ma-qua-tang #gcForm submission keeps #gcNew visible with generated codes' },
    async () => {
      await ctx.visit('/app/quan-tri/ma-qua-tang', { role: 'admin', viewport: 'desktop', expectAdmin: true });
      assert.ok(await ctx.existsVisible('#gcForm input[name="count"]'), 'Expected #gcForm count input');
      assert.ok(await ctx.existsVisible('#gcForm button'), 'Expected #gcForm submit button');
      await cdp.fill('#gcForm input[name="count"]', '2');
      await cdp.fill('#gcForm input[name="days"]', '7');
      await cdp.fill('#gcForm input[name="note"]', 'E2E Gift Code');
      const reqs = await ctx.trackRequests(
        async () => {
          await cdp.click('#gcForm button');
          await new Promise((r) => setTimeout(r, 450));
        },
        { urlPattern: /\/api\/admin\/gift-codes/, method: 'POST' }
      );
      assert.strictEqual(reqs.total, 1, `Expected 1 POST /api/admin/gift-codes request, got ${reqs.total}`);
      const box = await cdp.evalJs(() => {
        const el = document.getElementById('gcNew');
        const list = document.getElementById('gcList');
        const copy = document.getElementById('gcCopy');
        return {
          exists: !!el,
          hidden: el ? el.hidden : true,
          listVal: list ? list.value.trim() : '',
          hasCopy: !!copy,
        };
      });
      assert.ok(box.exists && !box.hidden, 'M3: #gcNew must remain visible after #gcForm submission (must not be wiped by immediate re-render)');
      const lines = box.listVal ? box.listVal.split(/\r?\n/).filter(Boolean) : [];
      assert.strictEqual(lines.length, 2, `M3: Expected 2 generated codes in #gcList, got ${lines.length}`);
      assert.ok(box.hasCopy, 'M3: Expected #gcCopy button inside #gcNew');
    }
  );

  suite.test(
    { id: 'T1-F13-08', tier: 1, feature: 'F13', milestone: 'M3', name: 'Admin EN localization (lang="en") translates dashboard, business, gift codes & system pages without VI leaks' },
    async () => {
      try {
        const checks = [
          { path: '/app/quan-tri/tong-quan', expectRe: /Admin Panel|Overview/i, ban: ['Phân khu quản trị', 'Cần chú ý', 'Đang học 7 ngày', 'Doanh thu 30 ngày'] },
          { path: '/app/quan-tri/kinh-doanh', expectRe: /Revenue|Business/i, ban: ['Doanh thu và gói Pro', 'Doanh thu & Pro'] },
          { path: '/app/quan-tri/ma-qua-tang', expectRe: /gift code/i, ban: ['Mã quà tặng Pro', 'Tạo mã mới', 'Mã chưa dùng'] },
          { path: '/app/quan-tri/he-thong', expectRe: /Payment|System|AI/i, ban: ['Thanh toán, AI, hệ thống'] },
        ];
        for (const c of checks) {
          await ctx.visit(c.path, { role: 'admin', viewport: 'desktop', expectAdmin: true, lang: 'en' });
          const htmlLang = await cdp.evalJs(() => document.documentElement.lang);
          assert.strictEqual(htmlLang, 'en', `${c.path}: expected html[lang="en"]`);
          const txt = await cdp.evalJs(() => document.querySelector('.ad')?.textContent || '');
          assert.match(txt, c.expectRe, `M3: ${c.path} missing EN heading/label`);
          for (const vi of c.ban) {
            assert.strictEqual(txt.includes(vi), false, `M3: ${c.path} leaked untranslated VI text "${vi}"`);
          }
        }
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );

  // ================= F15: Landing Surface (/ , /en , /vi) =================
  suite.test(
    { id: 'T1-F15-01', tier: 1, feature: 'F15', milestone: 'M1', name: 'Landing Desktop (1440x900) & Mobile (390x844) [data-theme-toggle] switches Light <-> Dark cleanly' },
    async () => {
      const ceStart = ctx.consoleErrorCount();
      try {
        for (const vp of ['desktop', 'mobile']) {
          await ctx.visitLanding({ viewport: vp, pathName: '/', theme: 'light' });
          if (vp === 'mobile' && !(await ctx.existsVisible('[data-theme-toggle]'))) {
            assert.ok(await ctx.existsVisible('#mobileMenuBtn'), 'Expected #mobileMenuBtn if toggle is inside drawer');
            await cdp.click('#mobileMenuBtn');
          }
          assert.ok(await ctx.existsVisible('[data-theme-toggle]'), `M1: Expected visible [data-theme-toggle] on Landing ${vp}`);
          await ctx.switchThemeAndAssert('dark');
          const darkLum = await ctx.getSurfaceLuminance('#landingPage');
          assert.ok(darkLum.luminance < 0.2, `M1: Expected dark #landingPage bg on ${vp} (lum=${darkLum.luminance}, bg=${darkLum.bg})`);
          if (vp === 'mobile' && !(await ctx.existsVisible('[data-theme-toggle]')) && (await ctx.existsVisible('#mobileMenuBtn'))) {
            await cdp.click('#mobileMenuBtn');
          }
          await ctx.switchThemeAndAssert('light');
          const paperToken = await cdp.evalJs(() => getComputedStyle(document.querySelector('#landingPage.aw')).getPropertyValue('--paper').trim().toUpperCase());
          assert.strictEqual(paperToken, '#FAF6EC', 'Light mode must restore --paper: #FAF6EC');
        }
        ctx.assertNoConsoleErrors(ceStart, 'T1-F15-01');
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );

  suite.test(
    { id: 'T1-F15-02', tier: 1, feature: 'F15', milestone: 'M1', name: 'Landing Header Breakpoint (1440x900, 1000x700, 900x700) renders mutually exclusive nav vs burger' },
    async () => {
      for (const vp of ['desktop', 'tabletWide', 'tablet']) {
        await ctx.visitLanding({ viewport: vp, pathName: '/' });
        await ctx.assertNoOverflow(`T1-F15-02 ${vp}`);
        const navVis = await ctx.existsVisible('.aw-nav');
        const burgerVis = await ctx.existsVisible('#mobileMenuBtn');
        assert.ok(navVis || burgerVis, `${vp}: either .aw-nav or #mobileMenuBtn must be visible`);
        assert.strictEqual(navVis && burgerVis, false, `M1: ${vp} must NEVER show both .aw-nav and #mobileMenuBtn simultaneously`);
        if (vp === 'desktop') {
          assert.strictEqual(navVis, true, '1440x900 must show .aw-nav');
          assert.strictEqual(burgerVis, false, '1440x900 must hide #mobileMenuBtn');
        }
        if (burgerVis) {
          await cdp.click('#mobileMenuBtn');
          assert.ok(await ctx.existsVisible('#mobileDrawer'), `${vp}: clicking #mobileMenuBtn must open #mobileDrawer`);
          await cdp.click('#mobileMenuBtn');
        }
      }
    }
  );

  suite.test(
    { id: 'T1-F15-03', tier: 1, feature: 'F15', milestone: 'M1', name: 'Landing Hero CTAs, Section 2 Demo Carousel & FAQ Accordions respond cleanly' },
    async () => {
      const ceStart = ctx.consoleErrorCount();
      await ctx.visitLanding({ viewport: 'desktop', pathName: '/' });
      assert.ok(await ctx.existsVisible('#heroCta'), 'Expected visible #heroCta');
      assert.ok(await ctx.existsVisible('.hero-cta-sec'), 'Expected visible .hero-cta-sec');
      assert.ok(await ctx.existsVisible('#demoDots [data-dot="2"]'), 'Expected visible #demoDots [data-dot="2"]');
      await cdp.click('#demoDots [data-dot="2"]');
      const step1 = await cdp.evalJs(() => document.getElementById('demoStepCount')?.textContent.trim() || '');
      assert.strictEqual(step1, '3 / 6', `Expected step 3 / 6 after clicking dot 2 (got "${step1}")`);

      assert.ok(await ctx.existsVisible('#demoDots [data-dot="3"]'), 'Expected visible #demoDots [data-dot="3"]');
      await cdp.click('#demoDots [data-dot="3"]');
      const step2 = await cdp.evalJs(() => document.getElementById('demoStepCount')?.textContent.trim() || '');
      assert.strictEqual(step2, '4 / 6', `Expected step 4 / 6 after clicking dot 3 (got "${step2}")`);

      assert.ok(await ctx.existsVisible('#demoOpts [data-opt="0"]'), 'Expected visible demo quiz option');
      await cdp.click('#demoOpts [data-opt="0"]');
      const msgClass = await cdp.evalJs(() => document.getElementById('demoMsg')?.className || '');
      assert.match(msgClass, /ok|bad/, 'Clicking demo quiz option must populate #demoMsg');

      if (await ctx.existsVisible('#demoSpeakBtn')) await cdp.click('#demoSpeakBtn');
      if (await ctx.existsVisible('#demoSlowBtn')) await cdp.click('#demoSlowBtn');

      assert.ok(await ctx.existsVisible('.aw-faq details.faq-item > summary.faq-summary'), 'Expected visible FAQ summary');
      await cdp.click('.aw-faq details.faq-item > summary.faq-summary');
      const faqOpen = await cdp.evalJs(() => document.querySelector('.aw-faq details.faq-item')?.open === true);
      assert.strictEqual(faqOpen, true, 'Clicking FAQ summary must open details.faq-item');
      ctx.assertNoConsoleErrors(ceStart, 'T1-F15-03');
    }
  );

  suite.test(
    { id: 'T1-F15-04', tier: 1, feature: 'F15', milestone: 'M1', name: 'Landing Mobile (390x844) #mobileDrawer links scroll to visible mobile sections & navigate to /tai-ung-dung' },
    async () => {
      await ctx.visitLanding({ viewport: 'mobile', pathName: '/' });
      assert.ok(await ctx.existsVisible('#mobileMenuBtn'), 'Expected visible #mobileMenuBtn');
      await cdp.click('#mobileMenuBtn');
      assert.ok(await ctx.existsVisible('#mobileDrawer'), 'Expected #mobileDrawer open');
      const anchorSel = '#mobileDrawer a[href="#lpMobileDemo"], #mobileDrawer a[href="#demoBox"]';
      assert.ok(await ctx.existsVisible(anchorSel), 'Expected demo anchor inside #mobileDrawer');
      await cdp.evalJs(() => { window.scrollTo(0, 0); });
      await cdp.click(anchorSel);
      await new Promise((r) => setTimeout(r, 450));
      const afterScroll = await cdp.evalJs(() => ({
        drawerHidden: document.getElementById('mobileDrawer')?.hidden === true,
        scrollY: window.scrollY,
      }));
      assert.strictEqual(afterScroll.drawerHidden, true, 'Tapping #mobileDrawer link must close drawer');
      assert.ok(afterScroll.scrollY > 50, `M1: Tapping #mobileDrawer demo link on 390x844 must scroll to visible mobile demo (got scrollY=${afterScroll.scrollY})`);
      await ctx.assertNoOverflow('T1-F15-04 mobile anchor');

      await cdp.click('#mobileMenuBtn');
      assert.ok(await ctx.existsVisible('#mobileDrawer a[href="/tai-ung-dung"]'), 'Expected /tai-ung-dung link in #mobileDrawer');
      await cdp.click('#mobileDrawer a[href="/tai-ung-dung"]');
      await cdp.waitForLandingSettled({ selector: '.dl-public-shell' });
      const dlPath = await cdp.evalJs(() => location.pathname);
      assert.strictEqual(dlPath, '/tai-ung-dung');
    }
  );

  suite.test(
    { id: 'T1-F15-05', tier: 1, feature: 'F15', milestone: 'M1', name: 'Landing VI/EN switch translates #lpMobileHome & does not force-hide #cau-chuyen/#xep-hang via CSS' },
    async () => {
      try {
        await ctx.visitLanding({ viewport: 'mobile', pathName: '/vi', lang: 'vi' });
        await ctx.switchLangViaUi('en');
        const mHero = await cdp.evalJs(() => document.querySelector('#lpMobileHome .lp-m-hero-copy h1')?.textContent.trim() || '');
        assert.strictEqual(mHero, 'Speak foreign languages with confidence.', `M1: Expected EN mobile hero, got "${mHero}"`);

        await ctx.setViewport('desktop');
        const secCss = await cdp.evalJs(() => {
          const check = (id) => {
            const el = document.getElementById(id);
            if (!el) return { exists: false, disp: '' };
            const wasHidden = el.hidden;
            el.hidden = false;
            const disp = getComputedStyle(el).display;
            el.hidden = wasHidden;
            return { exists: true, disp };
          };
          return { cauChuyen: check('cau-chuyen'), xepHang: check('xep-hang') };
        });
        assert.ok(secCss.cauChuyen.exists && secCss.cauChuyen.disp !== 'none', `M1: html[lang="en"] CSS must not force #cau-chuyen display:none (got "${secCss.cauChuyen.disp}")`);
        assert.ok(secCss.xepHang.exists && secCss.xepHang.disp !== 'none', `M1: html[lang="en"] CSS must not force #xep-hang display:none (got "${secCss.xepHang.disp}")`);
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );

  // ================= F16: Public & In-App Download (/tai-ung-dung, /app/tai-ung-dung) =================
  suite.test(
    { id: 'T1-F16-01', tier: 1, feature: 'F16', milestone: 'M1', name: 'Public /tai-ung-dung renders visible [data-theme-toggle] and switches Light <-> Dark on desktop & mobile' },
    async () => {
      const ceStart = ctx.consoleErrorCount();
      try {
        for (const vp of ['desktop', 'mobile']) {
          await ctx.visitPublic('/tai-ung-dung', { viewport: vp, theme: 'light' });
          await ctx.assertNoOverflow(`T1-F16-01 ${vp} light`);
          assert.ok(await ctx.existsVisible('.dl-pub-top [data-theme-toggle], .dl-pub-right [data-theme-toggle]'), `M1: Expected visible [data-theme-toggle] in public download header on ${vp}`);
          await ctx.switchThemeAndAssert('dark', '.dl-pub-top [data-theme-toggle], .dl-pub-right [data-theme-toggle]');
          const lum = await ctx.getSurfaceLuminance('.dl-public-shell');
          assert.ok(lum.luminance < 0.2, `M1: Expected dark .dl-public-shell bg on ${vp} (lum=${lum.luminance}, bg=${lum.bg})`);
          await ctx.assertNoOverflow(`T1-F16-01 ${vp} dark`);
          await ctx.switchThemeAndAssert('light', '.dl-pub-top [data-theme-toggle], .dl-pub-right [data-theme-toggle]');
        }
        ctx.assertNoConsoleErrors(ceStart, 'T1-F16-01');
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );

  suite.test(
    { id: 'T1-F16-02', tier: 1, feature: 'F16', milestone: 'M1', name: 'Download OS filter tabs (All/PC/Mobile) & install guide toggles work on public & in-app routes' },
    async () => {
      await ctx.visitPublic('/tai-ung-dung', { viewport: 'desktop' });
      assert.strictEqual(await cdp.evalJs(() => document.querySelectorAll('.dl-card').length), 4, 'Expected 4 platform cards under All');
      assert.ok(await ctx.existsVisible('[data-dl-filter="pc"]'), 'Expected PC filter tab');
      await cdp.click('[data-dl-filter="pc"]');
      assert.deepStrictEqual(
        await cdp.evalJs(() => [...document.querySelectorAll('.dl-card')].map((c) => c.id)),
        ['dlCard-windows', 'dlCard-macos']
      );
      assert.ok(await ctx.existsVisible('[data-dl-filter="mobile"]'), 'Expected Mobile filter tab');
      await cdp.click('[data-dl-filter="mobile"]');
      assert.deepStrictEqual(
        await cdp.evalJs(() => [...document.querySelectorAll('.dl-card')].map((c) => c.id)),
        ['dlCard-android', 'dlCard-ios']
      );

      await ctx.visit('/app/tai-ung-dung', { role: 'student', viewport: 'mobile' });
      assert.ok(await ctx.existsVisible('[data-dl-guide="macos"]'), 'Expected macOS install guide toggle');
      const beforeExp = await cdp.evalJs(() => document.querySelector('[data-dl-guide="macos"]')?.getAttribute('aria-expanded'));
      await cdp.click('[data-dl-guide="macos"]');
      const afterExp = await cdp.evalJs(() => ({
        exp: document.querySelector('[data-dl-guide="macos"]')?.getAttribute('aria-expanded'),
        stepsHidden: document.querySelector('#dlCard-macos .dl-steps')?.hidden,
      }));
      assert.notStrictEqual(afterExp.exp, beforeExp, 'Clicking [data-dl-guide="macos"] must toggle aria-expanded');
      assert.strictEqual(afterExp.stepsHidden, afterExp.exp !== 'true');
    }
  );

  suite.test(
    { id: 'T1-F16-03', tier: 1, feature: 'F16', milestone: 'M1', name: 'Guest "Dùng ngay trên Web" CTA opens single .lp-auth-sheet modal without duplicate modal or popstate race' },
    async () => {
      await ctx.visitPublic('/tai-ung-dung', { viewport: 'desktop' });
      assert.ok(await ctx.existsVisible('a.dl-secondary-cta[href="/app/dang-nhap"]'), 'Expected visible "Dùng ngay trên Web" CTA');
      await cdp.evalJs(() => {
        window.__e2ePopCount = 0;
        window.addEventListener('popstate', () => { window.__e2ePopCount++; });
      });
      await cdp.click('a.dl-secondary-cta[href="/app/dang-nhap"]');
      await cdp.waitForCondition(() => document.querySelectorAll('#modalHost .modal.lp-auth-sheet').length >= 1, 5000, 60);
      await new Promise((r) => setTimeout(r, 200));
      const modalState = await cdp.evalJs(() => ({
        path: location.pathname,
        wraps: document.querySelectorAll('#modalHost .modal-wrap').length,
        sheets: document.querySelectorAll('#modalHost .modal.lp-auth-sheet').length,
        hasUserInput: !!document.querySelector('#modalHost [data-auth-view="login"] input[name="u"]'),
        popCount: window.__e2ePopCount || 0,
      }));
      assert.strictEqual(modalState.path, '/app/dang-nhap');
      assert.strictEqual(modalState.wraps, 1, `M1: Expected exactly 1 .modal-wrap (got ${modalState.wraps})`);
      assert.strictEqual(modalState.sheets, 1, `M1: Expected exactly 1 .lp-auth-sheet (got ${modalState.sheets})`);
      assert.strictEqual(modalState.hasUserInput, true);
      assert.ok(modalState.popCount <= 1, `M1: Unexpected duplicate popstate count (${modalState.popCount})`);
    }
  );

  suite.test(
    { id: 'T1-F16-04', tier: 1, feature: 'F16', milestone: 'M1', name: 'Logged-in student visiting /tai-ung-dung renders in-app Download Center without 404' },
    async () => {
      for (const vp of ['desktop', 'mobile']) {
        await ctx.visit('/tai-ung-dung', { role: 'student', viewport: vp });
        await ctx.assertNoOverflow(`T1-F16-04 ${vp}`);
        const state = await cdp.evalJs(() => ({
          inApp: document.body.classList.contains('in-app'),
          hasDlWrap: !!document.querySelector('#main .dl-wrap'),
          hasPlatforms: !!document.getElementById('dlPlatforms'),
          isNotFound: (document.getElementById('main')?.textContent || '').includes('Không tìm thấy trang'),
        }));
        assert.strictEqual(state.inApp, true, `M1: Expected body.in-app on ${vp}`);
        assert.strictEqual(state.isNotFound, false, `M1: Logged-in /tai-ung-dung must not hit 404 on ${vp}`);
        assert.ok(state.hasDlWrap && state.hasPlatforms, `M1: Expected #main .dl-wrap & #dlPlatforms on ${vp}`);
      }
    }
  );

  suite.test(
    { id: 'T1-F16-05', tier: 1, feature: 'F16', milestone: 'M1', name: 'In-app /app/tai-ung-dung loads QR image, #dlCopyLinkBtn works & .topbar theme toggle switches Dark <-> Light' },
    async () => {
      const ceStart = ctx.consoleErrorCount();
      try {
        await ctx.visit('/app/tai-ung-dung', { role: 'student', viewport: 'desktop', theme: 'light' });
        await cdp.waitForCondition(() => {
          const img = document.querySelector('#dlQrFrame img');
          return !!(img && img.complete && img.naturalWidth > 0);
        }, 6000, 80);
        assert.ok(await ctx.existsVisible('#dlCopyLinkBtn'), 'Expected visible #dlCopyLinkBtn');
        await cdp.click('#dlCopyLinkBtn');
        await ctx.switchThemeAndAssert('dark', '.topbar [data-theme-toggle]');
        const lum = await ctx.getSurfaceLuminance('body.in-app');
        assert.ok(lum.luminance < 0.2, `Expected dark in-app surface (lum=${lum.luminance})`);
        await ctx.switchThemeAndAssert('light', '.topbar [data-theme-toggle]');
        ctx.assertNoConsoleErrors(ceStart, 'T1-F16-05');
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );

  // ================= F17: In-App & PC Sidebar (/app/*) =================
  suite.test(
    { id: 'T1-F17-01', tier: 1, feature: 'F17', milestone: 'M1', name: 'PC Sidebar (#sideNav) accordion toggles cleanly, highlights toeic/so-tay/tro-choi, and stays visible on /app/ngoai-ngu' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'desktop' });
      assert.ok(await ctx.existsVisible('#sideNav details.nav-cat summary.nav-cat-head'), 'Expected #sideNav details.nav-cat summary');
      const acc = await cdp.evalJs(() => {
        const cats = [...document.querySelectorAll('#sideNav details.nav-cat')];
        if (cats.length < 2) return { ok: false, count: cats.length };
        cats[0].open = false;
        cats[0].querySelector('summary')?.click();
        return { ok: true, count: cats.length, firstOpen: cats[0].open, secondOpen: cats[1].open };
      });
      assert.ok(acc.ok && acc.firstOpen && !acc.secondOpen, `Expected desktop sidebar accordion behavior (${JSON.stringify(acc)})`);

      for (const route of ['/app/toeic', '/app/so-tay', '/app/tro-choi/en']) {
        await ctx.visit(route, { role: 'student', viewport: 'desktop' });
        const hasActive = await cdp.evalJs(() => document.querySelectorAll('#sideNav a.on').length > 0);
        assert.ok(hasActive, `M1: Expected active #sideNav a.on on ${route}`);
      }

      await ctx.visit('/app/ngoai-ngu', { role: 'student', viewport: 'desktop' });
      const pickerShell = await cdp.evalJs(() => ({
        sideW: document.getElementById('side')?.getBoundingClientRect().width || 0,
        sideDisp: getComputedStyle(document.getElementById('side')).display,
        topDisp: getComputedStyle(document.querySelector('.topbar')).display,
        searchVis: getComputedStyle(document.getElementById('searchBtn')).display !== 'none',
      }));
      assert.ok(pickerShell.sideW >= 240 && pickerShell.sideDisp !== 'none', `M1: #side must remain visible on desktop /app/ngoai-ngu (got w=${pickerShell.sideW}, disp=${pickerShell.sideDisp})`);
      assert.notStrictEqual(pickerShell.topDisp, 'none', 'M1: .topbar must remain visible on /app/ngoai-ngu');
      assert.strictEqual(pickerShell.searchVis, true, 'M1: .topbar #searchBtn must remain visible on /app/ngoai-ngu');
    }
  );

  suite.test(
    { id: 'T1-F17-02', tier: 1, feature: 'F17', milestone: 'M1', name: 'Topbar #udBell dropdown opens, closes on Escape, and sidebar #sideNav navigates via SPA' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'desktop' });
      assert.ok(await ctx.existsVisible('#udBell'), 'Expected visible #udBell');
      await cdp.click('#udBell');
      await cdp.waitForCondition(() => document.getElementById('udBellDrop')?.hidden === false, 3000, 60);
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('udBell')?.getAttribute('aria-expanded')), 'true');

      await cdp.evalJs(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
      await new Promise((r) => setTimeout(r, 80));
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('udBellDrop')?.hidden), true, 'Escape must close #udBellDrop');

      assert.ok(await ctx.existsVisible('#sideNav a[href="/app/cai-dat"]'), 'Expected /app/cai-dat inside #sideNav');
      await cdp.evalJs(() => { window.__e2eTopbarSpa = 1; });
      await cdp.click('#sideNav a[href="/app/cai-dat"]');
      await cdp.waitForAppSettled({ selector: '#stThemeBtn' });
      assert.strictEqual(await cdp.evalJs(() => location.pathname), '/app/cai-dat');
      assert.strictEqual(await cdp.evalJs(() => window.__e2eTopbarSpa), 1, 'Sidebar navigation must use SPA');
    }
  );

  suite.test(
    { id: 'T1-F17-03', tier: 1, feature: 'F17', milestone: 'M2', name: '#ivQuickStart on /app/phong-van (mobile) navigates via SPA without reload and respects field/lang/role' },
    async () => {
      const ceStart = ctx.consoleErrorCount();
      await ctx.visit('/app/phong-van', { role: 'student', viewport: 'mobile' });
      assert.ok(await ctx.existsVisible('#ivFieldSelect'), 'Expected #ivFieldSelect');
      assert.ok(await ctx.existsVisible('#ivRoleInput'), 'Expected #ivRoleInput');
      assert.ok(await ctx.existsVisible('#ivLangSelect'), 'Expected #ivLangSelect');
      assert.ok(await ctx.existsVisible('#ivQuickStart'), 'Expected #ivQuickStart');
      await cdp.evalJs(() => {
        window.__e2eIvSpa = 1;
        const f = document.getElementById('ivFieldSelect');
        const l = document.getElementById('ivLangSelect');
        if (f) { f.value = 'iv-it'; f.dispatchEvent(new Event('change', { bubbles: true })); }
        if (l) { l.value = 'en'; l.dispatchEvent(new Event('change', { bubbles: true })); }
      });
      await cdp.fill('#ivRoleInput', 'Frontend Engineer');
      await cdp.click('#ivQuickStart');
      await cdp.waitForCondition(() => location.pathname.startsWith('/app/phong-van/en'), 5000, 60);
      await cdp.waitForAppSettled({ selector: '#main' });
      const navRes = await cdp.evalJs(() => ({
        spa: window.__e2eIvSpa || 0,
        path: location.pathname,
        search: location.search,
        text: document.getElementById('main')?.textContent || '',
      }));
      assert.strictEqual(navRes.spa, 1, 'M2: #ivQuickStart must use SPA navigation (not location.href reload)');
      assert.ok(
        navRes.search.includes('Frontend') || navRes.text.includes('Frontend Engineer') || navRes.path.includes('iv-it'),
        `M2: #ivQuickStart must pass/preserve field & role context (path=${navRes.path}, search=${navRes.search})`
      );
      ctx.assertNoConsoleErrors(ceStart, 'T1-F17-03');
    }
  );

  suite.test(
    { id: 'T1-F17-04', tier: 1, feature: 'F17', milestone: 'M2', name: 'pageFamily (/app/gia-dinh) never multiplies click listeners or API calls across re-renders' },
    async () => {
      const dbPath = path.join(srv.tmpDataDir, 'app.db');
      const nowIso = new Date().toISOString();
      const expIso = new Date(Date.now() + 30 * 86400000).toISOString();
      let groupId = null;
      const db = new DatabaseSync(dbPath);
      try {
        const info = db.prepare(
          `INSERT INTO family_groups (owner_id, seats, starts_at, expires_at, status, created_at)
           VALUES (?, 4, ?, ?, 'active', ?)`
        ).run(seed.parent.user.id, nowIso, expIso, nowIso);
        groupId = Number(info.lastInsertRowid);
        db.prepare(
          `INSERT INTO family_members (group_id, user_id, status, share_progress, invited_at, joined_at)
           VALUES (?, ?, 'active', 1, ?, ?)`
        ).run(groupId, seed.parent.user.id, nowIso, nowIso);
      } finally {
        db.close();
      }

      try {
        await ctx.visit('/app/gia-dinh', { role: 'parent', viewport: 'desktop', selector: '#inv' });
        assert.ok(await ctx.existsVisible('#inv input[name="u"]'), 'Expected #inv username input');
        await cdp.fill('#inv input[name="u"]', seed.peer3.username);
        await cdp.click('#inv button');
        await cdp.waitForCondition((u) => (document.getElementById('main')?.textContent || '').includes(u), 5000, 80, seed.peer3.username);

        await cdp.fill('#inv input[name="u"]', seed.peer2.username);
        await cdp.click('#inv button');
        await cdp.waitForCondition((u) => (document.getElementById('main')?.textContent || '').includes(u), 5000, 80, seed.peer2.username);

        assert.ok(await ctx.existsVisible('[data-prog]'), 'Expected visible [data-prog] button for owner');
        const reqs = await ctx.trackRequests(
          async () => {
            await cdp.click('[data-prog]');
            assert.ok(await ctx.waitForVisible('.modal', 3000), 'Expected progress modal');
            await new Promise((r) => setTimeout(r, 200));
          },
          { urlPattern: /\/api\/family\/members\/\d+\/progress/, method: 'GET' }
        );
        assert.strictEqual(reqs.total, 1, `M2: Expected exactly 1 progress API call after 2 re-renders (got ${reqs.total} from listener multiplication)`);
        if (await ctx.existsVisible('.modal .modal-x, .modal [data-close]')) {
          await cdp.click('.modal .modal-x, .modal [data-close]');
        }
      } finally {
        const cleanDb = new DatabaseSync(dbPath);
        try {
          if (groupId) {
            cleanDb.prepare('DELETE FROM family_members WHERE group_id = ?').run(groupId);
            cleanDb.prepare('DELETE FROM family_groups WHERE id = ?').run(groupId);
          }
        } finally {
          cleanDb.close();
        }
      }
    }
  );

  suite.test(
    { id: 'T1-F17-05', tier: 1, feature: 'F17', milestone: 'M2', name: '/app/cai-dat uses line icons (zero raw emojis) and Dark Mode persists across /app/en & /app/ca-nhan' },
    async () => {
      try {
        await ctx.visit('/app/cai-dat', { role: 'student', viewport: 'desktop', theme: 'light' });
        const icons = await cdp.evalJs(() => {
          const icos = [...document.querySelectorAll('.st-card .pf-m-ico')];
          const txt = document.getElementById('main')?.textContent || '';
          const hasRawEmoji = /[\u{1F510}\u{1F4B3}\u{1F514}\u2753]/u.test(txt);
          const allSvg = icos.length > 0 && icos.every((el) => !!el.querySelector('svg.line-ic'));
          return { count: icos.length, allSvg, hasRawEmoji };
        });
        assert.strictEqual(icons.hasRawEmoji, false, 'M2: /app/cai-dat must replace raw emojis (🔐💳🔔❓) with line icons');
        assert.ok(icons.allSvg, `M2: Expected svg.line-ic inside .st-card .pf-m-ico (${JSON.stringify(icons)})`);

        assert.ok(await ctx.existsVisible('#stThemeBtn'), 'Expected visible #stThemeBtn');
        await cdp.click('#stThemeBtn');
        await cdp.waitForCondition(() => document.documentElement.getAttribute('data-theme') === 'dark', 3000, 60);

        for (const nextRoute of ['/app/en', '/app/ca-nhan']) {
          await ctx.visit(nextRoute, { role: 'student', viewport: 'desktop', theme: 'dark' });
          const st = await ctx.getThemeState();
          assert.strictEqual(st.attr, 'dark', `${nextRoute} must preserve html[data-theme="dark"]`);
          const lum = await ctx.getSurfaceLuminance('body.in-app');
          assert.ok(lum.luminance < 0.2, `M2: Expected dark bg on ${nextRoute} (lum=${lum.luminance})`);
        }
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );
}
