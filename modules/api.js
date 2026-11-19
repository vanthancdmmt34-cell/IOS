// API: tổng quan, gói Pro, thanh toán, trợ lý AI, quản trị kinh doanh.
// Called by server.js BEFORE legacy handleApi; returns true if the request was handled.
// All permissions (auth, Pro, teacher, CSRF) are enforced here on the server.
import { listPlans, membership, grantPro, fulfillOrder, revokePersonalPro, createOrder, publicOrder, applyPayment, verifySepay, expireSubscriptions } from "./membership.js";
import { bankQr, bankName } from "./vietqr.js";
import { zaloReady, secretOk, zaloCommand, zaloPush, pushOrderClaimed, pushOrderPaid } from "./zalo-pay.js";
import { sysGet, sysPublicView, sysUpdate } from "./sysconfig.js";
import { createClassroomApi, CLASSROOM_PREFIXES } from "./classroom.js";
import { reqLang } from "./reqlang.js";
import { summary as entSummary, can, revokeSource } from "./entitlements.js";
import { allocateSeat, activeLicenses } from "./licenses.js";
import { langAiContext } from "./languages.js";
import { explainAiError, aiConfigured, aiModel, aiDiagnose, AI_MODES, AI_PERSONAS, systemPrompt, buildUserTurn, quotaStatus, askTutor, monthlyCostMicro, monthlyBudgetMicro, estimateTokens } from "./ai.js";
import { listNotifications, unreadCount, markRead, markAllRead, maybeRemindProExpiry, webhookConfig, deliverWebhook, notify } from "./notify.js";
import { cycleStartIso } from "./giftcodes.js";

const nowIso = () => new Date().toISOString();

