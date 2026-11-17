# LifeRivo AI Language – Release 1.5

## Phạm vi

Release này chỉ mở rộng AI Learning Insights cho sáu khóa ngoại ngữ: `en`, `zh`, `ja`, `ko`, `fr`, `es`. Dữ liệu lập trình hoặc môn học khác không được dùng trong phân tích, Learning Score, nhịp học, kế hoạch hay lịch sử của module này. Các module cũ ngoài phạm vi vẫn được giữ nguyên.

## Những nội dung được bổ sung

### 1. Skill Radar

- Biểu đồ hồ sơ năng lực gồm từ vựng, ngữ pháp, nghe, đọc hiểu, viết/chính tả, luyện nói và phát âm.
- Mỗi nhóm được tính từ nguồn dữ liệu tương ứng; luyện nói và phát âm là hai tín hiệu riêng biệt.
- Nhóm chỉ có điểm khi có tối thiểu ba mẫu hợp lệ; thiếu dữ liệu hiển thị `—`, không tự suy diễn.

### 2. Lịch sử tiến bộ 30/90 ngày

- Lưu ảnh chụp Learning Progress Index theo từng ngày, từng `user_id` và từng `lang`.
- Cho phép xem 30 hoặc 90 ngày.
- Chỉ nối các ngày thực sự có điểm; không nội suy ngày thiếu.
- Lịch sử bắt đầu khi tính năng đã được triển khai và dữ liệu đủ điều kiện được ghi nhận; không backfill lịch sử cũ.

### 3. Smart Vocabulary Memory

- Đo lường lượt ôn được ghi lại trong 30 ngày, tỷ lệ trả lời đúng và số từ đã ôn.
- Hiển thị những từ có ít nhất hai lượt ôn sai.
- Đây là thống kê từ các lần kiểm tra thực tế, không phải phép đo trí nhớ ngoài các lượt ôn.

### 4. Pronunciation Coach

- Tổng hợp điểm accuracy/fluency/completeness và góp ý theo từ từ bảng đánh giá phát âm hiện hữu.
- Từ có vấn đề chỉ được đưa ra khi đã có ít nhất hai mẫu phản hồi và điểm trung bình thấp hơn ngưỡng.
- Không lưu tệp âm thanh vào lịch sử Insights.
- Điểm mô hình là ước lượng, không phải kiểm định âm vị chuẩn hóa hoặc chứng chỉ phát âm. Phần luyện nói đối chiếu câu/từ vẫn được hiển thị riêng.

### 5. Adaptive Learning Plan

- Kế hoạch bảy ngày xét đến nhóm bài yếu, bài chưa hoàn thành, từ đến hạn, từ sai lặp lại, luyện nói/phát âm và nhịp học.
- Mỗi kế hoạch lưu lý do điều chỉnh.
- Người học có thể yêu cầu điều chỉnh theo dữ liệu mới; hệ thống không âm thầm thay lịch đã lưu.
- Các nhiệm vụ chỉ liên kết tới route ngoại ngữ tương ứng.

### 6. Learning Interruption Risk

- Bổ sung `dropOffRisk` với điểm 0–100, mức thấp/vừa/cao, độ tin cậy và lý do.
- Tính theo số ngày không hoạt động và mức giảm hoạt động ngoại ngữ so với tuần trước.
- Đây là chỉ báo quy tắc minh bạch (`language_activity_rules_v1`), không phải mô hình ML, không phải xác suất bỏ học và không đánh giá động lực/tâm lý.
- Nếu dữ liệu không đủ, API trả trạng thái `insufficient_data` và không gán điểm.

### 7. AI Learning Analyst và PDF

