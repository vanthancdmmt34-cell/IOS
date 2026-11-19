/* Admin area (ad-): shell + learning-focused dashboard. Real metrics from admin API. */
import {  } from "./core.js";
import { S, api, esc, lineIcon as icon, avatar, avatarColor, initials, fmtN, timeAgo, cfg, siteName, brandCleanHtml, roleLabel, setAppHash, themeBtnHtml, $ } from "./core.js";
import { currentLang } from "./i18n.js";

const IP = {
  grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  userPlus: '<circle cx="10" cy="8" r="4"/><path d="M3 20c.6-3.6 3.4-5.5 7-5.5 1.4 0 2.7.3 3.8.9"/><path d="M18 14v6M15 17h6"/>',
  wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="4" y="8" width="17" height="11" rx="2.5"/><path d="M16.5 13.5h.01"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/>',
  server: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M8 7.5h.01M8 16.5h.01"/>',
  code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
  bot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9.5 13h.01M14.5 13h.01M10 16h4"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8.5 3v4M15.5 3v4"/>',
  sleep: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
};
const I = (n, extra = "") => IP[n] ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${IP[n]}</svg>` : icon(n, extra);

/* ---------- Shell ---------- */
export function adminShell(main, { tab, groups, ctx }) {
  document.body.classList.add("ax-on");
  ctx.onLeave?.(() => document.body.classList.remove("ax-on"));
  let curLabel = "Tổng quan";
  let curGroupLabel = "Tổng quan";
  for (const g of groups) {
    const found = g.items.find(([k]) => k === tab);
    if (found) { curLabel = found[1]; curGroupLabel = g.label; break; }
  }
  const nav = groups.map((g) => `<div class="ad-grp"><span class="ad-grp-l">${esc(g.label)}</span>
    ${g.items.map(([k, l, ic, d]) => `<a href="${k.startsWith("#") ? k : "/app/quan-tri/" + k}" class="${k === tab ? "on" : ""}" title="${esc(d || "")}">${I(k === "tong-quan" ? "grid" : (ic || "file"))}<span>${esc(l)}</span></a>`).join("")}</div>`).join("");
  const isOverviewTab = tab === "tong-quan";
  const isUserTab = ["hoc-vien", "giao-vien", "lop", "lop-giay-phep"].includes(tab);
  const isContentTab = ["ngoai-ngu", "ban-dich", "song-ngu", "thong-bao", "gop-y"].includes(tab);
  const isBizTab = ["kinh-doanh", "ma-qua-tang"].includes(tab);
  const isSystemTab = ["cai-dat", "he-thong", "du-lieu", "giam-sat"].includes(tab);
  main.innerHTML = `
  <div class="ad" id="ad">
    <aside class="ad-side" aria-label="Menu quản trị">
      <div class="ad-m-drawer-head">
        <span class="avatar ad-m-drawer-av" style="background:${avatarColor(S.me?.username || S.me?.displayName || "admin")}" aria-hidden="true">${esc(initials(S.me?.displayName || S.me?.username || "Admin"))}</span>
        <div class="ad-m-drawer-user">
          <b>Quản trị viên</b>
          <span>LifeRivo · Admin</span>
        </div>
      </div>
      <a class="ad-brand brand-clean" href="/app/quan-tri">${brandCleanHtml()}</a>
      <span class="ad-badge">Khu quản trị</span>
      <nav class="ad-nav">${nav}</nav>
      <a class="ad-back" href="/app/">${icon("left")}<span>Về trang học</span></a>
    </aside>
    <div class="ad-main">
      <header class="ad-top">
        <button class="ad-m-back" id="adMBack" type="button" aria-label="Quay lại">${icon("left")}</button>
        <div class="ad-m-titles">
          <b id="adMTitle">Quản trị · ${esc(curLabel)}</b>
          <span>${esc(curGroupLabel)} · LifeRivo Study</span>
        </div>
        <button class="ad-search" id="adSearch" type="button">${icon("search")}<span>Tìm học viên, bài tập, chương…</span><kbd>Ctrl K</kbd></button>
        <span class="ad-sp"></span>
        <button class="ad-ib ad-m-search-btn" id="adMSearch" type="button" title="Tìm kiếm nhanh" aria-label="Tìm kiếm nhanh">${icon("search")}</button>
        ${themeBtnHtml()}
        <a class="ad-ib" href="/app/quan-tri/thong-bao" id="axBell" title="Thông báo" aria-label="Thông báo">${icon("bell")}</a>
        <a class="ad-ib ad-m-home-btn" href="/app/" id="adMHome" title="Về trang học" aria-label="Về trang học">${I("home")}</a>
        <div class="ad-user">
          <button type="button" id="adUser" aria-haspopup="true" aria-expanded="false">${avatar(S.me.displayName, S.me.username)}<span><b>${esc(S.me.displayName)}</b><small>${esc(roleLabel(S.me.role))}</small></span>${I("down")}</button>
          <div class="ad-drop" id="adDrop" hidden>
            <a href="/app/ca-nhan">${icon("user")}Hồ sơ của tôi</a>
            <a href="/app/">${I("home")}Về trang học</a>
            <button type="button" id="adLogout">${icon("logout")}Đăng xuất</button>
          </div>
        </div>
      </header>
      <div class="ad-content" id="adContent"></div>
    </div>
    <nav class="ad-m-tab" aria-label="Điều hướng quản trị">
      <a href="/app/quan-tri/tong-quan" class="ad-m-tab-it ${isOverviewTab ? "on" : ""}"><span class="ad-m-tab-ic">${I("home")}</span><span>Tổng quan</span></a>
      <a href="/app/quan-tri/hoc-vien" class="ad-m-tab-it ${isUserTab ? "on" : ""}"><span class="ad-m-tab-ic">${icon("users")}</span><span>Người dùng</span></a>
      <a href="/app/quan-tri/ngoai-ngu" class="ad-m-tab-it ${isContentTab ? "on" : ""}"><span class="ad-m-tab-ic">${icon("book")}</span><span>Nội dung</span></a>
      <a href="/app/quan-tri/kinh-doanh" class="ad-m-tab-it ${isBizTab ? "on" : ""}"><span class="ad-m-tab-ic">${icon("star")}</span><span>Kinh doanh</span></a>
      <a href="/app/quan-tri/cai-dat" class="ad-m-tab-it ${isSystemTab ? "on" : ""}"><span class="ad-m-tab-ic">${icon("settings")}</span><span>Hệ thống</span></a>
    </nav>
  </div>`;
  const ad = $("#ad", main);
  $("#adMBack", main)?.addEventListener("click", () => {
    if (tab !== "tong-quan") setAppHash("/app/quan-tri/tong-quan");
    else setAppHash("/app/");
  });
  $("#adSearch", main)?.addEventListener("click", () => document.getElementById("searchBtn")?.click());
  $("#adMSearch", main)?.addEventListener("click", () => document.getElementById("searchBtn")?.click());
  const drop = $("#adDrop", main), ub = $("#adUser", main);
  ub.addEventListener("click", (e) => { e.stopPropagation(); drop.hidden = !drop.hidden; ub.setAttribute("aria-expanded", String(!drop.hidden)); });
  const close = () => { drop.hidden = true; ub.setAttribute("aria-expanded", "false"); };
  document.addEventListener("click", close);
  ctx.onLeave?.(() => document.removeEventListener("click", close));
  $("#adLogout", main).addEventListener("click", () => document.getElementById("logoutBtn")?.click());
  return $("#adContent", main);
}

/* ---------- Utilities ---------- */
const DAY = 86400000;
const sod = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const dm = (d) => d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
const money = (v) => { v = Number(v || 0); const f = (n) => n.toLocaleString("vi-VN", { maximumFractionDigits: 1 }); return v >= 1e9 ? f(v / 1e9) + " tỷ ₫" : v >= 1e6 ? f(v / 1e6) + " tr ₫" : fmtN(v) + " ₫"; };
const delta = (cur, prev, unit = "%") => { if (!prev && !cur) return `<span class="ad-d">không đổi</span>`; const p = prev ? Math.round((cur - prev) / prev * 100) : 100; return `<span class="ad-d ${p >= 0 ? "up" : "dn"}">${p >= 0 ? "▲" : "▼"} ${Math.abs(p)}${unit}</span>`; };
const pctOf = (a, b) => b ? Math.round(a / b * 100) : 0;
const meter = (p, tone = "") => `<span class="ad-meter ${tone}"><i style="width:${Math.max(0, Math.min(100, p))}%"></i></span>`;
const toneOf = (p) => p >= 70 ? "ok" : p >= 40 ? "warn" : "bad";

/* ---------- Dashboard ---------- */
export async function dashPage(host, DATA, { onReload } = {}) {
  host.innerHTML = `<div class="ad-skel" style="height:120px"></div><div class="ad-skel" style="height:360px;margin-top:16px"></div>`;
  const now = Date.now(), safe = (p) => p.catch(() => null);
  const pf = new Date(now - 60 * DAY).toISOString(), pt = new Date(now - 30 * DAY).toISOString();
  const [st, stPrev, mon, pend] = await Promise.all([
    safe(api("/api/admin/biz/stats?days=30")),
    safe(api(`/api/admin/biz/stats?from=${encodeURIComponent(pf)}&to=${encodeURIComponent(pt)}`)),
    safe(api("/api/admin/monitoring")),
    safe(api("/api/admin/biz/orders?status=pending")),
  ]);
  if (!host.isConnected) return;

  const users = DATA.students || [];
  const studs = users.filter((u) => u.role === "student");
  const within = (iso, a, b = 0) => { const t = new Date(iso).getTime(); return t >= now - a * DAY && t < now - b * DAY; };
  const lastSeen = (u) => new Date(u.lastActive || u.createdAt).getTime();

  // KPI
  const newS = studs.filter((u) => within(u.createdAt, 30)).length;
  const act7 = studs.filter((u) => u.lastActive && within(u.lastActive, 7)).length;
  const act7p = studs.filter((u) => u.lastActive && within(u.lastActive, 14, 7)).length;
  const rev = st?.revenue?.vnd || 0, revPrev = stPrev?.revenue?.vnd || 0;

  // 14-day submissions chart
  const t0 = sod(now).getTime() - 13 * DAY;
  const days = Array.from({ length: 14 }, (_, i) => ({ d: new Date(t0 + i * DAY), ok: 0, no: 0 }));
  studs.forEach((u) => { const i = Math.floor((new Date(u.createdAt).getTime() - t0) / DAY); if (i >= 0 && i < 14) days[i].ok++; });
  const mx = Math.max(4, ...days.map((d) => d.ok + d.no));
  const total14 = days.reduce((n, d) => n + d.ok + d.no, 0);

  // Learner status
  const locked = studs.filter((u) => u.disabled);
  const never = studs.filter((u) => !u.disabled && !u.lastActive);
  const active = studs.filter((u) => !u.disabled && u.lastActive && within(u.lastActive, 7));
  const slipping = studs.filter((u) => !u.disabled && u.lastActive && !within(u.lastActive, 7));
  const seg = [["Đang học (7 ngày)", active.length, "ok"], ["Chậm lại (> 7 ngày)", slipping.length, "warn"], ["Chưa bắt đầu", never.length, "mut"], ["Bị khóa", locked.length, "bad"]];



  // Learners needing follow-up
  const nudge = slipping.slice().sort((a, b) => lastSeen(a) - lastSeen(b)).slice(0, 5);

  // Action items
  const claimed = st?.claimedPending || 0, pendN = (pend?.orders || []).length;
  const todo = [];
  (mon?.alerts || []).filter((a) => a.level !== "info").forEach((a) => todo.push(["bad", "server", a.text, "Xem giám sát", "/app/quan-tri/giam-sat"]));
  if (claimed) todo.push(["warn", "wallet", `${claimed} đơn học viên báo đã chuyển khoản`, "Đối soát ngay", "/app/quan-tri/kinh-doanh"]);
  if (slipping.length) todo.push(["warn", "sleep", `${slipping.length} học viên đã hơn 7 ngày không học`, "Gửi thông báo nhắc", "/app/quan-tri/thong-bao"]);
  if (never.length) todo.push(["info", "userPlus", `${never.length} học viên chưa làm bài nào`, "Xem danh sách", "/app/quan-tri/hoc-vien"]);
  if (pendN && !claimed) todo.push(["info", "wallet", `${pendN} đơn đang chờ thanh toán`, "Xem đơn", "/app/quan-tri/kinh-doanh"]);
  const bell = document.getElementById("axBell"); if (bell && todo.length) bell.insertAdjacentHTML("beforeend", `<em>${todo.length}</em>`);

  // Recent activity
  const acts = [
    ...users.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 4).map((u) => ({ t: u.createdAt, ok: null, who: u.username, txt: "tạo tài khoản mới", meta: roleLabel(u.role) })),
  ].sort((a, b) => String(b.t).localeCompare(String(a.t))).slice(0, 6);

  const hour = new Date().getHours();
  const isEn = currentLang() === "en";
  const hello = hour < 11 ? (isEn ? "Good morning" : "Chào buổi sáng") : hour < 18 ? (isEn ? "Good afternoon" : "Chào buổi chiều") : (isEn ? "Good evening" : "Chào buổi tối");
  const kpi = (label, value, foot, href, ic) => `<a class="ad-kpi" href="${href}"><span class="ad-kpi-ic">${I(ic)}</span><span class="l">${esc(label)}</span><b>${value}</b><span class="f">${foot}</span></a>`;

  host.innerHTML = `
  <div class="ad-m-dash-head">
    <div>
      <h1>Bảng điều khiển</h1>
      <p>Tổng quan hoạt động LifeRivo.</p>
    </div>
    <span class="ad-m-role-pill">ADMIN</span>
  </div>
  <div class="ad-hello">
    <div><h1>${hello}, ${esc(S.me.displayName)}</h1><p>${esc(new Date().toLocaleDateString(isEn ? "en-US" : "vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))} · ${esc(siteName())}</p></div>
    <div class="ad-hello-act">
      <button class="ax-ghost" id="admReload" type="button">${icon("reset")}Tải lại</button>
      <a class="ad-btn" href="/app/quan-tri/thong-bao">${icon("bell")}Gửi thông báo</a>
      <a class="ad-btn pri" href="/app/quan-tri/hoc-vien">${I("userPlus")}Thêm học viên</a>
    </div>
  </div>

  <div class="ad-kpis">
    ${kpi("Học viên", fmtN(studs.length), `+${fmtN(newS)} trong 30 ngày`, "/app/quan-tri/hoc-vien", "users")}
    ${kpi("Đang học 7 ngày", fmtN(act7), `${pctOf(act7, studs.length)}% học viên · ${delta(act7, act7p)}`, "/app/quan-tri/hoc-vien", "user")}
    ${kpi("Đang online", fmtN(DATA.userStats?.online || 0), "phiên đăng nhập hiện tại", "/app/quan-tri/giam-sat", "server")}
    ${st ? kpi("Doanh thu 30 ngày", money(rev), `${fmtN(st.revenue.orders)} đơn · ${delta(rev, revPrev)}`, "/app/quan-tri/kinh-doanh", "wallet") : kpi("Tài khoản", fmtN(DATA.userStats?.total || 0), "toàn hệ thống", "/app/quan-tri/hoc-vien", "users")}
  </div>

  <div class="ad-m-quick">
    <h2>Phân khu quản trị</h2>
    <div class="ad-m-quick-grid">
      <div class="ad-m-qcard">
        <a class="ad-m-qhead" href="/app/quan-tri/hoc-vien"><span class="ad-m-qic">${icon("users")}</span><div><b>Người dùng</b><span>Tài khoản & Lớp học</span></div></a>
        <div class="ad-m-qlinks">
          <a href="/app/quan-tri/hoc-vien">Học viên</a>
          <a href="/app/quan-tri/giao-vien">Giáo viên</a>
          <a href="/app/quan-tri/lop-giay-phep">Lớp & giấy phép</a>
        </div>
      </div>
      <div class="ad-m-qcard">
        <a class="ad-m-qhead" href="/app/quan-tri/ngoai-ngu"><span class="ad-m-qic">${icon("book")}</span><div><b>Nội dung</b><span>Khóa học & Bản dịch</span></div></a>
        <div class="ad-m-qlinks">
          <a href="/app/quan-tri/ngoai-ngu">Ngoại ngữ</a>
          <a href="/app/quan-tri/song-ngu">Bản dịch</a>
          <a href="/app/quan-tri/thong-bao">Thông báo</a>
          <a href="/app/quan-tri/gop-y">Góp ý &amp; Đánh giá</a>
        </div>
      </div>
      <div class="ad-m-qcard">
        <a class="ad-m-qhead" href="/app/quan-tri/kinh-doanh"><span class="ad-m-qic">${icon("star")}</span><div><b>Kinh doanh</b><span>Doanh thu & Gói Pro</span></div></a>
        <div class="ad-m-qlinks">
          <a href="/app/quan-tri/kinh-doanh">Doanh thu & Pro</a>
          <a href="/app/quan-tri/kinh-doanh?sub=don-hang">Đơn hàng</a>
          <a href="/app/quan-tri/ma-qua-tang">Mã quà tặng</a>
        </div>
      </div>
      <div class="ad-m-qcard">
        <a class="ad-m-qhead" href="/app/quan-tri/he-thong"><span class="ad-m-qic">${icon("settings")}</span><div><b>Hệ thống</b><span>Cấu hình & Giám sát</span></div></a>
        <div class="ad-m-qlinks">
          <a href="/app/quan-tri/cai-dat">Cài đặt chung</a>
          <a href="/app/quan-tri/he-thong">AI & Thanh toán</a>
          <a href="/app/quan-tri/du-lieu">Sao lưu</a>
          <a href="/app/quan-tri/giam-sat">Giám sát</a>
        </div>
      </div>
    </div>
  </div>

  <section class="ad-todo">
    <div class="ad-sh"><h2>Cần chú ý</h2><span>${todo.length ? `${todo.length} việc` : ""}</span></div>
    ${todo.length ? `<div class="ad-todo-list">${todo.slice(0, 4).map(([tone, ic, txt, act, href]) => `<a class="ad-task ${tone}" href="${href}"><span class="ic">${I(ic)}</span><span class="tx"><b>${esc(txt)}</b><small>${esc(act)} →</small></span></a>`).join("")}</div>`
      : `<div class="ad-allgood">${icon("check")}<span><b>Mọi thứ đều ổn.</b> Không có cảnh báo hệ thống, đơn chờ đối soát hay học viên cần nhắc.</span></div>`}
  </section>

  <div class="ad-grid">
    <section class="ad-card span2">
      <div class="ad-ch"><div><h3>Học viên mới 14 ngày qua</h3><p>${fmtN(total14)} tài khoản</p></div></div>
      <div class="ad-bars">${days.map((d, i) => `<div class="col ${i === 13 ? "today" : ""}" title="${dm(d.d)}: ${d.ok} học viên mới"><span><i class="no" style="height:${d.no / mx * 100}%"></i><i class="ok" style="height:${d.ok / mx * 100}%"></i></span><em>${i % 2 === 1 || i === 13 ? (i === 13 ? "Hôm nay" : dm(d.d)) : ""}</em></div>`).join("")}</div>
    </section>
    <section class="ad-card">
      <div class="ad-ch"><div><h3>Tình trạng học viên</h3><p>${fmtN(studs.length)} tài khoản học viên</p></div></div>
      <div class="ad-stack">${seg.map(([, n, t]) => n ? `<i class="${t}" style="flex:${n}"></i>` : "").join("") || `<i class="mut" style="flex:1"></i>`}</div>
      <ul class="ad-seg">${seg.map(([l, n, t]) => `<li><i class="${t}"></i><span>${l}</span><b>${fmtN(n)}</b><em>${pctOf(n, studs.length)}%</em></li>`).join("")}</ul>
    </section>


    <section class="ad-card">
      <div class="ad-ch"><div><h3>Học viên cần nhắc</h3><p>Lâu nhất chưa quay lại học</p></div><a href="/app/quan-tri/thong-bao">Nhắc →</a></div>
      ${nudge.length ? `<ul class="ad-people">${nudge.map((u) => { const c = avatarColor(u.username); const d = Math.floor((now - lastSeen(u)) / DAY); return `<li><a href="/app/quan-tri/hoc-vien/${u.id}"><span class="av" style="background:${c}1f;color:${c}">${esc(initials(u.displayName || u.username))}</span><span class="tx"><b>${esc(u.displayName || u.username)}</b><small>${fmtN(u.total || 0)} điểm</small></span><em>${d} ngày</em></a></li>`; }).join("")}</ul>` : `<div class="ad-empty">Không có học viên nào nghỉ quá 7 ngày.</div>`}
    </section>
    <section class="ad-card">
      <div class="ad-ch"><div><h3>Hoạt động gần đây</h3><p>Tài khoản mới</p></div></div>
      ${acts.length ? `<ul class="ad-feed">${acts.map((a) => `<li><i class="${a.ok === null ? "info" : a.ok ? "ok" : "bad"}"></i><span><b>${esc(a.who)}</b> ${esc(a.txt)}<small>${esc(a.meta)} · ${esc(timeAgo(a.t))}</small></span></li>`).join("")}</ul>` : `<div class="ad-empty">Chưa có hoạt động.</div>`}
    </section>
    <div class="ad-col">
      <section class="ad-card">
        <div class="ad-ch"><div><h3>Hệ thống</h3></div><a href="/app/quan-tri/giam-sat">Chi tiết →</a></div>
        <ul class="ad-sys">
          <li><span>${I("server")}Máy chủ</span>${mon ? `<b class="ok">Hoạt động</b>` : `<b class="warn">Không rõ</b>`}</li>
          <li><span>${I("bot")}Trợ lý AI</span>${st ? (st.ai.configured ? `<b class="ok">Đang bật</b>` : `<b class="warn">Chưa cấu hình</b>`) : `<b class="warn">Không rõ</b>`}</li>
          <li><span>${icon("users")}Đang online</span><b>${fmtN(DATA.userStats?.online || 0)}</b></li>
        </ul>
      </section>
    </div>
  </div>`;
  $("#admReload", host)?.addEventListener("click", () => onReload && onReload());
}
