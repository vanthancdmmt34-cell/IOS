/* LifeRivo 2.0 - bootstrap, app shell, and router */
import { appHash, setAppHash } from "./core.js";
import { S, api, esc, icon, lineIcon, sketchIcon, avatar, fmtN, timeAgo, onScores, setScores, totalStats, closeTopModal, openModal, chapterShort, toast, $, cfg, applyBrand, siteName, brandHtml, themeBtnHtml, refreshAiStatus, aiOn, paintProBadges } from "./core.js";
import { renderLanding, openAuth } from "./landing.js";
// Admin chi tai khi vao route quan-tri (khach khong can admin.js -> nhe LCP).
let _pageAdmin = null;
async function pageAdminLazy(main, params, query, ctx) {
  if (!_pageAdmin) {
    const m = await import("./admin.js");
    _pageAdmin = m.pageAdmin;
  }
  return _pageAdmin(main, params, query, ctx);
}
import { pagePricing, pageMyPlan, pageAi } from "./pro.js";
import { pageMyClasses, pageJoinLink, pageClass, pageAssignment, pageClassTest, pageTeacher, pageTeacherClass, pagePrintReport } from "./classroom.js";
import { pageFamily } from "./family.js";
import { pageHome, pageLangCourse, pageLangExercise, pageLangWrite, pageLangTheory, pageLangReview, pageLangCertificate, pageLangCertList, pageLangLeaderboard, pageLangBadges, paintLangSide, refreshLangSide, paintSubjectPill, getSubject, setSubject, subjectNav, subjectInfo } from "./lang.js";
import { pageMyStudents } from "./teacher-students.js";
import { roleLabel } from "./core.js";
import { applyLang, initialLang, currentLang } from "./i18n.js";
import { loadPrefs, levelOf } from "./game.js";
import { initFlags } from "./flags.js";
import { mountAiWidget, aiWidgetRoute } from "./ai-widget.js";
import { companionRoute } from "./companion.js";
import { startMobileFold } from "./mobile-fold.js";
import { pageInterview } from "./interview.js";

// Lazy-load pages.js (code-split): the big page renderers are only needed after
// navigation, not for the landing page. Cached after the first load.
let _pagesPromise = null;
function loadPages() {
  if (!_pagesPromise) _pagesPromise = import("./pages.js");
  return _pagesPromise;
}
// Route handler wrapper: load pages.js on demand, then call the page function.
const pageFn = (fn) => (m, p, q, c) => loadPages().then((x) => x[fn](m, p, q, c));
// Nap mot file CSS dong (tra Promise); dung de nap bundle.min.css khi vao app.
const _loadedCss = new Set();
function loadCss(href) {
  if (_loadedCss.has(href)) return Promise.resolve();
  _loadedCss.add(href);
  return new Promise((resolve, reject) => {
    for (const l of document.querySelectorAll('link[rel="stylesheet"]')) {
      if (l.getAttribute("href") === href) return resolve();
    }
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = href;
    l.onload = resolve;
    l.onerror = () => reject(new Error("Khong tai duoc " + href));
    document.head.appendChild(l);
  });
}

const root = document.getElementById("root");
let cleanups = [];
export function onLeave(fn) { cleanups.push(fn); }

/* ---------- Boot ---------- */
async function boot() {
  initFlags(); // 4.11.1: flag emojis -> SVG images (Windows lacks flag emoji glyphs)
  import("./hscroll-dots.js").then((m) => m.initHscrollDots()).catch(() => {}); // dấu chấm thay thanh cuộn xám trên hàng ngang
  root.innerHTML = `<div class="boot"><span class="spin" style="width:26px;height:26px"></span><span>Đang mở…</span></div>`;
  const [pub, me] = await Promise.all([api("/api/public/config").catch(() => null), api("/api/me").catch(() => null)]);
  if (pub) { S.cfg = pub.config || {}; S.version = pub.version || ""; applyBrand(S.cfg); }
  await applyLang(initialLang(me && me.user ? me.user.lang : null));
  if (!me) {
    // Khách mở thẳng link /app/... (link chia sẻ, bookmark, tải lại trang): lưu đích, về trang chủ, mở hộp đăng nhập.
    if (/^\/app\/[a-z]/.test(appHash()) && !/^\/app\/(dang|dat-lai-mat-khau)/.test(appHash())) {
      try { sessionStorage.setItem("pl:after-auth", appHash()); } catch {}
      history.replaceState(null, "", "/");
      showLanding();
      setTimeout(() => openAuth("register"), 0);
      return;
    }
    return showLanding();
  }
  await enterApp(me);
}

function showLanding() {
  S.me = null;
  document.body.classList.remove("in-app");
  // Public password reset page (with token in URL)
  if (/^\/app\/dat-lai-mat-khau/.test(appHash())) {
    root.innerHTML = `<div class="main" style="max-width:560px;margin:40px auto;padding:0 16px"><div class="page" id="publicPage"></div>
      <p class="small muted" style="text-align:center;margin-top:12px"><a href="/app/dang-nhap">← Về đăng nhập</a></p></div>`;
    const q = Object.fromEntries(new URLSearchParams((appHash().split("?")[1] || "")));
    pageFn("pageResetPassword")(document.getElementById("publicPage"), [], q, {
      setCrumbs() {}, onLeave() {}, isCurrent: () => true,
    });
    return;
  }
  renderLanding(root, async (isNew) => {
    try {
      const me = await api("/api/me");
      await enterApp(me, isNew, true);
    } catch (e) { toast(e.message, "err"); }
  });
}

function maintenanceScreen() {
  root.innerHTML = `<div class="boot" style="text-align:center;padding:24px"><div style="font-size:54px" aria-hidden="true">🛠️</div><h1>Đang bảo trì</h1>
    <p class="muted" style="max-width:46ch">${esc(cfg("maintenanceText", "Hệ thống đang bảo trì."))}</p>
    <div class="row" style="justify-content:center"><button class="btn btn-primary" data-reload>Thử lại</button><button class="btn" id="mtOut">Đăng xuất</button></div></div>`;
  $("#mtOut").addEventListener("click", logout);
}

// Nút tài khoản trên thanh đầu: tên từ 10 ký tự trở xuống thì hiện avatar kèm tên; dài hơn thì chỉ hiện tên. Nhãn gói nằm ngay sau tên.
// Nút đổi giao diện trên thanh trên: cùng thuộc tính với themeBtnHtml (core.js), chỉ thay biểu tượng bằng nét đơn
function topbarThemeBtn() {
  return `<button type="button" class="theme-btn" data-theme-toggle aria-label="Đổi giao diện sáng / tối" title="Đổi giao diện sáng / tối"><span class="t-moon">${lineIcon("moon")}</span><span class="t-sun">${lineIcon("sun")}</span><span class="theme-btn-txt"><b class="tt-dark">Chế độ tối</b><b class="tt-light">Chế độ sáng</b></span></button>`;
}
function accountChipHtml() {
  const name = String(S.me.displayName || S.me.username || "");
  const long = [...name].length > 10;
  const words = name.trim().split(" ").filter(Boolean);
  const last = words.pop() || "";
  const head = !long && words.length ? esc(words.join(" ")) + " " : "";
  // Nhãn gói nằm trên cả tên (không phải chỉ chữ cuối)
  return `<span class="ud-name${long ? " ud-name-long" : ""}"><b>${head}<span class="ud-last">${esc(last)}<span data-pro-slot></span></span></b></span>`;
}

// Mỗi ngày khi đăng nhập: nếu tài khoản chưa nhận lượt 10 phút Pro miễn phí trong ngày thì nhắc; đã nhận thì bỏ qua.
// Bấm Nhận sẽ mở trang Hồ sơ, tại đó bấm Nhận miễn phí.
async function dailyProNotice() {
  if (!S.me || S.me.role === "admin" || (S.membership && S.membership.pro)) return;
  const st = await api("/api/me/pro-access").catch(() => null);
  if (!st || !st.daily || !st.daily.canClaim) return;
  // Chờ hướng dẫn lần đầu đóng xong để thông báo không bị che.
  for (let i = 0; i < 240 && document.querySelector(".gd"); i++) await new Promise((r) => setTimeout(r, 500));
  if (!document.body.classList.contains("in-app")) return;
  const bar = document.createElement("div");
  bar.className = "daily-pro-notice";
  bar.setAttribute("role", "status");
  bar.style.cssText = "position:fixed;left:50%;transform:translateX(-50%);bottom:16px;z-index:60;display:flex;align-items:center;gap:12px;flex-wrap:wrap;max-width:calc(100vw - 32px);padding:12px 14px;border-radius:16px;background:var(--paper-2,#fff);border:1px solid var(--line,#e5e5ea);box-shadow:0 10px 30px rgba(0,0,0,.14)";
  bar.innerHTML = '<span style="font-size:14px">Hôm nay bạn có <b>10 phút dùng thử Pro</b> miễn phí.</span><button class="btn btn-sm btn-primary" type="button" data-go>Nhận</button><button class="btn btn-sm btn-ghost" type="button" data-x aria-label="Đóng">×</button>';
  bar.querySelector("[data-go]").addEventListener("click", () => { bar.remove(); setAppHash("/app/ca-nhan"); });
  bar.querySelector("[data-x]").addEventListener("click", () => bar.remove());
  document.body.appendChild(bar);
  setTimeout(() => bar.remove(), 25000);
}

