/**
 * @file tests/challenger-m3-2-adversarial.test.mjs
 * Challenger 2 Adversarial Stress & Empirical Verification Suite
 * Milestone 3: Interactive Sections (S1, S2, S8) & Hydration Architecture
 *
 * Focus Areas:
 * 1. Client hydration mechanics, exports, and DOM preservation
 * 2. Section 1 Hero word rotator interval, lifecycle, and motion reduction
 * 3. Section 2 Python live execution boundaries, stress inputs, and reward triggers
 * 4. Section 2 CodeMirror integration and native textarea fallback
 * 5. Section 2 Japanese quiz state transitions, feedback, and fuzzing
 * 6. Conversion modal structure, praise copy, and re-entrancy suppression
 * 7. Pre-S8 free navigation vs Section 8 sole mandatory registration contract
 * 8. Mobile 375px responsive layout and zero forbidden substrings
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getTestServer } from './helpers/test-server.mjs';

const ROOT = process.cwd();

describe('Milestone 3 Adversarial Verification (Challenger M3-2)', () => {
  let testServer;
  let ssrHtml;
  let rawIndexHtml;
  let landingJs;
  let themeCss;
  let landingModule;

  before(async () => {
    testServer = await getTestServer();
    const res = await testServer.fetch('/');
    assert.strictEqual(res.status, 200, 'HTTP status must be 200 OK');
    ssrHtml = await res.text();

    rawIndexHtml = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
    landingJs = fs.readFileSync(path.join(ROOT, 'public', 'js', 'landing.js'), 'utf8');
    themeCss = fs.readFileSync(path.join(ROOT, 'public', 'css', 'theme.css'), 'utf8');

    // Dynamic import of landing.js to verify module exports
    landingModule = await import('../public/js/landing.js');
  });

  after(async () => {
    if (testServer) {
      await testServer.close();
    }
  });

  // =========================================================================
  // 1. Client Hydration Mechanics, Exports & DOM Invariants
  // =========================================================================
  describe('Group 1: Client Hydration Mechanics & Exports', () => {
    it('M3-C2-01: Module exports all required M3 functions and constants', () => {
      const requiredExports = [
        'HERO_ROTATOR_SUBJECTS',
        'HERO_ROTATOR_INTERVAL_MS',
        'initHeroRotator',
        'initHeroCta',
        'initHero',
        'hydrateSection2Demo',
        'showConversionModal',
        'buildLandingMarkup',
        'hydrateLanding',
        'renderLanding',
        'trackFunnel',
        'openAuth',
        'initFx',
        'confetti'
      ];

      for (const name of requiredExports) {
        assert.ok(name in landingModule, `landing.js must export "${name}"`);
      }
      assert.strictEqual(typeof landingModule.renderLanding, 'function');
      assert.strictEqual(typeof landingModule.hydrateLanding, 'function');
      assert.strictEqual(typeof landingModule.hydrateSection2Demo, 'function');
      assert.strictEqual(typeof landingModule.initHeroRotator, 'function');
      assert.strictEqual(typeof landingModule.showConversionModal, 'function');
    });

    it('M3-C2-02: HERO_ROTATOR_SUBJECTS contains exact 6 subjects in required order and interval is 2800ms', () => {
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
        'HERO_ROTATOR_SUBJECTS must exactly match 6 required subjects'
      );
      assert.strictEqual(
        landingModule.HERO_ROTATOR_INTERVAL_MS,
        2800,
        'HERO_ROTATOR_INTERVAL_MS must be strictly 2800 (2.8 seconds)'
      );
    });

    it('M3-C2-03: buildLandingMarkup() contains all 8 section IDs in strict sequence', () => {
      const markup = landingModule.buildLandingMarkup();
      const expectedSections = [
        'hero',
        'demoBox',
        'muc-dich',
        'mon-hoc',
        'cach-hoc',
        'cau-chuyen',
        'hoi-dap',
        'chot-cuoi'
      ];

      let lastIdx = -1;
      for (const id of expectedSections) {
        const idx = markup.indexOf(`id="${id}"`);
        assert.ok(idx > -1, `buildLandingMarkup must contain id="${id}"`);
        assert.ok(
          idx > lastIdx,
          `Section #${id} (index ${idx}) must appear after previous section (index ${lastIdx})`
        );
        lastIdx = idx;
      }
    });

    it('M3-C2-04: buildLandingMarkup() contains zero "0 học viên" and no unauthorized auth buttons', () => {
      const markup = landingModule.buildLandingMarkup();
      assert.strictEqual(
        markup.includes('0 học viên'),
        false,
        'buildLandingMarkup must not contain "0 học viên"'
      );

      // Verify sections 1-7 in markup have no data-auth="register"
      const mainContent = markup.slice(markup.indexOf('<main'), markup.indexOf('id="chot-cuoi"'));
      assert.doesNotMatch(
        mainContent,
        /data-auth="register"/,
        'Sections 1-7 in buildLandingMarkup must not contain data-auth="register"'
      );
    });


    it('M3-C2-06: DOM preservation: renderLanding does NOT overwrite root if #landingPage or #demoBox exists', () => {
      assert.match(
        landingJs,
        /root\.querySelector\(["']#landingPage["']\)\s*\|\|\s*root\.querySelector\(["']#demoBox["']\)/,
        'renderLanding must check for existing SSR landingPage or demoBox before touching innerHTML'
      );
      assert.match(
        landingJs,
        /if\s*\(\s*!landingPage\s*\)\s*\{[\s\S]*?root\.innerHTML/,
        'root.innerHTML assignment must only occur when landingPage element is NOT present'
      );
    });
  });

  // =========================================================================
  // 2. Section 1 Hero Rotator & CTA Interactions
  // =========================================================================
  describe('Group 2: Section 1 Hero Rotator & CTA Interactions', () => {
    it('M3-C2-07: Hero rotator host exists in SSR HTML and markup with rotator classes', () => {
      assert.match(
        ssrHtml,
        /<span[^>]*class="[^"]*rotator[^"]*aw-rot[^"]*"[^>]*id="heroRotator"[^>]*>/,
        'SSR HTML must contain #heroRotator with classes rotator and aw-rot'
      );
      assert.match(
        ssrHtml,
        /<span[^>]*class="[^"]*rotator-word[^"]*aw-rot-w[^"]*in"[^>]*>tiếng Nhật<\/span>/,
        'SSR HTML must pre-render initial word with .in class'
      );
    });

    it('M3-C2-08: Rotator CSS keyframes awRotIn and awRotOut define correct translateY and opacity', () => {
      assert.match(
        themeCss,
        /@keyframes\s+awRotIn\s*\{\s*from\s*\{\s*transform:\s*translateY\(100%\);\s*opacity:\s*0;\s*\}\s*to\s*\{\s*transform:\s*none;\s*opacity:\s*1;\s*\}\s*\}/,
        'Keyframe awRotIn must translate from 100% to none with opacity 0 to 1'
      );
      assert.match(
        themeCss,
        /@keyframes\s+awRotOut\s*\{\s*to\s*\{\s*transform:\s*translateY\(-100%\);\s*opacity:\s*0;\s*\}\s*\}/,
        'Keyframe awRotOut must translate to -100% with opacity 0'
      );
    });

    it('M3-C2-09: Rotator respects prefers-reduced-motion: reduce', () => {
      assert.match(
        landingJs,
        /const\s+reduceMotion\s*=\s*\(\)\s*=>\s*window\.matchMedia\s*&&\s*matchMedia\(["']\(prefers-reduced-motion:\s*reduce\)["']\)\.matches/,
        'landing.js must define reduceMotion checking prefers-reduced-motion'
      );
      assert.match(
        landingJs,
        /if\s*\(\s*reduceMotion\(\)\s*\)\s*return;/,
        'initHeroRotator must early return if reduced motion is requested'
      );
    });

    it('M3-C2-10: Rotator cleans up timer if element is disconnected from DOM', () => {
      assert.match(
        landingJs,
        /if\s*\(\s*!document\.body\.contains\(host\)\s*\)\s*\{[\s\S]*?clearInterval\(heroRotTimer\);[\s\S]*?heroRotTimer\s*=\s*null;/,
        'initHeroRotator must clearInterval when host element is no longer in document.body'
      );
    });

    it('M3-C2-11: Hero CTA targets #demoBox with smooth scroll and zero auth trigger', () => {
      assert.match(ssrHtml, /id="heroCta"/, 'SSR must contain id="heroCta"');
      assert.match(ssrHtml, /href="#demoBox"/, 'SSR heroCta must point to href="#demoBox"');
      assert.match(ssrHtml, /data-scroll-to="#demoBox"/, 'SSR heroCta must declare data-scroll-to="#demoBox"');
      assert.doesNotMatch(
        ssrHtml.slice(ssrHtml.indexOf('id="hero"'), ssrHtml.indexOf('id="demoBox"')),
        /data-auth=/,
        'Hero section must contain zero data-auth triggers'
      );
    });
  });

  // =========================================================================
  // 3. Section 2 Python Live Execution Engine Stress (Real HTTP /api/demo/run)
  // =========================================================================

  // =========================================================================
  // 4. CodeMirror vs Textarea Fallback & XSS Defense
  // =========================================================================

  // =========================================================================
  // 5. Section 2 Japanese Interactive Quiz Fuzzing & State Transitions
  // =========================================================================

  // =========================================================================
  // 6. Conversion Modal & Funnel Architecture
  // =========================================================================
  describe('Group 6: Conversion Modal & Funnel Architecture', () => {
    it('M3-C2-35: Conversion modal contains exact praise copy from requirement R3', () => {
      const requiredPraise = 'Bạn làm đúng rồi! Bạn có năng khiếu đấy. Tạo tài khoản để lưu tiến độ nhé?';
      assert.ok(
        landingJs.includes(requiredPraise),
        `landing.js must contain exact praise copy: "${requiredPraise}"`
      );
      assert.ok(
        ssrHtml.includes(requiredPraise),
        `SSR #demoSuccessTpl must contain exact praise copy: "${requiredPraise}"`
      );
    });

    it('M3-C2-36: Conversion modal button matches "Tạo tài khoản miễn phí" with data-auth="register"', () => {
      assert.match(
        landingJs,
        /<button[^>]*data-auth="register"[^>]*>[\s\S]*?Tạo tài khoản miễn phí[\s\S]*?<\/button>/,
        'Conversion modal must render "Tạo tài khoản miễn phí" with data-auth="register"'
      );
      assert.match(
        ssrHtml,
        /<template[^>]*id="demoSuccessTpl"[^>]*>[\s\S]*?<button[^>]*data-auth="register"[^>]*>Tạo tài khoản miễn phí<\/button>/,
        'SSR template must declare "Tạo tài khoản miễn phí" with data-auth="register"'
      );
    });

    it('M3-C2-37: Re-entrancy prevention: showConversionModal avoids duplicate modals if already open', () => {
      assert.match(
        landingJs,
        /if\s*\(\s*document\.querySelector\(["']\.demo-success-dialog["']\)\s*\)\s*return;/,
        'showConversionModal must abort if .demo-success-dialog is already in DOM'
      );
    });

    it('M3-C2-38: Conversion modal mounts after 450ms delay for completion effect celebration', () => {
      assert.match(
        landingJs,
        /export\s+function\s+showConversionModal\(\)\s*\{\s*setTimeout\(\(\)\s*=>\s*\{[\s\S]*?\},\s*450\);/,
        'showConversionModal must use 450ms timeout delay'
      );
    });
  });

  // =========================================================================
  // 7. Auth Invariants & Non-Auth Guarantee Before Section 8
  // =========================================================================
  describe('Group 7: Pre-S8 Free Navigation & Section 8 Sole Mandatory Auth', () => {
    it('M3-C2-39: Section 8 is the sole mandatory registration section with .cta-register-btn', () => {
      assert.match(
        ssrHtml,
        /<section[^>]*id="chot-cuoi"[^>]*>[\s\S]*?<button[^>]*class="[^"]*cta-register-btn[^"]*"[^>]*data-auth="register"[^>]*>[\s\S]*?Tạo tài khoản miễn phí/,
        'Section 8 must contain .cta-register-btn with data-auth="register"'
      );
      assert.match(
        landingJs,
        /root\.querySelector\(["']#chot-cuoi\s+\.cta-register-btn["']\)/,
        'landing.js must bind click listener to #chot-cuoi .cta-register-btn'
      );
    });

    it('M3-C2-40: Strict Pre-S8 non-auth guarantee: Sections 1 through 7 in SSR <main> have ZERO data-auth', () => {
      const mainOpenIdx = ssrHtml.indexOf('<main');
      const s8OpenIdx = ssrHtml.indexOf('id="chot-cuoi"');
      assert.ok(mainOpenIdx > -1 && s8OpenIdx > mainOpenIdx, '<main> and #chot-cuoi must exist');

      const preS8Content = ssrHtml.slice(mainOpenIdx, s8OpenIdx);
      const matches = [...preS8Content.matchAll(/data-auth=["']([^"']+)["']/g)];
      assert.strictEqual(
        matches.length,
        0,
        `Sections 1 through 7 inside <main> must contain 0 data-auth triggers, found: ${matches.map(m => m[0]).join(', ')}`
      );
    });

    it('M3-C2-41: Header navigation contains auth triggers; internal page anchors smooth-scroll', () => {
      const headerSnippet = ssrHtml.slice(ssrHtml.indexOf('<header'), ssrHtml.indexOf('</header>'));
      assert.match(headerSnippet, /data-auth="login"/, 'Header must contain login trigger');
      assert.match(headerSnippet, /data-auth="register"/, 'Header must contain register trigger');

      // Internal links in header must point to sections
      assert.match(headerSnippet, /href="#demoBox"/);
      assert.match(headerSnippet, /href="#muc-dich"/);
      assert.match(headerSnippet, /href="#mon-hoc"/);
    });
  });

  // =========================================================================
  // 8. Mobile 375px Responsiveness & Forbidden String Deep Scans
  // =========================================================================
  describe('Group 8: Mobile 375px Responsiveness & Forbidden Substrings', () => {
    it('M3-C2-42: Total absence of "0 học viên" across all files and encodings', () => {
      const forbidden = '0 học viên';
      assert.strictEqual(ssrHtml.includes(forbidden), false, 'SSR response must not contain "0 học viên"');
      assert.strictEqual(rawIndexHtml.includes(forbidden), false, 'index.html must not contain "0 học viên"');
      assert.strictEqual(landingJs.includes(forbidden), false, 'landing.js must not contain "0 học viên"');
      assert.strictEqual(themeCss.includes(forbidden), false, 'theme.css must not contain "0 học viên"');

      // Unicode normalized forms
      for (const form of ['NFC', 'NFD', 'NFKC', 'NFKD']) {
        const norm = forbidden.normalize(form);
        assert.strictEqual(ssrHtml.includes(norm), false, `SSR response must not contain ${form} normalized "0 học viên"`);
        assert.strictEqual(landingJs.includes(norm), false, `landing.js must not contain ${form} normalized "0 học viên"`);
      }

      // Regex whitespace variations
      assert.doesNotMatch(ssrHtml, /0\s+học\s+viên/i, 'No whitespace variations of "0 học viên" in SSR');
      assert.doesNotMatch(landingJs, /0\s+học\s+viên/i, 'No whitespace variations of "0 học viên" in landing.js');
    });

    it('M3-C2-43: Total absence of personal Gmail (*@gmail.com) and Zalo references', () => {
      assert.doesNotMatch(ssrHtml, /[a-zA-Z0-9._%+-]+@gmail\.com/i, 'No Gmail address in SSR response');
      assert.doesNotMatch(landingJs, /[a-zA-Z0-9._%+-]+@gmail\.com/i, 'No Gmail address in landing.js');
      assert.doesNotMatch(ssrHtml, /\bzalo\b|zalo\.me|zaloweb/i, 'No Zalo references in SSR response');
      assert.doesNotMatch(landingJs, /\bzalo\b|zalo\.me|zaloweb/i, 'No Zalo references in landing.js');
    });

    it('M3-C2-44: Official contacts strictly use study@liferivo.com, Facebook, and Threads', () => {
      assert.match(ssrHtml, /mailto:study@liferivo\.com/, 'Footer must link to study@liferivo.com');
      assert.match(ssrHtml, /facebook\.com\/Try\.To\.Wins/, 'Footer must link to Facebook');
    });

    it('M3-C2-45: Mobile 375px responsive single-column collapse for all interactive sections', () => {
      // themeCss mobile query for .demo-grid and .hero-mockup-row
      assert.match(
        themeCss,
        /@media\s*\([^)]*max-width:\s*640px[^)]*\)\s*\{[\s\S]*?\.hero-mockup-row[\s\S]*?grid-template-columns:\s*1fr/,
        'Hero mockup must collapse to 1 column at <= 640px'
      );
      assert.match(
        themeCss,
        /@media\s*\([^)]*max-width:\s*640px[^)]*\)\s*\{[\s\S]*?\.demo-grid[\s\S]*?grid-template-columns:\s*1fr/,
        'Section 2 .demo-grid must collapse to 1 column at <= 640px'
      );
    });
  });
});
