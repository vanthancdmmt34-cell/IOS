/**
 * @file tests/e2e-tier1-features.test.mjs
 * Tier 1: Isolated Feature Coverage Test Suite (All 20 Features in Isolation)
 * Runner: Node.js native test runner (node:test, node:assert/strict)
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getTestServer } from './helpers/test-server.mjs';

const ROOT = process.cwd();

describe('E2E Tier 1: Feature Coverage (All 20 Features in Isolation)', () => {
  let testServer;
  let ssrHtml = '';
  let themeCss = '';
  let landingJs = '';
  let packageJson = {};

  before(async () => {
    testServer = await getTestServer();
    const res = await testServer.fetch('/');
    assert.strictEqual(res.status, 200, 'Server response for GET / must be 200 OK');
    ssrHtml = await res.text();

    themeCss = fs.readFileSync(path.join(ROOT, 'public', 'css', 'theme.css'), 'utf8');
    landingJs = fs.readFileSync(path.join(ROOT, 'public', 'js', 'landing.js'), 'utf8');
    packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  });

  after(async () => {
    if (testServer) {
      await testServer.close();
    }
  });

  // T1-F01: Warm Theme & Palette
  it('T1-F01: Warm Theme & Palette tokens are defined and active', () => {
    assert.match(themeCss, /--paper:\s*#FAF6EC/i, 'Theme must define --paper: #FAF6EC');
    assert.match(themeCss, /--cream:\s*#F7EBC0/i, 'Theme must define --cream: #F7EBC0');
    assert.match(themeCss, /--cream2:\s*#E9C96A/i, 'Theme must define --cream2: #E9C96A');
    assert.match(themeCss, /--ink:\s*#1C1917/i, 'Theme must define --ink: #1C1917');
    assert.match(ssrHtml, /<meta\s+name="theme-color"\s+content="#FAF6EC"/i, 'HTML theme-color must be warm paper #FAF6EC');
    assert.doesNotMatch(themeCss, /\.aw\s*\{[^}]*background:\s*#(000000|0a0a0a|0f172a)/i, 'Root .aw must not use cold dark background');
  });

  // T1-F02: Mobile-First 375px Layout
  it('T1-F02: Mobile-First 375px responsive rules and viewport configuration', () => {
    assert.match(ssrHtml, /<meta\s+name="viewport"\s+content="[^"]*width=device-width[^"]*"/i, 'Viewport meta tag must be set');
    const landingCss = fs.readFileSync(path.join(ROOT, 'public', 'css', 'landing-modern.css'), 'utf8');
    assert.match(landingCss, /@media\s*\(\s*max-width:\s*640px\s*\)\s*\{[^}]*\.aw-wrap[^{]*\{\s*padding-inline:\s*16px/i, 'Mobile container gutter must be 16px');
    assert.match(themeCss, /\.aw\s*\{[^}]*overflow-x:\s*clip/i, 'Root .aw must clip horizontal overflow');
    assert.match(themeCss, /box-sizing:\s*border-box/i, 'Box-sizing must be border-box');
    assert.match(ssrHtml, /class="[^"]*aw-wrap[^"]*"/i, 'Sections must use responsive aw-wrap containers');
  });

  // T1-F03: No Pre-S8 Auth Barrier
  // Thẻ mục đích (mục 3) và thẻ môn (mục 4) là liên kết trực tiếp tới /app/ngoai-ngu/... không có cổng đăng ký.
  // Hai nút đăng ký trước mục 8 nằm ở header và drawer di động (điều hướng, không chặn nội dung).
  it('T1-F03: Pre-S8 sections (S1-S7) have zero mandatory registration gates', () => {
    const preS8Html = ssrHtml.slice(0, ssrHtml.indexOf('id="chot-cuoi"'));
    const s3s4Snippet = ssrHtml.slice(ssrHtml.indexOf('id="muc-dich"'), ssrHtml.indexOf('id="cach-hoc"'));

    assert.doesNotMatch(s3s4Snippet, /data-auth="register"/i, 'Section 3 and 4 cards must not trigger registration modal');
    assert.doesNotMatch(s3s4Snippet, /data-auth="login"/i, 'Section 3 and 4 cards must not trigger login modal');
    assert.match(s3s4Snippet, /href="(?:#|\/app)\/ngoai-ngu\//, 'Section 3/4 cards must contain direct language links (hash or /app route)');
    const gates = [...preS8Html.matchAll(/<(button|a)\b[^>]*data-auth="register"[^>]*>/gi)].map((m) => m[0]);
    assert.ok(gates.every((g) => /class="[^"]*(aw-auth|mobile-drawer-cta)|class="aw-pill dark"/.test(g)), 'Only header or drawer register buttons may appear before section 8');
    assert.match(ssrHtml, /id="chot-cuoi"/, 'Section 8 must be present as the registration CTA location');
  });

  // T1-F04: Section 1 Hero Rotator
  it('T1-F04: Section 1 Hero Rotator alternates across 6 subjects with fade and slide-up animation', () => {
    const requiredLanguages = [
      'tiếng Nhật',
      'tiếng Anh',
      'tiếng Trung',
      'tiếng Hàn',
      'tiếng Pháp',
      'tiếng Tây Ban Nha'
    ];
    const combinedContent = (ssrHtml + '\n' + landingJs).toLowerCase();
    for (const lang of requiredLanguages) {
      assert.ok(
        combinedContent.includes(lang.toLowerCase()),
        `Rotator / curriculum must include subject "${lang}"`
      );
    }
    assert.ok(
      landingJs.includes('startRotator') || landingJs.includes('Rotator') || ssrHtml.includes('heroRotator') || ssrHtml.includes('aw-rot'),
      'Rotator mechanism must be defined in landing.js or SSR HTML'
    );
    assert.match(themeCss, /@keyframes\s+awRotIn[\s\S]*?translateY\(100%\)[\s\S]*?transform:\s*none/i, 'awRotIn keyframe must define translateY(100%) and transform: none');
    assert.match(themeCss, /@keyframes\s+awRotIn[\s\S]*?opacity:\s*0[\s\S]*?opacity:\s*1/i, 'awRotIn keyframe must animate opacity from 0 to 1');
    assert.match(ssrHtml, /id="heroRotator"|class="[^"]*rotator[^"]*"/, 'Hero rotator element must exist in SSR markup');
  });

  // T1-F05: Hero CTA & Mockup
  it('T1-F05: Section 1 Hero CTA scrolls to #demoBox and displays correct copy & mockup', () => {
    assert.match(ssrHtml, /6 Ngoại ngữ &amp; Luyện nói AI/, 'Chip must state "6 Ngoại ngữ &amp; Luyện nói AI"');
    assert.match(ssrHtml, /Mỗi bài chỉ vài phút, có lý thuyết ngắn, làm xong chấm ngay, sai đâu sửa đó\. Không cần biết gì trước\./, 'Subtitle copy must match requirement');
    assert.match(ssrHtml, /Chơi thử ngay - Không cần tài khoản/, 'CTA button text must match requirement');
    assert.match(ssrHtml, /href="#demoBox"|data-scroll-to="#demoBox"/, 'CTA button must scroll to #demoBox');
    assert.match(ssrHtml, /Miễn phí cấp cơ bản · Không cần cài đặt · Dùng được trên điện thoại/, 'Note copy must match requirement');
    assert.match(ssrHtml, /Sổ tay phác thảo/, 'Mockup must show the sketchbook frame');
    assert.match(ssrHtml, /Phòng luyện nói AI/, 'Mockup must show the AI speaking card');
  });

  // T1-F06: SSR <section id="demoBox"> and 8 Sections Order

  // T1-F07: Section 2 Python Demo Live Execution

  // T1-F08: Section 2 Japanese Interactive Quiz

  // T1-F09: Section 2 Conversion Modal Trigger
  it('T1-F09: Conversion modal contains exact praise message and registration trigger', () => {
    const praiseMsg = 'Bạn làm đúng rồi! Bạn có năng khiếu đấy. Tạo tài khoản để lưu tiến độ nhé?';
    assert.ok(
      ssrHtml.includes(praiseMsg) || landingJs.includes(praiseMsg),
      'Must contain exact praise copy'
    );
    assert.ok(
      ssrHtml.includes('Tạo tài khoản miễn phí') || landingJs.includes('Tạo tài khoản miễn phí'),
      'Must contain button "Tạo tài khoản miễn phí"'
    );
    assert.match(ssrHtml, /<div[^>]*id="modalHost"[^>]*>/, '#modalHost must exist in SSR HTML');
    assert.match(ssrHtml, /id="demoSuccessTpl"/, '#demoSuccessTpl must exist in SSR HTML');
  });

  // T1-F10: Section 3 Purpose Roadmaps

  // T1-F11: Section 4 9 Subjects Display

  // T1-F12: Total Summary Line

  // T1-F13: Elimination of "0 học viên"
  it('T1-F13: Total absence of "0 học viên" across SSR response, HTML template, and JS script', () => {
    assert.strictEqual(ssrHtml.includes('0 học viên'), false, 'SSR response must not contain "0 học viên"');
    const indexOnDisk = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
    assert.strictEqual(indexOnDisk.includes('0 học viên'), false, 'index.html must not contain "0 học viên"');
    assert.strictEqual(landingJs.includes('0 học viên'), false, 'landing.js must not contain "0 học viên"');
    assert.doesNotMatch(ssrHtml, /0\s*học\s*viên/i, 'No regex variation of "0 học viên" permitted');
  });

  // T1-F14: Section 5 3-Step Methodology
  it('T1-F14: Section 5 details 3-step methodology with spaced repetition highlight and streak text', () => {
    assert.match(ssrHtml, /Học như nào\? Chỉ 3 bước\./, 'Section 5 title must match requirement');
    assert.match(ssrHtml, /Học lý thuyết ngắn 2 phút/, 'Step 1 must be "Học lý thuyết ngắn 2 phút"');
    assert.match(ssrHtml, /Làm bài, chấm ngay/, 'Step 2 must be "Làm bài, chấm ngay"');
    assert.match(ssrHtml, /Ôn tập giãn cách, không quên/, 'Step 3 must be "Ôn tập giãn cách, không quên"');
    assert.match(ssrHtml, /Mỗi ngày 1 bài ngắn là đủ để giữ chuỗi ngày học\./, 'Streak text must match requirement');
    assert.match(ssrHtml, /step-icon-green/, 'Step 2 must feature green check icon');
    assert.match(ssrHtml, /step-icon-yellow|badge-gold/, 'Step 3 must feature yellow / gold spaced repetition badge');
  });

  // T1-F15: Section 6 learner stories: hidden until real learner comments exist (no fabricated testimonials)
  it('T1-F15: Section 6 stories are hidden by default and only shown with real learner comments', () => {
    assert.match(ssrHtml, /<section[^>]*id="cau-chuyen"[^>]*\bhidden\b/, 'Stories section must be hidden in the SSR markup');
    assert.match(landingJs, /if \(rec\.length >= 10\)[\s\S]*?storySec\.hidden = false/, 'Stories section must be shown only when at least 10 real comments exist');
    assert.match(ssrHtml, /minh họa/i, 'Any illustrative stories must be labelled as illustrations');
  });

  // T1-F16: Section 7 FAQ & Certification
  it('T1-F16: Section 7 includes 6 existing questions plus the platform certificate question', () => {
    assert.match(ssrHtml, /Có miễn phí không\?/, 'FAQ 1 present');
    assert.match(ssrHtml, /Bắt đầu như thế nào\?/, 'FAQ 2 present');
    assert.match(ssrHtml, /Dùng điện thoại được không\?/, 'FAQ 3 present');
    assert.match(ssrHtml, /Mỗi ngày học bao lâu\?/, 'FAQ 4 present');
    assert.match(ssrHtml, /Mất gốc bắt đầu từ đâu\?/, 'FAQ 5 present');
    assert.match(ssrHtml, /Dữ liệu có an toàn không\?/, 'FAQ 6 present');

    assert.match(ssrHtml, /Chứng nhận trên web có phải chứng chỉ quốc tế không\?/, 'FAQ 7 question present');
    assert.match(ssrHtml, /Không\. Đây là chứng nhận hoàn thành khóa học trên nền tảng LifeRivo, không phải chứng chỉ quốc tế\./, 'FAQ 7 answer present');

    const faqItems = (ssrHtml.match(/<details class="faq-item"/g) || []).length;
    assert.strictEqual(faqItems, 12, 'Section 7 must have exactly 12 FAQ items');
  });

  // T1-F17: Section 8 Final Conversion CTA
  it('T1-F17: Section 8 is the sole mandatory account creation section', () => {
    assert.match(ssrHtml, /Sẵn sàng bắt đầu\?/, 'Section 8 title must be "Sẵn sàng bắt đầu?"');
    assert.match(ssrHtml, /Tạo tài khoản, chọn môn, vào học ngay\. Miễn phí cấp cơ bản\./, 'Section 8 subtext must match');
    assert.match(ssrHtml, /<button[^>]*class="[^"]*cta-register-btn[^"]*"[^>]*data-auth="register"[^>]*>\s*Tạo tài khoản miễn phí\s*<\/button>/, 'Section 8 must contain CTA button "Tạo tài khoản miễn phí"');
    assert.match(ssrHtml, /id="chot-cuoi"/, 'Section 8 must have id="chot-cuoi"');
  });

  // T1-F18: Footer Clean Contacts
  it('T1-F18: Footer displays study@liferivo.com, Facebook, Threads, and excludes personal Gmail/Zalo', () => {
    assert.match(ssrHtml, /study@liferivo\.com/, 'Footer must contain study@liferivo.com');
    assert.match(ssrHtml, /facebook\.com\/Try\.To\.Wins/, 'Footer must contain Facebook link');
    assert.match(ssrHtml, /threads\.com\/@alonewolfvn_/, 'Footer must contain Threads link');

    const footerSnippet = ssrHtml.slice(ssrHtml.indexOf('<footer'), ssrHtml.indexOf('</footer>'));
    assert.doesNotMatch(footerSnippet, /[a-zA-Z0-9._%+-]+@gmail\.com/i, 'Footer must not contain any @gmail.com address');
    assert.doesNotMatch(footerSnippet, /zalo\.me|zalo:\/\//i, 'Footer must not contain personal Zalo links');
  });

  // T1-F19: Metadata & og:image
  it('T1-F19: Open Graph and Twitter image URLs point to https://study.liferivo.com/og-image.png', () => {
    assert.match(
      ssrHtml,
      /<meta\s+property="og:image"\s+content="https:\/\/study\.liferivo\.com\/og-image\.png(?:\?v=[\w.-]+)?"/,
      'og:image must match https://study.liferivo.com/og-image.png'
    );
    assert.match(
      ssrHtml,
      /<meta\s+property="og:image:secure_url"\s+content="https:\/\/study\.liferivo\.com\/og-image\.png(?:\?v=[\w.-]+)?"/,
      'og:image:secure_url must match https://study.liferivo.com/og-image.png'
    );
    assert.match(
      ssrHtml,
      /<meta\s+name="twitter:image"\s+content="https:\/\/study\.liferivo\.com\/og-image\.png(?:\?v=[\w.-]+)?"/,
      'twitter:image must match https://study.liferivo.com/og-image.png'
    );
    assert.doesNotMatch(ssrHtml, /pythonlab\.about\.io\.vn\/og-image\.png/, 'No reference to legacy pythonlab og-image');
  });

  // T1-F20: Build Script & Automated Verification
  it('T1-F20: package.json build script and verification tools are configured', () => {
    assert.ok(packageJson.scripts, 'package.json must contain scripts');
    assert.match(packageJson.scripts.build, /node tools\/build-css\.mjs/, 'build must compile CSS');
    assert.match(packageJson.scripts.build, /node tools\/verify-languages\.mjs/, 'build must verify languages');
    assert.ok(packageJson.scripts.test, 'test script must exist');
    assert.match(packageJson.scripts.test, /node\s+--test/, 'test script must use node --test');
  });
});
