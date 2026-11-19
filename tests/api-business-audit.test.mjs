/**
 * @file tests/api-business-audit.test.mjs
 * Comprehensive API & Business-Logic Contract Audit across all backend modules
 * (Public, Auth, Foreign Languages, XP/Stars/Quests, Speaking Lab, TOEIC, Pet/Mini-Games,
 * Classrooms/Assignments/Exams, Teacher Analytics, Family Progress, Notifications/Feedback/Rating,
 * Billing/Gift Codes, and Admin Management).
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  startE2EServer,
  apiRequest,
  snapshotWorkspaceFiles,
  assertWorkspaceFilesUntouched,
} from './e2e/server-seed.mjs';

async function main() {
  const wsSnap = snapshotWorkspaceFiles();
  const srv = await startE2EServer();
  const { baseUrl, seed } = srv;
  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      passed++;
      console.log(`  PASS ${name}`);
    } catch (err) {
      failed++;
      console.error(`  FAIL ${name}: ${err.message}`);
    }
  }

  try {
    await check('1. Public, Config, Overview, QR, UI Translations, and Health APIs', async () => {
      const h = await apiRequest(baseUrl, 'GET', '/api/health');
      assert.strictEqual(h.status, 200);
      assert.strictEqual(h.json?.ok, true);

      const cfg = await apiRequest(baseUrl, 'GET', '/api/public/config');
      assert.strictEqual(cfg.status, 200);
      assert.ok(cfg.json && typeof cfg.json === 'object');

      const ov = await apiRequest(baseUrl, 'GET', '/api/public/overview');
      assert.strictEqual(ov.status, 200);
      assert.strictEqual(Array.isArray(ov.json?.languages), true, `Expected languages array in /api/public/overview`);
      assert.strictEqual(ov.json.languages.length, 6);

      const qr = await apiRequest(baseUrl, 'GET', '/api/public/qr?url=https%3A%2F%2Fstudy.liferivo.com%2Ftai-ung-dung');
      assert.strictEqual(qr.status, 200);
      assert.ok(
        qr.text.includes('<svg') || qr.json?.qr?.startsWith('data:image/svg+xml') || qr.json?.svg?.includes('<svg'),
        `Expected SVG payload from /api/public/qr`,
      );

      const tr = await apiRequest(baseUrl, 'GET', '/api/public/ui-translations');
      assert.strictEqual(tr.status, 200);

      const plans = await apiRequest(baseUrl, 'GET', '/api/billing/plans');
      assert.strictEqual(plans.status, 200);
      assert.ok(Array.isArray(plans.json?.plans) && plans.json.plans.length > 0);
    });

    await check('2. Auth Session, Profile, Prefs & Entitlements APIs', async () => {
      const unauth = await apiRequest(baseUrl, 'GET', '/api/dashboard');
      assert.strictEqual(unauth.status, 401);

      const me = await apiRequest(baseUrl, 'GET', '/api/me', { session: seed.student });
      assert.strictEqual(me.status, 200);
      assert.strictEqual(me.json?.user?.username, seed.student.username);

      const ent = await apiRequest(baseUrl, 'GET', '/api/me/entitlements', { session: seed.student });
      assert.strictEqual(ent.status, 200);
      assert.strictEqual(ent.json?.role, 'student');

      const proAcc = await apiRequest(baseUrl, 'GET', '/api/me/pro-access', { session: seed.student });
      assert.strictEqual(proAcc.status, 200);
      assert.strictEqual(typeof proAcc.json?.pro, 'boolean');

      const prefsGet = await apiRequest(baseUrl, 'GET', '/api/prefs', { session: seed.student });
      assert.strictEqual(prefsGet.status, 200);

      const prefsPut = await apiRequest(baseUrl, 'PUT', '/api/prefs', {
        session: seed.student,
        body: { prefs: { ...(prefsGet.json?.prefs || {}), dailyGoal: 4, companion: 'bunny' } },
      });
      assert.strictEqual(prefsPut.status, 200);
    });

    await check('3. Foreign Language Learning, 100%-Locked Class Assignment Override, SRS, Writing & Insights APIs', async () => {
      const lang = await apiRequest(baseUrl, 'GET', '/api/lang', { session: seed.student });
      assert.strictEqual(lang.status, 200);
      assert.strictEqual(lang.json?.courses?.length, 6);
      assert.strictEqual(lang.json?.pass, 80);

      const th = await apiRequest(baseUrl, 'GET', '/api/lang/theory/en/a1/1', { session: seed.student });
      assert.strictEqual(th.status, 200);
      assert.ok(th.json?.theory?.words?.length > 0);

      // Pick an uncompleted exercise in A2 dynamically from GET /api/lang catalog and solve it with 100%
      const enCourse = lang.json.courses.find((c) => c.id === 'en');
      const a2Level = enCourse?.levels?.find((l) => l.id === 'a2');
      const exId = a2Level?.units?.[0]?.exercises?.[0]?.id;
      assert.ok(exId, 'Expected A2 unit 1 exercise ID from /api/lang');

      const exGet = await apiRequest(baseUrl, 'GET', `/api/lang/ex/${exId}`, { session: seed.student });
      assert.strictEqual(exGet.status, 200, `GET /api/lang/ex/${exId} failed: ${exGet.text}`);

      const { langCatalog } = await import('../modules/languages.js');
      const cat = langCatalog();
      const rawEx = cat.exercises.get(exId);
      assert.ok(rawEx, `Expected ${exId} in catalog`);
      const rightAnswers = rawEx.questions.map((q) => {
        if (q.type === 'mcq') return q.ans;
        if (q.type === 'order') return q.tokens;
        return q.ans || q.say || '';
      });

      const sub1 = await apiRequest(baseUrl, 'POST', `/api/lang/ex/${exId}/submit`, {
        session: seed.student,
        body: { answers: rightAnswers },
      });
      assert.strictEqual(sub1.status, 200, `sub1 failed: ${sub1.text}`);
      assert.strictEqual(sub1.json?.score, 100);
      assert.strictEqual(sub1.json?.passed, true);
      assert.ok(sub1.json?.starsEarned > 0, `Expected positive starsEarned on first 100% pass, got ${sub1.json?.starsEarned}`);

      // Self-study re-submission of 100% exercise is locked (400)
      const subSelfLock = await apiRequest(baseUrl, 'POST', `/api/lang/ex/${exId}/submit`, {
        session: seed.student,
        body: { answers: rightAnswers },
      });
      assert.strictEqual(subSelfLock.status, 400);

      // Teacher creates a class assignment for this exact exercise (which student already passed with 100% in self-study)
      const createAsg = await apiRequest(baseUrl, 'POST', `/api/classes/${seed.classroom.id}/assignments`, {
        session: seed.teacher,
        body: {
          kind: 'lang',
          langItem: exId,
          title: 'Bài giao từ vựng A2 bài 1',
          maxScore: 10,
          allowResubmit: true,
          targetAll: true,
        },
      });
      assert.strictEqual(createAsg.status, 200, `Expected teacher assignment creation 200: ${createAsg.text}`);
      const asgId = createAsg.json?.assignment?.id;
      assert.ok(asgId, 'Expected created assignment ID');

      // Student MUST be able to submit the exercise when `asg` is provided, even though best_score is already 100!
      const subForClass = await apiRequest(baseUrl, 'POST', `/api/lang/ex/${exId}/submit`, {
        session: seed.student,
        body: { answers: rightAnswers, asg: asgId },
      });
      assert.strictEqual(subForClass.status, 200, `Expected 200 when submitting 100%-passed exercise for class assignment, got ${subForClass.status}: ${subForClass.text}`);
      assert.ok(subForClass.json?.assignment && !subForClass.json.assignment.error, `Expected valid assignment submission payload, got ${JSON.stringify(subForClass.json?.assignment)}`);

      // SRS Review
      const revGet = await apiRequest(baseUrl, 'GET', '/api/lang/review/en', { session: seed.student });
      assert.strictEqual(revGet.status, 200);
      const firstWord = th.json.theory.words[0].word;
      const revPost = await apiRequest(baseUrl, 'POST', '/api/lang/review', {
        session: seed.student,
        body: { lang: 'en', word: firstWord, ok: true },
      });
      assert.strictEqual(revPost.status, 200);
      assert.strictEqual(revPost.json?.ok, true);

      // Leaderboard & Certificate & Handwriting
      const lb = await apiRequest(baseUrl, 'GET', '/api/lang/leaderboard/en', { session: seed.student });
      assert.strictEqual(lb.status, 200);
      assert.ok(lb.json?.top?.length > 0 && lb.json.top[0].points > 0);

      const cert = await apiRequest(baseUrl, 'GET', '/api/lang/certificate/en/a1', { session: seed.student });
      assert.strictEqual(cert.status, 200);
      assert.strictEqual(cert.json?.ok, true);

      for (const [wLang, wLv] of [['zh', 'hsk1'], ['ja', 'n5'], ['ko', 'topik1']]) {
        const wr = await apiRequest(baseUrl, 'GET', `/api/lang/write/${wLang}/${wLv}`, { session: seed.student });
        assert.strictEqual(wr.status, 200);
        assert.ok(wr.json?.chars?.length > 0);
      }

      // Learning Insights & History
      const ins = await apiRequest(baseUrl, 'GET', '/api/lang/insights/en', { session: seed.student });
      assert.strictEqual(ins.status, 200);
      const hist = await apiRequest(baseUrl, 'GET', '/api/lang/insights/en/history?days=30', { session: seed.student });
      assert.strictEqual(hist.status, 200);
    });

    await check('4. Speaking Lab, TOEIC Center, Pet Mini-Games & Daily Mission Sync', async () => {
      const spHub = await apiRequest(baseUrl, 'GET', '/api/lang/speak/en', { session: seed.student });
      assert.strictEqual(spHub.status, 200);
      const firstTopic = spHub.json?.topics?.[0];
      const firstItem = firstTopic?.sentences?.[0] || spHub.json?.levels?.[0]?.units?.[0]?.words?.[0];
      assert.ok(firstItem?.k && firstItem?.t, 'Expected speaking item key and text');

      const spScore = await apiRequest(baseUrl, 'POST', '/api/lang/speak/score', {
        session: seed.student,
        body: {
          lang: 'en',
          key: firstItem.k,
          heard: firstItem.t,
          alts: [firstItem.t],
          conf: 0.96,
          ms: 2400,
        },
      });
      assert.strictEqual(spScore.status, 200, `Speaking score failed (key=${firstItem.k}): ${spScore.text}`);
      assert.ok(spScore.json?.score >= 85);
      assert.strictEqual(typeof spScore.json?.starsEarned, 'number');

      const pronHist = await apiRequest(baseUrl, 'GET', '/api/lang/speak/assess/history/en', { session: seed.student });
      assert.strictEqual(pronHist.status, 200);

      // TOEIC Center
      const tOv = await apiRequest(baseUrl, 'GET', '/api/toeic/overview', { session: seed.student });
      assert.strictEqual(tOv.status, 200);
      const tDrill = await apiRequest(baseUrl, 'GET', '/api/toeic/drill/1', { session: seed.student });
      assert.strictEqual(tDrill.status, 200);
      const drillAnswers = Object.fromEntries(tDrill.json.questions.map((q) => [q.id, 0]));
      const tCheck = await apiRequest(baseUrl, 'POST', '/api/toeic/drill/1/check', {
        session: seed.student,
        body: { answers: drillAnswers, seconds: 25 },
      });
      assert.strictEqual(tCheck.status, 200);
      assert.strictEqual(typeof tCheck.json?.starsEarned, 'number');

      // Pet & Mini-Game start
      const petGet = await apiRequest(baseUrl, 'GET', '/api/me/pet', { session: seed.student });
      assert.strictEqual(petGet.status, 200);
      assert.ok(petGet.json?.pet);

      const gStart = await apiRequest(baseUrl, 'POST', '/api/me/pet/game/start', {
        session: seed.student,
        body: { game: 'quiz', lang: 'en' },
      });
      assert.strictEqual(gStart.status, 200);
      assert.ok(gStart.json?.session);

      // Dashboard today counters must now reflect lessons, speaks, reviews, and miniGames!
      const dash = await apiRequest(baseUrl, 'GET', '/api/dashboard', { session: seed.student });
      assert.strictEqual(dash.status, 200);
      assert.ok(dash.json?.today?.lessons >= 1, `Expected today.lessons >= 1, got ${JSON.stringify(dash.json?.today)}`);
      assert.ok(dash.json?.today?.speaks >= 1, `Expected today.speaks >= 1, got ${JSON.stringify(dash.json?.today)}`);
      assert.ok(dash.json?.today?.reviewsByLang?.en >= 1, `Expected today.reviewsByLang.en >= 1, got ${JSON.stringify(dash.json?.today)}`);
      assert.ok(dash.json?.today?.miniGames >= 1, `Expected today.miniGames >= 1, got ${JSON.stringify(dash.json?.today)}`);
      assert.ok(dash.json?.streak?.current >= 1, `Expected streak.current >= 1`);
    });

    await check('5. Classroom Exams, Teacher Analytics, Class Reports & Family Progress Modal Contract', async () => {
      const tOv = await apiRequest(baseUrl, 'GET', '/api/teacher/overview', { session: seed.teacher });
      assert.strictEqual(tOv.status, 200);

      const tStu = await apiRequest(baseUrl, 'GET', '/api/teacher/students', { session: seed.teacher });
      assert.strictEqual(tStu.status, 200);
      const minh = (tStu.json?.students || []).find((s) => s.username === seed.student.username);
      assert.ok(minh, 'Expected Minh Anh in teacher students');
      assert.ok(minh.xp > 0, `Expected teacher student row xp > 0, got ${minh.xp}`);
      assert.ok(minh.solved > 0, `Expected teacher student row solved > 0, got ${minh.solved}`);
      assert.ok(minh.lastActive, 'Expected non-null lastActive for active student');

      const tDet = await apiRequest(baseUrl, 'GET', `/api/teacher/students/${seed.student.user.id}`, { session: seed.teacher });
      assert.strictEqual(tDet.status, 200);
      assert.ok(tDet.json?.student?.xp > 0, `Expected student detail xp > 0`);
      assert.ok(tDet.json?.student?.lessonsDone > 0, `Expected student detail lessonsDone > 0`);
      assert.ok(Array.isArray(tDet.json?.student?.recent) && tDet.json.student.recent.length > 0, 'Expected recent language exercises in studentDetail');

      // Class-scoped student detail endpoint (/api/classes/:id/students/:uid)
      const clsStuDet = await apiRequest(baseUrl, 'GET', `/api/classes/${seed.classroom.id}/students/${seed.student.user.id}`, { session: seed.teacher });
      assert.strictEqual(clsStuDet.status, 200);
      assert.ok(clsStuDet.json?.xp > 0, `Expected class student detail xp > 0, got ${clsStuDet.json?.xp}`);
      assert.ok(clsStuDet.json?.solved > 0, `Expected class student detail solved > 0, got ${clsStuDet.json?.solved}`);
      assert.ok(clsStuDet.json?.lessonsDone > 0, `Expected class student detail lessonsDone > 0, got ${clsStuDet.json?.lessonsDone}`);

      const cRep = await apiRequest(baseUrl, 'GET', `/api/classes/${seed.classroom.id}/report`, { session: seed.teacher });
      assert.strictEqual(cRep.status, 200);
      const minhRep = (cRep.json?.rows || []).find((r) => r.userId === seed.student.user.id);
      assert.ok(minhRep && minhRep.xp > 0, `Expected class report row xp > 0, got ${minhRep?.xp}`);

      // Classroom exam flow (/api/classes/:id/tests -> /api/tests/:id -> start -> submit)
      const clsTests = await apiRequest(baseUrl, 'GET', `/api/classes/${seed.classroom.id}/tests`, { session: seed.teacher });
      assert.strictEqual(clsTests.status, 200);
      let testId = clsTests.json?.tests?.[0]?.id;
      if (!testId) {
        const createTest = await apiRequest(baseUrl, 'POST', `/api/classes/${seed.classroom.id}/tests`, {
          session: seed.teacher,
          body: {
            title: 'Kiểm tra từ vựng A1',
            durationMin: 15,
            maxAttempts: 2,
            questions: [
              { type: 'mcq', points: 10, prompt: 'Hello nghĩa là gì?', choices: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Xin lỗi'], answer: 0 },
            ],
          },
        });
        assert.strictEqual(createTest.status, 200, `Create test failed: ${createTest.text}`);
        testId = createTest.json?.test?.id;
      }
      assert.ok(testId, 'Expected valid classroom testId');
      const testGet = await apiRequest(baseUrl, 'GET', `/api/tests/${testId}`, { session: seed.student });
      assert.strictEqual(testGet.status, 200);
      const testStart = await apiRequest(baseUrl, 'POST', `/api/tests/${testId}/start`, {
        session: seed.student,
        body: {},
      });
      assert.strictEqual(testStart.status, 200, `Test start failed: ${testStart.text}`);
      const testQuestions = testStart.json?.questions || [];
      const testAnswers = {};
      for (const q of testQuestions) {
        testAnswers[q.id] = q.type === 'mcq' ? 0 : 'Hello';
      }
      const testSub = await apiRequest(baseUrl, 'POST', `/api/tests/${testId}/submit`, {
        session: seed.student,
        body: { attemptId: testStart.json?.attemptId, answers: testAnswers },
      });
      assert.strictEqual(testSub.status, 200, `Test submit failed: ${testSub.text}`);

      // Family progress modal contract
      const dbPath = path.join(srv.tmpDataDir, 'app.db');
      const nowIso = new Date().toISOString();
      const expIso = new Date(Date.now() + 30 * 86400000).toISOString();
      const db = new DatabaseSync(dbPath);
      let memberRowId = null;
      try {
        const info = db.prepare(`INSERT INTO family_groups (owner_id, seats, starts_at, expires_at, status, created_at) VALUES (?, 4, ?, ?, 'active', ?)`).run(seed.parent.user.id, nowIso, expIso, nowIso);
        const gid = Number(info.lastInsertRowid);
        const mInfo = db.prepare(`INSERT INTO family_members (group_id, user_id, status, share_progress, invited_at, joined_at) VALUES (?, ?, 'active', 1, ?, ?)`).run(gid, seed.student.user.id, nowIso, nowIso);
        memberRowId = Number(mInfo.lastInsertRowid);
      } finally {
        db.close();
      }

      const famGet = await apiRequest(baseUrl, 'GET', '/api/family', { session: seed.parent });
      assert.strictEqual(famGet.status, 200);

      const famProg = await apiRequest(baseUrl, 'GET', `/api/family/members/${memberRowId}/progress`, { session: seed.parent });
      assert.strictEqual(famProg.status, 200, `famProg failed: ${famProg.text}`);
      assert.strictEqual(typeof famProg.json?.xp, 'number');
      assert.strictEqual(typeof famProg.json?.solved, 'number');
      assert.strictEqual(typeof famProg.json?.examsPassed, 'number');
      assert.strictEqual(typeof famProg.json?.lessonsDone, 'number');
      assert.ok(famProg.json.xp > 0, `Expected family progress xp > 0, got ${famProg.json.xp}`);
      assert.ok(famProg.json.solved > 0, `Expected family progress solved > 0, got ${famProg.json.solved}`);
    });

    await check('6. Notifications, Announcements, Feedback, Rating, Billing, Gift Codes & Full Admin API Suite', async () => {
      // Notifications & Announcements
      const notif = await apiRequest(baseUrl, 'GET', '/api/notifications', { session: seed.student });
      assert.strictEqual(notif.status, 200);
      const notifReadAll = await apiRequest(baseUrl, 'POST', '/api/notifications/read-all', { session: seed.student, body: {} });
      assert.strictEqual(notifReadAll.status, 200);
      const ann = await apiRequest(baseUrl, 'GET', '/api/announcements', { session: seed.student });
      assert.strictEqual(ann.status, 200);

      // Feedback & Rating & Billing
      const fbPost = await apiRequest(baseUrl, 'POST', '/api/feedback', {
        session: seed.student,
        body: { kind: 'feature', subject: 'Góp ý kiểm thử API', body: 'Hệ thống hoạt động mượt mà và đồng bộ XP chính xác.' },
      });
      assert.strictEqual(fbPost.status, 200, `Feedback post failed: ${fbPost.text}`);
      const fbMine = await apiRequest(baseUrl, 'GET', '/api/feedback/mine', { session: seed.student });
      assert.strictEqual(fbMine.status, 200);

      const rateGet = await apiRequest(baseUrl, 'GET', '/api/rating', { session: seed.student });
      assert.strictEqual(rateGet.status, 200);
      const ratePost = await apiRequest(baseUrl, 'POST', '/api/rating', {
        session: seed.student,
        body: { stars: 5, comment: 'Rất hài lòng!' },
      });
      assert.strictEqual(ratePost.status, 200, `Rating post failed: ${ratePost.text}`);

      const billMe = await apiRequest(baseUrl, 'GET', '/api/billing/me', { session: seed.student });
      assert.strictEqual(billMe.status, 200);

      // RBAC Security check
      const stuAdm = await apiRequest(baseUrl, 'GET', '/api/admin/overview', { session: seed.student });
      assert.strictEqual(stuAdm.status, 403);
      const tchAdm = await apiRequest(baseUrl, 'GET', '/api/admin/overview', { session: seed.teacher });
      assert.strictEqual(tchAdm.status, 403);

      // Admin Overview XP & Last Active
      const admOv = await apiRequest(baseUrl, 'GET', '/api/admin/overview', { session: seed.admin });
      assert.strictEqual(admOv.status, 200);
      const minhAdm = (admOv.json?.students || []).find((s) => s.username === seed.student.username);
      assert.ok(minhAdm && minhAdm.total > 0, `Expected Admin overview student total XP > 0, got ${minhAdm?.total}`);
      assert.ok(minhAdm.lastActive, 'Expected Admin overview student lastActive to be populated');

      // Full Admin GET Endpoints Audit
      const adminEndpoints = [
        '/api/admin/monitoring',
        '/api/admin/dbinfo',
        '/api/admin/settings',
        '/api/admin/system',
        '/api/admin/lang',
        '/api/admin/i18n/ui',
        '/api/admin/classes',
        '/api/admin/licenses',
        '/api/admin/teachers',
        '/api/admin/users',
        `/api/admin/users/${seed.student.user.id}`,
        '/api/feedback',
        '/api/admin/gift-codes',
        '/api/admin/biz/stats',
        '/api/admin/biz/orders',
        '/api/admin/biz/payments',
        '/api/admin/biz/plans',
        '/api/admin/biz/users',
        '/api/admin/biz/ai-usage',
        '/api/admin/biz/payment-events',
        '/api/admin/biz/audit',
      ];
      for (const ep of adminEndpoints) {
        const res = await apiRequest(baseUrl, 'GET', ep, { session: seed.admin });
        assert.strictEqual(res.status, 200, `Admin GET ${ep} failed with status ${res.status}: ${res.text}`);
      }

      // Gift Code Creation & Student Redemption
      const gcCreate = await apiRequest(baseUrl, 'POST', '/api/admin/gift-codes', {
        session: seed.admin,
        body: { count: 1, days: 14, note: 'API Audit Test' },
      });
      assert.strictEqual(gcCreate.status, 200);
      const code = gcCreate.json?.codes?.[0];
      assert.ok(code, 'Expected generated gift code');

      const gcRedeem = await apiRequest(baseUrl, 'POST', '/api/me/gift', {
        session: seed.zeroStudent,
        body: { code },
      });
      assert.strictEqual(gcRedeem.status, 200, `Expected gift code redemption 200, got ${gcRedeem.text}`);
      assert.strictEqual(gcRedeem.json?.ok, true);
    });
  } finally {
    await srv.stop();
    assertWorkspaceFilesUntouched(wsSnap);
  }

  console.log(`\n=== API & Business Logic Audit Summary: PASS=${passed} | FAIL=${failed} ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