export function createModuleApi(ctx) {
  const { db, sendJson, getSession, requireCsrf, readBody, readRaw, hit, clientIp, settings, engine, log = console } = ctx;

  const classroomApi = createClassroomApi(ctx);
  // Block AI responses while a student is taking a chapter or class exam (prevents leaking answers)
  const audit = (actorId, action, target, detail, req) => {
    db.prepare("INSERT INTO audit_logs (actor_id, action, target, detail, ip, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(actorId ?? null, action, String(target ?? ""), typeof detail === "string" ? detail : JSON.stringify(detail ?? {}), req ? clientIp(req) : "", nowIso())
      .catch(() => {});
  };

  const userOf = (sess) => sess && { id: sess.user_id, username: sess.username, display_name: sess.display_name, role: sess.role, lang: sess.lang || "vi" };
  const bad = (res, code, error, extra = {}) => { sendJson(res, code, { error, ...extra }); return true; };
  const ok = (res, obj) => { sendJson(res, 200, obj); return true; };

  // Periodic cleanup: mark expired subscriptions/orders (Pro access expires automatically via expires_at; this is just for reporting)
  const timer = setInterval(() => { expireSubscriptions(db).catch((e) => log.error("[expire]", e.message)); }, 3600000);
  timer.unref();
  expireSubscriptions(db).catch(() => {});

  // ---------- Dashboard ----------
  async function dashboard(user) {
    const mem = await membership(db, user);
    const sinceDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(Date.now() - 7 * 86400000));
    // n: mọi hoạt động trong ngày; lang: chỉ hoạt động học ngoại ngữ (trang chủ môn ngoại ngữ dùng số này)
    let week = [];
    try {
      week = await db.prepare(`SELECT activity_date AS d, COUNT(*) AS n, COUNT(*) AS ok,
          SUM(CASE WHEN activity_type IN ('lang_submission', 'lang_speak', 'lang_chat', 'lang_review', 'free_interview') THEN 1 ELSE 0 END) AS lang
        FROM learning_activities WHERE user_id = ? AND activity_date >= ? GROUP BY activity_date ORDER BY activity_date`).all(user.id, sinceDate);
    } catch { /* learning_activities table may not exist on older/unmigrated instances */ }
    // Hoạt động trong chu kỳ hôm nay (từ 5:00 sáng), để mục tiêu, nhiệm vụ và trạng thái "đã học hôm nay" khớp nhau
    const today = { activities: 0, lessons: 0, lessonsByLang: {}, speaks: 0, speaksByLang: {}, reviewsByLang: {}, miniGames: 0 };
    try {
      const rows = await db.prepare("SELECT activity_type AS t, reference_id AS r, COUNT(*) AS n FROM learning_activities WHERE user_id = ? AND created_at >= ? GROUP BY activity_type, reference_id").all(user.id, cycleStartIso());
      for (const row of rows) {
        const n = Number(row.n) || 0;
        today.activities += n;
        if (row.t === "lang_submission") {
          today.lessons += n;
          const lang = String(row.r || "").split("-")[0];
          if (lang) today.lessonsByLang[lang] = (today.lessonsByLang[lang] || 0) + n;
        }
        if (row.t === "lang_speak") {
          today.speaks += n;
          const lang = String(row.r || "").split(":")[0];
          if (lang) today.speaksByLang[lang] = (today.speaksByLang[lang] || 0) + n;
        }
        if (row.t === "lang_review") { const lang = String(row.r || "").split(":")[0]; today.reviewsByLang[lang] = (today.reviewsByLang[lang] || 0) + n; }
        if (row.t === "mini_game") today.miniGames += n;
      }
    } catch { /* bảng hoạt động chưa có trên bản cài cũ */ }
    const quota = await quotaStatus(db, user.id, await can(db, user, "ai_pro"), settings());
    // Class assignments: due soon / unsubmitted (student)
    let dueAssignments = [];
    try {
      const rows = await db.prepare(`
        SELECT a.id, a.title, a.due_at AS \"dueAt\", a.class_id AS \"classId\", c.name AS \"className\",
          (SELECT COUNT(*) FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.user_id = ?) AS attempts,
          (SELECT MAX(s.passed) FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.user_id = ?) AS passed,
          (SELECT MAX(s.manual_score) FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.user_id = ?) AS \"manualScore\"
        FROM assignments a
        JOIN classrooms c ON c.id = a.class_id
        JOIN class_members m ON m.class_id = a.class_id AND m.user_id = ? AND m.status = 'active'
        WHERE a.status = 'published' AND c.status = 'active'
          AND (a.target_all = 1 OR EXISTS (SELECT 1 FROM assignment_targets t WHERE t.assignment_id = a.id AND t.user_id = ?))
        ORDER BY CASE WHEN a.due_at IS NULL THEN 1 ELSE 0 END, a.due_at ASC
        LIMIT 20
      `).all(user.id, user.id, user.id, user.id, user.id);
      const now = Date.now();
      dueAssignments = rows.map((r) => {
        const due = r.dueAt ? Date.parse(r.dueAt) : null;
        const graded = r.manualScore != null;
        const done = (r.passed > 0) || graded;
        const overdue = due != null && due < now && !done;
        const dueSoon = due != null && due >= now && due - now < 3 * 86400000;
        return {
          id: r.id, title: r.title, dueAt: r.dueAt, classId: r.classId, className: r.className,
          attempts: r.attempts || 0, passed: done, graded,
          manualScore: graded ? Number(r.manualScore) : null,
          overdue, dueSoon,
          status: done ? "done" : (overdue ? "overdue" : (r.attempts ? "trying" : "pending")),
        };
      }).filter((x) => x.status !== "done" || x.dueSoon);
    } catch (e) { /* assignments table may not exist on very old instances */ }

    // Chuỗi ngày học (cập nhật sau mỗi hoạt động).
    let streak = { current: 0, longest: 0, lastActivityDate: null };
    try {
      const row = await db.prepare("SELECT current_streak, longest_streak, last_activity_date FROM user_streaks WHERE user_id = ?").get(user.id);
      if (row) streak = { current: row.current_streak, longest: row.longest_streak, lastActivityDate: row.last_activity_date };
    } catch { /* table not yet migrated on older instances */ }

    let report = null;
    if (mem.pro) {
      const practice = await db.prepare("SELECT item_id, best_score, attempts FROM lang_progress WHERE user_id = ? ORDER BY updated_at DESC LIMIT 20").all(user.id).catch?.(() => []) || [];
      const total = await db.prepare("SELECT COUNT(*) AS n, SUM(CASE WHEN best_score >= 80 THEN 1 ELSE 0 END) AS ok FROM lang_progress WHERE user_id = ?").get(user.id).catch?.(() => ({ n: 0, ok: 0 })) || { n: 0, ok: 0 };
      report = { struggling: [], practice, submissions: total.n || 0, passRate: total.n ? Math.round(((total.ok || 0) / total.n) * 100) : 0 };
    }
    return {
      membership: mem,
      streak,
      week,
      today,
      ai: { enabled: settings().aiEnabled && aiConfigured(), ...quota },
      dueAssignments,
      report,
      reportLocked: !mem.pro,
    };
  }

  // ---------- AI ----------
  // Allowed AI assistant roles: students/parents: student + native; teachers with active license / admins: also teacher
  async function aiPersonas(user) {
    const out = ["student", "native"];
    if (user.role === "admin" || (user.role === "teacher" && await can(db, user, "ai_teacher"))) out.push("teacher");
    return out;
  }
  async function aiAsk(req, res, user, body) {
    const S = settings();
    const mem = await membership(db, user);
    if (!S.aiEnabled) return bad(res, 403, "Rivo đang tắt.");
    if (!aiConfigured()) return bad(res, 503, "Rivo chưa được cấu hình trên máy chủ. Hãy báo quản trị viên.");
    const mode = AI_MODES.includes(body.mode) ? body.mode : "ask";
    const aiLang = body.language === "en" ? "en" : (body.language === "vi" ? "vi" : reqLang(req, user));
    const legacyTeacherMode = body.teacher === true;
    const persona = legacyTeacherMode ? "teacher" : (AI_PERSONAS.includes(body.persona) ? body.persona : "student");
    if ((persona === "teacher" || legacyTeacherMode) && !(await aiPersonas(user)).includes("teacher")) return bad(res, 403, "Chế độ Trợ giảng AI dành cho giáo viên có giấy phép còn hạn.");
    let teacherClassContext = "";
    if (persona === "teacher" && body.classId !== undefined && body.classId !== null && body.classId !== "") {
      const classId = Number(body.classId);
      const teacherClass = Number.isSafeInteger(classId) && classId > 0
        ? await db.prepare("SELECT id, name, teacher_id, status FROM classrooms WHERE id = ?").get(classId)
        : null;
      if (!teacherClass || (user.role !== "admin" && teacherClass.teacher_id !== user.id)) return bad(res, 403, "Bạn không có quyền xem dữ liệu lớp này.");
      const members = await db.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active FROM class_members WHERE class_id = ?").get(classId);
      teacherClassContext = `BỐI CẢNH LỚP ĐƯỢC PHÉP: ${teacherClass.name}; trạng thái ${teacherClass.status}; ${members.active || 0}/${members.total || 0} thành viên đang hoạt động.`;
    }
    // Minimal page context: page name only (never send personal or classroom data)
    let page = String(body.page || "").replace(/[^\p{L}\p{N} ·:/#\-_.,()]/gu, "").slice(0, 80);
    const question = String(body.question || "").trim();
    const code = String(body.code || "").slice(0, 20000);
    const error = String(body.error || "");
    // Bài ngoại ngữ -> trợ lý ngoại ngữ với ngữ cảnh do máy chủ cung cấp
    let langCtx = null;
    if (body.langItem) {
      const item = String(body.langItem).slice(0, 80);
      let sub = null;
      try { sub = await db.prepare("SELECT 1 FROM lang_progress WHERE user_id = ? AND item_id = ? AND attempts > 0").get(user.id, item); } catch {}
      langCtx = langAiContext(item, { submitted: !!sub, lang: aiLang });
      if (langCtx) page = langCtx.page.slice(0, 80);
    }
    const hasContext = !!langCtx || (mode === "explain_error" && !!error);
    if (!question && !code.trim() && !hasContext) return bad(res, 400, "Hãy nhập câu hỏi hoặc gửi kèm bài làm.");
    if ((question + code + error).length > S.aiMaxInputChars) return bad(res, 400, `Nội dung câu hỏi và bài làm dài quá (tối đa ${S.aiMaxInputChars} ký tự). Hãy rút gọn.`);
    // Anti-spam (after cheap input validation): max 6 requests/min/account and 20/min/IP
    if (hit("ai:u:" + user.id, 6, 60000) || hit("ai:ip:" + clientIp(req), 20, 60000)) return bad(res, 429, "Bạn hỏi nhanh quá. Hãy chờ khoảng 1 phút rồi hỏi tiếp.");
    const quota = await quotaStatus(db, user.id, await can(db, user, "ai_pro"), S);
    if (!quota.allowed) return bad(res, 402, quota.reason, { quota, upgrade: !mem.pro });
    if ((await monthlyCostMicro(db)) >= monthlyBudgetMicro()) { log.error("[ai] Đã chạm trần chi phí AI tháng này (AI_MONTHLY_BUDGET_USD)"); return bad(res, 503, "Rivo tạm dừng do đạt giới hạn sử dụng của hệ thống tháng này. Quản trị viên đã được thông báo."); }

    let conv = null, history = [];
    const convId = Number(body.conversationId);
    if (Number.isInteger(convId) && convId > 0) {
      conv = await db.prepare("SELECT id, title FROM ai_conversations WHERE id = ? AND user_id = ?").get(convId, user.id);
      if (conv) history = (await db.prepare("SELECT role, content FROM ai_messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 12").all(conv.id)).reverse();
    }

    const learningContext = langCtx ? langCtx.context : "";
    const userTurn = buildUserTurn({ mode, question, code, error, page, learningContext });
    if (estimateTokens(userTurn) > S.aiMaxInputChars) return bad(res, 400, "Câu hỏi dài quá, hãy rút gọn.");

    let r;
    const targetLang = String(body.langItem || "").split("-")[0] || "en";
    const nativeNote = (persona === "native" || persona === "english")
      ? `\nCHẾ ĐỘ BẢN NGỮ: Hãy trả lời chủ yếu bằng ngôn ngữ đang học (${persona === "english" ? "English" : targetLang}), câu ngắn gọn, kèm giải thích nghĩa tiếng Việt ngắn trong ngoặc cho từ khó.`
      : "";
    const sys = langCtx && persona !== "teacher"
      ? langCtx.system + nativeNote
      : systemPrompt({ persona, lang: aiLang, targetLang, examInProgress: false });
    try {
      r = await askTutor(db, {
        userId: user.id,
        mode: persona === "student" ? mode : persona + ":" + mode,
        system: sys,
        history,
        userTurn,
        maxOutputTokens: S.aiMaxOutputTokens,
      });
    } catch (e) {
      log.error("[ai]", e.code || "", String(e.message).slice(0, 200));
      return bad(res, e.code === "quota" ? 503 : 502, "Rivo đang bận hoặc gặp lỗi. Lượt này không bị tính. Bạn thử lại sau ít phút nhé.");
    }
    const t = nowIso();
    if (!conv) {
      const title = (question || (langCtx ? langCtx.page : page || "Hỏi về bài học")).slice(0, 80);
      const info = await db.prepare("INSERT INTO ai_conversations (user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?) RETURNING id").run(user.id, title, t, t);
      conv = { id: Number(info.lastInsertRowid), title };
    } else await db.prepare("UPDATE ai_conversations SET updated_at = ? WHERE id = ?").run(t, conv.id);
    const shown = question || ({ explain_error: "Giải thích lỗi giúp mình", review: "Nhận xét bài viết giúp mình", hint: "Gợi ý cho mình bài này", exercise: "Cho mình thêm bài luyện tập", next: "Mình nên học gì tiếp?" }[mode] || "Hỏi AI") + (code ? "\n```\n" + code.slice(0, 4000) + "\n```" : "");
    const insMsg = db.prepare("INSERT INTO ai_messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, ?)");
    await insMsg.run(conv.id, "user", shown, t);
    await insMsg.run(conv.id, "assistant", r.text, t);
    return ok(res, { conversationId: conv.id, answer: r.text, quota: await quotaStatus(db, user.id, await can(db, user, "ai_pro"), S), teacher: persona === "teacher", lang: aiLang });
  }

  // ---------- Admin: business analytics on real data ----------
  async function bizStats(from, to) {
    const one = async (sql, ...a) => db.prepare(sql).get(...a);
    const t = nowIso();
    const users = (await one("SELECT COUNT(*) AS n FROM users WHERE role = 'student'")).n;
    const newUsers = (await one("SELECT COUNT(*) AS n FROM users WHERE role = 'student' AND created_at >= ? AND created_at < ?", from, to)).n;
    const active = (await one("SELECT COUNT(DISTINCT user_id) AS n FROM lang_progress WHERE updated_at >= ? AND updated_at < ?", from, to)).n;
    const pro = (await one("SELECT COUNT(DISTINCT s.user_id) AS n FROM subscriptions s JOIN users u ON u.id = s.user_id WHERE u.role = 'student' AND s.status IN ('active','canceled') AND s.starts_at <= ? AND s.expires_at > ?", t, t)).n;
    const rev = (await one("SELECT COUNT(*) AS n, COALESCE(SUM(amount_vnd), 0) AS v FROM orders WHERE status = 'paid' AND paid_at >= ? AND paid_at < ?", from, to));
    const ordersCreated = (await one("SELECT COUNT(*) AS n FROM orders WHERE created_at >= ? AND created_at < ?", from, to)).n;
    const claimedPending = (await one("SELECT COUNT(*) AS n FROM orders WHERE status = 'pending' AND claimed_at IS NOT NULL")).n;
    const payers = (await one("SELECT COUNT(DISTINCT user_id) AS n FROM orders WHERE status = 'paid'")).n;
    const pays = await db.prepare("SELECT status, COUNT(*) AS n, COALESCE(SUM(amount_vnd), 0) AS v FROM payments WHERE received_at >= ? AND received_at < ? GROUP BY status").all(from, to);
    const ai = (await one("SELECT COUNT(*) AS n, SUM(CASE WHEN ok = 0 THEN 1 ELSE 0 END) AS failed, COALESCE(SUM(input_tokens), 0) AS tin, COALESCE(SUM(output_tokens), 0) AS tout, COALESCE(SUM(cost_usd_micro), 0) AS cost FROM ai_usage WHERE created_at >= ? AND created_at < ?", from, to));
    const byPlan = await db.prepare("SELECT plan_id, COUNT(*) AS n, SUM(amount_vnd) AS v FROM orders WHERE status = 'paid' AND paid_at >= ? AND paid_at < ? GROUP BY plan_id").all(from, to);
    const daily = await db.prepare("SELECT substr(paid_at, 1, 10) AS d, COUNT(*) AS n, SUM(amount_vnd) AS v FROM orders WHERE status = 'paid' AND paid_at >= ? AND paid_at < ? GROUP BY d ORDER BY d").all(from, to);
    return {
      range: { from, to }, users: { total: users, new: newUsers, active, pro, free: Math.max(0, users - pro) },
      revenue: { vnd: rev.v, orders: rev.n, ordersCreated, byPlan, daily }, claimedPending, conversion: { payers, rate: users ? Math.round((payers / users) * 1000) / 10 : 0 },
      payments: pays, ai: { requests: ai.n, failed: ai.failed || 0, inputTokens: ai.tin, outputTokens: ai.tout, costUsd: ai.cost / 1e6, monthCostUsd: (await monthlyCostMicro(db)) / 1e6, monthBudgetUsd: monthlyBudgetMicro() / 1e6, model: aiModel(), configured: aiConfigured() },
      // 4.0: LMS
      roles: Object.fromEntries((await db.prepare("SELECT role, COUNT(*) AS n FROM users GROUP BY role").all()).map((r) => [r.role, r.n])),
      lms: {
        classesOpen: (await one("SELECT COUNT(*) AS n FROM classrooms WHERE status = 'active'")).n,
        students: (await one("SELECT COUNT(DISTINCT user_id) AS n FROM class_members WHERE status = 'active'")).n,
        licensesActive: (await one("SELECT COUNT(*) AS n FROM licenses WHERE status = 'active' AND expires_at > ?", nowIso())).n,
        seatsUsed: (await one("SELECT COUNT(*) AS n FROM license_seats s JOIN licenses l ON l.id = s.license_id WHERE s.status = 'active' AND l.status = 'active'")).n,
        seatsTotal: (await one("SELECT COALESCE(SUM(seats), 0) AS n FROM licenses WHERE status = 'active' AND expires_at > ?", nowIso())).n,
        familiesActive: (await one("SELECT COUNT(*) AS n FROM family_groups WHERE status = 'active' AND expires_at > ?", nowIso())).n,
        submissions: (await one("SELECT COUNT(*) AS n FROM assignment_submissions WHERE created_at >= ? AND created_at < ?", from, to)).n,
      },
    };
  }
  function rangeOf(url) {
    const days = Math.min(3650, Math.max(1, Number(url.searchParams.get("days")) || 30));
    const to = url.searchParams.get("to") ? new Date(url.searchParams.get("to")) : new Date(Date.now() + 60000);
    const from = url.searchParams.get("from") ? new Date(url.searchParams.get("from")) : new Date(to.getTime() - days * 86400000);
    if (isNaN(from) || isNaN(to)) return null;
    return [from.toISOString(), to.toISOString()];
  }

  // ======================= ROUTER =======================
  return async function handle(req, res, url) {
    const m = req.method;
    const p = url.pathname;
    const S = settings();

    // ----- SePay Webhook (unauthenticated, verified via signature / API key) -----
    if (m === "POST" && p === "/api/pay/sepay/webhook") {
      if (hit("wh:" + clientIp(req), 120, 60000)) return bad(res, 429, "Too many requests");
      const raw = await readRaw(req, 64000);
      if (raw === null) return bad(res, 413, "Payload too large");
      // 4.0: log every webhook call (omit secret headers; truncate body to 4000 chars)
      const logEvent = (verified, reason, txnId, result) => { try { db.prepare("INSERT INTO payment_events (provider, verified, reason, txn_id, result, ip, body, created_at) VALUES ('sepay', ?, ?, ?, ?, ?, ?, ?)").run(verified ? 1 : 0, String(reason || "").slice(0, 200), txnId == null ? null : String(txnId).slice(0, 100), String(result || "").slice(0, 100), clientIp(req), raw.slice(0, 4000), nowIso()).catch(() => {}); } catch (e) { log.error("[sepay] Không ghi được nhật ký:", e.message); } };
      const v = verifySepay(req, raw, { secret: sysGet("SEPAY_WEBHOOK_SECRET") || "", apiKey: sysGet("SEPAY_API_KEY") || "" });
      if (!v.ok) { log.warn("[sepay] Từ chối webhook:", v.reason, clientIp(req)); audit(null, "webhook.rejected", "sepay", v.reason, req); logEvent(false, v.reason, null, "rejected"); return bad(res, 401, "Unauthorized"); }
      let b; try { b = JSON.parse(raw); } catch { logEvent(true, "JSON lỗi", null, "bad_request"); return bad(res, 400, "Invalid JSON"); }
      if (!b || b.id === undefined || b.id === null) { logEvent(true, "Thiếu id", null, "bad_request"); return bad(res, 400, "Missing id"); }
      // Only accept transactions into the EXACT configured bank account. If unconfigured -> do not activate (log for reconciliation).
      const acc = String(S.payAccountNo || "").trim();
      const wrongAcc = !acc || (String(b.accountNumber || "") !== acc && String(b.subAccount || "") !== acc);
      const r = await applyPayment(db, { provider: "sepay", txnId: b.id, amount: b.transferAmount, content: b.content || b.description, code: b.code, raw: b, transferType: wrongAcc ? "other_account" : (b.transferType || "in") });
      if (r.status === "matched") audit(null, "payment.matched", "order:" + r.orderId, { txn: b.id, amount: b.transferAmount, userId: r.userId }, req);
      if (r.status === "matched") db.prepare("SELECT * FROM orders WHERE id = ?").get(r.orderId).then((o) => o && pushOrderPaid(db, S, o, "SePay")).catch(() => {});
      logEvent(true, wrongAcc ? (acc ? "Sai tài khoản nhận" : "Chưa cấu hình tài khoản nhận") : "", b.id, r.duplicate ? "duplicate" : (r.status || "") + (r.reason ? ":" + r.reason : ""));
      // SePay considers HTTP 200 with {"success": true} successful. Duplicate transactions also return success so SePay stops retrying.
      sendJson(res, 200, { success: true });
      return true;
    }

    // ----- 4.10.4: order confirmation command from Zalo bot (unauthenticated, verified via shared secret) -----
    if (m === "POST" && p === "/api/integrations/zalo") {
      if (hit("zalo:" + clientIp(req), 60, 60000)) return bad(res, 429, "Too many requests");
      const raw = await readRaw(req, 8000);
      if (raw === null) return bad(res, 413, "Payload too large");
      let b = {}; try { b = JSON.parse(raw || "{}"); } catch { return bad(res, 400, "Invalid JSON"); }
      if (!S.zaloEnabled) return bad(res, 403, "Tính năng Zalo đang tắt trong Quản trị → Thanh toán.");
      // AUDIT P2-11: secret chỉ nhận qua header x-pl-secret (không qua body, tránh bị ghi lại trong log proxy).
      // Khi đã cấu hình tài khoản Zalo quản trị, người gửi phải khớp trường from (không còn bỏ qua khi thiếu from).
      if (!secretOk(S, req.headers["x-pl-secret"])) { audit(null, "zalo.rejected", "zalo", "bad secret", req); return bad(res, 401, "Unauthorized"); }
      if (S.zaloAdminId && String(b.from || "") !== String(S.zaloAdminId)) { audit(null, "zalo.rejected", "zalo", "sender not admin", req); return ok(res, { ok: false, reply: "Chỉ quản trị viên mới được xác nhận đơn." }); }
      const r = await zaloCommand(db, S, b.text || b.message || "", { audit: (a1, a2, a3, a4) => audit(a1, a2, a3, a4, req) });
      return ok(res, r);
    }

    // ----- Public -----
    // Admin-configured UI string overrides (bilingual)
    if (m === "GET" && p === "/api/public/ui-translations") {
      const lang = url.searchParams.get("lang") === "en" ? "en" : "vi";
      const items = Object.fromEntries((await db.prepare("SELECT source, text FROM ui_translations WHERE lang = ?").all(lang)).map((r) => [r.source, r.text]));
      return ok(res, { lang, items });
    }
    if (m === "GET" && p === "/api/billing/plans") {
      return ok(res, { enabled: !!S.proEnabled, plans: await listPlans(db), benefits: proBenefits(S), support: S.supportContact || "" });
    }

    // From here on: all routes require authentication
    const isClassroom = CLASSROOM_PREFIXES.some((x) => p.startsWith(x));
    const isOurs = isClassroom || p.startsWith("/api/billing/") || p.startsWith("/api/ai/") || p.startsWith("/api/learning/") || p === "/api/dashboard" || p.startsWith("/api/admin/biz/") || p.startsWith("/api/admin/system") || p === "/api/admin/notify-test" || p.startsWith("/api/admin/i18n") || p === "/api/me/entitlements" || p === "/api/profile/lang" || p === "/api/language" || p.startsWith("/api/notifications");
    if (!isOurs) return false;
    const sess = await getSession(req);
    if (!sess) return bad(res, 401, "Bạn chưa đăng nhập.");
    const user = userOf(sess);
    // 4.0: system administration is restricted to admins (classroom teachers CANNOT access /api/admin/*)
    const isTeacher = user.role === "admin";
    const csrfOk = () => requireCsrf(req, sess);
    const body = async () => { const b = await readBody(req); return b; };
    let mt; // shared regex match variable across routes — declared early to avoid TDZ
    if (S.maintenance && !isTeacher && m !== "GET") return bad(res, 503, S.maintenanceText, { maintenance: true });

    if (isClassroom) { const r = await classroomApi(req, res, url, user, sess); if (r !== false) return true; return bad(res, 404, "Không tìm thấy API này."); }
    if (m === "GET" && p === "/api/dashboard") {
      try { await maybeRemindProExpiry(db, user, await membership(db, user)); } catch {}
      return ok(res, await dashboard(user));
    }
    if (m === "GET" && p === "/api/notifications") {
      const unreadOnly = url.searchParams.get("unread") === "1";
      return ok(res, { items: await listNotifications(db, user.id, { unreadOnly }), unread: await unreadCount(db, user.id) });
    }
    if (m === "POST" && p === "/api/notifications/read-all") {
      if (!csrfOk()) return bad(res, 403, "Phiên làm việc không hợp lệ.");
      return ok(res, { ok: true, updated: await markAllRead(db, user.id) });
    }
    if (m === "POST" && (mt = /^\/api\/notifications\/(\d+)\/read$/.exec(p))) {
      if (!csrfOk()) return bad(res, 403, "Phiên làm việc không hợp lệ.");
      return ok(res, { ok: true, updated: await markRead(db, user.id, Number(mt[1])) });
    }

    // Current entitlements (aggregated across all sources) — used by UI to show/hide features; server still re-verifies on every API call
    if (m === "GET" && p === "/api/me/entitlements") return ok(res, { role: user.role, ...entSummary(db, user), membership: await membership(db, user) });
    if (((m === "PUT" && p === "/api/profile/lang") || (m === "POST" && p === "/api/language"))) {
      const b = await body(); if (b === null || !csrfOk()) return bad(res, 403, "Phiên làm việc không hợp lệ.");
      const lang = b.lang === "en" ? "en" : "vi";
      await db.prepare("UPDATE users SET lang = ? WHERE id = ?").run(lang, user.id);
      return ok(res, { lang });
    }

    // ----- Bilingual: manage content translations + UI string overrides (admin only) -----
    if (p.startsWith("/api/admin/i18n")) {
      if (user.role !== "admin") return bad(res, 403, "Chỉ quản trị viên mới dùng được chức năng này.");
      if (m !== "GET" && !csrfOk()) return bad(res, 403, "Phiên làm việc không hợp lệ.");
      if (m === "GET" && p === "/api/admin/i18n/ui") {
        return ok(res, { items: await db.prepare("SELECT source, text, updated_at AS \"updatedAt\" FROM ui_translations WHERE lang = 'en' ORDER BY source").all() });
      }
      if (m === "PUT" && p === "/api/admin/i18n/ui") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const source = String(b.source || "").trim().replace(/\s+/g, " ").slice(0, 2000), text = String(b.text || "").trim().slice(0, 4000);
        if (!source) return bad(res, 400, "Thiếu chuỗi tiếng Việt gốc.");
        if (!text) await db.prepare("DELETE FROM ui_translations WHERE lang = 'en' AND source = ?").run(source);
        else await db.prepare("INSERT INTO ui_translations (lang, source, text, updated_at) VALUES ('en', ?, ?, ?) ON CONFLICT(lang, source) DO UPDATE SET text = excluded.text, updated_at = excluded.updated_at").run(source, text, nowIso());
        await db.prepare("INSERT INTO audit_logs (actor_id, action, target, detail, ip, created_at) VALUES (?, 'i18n.ui_override', ?, '{}', '', ?)").run(user.id, source.slice(0, 120), nowIso());
        return ok(res, { ok: true });
      }
    }

    // ----- Pro plans / orders -----
    if (m === "GET" && p === "/api/billing/me") {
      const orders = await db.prepare("SELECT o.*, p.name AS plan_name FROM orders o LEFT JOIN plans p ON p.id = o.plan_id WHERE o.user_id = ? ORDER BY o.id DESC LIMIT 20").all(user.id);
      const subs = await db.prepare("SELECT s.id, s.plan_id, p.name AS plan_name, s.status, s.starts_at, s.expires_at, s.source FROM subscriptions s LEFT JOIN plans p ON p.id = s.plan_id WHERE s.user_id = ? ORDER BY s.id DESC LIMIT 20").all(user.id);
      return ok(res, { membership: await membership(db, user), orders: orders.map((o) => publicOrder(o, { name: o.plan_name })), subscriptions: subs });
    }
    if (m === "POST" && p === "/api/billing/orders") {
      const b = await body();
      if (b === null || !csrfOk()) return bad(res, 403, "Phiên làm việc không hợp lệ, hãy tải lại trang.");
      if (!S.proEnabled) return bad(res, 403, "Hiện chưa mở bán gói Pro.");
      if (!/^\d{6}$/.test(S.payBank || "") || !S.payAccountNo) return bad(res, 503, "Thanh toán tạm thời chưa sẵn sàng. Bạn thử lại sau hoặc liên hệ hỗ trợ nhé.");
      if (hit("order:" + user.id, 10, 3600000)) return bad(res, 429, "Bạn tạo quá nhiều đơn trong 1 giờ. Hãy dùng lại đơn đang chờ.");
      const r = await createOrder(db, { userId: user.id, planId: String(b.planId || ""), expireHours: S.orderExpireHours });
      if (r.error) return bad(res, 400, r.error);
      audit(user.id, "order.create", "order:" + r.order.id, { plan: r.order.plan_id, amount: r.order.amount_vnd }, req);
      return ok(res, await payInfo(r.order, S, db));
    }
    // Personal QR: student reports bank transfer -> order awaits admin reconciliation (does NOT activate Pro)
    // No recurring auto-charge (manual bank transfer), so "cancel renewal" = disable renewal reminders
    // Đơn của chính học viên: xem trạng thái (để tiếp tục thanh toán và chờ kích hoạt)
    if (m === "GET" && (mt = /^\/api\/billing\/orders\/(\d+)$/.exec(p))) {
      const o = await db.prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?").get(Number(mt[1]), user.id);
      if (!o) return bad(res, 404, "Không tìm thấy đơn này.");
      return ok(res, { ...(await payInfo(o, S, db)), membership: await membership(db, user) });
    }
    // Học viên báo "Tôi đã chuyển khoản": đánh dấu đơn và báo quản trị viên (qua Zalo nếu đã cấu hình). Không kích hoạt Pro tại đây.
    if (m === "POST" && (mt = /^\/api\/billing\/orders\/(\d+)\/claim$/.exec(p))) {
      if (!csrfOk()) return bad(res, 403, "Phiên làm việc không hợp lệ, hãy tải lại trang.");
      const o = await db.prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?").get(Number(mt[1]), user.id);
      if (!o) return bad(res, 404, "Không tìm thấy đơn này.");
      if (o.status !== "pending") return bad(res, 400, "Đơn này không còn ở trạng thái chờ thanh toán.");
      if (!o.claimed_at && Date.parse(o.expires_at) < Date.now()) return bad(res, 400, "Đơn đã hết hạn. Hãy tạo đơn mới.");
      if (!o.claimed_at) await db.prepare("UPDATE orders SET claimed_at = ? WHERE id = ? AND status = 'pending'").run(nowIso(), o.id);
      const fresh = await db.prepare("SELECT * FROM orders WHERE id = ?").get(o.id);
      const plan = await db.prepare("SELECT name FROM plans WHERE id = ?").get(fresh.plan_id);
      audit(user.id, "order.claim", "order:" + o.id, { code: o.code }, req);
      pushOrderClaimed(db, S, fresh).catch(() => {});
      return ok(res, { order: publicOrder(fresh, plan) });
    }
    // Hủy đơn chưa thanh toán. Sau khi đã báo chuyển khoản thì không cho hủy, để không bỏ sót tiền đã chuyển.
    if (m === "POST" && (mt = /^\/api\/billing\/orders\/(\d+)\/cancel$/.exec(p))) {
      if (!csrfOk()) return bad(res, 403, "Phiên làm việc không hợp lệ, hãy tải lại trang.");
      const n = (await db.prepare("UPDATE orders SET status = 'canceled' WHERE id = ? AND user_id = ? AND status = 'pending' AND claimed_at IS NULL").run(Number(mt[1]), user.id)).changes;
      if (!n) return bad(res, 400, "Không hủy được đơn này. Nếu bạn đã chuyển khoản, hãy chờ hệ thống kích hoạt hoặc liên hệ hỗ trợ.");
      audit(user.id, "order.cancel", "order:" + mt[1], {}, req);
      return ok(res, { ok: true });
    }
    if (m === "POST" && p === "/api/billing/reminder") {
      const b = await body();
      if (b === null || !csrfOk()) return bad(res, 403, "Phiên làm việc không hợp lệ.");
      const on = !!b.on;
      await db.prepare("UPDATE subscriptions SET renew_reminder = ?, status = CASE WHEN status IN ('active','canceled') THEN ? ELSE status END WHERE user_id = ? AND expires_at > ?").run(on ? 1 : 0, on ? "active" : "canceled", user.id, nowIso());
      audit(user.id, on ? "subscription.reminder_on" : "subscription.cancel_renewal", "user:" + user.id, "", req);
      return ok(res, { membership: await membership(db, user) });
    }

    // ----- Teacher licenses (view, assign seat, revoke seat) — for teachers and admins -----
    if (m === "GET" && p === "/api/billing/licenses/me") {
      if (user.role !== "teacher" && user.role !== "admin") return bad(res, 403, "Chỉ giáo viên và quản trị viên mới xem được giấy phép.");
      const t = nowIso();
      const rows = await db.prepare(`SELECT l.*, (SELECT COUNT(*) FROM license_seats s WHERE s.license_id = l.id AND s.status = 'active') AS used
        FROM licenses l WHERE l.owner_id = ? ORDER BY l.id DESC LIMIT 50`).all(user.id);
      const licenses = await Promise.all(rows.map(async (l) => {
        const seats = await db.prepare(`SELECT s.id AS \"seatId\", s.user_id, s.assigned_at, s.status, u.username, u.display_name,
          e.id AS \"entitlementId\", e.starts_at, e.expires_at
          FROM license_seats s
          JOIN users u ON u.id = s.user_id
          LEFT JOIN entitlements e ON e.source_type = 'license_seat' AND e.source_id = s.id AND e.feature = 'pro' AND e.status = 'active'
          WHERE s.license_id = ? AND s.status = 'active'
          ORDER BY s.assigned_at`).all(l.id);
        const planName = l.tier === "starter" ? "Teacher Starter" : l.tier === "standard" ? "Teacher Standard" : l.tier === "school" ? "Teacher School" : ("Giấy phép " + (l.tier || ""));
        return {
          id: l.id,
          planName,
          status: l.status === "active" && l.expires_at > t ? "active" : (l.status === "revoked" ? "revoked" : "expired"),
          expiresAt: l.expires_at,
          startsAt: l.starts_at,
          seatsUsed: l.used,
          seatsTotal: l.seats,
          tier: l.tier,
          source: l.source,
          note: l.note,
          students: seats.map((s) => ({
            seatId: s.seatId,
            userId: s.user_id,
            username: s.username,
            displayName: s.display_name,
            startsAt: s.starts_at || s.assigned_at,
            expiresAt: s.expires_at || l.expires_at,
            entitlementId: s.entitlementId,
          })),
        };
      }));
      return ok(res, { licenses });
    }

    // ----- Rivo -----
    if (m === "GET" && p === "/api/ai/status") {
      const mem = await membership(db, user);
      return ok(res, { enabled: !!S.aiEnabled, configured: aiConfigured(), pro: mem.pro, modes: AI_MODES, personas: await aiPersonas(user), examLock: null, maxInputChars: S.aiMaxInputChars, ...await quotaStatus(db, user.id, await can(db, user, "ai_pro"), S) });
    }
    if (m === "POST" && p === "/api/ai/ask") {
      const b = await body();
      if (b === null || !csrfOk()) return bad(res, 403, "Phiên làm việc không hợp lệ, hãy tải lại trang.");
      return aiAsk(req, res, user, b);
    }
    // Xem và xóa một cuộc trò chuyện AI của chính học viên
    if ((m === "GET" || m === "DELETE") && (mt = /^\/api\/ai\/conversations\/(\d+)$/.exec(p))) {
      const c = await db.prepare("SELECT id, title FROM ai_conversations WHERE id = ? AND user_id = ?").get(Number(mt[1]), user.id);
      if (!c) return bad(res, 404, "Không tìm thấy cuộc trò chuyện này.");
      if (m === "GET") {
        const messages = await db.prepare("SELECT role, content, created_at AS \"createdAt\" FROM ai_messages WHERE conversation_id = ? ORDER BY id ASC").all(c.id);
        return ok(res, { conversation: c, messages });
      }
      if (!csrfOk()) return bad(res, 403, "Phiên làm việc không hợp lệ, hãy tải lại trang.");
      await db.prepare("DELETE FROM ai_messages WHERE conversation_id = ?").run(c.id);
      await db.prepare("DELETE FROM ai_conversations WHERE id = ? AND user_id = ?").run(c.id, user.id);
      return ok(res, { ok: true });
    }
    if (m === "GET" && p === "/api/ai/conversations") {
      return ok(res, { conversations: await db.prepare("SELECT id, title, created_at AS \"createdAt\", updated_at AS \"updatedAt\" FROM ai_conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50").all(user.id) });
    }

    // ----- System configuration (3.2.0): AI keys, SePay, website URL -----
    // Nút "Gửi thông báo thử" trong quản trị: tạo thông báo nội bộ và thử webhook nếu đã cấu hình
    if (m === "POST" && p === "/api/admin/notify-test") {
      if (!isTeacher) return bad(res, 403, "Chỉ quản trị viên mới dùng được chức năng này.");
      if (!csrfOk()) return bad(res, 403, "Phiên làm việc không hợp lệ.");
      await notify(db, { userId: user.id, kind: "test", title: "Thông báo thử", body: "Đây là thông báo thử từ trang quản trị.", link: "/app/quan-tri" });
      const wh = webhookConfig();
      const result = wh.enabled
        ? await deliverWebhook({ kind: "test", userId: user.id, username: user.username, title: "Thông báo thử", body: "Kiểm tra kết nối webhook từ quản trị.", link: "/app/quan-tri", createdAt: nowIso() })
        : { ok: false, skipped: true };
      return ok(res, { ok: true, webhook: { enabled: wh.enabled }, result });
    }
    if (p.startsWith("/api/admin/system")) {
      if (!isTeacher) return bad(res, 403, "Chỉ quản trị viên mới dùng được chức năng này.");
      if (m !== "GET" && !csrfOk()) return bad(res, 403, "Phiên làm việc không hợp lệ.");
      const base = () => ctx.publicUrl() || `https://${String(req.headers.host || "").replace(/[^A-Za-z0-9.:-]/g, "")}`;
      const view = () => ({ ...sysPublicView(), webhookUrl: base() + "/api/pay/sepay/webhook", ai: { configured: aiConfigured(), model: aiModel() } });
      if (m === "GET" && p === "/api/admin/system") return ok(res, view());
      if (m === "PUT" && p === "/api/admin/system") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        if (hit("sys:" + user.id, 20, 600000)) return bad(res, 429, "Bạn lưu quá nhiều lần. Chờ vài phút.");
        const secrets = b.secrets && typeof b.secrets === "object" ? b.secrets : {};
        const touchesSecret = Object.values(secrets).some((v) => v === null || String(v || "").trim());
        // Changing secret keys: require re-entering admin password (protects against hijacked sessions)
        if (touchesSecret && !(await ctx.checkPassword(user.id, b.password))) { audit(user.id, "system.secret_denied", "system", "Sai mật khẩu xác nhận", req); return bad(res, 403, "Mật khẩu xác nhận chưa đúng. Đổi khóa bí mật cần nhập lại mật khẩu của bạn."); }
        const r = await sysUpdate({ values: b.values || {}, secrets });
        if (r.errors.length) return bad(res, 400, r.errors.join(" "));
        let warning = "";
        return ok(res, { ...view(), changed: r.changed, warning });
      }
      if (m === "POST" && p === "/api/admin/system/test-ai") {
        if (hit("sys-ai:" + user.id, 10, 600000)) return bad(res, 429, "Thử quá nhiều lần, chờ vài phút.");
        const diag = aiDiagnose();
        if (!diag.configured) return bad(res, 400, "Chưa có khóa API Gemini hoặc AI_PROVIDER=disabled.", { diagnose: diag });
        const t0 = Date.now();
        try {
          const r = await askTutor(db, { userId: user.id, mode: "test", system: "Bạn là trợ lý. Trả lời rất ngắn bằng tiếng Việt.", history: [], userTurn: "Hãy trả lời đúng một câu: Kết nối thành công.", maxOutputTokens: 40 });
          audit(user.id, "system.test_ai", "ai", { ok: true, model: r.model }, req);
          return ok(res, { ok: true, model: r.model, ms: Date.now() - t0, text: r.text.slice(0, 200), inputTokens: r.inputTokens, outputTokens: r.outputTokens, diagnose: diag });
        } catch (e) {
          audit(user.id, "system.test_ai", "ai", { ok: false, error: String(e.message || e).slice(0, 200) }, req);
          return ok(res, { ok: false, ms: Date.now() - t0, error: String(e.message || e).slice(0, 300), hint: explainAiError(e.message), diagnose: diag, code: e.code || "" });
        }
      }
      return bad(res, 404, "Không tìm thấy API này.");
    }

    // ----- Business administration (teacher/admin only) -----
    if (p.startsWith("/api/admin/biz/")) {
      if (!isTeacher) return bad(res, 403, "Chỉ quản trị viên mới dùng được chức năng này.");
      if (m !== "GET" && !csrfOk()) return bad(res, 403, "Phiên làm việc không hợp lệ.");
      const q = url.searchParams;
      const limit = Math.min(500, Math.max(1, Number(q.get("limit")) || 100));
      if (m === "GET" && p === "/api/admin/biz/stats") {
        const r = rangeOf(url); if (!r) return bad(res, 400, "Khoảng thời gian không hợp lệ.");
        return ok(res, await bizStats(r[0], r[1]));
      }
      if (m === "GET" && p === "/api/admin/biz/orders") {
        const st = q.get("status"); const s = String(q.get("q") || "").trim();
        const rows = await db.prepare(`SELECT o.*, u.username, u.display_name, p.name AS plan_name FROM orders o JOIN users u ON u.id = o.user_id LEFT JOIN plans p ON p.id = o.plan_id
          WHERE (? = '' OR o.status = ? OR (? = 'claimed' AND o.status = 'pending' AND o.claimed_at IS NOT NULL)) AND (? = '' OR LOWER(o.code) LIKE LOWER(?) OR LOWER(u.username) LIKE LOWER(?))
          ORDER BY (o.status = 'pending' AND o.claimed_at IS NOT NULL) DESC, o.id DESC LIMIT ?`).all(st || "", st || "", st || "", s, `%${s}%`, `%${s}%`, limit);
        return ok(res, { orders: rows.map((o) => ({ ...publicOrder(o, { name: o.plan_name }), userId: o.user_id, username: o.username, displayName: o.display_name, paymentId: o.payment_id })) });
      }
      if (m === "GET" && p === "/api/admin/biz/payments") {
        const st = q.get("status");
        const rows = await db.prepare("SELECT y.id, y.provider, y.provider_txn_id AS \"txnId\", y.order_id AS \"orderId\", o.code AS \"orderCode\", y.amount_vnd AS \"amountVnd\", y.content, y.status, y.note, y.received_at AS \"receivedAt\" FROM payments y LEFT JOIN orders o ON o.id = y.order_id WHERE (? = '' OR y.status = ?) ORDER BY y.id DESC LIMIT ?").all(st || "", st || "", limit);
        return ok(res, { payments: rows });
      }
      // Manually confirm an order (when webhook fails). Requires bank transaction ID for reconciliation; writes audit log.
      // Reject an order where student claimed transfer but funds were not received (after checking bank statement)
      // Match an unmatched bank transaction (wrong transfer memo) to the right order
      if (m === "GET" && p === "/api/admin/biz/plans") return ok(res, { plans: await listPlans(db, { all: true }) });
      // Create a new plan (e.g. Pro 6 months, Teacher 3 months)
      if (m === "POST" && p === "/api/admin/biz/plans") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const id = String(b.id || "").trim().toLowerCase();
        if (!/^[a-z0-9_]{3,40}$/.test(id)) return bad(res, 400, "Mã gói 3–40 ký tự: chữ thường không dấu, số, dấu _.");
        if (await db.prepare("SELECT 1 FROM plans WHERE id = ?").get(id)) return bad(res, 400, "Mã gói đã tồn tại.");
        const kind = ["pro", "family", "teacher"].includes(b.kind) ? b.kind : null;
        const name = String(b.name || "").trim().slice(0, 80), months = Math.round(Number(b.months)), seats = Math.round(Number(b.seats || 1)), price = Math.round(Number(b.priceVnd)), quote = b.quoteOnly ? 1 : 0;
        if (!kind || !name || !(months >= 1 && months <= 36) || !(seats >= 1 && seats <= 5000) || (!quote && !(price >= 1000 && price <= 100000000))) return bad(res, 400, "Kiểm tra lại loại gói, tên, số tháng (1–36), số chỗ, giá.");
        await db.tx(async (t) => {
          await t.prepare("INSERT INTO plans (id, name, name_en, kind, months, seats, price_vnd, quote_only, active, sort, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)").run(id, name, String(b.nameEn || "").slice(0, 80), kind, months, kind === "pro" ? 1 : seats, quote ? Math.max(0, price || 0) : price, quote, kind === "pro" ? 5 : kind === "family" ? 15 : 25, nowIso());
          const f = t.prepare("INSERT INTO plan_features (plan_id, feature, value) VALUES (?, ?, ?) ON CONFLICT (plan_id, feature) DO NOTHING");
          await f.run(id, "pro", "1"); await f.run(id, "ai_pro", "1");
          if (kind === "family") await f.run(id, "family_seats", String(seats));
          if (kind === "teacher") { await f.run(id, "class_create", "1"); await f.run(id, "class_seats", String(seats)); await f.run(id, "ai_teacher", "1"); }
        });
        audit(user.id, "plan.create", "plan:" + id, { kind, name, months, seats, price, quote }, req);
        return ok(res, { plans: await listPlans(db, { all: true }) });
      }
      // Thu hồi Pro cá nhân / quản trị tặng (không đụng tới lớp học hay gói gia đình)
      const seg = p.split("/");
      if (m === "POST" && seg.length === 7 && seg[4] === "users" && seg[6] === "revoke") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const note = String(b.note || "").trim();
        if (note.length < 3) return bad(res, 400, "Ghi lý do ít nhất 3 ký tự.");
        const uid = Number(seg[5]);
        if (!(await db.prepare("SELECT 1 FROM users WHERE id = ?").get(uid))) return bad(res, 404, "Không tìm thấy tài khoản.");
        await revokePersonalPro(db, uid, user.id, note);
        audit(user.id, "pro.revoke", "user:" + uid, { note }, req);
        return ok(res, { ok: true });
      }
      // Hủy đơn đang chờ thanh toán
      if (m === "POST" && seg.length === 7 && seg[4] === "orders" && seg[6] === "reject") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const note = String(b.note || "").trim();
        if (note.length < 3) return bad(res, 400, "Ghi lý do ít nhất 3 ký tự.");
        const n = (await db.prepare("UPDATE orders SET status = 'canceled' WHERE id = ? AND status = 'pending'").run(Number(seg[5]))).changes;
        if (!n) return bad(res, 400, "Đơn này không còn ở trạng thái chờ thanh toán.");
        audit(user.id, "order.reject", "order:" + seg[5], { note }, req);
        return ok(res, { ok: true });
      }
      // Gán thủ công giao dịch chưa khớp vào đơn đang chờ (khi webhook không khớp được mã đơn)
      if (m === "POST" && seg.length === 7 && seg[4] === "payments" && seg[6] === "assign") {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const code = String(b.orderCode || "").trim().toUpperCase();
        if (!/^PL[A-HJ-NP-Z2-9]{6}$/.test(code)) return bad(res, 400, "Mã đơn không đúng định dạng (PL và 6 ký tự).");
        const payId = Number(seg[5]);
        const pay = await db.prepare("SELECT * FROM payments WHERE id = ?").get(payId);
        if (!pay) return bad(res, 404, "Không tìm thấy giao dịch.");
        if (!["unmatched", "mismatch"].includes(pay.status)) return bad(res, 400, "Giao dịch này không cần gán thủ công.");
        const order = await db.prepare("SELECT * FROM orders WHERE code = ?").get(code);
        if (!order) return bad(res, 404, "Không tìm thấy đơn với mã này.");
        if (!["pending", "expired"].includes(order.status)) return bad(res, 400, "Đơn này đã thanh toán hoặc đã hủy.");
        if (Math.round(Number(pay.amount_vnd)) < order.amount_vnd) return bad(res, 400, "Số tiền giao dịch chưa đủ so với giá gói.");
        try {
          await db.tx(async (tx) => {
            const t = new Date().toISOString();
            const claimed = (await tx.prepare("UPDATE payments SET status = 'manual', order_id = ?, note = ? WHERE id = ? AND status IN ('unmatched','mismatch')").run(order.id, "Admin gán thủ công vào đơn " + code, payId)).changes;
            if (!claimed) throw new Error("PAY_CHANGED");
            const paid = (await tx.prepare("UPDATE orders SET status = 'paid', paid_at = ?, payment_id = ? WHERE id = ? AND status IN ('pending','expired')").run(t, payId, order.id)).changes;
            if (!paid) throw new Error("ORDER_CHANGED");
            await fulfillOrder(tx, order, "manual");
          });
        } catch (e) {
          return bad(res, 400, "Không gán được: giao dịch hoặc đơn vừa thay đổi. Tải lại trang rồi thử lại.");
        }
        audit(user.id, "payment.assign", "payment:" + payId, { orderCode: code }, req);
        return ok(res, { ok: true });
      }
      // Sửa gói (giá, thời hạn, báo giá, bật hoặc tắt bán)
      if (m === "POST" && seg.length === 6 && seg[4] === "plans" && /^[a-z0-9_]{3,40}$/.test(seg[5])) {
        const b = await body(); if (b === null) return bad(res, 400, "Dữ liệu không hợp lệ.");
        const planId = seg[5];
        const cur = await db.prepare("SELECT * FROM plans WHERE id = ?").get(planId);
        if (!cur) return bad(res, 404, "Không tìm thấy gói.");
        const name = String(b.name ?? cur.name).trim().slice(0, 80);
        const nameEn = String(b.nameEn ?? cur.name_en ?? "").trim().slice(0, 80);
        const months = Math.round(Number(b.months ?? cur.months));
        const quote = b.quoteOnly != null ? !!b.quoteOnly : !!cur.quote_only;
        const price = Math.round(Number(b.priceVnd ?? cur.price_vnd));
        const seats = b.seats != null ? Math.round(Number(b.seats)) : cur.seats;
        const active = b.active != null ? (b.active ? 1 : 0) : cur.active;
        if (!name || !(months >= 1 && months <= 36) || !(seats >= 1 && seats <= 5000) || (!quote && !(price >= 1000 && price <= 100000000))) return bad(res, 400, "Thông tin gói chưa hợp lệ (tên, số tháng, số chỗ hoặc giá).");
        await db.prepare("UPDATE plans SET name = ?, name_en = ?, months = ?, price_vnd = ?, quote_only = ?, active = ?, seats = ? WHERE id = ?")
          .run(name, nameEn, months, quote ? 0 : price, quote ? 1 : 0, active, seats, planId);
        audit(user.id, "plan.update", "plan:" + planId, { name, months, price, quote, active }, req);
        return ok(res, { plans: await listPlans(db, { all: true }) });
      }
      if (m === "GET" && p === "/api/admin/biz/users") {
        const s = String(q.get("q") || "").trim();
        const rows = await db.prepare("SELECT id, username, display_name, role, created_at, disabled FROM users WHERE (? = '' OR LOWER(username) LIKE LOWER(?) OR LOWER(display_name) LIKE LOWER(?)) ORDER BY id DESC LIMIT ?").all(s, `%${s}%`, `%${s}%`, limit);
        return ok(res, { users: await Promise.all(rows.map(async (u) => ({ id: u.id, username: u.username, displayName: u.display_name, role: u.role, createdAt: u.created_at, disabled: !!u.disabled, membership: await membership(db, u) }))) });
      }
      if (m === "GET" && p === "/api/admin/biz/ai-usage") {
        const r = rangeOf(url); if (!r) return bad(res, 400, "Khoảng thời gian không hợp lệ.");
        const byUser = await db.prepare("SELECT a.user_id AS \"userId\", u.username, u.display_name AS \"displayName\", u.role, COUNT(*) AS requests, SUM(a.input_tokens) AS \"inputTokens\", SUM(a.output_tokens) AS \"outputTokens\", SUM(a.cost_usd_micro) AS \"costMicro\", SUM(CASE WHEN a.ok = 0 THEN 1 ELSE 0 END) AS failed FROM ai_usage a LEFT JOIN users u ON u.id = a.user_id WHERE a.created_at >= ? AND a.created_at < ? GROUP BY a.user_id, u.username, u.display_name, u.role ORDER BY \"costMicro\" DESC LIMIT ?").all(r[0], r[1], limit);
        const byDay = await db.prepare("SELECT substr(created_at, 1, 10) AS d, COUNT(*) AS requests, SUM(CASE WHEN ok = 1 THEN 1 ELSE 0 END) AS ok, SUM(CASE WHEN ok = 0 THEN 1 ELSE 0 END) AS failed, SUM(input_tokens) AS \"inputTokens\", SUM(output_tokens) AS \"outputTokens\", SUM(cost_usd_micro) AS \"costMicro\" FROM ai_usage WHERE created_at >= ? AND created_at < ? GROUP BY d ORDER BY d").all(r[0], r[1]);
        const byMode = await db.prepare("SELECT COALESCE(NULLIF(mode, ''), '(không rõ)') AS mode, COUNT(*) AS requests, SUM(CASE WHEN ok = 1 THEN 1 ELSE 0 END) AS ok, SUM(cost_usd_micro) AS \"costMicro\" FROM ai_usage WHERE created_at >= ? AND created_at < ? GROUP BY mode ORDER BY requests DESC LIMIT 30").all(r[0], r[1]);
        const byModel = await db.prepare("SELECT COALESCE(NULLIF(model, ''), '(không rõ)') AS model, COUNT(*) AS requests, SUM(cost_usd_micro) AS \"costMicro\" FROM ai_usage WHERE created_at >= ? AND created_at < ? GROUP BY model ORDER BY requests DESC").all(r[0], r[1]);
        const errors = await db.prepare("SELECT created_at AS at, model, mode, error, user_id AS \"userId\" FROM ai_usage WHERE ok = 0 AND created_at >= ? AND created_at < ? ORDER BY id DESC LIMIT 30").all(r[0], r[1]);
        const totals = await db.prepare("SELECT COUNT(*) AS requests, SUM(CASE WHEN ok = 1 THEN 1 ELSE 0 END) AS ok, SUM(CASE WHEN ok = 0 THEN 1 ELSE 0 END) AS failed, SUM(input_tokens) AS \"inputTokens\", SUM(output_tokens) AS \"outputTokens\", SUM(cost_usd_micro) AS \"costMicro\" FROM ai_usage WHERE created_at >= ? AND created_at < ?").get(r[0], r[1]);
        const monthCost = await monthlyCostMicro(db);
        const monthBudget = monthlyBudgetMicro();
        return ok(res, {
          byUser, byDay, byMode, byModel, errors, totals,
          month: { costUsd: monthCost / 1e6, budgetUsd: monthBudget / 1e6, usedPct: monthBudget ? Math.round((monthCost / monthBudget) * 1000) / 10 : 0 },
          model: aiModel(), configured: aiConfigured(), range: { from: r[0], to: r[1] },
        });
      }
      if (m === "GET" && p === "/api/admin/biz/ai-usage.xlsx") {
        const r = rangeOf(url); if (!r) return bad(res, 400, "Khoảng thời gian không hợp lệ.");
        const { buildXlsx } = await import("./xlsx.js");
        const rowsDb = await db.prepare(`SELECT a.created_at AS at, u.username, u.display_name AS \"displayName\", a.model, a.mode, a.input_tokens AS \"inputTokens\", a.output_tokens AS \"outputTokens\", a.cost_usd_micro AS \"costMicro\", a.ok, a.error
          FROM ai_usage a LEFT JOIN users u ON u.id = a.user_id
          WHERE a.created_at >= ? AND a.created_at < ? ORDER BY a.id DESC LIMIT 5000`).all(r[0], r[1]);
        const head = ["Thời gian", "Tên đăng nhập", "Họ tên", "Model", "Chế độ", "Token vào", "Token ra", "Chi phí USD", "OK", "Lỗi"];
        const rows = [head, ...rowsDb.map((x) => [x.at, x.username || "", x.displayName || "", x.model, x.mode, x.inputTokens, x.outputTokens, (x.costMicro || 0) / 1e6, x.ok ? "1" : "0", x.error || ""])];
        const buf = buildXlsx(rows, "AI usage");
        res.writeHead(200, {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="ai-usage.xlsx"`,
          "Content-Length": buf.length,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        });
        res.end(buf);
        return true;
      }
      if (m === "GET" && p === "/api/admin/biz/payment-events") {
        const result = String(url.searchParams.get("result") || "");
        const rows = await db.prepare(`SELECT id, provider, verified, reason, txn_id AS \"txnId\", result, ip, body, created_at AS \"createdAt\" FROM payment_events ${result ? "WHERE result = ?" : ""} ORDER BY id DESC LIMIT ?`).all(...(result ? [result, limit] : [limit]));
        const counts = await db.prepare("SELECT result, COUNT(*) AS n FROM payment_events WHERE created_at >= ? GROUP BY result").all(new Date(Date.now() - 30 * 86400000).toISOString());
        return ok(res, { events: rows, counts });
      }
      if (m === "GET" && p === "/api/admin/biz/audit") {
        return ok(res, { logs: await db.prepare("SELECT a.id, a.actor_id AS \"actorId\", u.username AS actor, a.action, a.target, a.detail, a.ip, a.created_at AS \"createdAt\" FROM audit_logs a LEFT JOIN users u ON u.id = a.actor_id ORDER BY a.id DESC LIMIT ?").all(limit) });
      }
      return bad(res, 404, "Không tìm thấy API này.");
    }
    return bad(res, 404, "Không tìm thấy API này.");
  };
}

export function proBenefits(S) {
  return [
    "Trợ lý AI 100 lượt hỏi mỗi ngày (tài khoản thường được 3 lượt/ngày)",
    "Phỏng vấn AI không giới hạn (tài khoản thường được 1 buổi miễn phí)",
    "Báo cáo học tập chi tiết: bài hay sai, kỹ năng còn yếu",
  ];
}

async function payInfo(o, S, db) {
  const plan = db ? await db.prepare("SELECT name FROM plans WHERE id = ?").get(o.plan_id) : null;
  // Orders marked as transferred still display payment info (for student reference) until processed by admin
  const open = o.status === "pending" && (o.claimed_at || Date.parse(o.expires_at) > Date.now());
  return {
    order: publicOrder(o, plan),
    mode: S.payMode === "sepay" ? "sepay" : "manual",
    pay: open ? { bank: bankName(S.payBank), accountNo: S.payAccountNo, accountName: S.payAccountName, amount: o.amount_vnd, content: o.code, qrImage: bankQr({ bin: S.payBank, accountNo: S.payAccountNo, amount: o.amount_vnd, content: o.code }), confirmNote: S.manualConfirmNote } : null,
  };
}
