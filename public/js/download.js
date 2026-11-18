/* LifeRivo Study — Modern Cross-Platform Download Center (Mobile & PC)
   Supports both public route (/tai-ung-dung, /download) and in-app route (/app/tai-ung-dung).
   Clean geometric visual language (no chibi), bilingual VI/EN, Light + Dark mode aware. */
import { S, api, esc, lineIcon, cfg, siteName, toast, brandCleanHtml } from "./core.js";
import { currentLang, langSwitchHtml, bindLangSwitch } from "./i18n.js";

function detectPlatform() {
  const ua = typeof navigator !== "undefined" ? (navigator.userAgent || "") : "";
  const plat = typeof navigator !== "undefined" ? ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "") : "";
  const touchMac = /Macintosh/i.test(ua) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1;
  let os = "windows";
  if (/Android/i.test(ua)) os = "android";
  else if (/iPhone|iPad|iPod/i.test(ua) || touchMac) os = "ios";
  else if (/Mac|Darwin/i.test(plat) || /Macintosh|Mac OS/i.test(ua)) os = "macos";
  else if (/Linux/i.test(plat) || /Linux/i.test(ua)) os = "linux";

  const isMobile = os === "android" || os === "ios";
  const installed = !!(typeof window !== "undefined" && (window.__plInstalled || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone));
  return { os, isMobile, installed };
}

const OS_SVG = {
  windows: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M3 5.5 10.5 4.4v7.1H3zm8.5-1.3L21 2.8v8.7h-9.5zM3 12.5h7.5v7.1L3 18.5zm8.5 0H21v8.7l-9.5-1.4z"/></svg>`,
  macos: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2.1-1.5 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.6 2 1-.1 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.2-.8-2.2-3.1zM14.3 6.3c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z"/></svg>`,
  android: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 10a6 6 0 0 1 12 0v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M8.5 5 7 2.8M15.5 5 17 2.8M3 11v4M21 11v4M9.5 18v3M14.5 18v3"/><circle cx="9.8" cy="8.2" r=".7" fill="currentColor"/><circle cx="14.2" cy="8.2" r=".7" fill="currentColor"/></svg>`,
  ios: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10.5 5h3M12 18.5h.01"/></svg>`,
};

