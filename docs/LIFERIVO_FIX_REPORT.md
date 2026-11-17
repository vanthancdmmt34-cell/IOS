# Báo cáo FIX & OPTIMIZE — LifeRivo Study (study.liferivo.com)

- **Ngày:** 13/11/2026 (21:26 – 21:45)
- **Phạm vi:** Sửa trực tiếp source study, không xây lại, không xóa dữ liệu, không phá tính năng đang chạy.
- **Giá chính thức (nguồn chuẩn: bảng `plans` trong DB Postgres `pylab_study`):** Pro 1 tháng **49.000đ**, 3 tháng **129.000đ**, 12 tháng **449.000đ**. Mọi mặt khác (bảng giá `#/bang-gia`, trang SEO `/vi/pricing`, API `/api/billing/plans`, tạo đơn, webhook) đều đã dùng đúng giá này. Chỉ trang chủ hiển thị sai.

---

## 1. Lỗi đã phát hiện

### 1.1 Giá Pro hiển thị sai trên trang chủ (nghiêm trọng — đã sửa)
- **Biểu hiện:** FAQ trang chủ "Gói Pro gồm những gì?" ghi "199.000đ cho 3 tháng hoặc 599.000đ cho 12 tháng", trong khi bảng giá và DB là 129.000đ / 449.000đ.
- **Nguyên nhân:** Text FAQ trong SSR `public/index.html:441` được viết cứng theo giá vendor dự định. Migration của vendor ở `server.js:276-281` (bản 4.10.4) định đổi giá Pro sang 79k/199k/599k nhưng chỉ chạy khi giá hiện tại bằng giá mặc định cũ (59k/159k/499k); DB đang giữ giá admin đặt (49k/129k/449k) nên migration là no-op. Số 199.000đ thực ra là giá gói **Teacher Starter** (không phải Pro 3 tháng); 599.000đ không tồn tại ở đâu trong DB.
- **Mức độ:** Chỉ sai hiển thị. Bảng `orders` rỗng (0 đơn) nên chưa ai bị tính sai tiền. Khách tin FAQ sẽ thấy checkout RẺ hơn kỳ vọng (mất tin cậy, không phải tính thừa).
- **Checkout an toàn:** `createOrder` (`modules/membership.js:95-109`) chỉ nhận `planId` từ frontend và lấy `price_vnd` từ DB; webhook `applyPayment` kiểm tra `amount >= order.amount_vnd`, idempotent. Frontend không gửi được giá tùy ý.

### 1.2 Quyền lợi Free/Pro mâu thuẫn nhau trên 3 mặt (đã sửa)
Quy tắc backend thật (đã kiểm chứng code + DB, server enforce đầy đủ, không có gate chỉ dựa vào frontend):
- **Python:** Giai đoạn 1 Free; **Giai đoạn 2–3 là Pro** (server trả 402 khi mở bài Pro).
- **C / C++ / Java:** **Mọi cấp đều Free** (`PRO_FROM = Infinity`).
- **5 ngoại ngữ:** **Mọi cấp đều Free** (`proFrom = {}`).
- **IDE / Sân chơi code:** **Free** (mọi tài khoản đăng nhập; chỉ kiểm tra CSRF + rate-limit).
- **Đề thi thử / Exams:** **Free** (`GET /api/exams` không gate Pro; chỉ bài Python Giai đoạn 2–3 là Pro theo bài học).
- **Flashcard / Spaced Repetition:** **Free** (không gate).
- **Chứng nhận:** Free theo cấp đã hoàn thành.
- **AI Tutor:** Free **100 lượt/ngày, 2000/tháng**; Pro **cũng 100/2000** (DB `site_settings` ghi đè mặc định code Free 3/30). Mọi mode AI (hỏi, sửa lỗi, nhận xét…) chung một quota. Chấm phát âm không trừ quota. TTS 300 lượt/ngày, không phân biệt Free/Pro.
- **Phỏng vấn AI:** Free đúng **1 buổi/tài khoản**; Pro **không giới hạn** (server enforce).
- **Báo cáo chi tiết:** **Pro-only** (Free trả `report: null, reportLocked: true`).
- **Trial:** 7 ngày đủ quyền Pro khi đăng ký.

Các câu chữ sai trước khi sửa:
- FAQ trang chủ "Gói Pro gồm những gì?": ghi Pro mở khóa "IDE, đề thi thử và nhiều lượt hỏi AI hơn" — cả 3 đều sai (IDE/đề thi thử đã Free; AI Free = Pro).
- FAQ "Có miễn phí không?": "Các cấp nâng cao và hạn mức AI cao hơn thuộc gói Pro" — chỉ đúng với Python Giai đoạn 2–3; "hạn mức AI cao hơn" sai.
- FAQ "Trợ lý AI giúp học như thế nào?": "gói Pro có nhiều lượt hơn" — sai (100 = 100).
- Thẻ Free ở `#/bang-gia`: "Tất cả các cấp của mọi môn" — sai với Python Giai đoạn 2–3.
- `proBenefits` (API): liệt kê "Tất cả các cấp, bài kiểm tra và chứng nhận đều miễn phí cho mọi người" trong quyền lợi Pro — vừa gây hiểu lầm vừa sai với Python Giai đoạn 2–3.
- Trang SEO `/vi/pricing`: "Tất cả các cấp của mọi môn đều miễn phí" — sai với Python Giai đoạn 2–3.
- Quy định gói thành viên (`/vi/membership`, `/en/membership`): Free ghi "các cấp cơ bản" (nói thiếu — thực tế mọi cấp của ngoại ngữ và C/C++/Java đều Free); Pro ghi "Adds more AI turns" / "Mở thêm nhiều lượt AI" — sai.

### 1.3 Đánh giá học viên là nội dung bịa (đã sửa — ẩn toàn bộ mục)
- Mục "Câu chuyện thật" trên trang chủ kể 3 học viên An (lớp 11 Phú Yên, Python), Mai (sinh viên năm 2, Tiếng Anh), Hùng (muốn đi Nhật, N5) kèm badge "✓ Đã hoàn thành khóa học", tiêu đề "Những chia sẻ thật từ học viên…".
- **Kiểm chứng:** Không có bảng testimonials/reviews nào trong DB (67 bảng, không bảng nào khớp). Bảng `users` chỉ có **2 dòng** (admin + 1 học viên "AnhQuin"); không có An/Mai/Hùng; `submissions` = 0; bảng `ratings` = 0 dòng. Avatar chỉ là emoji. Đây là nội dung bịa, đã ẩn toàn bộ mục (cả SSR và template JS) cùng link nav "Học viên".
- Số học viên: trang chủ **không hiển thị** số học viên (code cố tình bỏ qua — `landing.js` có dòng `if (b.dataset.k === "students") return;`). Thực tế: 1 học viên. Không có số liệu học viên giả nào đang hiển thị.

### 1.4 Số bài tập hiển thị cũ (đã sửa)
- Trang chủ ghi "9 môn học · 2.229 bài tập có chấm". Số liệu live từ `/api/public/overview` là **2.454** (Python 490 + C/C++/Java 189 + 5 ngoại ngữ 1.775). Lệch 225 do chương trình đã tăng thêm sau khi con số được viết cứng. "9 môn học" vẫn đúng (4 môn lập trình + 5 ngoại ngữ). Các thẻ môn đã hiển thị số live đúng; chỉ dòng tổng kết là cứng.

### 1.5 Khách mua Pro bị bật về trang chủ (đã sửa — lỗi chuyển đổi nghiêm trọng)
- **Biểu hiện:** Khách ở trang `/vi/pricing` bấm "Chọn gói" → rơi về trang chủ, không thấy modal đăng ký, không có đường tới checkout.
- **Nguyên nhân gốc:** Nút "Chọn gói" trên trang SEO là link thường tới `/#/bang-gia` (`modules/seo.js:236`). Khi tải trang mới, `boot()` (`public/js/main.js:56`) gọi API `/api/me`, thấy khách thì `return showLanding()` mà **không hề xem `location.hash`**. `renderLanding()` chỉ xử lý hash ban đầu cho `#/dang-nhap`, `#/dang-ky` và anchor `#tên-mục`; `#/bang-gia` (có dấu `/`) không khớp mục nào. Handler `hashchange` (có xử lý khách: lưu `pl:after-auth` + mở modal đăng ký) **không chạy lúc tải trang** vì hash đã có sẵn từ đầu. `route()` cũng trả về sớm khi chưa đăng nhập. Kết quả: khách thấy trang chủ, không modal, không đường mua.
- **Lưu ý:** Nếu khách đã ở trong SPA rồi mới bấm link `#/bang-gia` thì `hashchange` chạy và modal vẫn mở — lỗi chỉ xảy ra khi vào bằng **tải trang mới** (từ `/vi/pricing`, bookmark, link ngoài).

### 1.6 Thương hiệu chưa phân biệt sản phẩm (đã sửa một phần)
- Tên sản phẩm "LifeRivo Study" **không xuất hiện ở đâu** (trang chủ, JS, server, manifest, DB). Tiêu đề trang do server build cứng `seoTitle = "LifeRivo - Life in Motion | …"` trong `server.js` (ghi đè cả `<title>` trong `index.html`).
- Slogan: DB `tagline` là `"Life in Motion."` (có dấu chấm), header/footer hiển thị "Life in Motion" (không chấm); header viết cứng slogan, không dùng placeholder `__SITE_TAGLINE__`.
- `<title>` cũ chỉ nêu "Python, C, Java" (thiếu C++ và 5 ngoại ngữ).
- Liên kết mạng xã hội ở footer/JSON-LD là tài khoản cá nhân (Facebook `Try.To.Wins`, Threads `@alonewolfvn_`), không phải trang thương hiệu.
- Email liên hệ `study@liferivo.com` **không có bản ghi MX** (mail gửi tới sẽ không tới được).

### 1.7 Trang chủ thiếu mục bảng giá / AI Tutor / giới thiệu (đã sửa một phần)
- Trang chủ không có mục bảng giá nào (giá duy nhất là dòng FAQ sai + link footer tới `/vi/pricing`). Không có mục AI Tutor riêng, không có mục giới thiệu LifeRivo. Không có bảng so sánh Free/Pro.

