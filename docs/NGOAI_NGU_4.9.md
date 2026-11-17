# Foreign Languages — Admin & Operations Guide (4.9.x)

## Overview

| Language | Framework | Levels |
|---|---|---|
| English | CEFR | A1, A2, B1, B2, C1 |
| Chinese | HSK | HSK 1 → HSK 5 |
| Japanese | JLPT | N5 → N1 |
| Korean | TOPIK | TOPIK 1 → 5 |
| French | DELF/DALF | A1 → C1 |

Each lesson includes a **Theory** page and 6 server-graded exercise types: Vocabulary Meaning, Phonetics/Spelling, Grammar, Sentence Building, Listening Practice, and Speaking Practice. Each level has a **Level Test**. Passing requires 80 points or higher; the system saves the highest score.

## What Students See

- **Subject Selection**: The home page asks which subject to study; once selected, the home page, menu, progress bar, certificates, leaderboard, and badges all follow that subject. A **"Đổi môn"** (Switch subject) button is on the top bar. The active subject is saved per account.
- **Flashcard Review (SRS)**: Missed words are reviewed immediately; remembered words are spaced at intervals of 1, 3, 7, 14, 30, and 60 days.
- **AI Tutor**: AI button at the top right of foreign language pages. Before submission, the AI only gives hints; after submission, it explains the answers. Includes an **"Hỏi AI vì sao"** (Ask AI why) button on incorrect answers. Shares the plan's AI quota.
- **Speaking Practice** uses browser speech recognition (works best in Chrome/Edge, requires microphone permission). Without a microphone, students can type the sentence instead. Passed when similarity to the target sentence is at least 75%.
- **Certificates** for each level (print/save as PDF), top 10 **leaderboard** per subject, and **badges** per subject. Foreign language lessons count toward the daily learning streak.

## Administration (`#/quan-tri-ngoai-ngu`)

1. **Statistics & Visibility**: Student count, submissions, passed lessons, and average score; uncheck to hide a course or level.
2. **Pro Access Control**: Select `"Pro từ cấp …"` (Pro from level ...) for each language (defaults to the 3rd level onward) or `"Miễn phí toàn bộ"` (All free). The server enforces access restrictions, not just hiding elements in the UI.
3. **CSV Import**: Each line formatted as `word,phonetic,meaning` (English/French: `word,meaning`; accepts comma, tab, `;`, or `|`). Every 8 words form a new lesson at the end of the selected level, automatically generating vocabulary and listening exercises.
4. **Add Lessons via JSON**: Add grammar notes and sample sentences. Reuse a lesson ID to update a custom lesson; IDs colliding with built-in lessons are rejected.

Custom lessons are stored in the `site_settings` table (key `lang_config`), requiring no code changes.

## Account Roles

Registration always creates a **student** account. To promote to teacher: Admin -> Accounts -> Change Role. Purchasing a Teacher plan does not automatically change the role.

## Content in Source Code

- `content/lang/<lang>.js` and `<lang>-extra.js`: Built-in lessons. Only **append new lessons at the end**; do not change existing lesson IDs (scores are stored by lesson ID).
- `content/lang/basics.js`: Foundational rules for each language (displayed on the Theory page and sent to the AI).
- After making changes, run: `npm run verify:lang` (all sample solutions must score 100, and empty submissions must score 0).

## Data

Tables are created automatically on startup (both SQLite and PostgreSQL): `lang_progress` (score per lesson) and `lang_srs` (spaced repetition schedule). Existing data is never overwritten.

## Known Limitations

- Assigning foreign language homework: Class -> Assignments -> Create Assignment -> select `"Ngoại ngữ"` (Foreign Languages).
- English UI: The UI shell is translated, while lesson content (meanings, explanations) remains in Vietnamese.
- Content should be reviewed by native speakers or qualified teachers, especially at higher levels.