function buildDownloadHtml({ inApp, osInfo, filter, openGuideId }) {
  const en = currentLang() === "en";
  const T = (vi, enTxt) => (en ? enTxt : vi);
  const apkUrl = cfg("apkUrl", "");
  const osNames = {
    windows: "Windows PC",
    macos: "macOS",
    linux: "Desktop (Linux)",
    android: "Android",
    ios: "iPhone / iPad",
  };
  const currentOsLabel = osNames[osInfo.os] || "Web App";

  const cards = [
    {
      id: "windows",
      group: "pc",
      icon: OS_SVG.windows,
      name: "Windows",
      sub: T("Windows 10 & 11 · Ứng dụng Desktop", "Windows 10 & 11 · Desktop App"),
      badge: osInfo.os === "windows" ? T("Phù hợp máy này", "Recommended") : "PC",
      tone: "is-blue",
      bullets: [
        T("Chạy cửa sổ độc lập, ghim vào Taskbar & Start Menu", "Runs in its own window, pins to Taskbar & Start"),
        T("Luyện nói AI & TOEIC toàn màn hình mượt mà", "Smooth full-window AI speaking & TOEIC studio"),
        T("Tự cập nhật ngầm, dung lượng siêu nhẹ (< 5 MB)", "Silent updates, ultra-lightweight footprint (< 5 MB)"),
      ],
      ctaLabel: osInfo.installed && osInfo.os === "windows"
        ? T("Đã cài đặt trên máy", "Already installed")
        : T("Cài cho Windows", "Install for Windows"),
      steps: [
        T("Mở trang bằng Google Chrome hoặc Microsoft Edge.", "Open this page in Google Chrome or Microsoft Edge."),
        T("Nhấn nút Cài đặt ở thanh địa chỉ (biểu tượng màn hình có dấu + / mũi tên) hoặc bấm nút phía trên.", "Click the Install icon in the address bar or tap the button above."),
        T("Xác nhận \"Cài đặt\" để mở cửa sổ riêng & ghim vào Taskbar.", "Confirm \"Install\" to launch in a standalone window & pin to Taskbar."),
      ],
    },
    {
      id: "macos",
      group: "pc",
      icon: OS_SVG.macos,
      name: "macOS",
      sub: T("Apple Silicon (M1–M4) & Intel", "Apple Silicon (M1–M4) & Intel"),
      badge: osInfo.os === "macos" ? T("Phù hợp máy này", "Recommended") : "Mac",
      tone: "is-slate",
      bullets: [
        T("Hỗ trợ Safari \"Add to Dock\" (macOS Sonoma+) & Chrome", "Supports Safari \"Add to Dock\" & Chrome App"),
        T("Chuyển nhanh bằng Spotlight / Cmd+Tab như app gốc", "Switch via Spotlight / Cmd+Tab like a native app"),
        T("Đồng bộ tức thì tiến độ học từ điện thoại sang Mac", "Instant progress sync from mobile to Mac"),
      ],
      ctaLabel: osInfo.installed && osInfo.os === "macos"
        ? T("Đã cài đặt trên Mac", "Installed on Mac")
        : T("Cài cho macOS", "Install for macOS"),
      steps: [
        T("Trên Safari (macOS Sonoma trở lên): vào menu Tệp (File) → Thêm vào Dock (Add to Dock).", "In Safari (macOS Sonoma+): choose File → Add to Dock."),
        T("Trên Chrome hoặc Edge: bấm biểu tượng Cài đặt bên phải thanh địa chỉ.", "In Chrome or Edge: click the Install icon in the address bar."),
        T("Mở trực tiếp từ Dock hoặc Launchpad bất cứ lúc nào.", "Launch directly from your Dock or Launchpad anytime."),
      ],
    },
    {
      id: "android",
      group: "mobile",
      icon: OS_SVG.android,
      name: "Android",
      sub: T("Android 8.0+ · Điện thoại & Tablet", "Android 8.0+ · Phone & Tablet"),
      badge: osInfo.os === "android" ? T("Phù hợp máy này", "Recommended") : "Mobile",
      tone: "is-green",
      bullets: [
        T("Mở nhanh 1 chạm từ màn hình chính, toàn màn hình", "One-tap Home Screen launch, full-screen experience"),
        T("Thu âm luyện nói tự ngắt câu mượt trên Chrome mobile", "Smooth auto-stopping speech capture on mobile Chrome"),
        T("Cache bài học & từ vựng giúp ôn nhanh khi mạng yếu", "Smart lesson & vocab cache for low-connectivity review"),
      ],
      ctaLabel: apkUrl
        ? T("Tải file Android (.APK)", "Download Android (.APK)")
        : (osInfo.installed && osInfo.os === "android"
          ? T("Đã cài trên thiết bị", "Already installed")
          : T("Cài đặt trên Android", "Install on Android")),
      href: apkUrl || "",
      steps: [
        T("Mở bằng trình duyệt Chrome trên điện thoại Android.", "Open in Google Chrome on your Android phone."),
        T("Bấm nút \"Cài đặt trên Android\" phía trên hoặc chọn Menu (⋮) → \"Cài đặt ứng dụng\".", "Tap \"Install on Android\" above or open Menu (⋮) → \"Install app\"."),
        T("Biểu tượng LifeRivo xuất hiện ngay trong khay ứng dụng như app gốc.", "LifeRivo icon appears right in your app drawer."),
      ],
    },
    {
      id: "ios",
      group: "mobile",
      icon: OS_SVG.ios,
      name: "iPhone & iPad",
      sub: T("iOS 15+ / iPadOS · Tối ưu cho Safari", "iOS 15+ / iPadOS · Optimized for Safari"),
      badge: osInfo.os === "ios" ? T("Phù hợp máy này", "Recommended") : "iOS",
      tone: "is-purple",
      bullets: [
        T("Giao diện kính mờ, điều hướng 1 tay chuẩn iPhone", "Glassmorphic UI tuned for effortless one-handed iPhone use"),
        T("Chạy độc lập không thanh địa chỉ trình duyệt khi ghim màn hình chính", "Runs distraction-free without browser bars from Home Screen"),
        T("Hỗ trợ giọng đọc AI tự nhiên & chấm phát âm từng từ", "Supports natural AI voice playback & word scoring"),
      ],
      ctaLabel: osInfo.installed && osInfo.os === "ios"
        ? T("Đã cài trên iPhone/iPad", "Installed on iOS")
        : T("Xem cách cài iOS", "View iOS install steps"),
      steps: [
        T("Mở trang này bằng trình duyệt Safari trên iPhone hoặc iPad.", "Open this page in Safari on your iPhone or iPad."),
        T("Chạm nút Chia sẻ (biểu tượng ô vuông có mũi tên hướng lên ở thanh dưới).", "Tap the Share button (square with upward arrow at the bottom bar)."),
        T("Cuộn xuống chọn \"Thêm vào Màn hình chính\" (Add to Home Screen) → \"Thêm\".", "Scroll down and tap \"Add to Home Screen\" → \"Add\"."),
      ],
    },
  ];

  const visibleCards = filter === "all" ? cards : cards.filter((c) => c.group === filter);

  return `
  <div class="dl-wrap">
    <section class="dl-hero">
      <div class="dl-hero-copy">
        <div class="dl-kicker">
          <span class="dl-dot-live" aria-hidden="true"></span>
          <span>${T(`Thiết bị hiện tại: ${currentOsLabel}`, `Current device: ${currentOsLabel}`)}</span>
        </div>
        <h1>${T("Tải LifeRivo Study cho mọi thiết bị", "Get LifeRivo Study on every device")}</h1>
        <p class="dl-lead">${T(
          "Học liền mạch trên Điện thoại và Máy tính — mở nhanh một chạm, luyện nói toàn màn hình và tự động đồng bộ tiến độ theo thời gian thực.",
          "Learn seamlessly across Mobile and PC — one-tap launch, full-screen speaking practice, and instant progress sync."
        )}</p>
        <div class="dl-hero-actions">
          <button type="button" class="btn btn-primary btn-lg dl-primary-cta" id="dlPrimaryBtn" data-dl-primary>
            ${lineIcon("download", 18)}
            <span>${osInfo.installed
              ? T("Đang chạy chế độ Ứng dụng", "Running in App mode")
              : T(`Tải cho ${currentOsLabel}`, `Get for ${currentOsLabel}`)}</span>
          </button>
          <a class="btn btn-lg dl-secondary-cta" href="${S.me ? "/app/" : "/app/dang-nhap"}">
            ${lineIcon("globe", 18)}
            <span>${S.me ? T("Vào trang học ngay", "Open learning app") : T("Dùng ngay trên Web", "Continue on Web")}</span>
          </a>
        </div>
        <div class="dl-hero-meta">
          <span>${lineIcon("shield-check", 15)} ${T("Miễn phí cài đặt · Không quảng cáo", "Free install · Ad-free")}</span>
          <span>${lineIcon("zap", 15)} ${T("Đồng bộ Mobile ↔ PC tức thì", "Instant Mobile ↔ PC sync")}</span>
        </div>
      </div>

      <div class="dl-hero-visual" aria-hidden="true">
        <div class="dl-device-pc">
          <div class="dl-pc-bar">
            <span class="dl-dots"><i></i><i></i><i></i></span>
            <span class="dl-pc-url">LifeRivo Study Desktop</span>
            <span class="dl-pc-pill">Sync ON</span>
          </div>
          <div class="dl-pc-body">
            <div class="dl-pc-side">
              <div class="dl-sk-brand"><span>LR</span><b>LifeRivo</b></div>
              <div class="dl-sk-nav on"><i></i><span>${T("Tổng quan", "Overview")}</span></div>
              <div class="dl-sk-nav"><i></i><span>${T("Lộ trình", "Roadmap")}</span></div>
              <div class="dl-sk-nav"><i></i><span>${T("Luyện nói", "Speaking")}</span></div>
              <div class="dl-sk-nav"><i></i><span>${T("Ôn tập SRS", "Review")}</span></div>
            </div>
            <div class="dl-pc-main">
              <div class="dl-pc-kpi-row">
                <div class="dl-pc-kpi"><span>${T("Chuỗi học", "Streak")}</span><b>14 ${T("ngày", "days")}</b></div>
                <div class="dl-pc-kpi is-accent"><span>${T("Phát âm AI", "AI Score")}</span><b>92%</b></div>
              </div>
              <div class="dl-pc-card">
                <b>${T("Hội thoại & Luyện nói từng từ", "Word-by-word Speaking Studio")}</b>
                <div class="dl-wave">
                  <i style="height:36%"></i><i style="height:68%"></i><i style="height:92%"></i><i style="height:54%"></i>
                  <i style="height:84%"></i><i style="height:100%"></i><i style="height:62%"></i><i style="height:40%"></i>
                  <i style="height:76%"></i><i style="height:48%"></i><i style="height:30%"></i>
                </div>
                <div class="dl-prog-line"><i></i></div>
              </div>
            </div>
          </div>
        </div>
        <div class="dl-device-mob">
          <div class="dl-mob-notch"></div>
          <div class="dl-mob-screen">
            <div class="dl-mob-head">
              <b>LifeRivo</b>
              <span>92%</span>
            </div>
            <div class="dl-mob-card">
              <small>${T("HÔM NAY", "TODAY")}</small>
              <b>CEFR A2 · Lesson 4</b>
              <div class="dl-prog-line"><i></i></div>
            </div>
            <div class="dl-mob-mic">${lineIcon("mic", 18)}</div>
            <div class="dl-mob-dock">
              <i></i><i></i><i class="on"></i><i></i><i></i>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="dl-platforms" id="dlPlatforms">
      <div class="dl-sec-head">
        <div>
          <h2>${T("Chọn nền tảng của bạn", "Choose your platform")}</h2>
          <p>${T("Cài đặt trực tiếp chỉ trong vài giây trên máy tính và điện thoại.", "Install directly in seconds on both desktop and mobile.")}</p>
        </div>
        <div class="dl-filter-tabs" role="tablist" aria-label="${T("Lọc nền tảng", "Filter platforms")}">
          <button type="button" role="tab" aria-selected="${filter === "all"}" class="${filter === "all" ? "on" : ""}" data-dl-filter="all">${T("Tất cả", "All")}</button>
          <button type="button" role="tab" aria-selected="${filter === "pc"}" class="${filter === "pc" ? "on" : ""}" data-dl-filter="pc">${lineIcon("monitor", 15)}<span>${T("Máy tính (PC)", "PC / Desktop")}</span></button>
          <button type="button" role="tab" aria-selected="${filter === "mobile"}" class="${filter === "mobile" ? "on" : ""}" data-dl-filter="mobile">${lineIcon("smartphone", 15)}<span>${T("Điện thoại", "Mobile")}</span></button>
        </div>
      </div>

      <div class="dl-grid">
        ${visibleCards.map((c) => {
          const isOpen = openGuideId === c.id;
          return `
          <article class="dl-card ${c.tone}${osInfo.os === c.id ? " is-detected" : ""}" id="dlCard-${c.id}">
            <div class="dl-card-top">
              <span class="dl-os-ic">${c.icon}</span>
              <span class="dl-card-badge">${esc(c.badge)}</span>
            </div>
            <h3>${esc(c.name)}</h3>
            <p class="dl-card-sub">${esc(c.sub)}</p>
            <ul class="dl-card-list">
              ${c.bullets.map((b) => `<li>${lineIcon("check", 14)}<span>${esc(b)}</span></li>`).join("")}
            </ul>
            <div class="dl-card-act">
              ${c.href
                ? `<a class="btn btn-primary btn-block" href="${esc(c.href)}" download>${lineIcon("download", 16)}<span>${esc(c.ctaLabel)}</span></a>`
                : `<button type="button" class="btn ${osInfo.os === c.id ? "btn-primary" : ""} btn-block" data-dl-card="${c.id}">${lineIcon("download", 16)}<span>${esc(c.ctaLabel)}</span></button>`}
              <button type="button" class="btn btn-ghost btn-sm dl-guide-btn" data-dl-guide="${c.id}" aria-expanded="${isOpen}">
                <span>${isOpen ? T("Ẩn hướng dẫn", "Hide guide") : T("Xem hướng dẫn cài", "Install steps")}</span>
              </button>
            </div>
            <div class="dl-steps" ${isOpen ? "" : "hidden"}>
              <ol>
                ${c.steps.map((s) => `<li>${esc(s)}</li>`).join("")}
              </ol>
            </div>
          </article>`;
        }).join("")}
      </div>
    </section>

    <section class="dl-qr-band">
      <div class="dl-qr-copy">
        <span class="dl-qr-pill">${lineIcon("smartphone", 15)}<span>${T("CHUYỂN NHANH SANG ĐIỆN THOẠI", "QUICK MOBILE TRANSFER")}</span></span>
        <h2>${T("Đang xem trên máy tính? Quét QR để cài ngay trên điện thoại", "On desktop? Scan QR to install on your phone")}</h2>
        <p>${T(
          "Mở camera trên iPhone hoặc Android và quét mã bên cạnh để mở đúng trang cài đặt chỉ với một chạm.",
          "Point your iPhone or Android camera at the QR code to open this download page directly on your phone."
        )}</p>
        <div class="dl-qr-actions">
          <button type="button" class="btn" id="dlCopyLinkBtn">${lineIcon("copy", 16)}<span>${T("Sao chép link tải", "Copy download link")}</span></button>
          <span class="dl-qr-url" id="dlShareUrl"></span>
        </div>
      </div>
      <div class="dl-qr-box">
        <div class="dl-qr-frame" id="dlQrFrame">
          <span class="spin" aria-label="${T("Đang tạo mã QR…", "Generating QR…")}"></span>
        </div>
        <small>${T("Quét bằng Camera iOS / Android", "Scan with iOS / Android Camera")}</small>
      </div>
    </section>

    <section class="dl-bento">
      <div class="dl-bento-item">
        <span class="dl-bento-ic">${lineIcon("zap", 20)}</span>
        <h3>${T("Nhẹ hơn 10 lần app truyền thống", "10× lighter than bulky apps")}</h3>
        <p>${T("Không tốn hàng trăm MB bộ nhớ, khởi động tức thì và tự động nhận các bài tập mới nhất.", "No heavy downloads — launches instantly and stays up to date automatically.")}</p>
      </div>
      <div class="dl-bento-item">
        <span class="dl-bento-ic">${lineIcon("globe", 20)}</span>
        <h3>${T("Đồng bộ mượt mọi thiết bị", "Seamless cross-device sync")}</h3>
        <p>${T("Sáng ôn từ vựng trên điện thoại, tối làm đề & luyện nói trên máy tính với cùng một tài khoản.", "Review flashcards on your phone in the morning and practice on PC at night with zero data loss.")}</p>
      </div>
      <div class="dl-bento-item">
        <span class="dl-bento-ic">${lineIcon("shield-check", 20)}</span>
        <h3>${T("An toàn & Riêng tư tuyệt đối", "Private & Secure")}</h3>
        <p>${T("Cài trực tiếp từ tên miền chính thức của LifeRivo, không qua kho ứng dụng bên thứ ba.", "Installed directly from LifeRivo's official origin with HTTPS encryption.")}</p>
      </div>
    </section>
  </div>`;
}

