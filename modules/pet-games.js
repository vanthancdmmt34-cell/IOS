// Trò chơi có kiểm đáp án trên máy chủ.
// - Máy chủ chọn câu từ ngân hàng của khóa học (theo quyền của người chơi) và giữ đáp án trong CSDL.
// - Trình duyệt chỉ nhận đề, gửi đáp án từng câu; máy chủ chấm và mới cộng thưởng (mỗi câu chỉ chấm một lần).
// - Không còn đường nhận "số câu đúng" từ trình duyệt.
import crypto from "node:crypto";
import { gameBank, bumpStreak } from "./languages.js";
import { isPro } from "./membership.js";
import { withPetLock, grantGameUnlocked, petStatus } from "./pet.js";
import { ttsClip } from "./tts.js";

export const GAMES = ["quiz", "listen", "race", "truefalse", "spell", "builder", "unscramble", "match", "memory"];
const SESSION = 200;                 // mỗi lượt tối đa 200 câu (hoặc 200 cặp)
const TTL_MS = 24 * 3600 * 1000;     // phiên chơi hết hạn sau 1 ngày

export async function ensureGameTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS pet_game_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    game TEXT NOT NULL,
    created_at TEXT NOT NULL,
    data TEXT NOT NULL
  )`).run();
}

const rnd = () => crypto.randomBytes(9).toString("hex");
// Ngày theo giờ Việt Nam (cột activity_date)
const vnDay = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const cycle = (src, n) => { const out = []; while (src.length && out.length < n) out.push(...shuffle(src)); return out.slice(0, n); };
const own = (m, t) => (m && Object.prototype.hasOwnProperty.call(m, t) ? m[t] : null);

// Dựng lượt chơi: `items` gửi cho trình duyệt (không có đáp án), `keys` và `map` chỉ lưu trên máy chủ.
function buildGame(game, bank) {
  const W = bank.words, S = bank.sentences;
  const items = [], keys = [];
  if (game === "quiz" || game === "listen" || game === "race") {
    for (const cur of cycle(W, SESSION)) {
      const opts = shuffle([cur, ...shuffle(W.filter((w) => w.word !== cur.word)).slice(0, 3)]);
      // Nghe: đề không chứa từ đáp án; âm thanh do /api/me/pet/game/audio phát từ phía máy chủ
      items.push(game === "listen"
        ? { options: opts.map((o) => ({ id: o.word, label: o.word })) }
        : { prompt: cur.word, reading: cur.reading || "", options: opts.map((o) => ({ id: o.word, label: o.meaning })) });
      keys.push({ word: cur.word });
    }
    return { items, keys, map: {} };
  }
  if (game === "truefalse") {
    cycle(W, SESSION).forEach((w, k) => {
      const wrong = shuffle(W.filter((x) => x.word !== w.word && x.meaning !== w.meaning));
      const truth = k % 2 === 0 || !wrong.length;
      items.push({ word: w.word, meaning: truth ? w.meaning : wrong[0].meaning });
      keys.push({ truth });
    });
    return { items, keys, map: {} };
  }
  if (game === "spell") {
    for (const cur of cycle(W, SESSION)) { items.push({ meaning: cur.meaning }); keys.push({ word: cur.word }); }
    return { items, keys, map: {} };
  }
  if (game === "builder") {
    const list = S.length ? S : W.map((w) => ({ text: w.word, meaning: w.meaning }));
    for (const cur of cycle(list, SESSION)) {
      const tokens = cur.text.trim().split(/\s+/);
      items.push({ meaning: cur.meaning, tokens: shuffle(tokens) });
      keys.push({ text: tokens.join(" ").toLowerCase() });
    }
    return { items, keys, map: {} };
  }
  if (game === "unscramble") {
    const letters = (w) => [...w.word.replace(/\s/g, "")];
    const src = W.filter((w) => letters(w).length >= 3 && letters(w).length <= 12);
    if (!src.length) return null;
    for (const cur of cycle(src, SESSION)) {
      const ls = letters(cur);
      items.push({ meaning: cur.meaning, letters: shuffle(ls) });
      keys.push({ letters: ls.join("") });
    }
    return { items, keys, map: {} };
  }
  // match, memory: vòng 6 cặp đến 200 cặp. Mỗi thẻ có mã ngẫu nhiên; máy chủ nhớ thẻ nào thuộc cặp nào.
  const map = {};
  let pid = 0;
  for (let left = SESSION; left > 0;) {
    // Mỗi vòng dùng các từ khác nhau (không trùng trong cùng vòng)
    const chunk = shuffle(W).slice(0, Math.min(6, left, W.length));
    left -= chunk.length;
    const round = chunk.map((p) => ({ p, pid: pid++ }));
    if (game === "match") {
      const lefts = [], rights = [];
      for (const { p, pid } of round) {
        const tl = rnd(), tr = rnd();
        map[tl] = { pid, side: "L" }; map[tr] = { pid, side: "R" };
        lefts.push({ t: tl, label: p.word }); rights.push({ t: tr, label: p.meaning });
      }
      items.push({ lefts: shuffle(lefts), rights: shuffle(rights) });
    } else {
      const cards = [];
      for (const { p, pid } of round) {
        const ta = rnd(), tb = rnd();
        map[ta] = { pid, kind: "w" }; map[tb] = { pid, kind: "m" };
        cards.push({ t: ta, label: p.word, kind: "w" }, { t: tb, label: p.meaning, kind: "m" });
      }
      items.push({ cards: shuffle(cards) });
    }
  }
  return { items, keys: [], map };
}

// Chấm một câu đơn (quiz, listen, race, truefalse, spell, builder, unscramble)
function checkIndex(game, key, a) {
  if (game === "truefalse") return typeof a === "boolean" && a === key.truth;
  if (game === "builder") return Array.isArray(a) && a.map(String).join(" ").toLowerCase() === key.text;
  if (game === "unscramble") return typeof a === "string" && a.toLowerCase() === key.letters.toLowerCase();
  if (game === "spell") return typeof a === "string" && a.trim().toLowerCase() === key.word.toLowerCase();
  return typeof a === "string" && a === key.word; // quiz, listen, race: chọn đúng từ
}

export async function startGame(db, user, { game, lang }) {
  if (!GAMES.includes(game)) return { error: "Trò chơi không hợp lệ." };
  const isAdmin = user.role === "admin";
  const bank = gameBank(String(lang || ""), { isAdmin, isPro: isAdmin ? true : await isPro(db, user) });
  if (!bank) return { error: "Không tìm thấy khóa học." };
  if (bank.words.length < 4) return { error: "Chưa đủ từ vựng trong môn này để chơi." };
  const built = buildGame(game, bank);
  if (!built) return { error: "Chưa có từ đủ dài để chơi trò này." };
  const id = rnd() + rnd();
  const nowIso = new Date().toISOString();
  await db.prepare("DELETE FROM pet_game_sessions WHERE created_at < ?").run(new Date(Date.now() - TTL_MS).toISOString());
  await db.prepare("INSERT INTO pet_game_sessions (id, user_id, game, created_at, data) VALUES (?, ?, ?, ?, ?)")
    .run(id, user.id, game, nowIso, JSON.stringify({ ...built, judged: {}, lang: String(lang || "en") }));
  // Mỗi lượt chơi được ghi một lần để nhiệm vụ "chơi mini game hôm nay" đếm đúng
  try {
    await db.prepare("INSERT INTO learning_activities (user_id, activity_type, reference_id, activity_date, created_at) VALUES (?, 'mini_game', ?, ?, ?)")
      .run(user.id, game, vnDay(new Date()), nowIso);
  } catch { /* bảng hoạt động chưa có: không chặn việc chơi */ }
  return { session: id, game, speech: bank.speech, total: built.items.length, items: built.items };
}

// Đáp án đúng, chỉ gửi sau khi câu đã được chấm (để hiện cho người học)
function expectOf(game, key) {
  if (game === "truefalse") return key.truth;
  if (game === "builder") return key.text;
  if (game === "unscramble") return key.letters;
  return key.word;
}

export function judgeGame(db, user, { session, i, answer }) {
  return withPetLock(user.id, async () => {
    const row = await db.prepare("SELECT id, game, data FROM pet_game_sessions WHERE id = ? AND user_id = ?").get(String(session || ""), user.id);
    if (!row) return { error: "Phiên chơi không còn hiệu lực. Hãy bắt đầu lại." };
    const d = JSON.parse(row.data);
    const game = row.game;
    const now = Date.now();
    let ok = false, mark = null, word = false, expected = null;
    if (game === "match" || game === "memory") {
      if (game === "match") {
        const L = own(d.map, String(answer && answer.left)), R = own(d.map, String(answer && answer.right));
        ok = !!(L && R && L.side === "L" && R.side === "R" && L.pid === R.pid);
        if (ok) { mark = "p" + L.pid; word = true; }
      } else {
        const A = own(d.map, String(answer && answer.a)), B = own(d.map, String(answer && answer.b));
        ok = !!(A && B && answer.a !== answer.b && A.pid === B.pid && A.kind !== B.kind);
        if (ok) mark = "p" + A.pid;
      }
      if (ok && d.judged[mark]) return { ok: false, repeated: true, energy: 0, knowledge: 0, status: await petStatus(db, user) };
      if (ok) d.judged[mark] = true;
    } else {
      const idx = Number(i);
      if (!Number.isInteger(idx) || idx < 0 || idx >= d.keys.length) return { error: "Câu hỏi không hợp lệ." };
      mark = "i" + idx;
      if (d.judged[mark]) return { ok: false, repeated: true, energy: 0, knowledge: 0, status: await petStatus(db, user) };
      ok = checkIndex(game, d.keys[idx], answer);
      expected = expectOf(game, d.keys[idx]);
      d.judged[mark] = true; // mỗi câu chỉ được trả lời một lần
    }
    await db.prepare("UPDATE pet_game_sessions SET data = ? WHERE id = ?").run(JSON.stringify(d), row.id);
    if (!ok) return { ok: false, correct: false, energy: 0, knowledge: 0, expected, status: await petStatus(db, user) };
    const r = await grantGameUnlocked(db, user.id, 1, true, now);
    await bumpStreak(db, user.id, new Date(now).toISOString()).catch(() => {});
    return { ok: true, correct: true, energy: r.energy, knowledge: r.knowledge, gameEnergyLeft: r.gameEnergyLeft, pet: r.pet, status: await petStatus(db, user) };
  });
}

// Âm thanh cho câu nghe/chính tả: máy chủ phát từ đáp án đã lưu trong phiên, trình duyệt chỉ nhận WAV
export async function gameAudio(db, user, { session, i }, env) {
  const row = await db.prepare("SELECT game, data FROM pet_game_sessions WHERE id = ? AND user_id = ?").get(String(session || ""), user.id);
  if (!row) throw Object.assign(new Error("Phiên chơi không còn hiệu lực. Hãy bắt đầu lại."), { status: 404 });
  if (!["listen", "spell"].includes(row.game)) throw Object.assign(new Error("Trò chơi này không có âm thanh."), { status: 400 });
  const d = JSON.parse(row.data);
  const idx = Number(i);
  const key = Number.isInteger(idx) && idx >= 0 && idx < d.keys.length ? d.keys[idx] : null;
  if (!key || !key.word) throw Object.assign(new Error("Câu hỏi không hợp lệ."), { status: 400 });
  return ttsClip({ db, text: key.word, lang: d.lang || "en", userId: user.id, settings: env.settings, dataDir: env.dataDir });
}

// Trả về true nếu đã xử lý /api/me/pet/game/start, /judge và /audio
export async function petGamesApi({ db, req, res, url, method, user, sess, sendJson, readBody, requireCsrf, hit, settings, dataDir }) {
  const p = url.pathname;
  if (method !== "POST" || (p !== "/api/me/pet/game/start" && p !== "/api/me/pet/game/judge" && p !== "/api/me/pet/game/audio")) return false;
  const body = await readBody(req);
  if (body === null || !requireCsrf(req, sess)) { sendJson(res, 403, { error: "Phiên làm việc không hợp lệ, hãy tải lại trang." }); return true; }
  if (p.endsWith("/audio")) {
    if (hit(`pgaudio:${user.id}`, 600, 60 * 60 * 1000)) { sendJson(res, 429, { error: "Bạn nghe quá nhanh, chờ một chút nhé." }); return true; }
    try {
      const { wav } = await gameAudio(db, user, body || {}, { settings, dataDir });
      res.writeHead(200, { "Content-Type": "audio/wav", "Content-Length": wav.length, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
      res.end(wav);
    } catch (e) {
      sendJson(res, e.status || 502, { error: e.message, off: !!e.off });
    }
    return true;
  }
  if (hit(`pgame:${user.id}`, 2000, 60 * 60 * 1000)) { sendJson(res, 429, { error: "Bạn chơi quá nhanh. Thử lại sau ít phút nhé." }); return true; }
  const r = p.endsWith("/start") ? await startGame(db, user, body || {}) : await judgeGame(db, user, body || {});
  if (r.error) { sendJson(res, 400, { error: r.error }); return true; }
  sendJson(res, 200, r);
  return true;
}
