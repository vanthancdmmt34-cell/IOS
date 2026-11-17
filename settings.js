import { BANKS } from "./modules/vietqr.js";
// System settings configurable by admin in the Admin page (2.2.0).
// Each entry has: key, group, type, label, description, default, constraints. Stored in site_settings table.

export const SETTINGS_GROUPS = [
  ["general", "Thông tin chung", "Tên hệ thống, lời giới thiệu, màu chủ đạo và các dòng chữ hiện cho mọi người."],
  ["account", "Tài khoản và đăng ký", "Ai được tạo tài khoản, thời gian giữ đăng nhập và chế độ bảo trì."],
  ["learning", "Học tập và làm bài", "Cách khóa bài, đáp án mẫu và ghi chú học tập."],
  ["scoring", "Chấm điểm", "Hệ số điểm theo lần nộp. Điểm tối đa mỗi bài vẫn là 10, bài kiểm tra 20."],
  ["exam", "Bài kiểm tra", "Bật tắt bài kiểm tra và giá trị mặc định cho chương mới."],
  ["game", "Game hóa và cộng đồng", "Cấp độ, huy hiệu, chuỗi ngày, xếp hạng, đánh giá."],
  ["landing", "Trang giới thiệu", "Những gì khách chưa đăng nhập nhìn thấy."],
  ["commerce", "Gói Pro và thanh toán", "Bán gói Pro bằng chuyển khoản VietQR vào tài khoản của bạn (cá nhân hoặc doanh nghiệp)."],
  ["ai", "AI Tutor", "Hạn mức hỏi AI theo gói và độ dài câu hỏi, câu trả lời."],
  ["content", "Ẩn bớt nội dung", "Ẩn khóa học, lộ trình hoặc chương với học viên. Giáo viên vẫn thấy tất cả."],
];

export const BRAND_COLORS = {
  liferivo: ["Xanh LifeRivo", "#526BFF", "#4055DB"],
  tim: ["Tím mực", "#5B3FD6", "#3C24A8"],
  duong: ["Xanh dương", "#1D5FD1", "#13449C"],
  la: ["Xanh lá", "#0E8A5F", "#0A6645"],
  ngoc: ["Xanh ngọc", "#0E7C86", "#095A61"],
  do: ["Đỏ", "#C8233A", "#931628"],
  cam: ["Cam", "#D9640B", "#A44A06"],
  hong: ["Hồng", "#C2287A", "#8F1A59"],
};