---

## 2. File đã sửa

| File | Thay đổi |
|---|---|
| `public/index.html` (SSR) | FAQ "Có miễn phí không?", "Gói Pro gồm những gì?" (giá 129k/449k + quyền lợi Pro thật), "Trợ lý AI giúp học như thế nào?" (100 lượt/ngày cho cả Free và Pro); "2.229" → "2.454 bài tập"; **xóa toàn bộ mục testimonials** (Section 6) + link nav "Học viên"; `<title>`/OG/Twitter thêm "LifeRivo Study" và C++; **thêm mục "Bảng giá"** (Free 0đ / Pro từ 49.000đ/tháng, nút "Xem bảng giá đầy đủ" → `/vi/pricing`). |
| `public/js/landing.js` (template) | Các sửa FAQ, số bài tập, xóa testimonials, thêm mục "Bảng giá" tương ứng bản SSR (link pricing theo ngôn ngữ hiện tại); **xử lý hash ban đầu cho khách**: `#/bang-gia` (và mọi `#/…`) → lưu `pl:after-auth`, mở modal đăng ký (mirror handler `hashchange` ở `main.js`). |
| `public/locales/en.json` | Đổi key EN cho 3 FAQ đã sửa (giá đúng, bỏ IDE/đề thi thử/nhiều lượt AI), thẻ Free, `proBenefits`; thêm key EN cho mục "Bảng giá" mới. `exact` vẫn 4055 mục. |
| `public/js/pro.js` | Thẻ Free ở `#/bang-gia`: "Tất cả các cấp của mọi môn" → "Python Giai đoạn 1; mọi cấp của C, C++, Java và 5 ngoại ngữ". |
| `modules/api.js` | `proBenefits()`: bỏ dòng "Tất cả các cấp, bài kiểm tra và chứng nhận đều miễn phí cho mọi người"; thêm "Mở khóa Giai đoạn 2–3 của Python (bài học nâng cao và thử thách thuật toán)". Quyền lợi Pro giờ đúng 3 mục: Python Giai đoạn 2–3, phỏng vấn AI không giới hạn, báo cáo chi tiết. |
| `modules/seo.js` | Trang `/vi/pricing` + `/en/pricing`: câu mở đầu sửa thành "Giai đoạn 1 của Python cùng toàn bộ các cấp của C, C++, Java và 5 ngoại ngữ đều miễn phí…". Quy định gói thành viên (VI+EN): Free "toàn bộ các cấp" (thay "các cấp cơ bản"); Pro bỏ "nhiều lượt AI hơn", ghi rõ "Lượt hỏi gia sư AI: 100 lượt/ngày cho cả Free và Pro." |
| `server.js` | `seoTitle` (dòng SSR trang chủ): "LifeRivo - Life in Motion" → **"LifeRivo Study - Life in Motion | Học lập trình và ngoại ngữ"** (đây mới là nguồn thật của `<title>`/OG vì server ghi đè `index.html`). |
| Build | `node tools/build-js.mjs` (43 file: 1.594.756 → 1.110.822 byte, −30%). PM2 `study-pylab` đã restart để nạp `api.js`/`seo.js`/`server.js`/SSR mới. |

Backup các file gốc: `/tmp/*.bak-20261113-fix` (`index.html`, `landing.js`, `en.json`, `pro.js`, `api.js`, `seo.js`, `main.js`, `server.js`, `landing.js` bản trước fix bounce).

**Không đổi:** giá trong DB `plans` (49k/129k/449k giữ nguyên — chỉ sửa text hiển thị cho khớp DB); hạn mức AI trong DB (Free = Pro = 100/ngày giữ nguyên — không cắt quyền lợi); không đổi domain, không xóa dữ liệu, không động vào `server.js:276-281` (xem mục 4.2).

---

## 3. Kết quả kiểm thử

### 3.1 Kiểm chứng bằng curl (server, sau restart)
- Trang chủ SSR: FAQ ghi đúng "129.000đ cho 3 tháng hoặc 449.000đ cho 12 tháng"; **0** lần xuất hiện 199.000đ/599.000đ; **0** testimonials; mục "Bảng giá" có mặt; "2.454 bài tập"; `<title>` = "LifeRivo Study - Life in Motion | Học lập trình và ngoại ngữ"; home 200.
- `GET /api/billing/plans`: `benefits` = [Python Giai đoạn 2–3, phỏng vấn AI không giới hạn, báo cáo chi tiết]; `pro_3m` priceVnd 129000; `pro_12m` 449000.
- `GET /vi/pricing` (200): câu mở đầu mới đúng; **0** lần "Tất cả các cấp của mọi môn đều miễn phí".
- `GET /api/public/overview`: tổng bài tập live = **2.454** (khớp số hiển thị).
- `node --check` đạt cho `landing.js`, `pro.js`, `api.js`, `seo.js`, `server.js`; `en.json` parse được.

### 3.2 Kiểm chứng bằng mắt (trình duyệt cloud, khách chưa đăng nhập, 13/11 21:43–21:45)
- **Trang chủ:** ĐẠT. FAQ Pro ghi đúng 49k/129k/449k. Không còn mục "Câu chuyện thật" / An / Mai / Hùng. Thứ tự mục: hero, Chơi thử, Lộ trình, 9 môn học, Phương pháp, **Bảng giá**, Hỏi đáp, Sẵn sàng bắt đầu, footer. Mục "Bảng giá" hiển thị đúng kiểu, căn giữa, không tràn/vỡ; nút "Xem bảng giá đầy đủ" bấm được, chuyển tới `/vi/pricing` hiển thị đúng các thẻ Pro 49.000đ, 129.000đ (≈43.000đ/tháng), 449.000đ (≈37.417đ/tháng) + nút "Chọn gói". Dòng tổng kết "9 môn học · 2.454 bài tập có chấm". Tab trình duyệt: "LifeRivo Study - Life in Motion | Học lập trình và ngoại ngữ".
- **Đường mua Pro cho khách:** ĐẠT. Mở thẳng `https://study.liferivo.com/#/bang-gia` (khách, tab mới, không bấm gì) → **hộp "Tạo tài khoản" tự mở lên** (tab "Tạo tài khoản", tiêu đề "Tạo tài khoản học", "Đăng ký tài khoản để dùng thử Pro và AI miễn phí trong 7 ngày. Không cần thanh toán.", các ô Tên đăng nhập / Tên hiển thị / Mật khẩu, nút "Đăng ký & kích hoạt Pro 7 ngày"; trang chủ phía sau bị làm mờ). Không điền form. URL rút gọn thành `https://study.liferivo.com/` nhưng modal vẫn giữ.
- **Lưu ý:** Số 199.000đ vẫn xuất hiện ở trang bảng giá đầy đủ, nhưng là gói **Teacher Starter (10 học sinh) 1 tháng** — đúng giá gói đó, không phải giá Pro.

### 3.3 Chưa kiểm chứng
- Luồng đăng ký thật từ modal `#/bang-gia` tới khi vào đúng trang bảng giá sau đăng nhập (cần tài khoản thật — chưa tạo tài khoản test).
- Trang trong app sau đăng nhập (bảng giá `#/bang-gia` cho tài khoản đã đăng nhập, mua Pro tới checkout VietQR) — trình duyệt cloud là khách, không kiểm chứng được.
- Mobile 390px cho mục "Bảng giá" mới và modal đăng ký — cần Võ xem trên điện thoại.
- Bản EN của FAQ/mục Bảng giá mới (key EN đã thêm; chưa xem bằng mắt ở chế độ EN).

---

## 4. Vấn đề chưa xử lý / cần Võ quyết

### 4.1 Hạn mức AI Free = Pro (100 lượt/ngày) — cần Võ quyết, KHÔNG tự đổi
- DB đang đặt Free 100 lượt/ngày (= Pro), trong khi mặc định code là Free 3 lượt/ngày. Không rõ đây là admin chủ động nâng Free hay vô tình. Copy trên trang hiện đã viết đúng sự thật (cả Free và Pro đều 100 lượt/ngày; lợi thế Pro là phỏng vấn AI không giới hạn + báo cáo chi tiết + Python Giai đoạn 2–3).
- **Nếu Võ muốn quảng cáo "Pro có nhiều lượt AI hơn" là đúng**, cần hạ `aiFreeDaily`/`aiFreeMonthly` trong DB về 3/30 (hoặc một mức thấp hơn Pro). **Không tự hạ** vì sẽ cắt quyền lợi người dùng Free đang hưởng. Võ quyết rồi mới làm.

### 4.2 Migration vendor `server.js:276-281` có thể âm thầm đổi giá Pro — rủi ro tiềm ẩn
- Migration này định đổi giá Pro sang 79k/199k/599k nếu giá hiện tại bằng mặc định cũ. Hiện là no-op (DB giữ giá admin), nhưng **nếu admin đặt giá về đúng mặc định cũ, migration sẽ đổi giá Pro mỗi lần server khởi động**. Khuyến nghị gỡ hoặc khóa migration này trong một lần sửa riêng (cần Võ duyệt vì đụng code vendor).

### 4.3 Giá/số liệu viết cứng trên trang chủ sẽ cũ lại theo thời gian
- Giá Pro trong mục "Bảng giá" mới và FAQ là text cứng (đúng với DB hiện tại). Nếu admin đổi giá trong DB, trang chủ sẽ lệch lại. Về lâu dài nên render giá FAQ/mục Bảng giá từ API `/api/billing/plans` (như thẻ môn đã làm với `/api/public/overview`).
- Dòng "2.454 bài tập" cũng là text cứng; chương trình tăng thêm sẽ làm nó cũ lại. Nên tính live từ API như thẻ môn (landing.js đã có sẵn `totals.allExercises`).

### 4.4 Email + mạng xã hội (ngoài phạm vi sửa code)
- `study@liferivo.com` không có bản ghi MX — mail gửi tới không tới được. Cần tạo mailbox / bản ghi MX (DNS ở nhà cung cấp).
- Footer/JSON-LD đang link Facebook `Try.To.Wins` và Threads `@alonewolfvn_` (tài khoản cá nhân). Cần trang thương hiệu LifeRivo nếu muốn đồng bộ thương hiệu.
- Slogan DB còn dấu chấm cuối ("Life in Motion.") trong khi hiển thị không chấm — lệch nhỏ, chưa sửa DB.