async function enterApp(me, isNew = false, fromAuth = false) {
  S.me = me.user; S.csrf = me.csrfToken; S.scores = me.scores; S.membership = me.membership || { pro: false }; S.nav = me.nav || {};
  if (me.config) { S.cfg = me.config; applyBrand(S.cfg); }
  // Nap bundle.min.css (full app CSS) song song; landing chi can landing.min.css.
  const bundleCss = document.querySelector('meta[name="pl-bundle-css"]')?.content || "/css/bundle.min.css";
  const cssPromise = loadCss(bundleCss).catch(() => {});
  if (me.version) S.version = me.version;
  // Sync language after login, before loading curriculum: if the user just clicked
  // VI/EN on the landing page, save that choice to the account (persisted for next time);
  // otherwise use the profile language.
  {
    // Ngon ngu trong app theo lua chon o trang chu (localStorage); dong bo len profile neu lech.
    const want = currentLang();
    if (want !== me.user.lang) { try { await api("/api/profile/lang", "PUT", { lang: want }); me.user.lang = want; } catch {} }
    await applyLang(want);
  }
  if (me.maintenance) return maintenanceScreen();
  await loadPrefs();
  await refreshAiStatus();
  S.loaded = true;
  document.body.classList.add("in-app");
  await cssPromise;
  renderShell();
  mountAiWidget().catch(() => {});
  refreshNotifBadge();
  paintProBadges();
  dailyProNotice();
  if (appHash().startsWith("/app/dang")) setAppHash("/app/");
  // Khách đã bấm thẻ lộ trình / thẻ môn ở trang chủ: vào thẳng trang đích sau khi đăng nhập / đăng ký
  let afterAuth = ""; try { afterAuth = sessionStorage.getItem("pl:after-auth") || ""; sessionStorage.removeItem("pl:after-auth"); } catch {}
  if (/^\/app\/[a-z]/.test(afterAuth)) history.replaceState(null, "", afterAuth); else afterAuth = "";
  // Đăng nhập: đã có môn thì vào thẳng tổng quan môn đó; chưa có môn thì mở luồng thiết lập lần đầu (welcome.js)
  const accountSubj = S.prefs && ["en", "zh", "ja", "ko", "fr", "es"].includes(S.prefs.subject) ? S.prefs.subject : "";
  if (fromAuth && !afterAuth) setAppHash(accountSubj ? `/app/${accountSubj}` : "/app/chon-mon");
  route();
  // Hướng dẫn lần đầu sau khi đăng nhập (bỏ qua được, không hiện lại sau khi đã đóng)
  // Người chưa có môn đang ở luồng thiết lập (welcome.js): không chồng thêm hướng dẫn; hướng dẫn mở ở lần sau
  if (accountSubj) setTimeout(() => import("./guide.js").then((m) => m.openGuide()).catch(() => {}), 700);
  if (isNew) {
    // Batch 2: newly registered accounts pick a learning goal before landing on the main Dashboard.
    // Người mới: trang tổng quan đã hỏi một câu và dẫn thẳng vào bài đầu, không mở thêm hộp hỏi mục tiêu
    toast(`Chào ${S.me.displayName}! Chọn môn bạn muốn học nhé.`, "ok", 4200);
  }
}

/* ---------- Shell ---------- */
// Unified Left Sidebar Shell: keep navigation grouped cleanly on the left across learning and account pages.
const ACCOUNT_ROUTES = new Set(["ca-nhan", "goi-cua-toi", "chung-nhan", "huy-hieu", "xep-hang", "thong-bao", "gia-dinh", "bang-gia", "giao-vien", "giao-vien/hoc-vien", "quan-tri-ngoai-ngu", "quan-tri", "quan-tri/kinh-doanh"]);
const zoneOf = (r) => ACCOUNT_ROUTES.has(r) ? "acct" : "learn";
// Streamlined menu per UX review: prioritize practice, group learning items, hide unused items.
const NAV = [
  // Teacher section (shown first for teachers)
  ["-", "", "Giảng dạy", ["teacher", "admin"]],
  ["giao-vien", "home", "Bảng điều khiển", ["teacher", "admin"]],
  ["giao-vien/hoc-vien", "users", "Học viên của tôi", ["teacher", "admin"]],
  // Learning menu organized by study mode for the active language
  ["-", "", "Học tập"],
  ["mon-hoc", "route", "Lộ trình học"],
  ["co-vu", "sparkle", "Cổ Vũ"],
  ["luyen-noi", "mic", "Luyện nói"],
  ["on-tap", "clock", "Ôn tập"],
  ["so-tay", "book", "Sổ tay từ vựng"],
  ["tro-choi", "sparkle", "Trò chơi"],
  ["tro-chuyen", "bulb", "Hội thoại AI"],
  ["phong-van", "briefcase", "Phỏng vấn"],
  ["ngoai-ngu", "globe", "Ngoại ngữ"],
  ["chon-mon", "globe", "Chọn ngoại ngữ"],
  ["toeic", "award", "Luyện thi TOEIC"],
  ["ai", "bulb", "Hội thoại AI"],
  ["ho-tro", "life-buoy", "Hỗ trợ"],
  ["thong-bao", "bell", "Thông báo"],
  // Class / Family
  ["-", "", "Lớp học", null, "class"],
  ["lop", "book", "Lớp của tôi", ["student", "parent", "teacher"], "class"],
  ["gia-dinh", "users", "Gia đình", null, "family"],
  // Achievements - certificates first; leaderboard/badges depend on settings
  ["-", "", "Thành tích"],
  ["chung-nhan", "award", "Chứng nhận"],
  ["xep-hang", "trophy", "Xếp hạng", null, "leaderboard"],
  ["huy-hieu", "star", "Huy hiệu", null, "badge"],
  ["-", "", "Tài khoản"],
  ["ca-nhan", "user", "Hồ sơ của tôi"],
  ["goi-cua-toi", "key", "Gói của tôi"],
  ["bang-gia", "star", "Nâng cấp Pro"],
];

// Mô tả ngắn dưới từng mục học: người mới đọc là biết mục đó để làm gì
const NAV_HINT = {
  "mon-hoc": "Học từng bài theo thứ tự",
  "co-vu": "Tiến độ, nhiệm vụ & kế hoạch hôm nay",
  "luyen-noi": "Đọc theo giọng mẫu, máy chấm",
  "on-tap": "Nhắc lại từ sắp quên",
  "so-tay": "Từ đã lưu và ghi chú",
  "tro-choi": "Vừa chơi vừa nhớ từ",
  "tro-chuyen": "Trò chuyện, AI sửa câu",
  "ai": "Trò chuyện, AI sửa câu",
  "phong-van": "Tập trả lời phỏng vấn",
  "ngoai-ngu": "Chọn ngôn ngữ muốn học",
  "chon-mon": "Đổi hoặc thêm ngoại ngữ học",
  "toeic": "Luyện 7 phần của đề thi",
};

const NAV_CATS = [
  { id: "teach", icon: "cat-teach", label: "Giảng dạy", routes: new Set(["giao-vien", "giao-vien/hoc-vien"]) },
  { id: "learn", icon: "cat-learn", label: "Học tập", routes: new Set(["mon-hoc", "co-vu", "so-tay", "luyen-noi", "on-tap", "tro-choi", "tro-chuyen", "ai", "phong-van", "ngoai-ngu", "chon-mon", "toeic"]) },
  { id: "achieve", icon: "cat-achieve", label: "Thành tích & lớp học", routes: new Set(["chung-nhan", "xep-hang", "huy-hieu", "lop", "gia-dinh"]) },
  { id: "acct", icon: "cat-acct", label: "Tài khoản", routes: new Set(["thong-bao", "ca-nhan", "goi-cua-toi", "bang-gia", "ho-tro"]) },
  { id: "admin", icon: "cat-admin", label: "Quản trị", routes: new Set(["quan-tri", "quan-tri/kinh-doanh", "quan-tri/ngoai-ngu"]) },
];

// Feature can be disabled by the teacher in Settings. Teachers still see it for preview.
const FEATURE = { "ai": "aiEnabled", "tro-chuyen": "aiEnabled", "bang-gia": "proEnabled", "xep-hang": "leaderboard", "huy-hieu": "gamification" };
const featureOn = (r) => S.me.role === "admin" || !FEATURE[r] || cfg(FEATURE[r], true) !== false;


async function refreshNotifBadge() {
  try {
    const j = await api("/api/notifications?unread=1");
    const n = j.unread || 0;
    { const dot = document.getElementById("udBellDot"); if (dot) dot.hidden = !(n > 0); }
    document.querySelectorAll('.nav a[data-r="thong-bao"]').forEach((a) => {
      let b = a.querySelector(".n");
      if (n > 0) {
        if (!b) { b = document.createElement("span"); b.className = "n"; a.appendChild(b); }
        b.textContent = n > 99 ? "99+" : String(n);
      } else if (b) b.remove();
    });
  } catch {}
}

