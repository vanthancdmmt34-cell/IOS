# Kiểm kê thành phần CSS và kế hoạch gộp

Tài liệu này ghi lại tình trạng hiện tại để gộp thành phần (nút, thẻ, thanh tiến độ, mascot, điều hướng). Số liệu lấy từ các tệp CSS không phải bản nén.

## 1. Tình trạng

- 22 tệp CSS không nén. 11 tệp được gộp vào `bundle.min.css` theo thứ tự trong [build-css.mjs](../tools/build-css.mjs): `app.css`, `ui-unified.css`, `speak.css`, `theme.css`, `home-learner.css`, `handwritten-sync.css`, `modern-learn.css`, `chibi-ui.css`, `chibi-premium.css`, `side-menu.css`, `app-v4.css`. Tệp đứng sau thắng khi cùng độ đặc hiệu.
- Số khối quy tắc: `theme.css` 2437, `ui-unified.css` 1486, `app.css` 1225, `home-learner.css` 703, `chibi-premium.css` 517, `app-v4.css` 216 (sau khi bỏ bớt `!important`).

## 2. Số lần mỗi thành phần được định nghĩa lại

| Thành phần | Số tệp có định nghĩa | Số dòng có selector |
|---|---|---|
| Nút `.btn` | 18 | 257 |
| Thanh tiến độ `.bar` | 15 | 79 |
| Khối nội dung `.sheet` | 11 | 61 |
| Thẻ `.card` | 7 | 21 |
| Chặng khóa học `.lx-unit` | 6 | 87 |
| Thanh tab `.tabs` | 11 | 66 |

Mỗi con số là số dòng có chứa selector, nên một khối nhiều selector có thể được tính nhiều lần.

## 3. Vì sao chưa gộp trong một lần

- Mỗi thành phần được chỉnh lại ở nhiều lớp. Bỏ một định nghĩa có thể làm đổi giao diện ở trang khác.
- Nhiều quy tắc `!important` tồn tại để thắng các lớp trước. 85 `!important` còn lại trong `app-v4.css` đều thuộc nhóm này.
- Thay đổi chỉ an toàn khi có phép đo. Công cụ [style-snapshot.mjs](../tools/style-snapshot.mjs) đo được 1203 phần tử, cả trạng thái thường và hover, trên 10 trang, 3 kích thước.

## 4. Kế hoạch từng bước

Mỗi bước: thêm định nghĩa chuẩn, đo bằng `style-snapshot`, rồi mới xóa định nghĩa cũ. Chỉ xóa khi không có khác biệt.

1. **Nút `.btn`:** chọn một định nghĩa chuẩn trong `app-v4.css` (đã có token `--v4-btn-lip`, `--v4-shadow-btn`). Xóa dần các biến thể trùng trong `ui-unified.css` và `theme.css`.
2. **Thanh tiến độ `.bar`:** dùng định nghĩa trong `chibi-premium.css` (dòng `#main .bar`) làm chuẩn. Gộp các biến thể `.lx-bar`, `.hm-bar`, `.edu-kpi .bar` về cùng một kiểu.
3. **Khối `.sheet` và `.card`:** đưa về một định nghĩa dùng token bán kính và bóng.
4. **Chặng `.lx-unit`:** đã có kiểu màu theo chặng trong `app-v4.css`. Xóa các định nghĩa cũ trong `ui-unified.css` và `chibi-premium.css` sau khi đo.
5. **Mascot:** `chibi-ds.js` là nguồn duy nhất. Kiểm tra các biến thể `cm-wrap` và `cp-svg` trước khi gộp.

Mỗi bước là một commit riêng, có kết quả đo đi kèm.
