/* Bạn đồng hành: người dùng chọn một bạn, bạn đó đi cùng suốt hành trình học.
   Nhân vật là SVG 2.5D: gradient khối (sáng ở trên trái, tối ở dưới phải), bóng đổ mềm,
   điểm sáng trên mắt và đầu, đôi má hồng. Chuyển động (thở, chớp mắt, lắc đầu, vẫy tai,
   đung đưa đuôi, lấp lánh, miệng mở khi nói) nằm trong chibi-premium.css mục 20.
   Lựa chọn lưu trên máy chủ (S.prefs.companion). */
import { S, esc } from "./core.js";
import { t as trText } from "./i18n.js";

const INK = "#303047";

export const COMPANIONS = [
  { id: "owl", name: "Pippa", tone: "Điềm tĩnh, hay giải thích", intro: "Mình giải thích rõ ràng, bạn cứ hỏi lại thoải mái.", head: "#C9B8FF", body: "#8F7CF0", acc: "#FFB020", ears: "tuft", tail: false, face: "owl" },
  { id: "panda", name: "Leo", tone: "Chậm rãi, kiên nhẫn", intro: "Mình đi từng bước nhỏ, không vội vàng với bạn.", head: "#FFFFFF", body: "#2F2E44", acc: "#303047", ears: "round", tail: false, face: "panda" },
  { id: "cat", name: "Mimi", tone: "Nhanh nhẹn, hay trêu", intro: "Mình sẽ thách bạn bằng vài câu đố vui mỗi ngày.", head: "#FFC27A", body: "#F59A3D", acc: "#FF8FB1", ears: "pointed", tail: true, face: "cat" },
  { id: "bunny", name: "Bonnie", tone: "Vui vẻ, hay động viên", intro: "Mình luôn nhắc bạn rằng bạn đang tiến bộ.", head: "#FFD1E3", body: "#FF9CC2", acc: "#FF7DAA", ears: "long", tail: true, face: "bunny" },
  { id: "fox", name: "Rusty", tone: "Tinh nghịch, thông minh", intro: "Mình thích tìm cách học tắt và thú vị hơn.", head: "#FF9F5A", body: "#EE7A33", acc: "#FFF4E8", ears: "pointed", tail: true, face: "fox" },
  { id: "dragon", name: "Finn", tone: "Mạnh mẽ, hay khích lệ", intro: "Mình sẽ khích lệ bạn vượt qua từng bài khó.", head: "#8FE3C2", body: "#4FBF97", acc: "#FFD84D", ears: "horn", tail: true, face: "dragon" },
];
const BY_ID = Object.fromEntries(COMPANIONS.map((c) => [c.id, c]));
// Bạn mặc định theo môn, dùng khi người dùng chưa chọn
export const SUBJ_DEFAULT = { en: "owl", zh: "panda", ja: "cat", ko: "bunny", fr: "fox", es: "dragon" };

export function companionOf(id) {
  return BY_ID[id] || BY_ID[SUBJ_DEFAULT[id]] || BY_ID.owl;
}

/* Bạn đang đồng hành: lựa chọn của người dùng; chưa chọn thì lấy bạn mặc định của môn */
export function activeCompanionId(subjId) {
  const pick = S && S.prefs && S.prefs.companion;
  if (BY_ID[pick]) return pick;
  return SUBJ_DEFAULT[subjId || (S && S.prefs && S.prefs.subject)] || "owl";
}

/* ---------- màu: pha sáng / tối cho gradient khối ---------- */
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (a) => "#" + a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v + (B[i] - v) * t)); };
const lite = (c, t = 0.5) => mix(c, "#FFFFFF", t);
const shade = (c, t = 0.3) => mix(c, INK, t);

let uid = 0;

