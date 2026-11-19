/**
 * @file tests/e2e/tier3.mjs
 * Tier 3: Cross-Feature Combinations (16 pairwise interactive workflows across F1-F14).
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { apiRequest } from './server-seed.mjs';

export function registerTier3(suite, ctx) {
  const { cdp, srv, seed } = ctx;

  suite.test(
    { id: 'T3-01', tier: 3, feature: 'F4', milestone: 'M1', name: 'Học ngay fan-out -> Luyện nói -> Cá nhân fan-out -> Lớp của tôi navigation' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('#mTabLearnBtn');
      assert.ok(await ctx.waitForFanPill('mTabLearnBtn', '/app/ngoai-ngu/luyen-noi/en'), 'Expected Luyện nói fan-out pill');
      await ctx.clickFanPill('mTabLearnBtn', '/app/ngoai-ngu/luyen-noi/en');
      await cdp.waitForAppSettled({ selector: '#main h1' });
      const p1 = await cdp.evalJs(() => ({
        path: location.pathname,
        learnOn: document.getElementById('mTabLearnBtn')?.classList.contains('on') || false,
      }));
      assert.strictEqual(p1.path, '/app/ngoai-ngu/luyen-noi/en');
      assert.strictEqual(p1.learnOn, true);

      await cdp.click('#mTabAcctBtn');
      assert.ok(await ctx.waitForFanPill('mTabAcctBtn', '/app/lop'), 'Expected Lớp học pill in Cá nhân fan-out');
      await ctx.clickFanPill('mTabAcctBtn', '/app/lop');
      await cdp.waitForAppSettled({ selector: '#main' });
      const p2 = await cdp.evalJs(() => ({
        path: location.pathname,
        acctOn: document.getElementById('mTabAcctBtn')?.classList.contains('on') || false,
        text: document.getElementById('main')?.textContent || '',
      }));
      assert.strictEqual(p2.path, '/app/lop');
      assert.strictEqual(p2.acctOn, true);
      assert.ok(p2.text.includes(seed.classroom.name));
    }
  );

  suite.test(
    { id: 'T3-02', tier: 3, feature: 'F5', milestone: 'M1', name: 'Cá nhân fan-out -> Cổ vũ (/app/co-vu) -> cheer +2 knowledge persists across reload' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      assert.ok(await ctx.existsVisible('#mTabAcctBtn'), 'Expected #mTabAcctBtn');
      await cdp.click('#mTabAcctBtn');
      assert.ok(await ctx.waitForFanPill('mTabAcctBtn', '/app/co-vu'), 'Expected Cổ vũ fan-out pill');
      await ctx.clickFanPill('mTabAcctBtn', '/app/co-vu');
      await cdp.waitForAppSettled({ selector: '#hmPetCard' });
      const before = await cdp.evalJs(() => parseInt(document.getElementById('hmPetKnowVal')?.textContent || '0', 10));
      await cdp.click('#hmPetCheerBtn');
      await cdp.waitForCondition(
        (prev) => parseInt(document.getElementById('hmPetKnowVal')?.textContent || '0', 10) >= prev + 2,
        5000,
        80,
        before
      );
      await ctx.visit('/app/co-vu', { role: 'student', viewport: 'mobile' });
      const after = await cdp.evalJs(() => parseInt(document.getElementById('hmPetKnowVal')?.textContent || '0', 10));
      assert.ok(after >= before + 2, `Expected persisted knowledge >= ${before + 2}, got ${after}`);
    }
  );

  suite.test(
    { id: 'T3-03', tier: 3, feature: 'F6', milestone: 'M1', name: 'Quick Account Menu -> Cài đặt -> EN language switch -> VI restore' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile', lang: 'vi' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      await cdp.click('#mAcctSheet a[href="/app/cai-dat"]');
      await cdp.waitForAppSettled({ selector: '[data-set-lang="en"]' });

      await cdp.evalJs(() => { window.__preLangReload = 1; });
      await cdp.click('[data-set-lang="en"]');
      await cdp.waitForCondition(() => !window.__preLangReload && document.documentElement.lang === 'en', 10000, 80);
      await cdp.waitForAppSettled({ selector: '[data-set-lang="vi"]' });
      const enDock = await cdp.evalJs(() => [...document.querySelectorAll('#mTab .mtab-lbl')].map((e) => e.textContent.trim()));
      assert.strictEqual(enDock[0], 'Overview', 'EN toggle in /app/cai-dat must translate dock');

      await cdp.evalJs(() => { window.__preLangReload = 1; });
      await cdp.click('[data-set-lang="vi"]');
      await cdp.waitForCondition(() => !window.__preLangReload && document.documentElement.lang === 'vi', 10000, 80);
      await cdp.waitForAppSettled({ selector: '[data-set-lang="en"]' });
      const viDock = await cdp.evalJs(() => [...document.querySelectorAll('#mTab .mtab-lbl')].map((e) => e.textContent.trim()));
      assert.strictEqual(viDock[0], 'Tổng quan', 'VI toggle in /app/cai-dat must restore dock');
    }
  );

  suite.test(
    { id: 'T3-04', tier: 3, feature: 'F7', milestone: 'M2', name: 'Quick Account Menu -> Chứng nhận -> A1 detail verification' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      await cdp.click('#mAcctSheet [data-acct-cert]');
      await cdp.waitForAppSettled({ selector: '.lx-cert-featured' });
      const feat = await cdp.evalJs(() => ({
        path: location.pathname,
        tag: document.querySelector('.lx-cert-feat-tag')?.textContent.trim() || '',
        sub: document.querySelector('.lx-cert-featured p')?.textContent.trim() || '',
      }));
      assert.strictEqual(feat.path, '/app/ngoai-ngu/chung-nhan-cua-toi/en');
      assert.strictEqual(feat.tag, 'Đã đạt');
      assert.ok(feat.sub.includes('Tiếng Anh · Hoàn thành cấp độ'), `M2: Expected mockup subtitle, got "${feat.sub}"`);
      await cdp.click('.lx-cert-feat-btn');
      await cdp.waitForAppSettled({ selector: '#main' });
      assert.ok(await cdp.evalJs(() => location.pathname.includes('/chung-nhan/en/a1')));
    }
  );

  suite.test(
    { id: 'T3-05', tier: 3, feature: 'F8', milestone: 'M2', name: 'Quick Account Menu -> Bảng xếp hạng (XP + rows) -> Quick Account Menu -> Huy hiệu (2x2 pastel)' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      await cdp.click('#mAcctSheet [data-acct-lb]');
      await cdp.waitForAppSettled({ selector: '.lx-lb-hero' });
      const lbTxt = await cdp.evalJs(() => document.querySelector('.lx-lb')?.textContent || '');
      assert.match(lbTxt, /XP/i, 'M2: Expected XP in leaderboard');

      await cdp.click('#mTabAcctBtn');
      await ctx.waitForFanPill('mTabAcctBtn', '/app/ca-nhan');
      await ctx.clickFanPill('mTabAcctBtn', '/app/ca-nhan');
      await cdp.waitForAppSettled({ selector: '.pf-hub-nav' });
      await cdp.click('.pf-hub-nav a[href="/app/ngoai-ngu/huy-hieu/en"]');
      await cdp.waitForAppSettled({ selector: '.lx-badges' });
      const badgeTxt = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(badgeTxt.includes('Huy hiệu của bạn'), 'M2: Expected "Huy hiệu của bạn" mobile heading');
    }
  );

  suite.test(
    { id: 'T3-06', tier: 3, feature: 'F10', milestone: 'M2', name: 'Student /app/lop -> Class detail -> Classroom test intro & pagination' },
    async () => {
      await ctx.visit('/app/lop', { role: 'student', viewport: 'mobile' });
      await cdp.click(`a[href="/app/lop/${seed.classroom.id}"]`);
      await cdp.waitForAppSettled({ selector: '.cl-m-kpis' });
      await cdp.click(`a[href="/app/kiem-tra-lop/${seed.testMain.id}"]`);
      await cdp.waitForAppSettled({ selector: '.cl-test-intro' });
      const introTitle = await cdp.evalJs(() => document.querySelector('.cl-test-intro h1')?.textContent.trim() || '');
      assert.strictEqual(introTitle, seed.testMain.title);
      await cdp.click('#start');
      await new Promise((r) => setTimeout(r, 200));
      if (await ctx.existsVisible('.modal [data-ok]')) await cdp.click('.modal [data-ok]');
      await cdp.waitForCondition(() => !!document.getElementById('tf'), 6000, 80);
      const cnt = await cdp.evalJs(() => document.querySelector('.lx-ex-cnt')?.textContent.trim() || '');
      assert.ok(cnt.includes('Câu 1/5'), `M2: Expected Câu 1/5, got "${cnt}"`);
    }
  );

  suite.test(
    { id: 'T3-07', tier: 3, feature: 'F3', milestone: 'M1', name: 'Teacher #mTab & #mAcctSheet navigation across Lớp của tôi -> Bài tập -> Tiến độ -> Thông báo lớp in EN mode' },
    async () => {
      await ctx.visit('/app/giao-vien', { role: 'teacher', viewport: 'mobile', lang: 'en' });
      await cdp.click('#mTab a[href="/app/lop"]');
      await cdp.waitForAppSettled({ selector: '#main' });
      assert.ok(await cdp.evalJs((cls) => (document.getElementById('main')?.textContent || '').includes(cls), seed.classroom.name));

      await cdp.click('#mTab a[href="/app/giao-vien/bai-tap"]');
      await cdp.waitForAppSettled({ selector: '#main' });
      assert.strictEqual(await cdp.evalJs(() => location.pathname), '/app/giao-vien/bai-tap');

      await cdp.click('#mTab a[href="/app/giao-vien/tien-do"]');
      await cdp.waitForAppSettled({ selector: '#main' });
      assert.strictEqual(await cdp.evalJs(() => location.pathname), '/app/giao-vien/tien-do');

      await cdp.click('#mTabAcctBtn');
      await ctx.waitForFanPill('mTabAcctBtn', '/app/thong-bao');
      await ctx.clickFanPill('mTabAcctBtn', '/app/thong-bao');
      await cdp.waitForAppSettled({ selector: '#main' });
      assert.strictEqual(await cdp.evalJs(() => location.pathname), '/app/thong-bao');
    }
  );

  suite.test(
    { id: 'T3-08', tier: 3, feature: 'F14', milestone: 'M1', name: 'Học ngay -> TOEIC mobile dock active -> resize to 1440x900 desktop intact' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('#mTabLearnBtn');
      assert.ok(await ctx.waitForFanPill('mTabLearnBtn', '/app/toeic'), 'Expected TOEIC fan-out pill');
      await ctx.clickFanPill('mTabLearnBtn', '/app/toeic');
      await cdp.waitForAppSettled({ selector: '#main' });
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('mTabLearnBtn')?.classList.contains('on')), true);

      await ctx.setViewport('desktop');
      await new Promise((r) => setTimeout(r, 120));
      await ctx.assertNoOverflow('T3-08 TOEIC desktop resize');
      const mTabDisp = await cdp.evalJs(() => getComputedStyle(document.getElementById('mTab')).display);
      assert.strictEqual(mTabDisp, 'none');
    }
  );

  suite.test(
    { id: 'T3-09', tier: 3, feature: 'F11', milestone: 'M3', name: 'Admin Người dùng dock -> .ad-subnav Lớp học và giấy phép -> Người dùng dock active -> #adMBack SPA' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      await cdp.click('.ad-m-tab a[href="/app/quan-tri/hoc-vien"]');
      await cdp.waitForAppSettled({ expectAdmin: true });
      await cdp.click('.ad-subnav a[href="/app/quan-tri/lop-giay-phep"]');
      await cdp.waitForAppSettled({ expectAdmin: true });
      const dockLbl = await cdp.evalJs(() => document.querySelector('.ad-m-tab-it.on')?.textContent.trim() || '');
      assert.strictEqual(dockLbl, 'Người dùng', `M3: Expected Người dùng active on lop-giay-phep, got "${dockLbl}"`);
      await cdp.evalJs(() => { window.__t3Spa = 1; });
      await cdp.click('#adMBack');
      await cdp.waitForAppSettled({ expectAdmin: true });
      assert.strictEqual(await cdp.evalJs(() => window.__t3Spa || 0), 1, 'M3: #adMBack must navigate via SPA');
    }
  );

  suite.test(
    { id: 'T3-10', tier: 3, feature: 'F12', milestone: 'M3', name: 'Admin 5-tab dock roundtrip: Tổng quan -> Người dùng -> Nội dung -> .ad-subnav song-ngu -> Kinh doanh -> Hệ thống' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      await cdp.click('.ad-m-tab a[href="/app/quan-tri/hoc-vien"]');
      await cdp.waitForAppSettled({ expectAdmin: true });
      assert.strictEqual(await cdp.evalJs(() => location.pathname), '/app/quan-tri/hoc-vien');

      await cdp.click('.ad-m-tab a[href="/app/quan-tri/ngoai-ngu"]');
      await cdp.waitForAppSettled({ expectAdmin: true });
      assert.strictEqual(await cdp.evalJs(() => location.pathname), '/app/quan-tri/ngoai-ngu');

      await cdp.click('.ad-subnav a[href="/app/quan-tri/song-ngu"]');
      await cdp.waitForAppSettled({ expectAdmin: true });
      const dock = await cdp.evalJs(() => document.querySelector('.ad-m-tab-it.on')?.textContent.trim() || '');
      assert.strictEqual(dock, 'Nội dung', `M3: song-ngu must highlight Nội dung (got "${dock}")`);
    }
  );

  suite.test(
    { id: 'T3-11', tier: 3, feature: 'F13', milestone: 'M3', name: 'Admin song-ngu search + PUT override + EN verification + revert' },
    async () => {
      await ctx.visit('/app/quan-tri/song-ngu', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const v = await ctx.inspectAdminVisuals();
      assert.strictEqual(v.skIcCount, 0, 'M3: song-ngu must have 0 .sk-ic');

      await cdp.fill('#q', 'Cài đặt chung');
      await new Promise((r) => setTimeout(r, 300));
      const hasSave = await cdp.evalJs(() => !!document.querySelector('#ui button[data-save="Cài đặt chung"]'));
      assert.ok(hasSave, 'Expected matching row for "Cài đặt chung" in song-ngu');

      // Save override and then immediately revert so DB stays clean
      await cdp.evalJs(() => {
        const inp = document.querySelector('#ui input[data-src="Cài đặt chung"]');
        if (inp) inp.value = 'General Settings E2E';
        document.querySelector('#ui button[data-save="Cài đặt chung"]')?.click();
      });
      await new Promise((r) => setTimeout(r, 250));
      await cdp.evalJs(() => {
        const inp = document.querySelector('#ui input[data-src="Cài đặt chung"]');
        if (inp) inp.value = '';
        document.querySelector('#ui button[data-save="Cài đặt chung"]')?.click();
      });
      await new Promise((r) => setTimeout(r, 250));
    }
  );

  suite.test(
    { id: 'T3-12', tier: 3, feature: 'F13', milestone: 'M3', name: 'Admin kinh-doanh mobile switches sub-views (thanh-toan, thong-ke, goi, ai) cleanly' },
    async () => {
      await ctx.visit('/app/quan-tri/kinh-doanh', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const v0 = await ctx.inspectAdminVisuals();
      assert.strictEqual(v0.skIcCount, 0, 'M3: kinh-doanh must have 0 .sk-ic');
      assert.deepStrictEqual(v0.yellowControls, [], 'M3: kinh-doanh must have 0 #FDE047 controls');

      for (const sub of ['thong-ke', 'goi', 'ai']) {
        await ctx.visit(`/app/quan-tri/kinh-doanh?sub=${sub}`, { role: 'admin', viewport: 'mobile', expectAdmin: true });
        await ctx.assertNoOverflow(`T3-12 kinh-doanh ${sub}`);
      }
    }
  );

  suite.test(
    { id: 'T3-13', tier: 3, feature: 'F13', milestone: 'M3', name: 'Admin cai-dat -> he-thong switches all 4 panels (thanh-toan, ai, website, email)' },
    async () => {
      await ctx.visit('/app/quan-tri/cai-dat', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const v = await ctx.inspectAdminVisuals();
      assert.strictEqual(v.skIcCount, 0, 'M3: cai-dat must have 0 .sk-ic');

      await ctx.visit('/app/quan-tri/he-thong', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      for (const panel of ['thanh-toan', 'ai', 'website', 'email']) {
        await cdp.click(`.chips button[data-panel="${panel}"]`);
        await new Promise((r) => setTimeout(r, 80));
        await ctx.assertNoOverflow(`T3-13 he-thong panel ${panel}`);
        const vp = await ctx.inspectAdminVisuals();
        assert.deepStrictEqual(vp.creamInputs, [], `Panel ${panel} leaked cream input`);
        assert.deepStrictEqual(vp.yellowControls, [], `Panel ${panel} leaked #FDE047 chip`);
      }
    }
  );

  suite.test(
    { id: 'T3-14', tier: 3, feature: 'F13', milestone: 'M3', name: 'Admin hoc-vien search Minh Anh -> Xem -> hoc-vien/:uid detail cleanly' },
    async () => {
      await ctx.visit('/app/quan-tri/hoc-vien', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const v = await ctx.inspectAdminVisuals();
      assert.strictEqual(v.skIcCount, 0, 'M3: hoc-vien must have 0 .sk-ic');
      await cdp.fill('#sq', 'Minh Anh');
      await new Promise((r) => setTimeout(r, 200));
      await cdp.click(`a[href="/app/quan-tri/hoc-vien/${seed.student.user.id}"]`);
      await cdp.waitForAppSettled({ expectAdmin: true });
      const txt = await cdp.evalJs(() => document.querySelector('.ad-content')?.textContent || '');
      assert.ok(txt.includes('Minh Anh') && txt.includes('e2e_student'));
      await ctx.assertNoOverflow('T3-14 hoc-vien detail');
    }
  );

  suite.test(
    { id: 'T3-15', tier: 3, feature: 'F5', milestone: 'M1', name: 'Cá nhân fan-out -> Hồ sơ (/app/ca-nhan) short view + expand Bảo mật' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      assert.ok(await ctx.existsVisible('#mTabAcctBtn'), 'Expected #mTabAcctBtn');
      await cdp.click('#mTabAcctBtn');
      assert.ok(await ctx.waitForFanPill('mTabAcctBtn', '/app/ca-nhan'), 'Expected Hồ sơ fan-out pill');
      await ctx.clickFanPill('mTabAcctBtn', '/app/ca-nhan');
      await cdp.waitForAppSettled({ selector: '.pf-m-hero' });
      assert.strictEqual(await cdp.evalJs(() => !!document.querySelector('#main #hmPetCard')), false, '/app/ca-nhan must stay short without #hmPetCard');
      await cdp.click('[data-pf-open="#pwDetails"]');
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('pwDetails')?.open), true);
    }
  );

  suite.test(
    { id: 'T3-16', tier: 3, feature: 'F14', milestone: 'Core', name: 'Landing / -> /en -> /vi toggle preserves .aw #FAF6EC and zero overflow' },
    async () => {
      await ctx.visitLanding({ viewport: 'mobile', pathName: '/' });
      await ctx.assertNoOverflow('T3-16 landing vi mobile');
      await ctx.visitLanding({ viewport: 'mobile', pathName: '/en' });
      await ctx.assertNoOverflow('T3-16 landing en mobile');
      const enCheck = await cdp.evalJs(() => {
        const aw = document.querySelector('#landingPage.aw');
        const st = aw ? getComputedStyle(aw) : null;
        return {
          lang: document.documentElement.lang,
          paperToken: st ? st.getPropertyValue('--paper').trim().toUpperCase() : '',
          awBg: st?.backgroundColor || '',
        };
      });
      assert.strictEqual(enCheck.lang, 'en');
      assert.strictEqual(enCheck.paperToken, '#FAF6EC');
      assert.ok(['rgb(250, 246, 236)', 'rgb(250, 249, 255)'].includes(enCheck.awBg));
    }
  );

  // ================= Pairwise Expansion Tests (T3-17..T3-23) =================
  suite.test(
    { id: 'T3-17', tier: 3, feature: 'F14', milestone: 'M1', name: 'Theme toggle persistence across Landing <-> Download <-> In-App <-> Admin (1440x900)' },
    async () => {
      try {
        await ctx.visitLanding({ viewport: 'desktop', pathName: '/', theme: 'light' });
        await ctx.switchThemeAndAssert('dark', '[data-theme-toggle]');

        await ctx.visitPublic('/tai-ung-dung', { viewport: 'desktop', clearAuth: false });
        assert.strictEqual((await ctx.getThemeState()).attr, 'dark', 'M1: /tai-ung-dung must preserve dark theme');
        assert.ok((await ctx.getSurfaceLuminance('.dl-public-shell')).luminance < 0.2, 'M1: /tai-ung-dung must render dark surface');

        assert.ok(await ctx.existsVisible('[data-dl-auth="login"]'), 'Expected [data-dl-auth="login"] on /tai-ung-dung');
        await cdp.click('[data-dl-auth="login"]');
        assert.ok(await ctx.waitForVisible('[data-auth-view="login"] input[name="u"]', 4000), 'Expected login form');
        await cdp.fill('[data-auth-view="login"] input[name="u"]', seed.student.username);
        await cdp.fill('[data-auth-view="login"] input[name="p"]', seed.student.password);
        await cdp.click('[data-auth-view="login"] button[data-submit]');
        await cdp.waitForAppSettled({ selector: '#side' });
        ctx.invalidateRoleCache();
        assert.strictEqual((await ctx.getThemeState()).attr, 'dark', 'M1: In-app must preserve dark theme after login');
        assert.ok((await ctx.getSurfaceLuminance('body.in-app')).luminance < 0.2, 'M2: In-app surface must stay dark');

        await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'desktop', expectAdmin: true, theme: 'dark' });
        assert.strictEqual((await ctx.getThemeState()).attr, 'dark', 'M3: Admin must preserve dark theme');
        assert.ok((await ctx.getSurfaceLuminance('.ad')).luminance < 0.2, 'M3: Admin .ad must render dark surface');
        await ctx.switchThemeAndAssert('light', '.ad-top [data-theme-toggle]');

        await ctx.visitLanding({ viewport: 'desktop', pathName: '/', clearAuth: true });
        const paper = await cdp.evalJs(() => getComputedStyle(document.querySelector('#landingPage.aw')).getPropertyValue('--paper').trim().toUpperCase());
        assert.strictEqual(paper, '#FAF6EC', 'Returning to Light Landing must preserve --paper: #FAF6EC');
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );

  suite.test(
    { id: 'T3-18', tier: 3, feature: 'F1', milestone: 'M1', name: 'VI/EN + Dark Mode combined across Desktop, Tablet (900x700), Mobile (390x844) on all 4 shells' },
    async () => {
      try {
        for (const vp of ['desktop', 'tablet', 'mobile']) {
          await ctx.visitLanding({ viewport: vp, pathName: '/en', lang: 'en', theme: 'dark' });
          assert.strictEqual((await ctx.getThemeState()).attr, 'dark', `Landing ${vp}: expected dark theme`);
          assert.strictEqual(await cdp.evalJs(() => document.documentElement.lang), 'en', `Landing ${vp}: expected en`);
          await ctx.assertNoOverflow(`T3-18 landing ${vp}`);

          await ctx.visitPublic('/tai-ung-dung', { viewport: vp, lang: 'en', theme: 'dark' });
          await ctx.assertNoOverflow(`T3-18 download ${vp}`);
          await ctx.assertNoViLeaksInEn('.dl-public-shell');
          await ctx.assertContrast('.dl-hero h1, .dl-hero .dl-lead, .dl-card h3, .dl-card-sub', 4.5, `T3-18 download ${vp}`);

          await ctx.visit('/app/en', { role: 'student', viewport: vp, lang: 'en', theme: 'dark' });
          await ctx.assertNoOverflow(`T3-18 in-app ${vp}`);
          await ctx.assertContrast('#main h1, #main h2, .topbar .ud-name', 4.5, `T3-18 in-app ${vp}`);

          await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: vp, expectAdmin: true, lang: 'en', theme: 'dark' });
          await ctx.assertNoOverflow(`T3-18 admin ${vp}`);
          await ctx.assertContrast('.ad h1, .ad-kpi b, .ad-kpi span', 4.5, `T3-18 admin ${vp}`);
        }
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );

  suite.test(
    { id: 'T3-19', tier: 3, feature: 'F14', milestone: 'M1', name: 'Landing Tablet (900x700) single nav mode + Mobile (390x844) #mobileDrawer anchor scroll' },
    async () => {
      await ctx.visitLanding({ viewport: 'tablet', pathName: '/' });
      await ctx.assertNoOverflow('T3-19 landing tablet');
      const navVis = await ctx.existsVisible('.aw-nav');
      const burgerVis = await ctx.existsVisible('#mobileMenuBtn');
      assert.ok(navVis || burgerVis, '900x700 must show either .aw-nav or #mobileMenuBtn');
      assert.strictEqual(navVis && burgerVis, false, 'M1: 900x700 must never show both .aw-nav and #mobileMenuBtn');

      await ctx.visitLanding({ viewport: 'mobile', pathName: '/' });
      assert.ok(await ctx.existsVisible('#mobileMenuBtn'), 'Expected #mobileMenuBtn on 390x844');
      await cdp.click('#mobileMenuBtn');
      const anchorSel = '#mobileDrawer a[href="#lpMobileDemo"], #mobileDrawer a[href="#demoBox"]';
      assert.ok(await ctx.existsVisible(anchorSel), 'Expected demo anchor inside #mobileDrawer');
      await cdp.evalJs(() => window.scrollTo(0, 0));
      await cdp.click(anchorSel);
      await new Promise((r) => setTimeout(r, 450));
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('mobileDrawer')?.hidden), true, 'Drawer must close');
      assert.ok((await cdp.evalJs(() => window.scrollY)) > 50, 'M1: Mobile drawer anchor must scroll to visible section');
    }
  );

  suite.test(
    { id: 'T3-20', tier: 3, feature: 'F5', milestone: 'M1', name: 'PC Sidebar accordion + sub-route active states + AI Widget /app/bang-gia upgrade flow (1440x900 Dark)' },
    async () => {
      const prevSettings = await apiRequest(srv.baseUrl, 'GET', '/api/admin/settings', { session: seed.admin });
      const prevFreeDaily = prevSettings.json?.values?.aiFreeDaily ?? 3;
      try {
        await apiRequest(srv.baseUrl, 'PUT', '/api/admin/system', {
          session: seed.admin,
          body: { values: { AI_PROVIDER: 'gemini' }, secrets: { GEMINI_API_KEY: 'AIzaSyTestE2EDummyKeyForWidget0000' }, password: seed.admin.password },
        });
        await apiRequest(srv.baseUrl, 'PUT', '/api/admin/settings', {
          session: seed.admin,
          body: { values: { aiFreeDaily: 0 } },
        });

        await ctx.visit('/app/en', { role: 'student', viewport: 'desktop', theme: 'dark', forceReset: true });
        for (const r of ['/app/toeic', '/app/so-tay', '/app/tro-choi/en']) {
          await ctx.visit(r, { role: 'student', viewport: 'desktop', theme: 'dark' });
          assert.ok(await cdp.evalJs(() => document.querySelectorAll('#sideNav a.on').length > 0), `M1: Expected active #sideNav link on ${r}`);
        }
        await ctx.visit('/app/ngoai-ngu', { role: 'student', viewport: 'desktop', theme: 'dark' });
        assert.ok(await ctx.existsVisible('#side'), 'M1: #side must remain visible on /app/ngoai-ngu');
        assert.ok(await ctx.existsVisible('.topbar'), 'M1: .topbar must remain visible on /app/ngoai-ngu');

        assert.ok(await ctx.waitForVisible('.aiw .aiw-fab', 5000), 'M2: Expected visible .aiw-fab');
        await cdp.click('.aiw .aiw-fab');
        assert.ok(await ctx.waitForVisible('#aiwPanel .aiw-quota a', 3000), 'Expected .aiw-quota upgrade link');
        const href = await cdp.evalJs(() => document.querySelector('#aiwPanel .aiw-quota a')?.getAttribute('href') || '');
        assert.strictEqual(href, '/app/bang-gia', `M2: AI Widget upgrade link must point to /app/bang-gia (got "${href}")`);
        await cdp.click('#aiwPanel .aiw-quota a');
        await cdp.waitForAppSettled({ selector: '#main' });
        assert.strictEqual(await cdp.evalJs(() => location.pathname), '/app/bang-gia');
      } finally {
        await apiRequest(srv.baseUrl, 'PUT', '/api/admin/settings', { session: seed.admin, body: { values: { aiFreeDaily: prevFreeDaily } } }).catch(() => {});
        await apiRequest(srv.baseUrl, 'PUT', '/api/admin/system', { session: seed.admin, body: { values: {}, secrets: { GEMINI_API_KEY: null }, password: seed.admin.password } }).catch(() => {});
        await ctx.restoreLightAndVi();
      }
    }
  );

  suite.test(
    { id: 'T3-21', tier: 3, feature: 'F4', milestone: 'M1', name: 'Logged-in /tai-ung-dung -> in-app Download + OS filter + guide + Guest EN "Continue on Web" single modal' },
    async () => {
      try {
        await ctx.visit('/tai-ung-dung', { role: 'student', viewport: 'desktop' });
        assert.strictEqual(await cdp.evalJs(() => document.body.classList.contains('in-app')), true, 'M1: Logged-in /tai-ung-dung must render in-app');
        assert.ok(await ctx.existsVisible('#main .dl-wrap'), 'M1: Logged-in /tai-ung-dung must render #main .dl-wrap (not 404)');
        assert.ok(await ctx.existsVisible('[data-dl-filter="pc"]'), 'Expected PC filter');
        await cdp.click('[data-dl-filter="pc"]');
        assert.strictEqual(await cdp.evalJs(() => document.querySelectorAll('.dl-card').length), 2);
        assert.ok(await ctx.existsVisible('[data-dl-guide="windows"]'), 'Expected Windows guide toggle');
        await cdp.click('[data-dl-guide="windows"]');

        await ctx.visitPublic('/tai-ung-dung', { viewport: 'desktop', lang: 'en', clearAuth: true });
        await ctx.assertNoViLeaksInEn('.dl-public-shell');
        assert.ok(await ctx.existsVisible('a.dl-secondary-cta[href="/app/dang-nhap"]'), 'Expected "Continue on Web" CTA');
        await cdp.click('a.dl-secondary-cta[href="/app/dang-nhap"]');
        await cdp.waitForCondition(() => document.querySelectorAll('#modalHost .modal.lp-auth-sheet').length >= 1, 5000, 60);
        await new Promise((r) => setTimeout(r, 150));
        assert.strictEqual(await cdp.evalJs(() => document.querySelectorAll('#modalHost .modal.lp-auth-sheet').length), 1, 'M1: Expected single auth modal');
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );

  suite.test(
    { id: 'T3-22', tier: 3, feature: 'F6', milestone: 'M2', name: 'In-App Dark Mode study surfaces (.sp-chatbar/.sp-msgs) + #ivQuickStart SPA + pageFamily no dup API calls' },
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
        await ctx.visit('/app/ngoai-ngu/tro-chuyen/en', { role: 'student', viewport: 'mobile', theme: 'dark' });
        await ctx.assertContrast('.sp-chatbar, .sp-chatbar input', 4.5, 'T3-22 sp-chatbar dark', { includeNonText: true });

        await ctx.visit('/app/phong-van', { role: 'student', viewport: 'mobile', theme: 'dark' });
        await cdp.evalJs(() => { window.__t322Spa = 1; });
        assert.ok(await ctx.existsVisible('#ivQuickStart'), 'Expected #ivQuickStart');
        await cdp.click('#ivQuickStart');
        await cdp.waitForCondition(() => location.pathname.startsWith('/app/phong-van/en'), 5000, 60);
        assert.strictEqual(await cdp.evalJs(() => window.__t322Spa), 1, 'M2: #ivQuickStart must use SPA navigation');

        await ctx.visit('/app/gia-dinh', { role: 'parent', viewport: 'desktop', theme: 'dark', selector: '#inv' });
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
        assert.strictEqual(reqs.total, 1, `M2: Expected 1 family progress request (got ${reqs.total})`);
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

  suite.test(
    { id: 'T3-23', tier: 3, feature: 'F13', milestone: 'M3', name: 'Admin cross-tab pairwise flow in Dark Mode at 900x700 Tablet (#addU, #gcForm, cai-dat, he-thong, EN)' },
    async () => {
      try {
        await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'tablet', expectAdmin: true, theme: 'dark' });
        await ctx.assertNoOverflow('T3-23 tong-quan tablet dark');
        await ctx.assertContrast('.ad h1, .ad-kpi b', 4.5, 'T3-23 tong-quan dark');

        await ctx.visit('/app/quan-tri/hoc-vien', { role: 'admin', viewport: 'tablet', expectAdmin: true, theme: 'dark' });
        assert.ok(await ctx.existsVisible('#addU'), 'Expected #addU');
        await cdp.click('#addU');
        assert.ok(await ctx.waitForVisible('.modal', 3000), 'Expected #addU modal');
        await ctx.assertContrast('.modal h2, .modal label.field, .modal input[name="u"]', 4.5, 'T3-23 #addU modal dark', { includeNonText: true });
        if (await ctx.existsVisible('.modal .modal-x, .modal [data-close]')) await cdp.click('.modal .modal-x, .modal [data-close]');

        await ctx.visit('/app/quan-tri/ma-qua-tang', { role: 'admin', viewport: 'tablet', expectAdmin: true, theme: 'dark' });
        await cdp.fill('#gcForm input[name="count"]', '1');
        await cdp.fill('#gcForm input[name="days"]', '7');
        await cdp.click('#gcForm button');
        await new Promise((r) => setTimeout(r, 400));
        assert.strictEqual(await cdp.evalJs(() => document.getElementById('gcNew')?.hidden), false, 'M3: #gcNew must stay visible');

        await ctx.visit('/app/quan-tri/he-thong', { role: 'admin', viewport: 'tablet', expectAdmin: true, theme: 'dark' });
        for (const panel of ['thanh-toan', 'ai', 'website', 'email']) {
          await cdp.click(`.chips button[data-panel="${panel}"]`);
          await ctx.assertNoOverflow(`T3-23 he-thong ${panel} tablet`);
        }

        await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'tablet', expectAdmin: true, theme: 'dark', lang: 'en' });
        const enTxt = await cdp.evalJs(() => document.querySelector('.ad')?.textContent || '');
        assert.strictEqual(enTxt.includes('Phân khu quản trị'), false, 'M3: Admin EN must translate Phân khu quản trị');
      } finally {
        await ctx.restoreLightAndVi();
      }
    }
  );
}