export const SETTINGS_SCHEMA = [
  // General info
  { key: "siteName", group: "general", type: "text", label: "Tên hệ thống", help: "Hiện ở logo, tiêu đề tab và chứng nhận.", def: "LifeRivo", max: 40, pub: true },
  { key: "tagline", group: "general", type: "text", label: "Dòng giới thiệu ngắn", help: "Hiện ở tiêu đề tab trình duyệt.", def: "Learn today. Grow tomorrow.", max: 80, pub: true },
  { key: "logoMode", group: "general", type: "select", label: "Cách hiện logo", help: "Tải ảnh logo ở khung Logo phía trên. Chọn “Chỉ logo” nếu ảnh đã có sẵn tên.", options: [["with_name", "Logo + tên hệ thống"], ["only", "Chỉ logo"]], def: "with_name", pub: true },
  { key: "brandColor", group: "general", type: "select", label: "Màu chủ đạo", options: Object.entries(BRAND_COLORS).map(([k, v]) => [k, v[0]]), def: "liferivo", pub: true },
  { key: "orgName", group: "general", type: "text", label: "Tên trường hoặc lớp", help: "Hiện trên chứng nhận và chân trang. Để trống nếu không cần.", def: "", max: 80, pub: true },
  { key: "footerText", group: "general", type: "text", label: "Dòng chữ chân trang", def: "Nền tảng học ngoại ngữ bằng tiếng Việt.", max: 160, pub: true },
  { key: "forgotText", group: "general", type: "textarea", label: "Hướng dẫn khi quên mật khẩu", help: "Hiện dưới nút Đăng nhập. Có thể ghi số điện thoại hoặc phòng của giáo viên.", def: "Học viên liên hệ giáo viên để được đặt lại. Giáo viên quên mật khẩu thì dùng script đặt lại trên VPS.", max: 400, pub: true },

  // Accounts
  { key: "allowRegister", group: "account", type: "bool", label: "Cho phép tự tạo tài khoản", help: "Tắt nếu chỉ giáo viên tạo tài khoản cho học viên (trong tab Học viên).", def: true, pub: true },
  { key: "registerCode", group: "account", type: "text", label: "Mã lớp khi đăng ký", help: "Nếu điền, người đăng ký phải nhập đúng mã này. Để trống để không cần mã.", def: "", max: 40 },
  { key: "sessionDays", group: "account", type: "number", label: "Giữ đăng nhập (ngày)", help: "Áp dụng cho lần đăng nhập mới.", def: 30, min: 1, max: 180 },
  { key: "allowNameChange", group: "account", type: "bool", label: "Học viên được tự đổi tên hiển thị", def: true },
  { key: "maintenance", group: "account", type: "bool", label: "Chế độ bảo trì", help: "Học viên không đăng nhập và không làm bài được. Giáo viên vẫn vào bình thường.", def: false, pub: true },
  { key: "maintenanceText", group: "account", type: "textarea", label: "Thông báo bảo trì", def: "Hệ thống đang bảo trì, các bạn quay lại sau ít phút nhé.", max: 400, pub: true },

  // Learning
  { key: "sampleAfter", group: "learning", type: "number", label: "Mở đáp án mẫu sau số lần nộp", help: "0 là xem ngay không cần nộp. Mặc định 1.", def: 1, min: 0, max: 20 },
  { key: "sampleEnabled", group: "learning", type: "bool", label: "Cho xem đáp án mẫu", def: true },
  { key: "notesEnabled", group: "learning", type: "bool", label: "Ghi chú và đánh dấu bài", def: true },

  // Grading
  { key: "factor1", group: "scoring", type: "number", label: "Lần nộp 1 được (% điểm)", def: 100, min: 0, max: 100 },
  { key: "factor2", group: "scoring", type: "number", label: "Lần nộp 2 được (% điểm)", def: 80, min: 0, max: 100 },
  { key: "factor3", group: "scoring", type: "number", label: "Từ lần nộp 3 được (% điểm)", def: 60, min: 0, max: 100 },

  // Exams
  { key: "examAutoSubmit", group: "exam", type: "bool", label: "Tự nộp khi hết giờ", def: true },

  // Gamification
  { key: "gamification", group: "game", type: "bool", label: "Cấp độ, huy hiệu, chuỗi ngày, màn hình chúc mừng", def: true },
  { key: "defaultDailyGoal", group: "game", type: "number", label: "Mục tiêu ngày mặc định (bài)", def: 3, min: 1, max: 20 },
  { key: "leaderboard", group: "game", type: "bool", label: "Bảng xếp hạng", def: true },
  { key: "leaderboardAnon", group: "game", type: "bool", label: "Ẩn tên người khác trên bảng xếp hạng", help: "Học viên chỉ thấy tên mình, người khác hiện là Học viên #hạng.", def: false },
  { key: "ratingEnabled", group: "game", type: "bool", label: "Cho học viên đánh giá hệ thống", def: true },

  // Landing page
  { key: "heroLead", group: "landing", type: "textarea", label: "Đoạn giới thiệu đầu trang", def: "Học ngoại ngữ thật dễ hiểu: luyện nói chấm từng từ, phát âm, phỏng vấn thử và chứng nhận." },
  { key: "mascotText", group: "landing", type: "text", label: "Lời chào của linh vật", def: "Xin chào! Hôm nay bạn muốn học gì?", max: 120, pub: true },
  { key: "showStudentCount", group: "landing", type: "bool", label: "Hiện số học viên (tự ẩn khi bằng 0)", def: true, pub: true },
  { key: "showVisits", group: "landing", type: "bool", label: "Hiện số lượt truy cập ở chân trang", def: true, pub: true },
  { key: "showReviews", group: "landing", type: "bool", label: "Hiện nhận xét của học viên", def: true, pub: true },
  { key: "showToc", group: "landing", type: "bool", label: "Hiện mục lục chương trình", def: true, pub: true },
  { key: "showFaq", group: "landing", type: "bool", label: "Hiện phần hỏi đáp", def: true, pub: true },
  { key: "hiddenFooterLinks", group: "landing", type: "multi", label: "Ẩn nút chân trang", source: "footerLinks", def: [], pub: true, help: "Tick nút muốn ẩn khỏi chân trang (Điều khoản, Quyền riêng tư, Thanh toán, Hoàn tiền, Bảng giá). Bỏ tick để hiện lại." },
  { key: "facebookUrl", group: "landing", type: "url", label: "Liên kết Facebook", help: "Dán URL Trang Facebook hoặc hồ sơ chính thức, ví dụ https://www.facebook.com/ten-trang. Để trống nếu chưa có.", def: "", max: 300, pub: true },
  { key: "zaloUrl", group: "landing", type: "url", label: "Liên kết Zalo", help: "Dán liên kết Zalo cá nhân hoặc Zalo Official Account, ví dụ https://zalo.me/oa-id. Để trống nếu chưa có.", def: "", max: 300, pub: true },
  { key: "threadsUrl", group: "landing", type: "url", label: "Liên kết Threads", help: "Dán liên kết hồ sơ Threads, ví dụ https://www.threads.com/@ten-tai-khoan. Để trống nếu chưa có.", def: "", max: 300, pub: true },

  // Pro plan and payment (3.0.0)
  { key: "proEnabled", group: "commerce", type: "bool", label: "Bán gói Pro", help: "Tắt thì ẩn trang Bảng giá và không tạo được đơn mới. Thành viên Pro đang còn hạn vẫn giữ quyền.", def: true, pub: true },
  { key: "payMode", group: "commerce", type: "select", label: "Cách xác nhận thanh toán", options: [["manual", "QR tài khoản cá nhân: tôi tự kiểm tra tài khoản và bấm xác nhận"], ["sepay", "Tự động qua webhook SePay (cần tài khoản SePay)"]], def: "manual", help: "Cả hai cách đều dùng mã QR VietQR chuyển thẳng vào tài khoản bên dưới. Cách tự động cần khóa webhook SePay ở mục Thanh toán tự động SePay bên dưới.", pub: true },
  { key: "payBank", group: "commerce", type: "select", label: "Ngân hàng nhận tiền", options: [["", "Chọn ngân hàng"], ...BANKS], def: "" },
  { key: "payAccountNo", group: "commerce", type: "text", label: "Số tài khoản nhận tiền", help: "Có thể là tài khoản cá nhân. Chỉ gồm chữ và số, không dấu cách.", def: "", max: 19 },
  { key: "payAccountName", group: "commerce", type: "text", label: "Tên chủ tài khoản", def: "", max: 80 },
  { key: "manualConfirmNote", group: "commerce", type: "text", label: "Thời gian xác nhận (QR cá nhân)", help: "Hiện cho học viên sau khi bấm Tôi đã chuyển khoản.", def: "Thường trong vòng 12 giờ (ưu tiên giờ hành chính).", max: 120, pub: true },
  { key: "orderExpireHours", group: "commerce", type: "number", label: "Đơn hàng hết hạn sau (giờ)", def: 24, min: 1, max: 168 },
  { key: "supportContact", group: "commerce", type: "text", label: "Liên hệ hỗ trợ thanh toán", help: "Email, Zalo hoặc số điện thoại. Hiện ở trang thanh toán và chính sách.", def: "", max: 120, pub: true },
  { key: "zaloEnabled", group: "commerce", type: "bool", label: "Báo đơn và xác nhận qua Zalo", help: "Gửi đơn học viên báo đã chuyển khoản tới bot Zalo; nhắn HT <mã đơn> để kích hoạt.", def: false },
  { key: "zaloWebhookUrl", group: "commerce", type: "text", label: "Địa chỉ bot Zalo nhận tin (URL)", def: "", max: 300 },
  { key: "zaloAdminId", group: "commerce", type: "text", label: "ID Zalo người nhận (tùy bot)", def: "", max: 120 },
  { key: "zaloSecret", group: "commerce", type: "text", label: "Mã bí mật dùng chung với bot Zalo", def: "", max: 128 },
  { key: "legalOwner", group: "commerce", type: "text", label: "Tên đơn vị / cá nhân kinh doanh", help: "Hiện ở Điều khoản và Chính sách.", def: "", max: 120, pub: true },

  // AI Tutor (3.0.0)
  { key: "aiEnabled", group: "ai", type: "bool", label: "Bật AI Tutor", def: true, pub: true },
  { key: "aiFreeDaily", group: "ai", type: "number", label: "Free: lượt hỏi mỗi ngày", help: "0 = AI chỉ dành cho Pro.", def: 3, min: 0, max: 50 },
  { key: "aiFreeMonthly", group: "ai", type: "number", label: "Free: lượt hỏi mỗi tháng", def: 30, min: 0, max: 1000 },
  { key: "aiProDaily", group: "ai", type: "number", label: "Pro: lượt hỏi mỗi ngày", help: "Mặc định mới: 100 lượt/ngày. Giá trị quản trị viên đã tự cấu hình sẽ được giữ nguyên.", def: 100, min: 0, max: 1000 },
  { key: "aiProMonthly", group: "ai", type: "number", label: "Pro: lượt hỏi mỗi tháng", help: "Mặc định mới: 2.000 lượt/tháng. Giá trị quản trị viên đã tự cấu hình sẽ được giữ nguyên.", def: 2000, min: 0, max: 30000 },
  { key: "aiMaxInputChars", group: "ai", type: "number", label: "Độ dài tối đa câu hỏi (ký tự)", def: 4000, min: 200, max: 12000 },
  { key: "aiMaxOutputTokens", group: "ai", type: "number", label: "Độ dài tối đa câu trả lời (token)", def: 900, min: 128, max: 4096 },
  // 4.13.0: AI voice for foreign languages
  { key: "ttsEnabled", group: "ai", type: "bool", label: "Giọng đọc AI cho ngoại ngữ (Gemini TTS)", help: "Dùng chung khóa Gemini. Mỗi câu chỉ tạo một lần rồi lưu lại trên máy chủ. Tắt thì dùng giọng đọc có sẵn của trình duyệt.", def: true, pub: true },
  { key: "ttsVoice", group: "ai", type: "text", label: "Giọng mặc định (tên giọng Gemini)", help: "Ví dụ: Kore (nữ), Puck (nam). Học viên vẫn tự chọn được nữ / nam.", def: "Kore", max: 30 },
  { key: "ttsUserDaily", group: "ai", type: "number", label: "Giọng đọc AI: số câu mới mỗi tài khoản / ngày", help: "Câu đã tạo trước đó không tính.", def: 300, min: 0, max: 5000 },
  { key: "ttsSystemDaily", group: "ai", type: "number", label: "Giọng đọc AI: số câu mới toàn hệ thống / ngày", def: 5000, min: 0, max: 200000 },
  { key: "aiHistoryTurns", group: "ai", type: "number", label: "Số lượt hội thoại trước gửi kèm", help: "Nhiều hơn thì AI nhớ ngữ cảnh tốt hơn nhưng tốn token hơn.", def: 6, min: 0, max: 20 },

  // Hide content
  { key: "hiddenGroups", group: "content", type: "multi", label: "Ẩn khóa học (nhóm)", source: "groups", def: [] },
  { key: "hiddenPaths", group: "content", type: "multi", label: "Ẩn lộ trình", source: "paths", def: [] },
  { key: "hiddenChapters", group: "content", type: "multi", label: "Ẩn chương", source: "chapters", help: "Chương bị ẩn không tính vào chứng nhận toàn bộ.", def: [] },
];

