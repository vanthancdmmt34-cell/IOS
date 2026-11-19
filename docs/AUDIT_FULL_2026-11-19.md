# Báo cáo kiểm toán toàn diện — LifeRivo Study

- Ngày kiểm toán: 19/11/2026
- Nhánh: `claude/liferivo-study-audit-2304c0` (commit gốc `b5ab72b`)
- Môi trường: Windows 11, Node.js 24.18.1 (dự án yêu cầu Node ≥ 22), npm 11.16.0
- Phạm vi: toàn bộ mã nguồn trong repo (675 file theo dõi), chạy thử server thật, kiểm tra giao diện trên trình duyệt.
- Trạng thái: báo cáo gốc được lập khi chưa sửa mã. **Cập nhật đợt 0:** đã sửa P0-1, P0-2, P0-3 và kiểm chứng (Phụ lục C). **Cập nhật đợt 1:** đã sửa P1-2, P1-3 (phần lớn), P1-4, P1-5 và kiểm chứng (Phụ lục D). **Cập nhật đợt 2:** CI cho test, thu hẹp CSP Rive, cache file tĩnh (Phụ lục E). **Cập nhật đợt 3:** xử lý toàn bộ mục còn lại, gồm chấm phát âm, consent analytics, chống spam email, admin SQL, TTS bền vững, dọn mã cũ, Zalo và các mục P3 (Phụ lục F). **Cập nhật rà soát sau đợt 3:** kiểm tra lại giao diện, tính năng, API, nút bấm và nghiệp vụ; sửa 3 nhóm route thiếu (đơn Pro "Tôi đã chuyển khoản", hội thoại AI, thử thông báo) (Phụ lục G). Chưa commit.

## Chú thích trạng thái

- **ĐÃ KIỂM CHỨNG**: đã chạy thật (API, trình duyệt, lệnh build/test) và có kết quả cụ thể.
- **ĐỌC MÃ**: chỉ xác nhận bằng đọc mã nguồn, chưa chạy được trong môi trường này.
- **CHƯA KIỂM CHỨNG**: không kiểm tra được (lý do ghi kèm).

---

## 0. Tóm tắt điều hành

**Kết luận: CHƯA đủ điều kiện đưa lên production.**

Điểm tổng thể: **5.8 / 10** (trung bình đơn giản 12 hạng mục, xem mục 8).

Ba lỗi P0 cần xử lý trước khi phát hành:

1. **Trang Tổng quan lỗi với học viên mới** (chưa chọn môn). Đây là trang mặc định sau khi đăng ký/đăng nhập, nên hầu hết người dùng mới sẽ thấy "Không mở được trang này". Đã tái hiện trên trình duyệt. Nguyên nhân: commit `c6cadf7` (17/11/2026).
2. **Token đặt lại mật khẩu bị ghi nguyên văn vào log và gửi qua webhook**, đồng thời lưu thô trong DB. Đã xác nhận trong log của server.
3. **File backup `.db` chứa bảng `sessions`** (token phiên đăng nhập đang hoạt động) và hash mật khẩu. Đã tải backup và đọc được.

Điểm mạnh đã được kiểm chứng:
- Luồng thanh toán SePay: **10/10 kiểm tra đạt** (chữ ký sai bị từ chối, chuyển thiếu không kích hoạt, chuyển đúng kích hoạt Pro, replay không cộng đôi, sai tài khoản và chuyển ra đều bị bỏ qua).
- Phân quyền: học viên bị chặn route quản trị (403), truy cập lớp không thuộc quyền trả 404 (không lộ dữ liệu), API không lộ đáp án bài tập, ghi qua cookie bắt buộc CSRF.
- Chống dò mật khẩu (sau 9 lần sai → 429), cookie `HttpOnly; SameSite=Lax`, secret cấu hình được mã hóa AES-256-GCM.
- Không có lỗ hổng đã biết trong dependency (`npm audit`: 0 lỗ hổng).

Lưu ý quan trọng về kiểm thử: **bộ test hiện không đáng tin làm cổng phát hành.** Hai lần chạy `npm test` cho kết quả khác nhau (119 pass/6 fail/41 cancelled và 79 pass/5 fail/82 cancelled), và chạy test còn ghi đè file build đã commit.

---

## 1. Phương pháp và giới hạn

### Đã thực hiện
- `npm ci` (131 gói), `npm run check:js` (đạt), `npm run verify:lang` (đạt: 6 khóa, 2.792 bài, không lỗi), `npm run check:css` (**thất bại**, xem F-07).
- `npm test` hai lần: một lần dùng `DATA_DIR` mặc định, một lần trỏ về thư mục tạm.
- Chạy server thật trên DB tạm (`DATA_DIR` ngoài repo) và thực hiện 53 kiểm tra API/bảo mật/thanh toán (đa số đạt; các lỗi thật được ghi ở mục 4).
- Duyệt trình duyệt: landing (375px và desktop), đăng nhập học viên mới, dashboard, lộ trình, khóa học, luyện nói, TOEIC, bảng giá, trang quản trị và trang giáo viên (kiểm tra chặn quyền).
- Đồ thị import phía client (từ `public/js`) và phía server (từ `server.js`) để tìm module không còn được dùng.
- Quét bí mật trong file theo dõi (chỉ báo tên file và dòng, không in giá trị).

### Chưa kiểm chứng được
- **AI (Rivo, gia sư, chấm phát âm, TTS)**: không có `GEMINI_API_KEY`. Chỉ đọc mã.
- **Email OTP và khôi phục qua email**: không có SMTP.
- **Zalo bot**: không có bot. Chỉ đọc mã.
- **PostgreSQL**: không có server PG. Chỉ đọc mã và schema.
- **Ứng dụng Android/iOS** (Capacitor): không build APK/IPA.
- **Lighthouse, axe (khả năng tiếp cận), tải (load test)**: không chạy.
- **Cổng thanh toán thật, thiết bị thật**: không có.
- Sandbox không tải được script ngoài (Google Tag Manager, jsDelivr). Các lỗi "unknown error when fetching the script" trong console có nguyên nhân từ môi trường này, không phải lỗi app.

---

## 2. Tổng quan kiến trúc thực tế

| Thành phần | Thực tế trong mã nguồn |
|---|---|
| Máy chủ | Node `node:http` tự viết router, không framework. `server.js` 1.512 dòng; `modules/*.js` khoảng 9.000 dòng. Mặc định nghe `127.0.0.1`, sau nginx. |
| Cơ sở dữ liệu | Hai engine: **SQLite** (`node:sqlite`, mặc định, file `DATA_DIR/app.db`) và **PostgreSQL** (khi có `PGDATABASE`, schema `schema-pg.sql`). Adapter bất đồng bộ giữ cùng API (`db/pg.js`, `db/sqlite-async.js`). Migration có đánh số (`db/migrations.js`). |
| Frontend | SPA ES module trong `public/js/` với định tuyến History (`/app/...`). Build bằng `tools/build-js.mjs` ra `*.min.js`; `index.html` nạp `main.min.js`. Landing được render sẵn từ máy chủ (`renderHomeSSR`); trang công khai qua `modules/seo.js`. |
| AI | Gemini (`modules/ai.js`): trợ lý Rivo, chấm phát âm, STT, TTS (Gemini + AssemblyAI cho en/fr/es). Khóa lấy từ Admin hoặc biến môi trường, lưu mã hóa trong `sysconfig.js` (khóa AES-256-GCM nằm ở `DATA_DIR/secret.key`). |
| Thanh toán | Chuyển khoản QR thủ công; webhook SePay (HMAC-SHA256 hoặc API key, fail-closed); xác nhận qua bot Zalo; gói Pro/Family/Teacher; mã quà tặng; Pro miễn phí 10 phút/ngày. |
| LMS | Lớp học (mã mời, duyệt thành viên), bài tập (code/quiz/chấm tay theo rubric), bài kiểm tra có giờ, báo cáo và xuất xlsx, cấp giấy phép giáo viên theo chỗ, gia đình (mời, chia sẻ tiến độ). |
| Di động | Capacitor (`android/`, `ios/`), build bằng workflow GitHub chạy tay. |
| Triển khai | PM2 + nginx (`ecosystem.config.example.cjs`, `nginx.conf.sample`); `docker-compose.staging.yml`. |
| Phiên bản | `package.json` = **5.1.3**; hằng `VERSION` trong `server.js:41` = **1.0.1**. Không đồng nhất. |

### Ngôn ngữ đang triển khai (xác minh từ API và `verify:lang`)
Tiếng Anh (`en`), Trung (`zh`), Nhật (`ja`), Hàn (`ko`), Pháp (`fr`), Tây Ban Nha (`es`). Tổng: 6 khóa, 2.792 bài tập.

`README.md` ghi "5 ngôn ngữ" và thiếu Tây Ban Nha. Đây là lỗi tài liệu.

### Lập trình (Python/C/C++/Java)
Không còn trong đường chạy của server. Migration `2026_11_15_050_drop_programming_columns` đã gỡ cột lập trình khỏi DB. Mã và nội dung cũ vẫn nằm trong repo; chi tiết ở mục 5.

---

## 3. Chức năng đang có và trạng thái

