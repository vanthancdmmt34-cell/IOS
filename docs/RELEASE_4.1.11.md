# PythonLab 4.1.11 – Direct Inline AI Feedback on Submissions

## Changes
- Clarified the AI action in the exercise workspace: AI analyzes code and attaches comments directly to lines that need attention.
- Removed conversational/chat flows from the AI action in the exercise workspace, keeping the experience focused on the code editor and line-by-line feedback.
- When a test run produces an error or a submission does not pass, the system triggers inline annotation analysis based on the current code and error output (if AI is enabled and configured).
- Annotation content is safely escaped before rendering.
- Updated server version to 4.1.11.

## Scope
This update refines the AI workflow within the exercise workspace and does not replace server-side API key/model configuration. AI operates only when the AI service is enabled and validly configured.