async function loadBellFeed(drop) {
  const en = currentLang() === "en";
  if (!drop.dataset.loaded) {
    drop.innerHTML = `<div class="ud-bell-head"><b>${en ? "Notifications" : "Thông báo"}</b></div><div class="ud-bell-empty">${en ? "Loading…" : "Đang tải…"}</div>`;
  }
  try {
    const [n, a] = await Promise.all([
      api("/api/notifications").catch(() => ({ items: [], unread: 0 })),
      api("/api/announcements").catch(() => ({ announcements: [] })),
    ]);
    drop.dataset.loaded = "1";
    const items = (n.items || []).slice(0, 4).map((x) => ({
      nid: x.id,
      title: x.title || "",
      sub: [x.body || "", timeAgo(x.createdAt)].filter(Boolean).join(" · "),
      unread: !x.readAt,
    }));
    if (items.length < 4) {
      for (const x of (a.announcements || []).slice(0, 4 - items.length)) {
        items.push({ nid: 0, title: x.title || (en ? "Class notice" : "Thông báo lớp"), sub: timeAgo(x.createdAt), unread: false });
      }
    }
    const unread = n.unread || 0;
    const dot = document.getElementById("udBellDot");
    if (dot) dot.hidden = !(unread > 0);
    drop.innerHTML = `
      <div class="ud-bell-head">
        <b>${en ? "Notifications" : "Thông báo"}${unread > 0 ? ` <span class="ud-bell-cnt">${unread > 99 ? "99+" : unread}</span>` : ""}</b>
        ${unread > 0 ? `<button type="button" class="ud-bell-readall" id="udBellReadAll">${en ? "Mark all read" : "Đọc hết"}</button>` : ""}
      </div>
      ${items.length ? `<div class="ud-bell-list">${items.map((x) => `<a class="ud-bell-item${x.unread ? " is-new" : ""}" href="/app/thong-bao"${x.nid ? ` data-nid="${x.nid}"` : ""}>
        <b>${esc(x.title)}</b>
        ${x.sub ? `<small>${esc(x.sub)}</small>` : ""}
      </a>`).join("")}</div>` : `<div class="ud-bell-empty">${en ? "No new notifications." : "Chưa có thông báo mới."}</div>`}
      <a class="ud-bell-all" href="/app/thong-bao">${en ? "Open notifications page" : "Vào trang thông báo chính"} →</a>`;
    drop.querySelector("#udBellReadAll")?.addEventListener("click", async (e) => {
      e.preventDefault(); e.stopPropagation();
      try { await api("/api/notifications/read-all", "POST", {}); refreshNotifBadge(); await loadBellFeed(drop); } catch {}
    });
    drop.querySelectorAll("[data-nid]").forEach((el) => el.addEventListener("click", () => {
      api(`/api/notifications/${el.dataset.nid}/read`, "POST", {}).then(() => refreshNotifBadge()).catch(() => {});
    }));
  } catch {
    drop.innerHTML = `<div class="ud-bell-head"><b>${en ? "Notifications" : "Thông báo"}</b></div><div class="ud-bell-empty">${en ? "Could not load notifications." : "Không tải được thông báo."}</div><a class="ud-bell-all" href="/app/thong-bao">${en ? "Open notifications page" : "Vào trang thông báo chính"} →</a>`;
  }
}

let topbarGlobalBound = false;
function bindHoverMenu(wrap, btn, drop, { onOpen, others = [] } = {}) {
  if (!wrap || !btn || !drop) return { close() {} };
  let timer = 0, openedAt = 0;
  const clear = () => { if (timer) { clearTimeout(timer); timer = 0; } };
  const open = () => {
    clear();
    others.forEach((fn) => fn());
    if (drop.hidden) {
      openedAt = Date.now();
      drop.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    }
    if (onOpen) onOpen(drop);
  };
  const close = () => {
    clear();
    if (!drop.hidden) {
      drop.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
  };
  const closeSoon = () => { clear(); timer = setTimeout(close, 160); };
  wrap.addEventListener("mouseenter", open);
  wrap.addEventListener("mouseleave", closeSoon);
  wrap.addEventListener("focusin", open);
  wrap.addEventListener("focusout", (e) => { if (!wrap.contains(e.relatedTarget)) closeSoon(); });
  btn.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    // Chạm trên điện thoại (hoặc bấm khi chưa rê chuột): trình duyệt bắn focusin/mouseenter NGAY TRƯỚC click,
    // menu vừa mở xong đã bị chính cú click này đóng lại -> không bao giờ mở được. Bỏ qua lần đóng đó.
    if (drop.hidden) open(); else if (Date.now() - openedAt > 450) close();
  });
  drop.addEventListener("click", (e) => { if (e.target.closest("a, button:not(#udBellReadAll)")) close(); });
  return { close };
}

