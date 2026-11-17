/* Lộ trình chuẩn 4 bước: NGUỒN DUY NHẤT cho màn chọn môn (welcome.js) và trang Lộ trình học (lang.js).
   Thứ tự và tên bước phải giống nhau ở mọi nơi. Sửa ở đây là đổi cả hai màn.
   Lưu ý: "Chặng N" chỉ dùng cho các chương bên trong một cấp độ (xem lang.js), không dùng cho 4 bước này. */

export const STANDARD_ROADMAP = [
  {
    key: "start",
    ic: "book",
    tint: "#FEF3C7",
    vi: { title: "Làm quen từ con số 0", desc: "Học bảng chữ cái, phiên âm chuẩn & nghe phát âm chậm 0.6x." },
    en: { title: "Start from zero", desc: "Learn the alphabet, standard pronunciation and slow audio at 0.6x." },
  },
  {
    key: "vocab",
    ic: "lesson",
    tint: "#E0F2FE",
    vi: { title: "Từ vựng & Ghép câu", desc: "Bài ngắn 5 phút: lý thuyết tinh gọn kèm ví dụ & chấm tự động ngay." },
    en: { title: "Vocabulary & sentences", desc: "5-minute lessons: short theory, examples and instant auto-grading." },
  },
  {
    key: "speak",
    ic: "mic",
    tint: "#FCE7F3",
    vi: { title: "Luyện nói & AI Coach", desc: "Tập nói từng từ qua micro, trò chuyện AI & phỏng vấn 30 ngành." },
    en: { title: "Speaking & AI Coach", desc: "Practise word by word with the mic, chat with AI and mock-interview 30 industries." },
  },
  {
    key: "review",
    ic: "trophy",
    tint: "#DCFCE7",
    vi: { title: "Ôn SRS & Chứng nhận", desc: "Thuật toán nhắc ôn đúng 1-3-7 ngày để nhớ mãi và cấp chứng nhận." },
    en: { title: "SRS review & certificate", desc: "Reminders at 1, 3 and 7 days so it sticks, then your certificate." },
  },
];

export const ROADMAP_HEAD = {
  vi: {
    eyebrow: "Cho người lần đầu học",
    title: "Lộ trình chuẩn 4 bước từ đầu đến cuối",
    desc: "Dù bạn học từ con số 0, mọi môn trên LifeRivo đều đi qua đúng 4 bước này, theo thứ tự từ trên xuống.",
  },
  en: {
    eyebrow: "For first-time learners",
    title: "Standard 4-step roadmap, start to finish",
    desc: "Whether you start from zero or not, every course on LifeRivo follows these 4 steps in order.",
  },
};

/* Tên bước theo ngôn ngữ giao diện. en = true khi giao diện tiếng Anh. */
export function roadmapStep(stage, en) {
  const t = en ? stage.en : stage.vi;
  return { no: `${en ? "Step" : "Bước"} ${STANDARD_ROADMAP.indexOf(stage) + 1}`, title: t.title, desc: t.desc };
}

/* Mục tiêu học (bước 2 của màn chào mừng). `id` là mã lưu ở prefs.goalPath; `server` là giá trị máy chủ
   chấp nhận ở prefs.goal (chỉ foundation / exam / job). Dùng chung cho màn chào mừng và tổng quan. */
export const LEARNING_GOALS = [
  { id: "giao-tiep", server: "foundation", ic: "mic", vi: "Giao tiếp hằng ngày", en: "Daily conversation" },
  { id: "hoc-du-hoc", server: "foundation", ic: "book", vi: "Học tập / du học", en: "Study / study abroad" },
  { id: "cong-viec", server: "job", ic: "briefcase", vi: "Công việc", en: "Work" },
  { id: "du-lich", server: "foundation", ic: "globe", vi: "Du lịch", en: "Travel" },
  { id: "thi-chung-chi", server: "exam", ic: "award", vi: "Thi chứng chỉ", en: "Certificate exam" },
  { id: "so-thich", server: "foundation", ic: "star", vi: "Học vì sở thích", en: "Learning for fun" },
];
export function goalById(id) {
  return LEARNING_GOALS.find((g) => g.id === id) || null;
}
