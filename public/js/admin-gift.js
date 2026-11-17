/* LifeRivo — Admin: tạo mã quà tặng Pro ngẫu nhiên (mỗi mã dùng một lần) và xem mã đã dùng. */
import { api, esc, fmtN, fmtDate, toast, $ } from "./core.js";

export async function giftCodesAdminPage(body) {
  body.innerHTML = `<div class="skel" style="height:240px"></div>`;
  let j;
  try { j = await api("/api/admin/gift-codes"); }
  catch (e) { body.innerHTML = `<div class="sheet empty"><b>Không tải được mã quà tặng</b><p>${esc(e.message)}</p></div>`; return; }
  const rows = j.items || [];
  body.innerHTML = `
    <div class="page-head"><div><h1>Mã quà tặng Pro</h1><p>Tạo mã ngẫu nhiên, mỗi mã dùng được một lần. Học viên nhập mã trong trang Hồ sơ.</p></div></div>
    <div class="two-col" style="margin-top:16px">
      <section class="sheet sheet-pad">
        <h2>Tạo mã mới</h2>
        <form class="auth-form" id="gcForm" novalidate>
          <label class="field">Số mã cần tạo<input name="count" type="number" min="1" max="200" value="10" required></label>
          <label class="field">Số ngày Pro mỗi mã<input name="days" type="number" min="1" max="365" value="30" required></label>
          <label class="field">Ghi chú (không bắt buộc)<input name="note" maxlength="120" placeholder="Ví dụ: Lớp tháng 11"></label>
          <p class="form-msg" id="gcMsg" role="status"></p>
          <button class="btn btn-primary">Tạo mã</button>
        </form>
        <div id="gcNew" hidden style="margin-top:14px"></div>
      </section>
      <section class="sheet sheet-pad">
        <h2>Mã chưa dùng</h2>
        <p class="small muted">${fmtN(rows.length)} mã còn trong kho. Mã được xóa khỏi kho ngay khi học viên dùng; mỗi tài khoản chỉ dùng một mã.</p>
        ${rows.length ? `<div class="tbl-wrap" style="overflow-x:auto"><table class="tbl"><thead><tr><th>Mã</th><th>Ngày Pro</th><th>Ghi chú</th><th>Tạo lúc</th></tr></thead><tbody>
          ${rows.map((r) => `<tr><td><code>${esc(r.code)}</code></td><td>${fmtN(r.days)}</td><td class="small">${esc(r.note || "")}</td><td class="small">${esc(fmtDate(r.created_at))}</td></tr>`).join("")}
        </tbody></table></div>` : `<p class="muted">Kho mã đang trống.</p>`}
      </section>
    </div>`;

  $("#gcForm", body).addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, msg = $("#gcMsg", body), btn = f.querySelector("button");
    btn.disabled = true; msg.textContent = ""; msg.className = "form-msg";
    try {
      const r = await api("/api/admin/gift-codes", "POST", { count: Number(f.count.value), days: Number(f.days.value), note: f.note.value.trim() });
      toast(`Đã tạo ${r.codes.length} mã.`, "ok");
      const box = $("#gcNew", body);
      box.hidden = false;
      box.innerHTML = `<p class="small muted">Sao chép và gửi cho học viên. Mã chỉ hiện đầy đủ ở đây và trong danh sách.</p>
        <textarea class="input mono" rows="${Math.min(12, r.codes.length + 1)}" readonly id="gcList">${esc(r.codes.join("\n"))}</textarea>
        <div class="row" style="margin-top:8px"><button class="btn" id="gcCopy" type="button">Sao chép tất cả</button></div>`;
      $("#gcCopy", body).addEventListener("click", () => {
        navigator.clipboard?.writeText(r.codes.join("\n")).then(() => toast("Đã sao chép.", "ok"), () => toast("Không sao chép được. Hãy chọn và sao chép thủ công.", "err"));
      });
      giftCodesAdminPage(body);
    } catch (err) {
      msg.textContent = err.message; msg.className = "form-msg err";
      btn.disabled = false;
    }
  });
}
