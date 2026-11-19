/* LifeRivo — System configuration in Admin panel: payment account, SePay, AI, website.
   Combines general settings (/api/admin/settings) and connection config (/api/admin/system) into one page with a single Save button.
   Secret keys are write-only: the browser never receives the value back, only "configured" and the last 4 characters. */
import {  } from "./core.js";
import { api, esc, lineIcon as icon, toast, promptBox, confirmBox, $ } from "./core.js";

const PANELS = [
  ["thanh-toan", "Thanh toán", { settings: ["commerce"], sys: ["pay"] }],
  ["ai", "Rivo", { sys: ["ai"], settings: ["ai"] }],
  ["website", "Website", { sys: ["site"] }],
  ["email", "Email", { sys: ["mail"] }],
];
const SRC = { admin: ["Đặt trong Quản trị", "tag-tim"], env: ["Từ biến môi trường máy chủ", "tag-line"], default: ["Mặc định", "tag-line"] };

export async function systemPage(body, ctx) {
  if (body._sysAc) body._sysAc.abort();
  const sysAc = new AbortController();
  body._sysAc = sysAc;
  ctx?.onLeave?.(() => sysAc.abort());
  body.innerHTML = `<div class="skel" style="height:300px"></div>`;
  let st, sy;
  try { [st, sy] = await Promise.all([api("/api/admin/settings"), api("/api/admin/system")]); }
  catch (e) { body.innerHTML = `<div class="sheet empty"><b>Không tải được cấu hình</b>${esc(e.message)}</div>`; return; }
  let panel = sessionStorage.getItem("pl-sys-panel") || "thanh-toan";
  if (!PANELS.some((p) => p[0] === panel)) panel = "thanh-toan";
  const sCur = JSON.parse(JSON.stringify(st.values)), sSaved = JSON.parse(JSON.stringify(st.values));
  const yCur = Object.fromEntries(sy.fields.filter((f) => f.type !== "secret").map((f) => [f.key, f.value])), ySaved = { ...yCur };
  const secrets = {}; // KEY -> "new value" | null (delete)

  const settingRow = (f) => {
    const v = sCur[f.key], id = `cf-${f.key}`;
    let ctl;
    if (f.type === "bool") ctl = `<label class="switch"><input type="checkbox" id="${id}" data-s="${f.key}" ${v ? "checked" : ""}><i></i><span>${v ? "Đang bật" : "Đang tắt"}</span></label>`;
    else if (f.type === "number") ctl = `<input class="input" type="number" id="${id}" data-s="${f.key}" min="${f.min}" max="${f.max}" value="${esc(v)}" style="max-width:160px">`;
    else if (f.type === "select") ctl = `<select class="select" id="${id}" data-s="${f.key}">${f.options.map(([k, l]) => `<option value="${esc(k)}" ${k === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
    else if (f.type === "textarea") ctl = `<textarea class="input" id="${id}" data-s="${f.key}" rows="3" maxlength="${f.max || 400}">${esc(v)}</textarea>`;
    else ctl = `<input class="input" id="${id}" data-s="${f.key}" maxlength="${f.max || 400}" value="${esc(v)}">`;
    return `<div class="set-row" data-row="s:${f.key}"><label class="lbl" for="${id}"><b>${esc(f.label)}</b>${f.help ? `<span>${esc(f.help)}</span>` : ""}</label><div>${ctl}</div></div>`;
  };
  const sysRow = (f) => {
    const id = `cy-${f.key}`;
    const src = `<span class="tag ${SRC[f.source][1]}">${SRC[f.source][0]}</span>`;
    let ctl;
    if (f.type === "secret") {
      const pending = secrets[f.key];
      ctl = `<div class="secret-box">
        <div class="row" style="gap:8px">${f.isSet && pending !== null ? `<span class="tag tag-la">${icon("check", 'width="12" height="12"')} Đã đặt ${esc(f.hint)}</span>${src}` : `<span class="tag tag-cam">Chưa đặt</span>`}
          ${pending === null ? `<span class="tag tag-do">Sẽ xóa khi lưu</span>` : ""}</div>
        <div class="row" style="gap:8px;margin-top:6px;flex-wrap:nowrap"><input class="input" type="password" id="${id}" data-secret="${f.key}" autocomplete="new-password" spellcheck="false" placeholder="${f.isSet ? "Nhập khóa mới để thay" : "Dán khóa vào đây"}" value="${typeof pending === "string" ? esc(pending) : ""}">
          ${f.source === "admin" && pending !== null ? `<button class="btn btn-sm btn-ghost" data-clear="${f.key}" type="button">Xóa</button>` : ""}</div></div>`;
    } else if (f.type === "select") {
      ctl = `<select class="select" id="${id}" data-y="${f.key}"><option value="" ${yCur[f.key] === "" ? "selected" : ""}>Theo biến môi trường / mặc định</option>${f.options.map(([k, l]) => `<option value="${esc(k)}" ${k === yCur[f.key] ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
    } else {
      ctl = `<input class="input" id="${id}" data-y="${f.key}" ${f.type === "number" || f.type === "decimal" ? `type="number" step="${f.type === "decimal" ? "any" : "1"}" min="${f.min}" max="${f.max}" style="max-width:200px"` : ""} value="${esc(yCur[f.key])}" placeholder="${esc(f.source === "admin" ? f.def : f.effective)}">`;
    }
    const eff = f.type !== "secret" ? `<span class="small muted">Đang dùng: <b>${esc(f.effective === "" ? "(trống)" : labelOf(f, f.effective))}</b></span> ${src}` : "";
    return `<div class="set-row" data-row="y:${f.key}"><label class="lbl" for="${id}"><b>${esc(f.label)}</b>${f.help ? `<span>${esc(f.help)}</span>` : ""}</label><div>${ctl}${eff ? `<div class="row" style="gap:6px;margin-top:6px">${eff}</div>` : ""}</div></div>`;
  };
  function labelOf(f, v) { return f.options ? ((f.options.find((o) => o[0] === v) || [, v])[1]) : v; }

  const extras = {
    "thanh-toan": () => `<section class="sheet sheet-pad" style="margin-bottom:16px"><h2>Địa chỉ webhook cho SePay</h2>
      <p class="small muted">Chỉ dùng khi chọn "Tự động qua SePay". Khi tạo webhook ở SePay, dán địa chỉ này, chọn sự kiện tiền vào.</p>
      <div class="row" style="margin-top:8px;flex-wrap:nowrap"><code class="mono-box">${esc(sy.webhookUrl)}</code><button class="btn btn-sm" data-copy="${esc(sy.webhookUrl)}">${icon("copy")}Sao chép</button></div></section>`,
    ai: () => `<section class="sheet sheet-pad" style="margin-bottom:16px"><h2>Kiểm tra kết nối AI</h2>
      <p class="small muted">Gửi một câu hỏi rất ngắn tới Gemini bằng khóa và model đã lưu. Lưu thay đổi trước khi kiểm tra. Chi phí vài phần nghìn xu, có ghi vào báo cáo chi phí.</p>
      <div class="row" style="margin-top:8px"><button class="btn" id="testAi">${icon("bulb")}Kiểm tra kết nối</button><span class="small" id="testAiOut">${sy.ai.configured ? `Đã cấu hình · model ${esc(sy.ai.model)}` : `<span class="form-msg err">Chưa có khóa API</span>`}</span></div></section>`,
    website: () => `<section class="sheet sheet-pad" style="margin-bottom:16px"><h2>Webhook thông báo (Zalo / email / n8n)</h2>
      <p class="small muted">Đặt biến môi trường trên máy chủ: <code>NOTIFY_WEBHOOK_URL</code> (bắt buộc) và tùy chọn <code>NOTIFY_WEBHOOK_SECRET</code>. Mỗi thông báo (nộp bài, chấm điểm, quên mật khẩu…) sẽ POST JSON tới URL đó.</p>
      <pre class="code-view" style="font-size:12px;white-space:pre-wrap">{
  "event": "notification",
  "kind": "assignment_submit",
  "userId": 12,
  "username": "hocsinh1",
  "title": "…",
  "body": "…",
  "link": "/app/giao-vien/lop/1",
  "payload": {}
}</pre>
      <div class="row" style="margin-top:10px"><button class="btn" id="testWebhook" type="button">${icon("send")}Gửi bản tin thử</button><span class="small" id="testWebhookOut"></span></div>
      <p class="small muted" style="margin-top:8px">Header: <code>X-Notify-Secret</code> nếu đã đặt secret. Dùng Make.com / n8n để chuyển sang Zalo OA hoặc email.</p></section>
    <section class="sheet sheet-pad" style="margin-bottom:16px"><h2>Những gì không chỉnh ở đây</h2>
      <p class="small muted">Cổng (PORT), địa chỉ nghe (HOST) và thư mục dữ liệu (DATA_DIR) cần có trước khi hệ thống khởi động nên vẫn đặt trong cấu hình PM2. Địa chỉ máy chủ Gemini cũng không cho đổi từ web để khóa AI không thể bị gửi tới máy chủ lạ.</p></section>`,
  };

  const render = () => {
    const P = PANELS.find((p) => p[0] === panel)[2];
    const sGroups = st.groups.filter(([g]) => (P.settings || []).includes(g));
    const yGroups = sy.groups.filter(([g]) => (P.sys || []).includes(g));
    const blocks = [];
    for (const [g, t, help] of sGroups) blocks.push(`<section class="sheet sheet-pad set-group" style="margin-bottom:16px"><h2>${esc(t)}</h2><p class="small muted" style="margin-top:4px">${esc(help)}</p>${st.schema.filter((f) => f.group === g).map(settingRow).join("")}</section>`);
    for (const [g, t, help] of yGroups) blocks.push(`<section class="sheet sheet-pad set-group" style="margin-bottom:16px"><h2>${esc(t)}</h2><p class="small muted" style="margin-top:4px">${esc(help)}</p>${sy.fields.filter((f) => f.group === g).map(sysRow).join("")}</section>`);
    if (panel === "ai") blocks.reverse(); // connection settings first, quotas second
    body.innerHTML = `
      <p class="small muted" style="margin-bottom:10px">Mọi cấu hình của hệ thống đều chỉnh ở đây và có hiệu lực ngay, không cần khởi động lại. Giá trị đặt trong Quản trị được ưu tiên hơn biến môi trường trên máy chủ; để trống một ô là quay về biến môi trường hoặc mặc định.</p>
      <div class="chips" style="margin-bottom:14px">${PANELS.map(([k, l]) => `<button class="chip ${k === panel ? "on" : ""}" data-panel="${k}">${l}</button>`).join("")}</div>
      ${blocks.join("")}${extras[panel] ? extras[panel]() : ""}
      <div class="save-bar"><span id="cfChg" class="small muted"></span><span style="flex:1"></span><button class="btn" id="cfUndo">Hoàn tác</button><button class="btn btn-primary" id="cfSave">${icon("check")}Lưu cấu hình</button></div>`;
    paint();
  };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const changes = () => {
    const s = st.schema.filter((f) => !same(sCur[f.key], sSaved[f.key])).map((f) => f.label);
    const y = Object.keys(yCur).filter((k) => yCur[k] !== ySaved[k]).map((k) => sy.fields.find((f) => f.key === k).label);
    const z = Object.keys(secrets).map((k) => sy.fields.find((f) => f.key === k).label);
    return [...s, ...y, ...z];
  };
  function paint() {
    const ch = changes();
    const el = $("#cfChg", body); if (!el) return;
    el.textContent = ch.length ? `${ch.length} thay đổi chưa lưu: ${ch.slice(0, 3).join(", ")}${ch.length > 3 ? "…" : ""}` : "Chưa có thay đổi.";
    $("#cfSave", body).disabled = !ch.length; $("#cfUndo", body).disabled = !ch.length;
  }

  body.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.s) { const f = st.schema.find((x) => x.key === t.dataset.s); sCur[f.key] = f.type === "bool" ? t.checked : f.type === "number" ? Number(t.value) : t.value; if (f.type === "bool") t.parentElement.querySelector("span").textContent = t.checked ? "Đang bật" : "Đang tắt"; }
    if (t.dataset.y) yCur[t.dataset.y] = t.value.trim();
    if (t.dataset.secret) { if (t.value.trim()) secrets[t.dataset.secret] = t.value.trim(); else delete secrets[t.dataset.secret]; }
    paint();
  }, { signal: sysAc.signal });
  body.addEventListener("click", async (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.panel) { panel = b.dataset.panel; try { sessionStorage.setItem("pl-sys-panel", panel); } catch {} render(); return; }
    if (b.dataset.copy) { navigator.clipboard?.writeText(b.dataset.copy).then(() => toast("Đã sao chép.", "ok")).catch(() => {}); return; }
    if (b.dataset.clear) { secrets[b.dataset.clear] = null; render(); return; }
    if (b.id === "cfUndo") { systemPage(body, ctx); return; }
    if (b.id === "cfSave") return save(b);
    if (b.id === "testAi") {
      if (changes().length) return toast("Hãy lưu cấu hình trước khi kiểm tra.", "info");
      b.disabled = true; $("#testAiOut", body).innerHTML = `<span class="spin"></span> Đang gọi Gemini…`;
      try {
        const r = await api("/api/admin/system/test-ai", "POST", {});
        $("#testAiOut", body).innerHTML = r.ok ? `<span class="tag tag-la">${icon("check", 'width="12" height="12"')} Kết nối được</span> ${esc(r.model)} · ${r.ms} ms · “${esc(r.text)}”` : `<span class="form-msg err">Lỗi: ${esc(r.error)}</span>${r.hint ? `<br><b>Cách xử lý:</b> ${esc(r.hint)}` : ""}`;
      } catch (err) { $("#testAiOut", body).innerHTML = `<span class="form-msg err">${esc(err.message)}</span>`; }
      b.disabled = false;
    }
    if (b.id === "testWebhook") {
      e.preventDefault();
      b.disabled = true;
      const o = $("#testWebhookOut", body);
      if (o) o.innerHTML = `<span class="spin"></span> Đang gửi…`;
      try {
        const r = await api("/api/admin/notify-test", "POST", {});
        const w = r.webhook || {}, res = r.result || {};
        if (!w.enabled) {
          if (o) o.innerHTML = `<span class="tag tag-cam">Chưa cấu hình NOTIFY_WEBHOOK_URL</span> — thông báo nội bộ vẫn đã tạo.`;
        } else if (res.ok) {
          if (o) o.innerHTML = `<span class="tag tag-la">Webhook OK</span> HTTP ${res.status || 200}`;
        } else {
          if (o) o.innerHTML = `<span class="form-msg err">Webhook lỗi: ${esc(res.error || res.body || ("HTTP " + res.status))}</span>`;
        }
      } catch (err) {
        if (o) o.innerHTML = `<span class="form-msg err">${esc(err.message)}</span>`;
      }
      b.disabled = false;
    }
  }, { signal: sysAc.signal });

  async function save(btn) {
    btn.disabled = true;
    try {
      const values = Object.fromEntries(Object.keys(yCur).filter((k) => yCur[k] !== ySaved[k]).map((k) => [k, yCur[k]]));
      let password;
      if (Object.keys(secrets).length) {
        password = await promptBox("Xác nhận mật khẩu", "Thay đổi khóa bí mật cần nhập lại mật khẩu tài khoản quản trị của bạn.", { label: "Mật khẩu", type: "password", okLabel: "Xác nhận", validate: (v) => (v ? "" : "Nhập mật khẩu") });
        if (!password) { btn.disabled = false; return; }
      }
      if (st.schema.some((f) => !same(sCur[f.key], sSaved[f.key]))) await api("/api/admin/settings", "PUT", { values: sCur });
      let warning = "";
      if (Object.keys(values).length || Object.keys(secrets).length) {
        const r = await api("/api/admin/system", "PUT", { values, secrets, password });
        warning = r.warning;
      }
      toast("Đã lưu cấu hình. Có hiệu lực ngay.", "ok");
      if (warning) toast(warning, "err", 8000);
      window.dispatchEvent(new Event("pl:config-changed"));
      systemPage(body, ctx);
    } catch (e) { toast(e.message, "err", 6000); btn.disabled = false; }
  }
  render();
}
