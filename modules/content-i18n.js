// Python Lab 4.0 — Bilingual support for LEARNING CONTENT (lessons, curriculum chapters).
// - Same content ID for both languages; translations live in the content_translations table.
// - Only translations with status = 'published' are served to learners. AI drafts always start as 'draft' and
//   can only be published by a human admin after checking the review confirmation box.
// - DO NOT translate code: syntax, examples, starter code, reference solutions, tests, and expected outputs stay unchanged.
// - If a translation (or a specific field) is missing, fall back to Vietnamese for that part.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LESSONS, findLesson } from "../lessons.js";
import { CHAPTERS } from "../curriculum.js";
import { CHAPTER_EN, EXERCISE_EN, LESSON_EN, LESSON_FULL_EN, EXAM_EN, LESSON_EN_ADD, LESSON_FULL_EN_ADD, QUIZ_EXPLAIN_EN } from "../en-content.js";

export const LANGS = ["vi", "en"];
const nowIso = () => new Date().toISOString();
const MAX = 20000;

// ---------- Extract translatable fields from the Vietnamese original ----------
function lessonSource(l) {
  return {
    title: l.title, description: l.description, objectives: l.objectives, why: l.why, concept: l.concept,
    walkthrough: l.walkthrough, mistakes: l.mistakes.map((m) => ({ why: m.why })), summary: l.summary,
    practice: l.practice.map((p) => ({ id: p.id, title: p.title, prompt: p.prompt })),
    quiz: l.quiz.map((q) => ({ q: q.q, options: q.options, explain: q.explain || "" })),
  };
}
function chapterSource(c) {
  return {
    title: c.title, theory: c.theory,
    exercises: c.exercises.map((e) => ({ id: e.id, title: e.title, prompt: e.prompt })),
    exam: c.exam ? { codePrompt: c.exam.code.prompt, mcq: c.exam.mcq.map((q) => ({ id: q.id, q: q.q, options: q.options })) } : null,
  };
}
export const CONTENT_TYPES = {
  lesson: { label: "Bài học", list: () => LESSONS, find: (id) => findLesson(id), source: lessonSource, name: (x) => x.title },
  chapter: { label: "Chương giáo trình", list: () => CHAPTERS, find: (id) => CHAPTERS.find((c) => c.id === id), source: chapterSource, name: (x) => x.title },
};
export function sourceOf(type, id) {
  const T = CONTENT_TYPES[type]; if (!T) return null;
  const x = T.find(id); return x ? T.source(x) : null;
}
export const sourceHash = (src) => crypto.createHash("sha1").update(JSON.stringify(src)).digest("hex").slice(0, 12);

// ---------- Validate that a translation matches the original schema ----------
// Returns sanitized { data } (keeping only allowed fields) or { error }.
export function validateTranslation(src, data) {
  const errs = [];
  const walk = (s, d, at) => {
    if (typeof s === "string") {
      if (d == null || d === "") return s === "" ? "" : undefined; // empty = fall back to Vietnamese
      if (typeof d !== "string") { errs.push(`${at}: phải là chuỗi`); return undefined; }
      if (d.length > MAX) { errs.push(`${at}: quá dài`); return undefined; }
      return d;
    }
    if (Array.isArray(s)) {
      if (d == null) return undefined;
      if (!Array.isArray(d) || d.length !== s.length) { errs.push(`${at}: cần đúng ${s.length} phần tử`); return undefined; }
      return s.map((x, i) => walk(x, d[i], `${at}[${i}]`));
    }
    if (s && typeof s === "object") {
      if (d == null) return undefined;
      if (typeof d !== "object" || Array.isArray(d)) { errs.push(`${at}: sai kiểu`); return undefined; }
      const o = {};
      for (const k of Object.keys(s)) {
        if (k === "id") { if (d.id !== undefined && d.id !== s.id) errs.push(`${at}.id: không được đổi mã (${s.id})`); o.id = s.id; continue; }
        const v = walk(s[k], d[k], at ? `${at}.${k}` : k);
        if (v !== undefined) o[k] = v;
      }
      return o;
    }
    return undefined;
  };
  const clean = walk(src, data, "");
  return errs.length ? { error: errs.slice(0, 5).join("; ") } : { data: clean || {} };
}

// Overlay translation onto the original (only fields that have a translation).
function overlay(base, tr) {
  if (tr == null) return base;
  if (typeof base === "string") return typeof tr === "string" && tr ? tr : base;
  if (Array.isArray(base)) return Array.isArray(tr) ? base.map((b, i) => overlay(b, tr[i])) : base;
  if (base && typeof base === "object") { const o = { ...base }; for (const k of Object.keys(tr)) if (k in base && k !== "id") o[k] = overlay(base[k], tr[k]); return o; }
  return base;
}

