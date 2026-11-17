/* Màn chọn môn & lộ trình chuẩn (#/chon-mon).
   - Tài khoản chưa có môn (lần đầu): luồng thiết lập 5 bước — chào, mục tiêu, ngoại ngữ (bắt buộc),
     trình độ, kế hoạch 7 ngày rồi vào bài đầu tiên. Mọi bước trừ ngoại ngữ đều bỏ qua được.
   - Tài khoản đã có môn: trang chọn môn như trước (đổi môn, tiếp tục môn gần đây, lộ trình chuẩn 4 bước).
   Nguồn dữ liệu: /api/lang (môn, cấp, số bài thật), prefs (goal, goalPath, subject, companion),
   /api/lang/insights/:lang/plan (kế hoạch 7 ngày do máy chủ tạo từ tiến độ thật). Không gọi AI ở đây. */
import { setAppHash } from "./core.js";
import { S, api, esc, icon, sketchIcon, fmtN } from "./core.js";
import { getSubject, setSubject } from "./lang.js";
import { currentLang, t as trText } from "./i18n.js";
import { savePrefs } from "./game.js";
import { STANDARD_ROADMAP, ROADMAP_HEAD, roadmapStep, LEARNING_GOALS, goalById } from "./roadmap-std.js";
import { companionSvg, companionOf, companionPickerHtml, activeCompanionId, typeInto } from "./companion.js";

const CHIBI_COURSE_META = {
  en: {
    buddy: "Gấu London",
    badge: "Phổ biến nhất",
    tint: "#E0F2FE",
    goals: ["starter", "speaking", "career"],
    tag: "Giao tiếp tự tin, phát âm chuẩn & TOEIC",
    steps: ["1. Phát âm IPA & từ cơ bản", "2. Luyện nói & Phỏng vấn AI", "3. Chứng nhận A1–C1 & TOEIC"],
  },
  zh: {
    buddy: "Leo Đèn Lồng",
    badge: "Viết chữ Hán",
    tint: "#FFE4E6",
    goals: ["starter", "abroad", "career"],
    tag: "Pinyin 4 thanh điệu, chữ Hán & HSK 1–5",
    steps: ["1. Thanh điệu Pinyin & nét cơ bản", "2. Viết Hán tự & đàm thoại", "3. HSK 1–5 & Phỏng vấn AI"],
  },
  ja: {
    buddy: "Mimi Sakura",
    badge: "Đi Nhật",
    tint: "#FCE7F3",
    goals: ["starter", "abroad", "speaking"],
    tag: "Hiragana, Katakana, N5 & phản xạ giao tiếp",
    steps: ["1. Thuộc bảng Kana từ con số 0", "2. Từ vựng N5 & luyện nói 0.6x", "3. Đạt JLPT & làm việc tại Nhật"],
  },
  ko: {
    buddy: "Bonnie Seoul",
    badge: "Dễ bắt đầu",
    tint: "#DCFCE7",
    goals: ["starter", "abroad", "speaking"],
    tag: "Bảng chữ Hangul, nối âm & TOPIK 1–5",
    steps: ["1. Ghép chữ Hangul trong 1 ngày", "2. Mẫu câu đời sống & công sở", "3. Luyện nói AI & TOPIK 1–5"],
  },
  fr: {
    buddy: "Mimi Paris",
    badge: "Lãng mạn",
    tint: "#EDE9FE",
    goals: ["starter", "speaking", "abroad"],
    tag: "Phát âm chuẩn Pháp, đọc hiểu & DELF",
    steps: ["1. Âm mũi & nối âm chuẩn Pháp", "2. Hội thoại hằng ngày & thẻ từ", "3. DELF A1–B2 & Chứng nhận"],
  },
  es: {
    buddy: "Gà Bông Nắng",
    badge: "Mới mẻ",
    tint: "#FEF3C7",
    goals: ["starter", "speaking"],
    tag: "Phát âm âm RR, chia động từ & DELE",
    steps: ["1. Phát âm tròn vành & ser/estar", "2. Giao tiếp du lịch & đời sống", "3. Chinh phục DELE A1–C1"],
  },
};

