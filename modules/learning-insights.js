// Evidence-based learning insights for LifeRivo foreign-language courses.
// This module deliberately uses deterministic rules; it does not invent diagnoses from sparse data.

const round = (value) => Math.round(Number(value) || 0);

/**
 * Build a user-scoped insight snapshot from real language exercise progress.
 * `exercises` must contain only exercises the current user is allowed to access.
 */
export function buildLanguageInsights({
  langId,
  progressRows = [],
  exercises = [],
  passScore = 80,
  dueVocabulary = 0,
  totalVocabulary = 0,
  vocabularyRows = [],
  vocabularyReviewEvents = [],
  speakingRows = [],
  pronunciationRows = [],
  weeklyActivity = [],
  previousWeeklyActivity = [],
  lastActivityDate = null,
  daysSinceLastActivity = null,
  streak = { current: 0, longest: 0, lastActivityDate: null },
  courseProgress = { total: 0, completed: 0, percent: 0 },
} = {}) {
  const exerciseById = new Map((Array.isArray(exercises) ? exercises : []).map((item) => [String(item.id), item]));
  const rows = (Array.isArray(progressRows) ? progressRows : [])
    .map((row) => {
      const exercise = exerciseById.get(String(row.item_id));
      if (!exercise) return null;
      return {
        exercise,
        lastScore: Math.max(0, Math.min(100, Number(row.last_score) || 0)),
        bestScore: Math.max(0, Math.min(100, Number(row.best_score) || 0)),
        attempts: Math.max(0, Number(row.attempts) || 0),
        updatedAt: row.updated_at || null,
      };
    })
    .filter(Boolean);

  const scoredRows = rows.filter((row) => row.attempts > 0);
  const recentAverage = scoredRows.length
    ? round(scoredRows.reduce((sum, row) => sum + row.lastScore, 0) / scoredRows.length)
    : null;
  const bestAverage = scoredRows.length
    ? round(scoredRows.reduce((sum, row) => sum + row.bestScore, 0) / scoredRows.length)
    : null;

  // Speaking scores are based on the persisted language speaking rubric. They are not
  // treated as phoneme-level acoustic measurements: the legacy recognizer stores a
  // sentence/word matching score, so the UI must describe it as speaking practice score.
  const validSpeakingRows = (Array.isArray(speakingRows) ? speakingRows : [])
    .filter((row) => row && row.item_key)
    .map((row) => ({
      itemKey: String(row.item_key),
      lastScore: Math.max(0, Math.min(100, Number(row.last_score ?? row.best_score) || 0)),
      bestScore: Math.max(0, Math.min(100, Number(row.best_score) || 0)),
      attempts: Math.max(0, Number(row.attempts) || 0),
      updatedAt: row.updated_at || null,
    }))
    .filter((row) => row.attempts > 0);
  const speakingAverage = validSpeakingRows.length
    ? round(validSpeakingRows.reduce((sum, row) => sum + row.lastScore, 0) / validSpeakingRows.length)
    : null;
  const speakingBestAverage = validSpeakingRows.length
    ? round(validSpeakingRows.reduce((sum, row) => sum + row.bestScore, 0) / validSpeakingRows.length)
    : null;
  const speakingAttempts = validSpeakingRows.reduce((sum, row) => sum + row.attempts, 0);
  const speakingEnoughData = validSpeakingRows.length >= 3;
  const speakingStatus = !speakingEnoughData ? (speakingAverage !== null && speakingAverage < 80 ? "watch" : "insufficient_data")
    : speakingAverage < 75 ? "needs_review" : speakingAverage < 85 ? "watch" : "on_track";
  const speaking = {
    sampleItems: validSpeakingRows.length,
    attempts: speakingAttempts,
    averageRecent: speakingAverage,
    averageBest: speakingBestAverage,
    enoughData: speakingEnoughData,
    status: speakingStatus,
    confidence: validSpeakingRows.length >= 8 ? "high" : validSpeakingRows.length >= 3 ? "medium" : "low",
    evidence: { sampleItems: validSpeakingRows.length, attempts: speakingAttempts, averageRecent: speakingAverage },
    note: "Điểm phản ánh độ khớp câu/từ được hệ thống chấm trong lượt luyện nói; không phải phân tích âm vị hoặc chẩn đoán phát âm chuyên sâu.",
  };

  const validPronunciationRows = (Array.isArray(pronunciationRows) ? pronunciationRows : [])
    .filter((row) => row && row.accuracy !== null && row.accuracy !== undefined && Number.isFinite(Number(row.accuracy)))
    .map((row) => ({
      accuracy: Math.max(0, Math.min(100, Number(row.accuracy))),
      fluency: row.fluency == null ? null : Math.max(0, Math.min(100, Number(row.fluency))),
      completeness: row.completeness == null ? null : Math.max(0, Math.min(100, Number(row.completeness))),
      createdAt: row.createdAt || null,
      wordFeedback: (() => { try { return Array.isArray(row.wordFeedback) ? row.wordFeedback : JSON.parse(row.wordFeedback || "[]"); } catch { return []; } })(),
    }));
  const pronunciationWordMap = new Map();
  for (const row of validPronunciationRows) {
    for (const feedback of row.wordFeedback) {
      const word = String(feedback.word || feedback.w || "").trim().slice(0, 60);
      const score = Number(feedback.score ?? feedback.s);
      if (!word || !Number.isFinite(score)) continue;
      const item = pronunciationWordMap.get(word) || { word, total: 0, count: 0, tip: "" };
      item.total += Math.max(0, Math.min(100, score));
      item.count++;
      if (!item.tip && feedback.tip) item.tip = String(feedback.tip).slice(0, 160);
      pronunciationWordMap.set(word, item);
    }
  }
  const pronunciationWordIssues = [...pronunciationWordMap.values()]
    .filter((item) => item.count >= 2)
    .map((item) => ({ word: item.word, averageScore: round(item.total / item.count), sampleCount: item.count, tip: item.tip }))
    .filter((item) => item.averageScore < 80)
    .sort((a, b) => a.averageScore - b.averageScore || b.sampleCount - a.sampleCount)
    .slice(0, 5);
  const pronunciation = {
    sampleCount: validPronunciationRows.length,
    averageAccuracy: validPronunciationRows.length ? round(validPronunciationRows.reduce((sum, row) => sum + row.accuracy, 0) / validPronunciationRows.length) : null,
    averageFluency: validPronunciationRows.filter((row) => row.fluency !== null).length
      ? round(validPronunciationRows.reduce((sum, row) => sum + (row.fluency ?? 0), 0) / validPronunciationRows.filter((row) => row.fluency !== null).length) : null,
    enoughData: validPronunciationRows.length >= 3,
    status: validPronunciationRows.length < 3 ? "insufficient_data"
      : (validPronunciationRows.reduce((sum, row) => sum + row.accuracy, 0) / validPronunciationRows.length) < 75 ? "needs_review" : "on_track",
    wordIssues: pronunciationWordIssues,
    note: "Điểm là ước lượng từ mô hình phân tích bản ghi âm; không phải phép đo âm vị/chứng chỉ phát âm. Âm thanh không được lưu trong lịch sử này.",
  };

  const reviewEvents = (Array.isArray(vocabularyReviewEvents) ? vocabularyReviewEvents : []);
  const cutoff30 = Date.now() - 30 * 86400000;
  const recentReviews = reviewEvents.filter((event) => {
    const time = Date.parse(event.createdAt || "");
    return Number.isFinite(time) && time >= cutoff30;
  });
  const recentReviewCorrect = recentReviews.filter((event) => Number(event.correct) === 1 || event.correct === true).length;
  const mistakesByWord = new Map();
  for (const event of reviewEvents) {
    if (Number(event.correct) === 1 || event.correct === true) continue;
    const word = String(event.word || "");
    if (!word) continue;
    mistakesByWord.set(word, (mistakesByWord.get(word) || 0) + 1);
  }
  const repeatMistakes = [...mistakesByWord.entries()].filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]).slice(0, 8).map(([word, mistakes]) => ({ word, mistakes }));
  const validReviewDates = reviewEvents.map((event) => Date.parse(event.createdAt || "")).filter(Number.isFinite);
  const vocabularyMemory = {
    reviews30d: recentReviews.length,
    successRate30d: recentReviews.length ? round(recentReviewCorrect / recentReviews.length * 100) : null,
    uniqueWordsReviewed30d: new Set(recentReviews.map((event) => String(event.word || "")).filter(Boolean)).size,
    repeatMistakeWords: repeatMistakes,
    repeatMistakeCount: repeatMistakes.length,
    historyDays: validReviewDates.length ? Math.min(90, Math.max(1, Math.ceil((Date.now() - Math.min(...validReviewDates)) / 86400000))) : 0,
    note: "Tỷ lệ đúng là kết quả các lượt ôn đã ghi nhận; không khẳng định khả năng ghi nhớ ngoài các lần kiểm tra này.",
  };

  const grouped = new Map();
  for (const row of scoredRows) {
    const kind = String(row.exercise.kind || "other");
    // Exams are assessments, not a standalone skill area; avoid diagnosing them as a skill.
    if (["luyen-thi", "kiem-tra"].includes(kind)) continue;
    if (!grouped.has(kind)) grouped.set(kind, []);
    grouped.get(kind).push(row);
  }

  const skillStats = [...grouped.entries()].map(([kind, items]) => {
    const averageRecent = round(items.reduce((sum, row) => sum + row.lastScore, 0) / items.length);
    const averageBest = round(items.reduce((sum, row) => sum + row.bestScore, 0) / items.length);
    const attempts = items.reduce((sum, row) => sum + row.attempts, 0);
    const exerciseCount = items.length;
    const enoughData = exerciseCount >= 3;
    const needsReview = enoughData && averageRecent < passScore;
    const watch = !enoughData && averageRecent < passScore;
    const severity = !needsReview ? "none" : averageRecent < 60 ? "high" : averageRecent < 70 ? "medium" : "low";
    const weakest = [...items].sort((a, b) => a.lastScore - b.lastScore || String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))[0];
    return {
      kind,
      title: String(weakest?.exercise.kindTitle || weakest?.exercise.kind || kind),
      averageRecent,
      averageBest,
      exerciseCount,
      attempts,
      enoughData,
      status: needsReview ? "needs_review" : watch ? "watch" : "on_track",
      severity,
      evidence: {
        exerciseCount,
        attempts,
        passScore,
        averageRecent,
        averageBest,
      },
      suggestedExercise: weakest ? {
        id: String(weakest.exercise.id),
        title: String(weakest.exercise.title || "Bài luyện tập"),
        score: weakest.lastScore,
        href: `/app/ngoai-ngu/bai/${encodeURIComponent(String(weakest.exercise.id))}`,
      } : null,
    };
  }).sort((a, b) => a.averageRecent - b.averageRecent || b.exerciseCount - a.exerciseCount);

  const radarSource = {
    vocabulary: skillStats.filter((item) => item.kind === "nghia"),
    grammar: skillStats.filter((item) => item.kind === "ngu-phap"),
    listening: skillStats.filter((item) => item.kind === "nghe"),
    reading: skillStats.filter((item) => item.kind === "doc-hieu"),
    writing: skillStats.filter((item) => ["doc", "ghep-cau"].includes(item.kind)),
  };
  const radarLabels = [
    ["vocabulary", "Từ vựng"], ["grammar", "Ngữ pháp"], ["listening", "Nghe"],
    ["reading", "Đọc hiểu"], ["writing", "Viết / chính tả"], ["speaking", "Luyện nói"],
    ["pronunciation", "Phát âm"],
  ];
  const skillRadar = radarLabels.map(([key, label]) => {
    if (key === "speaking") return { key, label, score: speakingEnoughData ? speakingAverage : null, sampleCount: speaking.sampleItems, enoughData: speakingEnoughData, source: "speech_match" };
    if (key === "pronunciation") return { key, label, score: pronunciation.enoughData ? pronunciation.averageAccuracy : null, sampleCount: pronunciation.sampleCount, enoughData: pronunciation.enoughData, source: "audio_model_estimate" };
    const matches = radarSource[key] || [];
    const count = matches.reduce((sum, item) => sum + item.exerciseCount, 0);
    const score = count >= 3 && matches.length ? round(matches.reduce((sum, item) => sum + item.averageRecent * item.exerciseCount, 0) / count) : null;
    return { key, label, score, sampleCount: count, enoughData: count >= 3, source: "exercise_results" };
  });

  const weaknesses = skillStats.filter((item) => item.status === "needs_review").slice(0, 3);
  const watchSkills = skillStats.filter((item) => item.status === "watch").slice(0, 3);
  const hasSkillEvidence = skillStats.some((item) => item.enoughData);

  const recommendations = [];
  if (Number(dueVocabulary) > 0) {
    recommendations.push({
      type: "vocabulary_review",
      title: `Ôn ${Number(dueVocabulary)} từ vựng đến hạn`,
      description: "Ôn lại các từ đã đến lịch lặp lại ngắt quãng.",
      estimatedMinutes: Math.max(3, Math.min(15, Math.ceil(Number(dueVocabulary) * 0.4))),
      href: `/app/ngoai-ngu/on-tap/${encodeURIComponent(String(langId))}`,
      priority: 100,
    });
  }
  for (const skill of weaknesses) {
    if (!skill.suggestedExercise) continue;
    recommendations.push({
      type: "skill_practice",
      title: `Luyện thêm: ${skill.title}`,
      description: `Điểm gần đây trung bình ${skill.averageRecent}% qua ${skill.exerciseCount} bài. Hãy luyện lại bài có kết quả thấp nhất.`,
      estimatedMinutes: 10,
      href: skill.suggestedExercise.href,
      priority: 90 - skill.averageRecent,
    });
  }
  if (speaking.sampleItems > 0 && speaking.status === "needs_review") {
    recommendations.push({
      type: "speaking_practice",
      title: "Củng cố kỹ năng luyện nói",
      description: `Điểm luyện nói gần đây trung bình ${speaking.averageRecent}% qua ${speaking.sampleItems} mục. Hãy luyện lại câu ngắn và nghe mẫu trước khi đọc.`,
      estimatedMinutes: 10,
      href: `/app/ngoai-ngu/luyen-noi/${encodeURIComponent(String(langId))}`,
      priority: speaking.enoughData ? 86 : 68,
    });
  }

  if (pronunciation.enoughData && pronunciation.status === "needs_review") {
    recommendations.push({
      type: "pronunciation_coach",
      title: "Luyện phát âm có phân tích âm thanh",
      description: `Điểm ước lượng trung bình ${pronunciation.averageAccuracy}% qua ${pronunciation.sampleCount} lượt chấm. Hãy luyện câu ngắn và xem góp ý theo từ.`,
      estimatedMinutes: 8,
      href: `/app/ngoai-ngu/luyen-noi/${encodeURIComponent(String(langId))}?muc=phat-am`,
      priority: 88,
    });
  }
  if (repeatMistakes.length > 0 && Number(dueVocabulary) === 0) {
    recommendations.push({
      type: "vocabulary_reinforcement",
      title: `Củng cố ${repeatMistakes.length} từ thường trả lời sai`,
      description: "Các từ này đã có ít nhất hai lượt ôn sai trong lịch sử gần đây.",
      estimatedMinutes: Math.min(10, repeatMistakes.length * 2),
      href: `/app/ngoai-ngu/on-tap/${encodeURIComponent(String(langId))}`,
      priority: 82,
    });
  }

  const nextExercise = (Array.isArray(exercises) ? exercises : []).find((exercise) => {
    if (exercise.kind === "luyen-thi") return false;
    const row = scoredRows.find((item) => String(item.exercise.id) === String(exercise.id));
    return !row || row.bestScore < passScore;
  });
  if (nextExercise && !recommendations.some((item) => item.href.endsWith(encodeURIComponent(String(nextExercise.id))))) {
    recommendations.push({
      type: "continue_learning",
      title: `Tiếp tục: ${String(nextExercise.title || "bài học tiếp theo")}`,
      description: "Hoàn thành bài tiếp theo trong lộ trình hiện tại.",
      estimatedMinutes: 10,
      href: `/app/ngoai-ngu/bai/${encodeURIComponent(String(nextExercise.id))}`,
      priority: 60,
    });
  }

  const activityByDate = new Map((Array.isArray(weeklyActivity) ? weeklyActivity : []).map((item) => [String(item.d), Math.max(0, Number(item.n) || 0)]));
  const activity = [...activityByDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));
  const previousActiveDays = (Array.isArray(previousWeeklyActivity) ? previousWeeklyActivity : []).filter((item) => Number(item.n) > 0).length;
  const currentActiveDays = activity.filter((item) => item.count > 0).length;
  const previousActivityCount = (Array.isArray(previousWeeklyActivity) ? previousWeeklyActivity : []).reduce((sum, item) => sum + Math.max(0, Number(item.n) || 0), 0);
  const currentActivityCount = activity.reduce((sum, item) => sum + item.count, 0);

  // Transparent internal learning score. Only include dimensions with enough real evidence;
  // this is not a CEFR grade, proficiency certificate, or an ML prediction.
  const srsRows = (Array.isArray(vocabularyRows) ? vocabularyRows : []).slice(0, 5000);
  const learningComponents = [];
  if (scoredRows.length >= 3 && recentAverage !== null) {
    learningComponents.push({ key: "accuracy", score: recentAverage, weight: 25, evidenceCount: scoredRows.length });
  }
  if (srsRows.length >= 3) {
    const srsScores = srsRows.map((item) => {
      const boxScore = Math.max(0, Math.min(6, Number(item.box) || 0)) / 6 * 100;
      const errorPenalty = Math.min(25, Math.max(0, Number(item.wrong_count) || 0) * 5);
      return Math.max(0, boxScore - errorPenalty);
    });
    const reviewProgress = round(srsScores.reduce((sum, value) => sum + value, 0) / srsScores.length);
    learningComponents.push({ key: "review_progress", score: reviewProgress, weight: 20, evidenceCount: srsRows.length });
  }
  if (speakingEnoughData && speakingAverage !== null) {
    learningComponents.push({ key: "speaking_practice", score: speakingAverage, weight: 15, evidenceCount: validSpeakingRows.length });
  }
  if (pronunciation.enoughData && pronunciation.averageAccuracy !== null) {
    learningComponents.push({ key: "pronunciation", score: pronunciation.averageAccuracy, weight: 15, evidenceCount: pronunciation.sampleCount });
  }
  if (currentActiveDays >= 2) {
    learningComponents.push({ key: "consistency", score: round(currentActiveDays / 7 * 100), weight: 15, evidenceCount: currentActivityCount });
  }
  const completedForScore = Math.max(0, Number(courseProgress?.completed) || 0);
  const totalForScore = Math.max(0, Number(courseProgress?.total) || 0);
  if (totalForScore > 0 && completedForScore > 0) {
    const courseScore = Math.max(0, Math.min(100, Number(courseProgress?.percent) || 0));
    learningComponents.push({ key: "course_progress", score: courseScore, weight: 10, evidenceCount: completedForScore });
  }
  const totalWeight = learningComponents.reduce((sum, item) => sum + item.weight, 0);
  const learningEvidence = learningComponents.reduce((sum, item) => sum + item.evidenceCount, 0);
  const hasReliableSingleDimension = learningComponents.length === 1
    && ((learningComponents[0].key === "accuracy" && scoredRows.length >= 5)
      || (learningComponents[0].key === "review_progress" && srsRows.length >= 10)
      || (learningComponents[0].key === "speaking_practice" && validSpeakingRows.length >= 8)
      || (learningComponents[0].key === "pronunciation" && pronunciation.sampleCount >= 8));
  const canCalculateLearningScore = learningComponents.length >= 2 || hasReliableSingleDimension;
  const learningScoreValue = canCalculateLearningScore && totalWeight > 0
    ? round(learningComponents.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight)
    : null;
  const learningScore = {
    score: learningScoreValue,
    status: learningScoreValue === null ? "insufficient_data"
      : learningScoreValue < 50 ? "focus_needed"
        : learningScoreValue < 70 ? "building" : learningScoreValue < 85 ? "steady_progress" : "strong_progress",
    confidence: learningScoreValue === null ? "insufficient" : learningComponents.length >= 3 && learningEvidence >= 12 ? "high" : "medium",
    components: learningComponents,
    evidenceCount: learningEvidence,
    formulaVersion: "1.2",
    note: "Công thức 1.2: kết quả bài tập 25%, tiến độ SRS 20%, luyện nói khớp câu/từ 15%, điểm phát âm ước lượng 15%, độ đều đặn 15%, hoàn thành khóa 10%. Chỉ thành phần đủ bằng chứng mới được tính và trọng số được chuẩn hóa lại. Đây là chỉ số nội bộ, không phải điểm CEFR; điểm phát âm là ước lượng mô hình, không phải phép đo âm vị chuẩn hóa.",
  };
  const inactiveDays = daysSinceLastActivity === null || daysSinceLastActivity === undefined || !Number.isFinite(Number(daysSinceLastActivity)) ? null : Math.max(0, Number(daysSinceLastActivity));
  let rhythmScore = 0;
  const rhythmReasons = [];
  if (inactiveDays !== null) {
    if (inactiveDays >= 7) { rhythmScore += 60; rhythmReasons.push("Chưa ghi nhận hoạt động học ngoại ngữ trong ít nhất 7 ngày."); }
    else if (inactiveDays >= 4) { rhythmScore += 35; rhythmReasons.push("Đã vài ngày chưa có hoạt động học ngoại ngữ."); }
    else if (inactiveDays >= 2) { rhythmScore += 15; rhythmReasons.push("Nhịp học đang có khoảng nghỉ."); }
  }
  if (previousActiveDays >= 3 && currentActiveDays <= 1) {
    rhythmScore += 25;
    rhythmReasons.push("Số ngày có học trong tuần này giảm so với tuần trước.");
  }
  if (previousActivityCount >= 5 && currentActivityCount * 2 <= previousActivityCount) {
    rhythmScore += 15;
    if (!rhythmReasons.includes("Lượt hoạt động học tập tuần này giảm đáng kể.")) rhythmReasons.push("Lượt hoạt động học tập tuần này giảm đáng kể.");
  }
  rhythmScore = Math.min(100, rhythmScore);
  const rhythmInsufficient = inactiveDays === null && previousActivityCount === 0 && currentActivityCount === 0;
  const learningRhythm = rhythmInsufficient
    ? { status: "insufficient_data", score: null, daysSinceLastActivity: null, currentActiveDays, previousActiveDays, reasons: [], message: "Chưa có đủ lịch sử hoạt động ngoại ngữ để đánh giá nhịp học." }
    : {
      status: rhythmScore >= 60 ? "needs_attention" : rhythmScore >= 25 ? "slowing_down" : "steady",
      score: rhythmScore,
      daysSinceLastActivity: inactiveDays,
      currentActiveDays,
      previousActiveDays,
      reasons: rhythmReasons,
      message: rhythmScore >= 60 ? "Nhịp học ngoại ngữ đang gián đoạn. Hãy bắt đầu lại bằng một hoạt động ngắn." : rhythmScore >= 25 ? "Nhịp học có dấu hiệu chậm lại. Một mục tiêu nhỏ hôm nay có thể giúp bạn duy trì thói quen." : "Nhịp học ngoại ngữ hiện tương đối ổn định.",
    };
  // Transparent rule-based interruption risk, not a trained ML probability.
  // All inputs come from the selected user + selected foreign-language course only.
  const dropOffRisk = {
    score: rhythmInsufficient ? null : rhythmScore,
    level: rhythmInsufficient ? "insufficient_data" : rhythmScore >= 60 ? "high" : rhythmScore >= 25 ? "elevated" : "low",
    confidence: rhythmInsufficient ? "insufficient" : (inactiveDays !== null && (currentActivityCount + previousActivityCount) >= 3 ? "medium" : "low"),
    method: "language_activity_rules_v1",
    reasons: rhythmReasons,
    daysSinceLastActivity: inactiveDays,
    note: "Chỉ báo dựa trên quy tắc hoạt động, không phải xác suất từ mô hình Machine Learning và không đánh giá động lực/tâm lý người học.",
  };

  return {
    lang: String(langId || ""),
    generatedAt: new Date().toISOString(),
    dataSufficiency: {
      sampleExercises: scoredRows.length,
      enoughForSkillAnalysis: hasSkillEvidence,
      minimumExercisesPerSkill: 3,
      speakingSampleItems: speaking.sampleItems,
      minimumSpeakingItems: 3,
      message: hasSkillEvidence
        ? "Phân tích từng nhóm dựa trên kết quả các bài đã nộp."
        : "Chưa đủ dữ liệu theo từng nhóm kỹ năng. Cần tối thiểu 3 bài đã chấm trong cùng một nhóm.",
    },
    learningScore,
    performance: {
      recentAverage,
      bestAverage,
      sampleExercises: scoredRows.length,
      totalAttempts: scoredRows.reduce((sum, row) => sum + row.attempts, 0),
      passScore: Number(passScore),
    },
    courseProgress: {
      total: Math.max(0, Number(courseProgress.total) || 0),
      completed: Math.max(0, Number(courseProgress.completed) || 0),
      percent: Math.max(0, Math.min(100, Number(courseProgress.percent) || 0)),
    },
    skills: skillStats,
    skillRadar,
    speaking,
    pronunciation,
    weaknesses,
    watchSkills,
    vocabulary: {
      due: Math.max(0, Number(dueVocabulary) || 0),
      tracked: Math.max(0, Number(totalVocabulary) || 0),
      memory: vocabularyMemory,
    },
    activity,
    learningRhythm,
    dropOffRisk,
    streak: {
      current: Math.max(0, Number(streak?.current) || 0),
      longest: Math.max(0, Number(streak?.longest) || 0),
      lastActivityDate: streak?.lastActivityDate || null,
    },
    recommendations: recommendations.sort((a, b) => b.priority - a.priority).slice(0, 3),
  };
}