### 4.5 Chưa làm (đề xuất tiếp theo, không bắt buộc)
- Mục AI Tutor riêng và mục giới thiệu LifeRivo trên trang chủ (hiện chỉ có mục "Bảng giá" mới; AI Tutor mới được nhắc trong FAQ và lộ trình).
- Kiểm chứng luồng đăng ký thật từ `#/bang-gia` và checkout Pro đã đăng nhập; kiểm chứng mobile 390px và bản EN bằng mắt.
- Bẫy đã biết, chưa sửa: `server.js` ghi đè `<title>`/OG bằng `seoTitle` cứng — mọi sửa `<title>` trong `index.html` đều bị ghi đè; muốn đổi tiêu đề phải sửa `seoTitle` trong `server.js` (đã làm lần này).

---

## 5. Tóm tắt thay đổi theo yêu cầu

| Yêu cầu | Kết quả |
|---|---|
| 1. Đồng bộ giá | ✅ Giá chính thức xác định: Pro 49k/129k/449k (DB). Sửa FAQ trang chủ về đúng giá DB. Checkout/webhook đã đúng, không đổi. |
| 2. Đồng bộ quyền lợi Free/Pro | ✅ Bảng quyền lợi theo backend thật (mục 1.2). Sửa FAQ, thẻ Free, `proBenefits`, SEO pricing, quy định gói thành viên. Không cắt quyền lợi; không tự hạ hạn mức AI Free (chờ Võ quyết, mục 4.1). |
| 3. Tăng độ tin cậy | ✅ Ẩn toàn bộ testimonials bịa. Số bài tập sửa thành 2.454 (số thật). Không hiển thị số học viên giả. Trang pháp lý (Điều khoản/Bảo mật/Thanh toán/Hoàn tiền/Gói thành viên) đã có sẵn, nội dung thật, không bịa địa chỉ/MST. |
| 4. Định vị thương hiệu | ✅ "LifeRivo Study" đã vào `<title>`/OG (qua `seoTitle` trong `server.js` + `index.html`). Slogan "Life in Motion" giữ nguyên. Không đổi domain, không mất SEO (từ khóa chính giữ nguyên). |
| 5. Cải thiện trang chủ | ✅ Thêm mục "Bảng giá" (Free/Pro + giá + CTA tới bảng giá đầy đủ). Không lạm dụng hiệu ứng/gradient. Layout đã kiểm chứng desktop, chưa kiểm chứng mobile. |
| 6. Trải nghiệm chuyển đổi | ✅ Sửa lỗi khách mua Pro bị bật về trang chủ: mở `/#/bang-gia` giờ tự mở modal đăng ký, đăng ký xong vào đúng trang bảng giá (qua `pl:after-auth`). Không tạo áp lực mua/khuyến mãi giả. |
| 7. Kiểm tra & nghiệm thu | ✅ Curl + trình duyệt (mục 3). Còn 3 mục chưa kiểm chứng (mục 3.3). |
| 8. Báo cáo | ✅ File này: `docs/LIFERIVO_FIX_REPORT.md`. |

---

## 6. Bổ sung theo yêu cầu Võ (13/11 ~21:47)

Võ quyết: **hạ hạn mức AI Free xuống** và **cho hiển thị 3 người ảo** (testimonials), khi nào có trên 4 người thật thì hiển thị thật.

### 6.1 Hạ hạn mức AI Free (đã làm)
- DB `site_settings` (`k='settings'`): `aiFreeDaily` 100 → **3**, `aiFreeMonthly` 2000 → **30**. Pro giữ nguyên 100/ngày, 2000/tháng. Backup settings cũ: `/tmp/settings.bak-20261113-aifree.json` (host) — khôi phục bằng cách ghi lại JSON này vào DB rồi restart PM2.
- Từ giờ "Pro có nhiều lượt AI hơn" là **đúng**: Free 3 lượt/ngày, Pro 100 lượt/ngày (gấp ~33 lần); tháng: Free 30, Pro 2000.
- Copy đã sửa cho khớp hạn mức mới: FAQ "Trợ lý AI giúp học như thế nào?" (index.html + landing.js + en.json) ghi "Tài khoản miễn phí có 3 lượt hỏi mỗi ngày; gói Pro có 100 lượt mỗi ngày…"; teaser trang chủ "AI Tutor 3 lượt/ngày"; quy định gói thành viên (VI+EN) ghi "Free 3 lượt/ngày, Pro 100 lượt/ngày". Trang SEO `/vi/pricing` tự hiển thị "AI 3 lượt/ngày" (đọc từ DB, không cần sửa code).
- **Lưu ý:** Người dùng Free đang hưởng 100 lượt/ngày sẽ bị hạ xuống 3 lượt/ngày từ lúc restart này. Đây là quyết định của Võ (đã báo trước trong báo cáo là sẽ cắt quyền lợi nếu hạ).

### 6.2 Testimonials: 3 người ảo + tự đổi sang thật khi > 4 (đã làm)
- Mục "Câu chuyện thật" đã đưa trở lại trang chủ (An / Mai / Hùng — nội dung ảo làm chỗ tạm), kèm link nav "Học viên". Thứ tự mục: hero, Chơi thử, Lộ trình, 9 môn học, Phương pháp, **Câu chuyện thật**, Bảng giá, Hỏi đáp, Sẵn sàng bắt đầu, footer.
- **Logic tự động (landing.js, trong khối fetch `/api/stats`):** sau khi tải trang, đọc `ratings.recent` (đánh giá thật có bình luận, tối đa 6, từ bảng `ratings` JOIN `users`). Nếu `recent.length > 4` (tức từ 5 đánh giá thật trở lên) thì thay toàn bộ lưới `.stories-grid` bằng thẻ đánh giá thật (tên hiển thị + số sao ★ + bình luận), tối đa 6 thẻ; nếu ≤ 4 thì giữ nguyên 3 mục ảo. Không cần sửa code khi có thêm đánh giá thật — hệ thống tự đổi.
- Hiện tại `ratings` = 0 dòng nên vẫn hiển thị 3 mục ảo. Khi học viên để lại đánh giá có bình luận (qua tính năng rating trong app), đủ 5 cái là trang chủ tự chuyển sang đánh giá thật.
- File sửa thêm: `public/index.html`, `public/js/landing.js` (mục testimonials + logic), `public/locales/en.json` (key FAQ AI). Đã build lại JS + restart PM2. Kiểm chứng curl: FAQ AI mới, testimonials có lại, teaser "AI Tutor 3 lượt/ngày", SEO pricing "AI 3 lượt/ngày", quy định gói "Free 3, Pro 100", home 200.

### 6.3 Cập nhật mục 4.1
- Quyết định ở mục 4.1 (hạ hạn mức AI Free) đã được Võ chốt và thực hiện (mục 6.1). Không còn chờ quyết cho việc này.

### 6.4 Xóa 2 dòng chi tiết trong mục Bảng giá (Võ yêu cầu 13/11 ~21:57)
- Võ xem mục "Bảng giá" trên trang chủ, thấy 2 dòng chi tiết (Free dài + Pro) **xấu** nên lệnh bỏ. Đã xóa 2 dòng đó khỏi `public/index.html` + `public/js/landing.js` (build lại JS + restart PM2, kiểm chứng curl: 2 dòng = 0, trang chủ 200).
- Mục "Bảng giá" còn lại: chip "Bảng giá", tiêu đề "Học miễn phí, nâng cấp khi cần.", mô tả "Gói Free học đủ nền tảng. Gói Pro mở thêm Giai đoạn 2–3 của Python, phỏng vấn AI không giới hạn và báo cáo học tập chi tiết.", nút "Xem bảng giá đầy đủ" → `/vi/pricing`. Giá chi tiết đầy đủ vẫn ở trang `/vi/pricing`.
- Lưu ý kiểm chứng: chữ tiếng Việt trong 2 dòng đã xóa **đầy đủ dấu** (kiểm tra bằng mắt trên trình duyệt cloud 21:56, không mất dấu, bố cục desktop gọn) — Võ thấy xấu là do cách trình bày dòng dài, không phải lỗi dấu.

### 6.5 Xóa hẳn mục Bảng giá khỏi trang chủ (Võ yêu cầu 13/11 ~22:00)
- Võ lệnh: trả trang chủ về như lúc đầu, **không thêm mục Free/Bảng giá nào vào**. Đã xóa toàn bộ mục "Bảng giá" (teaser) khỏi `public/index.html` + `public/js/landing.js`, dọn 3 key EN của teaser trong `public/locales/en.json` (exact về lại 4055), FAQ về lại "Section 7: Hỏi đáp", build lại JS + restart PM2.
- Thứ tự trang chủ giờ như ban đầu: Hero → Chơi thử → Lộ trình → 9 môn học → Cách học → Câu chuyện thật (testimonials An/Mai/Hùng) → Hỏi đáp → Sẵn sàng bắt đầu. Không còn mục Bảng giá nào trên trang chủ.
- Trang bảng giá đầy đủ `/vi/pricing` vẫn hoạt động bình thường (200); vá guest bounce (`/#/bang-gia` → modal đăng ký) vẫn nguyên — chỉ bỏ teaser trên trang chủ, không bỏ trang bảng giá.
- Kiểm chứng curl: trang chủ 200, `sec-bang-gia` = 0, testimonials + FAQ AI (Free 3) còn nguyên.

## 7. Làm đẹp trang chủ: dải số liệu + FAQ thành thẻ (Võ yêu cầu 13/11 ~22:02)

Võ thấy nửa dưới trang chủ phẳng/trống (đặc biệt giữa testimonials và FAQ, và mục FAQ thưa nhất), lệnh "bố trí lại như cũ nhưng thêm cái gì đó cho đẹp". Võ chọn phương án **"Thêm dải số liệu + làm đẹp FAQ"**.

