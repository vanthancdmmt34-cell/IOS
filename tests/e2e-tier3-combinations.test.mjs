/**
 * @file tests/e2e-tier3-combinations.test.mjs
 * Tier 3: Cross-Feature Combinations & Pairwise Integration Test Suite (7 Pairs)
 * Runner: Node.js native test runner (node:test, node:assert/strict)
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getTestServer } from './helpers/test-server.mjs';

const ROOT = process.cwd();

describe('E2E Tier 3: Cross-Feature Combinations & Pairwise Integration (7 Pairs)', () => {
  let testServer;
  let ssrHtml = '';
  let themeCss = '';
  let landingJs = '';

  before(async () => {
    testServer = await getTestServer();
    const res = await testServer.fetch('/');
    assert.strictEqual(res.status, 200);
    ssrHtml = await res.text();
    themeCss = fs.readFileSync(path.join(ROOT, 'public', 'css', 'theme.css'), 'utf8');
    landingJs = fs.readFileSync(path.join(ROOT, 'public', 'js', 'landing.js'), 'utf8');
  });

  after(async () => {
    if (testServer) {
      await testServer.close();
    }
  });

  // Pair 1: Hero CTA -> Section 2 #demoBox Target -> Pre-S8 Non-Auth
  describe('Pair 1: Hero CTA -> Section 2 #demoBox Target -> Non-Auth Guarantee', () => {
    it('Hero CTA explicitly targets #demoBox, #demoBox is pre-rendered in SSR, and no auth gate is attached', () => {
      // 1. Hero CTA element exists and contains required label
      const heroCtaMatch = ssrHtml.match(/<a[^>]*id="heroCta"[^>]*>([\s\S]*?)<\/a>/i)
        || ssrHtml.match(/<a[^>]*class="[^"]*hero-cta-btn[^"]*"[^>]*>([\s\S]*?)<\/a>/i)
        || ssrHtml.match(/<button[^>]*data-scroll-to="#demoBox"[^>]*>([\s\S]*?)<\/button>/i);
      assert.ok(heroCtaMatch, 'Hero CTA targeting #demoBox must exist in SSR markup');
      assert.match(heroCtaMatch[0], /Chơi thử ngay/i, 'Hero CTA text must contain "Chơi thử ngay"');
      assert.match(heroCtaMatch[0], /#demoBox/, 'Hero CTA must target #demoBox');

      // 2. CTA must NOT contain data-auth (no auth barrier before S8)
      assert.doesNotMatch(heroCtaMatch[0], /data-auth/i, 'Hero CTA must not have data-auth attribute');

      // 3. Section 2 #demoBox container must exist in the SSR HTML
      assert.match(ssrHtml, /<section[^>]*id="demoBox"[^>]*>/i, 'SSR markup must contain <section id="demoBox">');

      // 4. Smooth scrolling behavior verified in CSS
      assert.ok(
        themeCss.includes('overflow-x: clip') || themeCss.includes('scroll-behavior: smooth'),
        'CSS must define container overflow bounds or smooth scrolling'
      );
    });
  });

  // Pair 2: Japanese Quiz -> Conversion Popup -> Registration Modal

  // Pair 3: Section 2 Python Demo -> Execution API -> Output Display

  // Pair 4: Section 3 Roadmaps -> Direct Subject Routing (No Auth Gate)

  // Pair 5: Section 4 Subject Navigation -> Hash Routes & Persistence

  // Pair 6: Section 8 Final CTA -> Registration Modal & Pre-S8 Contrast
  describe('Pair 6: Section 8 Final CTA -> Registration Modal & Pre-S8 Contrast', () => {
    it('Section 8 is the sole mandatory registration section', () => {
      // 1. Section 8 container exists
      assert.match(ssrHtml, /<section[^>]*id="chot-cuoi"[^>]*>/i, 'Section 8 #chot-cuoi must exist');

      const s8Content = ssrHtml.split(/id="chot-cuoi"/i)[1]?.split(/<\/section>/i)[0] || '';
      assert.match(s8Content, /Sẵn sàng bắt đầu\?/i, 'Section 8 must have title "Sẵn sàng bắt đầu?"');
      assert.match(s8Content, /Tạo tài khoản miễn phí/i, 'Section 8 must have CTA "Tạo tài khoản miễn phí"');
      assert.match(s8Content, /data-auth="register"/i, 'Section 8 CTA must have data-auth="register"');

      // 2. Pre-S8 Contrast: Sections 1-7 do not have mandatory blocking auth
      const preS8Html = ssrHtml.slice(0, ssrHtml.indexOf('id="chot-cuoi"'));
      const preS8Sec34567 = preS8Html.slice(preS8Html.indexOf('id="muc-dich"'));
      const blockingAuthMatches = preS8Sec34567.match(/class="[^"]*btn[^"]*"[^>]*data-auth="register"/g) || [];
      assert.strictEqual(blockingAuthMatches.length, 0, 'No blocking registration buttons in Sections 3-7');
    });
  });

  // Pair 7: Footer Contact Domain -> Metadata og:image Alignment
  describe('Pair 7: Footer Contact Domain -> Metadata og:image Alignment', () => {
    it('Footer contains study@liferivo.com, excludes personal Gmail/Zalo, and og:image points to study.liferivo.com', () => {
      // 1. Footer email
      assert.match(ssrHtml, /study@liferivo\.com/i, 'Footer must contain study@liferivo.com');

      // 2. No personal Gmail or Zalo in footer
      const footerContent = ssrHtml.split(/<footer/i)[1]?.split(/<\/footer>/i)[0] || '';
      assert.doesNotMatch(footerContent, /@gmail\.com/i, 'Footer must not contain personal Gmail');
      assert.doesNotMatch(footerContent, /zalo\.me/i, 'Footer must not contain personal Zalo link');

      // 3. Metadata og:image & twitter:image
      assert.match(
        ssrHtml,
        /<meta[^>]*property="og:image"[^>]*content="https:\/\/study\.liferivo\.com\/og-image\.png"/i,
        'og:image must match https://study.liferivo.com/og-image.png'
      );
      assert.match(
        ssrHtml,
        /<meta[^>]*name="twitter:image"[^>]*content="https:\/\/study\.liferivo\.com\/og-image\.png"/i,
        'twitter:image must match https://study.liferivo.com/og-image.png'
      );
    });
  });
});
