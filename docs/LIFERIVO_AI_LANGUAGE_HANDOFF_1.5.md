# Handoff – LifeRivo AI Language Release 1.5

## Source bàn giao

- Archive: `liferivo_ai_language_release_1.5.tar.gz`
- Không chứa `node_modules`, `.env`, `data/`, database, `secret.key`, log hoặc user upload.
- Preview: desktop dashboard, mobile dashboard và admin AI cost.

## Cấu hình và triển khai

- Yêu cầu Node.js >= 22 theo `package.json`.
- Giữ nguyên cấu hình môi trường, database path/credentials, secret key, reverse proxy và dịch vụ process manager hiện hữu.
- Trên staging: `npm ci`, `npm run build`, `npm test`.
- Kiểm tra `npm run build` hoàn tất và không có lỗi xác minh ngôn ngữ.
- Chỉ thay source khi có backup và có phương án rollback.

## Những điểm cần nghiệm thu trên VPS

1. Đăng nhập với học viên Free và Pro.
2. Mở lần lượt `en`, `zh`, `ja`, `ko`, `fr`, `es`; xác nhận mỗi khóa dùng dữ liệu riêng.
3. Tạo/refresh AI weekly report và kiểm tra cache, quota, AI disabled, monthly budget.
4. Mở cửa sổ Print và lưu PDF.
5. Tạo kế hoạch 7 ngày, đổi trạng thái task và tạo kế hoạch thích ứng mới.
6. Kiểm tra lịch sử 30/90 ngày sau khi đã có ít nhất hai ngày snapshot đủ dữ liệu.
7. Kiểm tra tab Admin > Chi phí AI và export Excel.
8. Kiểm tra layout tại desktop 1440px, tablet 768px và mobile 375px.

## Giới hạn đã biết

- Drop-off score là rule-based activity signal, không phải ML model.
- Pronunciation scores are model-estimated, not standardized phoneme test results.
- Weekly report export is browser Print / Save as PDF, not server-generated PDF.
- Historical snapshots start after feature rollout and are not backfilled.
- The project-wide test suite and live staging verification remain pending because package installation could not complete in the editing environment.
- Build output is valid JavaScript, but Terser minification was not performed because Terser is unavailable.