- Báo cáo AI sử dụng dữ liệu tổng hợp thuộc tài khoản và khóa ngoại ngữ đang xem.
- Tách rõ hoạt động 7 ngày với các chỉ số toàn khóa/ảnh chụp hiện tại.
- Có cache báo cáo, hạn mức, rate limit và kiểm tra ngân sách trước khi gọi AI.
- Bản in/PDF bao gồm tóm tắt chỉ số hiện tại, bảng kỹ năng và nội dung báo cáo AI. Trình duyệt mở hộp thoại Print; người dùng chọn “Save as PDF”. Đây không phải file PDF tự sinh từ server.

### 8. AI Cost Monitoring dành cho quản trị

- Tái sử dụng tab Quản trị > Chi phí AI và API hiện có.
- Bổ sung cảnh báo ngưỡng ngân sách 70%/85%/100%, chi phí trung bình/lượt, tỷ lệ lỗi và dự phóng chi phí cuối tháng.
- Dự phóng là ước tính tuyến tính từ chi phí đã dùng và số ngày trong tháng, không phải khoản chi thực tế đã phát sinh.
- Thống kê này dùng bảng `ai_usage` toàn hệ thống, có thể bao gồm các tính năng AI khác; không phải báo cáo riêng chỉ sáu khóa ngoại ngữ.
- Chức năng xuất Excel chi tiết hiện hữu được giữ lại.

## Công thức và giới hạn

Learning Progress Index v1.2 dùng các thành phần có đủ dữ liệu: kết quả bài tập, tiến độ SRS, luyện nói đối chiếu câu/từ, điểm phát âm ước lượng, độ đều đặn và tiến độ khóa. Trọng số được chuẩn hóa lại nếu thiếu thành phần. Chỉ số là nội bộ LifeRivo, không phải CEFR.

## Kiểm thử đã chạy

- `node --check` cho các module JavaScript thay đổi: đạt.
- `npm run build`: đạt; xác minh 6 khóa, 2.792 bài tập.
- Kiểm thử tập trung: `tests/learning-insights.test.mjs`, `tests/language-ai-api.test.mjs`, `tests/learning-dashboard-refresh.test.mjs`: 49/49 đạt.
- Toàn bộ test suite chưa được nghiệm thu. Dependencies `pg` và `web-push` không được tải/cài thành công trong môi trường chỉnh sửa (`npm ci --offline` báo package chưa có trong cache; thử cài trực tuyến trước đó bị timeout). Lần chạy toàn bộ trước đó bị lỗi khởi tạo do thiếu các package này và các test phụ thuộc bị hủy.
- `npm run build` tạo 44 module JavaScript hợp lệ nhưng báo Terser chưa được cài, nên output chưa được minify bằng Terser.
- Chưa chạy staging/production trên VPS và chưa kiểm tra với database production thực tế.

## Files chính thay đổi trong Release 1.5

- `modules/learning-insights.js`
- `modules/languages.js`
- `public/js/lang.js` và `public/js/lang.min.js`
- `public/js/admin-biz.js` và `public/js/admin-biz.min.js`
- `public/css/home-learner.css`
- các CSS bundle được tạo lại bằng `npm run build`
- `tests/learning-insights.test.mjs`
- `tests/language-ai-api.test.mjs`
- `tests/learning-dashboard-refresh.test.mjs`

## Triển khai staging

1. Sao lưu source, database và cấu hình hiện tại.
2. Giải nén Release 1.5 vào thư mục staging.
3. Giữ `.env`, `data/`, database, khóa bí mật và các file vận hành hiện tại của VPS; archive bàn giao không kèm các file này.
4. Cài dependencies bằng `npm ci` trên máy có thể truy cập npm registry.
5. Nếu muốn minify JS bằng Terser, cài Terser theo hướng dẫn build của dự án rồi chạy lại `npm run build`.
6. Chạy `npm run build`, `npm test`, kiểm tra API, đăng nhập, AI quota, tạo báo cáo và 6 khóa ngoại ngữ.
7. Chỉ đưa lên production sau khi staging đạt.

Không thay thế database production hoặc ghi đè `.env`/khóa bí mật bằng file từ gói source.
