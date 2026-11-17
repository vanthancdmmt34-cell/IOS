/* PWA: chỉ đăng ký service worker (/sw.js) để cache tài nguyên tĩnh và trang offline.
   Không hiện thanh "Cài đặt" trong trang; trình duyệt tự quản lý việc cài ứng dụng.
   File tĩnh, được tải bằng <script src> nên không cần nonce (CSP script-src 'self'). */
(function () {
  "use strict";
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    });
  }
})();