/* Chi tiết riêng từng loài: mắt, tai, mũi, đuôi, dấu riêng */
function earsSvg(c, u) {
  const edge = `stroke="${INK}" stroke-opacity=".5" stroke-width="1.6" stroke-linejoin="round"`;
  const H = `url(#${u}-h)`;
  switch (c.ears) {
    case "round":
      return `<g class="cp-ear cp-ear-l"><circle cx="31" cy="25" r="12" fill="${H}" ${edge}/><circle cx="31" cy="25" r="5.5" fill="${shade(c.body, 0.1)}"/></g><g class="cp-ear cp-ear-r"><circle cx="89" cy="25" r="12" fill="${H}" ${edge}/><circle cx="89" cy="25" r="5.5" fill="${shade(c.body, 0.1)}"/></g>`;
    case "pointed":
      return `<g class="cp-ear cp-ear-l"><path d="M34 40 L27 9 L55 27Z" fill="${H}" ${edge}/><path d="M37 33 L33 17 L48 27Z" fill="${c.acc}"/></g><g class="cp-ear cp-ear-r"><path d="M86 40 L93 9 L65 27Z" fill="${H}" ${edge}/><path d="M83 33 L87 17 L72 27Z" fill="${c.acc}"/></g>`;
    case "long":
      return `<g class="cp-ear cp-ear-l"><ellipse cx="41" cy="14" rx="9.5" ry="23" transform="rotate(-11 41 14)" fill="${H}" ${edge}/><ellipse cx="41" cy="16" rx="4.6" ry="14" transform="rotate(-11 41 16)" fill="${c.acc}" opacity=".85"/></g><g class="cp-ear cp-ear-r"><ellipse cx="79" cy="14" rx="9.5" ry="23" transform="rotate(11 79 14)" fill="${H}" ${edge}/><ellipse cx="79" cy="16" rx="4.6" ry="14" transform="rotate(11 79 16)" fill="${c.acc}" opacity=".85"/></g>`;
    case "tuft":
      return `<g class="cp-ear cp-ear-l"><path d="M36 36 L31 6 L56 26Z" fill="${H}" ${edge}/></g><g class="cp-ear cp-ear-r"><path d="M84 36 L89 6 L64 26Z" fill="${H}" ${edge}/></g>`;
    case "horn":
      return `<g class="cp-ear cp-ear-l"><path d="M38 30 Q30 14 40 3 Q43 17 50 25Z" fill="url(#${u}-acc)" ${edge}/></g><g class="cp-ear cp-ear-r"><path d="M82 30 Q90 14 80 3 Q77 17 70 25Z" fill="url(#${u}-acc)" ${edge}/></g>`;
    default:
      return "";
  }
}

function eyesSvg(c, u) {
  const iris = `url(#${u}-eye)`;
  if (c.face === "owl") {
    return `<circle cx="45" cy="50" r="13" fill="url(#${u}-owl)" stroke="${INK}" stroke-width="2"/><circle cx="75" cy="50" r="13" fill="url(#${u}-owl)" stroke="${INK}" stroke-width="2"/>`
      + `<circle cx="45" cy="51" r="7" fill="${iris}"/><circle cx="75" cy="51" r="7" fill="${iris}"/>`
      + `<circle cx="42.8" cy="48.4" r="2.3" fill="#fff"/><circle cx="72.8" cy="48.4" r="2.3" fill="#fff"/><circle cx="46.6" cy="53.4" r="1" fill="#fff" opacity=".8"/><circle cx="76.6" cy="53.4" r="1" fill="#fff" opacity=".8"/>`;
  }
  const patches = c.face === "panda"
    ? `<path d="M34 46 Q34 36 45 36 Q56 37 55 50 Q54 62 44 60 Q33 58 34 46Z" fill="url(#${u}-eye)"/><path d="M86 46 Q86 36 75 36 Q64 37 65 50 Q66 62 76 60 Q87 58 86 46Z" fill="url(#${u}-eye)"/>`
    : "";
  return `${patches}<ellipse cx="46" cy="50" rx="5" ry="6" fill="${iris}"/><ellipse cx="74" cy="50" rx="5" ry="6" fill="${iris}"/>`
    + `<circle cx="48" cy="47.6" r="2.1" fill="#fff"/><circle cx="76" cy="47.6" r="2.1" fill="#fff"/><circle cx="44.6" cy="52.4" r="1" fill="#fff" opacity=".8"/><circle cx="72.6" cy="52.4" r="1" fill="#fff" opacity=".8"/>`;
}

