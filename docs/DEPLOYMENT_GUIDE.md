# DEPLOYMENT_GUIDE — LifeRivo trên VPS (PM2 + nginx)

> Sao lưu trước mọi lần nâng cấp. Không xóa thư mục `data/`.

## 1. Yêu cầu

- Node.js 22 trở lên (theo `engines` trong `package.json`).
- nginx làm reverse proxy tới `127.0.0.1:8082` (mẫu: `nginx.conf.sample`).
- PM2, chạy **1 instance** (`instances: 1` trong `ecosystem.config.example.cjs`): giới hạn tốc độ lưu trong bộ nhớ nên cần một tiến trình duy nhất.
- Tùy chọn: PostgreSQL (đặt các biến `PG*`). Mặc định dùng SQLite tại `data/app.db`.

## 2. Cài đặt lần đầu

```bash
cd /duong/dan/hoc-ngoai-ngu
npm install
npm run build
cp ecosystem.config.example.cjs ecosystem.config.cjs
chmod 600 ecosystem.config.cjs
# mở ecosystem.config.cjs và điền PUBLIC_URL, TZ, các khóa cần thiết
pm2 start ecosystem.config.cjs
pm2 save
curl -s http://127.0.0.1:8082/api/health
```

- `npm run build` tạo bundle CSS/JS và kiểm tra nội dung ngôn ngữ (`verify-languages`).
- `ecosystem.config.cjs` chứa bí mật: không commit lên Git.
- Khóa AI, SePay và SMTP có thể nhập sau trong Quản trị, không bắt buộc đặt trong file PM2 (xem `ENVIRONMENT_VARIABLES.md`).

## 3. Nâng cấp

```bash
pm2 stop hoc-ngoai-ngu
npm run db:backup                # sao lưu CSDL trước khi thay mã
```

1. Giải nén bản mới vào thư mục ứng dụng. **Không ghi đè** `data/` và `ecosystem.config.cjs`.
2. Chạy `npm install` và `npm run build`.
3. Chạy `node tools/migrate.js up`. Server cũng tự migrate khi khởi động; nếu có migration mới, server tự sao lưu trước đó.
4. Khởi động lại và xem log:

```bash
pm2 start hoc-ngoai-ngu
pm2 logs hoc-ngoai-ngu --lines 30
```

Xem thêm `DATABASE_MIGRATION_GUIDE.md`.

## 4. nginx

Xem `nginx.conf.sample`. Đảm bảo nginx chuyển tiếp `X-Forwarded-Proto` và `X-Forwarded-For`. Server chỉ tin `X-Forwarded-For` khi kết nối đến từ loopback.

## 5. Sao lưu định kỳ

Mẫu service và timer systemd nằm trong `deploy/`:

- `deploy/liferivo-db-backup.service.example`
- `deploy/liferivo-db-backup.timer.example`

## 6. Cấu hình thanh toán và AI

Vào **Quản trị → Thanh toán, AI & Hệ thống**.

**Thanh toán** — chọn một trong hai cách xác nhận:

- *QR tài khoản cá nhân*: không cần cấu hình thêm trên máy chủ. Bạn đối chiếu tiền về bằng tay trong mục Doanh nghiệp.
- *Tự động qua SePay*: nhập `SEPAY_WEBHOOK_SECRET` hoặc `SEPAY_API_KEY`, rồi tạo webhook ở SePay trỏ tới `https://<tên-miền>/api/pay/sepay/webhook`.

**AI** — dán `GEMINI_API_KEY` (lấy ở Google AI Studio), chọn model, nhập đơn giá và trần chi phí tháng, sau đó bấm **Test Connection**.

**Website** — nhập `PUBLIC_URL`.

## 7. Kiểm tra sau triển khai

```bash
npm test
npm run verify:lang
```

Trên trình duyệt:

1. Đăng nhập một tài khoản học viên thử, mở một bài học và hoàn thành một bài.
2. Mở trang Bảng giá và tạo một đơn thử.
3. Hỏi trợ lý AI một câu.
4. Đăng nhập tài khoản quản trị và mở tab Doanh nghiệp.

## 8. Xử lý sự cố

| Triệu chứng | Cách kiểm tra |
|---|---|
| Webhook SePay bị từ chối | Doanh nghiệp → Webhook Logs: xem trạng thái và nội dung. Kiểm tra lại khóa, kiểu xác thực và đồng hồ máy chủ (`timedatectl`). |
| Đã chuyển khoản nhưng Pro chưa kích hoạt | Doanh nghiệp → Giao dịch ngân hàng, xem mục "Không có mã đơn" hoặc "Không khớp". |
| AI báo "Chưa cấu hình GEMINI_API_KEY" | Nhập khóa trong Quản trị, hoặc đặt biến môi trường rồi khởi động lại PM2. |
| AI báo tạm dừng do đạt giới hạn | Chi phí tháng đã chạm `AI_MONTHLY_BUDGET_USD`. Tăng trần hoặc chờ đầu tháng sau. |
| Trang không tải | `pm2 logs hoc-ngoai-ngu`; kiểm tra nginx và cổng 8082. |
