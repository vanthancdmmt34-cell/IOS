// Chính sách mật khẩu tối thiểu (AUDIT P3): ngoài độ dài 6–128 (kiểm tra ở nơi gọi), chặn mật khẩu quá phổ biến và mật khẩu toàn một ký tự.
const COMMON = new Set([
  "123456", "1234567", "12345678", "123456789", "12345", "123123", "123321", "654321", "111111", "000000", "11111111", "00000000",
  "password", "password1", "qwerty", "qwerty123", "1q2w3e4r", "abc123", "iloveyou", "letmein", "admin", "admin123",
  "dragon", "monkey", "matkhau", "matkhau123", "mậtkhẩu", "tieng viet",
]);

// Trả về thông báo lỗi tiếng Việt nếu mật khẩu yếu, hoặc chuỗi rỗng nếu đạt.
export function weakPasswordReason(pw) {
  const s = String(pw ?? "");
  if (COMMON.has(s.toLowerCase())) return "Mật khẩu quá phổ biến, hãy chọn mật khẩu khác.";
  if (/^(.)\1+$/u.test(s)) return "Mật khẩu không được chỉ gồm một ký tự lặp lại.";
  return "";
}
