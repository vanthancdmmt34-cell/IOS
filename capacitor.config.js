// Cấu hình Capacitor cho ứng dụng Android và iOS của LifeRivo.
// Giao diện được đóng gói sẵn từ thư mục www/ (tạo bằng: node tools/build-native.mjs).
// Dữ liệu và đăng nhập đi tới máy chủ qua CAP_SERVER_URL, được ghi vào www/index.html khi build-native chạy.
//   CAP_APP_ID: mã ứng dụng dạng ngược tên miền, ví dụ vn.tenban.liferivo. Phải khớp trên Google Play và App Store.
// Capacitor CLI đọc cấu hình bằng require(), nên mỗi trường được xuất riêng và cũng có trong export default.
export const appId = process.env.CAP_APP_ID || "vn.liferivo.study";
export const appName = "LifeRivo";
export const webDir = "www";
export const android = { allowMixedContent: false };
export const ios = { contentInset: "never" };

export default { appId, appName, webDir, android, ios };