function renderShell() {
  // 4.0: role-based menu (only show features the user can access; server still enforces permissions)
  const hints = S.nav || {};
  const showClass = !!hints.hasClass || S.me.role === "admin" || S.me.role === "teacher";
  const showFamily = !!hints.hasFamily || S.me.role === "parent" || S.me.role === "admin";
  const showLb = cfg("leaderboard", true) !== false;
  const showBadge = cfg("gamification", true) !== false;
  // 4.9.2: when focused on a single subject, the menu only shows items for that subject
  const subj = getSubject();
  const nav = NAV.map((it) => {
    if (["ngoai-ngu", "chung-nhan", "xep-hang", "huy-hieu"].includes(it[0])) return subjectNav(it);
    if (!subj) return it;
    if (it[0] === "mon-hoc") return ["mon-hoc", it[1], it[2], it[3], it[4], `/app/?mon=${subj}`];
    if (it[0] === "luyen-noi") return ["luyen-noi", it[1], it[2], it[3], it[4], `/app/ngoai-ngu/luyen-noi/${subj}`];
    if (it[0] === "on-tap") return ["on-tap", it[1], it[2], it[3], it[4], `/app/ngoai-ngu/on-tap/${subj}`];
    if (it[0] === "tro-choi") return ["tro-choi", it[1], it[2], it[3], it[4], `/app/tro-choi/${subj}`];
    if (it[0] === "tro-chuyen") return ["tro-chuyen", it[1], it[2], it[3], it[4], `/app/ngoai-ngu/tro-chuyen/${subj}`];
    if (it[0] === "phong-van") return ["phong-van", it[1], it[2], it[3], it[4], `/app/phong-van/${subj}`];
    if (it[0] === "toeic") return ["toeic", it[1], it[2], it[3], it[4], "/app/toeic"];
    return it;
  }).filter(([r, , , roles, flag]) => {
    if (subj && r === "ngoai-ngu") return false;
    if (r === "toeic" && subj !== "en") return false; // TOEIC & luyện thi chỉ thuộc môn Tiếng Anh

    if (!subj && ["mon-hoc", "luyen-noi", "on-tap", "tro-chuyen"].includes(r)) return false;
    if (!subj && ["chung-nhan", "xep-hang", "huy-hieu"].includes(r)) return false; // thành tích chỉ có theo từng ngoại ngữ
    // 4.9.3: students see the compact menu; teachers/admins see the full menu
    const learner = !["admin", "teacher"].includes(S.me.role);
    // Đã chọn môn: dùng Hội thoại AI theo môn thay vì mục AI chung
    if (subj && r === "ai") return false;
    if (learner && r === "ho-tro") return false;
    if (learner && r === "goi-cua-toi" && !(S.membership && S.membership.pro)) return false;
    if (learner && r === "bang-gia" && S.membership && S.membership.pro) return false;
    if (r !== "-" && !featureOn(r)) return false;
    if (r === "ai" && !aiOn()) return false; // máy chủ chưa cấu hình trợ lý AI: ẩn mục "Hội thoại AI"
    if (roles && !roles.includes(S.me.role)) return false;
    if (flag === "class" && !showClass) return false;
    if (flag === "family" && !showFamily) return false;
    if (flag === "leaderboard" && !showLb) return false;
    if (flag === "badge" && !showBadge) return false;
    return true;
  }).filter((item, i, arr) => {
    if (item[0] !== "-") return true;
    for (let k = i + 1; k < arr.length; k++) {
      if (arr[k][0] === "-") break;
      return true;
    }
    return false;
  });
  if (S.me.role === "admin") nav.push(["-", "", "Quản trị"], ["quan-tri", "settings", "Quản trị hệ thống"], ["quan-tri/kinh-doanh", "key", "Thanh toán và gói", null, null, "/app/quan-tri/kinh-doanh?sub=thanh-toan"], ["quan-tri/ngoai-ngu", "globe", "Quản lý ngoại ngữ"]);
  const catGroups = NAV_CATS.map((g) => ({
    ...g,
    items: nav.filter(([r]) => r !== "-" && g.routes.has(r)),
  })).filter((g) => g.items.length > 0);
  // Giu lai noi dung trang: ve lai shell se pha huy #main cu (trang se trang
  // tron neu khong co ai ve lai). Luu tham chieu roi gan lai sau khi ve xong.
  const subjMeta = subj ? subjectInfo(subj) : null;
  const oldMain = document.getElementById("main");
  const mtEn = currentLang() === "en";
  const roleAvatar = S.me.role === "teacher"
    ? "/img/kit/chibi-owl.webp"
    : S.me.role === "admin"
      ? "/img/kit/chibi-dragon.webp"
      : "/img/kit/chibi-bunny.webp";
  const roleSub = subjMeta
    ? `${roleLabel(S.me.role)} · ${subjMeta.name}`
    : (S.me.role === "teacher" ? "Tài khoản giáo viên" : S.me.role === "admin" ? "Quản trị hệ thống" : roleLabel(S.me.role));
  const isTeacherRole = S.me.role === "teacher";
  const isParentRole = S.me.role === "parent";
  const mtabHtml = isTeacherRole
    ? `<a href="/app/giao-vien" data-mt="gv-home"><span class="mtab-ic">${lineIcon("home")}</span><span class="mtab-lbl">${mtEn ? "Overview" : "Tổng quan"}</span></a>
       <a href="/app/giao-vien/hoc-vien" data-mt="gv-students"><span class="mtab-ic">${lineIcon("users")}</span><span class="mtab-lbl">${mtEn ? "Students" : "Học viên"}</span></a>
       <a href="/app/lop" data-mt="gv-classes"><span class="mtab-ic">${lineIcon("book")}</span><span class="mtab-lbl">${mtEn ? "Classes" : "Lớp học"}</span></a>
       <a href="/app/thong-bao" data-mt="pr-notices"><span class="mtab-ic">${lineIcon("bell")}</span><span class="mtab-lbl">${mtEn ? "Notices" : "Thông báo"}</span></a>
       <button type="button" class="mtab-more" data-mt="gv-menu" data-open-nav aria-label="Menu"><span class="mtab-ic">${lineIcon("menu")}</span><span class="mtab-lbl">Menu</span></button>`
    : isParentRole
      ? `<a href="/app/gia-dinh" data-mt="pr-family"><span class="mtab-ic">${lineIcon("home")}</span><span class="mtab-lbl">${mtEn ? "Family" : "Gia đình"}</span></a>
         <a href="/app/lop" data-mt="pr-classes"><span class="mtab-ic">${lineIcon("book")}</span><span class="mtab-lbl">${mtEn ? "Classes" : "Lớp học"}</span></a>
         <a href="/app/thong-bao" data-mt="pr-notices"><span class="mtab-ic">${lineIcon("bell")}</span><span class="mtab-lbl">${mtEn ? "Notices" : "Thông báo"}</span></a>
         <a href="/app/ca-nhan" data-mt="ca-nhan"><span class="mtab-ic">${lineIcon("user")}</span><span class="mtab-lbl">${mtEn ? "Profile" : "Cá nhân"}</span></a>`
      : `<a href="/app/chon-mon" data-mt="home"><span class="mtab-ic">${lineIcon("home")}</span><span class="mtab-lbl">${mtEn ? "Overview" : "Tổng quan"}</span></a>
         <a href="/app/chon-mon" data-mt="mon-hoc"><span class="mtab-ic">${lineIcon("route")}</span><span class="mtab-lbl">${mtEn ? "Roadmap" : "Lộ trình"}</span></a>
         <a href="/app/chon-mon" data-mt="hoc-tap" class="mtab-center"><span class="mtab-ic">${lineIcon("book")}</span><span class="mtab-lbl">${mtEn ? "Learn" : "Học"}</span></a>
         <a href="/app/chon-mon" data-mt="on-tap"><span class="mtab-ic">${lineIcon("clock")}</span><span class="mtab-lbl">${mtEn ? "Review" : "Ôn tập"}</span></a>
         <a href="/app/co-vu" data-mt="co-vu"><span class="mtab-ic">${lineIcon("sparkle")}</span><span class="mtab-lbl">${mtEn ? "Cheer" : "Cổ vũ"}</span></a>
         <a href="/app/ca-nhan" data-mt="ca-nhan"><span class="mtab-ic">${lineIcon("user")}</span><span class="mtab-lbl">${mtEn ? "Profile" : "Cá nhân"}</span></a>`;

  root.innerHTML = `
  <div class="shell">
    <aside class="side" id="side" aria-label="Điều hướng chính">
      <div class="side-m-head">
        <img class="side-m-avatar" src="${roleAvatar}" width="52" height="52" alt="" loading="lazy" decoding="async">
        <div class="side-m-who">
          <b>${esc(S.me.displayName || S.me.username)}<span data-pro-slot></span></b>
          <small>${esc(roleSub)}</small>
        </div>
        <button type="button" class="side-m-close" id="sideCloseBtn" data-close-nav aria-label="Đóng menu">×</button>
      </div>
      <a class="brand" href="/app/">${brandHtml()}</a>
      ${subjMeta ? `<div class="side-subj" style="--c:${esc(subjMeta.color || "#0EA5E9")}">
        <span class="side-subj-flag">${subjMeta.flag}</span>
        <div class="side-subj-info"><small>Môn đang học</small><b>${esc(subjMeta.name)}</b></div>
        <a class="side-subj-swap" href="/app/chon-mon" title="Đổi môn học khác">Đổi môn</a>
      </div>` : `<a class="side-back" href="/app/chon-mon"><span>Chọn môn học</span></a>`}
      <nav class="nav" id="sideNav" aria-label="Menu chức năng">
        ${catGroups.map((g) => `<details class="nav-cat" data-cat="${g.id}" open>
          <summary class="nav-cat-head">
            <span class="nav-cat-lbl">${esc(g.label)}</span>
            <span class="nav-cat-meta"><em class="nav-cat-cnt">${g.items.length}</em><span class="nav-cat-tog" aria-hidden="true">+</span></span>
          </summary>
          <div class="nav-cat-body">
            ${g.items.map(([r, ic, label, , , href]) => `<a href="${href || "/app/" + r}" data-r="${r}" data-zone="${zoneOf(r)}"><span class="nav-ic">${lineIcon(ic || "file")}</span><span class="nav-lbl"><span>${esc(label)}</span>${NAV_HINT[r] ? `<small class="nav-hint">${esc(NAV_HINT[r])}</small>` : ""}</span></a>`).join("")}
          </div>
        </details>`).join("")}
      </nav>
      <div class="side-foot">
        ${!(S.membership && S.membership.pro) && cfg("proEnabled", true) !== false ? `<div class="ud-prem">
          <img class="art chibi-ic" src="/img/kit/chibi-bunny.webp" width="56" height="56" alt="" loading="lazy" decoding="async" aria-hidden="true">
          <b>Nâng cấp Pro</b><p>Phỏng vấn AI không giới hạn, báo cáo chi tiết và nhiều hơn nữa.</p>
          <a href="/app/bang-gia">Nâng cấp ngay</a>
        </div>` : ""}
        <div>
          <div class="xp-line"><span id="sbLv">Tiến độ học tập</span><b id="sbXp">0/0 bài</b></div>
          <div class="bar thin"><i id="sbBar"></i></div>
        </div>
        <div class="sb-ring-card" id="sbTodayRing" style="--pct:0">
          <div class="sb-ring"><b id="sbTodayPct">0%</b></div>
          <div class="sb-ring-meta"><small>Tiến độ hôm nay</small><span>Làm bài để nhận ⭐</span></div>
        </div>
        <p class="side-ver" id="sbVer"></p>
        <div class="me-card">
          ${avatar(S.me.displayName, S.me.username)}
          <div class="who"><b>${esc(S.me.displayName)}<span data-pro-slot></span></b><span>${esc(roleLabel(S.me.role))}</span></div>
          <button type="button" class="side-action" id="sbSearch" data-open-search title="Tìm bài và chương" aria-label="Tìm bài và chương">${lineIcon("search")}<span>Tìm kiếm</span></button>
          <button type="button" class="side-action" id="sbGuide" title="Xem lại hướng dẫn" aria-label="Xem lại hướng dẫn">${lineIcon("bulb")}<span>Hướng dẫn</span></button>
          <button type="button" class="side-action" data-theme-toggle title="Đổi giao diện sáng / tối" aria-label="Đổi giao diện sáng / tối">${lineIcon("sun")}<span>Giao diện sáng / tối</span></button>
          <button class="side-action" id="logoutBtn" title="Đăng xuất" aria-label="Đăng xuất">${lineIcon("logout")}<span>Đăng xuất</span></button>
        </div>
      </div>
    </aside>
    <div class="side-scrim" id="scrim"></div>
    <div class="main">
      <header class="topbar">
        <button class="icon-btn menu-btn" id="menuBtn" aria-label="Mở menu">${lineIcon("menu")}</button>
        <button type="button" class="icon-btn m-top-back" id="mTopBack" aria-label="Quay lại"><svg class="line-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>
        <a class="brand top-brand" href="${subj ? "/app/mon-hoc" : "/app/"}" aria-label="${esc(siteName())}">${brandHtml()}</a>
        <div class="m-top-titles" id="mTopTitles">
          <b id="mTopTitle">${esc(siteName())}</b>
          <small id="mTopSub">${esc(roleLabel(S.me.role))} · LifeRivo Study</small>
        </div>
        <div class="crumbs" id="crumbs"></div>
        <span class="spacer"></span>
        <button class="search-btn" id="searchBtn" aria-label="Tìm bài, chương">${lineIcon("search")}<span class="lbl">Tìm bài, chương…</span><kbd>Ctrl K</kbd></button>
        <a class="streak-badge" id="streakBadge" href="/app/co-vu" aria-label="Chuỗi ngày học" title="Chuỗi ngày học liên tiếp" style="display:none"></a>
        ${topbarThemeBtn()}
        <div class="ud-bell-wrap" id="udBellWrap">
          <button type="button" class="icon-btn ud-bell" id="udBell" aria-haspopup="true" aria-expanded="false" aria-label="Thông báo" title="Thông báo">${lineIcon("bell")}<i id="udBellDot" hidden></i></button>
          <div class="ud-drop ud-bell-drop" id="udBellDrop" hidden></div>
        </div>
        <button type="button" class="icon-btn m-top-more" id="mTopMore" data-open-nav aria-label="Mở menu điều hướng"><svg class="line-ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="6" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18" cy="12" r="1.8"/></svg></button>
        <div class="ud-user" id="udUserWrap">
          <button type="button" id="udUser" aria-haspopup="true" aria-expanded="false" aria-label="Tài khoản">${accountChipHtml()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
          <div class="ud-drop" id="udDrop" hidden>
            <div class="who"><b>${esc(S.me.displayName)}<span data-pro-slot></span></b><span>${esc(roleLabel(S.me.role))}</span></div>
            <a href="/app/ca-nhan">${lineIcon("user")}Hồ sơ của tôi</a>
            <a href="/app/goi-cua-toi">${lineIcon("key")}Gói của tôi</a>
            <a href="${subj ? `/app/ngoai-ngu/chung-nhan-cua-toi/${subj}` : "/app/chon-mon"}">${lineIcon("award")}Chứng nhận</a>
            ${S.me.role === "admin" ? `<a href="/app/quan-tri">${lineIcon("settings")}Quản trị hệ thống</a>` : ""}
            <button type="button" id="udGuide">${lineIcon("bulb")}Xem lại hướng dẫn</button>
            <button type="button" id="udLogout">${lineIcon("logout")}Đăng xuất</button>
          </div>
        </div>
      </header>
      <main id="main" class="page" tabindex="-1"></main>
    </div>
    <nav class="mtab${isParentRole ? " mtab-4" : isTeacherRole ? "" : " mtab-6"}" id="mTab" aria-label="Điều hướng nhanh">
      ${mtabHtml}
    </nav>
  </div>`;
  if (oldMain) { const nm = document.getElementById("main"); if (nm && nm !== oldMain) nm.replaceWith(oldMain); }
  $("#logoutBtn").addEventListener("click", logout);
  $("#sbGuide").addEventListener("click", () => import("./guide.js").then((m) => m.openGuide({ force: true })).catch(() => {}));
  {
    const userWrap = $("#udUserWrap"), ub = $("#udUser"), dr = $("#udDrop");
    const bellWrap = $("#udBellWrap"), bb = $("#udBell"), bd = $("#udBellDrop");
    let userMenu = null, bellMenu = null;
    userMenu = bindHoverMenu(userWrap, ub, dr, { others: [() => bellMenu && bellMenu.close()] });
    bellMenu = bindHoverMenu(bellWrap, bb, bd, {
      others: [() => userMenu && userMenu.close()],
      onOpen: (el) => loadBellFeed(el),
    });
    if (!topbarGlobalBound) {
      topbarGlobalBound = true;
      document.addEventListener("click", (e) => {
        if (!e.target.closest("#udUserWrap")) {
          const uDrop = document.getElementById("udDrop"), uBtn = document.getElementById("udUser");
          if (uDrop && !uDrop.hidden) { uDrop.hidden = true; uBtn?.setAttribute("aria-expanded", "false"); }
        }
        if (!e.target.closest("#udBellWrap")) {
          const bDrop = document.getElementById("udBellDrop"), bBtn = document.getElementById("udBell");
          if (bDrop && !bDrop.hidden) { bDrop.hidden = true; bBtn?.setAttribute("aria-expanded", "false"); }
        }
        if (e.target.closest("[data-open-nav]")) {
          e.preventDefault();
          document.body.classList.toggle("nav-open");
        } else if (e.target.closest("[data-close-nav]")) {
          e.preventDefault();
          document.body.classList.remove("nav-open");
        } else if (e.target.closest("[data-open-search]")) {
          e.preventDefault();
          document.body.classList.remove("nav-open");
          openPalette();
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        const uDrop = document.getElementById("udDrop"), uBtn = document.getElementById("udUser");
        if (uDrop && !uDrop.hidden) { uDrop.hidden = true; uBtn?.setAttribute("aria-expanded", "false"); }
        const bDrop = document.getElementById("udBellDrop"), bBtn = document.getElementById("udBell");
        if (bDrop && !bDrop.hidden) { bDrop.hidden = true; bBtn?.setAttribute("aria-expanded", "false"); }
      });
    }
    $("#udLogout").addEventListener("click", logout);
    $("#udGuide").addEventListener("click", () => import("./guide.js").then((m) => m.openGuide({ force: true })).catch(() => {}));
  }
  $("#menuBtn").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  $("#mTopBack")?.addEventListener("click", () => {
    const parentLink = [...document.querySelectorAll("#crumbs a")].pop();
    if (parentLink && parentLink.getAttribute("href")) {
      setAppHash(parentLink.getAttribute("href"));
      return;
    }
    const s = getSubject();
    if (S.me && S.me.role === "teacher") { setAppHash("/app/giao-vien"); return; }
    setAppHash(s ? `/app/${s}` : "/app/chon-mon");
  });
  $("#scrim").addEventListener("click", () => document.body.classList.remove("nav-open"));
  $("#searchBtn").addEventListener("click", openPalette);
  {
    const cats = [...document.querySelectorAll("#sideNav details.nav-cat")];
    cats.forEach((d) => d.addEventListener("toggle", () => {
      if (window.innerWidth <= 760) return;
      if (d.open) cats.forEach((other) => { if (other !== d && other.open) other.open = false; });
    }));
  }
  paintSubjectPill();
  syncNavState();
  paintSideProgress();
  paintStreakBadge();
  const showVer = (v) => { const el = document.getElementById("sbVer"); if (el && v) el.textContent = `Phiên bản ${v}`; };
  if (S.version) showVer(S.version); else api("/api/health").then((h) => showVer(h.version)).catch(() => {});
}

// Display fire streak badge on topbar based on user_streaks from /api/dashboard.
// Called once on mount, then auto-updated after each submission (onScores).
function paintStreakBadge() {
  const el = document.getElementById("streakBadge");
  if (!el) return;
  api("/api/dashboard").then((dash) => {
    const n = dash && dash.streak && dash.streak.current;
    if (n >= 1) { el.textContent = `🔥 ${n}`; el.style.display = ""; el.title = `Chuỗi ${n} ngày học liên tiếp`; }
    else { el.style.display = "none"; }
  }).catch(() => { el.style.display = "none"; });
}
onScores(paintStreakBadge);

function syncSideRing(pct) {
  const n = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
  const ring = document.getElementById("sbTodayRing");
  const txt = document.getElementById("sbTodayPct");
  if (ring) ring.style.setProperty("--pct", String(n));
  if (txt) txt.textContent = `${n}%`;
}
function paintSideProgress() {
  if (paintLangSide()) {
    const bw = parseFloat(document.getElementById("sbBar")?.style.width || "0");
    syncSideRing(bw);
    return;
  }
  const t = totalStats();
  const d = document.getElementById("sbLv"); if (!d) return;
  d.textContent = "Tiến độ học tập";
  d.title = `${fmtN(t.done)}/${fmtN(t.total)} bài tập đã đạt`;
  document.getElementById("sbXp").textContent = `${fmtN(t.done)}/${fmtN(t.total)} bài`;
  document.getElementById("sbBar").style.width = Math.max(0, Math.min(100, t.pct || 0)) + "%";
  syncSideRing(t.pct || 0);
}
onScores(paintSideProgress);

export function setCrumbs(items) {
  const el = document.getElementById("crumbs");
  if (!el) return;
  el.innerHTML = items.map((it, i) => {
    const last = i === items.length - 1;
    const txt = esc(it[0]);
    return (i ? '<span class="sep">/</span>' : "") + (last || !it[1] ? `<span class="${last ? "cur" : ""}">${txt}</span>` : `<a href="${it[1]}">${txt}</a>`);
  }).join("");
  const lastTitle = items.length ? items[items.length - 1][0] : siteName();
  const parentTitle = items.length > 1 ? items[0][0] : (S.me ? roleLabel(S.me.role) : "");
  const mTitle = document.getElementById("mTopTitle");
  const mSub = document.getElementById("mTopSub");
  if (mTitle) mTitle.textContent = lastTitle;
  if (mSub) mSub.textContent = parentTitle ? `${parentTitle} · LifeRivo Study` : `${roleLabel(S.me?.role)} · LifeRivo Study`;
  document.title = (items.length ? lastTitle + " · " : "") + siteName();
}

async function logout() {
  try { await api("/api/logout", "POST", {}); } catch (e) {}
  S.me = null; S.csrf = ""; S.exams = null;
  setAppHash("/app/");
  location.reload();
}

const VALID_SUBJS = new Set(["en", "zh", "ja", "ko", "fr", "es"]);
function routeSubject(clean, query) {
  if (query && VALID_SUBJS.has(query.mon)) return query.mon;
  const m = /^(en|zh|ja|ko|fr|es)$/.exec(clean)
    || /^phong-van\/(en|zh|ja|ko|fr|es)(?:\/|$)/.exec(clean)
    || /^ngoai-ngu\/(?:luyen-noi|on-tap|tro-chuyen|luyen-viet|chung-nhan-cua-toi|xep-hang|huy-hieu|chung-nhan|ly-thuyet)\/(en|zh|ja|ko|fr|es)(?:\/|$)/.exec(clean)
    || /^ngoai-ngu\/bai\/(en|zh|ja|ko|fr|es)-/.exec(clean)
    || /^ngoai-ngu\/(en|zh|ja|ko|fr|es)(?:\/|$)/.exec(clean);
  return m && VALID_SUBJS.has(m[1]) ? m[1] : "";
}

/* ---------- Router ---------- */
const ROUTES = [
  // 5.1.0: "/app/" is the unified account dashboard; "/app/<lang>" branches each subject overview cleanly; "/app/?mon=..." and "/app/?chon=1" keep legacy behavior
  [/^chon-mon$/, (m, p, q, c) => import("./welcome.js").then((x) => x.pageSubjectWelcome(m, p, q, c)), ""],
  // Mục menu "Cổ Vũ": tổng quan theo môn đang học (lời chào, XP, nhiệm vụ, kế hoạch hôm nay)
  [/^so-tay$/, (m, p, q, c) => import("./notebook.js").then((x) => x.pageNotebook(m, p, q, c)), "so-tay"],
  [/^co-vu$/, (m, p, q, c) => { const s = getSubject(); if (!s) { setAppHash("/app/chon-mon"); return; } return import("./home.js").then((x) => x.pageStudentHome(m, [s], { ...q, mode: "cheer" }, c)); }, "co-vu"],
  [/^(en|zh|ja|ko|fr|es)$/, (m, [subj], q, c) => import("./home.js").then((x) => x.pageStudentHome(m, [subj], q, c)), ""],
  // Trang tổng quan học viên không còn là trang mặc định: #/ mở trang chọn môn (mục "Chọn môn" trên thanh điều hướng).
  [/^$/, (m, p, q, c) => (q.mon || q.chon) ? pageHome(m, p, q, c) : (setAppHash("/app/chon-mon"), undefined), ""],
  [/^(?:mon-hoc|lo-trinh)$/, pageHome, "mon-hoc"],
  [/^tro-choi(?:\/([a-z]+))?$/, (m, p, q, c) => import("./games-hub.js").then((x) => x.pageGamesHub(m, p, q, c)), "tro-choi"],
  [/^phong-van(?:\/(en|zh|ja|ko|fr|es))?(?:\/([\w-]+))?$/, pageInterview, "phong-van"],
  [/^toeic(?:\/(.*))?$/, (m, p, q, c) => import("./toeic.js").then((x) => x.pageToeic(m, p, q, c)), "toeic"],
  [/^ngoai-ngu$/, (m, p, q, c) => pageHome(m, p, { ...q, chon: "1", nhom: "ngoai-ngu" }, c), "ngoai-ngu"],
  [/^ngoai-ngu\/bai\/([\w-]+)$/, pageLangExercise, "ngoai-ngu"],
  [/^ngoai-ngu\/luyen-viet\/(zh|ja|ko)\/([\w-]+)$/, pageLangWrite, "ngoai-ngu"],
  // 4.11.0: Speaking Lab (read-along by word / sentence / paragraph) and AI conversation
  [/^ngoai-ngu\/luyen-noi\/([a-z]+)$/, (m, p, q, c) => import("./speak.js?v=20261113c").then((x) => x.pageSpeakHub(m, p, q, c)), "ngoai-ngu"],
  [/^ngoai-ngu\/luyen-noi\/([a-z]+)\/([\w-]+)\/(tu|cau|doan)(?:\/([\w-]+))?$/, (m, p, q, c) => import("./speak.js?v=20261113c").then((x) => x.pageSpeakStudio(m, p, q, c)), "ngoai-ngu"],
  [/^ngoai-ngu\/tro-chuyen\/([a-z]+)(?:\/([\w-]+))?$/, (m, p, q, c) => import("./speak.js?v=20261113c").then((x) => x.pageSpeakChat(m, p, q, c)), "ngoai-ngu"],
  [/^ngoai-ngu\/on-tap\/([a-z]+)$/, pageLangReview, "ngoai-ngu"],
  [/^ngoai-ngu\/chung-nhan-cua-toi\/([a-z]+)$/, pageLangCertList, "chung-nhan", false, "lang"],
  [/^chung-nhan$/, (m, p, q, c) => { const s = getSubject(); return s ? pageLangCertList(m, [s], q, c) : pageHome(m, p, q, c); }, "chung-nhan"],
  // Đường dẫn ngắn #/xep-hang, #/huy-hieu (menu cũ, liên kết đã lưu): mở đúng trang của môn đang học thay vì báo "Không tìm thấy".
  [/^xep-hang$/, (m, p, q, c) => { const s = getSubject(); return s ? pageLangLeaderboard(m, [s], q, c) : pageHome(m, p, q, c); }, "xep-hang"],
  [/^huy-hieu$/, (m, p, q, c) => { const s = getSubject(); return s ? pageLangBadges(m, [s], q, c) : pageHome(m, p, q, c); }, "huy-hieu"],
  [/^ngoai-ngu\/xep-hang\/([a-z]+)$/, pageLangLeaderboard, "xep-hang", false, "lang"],
  [/^ngoai-ngu\/huy-hieu\/([a-z]+)$/, pageLangBadges, "huy-hieu", false, "lang"],
  [/^ngoai-ngu\/chung-nhan\/([a-z]+)\/([\w-]+)$/, pageLangCertificate, "ngoai-ngu"],
  [/^ngoai-ngu\/ly-thuyet\/([a-z]+)\/([\w-]+)\/([\w-]+)$/, pageLangTheory, "ngoai-ngu"],
  [/^ngoai-ngu\/([a-z]+)(?:\/([\w-]+))?$/, pageLangCourse, "ngoai-ngu"],
  [/^quan-tri-ngoai-ngu$/, (m, _p, q, c) => pageAdminLazy(m, ["ngoai-ngu"], q, c), "quan-tri-ngoai-ngu"],
  [/^ca-nhan$/, pageFn("pageProfile"), "ca-nhan"],
  [/^thong-bao$/, pageFn("pageNotices"), "thong-bao"],
  [/^dat-lai-mat-khau$/, pageFn("pageResetPassword"), "dat-lai-mat-khau"],
  [/^ho-tro$/, pageFn("pageLearningHelp"), "ho-tro"],
  [/^bang-gia$/, pagePricing, "bang-gia"],
  [/^chinh-sach\/(terms|privacy|payment|refund|membership)$/, pagePolicy, "chinh-sach"],
  [/^goi-cua-toi$/, pageMyPlan, "goi-cua-toi"],
  [/^ai(?:\/(\d+))?$/, pageAi, "ai"],
  [/^lop$/, pageMyClasses, "lop"],
  [/^lop\/(\d+)$/, pageClass, "lop"],
  [/^tham-gia\/([\w-]+)$/, pageJoinLink, "lop"],
  [/^bai-giao\/(\d+)$/, pageAssignment, "lop", true],
  [/^kiem-tra-lop\/(\d+)$/, pageClassTest, "lop"],
  [/^giao-vien$/, pageTeacher, "giao-vien"],
  [/^giao-vien\/hoc-vien$/, pageMyStudents, "giao-vien/hoc-vien"],
  [/^giao-vien\/lop\/(\d+)$/, pageTeacherClass, "giao-vien"],
  [/^in-bao-cao\/(\d+)$/, pagePrintReport, "giao-vien"],
  [/^gia-dinh$/, pageFamily, "gia-dinh"],
  [/^quan-tri(?:\/([\w-]+))?(?:\/(\d+))?$/, pageAdminLazy, "quan-tri"],
];

function parseHashRoute() {
  const raw = appHash().replace(/^\/app\/?/, "");
  const [path, qs] = raw.split("?");
  const query = Object.fromEntries(new URLSearchParams(qs || ""));
  const clean = path.replace(/\/+$/, "");
  let hit = ROUTES.find(([re]) => re.test(clean));
  if (!hit) hit = [/^$/, pageFn("pageNotFound"), ""];
  const isPicker = clean === "chon-mon" || clean === "ngoai-ngu" || (clean === "" && !!query.chon) || (clean === "mon-hoc" && !getSubject());
  const subj = routeSubject(clean, query);
  return { clean, query, hit, isPicker, subj };
}

function syncNavState(parsed = parseHashRoute()) {
  const { clean, query, hit, isPicker, subj } = parsed;
  document.body.classList.toggle("lx-picker", isPicker && clean !== "chon-mon");
  document.body.classList.toggle("is-student-home", !!subj && clean === subj && !query.mode);
  document.body.dataset.subject = isPicker ? "" : (subj || getSubject() || "");
  const topnav = document.querySelector(".main > .topnav");
  if (topnav) topnav.hidden = isPicker;
  let activeNav = hit[2] || "";
  if (clean === "" && query.mon) activeNav = "mon-hoc";
  else if (clean === "chon-mon") activeNav = "chon-mon";
  else if (/^ngoai-ngu\/luyen-noi(?:\/|$)/.test(clean)) activeNav = "luyen-noi";
  else if (/^ngoai-ngu\/on-tap(?:\/|$)/.test(clean)) activeNav = "on-tap";
  else if (/^ngoai-ngu\/tro-chuyen(?:\/|$)/.test(clean)) activeNav = "tro-chuyen";
  else if (hit[2] === "ngoai-ngu" && (subj || getSubject())) activeNav = "mon-hoc";
  document.querySelectorAll(".nav a").forEach((a) => a.classList.toggle("on", a.dataset.r === activeNav));
  // Thanh điều hướng dưới (điện thoại): đường dẫn theo môn đang học và vai trò; mục đang mở được đánh dấu
  const mtSubj = getSubject();
  const mtLinks = {
    home: mtSubj ? `/app/${mtSubj}` : "/app/chon-mon",
    "mon-hoc": mtSubj ? "/app/mon-hoc" : "/app/chon-mon",
    "hoc-tap": mtSubj ? `/app/ngoai-ngu/${mtSubj}` : "/app/chon-mon",
    "on-tap": mtSubj ? `/app/ngoai-ngu/on-tap/${mtSubj}` : "/app/chon-mon",
    "co-vu": mtSubj ? "/app/co-vu" : "/app/chon-mon",
    "ca-nhan": "/app/ca-nhan",
    "gv-home": "/app/giao-vien",
    "gv-students": "/app/giao-vien/hoc-vien",
    "gv-classes": "/app/lop",
    "pr-family": "/app/gia-dinh",
    "pr-classes": "/app/lop",
    "pr-notices": "/app/thong-bao",
  };
  const learnPath = clean === "ngoai-ngu" || /^ngoai-ngu\/(?:[a-z]{2}(?:\/|$)|bai\/|luyen-noi\/|luyen-viet\/|tro-chuyen\/|ly-thuyet\/)/.test(clean);
  const mtActive = {
    home: !!subj && clean === subj && !query.mode,
    "mon-hoc": clean === "mon-hoc" || clean === "lo-trinh" || (clean === "" && !!query.mon),
    "hoc-tap": learnPath,
    "on-tap": /^ngoai-ngu\/on-tap(?:\/|$)/.test(clean),
    "co-vu": activeNav === "co-vu" || clean === "co-vu",
    "ca-nhan": /^ca-nhan(?:\/|$)/.test(clean),
    "gv-home": clean === "giao-vien" || /^giao-vien\/lop\//.test(clean),
    "gv-students": clean === "giao-vien/hoc-vien",
    "gv-classes": clean === "lop" || /^lop\//.test(clean),
    "pr-family": clean === "gia-dinh",
    "pr-classes": clean === "lop" || /^lop\//.test(clean),
    "pr-notices": clean === "thong-bao",
  };
  document.querySelectorAll("#mTab a").forEach((a) => {
    const k = a.dataset.mt;
    if (mtLinks[k]) a.setAttribute("href", mtLinks[k]);
    a.classList.toggle("on", !!mtActive[k]);
    if (mtActive[k]) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  const activeCat = document.querySelector("#sideNav a.on")?.closest("details.nav-cat");
  if (activeCat && window.innerWidth > 760) {
    document.querySelectorAll("#sideNav details.nav-cat").forEach((d) => { d.open = d === activeCat; });
  } else if (window.innerWidth <= 760) {
    document.querySelectorAll("#sideNav details.nav-cat").forEach((d) => { d.open = true; });
  }
}

let routing = 0;
export async function route() {
  if (!S.me) return;
  // "/#che-do" link from public page: when logged in, go to Home instead of showing not found
  if (/^#[a-z][\w-]*$/.test(appHash())) history.replaceState(null, "", "/app/");
  const parsed = parseHashRoute();
  const { clean, query, hit: matchedHit, subj } = parsed;
  if (subj && getSubject() !== subj) setSubject(subj);
  cleanups.forEach((f) => { try { f(); } catch (e) {} }); cleanups = [];
  window.__plAiCtx = null; // new page declares its own context for the AI assistant
  while (closeTopModal()) {}
  document.body.classList.remove("nav-open");
  const main = document.getElementById("main");
  if (!main) return;
  startMobileFold(main);
  let hit = matchedHit;
  const params = (clean.match(hit[0]) || []).slice(1);
  const routeKey = hit[2];
  if (!featureOn(routeKey)) hit = [hit[0], pageFn("pageFeatureOff"), hit[2]];
  { const acct = zoneOf(hit[2]) === "acct"; document.body.classList.toggle("lx-acct", acct); document.body.classList.toggle("lx-top", !acct); }
  syncNavState({ ...parsed, hit });
  main.className = "page" + (hit[3] ? " full" : "");
  main.innerHTML = "";
  const my = ++routing;
  try {
    await hit[1](main, params, query, { setCrumbs, onLeave, isCurrent: () => my === routing });
  } catch (e) {
    console.error(e);
    if (my === routing) main.innerHTML = `<div class="sheet sheet-pad empty"><b>Không mở được trang này</b>${esc(e.message)}<br><button class="btn" data-reload>Tải lại</button></div>`;
  }
  aiWidgetRoute(clean);
  try { companionRoute(clean); } catch (e) { console.warn("companion", e); }
  if (!hit[3]) window.scrollTo(0, 0);
  try { paintSubjectPill(); } catch {}
  refreshLangSide().then((ok) => { if (!ok) paintSideProgress(); }).catch(() => {});
}
async function pagePolicy(main, [key], _q, ctx) {
  const en = currentLang() === "en";
  const lang = en ? "en" : "vi";
  main.innerHTML = `<div class="sheet sheet-pad"><p class="muted">${en ? "Loading policy..." : "Đang tải nội dung..."}</p></div>`;
  const r = await fetch(`/${lang}/${key}`, { credentials: "same-origin" });
  if (!r.ok) throw new Error(en ? "Unable to load policy page" : "Không tải được trang chính sách");
  const doc = new DOMParser().parseFromString(await r.text(), "text/html");
  if (!ctx.isCurrent()) return;
  const art = doc.querySelector("article.legal");
  if (!art) throw new Error(en ? "Policy content missing" : "Không có nội dung chính sách");
  const title = art.querySelector("h1")?.textContent?.trim() || key;
  ctx.setCrumbs?.([[en ? "Home" : "Trang chủ", "/app/"], [title]]);
  main.innerHTML = `<div class="sheet sheet-pad legal-inapp"><div style="margin-bottom:14px"><button type="button" class="btn btn-sm btn-ghost" data-policy-back>← ${en ? "Back" : "Quay lại"}</button></div><article class="legal">${art.innerHTML}</article></div>`;
  main.querySelector("[data-policy-back]")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else setAppHash("/app/");
  });
}

// 4.10.2: all Pricing buttons/links open the plan purchase modal in place (full Pricing page still accessible via direct URL)
document.addEventListener("click", (e) => {
  if (!S.me || e.ctrlKey || e.metaKey || e.shiftKey) return;
  const a = e.target.closest && e.target.closest("a[href]");
  if (!a) return;
  const rawHref = a.getAttribute("href") || "";
  if (rawHref.startsWith("/app/bang-gia")) {
    e.preventDefault();
    const kind = new URLSearchParams(rawHref.split("?")[1] || "").get("goi") || "pro";
    document.body.classList.remove("nav-open");
    import("./pro.js").then((m) => m.openBuyModal(kind)).catch(() => { setAppHash(rawHref); });
    return;
  }
  const pol = a.origin === location.origin && a.pathname.match(/^\/(?:vi|vn|en)\/(terms|privacy|payment|refund|membership|pricing)$/);
  if (pol) {
    e.preventDefault();
    while (closeTopModal()) {}
    document.body.classList.remove("nav-open");
    if (pol[1] === "pricing") {
      import("./pro.js").then((m) => m.openBuyModal("pro")).catch(() => { setAppHash("/app/bang-gia"); });
    } else {
      setAppHash(`/app/chinh-sach/${pol[1]}`);
    }
  }
}, true);
for (const ev of ["hashchange", "popstate"]) window.addEventListener(ev, () => {
  if (S.me) return route();
  if (/^\/app\/(dang|dat-lai-mat-khau)/.test(appHash())) return showLanding();
  // Khách bấm thẻ lộ trình / thẻ môn (#/ngoai-ngu/ja…): nội dung học cần tài khoản.
  // Giữ nguyên địa chỉ đích và môn đã chọn, mở hộp tạo tài khoản; xong thì app tự vào đúng môn đó.
  if (/^\/app\/[a-z]/.test(appHash())) {
    try { sessionStorage.setItem("pl:after-auth", appHash()); } catch {}
    history.replaceState(null, "", "/"); // về trang chủ để URL khớp nội dung (khách chưa đăng nhập; bấm lại thẻ vẫn mở được hộp)
    openAuth("register");
  }
});

// Liên kết trong ứng dụng (/app/...): chuyển trang trong bộ nhớ, không tải lại trang
document.addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest && e.target.closest('a[href^="/app/"]');
  if (!a || (a.target && a.target !== "_self")) return;
  e.preventDefault();
  document.body.classList.remove("nav-open");
  setAppHash(a.getAttribute("href"));
});

