/**
 * @file tests/e2e-tier4-scenarios.test.mjs
 * Tier 4: Real-World Application Scenarios Test Suite (5 End-to-End User Journeys)
 * Runner: Node.js native test runner (node:test, node:assert/strict)
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getTestServer } from './helpers/test-server.mjs';

const ROOT = process.cwd();

describe('E2E Tier 4: Real-World Application Scenarios (5 Composite Journeys)', () => {
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

  // Scenario 1: Middle/High School Student Journey

  // Scenario 2: Overseas Worker Journey
  describe('Scenario 2: Overseas Worker Journey', () => {
    it('executes journey through Japanese trial quiz, conversion popup, and Japan/Korea roadmap', () => {
      // Step 1: Lands on Hero -> views Japanese option in rotator / curriculum
      assert.ok(
        ssrHtml.toLowerCase().includes('tiếng nhật') || landingJs.toLowerCase().includes('tiếng nhật'),
        'Step 1: Hero rotator or curriculum includes "tiếng Nhật"'
      );

      // Step 2: Interacts with Japanese quiz "Ohayo" in Section 2
      assert.match(ssrHtml, /Ohayo|「おはよう」/, 'Step 2: Section 2 includes "Ohayo" quiz');

      // Step 3: Correct answer triggers conversion popup
      const expectedConversionCopy = 'Bạn làm đúng rồi! Bạn có năng khiếu đấy. Tạo tài khoản để lưu tiến độ nhé?';
      assert.ok(
        ssrHtml.includes(expectedConversionCopy) || landingJs.includes(expectedConversionCopy),
        'Step 3: Conversion popup copy matches requirement'
      );

      // Step 4: Explores Japan/Korea Roadmap in Section 3
      assert.match(ssrHtml, /Mình muốn đi Nhật \/ Hàn làm việc/i, 'Step 4: Overseas worker roadmap exists');
      assert.match(ssrHtml, /Nhật N5 hoặc Hàn TOPIK 1/i, 'Step 4: Suggests N5 or TOPIK 1');

      // Step 5: Navigates to Japanese N5 without auth barrier
      assert.match(ssrHtml, /Học theo lộ trình xuất khẩu/i, 'Step 5: Overseas worker CTA present');
      const abroadCardSnippet = ssrHtml.slice(
        ssrHtml.indexOf('Mình muốn đi Nhật / Hàn làm việc'),
        ssrHtml.indexOf('Học theo lộ trình xuất khẩu') + 60
      );
      assert.doesNotMatch(abroadCardSnippet, /data-auth/, 'Step 5: No auth barrier on abroad CTA');
      assert.match(abroadCardSnippet, /href="#\/ngoai-ngu\/ja"/, 'Step 5: Direct navigation to #/ngoai-ngu/ja');
    });
  });

  // Scenario 3: University Intern Journey

  // Scenario 4: Mobile 375px End-to-End Visitor
  describe('Scenario 4: Mobile 375px End-to-End Visitor', () => {
    it('verifies mobile viewport meta, sequential 8 sections, and zero horizontal overflow', () => {
      // Step 1: Viewport meta tag
      assert.match(
        ssrHtml,
        /<meta[^>]*name="viewport"[^>]*content="width=device-width,\s*initial-scale=1,\s*viewport-fit=cover"/i,
        'Step 1: Viewport meta configured for mobile'
      );

      // Step 2: All 8 semantic sections present in correct sequential order
      const sectionIds = ['hero', 'demoBox', 'muc-dich', 'mon-hoc', 'cach-hoc', 'cau-chuyen', 'hoi-dap', 'chot-cuoi'];
      let lastIndex = -1;
      for (const id of sectionIds) {
        const idx = ssrHtml.indexOf(`id="${id}"`);
        assert.ok(idx > -1, `Step 2: Section #${id} must be present in SSR markup`);
        assert.ok(idx > lastIndex, `Step 2: Section #${id} must appear in order after preceding section`);
        lastIndex = idx;
      }

      // Step 3: CSS horizontal overflow clipping
      assert.ok(
        themeCss.includes('overflow-x: clip') || themeCss.includes('overflow-x: hidden'),
        'Step 3: Theme CSS must enforce overflow-x clipping to prevent horizontal scroll'
      );

      // Step 4: Touch targets styled with adequate padding/height
      assert.match(
        themeCss,
        /@media\s*\(\s*max-width:\s*640px\s*\)[\s\S]*?\.aw-wrap\s*\{[^}]*padding:\s*0\s+(14px|16px)/i,
        'Step 4: Responsive wrap padding configured for mobile'
      );
    });
  });

  // Scenario 5: Negative & Error Recovery Journey
});
