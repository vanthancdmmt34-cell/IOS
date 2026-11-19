/* 5.2.0 - Student dashboard (LifeRivo), card grid + right sidebar layout.
   A unified page for all subjects of the logged-in account. All metrics come from existing APIs:
   /api/dashboard (streak, assignments, AI quota), /api/lang, /api/notifications.
   There is no "total study time" because the system does not track it. */
import {  } from "./core.js";
import { S, api, esc, icon, lineIcon, sketchIcon, CHIBI_PETS, subjectMascotSvg, fmtN, fmtDate, totalStats, skeleton, emptyState, errorState, avatar, roleLabel, cfg, isDone, toast } from "./core.js";
import { ChibiMascot, HeroBanner, StreakCounter, DailyMission, LevelBadge } from "./chibi-ds.js";
import { currentLang, t as trUi } from "./i18n.js";
import { getSubject } from "./lang.js";
import { companionCardHtml, bindCompanionCard } from "./companion-card.js";
import { petState, refreshPet } from "./pet-state.js";
import { savePrefs } from "./game.js";
import { goalById } from "./roadmap-std.js";

const L = (vi, en) => (currentLang() === "en" ? en : vi);
const bar = (pct, color) => `<span class="bar hm-bar"><i style="width:${Math.max(0, Math.min(100, pct))}%;${color ? `background:${color}` : ""}"></i></span>`;
const TZ = "Asia/Ho_Chi_Minh";
const vnDate = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

// Normalize all subjects into a common shape
function wordStats(course, pass) {
  let known = 0, total = 0;
  for (const lv of course.levels || []) for (const u of lv.units || []) {
    const n = Number(u.words) || 0;
    total += n;
    const vocab = (u.exercises || []).find((e) => e.kind === "nghia");
    if (vocab && vocab.best >= pass) known += n;
  }
  return { known, total };
}
function collect(lang) {
  const out = [];
  for (const c of (lang && lang.courses) || []) {
    const all = c.levels.filter((l) => !l.locked).flatMap((l) => l.units.flatMap((u) => u.exercises.map((e) => ({ ...e, l, u }))));
    const tried = all.filter((e) => e.attempts > 0);
    const nx = all.find((e) => e.attempts > 0 && e.best < lang.pass) || all.find((e) => e.best < lang.pass);
    const words = wordStats(c, lang.pass || 80);
    const here = (c.levels || []).find((l) => l.done < l.total) || (c.levels || [])[0];
    const plain = here
      ? L(`Đang ở ${here.title}. Đã thuộc ${words.known}/${words.total} từ.`, `Now at ${here.title}. ${words.known}/${words.total} words learned.`)
      : L("Mở bài đầu tiên.", "Open the first lesson.");
    out.push({ id: c.id, name: c.name, flag: c.flag, color: c.color, meta: c.framework, done: c.done, total: c.total, pct: c.pct, started: tried.length > 0, review: c.review, levels: c.levels, tried, plain, nextEx: nx || null,
      next: nx ? { href: `/app/ngoai-ngu/bai/${nx.id}`, label: plain } : { href: `/app/?mon=${c.id}`, label: plain } });
  }
  return out;
}

// Monthly calendar (Monday first), highlights today; includes month navigation buttons
function calendarHtml(year, month, todayStr) {
  const first = new Date(Date.UTC(year, month, 1));
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7;
  const prevDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = [];
  for (let i = lead; i > 0; i--) cells.push(`<span class="dim">${prevDays - i + 1}</span>`);
  for (let d = 1; d <= days; d++) { const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; cells.push(`<span class="${iso === todayStr ? "today" : ""}"${iso === todayStr ? ' aria-current="date"' : ""}>${d}</span>`); }
  for (let d = 1; cells.length % 7; d++) cells.push(`<span class="dim">${d}</span>`);
  const title = new Date(Date.UTC(year, month, 1)).toLocaleDateString(currentLang() === "en" ? "en-GB" : "vi-VN", { month: "long", year: "numeric", timeZone: "UTC" });
  const dows = currentLang() === "en" ? ["M", "T", "W", "T", "F", "S", "S"] : ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  return `<div class="hm-cal-head"><button type="button" class="icon-btn" data-cal="-1" aria-label="${L("Tháng trước", "Previous month")}">${icon("left")}</button><b>${esc(title)}</b><button type="button" class="icon-btn" data-cal="1" aria-label="${L("Tháng sau", "Next month")}">${icon("right")}</button></div>
    <div class="hm-cal-grid">${dows.map((d) => `<i>${d}</i>`).join("")}${cells.join("")}</div>`;
}

// Chữ đại diện cho chữ viết của từng ngôn ngữ, dùng làm nền trang trí của khối hero.
const SCRIPT_GLYPH = { en: "Aa", zh: "中", ja: "あ", ko: "한", fr: "É", es: "ñ" };