const L = (vi, en) => (currentLang() === "en" ? en : vi);
const STEP_NAMES = () => [L("Chào bạn", "Welcome"), L("Mục tiêu", "Goal"), L("Ngoại ngữ", "Language"), L("Trình độ", "Level"), L("Kế hoạch", "Plan")];

function subjectList(lang) {
  const out = [];
  for (const c of (lang && lang.courses) || []) {
    out.push({
      id: c.id,
      name: c.name,
      flag: c.flag,
      color: c.color,
      framework: c.framework || "",
      total: c.total,
      levels: (c.levels || []).length,
      pro: (c.levels || []).filter((l) => l.locked).length,
      done: c.done || 0,
      pct: c.pct || 0,
    });
  }
  return out;
}

/* ---------- Dữ liệu cấp & bài học (chỉ đọc từ /api/lang) ---------- */
// Chọn chỉ số cấp theo lựa chọn trình độ; cấp không có bài thì lùi tới cấp có bài.
function resolveLevelIdx(course, choice, lvIdx) {
  const levels = course.levels || [];
  let want = 0;
  if (choice === "basic") want = 1;
  else if (choice === "known" && Number.isInteger(lvIdx)) want = lvIdx;
  else if (choice === "skip") { const i = levels.findIndex((l) => (l.pct || 0) < 100); want = i < 0 ? 0 : i; }
  want = Math.max(0, Math.min(want, levels.length - 1));
  for (let i = want; i < levels.length; i++) if ((levels[i].total || 0) > 0) return i;
  return levels.findIndex((l) => (l.total || 0) > 0);
}
function levelExercises(lv) {
  return (lv.units || []).flatMap((u) => (u.exercises || []).map((e) => ({ ...e, unitTitle: u.title, levelTitle: lv.title })));
}
// Bài học đầu tiên của cấp đã chọn: bài chưa đạt đầu tiên, nếu không có thì bài đầu tiên.
function lessonHref(course, idx, pass) {
  if (idx < 0) return `/app/ngoai-ngu/${course.id}`;
  const lv = course.levels[idx];
  const exs = levelExercises(lv);
  const nx = exs.find((e) => (e.best || 0) < pass) || exs[0];
  return nx ? `/app/ngoai-ngu/bai/${nx.id}` : `/app/ngoai-ngu/${course.id}/${lv.id}`;
}

