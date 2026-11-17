// Learning path and diagnostic assessment helpers for LifeRivo.
// Answers remain server-side; callers must use publicDiagnosticQuestions before sending to clients.

export function pickDiagnosticQuestions(chapters, userId, count = 44) {
  const eligible = (Array.isArray(chapters) ? chapters : []).filter((c) => Array.isArray(c.exam?.mcq) && c.exam.mcq.length);
  if (!eligible.length) return [];
  const size = Math.min(Math.max(1, Number(count) || 22), eligible.length);
  const chosen = [];
  const used = new Set();
  for (let i = 0; i < size; i++) {
    const idx = Math.floor(i * eligible.length / size);
    const c = eligible[idx];
    if (!c || used.has(c.id)) continue;
    used.add(c.id);
    const qs = c.exam.mcq;
    const q = qs[Math.abs((Number(userId) || 0) + i * 7) % qs.length];
    if (!q || !Array.isArray(q.options) || q.options.length < 2) continue;
    chosen.push({
      id: `${c.id}:${q.id}`,
      chapterId: c.id,
      chapterTitle: String(c.title || c.id),
      question: String(q.q || ""),
      options: q.options.map((x) => String(x)),
      answer: Number(q.answer),
    });
  }
  return chosen;
}

export function publicDiagnosticQuestions(items) {
  return (Array.isArray(items) ? items : []).map((q, index) => ({
    id: q.id,
    index,
    chapterId: q.chapterId,
    chapterTitle: q.chapterTitle,
    question: q.question,
    options: [...q.options],
  }));
}

export function sanitizeDiagnosticAnswers(items, answers) {
  const questions = Array.isArray(items) ? items : [];
  const incoming = Array.isArray(answers) ? answers : [];
  const allowed = new Map(questions.map((q) => [String(q.id), q]));
  const received = new Map();
  for (const item of incoming) {
    const id = String(item?.id || "");
    const q = allowed.get(id);
    if (!q) continue;
    const answer = Number(item.answer);
    received.set(id, Number.isInteger(answer) && answer >= 0 && answer < q.options.length ? answer : -1);
  }
  return questions.filter((q) => received.has(String(q.id))).map((q) => ({ id: String(q.id), answer: received.get(String(q.id)) }));
}

export function gradeDiagnostic(items, answers) {
  const qs = Array.isArray(items) ? items : [];
  const input = Array.isArray(answers) ? answers : [];
  const byId = new Map(input.map((a) => [String(a.id || ""), Number(a.answer)]));
  const details = qs.map((q) => {
    const selected = byId.has(q.id) ? byId.get(q.id) : -1;
    const correct = Number.isInteger(selected) && selected === Number(q.answer);
    return { id: q.id, chapterId: q.chapterId, chapterTitle: q.chapterTitle, selected: Number.isInteger(selected) ? selected : -1, correct };
  });
  const score = details.filter((x) => x.correct).length;
  const breakdown = {};
  for (const d of details) {
    const row = breakdown[d.chapterId] || (breakdown[d.chapterId] = { chapterId: d.chapterId, chapterTitle: d.chapterTitle, correct: 0, total: 0 });
    row.total++;
    if (d.correct) row.correct++;
  }
  return { score, maxScore: qs.length, percent: qs.length ? Math.round(score / qs.length * 100) : 0, details, breakdown: Object.values(breakdown) };
}

export function buildStudyPlan(chapters, submissionRows, assessmentBreakdown = []) {
  const submissions = Array.isArray(submissionRows) ? submissionRows : [];
  const diag = new Map((Array.isArray(assessmentBreakdown) ? assessmentBreakdown : []).map((x) => [x.chapterId, x]));
  const chapterStats = (Array.isArray(chapters) ? chapters : []).map((chapter) => {
    const exs = Array.isArray(chapter.exercises) ? chapter.exercises : [];
    const rows = exs.map((e) => submissions.find((s) => s.exercise_id === e.id)).filter(Boolean);
    const attempted = rows.length;
    const passed = rows.filter((r) => Number(r.best_score) > 0).length;
    const practiceMastery = attempted ? Math.round(passed / attempted * 100) : null;
    const d = diag.get(chapter.id);
    const diagnosticPercent = d && d.total ? Math.round(d.correct / d.total * 100) : null;
    const diagnosticWeak = diagnosticPercent != null && diagnosticPercent < 100;
    const priority = (practiceMastery == null ? 42 : 100 - practiceMastery) + (diagnosticWeak ? (100 - diagnosticPercent) * 0.65 + 15 : 0) + Math.min(15, attempted * 2);
    return { chapter, exs, attempted, passed, practiceMastery, diagnosticPercent, priority };
  }).filter((x) => x.exs.length);
  chapterStats.sort((a, b) => b.priority - a.priority || a.chapter.id.localeCompare(b.chapter.id));
  const days = [];
  const usedExercises = new Set();
  for (let i = 0; i < 7; i++) {
    const target = chapterStats[i % Math.max(1, chapterStats.length)];
    const chapter = target?.chapter || null;
    let exercise = null;
    if (target) {
      exercise = target.exs.find((e) => !usedExercises.has(e.id) && !submissions.some((s) => s.exercise_id === e.id && Number(s.best_score) > 0))
        || target.exs.find((e) => !usedExercises.has(e.id)) || target.exs[0] || null;
      if (exercise) usedExercises.add(exercise.id);
    }
    const titles = ["Ôn nền tảng", "Củng cố kiến thức", "Luyện tập có hướng dẫn", "Thực hành trọng tâm", "Vận dụng kiến thức", "Ôn tập tổng hợp", "Đánh giá tiến bộ"];
    days.push({
      day: i + 1,
      title: titles[i],
      chapterId: chapter?.id || null,
      chapterTitle: chapter?.title || "Ngoại ngữ nền tảng",
      exerciseId: i === 6 ? null : (exercise?.id || null),
      exerciseTitle: i === 6 ? null : (exercise?.title || null),
      description: i === 6 ? "Làm bài đánh giá cuối tuần để đo mức tiến bộ so với đầu vào." : (exercise ? `Ôn ${chapter.title} và hoàn thành bài: ${exercise.title}.` : `Ôn lại kiến thức trong ${chapter?.title || "giáo trình"}.`),
      estimatedMinutes: i === 6 ? 20 : 25,
      status: "pending",
      diagnosticPercent: target?.diagnosticPercent ?? null,
      practiceMastery: target?.practiceMastery ?? null,
    });
  }
  return days;
}
