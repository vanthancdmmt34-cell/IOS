/* PWA: đăng ký service worker (/sw.js) và lắng nghe sự kiện cài đặt ứng dụng cho trang Tải ứng dụng.
   Không tự bật popup làm phiền; trang /tai-ung-dung dùng window.__plDeferredPrompt khi người dùng bấm Cài đặt. */
(function () {
  "use strict";
  window.__plDeferredPrompt = null;
  window.__plInstalled = !!(window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || !!navigator.standalone;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    window.__plDeferredPrompt = e;
    window.dispatchEvent(new CustomEvent("pl:install-ready"));
  });
  window.addEventListener("appinstalled", function () {
    window.__plDeferredPrompt = null;
    window.__plInstalled = true;
    window.dispatchEvent(new CustomEvent("pl:installed"));
  });
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    });
  }
})();
