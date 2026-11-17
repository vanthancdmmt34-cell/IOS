# ENVIRONMENT_VARIABLES — LifeRivo

Thứ tự ưu tiên khi đọc cấu hình (`modules/sysconfig.js`):

**Giá trị nhập trong Quản trị > biến môi trường cùng tên > giá trị mặc định trong mã.**

## 1. Chỉ đặt bằng biến môi trường

Các biến này phải có trước khi server khởi động, hoặc không được phép sửa qua giao diện web.

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` | 8082 | Cổng HTTP. |
| `HOST` | 127.0.0.1 | Địa chỉ lắng nghe. Giữ loopback để nginx đứng trước. |
| `DATA_DIR` | `./data` | Thư mục chứa `app.db` và `secret.key`. |
| `GEMINI_BASE_URL` | API chính thức của Google | Chỉ dùng khi test với máy chủ giả. **Không đổi trên production**: đổi địa chỉ này sẽ gửi khóa AI tới máy chủ khác. |
| `ADMIN_USERNAME` | trống | Tài khoản được gán vai trò quản trị. Nếu trống, tài khoản đầu tiên được tạo sẽ là admin. |
| `TZ` | múi giờ của máy chủ | Đặt `Asia/Ho_Chi_Minh` để hạn mức AI theo ngày tính đúng giờ Việt Nam. |
| `METRICS_TOKEN` | trống | Bearer token để đọc `/internal/metrics`. |
| `NODE_ENV` | — | **Không đặt `development` trên production.** |
| `ALLOW_RESET_TOKEN_IN_RESPONSE` | trống | **Không đặt `1` trên production.** Khi bật, API đặt lại mật khẩu trả token ngay trong phản hồi thay vì chỉ gửi qua email. |

## 2. Đặt được trong Quản trị

Có thể nhập trong Quản trị. Nếu chưa nhập, server đọc biến môi trường cùng tên.

**Nhóm AI**

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `AI_PROVIDER` | `gemini` | `gemini` hoặc `disabled` (tắt hẳn kết nối AI). |
| `GEMINI_API_KEY` | trống | Khóa Google AI Studio. Lưu mã hóa, không bao giờ gửi về trình duyệt. |
| `AI_MODEL` | `gemini-3.1-flash-lite` | Model chính. |
| `AI_FALLBACK_MODEL` | trống | Model dự phòng khi model chính lỗi. |
| `AI_PRICE_INPUT_PER_M` | 0.25 | Đơn giá USD cho 1 triệu token đầu vào, dùng để tính chi phí. |
| `AI_PRICE_OUTPUT_PER_M` | 1.5 | Đơn giá USD cho 1 triệu token đầu ra. |
| `AI_MONTHLY_BUDGET_USD` | 10 | Trần chi phí AI toàn hệ thống mỗi tháng. Chạm trần thì AI tạm dừng tới đầu tháng sau. |
| `AI_TIMEOUT_MS` | 25000 | Thời gian chờ tối đa cho mỗi yêu cầu AI (3000–120000 ms). |
| `ASSEMBLYAI_API_KEY`, `ASSEMBLYAI_API_KEY_2` | trống | Khóa AssemblyAI cho giọng đọc mẫu tiếng Anh, Pháp, Tây Ban Nha. Khóa thứ hai dùng khi khóa chính lỗi. |

**Nhóm thanh toán**

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `SEPAY_WEBHOOK_SECRET` | trống | Khóa HMAC-SHA256 của webhook SePay (khuyến nghị). |
| `SEPAY_API_KEY` | trống | API key, dùng khi webhook SePay chọn kiểu xác thực API Key. |

Nếu cả hai đều trống, mọi webhook SePay bị từ chối.

**Website và email**

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PUBLIC_URL` | trống | Địa chỉ website, ví dụ `https://study.liferivo.com`, không có `/` ở cuối. Dùng cho liên kết chuẩn, sitemap và chia sẻ. |
| `SMTP_HOST` | trống | Máy chủ SMTP. Trống nghĩa là tắt gửi email (mã OTP quên mật khẩu). |
| `SMTP_PORT` | 465 | 465 = TLS ngay từ đầu; 587 = STARTTLS. |
| `SMTP_USER`, `SMTP_PASS` | trống | Tài khoản và mật khẩu SMTP. `SMTP_PASS` là secret. |
| `SMTP_FROM`, `SMTP_FROM_NAME` | = `SMTP_USER`, trống | Địa chỉ và tên hiển thị của người gửi. |

## 3. Biến tùy chọn khác

| Biến | Ý nghĩa |
|---|---|
| `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` | Dùng PostgreSQL thay cho SQLite (xem `db/pg.js`). |
| `NOTIFY_WEBHOOK_URL`, `NOTIFY_WEBHOOK_SECRET` | Gửi thông báo sự kiện qua webhook (`modules/notify.js`). |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Khóa Web Push để gửi nhắc học tới trình duyệt (`modules/reminders.js`). |
| `LANG_REMIND`, `LANG_REMIND_HOUR` | Cấu hình nhắc học ngoại ngữ (`modules/languages.js`). |
| `GOOGLE_SITE_VERIFICATION` | Mã xác minh Google Search Console, được chèn vào trang. |
| `BACKUP_DIR`, `BACKUP_RETENTION_DAYS`, `DB_PATH` | Dùng bởi công cụ bảo trì `tools/db-maintenance.js`. Số ngày giữ bản sao lưu nằm trong khoảng 1–365, mặc định 14. |

## 4. Bảo vệ khóa bí mật

Khóa nhập trong Quản trị được mã hóa AES-256-GCM trước khi lưu vào CSDL. Khóa giải mã nằm trong `DATA_DIR/secret.key` (quyền 600), không nằm trong CSDL, nên file sao lưu `app.db` không chứa khóa.

- Sao lưu `secret.key` cùng với `app.db`. Nếu mất file này, phải nhập lại mọi khóa.
- Không đưa token, mật khẩu hay khóa vào mã phía client, log hoặc Git.
