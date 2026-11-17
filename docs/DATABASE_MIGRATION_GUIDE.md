# DATABASE_MIGRATION_GUIDE — LifeRivo

## Cách hoạt động

- Migration khai báo trong `db/migrations.js`, chạy theo thứ tự trong mảng. Migration đã áp dụng được ghi vào bảng `schema_migrations`.
- Server tự chạy các migration còn thiếu khi khởi động.
- Khi có migration mới và CSDL đã có dữ liệu, server tự sao lưu trước bằng `VACUUM INTO` vào file `app.db.truoc-migrate-<thời-gian>` trong thư mục sao lưu.

## Công cụ

```bash
node tools/migrate.js up          # áp dụng các migration còn thiếu
node tools/migrate.js down <id>   # hoàn tác một migration (có thể mất dữ liệu của bảng/cột liên quan)
```

- Đặt `DATA_DIR=/đường/dẫn` để trỏ tới CSDL khác (ví dụ bản sao để thử).
- Bảo trì CSDL SQLite: `npm run db:check`, `npm run db:checkpoint`, `npm run db:backup` (`tools/db-maintenance.js`).

## Nâng cấp an toàn

```bash
pm2 stop hoc-ngoai-ngu
npm run db:backup                 # sao lưu thủ công trước khi thay mã
# giải nén bản mới, KHÔNG ghi đè data/ và ecosystem.config.cjs
npm install && npm run build
node tools/migrate.js up
pm2 start hoc-ngoai-ngu && pm2 logs hoc-ngoai-ngu --lines 30
```

Không hoàn tác (`down`) một migration sau khi đã có đơn hàng thật. Trước đó, hãy tải bản sao lưu từ tab Dữ liệu của Quản trị.

## Danh sách migration

| ID | Nội dung |
|---|---|
| `2026_10_30_001_commerce_ai_plans` | Gói, đăng ký, đơn hàng, thanh toán, hội thoại và hạn mức AI, nhật ký kiểm toán; cột email người dùng. |
| `2026_10_30_003_order_claimed` | Thời điểm học viên báo đã chuyển khoản (`orders.claimed_at`). |
| `2026_10_30_004_roles_lang` | Thêm `users.lang` (ngôn ngữ giao diện của người dùng). |
| `2026_10_30_005_entitlements` | Bảng quyền học `entitlements`: cá nhân, quản trị tặng, giấy phép, gia đình. |
| `2026_10_30_006_plans_v2` | Gói theo loại (`kind`), số chỗ (`seats`), gói chỉ báo giá (`quote_only`), tên tiếng Anh; bảng `plan_features`. |
| `2026_10_30_007_licenses` | Giấy phép giáo viên `licenses` và chỗ học viên `license_seats`. |
| `2026_10_30_008_family` | Gói gia đình: `family_groups`, `family_members`. |
| `2026_10_30_009_classrooms` | Lớp học: `classrooms`, `class_members`, `class_invites`. |
| `2026_10_30_010_assignments` | Bài giao: `assignments`, `assignment_targets`, `assignment_submissions`. |
| `2026_10_30_011_class_tests` | Bài kiểm tra lớp: `class_tests`, `class_test_questions`, `class_test_attempts`. |
| `2026_10_30_012_i18n` | Bảng `ui_translations`: chuỗi giao diện đã dịch. |
| `2026_10_30_013_payment_events` | Nhật ký mọi lần gọi webhook thanh toán. |
| `2026_10_30_014_teacher_students_logo` | `users.managed_by` (học viên do giáo viên tạo); bảng `brand_assets` (logo). |
| `2026_11_01_015_entitlements_schema_fix` | Thêm `entitlements.granted_by` và `entitlements.updated_at`. |
| `2026_11_01_016_notifications` | Bảng `notifications` (thông báo trong ứng dụng). |
| `2026_11_01_017_password_resets` | Bảng `password_resets` (đặt lại mật khẩu). |
| `2026_11_01_018_personal_learning_path` | Đánh giá năng lực và lộ trình học cá nhân: `learning_assessments`, `learning_plans`, `learning_plan_days`. |
| `2026_10_30_006_classes` | Tạo view tương thích `classes` trỏ tới `classrooms`. Không tạo bảng mới. |
| `2026_10_30_007_assignments` | Kiểm tra bảng `assignments` đã tồn tại (không thay đổi dữ liệu). |
| `2026_10_30_009_rubric` | Rubric chấm điểm theo tiêu chí: `assignment_rubrics`, `assignment_rubric_scores`; cột `assignments.max_score`. |
| `2026_11_15_050_drop_programming_columns` | Bỏ các cột liên kết cũ khỏi lộ trình học và hội thoại AI (`learning_plan_days`, `ai_conversations`). |
| `2026_11_16_060_ensure_activity_streak_tables` | Đảm bảo bảng `learning_activities` và `user_streaks` tồn tại. |
