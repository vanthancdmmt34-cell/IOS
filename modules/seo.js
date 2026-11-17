// Server-rendered public pages (SEO), bilingual Vietnamese/English:
//   /vi/lessons, /vi/lessons/:slug, /vi/pricing, /vi/<policy page>
//   /en/lessons, /en/lessons/:slug, /en/pricing, /en/<legal page>
// - Same content ID/slug for both languages; includes hreflang (vi, en, x-default) and canonical tags.
// - /en/lessons/:slug is ONLY available when an admin has published the translation; otherwise temporarily redirects (302) to Vietnamese.
// - Legacy paths (/bai-hoc, /bai-hoc/:slug, /bang-gia, /dieu-khoan, ...) 301-redirect to /vi/... to preserve SEO.
// No JavaScript required; never exposes quiz answers or reference solutions.
import { listPlans } from "./membership.js";
import { langPublicSummary } from "./languages.js";
import fs from "node:fs";
import crypto from "node:crypto";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const paras = (t) => String(t || "").split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
const money = (n, lang) => Number(n).toLocaleString(lang === "en" ? "en-US" : "vi-VN") + (lang === "en" ? " VND" : "đ");

// Policy pages: shared (English) slug for both languages + legacy Vietnamese paths
const LEGAL = {
  terms: { old: "dieu-khoan", vi: "Điều khoản sử dụng", en: "Terms of use" },
  privacy: { old: "chinh-sach-bao-mat", vi: "Chính sách bảo mật", en: "Privacy policy" },
  payment: { old: "chinh-sach-thanh-toan", vi: "Chính sách thanh toán", en: "Payment policy" },
  refund: { old: "chinh-sach-hoan-tien", vi: "Chính sách hoàn tiền", en: "Refund policy" },
  membership: { old: "quy-dinh-thanh-vien", vi: "Quy định gói thành viên", en: "Membership rules" },
};
const OLD_REDIRECTS = { "/bang-gia": "/vi/pricing", ...Object.fromEntries(Object.entries(LEGAL).map(([k, v]) => ["/" + v.old, "/vi/" + k])) };

const L = {
  vi: { home: "Trang chủ", lessons: "Bài học", pricing: "Bảng giá", login: "Đăng nhập", backApp: "Vào trang học", foot: "All rights reserved.", other: "English", stage: "Giai đoạn", min: "phút", free: "Miễn phí",
    why: "Vì sao cần học", concept: "Khái niệm", syntax: "Cú pháp", example: "Ví dụ", input: "Dữ liệu nhập:", output: "Kết quả:", walk: "Giải thích từng dòng", mistakes: "Lỗi thường gặp", summary: "Tóm tắt", goals: "Mục tiêu",
    practice: (a, b) => `Luyện tập ${a} bài và ${b} câu hỏi nhanh`, practiceP: "Luyện ngay trên trình duyệt, có chấm điểm và chỉ ra lỗi cụ thể bằng tiếng Việt.", go: "Vào luyện tập miễn phí",
    proOnly: "Bài học dành cho thành viên Pro", seePro: "Xem gói Pro", openApp: "Mở trong ứng dụng", updated: "Cập nhật lần cuối: 11/11/2026.",
  },
  en: { home: "Home", lessons: "Lessons", pricing: "Pricing", login: "Sign in", backApp: "Back to app", foot: "All rights reserved.", other: "Tiếng Việt", stage: "Stage", min: "min", free: "Free",
    why: "Why learn this", concept: "Concept", syntax: "Syntax", example: "Example", input: "Input:", output: "Output:", walk: "Line-by-line explanation", mistakes: "Common mistakes", summary: "Summary", goals: "Objectives",
    practice: (a, b) => `${a} practice tasks and ${b} quiz questions`, practiceP: "Practice right in the browser with graded answers that point to exactly what went wrong.", go: "Practice for free",
    proOnly: "This lesson is for Pro members", seePro: "See Pro plans", openApp: "Open in the app", updated: "Last updated: 11 Nov 2026.",
  },
};

// Bài có tiếng Anh khi được xuất bản song ngữ.
export async function publicPaths(db) {
  const out = ["/vi", "/en", "/vi/pricing", "/en/pricing"];
  for (const s of ["en", "zh", "ja", "ko", "fr", "es"]) out.push("/khoa-hoc/" + s, "/en/khoa-hoc/" + s);
  for (const k of Object.keys(LEGAL)) out.push("/vi/" + k, "/en/" + k);
  return out;
}
// Keep legacy name for server.js (sitemap); recomputed on each call
export const PUBLIC_PATHS = null;

