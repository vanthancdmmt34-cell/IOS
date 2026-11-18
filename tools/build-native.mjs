// Tạo thư mục www/ để đóng gói vào app iOS/Android (Capacitor webDir).
//   node tools/build-native.mjs
//   CAP_SERVER_URL=https://study.liferivo.com node tools/build-native.mjs
// Giao diện lấy từ public/ và được đóng gói sẵn. Các lệnh gọi /api/ đi tới CAP_SERVER_URL
// nhờ tools/native/native-bridge.js (gửi token Bearer). Thư mục www/ không được commit.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public");
const OUT = path.join(ROOT, "www");
const BRIDGE = path.join(ROOT, "tools", "native", "native-bridge.js");

const apiBase = (process.env.CAP_SERVER_URL || "https://study.liferivo.com").replace(/\/+$/, "");
if (!/^https:\/\//.test(apiBase)) {
  throw new Error("CAP_SERVER_URL phải bắt đầu bằng https:// (ví dụ https://study.liferivo.com)");
}
const serverSrc = fs.readFileSync(path.join(ROOT, "server.js"), "utf8");
const VERSION = (serverSrc.match(/const VERSION = "([^"]+)"/) || [])[1] || "0";

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(SRC, OUT, {
  recursive: true,
  filter: (src) => !/\.bak/.test(path.basename(src)),
});
fs.mkdirSync(path.join(OUT, "js"), { recursive: true });
fs.copyFileSync(BRIDGE, path.join(OUT, "js", "native-bridge.js"));

// Thay các chỗ máy chủ tự điền khi phục vụ index.html (xem server.js, phần index.html).
let html = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
const critPath = path.join(OUT, "css", "critical.min.css");
const critLink = '<link rel="stylesheet" href="/css/critical.min.css?v=__VERSION__">';
if (fs.existsSync(critPath) && html.includes(critLink)) {
  html = html.replace(critLink, `<style>${fs.readFileSync(critPath, "utf8")}</style>`);
}
html = html
  .replaceAll("__VERSION__", VERSION)
  .replaceAll("__CANONICAL__", apiBase + "/")
  .replaceAll("__SITE_NAME__", "LifeRivo")
  .replaceAll("__SITE_DESC__", "Học ngoại ngữ bằng tiếng Việt")
  .replaceAll("__SITE_TAGLINE__", "Life in Motion")
  .replaceAll("__GSV_META__", "")
  .replaceAll(' nonce="__CSP_NONCE__"', "");
const inject = `<script>window.LR_API_BASE=${JSON.stringify(apiBase)};</script>\n<script src="/js/native-bridge.js"></script>`;
html = html.replace("<head>", `<head>\n${inject}`);
fs.writeFileSync(path.join(OUT, "index.html"), html, "utf8");

const leftovers = [...html.matchAll(/__[A-Z_]+__/g)].map((m) => m[0]);
if (leftovers.length) console.warn("Còn placeholder chưa thay trong index.html:", [...new Set(leftovers)].join(", "));
console.log(`www/ sẵn sàng: phiên bản ${VERSION}, máy chủ API ${apiBase}`);
