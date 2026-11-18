/* LifeRivo native bridge: chỉ được chèn vào www/index.html bởi tools/build-native.mjs.
 * Chạy trong app iOS/Android đã đóng gói giao diện. Khi có window.LR_API_BASE:
 *  - Mọi fetch tới /api/... được gửi tới máy chủ LR_API_BASE, kèm header Authorization: Bearer <token>.
 *  - Token được lưu sau khi đăng nhập/đăng ký và xóa khi đăng xuất (máy chủ chỉ nhận token, không dùng cookie).
 *  - Link tải về /api/... được tải bằng fetch rồi lưu qua blob.
 * Trên web thông thường không có LR_API_BASE nên file này không làm gì. */
(function () {
  var base = window.LR_API_BASE;
  if (!base) return;
  // iOS tự phóng to trang khi ô nhập có cỡ chữ dưới 16px (ví dụ khung đăng nhập 14px), nên ép 16px cho ô nhập trong app.
  var zoomFix = document.createElement("style");
  zoomFix.textContent = "input:not([type=checkbox]):not([type=radio]):not([type=range]),select,textarea{font-size:16px!important}";
  (document.head || document.documentElement).appendChild(zoomFix);
  // Thanh tiêu đề dính (sticky top:0) nằm dưới thanh trạng thái/tai thỏ, nên dời xuống đúng vùng an toàn.
  var topFix = document.createElement("style");
  topFix.textContent = "html body.in-app .main > .topbar,html body.in-app .toeic-timer-bar{top:env(safe-area-inset-top)!important}"
    // Thanh menu dưới nằm sát mép dưới màn hình; khoảng trống cho thanh Home nằm trong padding của thanh.
    + "html body.in-app .mtab{bottom:0!important;left:0!important;right:0!important;border-radius:24px 24px 0 0!important;padding-bottom:calc(6px + env(safe-area-inset-bottom))!important}"
    // Tắt chạm đúp để phóng to (double-tap zoom) khi người dùng bấm nhanh liên tiếp.
    + "html{touch-action:manipulation}";
  (document.head || document.documentElement).appendChild(topFix);
  var KEY = "lr_token";
  var origFetch = window.fetch.bind(window);

  function getToken() {
    try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; }
  }
  function setToken(t) {
    try { if (t) localStorage.setItem(KEY, t); else localStorage.removeItem(KEY); } catch (e) { /* bộ nhớ bị chặn */ }
  }
  function pathOf(u) { return String(u).split("?")[0]; }

  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : "";
    if (url.indexOf("/api/") !== 0) return origFetch(input, init);
    init = init || {};
    var headers = new Headers(init.headers || {});
    var t = getToken();
    if (t && !headers.has("Authorization")) headers.set("Authorization", "Bearer " + t);
    var path = pathOf(url);
    var opts = Object.assign({}, init, { headers: headers, credentials: "omit" });
    return origFetch(base + url, opts).then(function (res) {
      if (path === "/api/logout") {
        setToken("");
      } else if (res.ok && (path === "/api/login" || path === "/api/register")) {
        // Chờ lưu token xong rồi mới trả response, để lệnh gọi kế tiếp đã có Authorization.
        return res.clone().json().then(function (j) { if (j && j.token) setToken(j.token); }, function () {}).then(function () { return res; });
      }
      return res;
    });
  };

  // Link tải về (sao lưu, xuất bảng điểm...) không tự gửi được token, nên tải bằng fetch rồi lưu file.
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="/api/"]') : null;
    if (!a) return;
    e.preventDefault();
    var href = a.getAttribute("href");
    window.fetch(href).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.blob().then(function (blob) {
        var name = a.getAttribute("download") || "download";
        var cd = res.headers.get("Content-Disposition") || "";
        var m = /filename="?([^";]+)"?/i.exec(cd);
        if (m) { try { name = decodeURIComponent(m[1]); } catch (err) { name = m[1]; } }
        var u = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = u;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(u); }, 3000);
      });
    }).catch(function () {
      alert("Không tải được file. Kiểm tra mạng rồi thử lại.");
    });
  }, true);

  // Ẩn bàn phím trước khi gửi form. Nếu ô nhập còn focus khi giao diện đổi (đăng nhập xong, báo lỗi), WKWebView hay giữ nguyên mức phóng to.
  document.addEventListener("submit", function () {
    var ae = document.activeElement;
    if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && ae.blur) ae.blur();
  }, true);
})();