| Nhóm | Chức năng | Trạng thái |
|---|---|---|
| Tài khoản | Đăng ký (học viên mặc định; người đăng ký đầu tiên trên DB rỗng thành admin) | ĐÃ KIỂM CHỨNG (F-08) |
| | Đăng nhập, chống dò (đăng nhập sai → 429) | ĐÃ KIỂM CHỨNG |
| | Đăng xuất | ĐÃ KIỂM CHỨNG (không cần CSRF, F-13) |
| | Đổi mật khẩu (thu hồi các phiên khác) | ĐỌC MÃ |
| | Quên mật khẩu: OTP qua email (cần SMTP) hoặc token qua log/webhook | ĐÃ KIỂM CHỨNG (nhánh token, F-02); nhánh OTP: ĐỌC MÃ |
| | Email khôi phục: lưu không xác minh; xác minh OTP và tặng Pro 7 ngày (một lần/địa chỉ) | Lưu chưa xác minh: ĐÃ KIỂM CHỨNG (F-11); còn lại ĐỌC MÃ |
| Học ngoại ngữ | 6 khóa, cấp độ theo khung (CEFR/HSK/JLPT/TOPIK/DELF/DELE), bài học và 2.792 bài tập (trắc nghiệm, nghe, sắp xếp) | ĐÃ KIỂM CHỨNG (danh sách, khóa học mở) |
| | Chấm bài phía máy chủ, không lộ đáp án | ĐÃ KIỂM CHỨNG |
| | Ôn tập SRS, luyện viết zh/ja/ko, chứng nhận, bảng xếp hạng, huy hiệu, chuỗi ngày | ĐỌC MÃ (chuỗi ngày và sao được cộng khi chấm: ĐÃ KIỂM CHỨNG) |
| | Lộ trình học, phân tích học tập, nhiệm vụ hàng ngày, bạn đồng hành Chibi | ĐỌC MÃ; trang Lộ trình mở được: ĐÃ KIỂM CHỨNG |
| | Tổng quan (dashboard) học viên | **LỖI với học viên chưa chọn môn** (F-01); ĐÃ KIỂM CHỨNG khi đã chọn môn |
| Luyện nói | Nghe mẫu, nói lại, chấm từng từ | ĐÃ KIỂM CHỨNG (trang mở); chấm điểm có lỗi (F-04) |
| | Chấm phát âm bằng Gemini, STT, gợi ý phát âm (coach), hội thoại AI (Pro) | ĐỌC MÃ; cần Gemini key |
| Rivo (AI) | Hỏi đáp theo chế độ, hạn mức theo gói, trần ngân sách tháng, lịch sử hội thoại; persona giáo viên | ĐỌC MÃ; cần Gemini key |
| Phỏng vấn | 30 ngành, 1 buổi miễn phí cho tài khoản thường | ĐỌC MÃ (nhãn UI có trong mã) |
| TOEIC | 7 Part, 100 câu, đề thi thử, ước tính điểm | ĐÃ KIỂM CHỨNG (trang mở; unit test có pass) |
| Trò chơi và TTS | Trò chơi nghe/chính tả, TTS có cache và giới hạn lượt/ngày | ĐỌC MÃ; giới hạn lưu trong bộ nhớ (F-16) |
| Lớp học | Tạo lớp, mã mời, duyệt thành viên, bài tập, bài kiểm tra, báo cáo | Chặn IDOR: ĐÃ KIỂM CHỨNG; luồng giáo viên đầy đủ: ĐỌC MÃ |
| Gia đình | Mời thành viên, chia sẻ tiến độ, xem tiến độ | ĐỌC MÃ |
| Thương mại | Bảng giá (Pro 1/3/12 tháng, Family, Teacher) | Trang mở: ĐÃ KIỂM CHỨNG |
| | Tạo đơn chuyển khoản | ĐÃ KIỂM CHỨNG (tạo đơn) |
| | Webhook SePay | ĐÃ KIỂM CHỨNG (10/10) |
| | Xác nhận qua Zalo, gán giao dịch thủ công, hủy đơn, thu hồi Pro | ĐỌC MÃ |
| | Mã quà tặng, Pro miễn phí 10 phút/ngày | ĐỌC MÃ |
| Quản trị | Tổng quan, giám sát, người dùng (tạo, hàng loạt, khóa, đổi vai trò, đặt lại mật khẩu, đăng xuất phiên, xóa) | Quyền 403 cho học viên: ĐÃ KIỂM CHỨNG; còn lại ĐỌC MÃ |
| | Cài đặt hệ thống (AI, SePay, SMTP, Zalo); đổi khóa bí mật bắt buộc nhập lại mật khẩu | ĐÃ KIỂM CHỨNG (đặt secret SePay); còn lại ĐỌC MÃ |
| | Backup tải về | ĐÃ KIỂM CHỨNG, có lỗi lộ session (F-03) |
| | Dịch giao diện, thông báo, góp ý và đánh giá, nhật ký kiểm toán, thống kê phễu | ĐỌC MÃ; trang quản trị mở: ĐÃ KIỂM CHỨNG |
| Công khai | Landing SSR, trang bảng giá và chính sách, sitemap, robots, thống kê công khai | ĐÃ KIỂM CHỨNG (landing mobile và desktop; `/api/stats`) |
| Di động | Ứng dụng Capacitor | CHƯA KIỂM CHỨNG |

---

## 4. Lỗi và rủi ro đã phát hiện

Mã định danh: F-xx. Mức độ ở cột "Ưu tiên" theo mục 9.

### F-01 — Tổng quan lỗi với học viên chưa chọn môn [P0] — ĐÃ KIỂM CHỨNG
- **Triệu chứng**: sau đăng nhập/đăng ký, `/app/` hiển thị "Không mở được trang này — Cannot set properties of null (setting 'innerHTML')". Lỗi xuất phát từ `pageStudentHome` trong `home.min.js`.
- **Nguyên nhân**: commit `c6cadf7` (17/11/2026, "dedupe Tổng quan vs Cổ vũ/Học") thêm logic xóa `#lhExplore` khỏi Tổng quan tại `public/js/home.js:721`. Nhưng `public/js/home.js:791` vẫn tra cứu `exBox = main.querySelector("#lhExplore")` và `drawExplore()` (gọi tại dòng 843 và 846) vẫn gán `innerHTML` vào `exBox`, nên `exBox` là `null`. Xác nhận trong DOM: `#lhExplore` không tồn tại.
- **Thêm vào đó**: `public/js/main.js:203` đưa người dùng sau đăng nhập về `/app/` khi chưa có môn (`setAppHash(accountSubj ? ... : "/app/")`), trong khi chú thích ngay phía trên (khoảng dòng 198–199) nói rằng người chưa có môn phải vào luồng thiết lập `welcome.js`. Luồng `/app/chon-mon` hoạt động đúng khi mở trực tiếp (ĐÃ KIỂM CHỨNG), nhưng không được dẫn tới sau đăng nhập.
- **Phạm vi**: học viên chưa có `prefs.subject` (tài khoản mới). Học viên đã đặt môn `en` mở Tổng quan bình thường (ĐÃ KIỂM CHỨNG).
- **Vì sao không bị phát hiện**: bộ test không có kịch bản "tài khoản mới đăng nhập lần đầu".

### F-02 — Token đặt lại mật khẩu bị ghi log, gửi webhook và lưu thô [P0] — ĐÃ KIỂM CHỨNG
- `server.js:701`: `console.log(... token=${token} ...)` ghi token 48 ký tự hex nguyên văn vào log (ĐÃ KIỂM CHỨNG trong `server.log`).
- `server.js:704–714`: gửi toàn bộ token qua `deliverWebhook` (kèm đường dẫn `/app/dat-lai-mat-khau?token=...`).
- `server.js:679–683` và `schema-pg.sql:521–528`: token được lưu nguyên văn làm khóa chính `password_resets.token` (ĐÃ KIỂM CHỨNG trong DB: độ dài 48, dạng hex, không băm).
- **Ảnh hưởng**: ai đọc được log hoặc webhook có thể đặt lại mật khẩu cho học viên không có email (token dùng được 1 giờ). Admin không bị ảnh hưởng vì route reset chặn tài khoản admin.
- **Nguyên nhân**: nhánh "không có email" được thiết kế để admin hỗ trợ thủ công, nhưng token được ghi log và không băm.

### F-03 — Backup chứa phiên đăng nhập và hash mật khẩu [P0] — ĐÃ KIỂM CHỨNG
- `server.js:1225–1232`: `VACUUM INTO` toàn bộ DB, rồi trả file về cho admin.
- ĐÃ KIỂM CHỨNG: file tải về có bảng `sessions` (3 phiên hoạt động) và 2 hash mật khẩu.
- **Ảnh hưởng**: file backup bị rò rỉ là đủ để chiếm phiên đang đăng nhập. Phạm vi tải: chỉ admin, nhưng file thường được sao lưu sang nơi ít kiểm soát hơn.
- Ghi chú: khóa mã hóa secret (`secret.key`) không nằm trong backup, nên secret cấu hình không lộ theo đường này. Đây là điểm tốt.

### F-04 — Chấm phát âm tin vào văn bản do trình duyệt gửi [P1] — ĐÃ KIỂM CHỨNG
- `POST /api/lang/speak/score` nhận `heard` và `alts` từ trình duyệt (`modules/speaking.js:459`, `:492`), so khớp với câu mẫu rồi tính điểm.
- ĐÃ KIỂM CHỨNG: học viên miễn phí gửi đúng câu mẫu dưới dạng `heard` → **99 điểm, +5 sao**; chuỗi vô nghĩa → 20 điểm. Không có âm thanh nào gửi lên máy chủ.
- **Ảnh hưởng**: sao, XP, tiến độ "đã đạt" có thể bị khai khống. Điểm không phản ánh phát âm thực.
- Ghi chú: `/api/lang/speak/assess` (Gemini, có âm thanh) là đường đúng nhưng chỉ được đọc mã.

### F-05 — Header trang chủ tràn trên màn hình 375px [P1] — ĐÃ KIỂM CHỨNG
- Đo trên viewport 375px: `scrollWidth` của header = **404**, `clientWidth` = 375. Nút **"Mở menu điều hướng"** nằm ngoài màn hình khoảng 29px, chỉ lộ một phần.
- Ảnh hưởng: nút menu chính trên các máy màn hình nhỏ bị cắt. Cần xác định selector CSS khi sửa (chưa khoanh vùng trong báo cáo này).
- Phần còn lại của landing mobile ổn: không cuộn ngang trang (`scrollWidth` = 375), nội dung đúng tiếng Việt.

### F-06 — Bộ test không đáng tin và không dùng được làm cổng phát hành [P1] — ĐÃ KIỂM CHỨNG
Hai lần chạy `npm test` (166 test):

| Lần chạy | Pass | Fail | Cancelled |
|---|---|---|---|
| 1. `DATA_DIR` mặc định (trong repo) | 119 | 6 | 41 |
| 2. `DATA_DIR` trỏ về thư mục tạm | 79 | 5 | 82 |

Nguyên nhân gồm nhiều lớp:
- **Cô lập kém**: `tests/helpers/test-server.mjs:66` đặt `DATA_DIR` mặc định là `<repo>/data`. Test ghi `app.db` và `secret.key` vào repo (ĐÃ KIỂM CHỨNG: thư mục `data/` xuất hiện sau lần chạy đầu). Trên máy dev đã có DB thật trong `data/`, test **có thể** ghi vào DB thật (suy luận từ đường dẫn mặc định trong mã, chưa tái hiện). `api-business-audit` dừng với `FATAL: Workspace safety violation: data\app.db existence changed`.
- **Test lỗi thời**: nhóm `C1-*`, `M2-C1-*`, `M3-C2-*` kiểm tra landing 8 mục cũ (có `#demoBox`, câu "Thử 2 phút là biết mình học được"). Trang hiện tại không còn những phần đó. `tier4` mong đợi `href="#/ngoai-ngu/ja"`, trong khi app dùng `/app/ngoai-ngu/ja`. `daily-missions` mong đợi shape `today` cũ (thiếu `lessons`, `speaks`). Test `og:image` không chấp nhận tham số `?v=`.
- **Tác dụng phụ**: `C1-BUILD-01` chạy `npm run build`, ghi đè ba file CSS đã commit (F-07).
- **Không ổn định**: số test bị hủy thay đổi giữa hai lần chạy. Lần 1 một test bị lỗi `C1-01` nhưng khi chạy riêng suite `challenger-m1` với thư mục tạm thì 16/17 pass, chỉ `C1-06` fail (do `?v=`).
- **Không có CI**: `.github/workflows/` chỉ có build APK/IPA chạy tay. Không có job nào chạy test hoặc kiểm tra build.

