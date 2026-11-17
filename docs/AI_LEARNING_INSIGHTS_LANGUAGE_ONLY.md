# LifeRivo AI Learning Insights — Language-only completion

**Version:** 1.3  
**Scope:** Foreign-language learning only. Supported language IDs: `en`, `zh`, `ja`, `ko`, `fr`, `es`.

## 1. Scope and isolation

This feature uses the existing foreign-language catalog and learner records. It does not consume programming-course progress, coding submissions, coding streaks, or programming learning plans.

For a course-specific dashboard, the server scopes records by the authenticated `user_id` and the selected `lang`:

- `lang_progress` rows whose exercise IDs belong to the selected language;
- `lang_srs` rows for the selected language (counted and read for the SRS progress proxy);
- `learning_activities` of types `lang_submission`, `lang_speak`, `lang_chat`, and `lang_review`, with the selected language prefix in `reference_id`.

The selected-language dashboard, badges and activity chart use that course's activity history. The general reminder triggered from the language area uses only the four language activity types across the six supported languages. It does not read the shared account-wide `user_streaks` value.

## 2. Delivered capabilities

### 2.1 Learning Insights

- Evidence-gated internal Learning Progress Index with visible component scores and formula version.
- Recent exercise average and best average.
- Passed lesson count and course progress.
- Vocabulary due for review and vocabulary tracked.
- Seven-day activity chart (counts of recorded learning actions, not study minutes).
- Per-skill analysis grouped by the existing language exercise type.
- Weakness classification only after at least three scored exercises exist in the same skill group.
- A low-data `watch` state rather than a definitive weakness diagnosis when the sample is insufficient.
- Up to three evidence-based recommendations linked to existing LifeRivo language routes.

### 2.2 Learning Progress Index

The internal 0–100 index uses only dimensions with enough recorded evidence. The default weights are:

- Exercise accuracy: 35% (at least 3 scored exercises).
- Spaced-repetition progress proxy: 25% (at least 3 SRS vocabulary records).
- Weekly consistency: 20% (at least 2 active days in the selected language during the last 7 days).
- Course completion: 20% (at least 1 passed lesson in the selected language).

Weights are renormalized over available dimensions. The index is withheld unless at least two dimensions are available, except a single accuracy dimension with at least 5 scored exercises or a single SRS dimension with at least 10 vocabulary records. Confidence is `high` only when at least 3 dimensions and 12 evidence records are present; otherwise it is `medium`.

The SRS dimension is a cautious proxy based on the current review box and recorded wrong count; it is not a direct memory-retention test. The index is a LifeRivo product metric, not a CEFR score, proficiency assessment, or certificate. The component list and formula version are returned by the API so the UI can explain how it was calculated.

### 2.3 Learning rhythm signal

A deterministic, explainable signal uses course-specific days since last activity, active days this week versus last week, and weekly activity volume.

Status values:

- `insufficient_data`
- `steady`
- `slowing_down`
- `needs_attention`

This is a study-rhythm reminder, not a machine-learning prediction, psychological diagnosis, or guarantee that a learner will stop studying. The signal is shown only when supported by recorded activity.

### 2.4 Seven-day personalized plan

Plans are generated separately for each user and language. Tasks can link to:

- existing language exercises;
- the selected language's vocabulary review page;
- the selected language's speaking practice page;
- the selected language course overview.

Daily time target is clamped to 15–90 minutes. The generator keeps estimated task time within the selected target and never creates programming routes. A learner can mark a task complete or reopen it. Creating a replacement plan archives the previous active plan for that same user and language.

### 2.5 AI Coach for language errors

The existing AI Coach is reused rather than creating a second chat system. The language exercise page offers **Hỏi AI vì sao** after grading and passes the submitted answer and server-graded answer to the assistant. The backend resolves the language context from the exercise ID; it does not trust a language curriculum or answer key supplied by the browser. Before an exercise has been submitted, the server-side context instructs the AI not to reveal exact answers.

## 3. Database

`initLanguages(db)` creates these tables at startup:

- `lang_learning_plans`
- `lang_learning_plan_items`

They are separate from generic or programming study-plan tables. User and course scope is stored on both plan and item records. A partial unique index permits only one active plan per `(user_id, lang)` pair.

Existing language data tables are reused; no copy of learner progress is created.

## 4. API

All endpoints are under `/api/lang/insights` and require the authenticated session already enforced by the application router.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/lang/insights/:lang` | Course-specific insights |
| GET | `/api/lang/insights/:lang/plan` | Current active plan |
| POST | `/api/lang/insights/:lang/plan` | Generate and persist a new 7-day plan |
| PATCH | `/api/lang/insights/:lang/plan/items/:id` | Update one task status |

Write endpoints require CSRF validation. Plan-item updates are scoped to the authenticated user, selected language and active plan. Unsupported language IDs return not found. Plan generation has a per-user rate limit.

## 5. Verification

Focused tests are run with:

```bash
node --test tests/learning-insights.test.mjs tests/language-ai-api.test.mjs tests/learning-dashboard-refresh.test.mjs
node tools/verify-languages.mjs
```

The focused suite covers evidence thresholds, language-only activity, old inactivity history, plan persistence, ownership checks, accepted language IDs, daily time limits, AI Coach language context, and dashboard production assets.

## 6. Deployment

1. Back up the live source and database.
2. Deploy to a staging directory first.
3. Keep the existing server `.env`, database files, and secret keys; they are not part of this source package.
4. Install build dependencies and regenerate production assets:

   ```bash
   npm ci --include=dev
   npm run build
   ```

5. Run tests, check the selected language courses, test plan creation/completion with a non-production account, then deploy.
6. Keep the old release available for rollback.

The source workspace could not reach `registry.npmjs.org` (`EAI_AGAIN`), so `npm ci` and Terser minification could not be completed here. The production-loaded `lang.min.js` was synchronized from the source with its imports rewritten to the existing `.min.js` module paths and syntax-checked; it is functionally synchronized but not newly minified. The CSS bundles were regenerated successfully. On a network-enabled staging host, run the deployment build command above to perform the real Terser minification.

## 7. Files changed for this completion

- `modules/learning-insights.js` (including Learning Progress Index)
- `modules/languages.js` (language-scoped SRS evidence query)
- `public/js/lang.min.js` (production entry synchronized; not minified in this workspace)
- `public/js/lang.js`
- `public/js/lang.min.js` (production entry synchronized; run build on deployment for Terser minification)
- `public/css/home-learner.css`
- `public/css/bundle.min.css`
- `tests/learning-insights.test.mjs`
- `tests/language-ai-api.test.mjs`
- `tests/learning-dashboard-refresh.test.mjs`
