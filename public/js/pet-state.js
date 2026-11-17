/* Trạng thái bạn đồng hành.
   - Sao, tri thức, lượt chấm bài, thưởng trò chơi và đổi Pro do máy chủ giữ (modules/pet.js); trình duyệt chỉ hiển thị.
   - Năng lượng lưu trên trình duyệt và đồng bộ theo tài khoản (không đổi quyền lợi nên không cần máy chủ kiểm):
     · Nộp bài tập: -3 mỗi lần. Mỗi câu đúng +1 sao (máy chủ cộng).
     · Làm mới về 100 lúc 5:00 sáng (giờ Việt Nam) mỗi ngày.
     · Cứ 30 phút hồi 2, tối đa 100.
     · Trò chơi: mỗi câu đúng +1 năng lượng, tối đa 200 mỗi ngày (máy chủ giới hạn).
   - Thanh năng lượng và tri thức tối đa 100. Nối từ đúng: +1 năng lượng và +0,5 tri thức. */
import { S, api } from "./core.js";
import { savePrefs } from "./game.js";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const HALF_HOUR = 30 * 60 * 1000;
// Chu kỳ ngày đổi lúc 5:00 sáng giờ Việt Nam (UTC+7), trùng với lượt Pro miễn phí trên máy chủ
export const cycleKey = (now = Date.now()) => new Date(now + 2 * 3600000).toISOString().slice(0, 10);
const rawPet = () => (S.prefs && S.prefs.pet) || {};

// Năng lượng tại thời điểm now: làm mới khi sang chu kỳ mới, hồi 2 cho mỗi mốc 30 phút đã qua
function regen(p, now) {
  const key = cycleKey(now);
  if (p.energyKey !== key || !Number.isFinite(p.energyAt)) return { energy: 100, energyAt: now, energyKey: key };
  let energy = clamp(Number.isFinite(p.energy) ? p.energy : 100, 0, 100);
  const ticks = Math.max(0, Math.floor((now - p.energyAt) / HALF_HOUR));
  if (energy < 100 && ticks > 0) energy = clamp(energy + ticks * 2, 0, 100);
  return { energy, energyAt: p.energyAt + ticks * HALF_HOUR, energyKey: key };
}

// Số liệu máy chủ lần đọc gần nhất (đổi Pro hôm nay, năng lượng từ trò chơi hôm nay)
let view = null;
export const petView = () => view;

export function petState() {
  const p = rawPet();
  const now = Date.now();
  const key = cycleKey(now);
  const r = regen(p, now);
  return {
    energy: r.energy,
    knowledge: clamp(Number(p.knowledge) || 0, 0, 100),
    stars: Math.max(0, Math.round((Number(p.stars) || 0) * 2) / 2),
    studyDays: p.studyDays && typeof p.studyDays === "object" ? { ...p.studyDays } : {},
    daily: { date: key, lessons: p.daily && p.daily.date === key ? Math.max(0, p.daily.lessons | 0) : 0 },
  };
}
export function dailyLessons() { return petState().daily.lessons; }

// Ghi năng lượng (giữ nhịp 30 phút) và các trường khác trên trình duyệt
function persistEnergy(energy, extra = {}) {
  const cur = regen(rawPet(), Date.now());
  savePrefs({ pet: { ...rawPet(), energy, energyAt: cur.energyAt, energyKey: cur.energyKey, ...extra } });
}

// Đưa sao/tri thức/lượt học từ máy chủ vào bộ nhớ trình duyệt
function applyServer(r) {
  if (!r) return;
  if (r.pet) S.prefs.pet = { ...rawPet(), stars: r.pet.stars, knowledge: r.pet.knowledge, daily: r.pet.daily };
  if (r.status) view = r.status;
  else if (r.exchangedToday !== undefined) view = { ...(view || {}), exchangedToday: r.exchangedToday };
}

// Đọc số liệu mới nhất từ máy chủ (gọi khi mở trang chủ hoặc sau khi học xong)
export async function refreshPet() {
  try {
    const v = await api("/api/me/pet");
    view = v;
    if (v && v.pet) S.prefs.pet = { ...rawPet(), stars: v.pet.stars, knowledge: v.pet.knowledge, daily: v.pet.daily };
  } catch {}
  return view;
}

// Nộp bài tập: tốn 3 năng lượng mỗi lần. Sao từng câu đúng do máy chủ cộng, nên chỉ cần đọc lại
export function onExerciseSubmitted() {
  persistEnergy(clamp(petState().energy - 3, 0, 100));
  return refreshPet();
}

// Trò chơi: máy chủ tạo đề và giữ đáp án; mỗi câu trả lời được gửi lên để máy chủ chấm
export function startGameSession(game, lang) { return api("/api/me/pet/game/start", "POST", { game, lang }); }
export async function judgeGame(session, body) {
  const r = await api("/api/me/pet/game/judge", "POST", { session, ...body });
  if (r.energy) persistEnergy(clamp(petState().energy + r.energy, 0, 100));
  applyServer(r);
  return r;
}

export async function cheer() {
  const r = await api("/api/me/pet/cheer", "POST", {});
  applyServer(r);
  return r;
}

export async function exchange() {
  const r = await api("/api/me/pet/exchange", "POST", {});
  applyServer(r);
  return r;
}