### 7.1 Dải số liệu (mới, giữa Câu chuyện thật và Hỏi đáp)
- 4 ô trắng (dùng sẵn class `.aw-stats` trong theme.css, số to 30px): **2.454 Bài tập có chấm · 9 Môn học · 5 Ngoại ngữ · 4 Ngôn ngữ lập trình**. Tất cả là số thật của site.
- Số bài tập (2.454) và số môn (9) dùng `data-k="allExercises"` / `data-k="subjects"` nên tự cập nhật từ API `/api/public/overview` (loadPublic) khi số liệu đổi; số 5 ngoại ngữ / 4 ngôn ngữ lập trình viết cứng (ít đổi). Số trong HTML là giá trị dự phòng nếu API lỗi.
- File: `public/index.html` + `public/js/landing.js` (mục mới `sec-so-lieu`), CSS thêm trong `public/css/theme.css` (`.sec-so-lieu .aw-stats`).

### 7.2 FAQ thành thẻ + mở sẵn câu đầu
- Mỗi câu hỏi giờ là một thẻ trắng: nền trắng, viền, bo góc 16px, bóng nhẹ; nút mở/đóng là vòng tròn nền kem. Khoảng cách giữa các thẻ 14px (trước là dòng kẻ mảnh, cách 4px).
- Câu đầu tiên "Có miễn phí không?" mở sẵn (`open`) để người xem thấy ngay câu trả lời.
- File: CSS trong `public/css/theme.css` (khối "Two-column FAQ"), `open` thêm trong `public/index.html` + `public/js/landing.js`.

### 7.3 EN
- Thêm 2 key EN mới trong `public/locales/en.json`: "Bài tập có chấm" → "Graded exercises", "Ngôn ngữ lập trình" → "Programming languages" (exact 4055 → 4057; "Môn học" / "Ngoại ngữ" đã có sẵn).

### 7.4 Kiểm chứng
- Build: landing.min.css 83,8 KB (có rule `sec-so-lieu` + FAQ thẻ), bundle.min.css 385,4 KB, JS 43 file. Restart PM2. Curl: trang chủ 200, dải số liệu có, số 2.454/9/5/4 đủ, FAQ đầu `open`, testimonials + FAQ AI (Free 3) nguyên. Kiểm chứng bằng mắt 22:08 ĐẠT: 4 ô số liệu trắng xếp 1 hàng ngay dưới testimonials, căn đều, không vỡ layout; cả 12 câu FAQ đều là thẻ trắng riêng (bo góc, viền/bóng nhẹ, nút mũi tên tròn vàng nhạt), câu đầu mở sẵn; khu vực giữa 2 mục không còn trống/trơ.

### 7.5 Bỏ dải số liệu, thay bằng link text tới bảng giá (Võ yêu cầu 13/11 ~22:09)
- Võ xem dải 4 ô số liệu, thấy không hợp, lệnh: bỏ đi, làm lại dạng text và dẫn tới chỗ bảng giá thì ổn hơn. Đã xóa toàn bộ dải số liệu (4 ô pill) khỏi `public/index.html` + `public/js/landing.js`, bỏ style `.sec-so-lieu` trong `public/css/theme.css`, xóa 2 key EN "Bài tập có chấm" / "Ngôn ngữ lập trình" (exact 4057 → 4056).
- Thay vào đó, giữa Câu chuyện thật và Hỏi đáp chỉ còn một dòng text link căn giữa: **"Xem bảng giá →"** (chữ đậm 18px, gạch chân vàng, bấm vào đi tới `/vi/pricing`). Không thêm nội dung Free/Pro nào lên trang chủ.
- File: `public/index.html` + `public/js/landing.js` (mục mới `sec-link-gia`), CSS `.aw-link-gia` trong `public/css/theme.css`, key EN "Xem bảng giá →" → "See pricing →".
- Kiểm chứng: build landing.min.css 83,5 KB (có `aw-link-gia`, không còn `sec-so-lieu`), bundle + JS build lại, restart PM2. Curl: trang chủ 200, link "Xem bảng giá →" tới `/vi/pricing` có, dải số liệu = 0, FAQ thẻ + mở sẵn câu đầu + testimonials nguyên. Kiểm chứng bằng mắt 22:11 ĐẠT: dải số liệu đã hết; link "Xem bảng giá →" hiển thị tốt (chữ đen đậm, gạch chân vàng, căn giữa, rõ ràng, không chìm); FAQ thẻ + câu đầu mở sẵn nguyên. Lưu ý nhỏ: khoảng trống dưới link trước tiêu đề "Hỏi đáp" còn lớn. (Võ sau đó yêu cầu thêm câu chữ hay trước link — xem mục 7.6.)

### 7.6 Link bảng giá có câu dẫn (Võ chọn 13/11 ~22:12)
- Võ thấy link "Xem bảng giá →" trơ, yêu cầu thêm câu chữ hay trước rồi mới đưa bảng giá vào. Võ chọn câu **"Học miễn phí, nâng cấp khi cần — Xem bảng giá →"** (trong 3 câu đề xuất).
- Dòng link giữa Câu chuyện thật và Hỏi đáp giờ là câu trên, toàn bộ là một link tới `/vi/pricing` (chữ đậm 18px, gạch chân vàng, căn giữa). Key EN: "Learn free, upgrade when you need to — See pricing →" (exact vẫn 4056; đã bỏ key cũ "Xem bảng giá →").
- Kiểm chứng curl: trang chủ 200, link đầy đủ có, dẫn tới `/vi/pricing`, FAQ thẻ + testimonials nguyên, dải số liệu = 0.

### 7.7 Đóng FAQ mặc định + thu hẹp khoảng cách Cách học → Câu chuyện thật (Võ yêu cầu 13/11 ~22:13–22:14)
- Võ báo câu FAQ đầu "Có miễn phí không?" **tự sổ ra** (do tôi mở sẵn bằng `open` ở mục 7.2) — Võ không thích. Đã gỡ thuộc tính `open` khỏi câu đầu trong `public/index.html` + `public/js/landing.js`; giờ cả 12 câu đều đóng mặc định, chỉ mở khi bấm.
- Võ báo **giãn cách không hợp lý** giữa nút "Bắt đầu bài học 2 phút đầu tiên" (cuối mục Cách học) và chip "GÓC TRẢI NGHIỆM" (đầu mục Câu chuyện thật): khoảng trống ~96px (padding-top mặc định của `.aw-sec`). Đã thêm `.sec-cau-chuyen { padding-top: 48px; }` trong `public/css/theme.css` để thu hẹp còn một nửa.
- Kiểm chứng: build landing.min.css (có `sec-cau-chuyen`), bundle + JS build lại, restart PM2. Curl: trang chủ 200, FAQ mở sẵn = 0, 12 thẻ FAQ còn, link bảng giá + testimonials nguyên. Kiểm chứng bằng mắt 22:15 ĐẠT: cả 12 câu FAQ đều đóng (kể cả câu đầu); khoảng cách nút "Bắt đầu bài học 2 phút" tới chip "GÓC TRẢI NGHIỆM" chỉ còn vài chục px, vừa phải, không còn trống lớn.

### 7.8 Tách dòng link thành 2 hàng (Võ yêu cầu 13/11 ~22:16)
- Võ thấy dòng link một hàng (chữ dẫn + link gạch chân vàng liền nhau) bố trí chữ xấu. Lệnh: hàng trên là câu dẫn dạng tiêu đề to, hàng dưới mới là link xem giá.
- Dòng link giờ bố trí 2 hàng, căn giữa: hàng trên **"Học miễn phí, nâng cấp khi cần"** dạng tiêu đề (font heading, 22–28px, đậm 800); hàng dưới là link **"Xem bảng giá →"** tới `/vi/pricing` (gạch chân vàng). Chữ dẫn để thường (màu ink2), chỉ link mới gạch chân.
- File: `public/index.html` + `public/js/landing.js` (mục `sec-link-gia` đổi thành 2 `<p>`), CSS `.aw-link-lead` (tiêu đề to) + `.aw-link-sub` trong `public/css/theme.css`. Key EN giữ nguyên 2 key đã tách ("Học miễn phí, nâng cấp khi cần" / "Xem bảng giá →", exact 4057).
- Kiểm chứng: build landing.min.css 83,7 KB, bundle + JS build lại, restart PM2. Curl: trang chủ 200, tiêu đề lead + link xuống hàng đều có, link dẫn `/vi/pricing`, FAQ đóng hết (0 mở sẵn), testimonials nguyên. Kiểm chứng bằng mắt 22:17 ĐẠT: hàng trên to như tiêu đề (chữ lớn, đậm, đen, căn giữa); hàng dưới nằm riêng 1 hàng, chữ nhỏ hơn, gạch chân vàng rõ; 2 hàng căn giữa thẳng trục, khoảng cách đều, không lệch/vỡ; khoảng cách tới Hỏi đáp thoáng và cân đối.

### 7.9 Bỏ dòng tổng kết môn học + đồng nhất giãn cách toàn trang (Võ yêu cầu 13/11 ~22:18)
- Võ gửi ảnh cuối mục Môn học, lệnh: bỏ dòng tổng kết đi, làm định dạng đồng nhất tất cả, giãn dòng đều nhau, không được chỗ rộng chỗ dẹp.
- **Bỏ khối tổng kết:** đã xóa toàn bộ `<div class="subject-summary-wrap">` ở cuối mục Môn học trong `public/index.html` + `public/js/landing.js`, gồm dòng in đậm "9 môn học · 2.454 bài tập có chấm" và đoạn "Một buổi học khoảng 10 phút...". Mục Môn học giờ chỉ còn tiêu đề + mô tả trong header + 9 thẻ môn, giống các mục khác.
- **Đồng nhất giãn cách:** nguyên nhân không đều là do các lần vá trước để lại override riêng lẻ (testimonials 48px, FAQ 48px, link 0px, các mục khác 96px). Đã chuẩn hóa: `.aw-sec { padding-top: 96px }` → **64px** cho mọi mục trong `public/css/theme.css`; bỏ override `.sec-cau-chuyen` / `.sec-hoi-dap` (48px); `.sec-link-gia` từ 0 → **64px**. Giờ mọi khoảng cách giữa các mục đều 64px (mobile cũng 64px).
- Kiểm chứng: build landing.min.css 83,5 KB, bundle + JS build lại, restart PM2. Curl: trang chủ 200, summary-line = 0, mục Môn học còn tiêu đề + thẻ, link 2 hàng + FAQ đóng + testimonials nguyên. Kiểm chứng bằng mắt 22:22 ĐẠT: cả 2 dòng đã hết (không còn "9 môn học · 2.454 bài tập có chấm" lẫn đoạn "Một buổi học khoảng 10 phút..."); mục Môn học còn đủ 9 thẻ (4 lập trình + 5 ngoại ngữ), kết thúc ngay sau hàng thẻ ngoại ngữ. Giãn cách đều: các khoảng giữa mục đo được ~60–85px (Hero→Chơi thử ~85, Lộ trình→Môn học ~70, Môn học→Cách học ~70, Cách học→Câu chuyện thật ~60, Câu chuyện thật→link ~75, link→Hỏi đáp ~65, Hỏi đáp→Sẵn sàng ~75), không chỗ nào rộng/hẹp hẳn, tổng thể cân đối. Lưu ý: lần cuộn nhanh đầu vùng trước Hỏi đáp thoáng qua trông trống lớn, nhưng đó chỉ là hiệu ứng hiện dần khi cuộn — cuộn lại thì tiêu đề Hỏi đáp hiện bình thường, cách link ~65px, không phải lỗi giãn cách.

