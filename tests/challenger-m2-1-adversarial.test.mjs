/**
 * @file tests/challenger-m2-1-adversarial.test.mjs
 * Challenger M2-1 Adversarial Empirical Verification Suite
 * Milestone 2: Design Tokens & Responsive CSS
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { getTestServer } from './helpers/test-server.mjs';

const ROOT = process.cwd();

describe('Milestone 2 Adversarial Verification (Challenger M2-1)', () => {
  let testServer;
  let ssrHtml;
  let themeCss;
  let bundleCss;
  let awSectionTheme;
  let awSectionBundle;

  before(async () => {
    testServer = await getTestServer();
    const res = await testServer.fetch('/');
    assert.strictEqual(res.status, 200, 'HTTP status must be 200 OK');
    ssrHtml = await res.text();

    themeCss = fs.readFileSync(path.join(ROOT, 'public', 'css', 'theme.css'), 'utf8');
    bundleCss = fs.readFileSync(path.join(ROOT, 'public', 'css', 'bundle.min.css'), 'utf8');

    // Extract .aw scope (landing-v3 to user-dash) in themeCss
    const startIdx = themeCss.indexOf('/* ===================== landing-v3 ===================== */');
    const endIdx = themeCss.indexOf('/* ===================== user-dash ===================== */');
    assert.ok(startIdx !== -1 && endIdx !== -1 && endIdx > startIdx, 'Theme CSS must demarcate landing-v3 and user-dash');
    awSectionTheme = themeCss.slice(startIdx, endIdx);

    // In minified bundle, find .aw up to body.in-app
    const bStart = bundleCss.indexOf('.aw{');
    const bEnd = bundleCss.indexOf('body.in-app:not(.ax-on)');
    assert.ok(bStart !== -1 && bEnd !== -1 && bEnd > bStart, 'Bundle CSS must contain .aw and user-dash styles');
    awSectionBundle = bundleCss.slice(bStart, bEnd);
  });

  after(async () => {
    if (testServer) {
      await testServer.close();
    }
  });

  // =========================================================================
  // 1. CSS Token Invariants & Cold Dark Absence
  // =========================================================================
  it('M2-C1-01: Palette tokens on .aw are defined and match exact hex specs', () => {
    const requiredTokens = [
      { name: '--paper', expected: '#FAF6EC' },
      { name: '--cream', expected: '#F7EBC0' },
      { name: '--cream2', expected: '#E9C96A' },
      { name: '--ink', expected: '#1C1917' },
      { name: '--surface', expected: '#FFFDF7' },
      { name: '--paper-2', expected: '#FFFDF7' },
      { name: '--paper-3', expected: '#F4ECDC' },
      { name: '--yellow', expected: '#F9D976' },
      { name: '--line', expected: '#D1C7B3' }
    ];

    for (const { name, expected } of requiredTokens) {
      const regex = new RegExp(`${name}:\\s*${expected}`, 'i');
      assert.match(awSectionTheme, regex, `theme.css must declare ${name}: ${expected} on .aw`);
      assert.match(awSectionBundle, regex, `bundle.min.css must declare ${name}: ${expected}`);
    }
  });

  it('M2-C1-02: Cold dark absence in .aw styles (no #000000, #0a0a0a, #0f172a, #000 as backgrounds)', () => {
    const forbiddenHex = ['#000000', '#0a0a0a', '#0f172a', '#0a0a0a'];
    for (const hex of forbiddenHex) {
      const bgRegex = new RegExp(`background(-color)?\\s*:[^;}]*${hex}`, 'i');
      assert.doesNotMatch(awSectionTheme, bgRegex, `theme.css .aw must not contain background with ${hex}`);
      assert.doesNotMatch(awSectionBundle, bgRegex, `bundle.min.css .aw must not contain background with ${hex}`);
    }

    // In minified bundle, check no background:#000; or background:#000000
    assert.doesNotMatch(awSectionBundle, /background(-color)?:\s*#000(000)?(?![0-9a-fA-F])/i, 'bundle.min.css .aw must not use #000 background');
  });

  it('M2-C1-03: Zero cold dark text colors or border colors in .aw scope', () => {
    // Assert color and border do not use cold dark slate (#0F172A) or pure black #000000
    assert.doesNotMatch(awSectionTheme, /color\s*:[^;}]*#0F172A/i, 'No text color #0F172A in .aw');
    assert.doesNotMatch(awSectionTheme, /border(-color)?\s*:[^;}]*#0F172A/i, 'No border color #0F172A in .aw');
    assert.doesNotMatch(awSectionBundle, /color:[^;}]*#0F172A/i, 'No text color #0F172A in bundle .aw');
    assert.doesNotMatch(awSectionBundle, /border(-color)?:[^;}]*#0F172A/i, 'No border color #0F172A in bundle .aw');
  });

  it('M2-C1-04: HTML theme-color matches warm paper token #FAF6EC', () => {
    assert.match(ssrHtml, /<meta\s+name="theme-color"\s+content="#FAF6EC"/i, 'HTML meta theme-color must be #FAF6EC');
  });

  // =========================================================================
  // 2. 375px Mobile Viewport & 1-Column Grid Collapse
  // =========================================================================
  it('M2-C1-05: Mobile-first container styling enforces box-sizing and overflow-x clip', () => {
    assert.match(awSectionTheme, /\.aw\s*\{[^}]*overflow-x:\s*clip/i, 'Root .aw must enforce overflow-x: clip');
    assert.match(awSectionTheme, /\.aw\s*\*\s*,\s*\.aw\s*\*::before\s*,\s*\.aw\s*\*::after\s*\{[^}]*box-sizing:\s*border-box/i, 'Universal box-sizing: border-box');
  });

  it('M2-C1-06: Section 1 .hero-mockup-row collapses to 1 column on mobile (<640px)', () => {
    const mQuery = awSectionTheme.match(/@media\s*\(\s*max-width:\s*640px\s*\)\s*\{([\s\S]*?)\n\}/);
    assert.ok(mQuery, 'theme.css must contain @media (max-width: 640px)');
    const body = mQuery[1];
    assert.match(body, /\.hero-mockup-row[\s\S]*?grid-template-columns:\s*1fr\s*!important/i, '.hero-mockup-row must collapse to 1fr !important');
    assert.match(awSectionBundle, /\.hero-mockup-row[^}]*grid-template-columns:1fr\s*!important/i, 'bundle must have .hero-mockup-row collapse');
  });

  it('M2-C1-07: Section 2 .demo-grid collapses to 1 column on mobile (<640px)', () => {
    const mQuery = awSectionTheme.match(/@media\s*\(\s*max-width:\s*640px\s*\)\s*\{([\s\S]*?)\n\}/);
    const body = mQuery[1];
    assert.match(body, /\.demo-grid[\s\S]*?grid-template-columns:\s*1fr\s*!important/i, '.demo-grid must collapse to 1fr !important');
    assert.match(awSectionBundle, /\.demo-grid[^}]*grid-template-columns:1fr\s*!important/i, 'bundle must have .demo-grid collapse');
  });

  it('M2-C1-08: Section 3 .purpose-cards-grid collapses to 1 column on mobile (<640px)', () => {
    const mQuery = awSectionTheme.match(/@media\s*\(\s*max-width:\s*640px\s*\)\s*\{([\s\S]*?)\n\}/);
    const body = mQuery[1];
    assert.match(body, /\.purpose-cards-grid[\s\S]*?grid-template-columns:\s*1fr\s*!important/i, '.purpose-cards-grid must collapse to 1fr !important');
    assert.match(awSectionBundle, /\.purpose-cards-grid[^}]*grid-template-columns:1fr\s*!important/i, 'bundle must have .purpose-cards-grid collapse');
  });

  it('M2-C1-09: Section 4 .subject-grid collapses to 1 column on mobile (<640px)', () => {
    const mQuery = awSectionTheme.match(/@media\s*\(\s*max-width:\s*640px\s*\)\s*\{([\s\S]*?)\n\}/);
    const body = mQuery[1];
    assert.match(body, /\.subject-grid[\s\S]*?grid-template-columns:\s*1fr\s*!important/i, '.subject-grid must collapse to 1fr !important');
    assert.match(awSectionBundle, /\.subject-grid[^}]*grid-template-columns:1fr\s*!important/i, 'bundle must have .subject-grid collapse');
  });

  it('M2-C1-10: Section 5 .steps-grid collapses to 1 column on mobile (<640px)', () => {
    const mQuery = awSectionTheme.match(/@media\s*\(\s*max-width:\s*640px\s*\)\s*\{([\s\S]*?)\n\}/);
    const body = mQuery[1];
    assert.match(body, /\.steps-grid[\s\S]*?grid-template-columns:\s*1fr\s*!important/i, '.steps-grid must collapse to 1fr !important');
    assert.match(awSectionBundle, /\.steps-grid[^}]*grid-template-columns:1fr\s*!important/i, 'bundle must have .steps-grid collapse');
  });

  it('M2-C1-11: Section 6 .stories-grid collapses to 1 column on mobile (<640px)', () => {
    const mQuery = awSectionTheme.match(/@media\s*\(\s*max-width:\s*640px\s*\)\s*\{([\s\S]*?)\n\}/);
    const body = mQuery[1];
    assert.match(body, /\.stories-grid[\s\S]*?grid-template-columns:\s*1fr\s*!important/i, '.stories-grid must collapse to 1fr !important');
    assert.match(awSectionBundle, /\.stories-grid[^}]*grid-template-columns:1fr\s*!important/i, 'bundle must have .stories-grid collapse');
  });

  it('M2-C1-12: Section 7 .faq-list.aw-faq collapses to 1 column on mobile (<640px)', () => {
    const mQuery = awSectionTheme.match(/@media\s*\(\s*max-width:\s*640px\s*\)\s*\{([\s\S]*?)\n\}/);
    const body = mQuery[1];
    assert.match(body, /\.faq-list\.aw-faq[\s\S]*?grid-template-columns:\s*1fr\s*!important/i, '.faq-list.aw-faq must collapse to 1fr !important');
    assert.match(awSectionBundle, /\.faq-list\.aw-faq[^}]*grid-template-columns:1fr\s*!important/i, 'bundle must have .faq-list.aw-faq collapse');
  });

  it('M2-C1-13: Section 8 .cta-box has mobile adaptive padding and shadow', () => {
    const mQuery = awSectionTheme.match(/@media\s*\(\s*max-width:\s*640px\s*\)\s*\{([\s\S]*?)\n\}/);
    const body = mQuery[1];
    assert.match(body, /\.cta-box\s*\{[^}]*padding:\s*38px\s+18px/i, '.cta-box padding on mobile must be 38px 18px');
    assert.match(body, /\.cta-box\s*\{[^}]*box-shadow:\s*4px\s+5px\s+0\s+var\(--cream2\)/i, '.cta-box shadow on mobile must be 4px 5px 0 var(--cream2)');
  });

  it('M2-C1-14: Mobile container .aw-wrap padding is 14px (inner width = 347px on 375px)', () => {
    assert.match(
      awSectionTheme,
      /@media\s*\(\s*max-width:\s*640px\s*\)[\s\S]*?\.aw-wrap\s*\{[^}]*padding:\s*0\s+14px/i,
      '.aw-wrap padding must be 0 14px on mobile'
    );
  });

  // =========================================================================
  // 3. Button Wrapping on Mobile (375px & 320px Zero-Overflow)
  // =========================================================================
  it('M2-C1-15: CTA buttons wrap cleanly on mobile (<767px) with white-space: normal !important', () => {
    const mQuery767 = awSectionTheme.match(/@media\s*\(\s*max-width:\s*767px\s*\)\s*\{([\s\S]*?)\n\}/);
    assert.ok(mQuery767, 'theme.css must contain @media (max-width: 767px)');
    const body = mQuery767[1];
    assert.match(body, /\.hero-cta-btn[\s\S]*?white-space:\s*normal\s*!important/i, '.hero-cta-btn must have white-space: normal !important');
    assert.match(body, /\.cta-register-btn[\s\S]*?white-space:\s*normal\s*!important/i, '.cta-register-btn must have white-space: normal !important');
    assert.match(body, /line-height:\s*1\.3/i, 'Must specify line-height: 1.3 for multi-line wrapped text');
    assert.match(body, /min-height:\s*48px/i, 'Must specify min-height: 48px for touch targets');
    assert.match(body, /padding:\s*12px\s+18px/i, 'Must specify padding: 12px 18px');
  });

  it('M2-C1-16: Button wrapping rule preserved in compiled bundle.min.css', () => {
    assert.match(
      awSectionBundle,
      /\.cta-register-btn\{white-space:normal\s*!important;line-height:1\.3;text-align:center;height:auto;min-height:48px;padding:12px 18px;box-sizing:border-box\}/i,
      'bundle.min.css must contain exact minified mobile button wrap declaration'
    );
  });

  // =========================================================================
  // 4. Hero Rotator Keyframes & Selectors
  // =========================================================================
  it('M2-C1-17: Keyframe awRotIn defines fade and slide-up transform in theme.css and bundle', () => {
    assert.match(awSectionTheme, /@keyframes\s+awRotIn\s*\{\s*from\s*\{\s*transform:\s*translateY\(100%\);\s*opacity:\s*0;\s*\}\s*to\s*\{\s*transform:\s*none;\s*opacity:\s*1;\s*\}\s*\}/i);
    assert.match(awSectionBundle, /@keyframes awRotIn\{from\{transform:translateY\(100%\);opacity:0\}to\{transform:none;opacity:1\}\}/i);
  });

  it('M2-C1-18: Keyframe rotateWord defines identical fade and slide-up transform', () => {
    assert.match(awSectionTheme, /@keyframes\s+rotateWord\s*\{\s*from\s*\{\s*transform:\s*translateY\(100%\);\s*opacity:\s*0;\s*\}\s*to\s*\{\s*transform:\s*none;\s*opacity:\s*1;\s*\}\s*\}/i);
    assert.match(awSectionBundle, /@keyframes rotateWord\{from\{transform:translateY\(100%\);opacity:0\}to\{transform:none;opacity:1\}\}/i);
  });

  it('M2-C1-19: Rotator selector classes bind awRotIn and define overflow hidden', () => {
    assert.match(awSectionTheme, /\.aw-rot\s*,\s*\.rotator\s*\{[^}]*overflow:\s*hidden/i, 'rotator container must have overflow: hidden');
    assert.match(awSectionTheme, /\.aw-rot-w\.in\s*,\s*\.rotator-word\.in\s*\{[^}]*animation:\s*awRotIn/i, '.rotator-word.in must trigger awRotIn');
    assert.match(awSectionBundle, /\.aw-rot,\.rotator\{/i, 'bundle must style .rotator');
    assert.match(awSectionBundle, /\.aw-rot-w\.in,\.rotator-word\.in\{animation:awRotIn/i, 'bundle must bind awRotIn');
  });

  // =========================================================================
  // 5. Section 5 Step 3 Featured Card & Golden Badge
  // =========================================================================
  it('M2-C1-20: Section 5 Step 3 featured card defines unique yellow/cream gradient & border', () => {
    assert.match(
      awSectionTheme,
      /\.step-card\.step-card-featured\s*\{[^}]*background:\s*linear-gradient\(180deg,\s*#FFFDF7\s+0%,\s*#FEF9E7\s+100%\)\s*!important/i,
      'Featured step card must have warm yellow/cream gradient'
    );
    assert.match(
      awSectionTheme,
      /\.step-card\.step-card-featured\s*\{[^}]*border:\s*2px\s+solid\s+var\(--cream2,\s*#E9C96A\)\s*!important/i,
      'Featured step card must have 2px cream2 border'
    );
    assert.match(
      awSectionTheme,
      /\.step-card\.step-card-featured\s*\{[^}]*box-shadow:\s*4px\s+5px\s+0\s+var\(--cream2,\s*#E9C96A\)/i,
      'Featured step card must have 3D shadow'
    );
  });

  it('M2-C1-21: Section 5 Step 3 badge-gold defines yellow background and bold ink text', () => {
    assert.match(
      awSectionTheme,
      /\.step-card\.step-card-featured\s+\.badge-gold\s*\{[^}]*background:\s*var\(--yellow,\s*#F9D976\)\s*!important/i,
      '.badge-gold must have yellow background'
    );
    assert.match(
      awSectionTheme,
      /\.step-card\.step-card-featured\s+\.badge-gold\s*\{[^}]*color:\s*var\(--ink,\s*#1C1917\)\s*!important/i,
      '.badge-gold text color must be gentle charcoal ink'
    );
    assert.match(
      awSectionTheme,
      /\.step-card\.step-card-featured\s+\.badge-gold\s*\{[^}]*font-weight:\s*800/i,
      '.badge-gold font-weight must be 800'
    );
  });

  it('M2-C1-22: Section 5 Step 3 icon styling uses amber stroke and cream background', () => {
    assert.match(awSectionTheme, /\.step-icon-yellow\s*\{[^}]*background:\s*var\(--cream,\s*#F7EBC0\)\s*!important/i, 'Icon background must be cream');
    assert.match(awSectionTheme, /\.step-icon-yellow\s*\{[^}]*border:\s*1px\s+solid\s+var\(--yellow,\s*#F9D976\)/i, 'Icon border must be yellow');
    assert.match(awSectionTheme, /\.step-icon-yellow\s+svg\s*\{[^}]*stroke:\s*#B45309/i, 'Icon SVG stroke must be amber #B45309');
  });

  // =========================================================================
  // 6. Section 2 Overflow Protection (Code Output & Quiz Options)
  // =========================================================================

  it('M2-C1-24: Quiz option buttons enforce word-break and box-sizing', () => {
    assert.match(awSectionTheme, /\.quiz-opt-btn\s*,\s*\.quiz-option-btn\s*\{[^}]*word-break:\s*break-word/i);
    assert.match(awSectionTheme, /\.quiz-opt-btn\s*,\s*\.quiz-option-btn\s*\{[^}]*box-sizing:\s*border-box/i);
  });

  // =========================================================================
  // 7. Bundle Build Consistency Check
  // =========================================================================
  it('M2-C1-25: tools/build-css.mjs --check runs cleanly with exit code 0', () => {
    const output = execSync('node tools/build-css.mjs --check', {
      cwd: ROOT,
      encoding: 'utf8'
    });
    assert.match(output, /bundle\.min\.css is up to date/i, 'Bundle freshness check must report up to date');
  });
});
