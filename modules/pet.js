// Sao, tri thức và đổi Pro của bạn đồng hành — do máy chủ giữ, không tin số liệu gửi từ trình duyệt.
// - Bài tập: mỗi câu đúng +1 sao, mỗi câu chỉ cộng một lần (xem awardExercise). Năng lượng trừ 3 mỗi lần nộp (trình duyệt).
// - Cổ vũ: 5 sao → 2 tri thức.
// - Đổi Pro: 100 tri thức → 1 ngày Pro nối tiếp sau gói đang có; tối đa 2 lần mỗi ngày (làm mới 5:00 sáng giờ Việt Nam).
// Năng lượng và lịch học chỉ để hiển thị, lưu ở trình duyệt, không đổi quyền lợi nên không cần máy chủ kiểm.
import { grantSource } from "./entitlements.js";
import { dailyKey } from "./giftcodes.js";

export const CHEER_STARS = 5;
export const CHEER_KNOWLEDGE = 2;
export const EXCHANGE_KNOWLEDGE = 100;
export const EXCHANGE_DAILY_LIMIT = 2;
const KNOWLEDGE_MAX = 100;        // thanh tri thức tối đa 100
const GAME_ENERGY_DAILY = 200;    // trò chơi hồi tối đa 200 năng lượng mỗi ngày
const WORD_ENERGY = 1;            // mỗi từ nối đúng: +1 năng lượng
const WORD_KNOWLEDGE = 0.5;       // và +0,5 tri thức
const DAY_MS = 86400000;
// Làm tròn tới 0,5 để tri thức lẻ 0,5 không bị cắt mất
const half = (v) => Math.round((Number(v) || 0) * 2) / 2;

// Khóa theo tài khoản: các lệnh đọc-ghi prefs của cùng một người chạy lần lượt, không ghi đè nhau.
const locks = new Map();
export function withPetLock(userId, fn) {
  const prev = locks.get(userId) || Promise.resolve();
  const next = prev.then(fn);
  const tail = next.catch(() => {});
  locks.set(userId, tail);
  tail.then(() => { if (locks.get(userId) === tail) locks.delete(userId); });
  return next;
}

async function readPrefs(db, userId) {
  const r = await db.prepare("SELECT data FROM user_prefs WHERE user_id = ?").get(userId);
  let data = {};
  try { data = JSON.parse(r ? r.data : "{}") || {}; } catch {}
  return data;
}
async function writePrefs(db, userId, data) {
  await db.prepare("INSERT INTO user_prefs (user_id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at")
    .run(userId, JSON.stringify(data), new Date().toISOString());
}
const petOf = (data) => {
  const p = data.pet && typeof data.pet === "object" ? data.pet : {};
  return { ...p, stars: Math.max(0, half(p.stars)), knowledge: Math.min(KNOWLEDGE_MAX, Math.max(0, half(p.knowledge))) };
};

// Sao theo % điểm của lần nộp: dưới 10% = 0; 10% = 0,5★; 100% = 5★; ở giữa tăng đều, làm tròn tới 0,5★.
export function starsForScore(score) {
  const p = Math.max(0, Math.min(100, Number(score) || 0));
  if (p < 10) return 0;
  if (p >= 100) return 5;
  return Math.round((0.5 + (p - 10) * (4.5 / 90)) * 2) / 2;
}