### F-07 — `check:css` báo "stale" do lệch ký tự xuống dòng trên Windows [P1] — ĐÃ KIỂM CHỨNG
- `npm run check:css` thất bại: "bundle.min.css is stale", và tương tự với critical và landing.
- Thực tế: ba file CSS được build lại **khớp byte-for-byte** với blob trong git (ĐÃ KIỂM CHỨNG bằng `cmp`). Khác biệt duy nhất là ký tự xuống dòng ở cuối file trong working copy: `core.autocrlf=true` đã ghi CRLF khi checkout.
- `tools/build-css.mjs:106–108` so sánh chuỗi chính xác (`cur !== built`), nên bị lệch vì EOL.
- Ảnh hưởng: cổng kiểm tra CSS không tin cậy trên máy Windows. Trên môi trường LF (Linux/CI), kết quả này sẽ không xảy ra (suy luận từ cùng dữ liệu, chưa chạy trên Linux).

### F-08 — Người đăng ký đầu tiên trên DB rỗng thành admin [P1] — ĐÃ KIỂM CHỨNG
- `server.js:497–499`: nếu không đặt `ADMIN_USERNAME` và DB chưa có user, người đăng ký đầu tiên được cấp vai trò admin (ĐÃ KIỂM CHỨNG: tài khoản đầu tiên có `role: admin`).
- Ảnh hưởng: triển khai DB mới hoặc khôi phục DB rỗng mà không đặt `ADMIN_USERNAME` là mở cửa cho bất kỳ ai đăng ký trước.

### F-09 — Landing nạp 33 module JS cho khách [P2] — ĐÃ KIỂM CHỨNG (số liệu) / ĐỌC MÃ (nguyên nhân)
- Đo bằng Resource Timing trên landing: **33 file JS, khoảng 228 KB** (`encodedBodySize`), trong đó có module lớp học, gia đình, giáo viên, luyện nói, TTS.
- Nguyên nhân: `public/js/main.js` import tĩnh (dòng 15–21) các trang lẽ ra chỉ cần khi vào `/app/`.
- Chưa đo Lighthouse hay LCP.

### F-10 — Google Tag Manager và GA4 nạp cho khách, không có cơ chế đồng ý [P1] — ĐỌC MÃ + QUAN SÁT REQUEST
- Trang công khai nạp `googletagmanager.com/gtm.js` và gửi request tới `google-analytics.com/g/collect` ngay khi tải trang (ĐÃ QUAN SÁT).
- Không tìm thấy banner hay cơ chế đồng ý cookie trong `public/index.html` và `public/js/*.js`.
- Đây là rủi ro tuân thủ quyền riêng tư. Có cần đánh giá pháp lý (không phải kết luận pháp lý của báo cáo này).

### F-11 — Email khôi phục không cần xác minh, DB không chống trùng email [P2] — ĐÃ KIỂM CHỨNG
- ĐÃ KIỂM CHỨNG: `POST /api/profile/email` lưu địa chỉ bất kỳ (chỉ cần mật khẩu hiện tại), trạng thái `verified: false`.
- Đăng ký cũng nhận email không xác minh (`server.js:490–493`).
- Có giới hạn: 4 lần gửi mã/10 phút/tài khoản; 40 lần đăng ký/10 phút/IP. Vẫn cho phép tạo nhiều tài khoản gửi mail tới một địa chỉ (rủi ro spam, uy tín SMTP).
- `schema-pg.sql:673–684`: `users.email` không có `UNIQUE`; chống trùng chỉ nằm trong code. Có thể trùng do race.

### F-12 — `/api/stats` công khai lộ tên hiển thị kèm bình luận [P2] — ĐÃ KIỂM CHỨNG
- ĐÃ KIỂM CHỨNG: không cần đăng nhập, `GET /api/stats` trả về `name: "<tên hiển thị>"` cùng nội dung bình luận đánh giá. `server.js:627–630`, `ratingSummary` tại `:255–260`.
- Tên hiển thị do admin đặt, có thể là họ tên thật.

### F-13 — Đăng xuất không yêu cầu CSRF token [P3] — ĐÃ KIỂM CHỨNG
- ĐÃ KIỂM CHỨNG: `POST /api/logout` trả 200 không có header CSRF (`server.js:553–558`). Hậu quả chỉ là đăng xuất người dùng, mức thấp.

### F-14 — CSP cho phép toàn bộ npm qua jsDelivr [P2] — ĐỌC MÃ
- `server.js:1322`: `script-src 'self' https://www.googletagmanager.com https://cdn.jsdelivr.net 'wasm-unsafe-eval'`. jsDelivr phục vụ mọi gói npm, nên allowlist này không chặn được script bên thứ ba tùy ý.
- Điểm tốt đã kiểm chứng: `script-src` không có `'unsafe-inline'`; có nonce; `object-src 'none'`; `frame-ancestors 'none'`.

### F-15 — Route chấm phát âm Gemini không kiểm tra gói Pro và quota [P2] — ĐỌC MÃ
- `modules/speaking.js:531–570`: `/api/lang/speak/assess` không gọi `locked()`, không gọi `quotaStatus`, chỉ giới hạn 40 lượt/ngày/người (`ASSESS_DAILY`) và trần ngân sách tháng (`monthlyBudgetMicro`).
- Ảnh hưởng: học viên miễn phí dùng được chấm phát âm AI ngoài hạn mức gói. Chi phí bị chặn bởi trần tháng (mặc định 10 USD).

### F-16 — Giới hạn tốc độ và bộ đếm TTS nằm trong bộ nhớ tiến trình [P2] — ĐỌC MÃ
- `server.js:272–282` (`buckets`), `modules/tts.js` (`counters`): reset khi khởi động lại (PM2 restart, deploy), không chia sẻ giữa nhiều tiến trình.
- `ecosystem.config.example.cjs` chạy `instances: 1`, nên hiện tại chấp nhận được. Khi scale phải chuyển sang Redis hoặc DB.

### F-17 — Một số endpoint quản trị đọc toàn bộ bảng [P2] — ĐỌC MÃ
- `/api/admin/overview` (`server.js:951–980`) đọc toàn bộ `users`, `custom_exercises` và đếm sessions; `/api/admin/users` lấy mọi user rồi lọc trong JS (`server.js:1004–1035`). Chi phí tăng tuyến tính theo số người dùng. Chưa đo tải.

### F-18 — Phục vụ file tĩnh đọc đồng bộ và băm lại mỗi request [P2] — ĐỌC MÃ
- `server.js:1412–1417`: `fs.readFileSync` (đồng bộ) cho mọi file; `:1479`: băm SHA-256 toàn bộ nội dung mỗi request để tính ETag. Nên cache theo mtime.

### F-19 — `/api/visit` không giới hạn tốc độ [P3] — ĐỌC MÃ
- `server.js:621–626`: mỗi POST tăng bộ đếm `visits`. Có thể làm sai số thống kê.

### F-20 — Username phân biệt hoa thường ở DB, không ở code [P3] — ĐỌC MÃ
- `schema-pg.sql:675`: `username TEXT UNIQUE` (phân biệt hoa thường). Code kiểm tra `LOWER(username)`. Hai đăng ký đồng thời có thể tạo `Abc` và `abc`.

### F-21 — Tài liệu, phiên bản và file rác không khớp mã nguồn [P2/P3] — ĐÃ KIỂM CHỨNG
- `README.md` ghi 5 ngôn ngữ (thiếu Tây Ban Nha).
- `PROJECT.md` mô tả landing 8 mục và môn lập trình (`Python, C, C++, Java`) là bình thường. Không còn đúng.
- `BAO-CAO-KIEM-TOAN.md` ở gốc mô tả phiên bản "Python Lab v2.3.0", dùng SQLite và nói "không phải Git repository" và "không có AI Tutor". Không còn đúng; nên lưu trữ hoặc đánh dấu lỗi thời.
- `docs/`: 72 file, nhiều báo cáo phát hành cũ (`RELEASE_4.1.x`, `JUDGE_*`, `AUDIT_*`).
- `VERSION = "1.0.1"` (server) và `"version": "5.1.3"` (package.json) không đồng nhất.
- 14 file **rỗng (0 byte) được commit**: `5e7f6189e0f3`, `Using`, `d2dcb405fddf`, `f6b778a4f79e`, `node`, `start_judge`, `start_judge-worker` ở gốc và cả trong `archive/`. Có vẻ là kết quả của lệnh shell bị lỗi.
- Comment cũ: `modules/speaking.js` ghi "Chấm phát âm (Azure)" nhưng mã dùng Gemini; `modules/zalo-pay.js:35` đặt User-Agent `CongHocTap-ZaloPay/1.0` (tên sản phẩm cũ).

### F-22 — Chính sách mật khẩu tối thiểu [P3] — ĐỌC MÃ
- `server.js:486`, `:762`, `:826`: chỉ kiểm tra độ dài 6–128 ký tự. Không chặn mật khẩu yếu phổ biến.

### F-23 — Xác nhận Zalo: secret có thể đi trong body; kiểm tra admin tùy chọn [P2] — ĐỌC MÃ
- `modules/api.js:302`: chấp nhận `b.secret` trong body (dễ bị ghi lại bởi proxy/log), không chỉ header `x-pl-secret`.
- `modules/api.js:303`: kiểm tra `zaloAdminId` chỉ khi request có trường `from`. Nếu thiếu `from`, mọi người giữ secret đều xác nhận được đơn. Secret là rào chắn duy nhất.

