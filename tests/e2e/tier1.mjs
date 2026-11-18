/**
 * @file tests/e2e/tier1.mjs
 * Tier 1: Isolated Feature Coverage (71 tests, >= 5 per feature F1-F14).
 */

import assert from 'node:assert/strict';
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
      assert.deepStrictEqual(labels, ['Roadmap', 'Speaking', 'Learn', 'Review', 'TOEIC']);
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

  // ================= F2: Learner Mobile Drawer =================
  suite.test(
    { id: 'T1-F2-01', tier: 1, feature: 'F2', milestone: 'M1', name: 'Tapping .hm-more-btn opens learner drawer on mobile' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      assert.ok(await ctx.existsVisible('.hm-more-btn[data-open-nav]'), 'Expected visible .hm-more-btn on student home');
      await cdp.click('.hm-more-btn[data-open-nav]');
      await cdp.waitForCondition(() => (document.getElementById('side')?.getBoundingClientRect().left ?? -999) >= -2, 2000, 40);
      const opened = await cdp.evalJs(() => {
        const side = document.getElementById('side');
        const r = side?.getBoundingClientRect();
        return {
          hasClass: document.body.classList.contains('nav-open'),
          left: r?.left ?? -999,
          width: r?.width ?? 0,
        };
      });
      assert.ok(opened.hasClass, 'body must have class nav-open');
      assert.ok(opened.left >= -2 && opened.width >= 200, `Drawer #side should be visible on screen (left=${opened.left}, width=${opened.width})`);
    }
  );

  suite.test(
    { id: 'T1-F2-02', tier: 1, feature: 'F2', milestone: 'M1', name: 'Learner drawer shows Chibi bunny avatar, display name, and learner role' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-more-btn[data-open-nav]');
      const head = await cdp.evalJs(() => {
        const av = document.querySelector('.side-m-avatar');
        return {
          src: av?.getAttribute('src') || '',
          complete: !!av?.complete && (av?.naturalWidth || 0) > 0,
          name: document.querySelector('.side-m-who b')?.textContent.trim() || '',
          sub: document.querySelector('.side-m-who small')?.textContent.trim() || '',
        };
      });
      assert.ok(head.src.includes('chibi-bunny.webp') && head.complete, `Expected loaded chibi-bunny avatar, got ${head.src}`);
      assert.ok(head.name.includes('Minh Anh'), `Expected student name Minh Anh, got "${head.name}"`);
      assert.ok(head.sub.includes('Học viên'), `Expected role subtitle containing Học viên, got "${head.sub}"`);
    }
  );

  suite.test(
    { id: 'T1-F2-03', tier: 1, feature: 'F2', milestone: 'M1', name: 'Learner drawer includes Cài đặt link and mobile Đăng xuất action' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-more-btn[data-open-nav]');
      const items = await cdp.evalJs(() => ({
        settingsHref: document.querySelector('#sideNav a[href="/app/cai-dat"]')?.textContent.trim() || '',
        logoutVis: !!document.querySelector('#sideNav [data-logout]'),
        logoutText: document.querySelector('#sideNav [data-logout]')?.textContent.trim() || '',
      }));
      assert.ok(items.settingsHref.includes('Cài đặt'), `Expected Cài đặt nav link, got "${items.settingsHref}"`);
      assert.ok(items.logoutVis && items.logoutText.includes('Đăng xuất'), `Expected mobile Đăng xuất button, got "${items.logoutText}"`);
    }
  );

  suite.test(
    { id: 'T1-F2-04', tier: 1, feature: 'F2', milestone: 'M1', name: 'Learner drawer hides desktop .side-foot card on mobile' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-more-btn[data-open-nav]');
      const footDisplay = await cdp.evalJs(() => {
        const f = document.querySelector('#side .side-foot');
        return f ? getComputedStyle(f).display : 'missing';
      });
      assert.strictEqual(footDisplay, 'none', `.side-foot must be hidden on mobile (got ${footDisplay})`);
    }
  );

  suite.test(
    { id: 'T1-F2-05', tier: 1, feature: 'F2', milestone: 'M1', name: 'Tapping #sideCloseBtn closes learner drawer cleanly' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-more-btn[data-open-nav]');
      assert.ok(await cdp.evalJs(() => document.body.classList.contains('nav-open')));
      await cdp.click('#sideCloseBtn');
      const openAfter = await cdp.evalJs(() => document.body.classList.contains('nav-open'));
      assert.strictEqual(openAfter, false, 'nav-open class must be removed after clicking #sideCloseBtn');
    }
  );

  // ================= F3: Teacher Mobile Drawer & Routes =================
  suite.test(
    { id: 'T1-F3-01', tier: 1, feature: 'F3', milestone: 'M1', name: 'Teacher drawer displays Pippa owl avatar and "Tài khoản giáo viên"' },
    async () => {
      await ctx.visit('/app/giao-vien', { role: 'teacher', viewport: 'mobile' });
      await cdp.click('#mTopMore[data-open-nav]');
      const head = await cdp.evalJs(() => ({
        src: document.querySelector('.side-m-avatar')?.getAttribute('src') || '',
        name: document.querySelector('.side-m-who b')?.textContent.trim() || '',
        sub: document.querySelector('.side-m-who small')?.textContent.trim() || '',
      }));
      assert.ok(head.src.includes('chibi-owl.webp'), `Expected owl avatar, got ${head.src}`);
      assert.ok(head.name.toLowerCase().includes('giáo viên linh'), `Expected Giáo viên Linh, got "${head.name}"`);
      assert.strictEqual(head.sub, 'Tài khoản giáo viên', `Expected "Tài khoản giáo viên", got "${head.sub}"`);
    }
  );

  suite.test(
    { id: 'T1-F3-02', tier: 1, feature: 'F3', milestone: 'M1', name: 'Teacher drawer has 6 GIẢNG DẠY items + 3 TÀI KHOẢN items without learner clutter' },
    async () => {
      await ctx.visit('/app/giao-vien', { role: 'teacher', viewport: 'mobile' });
      await cdp.click('#mTopMore[data-open-nav]');
      const data = await cdp.evalJs(() => {
        const cats = [...document.querySelectorAll('#sideNav details.nav-cat')].map((d) => ({
          id: d.dataset.cat,
          label: d.querySelector('.nav-cat-lbl')?.textContent.trim() || '',
          links: [...d.querySelectorAll('a, button[data-logout]')].map((el) => ({
            text: el.querySelector('.nav-lbl span')?.textContent.trim() || el.textContent.trim(),
            href: el.getAttribute('href') || 'logout',
          })),
        }));
        return cats;
      });
      assert.strictEqual(data.length, 2, `Expected 2 drawer sections for teacher, got ${data.length}`);
      assert.strictEqual(data[0].links.length, 6, `GIẢNG DẠY must have 6 items (got ${data[0].links.length})`);
      assert.strictEqual(data[1].links.length, 3, `TÀI KHOẢN must have 3 items (got ${data[1].links.length})`);
      const allHrefs = data.flatMap((c) => c.links.map((l) => l.href));
      assert.ok(allHrefs.includes('/app/giao-vien/bai-tap'), 'Missing /app/giao-vien/bai-tap in teacher drawer');
      assert.ok(allHrefs.includes('/app/giao-vien/tien-do'), 'Missing /app/giao-vien/tien-do in teacher drawer');
      assert.ok(!allHrefs.some((h) => h.includes('phong-van') || h.includes('toeic')), 'Teacher drawer must not leak student routes');
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
    { id: 'T1-F4-02', tier: 1, feature: 'F4', milestone: 'M1', name: 'Tapping #mTabLearnBtn opens radial fan-out ("xòe quạt") of 5 floating study pills (no Tổng quan)' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('#mTabLearnBtn');
      await new Promise((r) => setTimeout(r, 220));
      const fan = await cdp.evalJs(() => {
        const btn = document.getElementById('mTabLearnBtn');
        const ctrl = btn?.getAttribute('aria-controls');
        const menu = (ctrl && document.getElementById(ctrl)) || document.querySelector('#mLearnSheet, .m-fan-learn');
        if (!menu || menu.hidden) return { open: false };
        const items = [...menu.querySelectorAll('a')].map((a) => {
          const r = a.getBoundingClientRect();
          return {
            label: a.textContent.trim().replace(/\s+/g, ' '),
            href: a.getAttribute('href') || '',
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
          };
        });
        const hasModalBox = !!menu.querySelector('.m-sheet-card, .m-learn-card');
        const distinctX = new Set(items.map((x) => Math.round(x.left / 15))).size;
        const distinctY = new Set(items.map((x) => Math.round(x.top / 15))).size;
        const scrim = menu.querySelector('.m-fan-scrim, .m-sheet-scrim, [data-close-learn]') || menu;
        const scrimSt = getComputedStyle(scrim);
        const scrimBlur = scrimSt.backdropFilter || scrimSt.webkitBackdropFilter || '';
        const orbRadii = [...menu.querySelectorAll('a > span:first-child, a .m-fan-orb, a .m-learn-ic')].map((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0);
        return {
          open: true,
          expanded: btn?.getAttribute('aria-expanded') === 'true',
          hasModalBox,
          distinctX,
          distinctY,
          scrimBlur,
          orbRadii,
          items,
          innerW: window.innerWidth,
        };
      });
      assert.ok(fan.open && fan.expanded, 'Học ngay radial fan-out menu must open');
      assert.strictEqual(fan.hasModalBox, false, 'Học ngay must render floating radial pills, NOT a rectangular .m-sheet-card modal box');
      assert.strictEqual(fan.items.length, 5, `Expected 5 floating pills (got ${fan.items.length})`);
      assert.ok(!fan.items.some((x) => x.label === 'Tổng quan'), 'Tổng quan must NOT be duplicated inside Học ngay fan-out');
      assert.deepStrictEqual(fan.items.map((x) => x.label), ['Lộ trình', 'Luyện nói', 'Học', 'Ôn tập', 'TOEIC']);
      assert.ok(fan.distinctX >= 3 && fan.distinctY >= 2, `Expected symmetric fan-out arc across X/Y (distinctX=${fan.distinctX}, distinctY=${fan.distinctY})`);
      assert.ok(/blur\(/i.test(fan.scrimBlur), `Expected blurred scrim backdrop-filter on fan-out (got "${fan.scrimBlur}")`);
      assert.ok(fan.orbRadii.length >= 5 && fan.orbRadii.every((r) => r >= 20), `Expected circular pastel orbs (>=20px radius, got ${JSON.stringify(fan.orbRadii)})`);
      for (const it of fan.items) {
        assert.ok(it.left >= 10 && it.right <= fan.innerW - 10, `Pill "${it.label}" out of [10, ${fan.innerW - 10}] bounds: [${it.left}, ${it.right}]`);
      }
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
        '/app/mon-hoc',
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
    { id: 'T1-F5-01', tier: 1, feature: 'F5', milestone: 'M1', name: 'Tapping #mTabAcctBtn ("Cá nhân") fans out 4 floating pills right above Cá nhân within bounds' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      assert.ok(await ctx.existsVisible('#mTabAcctBtn'), 'Expected #mTabAcctBtn button on #mTab');
      await cdp.click('#mTabAcctBtn');
      await new Promise((r) => setTimeout(r, 220));
      const fan = await cdp.evalJs(() => {
        const btn = document.getElementById('mTabAcctBtn');
        const ctrl = btn?.getAttribute('aria-controls');
        const menu = (ctrl && document.getElementById(ctrl)) || document.querySelector('#mAcctFan, .m-fan-acct');
        if (!menu || menu.hidden) return { open: false };
        const items = [...menu.querySelectorAll('a')].map((a) => {
          const r = a.getBoundingClientRect();
          return {
            label: a.textContent.trim().replace(/\s+/g, ' '),
            href: a.getAttribute('href') || '',
            left: r.left,
            right: r.right,
            top: r.top,
          };
        });
        return { open: true, expanded: btn?.getAttribute('aria-expanded') === 'true', items, innerW: window.innerWidth };
      });
      assert.ok(fan.open && fan.expanded, 'Cá nhân fan-out menu must open');
      assert.strictEqual(fan.items.length, 4, `Expected 4 floating pills above Cá nhân (got ${fan.items.length})`);
      assert.deepStrictEqual(fan.items.map((x) => x.href), ['/app/co-vu', '/app/ca-nhan', '/app/goi-cua-toi', '/app/cai-dat']);
      assert.deepStrictEqual(fan.items.map((x) => x.label), ['Cổ vũ', 'Hồ sơ', 'Gói & Chứng nhận', 'Cài đặt']);
      for (const it of fan.items) {
        assert.ok(it.left >= 10 && it.right <= fan.innerW - 10, `Pill "${it.label}" out of [10, ${fan.innerW - 10}] bounds: [${it.left}, ${it.right}]`);
      }
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
    { id: 'T1-F6-02', tier: 1, feature: 'F6', milestone: 'M1', name: 'Tapping topbar #mTopAcct opens #mAcctSheet on inner mobile pages' },
    async () => {
      await ctx.visit('/app/phong-van', { role: 'student', viewport: 'mobile' });
      assert.ok(await ctx.existsVisible('#mTopAcct'), '#mTopAcct must be visible on inner mobile pages');
      await cdp.click('#mTopAcct');
      const hidden = await cdp.evalJs(() => document.getElementById('mAcctSheet')?.hidden ?? true);
      assert.strictEqual(hidden, false, '#mAcctSheet must open from #mTopAcct');
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
    { id: 'T1-F6-04', tier: 1, feature: 'F6', milestone: 'M1', name: '#mAcctSheet lists all 6 required learner action rows' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      const rows = await cdp.evalJs(() =>
        [...document.querySelectorAll('#mAcctSheet .m-acct-item')].map((el) => el.textContent.trim())
      );
      assert.deepStrictEqual(rows, [
        'Hồ sơ của tôi',
        'Gói của tôi',
        'Chứng nhận',
        'Xem lại hướng dẫn',
        'Cài đặt',
        'Đăng xuất',
      ]);
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
}
