# Bố cục điện thoại LifeRivo Study

Tài liệu ngắn cho người sửa giao diện: điều kiện nhận diện điện thoại, các thành phần dùng chung và cách kiểm tra.

## 1. Nhận diện điện thoại

Điện thoại được nhận diện theo kích thước và hướng màn hình, không dựa vào cảm ứng (trình duyệt giả lập không báo cảm ứng khi đổi kích thước tùy chỉnh):

- **Dọc:** chiều rộng ≤ 760px.
- **Ngang:** chiều cao ≤ 500px, hướng ngang và chiều rộng ≤ 960px (ví dụ 812×375, 844×390).

Chuỗi điều kiện dùng trong CSS:

```css
@media (max-width: 760px), (max-height: 500px) and (orientation: landscape) and (max-width: 960px) { ... }
```

Cửa sổ desktop rất thấp (cao ≤ 500px, rộng ≤ 960px) cũng nhận là điện thoại. Chấp nhận được, nhưng cần biết khi gỡ lỗi.

Mốc khác: ≤ 640px (gập khối dài "Xem thêm" trong [mobile-fold.js](../public/js/mobile-fold.js)), ≤ 360px (thu gọn thêm cho màn 320–360px).

## 2. Thành phần dùng chung trên điện thoại

| Thành phần | Selector chính | Nơi định nghĩa |
|---|---|---|
| Thanh điều hướng dưới (5 mục, mục giữa nổi) | `.mtab`, `.mtab-center` | [side-menu.css](../public/css/side-menu.css) |
| Menu đầy đủ (tấm trượt từ dưới) | `.shell > .side` | [side-menu.css](../public/css/side-menu.css) |
| Lưới chặng khóa học (2 cột, 1 cột dưới 360px) | `.lx-map > .lx-unit`, `.lx-unit-mascot`, `.lx-unit-pct` | [app-v4.css](../public/css/app-v4.css) giai đoạn 13 |
| Nút nghe lớn trong câu hỏi | `.lx-q-text:has(> .lx-listen)` | [app-v4.css](../public/css/app-v4.css) giai đoạn 15 |
| Dải bạn đồng hành (3 cột) | `.hm-pet-tabs` | [app-v4.css](../public/css/app-v4.css) giai đoạn 16 |
| Chọn bạn đồng hành (2 cột) | `.cp-picker` | [app-v4.css](../public/css/app-v4.css) giai đoạn 16 |
| Ô nhập trò chuyện AI dính trên thanh dưới | `.sp-chat .sp-dock` | [app-v4.css](../public/css/app-v4.css) giai đoạn 17 |
| Hàng nút phòng luyện nói (thu nhỏ ≤ 360px) | `.sp-ctl`, `.sp-round`, `.sp-mic` | [app-v4.css](../public/css/app-v4.css) giai đoạn 18 |
| Thẻ môn học (thu gọn ≤ 360px) | `.sw-chibi-card` | [app-v4.css](../public/css/app-v4.css) giai đoạn 14 |

## 3. Token

- `--cp-*` (màu, bán kính, bóng): [chibi-premium.css](../public/css/chibi-premium.css).
- `--v4-*` (bán kính, bóng, viền nút): khai báo dưới `html body.in-app:not(.ax-on)` trong [app-v4.css](../public/css/app-v4.css).
- Khoảng cách chưa có token chung. Đang dùng số trực tiếp (8, 12, 16px).

## 4. Kiểm tra

Kiểm tra tự động trên 11 kích thước (320 đến 430, 768, 1024, 1440, ngang 812×375 và 844×390) cho 12 trang chính:

```bash
BASE_URL=http://127.0.0.1:8091 LAYOUT_USER=<tài khoản thử> LAYOUT_PASS=<mật khẩu thử> \
  PLAYWRIGHT_CORE_PATH=<đường dẫn tới playwright-core> \
  node tools/mobile-layout-check.mjs --shots <thư mục ảnh>
```

Công cụ dùng Chrome đã cài và `playwright-core` (không nằm trong `package.json`). Nó kiểm tra tràn ngang, thanh dưới có trong khung hình không, và trang trống. Lỗi JS "Cannot use import statement" của `lang-switch.js` được bỏ qua vì đã biết. Kết quả ghi vào `layout-report.json` trong thư mục ảnh. Đặt `LAYOUT_SCHEME=dark` để kiểm tra chế độ tối.

Chạy trên máy chủ thử với cơ sở dữ liệu tạm, không chạy trên dữ liệu thật.

### So sánh computed style trước và sau khi gộp CSS

Để chứng minh một lần gộp CSS không đổi giao diện, chụp trước và sau rồi so sánh (675 phần tử, 10 trang, 3 kích thước):

```bash
node tools/style-snapshot.mjs --out <trước.json>
# sửa CSS, build
node tools/style-snapshot.mjs --out <sau.json>
node tools/style-snapshot.mjs --compare <trước.json> <sau.json>
```

Các phần tử đang chạy hoạt ảnh (bong bóng bạn đồng hành) bị loại khỏi phép đo vì vị trí đổi theo thời gian.

## 5. Còn lại

- [app-v4.css](../public/css/app-v4.css) còn nhiều `!important` để thắng các lớp cũ ([chibi-premium.css](../public/css/chibi-premium.css), [theme.css](../public/css/theme.css)). Chưa gộp và chưa xóa, vì xóa hàng loạt có thể làm hỏng desktop.
- Nhiều quy tắc ≤ 760px cũ ([home-learner.css](../public/css/home-learner.css), [ui-unified.css](../public/css/ui-unified.css), [theme.css](../public/css/theme.css)) không áp dụng khi xoay ngang. Chỉ các khối đã nêu ở mục 2 được mở rộng sang điện thoại ngang.
- Chưa thử trên máy thật (iOS, Android, máy tính bảng).
- Các trang học chưa có bố cục riêng từng trang. Chỉ có các thành phần ở mục 2 và các chỉnh sửa đã nêu.
