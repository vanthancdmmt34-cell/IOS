# PythonLab 4.1.4 — Login / Forgot Password UI Fixes

## Fixed
- Ensured elements with the `hidden` attribute remain hidden, preventing the forgot-password box from appearing unexpectedly due to CSS overrides.
- Redesigned the password reset request section: consistent input styling, clear labels, full-width button, and easy-to-read messages.
- Kept the forgot-password section collapsed by default; toggled open/closed via the "Quên mật khẩu?" (Forgot password?) button.
- Optimized the modal on small screens: internal scrolling within the modal without overflowing the viewport height.
- Adjusted server messages so they do not claim a reset link was sent when no delivery channel is configured.

## Verification
- `node --check public/js/landing.js`: passed.
- `node --check server.js`: passed.
- `npm test`: 102 passed, 38 failed, 3 skipped (failures pre-existed in the test suite and need to be addressed separately).