// Chi tiết đặt trước mắt (trên đầu, trên má)
function marksBefore(c, u) {
  if (c.face === "fox") return `<path d="M60 62 C44 62 36 72 44 84 C50 78 55 75 60 73 C65 75 70 78 76 84 C84 72 76 62 60 62Z" fill="url(#${u}-cream)"/><path d="M26 44 L34 58 L26 60Z M94 44 L86 58 L94 60Z" fill="#FFF4E8" opacity=".9"/>`;
  if (c.face === "cat") return `<path d="M50 22 L53 32 M60 19 L60 30 M70 22 L67 32" stroke="${shade(c.head, 0.45)}" stroke-width="2.4" stroke-linecap="round" opacity=".65"/>`;
  if (c.face === "dragon") return `<path d="M48 22 C50 16 54 14 58 14 C56 18 55 22 56 26Z M64 26 C66 19 70 17 74 17 C72 22 71 25 72 29Z" fill="${shade(c.body, 0.1)}" opacity=".5"/>`;
  return "";
}
function marksAfter(c, u) {
  if (c.face === "cat") return `<path d="M56 60 L64 60 L60 65Z" fill="url(#${u}-pink)" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/><path d="M34 62 L18 58 M34 66 L19 68 M86 62 L102 58 M86 66 L101 68" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" opacity=".75"/>`;
  if (c.face === "panda") return `<ellipse cx="60" cy="63" rx="5.5" ry="4" fill="${INK}"/><ellipse cx="58.4" cy="61.6" r="1.4" fill="#fff" opacity=".7"/>`;
  if (c.face === "fox") return `<ellipse cx="60" cy="63" rx="4.2" ry="3.2" fill="${INK}"/><ellipse cx="58.8" cy="62" r="1.1" fill="#fff" opacity=".6"/>`;
  if (c.face === "bunny") return `<rect x="56" y="70" width="8" height="8" rx="1.5" fill="#fff" stroke="${INK}" stroke-width="1.4"/><path d="M60 70 V76" stroke="${INK}" stroke-width="1"/>`;
  return "";
}

