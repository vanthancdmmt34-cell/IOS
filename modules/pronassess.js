// Chấm phát âm bằng Gemini (cùng khóa GEMINI_API_KEY với gia sư AI). Trả điểm tổng, trôi chảy,
// điểm và nhận xét từng từ, cùng nhận xét ngữ điệu. Đây là ước lượng của mô hình, không phải điểm âm vị đo bằng máy.
// Âm thanh của một lượt được gửi tới Gemini để chấm và không được lưu lại trên máy chủ của chúng tôi.
import { assessSpeechGemini, aiConfigured } from "./ai.js";

export const assessAvailable = () => aiConfigured();

const score = (v) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : null; };

// audioB64: bản thu base64. mime: audio/webm, audio/mp4, audio/ogg hoặc audio/wav. reference: câu mẫu.
export async function assessPronunciation(db, { userId, audioB64, mime, lang, reference }) {
  const j = await assessSpeechGemini(db, { userId, audioBase64: audioB64, mimeType: mime, lang, reference });
  const words = (Array.isArray(j.words) ? j.words : []).slice(0, 60).map((w) => {
    const s = score(w.s) ?? 0;
    return { w: String(w.w || "").slice(0, 60), s, err: s >= 85 ? "None" : "Mispronunciation", tip: String(w.tip || "").slice(0, 160), ph: [] };
  });
  const overall = score(j.overall);
  if (!String(j.heard || "").trim() && !words.length) return { ok: false, recognized: "" };
  return {
    ok: true,
    recognized: String(j.heard || "").slice(0, 300),
    scores: { accuracy: overall, fluency: score(j.fluency), completeness: null, pron: overall, prosody: null },
    intonation: String(j.intonation || "").slice(0, 300),
    words,
  };
}