### Điểm đã kiểm tra và đạt (không phải lỗi)
- **Phân quyền**: học viên → `/api/admin/*` trả 403 (users, backup, settings, system); IDOR lớp học trả 404 (detail, members, report); trang quản trị và giáo viên hiện thông báo chặn cho học viên.
- **CSRF**: mọi route ghi qua cookie có kiểm tra `X-CSRF-Token` (ĐÃ KIỂM CHỨNG: 403 khi thiếu). Các module (`languages`, `toeic`, `speaking`, `classroom`, `tts`, `pet`, `giftcodes`, `emailverify`) đều có `requireCsrf`.
- **Ẩn đáp án**: `publicExercise` không gửi trường đáp án (ĐÃ KIỂM CHỨNG: không có khóa `answer`/`correct`/`ans` trong JSON bài tập).
- **Webhook SePay**: fail-closed khi chưa cấu hình (ĐÃ KIỂM CHỨNG: 401); HMAC-SHA256 có timestamp (lệch tối đa 300 giây); idempotent theo `(provider, provider_txn_id)` có UNIQUE trong schema; giá lấy từ DB, không từ client; chỉ chấp nhận chuyển vào đúng tài khoản nhận và chiều "in".
- **Secret cấu hình**: mã hóa AES-256-GCM (ĐÃ KIỂM CHỨNG: định dạng `iv.tag.ct`); chỉ trả về 4 ký tự cuối (`sysconfig.js:90`); đổi secret bắt buộc nhập lại mật khẩu admin (ĐÃ KIỂM CHỨNG qua luồng cài secret SePay).
- **Đường dẫn và file tĩnh**: `../`, `%2e%2e`, `/data/app.db`, `/secret.key`, `/.env`, `/package.json`, `/server.js`, `/schema-pg.sql` đều không lộ nội dung (ĐÃ KIỂM CHỨNG: trả về trang chủ, không phải tệp).
- **Metrics**: `/internal/metrics` trả 404 khi không có `METRICS_TOKEN` (ĐÃ KIỂM CHỨNG).
- **CORS**: chỉ chấp nhận origin của ứng dụng native (ĐÃ KIỂM CHỨNG: origin lạ không nhận `Access-Control-Allow-Origin`).
- **Headers**: CSP có mặt; `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` có trong mã (`server.js:1334–1339`). HSTS chỉ bật khi HTTPS.
- **Cookie**: `HttpOnly; Path=/; SameSite=Lax`, thêm `Secure` khi HTTPS (ĐÃ KIỂM CHỨNG).
- **Mật khẩu**: `scrypt` 64 byte, salt 16 byte, so sánh bằng `timingSafeEqual`.
- **AI**: khóa đọc từ biến môi trường hoặc Admin, gửi qua header `x-goog-api-key` (không qua URL); có trần USD/tháng, hạn mức theo gói, giới hạn tốc độ 6/phút/tài khoản và 20/phút/IP; lỗi trả về câu chung chung (ĐỌC MÃ `modules/ai.js`, `modules/api.js`).
- **Nội dung AI trên trình duyệt**: `mdLite` gọi `esc()` trước khi thêm markup (`public/js/pro.js:14`), nên không có XSS qua đường này.
- **Chuỗi bí mật trong repo**: không tìm thấy khóa thật. Hai chuỗi dạng `AIza…` trong `tests/e2e/tier2.mjs:1469` và `tier3.mjs:442` dài 34 ký tự (khóa Gemini thật dài 39) và có chữ "test" hoặc "dummy". Vẫn nên gỡ khỏi repo.
- **Phụ thuộc**: `npm audit --omit=dev`: 0 lỗ hổng (35 gói production, 96 gói dev).
- **`.gitignore`** loại trừ `data/`, `.env`, `ecosystem.config.cjs`. Không có `.env` nào được theo dõi.

---

## 5. Module cũ hoặc không còn sử dụng

Phương pháp: đồ thị import từ `server.js` (125 file JS/MJS phía server, 30 file không tới được) và từ `public/js` entry points (55 file, 6 file không tới được). Đây là danh sách **đề xuất**, chưa xóa. Theo yêu cầu, không xóa khi chưa kiểm tra dependency, API, DB và luồng vận hành.

### 5.1 Stack lập trình Python/C/C++/Java (không còn trong runtime)
| File | Bằng chứng | Ghi chú |
|---|---|---|
| `interpreter.js`, `judge-service.js`, `judge-queue.js`, `judge-worker.js`, `run-pool.js`, `run-worker.js` | Không được `server.js` tới được | Hàng đợi judge, dùng Redis (`docker-compose.redis.yml`, container `pythonlab-redis`) |
| `runner/index.js`, `runner/py-runner.js`, `runner/py-errors.js`, `runner/harness.py`, `runner/Dockerfile`, `runner/cc/*` | Không tới được | Runner Python trong Docker |
| `modules/code-runner.js`, `modules/codecourses.js` | Không tới được | Khóa C/C++/Java; route `/api/code/*` không được mount (404) |
| `content/code/*` (problems, theory, sol-c, sol-cpp, sol-java, expected.json) | Không tới được | Nội dung khóa lập trình |
| `curriculum.js`, `lessons.js`, `en-content.js`, `content/py-hidden-chapter.js` | Không tới được | Nội dung Python cũ |
| `modules/content-i18n.js` | Không tới được | Chỉ import nội dung Python/EN cũ |
| `tools/check-content-python.mjs`, `tools/check-lessons-python.mjs`, `tools/build-code-expected.mjs`, `tools/smoke-test-judge.mjs`, `tools/health-judge-queue.mjs` | Chỉ tools | Phụ thuộc các module trên; sửa hoặc bỏ cùng lúc |
| `start_judge`, `start_judge-worker` (rỗng) | 0 byte | Xem 5.4 |
| `public/js/code.js`, `public/js/editor.js` | Client không tới được | Trang C/C++/Java và trình soạn Python; gọi `/api/code/*` (404) |

Ghi chú về dữ liệu: DB đã có migration gỡ cột lập trình, nhưng dữ liệu người học cũ (nếu có) cần được xác định trước khi xóa mã. Ngoài ra `db/migrations.js` vẫn chứa các migration tạo bảng cũ.

### 5.2 Module không được import
| File | Ghi chú |
|---|---|
| `modules/export.js` | `toCsv` không ai gọi |
| `modules/learning.js` | Helper chẩn đoán dựa trên `chapters` (nội dung Python) |
| `db/serial-write.js` | Helper không dùng |

### 5.3 Module client không tới được từ entry point
`public/js/assignments.js` (bài tập bản Python Lab), `classes.js`, `code.js`, `editor.js`, `licenses.js`, `rive-companion.js`. Lưu ý `licenses.js` có vẻ là giao diện giấy phép giáo viên: cần kiểm tra xem có route nào còn cần không trước khi xóa.

### 5.4 Script và file rỗng
- Script chạy tay ở gốc: `test-38-interactions.mjs`, `test-tts-model.mjs`, `upload-logo-webp.mjs`, `warm-tts-cache.mjs`. Nên chuyển vào `tools/` hoặc ghi rõ mục đích.
- 14 file rỗng (0 byte) được commit (F-21). Có thể xóa sau khi xác nhận.
- `archive/` (12 file trong `legacy-public/` và 7 file rỗng): không được phục vụ, không cần cho runtime. Nên giữ nếu cần lưu vết, hoặc xóa khỏi nhánh chính.
- `public/app.js`: không có tham chiếu từ HTML/JS hiện hành.

### 5.5 Bảng DB không còn code tham chiếu
Không có câu SQL nào trong code sống đọc/ghi các bảng sau (chỉ còn trong `schema-pg.sql`): `run_cache`, `exam_attempts`, `exam_settings`, `exercise_progress`, `user_progress`, `lesson_progress`, `lesson_practice`, `submissions`. Các bảng `*_legacy_20261030` (`assignments_legacy_…`, `assignment_submissions_legacy_…`, `assignment_targets_legacy_…`, `content_translations_legacy_…`) cũng là bảng giữ lại từ migration. Trước khi xóa cần xác nhận migration nào sinh ra và có dữ liệu không.

### 5.6 Ảnh hưởng tới test và tooling
`tests/` và `tools/` vẫn tham chiếu mã lập trình (ví dụ `tests/helpers`, `tools/check-*-python.mjs`). Xóa mã cần sửa đồng thời các script này, nếu không `npm test` và các script kiểm tra sẽ gãy.

---

## 6. Đánh giá bảo mật

| Hạng mục | Trạng thái | Nhận xét |
|---|---|---|
| Xác thực | PARTIAL | Đăng nhập có chống dò, hash scrypt, cookie đúng chuẩn. Nhưng token đặt lại bị lộ (F-02). |
| Phiên | PARTIAL | Phiên 30 ngày (`sessionDays`), thu hồi khi đổi mật khẩu/khóa tài khoản. Backup chứa phiên (F-03). |
| Phân quyền | PASS | 403 và 404 đúng ở các route kiểm tra; quyền dựa trên server. |
| CSRF | PASS | Mọi route ghi cookie có kiểm tra; ngoại lệ logout (F-13). |
| IDOR | PASS | Kiểm tra lớp học, bài nộp, tiến độ trong mã và qua test. |
| Injection | PASS (đọc mã) | Truy vấn tham số hóa (`?`); tên bảng động trong `dbinfo` cố định. Nội dung AI qua `esc()`. |
| XSS | PASS (đọc mã) | `esc()` trong SSR, SEO, `mdLite`. Chưa rà toàn bộ 331 chỗ `innerHTML` (chỉ mẫu). |
| Upload | PASS (đọc mã) | Chỉ logo; kiểm tra magic bytes PNG/JPEG/WebP; tối đa 512 KB; từ chối SVG. |
| Secret | PASS | AES-256-GCM, khóa riêng, không trả về trình duyệt. |
| Webhook | PASS | Fail-closed; HMAC; timestamp; idempotent (đã chạy 10/10). |
| Rate limit | PARTIAL | Có nhiều điểm; lưu trong bộ nhớ (F-16); `/api/visit` không có (F-19). |
| CSP và headers | PARTIAL | CSP tốt không có unsafe-inline; jsDelivr quá rộng (F-14). |
| CORS | PASS | Chỉ origin native. |
| Đường dẫn file | PASS | Không lộ tệp ngoài `public/`. |
| Metrics | PASS | Cần token ≥ 24 ký tự; 404 khi không cấu hình. |
| Log | FAIL | Ghi token đặt lại (F-02). |
| Riêng tư | PARTIAL | GA/GTM không có đồng ý (F-10); `/api/stats` lộ tên (F-12); email không xác minh (F-11). |
| Phụ thuộc | PASS | `npm audit`: 0 lỗ hổng. |
| Bí mật trong repo | PASS | Không có khóa thật; chuỗi giả trong test nên gỡ. |

