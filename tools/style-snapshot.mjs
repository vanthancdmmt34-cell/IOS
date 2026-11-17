// Chụp computed style và vị trí của các phần tử chính trên nhiều trang và kích thước.
// Dùng để chứng minh một lần gộp CSS không làm đổi giao diện: chụp trước, sửa, chụp sau, rồi so sánh.
//
//   node tools/style-snapshot.mjs --out <file.json>            chụp
//   node tools/style-snapshot.mjs --compare <a.json> <b.json>  so sánh, in các khác biệt
//
// Cần: máy chủ đang chạy (BASE_URL), tài khoản thử (LAYOUT_USER/LAYOUT_PASS), Chrome và playwright-core
// (PLAYWRIGHT_CORE_PATH, cùng cách với mobile-layout-check.mjs).
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const compareIdx = args.indexOf("--compare");
if (compareIdx > -1) {
  const [fa, fb] = [args[compareIdx + 1], args[compareIdx + 2]];
  const a = JSON.parse(readFileSync(fa, "utf8")).items;
  const b = JSON.parse(readFileSync(fb, "utf8")).items;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const diffs = [];
  for (const k of keys) {
    const x = a[k], y = b[k];
    if (!x || !y) { diffs.push(`${k}: chỉ có ở một bên`); continue; }
    for (const p of Object.keys(x)) if (x[p] !== y[p]) diffs.push(`${k} · ${p}: ${x[p]} → ${y[p]}`);
  }
  console.log(`So sánh ${keys.size} phần tử: ${diffs.length} khác biệt.`);
  for (const d of diffs.slice(0, 60)) console.log("  " + d);
  process.exit(diffs.length ? 1 : 0);
}

const outIdx = args.indexOf("--out");
const OUT = outIdx > -1 ? args[outIdx + 1] : null;
const BASE = (process.env.BASE_URL || "http://127.0.0.1:8091").replace(/\/$/, "");
const USER = process.env.LAYOUT_USER || "", PASS = process.env.LAYOUT_PASS || "";
if (!OUT || !USER || !PASS) {
  console.error("Cần --out <file> và LAYOUT_USER, LAYOUT_PASS.");
  process.exit(2);
}

const PAGES = [
  ["/app/chon-mon", "chon-mon"],
  ["/app/ngoai-ngu/en", "khoa-hoc"],
  ["/app/ngoai-ngu/bai/en-a1-u1-nghia", "tu-vung"],
  ["/app/ngoai-ngu/bai/en-a1-u1-nghe", "nghe"],
  ["/app/ngoai-ngu/ly-thuyet/en/a1/1", "ly-thuyet"],
  ["/app/ngoai-ngu/luyen-noi/en?cap=a1", "phong-noi"],
  ["/app/ngoai-ngu/tro-chuyen/en", "tro-chuyen"],
  ["/app/ngoai-ngu/on-tap/en", "on-tap"],
  ["/app/co-vu", "co-vu"],
  ["/app/ca-nhan", "ca-nhan"],
];
const SIZES = [[375, 812], [812, 375], [1440, 900]];
const HOVER = [".btn", ".lx-opt", ".mtab a", ".cp-pick", ".lx-due-row", ".lx-roomnav a", ".sw-chibi-card", ".lx-unit-head", ".hm-pet-tab", ".nav-cat-body a", ".lx-flash", ".tabs > *"];
const SELECTORS = [
  "body", ".topbar", ".mtab", ".mtab a", ".shell > .side", ".shell > .main", "h1", "h2",
  ".btn", ".sheet", ".card", ".hm-card", ".lx-unit", ".lx-unit-head", ".lx-opt", ".lx-listen",
  ".lx-q", ".lx-rules > li", ".lx-due-row", ".lx-vocab tbody tr", ".lx-map-goal", ".sw-chibi-card",
  ".cp-pick", ".hm-pet-tab", ".sp-dock", ".lx-roomnav a", "input", "button",
  ".page-head", ".hm-week span", ".hm-current", ".hm-skill", ".hm-plan-tile", ".hm-greet", ".hm-streak",
  ".lx-flash", ".lx-q-head", ".lx-ex", ".lx-test", ".lx-unit-no", ".lx-unit-prog", ".lx-kpis > *", ".lx-subj",
  ".lx-levels a", ".tabs > *", ".chips > *", ".lx-cert", ".me-card", ".side", ".nav-cat-head", ".nav-cat-body a",
  ".lx-theory", ".lx-box", ".lx-sent", ".toeic-q", ".lx-pro-card", ".sw-card", ".ud-prem", ".bar",
];
const PROPS = [
  "display", "position", "top", "right", "bottom", "left", "width", "height",
  "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border-top-width", "border-top-style", "border-top-color", "border-right-width", "border-bottom-width", "border-left-width",
  "background-color", "background-image", "color", "font-family", "font-size", "font-weight", "line-height",
  "box-shadow", "border-radius", "transform", "opacity", "z-index", "overflow-x", "overflow-y", "visibility",
  "grid-template-columns", "flex-direction", "flex-wrap", "gap", "justify-content", "align-items",
];

