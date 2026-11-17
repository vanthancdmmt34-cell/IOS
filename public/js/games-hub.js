/* LifeRivo Mini Games Arcade (#/tro-choi)
   Đề và đáp án do máy chủ giữ (modules/pet-games.js). Trình duyệt chỉ hiển thị đề và gửi từng câu trả lời để máy chủ chấm;
   thưởng năng lượng và tri thức chỉ cộng cho câu máy chủ chấm là đúng. Điểm kỷ lục lưu cục bộ trong pl:games. */
import { S, api, esc, icon, toast, fmtN } from "./core.js";
import { getSubject } from "./lang.js";
import { refreshPet, petView, startGameSession, judgeGame } from "./pet-state.js";
import { ChibiMascot, GameCard, SuccessModal, LoadingState, EmptyState } from "./chibi-ds.js";

const GAME_META = [
  { id: "match", title: "Ghép từ", tag: "Từ vựng", icon: "🧩", tint: "#F3EFFF", desc: "Tạo cặp từ đúng nghĩa" },
  { id: "quiz", title: "Phản xạ nhanh", tag: "Trắc nghiệm", icon: "⚡", tint: "#FFF1E6", desc: "Chọn đáp án trong 10 giây" },
  { id: "listen", title: "Nghe và chọn", tag: "Luyện nghe", icon: "🎧", tint: "#EAF5FF", desc: "Nhận diện từ đã nghe" },
  { id: "memory", title: "Thẻ ghi nhớ", tag: "Ghi nhớ", icon: "🃏", tint: "#EEFAEB", desc: "Ôn từ theo cặp thẻ" },
  { id: "builder", title: "Ghép câu", tag: "Ghép câu", icon: "🧱", tint: "#F3EFFF", desc: "Sắp xếp từ thành câu chuẩn" },
  { id: "race", title: "Đua tốc độ 45s", tag: "Tốc độ", icon: "🏁", tint: "#FFF9E8", desc: "Trả lời nhanh trong 45 giây" },
  { id: "spell", title: "Chính tả", tag: "Chính tả", icon: "✍️", tint: "#FCE7F3", desc: "Nghe và gõ đúng từng chữ" },
  { id: "unscramble", title: "Sắp chữ", tag: "Từ vựng", icon: "🔤", tint: "#FFF4E8", desc: "Ghép chữ cái thành từ đúng" },
  { id: "truefalse", title: "Đúng hay Sai", tag: "Phản xạ", icon: "✔️", tint: "#E9FBF3", desc: "Kiểm tra nghĩa đúng sai nhanh" },
];

const LS_KEY = "pl:games";
function loadScores() { try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; } }
function saveScore(key, pts) {
  const d = loadScores();
  d[key] = Math.max(Number(d[key]) || 0, pts);
  try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch {}
  return d[key];
}

// Thông tin hiển thị đầu trang (số từ, số câu của khóa học) — không dùng để chấm điểm
async function fetchRealBank(langId) {
  const lang = await api("/api/lang");
  const course = (lang.courses || []).find((c) => c.id === langId) || (lang.courses || [])[0];
  if (!course) return { course: null, words: [], sentences: [] };
  const words = [];
  const sentences = [];
  const freeLevels = (course.levels || []).filter((l) => !l.locked);
  const picks = [];
  for (const l of freeLevels) {
    for (const u of (l.units || []).slice(0, 6)) {
      picks.push({ levelId: l.id, unitId: u.id });
      if (picks.length >= 12) break;
    }
    if (picks.length >= 12) break;
  }
  const theories = await Promise.all(
    picks.map((p) => api(`/api/lang/theory/${course.id}/${p.levelId}/${encodeURIComponent(p.unitId)}`).catch(() => null))
  );
  let speech = "en-US";
  for (const res of theories) {
    const t = res && res.theory;
    if (!t) continue;
    if (t.speech) speech = t.speech;
    for (const w of t.words || []) {
      if (w.word && w.meaning && !words.some((x) => x.word === w.word)) {
        words.push({ word: String(w.word), reading: String(w.reading || ""), meaning: String(w.meaning) });
      }
    }
    for (const s of t.sentences || []) {
      if (s.text && s.meaning && String(s.text).trim().split(/\s+/).length >= 3) {
        sentences.push({ text: String(s.text), meaning: String(s.meaning) });
      }
    }
  }
  return { course, speech, courses: lang.courses || [], words, sentences };
}