---

## 7. Đánh giá trải nghiệm người dùng

Quan sát trên trình duyệt (375px và desktop, tài khoản học viên và admin):

- **Landing mobile**: rõ ràng, màu ấm nhất quán, khối "Chơi thử 30 giây không cần đăng ký" hoạt động, không cuộn ngang trang. Thanh điều hướng dưới (bottom nav) dễ dùng.
- **Header mobile**: tràn 29px, nút menu bị cắt (F-05).
- **Sau đăng nhập lần đầu**: học viên mới gặp màn hình lỗi (F-01). Đây là điểm trải nghiệm tệ nhất trong toàn bộ luồng.
- **Lộ trình, khóa học, luyện nói, TOEIC, bảng giá**: render đúng ở 375px.
- **Chặn quyền**: học viên mở `/app/quan-tri` và `/app/giao-vien` thấy thông báo rõ ràng.
- **Quản trị**: nhóm chức năng rõ (Tổng quan, Người dùng, Nội dung, Kinh doanh, Hệ thống).
- **Thông điệp lỗi**: đa số thông báo bằng tiếng Việt, có hướng dẫn hành động (ví dụ "Hãy thêm email khôi phục trước").
- **Hiệu năng cảm nhận**: landing tải nhiều module (F-09), có thể chậm trên mạng yếu.
- **Chưa kiểm tra**: tablet (768px), dark mode, khả năng tiếp cận (axe/Lighthouse), bàn phím, PWA offline.

---

## 8. Điểm số tổng thể

Thang 10. Trung bình đơn giản 12 hạng mục: **(6+7+6+6+6+6+6+8+5+5+6+3) / 12 = 5.8**.

| Hạng mục | Điểm | Trạng thái | Mức nghiêm trọng | Căn cứ |
|---|---|---|---|---|
| Frontend | 6 | PARTIAL | P0 | UI đồng nhất, landing mobile tốt, nhiều trang chạy. Trừ: F-01 (P0), F-05 (header tràn), F-09 (eager JS). |
| Backend | 7 | PARTIAL | P0 | Router rõ, phân quyền/CSRF/IDOR đã kiểm, webhook chuẩn. Trừ: F-02, F-03; nhiều module chết. |
| Database | 6 | PARTIAL | P1 | Ràng buộc tốt cho thanh toán (UNIQUE, FK cascade). Trừ: hai engine, bảng legacy, email không UNIQUE, backup chứa phiên. |
| Học tập | 6 | PARTIAL | P1 | 6 ngôn ngữ, 2.792 bài, chấm phía máy chủ. Trừ: F-04 (sao khai khống), F-01 chặn học viên mới. |
| AI | 6 | NOT VERIFIED (đọc mã: PARTIAL) | P2 | Trần chi phí, hạn mức, rate limit, khóa không lộ. Trừ: không chạy được; F-15 (chấm phát âm không kiểm gói). |
| Tài khoản | 6 | PARTIAL | P0 | Chống dò, scrypt, OTP. Trừ: F-02 (P0), F-11, F-13. |
| LMS | 6 | PARTIAL | P2 | IDOR đã kiểm. Trừ: luồng giáo viên end-to-end chưa chạy; không có kịch bản test đầy đủ. |
| Thanh toán | 8 | PASS | P2 | Webhook đạt 10/10. Trừ: thanh toán chủ yếu thủ công; Zalo chưa kiểm chứng; F-23. |
| Bảo mật | 5 | PARTIAL | P0 | Nhiều kiểm soát đúng. Trừ: F-02, F-03, F-10, F-14, F-12. |
| Hiệu năng | 5 | NOT VERIFIED | P2 | Đo được 33 module/228 KB. Trừ: F-17, F-18; chưa đo tải. |
| Mobile | 6 | PARTIAL | P1 | Landing 375px tốt, nhưng header tràn (F-05). Ứng dụng native chưa build. |
| Production | 3 | FAIL | P0 | Ba P0; test không đáng tin; check CSS sai; không có CI. |

---

## 9. Danh sách công việc theo ưu tiên

Mỗi việc có: vấn đề, file/module, nguyên nhân, giải pháp, tiêu chí nghiệm thu, kiểm thử. Các việc P2/P3 ghi gọn.

### P0 — Nghiêm trọng (chặn phát hành)

**P0-1 — Sửa Tổng quan cho học viên chưa chọn môn (F-01)**
- File: `public/js/home.js:721, 791, 843, 846`; `public/js/main.js:203`.
- Nguyên nhân: commit `c6cadf7` xóa `#lhExplore` nhưng không cập nhật chỗ dùng.
- Giải pháp: (a) trong `drawExplore`, bỏ qua khi `exBox` là `null`, hoặc render lại `#lhExplore` khi không có môn; (b) sau đăng nhập, nếu không có môn thì vào `/app/chon-mon` đúng như chú thích; (c) sửa `root.querySelectorAll` để không xóa `#lhExplore` ở nhánh không có môn.
- Nghiệm thu: tài khoản mới đăng nhập lần đầu không có lỗi trong console; vào được chọn môn hoặc Tổng quan; học viên đã chọn môn không đổi hành vi.
- Kiểm thử: E2E "đăng ký mới → đăng nhập → thấy chọn môn" ở 375px và desktop; kiểm tra console không có `TypeError`.

**P0-2 — Ngừng ghi token đặt lại và băm token trong DB (F-02)**
- File: `server.js:679–683` (lưu), `:701` (log), `:704–714` (webhook), `:711–712` (link trong payload).
- Giải pháp: xóa dòng log chứa token; lưu `sha256(token)` thay vì token thô; webhook chỉ gửi thông báo "có yêu cầu đặt lại" (không kèm token); với nhánh không có email, admin đặt lại mật khẩu qua Admin (đã có `reset-password`). Cần làm sạch log cũ đã chứa token.
- Nghiệm thu: không còn token trong log khi chạy forgot; DB không lưu token thô; đặt lại mật khẩu vẫn hoạt động qua link và OTP.
- Kiểm thử: `tests/password-otp.test.mjs` cập nhật; thêm kiểm tra "log không chứa chuỗi token"; live check như mục 4.

**P0-3 — Loại phiên và hash mật khẩu khỏi file backup (F-03)**
- File: `server.js:1225–1232`.
- Giải pháp: khi backup SQLite, dùng `VACUUM INTO` rồi xóa bảng `sessions` trong bản sao (hoặc `DELETE FROM sessions` trên bản sao); cân nhắc xóa hash mật khẩu trong bản backup (khi đó khôi phục xong buộc đặt lại mật khẩu). Ghi nhật ký audit cho thao tác backup. Với PG, dùng `pg_dump --exclude-table=sessions`.
- Nghiệm thu: file tải về không chứa bảng `sessions` có dữ liệu; vẫn khôi phục được.
- Kiểm thử: lặp lại kiểm tra backup như mục 4 (đếm `sessions` = 0).

### P1 — Quan trọng

**P1-1 — Chấm phát âm không tin văn bản từ client (F-04)**
- File: `modules/speaking.js:452–483` (`/score`), `public/js/speak.js:1211`.
- Giải pháp: hoặc (a) chỉ cộng sao/XP khi điểm đến từ `/assess` có âm thanh; hoặc (b) gắn nhãn "tự đánh giá", không cộng sao; (c) giới hạn số lần cộng sao/ngày cho `/score`. Quyết định sản phẩm cần người dùng xác nhận (xem mục 12).
- Nghiệm thu: gửi `heard` = câu mẫu không tạo thêm sao/XP (theo lựa chọn đã chốt).
- Kiểm thử: live check như mục 4 + unit test cho `awardExercise`.

**P1-2 — Header landing tràn trên 375px (F-05)**
- Giải pháp: xác định selector header (landing CSS), giảm khoảng cách/ẩn nhãn phụ ở ≤ 400px; đảm bảo nút menu nằm trong viewport.
- Nghiệm thu: `scrollWidth` ≤ `clientWidth` ở 360, 375, 390px; nút menu nhấn được.
- Kiểm thử: `tools/mobile-layout-check.mjs` (đã có trong repo) mở rộng; chụp màn hình 360/375/390.

**P1-3 — Làm bộ test đáng tin và không ghi vào repo (F-06)**
- File: `tests/helpers/test-server.mjs:66` (mặc định `DATA_DIR`); `tests/e2e/server-seed.mjs` (kiểm tra an toàn); `tests/challenger-*.test.mjs` (kỳ vọng cũ); `tests/e2e-tier4-scenarios.test.mjs` (route hash); `tests/daily-missions.test.mjs` (shape cũ); `C1-BUILD-01` (đừng chạy `npm run build` ghi file).
- Giải pháp: mặc định `DATA_DIR` = `os.tmpdir()/mkdtemp`; cập nhật hoặc gỡ test landing cũ; sửa test route và shape; `C1-BUILD-01` dùng bản build ra thư mục tạm; đảm bảo mỗi suite tự khởi động server riêng và chờ xong.
- Nghiệm thu: `npm test` xanh trên máy sạch (Windows và Linux), hai lần liên tiếp cho cùng kết quả; không có thay đổi trong `git status` sau khi chạy test.
- Kiểm thử: chạy `npm test` hai lần, so sánh kết quả; kiểm tra `git status`.

**P1-4 — Sửa kiểm tra CSS trên Windows (F-07)**
- File: `tools/build-css.mjs:106–108`, `tools/build-critical-css.mjs`, `tools/build-landing-css.mjs`; `.gitattributes` (chưa có).
- Giải pháp: thêm `.gitattributes` với `*.min.css text eol=lf` (hoặc `* text=auto eol=lf` cho file build), hoặc so sánh sau khi chuẩn hóa EOL trong script `--check`.
- Nghiệm thu: `npm run check:css` đạt trên Windows và Linux.
- Kiểm thử: chạy `check:css` và `check:js` trên hai hệ điều hành (hoặc CI).

**P1-5 — Khóa bootstrap admin (F-08)**
- File: `server.js:497–499`.
- Giải pháp: khi DB rỗng và không có `ADMIN_USERNAME`, không tự cấp admin cho người đăng ký đầu tiên; in cảnh báo rõ ràng, hoặc dùng `tools/promote-admin.js` sau khi tạo tài khoản.
- Nghiệm thu: DB mới không có `ADMIN_USERNAME` không tạo admin qua đăng ký công khai.
- Kiểm thử: test đăng ký trên DB rỗng.

