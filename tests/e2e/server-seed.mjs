/**
 * @file tests/e2e/server-seed.mjs
 * Isolated ephemeral server launcher, workspace safety guard, HTTP API bootstrap,
 * and temp-DATA_DIR SQLite seeding for opaque-box E2E tests.
 *
 * NEVER touches .env, data/app.db, data/secret.key, or port 8090.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { langCatalog } from '../../modules/languages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, '..', '..');

const PROTECTED_FILES = ['.env', path.join('data', 'app.db'), path.join('data', 'secret.key')];

export function snapshotWorkspaceFiles() {
  const snap = {};
  for (const rel of PROTECTED_FILES) {
    const abs = path.join(ROOT_DIR, rel);
    if (!fs.existsSync(abs)) {
      snap[rel] = { exists: false };
      continue;
    }
    const st = fs.statSync(abs);
    const buf = fs.readFileSync(abs);
    const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
    snap[rel] = {
      exists: true,
      size: st.size,
      mtimeMs: st.mtimeMs,
      sha256,
    };
  }
  return snap;
}

export function assertWorkspaceFilesUntouched(before) {
  const after = snapshotWorkspaceFiles();
  for (const rel of PROTECTED_FILES) {
    const b = before[rel];
    const a = after[rel];
    if (b.exists !== a.exists) {
      throw new Error(`Workspace safety violation: ${rel} existence changed (${b.exists} -> ${a.exists})`);
    }
    if (b.exists && (b.sha256 !== a.sha256 || b.size !== a.size)) {
      throw new Error(`Workspace safety violation: ${rel} content modified during E2E run`);
    }
  }
  return after;
}

export function allocateFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      const port = addr && typeof addr === 'object' ? addr.port : 0;
      srv.close((err) => {
        if (err) return reject(err);
        if (!port || port === 8090) {
          return reject(new Error(`Allocated invalid port: ${port}`));
        }
        resolve(port);
      });
    });
  });
}

function buildSanitizedEnv(port, dataDir) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v === undefined) continue;
    if (/^PG/i.test(k)) continue;
    if (k === 'DATABASE_URL' || k === 'ADMIN_USERNAME') continue;
    if (k === 'PORT' || k === 'HOST' || k === 'DATA_DIR') continue;
    env[k] = v;
  }
  env.PORT = String(port);
  env.HOST = '127.0.0.1';
  env.DATA_DIR = dataDir;
  env.NODE_ENV = 'test';
  // Fixture E2E: người đăng ký đầu tiên là admin (xem ALLOW_FIRST_USER_ADMIN trong server.js)
  env.ALLOW_FIRST_USER_ADMIN = '1';
  return env;
}

function parseSessionCookie(res) {
  const setCookies = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
  for (const raw of setCookies) {
    const m = /hoc_session=([^;\s]+)/.exec(raw);
    if (m) return m[1];
  }
  return '';
}

export async function apiRequest(baseUrl, method, urlPath, { body, session, headers } = {}) {
  const reqHeaders = { ...(headers || {}) };
  if (session?.token) {
    reqHeaders.Cookie = `hoc_session=${session.token}`;
  }
  if (session?.csrf && method !== 'GET' && method !== 'HEAD') {
    reqHeaders['X-CSRF-Token'] = session.csrf;
  }
  let payload;
  if (body !== undefined) {
    reqHeaders['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${baseUrl}${urlPath}`, {
    method,
    headers: reqHeaders,
    body: payload,
    redirect: 'manual',
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // Non-JSON body allowed
  }
  const cookieToken = parseSessionCookie(res);
  return { status: res.status, ok: res.ok, json, text, cookieToken, headers: res.headers };
}

function formatDateLocal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function removeDirWithRetry(dirPath, { retries = 15, delayMs = 200 } = {}) {
  if (!dirPath || !fs.existsSync(dirPath)) return;
  for (let i = 0; i < retries; i++) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

export async function startE2EServer({ keepTemp = false } = {}) {
  const workspaceSnap = snapshotWorkspaceFiles();
  const port = await allocateFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const tmpDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'study-e2e-data-'));
  const tmpChromeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'study-e2e-chrome-'));

  const env = buildSanitizedEnv(port, tmpDataDir);
  const logs = [];
  const child = spawn(process.execPath, ['server.js'], {
    cwd: ROOT_DIR,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let exited = false;
  let exitCode = null;
  child.stdout.on('data', (d) => logs.push(d.toString('utf8')));
  child.stderr.on('data', (d) => logs.push(d.toString('utf8')));
  child.on('exit', (code) => {
    exited = true;
    exitCode = code;
  });

  // Poll /api/health until server is ready
  const deadline = Date.now() + 15000;
  let healthy = false;
  while (Date.now() < deadline) {
    if (exited) {
      throw new Error(`Ephemeral server exited early (${exitCode}):\n${logs.join('')}`);
    }
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.status === 200) {
        const j = await res.json();
        if (j && j.ok) {
          healthy = true;
          break;
        }
      }
    } catch {
      // Wait and retry
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  if (!healthy) {
    try { child.kill('SIGKILL'); } catch {}
    throw new Error(`Ephemeral server did not become healthy within 15s.\nLogs:\n${logs.join('')}`);
  }

  // Bootstrap accounts, classroom, enrollment, tests via HTTP APIs
  const seed = await seedAccountsAndData(baseUrl, tmpDataDir);

  async function stop() {
    if (!exited) {
      try { child.kill('SIGTERM'); } catch {}
      const stopDeadline = Date.now() + 3000;
      while (!exited && Date.now() < stopDeadline) {
        await new Promise((r) => setTimeout(r, 80));
      }
      if (!exited) {
        try { child.kill('SIGKILL'); } catch {}
        await new Promise((r) => setTimeout(r, 250));
      }
    }
    if (!keepTemp) {
      await removeDirWithRetry(tmpDataDir).catch(() => {});
      await removeDirWithRetry(tmpChromeDir).catch(() => {});
    }
    assertWorkspaceFilesUntouched(workspaceSnap);
  }

  return {
    port,
    baseUrl,
    tmpDataDir,
    tmpChromeDir,
    workspaceSnap,
    seed,
    logs,
    stop,
  };
}

async function seedAccountsAndData(baseUrl, tmpDataDir) {
  // 1. First registered user auto-gets role = "admin"
  const adminCreds = {
    username: 'e2e_admin',
    displayName: 'Quản trị viên',
    password: 'AdminPass!234',
  };
  const adminReg = await apiRequest(baseUrl, 'POST', '/api/register', { body: adminCreds });
  if (adminReg.status !== 201 || adminReg.json?.user?.role !== 'admin') {
    throw new Error(`Admin register failed: ${adminReg.status} ${adminReg.text}`);
  }
  const admin = {
    ...adminCreds,
    user: adminReg.json.user,
    token: adminReg.cookieToken,
    csrf: adminReg.json.csrfToken,
  };

  // 2. Admin issues Teacher account + license via POST /api/admin/teachers
  const teacherCreds = {
    username: 'e2e_teacher',
    displayName: 'Giáo viên Linh',
    password: 'TeacherPass!234',
    seats: 30,
    months: 12,
    note: 'E2E test license',
  };
  const tCreate = await apiRequest(baseUrl, 'POST', '/api/admin/teachers', {
    body: teacherCreds,
    session: admin,
  });
  if (!tCreate.ok) {
    throw new Error(`Teacher create failed: ${tCreate.status} ${tCreate.text}`);
  }
  const tLogin = await apiRequest(baseUrl, 'POST', '/api/login', {
    body: { username: teacherCreds.username, password: teacherCreds.password },
  });
  if (!tLogin.ok || tLogin.json?.user?.role !== 'teacher') {
    throw new Error(`Teacher login failed: ${tLogin.status} ${tLogin.text}`);
  }
  const teacher = {
    username: teacherCreds.username,
    displayName: teacherCreds.displayName,
    password: teacherCreds.password,
    user: tLogin.json.user,
    token: tLogin.cookieToken,
    csrf: tLogin.json.csrfToken,
  };

  // 3. Register primary student + 3 leaderboard peers + 1 zero-progress boundary student
  async function regStudent(username, displayName, password) {
    const r = await apiRequest(baseUrl, 'POST', '/api/register', {
      body: { username, displayName, password },
    });
    if (r.status !== 201 || r.json?.user?.role !== 'student') {
      throw new Error(`Student ${username} register failed: ${r.status} ${r.text}`);
    }
    return {
      username,
      displayName,
      password,
      user: r.json.user,
      token: r.cookieToken,
      csrf: r.json.csrfToken,
    };
  }

  const student = await regStudent('e2e_student', 'Minh Anh', 'StudentPass!234');
  const peer1 = await regStudent('e2e_peer1', 'Gia Bảo', 'StudentPass!234');
  const peer2 = await regStudent('e2e_peer2', 'Khánh Vy', 'StudentPass!234');
  const peer3 = await regStudent('e2e_peer3', 'Tuấn Kiệt', 'StudentPass!234');
  const zeroStudent = await regStudent('e2e_zero', 'Học viên mới', 'StudentPass!234');
  const parent = await regStudent('e2e_parent', 'Phụ huynh Hoa', 'ParentPass!234');

  // 4. Teacher creates classroom, enrolls student + zeroStudent, publishes 2 MCQ tests
  const clsRes = await apiRequest(baseUrl, 'POST', '/api/classes', {
    body: {
      name: 'Lớp Tiếng Anh A1 E2E',
      description: 'Lớp kiểm tra tự động E2E',
      maxMembers: 50,
      requireApproval: false,
    },
    session: teacher,
  });
  if (!clsRes.ok || !clsRes.json?.class?.id) {
    throw new Error(`Class create failed: ${clsRes.status} ${clsRes.text}`);
  }
  const classroom = clsRes.json.class;

  const enrollRes = await apiRequest(baseUrl, 'POST', `/api/classes/${classroom.id}/members`, {
    body: { usernames: [student.username, zeroStudent.username] },
    session: teacher,
  });
  if (!enrollRes.ok) {
    throw new Error(`Enroll failed: ${enrollRes.status} ${enrollRes.text}`);
  }

  const testMainRes = await apiRequest(baseUrl, 'POST', `/api/classes/${classroom.id}/tests`, {
    body: {
      title: 'Kiểm tra giữa kỳ Tiếng Anh A1',
      instructions: 'Chọn một đáp án đúng cho mỗi câu hỏi.',
      durationMin: 15,
      maxAttempts: 3,
      shuffle: false,
      questions: [
        { type: 'mcq', q: 'How do you greet someone in the morning?', options: ['Good morning', 'Good night', 'Goodbye', 'See you'], answer: 0, points: 2 },
        { type: 'mcq', q: 'I ___ a student.', options: ['is', 'am', 'are', 'be'], answer: 1, points: 2 },
        { type: 'mcq', q: 'She ___ from Vietnam.', options: ['are', 'am', 'is', 'were'], answer: 2, points: 2 },
        { type: 'mcq', q: "Choose the plural of 'book':", options: ['bookes', 'books', 'book', 'booking'], answer: 1, points: 2 },
        { type: 'mcq', q: "What is the opposite of 'hot'?", options: ['warm', 'cold', 'big', 'fast'], answer: 1, points: 2 },
      ],
    },
    session: teacher,
  });
  if (!testMainRes.ok || !testMainRes.json?.test?.id) {
    throw new Error(`Test main create failed: ${testMainRes.status} ${testMainRes.text}`);
  }

  const testBoundaryRes = await apiRequest(baseUrl, 'POST', `/api/classes/${classroom.id}/tests`, {
    body: {
      title: 'Kiểm tra nhanh từ vựng',
      instructions: 'Bài kiểm tra ngắn 2 câu.',
      durationMin: 10,
      maxAttempts: 2,
      shuffle: false,
      questions: [
        { type: 'mcq', q: 'What color is the sky on a clear day?', options: ['Blue', 'Green', 'Red', 'Yellow'], answer: 0, points: 5 },
        { type: 'mcq', q: 'How many days are in a week?', options: ['Five', 'Six', 'Seven', 'Eight'], answer: 2, points: 5 },
      ],
    },
    session: teacher,
  });
  if (!testBoundaryRes.ok || !testBoundaryRes.json?.test?.id) {
    throw new Error(`Test boundary create failed: ${testBoundaryRes.status} ${testBoundaryRes.text}`);
  }

  // 5. Seed <tmpDataDir>/app.db directly via node:sqlite DatabaseSync
  const dbPath = path.join(tmpDataDir, 'app.db');
  const db = new DatabaseSync(dbPath);
  const nowIso = new Date().toISOString();
  const todayStr = formatDateLocal(new Date());

  try {
    const catalog = langCatalog();
    const allEn = [...catalog.exercises.values()].filter((e) => e.lang === 'en');
    const enA1 = allEn.filter((e) => e.levelId === 'a1');
    const enA2 = allEn.filter((e) => e.levelId === 'a2');

    if (enA1.length < 10) {
      throw new Error(`Unexpected en A1 exercise count: ${enA1.length}`);
    }

    const insertProg = db.prepare(
      `INSERT OR REPLACE INTO lang_progress
       (user_id, item_id, best_score, last_score, attempts, completed_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`
    );

    db.exec('BEGIN');
    // Primary student: 100% EN A1 (first 12 at 100 for "Hoàn hảo" badge, rest at 95) + 3 EN A2 at 90
    enA1.forEach((ex, idx) => {
      const sc = idx < 12 ? 100 : 95;
      insertProg.run(student.user.id, ex.id, sc, sc, nowIso, nowIso);
    });
    enA2.slice(0, 3).forEach((ex) => {
      insertProg.run(student.user.id, ex.id, 90, 90, nowIso, nowIso);
    });

    // Leaderboard peers: peer1 (#1) > peer2 (#2) > peer3 (#3) > student (#4)
    const peer1Count = Math.min(allEn.length, enA1.length + 18);
    const peer2Count = Math.min(allEn.length, enA1.length + 12);
    const peer3Count = Math.min(allEn.length, enA1.length + 7);

    allEn.slice(0, peer1Count).forEach((ex) => insertProg.run(peer1.user.id, ex.id, 98, 98, nowIso, nowIso));
    allEn.slice(0, peer2Count).forEach((ex) => insertProg.run(peer2.user.id, ex.id, 96, 96, nowIso, nowIso));
    allEn.slice(0, peer3Count).forEach((ex) => insertProg.run(peer3.user.id, ex.id, 95, 95, nowIso, nowIso));

    // 7 consecutive days of learning_activities for student (unlocks "Chuỗi 7 ngày")
    const insertAct = db.prepare(
      `INSERT INTO learning_activities (user_id, activity_type, reference_id, activity_date, created_at)
       VALUES (?, 'lang_submission', ?, ?, ?)`
    );
    for (let d = 0; d < 7; d++) {
      const dt = new Date(Date.now() - d * 86400000);
      insertAct.run(student.user.id, enA1[0].id, formatDateLocal(dt), nowIso);
    }

    // user_streaks
    db.prepare(
      `INSERT OR REPLACE INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, updated_at)
       VALUES (?, 7, 7, ?, ?)`
    ).run(student.user.id, todayStr, nowIso);

    // 30 SRS words for student (unlocks "Ôn đều tay")
    const insertSrs = db.prepare(
      `INSERT OR REPLACE INTO lang_srs (user_id, lang, word, box, due_at, wrong_count, updated_at)
       VALUES (?, 'en', ?, 2, ?, 0, ?)`
    );
    for (let i = 1; i <= 30; i++) {
      insertSrs.run(student.user.id, `word_${i}`, nowIso, nowIso);
    }

    // user_prefs: bypass onboarding/guide modals & seed stars
    const upsertPref = db.prepare(
      `INSERT OR REPLACE INTO user_prefs (user_id, data, updated_at) VALUES (?, ?, ?)`
    );
    upsertPref.run(
      student.user.id,
      JSON.stringify({
        subject: 'en',
        companion: 'owl',
        guideSeen: true,
        subjectTips: { en: true },
        pet: {
          stars: 25,
          knowledge: 12,
          energy: 95,
          energyAt: Date.now(),
          energyKey: todayStr,
        },
      }),
      nowIso
    );
    upsertPref.run(
      zeroStudent.user.id,
      JSON.stringify({
        subject: 'en',
        companion: 'owl',
        guideSeen: true,
        subjectTips: { en: true },
        pet: {
          stars: 2,
          knowledge: 0,
          energy: 95,
          energyAt: Date.now(),
          energyKey: todayStr,
        },
      }),
      nowIso
    );
    // Teacher intentionally has NO subject so teacher drawer never leaks subject subtext
    upsertPref.run(teacher.user.id, JSON.stringify({ guideSeen: true }), nowIso);
    upsertPref.run(admin.user.id, JSON.stringify({ guideSeen: true }), nowIso);
    db.prepare("UPDATE users SET role = 'parent' WHERE id = ?").run(parent.user.id);
    parent.user.role = 'parent';
    upsertPref.run(parent.user.id, JSON.stringify({ guideSeen: true }), nowIso);

    db.exec('COMMIT');
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch {}
    throw err;
  } finally {
    db.close();
  }

  return {
    admin,
    teacher,
    parent,
    student,
    peer1,
    peer2,
    peer3,
    zeroStudent,
    classroom,
    testMain: testMainRes.json.test,
    testBoundary: testBoundaryRes.json.test,
  };
}
