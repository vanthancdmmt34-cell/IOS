/* Đồng ý cookie phân tích (AUDIT P1-6).
   Google Tag Manager / GA4 chỉ được nạp sau khi người dùng bấm "Đồng ý". Mặc định là từ chối:
   chưa chọn thì không gửi dữ liệu nào tới Google. Lựa chọn lưu trong localStorage (pl:consent:analytics). */
(function () {
  var KEY = "pl:consent:analytics";
  var GTM_ID = "GTM-W7Q4KGDG";
  var loaded = false;

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* không lưu được thì vẫn chỉ hỏi lại lần sau */ } }
  function isAdminArea() {
    return /^#\/quan-tri/.test(location.hash) || location.pathname.indexOf("/app/quan-tri") === 0;
  }

  function loadGTM() {
    if (loaded || isAdminArea()) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
    document.head.appendChild(s);
  }

  function showBanner() {
    if (document.getElementById("plConsent")) return;
    var en = (document.documentElement.lang || "vi").indexOf("en") === 0;
    var box = document.createElement("div");
    box.id = "plConsent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", en ? "Cookie consent" : "Đồng ý cookie");
    box.setAttribute("style", "position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:520px;margin:0 auto;" +
      "background:#FFFDF7;color:#1C1917;border:1px solid #E7E0CF;border-radius:14px;box-shadow:0 8px 24px rgba(28,25,23,.18);" +
      "padding:14px 16px;font:15px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;gap:10px");
    var text = document.createElement("p");
    text.setAttribute("style", "margin:0;color:#1C1917");
    text.innerHTML = en
      ? "We use analytics cookies (Google Tag Manager / GA4) to improve LifeRivo. Allow them? <a href=\"/chinh-sach/privacy\" style=\"color:#1D4ED8\">Privacy policy</a>"
      : "LifeRivo dùng cookie phân tích (Google Tag Manager / GA4) để cải thiện sản phẩm. Bạn có đồng ý không? <a href=\"/chinh-sach/privacy\" style=\"color:#1D4ED8\">Quyền riêng tư</a>";
    var row = document.createElement("div");
    row.setAttribute("style", "display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end");
    var deny = document.createElement("button");
    deny.type = "button";
    deny.textContent = en ? "Essential only" : "Chỉ cần thiết";
    deny.setAttribute("style", "padding:9px 14px;border-radius:999px;border:1px solid #1C1917;background:#FFFDF7;color:#1C1917;font:inherit;cursor:pointer");
    var allow = document.createElement("button");
    allow.type = "button";
    allow.textContent = en ? "Accept" : "Đồng ý";
    allow.setAttribute("style", "padding:9px 14px;border-radius:999px;border:1px solid #1C1917;background:#1C1917;color:#FFFDF7;font:inherit;cursor:pointer");
    function decide(v) {
      write(v);
      if (box.parentNode) box.parentNode.removeChild(box);
      if (v === "granted") loadGTM();
    }
    deny.addEventListener("click", function () { decide("denied"); });
    allow.addEventListener("click", function () { decide("granted"); });
    row.appendChild(deny);
    row.appendChild(allow);
    box.appendChild(text);
    box.appendChild(row);
    document.body.appendChild(box);
    allow.focus();
  }

  var state = read();
  if (state === "granted") loadGTM();
  else if (state !== "denied" && !isAdminArea()) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showBanner);
    else showBanner();
  }
})();