/* ---------- Quick search (Ctrl+K) ---------- */
function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); }
function openPalette() {
  if (!S.me) return;
  const curSubj = getSubject() || "en";
  const items = [];
  const pages = [
    ["Lộ trình học", `/app/?mon=${curSubj}`, "Chương trình học", "route"],
    ["Bài học theo chặng", `/app/ngoai-ngu/${curSubj}`, "Khóa học · " + curSubj.toUpperCase(), "book"],
    ["Luyện phát âm & Speaking Lab", `/app/ngoai-ngu/luyen-noi/${curSubj}`, "Speaking Lab", "mic"],
    ["Ôn tập từ vựng (SRS)", `/app/ngoai-ngu/on-tap/${curSubj}`, "Thẻ ghi nhớ đến hạn", "clock"],
    ["Sổ tay từ vựng", "/app/so-tay", "Từ đã lưu và ghi chú", "book"],
    ["Hội thoại AI", `/app/ngoai-ngu/tro-chuyen/${curSubj}`, "Rivo AI Coach", "bulb"],
    ["Trò chơi học tập", `/app/tro-choi/${curSubj}`, "Vừa chơi vừa nhớ từ", "sparkle"],
    ["Phỏng vấn thử", `/app/phong-van/${curSubj}`, "Tập trả lời phỏng vấn", "briefcase"],
    ["Đổi môn học", "/app/chon-mon", "Ngoại ngữ", "globe"],
    ["Hỗ trợ học tập", "/app/ho-tro", "Hướng dẫn & trợ giúp", "life-buoy"],
    ["Thông báo", "/app/thong-bao", "Thông báo hệ thống", "bell"],
    ["Hồ sơ của tôi", "/app/ca-nhan", "Tài khoản & cài đặt", "user"],
  ];
  if (S.me.role === "admin") pages.push(["Quản trị hệ thống", "/app/quan-tri", "Quản trị", "settings"]);
  if (S.me.role === "teacher" || S.me.role === "admin") pages.push(["Trang giáo viên", "/app/giao-vien", "Giảng dạy", "home"]);
  pages.push(["Lớp của tôi", "/app/lop", "Lớp học", "book"], ["Gia đình", "/app/gia-dinh", "Theo dõi học tập", "users"]);
  pages.forEach(([t, h, s, ic]) => items.push({ t, s: s || "Trang", h, ic: ic || "file" }));
  const indexItems = () => items.forEach((it) => { it.n = norm(it.t + " " + it.s); it.nk = norm(it.k || ""); });
  indexItems();

  const m = openModal(`
    <div class="pal-head">
      <button type="button" class="icon-btn pal-back" data-close aria-label="Đóng">${lineIcon("left")}</button>
      <div class="pal-titles"><b>Tìm bài và chương</b><small>Menu · LifeRivo Study</small></div>
      <button type="button" class="icon-btn pal-close" data-close aria-label="Đóng">×</button>
    </div>
    <div class="pal-search-box">
      <span class="pal-search-ic" aria-hidden="true">${lineIcon("search")}</span>
      <input placeholder="Tìm bài học, từ vựng hoặc chương..." aria-label="Tìm kiếm" autofocus>
    </div>
    <div class="pal-body">
      <div class="pal-sec-lbl" id="palSecLbl">TÌM GẦN ĐÂY</div>
      <ul role="listbox" class="pal-list"></ul>
      <div class="pal-explore" id="palExplore">
        <h3>Khám phá</h3>
        <a class="pal-card" href="/app/?mon=${esc(curSubj)}">
          <span class="ico-box">${lineIcon("route")}</span>
          <span class="t"><b>Chương trình học</b><span>Tìm theo ngoại ngữ và cấp độ</span></span>
          <span class="pal-arr" aria-hidden="true">›</span>
        </a>
        <a class="pal-card" href="/app/ngoai-ngu/on-tap/${esc(curSubj)}">
          <span class="ico-box">${lineIcon("sparkle")}</span>
          <span class="t"><b>Bài ôn tập</b><span>Tìm nội dung đang đến hạn</span></span>
          <span class="pal-arr" aria-hidden="true">›</span>
        </a>
      </div>
    </div>
    <div class="foot"><span><kbd>↑</kbd> <kbd>↓</kbd> chọn</span><span><kbd>Enter</kbd> mở</span><span><kbd>Esc</kbd> đóng</span></div>`, { cls: "palette", label: "Tìm bài và chương" });
  m.el.querySelector(".modal-x")?.remove();
  const inp = m.el.querySelector("input"), ul = m.el.querySelector("ul");
  const secLbl = m.el.querySelector("#palSecLbl"), expBox = m.el.querySelector("#palExplore");
  let res = [], sel = 0;

  // Nap danh sach bai hoc that tu /api/lang de tim kiem chinh xac
  api("/api/lang").then((lang) => {
    for (const c of (lang && lang.courses) || []) {
      for (const lv of c.levels || []) {
        if (lv.locked) continue;
        for (const u of lv.units || []) {
          items.push({
            t: u.title,
            s: `${c.name} · ${lv.code || lv.title}`,
            h: `/app/ngoai-ngu/ly-thuyet/${c.id}/${lv.id}/${u.id}`,
            ic: "book",
            subj: c.id,
          });
          for (const ex of u.exercises || []) {
            items.push({
              t: `${ex.kindTitle || ex.title || "Bài tập"} · ${u.title}`,
              s: `${c.name} ${lv.code || ""}`,
              h: `/app/ngoai-ngu/bai/${ex.id}`,
              ic: ex.kind === "noi" ? "mic" : "file",
              subj: c.id,
            });
          }
        }
      }
    }
    indexItems();
    if (m.el.isConnected) paint();
  }).catch(() => {});

  const paint = () => {
    const q = norm(inp.value.trim());
    if (!q) {
      if (secLbl) secLbl.textContent = "TÌM GẦN ĐÂY";
      if (expBox) expBox.hidden = false;
      const subjUnits = items.filter((x) => x.subj === curSubj && x.ic === "book").slice(0, 2);
      const speakItem = items.find((x) => x.ic === "mic" && !x.subj) || items[2];
      res = subjUnits.length ? [...subjUnits, speakItem].filter(Boolean) : items.slice(0, 4);
    } else {
      if (secLbl) secLbl.textContent = "KẾT QUẢ TÌM KIẾM";
      if (expBox) expBox.hidden = true;
      const words = q.split(/\s+/);
      res = items.map((x) => {
        let sc = 0;
        for (const w of words) { if (x.n.includes(w)) sc += 3; else if (x.nk.includes(w)) sc += 1; else return null; }
        if (x.n.startsWith(q)) sc += 2;
        if (x.subj === curSubj) sc += 1;
        return [sc, x];
      }).filter(Boolean).sort((a, b) => b[0] - a[0]).slice(0, 30).map((a) => a[1]);
    }
    sel = Math.min(sel, Math.max(0, res.length - 1));
    ul.innerHTML = res.length ? res.map((x, i) => `<li class="${i === sel ? "on" : ""}" role="option"><a class="pal-card" href="${x.h}" data-i="${i}"><span class="ico-box">${lineIcon(x.ic || "book")}</span><span class="t"><b>${esc(x.t)}</b><span>${esc(x.s)}</span></span><span class="pal-arr" aria-hidden="true">›</span></a></li>`).join("")
      : `<li><div class="empty"><b>Không tìm thấy</b>Thử từ khóa ngắn hơn, ví dụ “từ vựng”.</div></li>`;
    ul.querySelector("li.on")?.scrollIntoView({ block: "nearest" });
  };
  inp.addEventListener("input", () => { sel = 0; paint(); });
  inp.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(res.length - 1, sel + 1); paint(); }
    if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); paint(); }
    if (e.key === "Enter" && res[sel]) { e.preventDefault(); m.close(); setAppHash(res[sel].h); }
  });
  m.el.addEventListener("click", (e) => { if (e.target.closest("a.pal-card")) m.close(); });
  paint();
}

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); }
  if (e.key === "Escape") { if (!closeTopModal()) document.body.classList.remove("nav-open"); }
});

