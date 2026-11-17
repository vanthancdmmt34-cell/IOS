/**
 * @file tests/challenger-m1-adversarial.test.mjs
 * Challenger 1 Adversarial Verification Suite for Milestone 1 (SSR Shell, Layout & Metadata)
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getTestServer } from './helpers/test-server.mjs';

const ROOT = process.cwd();

describe('Milestone 1 Adversarial Verification (Challenger 1)', () => {
  let testServer;
  let ssrResponse;
  let ssrHtml;
  let rawIndexHtml;

  before(async () => {
    testServer = await getTestServer();
    ssrResponse = await testServer.fetch('/');
    ssrHtml = await ssrResponse.text();
    rawIndexHtml = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
  });

  after(async () => {
    if (testServer) {
      await new Promise(r => setTimeout(r, 200));
      await testServer.close();
    }
  });

  // 1. Empirical SSR Serving Behavior & Token Replacements
  it('C1-01: SSR responds with HTTP 200 and Content-Type text/html', () => {
    assert.strictEqual(ssrResponse.status, 200, 'HTTP status must be 200 OK');
    const contentType = ssrResponse.headers['content-type'] || '';
    assert.ok(contentType.includes('text/html'), `Content-Type must be text/html, got: ${contentType}`);
  });

  it('C1-02: SSR response contains <section ... id="demoBox"> pre-rendered in root', () => {
    assert.match(ssrHtml, /<section[^>]*id="demoBox"[^>]*>/i, 'SSR HTML must contain <section id="demoBox">');
    assert.ok(ssrHtml.includes('Thử 2 phút là biết mình học được.'), 'demoBox heading must be pre-rendered');
  });



  it('C1-05: All 8 section IDs exist and occur in strict sequential order', () => {
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

    let lastIndex = -1;
    for (const id of expectedSections) {
      const regex = new RegExp(`id=["']${id}["']`, 'i');
      const match = ssrHtml.match(regex);
      assert.ok(match, `Section #${id} must exist in SSR response`);
      const currentIndex = ssrHtml.indexOf(match[0]);
      assert.ok(
        currentIndex > lastIndex,
        `Section #${id} (index ${currentIndex}) must appear after previous section (index ${lastIndex})`
      );
      lastIndex = currentIndex;
    }
  });

  it('C1-06: Social metadata og:image and twitter:image point to https://study.liferivo.com/og-image.png', () => {
    const ogMatch = ssrHtml.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                    ssrHtml.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
    assert.ok(ogMatch, 'og:image meta tag must exist');
    assert.strictEqual(ogMatch[1], 'https://study.liferivo.com/og-image.png', 'og:image content mismatch');

    const twMatch = ssrHtml.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i) ||
                    ssrHtml.match(/<meta\s+content=["']([^"']+)["']\s+name=["']twitter:image["']/i);
    assert.ok(twMatch, 'twitter:image meta tag must exist');
    assert.strictEqual(twMatch[1], 'https://study.liferivo.com/og-image.png', 'twitter:image content mismatch');

    const ogSecureMatch = ssrHtml.match(/<meta\s+property=["']og:image:secure_url["']\s+content=["']([^"']+)["']/i);
    assert.ok(ogSecureMatch, 'og:image:secure_url meta tag must exist');
    assert.strictEqual(ogSecureMatch[1], 'https://study.liferivo.com/og-image.png');
  });

  it('C1-07: Zero unhandled template tokens in SSR output', () => {
    const unhandledTokens = ssrHtml.match(/__[A-Z0-9_]+__/g);
    assert.strictEqual(
      unhandledTokens,
      null,
      `Found unhandled template tokens in SSR output: ${JSON.stringify(unhandledTokens)}`
    );
  });

  it('C1-08: Containers #root, #toasts, #modalHost, #demoSuccessTpl exist in SSR HTML', () => {
    assert.match(ssrHtml, /<div[^>]*id="root"[^>]*>/, '#root must exist');
    assert.match(ssrHtml, /<div[^>]*id="toasts"[^>]*>/, '#toasts must exist');
    assert.match(ssrHtml, /<div[^>]*id="modalHost"[^>]*>/, '#modalHost must exist');
    assert.match(ssrHtml, /<template[^>]*id="demoSuccessTpl"[^>]*>/, '#demoSuccessTpl must exist');
  });

  // 2. Adversarial Search for "0 học viên" and Variants
  it('C1-09: Literal "0 học viên" case-insensitive search fails on raw HTML and SSR output', () => {
    assert.strictEqual(/0\s*học\s*viên/i.test(rawIndexHtml), false, 'raw index.html must not contain "0 học viên"');
    assert.strictEqual(/0\s*học\s*viên/i.test(ssrHtml), false, 'SSR output must not contain "0 học viên"');
  });

  it('C1-10: Unicode-normalized adversarial forms (NFC, NFD, NFKC, NFKD) are absent', () => {
    const forms = ['NFC', 'NFD', 'NFKC', 'NFKD'];
    for (const form of forms) {
      const normHtml = rawIndexHtml.normalize(form);
      const normSsr = ssrHtml.normalize(form);
      const pattern = new RegExp('0\\s*h[o\u1ECD\u006F\u0323]c\\s*v[i\u0069\u00EA\u0065\u0302\u0323\u1EC7]n', 'i');
      assert.strictEqual(pattern.test(normHtml), false, `Normalized form ${form} found banned phrase in rawIndexHtml`);
      assert.strictEqual(pattern.test(normSsr), false, `Normalized form ${form} found banned phrase in ssrHtml`);
    }
  });

  it('C1-11: Zero-width characters and unusual whitespace variations are absent', () => {
    const strippedHtml = rawIndexHtml.replace(/[\u200B-\u200D\uFEFF\u00A0\s]+/g, ' ').toLowerCase();
    assert.strictEqual(strippedHtml.includes('0 học viên'), false);
    assert.strictEqual(strippedHtml.includes('0 họcvien'), false);
    assert.strictEqual(strippedHtml.includes('0hocvien'), false);
  });

  it('C1-12: HTML entity encoded variations (&#48;, &#x30;) of 0 học viên are absent', () => {
    assert.strictEqual(/(&#48;|&#x30;)\s*học\s*viên/i.test(rawIndexHtml), false);
  });


  // 3. Adversarial Search for Gmail and Zalo Contacts
  it('C1-14: Footer contains official email and official social links', () => {
    const footerMatch = ssrHtml.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
    assert.ok(footerMatch, 'Footer element must exist');
    const footerContent = footerMatch[1];

    assert.ok(footerContent.includes('study@liferivo.com'), 'Footer must contain study@liferivo.com');
    assert.ok(footerContent.includes('facebook.com/Try.To.Wins'), 'Footer must link to official Facebook');
  });

  it('C1-15: Absolute zero Gmail addresses (*@gmail.com) in entire HTML or SSR output', () => {
    const gmailRegex = /[a-zA-Z0-9._%+-]+@gmail\.com/i;
    assert.strictEqual(gmailRegex.test(rawIndexHtml), false, 'raw index.html must not contain any @gmail.com');
    assert.strictEqual(gmailRegex.test(ssrHtml), false, 'SSR output must not contain any @gmail.com');
  });

  it('C1-16: Absolute zero Zalo references (zalo, zalo.me, zaloweb, etc.) in footer or whole page', () => {
    const footerMatch = ssrHtml.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
    const footerContent = footerMatch ? footerMatch[1] : '';
    assert.strictEqual(/zalo/i.test(footerContent), false, 'Footer must not contain any Zalo references');
    assert.strictEqual(/zalo/i.test(rawIndexHtml), false, 'Raw index.html must not contain any Zalo references');
    assert.strictEqual(/zalo/i.test(ssrHtml), false, 'SSR output must not contain any Zalo references');
  });

  it('C1-17: No commented-out Gmail or Zalo links anywhere in index.html', () => {
    const comments = rawIndexHtml.match(/<!--[\s\S]*?-->/g) || [];
    for (const comment of comments) {
      assert.strictEqual(/@gmail\.com/i.test(comment), false, 'Found @gmail.com inside HTML comment');
      assert.strictEqual(/zalo/i.test(comment), false, 'Found zalo inside HTML comment');
    }
  });

  // 4. Auth Barrier Discipline (No pre-S8 gates)
  it('C1-18: Sections 1 to 7 do not contain data-auth="register" or data-auth="login"', () => {
    const preS8 = ssrHtml.split(/id=["']chot-cuoi["']/i)[0];
    const mainPreS8 = preS8.split(/<main[^>]*>/i)[1] || '';
    const authMatches = mainPreS8.match(/data-auth=["'][^"']+["']/g);
    assert.strictEqual(
      authMatches,
      null,
      `Found pre-S8 auth gates inside <main>: ${JSON.stringify(authMatches)}`
    );
  });

  it('C1-19: Section 8 contains data-auth="register" for account creation', () => {
    const s8Part = ssrHtml.split(/id=["']chot-cuoi["']/i)[1] || '';
    assert.match(s8Part, /data-auth=["']register["']/, 'Section 8 must have data-auth="register"');
  });

  // 5. Package Manifest & Build Pipeline Verification
  it('C1-20: package.json defines "build" script chaining build-css and verify-languages', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    assert.ok(pkg.scripts, 'package.json must contain scripts');
    assert.ok(pkg.scripts.build, 'package.json must contain build script');
    assert.match(pkg.scripts.build, /node tools\/build-css\.mjs/, 'build must compile CSS');
    assert.match(pkg.scripts.build, /node tools\/verify-languages\.mjs/, 'build must verify languages');
  });
});
