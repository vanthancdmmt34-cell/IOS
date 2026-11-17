// Harvest Vietnamese UI strings ACTUALLY rendered on screen (real browser) for every role,
// plus API error messages in server code. Numbers are replaced with {0}, {1}... (pattern matching when translating).
// Excludes foreign language lesson content since content goes through a separate translation review workflow.
//   node tools/i18n-harvest.mjs [--out tools/i18n-strings.json] [--check public/locales/en.json]
// --check: print count of untranslated strings (used in bilingual coverage tests).
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)("playwright");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), "liferivo-i18n-"));
const PORT = 26000 + Math.floor(Math.random() * 900);
const B = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const VI = /[ÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴàáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/;
const templ = (s) => { let i = 0; return s.replace(/\d+(?:[.,]\d+)*/g, () => `{${i++}}`); };

const isContent = () => false;

const srv = spawn(process.execPath, ["server.js"], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), HOST: "127.0.0.1", DATA_DIR: DATA, GEMINI_API_KEY: "AQ.harvest-only-no-calls", GEMINI_BASE_URL: "http://127.0.0.1:9" }, stdio: "ignore" });
for (let i = 0; i < 100; i++) { try { if ((await fetch(B + "/api/health")).ok) break; } catch {} await sleep(100); }
async function apiUser(u, extra = {}) { const r = await fetch(B + "/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: u, password: "matkhau1", displayName: u, ...extra }) }); const j = await r.json(); return { cookie: r.headers.get("set-cookie").split(";")[0], csrf: j.csrfToken, id: j.user.id }; }
const call = (c, p, method = "GET", body) => fetch(B + p, { method, headers: { "Content-Type": "application/json", Cookie: c.cookie, "X-CSRF-Token": c.csrf }, body: body ? JSON.stringify(body) : undefined }).then((r) => r.json());
const admin = await apiUser("quantri"); const teacher = await apiUser("giaovien"); const student = await apiUser("hocsinh"); const parent = await apiUser("phuhuynh", { accountType: "parent" });
await call(admin, "/api/admin/licenses", "POST", { username: "giaovien", seats: 10, months: 12, note: "harvest" });
await call(admin, "/api/admin/settings", "PUT", { values: { payBank: "970422", payAccountNo: "0123456789", payAccountName: "A" } });
const cls = (await call(teacher, "/api/classes", "POST", { name: "Lop" })).class;
await call(student, "/api/classes/join", "POST", { code: cls.joinCode });
const asg = (await call(teacher, `/api/classes/${cls.id}/assignments`, "POST", { kind: "test", refId: "", title: "KT", dueAt: new Date(Date.now() + 86400000).toISOString() })).assignment;
const tst = (await call(teacher, `/api/classes/${cls.id}/tests`, "POST", { title: "KT", questions: [{ type: "mcq", q: "1+1?", options: ["1", "2"], answer: 1 }] })).test;
const fo = await call(parent, "/api/billing/orders", "POST", { planId: "family_1m" });
await call(admin, `/api/admin/biz/orders/${fo.order.id}/confirm`, "POST", { bankRef: "FT-HARVEST" });
await call(parent, "/api/family/invite", "POST", { username: "hocsinh" });

const found = new Map();
const br = await chromium.launch();
async function collect(p, where) {
  const items = await p.evaluate(() => {
    const SK = new Set(["SCRIPT", "STYLE", "PRE", "CODE", "TEXTAREA", "KBD"]);
    const skip = (e) => { for (; e && e !== document.body; e = e.parentElement) if (SK.has(e.tagName) || (e.classList && e.classList.contains("te")) || (e.getAttribute && e.getAttribute("data-i18n") === "off")) return true; return false; };
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) if (!skip(n.parentElement)) out.push(n.nodeValue);
    document.querySelectorAll("[placeholder],[title],[aria-label],[alt]").forEach((el) => { if (!skip(el.tagName === "TEXTAREA" ? el.parentElement : el)) for (const a of ["placeholder", "title", "aria-label", "alt"]) if (el.getAttribute(a)) out.push(el.getAttribute(a)); });
    out.push(...document.title.split(" · "));
    return out;
  });
  for (const raw of items) {
    const s = raw.replace(/\s+/g, " ").trim();
    if (!s || !VI.test(s) || isContent(s)) continue;
    const k = /\d/.test(s) ? templ(s) : s;
    if (!found.has(k)) found.set(k, where);
  }
}
async function session(user, pages) {
  const ctx = await br.newContext({ viewport: { width: 1366, height: 900 } });
  const p = await ctx.newPage();
  if (user) { await p.goto(B + "/#/dang-nhap"); await sleep(600); await p.fill("[name=u]", user); await p.fill("[name=p]", "matkhau1"); await p.click("[data-submit]"); await p.waitForSelector(".side"); }
  for (const pg of pages) {
    const [h, act] = Array.isArray(pg) ? pg : [pg];
    await p.goto(B + "/" + h); await sleep(900);
    await collect(p, h);
    if (act) { try { await act(p); await sleep(700); await collect(p, h + " (thao tác)"); await p.keyboard.press("Escape"); } catch {} }
  }
  await ctx.close();
}
const clickAll = (sel) => async (p) => { for (const el of await p.$$(sel)) { await el.click().catch(() => {}); await sleep(500); const mp = p; await collect(mp, "tab"); } };
// Guest
await session(null, ["#/", ["#/", async (p) => { await p.click("[data-auth=register]"); }], ["#/", async (p) => { await p.click("[data-auth=login]"); }]]);
// Student
await session("hocsinh", ["#/", "#/chon-mon", "#/ngoai-ngu", "#/ngoai-ngu/en", "#/ngoai-ngu/luyen-noi/en", "#/ngoai-ngu/on-tap/en", "#/ngoai-ngu/xep-hang/en", "#/ngoai-ngu/huy-hieu/en", "#/ngoai-ngu/chung-nhan-cua-toi/en", "#/phong-van", "#/thong-bao", "#/ai", "#/lop", `#/lop/${cls.id}`, `#/bai-giao/${asg.id}`, `#/kiem-tra-lop/${tst.id}`, "#/gia-dinh", "#/ca-nhan", "#/goi-cua-toi", "#/bang-gia", "#/bang-gia?goi=family", "#/bang-gia?goi=teacher", "#/khong-co"]);
// Teacher
await session("giaovien", ["#/giao-vien", ["#/giao-vien/hoc-vien", async (p) => { await p.click("#mkStu"); }], ["#/giao-vien", async (p) => { await p.click("#newClass"); }], ...["thanh-vien", "bai-tap", "kiem-tra", "bao-cao", "cai-dat"].map((t) => `#/giao-vien/lop/${cls.id}?tab=${t}`), [`#/giao-vien/lop/${cls.id}?tab=bai-tap`, async (p) => { await p.click("#newA"); }], [`#/giao-vien/lop/${cls.id}?tab=kiem-tra`, async (p) => { await p.click("#newT"); }], `#/bai-giao/${asg.id}`, `#/kiem-tra-lop/${tst.id}`, `#/in-bao-cao/${cls.id}`, "#/lop", "#/quan-tri"]);
// Parent
await session("phuhuynh", ["#/", "#/gia-dinh", "#/goi-cua-toi"]);
// Admin
await session("quantri", ["#/quan-tri", ...["tong-quan", "hoc-vien", "bai-nop", "lich-thi", "bai-tap", "thong-bao", "lop-giay-phep", "cai-dat", "du-lieu"].concat(["song-ngu", "giao-vien"]).map((t) => `#/quan-tri/${t}`), ["#/quan-tri/kinh-doanh", clickAll("[data-sub]")], ["#/quan-tri/he-thong", clickAll("[data-panel]")], ["#/quan-tri/hoc-vien", async (p) => { await p.click("#addOne").catch(() => {}); }], ["#/quan-tri/song-ngu", async (p) => { await p.click("[data-open='lesson/l01']"); }], ["#/quan-tri/giao-vien", async (p) => { await p.click("#mkT"); }]]);
// Floating AI assistant
await session("giaovien", [["#/giao-vien", async (p) => { await p.click(".aiw-fab"); }]]);
await br.close(); srv.kill(); fs.rmSync(DATA, { recursive: true, force: true });

// API error / status messages (static strings in server code)
for (const f of ["server.js", ...fs.readdirSync(path.join(ROOT, "modules")).map((x) => "modules/" + x)]) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  for (const m of src.matchAll(/(?:error: |bad\(res, \d+, |reason: |toast\()"([^"`$]{3,300})"/g)) { const s = m[1]; if (VI.test(s) && !isContent(s)) { const k = /\d/.test(s) ? templ(s) : s; if (!found.has(k)) found.set(k, f); } }
}

const list = [...found.keys()].sort((a, b) => a.localeCompare(b, "vi"));
const out = arg("--out");
if (out) fs.writeFileSync(path.join(ROOT, out), JSON.stringify(Object.fromEntries(list.map((k) => [k, found.get(k)])), null, 1));
const check = arg("--check");
if (check) {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, check), "utf8"));
  const pats = (d.patterns || []).map(([vi]) => new RegExp("^" + vi.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{(\d+)\}/g, "(.+?)") + "$"));
  const missing = list.filter((k) => !(k in d.exact) && !pats.some((r) => r.test(k)));
  console.log(`Chuỗi giao diện: ${list.length}, đã dịch: ${list.length - missing.length}, chưa dịch: ${missing.length} (${Math.round(((list.length - missing.length) / list.length) * 1000) / 10}%)`);
  if (process.argv.includes("--list")) for (const k of missing) console.log("  - " + k + "   [" + found.get(k) + "]");
} else console.log(`Đã gom ${list.length} chuỗi.`);