boot();

// Admin page changed settings: reload config, re-render shell and current page
window.addEventListener("pl:config-changed", async () => {
  try {
    const me = await api("/api/me");
    S.cfg = me.config || S.cfg; applyBrand(S.cfg);
    S.exams = null;
    await refreshAiStatus();
    renderShell(); route();
  } catch (e) { toast(e.message, "err"); }
});
// Server reported maintenance mode mid-session
window.addEventListener("pl:maintenance", () => { if (S.me && S.me.role !== "admin") maintenanceScreen(); });
window.addEventListener("pl:brand-reset", () => applyBrand(S.cfg));
// Subject changed: re-render menu for the new subject. Do NOT re-route here:
// every caller of setSubject() renders the right page itself right after
// (pageHome ?mon=, pageLangCourse/Exercise/Review/Theory/Write, code pages,
// router forcing a subject), so route() would render the same page a second time
// ("nhảy 2 lần"). renderShell() alone updates the sidebar for the new subject.
window.addEventListener("pl:subject", () => { if (S.loaded && S.me) { renderShell(); } });
// Điện thoại: khi bàn phím mở (đang nhập liệu), ẩn thanh điều hướng dưới để không che ô nhập
const isFieldEl = (el) => !!el && el.matches?.("input:not([type=checkbox]):not([type=radio]):not([type=range]), textarea, select, [contenteditable='true']");
document.addEventListener("focusin", (e) => { if (isFieldEl(e.target)) document.body.classList.add("kb-open"); });
document.addEventListener("focusout", () => setTimeout(() => { if (!isFieldEl(document.activeElement)) document.body.classList.remove("kb-open"); }, 150));