### 7.10 Đóng khung mục link bảng giá kiểu CTA nhưng nhỏ hơn (Võ yêu cầu 13/11 ~22:27)
- Võ gửi ảnh so sánh: khung CTA cuối trang "Sẵn sàng bắt đầu?" (hộp kem lớn, bo góc, bóng cứng) và mục link bảng giá (chữ trơ trên nền). Lệnh: đóng khung mục link như khung CTA nhưng nhỏ hơn, không cần to như thế.
- Đã bọc nội dung link trong `<div class="aw-link-box">` (`public/index.html` + `public/js/landing.js`) và thêm CSS `.aw-link-box` trong `public/css/theme.css`: nền kem `var(--cream)`, bo góc 20px, bóng cứng 4px 5px 0 `var(--cream2)`, viền vàng nhạt — cùng kiểu với `.aw-end` (60px padding, bo 28px, bóng 7px 8px) nhưng nhỏ gọn hơn: padding 28px 24px, `max-width: 640px` (chỉ ôm vừa 2 dòng chữ, không chiếm hết bề ngang), căn giữa. Không thêm hiệu ứng nảy `awBob` của khung CTA.
- Kiểm chứng: build landing.min.css 83,7 KB (có `aw-link-box`), bundle + JS build lại, restart PM2. Curl: trang chủ 200, khung link có, tiêu đề + link `/vi/pricing` nguyên, FAQ đóng hết, testimonials nguyên. Kiểm chứng bằng mắt 22:28 ĐẠT: 2 dòng nằm chung trong hộp nền kem/vàng nhạt, bo góc rõ, viền/bóng đổ vàng đậm ở cạnh dưới, cùng kiểu khung "Sẵn sàng bắt đầu?"; khung chỉ rộng ~2/3 bề ngang, căn giữa, cao vừa ôm 2 dòng chữ (khung CTA cuối trang rộng gần hết bề ngang và cao hơn hẳn); 2 dòng căn giữa, khoảng cách đều, không tràn/lệch/vỡ, khung nằm gọn giữa testimonials và tiêu đề Hỏi đáp.

### 7.11 Đóng khung nút "Bắt đầu bài học 2 phút đầu tiên" + hiệu ứng nảy (Võ yêu cầu 13/11 ~22:29)
- Võ gửi ảnh nút xanh cuối mục Cách học, lệnh: nút cũng đóng khung như khung link bảng giá và có hiệu ứng tương tự.
- Đã bọc nút trong `<div class="aw-btn-box">` (`public/index.html` + `public/js/landing.js`) và thêm CSS `.aw-btn-box` trong `public/css/theme.css`: nền kem `var(--cream)`, bo góc 20px, bóng cứng 4px 5px 0 `var(--cream2)`, viền vàng nhạt — cùng kiểu `.aw-link-box` nhưng ôm vừa nút (`width: fit-content`, padding 20px 28px) và có hiệu ứng nảy nhẹ `awBob 6s ease-in-out infinite` giống khung CTA `.aw-end`. Nút bên trong giữ nguyên (`.aw-pill.dark.lg`, link `#demoBox`).
- Kiểm chứng: build landing.min.css 84,0 KB (có `aw-btn-box`), bundle + JS build lại, restart PM2. Curl: trang chủ 200, khung nút có, nút dẫn `#demoBox` nguyên, khung link + FAQ đóng nguyên. Kiểm chứng bằng mắt 22:30–22:32: khung kem bo góc có bóng ✓, ôm vừa nút (~360px, đệm 20–30px mỗi phía) ✓, bố cục cân đối, nút bấm được ✓, NHƯNG hiệu ứng nảy KHÔNG quan sát được (nút đứng yên ở y=833 trong 5,3 giây; khung CTA cuối trang cũng đứng yên y=519) — `awBob` có trong CSS nhưng không thấy chuyển động. (Mục này sau đó bị Võ lệnh TRẢ LẠI — xem 7.11b.)

### 7.11b Đính chính: TRẢ LẠI nút "Bắt đầu bài học" (Võ làm rõ 13/11 ~22:32)
- Võ làm rõ: ý Võ là nút "Xem bảng giá" màu xanh, KHÔNG phải đóng khung nút "Bắt đầu bài học" — lệnh trả lại nút Cách học về như cũ. Đã gỡ `<div class="aw-btn-box">` và xóa CSS `.aw-btn-box` trong `public/css/theme.css` (nút về lại nút xanh trơn `.aw-pill.dark.lg`, link `#demoBox`).
- Lưu ý kiểm chứng 22:30–22:32 của khung nút (khung kem ✓, ôm vừa nút ✓, bố cục ✓) nhưng hiệu ứng nảy KHÔNG quan sát được (nút đứng yên ở y=833 trong 5,3 giây; khung CTA cuối trang cũng đứng yên y=519) — hiệu ứng `awBob` có trong CSS nhưng không thấy chuyển động trong lần đo này. Việc này không còn quan trọng vì khung nút đã bị gỡ theo lệnh Võ.
- Kiểm chứng curl sau khi trả lại: trang chủ 200, `aw-btn-box` = 0, nút "Bắt đầu bài học" nguyên.

### 7.12 Nút "Xem bảng giá" màu xanh + testimonials đổi badge thành "Mục tiêu" (Võ yêu cầu 13/11 ~22:31–22:32)
- **Nút "Xem bảng giá" màu xanh:** trong khung kem `.aw-link-box`, dòng dưới đổi từ chữ link gạch chân vàng (`.aw-link-gia`) thành nút xanh `.aw-pill.dark.lg` (cùng kiểu nút "Bắt đầu bài học"), vẫn dẫn tới `/vi/pricing`. Dòng trên "Học miễn phí, nâng cấp khi cần" (tiêu đề) giữ nguyên. Key EN "Xem bảng giá →" giữ nguyên.
- **Testimonials — bỏ "Đã hoàn thành khóa học", đổi thành "Mục tiêu":** Võ lệnh vì để "Đã hoàn thành khóa học" là nhận hoàn thành (không an toàn), đổi thành "Mục tiêu / Lộ trình gợi ý" thì an toàn mà vẫn bán được. Đã gỡ cả 3 badge `<span class="story-done">✓ Đã hoàn thành khóa học</span>` (An/Mai/Hùng) và thêm dòng `<p class="story-goal">` trước mỗi quote: An "Mục tiêu: Sau 30 ngày tự viết được game đoán số bằng Python"; Mai "Mục tiêu: Luyện nói với AI mỗi tối 10 phút để phỏng vấn thực tập"; Hùng "Mục tiêu: Sau 3 tháng thuộc 100 từ N5". CSS `.story-goal` mới trong `public/css/theme.css` (chữ 14.5px, "Mục tiêu:" đậm màu ink). en.json: xóa key badge "✓ Đã hoàn thành khóa học", thêm 4 key ("Mục tiêu:" + 3 mục tiêu), exact 4060.
- Kiểm chứng: build landing.min.css 83,5 KB (có `story-goal`, không còn `aw-btn-box`), bundle + JS build lại, restart PM2. Curl: trang chủ 200, badge = 0, đủ 3 dòng Mục tiêu, nút "Xem bảng giá" xanh = 1, khung link kem nguyên, FAQ đóng hết. Kiểm chứng bằng mắt 22:35 ĐẠT cả 3 điểm: (1) nút "Bắt đầu bài học 2 phút đầu tiên" đã là nút trơn, không còn khung kem; (2) trong khung kem, dòng trên "Học miễn phí, nâng cấp khi cần", bên dưới là NÚT XANH "Xem bảng giá →" (không còn chữ link gạch chân vàng); (3) cả 3 thẻ không còn badge "✓ Đã hoàn thành khóa học", mỗi thẻ có dòng "Mục tiêu:" đúng nội dung (An: Sau 30 ngày tự viết được game đoán số bằng Python; Mai: Luyện nói với AI mỗi tối 10 phút để phỏng vấn thực tập; Hùng: Sau 3 tháng thuộc 100 từ N5).

