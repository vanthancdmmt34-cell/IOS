// Cấu hình Capacitor cho ứng dụng Android và iOS của LifeRivo.
// Ứng dụng native mở giao diện từ máy chủ LifeRivo (ứng dụng cần máy chủ để đăng nhập, lưu tiến độ và thanh toán).
//   CAP_SERVER_URL: địa chỉ https của máy chủ khi phát hành. Mặc định là máy chủ thử trên máy phát triển.
//     Trình giả lập Android gọi máy host qua 10.0.2.2.
//   CAP_APP_ID: mã ứng dụng dạng ngược tên miền, ví dụ vn.tenban.liferivo. Phải khớp trên Google Play và App Store.
// Capacitor CLI đọc cấu hình bằng require(), nên mỗi trường được xuất riêng và cũng có trong export default.
const serverUrl = process.env.CAP_SERVER_URL || "http://10.0.2.2:8082";

export const appId = process.env.CAP_APP_ID || "vn.liferivo.study";
export const appName = "LifeRivo";
export const webDir = "public";
export const server = {
  url: serverUrl,
  cleartext: serverUrl.startsWith("http://"),
};
export const android = { allowMixedContent: false };
export const ios = { contentInset: "never" };

export default { appId, appName, webDir, server, android, ios };