/**
 * Build a practical, deterministic 7-day plan for a single foreign-language course.
 * Every task links to a real language route; no programming-course data is accepted.
 */
export function buildLanguageStudyPlan({
  langId,
  courseName = "ngoại ngữ",
  exercises = [],
  progressRows = [],
  insights = {},
  speaking = insights?.speaking || {},
  dueVocabulary = 0,
  totalVocabulary = 0,
  dailyGoalMinutes = 25,
  startDate = new Date().toISOString().slice(0, 10),
} = {}) {
  const lang = String(langId || "").toLowerCase();
  if (!/^(en|zh|ja|ko|fr|es)$/.test(lang)) throw new Error("Ngôn ngữ không được hỗ trợ.");
  const goal = Math.max(15, Math.min(90, Math.round(Number(dailyGoalMinutes) || 25)));
  const progress = new Map((Array.isArray(progressRows) ? progressRows : []).map((row) => [String(row.item_id), row]));
  const byId = new Map((Array.isArray(exercises) ? exercises : []).map((item) => [String(item.id), item]));
  const weakIds = (Array.isArray(insights.weaknesses) ? insights.weaknesses : [])
    .map((item) => item.suggestedExercise?.id).filter((id) => id && byId.has(String(id)));
  const weakExercises = weakIds.map((id) => byId.get(String(id)));
  const unfinished = (Array.isArray(exercises) ? exercises : [])
    .filter((exercise) => exercise.kind !== "luyen-thi")
    .filter((exercise) => Number(progress.get(String(exercise.id))?.best_score || 0) < 80);
  const seen = new Set();
  const primaryPool = [...weakExercises, ...unfinished].filter((exercise) => {
    const id = String(exercise.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  const repeatedVocabularyWords = Array.isArray(insights?.vocabulary?.memory?.repeatMistakeWords)
    ? insights.vocabulary.memory.repeatMistakeWords : [];
  const hasVocab = Number(dueVocabulary) > 0 || repeatedVocabularyWords.length > 0;
  const pronunciationNeedsFocus = insights?.pronunciation?.status === "needs_review";
  const days = [];
  for (let index = 0; index < 7; index++) {
    const date = new Date(`${startDate}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + index);
    const scheduledDate = date.toISOString().slice(0, 10);
    const tasks = [];
    const hasVocabularyTask = hasVocab && index % 2 === 0;
    const speakingNeedsFocus = speaking?.status === "needs_review";
    const hasPronunciationTask = !hasVocabularyTask && pronunciationNeedsFocus && [1, 4].includes(index);
    const hasSpeakingTask = !hasVocabularyTask && !hasPronunciationTask && (speakingNeedsFocus ? [1, 3, 5].includes(index) : [2, 5].includes(index));
    const hasWeeklyReviewTask = !hasVocabularyTask && !hasPronunciationTask && index === 6;
    const secondaryMinutes = hasVocabularyTask || hasWeeklyReviewTask ? 5 : hasPronunciationTask || hasSpeakingTask ? 10 : 0;
    const primary = primaryPool[index] || null;
    if (primary) {
      const score = Number(progress.get(String(primary.id))?.last_score);
      const isWeak = weakIds.includes(String(primary.id));
      tasks.push({
        type: isWeak ? "skill_practice" : "continue_learning",
        title: isWeak ? `Củng cố: ${String(primary.title || primary.kindTitle || "kỹ năng")}` : `Học tiếp: ${String(primary.title || "bài học tiếp theo")}`,
        description: isWeak
          ? `Ôn lại nội dung thuộc nhóm ${String(primary.kindTitle || primary.kind || "kỹ năng")}${Number.isFinite(score) ? `; kết quả gần nhất ${score}%.` : "."}`
          : `Hoàn thành bài luyện trong khóa ${courseName}.`,
        href: `/app/ngoai-ngu/bai/${encodeURIComponent(String(primary.id))}`,
        estimatedMinutes: Math.max(5, goal - secondaryMinutes),
      });
    } else {
      tasks.push({
        type: "speaking_practice",
        title: "Luyện giao tiếp",
        description: `Thực hành nói và phản xạ bằng ${courseName}.`,
        href: `/app/ngoai-ngu/luyen-noi/${lang}`,
        estimatedMinutes: Math.max(5, goal - secondaryMinutes),
      });
    }
    if (hasVocabularyTask) {
      tasks.push({
        type: "vocabulary_review",
        title: Number(dueVocabulary) > 0 ? `Ôn ${Number(dueVocabulary)} từ đến hạn` : `Củng cố ${repeatedVocabularyWords.length} từ hay sai`,
        description: Number(dueVocabulary) > 0 ? "Ôn theo lịch lặp lại ngắt quãng của khóa ngoại ngữ này." : "Ưu tiên các từ đã có ít nhất hai lượt ôn sai trong lịch sử.",
        href: `/app/ngoai-ngu/on-tap/${lang}`,
        estimatedMinutes: 5,
      });
    } else if (hasPronunciationTask) {
      tasks.push({
        type: "pronunciation_practice",
        title: "Luyện phát âm có góp ý theo từ",
        description: "Luyện câu ngắn, nghe mẫu và xem kết quả phân tích âm thanh ước lượng.",
        href: `/app/ngoai-ngu/luyen-noi/${lang}?muc=phat-am`,
        estimatedMinutes: 10,
      });
    } else if (hasSpeakingTask) {
      tasks.push({
        type: "speaking_practice",
        title: speakingNeedsFocus ? "Củng cố kỹ năng luyện nói" : "Luyện phản xạ giao tiếp",
        description: speakingNeedsFocus ? `Điểm luyện nói gần đây ${speaking.averageRecent ?? "—"}%. Nghe mẫu, đọc lại câu ngắn và tự kiểm tra độ khớp.` : `Dành thời gian thực hành nói bằng ${courseName}.`,
        href: `/app/ngoai-ngu/luyen-noi/${lang}`,
        estimatedMinutes: 10,
      });
    } else if (hasWeeklyReviewTask) {
      tasks.push({
        type: "weekly_review",
        title: "Tổng kết tuần và ôn tập",
        description: "Xem lại kết quả, ôn các nội dung cần củng cố và chọn bài tiếp theo.",
        href: `/app/ngoai-ngu/${lang}`,
        estimatedMinutes: 5,
      });
    }
    days.push({ dayNo: index + 1, date: scheduledDate, tasks: tasks.slice(0, 2) });
  }
  return {
    lang,
    title: `Kế hoạch 7 ngày · ${courseName}`,
    durationDays: 7,
    dailyGoalMinutes: goal,
    startDate,
    endDate: days[6].date,
    days,
    adaptation: {
      basedOn: [
        ...(Array.isArray(insights.weaknesses) && insights.weaknesses.length ? ["skill_weaknesses"] : []),
        ...(Number(dueVocabulary) > 0 ? ["vocabulary_due"] : []),
        ...(speaking?.status === "needs_review" ? ["speaking_practice"] : []),
        ...(pronunciationNeedsFocus ? ["pronunciation_practice"] : []),
        ...(repeatedVocabularyWords.length ? ["repeat_vocabulary_errors"] : []),
        ...(insights?.learningRhythm?.status === "slowing_down" || insights?.learningRhythm?.status === "needs_attention" ? ["learning_rhythm"] : []),
      ],
      rationale: [
        Array.isArray(insights.weaknesses) && insights.weaknesses.length ? "Ưu tiên các nhóm bài có kết quả dưới ngưỡng." : null,
        Number(dueVocabulary) > 0 ? "Xếp lịch ôn các từ đã đến hạn." : null,
        speaking?.status === "needs_review" ? "Tăng số buổi luyện nói vì điểm khớp câu/từ đang cần củng cố." : null,
        pronunciationNeedsFocus ? "Thêm buổi luyện phát âm vì điểm ước lượng từ các lượt chấm gần đây đang thấp." : null,
        repeatedVocabularyWords.length ? "Bổ sung ôn các từ đã có lỗi lặp lại trong lịch sử." : null,
        insights?.learningRhythm?.status === "slowing_down" || insights?.learningRhythm?.status === "needs_attention" ? "Chia mục tiêu thành phiên ngắn để hỗ trợ duy trì nhịp học." : null,
      ].filter(Boolean).join(" ") || "Cân bằng bài học mới và luyện tập dựa trên dữ liệu ngoại ngữ hiện có.",
    },
  };
}
