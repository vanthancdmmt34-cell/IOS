# PythonLab 4.2.4 Release Report

## Changes

- Added the "Kết nối với PythonLab" (Connect with PythonLab) section on the homepage, right below the bottom CTA.
- Added a "Liên hệ" (Contact) quick navigation link on the homepage menu bar.
- The three channels — Facebook, Zalo, and Threads — include brand icons, short descriptions, and safe new-tab links (`noopener noreferrer`).
- Administrators configure the URLs under "Quản trị → Cài đặt chung → Trang giới thiệu" (Admin -> General Settings -> Landing Page). URLs are validated for HTTPS and matching hostnames on both the server and client.
- Blank URLs display an unconfigured state rather than rendering placeholder links.
- Accepts Threads URLs on both `threads.com` (current) and `threads.net` (legacy).

## Key Files

- `settings.js` — added 3 public settings and URL validation.
- `public/js/admin.js` — rendered URL input fields in the admin settings page.
- `public/js/landing.js` — built the contact section and validated URLs prior to rendering.
- `public/css/app.css` — card styling, icons, and responsive layout rules.
- `server.js` — bumped version to `4.2.4`.

## Testing

- Unit tests covering default configuration, valid URLs, mismatched domains, and non-HTTPS URLs.
- JavaScript syntax verification.
- ZIP package inspection ensuring no `.env`, database files, API keys, or data directories are bundled.
- No database schema changes; no migration required.

## Post-Update Configuration

1. Back up `.env` and the `data/` directory.
2. Update the source code and restart the application.
3. Log in with an admin account -> "Cài đặt chung" (General Settings) -> "Trang giới thiệu" (Landing Page).
4. Enter the official Facebook, Zalo OA/personal, and Threads URLs, then save.
5. Open the homepage in an incognito window to verify all three links.

Because official account URLs were not provided in the request, this release provisions the admin configuration fields without hardcoding default social URLs.