/* ---------- Màn chọn môn cũ (người đã có môn, hoặc từ "Xem danh sách môn") ---------- */
function renderClassicPicker(main, lang, ctx) {
  const list = subjectList(lang);
  const name = S.me ? esc(S.me.displayName) : "bạn";
  const courses = (lang && lang.courses) || [];
  const savedSubj = getSubject();
  const recentCourse = (savedSubj && courses.find((c) => c.id === savedSubj))
    || courses.filter((c) => c.done > 0).sort((a, b) => b.done - a.done)[0]
    || null;

  let resumeHref = "", resumeSub = "";
  if (recentCourse) {
    const pass = lang.pass || 80;
    const allEx = (recentCourse.levels || [])
      .filter((l) => !l.locked)
      .flatMap((l) => (l.units || []).flatMap((u) => (u.exercises || []).map((e) => ({ ...e, levelTitle: l.title, unitTitle: u.title }))));
    const nextEx = allEx.find((e) => e.attempts > 0 && e.best < pass) || allEx.find((e) => e.best < pass) || allEx[0];
    resumeHref = nextEx ? `/app/ngoai-ngu/bai/${nextEx.id}` : `/app/?mon=${recentCourse.id}`;
    resumeSub = nextEx
      ? `Tiếp tục tại: ${nextEx.levelTitle} · ${nextEx.unitTitle}${nextEx.kindTitle || nextEx.title ? " · " + (nextEx.kindTitle || nextEx.title) : ""}`
      : `${recentCourse.framework || ""} · ${fmtN(recentCourse.done || 0)}/${fmtN(recentCourse.total || 0)} bài đạt`;
  }

  const resumeHtml = recentCourse ? `
    <div class="sw-resume sw-chibi-resume" id="swResume" style="--c:${esc(recentCourse.color || "#5B3FD6")}" role="region" aria-label="Tiếp tục môn học gần đây">
      <div class="sw-resume-ico" aria-hidden="true">${companionSvg(activeCompanionId(recentCourse.id), 54)}</div>
      <div class="sw-resume-copy">
        <b>${currentLang() === "en" ? `You were recently studying ${esc(trText(recentCourse.name))}. Keep going?` : `Gần đây bạn đang học ${esc(recentCourse.name)}, học tiếp luôn nhé?`}</b>
        <span>${esc(resumeSub)}</span>
      </div>
      <div class="sw-resume-actions">
        <button type="button" class="btn btn-primary" id="swResumeYes">${sketchIcon("play")} Có, học tiếp ngay</button>
        <button type="button" class="btn" id="swResumeNo">Chọn môn khác</button>
      </div>
    </div>` : "";

  const card = (x) => {
    const meta = CHIBI_COURSE_META[x.id] || CHIBI_COURSE_META.ja;
    const isStarted = x.done > 0;
    const stat = [x.total ? `${fmtN(x.total)} bài tập` : "", x.levels ? `${fmtN(x.levels)} cấp độ` : ""].filter(Boolean).join(" · ");
    return `<a class="sw-card sw-chibi-card" href="/app/?mon=${esc(x.id)}" style="--c:${esc(x.color || "#5B3FD6")};--tint:${meta.tint}" data-subject="${esc(x.id)}" data-goals="${meta.goals.join(",")}">
      <div class="sw-chibi-stage">
        <div class="sw-chibi-toprow">
          <span class="sw-chibi-flag-pill"><i class="sw-flag-mini">${x.flag}</i> ${esc(x.framework || "Chuẩn quốc tế")}</span>
          <span class="sw-chibi-tag">${isStarted ? `${x.pct}% đã xong` : esc(meta.badge)}</span>
        </div>
        <div class="sw-chibi-mascot-wrap">${companionSvg(activeCompanionId(x.id), 86)}</div>
        <span class="sw-chibi-buddy-name">Bạn đồng hành: <b>${esc(companionOf(activeCompanionId(x.id)).name)}</b></span>
      </div>
      <div class="sw-chibi-body">
        <div class="sw-chibi-title">
          <h3>${esc(x.name)}</h3>
          ${stat ? `<span class="sw-stat">${esc(stat)}</span>` : ""}
        </div>
        <p class="sw-chibi-desc">${esc(meta.tag)}</p>
        <ol class="sw-mini-steps" aria-label="Lộ trình ${esc(x.name)}">
          ${meta.steps.map((s) => `<li>${esc(s)}</li>`).join("")}
        </ol>
        <span class="btn btn-primary sw-chibi-cta">${isStarted ? "Học tiếp cùng bé" : "Bắt đầu hành trình"} ${icon("right")}</span>
      </div>
    </a>`;
  };

  const rmEn = currentLang() === "en", RH = ROADMAP_HEAD[rmEn ? "en" : "vi"];
  main.innerHTML = `
  <div class="sw sw-chibi-world">
    <section class="sw-chibi-hero">
      <div class="sw-chibi-hero-copy">
        <span class="sw-eyebrow">${sketchIcon("sparkle")}<span>Bắt đầu hành trình mới</span></span>
        <h1>Chào <em>${name}</em>! Bạn muốn đồng hành cùng bé nào?</h1>
        <p>Mỗi ngoại ngữ đã có sẵn <b>lộ trình chuẩn 4 bước từ con số 0</b>. Bạn chỉ cần chọn 1 ngôn ngữ yêu thích, làm bài đầu tiên trong 3 phút — mọi bước tiếp theo hệ thống tự dẫn đường!</p>
        <div class="sw-hero-perks">
          <span>${sketchIcon("clock")} Chỉ 10 phút/ngày</span>
          <span>${sketchIcon("mic")} Chấm nói từng từ</span>
          <span>${sketchIcon("award")} Nhắc ôn tự động</span>
        </div>
      </div>
      <div class="sw-chibi-hero-art" aria-hidden="true">
        <div class="cp-hero-pal">${companionSvg(activeCompanionId(), 150)}</div>
        <div class="sw-chibi-bubble">Chọn 1 bé bên dưới để mở khóa bài đầu tiên nhé!</div>
      </div>
    </section>

    ${resumeHtml}

    <section class="sw-roadmap" aria-label="${esc(RH.title)}">
      <div class="sw-roadmap-head">
        <div>
          <span class="sw-eyebrow"><span>${esc(RH.eyebrow)}</span></span>
          <h2>${esc(RH.title)}</h2>
        </div>
        <p>${esc(RH.desc)}</p>
      </div>
      <ol class="sw-roadmap-track">
        ${STANDARD_ROADMAP.map((st, idx) => {
          const s = roadmapStep(st, rmEn);
          return `
          <li class="sw-roadmap-step" style="--tint:${st.tint}">
            <div class="sw-rm-top">
              <span class="sw-rm-badge">${esc(s.no)}</span>
              <span class="sw-rm-num">0${idx + 1}</span>
            </div>
            <div class="sw-rm-ico">${sketchIcon(st.ic)}</div>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.desc)}</p>
          </li>`;
        }).join("")}
      </ol>
    </section>

    <section class="sw-companion-sec" aria-label="Chọn bạn đồng hành">
      <div class="sw-picker-head">
        <div>
          <h2>Chọn bạn đồng hành của bạn</h2>
          <p>Bạn sẽ đi cùng bạn ở mọi trang, từ bài đầu tiên đến chứng nhận. Bấm để chọn.</p>
        </div>
      </div>
      ${companionPickerHtml(S.prefs && S.prefs.companion || "")}
      <p class="cp-picker-say" aria-live="polite"></p>
    </section>

    <section class="sw-picker-sec" aria-label="Chọn ngôn ngữ bắt đầu">
      <div class="sw-picker-head">
        <div>
          <h2>Chọn ngoại ngữ &amp; người bạn của bạn</h2>
          <p>Bấm mục tiêu bên dưới nếu bạn chưa biết chọn môn nào:</p>
        </div>
        <div class="sw-goal-pills" role="group" aria-label="Lọc theo mục tiêu">
          <button type="button" class="chip on" data-goal="all">Tất cả 6 môn</button>
          <button type="button" class="chip" data-goal="starter">Mất gốc · từ đầu</button>
          <button type="button" class="chip" data-goal="speaking">Giao tiếp &amp; Phỏng vấn AI</button>
          <button type="button" class="chip" data-goal="abroad">Đi Nhật / Hàn / Du học</button>
        </div>
      </div>
      <div class="sw-chibi-grid">${list.map(card).join("")}</div>
    </section>
  </div>`;

  if (recentCourse) {
    main.querySelector("#swResumeYes")?.addEventListener("click", () => {
      setSubject(recentCourse.id);
      setAppHash(resumeHref);
    });
    main.querySelector("#swResumeNo")?.addEventListener("click", () => {
      main.querySelector("#swResume")?.remove();
    });
  }

  // Chọn bạn đồng hành: lưu theo tài khoản, cập nhật ngay các thẻ môn và bạn nói lời chào
  const paintCompanion = () => {
    const cur = (S.prefs && S.prefs.companion) || "";
    main.querySelectorAll(".cp-pick").forEach((b) => {
      const on = b.dataset.companion === cur;
      b.classList.toggle("on", on);
      b.setAttribute("aria-checked", String(on));
    });
    main.querySelectorAll(".sw-chibi-card[data-subject]").forEach((card) => {
      const id = activeCompanionId(card.dataset.subject);
      const wrap = card.querySelector(".sw-chibi-mascot-wrap");
      const nm = card.querySelector(".sw-chibi-buddy-name b");
      if (wrap) wrap.innerHTML = companionSvg(id, 86);
      if (nm) nm.textContent = companionOf(id).name;
    });
  };
  main.querySelectorAll(".cp-pick").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.companion;
      const c = companionOf(id);
      savePrefs({ companion: id });
      paintCompanion();
      const say = main.querySelector(".cp-picker-say");
      const svg = btn.querySelector("svg");
      if (say) typeInto(say, `Xin chào, mình là ${c.name}! ${c.tone}. Mình sẽ đi cùng bạn trên mọi trang.`, { root: svg, speed: 22 });
    });
  });

  const goalBtns = [...main.querySelectorAll(".sw-goal-pills [data-goal]")];
  const cards = [...main.querySelectorAll(".sw-chibi-card")];
  goalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const g = btn.dataset.goal || "all";
      goalBtns.forEach((b) => b.classList.toggle("on", b === btn));
      cards.forEach((c) => {
        const match = g === "all" || (c.dataset.goals || "").split(",").includes(g);
        c.classList.toggle("is-dimmed", !match);
        c.classList.toggle("is-highlighted", g !== "all" && match);
      });
    });
  });
}

