/* LifeRivo — Admin: bản dịch giao diện tiếng Anh (ghi đè chuỗi giao diện, không sửa mã nguồn). */
import { api, esc, icon, fmtDate, toast, $ } from "./core.js";

// English UI string overrides
async function uiOverrides(sec) {
  let base = {}, over = [];
  try { [base, over] = await Promise.all([fetch("/locales/en.json").then((r) => r.json()).then((j) => j.exact || {}), api("/api/admin/i18n/ui").then((j) => j.items)]); } catch {}
  const om = new Map(over.map((o) => [o.source, o.text]));
  sec.innerHTML = `<div class="sec-head"><div><h2>Chuỗi giao diện tiếng Anh</h2><p>Sửa cách dịch một chuỗi giao diện mà không cần sửa mã. Bản sửa có hiệu lực ngay cho người dùng mới tải trang. Xóa trắng ô để quay về bản dịch mặc định.</p></div></div>
    <label class="field">Tìm chuỗi (tiếng Việt hoặc tiếng Anh)<input id="q" placeholder="Ví dụ: Bảng giá"></label>
    <div class="table-wrap" style="border:0" data-i18n="off"><table><thead><tr><th style="width:38%">Tiếng Việt</th><th>Tiếng Anh</th><th></th></tr></thead><tbody id="ui"></tbody></table></div>
    <p class="small muted">${Object.keys(base).length} chuỗi mặc định · ${over.length} chuỗi đã ghi đè</p>`;
  const draw = () => {
    const q = $("#q", sec).value.trim().toLowerCase();
    const keys = Object.keys(base).filter((k) => !q ? om.has(k) : k.toLowerCase().includes(q) || String(base[k]).toLowerCase().includes(q) || String(om.get(k) || "").toLowerCase().includes(q)).slice(0, 40);
    $("#ui", sec).innerHTML = keys.map((k) => `<tr><td class="small">${esc(k)}</td><td><input data-src="${esc(k)}" value="${esc(om.get(k) ?? base[k])}"></td><td><button class="btn btn-xs" data-save="${esc(k)}">Lưu</button></td></tr>`).join("") || `<tr><td colspan="3" class="muted">${q ? "Không có chuỗi khớp." : "Chưa ghi đè chuỗi nào. Gõ để tìm."}</td></tr>`;
    sec.querySelectorAll("[data-save]").forEach((b) => b.addEventListener("click", async () => {
      const src = b.dataset.save; const inp = [...sec.querySelectorAll("[data-src]")].find((x) => x.dataset.src === src);
      const text = inp.value.trim() === String(base[src]).trim() ? "" : inp.value;
      try { await api("/api/admin/i18n/ui", "PUT", { source: src, text }); if (text) om.set(src, text); else om.delete(src); toast(text ? "Đã lưu bản dịch." : "Đã quay về bản dịch mặc định.", "ok"); } catch (e) { toast(e.message, "err"); }
    }));
  };
  let tmr; $("#q", sec).addEventListener("input", () => { clearTimeout(tmr); tmr = setTimeout(draw, 200); });
  draw();
}

// Trang "Bản dịch giao diện": chỉ còn phần ghi đè chuỗi giao diện tiếng Anh (bài học đã gỡ)
export async function i18nAdminPage(body) {
  body.innerHTML = `<section class="sheet sheet-pad" id="uiSec"><div class="skel" style="height:200px"></div></section>`;
  await uiOverrides(body.querySelector("#uiSec"));
}
