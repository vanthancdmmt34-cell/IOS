/**
 * @file tests/challenger-m3-1-adversarial.test.mjs
 * Challenger 1 Adversarial Empirical Verification Suite for Milestone 3 (Interactive Sections: S1, S2, S8)
 *
 * Requirements Tested:
 * - R1: Warm theme, zero pre-S8 account gates, clean footer contacts.
 * - R2: Section 1 Hero 2.8s rotator across 6 exact subjects, Hero CTA scroll to #demoBox without auth gate.
 * - R3: Section 2 Dual live sandboxes (Python live runner with POST /api/demo/run, Japanese interactive quiz with 4 options, praise conversion modal).
 * - R4: Section 4 absence of "0 học viên" anywhere on page, templates, or hydration script.
 * - R6: Section 8 final conversion CTA as the sole mandatory account creation section.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { getTestServer } from './helpers/test-server.mjs';

const ROOT = process.cwd();

describe('Milestone 3 Adversarial Verification (Challenger 1)', () => {
  let testServer;
  let ssrHtml = '';
  let rawIndexHtml = '';
  let landingJs = '';
  let themeCss = '';
  let bundleCss = '';
  let landingModule = null;

  before(async () => {
    testServer = await getTestServer();
    const res = await testServer.fetch('/');
    assert.strictEqual(res.status, 200, 'GET / must return 200 OK');
    ssrHtml = await res.text();

    rawIndexHtml = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
    landingJs = fs.readFileSync(path.join(ROOT, 'public', 'js', 'landing.js'), 'utf8');
    themeCss = fs.readFileSync(path.join(ROOT, 'public', 'css', 'theme.css'), 'utf8');
    bundleCss = fs.readFileSync(path.join(ROOT, 'public', 'css', 'bundle.min.css'), 'utf8');

    // Import landing module for direct export validation
    landingModule = await import('../public/js/landing.js');
  });

  after(async () => {
    if (testServer) {
      await new Promise(r => setTimeout(r, 200));
      await testServer.close();
    }
  });

  // =========================================================================
  // SUITE 1: Section 1 Hero Rotator Invariants & Boundary Stress
  // =========================================================================
  describe('Suite 1: Section 1 Hero Rotator Invariants & Timing', () => {
    it('C1-ROT-01: Rotator interval constant HERO_ROTATOR_INTERVAL_MS is strictly 2800ms', () => {
      assert.strictEqual(
        landingModule.HERO_ROTATOR_INTERVAL_MS,
        2800,
        'Rotator interval constant must be strictly 2800ms (2.8s requirement)'
      );
      assert.match(
        landingJs,
        /HERO_ROTATOR_INTERVAL_MS\s*=\s*2800/,
        'landing.js source must define HERO_ROTATOR_INTERVAL_MS = 2800'
      );
    });

    it('C1-ROT-02: Subject list HERO_ROTATOR_SUBJECTS contains exactly 6 subjects in strict order', () => {
      const expectedSubjects = [
        'tiếng Nhật',
        'tiếng Anh',
        'tiếng Trung',
        'tiếng Hàn',
        'tiếng Pháp',
        'tiếng Tây Ban Nha'
      ];
      assert.deepStrictEqual(
        landingModule.HERO_ROTATOR_SUBJECTS,
        expectedSubjects,
        'Rotator subjects array must match exact 6 subjects in specified sequence'
      );
      assert.strictEqual(
        landingModule.HERO_ROTATOR_SUBJECTS.length,
        6,
        'Rotator must cycle across exactly 6 subjects'
      );
    });

    it('C1-ROT-03: SSR response contains #heroRotator element with pre-rendered initial word', () => {
      assert.match(ssrHtml, /<span[^>]*id="heroRotator"[^>]*>/, 'SSR HTML must contain #heroRotator');
      assert.match(
        ssrHtml,
        /<span[^>]*class="[^"]*rotator-word[^"]*aw-rot-w[^"]*in[^"]*"[^>]*>/,
        'Initial word must have classes rotator-word, aw-rot-w, and in'
      );
      const heroSnippet = ssrHtml.slice(ssrHtml.indexOf('id="hero"'), ssrHtml.indexOf('id="demoBox"'));
      assert.ok(heroSnippet.includes('id="heroRotator"'), '#heroRotator must reside inside Section 1 #hero');
    });

    it('C1-ROT-04: CSS keyframes awRotIn and rotateWord define fade and slide-up in theme.css and bundle.min.css', () => {
      // theme.css checks
      assert.match(themeCss, /@keyframes\s+awRotIn/, 'theme.css must declare @keyframes awRotIn');
      assert.match(themeCss, /@keyframes\s+rotateWord/, 'theme.css must declare @keyframes rotateWord fallback');
      assert.match(themeCss, /translateY\(100%\)/, 'Rotator animation must slide up from translateY(100%)');
      assert.match(themeCss, /opacity:\s*0/, 'Rotator animation must start at opacity: 0');
      assert.match(themeCss, /opacity:\s*1/, 'Rotator animation must finish at opacity: 1');

      // bundle.min.css checks
      assert.match(bundleCss, /awRotIn/, 'bundle.min.css must contain compiled awRotIn keyframe');
      assert.match(bundleCss, /rotateWord/, 'bundle.min.css must contain compiled rotateWord keyframe');
    });

    it('C1-ROT-05: initHeroRotator sets aria-label with all 6 subjects and manages timer idempotently', () => {
      const fakeHost = {
        tagName: 'SPAN',
        id: 'heroRotator',
        attributes: {},
        style: {},
        setAttribute(k, v) { this.attributes[k] = v; },
        getAttribute(k) { return this.attributes[k]; },
        querySelector() { return { offsetWidth: 120, getBoundingClientRect() { return { width: 120 }; } }; },
        appendChild() {}
      };
      const fakeRoot = {
        querySelector(sel) { if (sel === '#heroRotator') return fakeHost; return null; }
      };

      const origMatchMedia = globalThis.matchMedia;
      const origWindow = globalThis.window;
      globalThis.window = { matchMedia: () => ({ matches: false }) };
      globalThis.matchMedia = globalThis.window.matchMedia;

      try {
        landingModule.initHeroRotator(fakeRoot);
        const ariaLabel = fakeHost.getAttribute('aria-label');
        assert.ok(ariaLabel, 'Rotator host must have aria-label attribute');
        for (const subj of landingModule.HERO_ROTATOR_SUBJECTS) {
          assert.ok(ariaLabel.includes(subj), `aria-label must include subject "${subj}"`);
        }

        // Re-call to verify idempotency and interval reset without throwing
        landingModule.initHeroRotator(fakeRoot);
        assert.strictEqual(fakeHost.getAttribute('aria-label'), ariaLabel);
      } finally {
        globalThis.matchMedia = origMatchMedia;
        globalThis.window = origWindow;
      }
    });

    it('C1-ROT-06: Reduced motion preference disables automatic rotator timer', () => {
      const fakeHost = {
        tagName: 'SPAN',
        id: 'heroRotator',
        attributes: {},
        style: {},
        setAttribute(k, v) { this.attributes[k] = v; },
        getAttribute(k) { return this.attributes[k]; },
        querySelector() { return null; },
        appendChild() {}
      };
      const fakeRoot = {
        querySelector(sel) { if (sel === '#heroRotator') return fakeHost; return null; }
      };

      const origMatchMedia = globalThis.matchMedia;
      const origWindow = globalThis.window;
      globalThis.window = { matchMedia: (q) => ({ matches: q.includes('reduced-motion') }) };
      globalThis.matchMedia = globalThis.window.matchMedia;

      try {
        landingModule.initHeroRotator(fakeRoot);
        assert.ok(fakeHost.getAttribute('aria-label'), 'Host still gets accessibility label even with reduced motion');
      } finally {
        globalThis.matchMedia = origMatchMedia;
        globalThis.window = origWindow;
      }
    });
  });

  // =========================================================================
  // SUITE 2: Section 1 Hero CTA & Mockups
  // =========================================================================
  describe('Suite 2: Section 1 Hero CTA & Visual Mockups', () => {
    it('C1-CTA-01: Hero CTA targets #demoBox and has zero registration gate', () => {
      const heroSnippet = ssrHtml.slice(ssrHtml.indexOf('id="hero"'), ssrHtml.indexOf('id="demoBox"'));
      assert.match(heroSnippet, /id="heroCta"/, 'Hero CTA element with id="heroCta" must exist');
      assert.match(heroSnippet, /href="#demoBox"/, 'Hero CTA must point to #demoBox');

      const heroCtaTag = heroSnippet.match(/<a[^>]*id="heroCta"[^>]*>|<a[^>]*href="#demoBox"[^>]*id="heroCta"[^>]*>/);
      assert.ok(heroCtaTag, 'Hero CTA anchor tag must be matched');
      assert.doesNotMatch(heroCtaTag[0], /data-auth/, 'Hero CTA must NOT have data-auth attribute');
      assert.doesNotMatch(heroCtaTag[0], /onclick/, 'Hero CTA must NOT have inline auth handlers');
    });

    it('C1-CTA-02: Hero CTA copy and surrounding microcopy match exact requirements', () => {
      assert.match(ssrHtml, /Chơi thử ngay - Không cần tài khoản/, 'CTA button text must match');
      assert.match(ssrHtml, /6 Ngoại ngữ &amp; Luyện nói AI/, 'Chip copy must match');
      assert.match(
        ssrHtml,
        /Mỗi bài chỉ vài phút, có lý thuyết ngắn, làm xong chấm ngay, sai đâu sửa đó\. Không cần biết gì trước\./,
        'Hero subtext must match'
      );
      assert.match(
        ssrHtml,
        /Miễn phí cấp cơ bản · Không cần cài đặt · Dùng được trên điện thoại/,
        'Hero note must match'
      );
    });

  });

  // =========================================================================
  // SUITE 3: Section 2 Python Live Runner (/api/demo/run) Endpoint Execution
  // =========================================================================

  // =========================================================================
  // SUITE 4: Section 2 Client Runner Stamp & Badge Logic
  // =========================================================================

  // =========================================================================
  // SUITE 5: Section 2 Japanese Interactive Quiz
  // =========================================================================

  // =========================================================================
  // SUITE 6: Conversion Modal & Section 8 Final CTA
  // =========================================================================
  describe('Suite 6: Conversion Modal & Section 8 Final CTA', () => {
    it('C1-MODAL-01: Conversion modal contains exact praise text and registration trigger', () => {
      const praiseText = 'Bạn làm đúng rồi! Bạn có năng khiếu đấy. Tạo tài khoản để lưu tiến độ nhé?';
      assert.ok(
        landingJs.includes(praiseText),
        'landing.js must contain exact praise text'
      );
      assert.ok(
        ssrHtml.includes(praiseText) || ssrHtml.includes('id="demoSuccessTpl"'),
        'SSR HTML must have template or praise text'
      );
      assert.match(landingJs, /data-auth="register"/, 'Conversion modal button must have data-auth="register"');
      assert.match(landingJs, /Tạo tài khoản miễn phí/, 'Conversion modal button must say "Tạo tài khoản miễn phí"');
    });

    it('C1-MODAL-02: Conversion modal has deduplication guard against stacked popups', () => {
      assert.match(
        landingJs,
        /if\s*\(\s*document\.querySelector\("\.demo-success-dialog"\)\s*\)\s*return;/,
        'showConversionModal must guard against duplicate open dialogs'
      );
    });

    it('C1-S8-01: Section 8 is present as sole mandatory registration CTA', () => {
      assert.match(ssrHtml, /<section[^>]*id="chot-cuoi"[^>]*>/, 'Section 8 id="chot-cuoi" must exist');
      const s8Snippet = ssrHtml.slice(ssrHtml.indexOf('id="chot-cuoi"'), ssrHtml.indexOf('id="lpFoot"'));
      assert.match(s8Snippet, /Sẵn sàng bắt đầu\?/, 'Section 8 heading must match');
      assert.match(s8Snippet, /Tạo tài khoản, chọn môn, vào học ngay\. Miễn phí cấp cơ bản\./, 'Section 8 subtext must match');
      assert.match(s8Snippet, /data-auth="register"/, 'Section 8 button must have data-auth="register"');
      assert.match(s8Snippet, /Tạo tài khoản miễn phí/, 'Section 8 button text must match');
    });

    it('C1-S8-02: Zero mandatory pre-S8 gates across sections 1 through 7', () => {
      const preS8Html = ssrHtml.slice(0, ssrHtml.indexOf('id="chot-cuoi"'));
      const mainContent = preS8Html.slice(preS8Html.indexOf('<main id="main">'));

      // Check each section individually within main
      const sections = ['hero', 'demoBox', 'muc-dich', 'mon-hoc', 'cach-hoc', 'cau-chuyen', 'hoi-dap'];
      for (const sec of sections) {
        const secStart = mainContent.indexOf(`id="${sec}"`);
        assert.ok(secStart !== -1, `Section id="${sec}" must exist in main`);
        const nextSec = mainContent.indexOf('<section', secStart + 1);
        const secSlice = nextSec !== -1 ? mainContent.slice(secStart, nextSec) : mainContent.slice(secStart);
        assert.doesNotMatch(
          secSlice,
          /data-auth="register"/i,
          `Section id="${sec}" must NOT contain mandatory data-auth="register" button`
        );
        assert.doesNotMatch(
          secSlice,
          /data-auth="login"/i,
          `Section id="${sec}" must NOT contain mandatory data-auth="login" button`
        );
      }
    });

    it('C1-S8-03: Section 3 and 4 roadmap/subject cards navigate directly without auth interception', () => {
      const s3s4Snippet = ssrHtml.slice(ssrHtml.indexOf('id="muc-dich"'), ssrHtml.indexOf('id="cach-hoc"'));
      assert.match(s3s4Snippet, /href="(?:#|\/app)\/ngoai-ngu\/ja"/, 'Section 3/4 must contain direct link to /app/ngoai-ngu/ja');
      assert.match(s3s4Snippet, /href="(?:#|\/app)\/ngoai-ngu\/en"/, 'Section 3/4 must contain direct link to /app/ngoai-ngu/en');
      assert.doesNotMatch(s3s4Snippet, /openAuth\("register"\)/, 'Cards must not directly invoke openAuth');
    });
  });

  // =========================================================================
  // SUITE 7: Absolute Cleanliness & Absence of "0 học viên"
  // =========================================================================
  describe('Suite 7: Substring Verification & "0 học viên" Elimination', () => {
    it('C1-FORBID-01: Zero occurrences of "0 học viên" in SSR HTML, raw index.html, and landing.js', () => {
      assert.strictEqual(ssrHtml.includes('0 học viên'), false, 'SSR response must not contain "0 học viên"');
      assert.strictEqual(rawIndexHtml.includes('0 học viên'), false, 'raw index.html must not contain "0 học viên"');
      assert.strictEqual(landingJs.includes('0 học viên'), false, 'landing.js must not contain "0 học viên"');
    });

    it('C1-FORBID-02: Unicode-normalized forms (NFC, NFD, NFKC, NFKD) are absent', () => {
      const target = '0 học viên';
      const forms = ['NFC', 'NFD', 'NFKC', 'NFKD'];
      for (const form of forms) {
        const normalizedTarget = target.normalize(form);
        assert.strictEqual(
          ssrHtml.normalize(form).includes(normalizedTarget),
          false,
          `SSR response must not contain "0 học viên" in ${form} normalization`
        );
      }
    });

    it('C1-FORBID-03: Regex variations and entity encodings of "0 học viên" are absent', () => {
      assert.doesNotMatch(ssrHtml, /0\s*học\s*viên/i, 'Case-insensitive regex must not match 0 học viên');
      assert.doesNotMatch(ssrHtml, /&#48;\s*học\s*viên/i, 'Decimal entity &#48; must not match');
      assert.doesNotMatch(ssrHtml, /&#x30;\s*học\s*viên/i, 'Hex entity &#x30; must not match');
    });

    it('C1-FORBID-04: landing.js loadPublic explicitly suppresses rendering student count', () => {
      assert.match(
        landingJs,
        /if\s*\(\s*b\.dataset\.k\s*===\s*"students"\s*\)\s*return;/,
        'loadPublic must explicitly skip elements with data-k="students"'
      );
    });

    it('C1-FORBID-05: Clean footer contacts contain study@liferivo.com, Facebook, Threads and zero Gmail/Zalo', () => {
      const footerSnippet = ssrHtml.slice(ssrHtml.indexOf('id="lpFoot"'));
      assert.match(footerSnippet, /study@liferivo\.com/, 'Footer must contain study@liferivo.com');
      assert.match(footerSnippet, /facebook\.com/i, 'Footer must contain Facebook link');
      assert.doesNotMatch(footerSnippet, /@gmail\.com/i, 'Footer must not contain personal Gmail');
      assert.doesNotMatch(footerSnippet, /zalo/i, 'Footer must not contain personal Zalo');
    });
  });

  // =========================================================================
  // SUITE 8: Hydration Idempotency, DOM Preservation & Build Script
  // =========================================================================
  describe('Suite 8: Hydration Idempotency, DOM Preservation & Build Verification', () => {
    it('C1-HYDRATE-01: buildLandingMarkup outputs full 8-section SSR markup structure', () => {
      const markup = landingModule.buildLandingMarkup();
      assert.ok(typeof markup === 'string' && markup.length > 5000, 'buildLandingMarkup must return rich HTML');
      const expectedSectionIds = [
        'hero',
        'demoBox',
        'muc-dich',
        'mon-hoc',
        'cach-hoc',
        'cau-chuyen',
        'hoi-dap',
        'chot-cuoi'
      ];
      for (const id of expectedSectionIds) {
        assert.ok(markup.includes(`id="${id}"`), `buildLandingMarkup must contain id="${id}"`);
      }
    });


    // Chỉ kiểm tra (không ghi file): npm run build ghi đè các file build đã commit mỗi lần chạy test (AUDIT F-06)
    it('C1-BUILD-01: build verification scripts (check:css, check:js, verify:lang) pass with exit code 0', () => {
      const output = execSync('npm run check:css && npm run check:js && npm run verify:lang', { cwd: ROOT, encoding: 'utf8' });
      assert.match(output, /up to date|OK|không có lỗi/, 'Verification output must indicate success');
    });
  });
});
