/* LifeRivo 2.0 - student pages */
import { appHash, setAppHash } from "./core.js";
import {
  S, api, esc, icon, avatar, fmtN, fmtDate, timeAgo, toast, openModal, confirmBox, store, best, isDone, groupProgress, findEx, chapterNum, chapterShort, loc, trMsg,
  chapterStats, totalStats, isUnlocked, nextOpenInChapter, pathStats, setScores, refreshScores, loadExams,
  animateCount, onScores, $, avatarColor, initials, cfg, siteName, aiOn, aiAuto,
  paintProBadges,
} from "./core.js";
import { getSubject, setSubject } from "./lang.js";
import { proDashCard, openAiInline } from "./pro.js";
import { mascot, levelOf, LEVELS, loadActivity, activityStats, dayKey, loadPrefs, savePrefs, isBookmarked, toggleBookmark, BADGES, badgeState, badgeHtml, newBadges, markBadgesSeen, celebrate, goalRing, G } from "./game.js";

/* ================= Shared utilities ================= */
/* ================= Goal selection (Batch 2) ================= */
// Goal -> 1 of 10 built-in learning tracks (without rewriting chapter content).
/* ================= Overview ================= */
const on = (k) => cfg(k, true) !== false;
export async function pageFeatureOff(main, _p, _q, ctx) {
  ctx.setCrumbs([["Đang tắt"]]);
  main.innerHTML = `<div class="sheet empty" style="padding:56px 20px"><div style="display:grid;place-items:center;margin-bottom:10px">${mascot("sleep", 100)}</div><b>Giáo viên đang tắt mục này</b>Khi giáo viên bật lại trong phần cài đặt, mục này sẽ xuất hiện trong menu.<br><a class="btn btn-primary" href="/app/">Về trang tổng quan</a></div>`;
}