/* ---------- Luồng thiết lập lần đầu ---------- */
async function fetchPlan(courseId, minutes) {
  const path = `/api/lang/insights/${encodeURIComponent(courseId)}/plan`;
  const got = await api(path, "GET", undefined, { timeoutMs: 10000 });
  if (got && got.plan && Array.isArray(got.plan.days) && got.plan.days.length) return got.plan;
  const made = await api(path, "POST", { dailyGoalMinutes: minutes }, { timeoutMs: 15000 });
  if (made && made.plan && Array.isArray(made.plan.days) && made.plan.days.length) return made.plan;
  throw new Error("Không có kế hoạch");
}

async function runOnboarding(main, lang, ctx) {
  const pass = lang.pass || 80;
  const courses = (lang.courses || []).filter((c) => (c.total || 0) > 0 && (c.levels || []).some((l) => (l.total || 0) > 0));
  const name = S.me ? esc(S.me.displayName) : L("bạn", "there");
  const st = {
    step: 0,
    goal: goalById(S.prefs && S.prefs.goalPath) || null, // đã chọn trước đó thì giữ lại
    course: null,
    choice: null, // "new" | "basic" | "known" | "skip"
    lvIdx: null,
    plan: null, // { status: "loading" | "ok" | "fallback", plan? }
    token: 0,
  };
  const STEPS = STEP_NAMES();

  const shell = (body, nav) => `<div class="ob">
    <div class="ob-progress"><span>${esc(L(`Bước ${st.step + 1}/${STEPS.length}`, `Step ${st.step + 1} of ${STEPS.length}`))} · ${esc(STEPS[st.step])}</span>
      <div class="ob-bar" aria-hidden="true"><i style="width:${Math.round(((st.step + 1) / STEPS.length) * 100)}%"></i></div></div>
    <section class="ob-card" aria-live="polite">${body}</section>
    ${nav ? `<div class="ob-nav">${nav}</div>` : ""}
  </div>`;
  const back = `<button type="button" class="btn" data-ob="back">${L("Quay lại", "Back")}</button>`;
  const skipBtn = (label) => `<button type="button" class="btn" data-ob="skip">${label}</button>`;
  const nextBtn = (label, disabled = false) => `<button type="button" class="btn btn-primary" data-ob="next"${disabled ? " disabled" : ""}>${label}</button>`;
  const classicLink = `<button type="button" class="ob-text-btn" data-ob="classic">${L("Xem danh sách đầy đủ các môn", "See the full list of subjects")}</button>`;

  const levelCopy = (course, choice) => {
    const i = resolveLevelIdx(course, choice, st.lvIdx);
    return i < 0 ? "" : course.levels[i].title;
  };

  const paintStep = () => {
    if (st.step === 0) {
      main.innerHTML = shell(`
        <div class="ob-hero">
          <div class="ob-hero-art" aria-hidden="true">${companionSvg(activeCompanionId(), 120)}</div>
          <div class="ob-hero-copy">
            <span class="ob-kicker">${sketchIcon("sparkle")}<span>${L("Thiết lập nhanh", "Quick setup")}</span></span>
            <h1>${L(`Chào ${name}! Mình sẽ dựng lộ trình riêng cho bạn.`, `Hi ${name}! Let's build your own path.`)}</h1>
            <p>${L("Khoảng một phút. Chỉ chọn ngoại ngữ là bước bắt buộc; các bước khác bạn có thể bỏ qua và đổi sau.", "About a minute. Only the language is required; you can skip the other steps and change them later.")}</p>
            <ol class="ob-list">
              <li>${L("Mục tiêu học của bạn", "Your learning goal")}</li>
              <li>${L("Ngoại ngữ bạn muốn học", "The language you want to learn")}</li>
              <li>${L("Trình độ hiện tại", "Your current level")}</li>
              <li>${L("Kế hoạch 7 ngày từ bài học thật", "A 7-day plan built from real lessons")}</li>
            </ol>
          </div>
        </div>`, `${nextBtn(L("Bắt đầu", "Start"))}${classicLink}`);
    } else if (st.step === 1) {
      main.innerHTML = shell(`
        <h2>${L("Bạn học tiếng để làm gì?", "What do you want the language for?")}</h2>
        <p class="ob-sub">${L("Chọn mục gần nhất. Bạn có thể bỏ qua và đổi sau.", "Pick the closest one. You can skip and change it later.")}</p>
        <div class="ob-grid" role="radiogroup" aria-label="${L("Mục tiêu học", "Learning goal")}">
          ${LEARNING_GOALS.map((g) => {
            const on = st.goal && st.goal.id === g.id;
            return `<button type="button" class="ob-opt${on ? " on" : ""}" role="radio" aria-checked="${on}" data-goal="${g.id}">
              <span class="ob-opt-ico" aria-hidden="true">${sketchIcon(g.ic)}</span><b>${esc(L(g.vi, g.en))}</b></button>`;
          }).join("")}
        </div>`, `${back}${st.goal ? nextBtn(L("Tiếp tục", "Continue")) : skipBtn(L("Bỏ qua", "Skip"))}`);
    } else if (st.step === 2) {
      if (!courses.length) { renderClassicPicker(main, lang, ctx); return; }
      main.innerHTML = shell(`
        <h2>${L("Bạn muốn học ngoại ngữ nào?", "Which language do you want to learn?")}</h2>
        <p class="ob-sub">${L("Bắt buộc. Chỉ hiện các ngôn ngữ đã có bài học thật.", "Required. Only languages with real lessons are shown.")}</p>
        <div class="ob-grid ob-grid-courses" role="radiogroup" aria-label="${L("Ngoại ngữ", "Language")}">
          ${courses.map((c) => {
            const on = st.course && st.course.id === c.id;
            return `<button type="button" class="ob-course${on ? " on" : ""}" role="radio" aria-checked="${on}" data-course="${esc(c.id)}" style="--c:${esc(c.color || "#5B3FD6")}">
              <span class="ob-course-flag" aria-hidden="true">${c.flag}</span>
              <span class="ob-course-txt"><b>${esc(c.name)}</b><small>${esc(c.framework || "")} · ${fmtN(c.levels.length)} ${L("cấp", "levels")} · ${fmtN(c.total)} ${L("bài", "lessons")}</small></span>
            </button>`;
          }).join("")}
        </div>
        <div class="ob-companion">
          <b>${L("Bạn đồng hành (tùy chọn)", "Study buddy (optional)")}</b>
          ${companionPickerHtml(S.prefs && S.prefs.companion || "")}
          <p class="cp-picker-say" aria-live="polite"></p>
        </div>`, `${back}${nextBtn(L("Tiếp tục", "Continue"), !st.course)}${classicLink}`);
    } else if (st.step === 3) {
      const c = st.course;
      const contentIdx = c.levels.map((l, i) => ({ l, i })).filter((x) => (x.l.total || 0) > 0);
      main.innerHTML = shell(`
        <h2>${L(`Bạn đã biết ${esc(c.name)} đến đâu?`, `How much do you already know ${esc(c.name)}?`)}</h2>
        <p class="ob-sub">${L("Chọn gần đúng. Bạn có thể bỏ qua, hệ thống sẽ bắt đầu từ chỗ bạn chưa học xong.", "Pick the closest one. You can skip; the system will start where you have not finished.")}</p>
        <div class="ob-grid" role="radiogroup" aria-label="${L("Trình độ", "Level")}">
          ${[["new", sketchIcon("sparkle"), L("Người mới", "Beginner"), L(`Bắt đầu từ ${levelCopy(c, "new")}`, `Start from ${levelCopy(c, "new")}`)],
             ["basic", sketchIcon("book"), L("Đã có nền tảng", "Some basics"), L(`Bắt đầu từ ${levelCopy(c, "basic")}`, `Start from ${levelCopy(c, "basic")}`)],
             ["known", sketchIcon("award"), L("Đã biết trình độ", "I know my level"), L("Chọn cấp bên dưới", "Pick a level below")]]
            .map(([key, ic, title, sub]) => {
              const on = st.choice === key;
              return `<button type="button" class="ob-opt${on ? " on" : ""}" role="radio" aria-checked="${on}" data-level="${key}">
                <span class="ob-opt-ico" aria-hidden="true">${ic}</span><b>${esc(title)}</b><small>${esc(sub)}</small></button>`;
            }).join("")}
        </div>
        ${st.choice === "known" ? `<div class="ob-levels" role="radiogroup" aria-label="${L("Chọn cấp", "Choose a level")}">
          ${contentIdx.map(({ l, i }) => `<button type="button" class="ob-chip${st.lvIdx === i ? " on" : ""}" role="radio" aria-checked="${st.lvIdx === i}" data-lv="${i}" title="${esc(l.desc || "")}">${esc(l.title)}</button>`).join("")}
        </div>` : ""}`,
        `${back}${st.choice && (st.choice !== "known" || Number.isInteger(st.lvIdx)) ? nextBtn(L("Tiếp tục", "Continue")) : skipBtn(L("Bỏ qua", "Skip"))}`);
    } else if (st.step === 4) {
      const c = st.course;
      const minutes = st.choice === "new" ? 15 : 25;
      const idx = resolveLevelIdx(c, st.choice, st.lvIdx);
      const href = lessonHref(c, idx, pass);
      st.href = href;
      let body;
      if (!st.plan || st.plan.status === "loading") {
        body = `<div class="ob-loading"><span class="spin" aria-hidden="true"></span><p>${L("Đang dựng kế hoạch 7 ngày từ bài học của bạn…", "Building your 7-day plan from your lessons…")}</p></div>`;
      } else if (st.plan.status === "ok") {
        const plan = st.plan.plan;
        const days = plan.days || [];
        const totalMin = days.reduce((n, d) => n + (d.tasks || []).reduce((m, t) => m + (Number(t.estimatedMinutes) || 0), 0), 0);
        body = `<h2>${L("Kế hoạch 7 ngày của bạn", "Your 7-day plan")}</h2>
          <p class="ob-sub">${esc(plan.title || "")} · ${L(`${fmtN(plan.totalItems || 0)} nhiệm vụ · khoảng ${fmtN(totalMin)} phút`, `${fmtN(plan.totalItems || 0)} tasks · about ${fmtN(totalMin)} min`)}</p>
          <ol class="ob-days">${days.map((d) => {
            const tasks = d.tasks || [];
            const mins = tasks.reduce((m, t) => m + (Number(t.estimatedMinutes) || 0), 0);
            return `<li><b>${L("Ngày", "Day")} ${d.dayNo}</b><span>${tasks.length ? `${fmtN(tasks.length)} ${L("nhiệm vụ", "tasks")} · ${fmtN(mins)} ${L("phút", "min")}` : L("Nghỉ", "Rest")}</span><small>${esc(tasks[0] ? tasks[0].title : "")}</small></li>`;
          }).join("")}</ol>`;
      } else {
        const firstLevel = c.levels[idx];
        const starter = firstLevel ? levelExercises(firstLevel).slice(0, 3) : [];
        body = `<h2>${L("Lộ trình bắt đầu", "Starter path")}</h2>
          <p class="ob-sub">${L("Chưa dựng được kế hoạch 7 ngày lúc này. Bạn vẫn có thể bắt đầu từ các bài có sẵn bên dưới.", "The 7-day plan is not ready right now. You can still start with the lessons below.")}</p>
          <ol class="ob-days">${starter.map((e) => `<li><b>${esc(e.levelTitle)}</b><span>${esc(e.unitTitle)}</span><small>${esc(e.kindTitle || e.title || "")}</small></li>`).join("")}</ol>`;
      }
      main.innerHTML = shell(body, `${back}<button type="button" class="btn" data-ob="home">${L("Về tổng quan", "Overview")}</button><button type="button" class="btn btn-primary btn-lg" data-ob="start"${st.plan && st.plan.status === "loading" ? " disabled" : ""}>${sketchIcon("play")} ${L("Vào bài đầu tiên", "Start first lesson")}</button>`);
      if (!st.plan) loadPlan(minutes);
    }
  };

  const loadPlan = async (minutes) => {
    const token = ++st.token;
    st.plan = { status: "loading" };
    paintStep();
    try {
      const plan = await fetchPlan(st.course.id, minutes);
      if (token !== st.token || st.step !== 4) return;
      st.plan = { status: "ok", plan };
    } catch {
      if (token !== st.token || st.step !== 4) return;
      st.plan = { status: "fallback" };
    }
    paintStep();
  };

  const pickCompanion = (cp) => {
    const id = cp.dataset.companion;
    const c = companionOf(id);
    savePrefs({ companion: id });
    main.querySelectorAll(".cp-pick").forEach((b) => {
      const on = b.dataset.companion === id;
      b.classList.toggle("on", on);
      b.setAttribute("aria-checked", String(on));
    });
    const say = main.querySelector(".cp-picker-say");
    const svg = cp.querySelector("svg");
    if (say) typeInto(say, `Xin chào, mình là ${c.name}! ${c.tone}. Mình sẽ đi cùng bạn trên mọi trang.`, { root: svg, speed: 22 });
  };

  // Một trình xử lý sự kiện cho cả luồng (main không bị thay thế giữa các bước)
  main.onclick = (e) => {
    const cp = e.target.closest(".cp-pick");
    if (cp && main.contains(cp)) return pickCompanion(cp);
    const b = e.target.closest("[data-ob],[data-goal],[data-course],[data-level],[data-lv]");
    if (!b || !main.contains(b)) return;
    if (b.dataset.goal) { st.goal = goalById(b.dataset.goal); return paintStep(); }
    if (b.dataset.course) { st.course = courses.find((c) => c.id === b.dataset.course) || null; st.choice = null; st.lvIdx = null; return paintStep(); }
    if (b.dataset.level) { st.choice = b.dataset.level; st.lvIdx = b.dataset.level === "known" ? st.lvIdx : null; return paintStep(); }
    if (b.dataset.lv) { st.choice = "known"; st.lvIdx = Number(b.dataset.lv); return paintStep(); }
    switch (b.dataset.ob) {
      case "back": st.step = Math.max(0, st.step - 1); return paintStep();
      case "classic": main.onclick = null; return renderClassicPicker(main, lang, ctx);
      case "next":
        if (st.step === 0) st.step = 1;
        else if (st.step === 1) {
          if (st.goal) savePrefs({ goal: st.goal.server, goalPath: st.goal.id });
          st.step = 2;
        } else if (st.step === 2) {
          if (!st.course) return;
          setSubject(st.course.id); // ngôn ngữ là bước bắt buộc: lưu ngay vào prefs.subject
          st.step = 3;
        } else if (st.step === 3) {
          if (!st.choice) return;
          st.step = 4;
          st.plan = null;
        }
        return paintStep();
      case "skip":
        if (st.step === 1) { st.goal = null; st.step = 2; return paintStep(); }
        if (st.step === 3) { st.choice = "skip"; st.lvIdx = null; st.step = 4; st.plan = null; return paintStep(); }
        return;
      case "start": if (st.href) setAppHash(st.href); return;
      case "home": if (st.course) setAppHash(`/app/${st.course.id}`); return;
      default: return;
    }
  };

  if (!courses.length) { main.onclick = null; return renderClassicPicker(main, lang, ctx); }
  paintStep();
}

export async function pageSubjectWelcome(main, params, query, ctx) {
  ctx.setCrumbs([["Chọn môn học"]]);
  document.body.classList.add("sw-focus");
  ctx.onLeave(() => { document.body.classList.remove("sw-focus"); if (main) main.onclick = null; });
  main.innerHTML = `<div class="sw-loading"><span class="spin"></span> Đang chuẩn bị biệt đội…</div>`;
  let lang = { courses: [] };
  try { lang = await api("/api/lang"); } catch {}
  if (!ctx.isCurrent()) return;
  // Lần đầu (chưa có môn): luồng thiết lập. Đã có môn: trang chọn môn như trước.
  // Dùng môn đã lưu trong tài khoản (prefs), không dùng localStorage của trình duyệt (có thể còn từ tài khoản khác)
  if (!(S.prefs && S.prefs.subject)) return runOnboarding(main, lang, ctx);
  return renderClassicPicker(main, lang, ctx);
}