export async function pageStudentHome(main, params, query, ctx) {
  const cheer = !!(query && query.mode === "cheer");
  ctx.setCrumbs(cheer ? [[L("Học viên", "Student"), "/app/"], [L("Cổ Vũ · Kế hoạch ngày", "Daily Focus")]] : [[L("Tổng quan", "Overview")]]);
  main.innerHTML = `<div class="lh">${skeleton("hero")}${skeleton("block")}</div>`;
  let dash, lang, unread = 0, insightResponse = null;
  const requestedLang = (params && params[0]) || getSubject();
  const canLoadInsights = ["en", "zh", "ja", "ko", "fr", "es"].includes(requestedLang);
  try {
    [dash, lang, insightResponse] = await Promise.all([
      api("/api/dashboard"),
      api("/api/lang"),
      canLoadInsights ? api(`/api/lang/insights/${encodeURIComponent(requestedLang)}`).catch(() => null) : Promise.resolve(null),
      refreshPet().catch(() => null),
    ]);
    try { unread = (await api("/api/notifications?unread=1")).unread || 0; } catch {}
  } catch (e) {
    if (ctx.isCurrent()) { main.innerHTML = `<div class="lh">${errorState(e.message)}</div>`; main.querySelector("[data-retry]")?.addEventListener("click", () => pageStudentHome(main, params, query, ctx)); }
    return;
  }
  if (!ctx.isCurrent()) return;

  const subjects = collect(lang);
  const cur = (params && params[0]) || getSubject();
  const _isLangHome = ["en", "zh", "ja", "ko", "fr", "es"].includes(cur);
  const started = subjects.filter((s) => s.started).sort((a, b) => (b.id === cur) - (a.id === cur) || b.pct - a.pct);
  const fresh = subjects.filter((s) => !s.started);
  const done = subjects.reduce((n, s) => n + s.done, 0);
  const streak = (dash.streak && dash.streak.current) || 0;
  const longest = (dash.streak && dash.streak.longest) || 0;
  const todayStr = vnDate();
  // "Hôm nay đã học" tính theo chu kỳ 5:00 sáng (cùng mốc với mục tiêu và nhiệm vụ), không theo nửa đêm
  const today = (Number(dash.today && dash.today.activities) || 0) > 0;
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(new Date()));
  const hello = hour < 11 ? L("Chào buổi sáng", "Good morning") : hour < 18 ? L("Chào buổi chiều", "Good afternoon") : L("Chào buổi tối", "Good evening");
  const focus = started.find((s) => s.id === cur) || started[0] || null;
  const due = (dash.dueAssignments || []).filter((a) => !a.passed).slice(0, 4);
  const reviews = subjects.filter((s) => s.review && s.review.due > 0);
  const reviewDue = reviews.reduce((n, s) => n + s.review.due, 0);
  // Đã chọn môn thì tổng quan chỉ nói về môn đó: không bài giao chung, không ôn của môn khác, không chip môn khác
  const scoped = cur ? subjects.find((s) => s.id === cur) || null : null;
  const heroSub = scoped || focus;
  const dueShown = scoped ? [] : due;
  const reviewsShown = scoped ? reviews.filter((s) => s.id === scoped.id) : reviews;
  const reviewDueShown = reviewsShown.reduce((n, s) => n + s.review.due, 0);
  const doneShown = scoped ? scoped.done : done;
  const insight = scoped && insightResponse && insightResponse.insights && insightResponse.insights.lang === scoped.id
    ? insightResponse.insights
    : null;

  // Trang môn ngoại ngữ chỉ đếm hoạt động học ngoại ngữ; trang tổng quan đếm mọi hoạt động
  const weekKey = _isLangHome ? "lang" : "n";
  const byDay = Object.fromEntries((dash.week || []).map((w) => [w.d, Number(w[weekKey]) || 0]));
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(Date.UTC(ty, tm - 1, td - (6 - i))); const iso = d.toISOString().slice(0, 10); return { iso, n: byDay[iso] || 0, label: currentLang() === "en" ? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getUTCDay()] : ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getUTCDay()] }; });
  const weekTotal = week.reduce((n, w) => n + w.n, 0), weekMax = Math.max(1, ...week.map((w) => w.n));
  const activeDays = week.filter((w) => w.n > 0).length;

  const langStarts = (lang.courses || []).map((c) => {
    const firstEx = c.levels && c.levels[0] && c.levels[0].units && c.levels[0].units[0] && c.levels[0].units[0].exercises && c.levels[0].units[0].exercises[0];
    return {
      id: c.id,
      name: c.name,
      flag: c.flag,
      color: c.color,
      meta: c.framework,
      href: firstEx ? `/app/ngoai-ngu/bai/${firstEx.id}` : `/app/ngoai-ngu/${c.id}`,
    };
  });
  const flag = (s, cls = "") => `<span class="lh-flag ${cls}" style="--c:${esc(s.color)}">${s.flag}</span>`;
  const todo = [
    ...dueShown.map((a) => `<a class="lh-todo" href="/app/bai-giao/${a.id}"><span class="lh-dot ${a.overdue ? "bad" : "warn"}"></span><span class="t"><b>${esc(a.title)}</b><small>${esc(a.className || L("Bài giao của lớp", "Class assignment"))}${a.dueAt ? " · " + L("hạn", "due") + " " + esc(fmtDate(a.dueAt)) : ""}</small></span><span class="tag ${a.overdue ? "tag-do" : "tag-cam"}">${a.overdue ? L("Quá hạn", "Overdue") : L("Cần làm", "To do")}</span></a>`),
    ...reviewsShown.map((s) => `<a class="lh-todo" href="/app/ngoai-ngu/on-tap/${s.id}"><span class="lh-dot info"></span><span class="t"><b>${L(`Ôn ${s.review.due} từ ${s.name}`, `Review ${s.review.due} ${s.name} words`)}</b><small>${L("Thẻ ghi nhớ đến hạn hôm nay", "Flashcards due today")}</small></span><span class="tag tag-tim">${L("Ôn tập", "Review")}</span></a>`),
    ...(heroSub && !today ? [`<a class="lh-todo" href="${heroSub.next.href}"><span class="lh-dot ok"></span><span class="t"><b>${L("Làm một bài để giữ chuỗi ngày học", "Do one exercise to keep your streak")}</b><small>${L("Khoảng 10 phút", "About 10 minutes")}</small></span><span class="tag tag-la">${L("Hôm nay", "Today")}</span></a>`] : []),
  ];

  const scopedLinks = scoped ? (() => {
    const id = scoped.id;
    return [
      [L("Luyện nói & Phát âm", "Speaking & Pronunciation"), `/app/ngoai-ngu/luyen-noi/${id}`, "play"],
      [L("Phỏng vấn AI (30 ngành)", "AI interviews (30 fields)"), `/app/ngoai-ngu/luyen-noi/${id}?muc=hoi-thoai`, "bulb"],
      [L("Hội thoại AI", "AI conversation"), `/app/ngoai-ngu/tro-chuyen/${id}`, "globe"],
      [L("Phỏng vấn thử", "Mock interviews"), `/app/phong-van/${id}`, "user"],
    ];
  })() : [];
  const scopedSubLinks = scoped ? (() => {
    const id = scoped.id;
    return [
      [L("Chứng nhận", "Certificates"), `/app/ngoai-ngu/chung-nhan-cua-toi/${id}`, "award"],
      [L("Xếp hạng", "Leaderboard"), `/app/ngoai-ngu/xep-hang/${id}`, "trophy"],
      [L("Huy hiệu", "Badges"), `/app/ngoai-ngu/huy-hieu/${id}`, "star"],
      [L("Hướng dẫn môn", "Subject guide"), "#tip", "lesson"],
    ];
  })() : [];
  const scopedPanel = `<section class="db-panel">
        <div class="db-ph"><h2><span>${L("Thực hành", "Practice")}</span> <span>${esc(scoped ? trUi(scoped.name) : "")}</span></h2><a href="/app/?mon=${esc(scoped ? scoped.id : "")}">${L("Xem lộ trình", "Course path")} →</a></div>
        <div class="db-tiles db-tiles-big">${scopedLinks.map(([lbl, h, ic]) => `<a class="db-tile" href="${esc(h)}">${sketchIcon(ic)}<span>${esc(lbl)}</span></a>`).join("")}</div>
        <div class="db-sublinks">${scopedSubLinks.map(([lbl, h, ic]) => `<a class="db-sublink" href="${esc(h)}"${h === "#tip" ? " data-tip" : ""}>${sketchIcon(ic)}<span>${esc(lbl)}</span></a>`).join("")}</div>
      </section>`;
  const aiLeft = dash.ai && dash.ai.enabled ? `${dash.ai.remaining ? dash.ai.remaining.day : 0}/${dash.ai.limits ? dash.ai.limits.day : 0}` : null;
  const mem = dash.membership || S.membership || {};
  const isPro = !!mem.pro;
  const aiDayLimit = dash.ai && dash.ai.limits ? dash.ai.limits.day : 0;
  const aiDayLeft = dash.ai && dash.ai.remaining ? dash.ai.remaining.day : 0;
  const proLessons = 0;
  const lockedLevels = [...(lang.courses || [])].reduce((n, c) => n + (c.levels || []).filter((l) => l.locked).length, 0);
  const rep = dash.report || null;
  const trialOnly = isPro && (mem.sources || []).length > 0 && (mem.sources || []).every((x) => ["trial", "daily", "gift"].includes(x.type));
  const daysLeft = mem.expiresAt ? Math.max(0, Math.ceil((new Date(mem.expiresAt) - Date.now()) / 864e5)) : 0;
  const insightCard = insight ? (() => {
    const recentAverage = insight.performance?.recentAverage;
    const sampleExercises = Number(insight.performance?.sampleExercises) || 0;
    const dueVocabulary = Number(insight.vocabulary?.due) || 0;
    const weak = (insight.weaknesses || []).slice(0, 2);
    const watch = (insight.watchSkills || []).slice(0, 2);
    const recommendations = (insight.recommendations || []).slice(0, 3);
    const skillRows = weak.length ? weak : watch;
    return `<section class="hm-insights" aria-labelledby="hmInsightsTitle">
      <header class="hm-insights-head">
        <div><span class="hm-insights-kicker">${L("PHÂN TÍCH HỌC TẬP", "LEARNING ANALYTICS")}</span><h2 id="hmInsightsTitle">${L("AI Learning Insights", "AI Learning Insights")}</h2><p>${L("Nhận xét dựa trên kết quả bài học và lịch ôn thực tế.", "Evidence-based feedback from your exercise results and review schedule.")}</p></div>
        <span class="hm-insights-mark" aria-hidden="true">${sketchIcon("bulb")}</span>
      </header>
      <div class="hm-insights-metrics">
        <div><span>${L("Điểm lần nộp gần đây", "Recent attempt average")}</span><b>${recentAverage == null ? "—" : `${fmtN(recentAverage)}%`}</b><small>${L(`${sampleExercises} bài đã có kết quả`, `${sampleExercises} exercises with results`)}</small></div>
        <div><span>${L("Từ đến hạn ôn", "Words due for review")}</span><b>${fmtN(dueVocabulary)}</b><small>${L(`${fmtN(insight.vocabulary?.tracked || 0)} từ đang theo dõi`, `${fmtN(insight.vocabulary?.tracked || 0)} words tracked`)}</small></div>
        <div><span>${L("Tiến độ môn học", "Course progress")}</span><b>${fmtN(insight.courseProgress?.percent || 0)}%</b><small>${L(`${fmtN(insight.courseProgress?.completed || 0)}/${fmtN(insight.courseProgress?.total || 0)} bài đạt`, `${fmtN(insight.courseProgress?.completed || 0)}/${fmtN(insight.courseProgress?.total || 0)} passed`)}</small></div>
      </div>
      <div class="hm-insights-content">
        <div class="hm-insights-analysis">
          <h3>${L("Điểm cần chú ý", "What to focus on")}</h3>
          ${skillRows.length ? skillRows.map((item) => `<article class="hm-insight-skill"><div><b>${esc(item.title)}</b><strong>${fmtN(item.averageRecent)}%</strong></div><span>${item.status === "needs_review" ? L("Cần ôn thêm", "Needs more practice") : L("Đang theo dõi · chưa đủ bài để kết luận", "Early signal · more results needed")}</span><div class="hm-insight-track"><i style="width:${Math.max(0, Math.min(100, Number(item.averageRecent) || 0))}%"></i></div><small>${L(`${fmtN(item.exerciseCount)} bài · ${fmtN(item.attempts)} lượt làm`, `${fmtN(item.exerciseCount)} exercises · ${fmtN(item.attempts)} attempts`)}</small></article>`).join("") : `<p class="hm-insights-note">${sampleExercises < 3 ? L("Hoàn thành thêm vài bài để LifeRivo có đủ dữ liệu nhận diện kỹ năng cần cải thiện.", "Complete a few more exercises so LifeRivo has enough evidence to identify skills to improve.") : L("Chưa phát hiện nhóm kỹ năng cần ưu tiên ôn dựa trên các bài đã làm.", "No skill area currently needs priority review based on completed exercises.")}</p>`}
          <p class="hm-insights-disclaimer">${esc(insight.dataSufficiency?.message || "")}</p>
        </div>
        <div class="hm-insights-actions">
          <h3>${L("Gợi ý tiếp theo", "Recommended next steps")}</h3>
          ${recommendations.length ? recommendations.map((item, index) => `<a class="hm-insight-action" href="${esc(item.href)}"><span class="hm-insight-order">${index + 1}</span><span><b>${esc(item.title)}</b><small>${esc(item.description)}</small><em>${fmtN(item.estimatedMinutes)} ${L("phút", "min")}</em></span>${icon("right")}</a>`).join("") : `<p class="hm-insights-note">${L("Hãy bắt đầu một bài học để hệ thống có thể đề xuất hoạt động phù hợp.", "Start a lesson so the system can recommend a suitable next activity.")}</p>`}
        </div>
      </div>
    </section>`;
  })() : "";
  const userLv = Math.max(1, Math.floor(doneShown / 8) + 1);
  const pet = petState();
  const starCount = pet.stars;
  const goal = Math.min(20, Math.max(1, Number(S.prefs && S.prefs.dailyGoal) || 3));
  const planLang = (scoped && scoped.id) || (heroSub && heroSub.id) || "en";
  const heroPctShown = scoped ? scoped.pct : (heroSub ? heroSub.pct : 0);
  // Số liệu nhiệm vụ hôm nay, lấy từ máy chủ (chu kỳ 5:00 sáng)
  const lessonsToday = Math.max(pet.daily.lessons, Number(dash.today && dash.today.lessons) || 0);
  const goalPct = Math.min(100, Math.round((lessonsToday / goal) * 100));
  const speaksToday = Number((dash.today && dash.today.speaksByLang || {})[planLang] ?? (dash.today && dash.today.speaks)) || 0;
  const reviewedToday = Number((dash.today && dash.today.reviewsByLang || {})[planLang]) || 0;
  const miniGamesToday = Math.min(3, Number(dash.today && dash.today.miniGames) || 0);

  main.innerHTML = `
  <div class="lh hm${cheer ? " hm-is-cheer" : ""}">
    <section class="hm-chibi-banner" aria-label="${L("Hồ sơ", "Overview")}">
      <div class="hm-cb-left">
        <a class="hm-top-avatar-wrap" href="/app/ca-nhan" data-open-account="mobile" aria-label="${L("Menu tài khoản nhanh", "Quick account menu")}">
          <img class="hm-top-avatar" src="/img/kit/chibi-bunny.webp" width="52" height="52" alt="" loading="lazy" decoding="async">
        </a>
        <div class="hm-cb-copy">
          <div class="hm-cb-row">
            <h1>${L("Chào bạn!", "Hello!")} <span class="hm-wave" aria-hidden="true">👋</span></h1>
            <p class="hm-greet-sub">${heroSub ? L(`Hôm nay luyện ${esc(heroSub.name)} nhé!`, `Let's practice ${esc(trUi(heroSub.name))}!`) : L("Hôm nay luyện ngoại ngữ nhé!", "Let's practice a language today!")}</p>
            <div class="hm-cb-badges">
              ${LevelBadge({ level: userLv, title: scoped ? trUi(scoped.name) : L("Học viên", "Learner") })}
              ${StreakCounter({ days: streak, activeToday: today })}
            </div>
          </div>
          <div class="hm-cb-bar-wrap">
            <span>${scoped ? esc(trUi(scoped.name)) : L("Tiến độ học tập", "Learning progress")}</span>
            ${bar(heroPctShown, "var(--cp-primary-strong, #3F97D3)")}
            <b>${heroPctShown}%</b>
          </div>
        </div>
      </div>
      <div class="hm-cb-right">
        <a class="hm-bell-btn" href="/app/thong-bao" aria-label="${L("Thông báo", "Notifications")}">
          ${lineIcon("bell")}
          <i class="hm-bell-pill${unread > 0 ? " has-unread" : ""}"></i>
        </a>
        <span class="hm-star-pill">⭐ <b>${fmtN(starCount)}</b> <small>SAO</small></span>
        ${scoped ? `<a class="hm-link" href="/app/chon-mon">${L("Đổi môn", "Switch subject")}</a>` : `<a class="hm-link" href="/app/chon-mon">${L("Chọn môn", "Pick subject")}</a>`}
      </div>
    </section>

    <section class="hm-missions-row" aria-label="${L("Nhiệm vụ hằng ngày", "Daily missions")}">
      ${DailyMission({
        title: L("Hoàn thành 1 bài học hôm nay", "Complete 1 lesson today"),
        current: lessonsToday >= 1 ? 1 : 0,
        target: 1,
        href: heroSub ? heroSub.next.href : `/app/ngoai-ngu/${planLang}`,
      })}
      ${DailyMission({
        title: reviewDueShown
          ? L(`Ôn thẻ hôm nay (${reviewDueShown} từ đến hạn)`, `Review flashcards today (${reviewDueShown} due)`)
          : L("Ôn thẻ ghi nhớ hôm nay", "Review flashcards today"),
        current: reviewedToday > 0 ? 1 : 0,
        target: 1,
        href: `/app/ngoai-ngu/on-tap/${esc(planLang)}`,
      })}
      ${DailyMission({
        title: L("Chơi 3 mini game hôm nay", "Play 3 mini games today"),
        current: miniGamesToday,
        target: 3,
        href: `/app/tro-choi/${esc(planLang)}`,
      })}
    </section>

    <section class="hm-goal" aria-label="${L("Mục tiêu hôm nay", "Today's goal")}">
      <div class="hm-goal-main"><span class="hm-goal-k">🎯 ${L("Mục tiêu hôm nay", "Today's goal")}</span><span class="hm-goal-n"><b id="hmGoalDone">${fmtN(lessonsToday)}</b> / <b id="hmGoalTotal">${fmtN(goal)}</b> ${L("bài học", "lessons")}</span></div>
      ${bar(goalPct, "#10B981")}
      <div class="hm-goal-step">
        <button type="button" class="btn btn-sm" data-goal-step="-1" aria-label="${L("Giảm mục tiêu", "Lower goal")}">−</button>
        <button type="button" class="btn btn-sm" data-goal-step="1" aria-label="${L("Tăng mục tiêu", "Raise goal")}">+</button>
      </div>
    </section>
    <div class="hm-studio-grid">
      <section class="hm-plan-card" aria-label="${L("Kế hoạch hôm nay", "Your today's plan")}">
        <div class="hm-plan-head">
          <div>
            <h2>${L("Kế hoạch hôm nay", "Your today's plan")}</h2>
            <p>${heroSub ? esc(heroSub.plain || heroSub.next.label) : L("Chọn 1 hoạt động để bắt đầu ngay!", "Pick one activity to start right away!")}</p>
          </div>
          ${heroSub ? `<a class="hm-plan-go" href="${esc(heroSub.next.href)}">${L("Vào học ngay", "Start lesson")} →</a>` : ""}
        </div>
        <div class="hm-plan-grid">
          <a class="hm-plan-tile tile-sky tile-wide" href="/app/ngoai-ngu/luyen-noi/${esc(planLang)}">
            <div class="hm-pt-copy"><small>${L("Phát âm & Micro", "Speaking studio")}</small><b>${L("Nghe & Luyện nói AI", "Listening & Speaking")}</b><span>${L("Chấm từng từ · Chế độ chậm 0.6x", "Word-by-word score · 0.6x slow")}</span><em class="hm-pt-btn">${L("Bắt đầu", "Start")}</em></div>
            <div class="hm-pt-ico">${sketchIcon("mic")}</div>
          </a>
          <a class="hm-plan-tile tile-pink" href="${heroSub ? esc(heroSub.next.href) : `/app/ngoai-ngu/${esc(planLang)}`}">
            <div class="hm-pt-copy"><small>${L("Từ cơ bản", "Step by step")}</small><b>${L("Bài học & Đọc hiểu", "Lessons & Reading")}</b><em class="hm-pt-btn">${L("Bắt đầu", "Start")}</em></div>
            <div class="hm-pt-ico">${sketchIcon("book")}</div>
          </a>
          <a class="hm-plan-tile tile-violet" href="/app/ngoai-ngu/on-tap/${esc(planLang)}">
            <div class="hm-pt-copy"><small>${L("Nhớ lâu SRS", "Smart memory")}</small><b>${reviewDueShown ? L(`Ôn ${reviewDueShown} từ vựng`, `Review ${reviewDueShown} words`) : L("Học từ vựng", "Learn words")}</b><em class="hm-pt-btn">${L("Bắt đầu", "Start")}</em></div>
            <div class="hm-pt-ico">${sketchIcon("star")}</div>
          </a>
          <a class="hm-plan-tile tile-peach tile-wide" href="/app/ngoai-ngu/luyen-noi/${esc(planLang)}?muc=hoi-thoai">
            <div class="hm-pt-copy"><small>${L("Thực chiến nghề nghiệp", "Career boost")}</small><b>${L("Phỏng vấn AI 30 ngành & Hội thoại", "AI Interviews (30 fields) & Chat")}</b><span>${L("Phản xạ tự nhiên cùng gia sư AI Rivo", "Practice realistic conversations with AI")}</span><em class="hm-pt-btn">${L("Tiếp tục", "Continue")}</em></div>
            <div class="hm-pt-ico">${sketchIcon("briefcase")}</div>
          </a>
        </div>
      </section>

      ${companionCardHtml({ userLv, showStars: false })}
    </div>

    ${heroSub ? `
    <section class="hm-focus" style="--c:${esc(heroSub.color)}">
      <div class="hm-focus-main">
        ${SCRIPT_GLYPH[heroSub.id] ? `<span class="hm-glyph" aria-hidden="true">${SCRIPT_GLYPH[heroSub.id]}</span>` : ""}
        <div class="hm-subject">
          <span class="hm-flag">${heroSub.flag}</span>
          <div>
            <p class="hm-status">${heroSub.started ? L("Đang học", "In progress") : L("Chưa bắt đầu", "Not started")}</p>
            <h2 class="hm-subject-name">${esc(trUi(heroSub.name))}</h2>
          </div>
        </div>
        <p class="hm-focus-text">${esc(heroSub.plain || heroSub.next.label)}</p>
        <div class="hm-progress">
          <div class="hm-progress-top"><span>${fmtN(heroSub.done)} / ${fmtN(heroSub.total)} ${L("bài đã đạt", "exercises passed")}</span><b>${heroSub.pct}%</b></div>
          ${bar(heroSub.pct, heroSub.color)}
        </div>
        <div class="hm-cta">
          <a class="hm-btn hm-btn-primary" href="${esc(heroSub.next.href)}">${sketchIcon("play")}<span>${L("Học tiếp", "Continue")}</span></a>
          <a class="hm-btn" href="/app/?mon=${esc(heroSub.id)}">${L("Xem lộ trình", "Course path")}</a>
        </div>
      </div>
      <aside class="hm-streak ${today ? "on" : ""}" aria-label="${L("Chuỗi ngày học", "Study streak")}">
        <div class="hm-streak-num"><span class="hm-fire" aria-hidden="true">🔥</span><b>${fmtN(streak)}</b></div>
        <p class="hm-streak-label">${L("ngày học liên tiếp", "day streak")}</p>
        <p class="hm-streak-msg">${today ? L("Hôm nay bạn đã học. Làm thêm một bài để nhớ lâu hơn.", "You studied today. One more exercise helps it stick.") : L("Hôm nay bạn chưa học. Một bài ngắn là đủ giữ chuỗi.", "You have not studied today. One short exercise keeps the streak.")}</p>
        <div class="hm-week">${week.map((w) => `<span class="${w.n ? "on" : ""} ${w.iso === todayStr ? "now" : ""}" title="${esc(w.iso)}: ${w.n}"><i></i><em>${esc(w.label)}</em></span>`).join("")}</div>
        <p class="hm-foot">${L(`${activeDays}/7 ngày có học, dài nhất ${longest} ngày`, `${activeDays}/7 active days, longest ${longest} days`)}</p>
      </aside>
    </section>` : `
    <section class="hm-focus hm-focus-empty">
      <div class="hm-focus-main">
        <p class="hm-status">${L("Bước đầu tiên", "First step")}</p>
        <h2 class="hm-subject-name">${L("Chọn một ngoại ngữ và làm bài đầu tiên", "Pick a language and do the first lesson")}</h2>
        <p class="hm-focus-text">${L("Một bài khoảng 10 phút: lý thuyết ngắn, làm bài, biết đúng hay sai ngay.", "About 10 minutes: a short explanation, one exercise, and right or wrong straight away.")}</p>
        <div class="hm-choices">${langStarts.map((c) => `
          <a class="hm-choice" href="${esc(c.href)}"><span class="hm-choice-flag">${c.flag}</span><span class="hm-choice-text"><b>${esc(c.name)}</b><small>${esc(c.meta || L("Từ vựng, phát âm, nói và AI", "Vocabulary, speaking and AI"))}</small></span></a>`).join("")}
        </div>
      </div>
    </section>`}

    ${insightCard}

    <nav class="hm-quick" aria-label="${L("Học nhanh", "Quick actions")}">
      ${(scoped ? scopedLinks : [
        [L("Chọn môn", "Choose a subject"), "/app/chon-mon", "book"],
        [reviewDue ? L(`Ôn ${reviewDue} từ`, `Review ${reviewDue} words`) : L("Ôn từ", "Review words"), reviews[0] ? `/app/ngoai-ngu/on-tap/${reviews[0].id}` : "/app/ngoai-ngu/on-tap/en", "history"],
        [L("Phỏng vấn AI", "AI interview"), "/app/phong-van", "user"],
        [unread ? L(`Thông báo (${unread > 99 ? "99+" : unread})`, `Notifications (${unread > 99 ? "99+" : unread})`) : L("Thông báo", "Notifications"), "/app/thong-bao", "bell"],
      ]).map(([lbl, h, ic]) => `<a class="hm-quick-tile" href="${esc(h)}">${sketchIcon(ic)}<span>${esc(lbl)}</span></a>`).join("")}
    </nav>

    <div class="hm-cols">
      <section class="hm-card" aria-labelledby="hmTodoTitle">
        <header class="hm-card-head">
          <h2 id="hmTodoTitle">${L("Việc cần làm", "To do")}</h2>
          <a class="hm-link" href="/app/thong-bao">${L("Thông báo", "Notifications")}${unread ? ` (${unread > 99 ? "99+" : unread})` : ""}</a>
        </header>
        ${todo.length ? `<div class="hm-todos">${todo.join("")}</div>` : `<div class="hm-empty">${sketchIcon("check")}<b>${L("Không có việc đến hạn", "Nothing due")}</b><span>${L("Bài giao của lớp và từ vựng cần ôn sẽ hiện ở đây.", "Assignments and words to review will show here.")}</span></div>`}
        ${dash.ai && dash.ai.enabled ? `<a class="hm-ai" href="${scoped ? `/app/ngoai-ngu/tro-chuyen/${esc(scoped.id)}` : "/app/ai"}">${sketchIcon("sparkle")}<span class="hm-ai-text"><b>${L("Hỏi gia sư AI", "Ask the Rivo")}</b><small>${dash.ai.allowed === false ? esc(dash.ai.reason || "") : esc(L(`Còn ${aiLeft || 0} lượt hôm nay`, `${aiLeft || 0} questions left today`))}</small></span></a>` : ""}
      </section>

      <section class="hm-card" aria-labelledby="hmStatsTitle">
        <header class="hm-card-head">
          <h2 id="hmStatsTitle">${L("Tiến độ", "Progress")}</h2>
        </header>
        <dl class="hm-stats">
          <div><dt>${L("bài đã đạt", "exercises passed")}</dt><dd>${fmtN(doneShown)}</dd></div>
          ${scoped ? `<div><dt>${L("tiến độ môn", "subject progress")}</dt><dd>${scoped.pct}%</dd></div>` : `<div><dt>${L("môn đang học", "subjects in progress")}</dt><dd>${started.length}</dd></div>`}
          <div><dt>${L("từ cần ôn hôm nay", "words to review today")}</dt><dd>${fmtN(reviewDueShown)}</dd></div>
          <div><dt>${L("bài đã nộp trong 7 ngày", "submissions in 7 days")}</dt><dd>${fmtN(weekTotal)}</dd></div>
        </dl>
      </section>
    </div>

    ${scoped ? `
    <section class="hm-card" aria-labelledby="hmSubjectTitle">
      <header class="hm-card-head">
        <h2 id="hmSubjectTitle">${L("Luyện thêm", "Practice more")}</h2>
        <a class="hm-link" href="/app/?mon=${esc(scoped.id)}">${L("Xem lộ trình", "Course path")}</a>
      </header>
      <div class="hm-links">${scopedSubLinks.map(([lbl, h, ic]) => `<a class="hm-link-row" href="${esc(h)}"${h === "#tip" ? " data-tip" : ""}>${icon(ic)}<span>${esc(lbl)}</span></a>`).join("")}</div>
    </section>` : `
    <section class="hm-card" aria-labelledby="hmSubjectsTitle">
      <header class="hm-card-head">
        <h2 id="hmSubjectsTitle">${L("Môn của bạn", "Your subjects")}</h2>
      </header>
      ${started.length ? `<div class="hm-subjects">${started.map((s) => `
        <a class="hm-subject-row" href="${esc(s.next.href)}">${flag(s)}<span class="hm-subject-info"><b>${esc(s.name)}</b><small>${esc(s.plain || s.next.label)}</small></span><span class="hm-subject-pct">${bar(s.pct, s.color)}<em>${s.pct}%</em></span></a>`).join("")}</div>`
        : emptyState("book", L("Bạn chưa bắt đầu môn nào", "No subject started yet"), L("Chọn một môn bên dưới để bắt đầu.", "Pick a subject below to begin."))}
      ${fresh.length ? `<div class="hm-more"><h3>${L("Có thể bạn muốn học", "You might like")}</h3><div class="hm-chips">${fresh.slice(0, 9).map((s) => `<a class="hm-chip" href="${esc(s.next.href)}">${flag(s, "sm")}<span>${esc(s.name.replace(/^(Tiếng) /, ""))}</span></a>`).join("")}</div></div>` : ""}
    </section>

    <section class="hm-card hm-pro ${isPro ? "on" : ""}" aria-labelledby="hmProTitle">
      <header class="hm-card-head hm-pro-head">
        <div>
          <span class="hm-badge">${trialOnly ? L("Dùng thử", "Trial") : "Pro"}</span>
          <h2 id="hmProTitle">${isPro ? (trialOnly ? L("Bạn đang dùng thử Pro", "You are on a Pro trial") : L("Bạn đang dùng gói Pro", "You are on Pro")) : L("Mở thêm với gói Pro", "Unlock more with Pro")}</h2>
          <p class="hm-pro-text">${isPro
            ? (mem.expiresAt ? L(`Còn ${daysLeft} ngày, đến ${esc(fmtDate(mem.expiresAt))}.`, `${daysLeft} days left, until ${esc(fmtDate(mem.expiresAt))}.`) : L("Không có ngày hết hạn.", "No end date."))
            : L("Gói miễn phí vẫn học đầy đủ bài cơ bản. Pro thêm lượt hỏi AI, nhận xét phỏng vấn và báo cáo.", "The free plan keeps all basic lessons. Pro adds more AI questions, interview feedback and reports.")}</p>
        </div>
        ${!isPro || trialOnly ? `<a class="hm-btn hm-btn-primary" href="/app/bang-gia">${isPro ? L("Giữ Pro", "Keep Pro") : L("Xem gói Pro", "See Pro plans")}</a>` : ""}
      </header>
      <ul class="hm-pro-list">
        <li class="${isPro ? "ok" : "lock"}">
          <b>${L("Báo cáo học tập chi tiết", "Detailed learning report")}</b>
          <span>${isPro && rep ? L(`Tỉ lệ đạt ${fmtN(rep.passRate)}%, ${fmtN(rep.submissions)} lần nộp`, `Pass rate ${fmtN(rep.passRate)}%, ${fmtN(rep.submissions)} submissions`) : L("Tỉ lệ đạt từng bài và các bài đang kẹt", "Pass rate per exercise and stuck exercises")}</span>
          ${isPro ? `<a href="/app/mon-hoc">${L("Mở tiến độ", "Open progress")}</a>` : `<a href="/app/bang-gia">${icon("lock")}${L("Pro", "Pro")}</a>`}
        </li>
        <li class="${isPro ? "ok" : "lock"}">
          <b>${L("Trợ lý AI", "Rivo")}</b>
          <span>${isPro ? L(`${fmtN(aiDayLeft)}/${fmtN(aiDayLimit)} lượt hỏi còn lại hôm nay`, `${fmtN(aiDayLeft)}/${fmtN(aiDayLimit)} questions left today`) : L(`${fmtN(aiDayLimit)} lượt mỗi ngày ở gói miễn phí`, `${fmtN(aiDayLimit)} questions a day on the free plan`)}</span>
          ${isPro ? `<a href="/app/ai">${L("Hỏi AI", "Ask AI")}</a>` : `<a href="/app/bang-gia">${icon("lock")}${L("Nhiều lượt hơn", "More questions")}</a>`}
        </li>
        <li class="${isPro ? "ok" : "lock"}">
          <b>${L("Phỏng vấn có nhận xét AI", "Interviews with AI feedback")}</b>
          <span>${isPro ? L("Nói câu trả lời trước, rồi xin AI nhận xét.", "Answer out loud first, then get AI feedback.") : L("Gói miễn phí tự luyện và xem câu mẫu.", "The free plan practices and shows sample answers.")}</span>
          ${isPro ? `<a href="/app/phong-van">${L("Vào phỏng vấn", "Go to interviews")}</a>` : `<a href="/app/bang-gia">${icon("lock")}${L("Pro", "Pro")}</a>`}
        </li>
        <li class="${(isPro || lockedLevels + proLessons === 0) ? "ok" : "lock"}">
          <b>${L("Mở đủ bài và cấp", "Full course access")}</b>
          <span>${isPro ? L("Mở đủ các cấp, kể cả cấp nâng cao.", "All levels open, including the advanced ones.") : (lockedLevels + proLessons ? L(`${fmtN(lockedLevels + proLessons)} cấp và bài đang khóa`, `${fmtN(lockedLevels + proLessons)} levels and lessons locked`) : L("Chưa có cấp nào bị khóa.", "No level is locked right now."))}</span>
          ${(!isPro && lockedLevels + proLessons) ? `<a href="/app/bang-gia">${icon("lock")}${L("Pro", "Pro")}</a>` : ""}
        </li>
      </ul>
    </section>`}

    ${scoped ? "" : `<div class="lh-explore" id="lhExplore"></div>`}
  </div>`;
  // Thứ tự tổng quan (không áp dụng cho trang Cổ Vũ): chào → môn đang học + "Tiếp tục học" → kế hoạch hôm nay
  // → bài đang dở → từ cần ôn → thống kê → gợi ý gia sư AI. Các khối còn lại đứng sau.
  // Nội dung các khối cũ giữ nguyên, chỉ được sắp lại; các khối tóm tắt mới lấy từ dữ liệu đã tải ở trên.
  function arrangeDashboard() {
    const root = main.querySelector(".lh.hm");
    if (!root) return;
    const nodes = (html) => { const w = document.createElement("div"); w.innerHTML = html; return [...w.children]; };
    const take = (sel) => { const el = root.querySelector(sel); return el ? [el] : []; };
    const goalMeta = goalById(S.prefs && S.prefs.goalPath);
    const nx = heroSub ? heroSub.nextEx : null;
    const passScore = Number(lang.pass) || 80;
    root.querySelector(".hm-cb-bar-wrap")?.remove(); // tiến độ đã hiện ở khối môn đang học
    const focusEl = root.querySelector(".hm-focus:not(.hm-focus-empty)");
    if (focusEl) { focusEl.querySelector(":scope > .hm-focus-main")?.remove(); focusEl.classList.add("hm-focus-streak"); }
    const todoEl = root.querySelector('section[aria-labelledby="hmTodoTitle"]');
    todoEl?.querySelector(".hm-ai")?.remove(); // gợi ý AI đã có khối riêng bên dưới
    const statsEl = root.querySelector('section[aria-labelledby="hmStatsTitle"]');
    const cols = root.querySelector(".hm-cols");
    // Điện thoại theo ảnh mẫu: thẻ "Mục tiêu hằng ngày" và "Khóa học" ngay dưới lời chào; số liệu lấy từ dữ liệu thật
    const banner = root.querySelector(".hm-chibi-banner");
    if (banner) {
      const dailyHtml = `<section class="hm-daily hm-phone-only" aria-labelledby="hmDailyTitle">
        <div class="hm-daily-head"><h2 id="hmDailyTitle">${L("Mục tiêu hằng ngày", "Daily goal")}</h2><span class="hm-daily-streak" aria-label="${L("Chuỗi ngày", "Streak")}">🔥 ${fmtN(streak)}</span></div>
        <div class="hm-daily-row"><b>${fmtN(lessonsToday)} ${L("bài hôm nay", "lessons today")}</b><span>${fmtN(lessonsToday)} / ${fmtN(goal)} ${L("bài", "lessons")}</span></div>
        <div class="hm-daily-bar" role="progressbar" aria-label="${L("Tiến độ mục tiêu", "Goal progress")}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${goalPct}"><i style="width:${goalPct}%"></i></div>
        <div class="hm-week">${week.map((w) => `<span class="${w.n ? "on" : ""} ${w.iso === todayStr ? "now" : ""}" title="${esc(w.iso)}: ${w.n}"><i></i><em>${esc(w.label)}</em></span>`).join("")}</div>
      </section>`;
      const rowsHtml = started.slice(0, 4).map((c) => `<a class="hm-course-row" href="/app/ngoai-ngu/${esc(c.id)}" style="--c:${esc(c.color)}">
          <span class="hm-course-flag" aria-hidden="true">${c.flag}</span>
          <span class="hm-course-t"><b>${esc(c.name)}</b><small>${c.done}/${c.total} ${L("bài", "lessons")} · ${c.pct}%</small></span>
          <span class="hm-course-go" aria-hidden="true">›</span>
        </a>`).join("");
      const coursesHtml = `<section class="hm-courses hm-phone-only" aria-labelledby="hmCoursesTitle">
        <div class="hm-courses-head"><h2 id="hmCoursesTitle">${L("Khóa học", "Courses")}</h2><a class="hm-courses-add" href="/app/chon-mon">+ ${L("Thêm", "Add new")}</a></div>
        ${rowsHtml || `<p class="hm-courses-empty">${L("Chưa có khóa học nào. Chọn một môn để bắt đầu.", "No courses yet. Pick a subject to start.")}</p>`}
      </section>`;
      // Số liệu học tập thật của môn đang học: bài đã đạt, từ đã thuộc, đến hạn ôn, chuỗi ngày
      const kc = heroSub ? (lang.courses || []).find((c) => c.id === heroSub.id) : null;
      const kw = kc ? wordStats(kc, lang.pass || 80) : null;
      const kpiTiles = [
        { v: heroSub ? `${fmtN(heroSub.done)}/${fmtN(heroSub.total)}` : "0", l: L("Bài đã đạt", "Lessons passed") },
        { v: kw ? `${fmtN(kw.known)}/${fmtN(kw.total)}` : "0", l: L("Từ đã thuộc", "Words learned") },
        { v: fmtN(reviewDueShown), l: L("Đến hạn ôn", "Due for review") },
        { v: fmtN(streak), l: L("Ngày liên tiếp", "Day streak") },
      ];
      const kpisHtml = `<section class="hm-kpis hm-phone-only" aria-label="${L("Số liệu học tập", "Learning stats")}">${kpiTiles.map((t) => `<div class="hm-kpi"><b>${t.v}</b><span>${t.l}</span></div>`).join("")}</section>`;
      banner.after(...nodes(dailyHtml), ...nodes(coursesHtml), ...nodes(kpisHtml));
    }

    // Nhãn trạng thái theo tỷ lệ bài đã đạt thật của môn (không phải đánh giá giả)
    const statusWord = (pct) => pct >= 80 ? L("Học tập rất tốt!", "Doing great!")
      : pct >= 40 ? L("Học tập rất tốt!", "Making great progress!")
      : pct > 0 ? L("Khởi đầu rất tốt!", "Great start!")
      : L("Bắt đầu hôm nay!", "Start today!");
    // Vòng tiến độ của môn đang học (tỷ lệ bài đã đạt thật từ /api/lang)
    const ringHtml = heroSub ? (() => {
      const C = 2 * Math.PI * 30;
      const pctVal = Math.max(0, Math.min(100, Number(heroSub.pct) || 0));
      return `<div class="hm-ring" style="--c:#3F97D3" role="img" aria-label="${L("Tiến độ", "Progress")} ${pctVal}%"><svg viewBox="0 0 76 76" width="76" height="76" aria-hidden="true"><circle cx="38" cy="38" r="30" fill="none" stroke="#E6EEF6" stroke-width="7.5"/><circle cx="38" cy="38" r="30" fill="none" stroke="#3F97D3" stroke-width="7.5" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pctVal / 100)).toFixed(1)}" transform="rotate(-90 38 38)"/></svg><b>${pctVal}%</b></div>`;
    })() : "";
    // Bốn loại bài trong mục "Bài học của bạn": đếm trên các bài thật của môn đang học (cấp không bị khóa)
    const passScoreSkills = Number(lang.pass) || 80;
    const SKILL_TYPES = [
      { kind: "noi", title: L("Phát âm", "Pronunciation"), sub: L("Âm thanh, phát âm", "Sounds, pronunciation"), color: "#8B3DFF", kit: "/img/kit/chibi-owl.webp" },
      { kind: "ngu-phap", title: L("Ngữ pháp", "Grammar"), sub: L("Cấu trúc câu", "Sentence structure"), color: "#EA6A00", kit: "/img/kit/chibi-fox.webp" },
      { kind: "doc", title: L("Đọc hiểu", "Reading"), sub: L("Đọc và hiểu", "Read and understand"), color: "#55A600", kit: "/img/kit/chibi-frog.webp" },
      { kind: "nghia", title: L("Từ vựng", "Vocabulary"), sub: L("Từ và ý nghĩa", "Words and meanings"), color: "#E52B77", kit: "/img/kit/chibi-cat.webp" },
    ];
    const skillExercises = heroSub ? heroSub.levels.filter((l) => !l.locked).flatMap((l) => l.units.flatMap((u) => u.exercises)) : [];
    const skillStat = (kind) => {
      const list = skillExercises.filter((e) => e.kind === kind);
      const done = list.filter((e) => (e.best || 0) >= passScoreSkills).length;
      return { total: list.length, done, pct: list.length ? Math.round((done / list.length) * 100) : 0, next: list.find((e) => (e.best || 0) < passScoreSkills) || null };
    };
    const skillsBlock = heroSub ? `
      <section class="hm-skills" aria-labelledby="hmSkillsTitle">
        <div class="hm-skills-head"><h2 id="hmSkillsTitle">${L("Bài học của bạn", "Your lessons")}</h2><a class="hm-link" href="/app/ngoai-ngu/${esc(heroSub.id)}">${L("Xem tất cả", "View all")} →</a></div>
        <div class="hm-skills-grid">${SKILL_TYPES.map((s) => {
          const st = skillStat(s.kind);
          const href = st.next ? `/app/ngoai-ngu/bai/${esc(st.next.id)}` : (s.kind === "noi" ? `/app/ngoai-ngu/luyen-noi/${esc(heroSub.id)}` : `/app/ngoai-ngu/${esc(heroSub.id)}`);
          return `<a class="hm-skill" href="${href}" style="--k:${s.color}">
            <span class="hm-skill-band"><img class="hm-skill-mascot" src="${s.kit}" width="84" height="84" alt="" loading="lazy" decoding="async"></span>
            <span class="hm-skill-body"><b>${esc(s.title)}</b><small>${esc(s.sub)}</small>
              <span class="hm-skill-bar"><i style="width:${st.pct}%"></i></span>
              <span class="hm-skill-foot"><span>${st.total ? `${fmtN(st.done)}/${fmtN(st.total)} ${L("bài", "lessons")}` : L("Chưa có bài", "No lessons yet")}</span><b>${st.pct}%</b></span>
            </span>
          </a>`;
        }).join("")}</div>
      </section>` : "";
    const langStripHtml = (lang.courses || []).length ? `
      <nav class="hm-lang-strip" aria-label="${L("Chuyển nhanh ngoại ngữ", "Quick language switch")}">
        ${(lang.courses || []).map((c) => {
          const isCur = heroSub && c.id === heroSub.id;
          return `<a class="hm-lang-chip${isCur ? " on" : ""}" href="/app/${esc(c.id)}">
            <span class="hm-lang-chip-flag">${c.flag}</span>
            <b>${esc(c.name.replace(/^Tiếng\s+/i, ""))}</b>
            <em>${c.pct || 0}%</em>
          </a>`;
        }).join("")}
        <a class="hm-lang-chip hm-lang-chip-more" href="/app/chon-mon">+ ${L("Tất cả", "All")}</a>
      </nav>` : "";

    const step1Done = lessonsToday >= 1;
    const step2Done = speaksToday >= 1 || lessonsToday >= 2;
    const step3Done = reviewedToday > 0 || lessonsToday >= 3;
    const dailyStepsHtml = heroSub ? `
      <div class="hm-daily-steps">
        <a class="hm-step-chip${step1Done ? " is-done" : " is-active"}" href="${esc(heroSub.next.href)}">
          <span class="hm-step-ic is-blue">${step1Done ? "✓" : "📘"}</span>
          <div class="hm-step-copy">
            <b>${L("1. Học bài mới", "1. Next lesson")}</b>
            <small>${esc(nx ? (nx.u?.title || nx.title || L("Mở bài học", "Open lesson")) : L("Tiếp tục lộ trình", "Continue path"))}</small>
          </div>
          <span class="hm-step-tag">${step1Done ? L("Xong", "Done") : L("Học ngay", "Start")}</span>
        </a>
        <a class="hm-step-chip${step2Done ? " is-done" : ""}" href="/app/ngoai-ngu/luyen-noi/${esc(heroSub.id)}">
          <span class="hm-step-ic is-purple">${step2Done ? "✓" : "🎙️"}</span>
          <div class="hm-step-copy">
            <b>${L("2. Luyện phát âm AI", "2. AI Speaking")}</b>
            <small>${L("Nghe mẫu 0.6x & chấm từng từ", "0.6x audio & word scoring")}</small>
          </div>
          <span class="hm-step-tag">${step2Done ? L("Xong", "Done") : L("5 phút", "5 min")}</span>
        </a>
        <a class="hm-step-chip${step3Done ? " is-done" : ""}" href="/app/ngoai-ngu/on-tap/${esc(heroSub.id)}">
          <span class="hm-step-ic is-green">${step3Done ? "✓" : "🃏"}</span>
          <div class="hm-step-copy">
            <b>${L("3. Ôn tập từ vựng SRS", "3. SRS Review")}</b>
            <small>${reviewDueShown ? L(`${fmtN(reviewDueShown)} từ đến hạn cần ôn`, `${fmtN(reviewDueShown)} words due`) : L("Ghi nhớ từ vựng dài hạn", "Long-term retention")}</small>
          </div>
          <span class="hm-step-tag">${reviewDueShown ? `${fmtN(reviewDueShown)} từ` : "SRS"}</span>
        </a>
      </div>` : "";

    const exploreToolsHtml = heroSub ? `
      <section class="hm-explore-tools" aria-label="${L("Công cụ học tập trực quan", "Interactive learning tools")}">
        <div class="hm-skills-head">
          <h2>${L("Khám phá & Luyện tập nhanh", "Quick Practice & Tools")}</h2>
          <a class="hm-link" href="/app/lo-trinh">${L("Lộ trình 4 bước", "4-step path")} →</a>
        </div>
        <div class="hm-tools-grid">
          <a class="hm-tool-card is-sky" href="/app/ngoai-ngu/tro-chuyen/${esc(heroSub.id)}">
            <img class="hm-tool-chibi" src="/img/kit/chibi-owl.webp" alt="" width="48" height="48" loading="lazy" />
            <div class="hm-tool-copy"><b>${L("Hội thoại AI", "AI Conversation")}</b><small>${L("Nhập vai 2 chiều & sửa lỗi câu", "Roleplay & instant correction")}</small></div>
          </a>
          <a class="hm-tool-card is-lavender" href="/app/tro-choi/${esc(heroSub.id)}">
            <img class="hm-tool-chibi" src="/img/kit/chibi-bunny.webp" alt="" width="48" height="48" loading="lazy" />
            <div class="hm-tool-copy"><b>${L("Trò chơi học tập", "Mini Games")}</b><small>${L("9 trò chơi rèn phản xạ từ vựng", "9 vocabulary arcade games")}</small></div>
          </a>
          <a class="hm-tool-card is-peach" href="/app/phong-van/${esc(heroSub.id)}">
            <img class="hm-tool-chibi" src="/img/kit/chibi-fox.webp" alt="" width="48" height="48" loading="lazy" />
            <div class="hm-tool-copy"><b>${L("Phỏng vấn 30 ngành", "Job Interview")}</b><small>${L("Luyện trả lời phỏng vấn chuyên sâu", "30 industry interview tracks")}</small></div>
          </a>
          <a class="hm-tool-card is-mint" href="/app/so-tay">
            <img class="hm-tool-chibi" src="/img/kit/chibi-frog.webp" alt="" width="48" height="48" loading="lazy" />
            <div class="hm-tool-copy"><b>${L("Sổ tay từ vựng", "Vocabulary Notebook")}</b><small>${L("Từ đã lưu, phát âm & ghi chú", "Saved words & personal notes")}</small></div>
          </a>
          <a class="hm-tool-card is-pink" href="/app/ngoai-ngu/huy-hieu/${esc(heroSub.id)}">
            <img class="hm-tool-chibi" src="/img/kit/chibi-cat.webp" alt="" width="48" height="48" loading="lazy" />
            <div class="hm-tool-copy"><b>${L("Huy hiệu & Xếp hạng", "Badges & Rank")}</b><small>${L("Chứng nhận cấp độ & bảng vàng", "Certificates & leaderboard")}</small></div>
          </a>
          <a class="hm-tool-card is-gold" href="${heroSub.id === "en" ? "/app/toeic" : ["zh", "ja", "ko"].includes(heroSub.id) ? `/app/ngoai-ngu/luyen-viet/${esc(heroSub.id)}/${esc((heroSub.levels[0] || {}).id || "hsk1")}` : `/app/co-vu`}">
            <img class="hm-tool-chibi" src="/img/kit/chibi-dragon.webp" alt="" width="48" height="48" loading="lazy" />
            <div class="hm-tool-copy"><b>${heroSub.id === "en" ? L("Luyện thi TOEIC", "TOEIC Center") : ["zh", "ja", "ko"].includes(heroSub.id) ? L("Luyện viết chữ", "Handwriting") : L("Cổ vũ & Kế hoạch", "Daily Focus")}</b><small>${heroSub.id === "en" ? L("7 Part · Đề thi thử 120 phút", "7 Parts & mock tests") : ["zh", "ja", "ko"].includes(heroSub.id) ? L("Tô nét chữ & chấm độ khớp", "Stroke tracing canvas") : L("Theo dõi chuỗi ngày học", "Track your weekly streak")}</small></div>
          </a>
        </div>
      </section>` : "";

    const overviewKpisHtml = heroSub ? `
      <nav class="hm-m-overview-kpis" aria-label="${L("Tổng quan nhanh", "Quick stats")}">
        <a class="hm-ov-kpi is-orange" href="/app/co-vu"><b>🔥 ${fmtN(streak)}</b><span>${L("Chuỗi ngày", "Streak")}</span></a>
        <a class="hm-ov-kpi is-blue" href="/app/ngoai-ngu/${esc(heroSub.id)}"><b>${fmtN(heroSub.done)}/${fmtN(heroSub.total)}</b><span>${L("Bài đạt", "Passed")}</span></a>
        <a class="hm-ov-kpi is-green" href="/app/ngoai-ngu/on-tap/${esc(heroSub.id)}"><b>${fmtN(reviewDueShown)}</b><span>${L("Cần ôn", "Due")}</span></a>
        <a class="hm-ov-kpi is-gold" href="/app/ngoai-ngu/huy-hieu/${esc(heroSub.id)}"><b>⭐ ${fmtN(starCount)}</b><span>${L("Điểm sao", "Stars")}</span></a>
      </nav>` : "";

    const current = heroSub ? `
      <section class="hm-current" style="--c:${esc(heroSub.color)}" aria-label="${L("Môn đang học", "Current language")}">
        <div class="hm-current-head">
          ${ringHtml}
          <span class="hm-flag" style="--c:${esc(heroSub.color)}">${heroSub.flag}</span>
          <div class="hm-current-title">
            <h2 class="hm-status-title">${statusWord(heroSub.pct)}</h2>
            <p class="hm-current-today">${L("Hôm nay đã hoàn thành", "Completed today")} <b>${fmtN(lessonsToday)} ${L("nhiệm vụ", "tasks")}</b></p>
            <p class="hm-current-goal-sub">${L("Mục tiêu ngày", "Daily goal")} · ${fmtN(lessonsToday)}/${fmtN(goal)} ${L("bước", "steps")} · ${fmtN(heroSub.done)}/${fmtN(heroSub.total)} ${L("bài đạt", "passed")}</p>
          </div>
        </div>
        ${dailyStepsHtml}
      </section>
      <div class="hm-primary-row">
        <a class="hm-btn hm-btn-primary hm-continue" href="${esc(heroSub.next.href)}">${sketchIcon("play")}<span>${L("Tiếp tục học", "Continue learning")}</span></a>
        <a class="hm-btn" href="/app/lo-trinh">${L("Xem lộ trình", "Course path")}</a>
      </div>` : "";

    const unfinished = !heroSub ? "" : `
      <section class="hm-card hm-next-card" aria-labelledby="hmNextTitle">
        <header class="hm-card-head"><h2 id="hmNextTitle">${L("Bài đang học dở", "Unfinished lesson")}</h2></header>
        ${nx && nx.attempts > 0 ? `<a class="hm-next-row" href="/app/ngoai-ngu/bai/${esc(nx.id)}">
            <span class="hm-next-body"><b>${esc(nx.kindTitle || nx.title || "")}</b><small>${esc(nx.l.title)} · ${esc(nx.u.title)}</small></span>
            <span class="tag tag-cam">${L(`Điểm cao nhất ${fmtN(nx.best || 0)}/${fmtN(passScore)}`, `Best ${fmtN(nx.best || 0)}/${fmtN(passScore)}`)}</span>
          </a>`
          : nx ? `<p class="hm-empty-line">${L("Chưa có bài dở. Bài tiếp theo:", "No unfinished lesson. Up next:")} <a class="hm-link" href="${esc(heroSub.next.href)}">${esc(nx.kindTitle || nx.title || "")}</a></p>`
          : `<p class="hm-empty-line">${L("Bạn đã đạt hết bài của môn này.", "You have passed every lesson in this subject.")}</p>`}
      </section>`;

    const dueNow = reviewDueShown;
    const tracked = heroSub && heroSub.review ? heroSub.review.total : 0;
    const reviewCard = !heroSub ? "" : `
      <section class="hm-card hm-review-card" aria-labelledby="hmReviewTitle">
        <header class="hm-card-head"><h2 id="hmReviewTitle">${L("Từ cần ôn", "Words due for review")}</h2></header>
        <div class="hm-review-row">
          <div class="hm-review-num"><b>${fmtN(dueNow)}</b><span>${L("từ đến hạn", "due now")}</span></div>
          <div class="hm-review-body">
            <p>${dueNow ? L(`Ôn đúng hạn giúp nhớ lâu hơn. Đang theo dõi ${fmtN(tracked)} từ của môn này.`, `Reviewing on time helps you remember longer. Tracking ${fmtN(tracked)} words in this subject.`) : L(`Chưa có từ đến hạn. Đang theo dõi ${fmtN(tracked)} từ của môn này.`, `No words due right now. Tracking ${fmtN(tracked)} words in this subject.`)}</p>
            <a class="hm-btn${dueNow ? " hm-btn-primary" : ""}" href="/app/ngoai-ngu/on-tap/${esc(heroSub.id)}">${dueNow ? L("Ôn ngay", "Review now") : L("Mở ôn tập", "Open review")}</a>
          </div>
        </div>
      </section>`;

    const aiLine = dash.ai && dash.ai.enabled ? L(`Còn ${aiLeft || 0} lượt hôm nay`, `${aiLeft || 0} questions left today`) : (dash.ai && dash.ai.reason ? dash.ai.reason : "");
    const aiTip = nx && nx.attempts > 0 ? L(`Nhờ gia sư giải thích lại “${nx.kindTitle || nx.title || ""}” trước khi làm lại.`, `Ask the tutor to explain “${nx.kindTitle || nx.title || ""}” before you retry it.`)
      : dueNow ? L("Trò chuyện ngắn với gia sư và dùng các từ đến hạn ôn trong câu.", "Chat briefly with the tutor and use today's due words in your sentences.")
      : L("Trò chuyện ngắn với gia sư để luyện phản xạ nói.", "Chat briefly with the tutor to build speaking reflexes.");
    const aiCard = `
      <section class="hm-card hm-ai-card" aria-labelledby="hmAiTitle">
        <header class="hm-card-head"><h2 id="hmAiTitle">${L("Gợi ý từ gia sư AI", "Tip from your AI tutor")}</h2></header>
        <p class="hm-ai-tip">${esc(aiTip)}</p>
        <div class="hm-ai-foot"><small>${esc(aiLine)}</small><a class="hm-btn hm-btn-primary" href="${heroSub ? `/app/ngoai-ngu/tro-chuyen/${esc(heroSub.id)}` : "/app/ai"}">${L("Hỏi gia sư AI", "Ask the AI tutor")}</a></div>
      </section>`;

    const pickOverviewHtml = (!scoped || started.length === 0) ? `
      <section class="hm-pick-overview" aria-label="${L("Chọn ngoại ngữ để bắt đầu", "Choose a language to start")}">
        <div class="hm-skills-head">
          <h2>${L("Chọn ngoại ngữ để bắt đầu", "Choose a language to start")}</h2>
          <a class="hm-link" href="/app/chon-mon">${L("Hướng dẫn lộ trình", "Roadmap guide")} →</a>
        </div>
        <div class="hm-pick-grid">${subjects.map((c) => `
          <a class="hm-pick-card" href="/app/${esc(c.id)}" style="--c:${esc(c.color || "#3F97D3")}">
            <div class="hm-pick-top">
              <span class="hm-flag">${c.flag}</span>
              <span class="hm-pick-pct">${c.pct || 0}%</span>
            </div>
            <b>${esc(trUi(c.name))}</b>
            <small>${esc(c.framework || "CEFR")} · ${fmtN(c.done)}/${fmtN(c.total)} ${L("bài", "lessons")}</small>
            <span class="hm-pick-go">${c.started ? L("Học tiếp", "Continue") : L("Chọn môn này", "Start learning")} →</span>
          </a>`).join("")}
        </div>
      </section>` : "";

    const bottomGridHtml = `<div class="hm-bottom-grid">${unfinished}${aiCard}</div>`;
    const order = [
      ...take(":scope > .hm-chibi-banner"),
      ...nodes(langStripHtml),
      ...nodes(pickOverviewHtml),
      ...nodes(overviewKpisHtml),
      ...nodes(current),
      ...nodes(skillsBlock),
      ...nodes(exploreToolsHtml),
      ...nodes(bottomGridHtml),
    ];
    // Cắt sạch các khối trùng với trang Cổ Vũ (Bạn đồng hành, Mục tiêu, Kế hoạch, Nhiệm vụ), Ôn tập và Luyện nói (#lhExplore) khỏi Tổng quan
    root.querySelectorAll(":scope > .hm-studio-grid, :scope > .hm-goal, :scope > .hm-missions-row, :scope > .hm-daily, :scope > .hm-courses, :scope > .hm-kpis, :scope > .hm-focus-empty, :scope > .hm-insights, :scope > .hm-quick, :scope > .hm-pro, :scope > #lhExplore, :scope > section[aria-labelledby='hmSubjectTitle'], :scope > section[aria-labelledby='hmSubjectsTitle']").forEach((el) => el.remove());
    statsEl?.remove();
    todoEl?.remove();
    focusEl?.remove();
    order.forEach((el) => root.append(el));
    cols?.remove();
  }
  if (!cheer) arrangeDashboard();
  if (!scoped) {
    const EXPLORE = {
      en: {
        flag: "🇬🇧", name: L("Tiếng Anh", "English"), nameEn: "English",
        sample: 'My name is Lan and I am <b class="lh-speak-hl">from</b> Vietnam.', samplePlain: "My name is Lan",
        soundId: "th-vo-thanh", soundTag: L("Âm /θ/ · THINK", "The /θ/ sound · THINK"),
        wordHtml: `think <span>· ${L("nghĩ", "to think")}</span>`,
        tip: L("Đặt đầu lưỡi giữa hai hàm răng rồi thổi hơi nhẹ, không rung cổ. Đừng đọc thành /t/ hay /s/.", "Put the tip of your tongue between your teeth and blow gently, no throat vibration. Don't read it as /t/ or /s/."),
        soundBtn: L("Luyện âm /θ/", "Practice /θ/"),
      },
      zh: {
        flag: "🇨🇳", name: L("Tiếng Trung", "Chinese"), nameEn: "Chinese",
        sample: '我叫<b class="lh-speak-hl">兰</b>，我来自越南。', samplePlain: "我叫兰，我来自越南",
        soundId: "thanh-3", soundTag: L("Thanh 3 · 声调", "Third tone"),
        wordHtml: `喝水 <span>· hē shuǐ · ${L("uống nước", "drink water")}</span>`,
        tip: L("Giọng hạ thấp rồi hơi lên, gần giống dấu hỏi. Trước thanh khác chỉ đọc nửa thanh thấp.", "Drop low then rise slightly. Before another tone, keep only the low half."),
        soundBtn: L("Luyện thanh điệu", "Practice tones"),
      },
      ja: {
        flag: "🇯🇵", name: L("Tiếng Nhật", "Japanese"), nameEn: "Japanese",
        sample: '私は<b class="lh-speak-hl">ラン</b>です。ベトナムから来ました。', samplePlain: "私はランです",
        soundId: "xuc-am", soundTag: L("Âm ngắt っ · 促音", "The small っ"),
        wordHtml: `学校 <span>· がっこう · ${L("trường học", "school")}</span>`,
        tip: L("Ngừng một nhịp trước phụ âm kế tiếp, như nín hơi rồi bật ra.", "Pause one beat before the next consonant, hold the breath briefly then release."),
        soundBtn: L("Luyện âm ngắt っ", "Practice small っ"),
      },
      ko: {
        flag: "🇰🇷", name: L("Tiếng Hàn", "Korean"), nameEn: "Korean",
        sample: '제 이름은 <b class="lh-speak-hl">란</b>이고 베트남에서 왔어요.', samplePlain: "제 이름은 란이에요",
        soundId: "noi-am", soundTag: L("Nối âm · 연음", "Linking"),
        wordHtml: `한국어 <span>· hangugeo · ${L("tiếng Hàn", "Korean")}</span>`,
        tip: L("Patchim nối sang âm tiết sau khi âm tiết sau bắt đầu bằng ㅇ: 한국어 đọc han-gu-geo.", "Carry the final consonant into the next syllable when it begins with ㅇ."),
        soundBtn: L("Luyện nối âm", "Practice linking"),
      },
      fr: {
        flag: "🇫🇷", name: L("Tiếng Pháp", "French"), nameEn: "French",
        sample: 'Je m\u2019appelle Lan et je <b class="lh-speak-hl">viens</b> du Vietnam.', samplePlain: "Je m'appelle Lan",
        soundId: "am-r", soundTag: L("Âm /ʁ/ · R Pháp", "French R"),
        wordHtml: `merci <span>· ${L("cảm ơn", "thank you")}</span>`,
        tip: L("Phát ra từ cuống họng như khi khạc nhẹ, đầu lưỡi nằm yên sau răng dưới.", "Produce gently from the back of the throat with tongue tip behind lower teeth."),
        soundBtn: L("Luyện âm /ʁ/", "Practice French R"),
      },
      es: {
        flag: "🇪🇸", name: L("Tiếng Tây Ban Nha", "Spanish"), nameEn: "Spanish",
        sample: 'Me llamo Lan y <b class="lh-speak-hl">soy</b> de Vietnam.', samplePlain: "Me llamo Lan",
        soundId: "am-rr", soundTag: L("Âm /r/ & RR · Ñ", "Spanish RR & Ñ"),
        wordHtml: `mañana <span>· ${L("ngày mai", "tomorrow")}</span>`,
        tip: L("Chữ h luôn câm (hola đọc ô-la), ñ đọc như nh trong tiếng Việt và rr rung đầu lưỡi.", "The letter h is always silent, ñ sounds like ny, and rr trills at the tip of the tongue."),
        soundBtn: L("Luyện phát âm Tây Ban Nha", "Practice Spanish sounds"),
      },
    };
    const IV_LIST = [
      ["pv-ai", "✨", L("AI và khoa học dữ liệu", "AI and data science")],
      ["pv-marketing", "📣", L("Marketing và truyền thông", "Marketing")],
      ["pv-tai-chinh", "📊", L("Tài chính kế toán", "Finance and accounting")],
      ["pv-hcns", "👥", L("Hành chính nhân sự", "HR and admin")],
      ["pv-kinh-doanh", "🤝", L("Kinh doanh và bán hàng", "Business and sales")],
      ["pv-cskh", "🎧", L("Chăm sóc khách hàng", "Customer service")],
      ["pv-giao-duc", "🎓", L("Giáo dục", "Education")],
      ["pv-y-te", "❤️", L("Y tế và điều dưỡng", "Healthcare")],
    ];
    let exLang = EXPLORE[cur] ? cur : "en";
    const exBox = main.querySelector("#lhExplore");
    const drawExplore = () => {
      const m = EXPLORE[exLang] || EXPLORE.en;
      const lowerVi = m.name.charAt(0).toLowerCase() + m.name.slice(1);
      exBox.innerHTML = `
      <div class="lh-explore-head">
        <h2 class="lh-explore-h">${L("Khám phá thêm", "Explore more")}</h2>
        <div class="lh-lang-tabs" role="tablist" aria-label="${L("Chọn ngôn ngữ khám phá", "Choose language")}">${Object.entries(EXPLORE).map(([id, item]) =>
          `<button type="button" role="tab" aria-selected="${id === exLang}" class="lh-lang-tab${id === exLang ? " on" : ""}" data-exlang="${id}">${item.flag} ${esc(item.name)}</button>`
        ).join("")}</div>
      </div>
      <section class="lh-speak-hero">
        <span class="lh-speak-kicker">🎙️ ${L(`Luyện nói ${lowerVi}`, `Speak ${m.nameEn}`)}</span>
        <h1 class="lh-speak-title">${L(`Luyện nói ${lowerVi} - Máy chấm từng từ như karaoke`, `Speak ${m.nameEn} - scored word by word, like karaoke`)}</h1>
        <p class="lh-speak-sub">${L(`Bấm micro đọc “${m.samplePlain}” - Có chấm 90 điểm, mẹo phát âm, chậm 0.6x cho người mới`, `Tap the mic and read “${m.samplePlain}” - scored up to 90, pronunciation tips, 0.6x slow mode for beginners`)}</p>
        <div class="lh-speak-cta">
          <a class="btn btn-primary btn-lg lh-speak-cta-main" href="/app/ngoai-ngu/luyen-noi/${exLang}/chu-de/cau/gioi-thieu">🎙️ ${L("Luyện nói ngay", "Start speaking now")}</a>
          <a class="btn btn-lg" href="/app/phong-van/${exLang}">💼 ${L("Thử phỏng vấn", "Try an interview")}</a>
        </div>
      </section>
      <section class="lh-speak-cards">
        <article class="lh-speak-card lh-speak-blue">
          <div class="lh-speak-ico">🎙️</div>
          <span class="lh-speak-tag">${L("Phòng luyện nói", "Speaking studio")}</span>
          <h2>${L("Bài 1: Giới thiệu bản thân", "Lesson 1: Introducing yourself")}</h2>
          <p class="lh-speak-sentence">${m.sample}</p>
          <div class="lh-speak-tools"><span>${lineIcon("speaker", 15)}</span><span>0.6x</span><span>🎙️</span><span>🎧</span><span>⌨️</span></div>
          <p class="lh-speak-note">${L("Bấm micro rồi đọc to, rõ từng từ", "Tap the mic, then read aloud, clearly, word by word")}</p>
          <a class="btn btn-primary" href="/app/ngoai-ngu/luyen-noi/${exLang}/chu-de/cau/gioi-thieu">${L("Vào luyện", "Start practicing")}</a>
          <p class="lh-speak-sub2">${L("Gõ lại câu bạn vừa đọc + Chấm", "Type back the sentence you just read + get scored")}</p>
        </article>
        <article class="lh-speak-card lh-speak-yellow">
          <div class="lh-speak-ico">👅</div>
          <span class="lh-speak-tag">${esc(m.soundTag)}</span>
          <h2 class="lh-speak-big">${m.wordHtml}</h2>
          <p class="lh-speak-note">${esc(m.tip)}</p>
          <a class="btn btn-primary" href="/app/ngoai-ngu/luyen-noi/${exLang}/phat-am/tu/${m.soundId}">${esc(m.soundBtn)}</a>
        </article>
        <article class="lh-speak-card lh-speak-purple">
          <span class="lh-speak-pro">Pro</span>
          <div class="lh-speak-ico">💼</div>
          <span class="lh-speak-tag">${L("Phỏng vấn AI · 30 ngành", "AI interviews · 30 fields")}</span>
          <h2>${L(`Phỏng vấn xin việc bằng ${lowerVi}`, `Job interviews in ${m.nameEn}`)}</h2>
          <ul class="lh-speak-iv">${IV_LIST.map(([id, ic, label]) =>
            `<li><a href="/app/ngoai-ngu/tro-chuyen/${exLang}/${id}">${ic} ${esc(label)}</a></li>`
          ).join("")}</ul>
          ${aiLeft ? `<p class="lh-speak-quota">${L(`Còn ${aiLeft} lượt AI hôm nay`, `${aiLeft} AI turns left today`)}</p>` : ""}
          <a class="btn btn-primary" href="/app/ngoai-ngu/luyen-noi/${exLang}?muc=hoi-thoai">${L("Chọn trong 30 ngành phỏng vấn", "Pick from 30 interview fields")}</a>
        </article>
      </section>`;
      exBox.querySelectorAll("[data-exlang]").forEach((btn) => btn.addEventListener("click", () => {
        exLang = btn.dataset.exlang;
        drawExplore();
      }));
    };
    drawExplore();
  }
  if (scoped) {
    main.querySelector("[data-tip]")?.addEventListener("click", (e) => { e.preventDefault(); import("./guide-subject.js").then((m) => m.openSubjectTip(scoped.id)); });
    import("./guide-subject.js").then((m) => m.maybeOpenSubjectTip(scoped.id)).catch(() => {});
  }
  // Interactive Pet Companion tabs & cheer button
  // Trang "Cổ Vũ": chỉ giữ lời chào, XP, nhiệm vụ và bạn đồng hành. Bỏ kế hoạch để không trùng trang Lộ trình học
  if (query && query.mode === "cheer") {
    main.querySelector(".hm-plan-card")?.remove();
    main.querySelector(".hm-studio-grid")?.classList.add("hm-studio-single");
    // Trang Cổ Vũ dừng ở thẻ bạn đồng hành (tặng sao, cổ vũ): bỏ mọi khối phía dưới
    let n = main.querySelector(".hm-studio-grid")?.nextElementSibling;
    while (n) { const nx = n.nextElementSibling; n.remove(); n = nx; }
    // Thêm khối giao diện Cổ Vũ · Kế hoạch ngày theo thiết kế chuẩn (51-co-vu-ke-hoach-ngay.webp)
    const rootCheer = main.querySelector(".lh.hm");
    const bannerEl = rootCheer?.querySelector(".hm-chibi-banner");
    if (rootCheer && bannerEl) {
      const cheerHeroHtml = HeroBanner({
        badge: "DAILY FOCUS",
        title: L("Mỗi ngày tiến bộ một chút", "Progress a little every day"),
        subtitle: L("Giữ nhịp học đều đặn cùng Rivo.", "Keep a steady study rhythm with Rivo."),
        kit: "bunny",
      });
      const cheerWeekHtml = `
      <section class="hm-cheer-week" aria-label="${L("Tuần của bạn", "Your week")}">
        <div class="hm-cheer-week-head">
          <h2>${L("Tuần của bạn", "Your week")}</h2>
          <span>${fmtN(activeDays)}/7 ${L("ngày hoạt động", "active days")}</span>
        </div>
        <div class="hm-cheer-week-card">
          ${week.map((w) => {
            const dayNum = Number(w.iso.slice(8, 10)) || "";
            return `<div class="hm-cw-day${w.n > 0 ? " is-done" : ""}${w.iso === todayStr ? " is-today" : ""}">
              <span class="hm-cw-dot">${w.n > 0 ? "✓" : dayNum}</span>
              <em>${esc(w.label)}</em>
            </div>`;
          }).join("")}
        </div>
      </section>`;
      const cheerTasksHtml = `
      <section class="hm-cheer-tasks" aria-label="${L("Nhiệm vụ hôm nay", "Today's missions")}">
        <h2>${L("Nhiệm vụ hôm nay", "Today's missions")}</h2>
        <div class="hm-cheer-task-list">
          <a class="hm-cheer-task${reviewedToday > 0 ? " is-done" : ""}" href="/app/ngoai-ngu/on-tap/${esc(planLang)}">
            <span class="hm-ct-ic">${reviewedToday > 0 ? "✓" : lineIcon("clock")}</span>
            <span class="hm-ct-body">
              <b>${reviewDueShown ? L(`Ôn tập ${fmtN(reviewDueShown)} từ vựng`, `Review ${fmtN(reviewDueShown)} words`) : L("Ôn tập từ vựng", "Review vocabulary")}</b>
              <small>${reviewedToday > 0 ? L("Đã hoàn thành hôm nay", "Completed today") : L("Thẻ ghi nhớ SRS · khoảng 8 phút", "SRS Flashcards · about 8 min")}</small>
            </span>
            <span class="hm-ct-arr" aria-hidden="true">›</span>
          </a>
          <a class="hm-cheer-task${lessonsToday >= 1 ? " is-done" : ""}" href="${heroSub ? esc(heroSub.next.href) : `/app/ngoai-ngu/${esc(planLang)}`}">
            <span class="hm-ct-ic">${lessonsToday >= 1 ? "✓" : lineIcon("book")}</span>
            <span class="hm-ct-body">
              <b>${L("Học một bài ngữ pháp / từ vựng", "Complete one lesson")}</b>
              <small>${lessonsToday >= 1 ? L(`Đã hoàn thành ${fmtN(lessonsToday)} bài`, `Completed ${fmtN(lessonsToday)} lessons`) : L("Còn 1 bài · khoảng 5 phút", "1 lesson left · about 5 min")}</small>
            </span>
            <span class="hm-ct-arr" aria-hidden="true">›</span>
          </a>
          <a class="hm-cheer-task${speaksToday >= 5 ? " is-done" : ""}" href="/app/ngoai-ngu/luyen-noi/${esc(planLang)}">
            <span class="hm-ct-ic">${speaksToday >= 5 ? "✓" : lineIcon("mic")}</span>
            <span class="hm-ct-body">
              <b>${L("Luyện nói 5 câu", "Practice speaking 5 sentences")}</b>
              <small>${speaksToday >= 5 ? L(`Đã luyện ${fmtN(speaksToday)} câu hôm nay`, `Practiced ${fmtN(speaksToday)} sentences today`) : speaksToday > 0 ? L(`Đã luyện ${fmtN(speaksToday)}/5 câu · Speaking Lab`, `${fmtN(speaksToday)}/5 sentences · Speaking Lab`) : L("Speaking Lab · Luyện phát âm", "Speaking Lab · Pronunciation")}</small>
            </span>
            <span class="hm-ct-arr" aria-hidden="true">›</span>
          </a>
        </div>
      </section>`;
      const wrap = document.createElement("div");
      wrap.innerHTML = cheerHeroHtml + cheerWeekHtml;
      bannerEl.after(...wrap.children);
      const studioEl = rootCheer.querySelector(".hm-studio-grid");
      const goalEl = rootCheer.querySelector(".hm-goal");
      if (studioEl) {
        const taskWrap = document.createElement("div");
        taskWrap.innerHTML = cheerTasksHtml;
        studioEl.after(...taskWrap.children);
        if (goalEl) studioEl.after(goalEl);
      }
    }
  }
  if (main.querySelector("#hmPetCard")) {
    bindCompanionCard(main, { userLv, starRoot: main });
  } else {
    refreshPet().then(() => {
      if (!main.isConnected) return;
      const s = petState();
      main.querySelectorAll(".hm-star-pill b").forEach((b) => { b.textContent = fmtN(s.stars); });
    });
  }
  // Mục tiêu học mỗi ngày: tăng/giảm 1 bài, lưu theo tài khoản
  main.querySelectorAll("[data-goal-step]").forEach((b) => b.addEventListener("click", () => {
    const cur = Math.min(20, Math.max(1, Number(S.prefs && S.prefs.dailyGoal) || 3));
    const next = Math.min(20, Math.max(1, cur + Number(b.dataset.goalStep)));
    savePrefs({ dailyGoal: next });
    const tot = main.querySelector("#hmGoalTotal"); if (tot) tot.textContent = fmtN(next);
    const fill = main.querySelector(".hm-goal .bar i");
    if (fill) fill.style.width = Math.min(100, Math.round((lessonsToday / next) * 100)) + "%";
  }));
}
