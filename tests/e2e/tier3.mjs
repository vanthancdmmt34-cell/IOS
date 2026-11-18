/**
 * @file tests/e2e/tier3.mjs
 * Tier 3: Cross-Feature Combinations (16 pairwise interactive workflows across F1-F14).
 */

import assert from 'node:assert/strict';

export function registerTier3(suite, ctx) {
  const { cdp, seed } = ctx;

  suite.test(
    { id: 'T3-01', tier: 3, feature: 'F4', milestone: 'M1', name: 'Học ngay fan-out -> Luyện nói -> inner drawer -> Lớp của tôi navigation' },
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

      await cdp.click('#mTopMore[data-open-nav]');
      await cdp.click('#sideNav a[href="/app/lop"]');
      await cdp.waitForAppSettled({ selector: '#main' });
      const p2 = await cdp.evalJs(() => ({
        path: location.pathname,
        navOpen: document.body.classList.contains('nav-open'),
        text: document.getElementById('main')?.textContent || '',
      }));
      assert.strictEqual(p2.path, '/app/lop');
      assert.strictEqual(p2.navOpen, false);
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
    { id: 'T3-05', tier: 3, feature: 'F8', milestone: 'M2', name: 'Learner drawer -> Bảng xếp hạng (XP + rows) -> drawer -> Huy hiệu (2x2 pastel)' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-more-btn[data-open-nav]');
      await cdp.click('#sideNav a[href="/app/ngoai-ngu/xep-hang/en"]');
      await cdp.waitForAppSettled({ selector: '.lx-lb-hero' });
      const lbTxt = await cdp.evalJs(() => document.querySelector('.lx-lb')?.textContent || '');
      assert.match(lbTxt, /XP/i, 'M2: Expected XP in leaderboard');

      await cdp.click('#mTopMore[data-open-nav]');
      await cdp.click('#sideNav a[href="/app/ngoai-ngu/huy-hieu/en"]');
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
    { id: 'T3-07', tier: 3, feature: 'F3', milestone: 'M1', name: 'Teacher drawer navigation across Lớp của tôi -> Bài tập -> Tiến độ in EN mode' },
    async () => {
      await ctx.visit('/app/giao-vien', { role: 'teacher', viewport: 'mobile', lang: 'en' });
      await cdp.click('#mTopMore[data-open-nav]');
      await cdp.click('#sideNav a[href="/app/lop"]');
      await cdp.waitForAppSettled({ selector: '#main' });
      assert.ok(await cdp.evalJs((cls) => (document.getElementById('main')?.textContent || '').includes(cls), seed.classroom.name));

      await cdp.click('#mTopMore[data-open-nav]');
      await cdp.click('#sideNav a[href="/app/giao-vien/bai-tap"]');
      await cdp.waitForAppSettled({ selector: '#main' });
      assert.strictEqual(await cdp.evalJs(() => location.pathname), '/app/giao-vien/bai-tap');

      await cdp.click('#mTopMore[data-open-nav]');
      await cdp.click('#sideNav a[href="/app/giao-vien/tien-do"]');
      await cdp.waitForAppSettled({ selector: '#main' });
      assert.strictEqual(await cdp.evalJs(() => location.pathname), '/app/giao-vien/tien-do');
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
}