**P1-6 — Quyết định về analytics và đồng ý cookie (F-10)**
- Giải pháp: (a) chỉ nạp GTM/GA sau khi đồng ý (consent mode), hoặc (b) bỏ, hoặc (c) chuyển sang analytics tự lưu không cookie (dùng `funnel_events` đã có). Cần người phụ trách pháp lý quyết định.
- Nghiệm thu: không có request tới `google-analytics.com` trước khi đồng ý.
- Kiểm thử: quan sát `read_network_requests` lần tải đầu.

### P2 — Cải thiện

| ID | Việc | File | Nghiệm thu | Kiểm thử |
|---|---|---|---|---|
| P2-1 | Xác minh email trước khi dùng cho OTP; cooldown theo địa chỉ; thêm `UNIQUE` cho email (lower) ở PG và SQLite (F-11) | `server.js:490–493`, `modules/emailverify.js`, `schema-pg.sql:673` | Không gửi mail tới địa chỉ chưa xác minh (trừ đăng ký); DB từ chối email trùng | Test đăng ký và hồ sơ |
| P2-2 | `/api/stats` chỉ trả bình luận đã duyệt, tên rút gọn (F-12) | `server.js:255–260`, `:627–630` | Không lộ họ tên đầy đủ công khai | Live check |
| P2-3 | Giới hạn gói cho chấm phát âm (`/assess`): kiểm `locked`/`quota` (F-15) | `modules/speaking.js:531–570` | Học viên miễn phí không vượt hạn mức | Test API |
| P2-4 | Thu hẹp CSP (jsDelivr) hoặc tự host thư viện Rive (F-14) | `server.js:1322` | Không còn `cdn.jsdelivr.net` trong `script-src` | Kiểm tra header |
| P2-5 | Giảm JS landing: tách module lớp học, gia đình, giáo viên khỏi `main.js` (F-09) | `public/js/main.js:15–21` | Landing ≤ mục tiêu (đo trước và sau); không lỗi tải | Lighthouse, Resource Timing |
| P2-6 | Cache file tĩnh theo mtime; bỏ `readFileSync` và băm mỗi request (F-18) | `server.js:1412–1497` | Không đọc đồng bộ mỗi request | Đo CPU |
| P2-7 | Admin: phân trang ở SQL thay vì tải toàn bộ (F-17) | `server.js:951–1035` | Thời gian phản hồi không tăng tuyến tính theo user | Load test nhỏ |
| P2-8 | Giới hạn tốc độ và bộ đếm TTS bền vững (Redis hoặc DB) khi scale (F-16) | `server.js:272–282`, `modules/tts.js` | Giữ giới hạn sau restart | Test restart |
| P2-9 | Dọn module, bảng, nội dung lập trình cũ (mục 5) — **chỉ sau khi xác nhận dependency và dữ liệu** | Mục 5 | Test và build xanh sau khi xóa; không mất dữ liệu người học | Test toàn bộ |
| P2-10 | Đồng nhất phiên bản, cập nhật README (5 → 6 ngôn ngữ), PROJECT.md và báo cáo cũ (F-21) | `README.md`, `PROJECT.md`, `BAO-CAO-KIEM-TOAN.md`, `server.js:41` | Một nguồn phiên bản; tài liệu khớp mã | Rà soát |
| P2-11 | Zalo: chỉ nhận secret qua header; bắt buộc kiểm tra admin id (F-23) | `modules/api.js:302–303` | Request không có `from` bị từ chối | Live check |

### P3 — Phát triển sau và việc nhỏ
- Xóa 14 file rỗng và chuyển `archive/` ra khỏi nhánh chính (F-21).
- Rate limit `/api/visit` (F-19); chuẩn hóa username phân biệt hoa thường ở DB (F-20).
- Đăng xuất yêu cầu CSRF (F-13); chính sách mật khẩu mạnh hơn (F-22).
- Gỡ chuỗi `AIza…` giả khỏi tests/e2e và tools (F-21).
- Sửa comment cũ ("Azure", User-Agent `CongHocTap`).
- Tính năng nâng cao: chấm phát âm có mô hình âm học riêng, cá nhân hóa lộ trình, bảng phân tích học tập cho giáo viên.

---

## 10. Kết luận: đã đủ điều kiện production chưa?

**Chưa.** Lý do:
1. Ba lỗi P0 đã được tái hiện: trang chính lỗi với người dùng mới (F-01), token đặt lại bị lộ (F-02), backup chứa phiên (F-03).
2. Cổng chất lượng không đáng tin: test không ổn định, ghi vào repo, check CSS báo sai trên Windows, không có CI.
3. Chưa kiểm chứng được AI, email, Zalo, PostgreSQL và ứng dụng native, là các phần có thể quan trọng với vận hành thực tế.

Điều kiện tối thiểu để phát hành: P0-1, P0-2, P0-3 đã sửa và kiểm chứng lại bằng cùng bộ kiểm tra live; P1-3 và P1-4 để có cổng test đáng tin; P1-5 để tránh chiếm quyền admin khi triển khai mới. Sau đó có thể phát hành staging để kiểm chứng AI, email, Zalo và PG.

---

## 11. Phương pháp tái tạo

Các lệnh đã chạy (từ thư mục worktree):
```
npm ci
npm run check:js
npm run verify:lang
npm run check:css            # thất bại do EOL (F-07)
npm test                     # hai lần, xem F-06
DATA_DIR=<tmp> PORT=8095 node server.js
node <tmp>/live-audit.mjs    # 30 kiểm tra
node <tmp>/live-audit-2.mjs  # 13 kiểm tra
node <tmp>/live-payment.mjs  # 10 kiểm tra
```
Các script kiểm tra nằm trong thư mục scratchpad của phiên, không đưa vào repo. Dữ liệu thử nghiệm chỉ nằm trong DB tạm, đã được dừng sau khi kiểm tra.

---

## 12. Kế hoạch sửa chữa đề xuất (chưa thực hiện)

Thứ tự đề xuất, lý do và phụ thuộc:

1. **Đợt 0 — chặn phát hành (P0-1, P0-2, P0-3)**. Thay đổi nhỏ, tập trung ở 3 vị trí. Sửa xong chạy lại đúng các kiểm tra live đã nêu.
2. **Đợt 1 — làm cổng kiểm tra đáng tin (P1-3, P1-4)**. Làm trước các đợt sau để việc sửa tiếp theo được kiểm chứng đúng.
3. **Đợt 2 — bảo mật và vận hành (P1-5, P1-6, P1-1)**. P1-6 cần quyết định pháp lý; P1-1 cần quyết định sản phẩm.
4. **Đợt 3 — giao diện và hiệu năng (P1-2, P2-5, P2-6)**.
5. **Đợt 4 — nghiệp vụ và dữ liệu (P2-1, P2-2, P2-3, P2-7, P2-8, P2-11)**.
6. **Đợt 5 — dọn dẹp (P2-9, P2-10, P3)**. Chỉ làm sau khi xác nhận dữ liệu và dependency, và được người dùng đồng ý từng nhóm xóa.

Quyết định cần người dùng xác nhận trước khi làm:
- Có duyệt đợt 0 không (chỉ sửa ba vị trí đã nêu, chưa commit).
- Chấm phát âm `/score`: giữ cộng sao hay chỉ hiển thị điểm tự đánh giá (P1-1).
- Analytics: nạp sau đồng ý, bỏ, hay tự lưu (P1-6).
- Xóa stack lập trình cũ: khi nào, và có cần giữ dữ liệu học của người dùng cũ không (P2-9).

---

## Phụ lục A — Kết quả kiểm tra chạy thật

| Nhóm | Kết quả |
|---|---|
| `check:js` | Đạt (55 file) |
| `verify:lang` | Đạt (6 khóa, 2.792 bài, không lỗi) |
| `check:css` | Thất bại (EOL, F-07); nội dung khớp build |
| `npm test` lần 1 (mặc định) | 119 pass / 6 fail / 41 cancelled |
| `npm test` lần 2 (`DATA_DIR` tạm) | 79 pass / 5 fail / 82 cancelled |
| `challenger-m1` riêng (`DATA_DIR` tạm) | 16/17 pass (fail: C1-06, `?v=`) |
| `npm audit --omit=dev` | 0 lỗ hổng |
| Live: API và bảo mật (30 kiểm tra) | 29 pass / 1 fail do lỗi script (route khóa học), đã xác định |
| Live: học viên và phân quyền (13 kiểm tra) | 13/13 pass |
| Live: thanh toán SePay (10 kiểm tra) | 10/10 pass |
| Trình duyệt: landing 375px | Đạt; header tràn (F-05) |
| Trình duyệt: học viên mới | Lỗi (F-01) |
| Trình duyệt: học viên có môn, lộ trình, luyện nói, TOEIC, bảng giá | Hiển thị đúng |
| Trình duyệt: quản trị và giáo viên (quyền học viên) | Chặn đúng |

## Phụ lục B — Dọn dẹp đã làm trong phiên kiểm toán

- Xóa thư mục `data/` trong repo do lần chạy `npm test` đầu tiên tạo ra (không có trong repo gốc, nằm trong `.gitignore`).
- Khôi phục ba file CSS đã bị test ghi đè về đúng nội dung HEAD. Cây làm việc hiện sạch (`git status` rỗng).
- Dừng server thử nghiệm trên cổng 8095.

## Phụ lục C — Kết quả đợt 0 (cập nhật sau khi người dùng duyệt)

Thay đổi (chưa commit):

| ID | File | Thay đổi | Kiểm chứng |
|---|---|---|---|
| P0-1 | `public/js/home.js` (`drawExplore`) | Thêm chốt `if (!exBox) return;` có chú thích. Chạy `node tools/build-js.mjs` để tạo lại `public/js/home.min.js` (trình duyệt chạy file này, không chạy `home.js`). | Học viên mới đăng ký → đăng nhập → Tổng quan hiện khối "Chọn ngoại ngữ để bắt đầu", không còn thông báo lỗi. Đã xem ở 375px và desktop. |
| P0-2 | `server.js` (`/api/password/forgot`, `/api/password/reset`) | Lưu SHA-256 của token trong `password_resets`; bỏ token khỏi log; webhook đổi kind thành `password_reset_requested` và không còn token; bỏ `resetTokenHint` khỏi thông báo; route reset tra cứu và đánh dấu đã dùng bằng hash. | 12/12 kiểm tra (xem dưới). |
| P0-3 | `server.js` (`/api/admin/backup`) | SQLite: trên bản sao `VACUUM INTO`, chạy `DELETE FROM sessions` với `secure_delete` rồi `VACUUM`. PG: thêm `--exclude-table-data=sessions` cho `pg_dump`. | File tải về có 0 phiên; phiên đang hoạt động trên server không đổi (12 → 12). |