// Sao hiện có của từng bài tập (lần nộp gần nhất), để làm lại thì trừ sao cũ rồi cộng sao mới.
export async function ensurePetTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS pet_exercise_stars (
    user_id INTEGER NOT NULL,
    item_id TEXT NOT NULL,
    stars REAL NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (user_id, item_id)
  )`).run();
}

// Nộp bài tập: sao theo % điểm. Làm lại bài chưa đạt 100%: trừ sao cũ của bài này rồi cộng sao mới.
// Lần đầu đạt bài thì tính vào mục tiêu ngày. Trả về số sao thay đổi (có thể âm).
export function awardExercise(db, userId, exId, score, passedFirst, nowMs = Date.now()) {
  return withPetLock(userId, async () => {
    const id = String(exId);
    const prev = await db.prepare("SELECT stars FROM pet_exercise_stars WHERE user_id = ? AND item_id = ?").get(userId, id);
    const before = prev ? Number(prev.stars) || 0 : 0;
    const after = starsForScore(score);
    const delta = Math.round((after - before) * 2) / 2;
    await db.prepare("INSERT INTO pet_exercise_stars (user_id, item_id, stars, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, item_id) DO UPDATE SET stars = excluded.stars, updated_at = excluded.updated_at")
      .run(userId, id, after, new Date(nowMs).toISOString());
    if (!delta && !passedFirst) return { stars: 0 };
    const data = await readPrefs(db, userId);
    const pet = petOf(data);
    const key = dailyKey(nowMs);
    pet.stars = half(Math.max(0, pet.stars + delta));
    if (passedFirst) pet.daily = { date: key, lessons: (pet.daily && pet.daily.date === key ? pet.daily.lessons | 0 : 0) + 1 };
    data.pet = pet;
    await writePrefs(db, userId, data);
    return { stars: delta };
  });
}

export function cheer(db, user) {
  return withPetLock(user.id, async () => {
    const data = await readPrefs(db, user.id);
    const pet = petOf(data);
    if (pet.stars < CHEER_STARS) return { error: `Cần ${CHEER_STARS} sao để cổ vũ, còn thiếu ${CHEER_STARS - pet.stars} sao.` };
    if (pet.knowledge >= KNOWLEDGE_MAX) return { error: `Tri thức đã đầy ${KNOWLEDGE_MAX}. Hãy đổi 1 ngày Pro trước khi cổ vũ thêm.` };
    pet.stars -= CHEER_STARS;
    pet.knowledge = Math.min(KNOWLEDGE_MAX, half(pet.knowledge + CHEER_KNOWLEDGE));
    data.pet = pet;
    await writePrefs(db, user.id, data);
    return { ok: true, pet };
  });
}

async function exchangedCount(db, userId, key) {
  // Mỗi lần đổi ghi một dòng cho mỗi tính năng cùng source_id, nên đếm theo source_id khác nhau
  const r = await db.prepare("SELECT COUNT(DISTINCT source_id) AS n FROM entitlements WHERE user_id = ? AND source_type = 'personal' AND source_id LIKE ?").get(userId, `knowledge:${key}:%`);
  return Number(r && r.n) || 0;
}

export function exchangeKnowledge(db, user, nowMs = Date.now()) {
  return withPetLock(user.id, async () => {
    const key = dailyKey(nowMs);
    const used = await exchangedCount(db, user.id, key);
    if (used >= EXCHANGE_DAILY_LIMIT) return { error: `Hôm nay bạn đã đổi tối đa ${EXCHANGE_DAILY_LIMIT} lần. Lượt mới có lúc 5:00 sáng mai.` };
    const data = await readPrefs(db, user.id);
    const pet = petOf(data);
    if (pet.knowledge < EXCHANGE_KNOWLEDGE) return { error: `Cần ${EXCHANGE_KNOWLEDGE} tri thức để đổi 1 ngày Pro, còn thiếu ${EXCHANGE_KNOWLEDGE - pet.knowledge}.` };
    // Trừ tri thức trước; nếu cấp quyền lỗi thì hoàn lại.
    const before = { ...pet };
    pet.knowledge -= EXCHANGE_KNOWLEDGE;
    data.pet = pet;
    await writePrefs(db, user.id, data);
    try {
      const t = new Date(nowMs).toISOString();
      // Ngày Pro nối tiếp sau gói Pro còn hạn (nếu có), để không bị trùng.
      const last = await db.prepare("SELECT MAX(expires_at) AS until FROM entitlements WHERE user_id = ? AND feature = 'pro' AND status = 'active' AND expires_at > ?").get(user.id, t);
      const startMs = last && last.until ? Math.max(nowMs, Date.parse(last.until)) : nowMs;
      const expiresAt = new Date(startMs + DAY_MS).toISOString();
      await grantSource(db, {
        userId: user.id, sourceType: "personal", sourceId: `knowledge:${key}:${used + 1}`,
        startsAt: new Date(startMs).toISOString(), expiresAt, note: "Đổi 100 tri thức lấy 1 ngày Pro",
      });
      return { ok: true, expiresAt, pet, exchangedToday: used + 1, limit: EXCHANGE_DAILY_LIMIT };
    } catch (e) {
      data.pet = before;
      await writePrefs(db, user.id, data);
      throw e;
    }
  });
}

// Thưởng trò chơi, chỉ gọi sau khi máy chủ đã chấm đúng từng câu (modules/pet-games.js). Gọi trong withPetLock.
// Mỗi câu đúng +1 năng lượng, tối đa 200 năng lượng từ trò chơi mỗi ngày; nối từ đúng còn +0,5 tri thức.
export async function grantGameUnlocked(db, userId, correct, word, nowMs = Date.now()) {
  const key = dailyKey(nowMs);
  const data = await readPrefs(db, userId);
  const pet = petOf(data);
  const used = pet.gameDay && pet.gameDay.date === key ? Math.max(0, Number(pet.gameDay.energy) || 0) : 0;
  const room = Math.max(0, GAME_ENERGY_DAILY - used);
  const n = Math.min(Math.max(0, Math.floor(Number(correct) || 0)), room);
  if (n === 0) return { energy: 0, knowledge: 0, gameEnergyLeft: room };
  const knowGain = word ? Math.min(half(n * WORD_KNOWLEDGE), Math.max(0, KNOWLEDGE_MAX - pet.knowledge)) : 0;
  pet.knowledge = half(pet.knowledge + knowGain);
  pet.gameDay = { date: key, energy: used + n };
  data.pet = pet;
  await writePrefs(db, userId, data);
  return { energy: n * WORD_ENERGY, knowledge: knowGain, gameEnergyLeft: room - n, pet };
}

export async function petStatus(db, user, nowMs = Date.now()) {
  const key = dailyKey(nowMs);
  const pet = petOf(await readPrefs(db, user.id));
  return {
    pet: {
      stars: pet.stars,
      knowledge: pet.knowledge,
      daily: pet.daily && pet.daily.date === key ? { date: key, lessons: pet.daily.lessons | 0 } : { date: key, lessons: 0 },
    },
    exchangedToday: await exchangedCount(db, user.id, key),
    exchangeLimit: EXCHANGE_DAILY_LIMIT,
    exchangeCost: EXCHANGE_KNOWLEDGE,
    cheerStars: CHEER_STARS,
    knowledgeMax: KNOWLEDGE_MAX,
    gameEnergyToday: pet.gameDay && pet.gameDay.date === key ? Math.max(0, Number(pet.gameDay.energy) || 0) : 0,
    gameEnergyLimit: GAME_ENERGY_DAILY,
  };
}

// Trả về true nếu đã xử lý đường dẫn /api/me/pet...
export async function petApi({ db, req, res, url, method, user, sess, sendJson, readBody, requireCsrf, hit }) {
  const p = url.pathname;
  if (!p.startsWith("/api/me/pet")) return false;
  if (method === "GET" && p === "/api/me/pet") {
    sendJson(res, 200, await petStatus(db, user));
    return true;
  }
  if (method === "POST" && (p === "/api/me/pet/cheer" || p === "/api/me/pet/exchange")) {
    const body = await readBody(req);
    if (body === null || !requireCsrf(req, sess)) { sendJson(res, 403, { error: "Phiên làm việc không hợp lệ, hãy tải lại trang." }); return true; }
    if (hit(`petop:${user.id}`, 120, 60 * 60 * 1000)) { sendJson(res, 429, { error: "Bạn thao tác quá nhanh. Thử lại sau ít phút nhé." }); return true; }
    const r = p.endsWith("/cheer") ? await cheer(db, user) : await exchangeKnowledge(db, user);
    if (r.error) { sendJson(res, 400, { error: r.error }); return true; }
    sendJson(res, 200, { ...r, status: await petStatus(db, user) });
    return true;
  }
  return false;
}
