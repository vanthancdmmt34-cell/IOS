# CHANGELOG — LifeRivo

## Chưa phát hành — Chỉ còn học ngoại ngữ, làm lại giao diện cho người mới

### Gỡ nội dung lập trình
- Gỡ toàn bộ khóa học lập trình (Python, C/C++, Java, SQL): bài học, chương, đề, đáp án và chứng nhận liên quan.
- Gỡ chức năng chấm code tự động: trình soạn code, bộ chạy code (Docker, sandbox), hàng đợi chấm (BullMQ/Redis), dịch vụ chấm (Judge) và các API tương ứng.
- Gỡ tài liệu, báo cáo kiểm toán và phát hành của các phiên bản lập trình; giữ lại tài liệu về triển khai, cơ sở dữ liệu, bảo mật, quản trị và biến môi trường.
- Gỡ mã giao diện cũ (`archive/legacy-public`), mã CSS và JavaScript không còn được nạp, công cụ kiểm tra bài lập trình.
- Migration `2026_11_15_050_drop_programming_columns` bỏ các cột liên kết bài lập trình khỏi lộ trình học (`learning_plan_days`) và hội thoại AI (`ai_conversations`).
- Gỡ chuỗi giao diện tiếng Anh (`public/locales/en.json`) không còn được dùng: 86 mục liên quan đến chạy code, bộ chấm, sandbox.

### Giao diện học viên
- Menu bên trái cố định trên máy tính, chia 3 nhóm dễ hiểu: **Học**, **Tiến độ & lớp học**, **Tài khoản** (thêm **Quản trị** cho quản trị viên). Mỗi nhóm đóng mở được.
- Điện thoại và máy tính bảng: menu thành ngăn kéo, mở bằng nút ☰ ở góc trên bên trái.
- Sửa lỗi menu trống trên máy tính: bố cục menu ngang không còn phần tử menu nên người dùng không thấy mục nào.
- Nhãn menu rõ ràng hơn: "Luyện thi TOEIC", "Tiến độ & lớp học", "Tài khoản".
- Nội dung trong ứng dụng dùng phông chữ hệ thống, dễ đọc tiếng Việt; khung menu và thẻ bớt nét vẽ tay.
- Trang bài tập: câu hỏi và đáp án lớn, thanh "Nộp bài" cố định ở cuối màn hình, nút "Bài sau" ở đầu trang.

### Giao diện Premium Chibi
- Lớp giao diện thống nhất `public/css/chibi-premium.css` (cuối bundle) và `public/css/landing-premium.css` (trang chủ): bảng màu Lavender / Pink / Mint / Sky / Cream, phông Nunito, thẻ bo mềm, bóng nhẹ, hỗ trợ chế độ tối. Thay cho nét vẽ tay, bóng cứng và nền vàng cũ.
- Trợ lý Rivo ở trang chính của môn học: chào theo tên và giờ, gợi ý bài kế tiếp, số từ đến hạn ôn và cách bắt đầu cho người mới, kèm nút trả lời nhanh và giọng đọc (tùy chọn). Nội dung dựng từ dữ liệu thật; câu hỏi tự do chuyển cho trợ lý AI khi đã bật.
- Lộ trình bài học dạng bản đồ: mỗi chặng là một điểm dừng trên đường đi, có trạng thái Đã xong / Bạn đang ở đây / Sắp tới, đích cuối là bài kiểm tra cấp độ và chứng nhận. Bản đồ nằm ngay dưới thẻ "Học tiếp".
- Menu: mỗi mục trong nhóm Học có một dòng mô tả ngắn để người mới biết mục đó dùng làm gì.

### Sửa lỗi và kiểm thử
- Cập nhật các test kiểm tra thẻ og:image để chấp nhận tham số cache `?v=`.
- Test kiểm tra import trong bản rút gọn JavaScript chấp nhận cả trường hợp minifier bỏ khoảng trắng.
- Bundle CSS và JavaScript được build lại từ mã nguồn hiện tại.

### Ghi chú
- Lịch sử các phiên bản trước vẫn còn trong Git. Phần dưới đây chỉ giữ các mục không liên quan đến lập trình.

## 5.1.0 — Trang tổng quan và khám phá khóa học
- Trang tổng quan học viên: lời chào theo giờ, trạng thái đã học hôm nay, bốn chỉ số, thẻ "Tiếp tục học", việc cần làm và lộ trình cấp độ của khóa đang học.
- Khám phá khóa học: tìm kiếm không dấu, lọc theo nhóm và trạng thái, sắp xếp theo tiến độ hoặc tên.
- Phòng học ngoại ngữ: thanh điều hướng Trước / Lý thuyết / Danh sách bài / Sau ở đầu trang bài tập.
- Trợ lý AI: nút sao chép câu trả lời.

