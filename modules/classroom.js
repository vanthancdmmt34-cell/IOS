// Classrooms, members, invites, assignments, class exams, reports, family, licenses (admin) — 4.0.0.
// Permission rules (checked on EVERY route on the server):
//  - Teachers can only view/edit classes they manage (teacher_id). Other classes return 404 (IDOR protection).
//  - Admins can view all classes, create classes, and assign teachers.
//  - Students can only view classes they belong to, assignments given to them, and their own submissions.
//  - Parents can only view progress of family members who HAVE enabled progress sharing.
import { weakPasswordReason } from "./passwords.js";
import crypto from "node:crypto";
import { can } from "./entitlements.js";
import { allocateSeat, releaseSeatIfUnused, licenseSummary, issueLicense } from "./licenses.js";
import { familyOf, inviteMember, respondInvite, removeMember, leaveFamily, myFamilyMembership } from "./family.js";
import { revokeSource } from "./entitlements.js";
import { buildXlsx } from "./xlsx.js";
import { publicAssignment, assignmentExercise as assignmentExerciseOf, studentAssignmentState as studentAssignmentStateOf, finalScore as finalScoreOf, isAssignmentTarget } from "./assignments.js";
import { notify, notifyMany } from "./notify.js";
import { bumpStreak } from "./languages.js";
// Tên hiển thị: viết hoa chữ cái đầu của mỗi từ
const capName = (v) => String(v || "").trim().split(" ").filter(Boolean).map((w) => w.charAt(0).toLocaleUpperCase("vi") + w.slice(1)).join(" ");

const nowIso = () => new Date().toISOString();
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const code = (n) => [...crypto.randomBytes(n)].map((b) => ALPHA[b % ALPHA.length]).join("");
const int = (v, d, min, max) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
const isoOrNull = (v) => { if (!v) return null; const d = new Date(v); return isNaN(d) ? undefined : d.toISOString(); };
const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };

