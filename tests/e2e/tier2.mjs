/**
 * @file tests/e2e/tier2.mjs
 * Tier 2: Boundary & Corner Cases (70 tests, >= 5 per feature F1-F14).
 */

import assert from 'node:assert/strict';
import { ADMIN_ROUTES } from './helpers.mjs';
import { assertWorkspaceFilesUntouched } from './server-seed.mjs';

export function registerTier2(suite, ctx) {
  const { cdp, srv, seed } = ctx;

  // ================= F1: Core Line Icons & i18n Boundaries =================
  suite.test(
    { id: 'T2-F1-01', tier: 2, feature: 'F1', milestone: 'M1', name: 'Rapid VI -> EN -> VI switch leaves zero stale EN labels in #mTab' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile', lang: 'en' });
      const enLabels = await cdp.evalJs(() => [...document.querySelectorAll('#mTab .mtab-lbl')].map((e) => e.textContent.trim()));
      assert.strictEqual(enLabels[0], 'Overview');
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile', lang: 'vi' });
      const viLabels = await cdp.evalJs(() => [...document.querySelectorAll('#mTab .mtab-lbl')].map((e) => e.textContent.trim()));
      assert.strictEqual(viLabels[0], 'Tổng quan');
    }
  );

  suite.test(
    { id: 'T2-F1-02', tier: 2, feature: 'F1', milestone: 'M1', name: 'EN mode + dark theme preserves valid stroke SVGs and html[data-theme=dark]' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile', lang: 'en', theme: 'dark' });
      const res = await cdp.evalJs(() => ({
        theme: document.documentElement.dataset.theme || '',
        lang: document.documentElement.lang,
        svgs: document.querySelectorAll('#mTab svg.line-ic').length,
      }));
      assert.strictEqual(res.theme, 'dark');
      assert.strictEqual(res.lang, 'en');
      assert.ok(res.svgs >= 5);
      // Restore light theme for subsequent tests
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile', lang: 'vi', theme: 'light' });
    }
  );

  suite.test(
    { id: 'T2-F1-03', tier: 2, feature: 'F1', milestone: 'M1', name: 'EN mode preserves literal @username in quick account menu' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile', lang: 'en' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      const sub = await cdp.evalJs(() => document.querySelector('#mAcctSheet .m-acct-who small')?.textContent.trim() || '');
      assert.ok(sub.includes('@e2e_student'), `Username must stay literal in EN mode, got "${sub}"`);
    }
  );

  suite.test(
    { id: 'T2-F1-04', tier: 2, feature: 'F1', milestone: 'M1', name: '/app/cai-dat daily goal stepper clamps at upper bound 20 in EN mode' },
    async () => {
      await ctx.visit('/app/cai-dat', { role: 'student', viewport: 'mobile', lang: 'en' });
      for (let i = 0; i < 24; i++) {
        await cdp.evalJs(() => document.querySelector('[data-st-goal="1"]')?.click());
      }
      await new Promise((r) => setTimeout(r, 80));
      const val = await cdp.evalJs(() => parseInt(document.getElementById('stGoalVal')?.textContent || '0', 10));
      assert.strictEqual(val, 20, `Goal must clamp at 20 (got ${val})`);
    }
  );

  suite.test(
    { id: 'T2-F1-05', tier: 2, feature: 'F1', milestone: 'M3', name: 'Admin song-ngu [data-i18n="off"] keeps Vietnamese source keys untranslated in EN mode' },
    async () => {
      await ctx.visit('/app/quan-tri/song-ngu', { role: 'admin', viewport: 'mobile', lang: 'en', expectAdmin: true });
      await cdp.fill('#q', 'Tổng quan');
      await new Promise((r) => setTimeout(r, 300));
      const uiText = await cdp.evalJs(() => document.getElementById('ui')?.textContent || '');
      assert.ok(uiText.includes('Tổng quan'), 'Source Vietnamese key inside #ui[data-i18n="off"] must stay untranslated');
    }
  );

  // ================= F2: Consolidated Navigation & Drawer Removal Boundaries =================
  suite.test(
    { id: 'T2-F2-01', tier: 2, feature: 'F2', milestone: 'M1', name: 'Narrow 320x844 mobile has no ••• triggers, hidden #side/#scrim, and zero overflow on /app/en & /app/ca-nhan hub' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'narrow' });
      await ctx.assertNoOverflow('T2-F2-01 student home 320px');
      const home = await cdp.evalJs(() => ({
        hasMore: !!document.querySelector('.hm-more-btn, #mTopMore, [data-open-nav]'),
        sideDisp: getComputedStyle(document.getElementById('side')).display,
        scrimDisp: getComputedStyle(document.getElementById('scrim')).display,
      }));
      assert.strictEqual(home.hasMore, false);
      assert.strictEqual(home.sideDisp, 'none');
      assert.strictEqual(home.scrimDisp, 'none');

      await ctx.visit('/app/ca-nhan', { role: 'student', viewport: 'narrow' });
      await ctx.assertNoOverflow('T2-F2-01 ca-nhan hub 320px');
      assert.ok(await ctx.existsVisible('.pf-hub-nav'), 'Expected visible Cá nhân hub on 320px');
      assert.ok(await ctx.existsVisible('.pf-sys-nav'), 'Expected visible Hệ thống hub on 320px');
    }
  );

  suite.test(
    { id: 'T2-F2-02', tier: 2, feature: 'F2', milestone: 'M1', name: 'Clicking scrim or pressing Escape closes open #mAcctFan cleanly' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('#mTabAcctBtn');
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('mAcctFan')?.hidden), false);
      await cdp.click('[data-close-acct-fan]');
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('mAcctFan')?.hidden), true);

      await cdp.click('#mTabAcctBtn');
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('mAcctFan')?.hidden), false);
      await cdp.evalJs(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
      await new Promise((r) => setTimeout(r, 80));
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('mAcctFan')?.hidden), true);
    }
  );

  suite.test(
    { id: 'T2-F2-03', tier: 2, feature: 'F2', milestone: 'M1', name: 'Repeated 3x #mTabAcctBtn fan-out open/close toggling remains deterministic' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      for (let i = 0; i < 3; i++) {
        await cdp.click('#mTabAcctBtn');
        assert.strictEqual(await cdp.evalJs(() => document.getElementById('mAcctFan')?.hidden), false);
        await cdp.click('#mTabAcctBtn');
        assert.strictEqual(await cdp.evalJs(() => document.getElementById('mAcctFan')?.hidden), true);
      }
    }
  );

  suite.test(
    { id: 'T2-F2-04', tier: 2, feature: 'F2', milestone: 'M1', name: 'Parent role fits 320x844 (no overlap on #mAcctFan) and 1440x900 desktop #sideNav cleanly' },
    async () => {
      await ctx.visit('/app/gia-dinh', { role: 'parent', viewport: 'narrow' });
      await ctx.assertNoOverflow('T2-F2-04 parent 320px');
      await cdp.click('#mTabAcctBtn');
      await new Promise((r) => setTimeout(r, 180));
      await ctx.assertFanMenuGeometry('mTabAcctBtn', { expectedCount: 4 });

      await ctx.visit('/app/gia-dinh', { role: 'parent', viewport: 'desktop' });
      await ctx.assertNoOverflow('T2-F2-04 parent 1440px');
      const labels = await cdp.evalJs(() => [...document.querySelectorAll('#sideNav .nav-cat-lbl')].map((e) => e.textContent.trim()));
      assert.deepStrictEqual(labels, ['Học tập', 'Cá nhân', 'Hệ thống']);
    }
  );

  suite.test(
    { id: 'T2-F2-05', tier: 2, feature: 'F2', milestone: 'M1', name: 'zeroStudent on /app/chon-mon without subject renders fans, #mAcctSheet, /app/ca-nhan, and #sideNav without "undefined"' },
    async () => {
      await ctx.visit('/app/chon-mon', { role: 'zeroStudent', viewport: 'mobile', subject: null });
      await cdp.click('#mTabLearnBtn');
      await new Promise((r) => setTimeout(r, 180));
      await ctx.assertFanMenuGeometry('mTabLearnBtn', { expectedCount: 5 });
      await cdp.click('#mTabAcctBtn');
      await new Promise((r) => setTimeout(r, 180));
      await ctx.assertFanMenuGeometry('mTabAcctBtn', { expectedCount: 5 });
      const badHrefs = await cdp.evalJs(() =>
        [...document.querySelectorAll('#mLearnFan a, #mAcctFan a, #mAcctSheet a, #sideNav a')]
          .map((a) => a.getAttribute('href') || '')
          .filter((h) => h.includes('undefined') || h.includes('null'))
      );
      assert.deepStrictEqual(badHrefs, [], `Found broken hrefs when subject is null: ${JSON.stringify(badHrefs)}`);
      await ctx.visit('/app/ca-nhan', { role: 'zeroStudent', viewport: 'mobile', subject: null });
      const hubText = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(!hubText.includes('undefined') && hubText.includes('Chọn ngoại ngữ'));
    }
  );

  // ================= F3: Teacher Consolidated Navigation & Routes Boundaries =================
  suite.test(
    { id: 'T2-F3-01', tier: 2, feature: 'F3', milestone: 'M1', name: 'Teacher #mAcctSheet and /app/ca-nhan hub fit narrow 320x844 without horizontal overflow' },
    async () => {
      await ctx.visit('/app/giao-vien', { role: 'teacher', viewport: 'narrow' });
      await ctx.assertNoOverflow('T2-F3-01 teacher home 320px');
      await cdp.click('#mTopAcct');
      const rect = await cdp.evalJs(() => {
        const c = document.querySelector('#mAcctSheet .m-acct-card');
        const r = c?.getBoundingClientRect();
        return { hidden: document.getElementById('mAcctSheet')?.hidden ?? true, left: r?.left ?? -1, right: r?.right ?? 999, innerW: window.innerWidth };
      });
      assert.strictEqual(rect.hidden, false);
      assert.ok(rect.left >= 0 && rect.right <= rect.innerW + 1, `Teacher sheet overflows 320px (${rect.left}..${rect.right})`);
      await ctx.visit('/app/ca-nhan', { role: 'teacher', viewport: 'narrow' });
      await ctx.assertNoOverflow('T2-F3-01 teacher ca-nhan 320px');
    }
  );

  suite.test(
    { id: 'T2-F3-02', tier: 2, feature: 'F3', milestone: 'M1', name: 'Teacher #mAcctSheet & desktop #sideNav stay free of student routes even when pl:subject is polluted' },
    async () => {
      await ctx.visit('/app/giao-vien', { role: 'teacher', viewport: 'mobile', subject: 'ja' });
      await cdp.click('#mTopAcct');
      const mHrefs = await cdp.evalJs(() => [...document.querySelectorAll('#mAcctSheet a')].map((a) => a.getAttribute('href') || ''));
      assert.ok(!mHrefs.some((h) => h.includes('chung-nhan') || h.includes('xep-hang')), `Teacher sheet leaked student route: ${JSON.stringify(mHrefs)}`);
      await ctx.visit('/app/giao-vien', { role: 'teacher', viewport: 'desktop', subject: 'ja' });
      const dHrefs = await cdp.evalJs(() => [...document.querySelectorAll('#sideNav a')].map((a) => a.getAttribute('href') || ''));
      assert.ok(!dHrefs.some((h) => h.includes('phong-van') || h.includes('toeic') || h.includes('chung-nhan')), `Teacher #sideNav leaked student route: ${JSON.stringify(dHrefs)}`);
      // Clean subject back to null for teacher
      await cdp.evalJs(() => localStorage.removeItem('pl:subject'));
    }
  );

  suite.test(
    { id: 'T2-F3-03', tier: 2, feature: 'F3', milestone: 'M1', name: 'Teacher /app/giao-vien/bai-tap has zero horizontal overflow at 320x844' },
    async () => {
      await ctx.visit('/app/giao-vien/bai-tap', { role: 'teacher', viewport: 'narrow' });
      await ctx.assertNoOverflow('T2-F3-03 teacher bai-tap 320px');
    }
  );

  suite.test(
    { id: 'T2-F3-04', tier: 2, feature: 'F3', milestone: 'M1', name: 'Teacher /app/giao-vien/tien-do has zero horizontal overflow at 320x844' },
    async () => {
      await ctx.visit('/app/giao-vien/tien-do', { role: 'teacher', viewport: 'narrow' });
      await ctx.assertNoOverflow('T2-F3-04 teacher tien-do 320px');
    }
  );

  suite.test(
    { id: 'T2-F3-05', tier: 2, feature: 'F3', milestone: 'M1', name: 'Student visiting /app/giao-vien/bai-tap cannot access teacher management data' },
    async () => {
      await ctx.visit('/app/giao-vien/bai-tap', { role: 'student', viewport: 'mobile' });
      const text = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(/không có quyền|Giáo viên|Đăng nhập/i.test(text) || !text.includes('Giao bài mới'), 'Student must not see teacher assignment creation controls');
    }
  );

  // ================= F4: Student 5-Tab #mTab & "Học ngay" Fan-Out Boundaries =================
  suite.test(
    { id: 'T2-F4-01', tier: 2, feature: 'F4', milestone: 'M1', name: '5-tab #mTab & Học ngay 5-pill fan-out fit 320x844 with zero pairwise overlap & zero clipping' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'narrow' });
      await ctx.assertNoOverflow('T2-F4-01 mTab 320px');
      await cdp.click('#mTabLearnBtn');
      await new Promise((r) => setTimeout(r, 200));
      await ctx.assertNoOverflow('T2-F4-01 learn fan-out 320px');
      const m = await cdp.evalJs(() => {
        const nav = document.getElementById('mTab');
        const nr = nav.getBoundingClientRect();
        const items = [...nav.querySelectorAll(':scope > a, :scope > button')].map((el) => el.getBoundingClientRect());
        let overlap = false;
        for (let i = 1; i < items.length; i++) {
          if (items[i].left < items[i - 1].right - 2) overlap = true;
        }
        return { bottom: nr.bottom, innerH: window.innerHeight, overlap, minW: Math.min(...items.map((x) => x.width)) };
      });
      assert.ok(m.bottom <= m.innerH + 1, `#mTab clipped vertically (${m.bottom} > ${m.innerH})`);
      assert.strictEqual(m.overlap, false, 'Dock tabs overlap at 320px');
      assert.ok(m.minW >= 48, `Tab width too narrow (${m.minW}px)`);
      await ctx.assertFanMenuGeometry('mTabLearnBtn', { expectedCount: 5 });
    }
  );

  suite.test(
    { id: 'T2-F4-02', tier: 2, feature: 'F4', milestone: 'M1', name: 'Tapping backdrop or Escape dismisses Học ngay fan-out menu' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('#mTabLearnBtn');
      const isOpen = () => cdp.evalJs(() => {
        const ctrl = document.getElementById('mTabLearnBtn')?.getAttribute('aria-controls');
        const menu = (ctrl && document.getElementById(ctrl)) || document.querySelector('#mLearnSheet, .m-fan-learn');
        return !!menu && !menu.hidden;
      });
      assert.strictEqual(await isOpen(), true);
      await cdp.evalJs(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
      await new Promise((r) => setTimeout(r, 80));
      assert.strictEqual(await isOpen(), false, 'Escape must close Học ngay fan-out');

      await cdp.click('#mTabLearnBtn');
      assert.strictEqual(await isOpen(), true);
      await cdp.click('[data-close-learn]');
      assert.strictEqual(await isOpen(), false, 'Backdrop click must close Học ngay fan-out');
    }
  );

  suite.test(
    { id: 'T2-F4-03', tier: 2, feature: 'F4', milestone: 'M1', name: 'Opening Học ngay fan-out auto-closes Quick Account Menu or Cá nhân fan-out' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('mAcctSheet')?.hidden), false);
      await cdp.click('#mTabLearnBtn');
      const state = await cdp.evalJs(() => {
        const ctrl = document.getElementById('mTabLearnBtn')?.getAttribute('aria-controls');
        const menu = (ctrl && document.getElementById(ctrl)) || document.querySelector('#mLearnSheet, .m-fan-learn');
        return {
          learnHidden: menu?.hidden ?? true,
          acctHidden: document.getElementById('mAcctSheet')?.hidden ?? true,
        };
      });
      assert.strictEqual(state.learnHidden, false);
      assert.strictEqual(state.acctHidden, true, '#mAcctSheet must close when Học ngay fan-out opens');
    }
  );

  suite.test(
    { id: 'T2-F4-04', tier: 2, feature: 'F4', milestone: 'M1', name: 'Switching to /app/ja dynamically updates Học ngay fan-out hrefs to ja & Sổ tay' },
    async () => {
      await ctx.visit('/app/ja', { role: 'student', viewport: 'mobile', subject: 'ja' });
      await cdp.click('#mTabLearnBtn');
      const hrefs = await cdp.evalJs(() => {
        const ctrl = document.getElementById('mTabLearnBtn')?.getAttribute('aria-controls');
        const menu = (ctrl && document.getElementById(ctrl)) || document.querySelector('#mLearnSheet, .m-fan-learn');
        return menu && !menu.hidden ? [...menu.querySelectorAll('a')].map((a) => a.getAttribute('href')) : [];
      });
      assert.ok(hrefs.includes('/app/ngoai-ngu/ja') && hrefs.includes('/app/ngoai-ngu/luyen-noi/ja') && hrefs.includes('/app/ngoai-ngu/tro-chuyen/ja') && hrefs.includes('/app/so-tay'), `Expected ja hrefs + Sổ tay, got ${JSON.stringify(hrefs)}`);
      // Restore student subject back to en
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile', subject: 'en' });
    }
  );

  suite.test(
    { id: 'T2-F4-05', tier: 2, feature: 'F4', milestone: 'M1', name: 'Active dock state syncs #mTabLearnBtn on /app/ngoai-ngu/on-tap/en and #mTabAcctBtn on /app/ca-nhan' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/on-tap/en', { role: 'student', viewport: 'mobile' });
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('mTabLearnBtn')?.classList.contains('on')), true);
      await ctx.visit('/app/ca-nhan', { role: 'student', viewport: 'mobile' });
      assert.strictEqual(await cdp.evalJs(() => document.querySelector('#mTab [data-mt="ca-nhan"]')?.classList.contains('on')), true);
    }
  );

  suite.test(
    { id: 'T2-F4-06', tier: 2, feature: 'F4', milestone: 'M1', name: 'Dark mode [data-theme="dark"] keeps floating glass #mTab & fan-out legible with zero overflow' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile', theme: 'dark' });
      await ctx.assertNoOverflow('T2-F4-06 dark mTab');
      await cdp.click('#mTabLearnBtn');
      const res = await cdp.evalJs(() => {
        const nav = document.getElementById('mTab');
        const nSt = getComputedStyle(nav);
        const lbl = nav.querySelector('.mtab-lbl');
        const lSt = lbl ? getComputedStyle(lbl) : null;
        const ctrl = document.getElementById('mTabLearnBtn')?.getAttribute('aria-controls');
        const menu = (ctrl && document.getElementById(ctrl)) || document.querySelector('#mLearnSheet, .m-fan-learn');
        const pill = menu?.querySelector('a');
        const pSt = pill ? getComputedStyle(pill) : null;
        return {
          theme: document.documentElement.dataset.theme,
          dockBg: nSt.backgroundColor,
          lblColor: lSt?.color || '',
          pillColor: pSt?.color || '',
          pillBg: pSt?.backgroundColor || '',
          open: !!menu && !menu.hidden,
        };
      });
      assert.strictEqual(res.theme, 'dark');
      assert.ok(res.open, 'Fan-out must open in dark mode');
      assert.notStrictEqual(res.dockBg, 'rgb(255, 255, 255)', 'Dark mode dock must not stay bright solid white');
      assert.notStrictEqual(res.dockBg, res.lblColor, 'Dark mode dock text must contrast against dock background');
      // Restore light theme
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile', theme: 'light' });
    }
  );

  // ================= F5: "Cá nhân" Fan-Out, /app/co-vu & /app/cai-dat Boundaries =================
  suite.test(
    { id: 'T2-F5-01', tier: 2, feature: 'F5', milestone: 'M1', name: 'Cá nhân 5-pill fan-out fits 320x844 with zero pairwise overlap, bottom <= dockTop & >=24px orbs' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'narrow' });
      assert.ok(await ctx.existsVisible('#mTabAcctBtn'), 'Expected #mTabAcctBtn on dock');
      await cdp.click('#mTabAcctBtn');
      await new Promise((r) => setTimeout(r, 200));
      await ctx.assertNoOverflow('T2-F5-01 acct fan-out 320px');
      await ctx.assertFanMenuGeometry('mTabAcctBtn', { expectedCount: 5 });
    }
  );

  suite.test(
    { id: 'T2-F5-02', tier: 2, feature: 'F5', milestone: 'M1', name: 'zeroStudent with 2 stars (< 5) on /app/co-vu cannot go negative when cheering' },
    async () => {
      await ctx.visit('/app/co-vu', { role: 'zeroStudent', viewport: 'mobile' });
      await cdp.click('#hmPetCheerBtn');
      await new Promise((r) => setTimeout(r, 300));
      const stars = await cdp.evalJs(() => Number(document.querySelector('.hm-star-pill b, #hmPetCard [data-pet-stars]')?.textContent.replace(/\D/g, '') || 0));
      assert.strictEqual(stars, 2, `Stars must stay at 2 when insufficient (got ${stars})`);
    }
  );

  suite.test(
    { id: 'T2-F5-03', tier: 2, feature: 'F5', milestone: 'M1', name: '/app/co-vu & /app/ca-nhan both have zero overflow at 320x844' },
    async () => {
      await ctx.visit('/app/co-vu', { role: 'student', viewport: 'narrow' });
      await ctx.assertNoOverflow('T2-F5-03 co-vu 320px');
      await ctx.visit('/app/ca-nhan', { role: 'student', viewport: 'narrow' });
      await ctx.assertNoOverflow('T2-F5-03 ca-nhan 320px');
    }
  );

  suite.test(
    { id: 'T2-F5-04', tier: 2, feature: 'F5', milestone: 'M1', name: '/app/cai-dat theme button toggles light <-> dark and updates #stThemeState' },
    async () => {
      await ctx.visit('/app/cai-dat', { role: 'student', viewport: 'mobile', theme: 'light' });
      await cdp.click('#stThemeBtn');
      const darkState = await cdp.evalJs(() => ({
        theme: document.documentElement.dataset.theme,
        lbl: document.getElementById('stThemeState')?.textContent.trim(),
      }));
      assert.strictEqual(darkState.theme, 'dark');
      assert.strictEqual(darkState.lbl, 'Tối');
      await cdp.click('#stThemeBtn');
      const lightState = await cdp.evalJs(() => ({
        theme: document.documentElement.dataset.theme,
        lbl: document.getElementById('stThemeState')?.textContent.trim(),
      }));
      assert.strictEqual(lightState.theme, 'light');
      assert.strictEqual(lightState.lbl, 'Sáng');
    }
  );

  suite.test(
    { id: 'T2-F5-05', tier: 2, feature: 'F5', milestone: 'M1', name: '/app/cai-dat goal stepper clamps at lower bound 1 & #hmPetExchBtn stays disabled < 100' },
    async () => {
      await ctx.visit('/app/cai-dat', { role: 'student', viewport: 'mobile' });
      for (let i = 0; i < 24; i++) {
        await cdp.evalJs(() => document.querySelector('[data-st-goal="-1"]')?.click());
      }
      await new Promise((r) => setTimeout(r, 80));
      const val = await cdp.evalJs(() => parseInt(document.getElementById('stGoalVal')?.textContent || '0', 10));
      assert.strictEqual(val, 1, `Goal must clamp at 1 (got ${val})`);

      await ctx.visit('/app/co-vu', { role: 'student', viewport: 'mobile' });
      const disabled = await cdp.evalJs(() => document.getElementById('hmPetExchBtn')?.disabled ?? false);
      assert.strictEqual(disabled, true, 'Exchange button must remain disabled when knowledge < 100');
    }
  );

  // ================= F6: Quick Account Menu Boundaries =================
  suite.test(
    { id: 'T2-F6-01', tier: 2, feature: 'F6', milestone: 'M1', name: 'Clicking [data-close-acct] scrim closes #mAcctSheet' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('mAcctSheet')?.hidden), false);
      await cdp.click('#mAcctSheet [data-close-acct]');
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('mAcctSheet')?.hidden), true);
    }
  );

  suite.test(
    { id: 'T2-F6-02', tier: 2, feature: 'F6', milestone: 'M1', name: 'Pressing Escape closes #mAcctSheet' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('mAcctSheet')?.hidden), false);
      await cdp.evalJs(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
      await new Promise((r) => setTimeout(r, 80));
      assert.strictEqual(await cdp.evalJs(() => document.getElementById('mAcctSheet')?.hidden), true);
    }
  );

  suite.test(
    { id: 'T2-F6-03', tier: 2, feature: 'F6', milestone: 'M1', name: '#mAcctSheet fits narrow 320x844 viewport cleanly' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'narrow' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      const rect = await cdp.evalJs(() => {
        const c = document.querySelector('#mAcctSheet .m-acct-card');
        const r = c?.getBoundingClientRect();
        return { left: r?.left ?? -1, right: r?.right ?? 999, innerW: window.innerWidth };
      });
      assert.ok(rect.left >= 0 && rect.right <= rect.innerW + 1, `Quick account sheet overflows 320px (${rect.left}..${rect.right})`);
    }
  );

  suite.test(
    { id: 'T2-F6-04', tier: 2, feature: 'F6', milestone: 'M1', name: 'Clicking Cài đặt inside #mAcctSheet navigates to /app/cai-dat and closes sheet' },
    async () => {
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile' });
      await cdp.click('.hm-top-avatar-wrap[data-open-account="mobile"]');
      await cdp.click('#mAcctSheet a[href="/app/cai-dat"]');
      await cdp.waitForAppSettled({ selector: '#stThemeBtn' });
      const res = await cdp.evalJs(() => ({
        path: location.pathname,
        hidden: document.getElementById('mAcctSheet')?.hidden,
      }));
      assert.strictEqual(res.path, '/app/cai-dat');
      assert.strictEqual(res.hidden, true);
    }
  );

  suite.test(
    { id: 'T2-F6-05', tier: 2, feature: 'F6', milestone: 'M1', name: 'Teacher #mAcctSheet shows owl avatar & @e2e_teacher role label' },
    async () => {
      await ctx.visit('/app/giao-vien', { role: 'teacher', viewport: 'mobile' });
      await cdp.click('#mTopAcct');
      const info = await cdp.evalJs(() => ({
        src: document.querySelector('#mAcctSheet .m-acct-av')?.getAttribute('src') || '',
        sub: document.querySelector('#mAcctSheet .m-acct-who small')?.textContent.trim() || '',
      }));
      assert.ok(info.src.includes('chibi-owl.webp'));
      assert.ok(info.sub.includes('@e2e_teacher') && info.sub.includes('Giáo viên'));
    }
  );

  // ================= F7: Certificates Mobile Boundaries =================
  suite.test(
    { id: 'T2-F7-01', tier: 2, feature: 'F7', milestone: 'M2', name: 'zeroStudent with 0% A1 shows locked/in-progress cert CTA instead of "Đã đạt"' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/chung-nhan-cua-toi/en', { role: 'zeroStudent', viewport: 'mobile' });
      const state = await cdp.evalJs(() => ({
        tag: document.querySelector('.lx-cert-feat-tag')?.textContent.trim() || '',
        cta: document.querySelector('.lx-cert-feat-btn')?.textContent.trim() || '',
        href: document.querySelector('.lx-cert-feat-btn')?.getAttribute('href') || '',
      }));
      assert.notStrictEqual(state.tag, 'Đã đạt');
      assert.strictEqual(state.cta, 'Học tiếp');
      assert.ok(state.href.includes('/app/ngoai-ngu/en/a1'));
    }
  );

  suite.test(
    { id: 'T2-F7-02', tier: 2, feature: 'F7', milestone: 'M2', name: 'Certificates view on narrow 320x844 has zero horizontal overflow' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/chung-nhan-cua-toi/en', { role: 'student', viewport: 'narrow' });
      await ctx.assertNoOverflow('T2-F7-02 certs 320px');
    }
  );

  suite.test(
    { id: 'T2-F7-03', tier: 2, feature: 'F7', milestone: 'M2', name: 'Invalid language /app/ngoai-ngu/chung-nhan-cua-toi/xx renders clean empty state' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/chung-nhan-cua-toi/xx', { role: 'student', viewport: 'mobile' });
      const text = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(text.includes('Không tìm thấy khóa học'));
    }
  );

  suite.test(
    { id: 'T2-F7-04', tier: 2, feature: 'F7', milestone: 'M2', name: 'Unearned certificate /app/ngoai-ngu/chung-nhan/en/c1 refuses issuance cleanly' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/chung-nhan/en/c1', { role: 'student', viewport: 'mobile' });
      const text = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(!/LX-EN-C1-/.test(text), 'Must not issue unearned C1 certificate code');
    }
  );

  suite.test(
    { id: 'T2-F7-05', tier: 2, feature: 'F7', milestone: 'M2', name: 'Certificates view in EN mode translates featured card without overflow' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/chung-nhan-cua-toi/en', { role: 'student', viewport: 'mobile', lang: 'en' });
      await ctx.assertNoOverflow('T2-F7-05 certs EN');
      const text = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(/Certificate|Earned|View certificate/i.test(text), 'Expected EN certificate labels');
    }
  );

  // ================= F8: Leaderboard Mobile Boundaries =================
  suite.test(
    { id: 'T2-F8-01', tier: 2, feature: 'F8', milestone: 'M2', name: 'zeroStudent with 0 passed lessons displays fallback rank cleanly' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/xep-hang/en', { role: 'zeroStudent', viewport: 'mobile' });
      const hero = await cdp.evalJs(() => document.querySelector('.lx-lb-hero')?.textContent || '');
      assert.match(hero, /#[5-9]|#\d{2}/, `Expected rank >= #5 for zeroStudent, got "${hero}"`);
    }
  );

  suite.test(
    { id: 'T2-F8-02', tier: 2, feature: 'F8', milestone: 'M2', name: 'Leaderboard on narrow 320x844 has zero horizontal overflow' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/xep-hang/en', { role: 'student', viewport: 'narrow' });
      await ctx.assertNoOverflow('T2-F8-02 leaderboard 320px');
    }
  );

  suite.test(
    { id: 'T2-F8-03', tier: 2, feature: 'F8', milestone: 'M2', name: 'Leaderboard row right edge stays inside 320px viewport' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/xep-hang/en', { role: 'student', viewport: 'narrow' });
      const maxRight = await cdp.evalJs(() =>
        Math.max(...[...document.querySelectorAll('.lx-lb-row > *')].map((el) => el.getBoundingClientRect().right))
      );
      assert.ok(maxRight <= 320, `Leaderboard row child overflows 320px (right=${maxRight})`);
    }
  );

  suite.test(
    { id: 'T2-F8-04', tier: 2, feature: 'F8', milestone: 'M2', name: 'Empty leaderboard (/app/ngoai-ngu/xep-hang/es) renders empty message without error' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/xep-hang/es', { role: 'student', viewport: 'mobile' });
      const text = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(text.includes('Chưa có ai đạt bài nào'));
      // Restore student subject back to en
      await ctx.visit('/app/en', { role: 'student', viewport: 'mobile', subject: 'en' });
    }
  );

  suite.test(
    { id: 'T2-F8-05', tier: 2, feature: 'F8', milestone: 'M2', name: 'Leaderboard in EN mode translates hero and keeps XP format' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/xep-hang/en', { role: 'student', viewport: 'mobile', lang: 'en' });
      const text = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(/ranked #4|Leaderboard/i.test(text), 'Expected EN leaderboard hero text');
      assert.match(text, /XP/i, 'M2: Expected XP in EN leaderboard');
    }
  );

  // ================= F9: Badges Mobile Boundaries =================
  suite.test(
    { id: 'T2-F9-01', tier: 2, feature: 'F9', milestone: 'M2', name: 'zeroStudent has 0 unlocked badges and all show "Chưa mở khóa"' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/huy-hieu/en', { role: 'zeroStudent', viewport: 'mobile' });
      const info = await cdp.evalJs(() => ({
        okCount: document.querySelectorAll('.cds-ach-done.is-ok').length,
        lockCount: document.querySelectorAll('.cds-ach-done.is-lock').length,
      }));
      assert.strictEqual(info.okCount, 0, 'zeroStudent should have 0 unlocked badges');
      assert.ok(info.lockCount >= 12);
    }
  );

  suite.test(
    { id: 'T2-F9-02', tier: 2, feature: 'F9', milestone: 'M2', name: 'Badges 2x2 grid fits narrow 320x844 with zero horizontal overflow' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/huy-hieu/en', { role: 'student', viewport: 'narrow' });
      await ctx.assertNoOverflow('T2-F9-02 badges 320px');
    }
  );

  suite.test(
    { id: 'T2-F9-03', tier: 2, feature: 'F9', milestone: 'M2', name: '.cds-prog inside badge cards stays hidden on narrow 320x844' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/huy-hieu/en', { role: 'student', viewport: 'narrow' });
      const vis = await cdp.evalJs(() =>
        [...document.querySelectorAll('.cds-ach .cds-prog')].filter((p) => getComputedStyle(p).display !== 'none').length
      );
      assert.strictEqual(vis, 0, 'M2: .cds-prog inside .cds-ach must be hidden on 320px mobile');
    }
  );

  suite.test(
    { id: 'T2-F9-04', tier: 2, feature: 'F9', milestone: 'M2', name: 'Invalid course /app/ngoai-ngu/huy-hieu/xx renders clean not-found state' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/huy-hieu/xx', { role: 'student', viewport: 'mobile' });
      const text = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(text.includes('Không tìm thấy khóa học'));
    }
  );

  suite.test(
    { id: 'T2-F9-05', tier: 2, feature: 'F9', milestone: 'M2', name: 'Badges page in EN mode translates intro and status pills without overflow' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/huy-hieu/en', { role: 'student', viewport: 'mobile', lang: 'en' });
      await ctx.assertNoOverflow('T2-F9-05 badges EN');
      const text = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(/Badge|Unlocked|Locked/i.test(text));
    }
  );

  // ================= F10: Classroom Test Taking Boundaries =================
  suite.test(
    { id: 'T2-F10-01', tier: 2, feature: 'F10', milestone: 'M2', name: 'Submitting 2-question testBoundary with 0 selections grades 0/10 cleanly' },
    async () => {
      await ctx.visit(`/app/kiem-tra-lop/${seed.testBoundary.id}`, { role: 'student', viewport: 'mobile' });
      await cdp.click('#start');
      await new Promise((r) => setTimeout(r, 200));
      if (await ctx.existsVisible('.modal [data-ok]')) await cdp.click('.modal [data-ok]');
      await cdp.waitForCondition(() => !!document.getElementById('tf'), 6000, 80);

      const hasNext = await cdp.evalJs(() =>
        [...document.querySelectorAll('#tf button, #main button')].some((b) => b.textContent.includes('Tiếp theo'))
      );
      assert.ok(hasNext, 'M2: Expected "Tiếp theo" button on Q1/2');
      await cdp.clickText('#tf button, #main button', 'Tiếp theo');
      await cdp.clickText('#tf button, #main button', 'Nộp bài');
      await cdp.waitForCondition(() => !!document.querySelector('.modal [data-ok]'), 4000, 60);
      await cdp.click('.modal [data-ok]');
      await cdp.waitForCondition(() => (document.getElementById('main')?.textContent || '').includes('Đã nộp bài'), 6000, 80);
      const txt = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(txt.includes('0/10'), `Expected 0/10 on empty submit, got "${txt.slice(0, 200)}"`);
    }
  );

  suite.test(
    { id: 'T2-F10-02', tier: 2, feature: 'F10', milestone: 'M2', name: 'testBoundary attempt 2 updates counter Câu 1/2 -> Câu 2/2 and bar 50% -> 100%' },
    async () => {
      await ctx.visit(`/app/kiem-tra-lop/${seed.testBoundary.id}`, { role: 'student', viewport: 'mobile' });
      await cdp.click('#start');
      await new Promise((r) => setTimeout(r, 200));
      if (await ctx.existsVisible('.modal [data-ok]')) await cdp.click('.modal [data-ok]');
      await cdp.waitForCondition(() => !!document.getElementById('tf'), 6000, 80);

      const q1 = await cdp.evalJs(() => ({
        cnt: document.querySelector('.lx-ex-cnt')?.textContent.trim() || '',
        w: document.querySelector('.lx-ex-prog i')?.style.width || '',
      }));
      assert.ok(q1.cnt.includes('Câu 1/2'), `M2: Expected Câu 1/2, got "${q1.cnt}"`);
      assert.strictEqual(q1.w, '50%');

      await cdp.clickText('#tf button, #main button', 'Tiếp theo');
      const q2 = await cdp.evalJs(() => ({
        cnt: document.querySelector('.lx-ex-cnt')?.textContent.trim() || '',
        w: document.querySelector('.lx-ex-prog i')?.style.width || '',
      }));
      assert.ok(q2.cnt.includes('Câu 2/2'), `M2: Expected Câu 2/2, got "${q2.cnt}"`);
      assert.strictEqual(q2.w, '100%');
    }
  );

  suite.test(
    { id: 'T2-F10-03', tier: 2, feature: 'F10', milestone: 'M2', name: 'Classroom test active screen fits 320x844 with zero horizontal overflow' },
    async () => {
      await ctx.visit(`/app/kiem-tra-lop/${seed.testBoundary.id}`, { role: 'student', viewport: 'narrow' });
      await cdp.click('#start');
      await new Promise((r) => setTimeout(r, 200));
      if (await ctx.existsVisible('.modal [data-ok]')) await cdp.click('.modal [data-ok]');
      await cdp.waitForCondition(() => !!document.getElementById('tf'), 6000, 80);
      await ctx.assertNoOverflow('T2-F10-03 active test 320px');
      const hasNext = await cdp.evalJs(() =>
        [...document.querySelectorAll('#tf button, #main button')].some((b) => b.textContent.includes('Tiếp theo'))
      );
      assert.ok(hasNext, 'M2: Expected "Tiếp theo" button on Q1/2');
      // Finish attempt 2 so maxAttempts boundary test runs next
      await cdp.clickText('#tf button, #main button', 'Tiếp theo');
      await cdp.clickText('#tf button, #main button', 'Nộp bài');
      await cdp.waitForCondition(() => !!document.querySelector('.modal [data-ok]'), 4000, 60);
      await cdp.click('.modal [data-ok]');
      await cdp.waitForCondition(() => (document.getElementById('main')?.textContent || '').includes('Đã nộp bài'), 6000, 80);
    }
  );

  suite.test(
    { id: 'T2-F10-04', tier: 2, feature: 'F10', milestone: 'M2', name: 'Exhausting maxAttempts (2/2) on testBoundary prevents starting a 3rd attempt' },
    async () => {
      await ctx.visit(`/app/kiem-tra-lop/${seed.testBoundary.id}`, { role: 'student', viewport: 'mobile' });
      const info = await cdp.evalJs(() => {
        const btn = document.getElementById('start');
        return {
          hasStart: !!btn,
          disabled: !!btn?.disabled,
          text: document.getElementById('main')?.textContent || '',
        };
      });
      assert.ok(!info.hasStart || info.disabled || /hết lượt|đủ.*lượt/i.test(info.text), 'Must block starting beyond maxAttempts');
    }
  );

  suite.test(
    { id: 'T2-F10-05', tier: 2, feature: 'F10', milestone: 'Core', name: 'Invalid test ID /app/kiem-tra-lop/999999 renders graceful error state' },
    async () => {
      await ctx.visit('/app/kiem-tra-lop/999999', { role: 'student', viewport: 'mobile' });
      const text = await cdp.evalJs(() => document.getElementById('main')?.textContent || '');
      assert.ok(text.includes('Không mở được bài kiểm tra'));
    }
  );

  // ================= F11: Admin Unified Navigation Boundaries =================
  suite.test(
    { id: 'T2-F11-01', tier: 2, feature: 'F11', milestone: 'M3', name: 'Admin mobile shell & 5-tab dock fit narrow 320x844 with zero overflow and zero .sk-ic' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'narrow', expectAdmin: true });
      await ctx.assertNoOverflow('T2-F11-01 admin shell 320px');
      const v = await ctx.inspectAdminVisuals();
      assert.strictEqual(v.skIcCount, 0);
    }
  );

  suite.test(
    { id: 'T2-F11-02', tier: 2, feature: 'F11', milestone: 'M3', name: 'Admin .ad-subnav renders sibling category tabs cleanly on multi-page pillars' },
    async () => {
      await ctx.visit('/app/quan-tri/hoc-vien', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const items = await cdp.evalJs(() => [...document.querySelectorAll('.ad-subnav .ad-subnav-it')].map((a) => a.textContent.trim()));
      assert.deepStrictEqual(items, ['Tài khoản người dùng', 'Giáo viên', 'Lớp học và giấy phép']);
    }
  );

  suite.test(
    { id: 'T2-F11-03', tier: 2, feature: 'F11', milestone: 'M3', name: 'Clicking Admin .ad-subnav link navigates cleanly to sibling route' },
    async () => {
      await ctx.visit('/app/quan-tri/cai-dat', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      await cdp.click('.ad-subnav a[href="/app/quan-tri/giam-sat"]');
      await cdp.waitForAppSettled({ expectAdmin: true });
      const info = await cdp.evalJs(() => ({
        path: location.pathname,
        activeSub: document.querySelector('.ad-subnav .ad-subnav-it.on')?.textContent.trim() || '',
      }));
      assert.strictEqual(info.path, '/app/quan-tri/giam-sat');
      assert.strictEqual(info.activeSub, 'Giám sát');
    }
  );

  suite.test(
    { id: 'T2-F11-04', tier: 2, feature: 'F11', milestone: 'M3', name: 'Unknown Admin tab /app/quan-tri/nonexistent falls back cleanly with 0 .sk-ic' },
    async () => {
      await ctx.visit('/app/quan-tri/nonexistent', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const v = await ctx.inspectAdminVisuals();
      assert.strictEqual(v.skIcCount, 0);
      assert.ok(await ctx.existsVisible('.ad-m-tab'));
    }
  );

  suite.test(
    { id: 'T2-F11-05', tier: 2, feature: 'F11', milestone: 'Core', name: 'Teacher role is denied /app/quan-tri/hoc-vien cleanly without .ad shell' },
    async () => {
      await ctx.visit('/app/quan-tri/hoc-vien', { role: 'teacher', viewport: 'mobile', expectAdmin: true, allowDenied: true });
      const hasAd = await cdp.evalJs(() => !!document.getElementById('ad'));
      assert.strictEqual(hasAd, false);
    }
  );

  // ================= F12: Admin Modernization Core & Nav Boundaries =================
  suite.test(
    { id: 'T2-F12-01', tier: 2, feature: 'F12', milestone: 'M3', name: 'Admin 4-tab dock fits 320x844 bottom viewport without clipping or overflow' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'narrow', expectAdmin: true });
      await ctx.assertNoOverflow('T2-F12-01 admin dock 320px');
      const rect = await cdp.evalJs(() => {
        const d = document.querySelector('.ad-m-tab');
        const r = d?.getBoundingClientRect();
        return { bottom: r?.bottom ?? 9999, width: r?.width ?? 9999, innerH: window.innerHeight, innerW: window.innerWidth };
      });
      assert.ok(rect.bottom <= rect.innerH + 1 && rect.width <= rect.innerW + 1);
    }
  );

  suite.test(
    { id: 'T2-F12-02', tier: 2, feature: 'F12', milestone: 'M3', name: 'Admin #adMBack on tong-quan navigates back to learner app via SPA' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      await cdp.evalJs(() => { window.__e2eBackMarker = 1; });
      await cdp.click('#adMBack');
      await cdp.waitForAppSettled();
      const res = await cdp.evalJs(() => ({
        axOn: document.body.classList.contains('ax-on'),
        marker: window.__e2eBackMarker || 0,
      }));
      assert.strictEqual(res.axOn, false, 'Must leave Admin shell');
      assert.strictEqual(res.marker, 1, 'M3: #adMBack must use SPA navigation');
    }
  );

  suite.test(
    { id: 'T2-F12-03', tier: 2, feature: 'F12', milestone: 'M3', name: 'Admin #addU user creation modal uses clean white inputs (no #FAF6EC)' },
    async () => {
      await ctx.visit('/app/quan-tri/hoc-vien', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      await cdp.click('#addU');
      await cdp.waitForCondition(() => !!document.querySelector('.modal'), 4000, 60);
      const v = await ctx.inspectAdminVisuals();
      assert.deepStrictEqual(v.creamInputs, [], `M3: Modal inputs leaked #FAF6EC: ${JSON.stringify(v.creamInputs)}`);
      await cdp.evalJs(() => document.querySelector('.modal .modal-x, .modal [data-close]')?.click());
    }
  );

  suite.test(
    { id: 'T2-F12-04', tier: 2, feature: 'F12', milestone: 'M3', name: 'Admin hoc-vien filter selects (#sr, #st, #ss) have zero #FAF6EC cream background' },
    async () => {
      await ctx.visit('/app/quan-tri/hoc-vien', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      const v = await ctx.inspectAdminVisuals();
      assert.deepStrictEqual(v.creamInputs, [], `M3: Filter inputs/selects leaked #FAF6EC: ${JSON.stringify(v.creamInputs)}`);
    }
  );

  suite.test(
    { id: 'T2-F12-05', tier: 2, feature: 'F12', milestone: 'M3', name: 'All 13 Admin routes maintain #F4F7FB body background and non-Mali font on mobile' },
    async () => {
      for (const r of ADMIN_ROUTES) {
        await ctx.visit(r.path, { role: 'admin', viewport: 'mobile', expectAdmin: true });
        const v = await ctx.inspectAdminVisuals();
        assert.strictEqual(v.bodyBg, 'rgb(244, 247, 251)', `${r.tab}: bodyBg=${v.bodyBg}`);
        assert.doesNotMatch(v.bodyFont, /Mali|Patrick Hand/i, `${r.tab}: font=${v.bodyFont}`);
      }
    }
  );

  // ================= F13: All 13 Admin Mobile Routes Boundaries =================
  suite.test(
    { id: 'T2-F13-01', tier: 2, feature: 'F13', milestone: 'M3', name: 'hoc-vien unmatched search #sq shows clean empty state without overflow' },
    async () => {
      await ctx.visit('/app/quan-tri/hoc-vien', { role: 'admin', viewport: 'narrow', expectAdmin: true });
      await cdp.fill('#sq', 'zzz_no_such_user_999');
      await new Promise((r) => setTimeout(r, 250));
      await ctx.assertNoOverflow('T2-F13-01 hoc-vien empty search 320px');
      const countTxt = await cdp.evalJs(() => document.getElementById('ucount')?.textContent || '');
      assert.ok(countTxt.includes('0'), `Expected 0 matching users, got "${countTxt}"`);
    }
  );

  suite.test(
    { id: 'T2-F13-02', tier: 2, feature: 'F13', milestone: 'M3', name: 'song-ngu unmatched search #q shows clean empty feedback at 320x844' },
    async () => {
      await ctx.visit('/app/quan-tri/song-ngu', { role: 'admin', viewport: 'narrow', expectAdmin: true });
      await cdp.fill('#q', 'zzz_nonexistent_translation_key');
      await new Promise((r) => setTimeout(r, 300));
      await ctx.assertNoOverflow('T2-F13-02 song-ngu empty search 320px');
    }
  );

  suite.test(
    { id: 'T2-F13-03', tier: 2, feature: 'F13', milestone: 'M3', name: 'kinh-doanh sub-views (don-hang, ai, nhat-ky) render cleanly at 320x844' },
    async () => {
      for (const sub of ['don-hang', 'ai', 'nhat-ky']) {
        await ctx.visit(`/app/quan-tri/kinh-doanh?sub=${sub}`, { role: 'admin', viewport: 'narrow', expectAdmin: true });
        await ctx.assertNoOverflow(`T2-F13-03 kinh-doanh ${sub} 320px`);
      }
    }
  );

  suite.test(
    { id: 'T2-F13-04', tier: 2, feature: 'F13', milestone: 'M3', name: 'giam-sat mobile renders cleanly at narrow 320x844 with zero overflow' },
    async () => {
      await ctx.visit('/app/quan-tri/giam-sat', { role: 'admin', viewport: 'narrow', expectAdmin: true });
      await ctx.assertNoOverflow('T2-F13-04 giam-sat 320px');
    }
  );

  suite.test(
    { id: 'T2-F13-05', tier: 2, feature: 'F13', milestone: 'M3', name: 'ma-qua-tang, thong-bao, du-lieu render cleanly at narrow 320x844' },
    async () => {
      for (const p of ['/app/quan-tri/ma-qua-tang', '/app/quan-tri/thong-bao', '/app/quan-tri/du-lieu']) {
        await ctx.visit(p, { role: 'admin', viewport: 'narrow', expectAdmin: true });
        await ctx.assertNoOverflow(`T2-F13-05 ${p} 320px`);
      }
    }
  );

  // ================= F14: Desktop Intactness & Workspace Safety Boundaries =================
  suite.test(
    { id: 'T2-F14-01', tier: 2, feature: 'F14', milestone: 'Core', name: 'Desktop 1440x900 Certificates preserves visible .lx-cert-list' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/chung-nhan-cua-toi/en', { role: 'student', viewport: 'desktop' });
      const disp = await cdp.evalJs(() => {
        const el = document.querySelector('.lx-cert-list');
        return el ? getComputedStyle(el).display : 'missing';
      });
      assert.notStrictEqual(disp, 'none', '.lx-cert-list must stay visible on desktop');
    }
  );

  suite.test(
    { id: 'T2-F14-02', tier: 2, feature: 'F14', milestone: 'Core', name: 'Desktop 1440x900 Badges preserves visible .cds-prog progress bars' },
    async () => {
      await ctx.visit('/app/ngoai-ngu/huy-hieu/en', { role: 'student', viewport: 'desktop' });
      const visCount = await cdp.evalJs(() =>
        [...document.querySelectorAll('.cds-ach .cds-prog')].filter((p) => getComputedStyle(p).display !== 'none').length
      );
      assert.ok(visCount >= 1, 'Locked badge .cds-prog progress bars must stay visible on desktop');
    }
  );

  suite.test(
    { id: 'T2-F14-03', tier: 2, feature: 'F14', milestone: 'Core', name: 'Desktop 1440x900 /app/ca-nhan keeps desktop profile head intact with 0 overflow' },
    async () => {
      await ctx.visit('/app/ca-nhan', { role: 'student', viewport: 'desktop' });
      await ctx.assertNoOverflow('T2-F14-03 desktop ca-nhan');
      assert.ok(await ctx.existsVisible('.pf-desk-head'), '.pf-desk-head must be visible on desktop');
    }
  );

  suite.test(
    { id: 'T2-F14-04', tier: 2, feature: 'F14', milestone: 'Core', name: 'Resizing Admin mobile -> desktop restores 252px .ad-side and hides .ad-m-tab' },
    async () => {
      await ctx.visit('/app/quan-tri/tong-quan', { role: 'admin', viewport: 'mobile', expectAdmin: true });
      await ctx.setViewport('desktop');
      await new Promise((r) => setTimeout(r, 120));
      const d = await cdp.evalJs(() => ({
        sideW: document.querySelector('.ad-side')?.getBoundingClientRect().width || 0,
        tabDisp: getComputedStyle(document.querySelector('.ad-m-tab')).display,
      }));
      assert.strictEqual(Math.round(d.sideW), 252);
      assert.strictEqual(d.tabDisp, 'none');
    }
  );

  suite.test(
    { id: 'T2-F14-05', tier: 2, feature: 'F14', milestone: 'Core', name: 'Protected workspace files remain untouched after Tier 2 mutations' },
    async () => {
      assertWorkspaceFilesUntouched(srv.workspaceSnap);
    }
  );
}