// ---------- Read published translation (cached, invalidated on write) ----------
let CACHE = new Map();
export function invalidate() { CACHE = new Map(); }
export async function hasTranslationRecord(db, type, id, lang = "en") {
  try { return !!(await db.prepare("SELECT 1 FROM content_translations WHERE content_type = ? AND content_id = ? AND lang = ? LIMIT 1").get(type, id, lang)); }
  catch { return false; }
}
export async function getPublished(db, type, id, lang) {
  if (lang !== "en") return null;
  const k = `${type}:${id}:${lang}`;
  if (CACHE.has(k)) return CACHE.get(k);
  const r = await db.prepare("SELECT data_json FROM content_translations WHERE content_type = ? AND content_id = ? AND lang = ? AND status = 'published'").get(type, id, lang);
  let v = null;
  if (r) { try { v = JSON.parse(r.data_json); } catch { v = null; } }
  CACHE.set(k, v);
  return v;
}

// Request language: X-Lang header (sent by UI VI/EN toggle) > user profile > vi
export function reqLang(req, user) {
  const h = String(req.headers["x-lang"] || "").toLowerCase();
  if (h === "en" || h === "vi") return h;
  // Public API clients may select a language with ?lang=; profile is the fallback.
  let queryLang = "";
  try { queryLang = new URL(req.url || "/", "http://pythonlab.local").searchParams.get("lang") || ""; } catch {}
  if (queryLang === "en" || queryLang === "vi") return queryLang;
  return user && user.lang === "en" ? "en" : "vi";
}

// Apply translation to outline or full lesson data (lessonFull)
export async function localizeLesson(db, obj, lang, { allowBuiltinFallback = false } = {}) {
  if (lang !== "en") return { ...obj, lang: "vi", translated: false };
  // Built-in English text is the safe fallback; reviewed database translations win field-by-field.
  const hasRecord = await hasTranslationRecord(db, "lesson", obj.id, lang);
  const builtin = hasRecord && !allowBuiltinFallback ? {} : { ...(LESSON_EN[obj.id] || {}), ...(LESSON_EN_ADD[obj.id] || {}), ...(LESSON_FULL_EN[obj.id] || {}), ...(LESSON_FULL_EN_ADD[obj.id] || {}) };
  const published = (await getPublished(db, "lesson", obj.id, lang)) || {};
  const translated = Object.keys(builtin).length > 0 || Object.keys(published).length > 0;
  if (!translated) return { ...obj, lang: "vi", translated: false };
  const tr = { ...builtin, ...published };
  const quizExplain = (hasRecord && !allowBuiltinFallback) ? undefined : QUIZ_EXPLAIN_EN[obj.id];
  const o = { ...obj, lang: "en", translated: true };
  for (const k of ["title", "description", "why", "concept"]) if (k in obj) o[k] = overlay(obj[k], tr[k]);
  for (const k of ["objectives", "walkthrough", "summary"]) if (Array.isArray(obj[k])) o[k] = overlay(obj[k], tr[k]);
  if (Array.isArray(obj.mistakes)) o.mistakes = obj.mistakes.map((m, i) => ({ ...m, why: overlay(m.why, tr.mistakes?.[i]?.why) }));
  if (Array.isArray(obj.practice)) o.practice = obj.practice.map((p) => { const t = (tr.practice || []).find((x) => x.id === p.id); return t ? { ...p, title: overlay(p.title, t.title), prompt: overlay(p.prompt, t.prompt) } : p; });
  if (Array.isArray(obj.quiz)) o.quiz = obj.quiz.map((q, i) => { const t = tr.quiz?.[i]; const ex = t?.explain ?? quizExplain?.[i]; return t || ex ? { ...q, q: overlay(q.q, t?.q), options: overlay(q.options, t?.options), ...(q.explain !== undefined ? { explain: overlay(q.explain, ex) } : {}) } : q; });
  return o;
}
// Quick quiz explanation (used when grading) — admin translation wins, then fallback to
// built-in (QUIZ_EXPLAIN_EN) when no DB record exists, and finally Vietnamese.
export async function lessonQuizExplain(db, lessonId, i, lang, fallback) {
  const tr = await getPublished(db, "lesson", lessonId, lang);
  if (tr && tr.quiz && tr.quiz[i] && tr.quiz[i].explain) return tr.quiz[i].explain;
  if (lang === "en" && !(await hasTranslationRecord(db, "lesson", lessonId, lang))) {
    const builtin = QUIZ_EXPLAIN_EN[lessonId]?.[i];
    if (builtin) return builtin;
  }
  return fallback;
}
// Curriculum chapter (condensed object for /api/curriculum)
export async function localizeChapter(db, ch, lang) {
  if (lang !== "en") return { ...ch, translated: false };
  const hasRecord = await hasTranslationRecord(db, "chapter", ch.id, lang);
  const builtin = hasRecord ? {} : (CHAPTER_EN[ch.id] || {});
  const published = (await getPublished(db, "chapter", ch.id, lang)) || {};
  const tr = { ...builtin, ...published };
  const builtExercises = new Map(ch.exercises.map((e) => [e.id, EXERCISE_EN[e.id] || {}]));
  const pubExercises = new Map((published.exercises || []).map((e) => [e.id, e]));
  return {
    ...ch,
    title: overlay(ch.title, tr.title),
    theory: overlay(ch.theory, tr.theory),
    // objectives: take the whole EN array (EN has 3 items, VI has 2) — index-based merging
    // like overlay() would drop the 3rd item.
    objectives: (tr.objectives && tr.objectives.length ? tr.objectives : (ch.objectives || [])),
    translated: Object.keys(builtin).length > 0 || Object.keys(published).length > 0,
    exercises: ch.exercises.map((e) => {
      const fallback = builtExercises.get(e.id) || {};
      const authored = pubExercises.get(e.id) || {};
      const t = { ...fallback, ...authored };
      return { ...e, title: overlay(e.title, t.title), prompt: overlay(e.prompt, t.prompt), translated: !!(fallback.title || fallback.prompt || authored.title || authored.prompt) };
    }),
  };
}
export async function localizeExercise(db, chapterId, e, lang) {
  if (lang !== "en") return e;
  const tr = await getPublished(db, "chapter", chapterId, lang);
  const hasRecord = await hasTranslationRecord(db, "chapter", chapterId, lang);
  const published = (tr?.exercises || []).find((x) => x.id === e.id) || {};
  const t = { ...(hasRecord ? {} : (EXERCISE_EN[e.id] || {})), ...published };
  return { ...e, title: overlay(e.title, t.title), prompt: overlay(e.prompt, t.prompt), translated: !!(t.title || t.prompt) };
}
export async function localizeExam(db, chapterId, exam, lang) {
  // exam: { questions:[{id,q,options}], codePrompt } — built-in EXAM_EN serves as
  // fallback (following localizeChapter pattern); published admin translation wins if present.
  if (lang !== "en") return exam;
  const hasRecord = await hasTranslationRecord(db, "chapter", chapterId, lang);
  const builtin = hasRecord ? {} : (EXAM_EN[chapterId] || {});
  const published = (await getPublished(db, "chapter", chapterId, lang)) || {};
  const trExam = { ...builtin, ...(published.exam || {}) };
  const m = new Map((trExam.mcq || []).map((q) => [q.id, q]));
  return { ...exam, codePrompt: overlay(exam.codePrompt, trExam.codePrompt), questions: exam.questions.map((q) => { const t = m.get(q.id); return t ? { ...q, q: overlay(q.q, t.q), options: overlay(q.options, t.options) } : q; }) };
}

