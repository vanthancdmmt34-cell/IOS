# Đóng gói ứng dụng Android và iOS

Ứng dụng native là vỏ Capacitor mở giao diện LifeRivo từ máy chủ. Máy chủ vẫn xử lý đăng nhập, tiến độ, thanh toán và bài chấm, nên điện thoại cần mạng.

Cấu hình nằm ở [capacitor.config.js](../capacitor.config.js). Hai biến môi trường quan trọng:
- `CAP_SERVER_URL`: địa chỉ `https://` của máy chủ thật khi phát hành. Mặc định là `http://10.0.2.2:8082`, máy thử trên trình giả lập Android.
- `CAP_APP_ID`: mã ứng dụng dạng ngược tên miền, ví dụ `vn.tenban.liferivo`. Phải giống nhau trên Google Play và App Store. Mặc định là `vn.liferivo.study`.

## 1. Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| Thư viện Capacitor 7 (core, android, ios, cli) | Đã cài trong `package.json` |
| Thư mục Android (`android/`) | Đã tạo; quyền `RECORD_AUDIO` đã khai báo |
| Thư mục iOS (`ios/`) | Đã tạo; đã có `NSMicrophoneUsageDescription` |
| Biểu tượng Android | Đã thay bằng biểu tượng LifeRivo (mật độ thường và lớp tiền cảnh) |
| Biểu tượng 1024 px cho App Store | Chưa có; cần file nguồn 1024 px |
| Build APK debug | Xem mục 4 |
| Build iOS | Không thực hiện được trên Windows; cần máy Mac |
| Xóa tài khoản trong ứng dụng | Chưa làm (mục 6) |
| Thanh toán gói Pro trên cửa hàng | Chưa quyết định (mục 6) |

## 2. Yêu cầu

- Node.js 22 trở lên.
- Android: JDK 21 và Android SDK (đã có platform 35, 36, 37 trên máy này). File `android/local.properties` trỏ tới SDK, file này không commit.
- iOS: máy Mac, Xcode 16 trở lên và CocoaPods.

## 3. Lệnh thường dùng

```bash
CAP_SERVER_URL=https://<máy chủ> CAP_APP_ID=<mã> npx cap sync android
npx cap open android      # Android Studio: Build > Generate Signed Bundle (AAB)
```

iOS, trên macOS:

```bash
CAP_SERVER_URL=https://<máy chủ> CAP_APP_ID=<mã> npx cap sync ios
npx cap open ios          # Xcode: Product > Archive
```

Khi đổi `CAP_APP_ID`, phải chạy lại `npx cap add` hoặc sửa tay `applicationId` và `bundle identifier` trong dự án native.

## 4. Build Android

Build APK debug để thử:

```bash
cd android
./gradlew assembleDebug
```

File ra ở `android/app/build/outputs/apk/debug/app-debug.apk`. Bản phát hành cần khóa ký riêng và build AAB trong Android Studio. Giữ khóa ký an toàn: mất khóa là không cập nhật được ứng dụng trên Google Play.

## 5. Biểu tượng cho App Store

Chuẩn bị file `resources/icon.png` 1024×1024, không viền trong suốt, rồi sinh đủ kích thước:

```bash
npx @capacitor/assets generate --android --ios
```

Nguồn trong `public/icons/` chỉ có 192 và 512 px, chưa đủ cho App Store.

## 6. Việc phải làm trước khi nộp lên cửa hàng

Các mục này cần quyết định hoặc việc riêng, không nằm trong lệnh build.

1. **Xóa tài khoản ngay trong ứng dụng.** Apple (guideline 5.1.1(v)) và Google Play đều yêu cầu. Hiện chỉ quản trị viên xóa được tài khoản người khác, học viên chưa tự xóa được. Cần quyết định dữ liệu nào bị xóa, dữ liệu nào giữ lại vì thanh toán và chứng nhận.
2. **Thanh toán gói Pro.** Gói Pro hiện thanh toán qua Zalo Pay và chuyển khoản. Apple và Google yêu cầu nội dung số trong ứng dụng dùng hệ thống thanh toán của họ (In-App Purchase, Google Play Billing). Nếu không, ứng dụng có thể bị từ chối. Cần chọn: bỏ thanh toán trong ứng dụng trên iOS và Android, hoặc tích hợp In-App Purchase.
3. **Chính sách quyền riêng tư và điều khoản.** Đã có trang `/app/chinh-sach/privacy` và `/app/chinh-sach/terms`. Cần địa chỉ công khai để khai trên cửa hàng.
4. **Thông báo nhắc luyện nói.** Hiện dùng Web Push trong service worker. Trong vỏ native, thông báo đẩy cần Firebase Cloud Messaging (Android) và APNs (iOS).
5. **Kiểm thử trên máy thật.** Cần kiểm tra đăng nhập, cookie, micro, xoay ngang và thanh điều hướng dưới trên Android và iOS.

## 7. Giới hạn của cách đóng gói này

- Ứng dụng cần mạng để mở giao diện. Chế độ ngoại tuyến của service worker không dùng được đầy đủ trong vỏ native.
- Thay đổi giao diện trên máy chủ có hiệu lực ngay trên điện thoại, không cần phát hành lại ứng dụng. Thay đổi cấu hình native hoặc quyền mới cần phát hành lại.
- Capacitor CLI đọc `capacitor.config.js` bằng `require()`, nên mỗi trường cấu hình được xuất riêng (named export) cùng với `export default`.

## 8. Trình duyệt tối thiểu

Giao diện dùng một số tính năng CSS hiện đại. Thiết bị cần:
- Android: Android System WebView (hoặc Chrome) 111 trở lên. Hầu hết máy Android 8 trở lên được cập nhật tự động; đa số máy hiện nay đã đạt.
- iOS: Safari 16.2 trở lên (iOS 16.2 trở lên).

Thiết bị cũ hơn có thể hiển thị màu nền và viền bị thiếu, vì giao diện dùng `color-mix()`, `:has()` và `dvh`.

## 9. Kiểm tra đã làm

- Trên 5 trang chính ở 375px: không còn mục chạm nào nhỏ hơn 44px.
- Ô nhập có cỡ chữ 16px trên điện thoại, không bị phóng to trên iOS và Android WebView.
- Kiểm tra bố cục tự động: 132 lượt ở 11 kích thước, không tràn ngang, thanh điều hướng luôn trong khung hình.
- Build APK debug trên Windows thành công (`android/app/build/outputs/apk/debug/app-debug.apk`). Chưa cài và chạy trên máy thật.