### 7.13 Đổi tiêu đề phụ + 3 quote testimonials thành dạng mục tiêu (Võ yêu cầu 13/11 ~22:36, "chuẩn 100%")
- Võ lệnh sửa nốt 2 dòng: (1) tiêu đề phụ mục Câu chuyện thật đổi thành "Chọn lộ trình cho người giống bạn - Học từng bước nhỏ mỗi ngày cùng LifeRivo." (thay cho "Những chia sẻ thật từ học viên đang tiến bộ mỗi ngày cùng LifeRivo."); (2) 3 câu trích dẫn đổi thành dạng mục tiêu ngôi thứ nhất "Mình muốn...": An "Mình muốn sau 30 ngày tự viết được game đoán số bằng Python."; Mai "Mình muốn luyện nói với AI mỗi tối 10 phút để phỏng vấn thực tập."; Hùng "Mình muốn sau 3 tháng thuộc 100 từ N5."
- File: `public/index.html` + `public/js/landing.js` (tiêu đề phụ `.sec-sub` + 3 `<blockquote class="story-quote">`). Dòng "Mục tiêu:" (thêm ở 7.12) giữ nguyên. en.json: xóa 4 key cũ (tiêu đề phụ + 3 quote), thêm 4 key mới, exact 4060.
- Kiểm chứng: build JS 43 file, restart PM2. Curl: trang chủ 200, tiêu đề phụ mới = 1, 3 quote mới mỗi cái = 1, đủ 3 dòng Mục tiêu, badge = 0, nút "Xem bảng giá" xanh nguyên. Kiểm chứng bằng mắt 22:38 ĐẠT: tiêu đề phụ đúng từng chữ "Chọn lộ trình cho người giống bạn - Học từng bước nhỏ mỗi ngày cùng LifeRivo."; cả 3 quote đúng dạng "Mình muốn..." từng chữ (An/Mai/Hùng).

### 7.14 Nới khoảng cách nút "Xem bảng giá" khỏi tiêu đề (Võ yêu cầu 13/11 ~22:38)
- Võ gửi ảnh khung kem, báo nút "Xem bảng giá" đang dính sát vào dòng tiêu đề "Học miễn phí, nâng cấp khi cần" phía trên, lệnh dịch nút xuống một chút.
- Đã tăng `margin-bottom` của `.aw-link-lead` trong `public/css/theme.css` từ 10px lên **18px** (khoảng cách giữa tiêu đề và nút). Không đổi gì khác.
- Kiểm chứng: build landing.min.css 83,5 KB, bundle build lại, restart PM2. Curl: trang chủ 200, khung link + nút xanh nguyên. Kiểm chứng bằng mắt 22:39 ĐẠT: nút xanh "Xem bảng giá →" không còn dính sát dòng tiêu đề "Học miễn phí, nâng cấp khi cần" — giữa tiêu đề và nút có khoảng trống màu kem rõ ràng, nút đã dịch xuống dưới một chút, bố cục thoáng hơn.

### 7.15 Cân dọc khung kem link bảng giá (Võ yêu cầu 13/11 ~22:40)
- Võ gửi ảnh khung kem, báo nội dung chưa cân dọc: mép trên của chữ và mép dưới chưa đều nhau.
- Nguyên nhân: tiêu đề `.aw-link-lead` không có `line-height` riêng nên dùng line-height mặc định (~1.5), tạo khoảng thừa vô hình trên/dưới chữ, làm mép trên chữ trông xa hơn mép dưới nút. Đã sửa trong `public/css/theme.css`: (1) thêm `line-height: 1.2` cho `.aw-link-lead` (siết hộp dòng ôm sát chữ); (2) chỉnh padding `.aw-link-box` từ `28px 24px` thành `26px 24px 28px` (trên 26px, dưới 28px) để bù khoảng thừa còn lại ở phía trên.
- Kiểm chứng: build landing.min.css 83,5 KB, bundle build lại, restart PM2. Curl: trang chủ 200. Kiểm chứng bằng mắt 22:41 ĐẠT: đo pixel trên màn hình 1920×999 — khung kem cao 138px (y 520–657), mép trên chữ y=544 (khoảng trên 24px), mép dưới nút y=629 (khoảng dưới 28px); chênh lệch 4px (~3% chiều cao khung), nhìn bằng mắt thường gần như bằng nhau, không thấy lệch rõ.

### 7.16 Câu trả lời FAQ "Có miễn phí không?" thiếu ý Free có 1 buổi phỏng vấn AI (Võ yêu cầu 13/11 ~22:42)
- Võ gửi ảnh câu "Có miễn phí không?" đang mở, báo "câu này chưa khớp". Đối chiếu: câu trả lời cũ chỉ nói Pro có "phỏng vấn AI không giới hạn", không nhắc Free được 1 buổi phỏng vấn AI miễn phí — trong khi trang Bảng giá (seo.js:234) và thẻ Free đều ghi rõ "Gói Free có 1 buổi phỏng vấn AI miễn phí". Người đọc FAQ sẽ tưởng phỏng vấn AI chỉ dành cho Pro.
- Đã sửa trong `public/index.html` + `public/js/landing.js`: thêm câu "Gói Free có 1 buổi phỏng vấn AI miễn phí." vào cuối câu trả lời (khớp thứ tự câu dẫn của trang Bảng giá). en.json: xóa key cũ, thêm key mới (exact vẫn 4060).
- Câu trả lời mới: "Tạo tài khoản và học miễn phí Giai đoạn 1 của Python cùng toàn bộ các cấp của C, C++, Java và 5 ngoại ngữ. Gói Pro mở thêm Giai đoạn 2–3 của Python, phỏng vấn AI không giới hạn và báo cáo học tập chi tiết. Gói Free có 1 buổi phỏng vấn AI miễn phí."
- Kiểm chứng: build JS (43 file, −30%), restart PM2. Curl: trang chủ 200, câu mới = 1, câu cũ đã hết (1 kết quả "báo cáo học tập chi tiết.</p>" còn lại là của FAQ "Gói Pro gồm những gì?", đúng). Kiểm chứng bằng mắt 22:45 ĐẠT: mở câu "Có miễn phí không?", câu trả lời hiển thị đầy đủ cả 3 ý — (1) miễn phí Giai đoạn 1 Python + toàn bộ C/C++/Java + 5 ngoại ngữ; (2) Pro mở thêm Giai đoạn 2–3 Python, phỏng vấn AI không giới hạn, báo cáo chi tiết; (3) Gói Free có 1 buổi phỏng vấn AI miễn phí. Không thiếu ý nào.

## 8. Chính sách mới: free toàn bộ, chỉ AI và Phỏng vấn là Pro (Võ lệnh 13/11 ~22:47)
- Võ chốt chính sách: toàn bộ nội dung học miễn phí; chỉ trợ lý AI và phỏng vấn AI là tính năng Pro. Free giữ trial: 3 lượt hỏi AI/ngày + 1 buổi phỏng vấn AI miễn phí; Pro: 100 lượt AI/ngày, phỏng vấn không giới hạn, báo cáo chi tiết.
- **Backend (đã mở khóa):** `lessons.js` — 7 bài Python GĐ2–3 `pro: true → false`, GĐ2/GĐ3 `pro: true → false`; GĐ3 đổi tên bỏ "Pro" ("Thử thách thuật toán Pro" → "Thử thách thuật toán"), mô tả GĐ2/GĐ3 bỏ câu "Dành cho thành viên Pro". `modules/seo.js` EN: Stage 3 "Pro Algorithm Challenges" → "Algorithm Challenges", bỏ "For Pro members." / "For Pro members only." API `/api/lessons`: 13 bài, locked=0, pro=0 (toàn bộ mở). Gate phỏng vấn Free 1 buổi đã có sẵn (`modules/speaking.js`, bảng `learning_activities` activity_type='free_interview'); gate AI Free 3/ngày, Pro 100/ngày đã có sẵn (`modules/ai.js`, settings aiFreeDaily=3, aiProDaily=100). Không đổi hạn mức.
- **Câu chữ (đã sửa, khớp chính sách):** FAQ "Có miễn phí không?" + "Gói Pro gồm những gì?" (index.html + landing.js + en.json); trang Bảng giá (seo.js:234 câu dẫn, 235 thẻ Free "Toàn bộ giáo trình Python", 236 thẻ Pro thêm "Trợ lý AI 100 lượt/ngày"); Quy định gói (seo.js:293 VI + 334 EN); Điều khoản (seo.js:260 VI "Tất cả bài học miễn phí", 301 EN "All lessons are free"); bảng giá trong app (`pro.js:382` thẻ Free "Toàn bộ Python", 163 upsell 402 bỏ nhắc GĐ2–3); `proBenefits()` trong `modules/api.js` (bỏ "Mở khóa Giai đoạn 2–3", thêm "Trợ lý AI 100 lượt hỏi mỗi ngày"). en.json exact giữ 4060. Kiểm chứng grep: không còn "Giai đoạn 2–3"/"Stages 2–3" nào gắn với Pro.
- **Chữ trắng mờ trang pháp lý (Võ báo 22:52):** trang Quy định/hoàn tiền dùng `.legal p,li { color: var(--ink-2) }` — khi máy ở dark mode, `theme-init.js` đặt `data-theme="dark"` làm `--ink-2` thành `#C9D3E1` (sáng) trong khi khung `.legal` có nền trắng cứng `#fff` → chữ sáng trên nền trắng, không đọc được. Đã sửa `public/css/public.css`: `.legal p,li` và `.legal > p:first-of-type` dùng màu đậm cố định `#3D4B63` (không phụ thuộc theme). Kiểm chứng bằng mắt 22:56 ĐẠT: chữ đậm xám-xanh trên nền trắng, tương phản cao, đọc rõ.
- Kiểm chứng curl (sau build JS + restart): trang chủ 200, FAQ mới = 1, FAQ cũ = 0, pricing 200, câu dẫn mới = 1, thẻ Free "Toàn bộ giáo trình Python" = 1, thẻ Pro "Trợ lý AI 100 lượt/ngày" = 1, lessons API 13 bài locked=0 pro=0, membership không còn "Giai đoạn 2". Kiểm chứng bằng mắt free-all 22:58 ĐẠT cả 3 điểm: (1) FAQ "Có miễn phí không?" ghi "học miễn phí toàn bộ nội dung" và "Chỉ trợ lý AI và phỏng vấn AI là tính năng Pro", không còn "Giai đoạn 2–3" là Pro; (2) FAQ "Gói Pro gồm những gì?" ghi "trợ lý AI 100 lượt hỏi mỗi ngày, phỏng vấn AI không giới hạn và báo cáo học tập chi tiết", không còn "Giai đoạn 2–3"; (3) trang Bảng giá câu dẫn "Toàn bộ nội dung học đều miễn phí", thẻ Free "Toàn bộ giáo trình Python, chấm tự động", thẻ Pro "Trợ lý AI 100 lượt/ngày".

