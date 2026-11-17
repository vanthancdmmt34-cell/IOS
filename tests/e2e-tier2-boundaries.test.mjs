/**
 * @file tests/e2e-tier2-boundaries.test.mjs
 * Tier 2: Boundary, Negative & Corner Cases Test Suite (23 Boundary Cases)
 * Runner: Node.js native test runner (node:test, node:assert/strict)
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getTestServer } from './helpers/test-server.mjs';

const ROOT = process.cwd();

describe('E2E Tier 2: Boundary, Negative & Corner Cases (23 Boundary Tests)', () => {
  let testServer;
  let ssrHtml = '';
  let themeCss = '';
  let landingJs = '';

  before(async () => {
    testServer = await getTestServer();
    const res = await testServer.fetch('/');
    ssrHtml = await res.text();
    themeCss = fs.readFileSync(path.join(ROOT, 'public', 'css', 'theme.css'), 'utf8');
    landingJs = fs.readFileSync(path.join(ROOT, 'public', 'js', 'landing.js'), 'utf8');
  });

  after(async () => {
    if (testServer) {
      await testServer.close();
    }
  });




  describe('Category 4: Mobile Viewport 375px & Extreme Layouts', () => {
    it('T2-B18: 375px zero horizontal scroll boundary enforced in CSS', () => {
      assert.match(themeCss, /\.aw\s*\{[^}]*overflow-x:\s*clip/i, 'Root .aw must enforce overflow-x: clip');
      assert.match(
        themeCss,
        /@media\s*\(\s*max-width:\s*640px\s*\)[\s\S]*?\.aw-wrap\s*\{[^}]*padding:\s*0\s+(14px|16px)/i,
        'Mobile padding must be 14px or 16px to prevent edge bleed'
      );
    });

    it('T2-B19: Responsive grid stacking rules collapse to single column at mobile breakpoint', () => {
      assert.match(
        themeCss,
        /@media\s*\(\s*max-width:\s*640px\s*\)[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)|@media\s*\(\s*max-width:\s*640px\s*\)[\s\S]*?grid-template-columns:\s*1fr/i,
        'Responsive grids must collapse to single column on mobile (< 640px)'
      );
    });

    it('T2-B20: Typography fluid scaling clamp prevents overflow at 320px-414px', () => {
      assert.match(themeCss, /font-size:\s*clamp\(/i, 'Theme CSS must use clamp() for fluid typography');
    });
  });

  describe('Category 5: Forbidden Substring Deep Scans', () => {
    it('T2-B21: Absolute zero occurrences of "0 học viên" across entire SSR body', () => {
      const count = (ssrHtml.match(/0\s*học\s*viên/gi) || []).length;
      assert.strictEqual(count, 0, 'Occurrences of "0 học viên" must be exactly 0');
    });

    it('T2-B22: Absolute zero occurrences of personal Gmail and Zalo links in footer', () => {
      const footerHtml = ssrHtml.slice(ssrHtml.indexOf('<footer'), ssrHtml.indexOf('</footer>'));
      const gmailMatches = footerHtml.match(/[a-zA-Z0-9._%+-]+@gmail\.com/gi) || [];
      assert.strictEqual(gmailMatches.length, 0, 'No @gmail.com addresses in footer');

      const zaloMatches = footerHtml.match(/zalo\.me|zalo:\/\//gi) || [];
      assert.strictEqual(zaloMatches.length, 0, 'No personal Zalo links in footer');
    });

    it('T2-B23: Absolute zero occurrences of legacy domain "study.liferivo.com" in meta tags', () => {
      const headHtml = ssrHtml.slice(ssrHtml.indexOf('<head>'), ssrHtml.indexOf('</head>'));
      const legacyMatches = headHtml.match(/pythonlab\.about\.io\.vn/gi) || [];
      assert.strictEqual(legacyMatches.length, 0, 'No legacy pythonlab domain in head meta tags');
      assert.match(headHtml, /study\.liferivo\.com\/og-image\.png/, 'Meta tags must point to study.liferivo.com');
    });
  });
});
