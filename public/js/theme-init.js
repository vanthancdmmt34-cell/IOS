// 5.0.0: light / dark theme. User preference saved in "me:theme"; follows OS preference if unset.
(function () {
  var KEY = "me:theme", root = document.documentElement, saved = null;
  try { saved = localStorage.getItem(KEY); localStorage.removeItem("py-lab-theme"); } catch (e) {}
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var pick = function () { return saved === "light" || saved === "dark" ? saved : mq && mq.matches ? "dark" : "light"; };
  root.setAttribute("data-theme", pick());
  if (mq && mq.addEventListener) mq.addEventListener("change", function () {
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved !== "light" && saved !== "dark") root.setAttribute("data-theme", pick());
  });
})();