/* ---------- Tổng quan cho môn ngoại ngữ (dùng /api/lang) ---------- */
export function noticeHtml(a) {
  return `<article class="notice ${a.pinned ? "pin" : ""}"><span class="ic" aria-hidden="true">${a.pinned ? "📌" : "📣"}</span><div><b>${esc(a.title)}</b>${a.body ? `<p>${esc(a.body)}</p>` : ""}<div class="meta">${esc(a.author || "Giáo viên")} · ${timeAgo(a.created_at)}</div></div></article>`;
}
/* ================= Course ================= */
/* ================= Exam room ================= */
/* ================= Playground ================= */
/* ================= Leaderboard ================= */
export async function pageNotices(main, _p, _q, ctx) {
  ctx.setCrumbs([["Thông báo"]]);
  const [j, n] = await Promise.all([
    api("/api/announcements").catch(() => ({ announcements: [] })),
    api("/api/notifications").catch(() => ({ items: [], unread: 0 })),
  ]);
  if (!ctx.isCurrent()) return;
  const a = j.announcements || [];
  const items = n.items || [];
  main.innerHTML = `
    <div class="page-head"><div><h1>Thông báo</h1><p>Tin hệ thống (nộp bài, chấm điểm, giấy phép, hết hạn Pro) và thông báo lớp từ giáo viên.</p></div>
      ${items.some((x) => !x.readAt) ? `<button class="btn" id="readAll">Đánh dấu đã đọc hết</button>` : ""}</div>
    <section class="sheet sheet-pad" style="margin-bottom:16px">
      <h2>Cá nhân</h2>
      ${items.length ? `<ul class="list">${items.map((x) => `<li class="list-row" style="cursor:pointer;opacity:${x.readAt ? 0.7 : 1}" data-nid="${x.id}" data-link="${esc(x.link || "")}">
        <span class="t"><b>${esc(x.title)}</b><span>${esc(x.body || "")} · ${timeAgo(x.createdAt)}${x.readAt ? "" : ' · <em class="notice-new">mới</em>'}</span></span>
      </li>`).join("")}</ul>` : `<p class="muted">Chưa có thông báo cá nhân.</p>`}
    </section>
    <section class="sheet sheet-pad">
      <h2>Thông báo lớp</h2>
      ${a.length ? `<div class="notices">${a.map(noticeHtml).join("")}</div>` : `<p class="muted">Chưa có thông báo lớp.</p>`}
    </section>`;
  $("#readAll", main)?.addEventListener("click", async () => {
    try { await api("/api/notifications/read-all", "POST", {}); toast("Đã đánh dấu đã đọc.", "ok"); pageNotices(main, [], {}, ctx); }
    catch (e) { toast(e.message, "err"); }
  });
  main.querySelectorAll("[data-nid]").forEach((el) => el.addEventListener("click", async () => {
    const id = el.dataset.nid;
    try { await api(`/api/notifications/${id}/read`, "POST", {}); } catch {}
    const link = el.dataset.link;
    if (link) setAppHash(link.startsWith("#") ? link : "/app/" + link.replace(/^#?\/?/, ""));
    else pageNotices(main, [], {}, ctx);
  }));
}

/* ================= Certificate ================= */
/* ================= Profile ================= */


/* ---------- Lộ trình cho môn ngoại ngữ: kế hoạch 7 ngày từ tiến độ hiện tại ---------- */
/* ---------- Tiến độ cho môn ngoại ngữ (dùng /api/lang) ---------- */
export async function pageNotFound(main, _p, _q, ctx) {
  ctx.setCrumbs([["Không tìm thấy"]]);
  main.innerHTML = `<div class="sheet empty" style="padding:60px 20px"><div style="display:grid;place-items:center;margin-bottom:10px">${mascot("think", 100)}</div><b>Không tìm thấy trang này</b>Đường dẫn có thể đã cũ hoặc nội dung đã bị xóa.<br><a class="btn btn-primary" href="/app/">Về trang tổng quan</a></div>`;
}


/* ================= Password reset (token) ================= */
export async function pageResetPassword(main, _p, query, ctx) {
  ctx.setCrumbs([["Đặt lại mật khẩu"]]);
  const token = (query && (query.token || query.t)) || "";
  main.innerHTML = `<div class="sheet sheet-pad" style="max-width:440px;margin:24px auto">
    <h1>Đặt lại mật khẩu</h1>
    <p class="small muted">Nhập mật khẩu mới cho liên kết được cấp (hiệu lực 1 giờ).</p>
    <form class="auth-form" data-f>
      <label class="field">Mã đặt lại<input name="token" required value="${esc(token)}" placeholder="Dán token nếu có"></label>
      <label class="field">Mật khẩu mới<input name="p" type="password" minlength="6" maxlength="128" required></label>
      <label class="field">Nhập lại mật khẩu<input name="p2" type="password" minlength="6" maxlength="128" required></label>
      <p class="form-msg" data-m></p>
      <button class="btn btn-primary" type="submit">Lưu mật khẩu mới</button>
      <p class="small" style="margin-top:12px"><a href="/app/dang-nhap">Quay lại đăng nhập</a></p>
    </form>
  </div>`;
  main.querySelector("[data-f]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const msg = main.querySelector("[data-m]");
    if (f.p.value !== f.p2.value) { msg.textContent = "Hai mật khẩu không khớp."; msg.className = "form-msg err"; return; }
    try {
      const j = await api("/api/password/reset", "POST", { token: f.token.value.trim(), newPassword: f.p.value });
      msg.textContent = (j.message || "Đã đổi mật khẩu.") + (j.username ? ` Tài khoản: @${j.username}` : "");
      msg.className = "form-msg ok";
      setTimeout(() => { setAppHash("/app/dang-nhap"); }, 1200);
    } catch (err) {
      msg.textContent = err.message;
      msg.className = "form-msg err";
    }
  });
}


/* ================= Study help center ================= */
export async function pageLearningHelp(main, _p, _q, ctx) {
  ctx.setCrumbs([["Hỗ trợ"]]);
  main.innerHTML = `<div class="skel" style="height:320px"></div>`;
  const [ai, billing] = await Promise.all([
    api("/api/ai/status").catch(() => null),
    api("/api/billing/plans").catch(() => null),
  ]);
  if (!ctx.isCurrent()) return;
  const support = String(billing?.support || "").trim();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(support);
  const digits = support.replace(/[^0-9+]/g, "");
  const isPhone = !isEmail && digits.replace(/\D/g, "").length >= 9 && !/^https?:\/\//i.test(support);
  const isUrl = /^https:\/\//i.test(support);
  const contact = !support
    ? `<p class="small muted">Bạn hãy liên hệ giáo viên hoặc quản trị viên của hệ thống.</p>`
    : isEmail
      ? `<a class="btn btn-primary" href="mailto:${esc(support)}?subject=${encodeURIComponent("Hỗ trợ học tập LifeRivo")}">${icon("mail")} ${esc(support)}</a>`
      : isPhone
        ? `<a class="btn btn-primary" href="tel:${esc(digits)}">${icon("phone")} ${esc(support)}</a>`
        : isUrl
          ? `<a class="btn btn-primary" href="${esc(support)}" target="_blank" rel="noopener noreferrer">${icon("external-link")} Mở kênh hỗ trợ</a>`
          : `<p class="small muted"><b>Kênh hỗ trợ:</b> ${esc(support)}. Hãy sao chép thông tin này để liên hệ.</p>`;
  const aiText = !ai?.enabled || !ai?.configured ? "Trợ lý AI tạm thời chưa sẵn sàng. Bạn thử lại sau nhé."
    : ai.examLock ? "AI tạm khóa khi bạn đang làm bài kiểm tra để bảo vệ tính công bằng."
    : `Hạn mức của bạn: ${ai.remaining?.day ?? 0}/${ai.limits?.day ?? 0} lượt hôm nay · ${ai.remaining?.month ?? 0}/${ai.limits?.month ?? 0} lượt tháng này${ai.pro ? " · Thành viên Pro" : " · Gói Free"}.`;
  // Trang Hỗ trợ theo môn ngoại ngữ đang chọn ở thanh trên cùng (pl:subject).
  let _helpSubj = "";
  try { _helpSubj = localStorage.getItem("pl:subject") || ""; } catch {}
  if (!_helpSubj && S.prefs && S.prefs.subject) _helpSubj = S.prefs.subject;
  const _helpSubjName = { en: "Tiếng Anh", zh: "Tiếng Trung", ja: "Tiếng Nhật", ko: "Tiếng Hàn", fr: "Tiếng Pháp", es: "Tiếng Tây Ban Nha" }[_helpSubj] || "";
  main.innerHTML = `
    <div class="page-head edu-page-head"><div><span class="edu-eyebrow">TRUNG TÂM HỖ TRỢ</span><h1>Bạn đang gặp khó khăn khi học?</h1><p>Chọn tình huống phù hợp. LifeRivo sẽ chỉ bạn cách tự tìm nguyên nhân và tiến lên từng bước.</p></div></div>
    <section class="edu-help-hero sheet sheet-pad"><div><span class="edu-eyebrow">Hỗ trợ thông minh</span><h2>Không chỉ đưa đáp án — giúp bạn hiểu cách sử dụng</h2><p>Khi phát âm chưa chuẩn, hãy nghe giọng mẫu rồi luyện nói lại. Trong màn hình luyện nói, bấm mic để AI chấm phát âm và gợi ý cách sửa.</p><a class="btn btn-primary" href="${nextHrefForHelp()}">${icon("book")} Tiếp tục bài đang học</a></div><div class="edu-help-ai-state"><b>${ai?.pro ? "Rivo Pro" : "Rivo"}</b><span>${esc(aiText)}</span><a href="/app/bang-gia">Xem quyền lợi Pro</a></div></section>
    <div class="edu-help-grid">
      <a class="edu-help-option" href="/app/ngoai-ngu"><span class="ico-box">${icon("book-open")}</span><b>Chưa hiểu bài học</b><span>Đọc lại mục tiêu, lý thuyết, ví dụ và lỗi thường gặp theo từng chủ đề.</span><em>Mở bài học có hướng dẫn ${icon("right")}</em></a>
      <a class="edu-help-option" href="/app/ngoai-ngu"><span class="ico-box">${icon("chart")}</span><b>Không biết phần nào đang yếu</b><span>Xem bài đã thử nhưng chưa đạt và các chủ đề nên luyện thêm.</span><em>Xem gợi ý cải thiện ${icon("right")}</em></a>
      <a class="edu-help-option" href="/app/phong-van"><span class="ico-box">${icon("route")}</span><b>Không biết nên học gì tiếp</b><span>Làm đánh giá năng lực và nhận kế hoạch học cá nhân 7 ngày.</span><em>Mở lộ trình cá nhân ${icon("right")}</em></a>
      <a class="edu-help-option" href="/app/lop"><span class="ico-box">${icon("users")}</span><b>Cần giáo viên xem bài</b><span>Kiểm tra lớp, bài được giao, hạn nộp và nhận xét của giáo viên.</span><em>Mở lớp học ${icon("right")}</em></a>
    </div>
    <section class="sheet sheet-pad edu-help-faq"><div class="sec-head"><div><h2>Các tình huống thường gặp</h2><p>Hãy thử các bước dưới đây trước khi gửi yêu cầu hỗ trợ.</p></div></div>
      <details><summary>Luyện nói bị chấm thấp?</summary><p>Nói to, rõ, gần micro và dùng Chrome hoặc Edge. Nhận giọng nói cần Internet để gửi âm thanh lên máy chủ Google. Sau khi nói xong, bấm lại nút mic để dừng và xem điểm.</p></details>
      <details><summary>Mic không nhận giọng nói?</summary><p>Bấm biểu tượng ổ khóa trên thanh địa chỉ → cho phép Micro, rồi tải lại trang. Dùng Chrome hoặc Edge bản mới. Nói rõ từng từ, tránh ngừng quá lâu giữa câu, và kiểm tra micro đã được chọn trong cài đặt máy.</p></details>
      <details><summary>Không mở được bài học Pro?</summary><p>Vào Gói của tôi để kiểm tra trạng thái và thời hạn Pro. Nếu quyền vừa được cấp qua lớp học hoặc Family, hãy tải lại trang sau khi đăng nhập lại.</p><a href="/app/goi-cua-toi">Kiểm tra gói thành viên</a></details>
      <details><summary>Đã làm bài nhưng tiến độ chưa cập nhật?</summary><p>Chỉ bài được nộp và chấm thành công mới được ghi nhận là hoàn thành. Hãy kiểm tra trạng thái bài và tải lại trang chủ học tập.</p><a href="/app/">Về tổng quan học tập</a></details>
    </section>
    <section class="sheet sheet-pad edu-help-contact"><div><h2>Vẫn chưa giải quyết được?</h2><p class="small muted">Khi liên hệ, hãy gửi kèm tên bài học${_helpSubjName ? ` <b>${esc(_helpSubjName)}</b>` : ""} và các bước bạn đã thử. Không gửi mật khẩu hoặc khóa API.</p></div>${contact}</section>
  `;
}
function nextHrefForHelp() {
  const last = S.prefs?.lastExerciseId;
  return last ? `/app/ngoai-ngu/bai/${encodeURIComponent(last)}` : "/app/ngoai-ngu";
}

// Hồ sơ: tên hiển thị, đổi mật khẩu, góp ý (không còn thống kê bài tập)
export async function pageProfile(main, _p, _q, ctx) {
  ctx.setCrumbs([["Hồ sơ của tôi"]]);
  main.innerHTML = `<div class="skel" style="height:300px"></div>`;
  const rating = await api("/api/rating").catch(() => null);
  if (!ctx.isCurrent()) return;
  let stars = rating && rating.mine ? rating.mine.stars : 0;
  main.innerHTML = `
    <div class="page-head"><div class="row" style="gap:16px"><span class="avatar" style="width:64px;height:64px;font-size:24px;background:${avatarColor(S.me.username)}">${esc(initials(S.me.displayName))}</span>
      <div><h1>${esc(S.me.displayName)}</h1><p>@${esc(S.me.username)} · ${({ admin: "Quản trị", teacher: "Giáo viên", student: "Học viên", parent: "Phụ huynh" })[S.me.role] || "Học viên"}</p></div></div></div>
    <div class="stack" style="margin-top:16px;max-width:760px">
      <div class="stack">
        <h3 style="margin:14px 0 2px;font-size:14px;font-weight:700;color:var(--ink-2);padding-bottom:8px;border-bottom:1px solid var(--line,#e5e5ea)">Bảo mật</h3>
        <details class="sheet sheet-pad">
          <summary><h2>Email khôi phục</h2></summary>
          <p class="small muted" style="margin-top:4px">Mã OTP đặt lại mật khẩu sẽ gửi về email này khi bạn quên mật khẩu.</p>
          <p class="small" id="emailNow" style="margin-top:8px">${S.me.email ? `Email hiện tại: <b data-i18n="off">${esc(S.me.email)}</b>` : "Chưa có email. Thêm email để tự lấy lại mật khẩu khi quên."}</p>
          <form class="auth-form" id="emailForm" novalidate>
            <label class="field">Email<input type="email" name="em" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" maxlength="254" value="${esc(S.me.email || "")}" placeholder="ban@example.com"></label>
            <label class="field">Mật khẩu hiện tại<input type="password" name="pw" autocomplete="current-password" required><small>Nhập mật khẩu hiện tại để xác nhận thay đổi.</small></label>
            <p class="form-msg" id="emailMsg" role="status"></p>
            <button class="btn">Lưu email</button>
          </form>
          <div id="emailVerify" style="margin-top:12px"></div>
        </details>
        <details class="sheet sheet-pad">
          <summary><h2>Đổi mật khẩu</h2></summary>
          <p class="small muted" style="margin-top:4px">Sau khi đổi, các thiết bị khác đang đăng nhập sẽ bị đăng xuất.</p>
          <form class="auth-form" id="pwForm">
            <label class="field">Mật khẩu hiện tại<input type="password" name="cur" autocomplete="current-password" required></label>
            <label class="field">Mật khẩu mới<input type="password" name="nw" autocomplete="new-password" minlength="6" maxlength="128" required><small>6 đến 128 ký tự.</small></label>
            <label class="field">Nhập lại mật khẩu mới<input type="password" name="cf" autocomplete="new-password" required></label>
            <p class="form-msg" id="pwMsg" role="status"></p>
            <button class="btn btn-primary">${icon("key")}Đổi mật khẩu</button>
          </form>
        </details>
      </div>
      <div class="stack">
        <h3 style="margin:14px 0 2px;font-size:14px;font-weight:700;color:var(--ink-2);padding-bottom:8px;border-bottom:1px solid var(--line,#e5e5ea)">Hệ thống</h3>
        <details class="sheet sheet-pad" id="proSection" open>
          <summary><h2>Pro và mã quà tặng</h2></summary>
          <div id="proStatus" class="small" style="margin-top:8px"></div>
          <div id="proDaily" style="margin-top:10px"></div>
          <details class="gift-fold" style="margin-top:12px">
            <summary class="small" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:14px;background:var(--paper-2,#f7f5ef);font-weight:600;color:var(--ink-2);cursor:pointer">${icon("key", 'width="18" height="18" style="flex:none"')}Có mã quà tặng? Bấm để nhập mã</summary>
            <form class="auth-form" id="giftForm" novalidate style="margin-top:12px">
              <label class="field">Mã quà tặng<input name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="19" placeholder="XXXX-XXXX-XXXX"><small>Mỗi mã dùng được một lần, mỗi tài khoản chỉ dùng một mã.</small></label>
              <p class="form-msg" id="giftMsg" role="status"></p>
              <button class="btn btn-primary">Kích hoạt mã</button>
            </form>
          </details>
        </details>
        <details class="sheet sheet-pad fb-card" id="fbSection">
          <summary><h2>Góp ý để hoàn thiện LifeRivo</h2></summary>
          <p class="small muted" style="margin-top:4px">Báo lỗi, đề xuất tính năng hoặc ý kiến khác. Chúng tôi đọc mọi góp ý.</p>
          <form class="auth-form" id="fbForm" novalidate>
            <label class="field">Loại góp ý
              <select name="kind">
                <option value="feature">Đề xuất tính năng</option>
                <option value="bug">Báo lỗi</option>
                <option value="other">Ý kiến khác</option>
              </select>
            </label>
            <label class="field">Tiêu đề (không bắt buộc)<input name="subject" maxlength="120" placeholder="Ví dụ: Thêm chế độ ôn tập theo tuần"></label>
            <label class="field">Nội dung<textarea name="body" rows="4" maxlength="2000" required placeholder="Mô tả điều bạn muốn, hoặc các bước để tái hiện lỗi"></textarea><small>Ít nhất 10 ký tự.</small></label>
            <p class="form-msg" id="fbMsg" role="status"></p>
            <button class="btn btn-primary">Gửi góp ý</button>
          </form>
          <div id="fbMine" class="fb-list"></div>
        </details>
        ${on("ratingEnabled") ? `<details class="sheet sheet-pad">
          <summary><h2>Đánh giá ${esc(siteName())}</h2></summary>
          <p class="small muted" style="margin-top:4px">${rating && rating.summary.count ? `Trung bình ${rating.summary.average}/5 từ ${fmtN(rating.summary.count)} đánh giá.` : "Hãy là người đánh giá đầu tiên."}</p>
          <div class="stars-pick" id="stars" role="radiogroup" aria-label="Số sao" style="margin-top:10px">${[1, 2, 3, 4, 5].map((i) => `<button type="button" role="radio" aria-label="${i} sao" data-s="${i}">★</button>`).join("")}</div>
          <label class="field" style="margin-top:10px">Nhận xét<textarea id="rateC" maxlength="500" rows="3" placeholder="Điều bạn thích, hoặc điều cần cải thiện (không bắt buộc)">${esc(rating && rating.mine ? rating.mine.comment || "" : "")}</textarea></label>
          <div class="row" style="margin-top:10px"><button class="btn btn-primary" id="rateBtn">Gửi đánh giá</button><span class="form-msg" id="rateMsg"></span></div>
        </details>` : ""}
      </div>
    </div>`;
  const paintStars = (n) => main.querySelectorAll("[data-s]").forEach((b) => { const lit = Number(b.dataset.s) <= n; b.classList.toggle("on", lit); b.setAttribute("aria-checked", String(Number(b.dataset.s) === stars)); });
  paintStars(stars);
  main.querySelectorAll("[data-s]").forEach((b) => {
    b.addEventListener("click", () => { stars = Number(b.dataset.s); paintStars(stars); });
    b.addEventListener("mouseenter", () => paintStars(Number(b.dataset.s)));
    b.addEventListener("mouseleave", () => paintStars(stars));
  });
  $("#emailForm", main)?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, msg = $("#emailMsg", main);
    const fail = (x) => { msg.textContent = x; msg.className = "form-msg err"; };
    const em = f.em.value.trim();
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return fail("Email chưa đúng định dạng.");
    if (!f.pw.value) return fail("Nhập mật khẩu hiện tại để xác nhận thay đổi.");
    try {
      const r = await api("/api/profile/email", "POST", { email: em, currentPassword: f.pw.value });
      S.me.email = r.email || "";
      f.pw.value = "";
      f.em.value = S.me.email;
      const now = $("#emailNow", main);
      now.textContent = "";
      if (S.me.email) { now.append("Email hiện tại: "); const b = document.createElement("b"); b.dataset.i18n = "off"; b.textContent = S.me.email; now.append(b); }
      else now.textContent = "Chưa có email. Thêm email để tự lấy lại mật khẩu khi quên.";
      msg.textContent = r.message || "Đã lưu email khôi phục."; msg.className = "form-msg ok";
    } catch (err) { fail(err.message); }
  });
  $("#rateBtn", main)?.addEventListener("click", async () => {
    const msg = $("#rateMsg", main);
    if (!stars) { msg.textContent = "Hãy chọn số sao."; msg.className = "form-msg err"; return; }
    try { await api("/api/rating", "POST", { stars, comment: $("#rateC", main).value }); msg.textContent = "Đã lưu đánh giá. Cảm ơn bạn!"; msg.className = "form-msg ok"; }
    catch (e) { msg.textContent = e.message; msg.className = "form-msg err"; }
  });
  $("#pwForm", main).addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, msg = $("#pwMsg", main);
    const fail = (t) => { msg.textContent = t; msg.className = "form-msg err"; };
    if (f.nw.value.length < 6 || f.nw.value.length > 128) return fail("Mật khẩu mới cần từ 6 đến 128 ký tự.");
    if (f.nw.value !== f.cf.value) return fail("Hai lần nhập mật khẩu mới chưa khớp.");
    try {
      await api("/api/password/change", "POST", { currentPassword: f.cur.value, newPassword: f.nw.value });
      f.reset(); msg.textContent = "Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất."; msg.className = "form-msg ok";
    } catch (err) { fail(err.message); }
  });
  // Pro: trạng thái hiện tại, lượt Pro miễn phí 10 phút mỗi ngày và nhập mã quà tặng
  const refreshMembership = () => api("/api/me").then((me) => { S.membership = me.membership || S.membership; paintProBadges(); }).catch(() => {});
  const renderPro = (st) => {
    const statusBox = $("#proStatus", main), dailyBox = $("#proDaily", main);
    if (!statusBox || !dailyBox) return;
    const hm = (iso) => new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    statusBox.innerHTML = '<span data-pro-slot></span>' + (S.me.role === "admin" ? "Tài khoản quản trị có đầy đủ quyền Pro."
      : st.gift.active ? `Đang dùng Pro từ mã quà tặng đến <b>${esc(fmtDate(st.gift.expiresAt, false))}</b>.`
      : st.daily.activeUntil ? `Đang dùng Pro miễn phí hôm nay đến <b>${esc(hm(st.daily.activeUntil))}</b>.`
      : st.pro ? "Bạn đang dùng gói Pro."
      : "Bạn đang dùng gói Free.");
    paintProBadges();
    dailyBox.innerHTML = st.daily.activeUntil ? `<p class="small muted" style="margin:6px 0 0">Lượt miễn phí đang chạy. Làm mới lúc 5:00 sáng mai.</p>`
      : st.daily.canClaim ? `<div class="row"><button class="btn" id="dailyPro">Nhận miễn phí ${st.daily.minutes} phút Pro</button></div><p class="small muted" style="margin-top:6px">Mỗi ngày được ${st.daily.minutes} phút Pro miễn phí, làm mới lúc 5:00 sáng. Lượt không dùng không cộng dồn.</p>`
      : st.daily.claimedToday ? `<p class="small muted" style="margin:6px 0 0">Hôm nay bạn đã dùng lượt ${st.daily.minutes} phút. Lượt mới lúc 5:00 sáng mai.</p>` : "";
    dailyBox.querySelector("#dailyPro")?.addEventListener("click", async (ev) => {
      const b = ev.currentTarget; b.disabled = true;
      try {
        const r = await api("/api/me/daily-pro", "POST", {});
        toast(`Đã mở ${st.daily.minutes} phút Pro. Dùng ngay nhé.`, "ok");
        renderPro(r.status); refreshMembership();
      } catch (err) { toast(err.message, "err"); b.disabled = false; }
    });
  };
  api("/api/me/pro-access").then(renderPro).catch(() => {});

  // Xác thực email: gửi mã 6 số, nhập mã, sau đó mã Pro 7 ngày được gửi tới email (mỗi địa chỉ một lần)
  const renderEmailVerify = (st) => {
    const box = $("#emailVerify", main);
    if (!box) return;
    if (!st.email) { box.innerHTML = ""; return; }
    if (!st.mailOn) { box.innerHTML = `<p class="small muted">Chưa bật gửi email trên máy chủ nên chưa xác thực được. Hãy liên hệ quản trị viên.</p>`; return; }
    if (st.verified) {
      box.innerHTML = `<p class="small"><b>Đã xác thực email.</b> ${st.giftSent ? "Mã Pro 7 ngày đã được gửi tới email này." : "Mã Pro 7 ngày sẽ được gửi tới email này."}</p>
        ${st.giftSent ? `<div class="row" style="margin-top:8px"><button class="btn btn-sm btn-ghost" id="emailResend" type="button">Gửi lại mã qua email</button></div>` : ""}
        <p class="form-msg" id="emailVMsg" role="status"></p>`;
      box.querySelector("#emailResend")?.addEventListener("click", async (ev) => {
        const b = ev.currentTarget; b.disabled = true;
        try { await api("/api/me/email/resend-gift", "POST", {}); $("#emailVMsg", main).textContent = "Đã gửi lại mã Pro tới email."; $("#emailVMsg", main).className = "form-msg ok"; }
        catch (err) { $("#emailVMsg", main).textContent = err.message; $("#emailVMsg", main).className = "form-msg err"; }
        finally { b.disabled = false; }
      });
      return;
    }
    box.innerHTML = `<p class="small muted">Xác thực email để nhận mã Pro 7 ngày qua email. Mỗi địa chỉ email chỉ nhận một lần.</p>
      <div class="row" style="margin-top:8px"><button class="btn" id="emailSend" type="button">Gửi mã xác thực</button></div>
      <form class="auth-form" id="emailConfirmForm" novalidate hidden style="margin-top:10px">
        <label class="field">Mã 6 số đã gửi tới email<input name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="123456"></label>
        <p class="form-msg" id="emailVMsg" role="status"></p>
        <button class="btn btn-primary">Xác thực</button>
      </form>`;
    box.querySelector("#emailSend").addEventListener("click", async (ev) => {
      const b = ev.currentTarget; b.disabled = true;
      try {
        const r = await api("/api/me/email/send-code", "POST", {});
        if (r.verified) return renderEmailVerify({ ...st, verified: true });
        box.querySelector("#emailConfirmForm").hidden = false;
        $("#emailVMsg", main).textContent = r.message || "Đã gửi mã."; $("#emailVMsg", main).className = "form-msg ok";
      } catch (err) { $("#emailVMsg", main).textContent = err.message; $("#emailVMsg", main).className = "form-msg err"; }
      finally { b.disabled = false; }
    });
    box.querySelector("#emailConfirmForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target, msg = $("#emailVMsg", main), btn = f.querySelector("button");
      btn.disabled = true;
      try {
        const r = await api("/api/me/email/confirm", "POST", { code: f.code.value.trim() });
        const text = r.gift === "sent" ? "Đã xác thực email. Mã Pro 7 ngày đã được gửi tới email này."
          : r.gift === "already" ? "Đã xác thực email. Địa chỉ này đã nhận mã Pro 7 ngày trước đó."
          : "Đã xác thực email.";
        toast(text, "ok");
        renderEmailVerify({ ...st, verified: true, giftSent: r.gift === "sent" || r.gift === "already" });
      } catch (err) { msg.textContent = err.message; msg.className = "form-msg err"; }
      finally { btn.disabled = false; }
    });
  };
  api("/api/me/email/status").then(renderEmailVerify).catch(() => {});
  $("#giftForm", main)?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, msg = $("#giftMsg", main), btn = f.querySelector("button");
    const code = f.code.value.trim();
    if (!code) { msg.textContent = "Nhập mã quà tặng."; msg.className = "form-msg err"; return; }
    btn.disabled = true;
    try {
      const r = await api("/api/me/gift", "POST", { code });
      f.reset();
      msg.textContent = "Đã kích hoạt mã Pro thành công.";
      msg.className = "form-msg ok";
      renderPro(r.status); refreshMembership();
    } catch (err) {
      msg.textContent = err.message;
      msg.className = "form-msg err";
    } finally {
      btn.disabled = false;
    }
  });

  // Góp ý sản phẩm: gửi góp ý và xem lại các góp ý đã gửi cùng trạng thái xử lý
  const FB_KIND = { feature: "Đề xuất tính năng", bug: "Báo lỗi", other: "Ý kiến khác" };
  const FB_STATUS = { new: "Đã nhận", reviewing: "Đang xem xét", planned: "Đã lên kế hoạch", done: "Đã hoàn thành", declined: "Chưa thực hiện" };
  const renderFb = (items) => {
    const box = $("#fbMine", main);
    if (!box) return;
    box.innerHTML = items.length
      ? `<h3 class="fb-h">Góp ý của bạn</h3>` + items.map((x) => `<article class="fb-item">
          <div class="fb-top"><span class="fb-kind">${esc(FB_KIND[x.kind] || x.kind)}</span><span class="fb-st fb-${esc(x.status)}">${esc(FB_STATUS[x.status] || x.status)}</span></div>
          ${x.subject ? `<b>${esc(x.subject)}</b>` : ""}
          <p>${esc(x.body)}</p>
          <small class="muted">${esc(fmtDate(x.created_at))}</small>
        </article>`).join("")
      : "";
  };
  api("/api/feedback/mine").then((r) => renderFb(r.items || [])).catch(() => {});
  $("#fbForm", main)?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, msg = $("#fbMsg", main), btn = f.querySelector("button");
    const text = f.body.value.trim();
    if (text.length < 10) { msg.textContent = "Nội dung cần ít nhất 10 ký tự."; msg.className = "form-msg err"; return; }
    btn.disabled = true;
    try {
      await api("/api/feedback", "POST", { kind: f.kind.value, subject: f.subject.value.trim(), body: text, page: appHash() });
      f.reset();
      msg.textContent = "Cảm ơn bạn! Góp ý đã được gửi.";
      msg.className = "form-msg ok";
      api("/api/feedback/mine").then((r) => renderFb(r.items || [])).catch(() => {});
    } catch (err) {
      msg.textContent = err.message;
      msg.className = "form-msg err";
    } finally {
      btn.disabled = false;
    }
  });
}