const { chromium } = await import(process.env.PLAYWRIGHT_CORE_PATH || "playwright-core");
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, colorScheme: process.env.LAYOUT_SCHEME === "dark" ? "dark" : "light" });
const login = await ctx.request.post(`${BASE}/api/login`, { data: { username: USER, password: PASS } });
if (!login.ok()) { console.error("Đăng nhập thất bại", login.status()); await browser.close(); process.exit(2); }
const page = await ctx.newPage();
const items = {};
for (const [path, name] of PAGES) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => (document.querySelector("#main")?.children.length || 0) > 0, null, { timeout: 15000 }).catch(() => {});
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" });
  await page.waitForTimeout(2000); // để danh sách và chế độ gập nội dung ổn định trước khi đo
  for (const [w, h] of SIZES) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(700);
    const snap = await page.evaluate(({ SELECTORS, PROPS }) => {
      const out = {};
      for (const sel of SELECTORS) {
        const els = [...document.querySelectorAll(sel)].slice(0, 3);
        els.forEach((el, i) => {
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          const rec = {};
          for (const p of PROPS) rec[p] = cs.getPropertyValue(p);
          rec["rect"] = [r.left, r.top, r.width, r.height].map((v) => Math.round(v * 10) / 10).join(",");
          out[`${sel}#${i}`] = rec;
        });
      }
      return out;
    }, { SELECTORS, PROPS });
    for (const [k, v] of Object.entries(snap)) items[`${name}|${w}x${h}|${k}`] = v;
    // Trạng thái hover: rê chuột vào phần tử đầu tiên của mỗi nhóm có thể bấm, rồi đo lại
    for (const sel of HOVER) {
      const loc = page.locator(sel).first();
      if (!(await loc.count())) continue;
      const box = await loc.boundingBox().catch(() => null);
      // Chỉ rê chuột khi phần tử đã nằm sẵn trong khung hình: không cuộn, để vị trí không bị đổi
      if (!box || box.y < 0 || box.y + box.height > (await page.evaluate(() => innerHeight))) continue;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(120);
      const rec = await page.evaluate(({ sel, PROPS }) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        const r = {};
        for (const p of PROPS) r[p] = cs.getPropertyValue(p);
        return r;
      }, { sel, PROPS });
      if (rec) items[`${name}|${w}x${h}|${sel}#hover`] = rec;
    }
    await page.mouse.move(0, 0);
  }
}
await browser.close();
writeFileSync(OUT, JSON.stringify({ takenAt: new Date().toISOString(), count: Object.keys(items).length, items }, null, 1));
console.log(`Đã chụp ${Object.keys(items).length} phần tử vào ${OUT}`);