## 5.0.0 — Thương hiệu LifeRivo, bảng màu và chế độ sáng/tối
- Thương hiệu mới, biểu tượng SVG, phông Inter, token màu dùng chung.
- Chế độ sáng/tối theo lựa chọn của người dùng (lưu trong trình duyệt), mặc định theo hệ điều hành.
- Vòng focus bàn phím thống nhất; sửa tràn ngang trên màn hình 360 px.

## 4.2.0 — Học tập làm trung tâm
- Tổng quan sắp theo thứ tự sư phạm: bài tiếp theo, tiến độ giáo trình, kiến thức cần củng cố, lộ trình cá nhân.
- Lộ trình cá nhân 7 ngày và bài đánh giá đầu vào, tự lưu khi đang làm.
- Gợi ý ôn lại bài chưa đạt, tách rõ giáo trình chính và các bài chuyên sâu.

## 4.0.1 — Giáo viên quản lý học viên; quản trị quản lý giáo viên; logo
- Giáo viên tạo tài khoản học viên hàng loạt, xem tiến độ, khóa/mở khóa tài khoản do mình tạo.
- Quản trị tạo, gia hạn giấy phép, đặt lại mật khẩu và chuyển lớp của giáo viên.
- Logo tùy chỉnh (PNG, JPG, WebP), hiển thị ở đầu trang, trang công khai và chứng nhận.
- Migration `2026_10_30_014_teacher_students_logo`.

## 4.0.0 — Nền tảng LMS song ngữ, phân quyền và lớp học
- Bốn vai trò: quản trị (`admin`), giáo viên (`teacher`), học viên (`student`), phụ huynh (`parent`). Quyền giáo viên và quản trị tách bạch.
- Quyền học đa nguồn (cá nhân, quản trị tặng, giấy phép lớp, gói gia đình); mọi API kiểm tra quyền trên máy chủ.
- Lớp học: mã lớp và liên kết mời có thời hạn, giao bài, bài kiểm tra có giờ mở/đóng, báo cáo xuất Excel và PDF.
- Gói gia đình: mời thành viên, chia sẻ tiến độ.
- Song ngữ Việt/Anh: ~1.400 chuỗi giao diện, bản dịch nội dung học có duyệt trước khi xuất bản.
- Trang pháp lý (điều khoản, quyền riêng tư, thanh toán, hoàn tiền, quy tắc thành viên) bằng hai ngôn ngữ.
- Nhật ký webhook thanh toán; kiểm tra tài khoản nhận tiền; giao dịch trùng không cấp quyền hai lần.

## 3.2.1 — Khóa Gemini mới
- Chấp nhận định dạng khóa `AQ.…` cùng với `AIza…`.
- Nút kiểm tra kết nối AI giải thích lỗi thường gặp bằng tiếng Việt.

## 3.2.0 — Cấu hình mọi thứ trong trang quản trị
- Tab "Thanh toán, AI, hệ thống" với một nút lưu, có hiệu lực ngay không cần khởi động lại.
- Khóa bí mật (Gemini, SePay) được ghi một chiều, mã hóa AES-256-GCM, khóa giải mã nằm trong `data/secret.key` (quyền 600).
- Thứ tự ưu tiên: giá trị trong quản trị > biến môi trường > giá trị mặc định.

## 3.1.0 — Thanh toán QR tài khoản cá nhân
- Hai cách xác nhận thanh toán: QR tài khoản cá nhân (mặc định) hoặc tự động qua SePay.
- Mã VietQR tạo trên máy chủ theo chuẩn EMVCo/NAPAS.
- Học viên bấm "Tôi đã chuyển khoản"; quản trị đối chiếu và xác nhận. Đơn chờ xác nhận không tự kích hoạt Pro.
- Migration `2026_10_30_003_order_claimed`.

## 3.0.0 — Mô hình Freemium
- Gói Pro theo tháng/quý/năm; thời hạn cộng dồn.
- Thanh toán VietQR và webhook SePay (HMAC-SHA256 hoặc API key), chống xử lý trùng.
- Trợ lý AI (Google Gemini) gọi từ máy chủ, có hạn mức theo gói và trần chi phí tháng.
- Trang quản trị kinh doanh: thống kê, đơn hàng, giao dịch, thành viên Pro, bảng giá, chi phí AI, nhật ký.
- Đánh số migration có khả năng hoàn tác (`db/migrations.js`, `tools/migrate.js`); bảng `audit_logs`.