export function mountDownloadView(container, { inApp = true, onNavigateHome, onAuth } = {}) {
  const isEn = () => currentLang() === "en";
  const T = (vi, enTxt) => (isEn() ? enTxt : vi);
  const osInfo = detectPlatform();
  let filter = "all";
  let openGuideId = osInfo.os === "linux" ? "windows" : osInfo.os;

  const paint = () => {
    const en = isEn();
    const inner = buildDownloadHtml({ inApp, osInfo, filter, openGuideId });
    if (inApp) {
      container.innerHTML = inner;
    } else {
      container.innerHTML = `
      <div class="dl-public-shell">
        <header class="dl-pub-top">
          <div class="dl-pub-top-in">
            <a class="brand brand-clean dl-pub-brand" href="/" data-dl-home aria-label="${esc(siteName())}">${brandCleanHtml()}</a>
            <nav class="dl-pub-nav">
              <a href="/" data-dl-home>${T("Trang chủ", "Home")}</a>
              <a href="/${en ? "en" : "vi"}/pricing">${T("Bảng giá", "Pricing")}</a>
            </nav>
            <div class="dl-pub-auth">
              ${langSwitchHtml()}
              <button type="button" class="btn btn-sm" data-dl-auth="login">${T("Đăng nhập", "Sign in")}</button>
              <button type="button" class="btn btn-primary btn-sm" data-dl-auth="register">${T("Bắt đầu miễn phí", "Start free")}</button>
            </div>
          </div>
        </header>
        <main class="dl-pub-main">${inner}</main>
      </div>`;
      bindLangSwitch(container, () => paint());
    }
    loadQr();
  };

  let qrLoaded = null;
  async function loadQr() {
    const box = container.querySelector("#dlQrFrame");
    const urlEl = container.querySelector("#dlShareUrl");
    if (!box) return;
    if (qrLoaded) {
      box.innerHTML = `<img src="${esc(qrLoaded.qr)}" alt="QR Code" width="144" height="144">`;
      if (urlEl) urlEl.textContent = qrLoaded.url;
      return;
    }
    try {
      const r = await api("/api/public/qr?path=/tai-ung-dung");
      qrLoaded = r;
      if (container.querySelector("#dlQrFrame")) {
        container.querySelector("#dlQrFrame").innerHTML = `<img src="${esc(r.qr)}" alt="QR Code" width="144" height="144">`;
      }
      if (container.querySelector("#dlShareUrl")) {
        container.querySelector("#dlShareUrl").textContent = r.url;
      }
    } catch {
      if (urlEl) urlEl.textContent = `${location.origin}/tai-ung-dung`;
    }
  }

  async function triggerInstall(cardId) {
    const targetId = cardId === "linux" ? "windows" : cardId;
    if (window.__plInstalled) {
      toast(T("Bạn đang mở ở chế độ ứng dụng rồi!", "Already running in App mode!"), "ok");
      openGuideId = targetId;
      paint();
      return;
    }
    if (window.__plDeferredPrompt && targetId !== "ios") {
      try {
        window.__plDeferredPrompt.prompt();
        const choice = await window.__plDeferredPrompt.userChoice;
        if (choice && choice.outcome === "accepted") {
          window.__plDeferredPrompt = null;
          toast(T("Đang cài đặt ứng dụng…", "Installing app…"), "ok");
          return;
        }
      } catch {}
    }
    openGuideId = targetId;
    paint();
    const card = container.querySelector(`#dlCard-${targetId}`);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    toast(
      targetId === "ios"
        ? T("Trên iPhone/iPad: mở Safari → bấm Chia sẻ → Thêm vào Màn hình chính.", "On iPhone/iPad: open Safari → Share → Add to Home Screen.")
        : T("Xem hướng dẫn cài nhanh ngay trong thẻ bên dưới.", "Follow the quick install steps expanded below."),
      "info",
      4200
    );
  }

  const onClick = (e) => {
    const f = e.target.closest("[data-dl-filter]");
    if (f) {
      filter = f.dataset.dlFilter;
      paint();
      return;
    }
    const g = e.target.closest("[data-dl-guide]");
    if (g) {
      const id = g.dataset.dlGuide;
      openGuideId = openGuideId === id ? "" : id;
      paint();
      return;
    }
    const cardBtn = e.target.closest("[data-dl-card]");
    if (cardBtn) {
      triggerInstall(cardBtn.dataset.dlCard);
      return;
    }
    if (e.target.closest("[data-dl-primary]")) {
      triggerInstall(osInfo.os);
      return;
    }
    if (e.target.closest("#dlCopyLinkBtn")) {
      const link = (qrLoaded && qrLoaded.url) || `${location.origin}/tai-ung-dung`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => toast(T("Đã sao chép đường dẫn tải ứng dụng!", "Copied download link!"), "ok")).catch(() => toast(link, "info"));
      } else {
        toast(link, "info");
      }
      return;
    }
    const homeLink = e.target.closest("[data-dl-home]");
    if (homeLink && onNavigateHome) {
      e.preventDefault();
      onNavigateHome();
      return;
    }
    const authBtn = e.target.closest("[data-dl-auth]");
    if (authBtn && onAuth) {
      onAuth(authBtn.dataset.dlAuth);
    }
  };

  container.addEventListener("click", onClick);
  const onReady = () => {
    const btn = container.querySelector("#dlPrimaryBtn span");
    if (btn && !osInfo.installed) btn.textContent = T("Cài đặt ngay (1 chạm)", "Install now (1-tap)");
  };
  const onDone = () => { osInfo.installed = true; paint(); };
  window.addEventListener("pl:install-ready", onReady);
  window.addEventListener("pl:installed", onDone);

  paint();

  return () => {
    container.removeEventListener("click", onClick);
    window.removeEventListener("pl:install-ready", onReady);
    window.removeEventListener("pl:installed", onDone);
  };
}

export async function pageDownload(main, _params, _query, ctx) {
  const en = currentLang() === "en";
  ctx.setCrumbs([[en ? "Download App" : "Tải ứng dụng"]]);
  const dispose = mountDownloadView(main, { inApp: true });
  ctx.onLeave(dispose);
}
