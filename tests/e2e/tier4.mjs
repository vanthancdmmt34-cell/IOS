/**
 * @file tests/e2e/tier4.mjs
 * Tier 4: Real-World End-to-End Scenarios & Multi-Viewport PNG Screenshots (8 full journeys).
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ADMIN_ROUTES } from './helpers.mjs';
import { apiRequest, assertWorkspaceFilesUntouched } from './server-seed.mjs';

export function registerTier4(suite, ctx) {
  const { cdp, srv, seed } = ctx;

  // T4-01: Unauthenticated landing + Real UI Login flow + Learner home screenshots
  suite.test(
    { id: 'T4-01', tier: 4, feature: 'F14', milestone: 'Core', name: 'E2E Journey 1: Landing .aw -> Real UI Login -> Student Home (390x844, 320x844, 1440x900)' },
    async () => {
      await ctx.visitLanding({ viewport: 'mobile', pathName: '/' });
      await ctx.assertNoOverflow('T4-01 landing 390px');
      await ctx.shot('01-landing-390.png');

      await ctx.visitLanding({ viewport: 'desktop', pathName: '/', clearAuth: false });
      await ctx.assertNoOverflow('T4-01 landing 1440px');
      await ctx.shot('02-landing-1440.png');

      await ctx.visitLanding({ viewport: 'mobile', pathName: '/', clearAuth: false });
      await cdp.click('[data-auth="login"]');
      await cdp.waitForCondition(() => !!document.querySelector('[data-auth-view="login"] input[name="u"]'), 4000, 60);
      await cdp.fill('[data-auth-view="login"] input[name="u"]', seed.student.username);
      await cdp.fill('[data-auth-view="login"] input[name="p"]', seed.student.password);
      await cdp.click('[data-auth-view="login"] button[data-submit]');
      await cdp.waitForAppSettled({ selector: '#mTab' });
      ctx.invalidateRoleCache();

      await ctx.assertNoOverflow('T4-01 student home 390px');
      await ctx.shot('03-student-home-390.png');

      await ctx.setViewport('narrow');
      await new Promise((r) => setTimeout(r, 120));
      await ctx.assertNoOverflow('T4-01 student home 320px');
      await ctx.shot('04-student-home-320.png');

      await ctx.setViewport('desktop');
      await new Promise((r) => setTimeout(r, 120));
      await ctx.assertNoOverflow('T4-01 student home 1440px');
      await ctx.shot('05-student-home-1440.png');
    }
  );

  // T4-02: Student 5-Tab Dock, Dual Fan-Out ("xòe quạt"), Cổ vũ, Short Profile, Settings, Quick Account Menu
  suite.test(
    { id: 'T4-02', tier: 4, feature: 'F4', milestone: 'M1', name: 'E2E Journey 2: Student Dock + Dual Radial Fan-Outs + Cổ vũ + Short Cá nhân + Quick Menu' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('#mTabLearnBtn');
      await new Promise((r) => setTimeout(r, 180));
      await ctx.shot('06-hoc-ngay-fanout-390.png');

      await ctx.setViewport('narrow');
      await new Promise((r) => setTimeout(r, 120));
      await ctx.assertNoOverflow('T4-02 hoc-ngay fanout 320px');
      await ctx.shot('07-hoc-ngay-fanout-320.png');

      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      assert.ok(await ctx.existsVisible('#mTabAcctBtn'), 'Expected #mTabAcctBtn on dock');
      await cdp.click('#mTabAcctBtn');
      await new Promise((r) => setTimeout(r, 180));
      await ctx.shot('08-ca-nhan-fanout-390.png');

      await ctx.setViewport('narrow');
      await new Promise((r) => setTimeout(r, 120));
      await ctx.assertNoOverflow('T4-02 ca-nhan fanout 320px');
      await ctx.shot('09-ca-nhan-fanout-320.png');

      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('#mTabAcctBtn');
      assert.ok(await ctx.waitForFanPill('mTabAcctBtn', '/app/co-vu'), 'Expected Cổ vũ fan-out pill');
      await ctx.clickFanPill('mTabAcctBtn', '/app/co-vu');
      await cdp.waitForAppSettled({ selector: '#hmPetCard' });
      await cdp.click('#hmPetCheerBtn');
      await new Promise((r) => setTimeout(r, 250));
      await ctx.shot('10-co-vu-390.png');

      await ctx.visit('/app/ca-nhan', { role: 'student', viewport: 'mobile' });
      assert.strictEqual(await cdp.evalJs(() => !!document.querySelector('#main #hmPetCard')), false, '/app/ca-nhan must stay short without #hmPetCard');
      await ctx.shot('11-ca-nhan-short-390.png');

      await ctx.visit('/app/cai-dat', { role: 'student', viewport: 'mobile' });
      await ctx.shot('12-cai-dat-390.png');

      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      await new Promise((r) => setTimeout(r, 150));
      await ctx.shot('13-quick-account-menu-390.png');
    }
  );

  // T4-03: Consolidated Cá nhân/Hệ thống Hub & Teacher Role Flows + Desktop Teacher
  suite.test(
    { id: 'T4-03', tier: 4, feature: 'F3', milestone: 'M1', name: 'E2E Journey 3: Cá nhân/Hệ thống Hub & Teacher Sheet + /app/lop + /bai-tap + /tien-do' },
    async () => {
      await ctx.visit('/app/ca-nhan', { role: 'student', viewport: 'mobile' });
      assert.strictEqual(await cdp.evalJs(() => !!document.querySelector('.hm-more-btn, #mTopMore')), false);
      await ctx.shot('14-ca-nhan-hub-390.png');

      await ctx.visit('/app/giao-vien', { role: 'teacher', viewport: 'mobile' });
      await cdp.click('#mTabAcctBtn');
      await new Promise((r) => setTimeout(r, 200));
      await ctx.shot('15-teacher-acct-fan-390.png');
      await cdp.click('#mAcctFan [data-close-acct-fan]');

      await cdp.click('#mTab a[href="/app/lop"]');
      await cdp.waitForAppSettled({ selector: '#main' });
      assert.ok(await cdp.evalJs((cls) => (document.getElementById('main')?.textContent || '').includes(cls), seed.classroom.name));
      await ctx.shot('16-teacher-classes-390.png');

      await ctx.visit('/app/giao-vien/bai-tap', { role: 'teacher', viewport: 'mobile' });
      await ctx.shot('17-teacher-assignments-390.png');

      await ctx.visit('/app/giao-vien/tien-do', { role: 'teacher', viewport: 'mobile' });
      await ctx.shot('18-teacher-progress-390.png');

      await ctx.visit('/app/giao-vien', { role: 'teacher', viewport: 'desktop' });
      await ctx.assertNoOverflow('T4-03 teacher desktop 1440px');
      await ctx.shot('19-teacher-desktop-1440.png');
    }
  );

  // T4-04: Learner Achievement Screens (Certificates, Leaderboard, Badges)
  suite.test(
    { id: 'T4-04', tier: 4, feature: 'F7', milestone: 'M2', name: 'E2E Journey 4: Certificates -> A1 Detail -> Leaderboard -> Badges (390x844 & 320x844)' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/chung-nhan-cua-toi/en', { role: 'student', viewport: 'mobile' });
      await ctx.shot('20-certificates-390.png');
      const certTxt = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(certTxt.includes('Chứng nhận của bạn'), 'M2: Expected "Chứng nhận của bạn" mobile header');
      await ctx.setViewport('narrow');
      await new Promise((r) => setTimeout(r, 120));
      await ctx.assertNoOverflow('T4-04 certs 320px');
      await ctx.shot('21-certificates-320.png');

      await ctx.visit('/app/ngoai-ngu/xep-hang/en', { role: 'student', viewport: 'mobile' });
      await ctx.shot('22-leaderboard-390.png');
      const lbTxt = await cdp.evalJs(() => document.querySelector('.lx-lb')?.textContent || '');
      assert.match(lbTxt, /XP/i, 'M2: Expected XP on leaderboard');
      await ctx.setViewport('narrow');
      await new Promise((r) => setTimeout(r, 120));
      await ctx.assertNoOverflow('T4-04 leaderboard 320px');
      await ctx.shot('23-leaderboard-320.png');

      await ctx.visit('/app/ngoai-ngu/huy-hieu/en', { role: 'student', viewport: 'mobile' });
      await ctx.shot('24-badges-390.png');
      const bdTxt = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(bdTxt.includes('Huy hiệu của bạn'), 'M2: Expected "Huy hiệu của bạn" mobile intro');
      await ctx.setViewport('narrow');
      await new Promise((r) => setTimeout(r, 120));
      await ctx.assertNoOverflow('T4-04 badges 320px');
      await ctx.shot('25-badges-320.png');
    }
  );

  // T4-05: Full Classroom Test Taking Journey
  suite.test(
    { id: 'T4-05', tier: 4, feature: 'F10', milestone: 'M2', name: 'E2E Journey 5: Classroom -> Test Intro -> Single-Question Pagination -> Submit 10/10' },
    async () => {
      await ctx.visit(`/app/kiem-tra-lop/${seed.testMain.id}`, { role: 'student', viewport: 'mobile' });
      await ctx.shot('26-classroom-test-intro-390.png');
      await cdp.click('#start');
      await new Promise((r) => setTimeout(r, 200));
      if (await ctx.existsVisible('.modal [data-ok]')) await cdp.click('.modal [data-ok]');
      await cdp.waitForCondition(() => !!document.getElementById('tf'), 6000, 80);
      await ctx.shot('27-classroom-test-q1-390.png');

      const hasNext = await cdp.evalJs(() =>
        [...document.querySelectorAll('#tf button, #main button')].some((b) => b.textContent.includes('Tiếp theo'))
      );
      assert.ok(hasNext, 'M2: Expected single-question "Tiếp theo" button');

      const correctIdx = [0, 1, 2, 1, 1];
      for (let qi = 0; qi < 5; qi++) {
        await cdp.evalJs((ansIdx) => {
          const vis = [...document.querySelectorAll('#tf .q-block')].find((b) => getComputedStyle(b).display !== 'none');
          vis?.querySelectorAll('label.cl-test-opt')[ansIdx]?.click();
        }, correctIdx[qi]);
        if (qi < 4) await cdp.clickText('#tf button, #main button', 'Tiếp theo');
        else await cdp.clickText('#tf button, #main button', 'Nộp bài');
      }
      await cdp.waitForCondition(() => !!document.querySelector('.modal [data-ok]'), 4000, 60);
      await cdp.click('.modal [data-ok]');
      await cdp.waitForCondition(() => (document.getElementById('main')?.textContent || '').includes('Đã nộp bài'), 6000, 80);
      await ctx.shot('28-classroom-test-submitted-390.png');
    }
  );

  // T4-06: Admin Mobile Drawer, 4-Tab Dock, #adMBack & Desktop Admin
  suite.test(
    { id: 'T4-06', tier: 4, feature: 'F11', milestone: 'M3', name: 'E2E Journey 6: Admin Mobile Drawer + 4-Tab Dock + #F4F7FB + Desktop 1440x900' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      await ctx.shot('29-admin-dashboard-390.png');
      const v = await ctx.inspectAdminVisuals();
      assert.strictEqual(v.bodyBg, 'rgb(244, 247, 251)', `M3: Expected #F4F7FB canvas, got ${v.bodyBg}`);
      assert.strictEqual(v.skIcCount, 0, 'M3: Zero .sk-ic allowed in Admin');

      await cdp.click('.ad-m-tab a[href="/app/quan-tri/hoc-vien"]');
      await cdp.waitForAppSettled({ expectAdmin: true });
      await ctx.shot('30-admin-drawer-390.png');

      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'desktop', expectAdmin: true });
      await ctx.assertNoOverflow('T4-06 admin desktop 1440px');
      await ctx.shot('31-admin-desktop-1440.png');
    }
  );

  // T4-07: All 13 Admin Mobile Routes Visual & Overflow Sweep + Screenshots
  suite.test(
    { id: 'T4-07', tier: 4, feature: 'F13', milestone: 'M3', name: 'E2E Journey 7: All 13 Admin Mobile Routes Visual & Overflow Audit + PNG Captures' },
    async () => {
      for (const r of ADMIN_ROUTES) {
        await ctx.visit(r.path, { role: 'admin', viewport: 'mobile', expectAdmin: true });
        await ctx.assertNoOverflow(`T4-07 admin ${r.tab} 390px`);
        await ctx.shot(`32-admin-${r.tab}-390.png`);
        const v = await ctx.inspectAdminVisuals();
        assert.strictEqual(v.bodyBg, 'rgb(244, 247, 251)', `${r.tab}: expected #F4F7FB`);
        assert.strictEqual(v.skIcCount, 0, `${r.tab}: found .sk-ic`);
        assert.deepStrictEqual(v.yellowControls, [], `${r.tab}: found #FDE047 controls`);
        assert.deepStrictEqual(v.creamInputs, [], `${r.tab}: found #FAF6EC cream inputs`);
      }
      // Also capture key mockup targets on 320x844
      for (const tab of ['kinh-doanh', 'cai-dat', 'giam-sat', 'song-ngu']) {
        await ctx.visit(`/app/quan-tri/${tab}`, { role: 'admin', viewport: 'narrow', expectAdmin: true });
        await ctx.assertNoOverflow(`T4-07 admin ${tab} 320px`);
        await ctx.shot(`33-admin-${tab}-320.png`);
      }
    }
  );

  // T4-08: Full Bilingual EN/VI Journey + Final Screenshot & Workspace Integrity Verification
  suite.test(
    { id: 'T4-08', tier: 4, feature: 'F1', milestone: 'M1', name: 'E2E Journey 8: EN Bilingual Student & Settings Journey + Screenshot & Workspace Audit' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile', lang: 'en' });
      await cdp.click('#mTabLearnBtn');
      await new Promise((r) => setTimeout(r, 150));
      await ctx.shot('34-student-hoc-ngay-en-390.png');
      const labels = await cdp.evalJs(() => [...document.querySelectorAll('#mTab .mtab-lbl')].map((e) => e.textContent.trim()));
      assert.deepStrictEqual(labels, ['Overview', 'Roadmap', 'Learn now', 'Interview', 'Profile']);

      await ctx.visit('/app/cai-dat', { role: 'student', viewport: 'mobile', lang: 'en' });
      await ctx.shot('35-settings-en-390.png');
      await cdp.evalJs(() => { window.__preLangReload = 1; });
      await cdp.click('[data-set-lang="vi"]');
      await cdp.waitForCondition(() => !window.__preLangReload && document.documentElement.lang === 'vi', 10000, 80);
      await cdp.waitForAppSettled({ selector: '[data-set-lang="en"]' });

      assert.ok(ctx.capturedShots.length >= 15, `Expected >= 15 captured PNG screenshots (got ${ctx.capturedShots.length})`);
      assertWorkspaceFilesUntouched(srv.workspaceSnap);
    }
  );

  // T4-09: Public Visitor Journey — Landing Light -> Drawer Dark & EN -> Download Center -> Login
  suite.test(
    { id: 'T4-09', tier: 4, feature: 'F14', milestone: 'M1', name: 'E2E Journey 9: Public Visitor Landing -> Dark & EN -> /tai-ung-dung -> Continue on Web -> Login' },
    async () => {
      try {
        await ctx.visitLanding({ viewport: 'mobile', pathName: '/', theme: 'light', lang: 'vi' });
        const paper = await cdp.evalJs(() => getComputedStyle(document.querySelector('#landingPage.aw')).getPropertyValue('--paper').trim().toUpperCase());
        assert.strictEqual(paper, '#FAF6EC', 'Initial Light Landing must preserve #FAF6EC');

        if (!(await ctx.existsVisible('[data-theme-toggle]')) && (await ctx.existsVisible('#mobileMenuBtn'))) {
          await cdp.click('#mobileMenuBtn');
        }
        await ctx.switchThemeAndAssert('dark', '[data-theme-toggle]');
        await ctx.switchLangViaUi('en');
        await ctx.assertNoOverflow('T4-09 landing dark en 390px');
        await ctx.shot('36-landing-dark-en-390.png');

        await ctx.visitPublic('/tai-ung-dung', { viewport: 'desktop', clearAuth: false });
        assert.strictEqual((await ctx.getThemeState()).attr, 'dark', 'M1: /tai-ung-dung must keep dark theme');
        assert.strictEqual(await cdp.evalJs(() => document.documentElement.lang), 'en', 'M1: /tai-ung-dung must keep EN');
        await ctx.assertNoViLeaksInEn('.dl-public-shell');
        assert.ok(await ctx.existsVisible('[data-dl-filter="pc"]'), 'Expected PC filter');
        await cdp.click('[data-dl-filter="pc"]');
        assert.ok(await ctx.existsVisible('[data-dl-filter="all"]'), 'Expected All filter');
        await cdp.click('[data-dl-filter="all"]');
        if (await ctx.existsVisible('[data-dl-guide="windows"]')) await cdp.click('[data-dl-guide="windows"]');
        await ctx.shot('37-download-dark-en-1440.png');

        assert.ok(await ctx.existsVisible('a.dl-secondary-cta[href="/app/dang-nhap"]'), 'Expected Continue on Web CTA');
        await cdp.click('a.dl-secondary-cta[href="/app/dang-nhap"]');
        await cdp.waitForCondition(() => document.querySelectorAll('#modalHost .modal.lp-auth-sheet').length === 1, 5000, 60);
        await cdp.fill('[data-auth-view="login"] input[name="u"]', seed.student.username);
        await cdp.fill('[data-auth-view="login"] input[name="p"]', seed.student.password);
        await cdp.click('[data-auth-view="login"] button[data-submit]');
        await cdp.waitForAppSettled({ selector: '#side' });
        ctx.invalidateRoleCache();

        assert.strictEqual((await ctx.getThemeState()).attr, 'dark', 'Logged-in app must retain dark theme');
        assert.strictEqual(await cdp.evalJs(() => document.documentElement.lang), 'en', 'Logged-in app must retain EN');
        await ctx.assertNoOverflow('T4-09 post-login desktop');
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );

  // T4-10: Learner Desktop & Mobile Dark Mode Study + Sidebar + Interview SPA + Family + Settings
  suite.test(
    { id: 'T4-10', tier: 4, feature: 'F5', milestone: 'M2', name: 'E2E Journey 10: Learner Desktop & Mobile Dark Mode Study + Sidebar + Interview SPA + Family + Settings' },
    async () => {
      const dbPath = path.join(srv.tmpDataDir, 'app.db');
      const nowIso = new Date().toISOString();
      const expIso = new Date(Date.now() + 30 * 86400000).toISOString();
      let groupId = null;
      const db = new DatabaseSync(dbPath);
      try {
        const info = db.prepare(`INSERT INTO family_groups (owner_id, seats, starts_at, expires_at, status, created_at) VALUES (?, 4, ?, ?, 'active', ?)`).run(seed.parent.user.id, nowIso, expIso, nowIso);
        groupId = Number(info.lastInsertRowid);
        db.prepare(`INSERT INTO family_members (group_id, user_id, status, share_progress, invited_at, joined_at) VALUES (?, ?, 'active', 1, ?, ?)`).run(groupId, seed.parent.user.id, nowIso, nowIso);
      } finally {
        db.close();
      }

      try {
        await ctx.visit('/app/en', { role: 'student', viewport: 'desktop', theme: 'light' });
        await ctx.switchThemeAndAssert('dark', '.topbar [data-theme-toggle]');
        for (const r of ['/app/toeic', '/app/so-tay', '/app/ngoai-ngu/tro-chuyen/en']) {
          await ctx.visit(r, { role: 'student', viewport: 'desktop', theme: 'dark' });
          await ctx.assertNoOverflow(`T4-10 desktop ${r}`);
          assert.ok(await ctx.existsVisible('#side'), `#side must stay visible on ${r}`);
          assert.ok(await ctx.existsVisible('.topbar'), `.topbar must stay visible on ${r}`);
        }
        await ctx.assertContrast('.sp-chatbar, .sp-chatbar input', 4.5, 'T4-10 sp-chatbar dark', { includeNonText: true });
        await ctx.shot('38-learner-speak-dark-1440.png');

        await ctx.visit('/app/phong-van', { role: 'student', viewport: 'mobile', theme: 'dark' });
        await cdp.evalJs(() => { window.__t410Spa = 1; });
        assert.ok(await ctx.existsVisible('#ivQuickStart'), 'Expected #ivQuickStart');
        await cdp.click('#ivQuickStart');
        await cdp.waitForCondition(() => location.pathname.startsWith('/app/phong-van/en'), 5000, 60);
        assert.strictEqual(await cdp.evalJs(() => window.__t410Spa), 1, 'M2: #ivQuickStart must navigate via SPA');

        await ctx.visit('/app/gia-dinh', { role: 'parent', viewport: 'mobile', theme: 'dark', selector: '#inv' });
        await ctx.assertNoOverflow('T4-10 family mobile dark');
        await cdp.fill('#inv input[name="u"]', seed.peer3.username);
        await cdp.click('#inv button');
        await cdp.waitForCondition((u) => (document.getElementById('main')?.textContent || '').includes(u), 5000, 80, seed.peer3.username);
        const reqs = await ctx.trackRequests(
          async () => {
            await cdp.click('[data-prog]');
            assert.ok(await ctx.waitForVisible('.modal', 3000), 'Expected progress modal');
            await new Promise((r) => setTimeout(r, 150));
          },
          { urlPattern: /\/api\/family\/members\/\d+\/progress/, method: 'GET' }
        );
        assert.strictEqual(reqs.total, 1, `M2: Expected 1 progress call (got ${reqs.total})`);
        if (await ctx.existsVisible('.modal .modal-x, .modal [data-close]')) await cdp.click('.modal .modal-x, .modal [data-close]');

        await ctx.visit('/app/cai-dat', { role: 'student', viewport: 'mobile', theme: 'dark' });
        assert.ok(await ctx.existsVisible('#stThemeBtn'), 'Expected #stThemeBtn');
        await cdp.click('#stThemeBtn');
        await cdp.waitForCondition(() => document.documentElement.getAttribute('data-theme') === 'light', 3000, 60);
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
        await ctx.restoreLightAndVi();
      }
    }
  );

  // T4-11: Admin Full Dark Mode + Tablet (900x700) + Modal + Gift Code + Settings + System + EN
  suite.test(
    { id: 'T4-11', tier: 4, feature: 'F13', milestone: 'M3', name: 'E2E Journey 11: Admin Full Dark Mode + Tablet 900x700 + #addU + #gcForm + Dirty/Leave + System + EN' },
    async () => {
      try {
        await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'tablet', expectAdmin: true, theme: 'light' });
        await ctx.switchThemeAndAssert('dark', '.ad-top [data-theme-toggle]');
        assert.ok((await ctx.getSurfaceLuminance('.ad')).luminance < 0.2, 'M3: Admin dark canvas expected');
        await ctx.assertContrast('.ad h1, .ad-kpi b, .ad-kpi span', 4.5, 'T4-11 admin dark tablet');
        await ctx.shot('39-admin-dark-tablet-900.png');

        await ctx.visit('/app/quan-tri/hoc-vien', { role: 'admin', viewport: 'tablet', expectAdmin: true, theme: 'dark' });
        assert.ok(await ctx.existsVisible('#addU'), 'Expected #addU');
        await cdp.click('#addU');
        assert.ok(await ctx.waitForVisible('.modal', 3000), 'Expected #addU modal');
        assert.ok((await ctx.getSurfaceLuminance('.modal')).luminance < 0.2, 'M3: #addU modal must be dark in Dark Mode');
        await ctx.assertContrast('.modal h2, .modal label.field, .modal input[name="u"]', 4.5, 'T4-11 #addU dark', { includeNonText: true });
        if (await ctx.existsVisible('.modal .modal-x, .modal [data-close]')) await cdp.click('.modal .modal-x, .modal [data-close]');

        await ctx.visit('/app/quan-tri/ma-qua-tang', { role: 'admin', viewport: 'tablet', expectAdmin: true, theme: 'dark' });
        await cdp.fill('#gcForm input[name="count"]', '1');
        await cdp.fill('#gcForm input[name="days"]', '7');
        await cdp.click('#gcForm button');
        await new Promise((r) => setTimeout(r, 400));
        assert.strictEqual(await cdp.evalJs(() => document.getElementById('gcNew')?.hidden), false, 'M3: #gcNew must remain visible');

        await ctx.visit('/app/quan-tri/cai-dat', { role: 'admin', viewport: 'tablet', expectAdmin: true, theme: 'dark' });
        const swSel = '[data-row="allowRegister"] .switch';
        assert.ok(await ctx.existsVisible(swSel), 'Expected visible allowRegister switch');
        const origAllow = await cdp.evalJs(() => !!document.getElementById('st-allowRegister')?.checked);
        await cdp.click(swSel);
        await cdp.click('#stSave');
        await cdp.waitForCondition(() => document.getElementById('stSave')?.disabled === true, 5000, 80);
        await cdp.click(swSel);
        const leak = await ctx.probeBeforeUnloadLeak(async () => {
          await cdp.click('.ad-nav a[href="/app/quan-tri/he-thong"]');
          await cdp.waitForCondition(() => location.pathname === '/app/quan-tri/he-thong', 5000, 60);
          await cdp.waitForAppSettled({ expectAdmin: true });
        });
        assert.strictEqual(leak.leaked, false, 'M3: SPA leave from cai-dat must not leak beforeunload');
        await apiRequest(srv.baseUrl, 'PUT', '/api/admin/settings', { session: seed.admin, body: { values: { allowRegister: origAllow } } }).catch(() => {});

        await cdp.click('.chips button[data-panel="website"]');
        assert.ok(await ctx.waitForVisible('#cy-PUBLIC_URL', 3000), 'Expected #cy-PUBLIC_URL');
        await cdp.fill('#cy-PUBLIC_URL', 'https://t411.example.com');
        await cdp.click('#cfUndo');
        assert.ok(await ctx.waitForVisible('.chips button[data-panel="website"]', 3000), 'Expected website chip after undo');
        await cdp.click('.chips button[data-panel="website"]');
        assert.ok(await ctx.waitForVisible('#cy-PUBLIC_URL', 3000), 'Expected #cy-PUBLIC_URL after undo');
        await cdp.fill('#cy-PUBLIC_URL', 'https://t411-save.example.com');
        const reqs = await ctx.trackRequests(
          async () => {
            await cdp.click('#cfSave');
            await new Promise((r) => setTimeout(r, 400));
          },
          { urlPattern: /\/api\/admin\/(system|settings)/, method: 'PUT' }
        );
        assert.strictEqual(reqs.total, 1, `M3: Expected 1 PUT request (got ${reqs.total})`);
        await apiRequest(srv.baseUrl, 'PUT', '/api/admin/system', { session: seed.admin, body: { values: { PUBLIC_URL: '' }, secrets: {} } }).catch(() => {});

        for (const vp of ['tablet', 'mobile']) {
          await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: vp, expectAdmin: true, theme: 'dark', lang: 'en' });
          await ctx.assertNoOverflow(`T4-11 admin en dark ${vp}`);
          const txt = await cdp.evalJs(() => document.querySelector('.ad')?.textContent || '');
          assert.strictEqual(txt.includes('Phân khu quản trị'), false, `M3: ${vp} Admin EN leaked VI text`);
        }
        assertWorkspaceFilesUntouched(srv.workspaceSnap);
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );
}