// ---------- Admin ----------
async function row(db, type, id, lang) { return db.prepare("SELECT * FROM content_translations WHERE content_type = ? AND content_id = ? AND lang = ?").get(type, id, lang); }
async function audit(db, actorId, action, target, detail) {
  await db.prepare("INSERT INTO audit_logs (actor_id, action, target, detail, ip, created_at) VALUES (?, ?, ?, ?, '', ?)").run(actorId ?? null, action, target, JSON.stringify(detail || {}), nowIso());
}
function view(r, src) {
  if (!r) return null;
  let data = {};
  try {
    const parsed = JSON.parse(r.data_json);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      data = parsed;
    }
  } catch {}
  const srcHash = data._srcHash || ""; delete data._srcHash;
  return { status: r.status, origin: r.origin, updatedAt: r.updated_at, publishedAt: r.published_at, reviewedBy: r.reviewed_by, stale: !!srcHash && srcHash !== sourceHash(src), data };
}
export async function listContent(db, lang = "en") {
  const rows = new Map((await db.prepare("SELECT * FROM content_translations WHERE lang = ?").all(lang)).map((r) => [`${r.content_type}:${r.content_id}`, r]));
  const out = [];
  for (const [type, T] of Object.entries(CONTENT_TYPES)) for (const x of T.list()) {
    const src = T.source(x); const v = view(rows.get(`${type}:${x.id}`), src);
    out.push({ type, id: x.id, title: T.name(x), status: v ? v.status : "none", origin: v ? v.origin : null, stale: v ? v.stale : false, updatedAt: v ? v.updatedAt : null });
  }
  return out;
}
export async function getContent(db, type, id, lang = "en") {
  const src = sourceOf(type, id); if (!src) return null;
  return { type, id, lang, source: src, translation: view(await row(db, type, id, lang), src) };
}
// Save draft (human or AI). Never auto-publishes.
export async function saveDraft(db, { type, id, lang = "en", data, origin, actorId }) {
  const src = sourceOf(type, id); if (!src) return { status: 404, error: "Không tìm thấy nội dung." };
  if (lang !== "en") return { status: 400, error: "Chỉ hỗ trợ bản dịch tiếng Anh." };
  const v = validateTranslation(src, data); if (v.error) return { status: 400, error: v.error };
  const old = await row(db, type, id, lang);
  if (old && old.status === "published" && origin === "ai") return { status: 409, error: "Bản dịch đang xuất bản. Gỡ xuất bản trước khi tạo bản nháp AI mới." };
  const json = JSON.stringify({ ...v.data, _srcHash: sourceHash(src) });
  const org = origin === "ai" ? "ai" : old && old.origin === "ai" ? "ai_edited" : origin || "human";
  if (old) await db.prepare("UPDATE content_translations SET data_json = ?, status = 'draft', origin = ?, updated_by = ?, reviewed_by = NULL, updated_at = ?, published_at = NULL WHERE id = ?").run(json, org, actorId ?? null, nowIso(), old.id);
  else await db.prepare("INSERT INTO content_translations (content_type, content_id, lang, data_json, status, origin, updated_by, updated_at) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?)").run(type, id, lang, json, org, actorId ?? null, nowIso());
  invalidate();
  await audit(db, actorId, "i18n.save_draft", `${type}:${id}:${lang}`, { origin: org, wasPublished: old?.status === "published" });
  return { ok: true };
}
// Publish: only triggered by a human admin, requires review confirmation.
export async function publish(db, { type, id, lang = "en", reviewed, actorId }) {
  const r = await row(db, type, id, lang); if (!r) return { status: 404, error: "Chưa có bản dịch." };
  if (reviewed !== true) return { status: 400, error: "Hãy xác nhận đã đọc và kiểm tra bản dịch trước khi xuất bản." };
  if (r.status === "published") return { ok: true };
  await db.prepare("UPDATE content_translations SET status = 'published', reviewed_by = ?, published_at = ? WHERE id = ?").run(actorId, nowIso(), r.id);
  invalidate();
  await audit(db, actorId, "i18n.publish", `${type}:${id}:${lang}`, { origin: r.origin });
  return { ok: true };
}
export async function unpublish(db, { type, id, lang = "en", actorId }) {
  const r = await row(db, type, id, lang); if (!r) return { status: 404, error: "Chưa có bản dịch." };
  await db.prepare("UPDATE content_translations SET status = 'draft', published_at = NULL WHERE id = ?").run(r.id);
  invalidate();
  await audit(db, actorId, "i18n.unpublish", `${type}:${id}:${lang}`, {});
  return { ok: true };
}