export function defaultSettings() {
  return Object.fromEntries(SETTINGS_SCHEMA.map((f) => [f.key, Array.isArray(f.def) ? [...f.def] : f.def]));
}

// Validate and normalize submitted values. Returns { value, errors }
export function cleanSettings(input, current, sources) {
  const out = { ...current };
  const errors = [];
  for (const f of SETTINGS_SCHEMA) {
    if (!(f.key in (input || {}))) continue;
    const v = input[f.key];
    if (f.type === "bool") out[f.key] = !!v;
    else if (f.type === "number") {
      const n = Number(v);
      if (!Number.isFinite(n) || n < f.min || n > f.max) { errors.push(`${f.label}: cần từ ${f.min} đến ${f.max}.`); continue; }
      out[f.key] = Math.round(n);
    } else if (f.type === "select") {
      if (!f.options.some(([k]) => k === v)) { errors.push(`${f.label}: lựa chọn không hợp lệ.`); continue; }
      out[f.key] = v;
    } else if (f.type === "multi") {
      const allowed = new Set((sources[f.source] || []).map(String));
      out[f.key] = Array.isArray(v) ? [...new Set(v.map(String).filter((x) => allowed.has(x)))] : [];
    } else {
      const s = String(v ?? "").trim();
      if (f.key === "siteName" && !s) { errors.push("Tên hệ thống không được để trống."); continue; }
      if (f.key === "payAccountNo" && !/^[A-Za-z0-9]*$/.test(s.replace(/\s+/g, ""))) { errors.push("Số tài khoản chỉ gồm chữ và số."); continue; }
      if (f.key === "payAccountNo") { out[f.key] = s.replace(/\s+/g, ""); continue; }
      if (["facebookUrl", "zaloUrl", "threadsUrl"].includes(f.key) && s) {
        let parsed;
        try { parsed = new URL(s); } catch { errors.push(`${f.label}: hãy nhập một URL hợp lệ bắt đầu bằng https://.`); continue; }
        const host = parsed.hostname.toLowerCase();
        const hosts = {
          facebookUrl: ["facebook.com", "fb.com", "fb.me"],
          zaloUrl: ["zalo.me"],
          threadsUrl: ["threads.com", "threads.net"],
        }[f.key];
        const allowed = parsed.protocol === "https:" && !parsed.username && !parsed.password && hosts.some((domain) => host === domain || host.endsWith(`.${domain}`));
        if (!allowed) { errors.push(`${f.label}: chỉ chấp nhận liên kết HTTPS thuộc đúng nền tảng tương ứng.`); continue; }
        out[f.key] = parsed.toString().slice(0, f.max || 400);
        continue;
      }
      out[f.key] = s.slice(0, f.max || 400);
    }
  }
  return { value: out, errors };
}

export function publicSettings(s) {
  const o = {};
  for (const f of SETTINGS_SCHEMA) if (f.pub) o[f.key] = s[f.key];
  o.registerCodeRequired = !!s.registerCode;
  o.brand = BRAND_COLORS[s.brandColor] || BRAND_COLORS.liferivo;
  return o;
}

// Config for logged-in users (does not expose class code)
export function clientSettings(s) {
  const o = { ...s };
  delete o.registerCode;
  o.registerCodeRequired = !!s.registerCode;
  o.brand = BRAND_COLORS[s.brandColor] || BRAND_COLORS.liferivo;
  return o;
}

// 4.10.1: legacy default values (bản cũ). On startup, any setting still matching the legacy default
// (not customized by admin) is migrated to the new default; customized values are preserved.
export const LEGACY_DEFAULTS = {
  // 5.0.0: rebrand to LifeRivo (update name, tagline, and colors if still at legacy defaults)
  siteName: ["Cổng Học Tập"],
  tagline: ["Học ngoại ngữ từ con số 0", "Học ngoại ngữ, luyện nói và chấm điểm ngay"],
  brandColor: ["tim"],
  mascotText: ["Xin chào! Hôm nay bạn muốn luyện ngoại ngữ nào nhé?"],
};