export function createClassroomApi(ctx) {
  const { db, sendJson, readBody, requireCsrf, hit, clientIp } = ctx;
  const ok = (res, o) => { sendJson(res, 200, o); return true; };
  const bad = (res, c, e, x = {}) => { sendJson(res, c, { error: e, ...x }); return true; };
  // 4.9.9: SQLite returns synchronous results (no .catch) -> wrap in Promise to support both SQLite and PostgreSQL
  const audit = (uid, action, target, detail, req) => { Promise.resolve().then(() => db.prepare("INSERT INTO audit_logs (actor_id, action, target, detail, ip, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(uid ?? null, action, String(target), JSON.stringify(detail ?? {}), req ? clientIp(req) : "", nowIso())).catch(() => {}); };
  const tx = async (fn) => db.tx(async (t) => fn(t));

  const isAdmin = (u) => u.role === "admin";
  const canCreateClass = async (u) => isAdmin(u) || (u.role === "teacher" && await can(db, u, "class_create"));
  // Class the user is allowed to MANAGE (assigned teacher or admin); otherwise null -> 404
  const managedClass = async (u, id) => { const c = await db.prepare("SELECT * FROM classrooms WHERE id = ?").get(Number(id)); return c && (isAdmin(u) || c.teacher_id === u.id) ? c : null; };
  const membership = (d, classId, userId) => d.prepare("SELECT * FROM class_members WHERE class_id = ? AND user_id = ?").get(classId, userId);
  const activeMember = async (d, classId, userId) => { const m = await membership(d, classId, userId); return m && m.status === "active" ? m : null; };
  const activeClassUserIds = async (classId, excludeUserId) => {
    const rows = await db.prepare("SELECT user_id FROM class_members WHERE class_id = ? AND status = 'active'").all(classId);
    return rows.map((r) => Number(r.user_id)).filter((uid) => uid && uid !== excludeUserId);
  };
  const teacherIsAdmin = async (d, c) => { const t = await d.prepare("SELECT role FROM users WHERE id = ?").get(c.teacher_id); return t && t.role === "admin"; };
  const newJoinCode = async () => { for (let i = 0; i < 20; i++) { const c = code(7); if (!(await db.prepare("SELECT 1 FROM classrooms WHERE join_code = ?").get(c))) return c; } throw new Error("Không tạo được mã lớp"); };
  const publicClass = (c, extra = {}) => ({ id: c.id, name: c.name, description: c.description, joinCode: c.join_code, status: c.status, maxMembers: c.max_members, requireApproval: !!c.require_approval, startsOn: c.starts_on, endsOn: c.ends_on, teacherId: c.teacher_id, createdAt: c.created_at, ...extra });

  // Activate member: reserve a license seat (for non-admin teachers). Call inside a transaction.
  async function activate(d, c, userId) {
    if (!(await teacherIsAdmin(d, c))) {
      const seat = await allocateSeat(d, { teacherId: c.teacher_id, userId });
      if (!seat.ok) return { error: seat.reason === "full" ? "Giấy phép của giáo viên đã hết chỗ học sinh. Giáo viên cần nâng cấp giấy phép." : "Giấy phép của giáo viên đã hết hạn. Hãy báo giáo viên gia hạn." };
    }
    const m = await membership(d, c.id, userId);
    if (m) await d.prepare("UPDATE class_members SET status = 'active', updated_at = ? WHERE id = ?").run(nowIso(), m.id);
    else await d.prepare("INSERT INTO class_members (class_id, user_id, status, joined_at, updated_at) VALUES (?, ?, 'active', ?, ?)").run(c.id, userId, nowIso(), nowIso());
    return { ok: true };
  }
  async function capacityLeft(d, c) {
    if (!c.max_members) return Infinity;
    return c.max_members - (await d.prepare("SELECT COUNT(*) AS n FROM class_members WHERE class_id = ? AND status IN ('active','pending','suspended')").get(c.id)).n;
  }
  async function joinClass(d, c, user) {
    if (c.status !== "active") return { error: "Lớp này đã đóng." };
    if (c.ends_on && new Date(c.ends_on) < new Date()) return { error: "Lớp này đã kết thúc." };
    if (c.teacher_id === user.id) return { error: "Bạn là giáo viên của lớp này." };
    const m = await membership(d, c.id, user.id);
    if (m && m.status === "active") return { ok: true, status: "active", already: true };
    if (m && m.status === "pending") return { ok: true, status: "pending", already: true };
    if (m && m.status === "suspended") return { error: "Bạn đang bị tạm khóa trong lớp này. Hãy liên hệ giáo viên." };
    if (m && m.status === "removed") return { error: "Giáo viên đã xóa bạn khỏi lớp này. Hãy liên hệ giáo viên nếu cần tham gia lại." };
    if ((await capacityLeft(d, c)) <= 0) return { error: "Lớp đã đủ thành viên." };
    if (c.require_approval) {
      if (m) await d.prepare("UPDATE class_members SET status = 'pending', updated_at = ? WHERE id = ?").run(nowIso(), m.id);
      else await d.prepare("INSERT INTO class_members (class_id, user_id, status, joined_at, updated_at) VALUES (?, ?, 'pending', ?, ?)").run(c.id, user.id, nowIso(), nowIso());
      return { ok: true, status: "pending" };
    }
    const r = await activate(d, c, user.id);
    return r.error ? r : { ok: true, status: "active" };
  }
  async function leaveOrRemove(d, c, userId, status, actorId, reason) {
    await d.prepare("UPDATE class_members SET status = ?, updated_at = ? WHERE class_id = ? AND user_id = ?").run(status, nowIso(), c.id, userId);
    await releaseSeatIfUnused(d, { teacherId: c.teacher_id, userId, actorId, reason });
  }

  // ---------- Assignments ----------
  const assignmentExercise = (a) => assignmentExerciseOf(a);
  const isTarget = (a, userId) => isAssignmentTarget(db, a, userId);
  const finalScore = finalScoreOf;
  const studentAssignmentState = (a, userId) => studentAssignmentStateOf(db, a, userId);
  const rubricFor = async (d, assignmentId) => (await d.prepare("SELECT id, title, description, max_score AS \"maxScore\", position FROM assignment_rubrics WHERE assignment_id = ? ORDER BY position, id").all(assignmentId));
  const rubricScoresFor = async (submissionId) => db.prepare(`SELECT s.criterion_id AS \"criterionId\", r.title, r.max_score AS \"maxScore\", s.score, s.comment
    FROM assignment_rubric_scores s JOIN assignment_rubrics r ON r.id = s.criterion_id
    WHERE s.submission_id = ? ORDER BY r.position, r.id`).all(submissionId);
  // publicAssignment imported from ./assignments.js

  // ---------- Exams ----------
  function resolveQuestion(spec) {
    if (!spec || spec.type !== "mcq") return null;
    const options = Array.isArray(spec.options) ? spec.options.map((o) => String(o).slice(0, 300)).filter(Boolean).slice(0, 6) : [];
    const answer = Number(spec.answer);
    if (!String(spec.q || "").trim() || options.length < 2 || !Number.isInteger(answer) || answer < 0 || answer >= options.length) return null;
    return { type: "mcq", points: int(spec.points, 1, 1, 100), payload: { q: String(spec.q).slice(0, 1000), options, answer } };
  }
  const testQuestions = async (testId) => (await db.prepare("SELECT * FROM class_test_questions WHERE test_id = ? ORDER BY idx").all(testId)).map((q) => ({ ...q, payload: JSON.parse(q.payload_json) }));
  function studentView(q) {
    return { id: q.id, type: "mcq", points: q.points, q: q.payload.q, options: q.payload.options };
  }
  const publicTest = (t) => ({ id: t.id, classId: t.class_id, title: t.title, instructions: t.instructions, durationMin: t.duration_min, openAt: t.open_at, dueAt: t.due_at, maxAttempts: t.max_attempts, shuffle: !!t.shuffle, status: t.status, createdAt: t.created_at });

  // ---------- Reports ----------
  async function classReport(c) {
    const members = await db.prepare("SELECT m.user_id, m.status, u.username, u.display_name FROM class_members m JOIN users u ON u.id = m.user_id WHERE m.class_id = ? AND m.status IN ('active','suspended') ORDER BY u.display_name").all(c.id);
    const asg = await db.prepare("SELECT * FROM assignments WHERE class_id = ? AND status <> 'deleted' ORDER BY id").all(c.id);
    const tests = await db.prepare("SELECT * FROM class_tests WHERE class_id = ? AND status <> 'deleted' ORDER BY id").all(c.id);
    const now = Date.now();
    const rows = await Promise.all(members.map(async (m) => {
      let done = 0, total = 0, sum = 0, graded = 0; const missing = [];
      for (const a of asg) {
        if (!a.target_all && !(await db.prepare("SELECT 1 FROM assignment_targets WHERE assignment_id = ? AND user_id = ?").get(a.id, m.user_id))) continue;
        total++;
        const st = await studentAssignmentState(a, m.user_id);
        if (st.passed || st.score != null) { done++; }
        if (st.score != null) { sum += st.score; graded++; }
        if (!st.passed && st.score == null && a.due_at && Date.parse(a.due_at) < now) missing.push(a.title);
      }
      const testScores = await Promise.all(tests.map(async (t) => { const b = await db.prepare("SELECT MAX(score) AS s, MAX(max_score) AS m FROM class_test_attempts WHERE test_id = ? AND user_id = ? AND status IN ('done','late')").get(t.id, m.user_id); return b && b.s != null ? Math.round((b.s / b.m) * 1000) / 100 : null; }));
      const weakChapters = [];
      const xpRow = await db.prepare("SELECT COALESCE(SUM(CASE WHEN best_score >= 80 THEN best_score ELSE 0 END), 0) AS xp FROM lang_progress WHERE user_id = ?").get(m.user_id).catch(() => ({ xp: 0 }));
      const xp = Number(xpRow?.xp) || 0;
      const entrance = await db.prepare("SELECT percent, submitted_at FROM learning_assessments WHERE user_id = ? AND kind = 'entrance' AND status = 'completed' ORDER BY submitted_at DESC, id DESC LIMIT 1").get(m.user_id);
      const weekly = await db.prepare("SELECT percent, submitted_at FROM learning_assessments WHERE user_id = ? AND kind = 'weekly' AND status = 'completed' ORDER BY submitted_at DESC, id DESC LIMIT 1").get(m.user_id);
      const learningProgress = {
        entrancePercent: entrance ? entrance.percent : null,
        weeklyPercent: weekly ? weekly.percent : null,
        change: entrance && weekly ? weekly.percent - entrance.percent : null,
        lastAssessmentAt: weekly?.submitted_at || entrance?.submitted_at || null,
      };
      const skillRows = [];
      const measuredSkills = skillRows.filter((x) => x.level !== "learning");
      const avg = graded ? Math.round((sum / graded) * 10) / 10 : null;
      const testAvg = testScores.filter((x) => x != null);
      return { userId: m.user_id, username: m.username, displayName: m.display_name, status: m.status, learningProgress, skillSummary: { chaptersMeasured: measuredSkills.length, averageMastery: measuredSkills.length ? Math.round(measuredSkills.reduce((n, x) => n + x.mastery, 0) / measuredSkills.length) : null, weakChapters: skillRows.filter((x) => x.level === "needs_practice" || x.level === "developing").slice(0, 3) }, skillRows, assignmentsDone: done, assignmentsTotal: total, completion: total ? Math.round((done / total) * 100) : 0, avgScore: avg, missing, testScores, testAvg: testAvg.length ? Math.round((testAvg.reduce((a, b) => a + b, 0) / testAvg.length) * 10) / 10 : null, weakChapters, xp, needsSupport: (total && done / total < 0.5) || (avg != null && avg < 5) || missing.length >= 2 };
    }));
    const all = rows.filter((r) => r.avgScore != null);
    const topicMap = new Map();
    for (const row of rows) for (const skill of (row.skillRows || [])) {
      if (!skill.attempted) continue;
      const entry = topicMap.get(skill.chapterId) || { chapterId: skill.chapterId, chapterTitle: skill.chapterTitle, students: 0, masterySum: 0, attempted: 0, total: 0 };
      entry.students++;
      entry.masterySum += Number(skill.mastery) || 0;
      entry.attempted += Number(skill.attempted) || 0;
      entry.total += Number(skill.total) || 0;
      topicMap.set(skill.chapterId, entry);
    }
    const weakTopics = [...topicMap.values()].map((x) => ({ ...x, averageMastery: Math.round(x.masterySum / x.students), coverage: x.total ? Math.round(x.attempted / x.total * 100) : 0 }))
      .sort((a, b) => a.averageMastery - b.averageMastery).slice(0, 10);
    return { class: publicClass(c), assignments: asg.map(publicAssignment), tests: tests.map(publicTest), rows, weakTopics, summary: { students: rows.length, avgScore: all.length ? Math.round((all.reduce((a, r) => a + r.avgScore, 0) / all.length) * 10) / 10 : null, completion: rows.length ? Math.round(rows.reduce((a, r) => a + r.completion, 0) / rows.length) : 0, needsSupport: rows.filter((r) => r.needsSupport).length } };
  }

  // ======================= ROUTER =======================
  // ---------- 4.0.1: teacher's students ----------
  const PW = "abcdefghjkmnpqrstuvwxyz23456789";
  const genPassword = () => [...crypto.randomBytes(8)].map((b) => PW[b % PW.length]).join("");
  const hitter = (k, n, ms) => (ctx.hit ? ctx.hit(k, n, ms) : false);
  const MEMBER_ST = "('active','pending','suspended')";
  async function isMyStudent(teacherId, st) {
    if (st.managed_by === teacherId) return true;
    return !!(await db.prepare(`SELECT 1 FROM class_members m JOIN classrooms c ON c.id = m.class_id WHERE c.teacher_id = ? AND m.user_id = ? AND m.status IN ${MEMBER_ST} AND c.status <> 'archived' LIMIT 1`).get(teacherId, st.id));
  }
  async function studentRow(teacherId, u) {
    const classes = await db.prepare(`SELECT c.id, c.name, m.status FROM class_members m JOIN classrooms c ON c.id = m.class_id WHERE c.teacher_id = ? AND m.user_id = ? AND m.status IN ${MEMBER_ST} AND c.status <> 'archived' ORDER BY c.id`).all(teacherId, u.id);
    const lp = await db.prepare("SELECT COALESCE(SUM(CASE WHEN best_score >= 80 THEN best_score ELSE 0 END), 0) AS xp, COALESCE(SUM(CASE WHEN best_score >= 80 THEN 1 ELSE 0 END), 0) AS solved, COUNT(*) AS tried, MAX(updated_at) AS t FROM lang_progress WHERE user_id = ?").get(u.id).catch(() => ({}));
    const last = lp?.t || null;
    const lastA = (await db.prepare("SELECT MAX(created_at) AS t FROM assignment_submissions WHERE user_id = ?").get(u.id)).t;
    const solved = Number(lp?.solved) || 0;
    return { id: u.id, username: u.username, displayName: u.display_name, disabled: !!u.disabled, managed: u.managed_by === teacherId, createdAt: u.created_at, classes, solved, xp: Number(lp?.xp) || 0, lessonsDone: Number(lp?.tried) || 0, lastActive: [last, lastA].filter(Boolean).sort().pop() || null };
  }
  async function teacherStudents(teacherId) {
    const rows = await db.prepare(`SELECT u.id, u.username, u.display_name, u.disabled, u.managed_by, u.created_at FROM users u WHERE u.role = 'student' AND (u.managed_by = ? OR u.id IN (SELECT m.user_id FROM class_members m JOIN classrooms c ON c.id = m.class_id WHERE c.teacher_id = ? AND m.status IN ${MEMBER_ST} AND c.status <> 'archived')) ORDER BY LOWER(u.display_name) LIMIT 2000`).all(teacherId, teacherId);
    return Promise.all(rows.map((u) => studentRow(teacherId, u)));
  }
  async function studentDetail(teacherId, st) {
    const base = await studentRow(teacherId, st);
    const ids = base.classes.map((c) => c.id);
    const asg = ids.length ? await Promise.all((await db.prepare(`SELECT * FROM assignments WHERE class_id IN (${ids.map(() => "?").join(",")}) AND status <> 'deleted' ORDER BY id DESC LIMIT 100`).all(...ids)).map(async (a) => ({ ...publicAssignment(a), className: (base.classes.find((c) => c.id === a.class_id) || {}).name, state: await studentAssignmentState(a, st.id) }))) : [];
    const recentRows = await db.prepare("SELECT item_id, best_score, last_score, updated_at FROM lang_progress WHERE user_id = ? ORDER BY updated_at DESC LIMIT 10").all(st.id).catch(() => []);
    const recent = recentRows.map((r) => ({ exerciseId: r.item_id, score: r.last_score ?? r.best_score ?? 0, maxScore: 100, createdAt: r.updated_at }));
    return { ...base, assignments: asg, recent };
  }
  async function teacherList(onlyId) {
    const t = nowIso();
    const rows = await db.prepare(`SELECT id, username, display_name, role, disabled, created_at FROM users WHERE ${onlyId ? "id = ?" : "role = 'teacher' OR (role = 'admin' AND id IN (SELECT teacher_id FROM classrooms))"} ORDER BY role DESC, LOWER(display_name)`).all(...(onlyId ? [onlyId] : []));
    return Promise.all(rows.map(async (u) => {
      const lic = await licenseSummary(db, u.id);
      const exp = (await db.prepare("SELECT MAX(expires_at) AS e FROM licenses WHERE owner_id = ? AND status = 'active' AND expires_at > ?").get(u.id, t)).e;
      return {
        id: u.id, username: u.username, displayName: u.display_name, role: u.role, disabled: !!u.disabled, createdAt: u.created_at,
        seats: lic.seats, used: lic.used, licenseExpiresAt: exp || null,
        classes: (await db.prepare("SELECT COUNT(*) AS n FROM classrooms WHERE teacher_id = ? AND status = 'active'").get(u.id)).n,
        students: (await db.prepare(`SELECT COUNT(DISTINCT m.user_id) AS n FROM class_members m JOIN classrooms c ON c.id = m.class_id WHERE c.teacher_id = ? AND m.status = 'active' AND c.status <> 'archived'`).get(u.id)).n,
        accounts: (await db.prepare("SELECT COUNT(*) AS n FROM users WHERE managed_by = ?").get(u.id)).n,
        lastLogin: (await db.prepare("SELECT MAX(created_at) AS t FROM sessions WHERE user_id = ?").get(u.id)).t || null,
      };
    }));
  }

  return async function handle(req, res, url, user, sess) {
    const m = req.method, p = url.pathname;
    const csrf = () => requireCsrf(req, sess);
    const body = async () => { const b = await readBody(req); return b; };
    let mt;
    if (m !== "GET" && !csrf()) return bad(res, 403, "Phiên làm việc không hợp lệ, hãy tải lại trang.");

    // ----- Teacher overview -----
    if (m === "GET" && p === "/api/teacher/overview") {
      if (!isAdmin(user) && user.role !== "teacher") return bad(res, 403, "Trang này dành cho giáo viên.");
      const classes = await db.prepare(`SELECT * FROM classrooms WHERE ${isAdmin(user) ? "1=1" : "teacher_id = ?"} AND status <> 'archived' ORDER BY id DESC`).all(...(isAdmin(user) ? [] : [user.id]));
      const ids = classes.map((c) => c.id);
      const ph = ids.map(() => "?").join(",") || "NULL";
      const students = ids.length ? (await db.prepare(`SELECT COUNT(DISTINCT user_id) AS n FROM class_members WHERE class_id IN (${ph}) AND status = 'active'`).get(...ids)).n : 0;
      const asgCount = ids.length ? (await db.prepare(`SELECT COUNT(*) AS n FROM assignments WHERE class_id IN (${ph}) AND status <> 'deleted'`).get(...ids)).n : 0;
      let missing = 0, scoreSum = 0, scoreN = 0; const support = [];
      for (const c of classes) {
        const rep = await classReport(c);
        for (const r of rep.rows) { missing += r.missing.length; if (r.avgScore != null) { scoreSum += r.avgScore; scoreN++; } if (r.needsSupport) support.push({ classId: c.id, className: c.name, userId: r.userId, displayName: r.displayName, completion: r.completion, avgScore: r.avgScore, missing: r.missing.length }); }
      }
      return ok(res, { canCreate: await canCreateClass(user), license: isAdmin(user) ? null : await licenseSummary(db, user.id), classes: await Promise.all(classes.map(async (c) => publicClass(c, { members: (await db.prepare("SELECT COUNT(*) AS n FROM class_members WHERE class_id = ? AND status = 'active'").get(c.id)).n, pending: (await db.prepare("SELECT COUNT(*) AS n FROM class_members WHERE class_id = ? AND status = 'pending'").get(c.id)).n }))), stats: { classes: classes.length, students, assignments: asgCount, missing, avgScore: scoreN ? Math.round((scoreSum / scoreN) * 10) / 10 : null }, needSupport: support.slice(0, 30) });
    }

    // ----- 4.0.1: Teacher's students (teachers manage their own students) -----
    if (p.startsWith("/api/teacher/students")) {
      if (!isAdmin(user) && user.role !== "teacher") return bad(res, 403, "Trang này dành cho giáo viên.");
      if (m === "GET" && p === "/api/teacher/students") return ok(res, { students: await teacherStudents(user.id), classes: await db.prepare("SELECT id, name, status FROM classrooms WHERE teacher_id = ? AND status <> 'archived' ORDER BY id DESC").all(user.id), canCreate: await canCreateClass(user), license: isAdmin(user) ? null : await licenseSummary(db, user.id) });
      if (m === "POST" && p === "/api/teacher/students") {
        if (!(await canCreateClass(user))) return bad(res, 403, "Cần giấy phép giáo viên còn hạn để tạo tài khoản học viên.");
        if (hitter("tstu:" + user.id, 20, 3600000)) return bad(res, 429, "Bạn tạo tài khoản quá nhiều lần trong 1 giờ. Hãy chờ ít phút.");
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const rows = (Array.isArray(b.accounts) ? b.accounts : []).slice(0, 100);
        if (!rows.length) return bad(res, 400, "Chưa có tài khoản nào để tạo.");
        let c = null;
        if (b.classId) { c = await managedClass(user, b.classId); if (!c || c.teacher_id !== user.id || c.status !== "active") return bad(res, 404, "Không tìm thấy lớp."); }
        const results = [];
        for (const r of rows) {
          const username = String(r.username || "").trim();
          const displayName = capName(String(r.displayName || "").trim() || username).slice(0, 40);
          let password = String(r.password || "").trim();
          const generated = !password;
          if (generated) password = genPassword();
          if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username)) { results.push({ username, error: "Tên đăng nhập chỉ gồm chữ không dấu, số, dấu _ . - và dài 3 đến 30 ký tự." }); continue; }
          if (password.length < 6 || password.length > 128) { results.push({ username, error: "Mật khẩu cần từ 6 đến 128 ký tự." }); continue; } { const __wk = weakPasswordReason(password); if (__wk) { results.push({ username, error: __wk }); continue; } }
          if (await db.prepare("SELECT 1 FROM users WHERE LOWER(username) = LOWER(?)").get(username)) { results.push({ username, error: "Tên đăng nhập đã có người dùng." }); continue; }
          if (c && (await capacityLeft(db, c)) <= 0) { results.push({ username, error: "Lớp đã đủ thành viên." }); continue; }
          try {
            const uid = await tx(async (t) => {
              const id = Number((await t.prepare("INSERT INTO users (username, display_name, password_hash, role, created_at, lang, managed_by) VALUES (?, ?, ?, 'student', ?, ?, ?) RETURNING id").run(username, displayName, ctx.hashPassword(password), nowIso(), user.lang === "en" ? "en" : "vi", user.id)).lastInsertRowid);
              if (c) { const a = await activate(t, c, id); if (a.error) throw Object.assign(new Error(a.error), { soft: true }); }
              return id;
            });
            audit(user.id, "teacher.student_create", "user:" + uid, { username, classId: c ? c.id : null }, req);
            if (c && uid !== user.id) {
              await notify(db, {
                userId: uid,
                kind: "class_added",
                title: `Bạn đã được thêm vào lớp «${c.name}»`,
                body: "Mở lớp để xem bài tập và thông báo.",
                link: `/app/lop/${c.id}`,
                payload: { classId: c.id },
              }).catch(() => {});
            }
            results.push({ username, displayName, ok: true, id: uid, password: generated ? password : undefined });
          } catch (e) { if (!e.soft) throw e; results.push({ username, error: e.message }); }
        }
        return ok(res, { results });
      }
      const sm = p.match(/^\/api\/teacher\/students\/(\d+)(\/password|\/lock)?$/);
      if (!sm) return bad(res, 404, "Không tìm thấy API này.");
      const st = await db.prepare("SELECT id, username, display_name, disabled, managed_by, role, created_at FROM users WHERE id = ?").get(Number(sm[1]));
      // Only students in this teacher's classes or created by this teacher (do not expose other accounts)
      if (!st || st.role !== "student" || !(await isMyStudent(user.id, st))) return bad(res, 404, "Không tìm thấy học viên.");
      const mine = st.managed_by === user.id;
      if (m === "GET" && !sm[2]) return ok(res, { student: await studentDetail(user.id, st) });
      // Reset password / lock / rename: only for accounts created by this teacher (self-registered accounts belong to the student)
      if (!mine) return bad(res, 403, "Học viên tự đăng ký tài khoản: chỉ học viên hoặc quản trị viên đổi được thông tin này.");
      const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
      if (m === "POST" && sm[2] === "/password") {
        let pw = String(b.password || "").trim(); const gen = !pw; if (gen) pw = genPassword();
        if (pw.length < 6 || pw.length > 128) return bad(res, 400, "Mật khẩu cần từ 6 đến 128 ký tự."); if (weakPasswordReason(pw)) return bad(res, 400, weakPasswordReason(pw));
        await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(ctx.hashPassword(pw), st.id);
        await db.prepare("DELETE FROM sessions WHERE user_id = ?").run(st.id);
        audit(user.id, "teacher.student_password", "user:" + st.id, {}, req);
        return ok(res, { ok: true, password: gen ? pw : undefined });
      }
      if (m === "POST" && sm[2] === "/lock") {
        await db.prepare("UPDATE users SET disabled = ? WHERE id = ?").run(b.disabled ? 1 : 0, st.id);
        if (b.disabled) await db.prepare("DELETE FROM sessions WHERE user_id = ?").run(st.id);
        audit(user.id, b.disabled ? "teacher.student_lock" : "teacher.student_unlock", "user:" + st.id, {}, req);
        return ok(res, { ok: true });
      }
      if (m === "PUT" && !sm[2]) return bad(res, 403, "Chỉ quản trị viên được đổi tên hiển thị.");
      return bad(res, 404, "Không tìm thấy API này.");
    }

    // ----- 4.0.1: Admin teacher management -----
    if (p.startsWith("/api/admin/teachers")) {
      if (!isAdmin(user)) return bad(res, 403, "Chỉ quản trị viên mới dùng được chức năng này.");
      if (m === "GET" && p === "/api/admin/teachers") return ok(res, { teachers: await teacherList() });
      if (m === "POST" && p === "/api/admin/teachers") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const username = String(b.username || "").trim(), displayName = capName(String(b.displayName || "").trim() || username).slice(0, 40);
        let password = String(b.password || "").trim(); const gen = !password; if (gen) password = genPassword();
        if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username)) return bad(res, 400, "Tên đăng nhập chỉ gồm chữ không dấu, số, dấu _ . - và dài 3 đến 30 ký tự.");
        if (password.length < 6 || password.length > 128) return bad(res, 400, "Mật khẩu cần từ 6 đến 128 ký tự."); if (weakPasswordReason(password)) return bad(res, 400, weakPasswordReason(password));
        if (await db.prepare("SELECT 1 FROM users WHERE LOWER(username) = LOWER(?)").get(username)) return bad(res, 400, "Tên đăng nhập này đã có người dùng.");
        const seats = int(b.seats, 0, 0, 5000), months = int(b.months, 0, 0, 36);
        const note = String(b.note || "").trim();
        if (seats && (!months || note.length < 3)) return bad(res, 400, "Cấp giấy phép cần số tháng (1–36) và lý do / số hợp đồng.");
        const id = await tx(async (t) => {
          const id = Number((await t.prepare("INSERT INTO users (username, display_name, password_hash, role, created_at) VALUES (?, ?, ?, 'teacher', ?) RETURNING id").run(username, displayName, ctx.hashPassword(password), nowIso())).lastInsertRowid);
          if (seats) await issueLicense(t, { ownerId: id, seats, months, source: "admin", note, actorId: user.id });
          return id;
        });
        audit(user.id, "admin.teacher_create", "user:" + id, { username, seats, months }, req);
        return ok(res, { id, password: gen ? password : undefined });
      }
      const tm = p.match(/^\/api\/admin\/teachers\/(\d+)(\/transfer)?$/);
      if (!tm) return bad(res, 404, "Không tìm thấy API này.");
      const t = await db.prepare("SELECT id, username, display_name, role, disabled FROM users WHERE id = ?").get(Number(tm[1]));
      if (!t || !["teacher", "admin"].includes(t.role)) return bad(res, 404, "Không tìm thấy giáo viên.");
      if (m === "GET" && !tm[2]) {
        return ok(res, { teacher: (await teacherList(t.id))[0] || null, classes: (await db.prepare("SELECT c.*, (SELECT COUNT(*) FROM class_members m WHERE m.class_id = c.id AND m.status = 'active') AS members FROM classrooms c WHERE c.teacher_id = ? ORDER BY c.status, c.id DESC").all(t.id)).map((c) => publicClass(c, { members: c.members })), students: await teacherStudents(t.id) });
      }
      // Transfer all classes + students created by a teacher to another teacher (e.g. when a teacher leaves)
      if (m === "POST" && tm[2] === "/transfer") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const to = await db.prepare("SELECT id, role FROM users WHERE id = ?").get(Number(b.toTeacherId));
        if (!to || !["teacher", "admin"].includes(to.role) || to.id === t.id) return bad(res, 400, "Hãy chọn giáo viên nhận khác giáo viên hiện tại.");
        const classes = await db.prepare("SELECT * FROM classrooms WHERE teacher_id = ? AND status <> 'archived'").all(t.id);
        const ids = classes.map((c) => c.id);
        const studs = ids.length ? (await db.prepare(`SELECT DISTINCT user_id FROM class_members WHERE class_id IN (${ids.map(() => "?").join(",")}) AND status IN ('active','suspended')`).all(...ids)).map((r) => r.user_id) : [];
        const r = await tx(async (txDb) => {
          if (to.role !== "admin") {
            const sum = await licenseSummary(txDb, to.id);
            let need = 0;
            for (const u of studs) { if (!(await txDb.prepare("SELECT 1 FROM license_seats s JOIN licenses l ON l.id = s.license_id WHERE l.owner_id = ? AND s.user_id = ? AND s.status = 'active' AND l.status = 'active' AND l.expires_at > ?").get(to.id, u, nowIso()))) need++; }
            if (need && (!sum.licenses.length || sum.seats - sum.used < need)) return { error: `Giấy phép của giáo viên nhận không đủ chỗ: cần thêm ${need} chỗ, còn ${Math.max(0, sum.seats - sum.used)}. Hãy cấp hoặc nâng giấy phép trước.` };
          }
          for (const c of classes) await txDb.prepare("UPDATE classrooms SET teacher_id = ?, updated_at = ? WHERE id = ?").run(to.id, nowIso(), c.id);
          for (const u of studs) {
            if (to.role !== "admin") await allocateSeat(txDb, { teacherId: to.id, userId: u });
            await releaseSeatIfUnused(txDb, { teacherId: t.id, userId: u, actorId: user.id, reason: "Chuyển lớp sang giáo viên khác" });
          }
          const moved = (await txDb.prepare("UPDATE users SET managed_by = ? WHERE managed_by = ?").run(to.id, t.id)).changes;
          return { classes: classes.length, students: studs.length, accounts: moved };
        });
        if (r.error) return bad(res, 400, r.error);
        audit(user.id, "admin.teacher_transfer", "user:" + t.id, { to: to.id, ...r }, req);
        return ok(res, r);
      }
      return bad(res, 404, "Không tìm thấy API này.");
    }

    // ----- My classes list -----
    if (m === "GET" && p === "/api/classes") {
      const teaching = (isAdmin(user) || user.role === "teacher") ? await db.prepare(`SELECT * FROM classrooms WHERE ${isAdmin(user) ? "1=1" : "teacher_id = ?"} ORDER BY status, id DESC`).all(...(isAdmin(user) ? [] : [user.id])) : [];
      const joined = await db.prepare("SELECT c.*, m.status AS my_status, u.display_name AS teacher_name FROM class_members m JOIN classrooms c ON c.id = m.class_id JOIN users u ON u.id = c.teacher_id WHERE m.user_id = ? AND m.status IN ('active','pending','suspended') ORDER BY c.id DESC").all(user.id);
      return ok(res, { canCreate: await canCreateClass(user), teaching: teaching.map((c) => publicClass(c)), joined: joined.map((c) => ({ id: c.id, name: c.name, description: c.description, status: c.status, myStatus: c.my_status, teacherName: c.teacher_name })) });
    }
    if (m === "POST" && p === "/api/classes") {
      const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
      if (!(await canCreateClass(user))) return bad(res, 403, user.role === "teacher" ? "Giấy phép Teacher của bạn đã hết hạn. Hãy gia hạn để tạo lớp mới." : "Cần giấy phép Teacher còn hạn để tạo lớp.", { upgrade: true });
      if (hit("class-new:" + user.id, 30, 3600000)) return bad(res, 429, "Bạn tạo lớp quá nhiều trong 1 giờ.");
      const name = String(b.name || "").trim().slice(0, 80);
      if (name.length < 2) return bad(res, 400, "Tên lớp cần ít nhất 2 ký tự.");
      let teacherId = user.id;
      if (isAdmin(user) && b.teacherId) {
        const t = await db.prepare("SELECT id, role FROM users WHERE id = ?").get(Number(b.teacherId));
        if (!t || !["teacher", "admin"].includes(t.role)) return bad(res, 400, "Người được phân công phải là giáo viên hoặc quản trị.");
        teacherId = t.id;
      }
      const starts = isoOrNull(b.startsOn), ends = isoOrNull(b.endsOn);
      if (starts === undefined || ends === undefined) return bad(res, 400, "Ngày không hợp lệ.");
      const info = await db.prepare("INSERT INTO classrooms (teacher_id, name, description, join_code, status, max_members, require_approval, starts_on, ends_on, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?) RETURNING id")
        .run(teacherId, name, String(b.description || "").slice(0, 1000), await newJoinCode(), int(b.maxMembers, 0, 0, 1000), b.requireApproval ? 1 : 0, starts, ends, user.id, nowIso(), nowIso());
      audit(user.id, "class.create", "class:" + info.lastInsertRowid, { name, teacherId }, req);
      return ok(res, { class: publicClass(await db.prepare("SELECT * FROM classrooms WHERE id = ?").get(Number(info.lastInsertRowid))) });
    }
    if (m === "POST" && p === "/api/classes/join") {
      const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
      if (hit("class-join:" + user.id, 20, 600000)) return bad(res, 429, "Bạn thử quá nhiều lần. Hãy chờ ít phút.");
      let c = null;
      if (b.token) {
        const inv = await db.prepare("SELECT * FROM class_invites WHERE token = ?").get(String(b.token));
        if (!inv || (inv.expires_at && inv.expires_at < nowIso()) || (inv.max_uses && inv.uses >= inv.max_uses)) return bad(res, 400, "Liên kết mời không còn hiệu lực.");
        c = await db.prepare("SELECT * FROM classrooms WHERE id = ?").get(inv.class_id);
        const r = await tx(async (t) => { const x = await joinClass(t, c, user); if (x.ok && !x.already) await t.prepare("UPDATE class_invites SET uses = uses + 1 WHERE token = ?").run(inv.token); return x; });
        if (r.error) return bad(res, 400, r.error);
        audit(user.id, "class.join", "class:" + c.id, { via: "link", status: r.status }, req);
        return ok(res, { classId: c.id, name: c.name, status: r.status });
      }
      c = await db.prepare("SELECT * FROM classrooms WHERE join_code = ?").get(String(b.code || "").trim().toUpperCase());
      if (!c) return bad(res, 404, "Mã lớp không đúng.");
      const r = await tx(async (t) => joinClass(t, c, user));
      if (r.error) return bad(res, 400, r.error);
      audit(user.id, "class.join", "class:" + c.id, { via: "code", status: r.status }, req);
      return ok(res, { classId: c.id, name: c.name, status: r.status });
    }

    // ----- Single class -----
    if ((mt = p.match(/^\/api\/classes\/(\d+)(\/.*)?$/))) {
      const id = Number(mt[1]); const sub = mt[2] || "";
      const mc = await managedClass(user, id);
      const me = await membership(db, id, user.id);
      // Student: view class, leave class
      if (!mc) {
        if (!me || !["active", "pending", "suspended"].includes(me.status)) return bad(res, 404, "Không tìm thấy lớp.");
        const c = await db.prepare("SELECT c.*, u.display_name AS teacher_name FROM classrooms c JOIN users u ON u.id = c.teacher_id WHERE c.id = ?").get(id);
        if (m === "GET" && sub === "") {
          if (me.status !== "active") return ok(res, { class: { id: c.id, name: c.name, description: c.description, teacherName: c.teacher_name, status: c.status }, myStatus: me.status, assignments: [], tests: [] });
          const asgRows = await db.prepare("SELECT * FROM assignments WHERE class_id = ? AND status <> 'deleted' ORDER BY COALESCE(due_at, '9999') , id DESC").all(id);
          const asg = [];
          for (const a of asgRows) if (await isTarget(a, user.id)) asg.push(a);
          const tests = await db.prepare("SELECT * FROM class_tests WHERE class_id = ? AND status IN ('published','closed') ORDER BY id DESC").all(id);
          const assignmentsMine = await Promise.all(asg.map(async (a) => ({ ...publicAssignment(a), mine: await studentAssignmentState(a, user.id) })));
          return ok(res, {
            class: { id: c.id, name: c.name, description: c.description, teacherName: c.teacher_name, status: c.status, startsOn: c.starts_on, endsOn: c.ends_on }, myStatus: me.status,
            assignments: assignmentsMine,
            tests: await Promise.all(tests.map(async (t) => { const at = await db.prepare("SELECT COUNT(*) AS n, MAX(score) AS best, MAX(max_score) AS mx FROM class_test_attempts WHERE test_id = ? AND user_id = ? AND status IN ('done','late')").get(t.id, user.id); const doing = await db.prepare("SELECT id, ends_at FROM class_test_attempts WHERE test_id = ? AND user_id = ? AND status = 'doing' AND ends_at > ?").get(t.id, user.id, nowIso()); return { ...publicTest(t), attempts: at.n, best: at.best, maxScore: at.mx, doing: doing || null }; })),
          });
        }
        if (m === "POST" && sub === "/leave") {
          await tx(async (t) => leaveOrRemove(t, c, user.id, "left", user.id, "Tự rời lớp"));
          audit(user.id, "class.leave", "class:" + id, {}, req);
          return ok(res, { ok: true });
        }
        return bad(res, 403, "Chỉ giáo viên của lớp mới làm được thao tác này.");
      }
      const c = mc;
      if (m === "GET" && sub === "") {
        const members = await db.prepare("SELECT m.user_id AS \"userId\", m.status, m.joined_at AS \"joinedAt\", u.username, u.display_name AS \"displayName\" FROM class_members m JOIN users u ON u.id = m.user_id WHERE m.class_id = ? AND m.status IN ('active','pending','suspended') ORDER BY m.status, u.display_name").all(id);
        const invites = await db.prepare("SELECT token, expires_at AS \"expiresAt\", max_uses AS \"maxUses\", uses FROM class_invites WHERE class_id = ? ORDER BY created_at DESC").all(id);
        const teacher = await db.prepare("SELECT id, username, display_name FROM users WHERE id = ?").get(c.teacher_id);
        return ok(res, { class: publicClass(c, { teacherName: teacher.display_name, teacherUsername: teacher.username }), manage: true, members, invites, license: (await teacherIsAdmin(db, c)) ? null : await licenseSummary(db, c.teacher_id) });
      }
      if (m === "PUT" && sub === "") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const name = b.name !== undefined ? String(b.name).trim().slice(0, 80) : c.name;
        if (name.length < 2) return bad(res, 400, "Tên lớp cần ít nhất 2 ký tự.");
        const starts = b.startsOn !== undefined ? isoOrNull(b.startsOn) : c.starts_on, ends = b.endsOn !== undefined ? isoOrNull(b.endsOn) : c.ends_on;
        if (starts === undefined || ends === undefined) return bad(res, 400, "Ngày không hợp lệ.");
        let teacherId = c.teacher_id;
        if (b.teacherId !== undefined && Number(b.teacherId) !== c.teacher_id) {
          if (!isAdmin(user)) return bad(res, 403, "Chỉ quản trị viên được phân công lại giáo viên.");
          const t = await db.prepare("SELECT id, role FROM users WHERE id = ?").get(Number(b.teacherId));
          if (!t || !["teacher", "admin"].includes(t.role)) return bad(res, 400, "Người được phân công phải là giáo viên hoặc quản trị.");
          teacherId = t.id;
        }
        await db.prepare("UPDATE classrooms SET name = ?, description = ?, max_members = ?, require_approval = ?, starts_on = ?, ends_on = ?, teacher_id = ?, updated_at = ? WHERE id = ?")
          .run(name, b.description !== undefined ? String(b.description).slice(0, 1000) : c.description, b.maxMembers !== undefined ? int(b.maxMembers, 0, 0, 1000) : c.max_members, b.requireApproval !== undefined ? (b.requireApproval ? 1 : 0) : c.require_approval, starts, ends, teacherId, nowIso(), id);
        audit(user.id, "class.update", "class:" + id, { teacherId }, req);
        return ok(res, { class: publicClass(await db.prepare("SELECT * FROM classrooms WHERE id = ?").get(id)) });
      }
      if (m === "POST" && (sub === "/close" || sub === "/reopen")) {
        const st = sub === "/close" ? "closed" : "active";
        if (st === "active" && !(await teacherIsAdmin(db, c)) && !await can(db, await db.prepare("SELECT * FROM users WHERE id = ?").get(c.teacher_id), "class_create")) return bad(res, 400, "Giấy phép của giáo viên đã hết hạn, không mở lại lớp được.");
        await tx(async (t) => {
          await t.prepare("UPDATE classrooms SET status = ?, updated_at = ? WHERE id = ?").run(st, nowIso(), id);
          // Close class: release license seats for students with no remaining open classes under this teacher
          if (st === "closed") for (const mm of await t.prepare("SELECT user_id FROM class_members WHERE class_id = ? AND status = 'active'").all(id)) await releaseSeatIfUnused(t, { teacherId: c.teacher_id, userId: mm.user_id, actorId: user.id, reason: "Lớp đã đóng" });
          else for (const mm of await t.prepare("SELECT user_id FROM class_members WHERE class_id = ? AND status = 'active'").all(id)) await allocateSeat(t, { teacherId: c.teacher_id, userId: mm.user_id });
        });
        audit(user.id, "class." + (st === "closed" ? "close" : "reopen"), "class:" + id, {}, req);
        return ok(res, { ok: true });
      }
      if (m === "DELETE" && sub === "") {
        // Retention policy: classes with submissions/attempts are only archived (hidden), learning data is never deleted
        const hasData = (await db.prepare("SELECT 1 FROM assignment_submissions s JOIN assignments a ON a.id = s.assignment_id WHERE a.class_id = ? LIMIT 1").get(id)) || (await db.prepare("SELECT 1 FROM class_test_attempts t JOIN class_tests x ON x.id = t.test_id WHERE x.class_id = ? LIMIT 1").get(id));
        await tx(async (t) => {
          for (const mm of await t.prepare("SELECT user_id FROM class_members WHERE class_id = ? AND status IN ('active','suspended')").all(id)) {
            await t.prepare("UPDATE class_members SET status = 'removed', updated_at = ? WHERE class_id = ? AND user_id = ?").run(nowIso(), id, mm.user_id);
          }
          if (hasData) await t.prepare("UPDATE classrooms SET status = 'archived', updated_at = ? WHERE id = ?").run(nowIso(), id);
          for (const mm of await t.prepare("SELECT user_id FROM class_members WHERE class_id = ?").all(id)) await releaseSeatIfUnused(t, { teacherId: c.teacher_id, userId: mm.user_id, actorId: user.id, reason: "Lớp bị xóa" });
          if (!hasData) await t.prepare("DELETE FROM classrooms WHERE id = ?").run(id);
        });
        audit(user.id, hasData ? "class.archive" : "class.delete", "class:" + id, { name: c.name }, req);
        return ok(res, { ok: true, archived: !!hasData });
      }
      if (m === "POST" && sub === "/code") {
        await db.prepare("UPDATE classrooms SET join_code = ?, updated_at = ? WHERE id = ?").run(await newJoinCode(), nowIso(), id);
        return ok(res, { joinCode: (await db.prepare("SELECT join_code FROM classrooms WHERE id = ?").get(id)).join_code });
      }
      if (m === "POST" && sub === "/invites") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const days = int(b.expiresDays, 7, 0, 365), uses = int(b.maxUses, 0, 0, 1000);
        const token = crypto.randomBytes(18).toString("base64url");
        await db.prepare("INSERT INTO class_invites (token, class_id, expires_at, max_uses, uses, created_at) VALUES (?, ?, ?, ?, 0, ?)").run(token, id, days ? new Date(Date.now() + days * 86400000).toISOString() : null, uses, nowIso());
        return ok(res, { token });
      }
      if (m === "DELETE" && (mt = sub.match(/^\/invites\/([\w-]+)$/))) {
        await db.prepare("DELETE FROM class_invites WHERE class_id = ? AND token = ?").run(id, mt[1]);
        return ok(res, { ok: true });
      }
      if (m === "POST" && sub === "/members") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const names = (Array.isArray(b.usernames) ? b.usernames : [b.username]).map((x) => String(x || "").trim()).filter(Boolean).slice(0, 200);
        const results = [];
        for (const name of names) {
          const u = await db.prepare("SELECT id, role, username FROM users WHERE LOWER(username) = LOWER(?) AND disabled = 0").get(name);
          if (!u) { results.push({ username: name, error: "Không có tài khoản này" }); continue; }
          if ((await capacityLeft(db, c)) <= 0 && !((await membership(db, id, u.id)) || {}).status) { results.push({ username: name, error: "Lớp đã đủ thành viên" }); continue; }
          const prev = await membership(db, id, u.id);
          const wasActive = !!(prev && prev.status === "active");
          const r = await tx(async (t) => activate(t, c, u.id));
          results.push(r.error ? { username: name, error: r.error } : { username: u.username, ok: true });
          if (!r.error) {
            audit(user.id, "class.member_add", "class:" + id, { userId: u.id }, req);
            if (!wasActive && u.id !== user.id) {
              await notify(db, {
                userId: u.id,
                kind: "class_added",
                title: `Bạn đã được thêm vào lớp «${c.name}»`,
                body: "Mở lớp để xem bài tập và thông báo.",
                link: `/app/lop/${id}`,
                payload: { classId: id },
              }).catch(() => {});
            }
          }
        }
        return ok(res, { results });
      }
      if (m === "POST" && (mt = sub.match(/^\/members\/(\d+)$/))) {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const uid = Number(mt[1]);
        const mem = await membership(db, id, uid);
        if (!mem || !["active", "pending", "suspended"].includes(mem.status)) return bad(res, 404, "Không có thành viên này.");
        const action = String(b.action || "");
        let r = { ok: true };
        if (action === "approve") { if (mem.status !== "pending") return bad(res, 400, "Thành viên không ở trạng thái chờ duyệt."); r = await tx(async (t) => activate(t, c, uid)); }
        else if (action === "suspend") await db.prepare("UPDATE class_members SET status = 'suspended', updated_at = ? WHERE id = ?").run(nowIso(), mem.id);
        else if (action === "unsuspend") await db.prepare("UPDATE class_members SET status = 'active', updated_at = ? WHERE id = ?").run(nowIso(), mem.id);
        else if (action === "remove" || action === "reject") await tx(async (t) => leaveOrRemove(t, c, uid, "removed", user.id, "Giáo viên xóa khỏi lớp"));
        else return bad(res, 400, "Thao tác không hợp lệ.");
        if (r.error) return bad(res, 400, r.error);
        audit(user.id, "class.member_" + action, "class:" + id, { userId: uid }, req);
        if (action === "approve" && uid !== user.id) {
          await notify(db, {
            userId: uid,
            kind: "class_approved",
            title: `Đã được duyệt vào lớp «${c.name}»`,
            body: "Bạn có thể xem bài tập và bài kiểm tra của lớp.",
            link: `/app/lop/${id}`,
            payload: { classId: id },
          }).catch(() => {});
        }
        return ok(res, { ok: true });
      }
      if (m === "GET" && (mt = sub.match(/^\/students\/(\d+)$/))) {
        const uid = Number(mt[1]);
        const mem = await membership(db, id, uid);
        if (!mem || mem.status === "removed" || mem.status === "left") return bad(res, 404, "Học sinh không thuộc lớp này.");
        const u = await db.prepare("SELECT id, username, display_name FROM users WHERE id = ?").get(uid);
        const asg = await db.prepare("SELECT * FROM assignments WHERE class_id = ? AND status <> 'deleted' ORDER BY id DESC").all(id);
        const subs = await db.prepare("SELECT s.id, s.assignment_id, s.attempt_no, s.passed, s.auto_score, s.manual_score, s.feedback, s.late, s.created_at, a.title FROM assignment_submissions s JOIN assignments a ON a.id = s.assignment_id WHERE a.class_id = ? AND s.user_id = ? ORDER BY s.id DESC LIMIT 200").all(id, uid);
        const assignmentsWithState = await Promise.all(asg.map(async (a) => ({ ...publicAssignment(a), state: await studentAssignmentState(a, uid) })));
        const lpRows = await db.prepare("SELECT item_id, best_score FROM lang_progress WHERE user_id = ?").all(uid);
        const xp = lpRows.reduce((s, r) => s + ((Number(r.best_score) || 0) >= 80 ? Number(r.best_score) : 0), 0);
        const solved = lpRows.filter((r) => (Number(r.best_score) || 0) >= 80).length;
        const lessonsDone = lpRows.length;
        return ok(res, { student: { id: u.id, username: u.username, displayName: u.display_name, status: mem.status }, xp, solved, lessonsDone, assignments: assignmentsWithState, submissions: subs });
      }

      // --- Class assignments ---
      if (m === "GET" && sub === "/assignments") {
        const list = await db.prepare("SELECT * FROM assignments WHERE class_id = ? AND status <> 'deleted' ORDER BY id DESC").all(id);
        return ok(res, { assignments: await Promise.all(list.map(async (a) => {
          const targets = a.target_all ? (await db.prepare("SELECT COUNT(*) AS n FROM class_members WHERE class_id = ? AND status = 'active'").get(id)).n : (await db.prepare("SELECT COUNT(*) AS n FROM assignment_targets WHERE assignment_id = ?").get(a.id)).n;
          const submitted = (await db.prepare("SELECT COUNT(DISTINCT user_id) AS n FROM assignment_submissions WHERE assignment_id = ?").get(a.id)).n;
          const passed = (await db.prepare("SELECT COUNT(DISTINCT user_id) AS n FROM assignment_submissions WHERE assignment_id = ? AND passed = 1").get(a.id)).n;
          return { ...publicAssignment(a), targets, submitted, passed };
        })) });
      }
      if (m === "POST" && sub === "/assignments") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        if (c.status !== "active") return bad(res, 400, "Lớp đã đóng.");
        const kind = "custom";
        let title = String(b.title || "").trim().slice(0, 150), refId = null, custom = {};
        if (b.kind === "lang") {
          // 4.9.9: assign foreign language exercise (stored as custom, custom_json.lang = exercise ID)
          const { langExercise, langCatalog } = await import("./languages.js");
          const le = langExercise(String(b.langItem || ""));
          if (!le) return bad(res, 400, "Không tìm thấy bài ngoại ngữ.");
          const course = langCatalog().courses.find((x) => x.id === le.lang);
          const lv = course.levels.find((l) => l.id === le.levelId);
          custom = { lang: le.id };
          if (!title) title = `${course.name} · ${lv.title} · ${le.unitTitle ? le.unitTitle + " · " : ""}${le.kindTitle}`.slice(0, 150);
        } else {
          const tests = (Array.isArray(b.tests) ? b.tests : []).slice(0, 20).map((t) => ({ input: String(t.input || "").slice(0, 5000), expected: String(t.expected || "").slice(0, 5000), hidden: !!t.hidden })).filter((t) => t.expected.trim());
          if (!String(b.prompt || "").trim()) return bad(res, 400, "Nhập đề bài.");
          custom = { prompt: String(b.prompt).slice(0, 5000), starter: String(b.starter || "").slice(0, 5000), tests, require: [] };
          if (!title) return bad(res, 400, "Nhập tiêu đề bài.");
        }
        const due = isoOrNull(b.dueAt); if (due === undefined) return bad(res, 400, "Hạn nộp không hợp lệ.");
        const targetAll = b.targetAll !== false || !Array.isArray(b.userIds) || !b.userIds.length;
        const aid = await tx(async (t) => {
          const info = await t.prepare("INSERT INTO assignments (class_id, kind, ref_id, title, instructions, custom_json, due_at, allow_resubmit, max_attempts, target_all, status, created_by, created_at, max_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?) RETURNING id")
            .run(id, kind, refId, title, String(b.instructions || "").slice(0, 3000), JSON.stringify(custom), due, b.allowResubmit === false ? 0 : 1, int(b.maxAttempts, 0, 0, 100), targetAll ? 1 : 0, user.id, nowIso(), Number.isFinite(Number(b.maxScore)) && Number(b.maxScore) > 0 ? Math.min(1000, Number(b.maxScore)) : 10);
          const aidN = Number(info.lastInsertRowid);
          if (!targetAll) for (const uid of b.userIds.slice(0, 500)) if (await activeMember(t, id, Number(uid))) await t.prepare("INSERT INTO assignment_targets (assignment_id, user_id) VALUES (?, ?) ON CONFLICT (assignment_id, user_id) DO NOTHING").run(aidN, Number(uid));
          return aidN;
        });
        audit(user.id, "assignment.create", "assignment:" + aid, { classId: id, kind, refId }, req);
        const recipients = targetAll
          ? await activeClassUserIds(id, user.id)
          : (await db.prepare("SELECT user_id FROM assignment_targets WHERE assignment_id = ?").all(aid))
            .map((r) => Number(r.user_id))
            .filter((uid) => uid && uid !== user.id);
        await notifyMany(db, recipients, {
          kind: "assignment_new",
          title: `Bài tập mới: ${title}`,
          body: c.name,
          link: `/app/bai-giao/${aid}`,
          payload: { classId: id, assignmentId: aid },
        }).catch(() => {});
        return ok(res, { assignment: publicAssignment(await db.prepare("SELECT * FROM assignments WHERE id = ?").get(aid)) });
      }
      // --- Class exams ---
      if (m === "GET" && sub === "/tests") {
        return ok(res, { tests: await Promise.all((await db.prepare("SELECT * FROM class_tests WHERE class_id = ? AND status <> 'deleted' ORDER BY id DESC").all(id)).map(async (t) => ({ ...publicTest(t), questions: (await db.prepare("SELECT COUNT(*) AS n FROM class_test_questions WHERE test_id = ?").get(t.id)).n, takers: (await db.prepare("SELECT COUNT(DISTINCT user_id) AS n FROM class_test_attempts WHERE test_id = ? AND status IN ('done','late')").get(t.id)).n }))) });
      }
      if (m === "POST" && sub === "/tests") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        if (c.status !== "active") return bad(res, 400, "Lớp đã đóng.");
        const title = String(b.title || "").trim().slice(0, 150);
        if (title.length < 2) return bad(res, 400, "Nhập tên bài kiểm tra.");
        const qs = (Array.isArray(b.questions) ? b.questions : []).slice(0, 100).map(resolveQuestion);
        if (!qs.length) return bad(res, 400, "Bài kiểm tra cần ít nhất 1 câu hỏi.");
        if (qs.some((q) => !q)) return bad(res, 400, "Có câu hỏi không hợp lệ (thiếu nội dung hoặc đáp án).");
        const openAt = isoOrNull(b.openAt), dueAt = isoOrNull(b.dueAt);
        if (openAt === undefined || dueAt === undefined) return bad(res, 400, "Thời gian không hợp lệ.");
        const durMin = int(b.durationMin, 30, 1, 600);
        const tid = await tx(async (t) => {
          const info = await t.prepare("INSERT INTO class_tests (class_id, title, instructions, duration_min, open_at, due_at, max_attempts, shuffle, status, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?) RETURNING id")
            .run(id, title, String(b.instructions || "").slice(0, 3000), durMin, openAt, dueAt, int(b.maxAttempts, 1, 1, 20), b.shuffle ? 1 : 0, user.id, nowIso());
          const testId = Number(info.lastInsertRowid);
          for (const [i, q] of qs.entries()) await t.prepare("INSERT INTO class_test_questions (test_id, idx, type, points, payload_json) VALUES (?, ?, ?, ?, ?)").run(testId, i, q.type, q.points, JSON.stringify(q.payload));
          return testId;
        });
        audit(user.id, "test.create", "test:" + tid, { classId: id, questions: qs.length }, req);
        const testRecipients = await activeClassUserIds(id, user.id);
        await notifyMany(db, testRecipients, {
          kind: "test_new",
          title: `Bài kiểm tra mới: ${title}`,
          body: `${c.name} · ${durMin} phút`,
          link: `/app/kiem-tra-lop/${tid}`,
          payload: { classId: id, testId: tid },
        }).catch(() => {});
        return ok(res, { test: publicTest(await db.prepare("SELECT * FROM class_tests WHERE id = ?").get(tid)) });
      }
      // --- Reports ---
      if (m === "GET" && sub === "/report") return ok(res, await classReport(c));
      if (m === "GET" && sub === "/report.xlsx") {
        const r = await classReport(c);
        const head = ["Tên đăng nhập", "Họ tên", "Trạng thái", "Bài đã làm", "Tổng bài giao", "Hoàn thành (%)", "Điểm TB bài tập", "Điểm TB kiểm tra", "Đánh giá đầu vào (%)", "Đánh giá cuối tuần (%)", "Tiến bộ (điểm %)", ...r.tests.map((t) => "KT: " + t.title), "Bài quá hạn chưa làm", "Chương còn yếu", "XP", "Cần hỗ trợ"];
        const rows = [head, ...r.rows.map((x) => [x.username, x.displayName, x.status === "active" ? "Đang học" : "Tạm khóa", x.assignmentsDone, x.assignmentsTotal, x.completion, x.avgScore ?? "", x.testAvg ?? "", x.learningProgress?.entrancePercent ?? "", x.learningProgress?.weeklyPercent ?? "", x.learningProgress?.change ?? "", ...x.testScores.map((s) => s ?? ""), x.missing.join("; "), x.weakChapters.join("; "), x.xp, x.needsSupport ? "Có" : ""])];
        const buf = buildXlsx(rows, c.name);
        const fname = `bao-cao-lop-${c.id}.xlsx`;
        res.writeHead(200, { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${fname}"`, "Content-Length": buf.length, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
        res.end(buf);
        audit(user.id, "report.export", "class:" + id, { format: "xlsx" }, req);
        return true;
      }
      return bad(res, 404, "Không tìm thấy API này.");
    }

    // ----- Create assignment via compact endpoint /api/assignments (keep legacy frontend compatibility) -----
    if (m === "POST" && p === "/api/assignments") {
      const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
      const cls = await managedClass(user, Number(b.classId));
      if (!cls) return bad(res, 404, "Không tìm thấy lớp hoặc bạn không quản lý lớp này.");
      if (cls.status !== "active") return bad(res, 400, "Lớp đã đóng.");
      const title = String(b.title || "").trim().slice(0, 150);
      if (title.length < 2) return bad(res, 400, "Nhập tiêu đề bài giao.");
      const maxScore = Number(b.maxScore ?? 10);
      if (!Number.isFinite(maxScore) || maxScore <= 0 || maxScore > 1000) return bad(res, 400, "Thang điểm phải lớn hơn 0 và không quá 1000.");
      const due = isoOrNull(b.dueAt); if (due === undefined) return bad(res, 400, "Hạn nộp không hợp lệ.");
      const kind = "custom", refId = null;
      const custom = { prompt: String(b.prompt || title).slice(0, 5000), starter: String(b.starter || "").slice(0, 5000), tests: (Array.isArray(b.tests) ? b.tests : []).slice(0, 20).map((t) => ({ input: String(t.input || "").slice(0, 2000), expected: String(t.expected || "").slice(0, 2000), hidden: !!t.hidden })), require: [] };
      const aid = await tx(async (t) => {
        const info = await t.prepare(`INSERT INTO assignments (class_id, kind, ref_id, title, instructions, custom_json, due_at, allow_resubmit, max_attempts, target_all, status, created_by, created_at, max_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?) RETURNING id`)
          .run(cls.id, kind, refId, title, String(b.instructions || "").slice(0, 3000), JSON.stringify(custom), due, b.allowResubmit === false ? 0 : 1, int(b.maxAttempts, 0, 0, 100), 1, user.id, nowIso(), maxScore);
        return Number(info.lastInsertRowid);
      });
      audit(user.id, "assignment.create", "assignment:" + aid, { classId: cls.id, kind, maxScore }, req);
      const recipients = await activeClassUserIds(cls.id, user.id);
      await notifyMany(db, recipients, {
        kind: "assignment_new",
        title: `Bài tập mới: ${title}`,
        body: cls.name,
        link: `/app/bai-giao/${aid}`,
        payload: { classId: cls.id, assignmentId: aid },
      }).catch(() => {});
      return ok(res, { assignment: publicAssignment(await db.prepare("SELECT * FROM assignments WHERE id = ?").get(aid)) });
    }

    // ----- Single assignment -----
    if ((mt = p.match(/^\/api\/assignments\/(\d+)(\/.*)?$/))) {
      const a = await db.prepare("SELECT * FROM assignments WHERE id = ? AND status <> 'deleted'").get(Number(mt[1]));
      const sub = mt[2] || "";
      if (!a) return bad(res, 404, "Không tìm thấy bài tập.");
      const mc = await managedClass(user, a.class_id);
      if (m === "GET" && sub === "/rubric") {
        if (!mc && !(await isTarget(a, user.id))) return bad(res, 404, "Không tìm thấy bài tập.");
        return ok(res, { rubric: await rubricFor(db, a.id), maxScore: Number(a.max_score ?? 10) });
      }
      if (m === "POST" && sub === "/rubric") {
        if (!mc) return bad(res, 404, "Không tìm thấy bài tập.");
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const criteria = (Array.isArray(b.criteria) ? b.criteria : []).slice(0, 20).map((c) => ({
          title: String(c?.title || "").trim().slice(0, 100),
          description: String(c?.description || "").trim().slice(0, 300),
          maxScore: Number(c?.maxScore),
        }));
        if (!criteria.length || criteria.some((c) => c.title.length < 2 || !Number.isFinite(c.maxScore) || c.maxScore <= 0 || c.maxScore > Number(a.max_score ?? 10))) return bad(res, 400, "Mỗi tiêu chí cần tên hợp lệ và điểm tối đa lớn hơn 0.");
        const total = Math.round(criteria.reduce((n, c) => n + c.maxScore, 0) * 100) / 100;
        const assignmentMax = Number(a.max_score ?? 10);
        if (total > assignmentMax + 0.0001) return bad(res, 400, `Tổng điểm tiêu chí (${total}) không được vượt thang điểm ${assignmentMax}.`);
        if (Math.abs(total - assignmentMax) > 0.0001) return bad(res, 400, `Tổng điểm tiêu chí phải bằng thang điểm ${assignmentMax}.`);
        const saved = await tx(async (t) => {
          await t.prepare("DELETE FROM assignment_rubric_scores WHERE assignment_id = ?").run(a.id);
          await t.prepare("DELETE FROM assignment_rubrics WHERE assignment_id = ?").run(a.id);
          const ins = await t.prepare("INSERT INTO assignment_rubrics (assignment_id, title, description, max_score, position, created_at) VALUES (?, ?, ?, ?, ?, ?)");
          for (const [i, c] of criteria.entries()) await ins.run(a.id, c.title, c.description, c.maxScore, i, nowIso());
          return await rubricFor(t, a.id);
        });
        audit(user.id, "assignment.rubric.update", "assignment:" + a.id, { criteria: saved.length, maxScore: total }, req);
        return ok(res, { rubric: saved, maxScore: assignmentMax });
      }
      if (m === "POST" && sub === "/grade") {
        if (!mc) return bad(res, 404, "Không tìm thấy bài tập.");
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const studentId = Number(b.studentId);
        if (!Number.isSafeInteger(studentId) || studentId <= 0 || !(await isTarget(a, studentId))) return bad(res, 404, "Học viên không thuộc danh sách được giao bài.");
        const latest = await db.prepare("SELECT * FROM assignment_submissions WHERE assignment_id = ? AND user_id = ? ORDER BY id DESC LIMIT 1").get(a.id, studentId);
        if (!latest) return bad(res, 404, "Học viên chưa nộp bài.");
        const criteria = await rubricFor(db, a.id);
        if (Array.isArray(b.rubricScores) && b.rubricScores.length) {
          if (!criteria.length) return bad(res, 400, "Bài giao chưa có rubric.");
          const supplied = b.rubricScores;
          const byId = new Map(supplied.map((x) => [Number(x.criterionId), x]));
          if (supplied.length !== criteria.length || byId.size !== criteria.length || criteria.some((c) => !byId.has(c.id))) return bad(res, 400, "Cần chấm đủ từng tiêu chí rubric.");
          const normalized = criteria.map((c) => {
            const score = Number(byId.get(c.id).score);
            return { criterionId: c.id, maxScore: Number(c.maxScore), score };
          });
          if (normalized.some((x) => !Number.isFinite(x.score) || x.score < 0 || x.score > x.maxScore)) return bad(res, 400, "Điểm mỗi tiêu chí phải nằm trong khoảng 0 đến điểm tối đa của tiêu chí.");
          const totalScore = Math.round(normalized.reduce((n, x) => n + x.score, 0) * 100) / 100;
          const comment = String(b.comment || "").slice(0, 3000);
          await tx(async (t) => {
            await t.prepare("DELETE FROM assignment_rubric_scores WHERE submission_id = ?").run(latest.id);
            const ins = await t.prepare("INSERT INTO assignment_rubric_scores (assignment_id, submission_id, user_id, criterion_id, score, comment, graded_by, graded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            for (const x of normalized) await ins.run(a.id, latest.id, studentId, x.criterionId, x.score, "", user.id, nowIso());
            await t.prepare("UPDATE assignment_submissions SET manual_score = ?, feedback = ?, graded_by = ?, graded_at = ? WHERE id = ?").run(totalScore, comment, user.id, nowIso(), latest.id);
          });
          audit(user.id, "assignment.rubric.grade", "submission:" + latest.id, { studentId, totalScore, criteria: normalized.length }, req);
          if (studentId !== user.id) {
            await notify(db, {
              userId: studentId,
              kind: "assignment_grade",
              title: `Đã có điểm bài «${a.title}»`,
              body: `Điểm: ${totalScore}/${Number(a.max_score ?? 10)}`,
              link: `/app/bai-giao/${a.id}`,
              payload: { assignmentId: a.id, submissionId: latest.id, score: totalScore },
            }).catch(() => {});
          }
          return ok(res, { ok: true, score: totalScore, maxScore: Number(a.max_score ?? 10), rubricScores: await rubricScoresFor(latest.id) });
        }
        const manualScore = Number(b.manualScore);
        if (!Number.isFinite(manualScore) || manualScore < 0 || manualScore > Number(a.max_score ?? 10)) return bad(res, 400, `Điểm phải từ 0 đến ${Number(a.max_score ?? 10)}.`);
        await db.prepare("UPDATE assignment_submissions SET manual_score = ?, feedback = ?, graded_by = ?, graded_at = ? WHERE id = ?").run(manualScore, String(b.comment || "").slice(0, 3000), user.id, nowIso(), latest.id);
        audit(user.id, "assignment.grade", "submission:" + latest.id, { studentId, manualScore }, req);
        if (studentId !== user.id) {
          await notify(db, {
            userId: studentId,
            kind: "assignment_grade",
            title: `Đã có điểm bài «${a.title}»`,
            body: `Điểm: ${manualScore}/${Number(a.max_score ?? 10)}`,
            link: `/app/bai-giao/${a.id}`,
            payload: { assignmentId: a.id, submissionId: latest.id, score: manualScore },
          }).catch(() => {});
        }
        return ok(res, { ok: true, score: manualScore, maxScore: Number(a.max_score ?? 10) });
      }
      if (mc) {
        if (m === "GET" && sub === "") {
          const ex = assignmentExercise(a) || {};
          const subs = await Promise.all((await db.prepare("SELECT s.id, s.user_id AS \"userId\", u.username, u.display_name AS \"displayName\", s.attempt_no AS \"attemptNo\", s.code, s.output, s.passed, s.auto_score AS \"autoScore\", s.manual_score AS \"manualScore\", s.feedback, s.late, s.created_at AS \"createdAt\" FROM assignment_submissions s JOIN users u ON u.id = s.user_id WHERE s.assignment_id = ? ORDER BY s.id DESC LIMIT 500").all(a.id)).map(async (row) => ({ ...row, rubricScores: await rubricScoresFor(row.id) })));
          const targets = a.target_all
            ? await db.prepare("SELECT u.id AS \"studentId\", u.username, u.display_name AS \"displayName\" FROM class_members m JOIN users u ON u.id = m.user_id WHERE m.class_id = ? AND m.status IN ('active','suspended') ORDER BY LOWER(u.display_name)").all(a.class_id)
            : await db.prepare("SELECT u.id AS \"studentId\", u.username, u.display_name AS \"displayName\" FROM assignment_targets t JOIN users u ON u.id = t.user_id WHERE t.assignment_id = ? ORDER BY LOWER(u.display_name)").all(a.id);
          const reportRows = await Promise.all(targets.map(async (target) => {
            const last = await db.prepare("SELECT * FROM assignment_submissions WHERE assignment_id = ? AND user_id = ? ORDER BY id DESC LIMIT 1").get(a.id, target.studentId);
            return { ...target, status: !last ? "missing" : (last.manual_score != null ? "graded" : "submitted"), score: last ? (last.manual_score ?? last.auto_score) : null,
              comment: last?.feedback || "", submittedAt: last?.created_at || null, rubricScores: last ? (await rubricScoresFor(last.id)).map((x) => ({ ...x, criterionId: x.criterionId })) : [] };
          }));
          return ok(res, { assignment: publicAssignment(a), exercise: { title: ex.title, prompt: ex.prompt, starter: ex.starter, tests: ex.tests || [], sample: ex.sample || "" }, submissions: subs, rubric: await rubricFor(db, a.id), report: { rows: reportRows }, manage: true });
        }
        // Export assignment grades: supports legacy CSV/XLSX API and new class endpoint /grades.xlsx.
        if (m === "GET" && (sub === "/grades.xlsx" || sub === "/export")) {
          const format = sub === "/grades.xlsx" ? "xlsx" : String(url.searchParams.get("format") || "xlsx").toLowerCase();
          if (!['csv', 'xlsx'].includes(format)) return bad(res, 400, "Định dạng xuất chỉ hỗ trợ CSV hoặc XLSX.");
          const targets = a.target_all
            ? await db.prepare(`SELECT u.id AS \"userId\", u.username, u.display_name AS \"displayName\" FROM class_members m JOIN users u ON u.id = m.user_id WHERE m.class_id = ? AND m.status IN ('active','suspended') ORDER BY LOWER(u.display_name)`).all(a.class_id)
            : await db.prepare(`SELECT u.id AS \"userId\", u.username, u.display_name AS \"displayName\" FROM assignment_targets t JOIN users u ON u.id = t.user_id WHERE t.assignment_id = ? ORDER BY LOWER(u.display_name)`).all(a.id);
          const latest = await db.prepare(`SELECT s.user_id, s.attempt_no, s.passed, s.auto_score, s.manual_score, s.feedback, s.late, s.created_at,
            (SELECT COUNT(*) FROM assignment_submissions x WHERE x.assignment_id = s.assignment_id AND x.user_id = s.user_id) AS attempts
            FROM assignment_submissions s
            WHERE s.assignment_id = ? AND s.id = (SELECT MAX(id) FROM assignment_submissions WHERE assignment_id = s.assignment_id AND user_id = s.user_id)`).all(a.id);
          const by = Object.fromEntries(latest.map((r) => [r.user_id, r]));
          const head = ["STT", "Tên đăng nhập", "Họ tên", "Số lần nộp", "Đã đạt (máy)", "Điểm máy", "Điểm tay", "Điểm cuối", "Nộp muộn", "Lần nộp cuối", "Nhận xét"];
          const rows = [head];
          targets.forEach((u, i) => {
            const s = by[u.userId];
            const auto = s ? s.auto_score : null;
            const manual = s && s.manual_score != null ? s.manual_score : null;
            const final = manual != null ? manual : (s && s.passed ? 10 : (s ? auto : null));
            rows.push([i + 1, u.username, u.displayName, s ? s.attempts : 0, s && s.passed ? "Có" : "Không", auto ?? "", manual ?? "", final ?? "", s && s.late ? "Có" : "", s ? s.created_at : "", s ? (s.feedback || "") : ""]);
          });
          const safe = String(a.title || "bai-giao").replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 40) || "bai-giao";
          const fname = `diem-bai-${a.id}-${safe}.${format}`;
          let buf, contentType;
          if (format === "csv") {
            const cell = (v) => { const value = String(v ?? ""); return /[\",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value; };
            buf = Buffer.from("\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n", "utf8");
            contentType = "text/csv; charset=utf-8";
          } else {
            buf = buildXlsx(rows, (a.title || "Bai giao").slice(0, 28));
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          }
          res.writeHead(200, {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${fname}"`,
            "Content-Length": buf.length,
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
          });
          res.end(buf);
          audit(user.id, "assignment.grades_export", "assignment:" + a.id, { format, rows: targets.length }, req);
          return true;
        }
        if (m === "POST" && (sub === "/close" || sub === "/reopen")) { await db.prepare("UPDATE assignments SET status = ? WHERE id = ?").run(sub === "/close" ? "closed" : "published", a.id); audit(user.id, "assignment" + sub.replace("/", "."), "assignment:" + a.id, {}, req); return ok(res, { ok: true }); }
        if (m === "DELETE" && sub === "") { await db.prepare("UPDATE assignments SET status = 'deleted' WHERE id = ?").run(a.id); audit(user.id, "assignment.delete", "assignment:" + a.id, {}, req); return ok(res, { ok: true }); }
        if (m === "PUT" && sub === "") {
          const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
          const due = b.dueAt !== undefined ? isoOrNull(b.dueAt) : a.due_at; if (due === undefined) return bad(res, 400, "Hạn nộp không hợp lệ.");
          await db.prepare("UPDATE assignments SET title = ?, instructions = ?, due_at = ?, allow_resubmit = ?, max_attempts = ? WHERE id = ?").run(b.title ? String(b.title).slice(0, 150) : a.title, b.instructions !== undefined ? String(b.instructions).slice(0, 3000) : a.instructions, due, b.allowResubmit !== undefined ? (b.allowResubmit ? 1 : 0) : a.allow_resubmit, b.maxAttempts !== undefined ? int(b.maxAttempts, 0, 0, 100) : a.max_attempts, a.id);
          return ok(res, { assignment: publicAssignment(await db.prepare("SELECT * FROM assignments WHERE id = ?").get(a.id)) });
        }
      }
      // Assigned student (class-managing teachers cannot submit on behalf of students)
      if (!(await isTarget(a, user.id))) return mc ? bad(res, 403, "Giáo viên không nộp bài trong lớp mình quản lý.") : bad(res, 404, "Không tìm thấy bài tập.");
      if (m === "GET" && sub === "") {
        const ex = assignmentExercise(a);
        if (!ex) return bad(res, 404, "Bài tập không còn tồn tại.");
        const mine = await db.prepare("SELECT id, attempt_no AS \"attemptNo\", code, passed, auto_score AS \"autoScore\", manual_score AS \"manualScore\", feedback, late, created_at AS \"createdAt\" FROM assignment_submissions WHERE assignment_id = ? AND user_id = ? ORDER BY id DESC").all(a.id, user.id);
        const state = await studentAssignmentState(a, user.id);
        return ok(res, { assignment: publicAssignment(a), exercise: { title: ex.title, prompt: ex.prompt, starter: ex.starter || "", require: ex.require || [], tests: Array.isArray(ex.tests) ? ex.tests.filter((t) => !t.hidden).map((t) => ({ input: t.input, expected: t.expected })) : [], hiddenTests: Array.isArray(ex.tests) ? ex.tests.filter((t) => t.hidden).length : 0 }, rubric: await rubricFor(db, a.id), mine: await Promise.all(mine.map(async (x) => ({ ...x, rubricScores: await rubricScoresFor(x.id) }))), state });
      }
      if (m === "POST" && sub === "/submit") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        if (a.status !== "published") return bad(res, 400, "Giáo viên đã đóng bài này.");
        if (hit("asub:" + user.id, 20, 60000)) return bad(res, 429, "Bạn nộp nhanh quá. Hãy chờ vài giây.");
        const codeStr = String(b.code ?? b.answer ?? "");
        if (!codeStr.trim()) return bad(res, 400, "Bạn chưa nhập bài làm.");
        if (codeStr.length > 20000) return bad(res, 400, "Bài làm dài quá (tối đa 20.000 ký tự).");
        const n = (await db.prepare("SELECT COUNT(*) AS n FROM assignment_submissions WHERE assignment_id = ? AND user_id = ?").get(a.id, user.id)).n;
        if (n > 0 && !a.allow_resubmit) return bad(res, 400, "Bài này chỉ cho nộp một lần.");
        if (a.max_attempts && n >= a.max_attempts) return bad(res, 400, `Bạn đã nộp đủ ${a.max_attempts} lần cho phép.`);
        const ex = assignmentExercise(a);
        if (!ex) return bad(res, 404, "Bài tập không còn tồn tại.");
        const r = { passed: false, output: "" }; // Máy chấm tự động đã gỡ: giáo viên chấm thủ công
        const late = a.due_at && Date.now() > Date.parse(a.due_at) ? 1 : 0;
        await db.prepare("INSERT INTO assignment_submissions (assignment_id, user_id, attempt_no, code, output, passed, auto_score, late, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(a.id, user.id, n + 1, codeStr, String(r.output || "").slice(0, 10000), r.passed ? 1 : 0, r.passed ? 10 : 0, late, nowIso());
        await bumpStreak(db, user.id, nowIso()).catch(() => {});
        // Notify the teacher in charge of the class
        try {
          const cls = await db.prepare("SELECT teacher_id, name FROM classrooms WHERE id = ?").get(a.class_id);
          if (cls && cls.teacher_id && cls.teacher_id !== user.id) {
            await notify(db, {
              userId: cls.teacher_id,
              kind: "assignment_submit",
              title: `${user.display_name || user.username} đã nộp bài «${a.title}»`,
              body: "Chờ giáo viên chấm" + (late ? " · nộp muộn" : ""),
              link: `/app/giao-vien/lop/${a.class_id}?tab=bai-tap`,
              payload: { assignmentId: a.id, studentId: user.id, passed: !!r.passed },
            });
          }
        } catch {}
        const state = await studentAssignmentState(a, user.id);
        return ok(res, { ...r, attemptNo: n + 1, late: !!late, state });
      }
      return bad(res, 404, "Không tìm thấy API này.");
    }
    // ----- Manual grading / feedback -----
    if (m === "POST" && (mt = p.match(/^\/api\/submissions\/(\d+)\/grade$/))) {
      const s = await db.prepare("SELECT s.*, a.class_id FROM assignment_submissions s JOIN assignments a ON a.id = s.assignment_id WHERE s.id = ?").get(Number(mt[1]));
      if (!s || !(await managedClass(user, s.class_id))) return bad(res, 404, "Không tìm thấy bài nộp.");
      const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
      let score = null;
      if (b.manualScore !== null && b.manualScore !== undefined && b.manualScore !== "") { score = Number(b.manualScore); if (!Number.isFinite(score) || score < 0 || score > 10) return bad(res, 400, "Điểm từ 0 đến 10."); score = Math.round(score * 10) / 10; }
      await db.prepare("UPDATE assignment_submissions SET manual_score = ?, feedback = ?, graded_by = ?, graded_at = ? WHERE id = ?").run(score, String(b.feedback || "").slice(0, 3000), user.id, nowIso(), s.id);
      audit(user.id, "submission.grade", "submission:" + s.id, { score }, req);
      try {
        const asg = await db.prepare("SELECT title, class_id FROM assignments WHERE id = ?").get(s.assignment_id);
        await notify(db, {
          userId: s.user_id,
          kind: "assignment_grade",
          title: asg ? `Đã có điểm bài «${asg.title}»` : "Giáo viên đã chấm bài",
          body: score != null ? `Điểm: ${score}/10` : "Đã có nhận xét từ giáo viên",
          link: asg ? `/app/lop/${asg.class_id}` : "/app/lop",
          payload: { submissionId: s.id, score },
        });
      } catch {}
      return ok(res, { ok: true });
    }

    // ----- Class exam -----
    if ((mt = p.match(/^\/api\/tests\/(\d+)(\/.*)?$/))) {
      const t = await db.prepare("SELECT * FROM class_tests WHERE id = ? AND status <> 'deleted'").get(Number(mt[1]));
      const sub = mt[2] || "";
      if (!t) return bad(res, 404, "Không tìm thấy bài kiểm tra.");
      const mc = await managedClass(user, t.class_id);
      if (mc) {
        if (m === "GET" && sub === "") {
          const qs = (await testQuestions(t.id)).map((q) => ({ id: q.id, idx: q.idx, type: q.type, points: q.points, ...q.payload }));
          const attempts = await db.prepare("SELECT a.id, a.user_id AS \"userId\", u.username, u.display_name AS \"displayName\", a.started_at AS \"startedAt\", a.submitted_at AS \"submittedAt\", a.status, a.score, a.max_score AS \"maxScore\" FROM class_test_attempts a JOIN users u ON u.id = a.user_id WHERE a.test_id = ? ORDER BY a.id DESC").all(t.id);
          return ok(res, { test: publicTest(t), questions: qs, attempts, manage: true });
        }
        if (m === "POST" && (sub === "/close" || sub === "/reopen")) { await db.prepare("UPDATE class_tests SET status = ? WHERE id = ?").run(sub === "/close" ? "closed" : "published", t.id); return ok(res, { ok: true }); }
        if (m === "DELETE" && sub === "") { await db.prepare("UPDATE class_tests SET status = 'deleted' WHERE id = ?").run(t.id); audit(user.id, "test.delete", "test:" + t.id, {}, req); return ok(res, { ok: true }); }
      }
      if (!(await activeMember(db, t.class_id, user.id))) return mc ? bad(res, 403, "Giáo viên không làm bài kiểm tra trong lớp mình quản lý.") : bad(res, 404, "Không tìm thấy bài kiểm tra.");
      const nowS = nowIso();
      if (m === "GET" && sub === "") {
        const mine = await db.prepare("SELECT id, started_at AS \"startedAt\", ends_at AS \"endsAt\", submitted_at AS \"submittedAt\", status, score, max_score AS \"maxScore\" FROM class_test_attempts WHERE test_id = ? AND user_id = ? ORDER BY id").all(t.id, user.id);
        return ok(res, { test: publicTest(t), questionCount: (await testQuestions(t.id)).length, attempts: mine });
      }
      if (m === "POST" && sub === "/start") {
        if (t.status !== "published") return bad(res, 400, "Bài kiểm tra đã đóng.");
        if (t.open_at && nowS < t.open_at) return bad(res, 400, "Bài kiểm tra chưa mở.");
        if (t.due_at && nowS > t.due_at) return bad(res, 400, "Đã quá hạn làm bài.");
        const r = await tx(async (txDb) => {
          const doing = await txDb.prepare("SELECT * FROM class_test_attempts WHERE test_id = ? AND user_id = ? AND status = 'doing' AND ends_at > ?").get(t.id, user.id, nowS);
          if (doing) return { attempt: doing };
          const used = (await txDb.prepare("SELECT COUNT(*) AS n FROM class_test_attempts WHERE test_id = ? AND user_id = ?").get(t.id, user.id)).n;
          if (used >= t.max_attempts) return { error: `Bạn đã làm đủ ${t.max_attempts} lần.` };
          const qs = await testQuestions(t.id);
          const order = (t.shuffle ? shuffle(qs) : qs).map((q) => q.id);
          let ends = Date.now() + t.duration_min * 60000;
          if (t.due_at) ends = Math.min(ends, Date.parse(t.due_at));
          const info = await txDb.prepare("INSERT INTO class_test_attempts (test_id, user_id, started_at, ends_at, status, order_json) VALUES (?, ?, ?, ?, 'doing', ?) RETURNING id").run(t.id, user.id, nowS, new Date(ends).toISOString(), JSON.stringify(order));
          return { attempt: await txDb.prepare("SELECT * FROM class_test_attempts WHERE id = ?").get(Number(info.lastInsertRowid)) };
        });
        if (r.error) return bad(res, 400, r.error);
        const byId = Object.fromEntries((await testQuestions(t.id)).map((q) => [q.id, q]));
        const order = JSON.parse(r.attempt.order_json);
        return ok(res, { attemptId: r.attempt.id, endsAt: r.attempt.ends_at, test: publicTest(t), questions: order.map((qid) => byId[qid]).filter(Boolean).map(studentView) });
      }
      if (m === "POST" && sub === "/submit") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const at = await db.prepare("SELECT * FROM class_test_attempts WHERE id = ? AND test_id = ? AND user_id = ?").get(Number(b.attemptId), t.id, user.id);
        if (!at) return bad(res, 404, "Không có lượt làm bài này.");
        // Lock attempt (prevent concurrent double submissions)
        if ((await db.prepare("UPDATE class_test_attempts SET status = 'done', submitted_at = ? WHERE id = ? AND status = 'doing'").run(nowIso(), at.id)).changes !== 1) return bad(res, 409, "Lượt này đã nộp.");
        const late = Date.now() > Date.parse(at.ends_at) + 30000;
        const answers = b.answers && typeof b.answers === "object" ? b.answers : {};
        const qs = await testQuestions(t.id);
        let score = 0, max = 0; const detail = [];
        for (const q of qs) {
          max += q.points;
          const ans = answers[q.id];
          if (q.type === "mcq") { const right = Number(ans) === q.payload.answer; if (right) score += q.points; detail.push({ id: q.id, correct: right }); }
        }
        await db.prepare("UPDATE class_test_attempts SET status = ?, answers_json = ?, detail_json = ?, score = ?, max_score = ? WHERE id = ?").run(late ? "late" : "done", JSON.stringify(answers).slice(0, 200000), JSON.stringify(detail), score, max, at.id);
        await bumpStreak(db, user.id, nowIso()).catch(() => {});
        // Correct/incorrect details are only shown after the deadline (do not leak answers while others are still working)
        const reveal = !t.due_at || Date.now() > Date.parse(t.due_at);
        return ok(res, { score, maxScore: max, late, detail: reveal ? detail : null });
      }
      return bad(res, 404, "Không tìm thấy API này.");
    }

    // ----- Family -----
    if (p.startsWith("/api/family")) {
      if (m === "GET" && p === "/api/family") {
        const own = await familyOf(db, user.id);
        if (own) own.members = own.members.map((x) => ({ id: x.id, userId: x.user_id, username: x.username, displayName: x.display_name, status: x.status, shareProgress: !!x.share_progress, isOwner: x.user_id === user.id }));
        return ok(res, { group: own, memberships: (await myFamilyMembership(db, user.id)).map((x) => ({ ...x, isOwner: !!x.isOwner, shareProgress: !!x.shareProgress })) });
      }
      if (m === "GET" && (mt = p.match(/^\/api\/family\/members\/(\d+)\/progress$/))) {
      const g = await db.prepare("SELECT * FROM family_groups WHERE owner_id = ?").get(user.id);
      const fm = g && (await db.prepare("SELECT * FROM family_members WHERE id = ? AND group_id = ? AND status = 'active'").get(Number(mt[1]), g.id));
      if (!fm) return bad(res, 404, "Không có thành viên này.");
      if (!fm.share_progress && fm.user_id !== user.id) return bad(res, 403, "Thành viên này chưa bật chia sẻ tiến độ.");
      const u = await db.prepare("SELECT display_name, username FROM users WHERE id = ?").get(fm.user_id);
      const lp = await db.prepare("SELECT COALESCE(SUM(CASE WHEN best_score >= 80 THEN best_score ELSE 0 END), 0) AS xp, COALESCE(SUM(CASE WHEN best_score >= 80 THEN 1 ELSE 0 END), 0) AS solved, COALESCE(SUM(CASE WHEN best_score >= 80 AND item_id LIKE '%-kiem-tra' THEN 1 ELSE 0 END), 0) AS exams, COUNT(*) AS tried, MAX(updated_at) AS t FROM lang_progress WHERE user_id = ?").get(fm.user_id).catch(() => ({}));
      const lastAsg = (await db.prepare("SELECT MAX(created_at) AS t FROM assignment_submissions WHERE user_id = ?").get(fm.user_id)).t;
      const last = [lastAsg, lp?.t].filter(Boolean).sort().pop() || null;
      const since7 = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      let week = [];
      try {
        week = await db.prepare("SELECT activity_date AS d, COUNT(*) AS n FROM learning_activities WHERE user_id = ? AND activity_date >= ? GROUP BY activity_date ORDER BY activity_date").all(fm.user_id, since7);
      } catch {}
      if (!week.length) {
        week = await db.prepare("SELECT substr(created_at, 1, 10) AS d, COUNT(*) AS n FROM assignment_submissions WHERE user_id = ? AND created_at >= ? GROUP BY d ORDER BY d").all(fm.user_id, new Date(Date.now() - 7 * 86400000).toISOString());
      }
      // Aggregated metrics only: no code, no passwords, no other personal data
      return ok(res, {
        member: { displayName: u.display_name, username: u.username },
        xp: Number(lp?.xp) || 0,
        solved: Number(lp?.solved) || 0,
        examsPassed: Number(lp?.exams) || 0,
        lessonsDone: Number(lp?.tried) || 0,
        lastActive: last,
        week,
      });
    }

      const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
      if (m === "POST" && p === "/api/family/invite") {
        if (hit("fam-inv:" + user.id, 20, 3600000)) return bad(res, 429, "Bạn mời quá nhiều lần.");
        const r = await inviteMember(db, { ownerId: user.id, username: b.username });
        if (r.error) return bad(res, 400, r.error);
        audit(user.id, "family.invite", "user:" + user.id, { username: b.username }, req);
        return ok(res, { ok: true });
      }
      if (m === "POST" && p === "/api/family/respond") { const r = await tx(async (t) => respondInvite(t, { userId: user.id, groupId: Number(b.groupId), accept: !!b.accept, shareProgress: !!b.shareProgress })); if (r.error) return bad(res, 400, r.error); audit(user.id, b.accept ? "family.join" : "family.decline", "family:" + b.groupId, {}, req); return ok(res, { ok: true }); }
      if (m === "POST" && p === "/api/family/share") { await db.prepare("UPDATE family_members SET share_progress = ? WHERE user_id = ? AND status = 'active'").run(b.on ? 1 : 0, user.id); return ok(res, { ok: true }); }
      if (m === "POST" && p === "/api/family/leave") { const r = await tx(async (t) => leaveFamily(t, { userId: user.id })); if (r.error) return bad(res, 400, r.error); audit(user.id, "family.leave", "user:" + user.id, {}, req); return ok(res, { ok: true }); }
      if (m === "POST" && (mt = p.match(/^\/api\/family\/members\/(\d+)\/remove$/))) { const r = await tx(async (t) => removeMember(t, { ownerId: user.id, memberId: Number(mt[1]), actorId: user.id })); if (r.error) return bad(res, 400, r.error); audit(user.id, "family.remove", "member:" + mt[1], {}, req); return ok(res, { ok: true }); }
      return bad(res, 404, "Không tìm thấy API này.");
    }
    // ----- Admin: classes and licenses -----
    if (p.startsWith("/api/admin/classes") || p.startsWith("/api/admin/licenses")) {
      if (!isAdmin(user)) return bad(res, 403, "Chỉ quản trị viên mới dùng được chức năng này.");
      if (m === "GET" && p === "/api/admin/classes") {
        return ok(res, { classes: (await db.prepare("SELECT c.*, u.username AS teacher_username, u.display_name AS teacher_name, (SELECT COUNT(*) FROM class_members m WHERE m.class_id = c.id AND m.status = 'active') AS members FROM classrooms c JOIN users u ON u.id = c.teacher_id ORDER BY c.id DESC LIMIT 500").all()).map((c) => publicClass(c, { teacherName: c.teacher_name, teacherUsername: c.teacher_username, members: c.members })),
          teachers: await db.prepare("SELECT id, username, display_name AS \"displayName\", role FROM users WHERE role IN ('teacher','admin') ORDER BY role, username").all() });
      }
      if (m === "GET" && p === "/api/admin/licenses") {
        return ok(res, { licenses: (await db.prepare("SELECT l.*, u.username, u.display_name, (SELECT COUNT(*) FROM license_seats s WHERE s.license_id = l.id AND s.status = 'active') AS used FROM licenses l JOIN users u ON u.id = l.owner_id ORDER BY l.id DESC LIMIT 500").all()).map((l) => ({ id: l.id, ownerId: l.owner_id, username: l.username, displayName: l.display_name, tier: l.tier, seats: l.seats, used: l.used, startsAt: l.starts_at, expiresAt: l.expires_at, status: l.expires_at <= nowIso() && l.status === "active" ? "expired" : l.status, source: l.source, note: l.note })) });
      }
      const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
      if (m === "POST" && p === "/api/admin/licenses") {
        const u = await db.prepare("SELECT id FROM users WHERE LOWER(username) = LOWER(?)").get(String(b.username || "").trim());
        if (!u) return bad(res, 404, "Không có tài khoản này.");
        const seats = int(b.seats, 0, 1, 5000), months = int(b.months, 0, 1, 36);
        if (!seats || !months) return bad(res, 400, "Số chỗ từ 1 đến 5000, số tháng từ 1 đến 36.");
        const note = String(b.note || "").trim();
        if (note.length < 3) return bad(res, 400, "Nhập lý do / số hợp đồng để lưu nhật ký.");
        const lic = await tx(async (t) => issueLicense(t, { ownerId: u.id, seats, months, source: "admin", note, actorId: user.id }));
        audit(user.id, "license.grant", "license:" + lic.id, { userId: u.id, seats, months, note }, req);
        return ok(res, { license: { id: lic.id, expiresAt: lic.expires_at } });
      }
      if (m === "POST" && (mt = p.match(/^\/api\/admin\/licenses\/(\d+)\/revoke$/))) {
        const note = String(b.note || "").trim();
        if (note.length < 3) return bad(res, 400, "Nhập lý do.");
        const lic = await db.prepare("SELECT * FROM licenses WHERE id = ?").get(Number(mt[1]));
        if (!lic) return bad(res, 404, "Không có giấy phép này.");
        if (lic.status === "revoked") return bad(res, 400, "Giấy phép này đã được thu hồi trước đó.");
        await tx(async (t) => {
          await t.prepare("UPDATE licenses SET status = 'revoked', note = COALESCE(note, '') || ? WHERE id = ?").run(" | Thu hồi: " + note, lic.id);
          await revokeSource(t, { sourceType: "license_owner", sourceId: lic.id, actorId: user.id, reason: note });
          for (const s of await t.prepare("SELECT id, user_id FROM license_seats WHERE license_id = ? AND status = 'active'").all(lic.id)) {
            await t.prepare("UPDATE license_seats SET status = 'released', released_at = ? WHERE id = ?").run(nowIso(), s.id);
            await revokeSource(t, { userId: s.user_id, sourceType: "license_seat", sourceId: s.id, actorId: user.id, reason: "Giấy phép bị thu hồi" });
          }
        });
        audit(user.id, "license.revoke", "license:" + lic.id, { note }, req);
        return ok(res, { ok: true });
      }
      return bad(res, 404, "Không tìm thấy API này.");
    }
    return false;
  };
}

export const CLASSROOM_PREFIXES = ["/api/teacher/", "/api/classes", "/api/assignments", "/api/submissions/", "/api/tests/", "/api/family", "/api/admin/classes", "/api/admin/licenses", "/api/admin/teachers"];