function mouthSvg(c, u) {
  if (c.face === "owl") {
    return `<path class="cp-mouth-smile" d="M55 60 L65 60 L60 69Z" fill="url(#${u}-acc)" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path class="cp-mouth-open" d="M55 60 L65 60 L60 71Z" fill="url(#${u}-acc)" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
  }
  return `<path class="cp-mouth-smile" d="M53 66 Q60 73.5 67 66" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" fill="none"/><path class="cp-mouth-open" d="M53.5 65.5 Q60 65 66.5 65.5 Q65.5 74 60 74 Q54.5 74 53.5 65.5Z" fill="url(#${u}-mouth)" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
}

/* SVG một bạn đồng hành. talk = true thì miệng đang nói (bật chuyển động miệng). */
function companionSvgArt(id, size = 96, { talk = false, cls = "" } = {}) {
  const c = companionOf(id);
  const u = `cpg${++uid}`;
  const edge = `stroke="${INK}" stroke-opacity=".5" stroke-width="1.6"`;
  const H = `url(#${u}-h)`, B = `url(#${u}-b)`;
  const tail = c.tail
    ? `<g class="cp-tail"><path d="M79 100 C104 102 112 82 103 66" stroke="${INK}" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M79 100 C104 102 112 82 103 66" stroke="url(#${u}-b)" stroke-width="7.4" stroke-linecap="round" fill="none"/>${c.face === "fox" ? `<circle cx="103" cy="66" r="4.4" fill="#FFF4E8"/>` : ""}</g>`
    : "";
  const defs = `<defs>
    <radialGradient id="${u}-h" cx="36%" cy="28%" r="78%"><stop offset="0" stop-color="${lite(c.head, 0.55)}"/><stop offset=".55" stop-color="${c.head}"/><stop offset="1" stop-color="${shade(c.head, 0.22)}"/></radialGradient>
    <radialGradient id="${u}-b" cx="38%" cy="26%" r="80%"><stop offset="0" stop-color="${lite(c.body, 0.5)}"/><stop offset=".6" stop-color="${c.body}"/><stop offset="1" stop-color="${shade(c.body, 0.3)}"/></radialGradient>
    <radialGradient id="${u}-belly" cx="42%" cy="32%" r="70%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F1E6DA"/></radialGradient>
    <radialGradient id="${u}-acc" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="${lite(c.acc, 0.5)}"/><stop offset="1" stop-color="${shade(c.acc, 0.25)}"/></radialGradient>
    <radialGradient id="${u}-eye" cx="40%" cy="34%" r="70%"><stop offset="0" stop-color="#6B6890"/><stop offset="1" stop-color="${INK}"/></radialGradient>
    <radialGradient id="${u}-owl" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFE7A8"/></radialGradient>
    <radialGradient id="${u}-cheek" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FF8FB8" stop-opacity=".9"/><stop offset="1" stop-color="#FF8FB8" stop-opacity="0"/></radialGradient>
    <radialGradient id="${u}-cream" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFE9D6"/></radialGradient>
    <linearGradient id="${u}-pink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB3CD"/><stop offset="1" stop-color="#FF7DAA"/></linearGradient>
    <linearGradient id="${u}-mouth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF7DAA"/><stop offset="1" stop-color="#C2375F"/></linearGradient>
    <linearGradient id="${u}-foot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lite(c.acc, 0.3)}"/><stop offset="1" stop-color="${shade(c.acc, 0.2)}"/></linearGradient>
    <filter id="${u}-plush" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2" seed="7" result="n"/>
      <feDiffuseLighting in="n" surfaceScale="1.4" diffuseConstant="1.08" lighting-color="#FFFFFF" result="l"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1.06" k2="0" k3="0" k4="0" result="c"/>
      <feComposite in="c" in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="${u}-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.2"/></filter>
    <filter id="${u}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>
  </defs>`;
  return `<svg class="cp-svg cp-${c.id}${talk ? " is-talking" : ""}${cls ? " " + cls : ""}" viewBox="0 0 120 120" width="${size}" height="${size}" fill="none" role="img" aria-label="${esc(c.name)}">
    ${defs}
    <ellipse class="cp-shadow" cx="60" cy="115" rx="30" ry="5" fill="${INK}" opacity=".22" filter="url(#${u}-soft)"/>
    ${tail}
    <g class="cp-body">
      <ellipse cx="60" cy="97" rx="26" ry="20" fill="${B}" ${edge} filter="url(#${u}-plush)"/>
      <ellipse cx="60" cy="78" rx="22" ry="5" fill="${shade(c.body, 0.55)}" opacity=".38" filter="url(#${u}-soft)"/>
      <ellipse cx="60" cy="101" rx="13.5" ry="11" fill="url(#${u}-belly)"/>
      <ellipse cx="45" cy="110" rx="10" ry="5.6" fill="url(#${u}-foot)" ${edge}/>
      <ellipse cx="75" cy="110" rx="10" ry="5.6" fill="url(#${u}-foot)" ${edge}/>
      <ellipse cx="32" cy="93" rx="7.5" ry="11" transform="rotate(14 32 93)" fill="${B}" ${edge}/>
      <g class="cp-arm-r"><ellipse cx="88" cy="93" rx="7.5" ry="11" transform="rotate(-14 88 93)" fill="${B}" ${edge}/></g>
      <ellipse cx="42" cy="90" rx="7" ry="3.2" transform="rotate(-18 42 90)" fill="#FFFFFF" opacity=".35"/>
    </g>
    <g class="cp-head">
      ${earsSvg(c, u)}
      <ellipse cx="60" cy="49" rx="34" ry="31" fill="${H}" ${edge} filter="url(#${u}-plush)"/>
      <ellipse cx="44" cy="29" rx="13" ry="6.5" transform="rotate(-22 44 29)" fill="#FFFFFF" opacity=".5"/>
      ${marksBefore(c, u)}
      <g class="cp-eyes">${eyesSvg(c, u)}</g>
      <ellipse cx="34" cy="66" rx="6" ry="3.6" fill="url(#${u}-cheek)"/>
      <ellipse cx="86" cy="66" rx="6" ry="3.6" fill="url(#${u}-cheek)"/>
      ${mouthSvg(c, u)}
      ${marksAfter(c, u)}
    </g>
    <path class="cp-spark" d="M102 14l2.4 5 5.2.8-3.8 3.6 1 5.2-4.8-2.5-4.8 2.5 1-5.2-3.8-3.6 5.2-.8z" fill="#FFE066" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
  </svg>`;
}

/* Gõ chữ từng ký tự và bật chuyển động miệng trong lúc nói. Gọi lại khi đang gõ thì câu cũ bị hủy. */
export function typeInto(el, text, { root = null, speed = 26 } = {}) {
  if (!el) return Promise.resolve(false);
  const tok = (el._tok = (el._tok || 0) + 1);
  const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const chars = Array.from(String(text || ""));
  el.textContent = reduce ? chars.join("") : "";
  if (reduce) return Promise.resolve(true);
  root && root.classList.add("is-talking");
  return new Promise((resolve) => {
    let i = 0;
    const stop = () => { root && root.classList.remove("is-talking"); };
    const step = () => {
      if (el._tok !== tok) { stop(); return resolve(false); }
      i += 1;
      el.textContent = chars.slice(0, i).join("");
      if (i < chars.length) {
        const pause = /[.!?,;:]/.test(chars[i - 1]) ? 180 : 0;
        setTimeout(step, speed + pause);
      } else {
        setTimeout(() => { if (el._tok === tok) stop(); }, 500);
        resolve(true);
      }
    };
    step();
  });
}

/* ---------- Chọn bạn đồng hành (dùng ở màn chọn môn) ---------- */
export function companionPickerHtml(currentId) {
  return `<div class="cp-picker" role="radiogroup" aria-label="Chọn bạn đồng hành">${COMPANIONS.map((c) => `
    <button type="button" role="radio" aria-checked="${c.id === currentId}" class="cp-pick${c.id === currentId ? " on" : ""}" data-companion="${esc(c.id)}">
      <span class="cp-pick-face">${companionSvg(c.id, 72, { talk: c.id === currentId })}</span>
      <b>${esc(c.name)}</b>
      <small>${esc(c.tone)}</small>
      <em class="cp-pick-intro">${esc(c.intro || "")}</em>
    </button>`).join("")}</div>`;
}

/* ---------- Bạn đồng hành đi theo người dùng ở mọi trang trong ứng dụng ---------- */
const HIDE_ROUTES = /^(chon-mon|dat-lai-mat-khau|quan-tri|giao-vien)/;
const TIPS = [
  [/^(mon-hoc|)$/, "Bấm Học tiếp để vào bài gần nhất nhé. Mình sẽ đi cùng bạn!"],
  [/^ngoai-ngu\/(luyen-noi|tro-chuyen)/, "Đọc theo mình nhé, máy sẽ chấm từng từ cho bạn."],
  [/^ngoai-ngu\/on-tap/, "Ôn đúng lúc sẽ nhớ lâu hơn đó!"],
  [/^ngoai-ngu\/bai\//, "Làm xong bài là mình chấm ngay, sai đâu sửa đó."],
  [/^ngoai-ngu/, "Đi tuần tự từng chương, mình nhắc bạn bài tiếp theo."],
  [/^tro-choi/, "Chơi một ván nhỏ để nhớ từ thật lâu nhé!"],
  [/^toeic/, "Mỗi ngày một Part, mình sẽ nhắc bạn ôn đều."],
  [/^(phong-van|ai)/, "Thử trả lời phỏng vấn cùng mình nào."],
  [/^(chung-nhan|xep-hang|huy-hieu)/, "Bạn đang tiến bộ rất tốt, cố lên!"],
  [/^(bang-gia|goi-cua-toi)/, "Nâng cấp Pro để mở thêm bài nâng cao."],
];
const tipFor = (path) => (TIPS.find(([re]) => re.test(path)) || [null, "Mình luôn ở đây khi bạn cần."])[1];

let follower = null;
function ensureFollower() {
  if (follower || document.getElementById("cpFollow")) return follower || document.getElementById("cpFollow");
  try { if (sessionStorage.getItem("pl:cp-hide") === "1") return null; } catch {}
  const el = document.createElement("aside");
  el.id = "cpFollow";
  el.className = "cp-follow";
  el.hidden = true;
  el.setAttribute("aria-label", "Bạn đồng hành");
  el.innerHTML = `<div class="cp-follow-say" aria-live="polite"><span class="cp-say-text"></span></div>
    <button type="button" class="cp-follow-btn" aria-label="Trò chuyện cùng bạn đồng hành"></button>
    <button type="button" class="cp-follow-x" aria-label="Ẩn bạn đồng hành đến hết phiên">×</button>`;
  document.body.appendChild(el);
  el.querySelector(".cp-follow-btn").addEventListener("click", () => {
    // Bấm bạn đồng hành: mở khung trò chuyện AI nếu có, không thì nhắc lại gợi ý
    const fab = document.querySelector(".aiw-fab");
    if (fab) fab.click();
    else typeInto(el.querySelector(".cp-say-text"), el._tip || "", { root: el.querySelector("svg"), speed: 18 });
  });
  el.querySelector(".cp-follow-x").addEventListener("click", () => {
    el.hidden = true;
    document.body.classList.remove("cp-on");
    try { sessionStorage.setItem("pl:cp-hide", "1"); } catch {}
  });
  follower = el;
  return el;
}

/* Gọi ở mỗi lần chuyển trang: bạn đồng hành hiện, nói gợi ý đúng trang đó */
export function companionRoute(path) {
  if (!S || !S.me) return;
  const el = ensureFollower();
  if (!el) return;
  if (HIDE_ROUTES.test(path)) { el.hidden = true; document.body.classList.remove("cp-on"); return; }
  const id = activeCompanionId();
  const size = window.matchMedia && window.matchMedia("(max-width: 640px)").matches ? 62 : 84;
  const btn = el.querySelector(".cp-follow-btn");
  if (btn.dataset.id !== id || btn.dataset.size !== String(size)) {
    btn.innerHTML = companionSvg(id, size);
    btn.dataset.id = id;
    btn.dataset.size = String(size);
  }
  el.hidden = false;
  document.body.classList.add("cp-on");
  el._tip = `${trText(companionOf(id).name)}: ${trText(tipFor(path))}`;
  typeInto(el.querySelector(".cp-say-text"), el._tip, { root: btn.querySelector("svg"), speed: 22 });
}

/* Đổi bạn đồng hành ở nơi khác (thẻ Cổ Vũ, màn chọn môn): trợ lý nổi đổi hình ngay và tự giới thiệu */
export function refreshCompanion(say = "") {
  const el = document.getElementById("cpFollow");
  if (!el || el.hidden) return;
  const id = activeCompanionId();
  const c = companionOf(id);
  const btn = el.querySelector(".cp-follow-btn");
  const size = window.matchMedia && window.matchMedia("(max-width: 640px)").matches ? 62 : 84;
  btn.innerHTML = companionSvg(id, size);
  btn.dataset.id = id;
  btn.dataset.size = String(size);
  const line = say || `Xin chào, mình là ${c.name}. Mình sẽ đi cùng bạn và nhắc bài tiếp theo.`;
  el._tip = line;
  typeInto(el.querySelector(".cp-say-text"), line, { root: btn.querySelector("svg"), speed: 22 });
}

/* Bạn đồng hành: ảnh 3D gốc (pet-*.webp). Ảnh tĩnh nên chuyển động là trôi nhẹ, gật khi nói. */
export function companionSvg(id, size = 96, { talk = false, cls = "" } = {}) {
  const c = companionOf(id);
  return `<img class="cp-img cp-${c.id}${talk ? " is-talking" : ""}${cls ? " " + cls : ""}" src="/img/chibi/pet-${c.id}.webp?v=art2" width="${size}" height="${size}" alt="${esc(c.name)}" decoding="async">`;
}