export async function pageGamesHub(main, [paramLang], query, ctx) {
  let activeLang = ["en", "zh", "ja", "ko", "fr", "es"].includes(paramLang) ? paramLang : (getSubject() || "en");
  ctx.setCrumbs([["Học viên", "/app/"], ["Trò chơi học tập"]]);
  main.innerHTML = `<div class="lh cg-page">${LoadingState({ label: "Đang tải từ vựng thật từ khóa học…" })}</div>`;

  let bank;
  try {
    bank = await fetchRealBank(activeLang);
  } catch (e) {
    if (ctx.isCurrent()) main.innerHTML = `<div class="lh">${EmptyState({ title: "Không tải được kho từ vựng", message: e.message })}</div>`;
    return;
  }
  if (!ctx.isCurrent()) return;

  await refreshPet();
  // Mỗi trò tối đa 200 câu. Tối đa 200 năng lượng từ trò chơi mỗi ngày: đủ rồi thì báo quay lại hôm sau.
  const CAP_MSG = "Bạn đã thu thập đủ 200 năng lượng từ trò chơi hôm nay. Hãy quay lại vào ngày mai. Nếu tiếp tục chơi, bạn sẽ không được cộng điểm nữa.";
  let capNotified = false;
  const capReached = () => { const v = petView(); return !!(v && (v.gameEnergyToday || 0) >= (v.gameEnergyLimit || 200)); };
  const noteCap = () => { if (capNotified) return; capNotified = true; toast(CAP_MSG, "info"); };

  let timerId = 0;
  let cur = null;         // lượt chơi hiện tại: { id, items, total, speech }
  let answering = false;  // đang chờ máy chủ chấm hoặc đang hiện phản hồi
  let live = false;       // đang trong một trò chơi (để bỏ qua hẹn giờ khi đã thoát)
  ctx.onLeave(() => { live = false; if (timerId) clearInterval(timerId); });

  // Gửi một đáp án lên máy chủ để chấm. Trả về kết quả, hoặc null nếu lỗi.
  const judge = async (body) => {
    try {
      const r = await judgeGame(cur.id, body);
      if (r.ok && r.gameEnergyLeft === 0) noteCap();
      return r;
    } catch (e) {
      toast(e.message, "info");
      return null;
    }
  };

  // Phát âm từ đáp án do máy chủ tạo; trình duyệt không nhận chữ của đáp án
  const playAudio = async (i, quiet = false) => {
    try {
      const r = await fetch("/api/me/pet/game/audio", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", ...(S.csrf ? { "X-CSRF-Token": S.csrf } : {}) },
        body: JSON.stringify({ session: cur.id, i }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "Chưa phát được âm thanh.");
      }
      const url = URL.createObjectURL(await r.blob());
      const a = new Audio(url);
      a.onended = () => URL.revokeObjectURL(url);
      await a.play();
    } catch (e) {
      if (!quiet) toast(e.message, "info");
    }
  };

  // Phản hồi khi chọn: đúng thì viền xanh quanh lựa chọn và báo "Đúng rồi"; sai thì viền đỏ và đáp án đúng (viền xanh).
  // Sau đó mới sang câu tiếp theo.
  const answer = (el, ok, msg, next, reveal) => {
    answering = true;
    if (el) el.classList.add(ok ? "cg-right" : "cg-wrong");
    if (!ok && reveal) reveal.classList.add("cg-right");
    toast(msg, ok ? "ok" : "info");
    setTimeout(() => { answering = false; if (live && ctx.isCurrent()) next(); }, ok ? 650 : 1000);
  };

  const renderHub = () => {
    live = false;
    if (timerId) { clearInterval(timerId); timerId = 0; }
    const scores = loadScores();
    const c = bank.course;
    main.innerHTML = `
    <div class="lh cg-page">
      <div class="cg-m-head">
        <h1>Học mà chơi</h1>
        <p>Chọn thử thách ngắn để ôn từ và phản xạ.</p>
      </div>
      <section class="cg-hero">
        <div>
          <span class="edu-eyebrow">${c ? `${c.flag} ${esc(c.name)}` : ""} · MINI GAMES</span>
          <h1>Khu trò chơi học ngoại ngữ</h1>
          <p>Toàn bộ ${GAME_META.length} trò chơi đều lấy từ vựng và mẫu câu thật trong giáo trình <b>${esc(c ? c.name : "")}</b> (${fmtN(bank.words.length)} từ · ${fmtN(bank.sentences.length)} câu).</p>
          <div class="cg-lang-bar" role="group" aria-label="Chọn ngôn ngữ chơi">
            ${(bank.courses || []).map((x) => `<a class="chip ${x.id === c?.id ? "on" : ""}" href="/app/tro-choi/${x.id}">${x.flag} ${esc(x.name)}</a>`).join("")}
          </div>
        </div>
        ${ChibiMascot({ state: "welcome", size: 96, caption: "Chọn 1 trò chơi để rèn phản xạ!" })}
      </section>
      ${capReached() ? `<div class="cg-cap" role="status">${CAP_MSG}</div>` : ""}
      <div class="cg-grid">
        ${GAME_META.map((g) => GameCard({ ...g, best: scores[`${c?.id || activeLang}:${g.id}`] || 0 })).join("")}
      </div>
      <div class="sheet sheet-pad cg-m-streak-card">
        <b>Chuỗi thử thách</b>
        <p>Hoàn thành 3 trò chơi để nhận huy hiệu chăm học.</p>
      </div>
    </div>`;
    main.querySelectorAll("[data-game]").forEach((btn) => {
      btn.addEventListener("click", () => startGame(btn.dataset.game));
    });
  };

  const finishGame = (gameId, score, right, total) => {
    live = false;
    if (timerId) { clearInterval(timerId); timerId = 0; }
    const best = saveScore(`${bank.course?.id || activeLang}:${gameId}`, score);
    const g = GAME_META.find((x) => x.id === gameId);
    SuccessModal({
      title: `Hoàn thành ${g ? g.title : ""}!`,
      xp: Math.max(10, Math.round(score / 4)),
      body: `Bạn đạt ${score} điểm (${right}/${total} chính xác) · Kỷ lục: ${best} điểm.`,
      ctaLabel: "Về khu trò chơi",
    });
    renderHub();
  };

  const startGame = async (gameId) => {
    if (bank.words.length < 4) { toast("Chưa đủ từ vựng trong môn này để chơi.", "info"); return; }
    answering = false;
    live = false;
    main.innerHTML = `<div class="lh cg-page">${LoadingState({ label: "Máy chủ đang chuẩn bị câu hỏi…" })}</div>`;
    try {
      const s = await startGameSession(gameId, bank.course?.id || activeLang);
      cur = { id: s.session, items: s.items, total: s.total, speech: s.speech || "en-US" };
    } catch (e) {
      toast(e.message, "info");
      renderHub();
      return;
    }
    if (!ctx.isCurrent()) return;
    live = true;
    if (capReached()) noteCap();
    if (gameId === "match") runMatching();
    else if (gameId === "quiz" || gameId === "listen") runMcq(gameId === "listen");
    else if (gameId === "builder") runBuilder();
    else if (gameId === "race") runRace();
    else if (gameId === "spell") runSpelling();
    else if (gameId === "memory") runMemory();
    else if (gameId === "unscramble") runUnscramble();
    else if (gameId === "truefalse") runTrueFalse();
  };

  const gameShell = (title, guide, bodyHtml, masState = "learning") => {
    main.innerHTML = `<div class="lh cg-page">
      ${capReached() ? `<div class="cg-cap" role="status">${CAP_MSG}</div>` : ""}
      <div class="cg-bar"><button type="button" class="btn btn-sm" id="cgBack">${icon("left")} Quay lại</button><b>${esc(title)}</b><span></span></div>
      <section class="cg-stage">
        <div class="cg-stage-top">${ChibiMascot({ state: masState, size: 74, caption: guide })}</div>
        <div class="cg-board">${bodyHtml}</div>
      </section>
    </div>`;
    main.querySelector("#cgBack")?.addEventListener("click", renderHub);
  };

  // Trắc nghiệm nghĩa (quiz) và nghe chọn từ (listen)
  function runMcq(isListen) {
    let idx = 0, score = 0, right = 0;
    const items = cur.items;
    const draw = () => {
      const it = items[idx];
      gameShell(isListen ? "Listening Challenge" : "Word Quiz", isListen ? "Bấm nghe phát âm rồi chọn đáp án đúng!" : "Chọn nhanh nghĩa tiếng Việt chính xác!", `
        <div class="cg-score">Câu <b>${idx + 1}/${items.length}</b> · Điểm: <b>${score}</b></div>
        <div class="cg-prompt">${isListen
          ? `<button type="button" class="btn btn-primary" id="cgPlayAudio">🔊 Nghe từ vựng mẫu</button>`
          : `<b class="cg-word">${esc(it.prompt)}</b>${it.reading ? `<small>${esc(it.reading)}</small>` : ""}`}</div>
        <div class="cg-opts">${it.options.map((o) => `<button type="button" class="cds-quiz-opt" data-ans="${esc(o.id)}">${esc(o.label)}</button>`).join("")}</div>
      `, isListen ? "listening" : "learning");
      if (isListen) {
        main.querySelector("#cgPlayAudio")?.addEventListener("click", () => playAudio(idx, false));
        setTimeout(() => playAudio(idx, true), 120);
      }
      main.querySelectorAll("[data-ans]").forEach((b) => b.addEventListener("click", async () => {
        if (answering) return;
        answering = true;
        const r = await judge({ i: idx, answer: b.dataset.ans });
        if (!r) { answering = false; return; }
        if (r.ok) { score += 15; right++; }
        answer(b, r.ok, r.ok ? "Đúng rồi! +15 điểm" : `Chưa đúng. Đáp án: ${r.expected ?? ""}`, () => {
          idx++;
          if (idx >= items.length) finishGame(isListen ? "listen" : "quiz", score, right, items.length);
          else draw();
        }, r.ok ? null : [...main.querySelectorAll("[data-ans]")].find((x) => x.dataset.ans === String(r.expected)));
      }));
    };
    draw();
  }

  // Đua từ: 45 giây, trả lời càng nhanh càng tốt
  function runRace() {
    let idx = 0, score = 0, right = 0, secs = 45;
    const items = cur.items;
    const draw = () => {
      const it = items[idx];
      gameShell("Vocabulary Race", "Trả lời nhanh nhất có thể trước khi hết 45 giây!", `
        <div class="cg-score">⏱ Còn <b id="cgSecs">${secs}s</b> · Điểm: <b>${score}</b></div>
        <div class="cg-prompt"><b class="cg-word">${esc(it.prompt)}</b></div>
        <div class="cg-opts">${it.options.map((o) => `<button type="button" class="cds-quiz-opt" data-race="${esc(o.id)}">${esc(o.label)}</button>`).join("")}</div>
      `, "speaking");
      main.querySelectorAll("[data-race]").forEach((b) => b.addEventListener("click", async () => {
        if (answering) return;
        answering = true;
        const r = await judge({ i: idx, answer: b.dataset.race });
        if (!r) { answering = false; return; }
        if (r.ok) { score += 10; right++; }
        answer(b, r.ok, r.ok ? "Đúng rồi! +10 điểm" : `Chưa đúng. Đáp án: ${r.expected ?? ""}`, () => {
          idx++;
          if (idx >= items.length) finishGame("race", score, right, idx);
          else draw();
        }, r.ok ? null : [...main.querySelectorAll("[data-race]")].find((x) => x.dataset.race === String(r.expected)));
      }));
    };
    draw();
    timerId = setInterval(() => {
      secs--;
      const el = main.querySelector("#cgSecs");
      if (el) el.textContent = `${secs}s`;
      if (secs <= 0) finishGame("race", score, right, idx || 1);
    }, 1000);
  }

  // Ghép câu: bấm các từ theo đúng thứ tự
  function runBuilder() {
    let idx = 0, score = 0, right = 0;
    const items = cur.items;
    const draw = () => {
      const it = items[idx];
      const chosen = []; // vị trí trong it.tokens theo thứ tự người chơi bấm
      const paint = () => {
        const left = it.tokens.map((t, k) => ({ t, k })).filter((x) => !chosen.includes(x.k));
        gameShell("Sentence Builder", "Bấm chọn các từ theo đúng thứ tự câu!", `
          <div class="cg-score">Câu <b>${idx + 1}/${items.length}</b> · Điểm: <b>${score}</b></div>
          <p class="cg-meaning">Nghĩa: <b>${esc(it.meaning)}</b></p>
          <div class="lx-line">${chosen.length ? chosen.map((k, pos) => `<button type="button" class="lx-tok" data-rm="${pos}">${esc(it.tokens[k])}</button>`).join("") : `<span class="muted">Chọn từ bên dưới để ghép câu…</span>`}</div>
          <div class="lx-bank">${left.map((x) => `<button type="button" class="lx-tok" data-add="${x.k}">${esc(x.t)}</button>`).join("")}</div>
          <div class="row" style="margin-top:12px"><button type="button" class="btn btn-primary" id="cgCheckSent">Kiểm tra</button></div>
        `);
        main.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => { chosen.push(Number(b.dataset.add)); paint(); }));
        main.querySelectorAll("[data-rm]").forEach((b) => b.addEventListener("click", () => { chosen.splice(Number(b.dataset.rm), 1); paint(); }));
        main.querySelector("#cgCheckSent")?.addEventListener("click", async () => {
          if (answering || !chosen.length) return;
          answering = true;
          const r = await judge({ i: idx, answer: chosen.map((k) => it.tokens[k]) });
          if (!r) { answering = false; return; }
          if (r.ok) { score += 25; right++; }
          answer(main.querySelector(".lx-line"), r.ok, r.ok ? "Đúng rồi! +25 điểm" : `Chưa đúng. Câu đúng: ${r.expected ?? ""}`, () => {
            idx++;
            if (idx >= items.length) finishGame("builder", score, right, items.length);
            else draw();
          });
        });
      };
      paint();
    };
    draw();
  }

  // Chính tả: nghe và gõ đúng từ
  function runSpelling() {
    let idx = 0, score = 0, right = 0;
    const items = cur.items;
    const draw = () => {
      const it = items[idx];
      gameShell("Spelling Challenge", "Nghe âm và gõ chính xác từ vựng tương ứng!", `
        <div class="cg-score">Câu <b>${idx + 1}/${items.length}</b> · Điểm: <b>${score}</b></div>
        <p class="cg-meaning">Nghĩa: <b>${esc(it.meaning)}</b> <button type="button" class="btn btn-sm" id="cgSpellSay">🔊 Nghe</button></p>
        <form id="cgSpellForm" class="cg-spell-form">
          <input class="input" id="cgSpellIn" placeholder="Gõ chính xác từ…" autocomplete="off" autofocus>
          <button type="submit" class="btn btn-primary">Kiểm tra</button>
        </form>
      `);
      main.querySelector("#cgSpellSay")?.addEventListener("click", () => playAudio(idx, false));
      main.querySelector("#cgSpellForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (answering) return;
        const inp = main.querySelector("#cgSpellIn");
        const val = (inp?.value || "").trim();
        if (!val) return;
        answering = true;
        const r = await judge({ i: idx, answer: val });
        if (!r) { answering = false; return; }
        if (r.ok) { score += 20; right++; }
        answer(inp, r.ok, r.ok ? "Đúng rồi! +20 điểm" : `Chưa đúng. Từ đúng là: ${r.expected ?? ""}`, () => {
          idx++;
          if (idx >= items.length) finishGame("spell", score, right, items.length);
          else draw();
        });
      });
    };
    draw();
  }

  // Đúng hay sai: xem cặp từ và nghĩa, chọn đúng hoặc sai
  function runTrueFalse() {
    let idx = 0, score = 0, right = 0;
    const items = cur.items;
    const draw = () => {
      const it = items[idx];
      gameShell("Đúng hay sai?", "Nghĩa này có đúng với từ không?", `
        <div class="cg-score">Câu ${idx + 1}/${items.length} · Điểm: <b>${score}</b></div>
        <div class="cg-tf-card"><b class="cg-tf-word">${esc(it.word)}</b><span class="cg-tf-mean">= ${esc(it.meaning)}</span></div>
        <div class="cg-tf-act">
          <button type="button" class="btn btn-lg" data-tf="1">✅ Đúng</button>
          <button type="button" class="btn btn-lg" data-tf="0">❌ Sai</button>
        </div>`);
      main.querySelectorAll("[data-tf]").forEach((b) => b.addEventListener("click", async () => {
        if (answering) return;
        answering = true;
        const r = await judge({ i: idx, answer: b.dataset.tf === "1" });
        if (!r) { answering = false; return; }
        if (r.ok) { score += 10; right++; }
        answer(b, r.ok, r.ok ? "Đúng rồi! +10 điểm" : `Chưa đúng. Đáp án: ${r.expected ? "Đúng" : "Sai"}`, () => {
          idx++;
          if (idx >= items.length) finishGame("truefalse", score, right, items.length);
          else draw();
        }, r.ok ? null : main.querySelector(`[data-tf="${r.expected ? 1 : 0}"]`));
      }));
    };
    draw();
  }

  // Sắp chữ: bấm các chữ xáo trộn theo đúng thứ tự. Mỗi câu chỉ một lần kiểm tra.
  function runUnscramble() {
    let idx = 0, score = 0, right = 0, pool = [], built = [];
    const items = cur.items;
    const newRound = () => { pool = items[idx].letters.map((ch, k) => ({ ch, k })); built = []; };
    const draw = () => {
      const it = items[idx];
      gameShell("Sắp chữ", `Nghĩa: ${it.meaning}. Bấm các chữ theo đúng thứ tự để ghép thành từ.`, `
        <div class="cg-score">Câu ${idx + 1}/${items.length} · Điểm: <b>${score}</b></div>
        <div class="cg-unscramble-built">${built.length ? built.map((x, p) => `<button type="button" class="cds-quiz-opt" data-back="${p}">${esc(x.ch)}</button>`).join("") : `<span class="muted">Bấm chữ bên dưới…</span>`}</div>
        <div class="cg-unscramble-pool">${pool.map((x, p) => `<button type="button" class="cds-quiz-opt" data-pick="${p}" ${built.includes(x) ? "disabled" : ""}>${esc(x.ch)}</button>`).join("")}</div>
        <div class="cg-unscramble-act"><button type="button" class="btn btn-sm" id="cgUnCheck" ${built.length === 0 ? "disabled" : ""}>Kiểm tra</button></div>`);
      main.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => { built.push(pool[Number(b.dataset.pick)]); draw(); }));
      main.querySelectorAll("[data-back]").forEach((b) => b.addEventListener("click", () => { built.splice(Number(b.dataset.back), 1); draw(); }));
      main.querySelector("#cgUnCheck")?.addEventListener("click", check);
    };
    const check = async () => {
      if (answering || !built.length) return;
      answering = true;
      const r = await judge({ i: idx, answer: built.map((x) => x.ch).join("") });
      if (!r) { answering = false; return; }
      if (r.ok) { score += 20; right++; }
      answer(main.querySelector(".cg-unscramble-built"), r.ok, r.ok ? "Đúng rồi! +20 điểm" : `Chưa đúng. Đáp án: ${r.expected ?? ""}`, () => {
        idx++;
        if (idx >= items.length) { finishGame("unscramble", score, right, items.length); return; }
        newRound();
        draw();
      });
    };
    newRound();
    draw();
  }

  // Nối từ: chọn một từ bên trái rồi chọn nghĩa bên phải. Mỗi vòng 6 cặp; máy chủ chấm từng cặp.
  function runMatching() {
    let ri = 0, selL = null, selR = null, busy = false, score = 0, tries = 0, solved = 0;
    let matched = new Set();
    const rounds = cur.items;
    const total = cur.total;
    const draw = () => {
      const rd = rounds[ri];
      gameShell("Word Matching", "Chọn 1 từ bên trái rồi ghép với nghĩa đúng bên phải!", `
        <div class="cg-score">Đã ghép: <b>${solved}/${total}</b> · Điểm: <b>${score}</b></div>
        <div class="cg-match-cols" id="cgMatchCols">
          <div class="cg-col">${rd.lefts.map((x) => `<button type="button" class="cds-quiz-opt ${matched.has(x.t) ? "cg-gone" : selL === x.t ? "sel" : ""}" data-l="${x.t}" ${matched.has(x.t) ? "disabled" : ""}>${esc(x.label)}</button>`).join("")}</div>
          <div class="cg-col">${rd.rights.map((x) => `<button type="button" class="cds-quiz-opt ${matched.has(x.t) ? "cg-gone" : selR === x.t ? "sel" : ""}" data-r="${x.t}" ${matched.has(x.t) ? "disabled" : ""}>${esc(x.label)}</button>`).join("")}</div>
        </div>`);
      main.querySelectorAll("[data-l]").forEach((b) => b.addEventListener("click", () => { if (busy) return; selL = b.dataset.l; check(); }));
      main.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { if (busy) return; selR = b.dataset.r; check(); }));
    };
    // Đúng: hai ô xanh + dây xanh có chấm chạy, rồi hai từ biến mất. Sai: hai ô đỏ + dây đỏ, rồi tắt và báo không đúng.
    const flash = (ok, done) => {
      busy = true;
      const cols = main.querySelector("#cgMatchCols");
      const bl = main.querySelector(`[data-l="${selL}"]`);
      const br = main.querySelector(`[data-r="${selR}"]`);
      const cls = ok ? "cg-ok" : "cg-bad";
      if (ok) toast("Đúng rồi!", "ok");
      if (cols && bl && br) {
        bl.classList.remove("sel"); br.classList.remove("sel");
        bl.classList.add(cls); br.classList.add(cls);
        const box = cols.getBoundingClientRect();
        const a = bl.getBoundingClientRect(), b = br.getBoundingClientRect();
        const side = b.left >= a.right - 4; // hai cột cạnh nhau (máy tính) hoặc xếp dọc (điện thoại)
        const x1 = side ? a.right - box.left : a.left + a.width / 2 - box.left;
        const y1 = side ? a.top + a.height / 2 - box.top : a.bottom - box.top;
        const x2 = side ? b.left - box.left : b.left + b.width / 2 - box.left;
        const y2 = side ? b.top + b.height / 2 - box.top : b.top - box.top;
        const NS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(NS, "svg");
        svg.setAttribute("class", `cg-link ${cls}`);
        svg.setAttribute("width", box.width);
        svg.setAttribute("height", box.height);
        // Đường vẽ dần từ lựa chọn này sang lựa chọn kia, kèm một chấm sáng chạy theo đúng hướng đó
        const d = `M ${x1} ${y1} L ${x2} ${y2}`;
        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", d);
        path.setAttribute("pathLength", "1");
        svg.appendChild(path);
        const dot = document.createElementNS(NS, "circle");
        dot.setAttribute("class", "cg-dot");
        dot.setAttribute("r", "6");
        dot.setAttribute("cx", x1);
        dot.setAttribute("cy", y1);
        const motion = document.createElementNS(NS, "animateMotion");
        motion.setAttribute("dur", "0.45s");
        motion.setAttribute("fill", "freeze");
        motion.setAttribute("path", `M 0 0 L ${x2 - x1} ${y2 - y1}`);
        dot.appendChild(motion);
        svg.appendChild(dot);
        cols.appendChild(svg);
      }
      setTimeout(() => {
        busy = false;
        if (main.querySelector("#cgMatchCols")) done();
      }, 800);
    };
    const check = async () => {
      if (selL === null || selR === null) { draw(); return; }
      const rd = rounds[ri];
      busy = true;
      const r = await judge({ answer: { left: selL, right: selR } });
      if (!r) { selL = null; selR = null; busy = false; draw(); return; }
      tries++;
      flash(r.ok, () => {
        if (r.ok) {
          matched.add(selL); matched.add(selR);
          score += 20; solved++;
          if (solved >= total) { finishGame("match", score, solved, tries); return; }
          if (matched.size === rd.lefts.length * 2) { ri++; matched = new Set(); }
        } else {
          score = Math.max(0, score - 5);
          toast("Không đúng, thử lại nhé!", "info");
        }
        selL = null; selR = null; draw();
      });
    };
    draw();
  }

  // Lật thẻ ghi nhớ: lật 2 thẻ, máy chủ chấm cặp đúng. Mỗi vòng 6 cặp đến đủ 200 cặp.
  function runMemory() {
    let ri = 0, open = [], found = new Set(), busy = false, moves = 0, solved = 0;
    const rounds = cur.items;
    const total = cur.total;
    const draw = () => {
      const rd = rounds[ri];
      gameShell("Lật thẻ ghi nhớ", "Lật 2 thẻ để tìm từ và nghĩa khớp nhau!", `
        <div class="cg-score">Đã khớp: <b>${solved}/${total}</b> · Lượt lật: <b>${moves}</b></div>
        <div class="cg-memory">${rd.cards.map((c) => {
          const isFound = found.has(c.t);
          const up = open.includes(c.t) || isFound;
          const cls = isFound ? "cg-card cg-card-ok" : up ? "cg-card cg-card-up" : "cg-card";
          return `<button type="button" class="${cls}" data-t="${c.t}" ${up || busy ? "disabled" : ""}>${up ? esc(c.label) : "?"}</button>`;
        }).join("")}</div>`);
      main.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => flip(b.dataset.t)));
    };
    const flip = async (t) => {
      if (busy || open.includes(t) || found.has(t)) return;
      open.push(t);
      if (open.length < 2) { draw(); return; }
      busy = true;
      moves++;
      const [a, b] = open;
      const r = await judge({ answer: { a, b } });
      if (!r) { open = []; busy = false; draw(); return; }
      if (r.ok) {
        found.add(a); found.add(b);
        solved++;
        toast("Đúng rồi!", "ok");
        open = [];
        busy = false;
        if (solved >= total) { finishGame("memory", solved * 20, solved, total); return; }
        if (found.size === rounds[ri].cards.length) { ri++; found = new Set(); }
        draw();
      } else {
        toast("Chưa khớp, thử lại nhé!", "info");
        draw();
        setTimeout(() => {
          open = []; busy = false;
          if (main.querySelector(".cg-memory")) draw();
        }, 800);
      }
    };
    draw();
  }

  renderHub();
}
