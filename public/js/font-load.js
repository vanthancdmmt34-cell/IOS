// Chuyển font Google + CSS khong chan từ media="print" sang "all" sau khi tải xong, để không chặn hiển thị trang.
// Nếu script không chạy, trình duyệt vẫn dùng font hệ thống và thẻ <noscript> đã nạp font/CSS.
// (Khong dung onload="..." inline vi CSP script-src 'self' chan inline event handler.)
document.querySelectorAll("link[data-gfont], link[data-async-css]").forEach((l) => { l.media = "all"; });
