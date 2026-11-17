# LifeRivo – AI Learning Insights MVP

## Status

Implemented as a deterministic, evidence-based MVP for built-in language courses (`en`, `zh`, `ja`, `ko`, `fr`, `es`). This is not yet the full multi-subject AI coach described in the product roadmap.

## What is included

- Authenticated endpoint: `GET /api/lang/insights/:lang`.
- User-scoped reading of `lang_progress`, `lang_srs`, `learning_activities`, and `user_streaks`.
- Exclusion of hidden courses/levels and Pro-locked levels for users without Pro access.
- Deterministic averages for the last submitted score and best score.
- Skill grouping from available exercise kinds. Exam types (`kiem-tra`, `luyen-thi`) are not treated as standalone skills.
- A skill is marked `needs_review` only when at least 3 distinct exercises in that group have submitted scores and the mean latest score is below the existing pass score (80).
- Groups with fewer than 3 scored exercises can appear as `watch`, not as a confirmed weakness.
- Vocabulary due count based on the existing spaced-repetition table.
- Seven-day activity and current/longest streak summary.
- Up to three recommendations linking to existing review or exercise routes.
- A dashboard card in the focused language overview (`#/mon-hoc` / `#/ngoai-ngu/:lang`) and the language-scoped student overview (`#/:lang`).

## API response shape

`GET /api/lang/insights/en`

```json
{
  "insights": {
    "lang": "en",
    "generatedAt": "ISO timestamp",
    "dataSufficiency": {
      "sampleExercises": 0,
      "enoughForSkillAnalysis": false,
      "minimumExercisesPerSkill": 3,
      "message": "..."
    },
    "performance": {
      "recentAverage": null,
      "bestAverage": null,
      "sampleExercises": 0,
      "totalAttempts": 0,
      "passScore": 80
    },
    "courseProgress": { "total": 0, "completed": 0, "percent": 0 },
    "skills": [],
    "weaknesses": [],
    "watchSkills": [],
    "vocabulary": { "due": 0, "tracked": 0 },
    "activity": [],
    "streak": { "current": 0, "longest": 0, "lastActivityDate": null },
    "recommendations": []
  },
  "course": { "id": "en", "name": "English", "framework": "..." }
}
```

## Important limitations

- `lang_progress` stores per-exercise aggregate scores, not individual wrong answers. The MVP must not claim the learner repeatedly made a specific grammar error.
- The current language submission flow stores aggregate outcomes; pronunciation quality and detailed speaking fluency are not diagnosed by this module.
- Learning score weighting, learning-risk prediction, AI-generated explanations, AI chat, and generated 7-day plans are not implemented in this MVP.
- The average shown is the mean of each attempted exercise's latest saved score; it is not a standardized CEFR score.
- Recommendations use existing catalog exercise IDs and existing review routes only.

## Files changed

- `modules/learning-insights.js` – deterministic insight builder.
- `modules/languages.js` – authenticated API endpoint.
- `public/js/lang.js` – insights card in the focused course dashboard.
- `public/js/lang.min.js` – module consumed by the existing minified app entry; imports rewritten to the existing `.min.js` module names. It is valid JavaScript but was not minified because Terser is not installed in this workspace.
- `public/js/home.js` – card and API loading on the language-scoped student dashboard.
- `public/js/home.min.js` – module consumed by the existing minified app entry; imports rewritten to the existing `.min.js` module names. It is valid JavaScript but was not minified because Terser is not installed in this workspace.
- `public/css/home-learner.css` – dashboard styles.
- `public/css/bundle.min.css` – rebuilt CSS bundle.
- `tests/learning-insights.test.mjs` – unit tests.

## Verification performed

- `node --check modules/languages.js`
- `node --check modules/learning-insights.js`
- `node --check public/js/home.js`
- `node --check public/js/home.min.js`
- `node --test tests/learning-insights.test.mjs`
- `node tools/build-css.mjs`

The full application was not started against the supplied database, and the supplied database/secret files were not opened. Deploy to a staging copy first and verify with a test account.