function layout({ base, S, lang, path, alt, title, desc, body, jsonld = [], version, nonce = "", loggedIn = false }) {
  const t = L[lang];
  const appHome = lang === "en" ? "/app/" : "/app/";
  const site = S.siteName || "LifeRivo";
  const url = base + path;
  const other = lang === "vi" ? "en" : "vi";
  // Public CSS uses content hash as ?v= (editing the file changes the URL, keeping immutable cache safe)
  let cssV = version;
  try { cssV = crypto.createHash("sha256").update(fs.readFileSync(new URL("../public/css/public.css", import.meta.url))).digest("hex").slice(0, 12); } catch {}
  // alt: { vi: "/vi/...", en: "/en/..." } only includes versions that actually exist
  const links = Object.entries(alt).map(([lg, p]) => `<link rel="alternate" hreflang="${lg}" href="${esc(base + p)}">`).join("") + (alt.vi ? `<link rel="alternate" hreflang="x-default" href="${esc(base + alt.vi)}">` : "");
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | ${esc(site)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
${links}
<meta property="og:type" content="website"><meta property="og:site_name" content="${esc(site)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(url)}"><meta property="og:locale" content="${lang === "en" ? "en_US" : "vi_VN"}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.png" type="image/png">
<!-- Google Tag Manager -->
<script${nonce ? ` nonce="${nonce}"` : ""}>
  if (!/^#\\\/quan-tri/.test(location.hash)) {
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-W7Q4KGDG');
  }
</script>
<!-- End Google Tag Manager -->
<!-- GA4 qua GTM (Võ chọn 14/11): khong dung gtag.js truc tiep; 4 event day qua dataLayer de GTM kich hoat the GA4 -->
<script${nonce ? ` nonce="${nonce}"` : ""}>
  window.__plGA = function(ev){ try { (window.dataLayer = window.dataLayer || []).push({event: ev}); } catch (e) {} };
</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet"><link rel="stylesheet" href="/css/public.css?v=${esc(cssV)}">
<script src="/js/theme-init.js"></script>
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("\n")}
</head><body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W7Q4KGDG" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<header class="pub-top"><a class="pub-brand" href="${loggedIn ? appHome : "/"}">${S.logoUrl ? `<img class="logo${S.logoMode === "only" ? " only" : ""}" src="${esc(S.logoUrl)}" alt="${S.logoMode === "only" ? esc(site) : ""}">${S.logoMode === "only" ? "" : esc(site)}` : `<svg class="me-mark" width="34" height="34" viewBox="0 0 36 36" fill="none" aria-hidden="true"><rect width="36" height="36" rx="12" fill="#EFEBFF" stroke="#9B8AFB" stroke-width="1.8"/><path d="M9.5 16.5 8 7.5l6.5 4.2M26.5 16.5 28 7.5l-6.5 4.2" fill="#FFFDF9" stroke="#303047" stroke-width="1.8" stroke-linejoin="round"/><ellipse cx="18" cy="20.5" rx="10.2" ry="8.8" fill="#FFFDF9" stroke="#303047" stroke-width="1.8"/><circle cx="13.8" cy="19.6" r="1.6" fill="#303047"/><circle cx="22.2" cy="19.6" r="1.6" fill="#303047"/><ellipse cx="11.2" cy="22" rx="1.6" ry=".9" fill="#FFB9D0"/><ellipse cx="24.8" cy="22" rx="1.6" ry=".9" fill="#FFB9D0"/><path d="M16.2 22q.9 1.1 1.8 0 .9 1.1 1.8 0" stroke="#303047" stroke-width="1.5" stroke-linecap="round"/></svg><span class="me-word"><b>${esc((/^(.*\S)\s+study$/i.exec(site) || [0, site])[1])}</b></span>`}</a><nav><a href="${loggedIn ? appHome : "/#muc-dich"}">${lang === "en" ? "Paths" : "Lộ trình"}</a><a href="${loggedIn ? `${appHome}chon-mon` : "/#mon-hoc"}">${lang === "en" ? "Languages" : "Ngoại ngữ"}</a><a href="${loggedIn ? `${appHome}ho-tro` : "/#hoi-dap"}">${lang === "en" ? "FAQ" : "Hỏi đáp"}</a><a href="${loggedIn ? `${appHome}bang-gia` : `/${lang}/pricing`}">${t.pricing}</a>${loggedIn ? `<a class="btn" href="${appHome}">← ${t.backApp}</a>` : `<a class="btn" href="/app/dang-nhap">${t.login}</a>`}</nav></header>
<main class="pub-main">${body}</main>
<footer class="pub-foot"><p>${esc(lang === "en" && S.footerTextEn ? S.footerTextEn : (S.footerText || ""))}</p><nav>${Object.entries(LEGAL).filter(([k]) => !(S.hiddenFooterLinks || []).includes(k)).map(([k, v]) => `<a href="/${lang}/${k}">${esc(v[lang])}</a>`).join("")}</nav><p class="muted">© ${new Date().getFullYear()} ${esc(S.legalOwner || site)}. ${t.foot}</p></footer>
</body></html>`;
}
const crumbs = (base, items) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: base + p })) });

// Returns HTML string, { redirect, status }, or null (not a public page)
// Đoạn giới thiệu từng môn cho trang /khoa-hoc/:slug (vi và en). Nội dung mô tả đúng lộ trình thật của khóa.
const SUBJECT_INTRO = {
  en: { vi: "Luyện tiếng Anh từ cơ bản đến nâng cao: từ vựng theo chủ đề, ngữ pháp, nghe và phát âm, luyện nói với AI và phỏng vấn xin việc bằng tiếng Anh. Có nhận dạng giọng nói và chấm phát âm từng từ.", en: "Learn English from beginner to advanced: topic vocabulary, grammar, listening and pronunciation, speaking practice with AI and English job-interview practice. Includes speech recognition and word-by-word pronunciation feedback." },
  zh: { vi: "Luyện tiếng Trung từ HSK 1 đến HSK 5: từ vựng, ngữ pháp, phát âm có thanh điệu, hội thoại với AI và phỏng vấn xin việc bằng tiếng Trung.", en: "Learn Chinese from HSK 1 to HSK 5: vocabulary, grammar, tone-aware pronunciation, AI conversation and Chinese job-interview practice." },
  ja: { vi: "Luyện tiếng Nhật từ N5 đến N1: Hiragana, Katakana, Kanji, từ vựng, ngữ pháp, phát âm 0.6x, hội thoại và phỏng vấn xin việc bằng tiếng Nhật với AI.", en: "Learn Japanese from N5 to N1: Hiragana, Katakana, kanji, vocabulary, grammar, 0.6x pronunciation, AI conversation and Japanese job-interview practice." },
  ko: { vi: "Luyện tiếng Hàn từ TOPIK 1 đến TOPIK 5: bảng chữ Hangul, từ vựng, ngữ pháp, phát âm, hội thoại với AI và phỏng vấn xin việc bằng tiếng Hàn.", en: "Learn Korean from TOPIK 1 to TOPIK 5: Hangul, vocabulary, grammar, pronunciation, AI conversation and Korean job-interview practice." },
  fr: { vi: "Luyện tiếng Pháp từ A1 đến C1: từ vựng theo chủ đề, ngữ pháp, nghe và phát âm, hội thoại với AI và phỏng vấn xin việc bằng tiếng Pháp.", en: "Learn French from A1 to C1: topic vocabulary, grammar, listening and pronunciation, AI conversation and French job-interview practice." },
  es: { vi: "Luyện tiếng Tây Ban Nha từ A1 đến C1: từ vựng theo chủ đề, ngữ pháp, nghe và phát âm, hội thoại với AI và phỏng vấn xin việc bằng tiếng Tây Ban Nha.", en: "Learn Spanish from A1 to C1: topic vocabulary, grammar, listening and pronunciation, AI conversation and Spanish job-interview practice." },
};
// Môn học cho /khoa-hoc/:slug: các ngoại ngữ.
// Khong co bang courses: mon lay tu content files, giong /api/public/overview.
function subjectList(en) {
  return [...langPublicSummary(en)];
}

export async function renderPublic(pathname, { base, S, db, version, nonce = "", loggedIn = false }) {
  let p = pathname.replace(/\/+$/, "") || "/";
  if (OLD_REDIRECTS[p]) return { redirect: OLD_REDIRECTS[p], status: 301 };
  // /vi, /vn, /en phục vụ trực tiếp SPA song ngữ kèm SSR trong server.js
  if (p === "/en" || p === "/vi" || p === "/vn") return null;
  // /khoa-hoc/:slug va /en/khoa-hoc/:slug: trang chi tiet mon hoc (mon = subject).
  const km = p.match(/^\/(en\/)?khoa-hoc\/([a-z-]+)$/);
  if (km) {
    const lang = km[1] ? "en" : "vi";
    const slug = km[2];
    const subj = subjectList(lang === "en").find((x) => x.id === slug);
    if (!subj) return { status: 404 };
    const t = L[lang];
    const site = S.siteName || "LifeRivo";
    const ctx = { base, S, lang, path: p, version, nonce, loggedIn };
    const V = lang === "vi";
    const plans = await listPlans(db);
    const planName = (x) => (lang === "en" && x.nameEn ? x.nameEn : x.name);
    const pathHtml = subj.chapters
      ? `<ol class="pub-list">${subj.chapters.map((c) => `<li><b>${esc(c.title)}</b><br><span class="muted">${c.count} ${V ? "bài tập" : "exercises"}</span></li>`).join("")}</ol>`
      : `<ol class="pub-list">${(subj.levels || []).map((lv) => `<li><b>${esc(lv)}</b></li>`).join("")}</ol>`;
    const body = `<nav class="crumbs"><a href="${loggedIn ? (lang === "en" ? "/app/" : "/app/") : "/"}">${t.home}</a> / ${esc(subj.name)}</nav>
      <article><p class="kicker">${esc(subj.flag)} ${esc(subj.framework)}</p><h1>${esc(subj.name)}</h1><p class="lead">${esc(subj.desc)}</p><p>${esc((SUBJECT_INTRO[subj.id] || {})[lang] || "")}</p>
      <p class="muted">${subj.lessons} ${V ? "chương/bài" : "chapters/lessons"} · ${Number(subj.exercises).toLocaleString(V ? "vi-VN" : "en-US")} ${V ? "bài tập có chấm" : "graded exercises"}</p>
      <h2>${V ? "Lộ trình" : "Learning path"}</h2>${pathHtml}
      <h2>${V ? "Học phí" : "Pricing"}</h2>
      ${S.proEnabled && plans.length ? `<div class="plans">${plans.map((x) => `<div class="plan"><h2>${esc(planName(x))}</h2><p class="price">${x.quoteOnly ? (V ? "Liên hệ" : "Contact") : money(x.priceVnd, lang)}</p></div>`).join("")}</div><p><a class="btn btn-primary" href="/${lang}/pricing">${V ? "Xem bảng giá" : "See pricing"}</a></p>` : `<p class="muted">${V ? "Tất cả các cấp đều miễn phí. Xem bảng giá để biết gói Pro." : "All levels are free. See pricing for Pro plans."}</p>`}
      <div class="cta"><b>${loggedIn ? (V ? "Tiếp tục học ngay" : "Continue learning") : (V ? "Bắt đầu học miễn phí" : "Start learning for free")}</b><p>${loggedIn ? (V ? "Mở lộ trình môn này trong tài khoản của bạn." : "Open this course path in your account.") : (V ? "Tạo tài khoản, chọn môn, vào học ngay." : "Create an account, pick a subject and start learning.")}</p><a class="btn btn-primary" href="${loggedIn ? `/app/${slug}` : "/app/dang-ky"}">${loggedIn ? (V ? "Mở lộ trình môn" : "Open course") : (V ? "Đăng ký miễn phí" : "Sign up free")}</a></div></article>`;
    return layout({ ...ctx, alt: { vi: "/khoa-hoc/" + slug, en: "/en/khoa-hoc/" + slug }, title: subj.name, desc: subj.desc, body,
      jsonld: [crumbs(base, [[t.home, "/"], [subj.name, `/${lang}/khoa-hoc/${slug}`]]),
        { "@context": "https://schema.org", "@type": "Course", name: subj.name, description: subj.desc, inLanguage: lang, provider: { "@type": "Organization", name: site, url: base } }] });
  }
  const lm = p.match(/^\/(vi|vn|en)(\/.*)?$/);
  if (!lm) return null;
  const lang = lm[1] === "en" ? "en" : "vi", rest = lm[2] || "";
  const t = L[lang];
  const site = S.siteName || "LifeRivo";
  const ctx = { base, S, lang, path: p, version, nonce, loggedIn };

  if (rest === "") return null;

  // /vi/lessons/*, /en/lessons/*: bai hoc hien dung hash route trong app, khong con
  // trang server /lessons/; cac slug cu (vd ham-nang-cao, mon lap trinh) -> 404.
  if (rest === "/lessons" || rest.startsWith("/lessons/")) return { status: 404 };
  // /vi/khoa-hoc/:slug khong phai dang chuan (/khoa-hoc/:slug, /en/khoa-hoc/:slug):
  // slug ngon ngu hop le thi 301 ve dang chuan, slug khong thuoc ngoai ngu -> 404.
  if (rest.startsWith("/khoa-hoc/")) {
    const slug = rest.slice("/khoa-hoc/".length).split("/")[0];
    if (!["en", "zh", "ja", "ko", "fr", "es"].includes(slug)) return { status: 404 };
    return { redirect: "/khoa-hoc/" + slug, status: 301 };
  }

  if (rest === "/pricing") {
    const plans = await listPlans(db);
    const name = (x) => (lang === "en" && x.nameEn ? x.nameEn : x.name);
    const V = lang === "vi";
    const body = `<h1>${V ? "Bảng giá" : "Pricing"} ${esc(site)}</h1><p class="lead">${V ? "Toàn bộ nội dung học đều miễn phí: 6 ngoại ngữ. Chỉ trợ lý AI và phỏng vấn AI là tính năng Pro: gói Free có 3 lượt hỏi AI mỗi ngày và 1 buổi phỏng vấn AI miễn phí; gói Pro có 100 lượt hỏi AI mỗi ngày, phỏng vấn AI không giới hạn và báo cáo học tập chi tiết." : "All learning content is free: 6 languages. Only the Rivo and AI mock interviews are Pro features: the Free plan includes 3 AI turns per day and one free AI mock interview; Pro includes 100 AI turns per day, unlimited AI mock interviews, and detailed learning reports."}</p>
      ${S.proEnabled ? `<div class="plans"><div class="plan"><h2>Free</h2><p class="price">${money(0, lang)}</p><ul>${V ? `<li>Toàn bộ nội dung ngoại ngữ, chấm tự động</li><li>Mọi cấp của 6 ngoại ngữ</li><li>Luyện nói theo chủ đề, luyện phát âm</li><li>Phỏng vấn thử có câu mẫu</li><li>Bài kiểm tra và chứng nhận theo cấp</li><li>AI ${S.aiFreeDaily} lượt/ngày, phỏng vấn AI 1 buổi miễn phí</li>` : `<li>Full Language curriculum, auto-graded</li><li>All levels of 6 languages</li><li>Topic-based speaking and pronunciation practice</li><li>Mock interviews with model answers</li><li>Tests and certificates for each level</li><li>AI: ${S.aiFreeDaily} turns/day, AI mock interview 1 free session</li>`}</ul></div>
      ${plans.map((x) => `<div class="plan"><h2>${esc(name(x))}</h2><p class="price">${x.quoteOnly ? (V ? "Liên hệ" : "Contact") : money(x.priceVnd, lang)}</p>${!x.quoteOnly && x.months > 1 ? `<p class="muted">≈ ${money(x.perMonth, lang)}/${V ? "tháng" : "month"}</p>` : ""}<ul>${V ? `<li>Trợ lý AI 100 lượt/ngày</li><li>Phỏng vấn AI không giới hạn: AI hỏi, bạn trả lời</li><li>Báo cáo học tập chi tiết</li><li>Mọi quyền lợi gói Free</li>` : `<li>Rivo: 100 turns/day</li><li>Unlimited AI mock interviews: the AI asks, you answer</li><li>Detailed learning reports</li><li>Everything in Free</li>`}</ul><a class="btn btn-primary" href="/app/bang-gia">${x.quoteOnly ? (V ? "Liên hệ nâng cấp" : "Contact to upgrade") : (V ? "Chọn gói" : "Choose plan")}</a></div>`).join("")}</div>
      <p class="muted">${V ? `Thanh toán bằng chuyển khoản ngân hàng qua mã QR (VietQR). ${S.payMode === "sepay" ? "Pro được kích hoạt tự động khi hệ thống nhận được tiền với đúng mã đơn." : "Pro được kích hoạt sau khi quản trị viên đối chiếu giao dịch với đúng mã đơn."} Không tự động trừ tiền gia hạn. Xem <a href="/vi/payment">Chính sách thanh toán</a> và <a href="/vi/refund">Chính sách hoàn tiền</a>.`
        : `Payment is by bank transfer via QR code (VietQR). ${S.payMode === "sepay" ? "Pro is activated automatically when the payment with the correct order code arrives." : "Pro is activated after an administrator matches the transaction with the correct order code."} Nothing is charged automatically for renewal. See the <a href="/en/payment">Payment policy</a> and <a href="/en/refund">Refund policy</a>.`}</p>`
      : `<p>${V ? "Hiện chưa mở bán gói Pro. Toàn bộ nội dung nền tảng vẫn miễn phí." : "Pro plans are not on sale yet. All foundation content remains free."}</p>`}`;
    return layout({ ...ctx, alt: { vi: "/vi/pricing", en: "/en/pricing" }, title: V ? "Bảng giá gói Pro" : "Pro plans and pricing", desc: `${V ? "Gói Pro" : "Pro plans"} ${site}: ${plans.map((x) => `${name(x)} ${x.quoteOnly ? (V ? "Liên hệ" : "Contact") : money(x.priceVnd, lang)}`).join(", ")}.`, body,
      jsonld: [crumbs(base, [[t.home, "/"], [t.pricing, `/${lang}/pricing`]]), ...plans.map((x) => ({ "@context": "https://schema.org", "@type": "Offer", name: name(x), price: x.priceVnd, priceCurrency: "VND", url: `${base}/${lang}/pricing` }))] });
  }

  const key = rest.slice(1);
  if (LEGAL[key]) {
    const homeHref = loggedIn ? (lang === "en" ? "/app/" : "/app/") : "/";
    const body = `<nav class="crumbs"><a href="${homeHref}">${t.home}</a> / ${esc(LEGAL[key][lang])}</nav><article class="legal"><h1>${esc(LEGAL[key][lang])}</h1>${legalText(key, lang, S, site)}<p class="muted">${t.updated}</p>${lang === "en" ? `<p class="muted">If the Vietnamese and English versions differ, the Vietnamese version prevails.</p>` : ""}</article>`;
    return layout({ ...ctx, alt: { vi: "/vi/" + key, en: "/en/" + key }, title: LEGAL[key][lang], desc: `${LEGAL[key][lang]} - ${site}.`, body, jsonld: [crumbs(base, [[t.home, "/"], [LEGAL[key][lang], p]])] });
  }
  return null;
}

function legalText(key, lang, S, site0) {
  const site = esc(site0);
  const owner = esc(S.legalOwner || site0);
  const V = lang === "vi";
  const contact = esc(S.supportContact || (V ? "kênh liên hệ ghi trên website" : "the contact channel shown on the website"));
  const sepay = S.payMode === "sepay";
  const T = V ? {
    terms: `<p>Điều khoản này là thỏa thuận giữa bạn và ${owner} (sau đây gọi là "chúng tôi") về việc sử dụng ${site}. Khi tạo tài khoản hoặc tiếp tục sử dụng dịch vụ, bạn xác nhận đã đọc và đồng ý với toàn bộ nội dung dưới đây.</p>
      <h2>1. Dịch vụ</h2><p>${site} là nền tảng học trực tuyến gồm các khóa ngoại ngữ (tiếng Anh, Trung, Nhật, Hàn, Pháp, Tây Ban Nha). Dịch vụ bao gồm bài học, bài tập chấm tự động, bài kiểm tra, luyện nghe, luyện nói và phát âm, hội thoại và phỏng vấn thử với AI, gia sư AI, lớp học, chứng nhận hoàn thành và các tính năng liên quan. Tất cả bài học miễn phí; chỉ gia sư AI và phỏng vấn AI thuộc gói trả phí (Pro, Family, Teacher) theo <a href="/vi/membership">Quy định gói thành viên</a>.</p>
      <h2>2. Điều kiện sử dụng</h2><p>Bạn cần cung cấp thông tin đăng ký trung thực. Người dưới 16 tuổi chỉ sử dụng dịch vụ khi có sự đồng ý và giám sát của cha mẹ hoặc người giám hộ; việc mua gói trả phí do người đủ năng lực hành vi dân sự thực hiện.</p>
      <h2>3. Tài khoản</h2><p>Mỗi tài khoản dành cho một người. Bạn chịu trách nhiệm giữ bí mật mật khẩu và mọi hoạt động diễn ra trên tài khoản của mình. Không chia sẻ, mua bán, cho thuê tài khoản. Hãy báo ngay cho chúng tôi nếu nghi ngờ tài khoản bị người khác sử dụng.</p>
      <h2>4. Sử dụng hợp lệ</h2><ul><li>Không dùng hệ thống để tấn công, dò quét mạng, đào tiền ảo, gửi thư rác hoặc làm quá tải dịch vụ.</li><li>Không gian lận kết quả học tập, không cố vượt qua giới hạn lượt AI, giới hạn tốc độ hoặc cơ chế chấm bài.</li><li>Không sao chép hàng loạt, bán lại hoặc phát tán nội dung bài học, đề bài, đáp án.</li><li>Không đăng tải, gửi vào AI hoặc lớp học nội dung vi phạm pháp luật, xúc phạm, quấy rối người khác.</li></ul>
      <h2>5. Tính năng AI</h2><p>Gia sư AI, hội thoại, phỏng vấn thử và góp ý phát âm do mô hình AI của bên thứ ba tạo ra. Câu trả lời có thể chưa chính xác và chỉ nhằm hỗ trợ học tập; không phải tư vấn nghề nghiệp, pháp lý hay y tế. Kết quả phỏng vấn thử không phản ánh quyết định tuyển dụng của bất kỳ tổ chức nào. Không gửi thông tin cá nhân nhạy cảm vào các tính năng AI. Số lượt sử dụng AI được giới hạn theo gói.</p>
      <h2>6. Luyện nói và phát âm</h2><p>Tính năng luyện nói cần bạn cho phép trình duyệt dùng micro. Giọng nói được chuyển thành văn bản bằng dịch vụ nhận dạng giọng nói của trình duyệt; chúng tôi chỉ nhận văn bản đã nhận dạng để chấm điểm và không lưu bản ghi âm. Điểm phát âm được tính từ văn bản nhận dạng nên chỉ mang tính tham khảo, không thay thế đánh giá của giáo viên hay kỳ thi chính thức. Giọng đọc mẫu có thể do công cụ tổng hợp giọng nói tạo ra.</p>
      <h2>7. Lớp học</h2><p>Giáo viên chịu trách nhiệm về nội dung bài giao, bài kiểm tra và nhận xét trong lớp của mình, và chỉ được dùng dữ liệu học viên cho mục đích giảng dạy. Học viên tham gia lớp có giấy phép giáo viên được dùng quyền Pro trong thời gian là thành viên lớp và giấy phép còn hạn.</p>
      <h2>8. Chứng nhận</h2><p>Chứng nhận do ${site} cấp xác nhận bạn đã hoàn thành nội dung trên nền tảng. Đây không phải văn bằng, chứng chỉ nghề nghiệp hay chứng chỉ ngoại ngữ quốc tế (HSK, JLPT, TOPIK, DELF, DELE, các chứng chỉ theo khung CEFR…); tên các khung chuẩn chỉ dùng để mô tả cấp độ nội dung.</p>
      <h2>9. Gói trả phí</h2><p>Việc thanh toán, kích hoạt, thời hạn và hoàn tiền thực hiện theo <a href="/vi/payment">Chính sách thanh toán</a>, <a href="/vi/refund">Chính sách hoàn tiền</a> và <a href="/vi/membership">Quy định gói thành viên</a>. Các gói không tự động gia hạn.</p>
      <h2>10. Quyền sở hữu nội dung</h2><p>Bài học, bài tập, đề kiểm tra, giao diện và phần mềm thuộc quyền của chúng tôi hoặc bên cấp phép. Bạn được dùng cho mục đích học tập cá nhân. Bài làm và câu trả lời bạn tự viết thuộc về bạn; bạn cho phép chúng tôi lưu trữ và xử lý chúng để cung cấp dịch vụ (chấm bài, hiển thị cho giáo viên của lớp bạn tham gia).</p>
      <h2>11. Tạm ngừng và chấm dứt</h2><p>Chúng tôi có thể tạm khóa hoặc chấm dứt tài khoản vi phạm điều khoản, sau khi thông báo lý do trừ trường hợp cần xử lý khẩn cấp để bảo vệ hệ thống. Bạn có thể ngừng sử dụng và yêu cầu xóa tài khoản bất cứ lúc nào qua kênh liên hệ.</p>
      <h2>12. Giới hạn trách nhiệm</h2><p>Dịch vụ được cung cấp theo hiện trạng. Chúng tôi nỗ lực duy trì hoạt động ổn định và sao lưu dữ liệu định kỳ nhưng không cam kết dịch vụ không gián đoạn hay không có lỗi. Trong phạm vi pháp luật cho phép, trách nhiệm bồi thường của chúng tôi đối với một tài khoản không vượt quá số tiền tài khoản đó đã thanh toán trong 12 tháng gần nhất.</p>
      <h2>13. Luật áp dụng</h2><p>Điều khoản này được điều chỉnh theo pháp luật Việt Nam. Tranh chấp được ưu tiên giải quyết bằng thương lượng; nếu không đạt được thỏa thuận sẽ do tòa án có thẩm quyền tại Việt Nam giải quyết.</p>
      <h2>14. Thay đổi điều khoản</h2><p>Khi thay đổi nội dung quan trọng, chúng tôi thông báo trên website hoặc trong mục Thông báo trước khi áp dụng. Tiếp tục sử dụng sau thời điểm đó nghĩa là bạn đồng ý với điều khoản mới.</p>
      <h2>15. Liên hệ</h2><p>${contact}</p>`,
    privacy: `<p>Chính sách này giải thích ${site} thu thập dữ liệu gì, dùng vào việc gì và bạn có những quyền nào.</p>
      <h2>1. Dữ liệu thu thập</h2><ul><li>Thông tin tài khoản: tên đăng nhập, tên hiển thị, ngôn ngữ giao diện, mật khẩu (chỉ lưu dạng băm một chiều, không ai đọc được).</li><li>Dữ liệu học tập: bài nộp, điểm, tiến độ, từ vựng cần ôn, chuỗi ngày học, bài làm trong lớp.</li><li>Luyện nói: văn bản mà trình duyệt nhận dạng từ giọng nói của bạn, điểm phát âm và thông tin nhắc luyện hằng ngày. Khi bạn bấm chấm chi tiết, bản ghi âm của một lượt được gửi tới Google Gemini (nhà cung cấp AI) để chấm điểm; chúng tôi không lưu bản ghi âm này. Trên điện thoại, luyện nói thu âm ngắn rồi gửi tới Google Gemini để nhận dạng và chấm điểm; chúng tôi cũng không lưu bản ghi âm này. Bản thu để "nghe lại giọng mình" chỉ nằm trên thiết bị của bạn và mất khi rời trang.</li><li>Tính năng AI: câu hỏi, nội dung hội thoại, phỏng vấn thử và câu trả lời của AI.</li><li>Đơn hàng và thanh toán: mã đơn, số tiền, nội dung chuyển khoản, mã giao dịch ngân hàng. Chúng tôi không lưu số thẻ hay mật khẩu ngân hàng.</li><li>Dữ liệu kỹ thuật: địa chỉ IP, thời gian truy cập, phục vụ bảo mật và chống lạm dụng.</li></ul>
      <h2>2. Mục đích sử dụng</h2><p>Cung cấp dịch vụ học tập, chấm bài, lưu tiến độ, nhắc học, kích hoạt gói trả phí, hỗ trợ học viên, chống gian lận và cải thiện chất lượng nội dung.</p>
      <h2>3. Ai xem được dữ liệu học tập</h2><ul><li>Giáo viên xem bài làm và điểm của học viên trong lớp mình, không xem được lớp của giáo viên khác.</li><li>Chủ gói Family chỉ xem tiến độ của thành viên đã đồng ý chia sẻ, không bao giờ thấy mật khẩu hay bài làm.</li><li>Học viên không xem được bài làm của học viên khác. Bảng xếp hạng chỉ hiện tên hiển thị và số bài đạt.</li></ul>
      <h2>4. Bên thứ ba xử lý dữ liệu</h2><ul><li>Nhà cung cấp AI (Google Gemini API): nhận câu hỏi, nội dung hội thoại, câu cần góp ý phát âm kèm ngữ cảnh bài học để tạo câu trả lời; nhận câu mẫu để tạo giọng đọc. Chúng tôi không gửi tên đăng nhập hay mật khẩu của bạn.</li><li>Dịch vụ nhận dạng giọng nói của trình duyệt (ví dụ Google với Chrome, Microsoft với Edge): khi bạn bấm micro, âm thanh được trình duyệt gửi tới dịch vụ này theo chính sách của nhà cung cấp trình duyệt.</li>${sepay ? "<li>SePay (dịch vụ thông báo biến động số dư): cung cấp thông tin giao dịch để xác nhận thanh toán.</li>" : ""}<li>Chúng tôi không bán dữ liệu cá nhân và không dùng dữ liệu của bạn cho quảng cáo.</li></ul>
      <h2>5. Lưu trữ và bảo mật</h2><p>Dữ liệu lưu trên máy chủ của chúng tôi, truyền qua HTTPS và được sao lưu định kỳ. Dữ liệu được giữ trong thời gian tài khoản còn hoạt động; dữ liệu giao dịch được lưu theo thời hạn pháp luật về kế toán yêu cầu.</p>
      <h2>6. Trẻ em</h2><p>Người dưới 16 tuổi cần có sự đồng ý của cha mẹ hoặc người giám hộ khi tạo tài khoản. Cha mẹ hoặc người giám hộ có thể yêu cầu xem hoặc xóa dữ liệu của con qua kênh liên hệ.</p>
      <h2>7. Quyền của bạn</h2><p>Bạn có quyền xem, sửa, yêu cầu xóa dữ liệu cá nhân, rút lại sự đồng ý và khiếu nại về việc xử lý dữ liệu. Gửi yêu cầu qua ${contact}; chúng tôi phản hồi trong 7 ngày làm việc.</p>
      <h2>8. Cookie và lưu trữ trên trình duyệt</h2><p>Chúng tôi chỉ dùng cookie đăng nhập cần thiết, và lưu trên trình duyệt các lựa chọn của bạn (ngôn ngữ, giao diện sáng tối, môn đang học, giọng đọc). Không dùng cookie quảng cáo hay theo dõi của bên thứ ba.</p>
      <h2>9. Thay đổi chính sách</h2><p>Khi thay đổi nội dung quan trọng, chúng tôi thông báo trên website trước khi áp dụng.</p>`,
    payment: `<h2>1. Phương thức</h2><p>Thanh toán bằng chuyển khoản ngân hàng qua mã QR (chuẩn VietQR) tới tài khoản hiển thị trên trang thanh toán.</p>
      <h2>2. Quy trình</h2><ol><li>Chọn gói, hệ thống tạo đơn với mã riêng (dạng PLxxxxxx).</li><li>Quét QR hoặc chuyển khoản đúng số tiền và ghi đúng nội dung là mã đơn.</li>${sepay ? "<li>Khi ngân hàng báo có tiền, hệ thống tự kiểm tra mã đơn, số tiền và tài khoản nhận rồi kích hoạt gói, thường trong 1 đến 3 phút.</li>" : `<li>Bấm “Tôi đã chuyển khoản”. Quản trị viên đối chiếu giao dịch trong tài khoản nhận tiền (đúng mã đơn, đủ số tiền) rồi kích hoạt gói. ${esc(S.manualConfirmNote || "")}</li>`}</ol>
      <h2>3. Lưu ý</h2><ul><li>Đơn có hiệu lực ${S.orderExpireHours || 24} giờ. Đơn hết hạn, hãy tạo đơn mới (đơn đã báo chuyển khoản không bị hết hạn trong lúc chờ đối soát).</li><li>Chuyển thiếu tiền hoặc sai nội dung, hệ thống không tự kích hoạt; liên hệ ${contact} kèm mã đơn và mã giao dịch để được đối soát.</li><li>Chúng tôi không kích hoạt chỉ dựa trên ảnh chụp màn hình hay việc mở trang thanh toán; mọi giao dịch được đối chiếu với dữ liệu ngân hàng.</li><li>Không có tự động trừ tiền gia hạn. Mua thêm khi còn hạn, thời gian được cộng nối tiếp.</li><li>Gói Teacher School theo báo giá riêng, thanh toán theo hợp đồng.</li></ul>
      <h2>4. Giá</h2><p>Giá niêm yết bằng Việt Nam đồng trên trang <a href="/vi/pricing">Bảng giá</a>. Giá có thể thay đổi; đơn đã tạo giữ nguyên giá tại thời điểm tạo.</p>`,
    refund: `<h2>1. Trường hợp được hoàn tiền</h2><ul><li>Chuyển khoản trùng (trả hai lần cho cùng một đơn) hoặc chuyển dư tiền.</li><li>Đã thanh toán nhưng không thể kích hoạt gói do lỗi từ phía chúng tôi và không khắc phục được trong 3 ngày làm việc.</li><li>Yêu cầu trong vòng 7 ngày kể từ khi kích hoạt lần đầu, nếu chưa sử dụng đáng kể quyền lợi (ví dụ: chưa hoàn thành bài học Pro nào và dùng dưới 10 lượt Rivo; với gói Teacher: chưa có học sinh tham gia lớp).</li></ul>
      <h2>2. Trường hợp không hoàn tiền</h2><ul><li>Đã quá 7 ngày kể từ ngày kích hoạt, trừ lỗi từ phía chúng tôi.</li><li>Tài khoản bị khóa do vi phạm Điều khoản sử dụng.</li></ul>
      <h2>3. Cách yêu cầu</h2><p>Gửi yêu cầu qua ${contact}, ghi tên đăng nhập, mã đơn, mã giao dịch ngân hàng và lý do. Chúng tôi phản hồi trong 3 ngày làm việc. Tiền hoàn được chuyển về đúng tài khoản đã thanh toán trong 7 ngày làm việc kể từ khi chấp thuận; quyền lợi tương ứng sẽ bị thu hồi.</p>`,
    membership: `<h2>1. Gói Free</h2><p>Miễn phí, không giới hạn thời gian: toàn bộ các cấp của ngoại ngữ, bài kiểm tra và chứng nhận của các cấp đó, luyện nói theo chủ đề, luyện phát âm, và các tính năng AI với số lượt giới hạn mỗi ngày.</p>
      <h2>2. Gói Pro</h2><p>Mở thêm gia sư AI, phỏng vấn AI không giới hạn và báo cáo học tập chi tiết. (Lượt hỏi gia sư AI: Free 3 lượt/ngày, Pro 100 lượt/ngày.) Thời hạn tính từ lúc kích hoạt theo số tháng của gói; mua thêm khi còn hạn thì cộng nối tiếp.</p>
      <h2>3. Gói Family</h2><p>Chủ gói mời tối đa số thành viên ghi trên gói (mỗi người tài khoản riêng); mọi thành viên đang hoạt động có quyền Pro đến hết hạn gói. Chủ gói chỉ xem tiến độ của thành viên đã bật chia sẻ.</p>
      <h2>4. Gói Teacher</h2><p>Giáo viên tạo lớp, giao bài, kiểm tra, xem báo cáo. Mỗi học sinh tham gia lớp chiếm một chỗ trong giấy phép (một học sinh ở nhiều lớp của cùng giáo viên chỉ tính một chỗ). Học sinh có quyền Pro trong thời gian là thành viên lớp và giấy phép còn hạn; rời lớp hoặc giấy phép hết hạn thì chỉ mất quyền từ lớp, quyền Pro cá nhân hoặc Family vẫn giữ nguyên.</p>
      <h2>5. Hết hạn</h2><p>Khi hết hạn, tài khoản trở về gói Free. Toàn bộ bài làm, tiến độ, lịch sử học tập vẫn được giữ nguyên.</p>
      <h2>6. Hủy gia hạn</h2><p>Các gói không tự động gia hạn. Bạn có thể tắt nhắc gia hạn trong trang Gói của tôi; quyền lợi vẫn dùng đến hết thời hạn đã trả.</p>
      <h2>7. Thay đổi quyền lợi</h2><p>Hạn mức AI có thể được điều chỉnh để đảm bảo chất lượng dịch vụ; thay đổi được thông báo trước trên website.</p>`,
  } : {
    terms: `<p>These terms are an agreement between you and ${owner} ("we") about your use of ${site}. By creating an account or continuing to use the service, you confirm that you have read and accept everything below.</p>
      <h2>1. The service</h2><p>${site} is an online learning platform with language courses (English, Chinese, Japanese, Korean, French, Spanish). It includes lessons, auto-graded exercises, tests, listening, speaking and pronunciation practice, AI conversation and mock interviews, an Rivo, classes, completion certificates and related features. All lessons are free; only the Rivo and AI mock interviews belong to paid plans (Pro, Family, Teacher) under the <a href="/en/membership">Membership rules</a>.</p>
      <h2>2. Eligibility</h2><p>You must give truthful registration details. People under 16 may use the service only with the consent and supervision of a parent or guardian; paid plans must be bought by a person with full legal capacity.</p>
      <h2>3. Accounts</h2><p>Each account is for one person. You are responsible for keeping your password secret and for all activity on your account. Do not share, sell or rent accounts. Tell us at once if you suspect someone else is using your account.</p>
      <h2>4. Acceptable use</h2><ul><li>Do not use the platform to attack systems, scan networks, mine cryptocurrency, send spam or overload the service.</li><li>Do not cheat on learning results or try to bypass AI limits, rate limits or the grading system.</li><li>Do not bulk-copy, resell or distribute lessons, exercises or answers.</li><li>Do not post, or send to the AI or a class, content that is unlawful, abusive or harassing.</li></ul>
      <h2>5. AI features</h2><p>The Rivo, conversations, mock interviews and pronunciation tips are generated by third-party AI models. Answers may be inaccurate and are for learning support only; they are not career, legal or medical advice. Mock-interview results do not reflect any organisation's hiring decision. Do not send sensitive personal information to AI features. AI usage is limited according to your plan.</p>
      <h2>6. Speaking and pronunciation</h2><p>Speaking practice needs you to allow your browser to use the microphone. Speech is turned into text by your browser's speech-recognition service; we receive only the recognised text in order to score it, and we do not store audio recordings. Pronunciation scores are calculated from the recognised text, so they are indicative only and do not replace assessment by a teacher or an official exam. Model voices may be produced by speech synthesis.</p>
      <h2>7. Classes</h2><p>Teachers are responsible for the assignments, tests and feedback in their own classes and may use learner data only for teaching. Learners in a class covered by a teacher licence get Pro access while they are class members and the licence is valid.</p>
      <h2>8. Certificates</h2><p>Certificates issued by ${site} confirm that you completed content on the platform. They are not degrees, professional certifications or international language certificates (HSK, JLPT, TOPIK, DELF, DELE, CEFR-based certificates and so on); the names of those frameworks are used only to describe the level of the content.</p>
      <h2>9. Paid plans</h2><p>Payment, activation, duration and refunds follow the <a href="/en/payment">Payment policy</a>, the <a href="/en/refund">Refund policy</a> and the <a href="/en/membership">Membership rules</a>. Plans never renew automatically.</p>
      <h2>10. Ownership of content</h2><p>Lessons, exercises, tests, the interface and the software belong to us or our licensors. You may use them for personal learning. Work and answers you write yourself belong to you; you allow us to store and process them to provide the service (grading, showing them to the teacher of a class you joined).</p>
      <h2>11. Suspension and termination</h2><p>We may suspend or close accounts that break these terms, after telling you why unless urgent action is needed to protect the system. You may stop using the service and ask for your account to be deleted at any time through the contact channel.</p>
      <h2>12. Limitation of liability</h2><p>The service is provided as is. We work to keep it stable and back up data regularly, but we do not guarantee uninterrupted or error-free operation. To the extent the law allows, our liability to an account is limited to the amount that account paid in the previous 12 months.</p>
      <h2>13. Governing law</h2><p>These terms are governed by the laws of Vietnam. Disputes are first settled by negotiation; failing that, they are resolved by the competent court in Vietnam.</p>
      <h2>14. Changes to these terms</h2><p>When we make important changes we announce them on the website or in Notifications before they apply. Continuing to use the service after that means you accept the new terms.</p>
      <h2>15. Contact</h2><p>${contact}</p>`,
    privacy: `<p>This policy explains what data ${site} collects, what it is used for and what rights you have.</p>
      <h2>1. Data we collect</h2><ul><li>Account information: username, display name, interface language, password (stored only as a one-way hash that nobody can read).</li><li>Learning data: answers, scores, progress, words to review, day streak, class work.</li><li>Speaking practice: the text your browser recognised from your speech, your pronunciation scores, and reminder settings. When you ask for a detailed pronunciation score, the audio of that one attempt is sent to Google Gemini (our AI provider) to be scored; we do not store that audio. On phones, speaking practice records a short clip that is sent to Google Gemini to be transcribed and scored; we do not store those clips either. The recording used to replay your own voice stays on your device and is discarded when you leave the page.</li><li>AI features: your questions, conversations, mock interviews and the AI's answers.</li><li>Orders and payments: order code, amount, transfer description, bank transaction reference. We never store card numbers or banking passwords.</li><li>Technical data: IP address and access times, for security and abuse prevention.</li></ul>
      <h2>2. Purposes</h2><p>To provide learning services, grade work, save progress, send study reminders, activate paid plans, support learners, prevent fraud and improve content quality.</p>
      <h2>3. Who can see learning data</h2><ul><li>Teachers see the work and scores of learners in their own classes only, never other teachers' classes.</li><li>A Family plan owner only sees the progress of members who agreed to share it, and never sees their passwords or work.</li><li>Learners cannot see other learners' work. Leaderboards show only display names and the number of exercises passed.</li></ul>
      <h2>4. Third parties that process data</h2><ul><li>The AI provider (Google Gemini API) receives questions, conversations and sentences for pronunciation tips together with lesson context in order to generate answers, and receives model sentences in order to generate voice audio. We do not send your username or password.</li><li>Your browser's speech-recognition service (for example Google with Chrome, Microsoft with Edge): when you tap the microphone, the browser sends audio to that service under the browser vendor's own policy.</li>${sepay ? "<li>SePay (a balance-notification service) provides transaction details to confirm payments.</li>" : ""}<li>We do not sell personal data and do not use your data for advertising.</li></ul>
      <h2>5. Storage and security</h2><p>Data is stored on our servers, sent over HTTPS and backed up regularly. Data is kept while the account is active; transaction data is kept for as long as accounting law requires.</p>
      <h2>6. Children</h2><p>People under 16 need the consent of a parent or guardian to create an account. A parent or guardian can ask to see or delete their child's data through the contact channel.</p>
      <h2>7. Your rights</h2><p>You can see, correct or ask us to delete your personal data, withdraw consent and complain about how data is handled. Send requests via ${contact}; we reply within 7 business days.</p>
      <h2>8. Cookies and browser storage</h2><p>We only use the cookie needed to keep you signed in, and store your choices (language, light or dark theme, current subject, voice) in your browser. We do not use advertising or third-party tracking cookies.</p>
      <h2>9. Changes to this policy</h2><p>When we make important changes we announce them on the website before they apply.</p>`,
    payment: `<h2>1. Method</h2><p>Payment is by bank transfer via QR code (VietQR standard) to the account shown on the payment page.</p>
      <h2>2. Process</h2><ol><li>Choose a plan; the system creates an order with its own code (PLxxxxxx).</li><li>Scan the QR code or transfer the exact amount with the order code as the transfer description.</li>${sepay ? "<li>When the bank reports the payment, the system checks the order code, amount and receiving account and activates the plan, usually within 1 to 3 minutes.</li>" : `<li>Click “I have transferred”. An administrator matches the transaction in the receiving account (correct order code, full amount) and activates the plan.</li>`}</ol>
      <h2>3. Notes</h2><ul><li>Orders are valid for ${S.orderExpireHours || 24} hours. If an order expires, create a new one (orders reported as paid don't expire while being checked).</li><li>If you pay too little or use the wrong description, the plan isn't activated automatically; contact ${contact} with the order code and transaction reference.</li><li>We never activate based on a screenshot or because the payment page was opened; every payment is matched against bank data.</li><li>Nothing is charged automatically for renewal. Buying again while active adds the time on.</li><li>Teacher School plans are quoted individually and paid under contract.</li></ul>
      <h2>4. Prices</h2><p>Prices are listed in Vietnamese dong on the <a href="/en/pricing">Pricing</a> page. Prices may change; existing orders keep the price at the time they were created.</p>`,
    refund: `<h2>1. When you can get a refund</h2><ul><li>Duplicate transfers (paying twice for the same order) or overpayment.</li><li>You paid but the plan could not be activated because of our error, and we could not fix it within 3 business days.</li><li>A request within 7 days of first activation, if the benefits have not been used significantly (for example: no Pro lesson completed and fewer than 10 Rivo questions; for Teacher plans: no student has joined a class).</li></ul>
      <h2>2. When refunds are not given</h2><ul><li>More than 7 days after activation, except for errors on our side.</li><li>The account was locked for breaking the Terms of use.</li></ul>
      <h2>3. How to request</h2><p>Send a request via ${contact} with your username, order code, bank transaction reference and reason. We reply within 3 business days. Approved refunds go back to the paying account within 7 business days, and the related benefits are withdrawn.</p>`,
    membership: `<h2>1. Free</h2><p>Free with no time limit: all levels of the language courses, the tests and certificates of those levels, topic-based speaking practice, pronunciation practice, and AI features with a daily limit.</p>
      <h2>2. Pro</h2><p>Adds the Rivo, unlimited AI mock interviews and detailed learning reports. (Rivo turns: Free 3 per day, Pro 100 per day.) The term starts at activation for the number of months in the plan; buying again while active adds the time on.</p>
      <h2>3. Family</h2><p>The owner invites up to the number of members stated on the plan (each with their own account); every active member gets Pro until the plan expires. The owner only sees progress from members who enabled sharing.</p>
      <h2>4. Teacher</h2><p>Teachers create classes, assign work and tests and see reports. Each student who joins a class uses one license seat (a student in several classes of the same teacher counts once). Students get Pro while they are class members and the license is valid; leaving the class or license expiry only removes the class access, and personal or Family Pro is kept.</p>
      <h2>5. Expiry</h2><p>When a plan expires, the account returns to Free. All work, progress and learning history is kept.</p>
      <h2>6. Cancelling renewal</h2><p>Plans never renew automatically. You can turn off renewal reminders on the My plan page; benefits remain until the paid period ends.</p>
      <h2>7. Changes to benefits</h2><p>AI limits may be adjusted to keep the service reliable; changes are announced on the website in advance.</p>`,
  };
  return T[key];
}
