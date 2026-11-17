# LifeRivo AI Learning Insights – Release 1.4

## Scope
This release continues the foreign-language learning intelligence module only: English (en), Chinese (zh), Japanese (ja), Korean (ko), French (fr), and Spanish (es). Programming-course activity is not included in this module's scores, rhythm analysis, recommendations, reports, or plans.

## Changes in 1.4
- Added evidence-backed speaking-practice analysis from `lang_speak`, strictly scoped by `user_id` and `lang`. The stored score measures the system's sentence/word matching result; it is not phoneme-level acoustic analysis.
- Added speaking practice as a separately weighted Learning Progress Index component when at least three scored prompts exist.
- Published formula version 1.1 and its weight policy: exercise results 30%, SRS review proxy 20%, speaking practice 20%, consistency 15%, course completion 15%. Components without enough evidence are omitted and remaining weights are normalized. This is not a CEFR score.
- Added AI Learning Analyst reports based on language-scoped aggregate evidence. The report distinguishes 7-day activity from current course snapshots and tells the model not to claim trends without historical time series.
- Cached a report for 24 hours per user and language before quota/cost checks; forced regeneration remains rate-limited and subject to AI quota and monthly budget.
- Persisted plan adaptation reasons in `lang_learning_plans.adaptation_json`, with a backward-compatible migration for existing databases.
- Adapted weekly plans to the current weak-skill, vocabulary, speaking, and learning-rhythm signals; repeated lesson links are avoided when the exercise pool is small.
- Displayed adaptation rationale and formula explanation in the learning dashboard.
- Added an optional Terser fallback to the JS build tool. The updated `lang.min.js` is valid JavaScript with rewritten module imports, but was not minified in this environment because npm registry access was unavailable.

## AI Analyst API
- `GET /api/lang/insights/:lang/report` – latest report for the signed-in user and selected language.
- `POST /api/lang/insights/:lang/report` – generate a report; pass `{ "refresh": true }` to force a new report. A recent cached report is returned without consuming AI quota when refresh is not forced.

The report uses only aggregated server data for the authenticated user and one language. It does not send raw exercise answers or other-course data. The model is instructed not to infer phoneme pronunciation, memory ability, psychology, or CEFR level from activity metrics.

## Database migration
`initLanguages()` adds `adaptation_json` to an existing `lang_learning_plans` table when absent. Existing plan rows are preserved and receive the default `{}` value. No user progress, vocabulary, or speaking records are deleted.

## Validation
- 39 focused tests passed: language insights, language-scoped API, plans, dashboard rendering, report cache and access isolation, and legacy schema migration.
- `node tools/verify-languages.mjs`: 6 courses, 2,792 exercises, no catalog errors.
- CSS bundle checks passed for bundle, critical, and landing stylesheets.
- Updated `public/js/lang.min.js` passes `node --check` and `node tools/build-js.mjs --only=lang.js --check`.
- Full `npm test` was attempted: 58 tests passed, 1 test process failed to start, and 123 tests were cancelled as a consequence. The blockers are missing installed runtime packages (`pg` and `web-push`), not confirmed product-code failures; therefore the full suite is not considered passed.
- `npm ci --dry-run --ignore-scripts --no-audit --no-fund --offline` completed successfully against the updated lockfile. A real install and full suite still need to run on staging with package-registry access.
- Live staging/production verification was not performed in this environment.

## Deployment guidance
1. Back up the current source, database, `.env`, and `secret.key`.
2. Deploy to staging first; preserve the existing environment and data files.
3. Install locked runtime dependencies with `npm ci` on a machine with npm registry access.
4. Optional: `npm install --no-save terser` to enable minification in `tools/build-js.mjs`. Without Terser the tool still writes valid import-rewritten JavaScript, but output is not minified.
5. Run `npm run build` and `npm test` on staging.
6. Test all six languages with separate learner accounts, then promote to production only after verification.
