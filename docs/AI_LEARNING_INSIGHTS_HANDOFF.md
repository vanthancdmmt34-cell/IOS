# Handoff checklist — Language AI Insights

## Release contents
- Full LifeRivo source tree with language-only AI Insights changes.
- Existing programming modules are retained unchanged for compatibility with the existing app; no coding-course data is used by the new language insights, study plan, streak display, badge calculation, or language reminder.
- No `.env`, database file, `data/` directory, `secret.key`, private key or PEM file is included.

## Test result from this workspace
- 23/23 focused tests passed.
- 6 language courses / 2,792 exercises verified by `tools/verify-languages.mjs`.
- CSS bundles (`bundle.min.css`, `critical.min.css`, `landing.min.css`) were regenerated successfully and pass freshness checks.
- Changed JavaScript modules pass `node --check`.
- 29/29 focused tests pass, including the Learning Progress Index, SRS evidence, language isolation and plan ownership.
- SQLite integration tests cover plan creation, reading, task completion, user ownership and exclusion of Chinese/programming activity from English insights.

## Before production
- Install project dependencies on staging: `npm ci --include=dev`.
- Rebuild all production assets: `npm run build`.
- Run the focused tests listed in `AI_LEARNING_INSIGHTS_LANGUAGE_ONLY.md`.
- Test as a normal learner in each of the six language courses.
- Confirm the AI provider is configured before expecting the AI Coach to answer.
- Learning Progress Index is a transparent product metric, not CEFR. Its SRS component is a review-progress proxy, not a direct memory test.
- Learning Rhythm uses deterministic activity rules, not a trained ML dropout model.
- Promote only after staging verification; keep a rollback copy of the prior release and database.
