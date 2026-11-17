# LifeRivo – Learning Dashboard UI Refresh

## Scope

This refresh updates the existing selected-language overview (`#/mon-hoc` and language-focused routes). It does not replace the application shell, routing, course data model, access controls, lesson rendering, or the existing language-insights API.

## Interface changes

- Learning hero now shows the current framework/level, an overall course progress bar, passed/total exercises, and a clearer next-lesson action.
- The four progress cards have stronger hierarchy: current stage, passed exercises in the stage, mastered vocabulary, and learning streak.
- `AI Learning Insights` is redesigned as a distinct learning-support panel with evidence-based metrics, an internal Learning Progress Index, skill signals, a seven-day activity chart, and recommendation cards.
- The Learning Progress Index displays only available evidence dimensions; weighted scores are renormalized over the dimensions present. It is explicitly not a CEFR score.
- The activity chart uses `insight.activity` from the existing authenticated API. Bars show recorded learning actions/submissions, not inferred study time.
- Skill diagnoses remain evidence-gated by the existing engine. The view does not claim a grammar-specific error, pronunciation weakness, or CEFR score when the API does not provide that evidence.
- CEFR level cards show status and actual progress percentage using the existing course payload. The UI does not add unsupported levels.
- Quick practice cards are visually grouped with labels for exam prep, communication, AI practice, career practice, and vocabulary review. Existing destinations are preserved.
- Responsive rules are added for tablet and mobile widths while preserving the LifeRivo cream/pastel/black-outline visual identity.

## Files changed

- `public/js/lang.js` – refreshed overview markup and data-backed activity/insight rendering.
- `public/js/lang.min.js` – synchronized production-loaded module with relative imports rewritten to `.min.js` modules.
- `public/css/home-learner.css` – new overview, Insights, roadmap, and practice-card styles.
- `public/css/bundle.min.css` – rebuilt stylesheet bundle.
- `tests/learning-dashboard-refresh.test.mjs` – static regression checks for critical UI/data wiring.

## Data limitations kept explicit

- Learning activity is displayed as event/submission counts because the current system does not reliably measure total study duration.
- The Learning Insights engine remains deterministic and evidence-based. Weekly plan generation is a language-scoped feature in the current API; Learning Rhythm is a rule-based study activity signal, not an ML dropout prediction. AI explanations remain in the existing AI Coach flow.
- The learning score shown in early product mockups is not displayed because it has not been implemented and validated in the current backend.

## Build and verification

- CSS bundle: `node tools/build-css.mjs`.
- Language catalogue: `node tools/verify-languages.mjs`.
- Focused Insights tests: `node --test tests/learning-insights.test.mjs`.
- Dashboard static regression tests: `node --test tests/learning-dashboard-refresh.test.mjs`.
- Syntax smoke test: `node --test tests/smoke.test.mjs`.

The focused foreign-language test suite passes. The complete `npm test` suite requires installed runtime dependencies including `pg`, `web-push`, and Terser for the build. This workspace could not reach `registry.npmjs.org` (`EAI_AGAIN`), so dependency installation and a complete project-wide test/build could not be completed here.

## Deployment note

After unpacking the release into a staging copy, preserve the deployment's existing `.env`, data directory, and secret key; this source archive intentionally does not include them. Install the locked dependencies with `npm ci`, then run the normal project build (`npm run build`) so Terser can regenerate the minified JavaScript modules in that environment. Run the focused tests and verify the language overview with an authenticated test account before promoting the release to production.
