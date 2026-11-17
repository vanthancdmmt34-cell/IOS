# PythonLab 4.1.2 — Chapter-Based Competency Assessment

## Objective
Turn practice results into easy-to-understand learning signals while avoiding premature competency labels when students do not yet have enough data.

## Changes
- Dashboard API adds chapter-based `capability`, calculated from the best results of the student's own submissions.
- Returns the number of attempted exercises, passed exercises, total exercises, coverage, total attempts, and classification level.
- Levels include: learning (insufficient data), needs more practice, progressing, and solid.
- The student dashboard displays up to 5 chapters that have data.
- Includes an insufficient-data state when a student has not practiced yet.
- Does not create new tables or modify scores, XP, existing data, or the grading mechanism.
- Server version: 4.1.2.

## Assessment Rules
- An exercise is counted as passed when the best score is greater than 0, matching the current system convention.
- Mastery rate = passed exercises / total exercises in the chapter.
- Chapters with attempted exercises below the minimum threshold are labeled `learning` rather than being concluded as weak.
- Uses only data belonging to the currently logged-in account.

## Pre-Deployment Tests to Run
- `npm test` on Node.js >= 22.
- Log in with a new account: the dashboard displays the insufficient-data state.
- Account with existing results: attempted/passed counts match submission history.
- Account A cannot view Account B's data.
- Verify both desktop and mobile layouts.