Kiểm thử đã chạy (đều dùng `DATA_DIR` tạm):
- Kiểm tra P0-2/P0-3 trên server thật (12 kiểm tra): token không xuất hiện trong log; webhook không chứa token; DB chỉ lưu digest (độ dài 64); token đặt lại thành công một lần; đăng nhập bằng mật khẩu mới được, mật khẩu cũ bị từ chối; backup không có phiên.
- Trình duyệt (P0-1): tài khoản mới, Tổng quan render đúng.
- `password-otp`, `smoke`, `emailverify`, `giftcodes`, `security-push`: 27/27 pass.
- `api-business-audit`: PASS 7/7 (lần trước dừng vì lỗi an toàn workspace; khi `DATA_DIR` tạm thì chạy hết).
- Chưa chạy lại `npm test` đầy đủ: suite này ghi lại file CSS đã commit và có kết quả không ổn định (F-06, F-07). Các lỗi còn lại đã nêu ở mục 4.

Hệ quả cần biết khi triển khai:
1. Token reset đã phát hành trước đợt này (lưu thô) không còn dùng được. Chúng hết hạn sau tối đa 1 giờ.
2. Log cũ trên máy chủ vẫn chứa token đã ghi trước đây. Cần xóa hoặc xoay vòng log (thao tác vận hành, không tự động).
3. Webhook: kind đổi từ `password_reset_token` sang `password_reset_requested`; bên nhận không còn nhận token. Học viên không có email được hỗ trợ qua Quản trị → đặt lại mật khẩu.
4. Biến `ALLOW_RESET_TOKEN_IN_RESPONSE=1` đã dùng trong kiểm thử để lấy token; biến này làm trả `devToken` trong phản hồi và **không được đặt trên production**.
5. Backup vẫn chứa hash mật khẩu (có chủ ý, để khôi phục không bắt buộc đặt lại mật khẩu). Nếu muốn bỏ hash cần quyết định riêng.
6. Chưa thay đổi cấu hình thật nào; webhook được kiểm bằng máy nhận giả trên `127.0.0.1`.

## Phụ lục D — Kết quả đợt 1

| ID | Thay đổi | Kiểm chứng |
|---|---|---|
| P1-4 | `tools/build-css.mjs`, `build-critical-css.mjs`, `build-landing-css.mjs`, `build-js.mjs`: so sánh nội dung sau khi chuẩn hóa `\r\n` → `\n`. | `check:css` và `check:js` đạt trên Windows. Thử phủ định: thay đổi nội dung thật của `landing.min.css` vẫn làm check thất bại (đã khôi phục file). |
| P1-3 | `tests/helpers/test-server.mjs`: `DATA_DIR` mặc định là thư mục tạm; đặt `ALLOW_FIRST_USER_ADMIN=1` cho fixture (cùng `tests/e2e/server-seed.mjs`). `C1-BUILD-01` chạy các script `check:*` thay vì `npm run build` (không ghi file). Sửa kỳ vọng lỗi thời: og:image chấp nhận `?v=` (C1-06, T1-F19, tier3); shape `today` của daily-missions; tier4 chấp nhận `/app/ngoai-ngu/ja`. T1-F03 đánh dấu TODO có lý do (quyết định sản phẩm). | `npm test`: **165 pass / 0 fail / 1 todo**, thoát 0, không tạo `data/` trong repo, không đổi file build đã commit. Trước đó: 119/6/41 và 79/5/82. |
| P1-5 | `server.js`: người đăng ký đầu tiên chỉ thành admin khi `ALLOW_FIRST_USER_ADMIN=1`. Khi khởi động, cảnh báo nếu chưa có admin. `ecosystem.config.example.cjs` ghi chú hai biến. | DB mới không có biến: tài khoản đầu là học viên và có cảnh báo. Có biến: thành admin. |
| P1-2 | `public/css/landing-premium.css`: khối `@media (360–400px)` thu gọn header landing (không đổi hero). | Đo `scrollWidth`/`clientWidth` và nút menu: 360px: 360/360 (trước 367); 375px: 375/375 (trước 377, cuộn ngang 404 ở bản gốc); 390, 400, 414px vừa khít. `elementFromPoint` xác nhận nút menu và nút đăng nhập nhấn được. |

Chưa làm (còn mở):
- **P1-1** (chấm phát âm `/score` tin văn bản client) và **P1-6** (analytics và đồng ý cookie): cần quyết định sản phẩm và pháp lý.
- **P1-3** còn thiếu: chưa có CI chạy test; T1-F03 còn TODO chờ quyết định về thẻ môn trên landing.
- Triển khai: nếu môi trường dựa vào admin đầu tiên trên DB trống, phải đặt `ADMIN_USERNAME` trước khi đăng ký.

## Phụ lục E — Kết quả đợt 2 (CI, CSP Rive, cache file tĩnh)

| ID | Thay đổi | Kiểm chứng |
|---|---|---|
| P1-3 (phần còn lại) | `.github/workflows/ci.yml`: chạy trên Ubuntu và Windows (Node 22): `npm ci`, `check:css`, `check:js`, `verify:lang`, `npm test`. | YAML đã parse hợp lệ (2 hệ điều hành, 6 bước). **Chưa chạy trên GitHub Actions**: chỉ kiểm tra cú pháp và chạy đủ các lệnh trên Windows. |
| P2-4 | `server.js` CSP: `script-src` và `connect-src` chỉ cho `https://cdn.jsdelivr.net/npm/@rive-app/canvas@2.49.0/` thay vì toàn bộ host. `tests/csp-rive.test.mjs` khóa quan hệ giữa `RIVE_VERSION` và CSP. | Gói `@rive-app/canvas@2.49.0` không có phụ thuộc, `+esm` và `rive_fallback.wasm` đều trả 200 dưới tiền tố này. Runtime tải wasm từ `unpkg.com` trước nhưng CSP đang chặn; bản dự phòng jsDelivr vẫn nằm trong phạm vi mới. Test CSP đạt 3/3. **Không kiểm chứng được bằng trình duyệt** (sandbox không tải được CDN nên không thấy Rive chạy). Landing không có vi phạm CSP. |
| P2-6 | `server.js`: cache file tĩnh theo đường dẫn, mtime và kích thước (`readStaticFile`). Bỏ `readFileSync` và băm SHA-256 lặp lại mỗi request; HTML băm lại các asset qua cache. | So sánh trực tiếp với HEAD (hai server, cùng dữ liệu): mọi file tĩnh giống hệt (body, kích thước, ETag, 304). Mọi trang HTML giống hệt sau khi chuẩn hóa cổng và nonce. Đo 200 request/loại: trang chủ **31.8 → 18.5 ms**; CSS 16.9 → 15.0 ms; JS 13.6 → 13.5 ms (chủ yếu là chi phí fetch). |

Kiểm thử đầy đủ: `npm test` đạt **168 pass / 0 fail / 1 todo** (T1-F03 có lý do), thoát 0, không tạo `data/` trong repo.

Còn mở, cần quyết định trước khi làm:
- **P1-1**: chấm phát âm `/score` tin văn bản client (xem mục 9).
- **P1-6**: analytics và đồng ý cookie (pháp lý).
- **P2-1**: xác minh email trước khi dùng cho OTP, và `UNIQUE` cho email (đổi hành vi đăng ký/hồ sơ).
- **P2-2**: tên hiển thị trong `/api/stats` (cách che tên là quyết định sản phẩm).
- **P2-3**: chấm phát âm `/assess` có nên tính hạn mức gói hay không.
- **P2-10**: nguồn sự thật cho số phiên bản (`package.json` 5.1.3 hay `VERSION` 1.0.1).
- **P2-11**: nhận secret Zalo chỉ qua header có làm gãy tích hợp bot hiện tại không (cần xác nhận cách bot gửi).
- (Các mục trên đã được xử lý trong Phụ lục F. Không còn quyết định nào đang chờ.)

## Phụ lục F — Kết quả đợt 3 (xử lý toàn bộ mục còn lại)

Quyết định được chọn để không phải chờ: mọi mục còn mở đã được làm theo hướng nêu dưới đây. Mục nào đổi hành vi người dùng được ghi rõ để có thể đảo lại.

