// Class assignment helpers — actual schema (kind/ref_id/custom_json) used by modules/classroom.js.
// Replaces the old draft design (teacher_id/exercise_id) that did not match migration 010.
//
// Batch 4 Postgres: studentAssignmentState / isAssignmentTarget / listClassAssignments
// became async; pure helpers (publicAssignment, assignmentExercise, finalScore)
// remain synchronous.

export function publicAssignment(a) {
  if (!a) return null;
  return {
    id: a.id,
    classId: a.class_id,
    kind: a.kind,
    refId: a.ref_id,
    title: a.title,
    maxScore: Number(a.max_score ?? 10),
    instructions: a.instructions,
    dueAt: a.due_at,
    allowResubmit: !!a.allow_resubmit,
    maxAttempts: a.max_attempts,
    targetAll: !!a.target_all,
    status: a.status,
    createdAt: a.created_at,
    langItem: (() => { try { return JSON.parse(a.custom_json || "{}").lang || null; } catch { return null; } })(), // bài ngoại ngữ
  };
}

/** Bài giao là bài tự luận do giáo viên soạn. */
export function assignmentExercise(a) {
  if (!a) return null;
  let c = {};
  try { c = JSON.parse(a.custom_json || "{}"); } catch {}
  return {
    id: "asg" + a.id,
    title: a.title,
    prompt: c.prompt || "",
    starter: c.starter || "",
    require: c.require || [],
    tests: (c.tests || []).map((t) => ({
      input: String(t.input || ""),
      expected: String(t.expected || ""),
      hidden: !!t.hidden,
    })),
    expectedOutput: c.expectedOutput || "",
  };
}

export function finalScore(subs) {
  if (!subs.length) return null;
  const g = subs.find((s) => s.manual_score != null);
  return g ? g.manual_score : Math.max(...subs.map((s) => s.auto_score));
}

export async function studentAssignmentState(db, a, userId) {
  const subs = await db.prepare(
    "SELECT * FROM assignment_submissions WHERE assignment_id = ? AND user_id = ? ORDER BY id DESC"
  ).all(a.id, userId);
  return {
    attempts: subs.length,
    passed: subs.some((s) => s.passed),
    score: finalScore(subs),
    feedback: (subs.find((s) => s.feedback) || {}).feedback || "",
    late: subs.some((s) => s.late && s.passed),
  };
}

export async function isAssignmentTarget(db, a, userId) {
  if (a.target_all) {
    return !!(await db.prepare(
      "SELECT 1 FROM class_members WHERE class_id = ? AND user_id = ? AND status = 'active'"
    ).get(a.class_id, userId));
  }
  return !!(
    (await db.prepare("SELECT 1 FROM assignment_targets WHERE assignment_id = ? AND user_id = ?").get(a.id, userId)) &&
    (await db.prepare("SELECT 1 FROM class_members WHERE class_id = ? AND user_id = ? AND status = 'active'").get(a.class_id, userId))
  );
}

export async function listClassAssignments(db, classId) {
  return db.prepare(
    "SELECT * FROM assignments WHERE class_id = ? AND status <> 'deleted' ORDER BY id DESC"
  ).all(classId);
}
