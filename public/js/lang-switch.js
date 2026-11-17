import { appHash } from "./core.js";
/* Nut chuyen ngon ngu VI/EN — classic script (khong dung ES module) de chay
   doc lap, ke ca khi he module chinh gap van de. Dung event delegation tren
   document nen bat duoc nut du render lai sau. */
(function () {
  function go(lang) {
    var target = lang === "en" ? "/en" : "/vi";
    var cur = (location.pathname || "/").replace(/\/+$/, "") || "/";
    if (cur === target) return;
    try { localStorage.setItem("pl-lang", lang); } catch (e) {}
    var p = location.pathname || "/";
    if (/^\/(?:(?:vi|vn|en)\/?)?$/i.test(p)) {
      location.href = target + location.search + appHash();
    } else {
      location.reload();
    }
  }
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest(".lang-switch [data-lang]") : null;
    if (!b) return;
    go(b.dataset.lang === "en" ? "en" : "vi");
  });
})();
