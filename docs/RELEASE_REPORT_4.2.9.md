# PythonLab 4.2.9 — Footer Statistics Placement

## Changes
- Moved the community statistics block ("CỘNG ĐỒNG PYTHONLAB" (PYTHONLAB COMMUNITY), "Lượt truy cập" (Visits), "Đánh giá học viên" (Student Reviews)) from above the Contact section to **below Contact and above the footer containing the version line**.
- Preserved compact sizing, center alignment, live API metrics, count-up animation, and average-based star coloring.
- No changes to Facebook/Zalo/Threads links, APIs, admin settings, or database schema.

## Bottom-of-Page Display Order
1. Main homepage content.
2. Contact section (Facebook, Zalo, Threads).
3. Centered community statistics block.
4. Footer and version line.

## Testing
- DOM order test: confirmed `#lien-he` precedes `#lpStats`, and `#lpStats` precedes `footer.lp-foot`.
- Statistics test: confirmed visit/review count element IDs, data source API, empty-review state, and reduced-motion behavior remain intact.
- No database migration required.
