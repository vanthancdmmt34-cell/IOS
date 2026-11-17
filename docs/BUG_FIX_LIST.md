# BUG_FIX_LIST — 3.0.0

| # | Bug | File | Fix | Verification |
|---|---|---|---|---|
| 1 | Runner was not real Python: `class`, `try/except`, `import`, `tuple`, `set`, `lambda` threw errors | `runner/*` (new), `server.js` | Run Python 3.12 inside Docker; keep the JS interpreter as a fallback | `tests/runner.test.js`, e2e |
| 2 | 11 exercises expected `5` instead of `5.0` (c1e8, c2e4, c9e10, c10e4, c11e5, c11e7, c11e8, c11e9, c11e11, c11e12, c12e4) | `curriculum.js` | Updated expected outputs to match real Python; c1e8 prompt explains that `/` always returns a float | `tools/check-content-python.mjs` 522/522 |
| 3 | 4 exercises printed lists without quotes around string items (c33e4, c33e9, c33e10, c37e3) | `curriculum.js`, `interpreter.js` | Updated expected outputs; `pyStr` now uses `pyRepr` for list elements | Same as above + `tests/content.test.js` |
| 4 | Fallback JS interpreter did not distinguish `5` from `5.0` -> students were marked wrong when the server lacked Docker | `runner/index.js` | When running via the JS interpreter, accept simplified `5` for `5.0` (`relaxFloat`) | `tests/content.test.js` |
| 5 | Chapter 36 theory stated that the system did not support classes yet | `curriculum.js` | Updated the introductory text | Manual review |
| 6 | Network errors in student code were misclassified as file errors | `runner/py-errors.js` | Added network error matching rules before generic `OSError` rules | `tests/runner.test.js` |
| 7 | (Found during 3.0.0, fixed before release) Real Python returned output with a trailing `\n` and status `error` on timeout, differing from the legacy API | `runner/index.js` | Strip trailing `\n`; return status `timeout` on execution timeout | `tests/api.test.js` runs against both engines |
| 8 | (Found during 3.0.0) AI `"Gợi ý"` (Hint) button showed `"Hãy nhập câu hỏi"` (Please enter a question) on exercises with empty starter code | `modules/api.js` | Allow hint / similar exercise / next steps modes using exercise context alone | `tests/e2e/pro.e2e.mjs` |
| 9 | (Found during 3.0.0) Checkout modal displayed plan code `pro_1m` instead of the plan name | `modules/api.js` | Look up the plan name from the `plans` table | e2e |
| 10 | (Found during 3.0.0) Missing icon for the `"Bài học"` (Lessons) menu item | `public/js/core.js` | Added the `lesson` icon | Screenshot verification |