| ID | Thay đổi | Kiểm chứng |
|---|---|---|
| P1-1 | `/api/lang/speak/score`: không ghi tiến độ `lang_speak`, không cộng sao/XP, không tính streak. Vẫn ghi nhận đã luyện (hoạt động hằng ngày, không gắn phần thưởng). Trả `recorded: false`, `starsEarned: 0`, `best` là `null` nếu chưa có. Client không ghi `null` vào điểm cao nhất. **Đổi hành vi:** số sao từ luyện nói chỉ đến từ chấm bằng âm thanh. | `tests/speak-score-integrity.test.mjs` (mới): điểm vẫn trả về, không có sao, `stats.practiced` vẫn 0. Suite `api-business-audit` pass. |
| P1-6 | `public/js/consent.js` (mới): GTM/GA chỉ nạp sau khi bấm "Đồng ý"; mặc định từ chối; lưu `pl:consent:analytics`; banner tiếng Việt/Anh; không hiện ở khu quản trị. Bỏ khối GTM inline và `noscript` iframe ở `index.html` và `modules/seo.js`. | Trình duyệt: trước khi chọn không có request tới Google; "Chỉ cần thiết" lưu `denied`, không nạp GTM; "Đồng ý" lưu `granted`, thêm GTM và khởi tạo `dataLayer`. |
| P2-1 | Giới hạn theo địa chỉ email: tối đa 3 OTP quên mật khẩu và 3 mã xác minh mỗi giờ cho một địa chỉ, dù có bao nhiêu tài khoản. Chỉ mục duy nhất `idx_users_email_lower` (email không phân biệt hoa thường) và `idx_users_username_lower`; nếu dữ liệu cũ đang trùng thì chỉ cảnh báo. | Chỉ mục đã được tạo trên DB mới (xác minh trên server). Giới hạn theo địa chỉ không chạy được trực tiếp vì không có SMTP; nằm sau kiểm tra `mailConfigured()`. |
| P2-2 | `/api/stats` công khai: tên hiển thị thành "Trần H." (họ đầy đủ và chữ đầu tên đệm/tên được che). | Live: `names = ["Trần H."]`. |
| P2-3 | `/api/lang/speak/assess`: gói miễn phí 5 lượt/ngày, gói Pro 40 lượt/ngày. **Đổi hành vi:** học viên miễn phí bị giới hạn chấm bằng âm thanh. | Đọc mã (cần GEMINI key để chạy live). |
| P2-4 | Rive không được dùng ở đâu (chỉ có `rive-companion.js` không ai import), nên gỡ luôn: xóa file, `public/rive/`, và bỏ jsDelivr và `wasm-unsafe-eval` khỏi CSP. Test CSP Rive cũng bỏ. | Đồ thị import: không còn file nào bị bỏ sót. CSP trên landing không có vi phạm. |
| P2-5 | `main.js`: các trang lớp học, gia đình, giáo viên và gói Pro chuyển sang import động. | Landing: 33 → 30 module JS (228 → 205 KB; phần còn lại là module dùng chung). Trình duyệt: `/app/lop`, `/app/gia-dinh`, `/app/bang-gia`, `/app/mon-hoc` render đúng. |
| P2-7 | `/api/admin/overview`: thống kê đếm bằng `GROUP BY`; danh sách học viên 500 người mới nhất (`truncated` nếu còn nữa). `/api/admin/users`: lọc vai trò và trạng thái trong SQL; tìm theo tên lọc trong JS trên tối đa 5000 dòng (vì `LOWER()` của SQLite không đổi chữ có dấu); truy vấn phụ chỉ đọc đúng những người được trả về. | Live: `userStats` đúng (total, byRole, locked, online); lọc `role`, `status`; tìm "hải" có dấu trả đúng 1 kết quả. |
| P2-8 | Đếm hạn mức TTS lưu trong `site_stats` (khóa theo ngày và người dùng), không còn nằm trong bộ nhớ. Dọn các khóa cũ hơn 2 ngày. Đếm người dùng trước để người đã hết lượt không làm tốn hạn mức chung. | Đọc mã (cần khóa TTS để chạy live). |
| P2-9 | Đã xóa: stack judge/Python/C/C++/Java (`interpreter.js`, `judge-*`, `run-*`, `runner/`, `modules/code-runner.js`, `modules/codecourses.js`, `content/code/`, `curriculum.js`, `lessons.js`, `en-content.js`, `content/py-hidden-chapter.js`, `modules/content-i18n.js`, `modules/export.js`, `modules/learning.js`, `db/serial-write.js`), tools tương ứng, `docker-compose.redis.yml`, `docker-compose.staging.yml`, unit `pythonlab-*`, `archive/`, 14 file rỗng, client `code.js`, `editor.js`, `assignments.js`, `classes.js`, `licenses.js`, `rive-companion.js`, `public/app.js`, `public/vendor/codemirror`. **Không xóa bảng hay dữ liệu trong DB** (giữ lịch sử người học). | Đồ thị import phía server: 95 file được tới, phần còn lại là script chạy tay và file cấu hình. Đồ thị client: không còn import nào bị gãy. Build JS và test đạt. |
| P2-10 | Số phiên bản đọc từ `package.json` (hiện 5.1.3). README cập nhật 6 ngôn ngữ, biến admin và cách kiểm thử. `BAO-CAO-KIEM-TOAN.md` và `PROJECT.md` có cảnh báo lỗi thời. `docs/README.md` đánh dấu tài liệu lịch sử. | Live: `/api/health` trả `5.1.3`. |
| P2-11 | Zalo: secret chỉ nhận qua header `x-pl-secret`; khi đã cấu hình admin Zalo, trường `from` phải khớp (không còn bỏ qua khi thiếu). **Đổi hành vi:** bot phải gửi secret trong header và gửi `from`. | Live (bật Zalo trong môi trường test): body secret → 401; header không có `from` → từ chối; sai người gửi → từ chối; admin đúng → 200. |
| P3 | Logout khi đang có phiên phải kèm CSRF (403 nếu thiếu). `/api/visit` giới hạn 60/phút mỗi IP. Mật khẩu phổ biến hoặc toàn một ký tự bị từ chối ở đăng ký, đổi, đặt lại, admin và tạo tài khoản lớp. Thay chuỗi trông như khóa Gemini thật trong test bằng chuỗi giả rõ ràng. Sửa comment "Azure" và User-Agent `CongHocTap`. | Live: logout không CSRF → 403, có CSRF → 200; `123456` → 400. |
| T1-F03 | Test đã đúng hơn. **Đính chính:** trước đây tôi ghi rằng thẻ môn trên landing mở đăng ký. Kiểm tra lại: thẻ môn (mục 3–4) là liên kết trực tiếp. Chỉ có nút đăng ký ở header và drawer di động trước mục 8, và đó là điều hướng. Lỗi test chỉ là đường dẫn `#/` cũ. | Test pass, không còn TODO. |

Kết quả cuối: `npm test` **167 pass / 0 fail / 0 todo**, thoát 0, không tạo `data/` trong repo. `check:css`, `check:js`, `verify:lang` đạt.

Hệ quả cần biết khi triển khai:
1. Bot Zalo phải gửi secret trong header `x-pl-secret` và trường `from` là ID admin. Nếu không, xác nhận đơn qua Zalo sẽ dừng.
2. Học viên miễn phí bị giới hạn chấm phát âm bằng âm thanh ở 5 lượt/ngày.
3. Sao từ luyện nói chỉ đến từ chấm bằng âm thanh (cần khóa Gemini).
4. Trước khi bật chỉ mục duy nhất email/username trên DB cũ, server sẽ cảnh báo nếu dữ liệu đang trùng. Cần xử lý trùng trước khi chỉ mục được tạo.
5. Phân trang admin: danh sách học viên là 500 người mới nhất. Nếu cần xem đầy đủ, cần thêm phân trang ở giao diện.

## Phụ lục G — Rà soát lại sau đợt 3 (giao diện, tính năng, API, nút bấm, nghiệp vụ)

Phạm vi: chạy thật trên máy chủ thử `127.0.0.1:8095` với DB tạm trong thư mục scratchpad, không chạm dữ liệu thật. Kịch bản kiểm tra nằm ngoài repo.

| Hạng mục | Cách kiểm | Kết quả |
|---|---|---|
| Giao diện học viên | Duyệt tự động 120 trang (điều hướng SPA), tìm thông báo lỗi, trang trống, lỗi console, tràn ngang | 120 trang, 0 vấn đề |
| Giao diện quản trị | 19 trang quản trị và 2 cách xem tab kinh doanh; 8 trang giáo viên, lớp, gia đình, cá nhân | 0 vấn đề, không lỗi console |
| Điện thoại 375px | Đo phần tử vượt khung nhìn trên 8 trang chính và trang chủ | Không tràn trang. Hai chỗ cuộn ngang có chủ đích (bảng giá, thanh chip) |
| Route client → server | 153 đường dẫn client gọi; kiểm 15 route có tham số thật | Không route nào thiếu handler |
| Nghiệp vụ đơn Pro, hội thoại AI, thử thông báo | Kịch bản `review-flows` | 18/18 PASS |

**Lỗi đã tìm thấy và sửa trong đợt này:**
- **R-1 [P1] Luồng "Tôi đã chuyển khoản" không hoạt động.** Thiếu 3 route: `POST /api/billing/orders/:id/claim`, `POST /api/billing/orders/:id/cancel`, `GET /api/billing/orders/:id`. Học viên bấm nút nhưng không có gì được lưu; quản trị viên không thấy đơn đã báo; học viên không xem lại được đơn để tiếp tục thanh toán. Đã thêm vào `modules/api.js`: chỉ chủ đơn mới thao tác được; claim ghi `claimed_at` và lặp lại vẫn 200; không hủy được đơn sau khi đã claim.
- **R-2 [P2] Lịch sử hội thoại AI không tải và không xóa được.** Thiếu `GET` và `DELETE /api/ai/conversations/:id`. Đã thêm, chỉ chủ hội thoại truy cập được.
- **R-3 [P3] Nút "Thử thông báo" của quản trị gọi tới route không tồn tại** (`POST /api/admin/notify-test`, trả 404). Đã thêm, chỉ quản trị viên; trả trạng thái webhook.

**Không phải lỗi (đã xác minh):**
- `/app/luyen-noi` trả 404 vì đường dẫn này không tồn tại. Menu dùng `/app/ngoai-ngu/luyen-noi/{môn}`, hoặc `/app/chon-mon` khi chưa chọn môn.
- Kịch bản quét báo thiếu `/api/lang/*`, `/api/admin/biz/plans/1` và `DELETE /api/admin/lang/units/...`. Nguyên nhân là kịch bản thay `1` vào chỗ mã ngôn ngữ hoặc mã gói. Kiểm lại với giá trị thật: 15/15 có handler.
- `POST /api/billing/orders` trả 503 khi body rỗng. Thứ tự kiểm tra là cấu hình thanh toán trước, tham số sau. Cấu hình đã bị xóa vì chính kịch bản quét gọi `POST /api/admin/settings/reset`, đưa mọi cài đặt về mặc định trong DB thử.
- `POST /api/ai/ask` và `POST /api/lang/insights/:lang/report` trả 503 "chưa được cấu hình": máy thử không có khóa Gemini. Hành vi này đúng thiết kế.

**Quan sát chưa sửa (P3, không đổi hành vi):**
- Bảng giá trên điện thoại 375px rộng 480px và cuộn ngang trong khung. Người dùng phải vuốt để thấy đủ các cột gói. Có thể thu gọn ở đợt sau.

**Chưa kiểm chứng được:**
- Luồng lớp học đầy đủ (giáo viên tạo lớp, mời, giao bài, học viên nộp, chấm). Chưa tạo tài khoản giáo viên thử; mới kiểm tra các trang render đúng.
- Chấm bài tập tương tác và cộng XP, giao diện khóa Pro, mã quà tặng, mời thành viên gia đình: chưa chạy đầu cuối.
- AI (Gemini), Zalo và SePay thật: không có khóa hay kết nối thật.

**Test mới:** `tests/billing-claim-ai-notify.test.mjs`, 5 test cho đơn (tạo, xem, claim, hủy), hội thoại AI và thử thông báo.

Kết quả: `npm test` **172 pass / 0 fail / 0 todo**, thoát 0 (đợt 3 là 167, thêm 5 test mới). `check:css`, `check:js`, `verify:lang` đạt.

Hệ quả cần biết khi triển khai: nút "Tôi đã chuyển khoản" của học viên bắt đầu hoạt động (trước đó gọi tới route không tồn tại). Cần kiểm tra lại luồng này trên môi trường thật, gồm cả việc quản trị viên thấy đơn đã báo.
