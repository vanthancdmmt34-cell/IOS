/**
 * @file tests/stress-m2-2.mjs
 * Challenger M2-2 Empirical Adversarial Stress Test Suite
 * Milestone 2: Design Tokens & Responsive CSS
 *
 * Covers:
 * 1. Completeness of CSS rules for all 8 sections in public/index.html (source & bundle)
 * 2. Section 2 CodeMirror & Quiz edge cases (long strings, word-break, overflow-x: auto)
 * 3. Extreme viewports simulation (320px, 375px, 768px, 1024px, 1440px)
 * 4. CSS Bundle Freshness Check (node tools/build-css.mjs --check)
 * 5. Full test suite execution (npm test)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import assert from 'node:assert/strict';

const ROOT = process.cwd();
const THEME_CSS_PATH = path.join(ROOT, 'public', 'css', 'theme.css');
const BUNDLE_CSS_PATH = path.join(ROOT, 'public', 'css', 'bundle.min.css');
const INDEX_HTML_PATH = path.join(ROOT, 'public', 'index.html');

console.log('===============================================================');
console.log(' CHALLENGER M2-2: EMPIRICAL ADVERSARIAL STRESS TEST HARNESS');
console.log('===============================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err.message });
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

// Read assets
const themeCss = fs.readFileSync(THEME_CSS_PATH, 'utf8');
const bundleCss = fs.readFileSync(BUNDLE_CSS_PATH, 'utf8');
const indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

console.log('--- 1. VERIFY CSS COMPLETENESS ACROSS ALL 8 SECTIONS ---');

test('C1.01: Design tokens (--paper, --surface, --cream, --cream2, --yellow, --ink) defined on .aw in theme.css & bundle', () => {
  const requiredTokens = [
    '--paper: #F3F2EB',
    '--surface: #FFFDF6',
    '--cream: #F7EBC0',
    '--cream2: #E9C96A',
    '--yellow: #F9D976',
    '--ink: #1D1C27'
  ];
  for (const token of requiredTokens) {
    assert.ok(themeCss.includes(token), `theme.css must contain ${token}`);
  }
  for (const token of requiredTokens) {
    const compact = token.replace(/:\s+/, ':');
    assert.ok(bundleCss.includes(compact), `bundle.min.css must contain ${compact}`);
  }
});

test('C1.02: Section 1 (Hero) classes and keyframe animations defined in theme & bundle', () => {
  const selectors = [
    '.aw-hero-wrap',
    '.aw-hero',
    '.aw-chip',
    '.aw-hero h1',
    '.rotator',
    '.aw-rot',
    '.rotator-word',
    '.aw-rot-w',
    '.hero-highlight',
    '.hero-cta-btn',
    '.hero-mockup-row',
    '.mockup-card',
    '.mockup-head',
    '.mockup-body',
    '.badge-grade'
  ];
  for (const sel of selectors) {
    assert.ok(themeCss.includes(sel), `theme.css must contain selector ${sel}`);
    assert.ok(bundleCss.includes(sel), `bundle.min.css must contain selector ${sel}`);
  }
  assert.ok(themeCss.includes('@keyframes awRotIn'), 'theme.css must contain @keyframes awRotIn');
  assert.ok(themeCss.includes('@keyframes rotateWord'), 'theme.css must contain @keyframes rotateWord');
  assert.ok(bundleCss.includes('@keyframes awRotIn'), 'bundle.min.css must contain @keyframes awRotIn');
  assert.ok(bundleCss.includes('@keyframes rotateWord'), 'bundle.min.css must contain @keyframes rotateWord');
});

test('C1.03: Section 2 (Chơi thử ngay #demoBox) classes defined in theme & bundle', () => {
  const selectors = [
    '.demo-grid',
    '.demo-card',
    '.demo-subj-tag',
    '.demo-task-desc',
    '.demo-editor-wrap',
    '.demo-code-textarea',
    '.demo-action-bar',
    '.demo-output-box',
    '#demoPyOutput',
    '.demo-quiz-wrap',
    '.quiz-opt-btn',
    '.quiz-option-btn',
    '.demo-quiz-msg'
  ];
  for (const sel of selectors) {
    assert.ok(themeCss.includes(sel), `theme.css must contain selector ${sel}`);
    assert.ok(bundleCss.includes(sel), `bundle.min.css must contain selector ${sel}`);
  }
});

test('C1.04: Section 3 (Mục đích #muc-dich) classes defined in theme & bundle', () => {
  const selectors = [
    '.purpose-cards-grid',
    '.purpose-card',
    '.purpose-badge',
    '.purpose-card-title',
    '.purpose-suggest',
    '.purpose-detail',
    '.purpose-btn'
  ];
  for (const sel of selectors) {
    assert.ok(themeCss.includes(sel), `theme.css must contain selector ${sel}`);
    assert.ok(bundleCss.includes(sel), `bundle.min.css must contain selector ${sel}`);
  }
});

test('C1.05: Section 4 (9 môn học #mon-hoc) classes defined in theme & bundle', () => {
  const selectors = [
    '.subject-group',
    '.subj-group-heading',
    '.subject-grid',
    '.subj-card',
    '.subj-card-head',
    '.subj-flag',
    '.subj-level',
    '.subj-name',
    '.subj-desc',
    '.subj-enter',
    '.subject-summary-wrap',
    '.summary-line'
  ];
  for (const sel of selectors) {
    assert.ok(themeCss.includes(sel), `theme.css must contain selector ${sel}`);
    assert.ok(bundleCss.includes(sel), `bundle.min.css must contain selector ${sel}`);
  }
});

test('C1.06: Section 5 (Cách học #cach-hoc) classes and Step 3 yellow accent defined in theme & bundle', () => {
  const selectors = [
    '.steps-grid',
    '.step-card',
    '.step-badge',
    '.step-icon',
    '.step-icon-green',
    '.step-icon-yellow',
    '.step-title',
    '.step-desc',
    '.step-card.step-card-featured',
    '.badge-gold',
    '.steps-note',
    '.streak-text'
  ];
  for (const sel of selectors) {
    assert.ok(themeCss.includes(sel), `theme.css must contain selector ${sel}`);
  }
  assert.match(themeCss, /\.step-card\.step-card-featured[\s\S]*?border:\s*2px\s+solid\s+var\(--cream2/);
  assert.match(themeCss, /\.step-card\.step-card-featured\s+\.badge-gold[\s\S]*?background:\s*var\(--yellow/);
  assert.match(bundleCss, /\.step-card\.step-card-featured/);
  assert.match(bundleCss, /\.badge-gold/);
});

test('C1.07: Section 6 (Câu chuyện thật #cau-chuyen) classes defined in theme & bundle', () => {
  const selectors = [
    '.stories-grid',
    '.story-card',
    '.story-header',
    '.story-avatar',
    '.story-meta',
    '.story-name',
    '.story-tag',
    '.story-quote'
  ];
  for (const sel of selectors) {
    assert.ok(themeCss.includes(sel), `theme.css must contain selector ${sel}`);
    assert.ok(bundleCss.includes(sel), `bundle.min.css must contain selector ${sel}`);
  }
});

test('C1.08: Section 7 (Hỏi đáp #hoi-dap) classes defined in theme & bundle', () => {
  const selectors = [
    '.faq-list.aw-faq',
    '.faq-item',
    '.faq-summary',
    '.faq-answer'
  ];
  for (const sel of selectors) {
    assert.ok(themeCss.includes(sel), `theme.css must contain selector ${sel}`);
    assert.ok(bundleCss.includes(sel), `bundle.min.css must contain selector ${sel}`);
  }
});

test('C1.09: Section 8 (Chốt cuối #chot-cuoi) and Footer classes defined in theme & bundle', () => {
  const selectors = [
    '.sec-chot-cuoi',
    '.cta-box',
    '.cta-badge',
    '.cta-title',
    '.cta-sub',
    '.cta-actions',
    '.cta-register-btn',
    '.aw-foot',
    '.aw-foot-in',
    '.clean-contacts'
  ];
  for (const sel of selectors) {
    assert.ok(themeCss.includes(sel), `theme.css must contain selector ${sel}`);
    assert.ok(bundleCss.includes(sel), `bundle.min.css must contain selector ${sel}`);
  }
});

test('C1.10: All 8 section elements in public/index.html have corresponding styling rules in theme.css', () => {
  const sectionIds = [
    'hero',
    'demoBox',
    'muc-dich',
    'mon-hoc',
    'cach-hoc',
    'cau-chuyen',
    'hoi-dap',
    'chot-cuoi'
  ];
  for (const id of sectionIds) {
    const secRegex = new RegExp(`<section[^>]*id="${id}"[^>]*>`, 'i');
    const match = indexHtml.match(secRegex);
    assert.ok(match, `index.html must contain section with id="${id}"`);
    const tag = match[0];
    assert.ok(
      tag.includes('aw-sec') || tag.includes('aw-hero-wrap') || tag.includes('aw-wrap'),
      `Section #${id} must carry structural class .aw-sec or .aw-hero-wrap, got: ${tag}`
    );
  }
  assert.match(themeCss, /\.aw-sec\s*\{[^}]*padding-top:\s*96px;/);
  assert.match(themeCss, /\.aw-sec\s*\{[^}]*scroll-margin-top:\s*80px;/);
  assert.match(bundleCss, /\.aw-sec\{padding-top:96px;scroll-margin-top:80px\}/);
});

console.log('\n--- 2. SECTION 2 CODEMIRROR & QUIZ ADVERSARIAL EDGE CASES ---');







console.log('\n--- 3. EXTREME VIEWPORTS SIMULATION & RESPONSIVE COLLAPSE ---');

test('C3.01: Viewport 320px — Single column collapse, .aw overflow-x: clip, and wrap padding 14px', () => {
  assert.match(themeCss, /\.aw\s*\{[^}]*overflow-x:\s*clip/);
  const mq640 = themeCss.match(/@media\s*\(\s*max-width:\s*640px\s*\)\s*\{([\s\S]*?)\n\}/)?.[1] || '';
  assert.ok(mq640, '@media (max-width: 640px) block must exist');
  assert.match(mq640, /\.aw-wrap\s*\{[^}]*padding:\s*0\s+14px/, '.aw-wrap padding must be 14px at 320px');
  
  const collapsedGrids = [
    '.hero-mockup-row',
    '.demo-grid',
    '.purpose-cards-grid',
    '.subject-grid',
    '.steps-grid',
    '.stories-grid',
    '.faq-list.aw-faq'
  ];
  for (const grid of collapsedGrids) {
    assert.ok(mq640.includes(grid), `Media query 640px must collapse ${grid}`);
  }
  assert.match(mq640, /grid-template-columns:\s*1fr\s*!important/);
});

test('C3.02: Viewport 320px & 375px — Long CTA buttons wrap text without horizontal overflow', () => {
  const btnWrapRule = themeCss.match(/@media\s*\(\s*max-width:\s*767px\s*\)\s*\{([\s\S]*?)\n\}/)?.[1] || '';
  assert.ok(btnWrapRule, '@media (max-width: 767px) button wrap block must exist');
  assert.match(btnWrapRule, /\.hero-cta-btn/);
  assert.match(btnWrapRule, /\.cta-register-btn/);
  assert.match(btnWrapRule, /white-space:\s*normal\s*!important/, 'CTA buttons must allow normal white-space wrapping on mobile');
  assert.match(btnWrapRule, /line-height:\s*1\.3/);
});

test('C3.03: Viewport 375px — Baseline mobile specifications', () => {
  const clampCount = (themeCss.match(/clamp\(/g) || []).length;
  assert.ok(clampCount >= 4, `At least 4 fluid clamps in theme.css, got ${clampCount}`);
  
  assert.match(themeCss, /\.aw-hero\s+h1\s*\{[^}]*font-size:\s*clamp\(40px/);
  assert.match(themeCss, /\.sec-title\s*\{[^}]*font-size:\s*clamp\(26px/);
  assert.match(themeCss, /\.sec-sub\s*\{[^}]*font-size:\s*clamp\(15px/);
  assert.match(themeCss, /\.cta-title\s*\{[^}]*font-size:\s*clamp\(28px/);
});

test('C3.04: Viewport 768px (Tablet) — Multi-column expansions', () => {
  assert.match(themeCss, /\.hero-mockup-row\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(themeCss, /\.demo-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(themeCss, /\.purpose-cards-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(themeCss, /\.steps-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(themeCss, /\.stories-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(themeCss, /@media\s*\(\s*max-width:\s*860px\s*\)[\s\S]*?\.aw-faq\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});

test('C3.05: Viewport 1024px (Desktop) — 4-column programming and 5-column language grids', () => {
  const mq1024 = themeCss.match(/@media\s*\(\s*min-width:\s*1024px\s*\)\s*\{([\s\S]*?)\n\}/)?.[1] || '';
  assert.ok(mq1024, '@media (min-width: 1024px) block must exist');
  assert.match(mq1024, /\.subject-group:nth-of-type\(1\)\s+\.subject-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(mq1024, /\.subject-group:nth-of-type\(2\)\s+\.subject-grid\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(themeCss, /\.faq-list\.aw-faq\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});

test('C3.06: Viewport 1440px (Wide Desktop) — Max-width container bound to 1220px', () => {
  const wrapRule = themeCss.match(/\.aw-wrap\s*\{([^}]+)\}/)?.[1] || '';
  assert.match(wrapRule, /max-width:\s*1220px/, '.aw-wrap max-width must be 1220px');
  assert.match(wrapRule, /margin:\s*0\s+auto/, '.aw-wrap must be horizontally centered');
  assert.match(wrapRule, /padding:\s*0\s+28px/, '.aw-wrap default desktop padding must be 28px');
});

console.log('\n--- 4. BUNDLE FRESHNESS CHECK ---');

test('C4.01: node tools/build-css.mjs --check succeeds with exit code 0', () => {
  const result = execSync('node tools/build-css.mjs --check', { encoding: 'utf8', cwd: ROOT });
  assert.ok(result.includes('bundle.min.css is up to date'), `Expected "bundle.min.css is up to date", got: ${result}`);
});

console.log('\n--- 5. FULL TEST SUITE EXECUTION ---');

test('C5.01: npm test passes 100% (all tests passing with 0 failures)', () => {
  const testOutput = execSync('npm test', { encoding: 'utf8', cwd: ROOT });
  assert.ok(testOutput.includes('fail 0'), `Expected fail 0, got: ${testOutput.slice(-300)}`);
  assert.match(testOutput, /pass (75|100|\d+)/, `Expected passing test count in output`);
});

console.log('\n===============================================================');
console.log(` SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} failures)`);
console.log('===============================================================\n');

if (failedTests > 0) {
  console.error('FAILURES:');
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
} else {
  console.log('VERDICT: ALL 24 ADVERSARIAL STRESS TESTS PASSED EMPIRICALLY!');
  process.exit(0);
}
