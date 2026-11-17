# PythonLab 4.2.13 — Footer Link Group Alignment

## Changes
- The footer link group — "Bài học Python" (Python Lessons), "Bảng giá" (Pricing), "Điều khoản" (Terms), "Bảo mật" (Privacy), "Thanh toán" (Payment), "Hoàn tiền" (Refunds), and "Quy định thành viên" (Member Rules) — is no longer crowded into a small cluster in the center.
- Desktop layout uses an auto-balancing grid to distribute items evenly across the horizontal width.
- Tablet layout switches to 3 columns; mobile switches to 2 columns with the trailing odd item centered.
- Labels are centered within each cell with uniform spacing and touch targets; subtle hover effect respects `prefers-reduced-motion`.
- The Visits / Registered Users line and Version label retain the exact placement, typography, and order from 4.2.12.

## Testing
- `node --check server.js` and `node --check public/js/landing.js`.
- Focused footer tests verifying links, desktop grid, and tablet/mobile breakpoints.
- Verified ZIP integrity after packaging.
- Live browser visual testing was not run in this environment; verify on staging across desktop and mobile viewports.

## Deployment
- No database migration required. Keep `.env` and the `data/` directory intact, replace source files, and restart the application.
