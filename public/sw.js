// Service worker của LifeRivo.
// 1) Cache tài nguyên tĩnh (JS/CSS/ảnh/locales) để mở nhanh và có trang offline.
//    - Không cache HTML (trang được render theo phiên đăng nhập) và không cache /api/.
//    - Luôn thử mạng trước, chỉ dùng bản đã lưu khi mất mạng.
// 2) Nhận thông báo nhắc luyện nói hằng ngày và mở lại ứng dụng khi bấm vào.

const CACHE_NAME = "ll-sw-v3-chibi";
const SHELL_ASSETS = [
  "/offline.html",
  "/manifest.json",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(SHELL_ASSETS.map((url) => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("ll-sw-") && k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isStaticPath(pathname) {
  return /^\/(js|css|locales|icons)\//.test(pathname) || /\.(png|svg|ico|woff2|json|webmanifest|js|css)$/.test(pathname);
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") cache.put(request, response.clone()).catch(() => {});
    return response;
  } catch (e) {
    const hit = await cache.match(request);
    return hit || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    // Trang HTML luôn lấy từ mạng; mất mạng thì hiện trang offline.
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline.html").then((r) => r || Response.error()))
    );
    return;
  }

  if (isStaticPath(url.pathname)) event.respondWith(networkFirst(request));
});

// ---------- Thông báo đẩy (giữ nguyên từ phiên bản trước) ----------

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = {}; }
  event.waitUntil(self.registration.showNotification(data.title || "Luyện nói", {
    body: data.body || "",
    icon: "/favicon.png",
    data: { url: data.url || "/" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) {
      if ("focus" in c) {
        // navigate có thể không được hỗ trợ hoặc bị từ chối; khi đó chỉ cần đưa cửa sổ lên trước.
        return Promise.resolve(c.navigate ? c.navigate(url).catch(() => null) : null).then(() => c.focus());
      }
    }
    return self.clients.openWindow(url);
  }));
});