// Translation prompt for AI: return JSON matching the exact schema, keeping code and printed output strings unchanged.
export const TRANSLATE_SYSTEM = `You translate Vietnamese Python course content into clear, friendly English for beginners.
Rules:
- Output ONLY one JSON object with exactly the same structure, keys, array lengths and "id" values as the input. No markdown fences.
- Translate natural-language text only. Never translate or change Python code, identifiers, variable names, function names, keywords or anything in quotes inside code.
- Text that the program must print (expected output such as "Xin chào Python", "Chẵn", "Lẻ") must stay EXACTLY as in Vietnamese, because the grader checks it.
- Keep line breaks (\\n) in the same places.`;
export function parseAiJson(text) {
  const t = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a < 0 || b < a) throw new Error("AI không trả JSON hợp lệ.");
  return JSON.parse(t.slice(a, b + 1));
}

// Pre-seed English drafts for 10 lessons (AI-generated, draft status — requires admin approval).
// Never overwrite any existing record in the database.
export async function seedLessonDrafts(db, log = console) {
  const f = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "content", "i18n", "lessons.en.json");
  if (!fs.existsSync(f)) return 0;
  let all = {}; try { all = JSON.parse(fs.readFileSync(f, "utf8")); } catch { return 0; }
  let n = 0;
  for (const [id, data] of Object.entries(all)) {
    const src = sourceOf("lesson", id); if (!src || (await row(db, "lesson", id, "en"))) continue;
    const v = validateTranslation(src, data); if (v.error) { log.warn?.(`[i18n] bỏ qua bản nháp ${id}: ${v.error}`); continue; }
    await db.prepare("INSERT INTO content_translations (content_type, content_id, lang, data_json, status, origin, updated_at) VALUES ('lesson', ?, 'en', ?, 'draft', 'ai', ?)").run(id, JSON.stringify({ ...v.data, _srcHash: sourceHash(src) }), nowIso());
    n++;
  }
  if (n) { invalidate(); log.log?.(`[i18n] Đã nạp ${n} bản nháp tiếng Anh cho bài học (chờ quản trị duyệt).`); }
  return n;
}