### 8.1 Thống nhất chân trang về "© 2026 LifeRivo. All rights reserved." (Võ lệnh 13/11 ~23:03)
- Võ báo chân trang chính là "© 2026 LifeRivo. All rights reserved." nhưng trang pháp lý (Quy định gói, Điều khoản...) lại ghi "© 2026 LifeRivo. Học lập trình và ngoại ngữ theo lộ trình." — hai mẫu khác nhau. Võ chọn giữ nguyên tiếng Anh "All rights reserved." cho mọi nơi.
- Đã sửa `modules/seo.js` (chuỗi `foot` dùng cho chân trang pháp lý): VI "Học lập trình và ngoại ngữ theo lộ trình." → "All rights reserved."; EN "Programming and languages, step by step." → "All rights reserved." Chân trang chính (server.js SSR, index.html, landing.js) vốn đã là "All rights reserved." nên không đổi.
- Kiểm chứng: restart PM2. Curl: membership VI 200 (footer mới = 1, footer cũ = 0), membership EN 200 (footer mới = 1), trang chủ 200. Kiểm chứng bằng mắt 23:04 ĐẠT: cuối trang Quy định gói ghi đúng "© 2026 LifeRivo. All rights reserved.", không còn câu "Học lập trình và ngoại ngữ theo lộ trình"; dòng mô tả phía trên chân trang vẫn là "Nền tảng học lập trình và ngoại ngữ bằng tiếng Việt." (đây là câu giới thiệu riêng, không phải dòng bản quyền).

### 8.2 Ẩn đơn giá — tất cả gói chỉ hiện "Liên hệ" + nút "Liên hệ nâng cấp" (Võ lệnh 13/11 ~23:08–23:13)
- Võ lệnh: bật "Liên hệ" cho tất cả gói; ở chỗ xem bảng giá chỉ để 2 lựa chọn "Xem bảng giá" và "Liên hệ nâng cấp"; trước mắt để "Liên hệ nâng cấp"; KHÔNG hiển đơn giá, chỉ để liên hệ; khi nào cần Võ tự bật giá lên (bằng ô "Báo giá" trong bảng quản lý gói ở trang quản trị).
- Đã làm (DB + code, có backup /tmp/plans.bak-20261113-quoteall.sql + /tmp/seo.js.bak-20261113-lienhe + /tmp/pro.js.bak-20261113-lienhe + /tmp/landing.js.bak-20261113-lienhe + /tmp/index.html.bak-20261113-lienhe + /tmp/en.json.bak-20261113-lienhe):
  - DB plans: quote_only = 1 cho cả 9 gói (Pro 1/3/12, Family 1/3/12, Teacher Starter, Teacher Standard, Teacher School) — giá trong DB vẫn giữ nguyên (49k/129k/449k...), chỉ ẩn hiển thị.
  - modules/seo.js: trang Bảng giá công khai + trang môn học + meta description giờ tôn trọng quoteOnly — thẻ gói hiện "Liên hệ" thay cho tiền, ẩn dòng ≈/tháng, nút "Chọn gói" → "Liên hệ nâng cấp" khi quoteOnly. Bật lại giá chỉ cần bỏ tick "Báo giá" ở trang quản trị.
  - public/js/pro.js (khu mua gói trong app): nút "Liên hệ báo giá" → "Liên hệ nâng cấp"; dòng phụ "Báo giá theo số học sinh" chỉ giữ cho gói Teacher, gói Pro/Family đổi thành "Liên hệ để nâng cấp"; modal + toast tương ứng đổi sang "nâng cấp".
  - FAQ "Gói Pro gồm những gì?" (index.html + landing.js + en.json): bỏ "Giá 49.000đ cho 1 tháng, 129.000đ cho 3 tháng hoặc 449.000đ cho 12 tháng." → "Liên hệ để nâng cấp." (EN: "Contact us to upgrade."); exact giữ 4060.
- Kiểm chứng: curl — trang Bảng giá VI: 9/9 thẻ trả phí hiện "Liên hệ" + nút "Liên hệ nâng cấp", 49.000/129.000/449.000 = 0; trang chủ 200, "49.000" = 0, "Liên hệ để nâng cấp" = 1. Kiểm chứng bằng mắt 23:15 ĐẠT: cả 9 thẻ đều "Liên hệ" + "Liên hệ nâng cấp", không còn "Chọn gói" hay giá; thẻ Free vẫn 0đ.
- CÒN CHỜ VÕ SỬA (phần Võ cần làm): kênh liên hệ hiện là study@liferivo.com (cài trong settings.supportContact) nhưng địa chỉ này KHÔNG có MX nên mail gửi tới sẽ không nhận được — khách bấm "Liên hệ nâng cấp" sẽ được hướng dẫn liên hệ một địa chỉ không nhận được thư. Võ cần: hoặc cấu hình MX cho liferivo.com, hoặc đổi kênh liên hệ sang Zalo/số điện thoại/email đang nhận được (sửa ở trang quản trị, ô "Liên hệ hỗ trợ thanh toán").

### 8.3 Ẩn/hiện từng nút chân trang từ admin (Võ lệnh 13/11 ~23:16)
- Võ lệnh: mấy nút chân trang (Điều khoản, Quyền riêng tư, Thanh toán, Hoàn tiền, Bảng giá) phải chỉnh được trong admin — ẩn hoặc hiện nút nào tùy ý.
- Đã làm (cài đặt mới `hiddenFooterLinks`, mặc định hiện đủ; backup /tmp/settings.js.bak-20261113-footerlinks, /tmp/server.js.bak-20261113-footerlinks, /tmp/seo.js.bak-20261113-footerlinks2, /tmp/landing.js.bak-20261113-footerlinks):
  - settings.js: thêm schema `hiddenFooterLinks` (nhóm "Trang giới thiệu", kiểu multi, pub: true) — tick nút muốn ẩn, bỏ tick để hiện lại.
  - server.js: GET/PUT /api/admin/settings thêm nguồn `footerLinks` (6 nút: terms, privacy, payment, refund, pricing, membership); footer SSR trang chủ lọc theo `hidden("hiddenFooterLinks")`.
  - modules/seo.js: chân trang trang pháp lý (.pub-foot) lọc theo `S.hiddenFooterLinks`.
  - public/js/landing.js: footer client lọc 2 lớp — `buildLandingMarkup()` lọc lúc vẽ + `hydrateLanding()` gỡ link đã ẩn khỏi HTML tĩnh (trang chủ dùng HTML tĩnh sẵn có nên chỉ lọc lúc vẽ là không đủ; đây là nguyên nhân lần kiểm tra đầu KHÔNG ĐẠT).
- Kiểm chứng: thử ẩn Hoàn tiền + Bảng giá (ghi settings, restart) — kiểm chứng bằng mắt lần 1 KHÔNG ĐẠT (vẫn đủ 5 link, do lọc chưa chạy tới HTML tĩnh); sau khi vá hydrateLanding, kiểm chứng lần 2 ĐẠT 23:25: chân trang chỉ còn Điều khoản, Quyền riêng tư, Thanh toán. Đã khôi phục hiện đủ 5 nút sau khi thử xong (hiddenFooterLinks = []).
- Cách dùng (Võ tự chỉnh): trang quản trị → tab Cài đặt → nhóm "Trang giới thiệu" → mục "Ẩn nút chân trang" → tick nút muốn ẩn → Lưu cài đặt. Không cần đụng code.

### 8.4 Xác minh quyền sở hữu Google Search Console cho study.liferivo.com (Võ lệnh 13/11 ~23:39)
- Võ gửi file xác minh `google1f51825865324b09.html` (nội dung: `google-site-verification: google1f51825865324b09.html`) và nhờ tải lên + xác minh.
- Đã tải lên `/root/hoc-lap-trinh-study/public/google1f51825865324b09.html`. Kiểm chứng: truy cập local (127.0.0.1:8091) 200 + qua domain https://study.liferivo.com/google1f51825865324b09.html 200, đúng nội dung. KHÔNG xóa file này (Google yêu cầu giữ để duy trì xác minh).
- Nút XÁC MINH trong Search Console cần tài khoản Google của Võ — đã nhờ trình duyệt bấm giúp nhưng trình duyệt dừng lại vì cần đăng nhập Google (không có tài khoản Google lưu sẵn) và Võ chưa nhập tài khoản vào ô đăng nhập. File xác minh vẫn đang live, Võ chỉ cần tự mở Search Console và bấm XÁC MINH là xong.


