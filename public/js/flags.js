/* 4.11.1 - Country flags as SVG images.
   Windows lacks flag emoji glyphs (GB renders as letters "GB"), so every flag emoji on the page
   is replaced with /img/flags/<code>.svg as soon as content renders (including dynamically rendered content). */
const HAVE = new Set(["gb", "cn", "jp", "kr", "fr", "es"]);
const RE = /[\u{1F1E6}-\u{1F1FF}]{2}/gu;
const code = (flag) => [...flag].map((c) => String.fromCharCode(c.codePointAt(0) - 0x1F1E6 + 97)).join("");
const SKIP = "script, style, textarea, title, option, select, input, pre, code, [contenteditable]";

function swap(node) {
  const text = node.nodeValue;
  RE.lastIndex = 0;
  if (!text || !RE.test(text)) return;
  const el = node.parentElement;
  if (!el || el.closest(SKIP)) return;
  const frag = document.createDocumentFragment();
  let last = 0, changed = false;
  RE.lastIndex = 0;
  for (let m; (m = RE.exec(text)); ) {
    const cc = code(m[0]);
    if (!HAVE.has(cc)) continue;
    if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
    const img = document.createElement("img");
    img.className = "flag-ic"; img.src = `/img/flags/${cc}.svg`; img.alt = ""; img.decoding = "async"; img.draggable = false;
    img.setAttribute("aria-hidden", "true");
    frag.appendChild(img);
    last = m.index + m[0].length; changed = true;
  }
  if (!changed) return;
  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
  node.replaceWith(frag);
}
function scan(root) {
  if (root.nodeType === 3) return swap(root);
  if (root.nodeType !== 1) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  for (let n; (n = w.nextNode()); ) if (n.nodeValue.length > 3 || /[\u{1F1E6}-\u{1F1FF}]/u.test(n.nodeValue)) hits.push(n);
  hits.forEach(swap);
}
export function initFlags() {
  if (initFlags.on || typeof MutationObserver === "undefined") return;
  initFlags.on = true;
  scan(document.body);
  new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === "characterData") swap(m.target);
      else m.addedNodes.forEach(scan);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
}
