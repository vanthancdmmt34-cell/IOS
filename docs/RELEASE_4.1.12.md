# PythonLab 4.1.12 – Personal Learning Path and Competency Assessment

## New Features
- Added placement and end-of-week competency assessments using a question bank from the existing Python curriculum.
- Assessment payloads do not send correct answers to the browser; the server grades submissions and stores results.
- The end-of-week assessment reuses the same question set as the most recent placement assessment to measure progress.
- Persists the 7-day study plan, topic/exercise tasks, and daily completion status in SQLite.
- Regenerates the plan after completing a new assessment; previous plans are marked as `archived`.
- Added the `#/ke-hoach` page and the "Lộ trình cá nhân" (Personal Learning Path) navigation item.
- Teacher reports now include class-wide statistics on topics needing reinforcement, calculated strictly from students who have practice data.

## In-Exercise AI
- Inline feedback continues to return line-numbered annotations, capped at 8 notes.
- Line numbers are clamped to the actual code range.
- Inline results no longer create conversation threads in the AI chat history.
- The floating AI chat widget is hidden on exercise and assignment pages; only AI error analysis remains active inside exercises.

## Database
New migration: `2026_11_01_018_personal_learning_path`.
Creates the `learning_assessments`, `learning_plans`, and `learning_plan_days` tables along with related indexes.

## Configuration
- Inline AI continues to use the existing Gemini configuration in the admin panel / server environment variables.
- Without a valid `GEMINI_API_KEY`, assessments and learning paths remain fully functional; only AI code explanation is disabled.

## Assessment Notes
The placement assessment selects 44 questions, covering each of the 44 chapters that have multiple-choice questions. Topic-level signals serve as initial directional data and should not be treated as definitive mastery conclusions while each topic is represented by a single question in the assessment. The system combines this signal with practice history when generating study plans.


### Learning and Reporting Refinements

- The placement assessment consists of 44 questions, allocating one question per chapter across the 44-chapter curriculum; the end-of-week assessment uses the same question set for a consistent comparison baseline.
- When a practice submission does not pass, AI analyzes the automated grading results, passed test count, and program output, even when no runtime error occurs.
- Teacher reports add placement score, end-of-week score, and score delta; these columns are also included in the exported Excel report.

- Assessments auto-save selected answers to the server after each question, restore state upon return, and enforce a 45-minute timer with automatic submission when time expires.
