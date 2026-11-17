// Kiểm tra bố cục trên nhiều kích thước màn hình: tràn ngang, thanh điều hướng dưới có nằm trong khung hình không.
// Chạy cần Chrome hoặc Edge đã cài và gói playwright-core (npm i playwright-core, hoặc đặt PLAYWRIGHT_CORE_PATH).
// Không chạy trong npm test vì cần trình duyệt và một máy chủ đang chạy với cơ sở dữ liệu thử.
//
// Ví dụ (PowerShell hoặc bash):
//   BASE_URL=http://127.0.0.1:8091 LAYOUT_USER=hocvien02 LAYOUT_PASS=... node tools/mobile-layout-check.mjs --shots <thư mục>
//
// Kết quả: bảng trên màn hình, báo cáo JSON trong thư mục --shots (hoặc thư mục hiện tại), mã thoát 1 nếu có lỗi.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const BASE = (process.env.BASE_URL || "http://127.0.0.1:8091").replace(/\/$/, "");
const USER = process.env.LAYOUT_USER || "";
const PASS = process.env.LAYOUT_PASS || "";
if (!USER || !PASS) {
  console.error("Đặt LAYOUT_USER và LAYOUT_PASS (tài khoản thử trong cơ sở dữ liệu tạm).");
  process.exit(2);
}

const argShots = process.argv.indexOf("--shots");
const shotsDir = argShots > -1 ? process.argv[argShots + 1] : null;
if (shotsDir) mkdirSync(shotsDir, { recursive: true });

const { chromium } = await import(process.env.PLAYWRIGHT_CORE_PATH || "playwright-core");
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, colorScheme: process.env.LAYOUT_SCHEME === "dark" ? "dark" : "light" });
const login = await ctx.request.post(`${BASE}/api/login`, { data: { username: USER, password: PASS } });
if (!login.ok()) {
  console.error("Đăng nhập thất bại, mã", login.status());
  await browser.close();
  process.exit(2);
}

// Trang cần kiểm tra: đường dẫn và tên ngắn dùng trong báo cáo
const PAGES = [
  ["/app/chon-mon", "chon-mon"],
  ["/app/ngoai-ngu/en", "khoa-hoc"],
  ["/app/ngoai-ngu/bai/en-a1-u1-nghia", "tu-vung"],
  ["/app/ngoai-ngu/bai/en-a1-u1-nghe", "nghe"],
  ["/app/ngoai-ngu/ly-thuyet/en/a1/1", "ly-thuyet"],
  ["/app/ngoai-ngu/luyen-noi/en?cap=a1", "phong-noi"],
  ["/app/ngoai-ngu/luyen-noi/en/a1/tu/1", "noi-tu"],
  ["/app/ngoai-ngu/tro-chuyen/en", "tro-chuyen"],
  ["/app/ngoai-ngu/on-tap/en", "on-tap"],
  ["/app/ngoai-ngu/xep-hang/en", "xep-hang"],
  ["/app/co-vu", "co-vu"],
  ["/app/ca-nhan", "ca-nhan"],
];
// Kích thước: dọc từ 320 đến 430, máy tính bảng, máy tính, và ngang điện thoại
const SIZES = [
  [320, 640], [360, 740], [375, 812], [390, 844], [414, 896], [430, 932],
  [768, 1024], [1024, 768], [1440, 900], [812, 375], [844, 390],
];
const SHOT_SIZES = new Set(["375x812", "812x375"]);

const measure = () => {
  const cw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const overflowX = document.documentElement.scrollWidth - cw;
  const mt = document.querySelector(".mtab");
  const navShown = !!mt && getComputedStyle(mt).display !== "none";
  const navBottom = navShown ? Math.round(mt.getBoundingClientRect().bottom) : null;
  const side = document.querySelector(".shell > .side");
  return {
    overflowX,
    navShown,
    navInView: navShown ? navBottom <= vh : null,
    sidebar: side ? getComputedStyle(side).position : null,
    mainReady: !!document.querySelector("#main")?.children.length,
  };
};

const rows = [];
let failures = 0;
const page = await ctx.newPage();
for (const [path, name] of PAGES) {
  // Lỗi JS của trang (không tính lỗi đã biết là lang-switch.js dùng import ngoài module)
  const errors = [];
  const onErr = (e) => { const t = String(e.message || e).slice(0, 160); if (!/Cannot use import statement/.test(t)) errors.push(t); };
  page.on("pageerror", onErr);
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => (document.querySelector("#main")?.children.length || 0) > 0, null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);
  for (const [w, h] of SIZES) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(350);
    const m = await page.evaluate(measure);
    const size = `${w}x${h}`;
    const problems = [];
    if (!m.mainReady) problems.push("trang trống");
    if (m.overflowX > 1) problems.push(`tràn ngang ${m.overflowX}px`);
    if (m.navShown && m.navInView === false) problems.push("thanh dưới nằm ngoài khung hình");
    if (errors.length) problems.push(`lỗi JS: ${errors.length}`);
    if (problems.length) failures++;
    rows.push({ page: name, size, ...m, jsErrors: errors.length, ok: problems.length === 0, problems });
    if (shotsDir && SHOT_SIZES.has(size)) {
      await page.screenshot({ path: join(shotsDir, `${name}-${size}.png`), fullPage: false });
    }
  }
  page.off("pageerror", onErr);
}
await browser.close();

console.log("trang".padEnd(12), "kích thước".padEnd(11), "tràn".padEnd(6), "thanh dưới".padEnd(11), "ghi chú");
for (const r of rows) {
  const nav = r.navShown ? (r.navInView ? "trong khung" : "NGOÀI") : "-";
  console.log(r.page.padEnd(12), r.size.padEnd(11), String(r.overflowX).padEnd(6), nav.padEnd(11), r.problems.join("; "));
}
console.log(`\nTổng: ${rows.length} lượt kiểm tra, ${failures} lượt có lỗi.`);

const reportDir = shotsDir || process.env.LAYOUT_OUT || tmpdir();
const reportPath = join(reportDir, "layout-report.json");
writeFileSync(reportPath, JSON.stringify({ base: BASE, checkedAt: new Date().toISOString(), rows }, null, 2));
console.log(`Báo cáo: ${reportPath}`);
process.exit(failures ? 1 : 0);
