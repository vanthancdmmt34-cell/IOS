// Chọn ngôn ngữ giao diện cho yêu cầu: header x-lang, ?lang=, đường dẫn /vi /vn /en, rồi hồ sơ người dùng.
export function reqLang(req, user) {
  const h = String(req.headers["x-lang"] || "").toLowerCase();
  if (h === "en" || h === "vi") return h;
  if (h === "vn") return "vi";
  // Public API clients may select a language with ?lang=; profile is the fallback.
  let queryLang = "", pathname = "";
  try {
    const u = new URL(req.url || "/", "http://liferivo.local");
    queryLang = (u.searchParams.get("lang") || "").toLowerCase();
    pathname = u.pathname || "";
  } catch {}
  if (queryLang === "en" || queryLang === "vi") return queryLang;
  if (queryLang === "vn") return "vi";
  if (/^\/en(?:\/|$)/i.test(pathname)) return "en";
  if (/^\/(?:vi|vn)(?:\/|$)/i.test(pathname)) return "vi";
  return user && user.lang === "en" ? "en" : "vi";
}
