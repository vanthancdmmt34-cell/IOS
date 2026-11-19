# LifeRivo

Học ngoại ngữ bằng tiếng Việt: Anh, Trung, Nhật, Hàn, Pháp, Tây Ban Nha. Luyện nói, chấm phát âm, phỏng vấn thử và chứng nhận.

## Chạy

```bash
npm install
npm run build
npm start
```

Mặc định chạy tại http://127.0.0.1:8082. Biến môi trường xem trong `ecosystem.config.example.cjs`.

Phiên bản được đọc từ `package.json` (`version`): bump phiên bản ở đó khi phát hành.

### Quản trị viên

- `ADMIN_USERNAME`: tên tài khoản sẽ thành admin khi đăng ký.
- `ALLOW_FIRST_USER_ADMIN=1`: chỉ dùng khi dev/test, cho tài khoản đăng ký đầu tiên trên DB trống thành admin. Không bật trên production.
- Nếu chưa có admin nào, máy chủ ghi cảnh báo khi khởi động. Có thể dùng `node tools/promote-admin.js <tên tài khoản>`.

## Kiểm thử

```bash
npm run check:css
npm run check:js
npm run verify:lang
npm test
```

Dữ liệu test nằm trong thư mục tạm, không ghi vào `data/` của repo. CI (`.github/workflows/ci.yml`) chạy các lệnh trên trên Ubuntu và Windows.
