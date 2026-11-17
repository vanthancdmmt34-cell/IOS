# LifeRivo Language AI Insights — Release 1.3

## Scope

This release extends only the six foreign-language courses (`en`, `zh`, `ja`, `ko`, `fr`, `es`). It does not feed coding exercises, programming plans, programming streaks, or programming activity into the foreign-language insight calculations. Existing programming modules are retained as part of the application source for compatibility.

## New in 1.3

- Adds a transparent, evidence-gated Learning Progress Index to the language insights API and dashboard.
- Displays available component scores: exercise accuracy, spaced-repetition progress proxy, weekly language-study consistency, and passed-course progress.
- Weights are 35%, 25%, 20%, and 20%; weights are renormalized when some components lack sufficient evidence.
- Requires two available dimensions, except an accuracy-only score with at least five scored exercises or an SRS-only score with at least ten vocabulary records.
- Displays confidence and explicitly says the index is not a CEFR score or proficiency certificate.
- Reads SRS `box` and `wrong_count` only for the selected user's selected language. The SRS component is a proxy for progress through the review schedule, not a direct test of memory retention.
- Regenerates the CSS production bundles and synchronizes `public/js/lang.min.js` import paths to the production module files.

## Formula and evidence gates

| Component | Weight | Minimum evidence |
|---|---:|---|
| Exercise accuracy | 35% | 3 scored exercises |
| SRS review progress proxy | 25% | 3 vocabulary review records |
| Weekly consistency | 20% | 2 active days in the selected language over the last 7 days |
| Course completion | 20% | At least 1 passed lesson in the selected language |

Only available components contribute to the composite score. Their weights are normalized over the set of available components. Confidence is `high` when at least three components and twelve evidence records exist; otherwise a calculated score is `medium`. If the evidence gates are not met, the score is `null` with status `insufficient_data`.

## Verification completed in this workspace

- Focused foreign-language tests: **29/29 passed**.
- `node tools/verify-languages.mjs`: **6 courses / 2,792 exercises / no catalog errors**.
- `node tools/build-css.mjs --check`: passed.
- `node tools/build-critical-css.mjs --check`: passed.
- `node tools/build-landing-css.mjs --check`: passed.
- Syntax checks: changed backend and frontend modules passed.
- Focused SQLite API coverage confirms English score evidence does not include Chinese SRS rows and does not include programming events.

## Not verified / deployment prerequisites

- The full `npm test` suite could not complete because the workspace has no installed `pg` and `web-push` packages. `npm ci --include=dev` was attempted but the environment could not resolve `registry.npmjs.org` (`EAI_AGAIN`). Tests with database/server setup hooks were consequently cancelled. This is not a pass for the full test suite.
- Terser was unavailable, so the new `public/js/lang.min.js` was synchronized from `lang.js` with imports rewritten to `.min.js` paths and syntax-checked, but was not minified in this workspace.
- No VPS or staging credentials were provided; this release has not been deployed or browser-tested against the live server/database.
- The learning-rhythm signal remains deterministic and explainable. A trained ML dropout prediction model has deliberately not been claimed or fabricated; reliable training would require an appropriately consented, labeled history dataset and validation.

## Staging checklist

1. Back up the existing release, database, `.env`, and secret key.
2. Deploy this archive to a separate staging directory; do not overwrite production first.
3. Preserve the existing server `.env`, `data/`, database files and secret key; they are intentionally absent from this archive.
4. On a network-enabled host run `npm ci --include=dev`, then `npm run build` and `npm test`.
5. Verify login and course data for all six languages using non-production learner accounts.
6. Test Insights, SRS, recommendations, learning plan creation/completion, and AI Coach with the configured provider.
7. Promote only after tests pass; keep the prior release available for rollback.
