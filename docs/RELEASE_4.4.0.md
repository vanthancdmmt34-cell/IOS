# Release 4.4.0

- Decoupled the Judge process from the Backend via internal token-authenticated HTTP.
- Preserved default backward compatibility when a remote judge is not configured.
- Added sample configurations, systemd service samples, and operations/security documentation.
- Backend version: 4.4.0.

Build environment testing: `node --check` passed for all modified files. Current full test suite: 180 tests, 138 passed, 39 failed, 3 skipped (does not yet pass the release gate; multiple failures pre-exist from the 4.3.0 baseline). Three Docker sandbox tests were skipped because the build environment lacks Docker and the runner image.
