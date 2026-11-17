// Trung tâm TOEIC: bài học theo Part, luyện tập từng Part, đề thi thử có giờ, chấm điểm và lịch sử.
// API: /api/toeic/...  (cần đăng nhập; mọi thao tác ghi đều cần CSRF)
import { PARTS, SECTIONS, LESSONS, QUESTIONS, PASSAGES, MOCK_TESTS, SCALE_NOTE, partOf, questionsOfPart, passageOf, estimateScore } from "./toeic-bank.js";

export async function initToeic(db) {
  const isPg = !!db.pool; // PgDb co connection pool; SQLite thi khong
  await db.prepare(`CREATE TABLE IF NOT EXISTS toeic_attempts (
    id ${isPg ? "SERIAL PRIMARY KEY" : "INTEGER PRIMARY KEY AUTOINCREMENT"},
    user_id INTEGER NOT NULL,
    kind TEXT NOT NULL,            -- 'lesson' | 'drill' | 'test'
    part INTEGER,                  -- Part 1–7 (drill, lesson)
    test_id TEXT,                  -- mã đề (test)
    correct INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    score_json TEXT,               -- điểm quy đổi ước tính (test)
    answers_json TEXT,             -- đáp án đã chọn {mã câu: chỉ số}
    seconds INTEGER,
    created_at TEXT NOT NULL
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_toeic_user ON toeic_attempts(user_id, kind)").run();
  return { parts: PARTS.length, questions: QUESTIONS.length };
}

const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj[k]]));

// Câu hỏi gửi cho máy khách: không có đáp án đúng và giải thích.
function publicQuestion(q) {
  return { id: q.id, part: q.part, scene: q.scene || null, audio: q.audio || null, prompt: q.prompt || null, q: q.q || null, passage: q.passage || null, blank: q.blank || null, options: q.options };
}
function usedPassages(list) {
  const out = {};
  for (const q of list) if (q.passage && !out[q.passage]) out[q.passage] = PASSAGES[q.passage];
  return out;
}
function review(q, chosen) {
  const ok = chosen === q.answer;
  return { id: q.id, part: q.part, chosen: chosen === undefined ? null : chosen, answer: q.answer, correct: ok, explain: q.explain, options: q.options };
}
function parseAnswers(raw, allowed) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  for (const id of Object.keys(raw)) {
    const q = allowed.get(id);
    const v = Number(raw[id]);
    if (!q || !Number.isInteger(v) || v < 0 || v >= q.options.length) continue;
    out[id] = v;
  }
  return out;
}

async function attemptStats(db, userId) {
  const rows = await db.prepare("SELECT kind, part, test_id, correct, total, score_json, created_at FROM toeic_attempts WHERE user_id = ? ORDER BY id DESC LIMIT 400").all(userId);
  return rows;
}

export async function toeicApi(ctx) {
  const { db, req, res, url, method, user, sess, sendJson, readBody, requireCsrf, hit, nowIso } = ctx;
  const en = ctx.lang === "en";
  const p = url.pathname;
  if (!p.startsWith("/api/toeic")) return false;
  if (!user) { sendJson(res, 401, { error: en ? "Please sign in." : "Vui lòng đăng nhập." }); return true; }
  const allQ = new Map(QUESTIONS.map((q) => [q.id, q]));

  // ---- Tổng quan
  if (method === "GET" && p === "/api/toeic/overview") {
    const rows = await attemptStats(db, user.id);
    const parts = PARTS.map((pt) => {
      const drills = rows.filter((r) => r.kind === "drill" && r.part === pt.n);
      const lessons = rows.filter((r) => r.kind === "lesson" && r.part === pt.n);
      const best = drills.reduce((m, r) => Math.max(m, r.total ? r.correct / r.total : 0), 0);
      const last = drills[0] || null;
      return { ...pick(pt, ["n", "section", "title", "titleEn", "count", "minutes", "hint"]), drillAttempts: drills.length, bestAccuracy: Math.round(best * 100), lastAccuracy: last && last.total ? Math.round((last.correct / last.total) * 100) : null, lessonSeen: lessons.length > 0 };
    });
    const tests = MOCK_TESTS.map((t) => {
      const last = rows.find((r) => r.kind === "test" && r.test_id === t.id) || null;
      return { ...pick(t, ["id", "title", "titleEn", "minutes", "note"]), count: QUESTIONS.length, attempts: rows.filter((r) => r.kind === "test" && r.test_id === t.id).length, last: last ? { createdAt: last.created_at, score: JSON.parse(last.score_json || "{}") } : null };
    });
    // Gợi ý: Part đã làm mà tỉ lệ đúng thấp nhất; chưa làm gì thì bắt đầu Part 1
    const tried = parts.filter((x) => x.drillAttempts > 0).sort((a, b) => a.bestAccuracy - b.bestAccuracy);
    const suggestion = tried.length ? { part: tried[0].n, reason: en ? `Part ${tried[0].n} has the lowest best accuracy so far.` : `Part ${tried[0].n} là phần có tỉ lệ đúng thấp nhất hiện tại.` } : { part: 1, reason: en ? "Start with Part 1 to learn the format." : "Bắt đầu từ Part 1 để làm quen dạng bài." };
    const totalDrillCorrect = rows.filter((r) => r.kind === "drill").reduce((s, r) => s + r.correct, 0);
    sendJson(res, 200, { parts, tests, sections: SECTIONS, suggestion, totalDrillCorrect, scaleNote: SCALE_NOTE, questionCount: QUESTIONS.length });
    return true;
  }

  // ---- Bài học
  if (method === "GET" && p === "/api/toeic/lessons") {
    sendJson(res, 200, { lessons: LESSONS, parts: PARTS });
    return true;
  }
  let m = /^\/api\/toeic\/lessons\/(\d)\/seen$/.exec(p);
  if (method === "POST" && m) {
    if (!requireCsrf(req, sess)) { sendJson(res, 403, { error: "Phiên làm việc không hợp lệ, hãy tải lại trang." }); return true; }
    const n = Number(m[1]);
    if (!partOf(n)) { sendJson(res, 404, { error: "Không tìm thấy Part." }); return true; }
    await db.prepare("INSERT INTO toeic_attempts (user_id, kind, part, correct, total, created_at) VALUES (?, 'lesson', ?, 0, 0, ?)").run(user.id, n, nowIso());
    sendJson(res, 200, { ok: true });
    return true;
  }

  // ---- Luyện tập theo Part
  m = /^\/api\/toeic\/drill\/(\d)$/.exec(p);
  if (method === "GET" && m) {
    const n = Number(m[1]);
    const pt = partOf(n);
    if (!pt) { sendJson(res, 404, { error: "Không tìm thấy Part." }); return true; }
    const list = questionsOfPart(n);
    sendJson(res, 200, { part: pt, questions: list.map(publicQuestion), passages: usedPassages(list), minutes: pt.minutes, count: list.length });
    return true;
  }
  m = /^\/api\/toeic\/drill\/(\d)\/check$/.exec(p);
  if (method === "POST" && m) {
    if (!requireCsrf(req, sess)) { sendJson(res, 403, { error: "Phiên làm việc không hợp lệ, hãy tải lại trang." }); return true; }
    if (hit("toeic:" + user.id, 40, 60000)) { sendJson(res, 429, { error: "Bạn nộp bài quá nhanh. Hãy chờ một chút." }); return true; }
    const n = Number(m[1]);
    const pt = partOf(n);
    if (!pt) { sendJson(res, 404, { error: "Không tìm thấy Part." }); return true; }
    const body = (await readBody(req)) || {};
    const list = questionsOfPart(n);
    const ansMap = new Map(list.map((q) => [q.id, q]));
    const answers = parseAnswers(body.answers, ansMap);
    const results = list.map((q) => review(q, answers[q.id]));
    const correct = results.filter((r) => r.correct && answers[r.id] !== undefined).length;
    const answered = Object.keys(answers).length;
    await db.prepare("INSERT INTO toeic_attempts (user_id, kind, part, correct, total, answers_json, seconds, created_at) VALUES (?, 'drill', ?, ?, ?, ?, ?, ?)")
      .run(user.id, n, correct, list.length, JSON.stringify(answers), Math.max(0, Math.min(86400, Number(body.seconds) || 0)), nowIso());
    sendJson(res, 200, { correct, total: list.length, answered, results, passages: usedPassages(list) });
    return true;
  }

  // ---- Đề thi thử
  if (method === "GET" && p === "/api/toeic/tests") {
    const rows = await attemptStats(db, user.id);
    sendJson(res, 200, { tests: MOCK_TESTS.map((t) => ({ ...t, count: QUESTIONS.length, attempts: rows.filter((r) => r.kind === "test" && r.test_id === t.id).length })), scaleNote: SCALE_NOTE, sections: SECTIONS });
    return true;
  }
  m = /^\/api\/toeic\/tests\/([\w-]+)$/.exec(p);
  if (method === "GET" && m) {
    const t = MOCK_TESTS.find((x) => x.id === m[1]);
    if (!t) { sendJson(res, 404, { error: "Không tìm thấy đề thi." }); return true; }
    sendJson(res, 200, { test: t, questions: QUESTIONS.map(publicQuestion), passages: usedPassages(QUESTIONS), parts: PARTS, minutes: t.minutes });
    return true;
  }
  m = /^\/api\/toeic\/tests\/([\w-]+)\/submit$/.exec(p);
  if (method === "POST" && m) {
    if (!requireCsrf(req, sess)) { sendJson(res, 403, { error: "Phiên làm việc không hợp lệ, hãy tải lại trang." }); return true; }
    if (hit("toeic:" + user.id, 40, 60000)) { sendJson(res, 429, { error: "Bạn nộp bài quá nhanh. Hãy chờ một chút." }); return true; }
    const t = MOCK_TESTS.find((x) => x.id === m[1]);
    if (!t) { sendJson(res, 404, { error: "Không tìm thấy đề thi." }); return true; }
    const body = (await readBody(req)) || {};
    const answers = parseAnswers(body.answers, allQ);
    const results = QUESTIONS.map((q) => review(q, answers[q.id]));
    const listening = results.filter((r) => r.correct && partOf(allQ.get(r.id).part).section === "listening").length;
    const reading = results.filter((r) => r.correct && partOf(allQ.get(r.id).part).section === "reading").length;
    const score = { ...estimateScore(listening, reading), listeningCorrect: listening, readingCorrect: reading, listeningTotal: 51, readingTotal: 49, note: SCALE_NOTE };
    const correct = listening + reading;
    const seconds = Math.max(0, Math.min(86400, Number(body.seconds) || 0));
    const ins = await db.prepare("INSERT INTO toeic_attempts (user_id, kind, part, test_id, correct, total, score_json, answers_json, seconds, created_at) VALUES (?, 'test', NULL, ?, ?, ?, ?, ?, ?, ?) RETURNING id")
      .run(user.id, t.id, correct, QUESTIONS.length, JSON.stringify(score), JSON.stringify(answers), seconds, nowIso());
    sendJson(res, 200, { id: Number(ins.lastInsertRowid), score, correct, total: QUESTIONS.length, seconds, results, passages: usedPassages(QUESTIONS), createdAt: nowIso() });
    return true;
  }

  // ---- Lịch sử & kết quả
  m = /^\/api\/toeic\/attempts\/(\d+)$/.exec(p);
  if (method === "GET" && m) {
    const row = await db.prepare("SELECT * FROM toeic_attempts WHERE id = ? AND user_id = ?").get(Number(m[1]), user.id);
    if (!row || row.kind !== "test") { sendJson(res, 404, { error: "Không tìm thấy bài làm." }); return true; }
    const answers = JSON.parse(row.answers_json || "{}");
    const results = QUESTIONS.map((q) => review(q, answers[q.id]));
    sendJson(res, 200, { id: row.id, test_id: row.test_id, score: JSON.parse(row.score_json || "{}"), correct: row.correct, total: row.total, seconds: row.seconds, results, passages: usedPassages(QUESTIONS), createdAt: row.created_at });
    return true;
  }
  if (method === "GET" && p === "/api/toeic/history") {
    const rows = await db.prepare("SELECT id, kind, part, test_id, correct, total, score_json, seconds, created_at FROM toeic_attempts WHERE user_id = ? AND kind IN ('drill','test') ORDER BY id DESC LIMIT 60").all(user.id);
    const byPart = PARTS.map((pt) => {
      const d = rows.filter((r) => r.kind === "drill" && r.part === pt.n);
      const c = d.reduce((s, r) => s + r.correct, 0), t = d.reduce((s, r) => s + r.total, 0);
      return { n: pt.n, title: pt.title, titleEn: pt.titleEn, attempts: d.length, accuracy: t ? Math.round((c / t) * 100) : null };
    });
    sendJson(res, 200, { attempts: rows.map((r) => ({ ...r, score: r.score_json ? JSON.parse(r.score_json) : null })), byPart });
    return true;
  }
  return false;
}