### 8.5 Google Analytics 4 + Google Search Console (Võ lệnh 14/11 ~07:39 — ĐANG DỞ, chờ 2 mã từ Võ)
- **Đã rà:** GA4/gtag CHƯA có trong code (chưa gắn thẻ nào). Meta google-site-verification ĐÃ CÓ SẴN cơ chế: server.js:52 `gsvMeta()` đọc biến môi trường `GOOGLE_SITE_VERIFICATION`, render vào `<head>` trang chủ qua placeholder `__GSV_META__` (server.js:2114) — chỉ cần Võ đưa nội dung `content` rồi set env + restart là xong.
- **Sitemap ĐÃ ĐỦ:** https://study.liferivo.com/sitemap.xml có 60 URL — trang chủ, 18 trang môn học (/khoa-hoc/ × 2 ngôn ngữ), 26 trang bài học, trang Bảng giá, 10 trang pháp lý. Võ chỉ cần gửi link này cho Search Console (mục Sơ đồ trang web).
- **Hỏi đáp — ĐÃ XONG 14/11:** thêm dòng quyền riêng tư vào câu "Dữ liệu có an toàn không?" (landing.js + index.html + en.json:3990, exact giữ 4060): "Chúng tôi dùng Google Analytics để thống kê lượt truy cập ẩn danh, không thu thập mật khẩu hay nội dung chat riêng tư." (EN: "We use Google Analytics for anonymous visit statistics; we do not collect passwords or private chat content.") Build OK, trang chủ 200, kiểm chứng curl thấy đủ 2 cụm từ.
- **Measurement ID GA4 — Võ đưa 14/11 ~07:51: `G-7J1Q2J8ND6`. ĐÃ GẮN XONG 14/11:**
  - Thẻ gtag.js vào `<head>` toàn trang: `public/index.html` (SPA: trang chủ + app, inline config dùng nonce `__CSP_NONCE__`) + `modules/seo.js` layout() (trang pháp lý + trang SEO renderPublic, nonce tạo mới mỗi request ở server.js:2082, truyền qua renderPublic → layout). Helper `window.__plGA(ev)` định nghĩa trong inline script, chỉ gửi tên event.
  - CSP đã mở (server.js): script-src thêm `https://www.googletagmanager.com`; connect-src thêm `https://www.google-analytics.com https://*.google-analytics.com`; img-src thêm `https://www.google-analytics.com` (fallback pixel).
  - 4 event (chỉ tên event, KHÔNG gửi nội dung): `click_choi_thu_ngay` (landing.js initHeroCta); `click_dang_ky` (landing.js trackFunnel khi event = register_click — bắt cả 3 nút Đăng ký: header, modal, cuối trang); `hoan_thanh_bai_hoc` (pro.js practice submit + quiz submit, khi server trả `completed: true`); `chat_ai_gui_tin_nhan` (ai-widget.js đầu hàm ask() — không gửi nội dung câu hỏi). KHÔNG track mật khẩu, KHÔNG track nội dung chat riêng tư.
  - Kiểm chứng curl ĐẠT: trang chủ 200 (gtag + __plGA có), CSP chứa cả 2 domain GA, /vi/terms 200 (gtag + nonce), landing.min.js/pro.min.js/ai-widget.min.js chứa đủ 4 tên event, sitemap vẫn 200. Kiểm chứng bằng mắt ĐẠT 14/11 ~08:04 (trình duyệt cloud, khách): thẻ gtag.js có trong <head>, file gtag.js tải trực tiếp thành công, KHÔNG lỗi CSP (header cho phép cả 2 domain GA), nút "Chơi thử ngay" bấm được và cuộn tới #demoBox, code event click_choi_thu_ngay có trong landing.min.js. GIỚI HẠN: trình duyệt cloud không mở được DevTools Console nên chưa đọc trực tiếp window.dataLayer lúc chạy — xác nhận ở mức code nguồn + hành vi thực tế, không phải bằng lệnh Console; không phát hiện lỗi GA4 nào. Võ tự mở GA4 → Báo cáo thời gian thực để thấy lượt truy cập đổ về.
- **CÒN CHỜ Võ đưa 1 mã:** nội dung thẻ meta google-site-verification (Search Console → Cài đặt → Xác minh quyền sở hữu → phương thức Thẻ HTML → chuỗi trong content="..."). Cơ chế đã sẵn (server.js:52 `gsvMeta()` đọc env `GOOGLE_SITE_VERIFICATION`) — khi có mã chỉ cần set env + restart. Lưu ý: file HTML xác minh hôm qua vẫn live, thẻ meta là cách xác minh thứ hai.
- Backup: /tmp/landing.js.bak-20261114-ga4, /tmp/index.html.bak-20261114-ga4, /tmp/en.json.bak-20261114-ga4.


### 8.6 Google Tag Manager GTM-W7Q4KGDG (Võ lệnh 14/11 ~08:05 — ĐANG DỞ, chờ test Preview)
- **Đã gắn XONG 14/11:** thẻ GTM chuẩn vào ngay sau `<head>` toàn trang — `public/index.html` (SPA: trang chủ + trang học + chat AI, inline script dùng nonce `__CSP_NONCE__`) + `modules/seo.js` layout() (trang pháp lý + trang SEO renderPublic, nonce mỗi request). Thêm phần `<noscript>` iframe ngay sau `<body>` ở cả 2 nơi (chuẩn GTM). Chỉ 1 vùng chứa duy nhất GTM-W7Q4KGDG, không trùng (mỗi trang có đúng 1 script head + 1 noscript).
- **Loại trừ trang quản trị:** admin dùng chung index.html SPA (route `#/quan-tri`), nên GTM được bọc điều kiện `if (!/^#\/quan-tri/.test(location.hash))` — mở trực tiếp trang quản trị thì GTM không tải. Lưu ý: nếu vào trang chủ trước rồi mới chuyển sang quản trị trong cùng phiên thì GTM đã tải từ trang chủ nên vẫn chạy (giới hạn của SPA).
- **CSP:** script-src đã cho phép googletagmanager.com từ trước (mục GA4); thêm `frame-src 'self' https://www.googletagmanager.com` cho iframe noscript.
- **Kiểm chứng curl ĐẠT:** trang chủ 200 (GTM ngay sau `<head>` dòng 4, trước GA4 dòng 20; đúng 1 script head + 1 noscript; GA4 vẫn còn); /vi/terms 200 (GTM đủ script + noscript); gtm.js tải trực tiếp 200; domain 200.
- **LƯU Ý QUAN TRỌNG — trùng lặp GA4:** GA4 đang gắn trực tiếp bằng gtag.js (G-7J1Q2J8ND6). Nếu Võ cấu hình thêm thẻ GA4 trong GTM với cùng Measurement ID thì lượt xem trang sẽ bị đếm 2 lần (1 lần gtag trực tiếp + 1 lần qua GTM). Cách tránh: hoặc gỡ gtag trực tiếp và chỉ dùng GA4 qua GTM, hoặc trong GTM không thêm thẻ GA4 (chỉ dùng GTM cho các thẻ khác như Facebook Pixel).
- **Test Preview (Kiểm thử) — CHƯA LÀM ĐƯỢC 14/11 ~08:25 (không phải lỗi thẻ GTM):** đã đăng nhập Google thành công bằng vanthancdmmt34@gmail.com (Võ tự nhấn "Có" trên điện thoại để qua xác minh 2 bước) và vào được tagmanager.google.com, nhưng tài khoản này KHÔNG có quyền truy cập vào bất kỳ tài khoản GTM nào (trang chủ GTM trống, chỉ hiện "Nhấp vào đây để tạo một tài khoản") nên không mở được vùng chứa GTM-W7Q4KGDG để bấm Preview. Để test được, Võ cần 1 trong 2 cách: (a) đăng nhập GTM bằng tài khoản Google khác có quyền vào vùng chứa GTM-W7Q4KGDG, hoặc (b) cấp quyền truy cập GTM cho vanthancdmmt34@gmail.com. Thẻ GTM trên trang vẫn đúng và đã kiểm chứng bằng curl; chỉ bước Preview trong giao diện GTM là chưa chạy được.
- **SỬA CSP 14/11 ~08:34 (Võ phát hiện từ ảnh chụp lỗi CSP):** CSP chặn các beacon dạng ảnh của GTM tới `https://www.googletagmanager.com/td` (gỡ lỗi Preview) và `/a` (gửi dữ liệu) vì `img-src` chỉ cho phép google-analytics.com — ĐÂY LÀ NGUYÊN NHÂN KHIẾN PREVIEW KHÔNG KẾT NỐI ĐƯỢC (beacon gỡ lỗi /td bị chặn nên Tag Assistant không thấy thẻ). Đã sửa: thêm `https://www.googletagmanager.com` vào `img-src` và `connect-src` (server.js), restart, kiểm chứng header CSP mới đã chứa đủ, trang chủ 200, GTM + GA4 vẫn còn. Võ thử lại Preview sau khi sửa này.
- **PREVIEW ĐÃ NỐI ĐƯỢC 14/11 ~08:41 (Võ gửi ảnh):** sau khi sửa CSP + tải lại cứng, Tag Assistant báo "Đã liên kết" với liferivo.com, tìm thấy 1 thẻ Google (GTM-W7Q4KGDG), vùng chứa đã tải, các sự kiện Container Loaded / DOM Ready / Window Loaded đều có. CSP fix đã giải quyết đúng nguyên nhân.
- **PHÁT HIỆN QUAN TRỌNG — vùng chứa GTM đã có sẵn thẻ GA4:** trong Preview, mục "Các thẻ chưa được kích hoạt" hiện thẻ "Google Analytics G-7J1Q2J8ND6" (cùng Measurement ID với gtag.js gắn trực tiếp). Khi thẻ này kích hoạt (thường ở sự kiện Page View / Container Loaded) thì lượt xem sẽ bị đếm 2 lần (1 lần gtag trực tiếp + 1 lần qua GTM). Võ cần chọn 1 trong 2: (a) giữ GA4 qua GTM, gỡ gtag.js trực tiếp khỏi trang; hoặc (b) gỡ thẻ GA4 khỏi vùng chứa GTM, giữ gtag trực tiếp. Chờ Võ quyết.
- **Võ CHỌN (a) 14/11 ~08:42: giữ GA4 qua GTM, gỡ gtag.js trực tiếp — ĐÃ GỠ XONG 14/11:** đã gỡ thẻ gtag.js (loader + `gtag('config')`) khỏi `public/index.html` và `modules/seo.js` layout(). Giữ lại helper `window.__plGA(ev)` nhưng đổi thành đẩy event qua dataLayer (`dataLayer.push({event: ev})`) để GTM nhận — 4 event (click_choi_thu_ngay, click_dang_ky, hoan_thanh_bai_hoc, chat_ai_gui_tin_nhan) vẫn còn nguyên trong bundle, không đổi code gọi. CSP giữ nguyên (đã đủ cho GTM + GA4 qua GTM). Kiểm chứng: trang chủ 200, gtag.js trực tiếp = 0, GTM = 2 (script + noscript), helper dataLayer.push = 1, /vi/terms 200, domain 200.
- **VIỆC VÕ CẦN LÀM TRONG GTM (để 4 event tới được GA4):** dataLayer.push chỉ đưa event vào GTM, chưa tự gửi sang GA4. Võ cần tạo trong vùng chứa GTM-W7Q4KGDG, cho mỗi event trong 4 event trên: 1 Trình kích hoạt (Trigger) loại "Sự kiện tùy chỉnh" (Custom Event) với tên sự kiện đúng tên event + 1 Thẻ (Tag) loại "Google Analytics: Sự kiện GA4" (GA4 Event) với tên sự kiện tương ứng, gắn trigger đó. Thẻ GA4 Configuration có sẵn trong vùng chứa chỉ gửi page_view, không tự gửi 4 event này.
- Backup: /tmp/index.html.bak-20261114-gtm, /tmp/seo.js.bak-20261114-gtm, /tmp/server.js.bak-20261114-gtm.