// "Reload" button uses data-reload (no inline onclick because Content-Security-Policy blocks it)
// Nut chuyen ngon ngu VI/EN (delegated, du phong bindLangSwitch): bam EN -> /en, bam VI -> /vi.
// Dung delegation tren document de bat duoc ca khi header duoc render lai sau.
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest(".lang-switch [data-lang]");
  if (!b) return;
  const lang = b.dataset.lang === "en" ? "en" : "vi";
  const target = lang === "en" ? "/en" : "/vi";
  const cur = (location.pathname || "/").replace(/\/+$/, "") || "/";
  if (cur === target) return; // da o dung ngon ngu, khong dieu huong lai
  try { localStorage.setItem("pl-lang", lang); } catch {}
  const path = location.pathname || "/";
  if (/^\/(?:(?:vi|vn|en)\/?)?$/i.test(path)) {
    location.href = target + location.search + appHash();
  } else {
    location.reload();
  }
});
document.addEventListener("click", (e) => { if (e.target.closest("[data-reload]")) location.reload(); });
// Login session expired mid-work: notify clearly and reopen login modal
let expiredShown = false;
window.addEventListener("pl:session-expired", () => {
  if (!S.me || expiredShown) return;
  expiredShown = true;
  const m = openModal(`<h2>Phiên đăng nhập đã hết hạn</h2><p class="lead">Bạn cần đăng nhập lại. Tiến độ đã lưu trên hệ thống vẫn được giữ nguyên.</p>
    <div class="modal-actions"><button class="btn btn-primary" data-relogin>Đăng nhập lại</button></div>`, { sticky: true, noClose: true });
  m.el.querySelector("[data-relogin]").addEventListener("click", () => { S.me = null; setAppHash("/app/dang-nhap"); location.reload(); });
});
