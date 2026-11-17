/* Phỏng vấn thử & Phỏng vấn AI cho 5 ngoại ngữ.
   Đồng bộ cả 2 chế độ ngay trên trang Phỏng vấn: 30 ngành phỏng vấn với AI 2 chiều + 2 vòng phỏng vấn thử theo câu mẫu. */
import {  } from "./core.js";
import { S, api, esc, icon, toast, aiOn } from "./core.js";
import { INTERVIEW_LANGS, INTERVIEW_TRACKS, interviewLang, interviewTrack } from "./interview-bank.js";
import { speakIcon } from "./speak.js";
import { currentLang } from "./i18n.js";

const keyOf = (lang, track) => `pl:iv:${S.me.username}:${lang}:${track}`;
const savedStep = (lang, track) => {
  const n = Number(localStorage.getItem(keyOf(lang, track)) || 0);
  return Number.isFinite(n) ? n : 0;
};
const saveStep = (lang, track, n) => { try { localStorage.setItem(keyOf(lang, track), String(n)); } catch {} };

function head(title, sub, back, cls = "") {
  return `<div class="page-head ${cls}"><div><span class="edu-eyebrow">PHỎNG VẤN THỬ</span><h1>${title}</h1><p>${sub}</p></div>${back ? `<a class="btn" href="${back}">${icon("left")}Quay lại</a>` : ""}</div>`;
}

export async function pageInterview(main, [langId, trackId], _q, ctx) {
  const lang = langId ? interviewLang(langId) : null;
  if (langId && !lang) {
    main.innerHTML = `<div class="sheet sheet-pad empty"><b>Không có môn này</b><a class="btn" href="/app/phong-van">Về danh sách</a></div>`;
    return;
  }
  if (!lang) return renderHub(main, ctx);
  const track = trackId ? interviewTrack(lang.id, trackId) : null;
  if (trackId && !track) {
    main.innerHTML = `<div class="sheet sheet-pad empty"><b>Không có vòng phỏng vấn này</b><a class="btn" href="/app/phong-van/${lang.id}">Về ${esc(lang.name)}</a></div>`;
    return;
  }
  if (!track) return renderTracks(main, lang, ctx);
  return renderSession(main, lang, track, ctx);
}

function renderHub(main, ctx) {
  ctx.setCrumbs([["Học viên", "/app/"], ["Luyện phỏng vấn"]]);
  const card = (l) => `<a class="lx-card" href="/app/phong-van/${l.id}" style="--c:${esc(l.color)}"><span class="lx-card-ico">${l.flag}</span><b>${esc(l.name)}</b><span class="lx-card-sub">30 ngành phỏng vấn AI · ${(INTERVIEW_TRACKS[l.id] || []).length} vòng câu mẫu (${(INTERVIEW_TRACKS[l.id] || []).reduce((n, t) => n + t.questions.length, 0)} câu)</span></a>`;
  const spoken = INTERVIEW_LANGS.filter((l) => l.group === "lang");
  const firstTracks = INTERVIEW_TRACKS[spoken[0]?.id] || [];
  const totalQ = firstTracks.reduce((n, t) => n + t.questions.length, 0);
  main.innerHTML = `${head("Phỏng vấn & Phỏng vấn AI", "Chọn ngoại ngữ để luyện phỏng vấn 2 chiều với AI theo 30 ngành nghề hoặc tự luyện theo bộ câu mẫu.", "", "iv-hub-head")}
    <div class="iv-m-intro">
      <h1>Phỏng vấn thử cùng AI</h1>
      <p>Luyện trả lời các câu hỏi thường gặp theo ngành nghề.</p>
    </div>
    <div class="sheet sheet-pad iv-m-card">
      <h2>Phỏng vấn thử cùng AI</h2>
      <p>Chọn vị trí và ngành nghề để luyện câu trả lời chuẩn chuyên nghiệp.</p>
      <label class="iv-m-field">
        <span>Chọn lĩnh vực</span>
        <select id="ivFieldSelect">
          <option value="iv-it">Công nghệ thông tin</option>
          <option value="iv-mkt">Tiếp thị & Truyền thông</option>
          <option value="iv-fin">Tài chính & Ngân hàng</option>
          <option value="iv-biz">Kinh doanh & Bán hàng</option>
          <option value="iv-hr">Nhân sự & Hành chính</option>
          <option value="sample">Phỏng vấn tổng quát (Câu mẫu)</option>
        </select>
      </label>
      <label class="iv-m-field">
        <span>Vị trí ứng tuyển</span>
        <input type="text" id="ivRoleInput" value="Junior Developer" placeholder="VD: Junior Developer, Chuyên viên..." />
      </label>
      <label class="iv-m-field">
        <span>Trình độ ngoại ngữ</span>
        <select id="ivLangSelect">
          ${spoken.map((l) => `<option value="${esc(l.id)}">${esc(l.name)} — Trung cấp</option>`).join("")}
        </select>
      </label>
      <button type="button" class="btn btn-primary btn-block iv-m-start" id="ivQuickStart">Bắt đầu phỏng vấn</button>
    </div>
    <div class="iv-m-kpis">
      <div class="iv-m-kpi"><b>6</b><span>Câu hỏi dự kiến</span></div>
      <div class="iv-m-kpi"><b>10 phút</b><span>Thời lượng</span></div>
    </div>
    <section class="lx-sec"><div class="sec-head"><div><h2>Ngoại ngữ</h2><p>Cả 6 ngoại ngữ đều có đầy đủ 30 ngành phỏng vấn với AI và ${firstTracks.length} vòng câu hỏi mẫu (${totalQ} câu).</p></div></div><div class="lx-grid">${spoken.map(card).join("")}</div></section>`;
  main.querySelector("#ivQuickStart")?.addEventListener("click", () => {
    const langVal = main.querySelector("#ivLangSelect")?.value || "en";
    const fieldVal = main.querySelector("#ivFieldSelect")?.value || "sample";
    const tracks = INTERVIEW_TRACKS[langVal] || [];
    if (fieldVal === "sample" || !aiOn()) {
      const tr = tracks[0] ? tracks[0].id : "";
      location.href = tr ? `/app/phong-van/${langVal}/${tr}` : `/app/phong-van/${langVal}`;
    } else {
      location.href = `/app/phong-van/${langVal}`;
    }
  });
}

async function renderTracks(main, lang, ctx) {
  ctx.setCrumbs([["Phỏng vấn", "/app/phong-van"], [lang.name]]);
  const tracks = INTERVIEW_TRACKS[lang.id] || [];
  const totalQ = tracks.reduce((n, t) => n + t.questions.length, 0);
  main.innerHTML = `${head(`${lang.flag} ${esc(lang.name)}`, "Đồng bộ đầy đủ 2 chế độ: Phỏng vấn 2 chiều với AI (30 ngành) và Phỏng vấn tự luyện có câu mẫu.", "/app/phong-van")}
    <section class="lx-sec" style="--c:${esc(lang.color)};--c-soft:color-mix(in srgb,var(--c) 10%,var(--paper-2))">
      <div class="sec-head"><div><h2>Phỏng vấn với AI theo lĩnh vực</h2><p>AI đóng vai nhà tuyển dụng của đúng ngành: hỏi từng câu, sửa lỗi câu trả lời và nhận xét tổng kết sau khoảng 6 câu.</p></div><a class="btn btn-sm" href="${lang.course}">Mở trong Phòng luyện nói →</a></div>
      <div id="ivAiNote"></div>
      <div class="sp-scenes" id="ivAiList"><div class="lx-loading"><span class="spin"></span> Đang tải 30 ngành phỏng vấn AI…</div></div>
    </section>
    <section class="lx-sec">
      <div class="sec-head"><div><h2>Phỏng vấn tự luyện có câu mẫu · ${tracks.length} vòng (${totalQ} câu)</h2><p>Trả lời trước rồi đối chiếu câu mẫu, không bắt buộc AI. Tiến độ được nhớ trên trình duyệt này.</p></div></div>
      <div class="lx-grid">${tracks.map((t) => {
        const done = Math.min(savedStep(lang.id, t.id), t.questions.length);
        return `<a class="lx-card" href="/app/phong-van/${lang.id}/${t.id}" style="--c:${esc(lang.color)}"><b>${esc(t.title)}</b><span class="lx-card-sub">${esc(t.desc)}</span><span class="lx-card-foot"><span>${done}/${t.questions.length} câu đã xem đáp án</span></span></a>`;
      }).join("")}</div>
    </section>`;
  try {
    const d = await api(`/api/lang/speak/${encodeURIComponent(lang.id)}`);
    if (!ctx.isCurrent()) return;
    const listEl = main.querySelector("#ivAiList");
    const noteEl = main.querySelector("#ivAiNote");
    if (noteEl && !d.pro) {
      noteEl.innerHTML = `<p class="small muted" style="margin-bottom:10px">${d.interviewFree && d.interviewFree.used ? "Bạn đã dùng lượt phỏng vấn AI miễn phí. Nâng cấp Pro để phỏng vấn AI không giới hạn." : "Tài khoản Free được 1 buổi phỏng vấn AI miễn phí. Chọn một lĩnh vực bên dưới để bắt đầu."}</p>`;
    }
    if (listEl) {
      const ivs = d.interviews || [];
      listEl.innerHTML = ivs.map((s) => `<a class="sp-scene" href="/app/ngoai-ngu/tro-chuyen/${lang.id}/${s.id}"><span class="sp-scene-ico">${speakIcon(s.icon, 20)}</span><span><b>${esc(s.title)}</b><span>${esc(s.desc)}</span></span></a>`).join("");
    }
  } catch (e) {
    if (!ctx.isCurrent()) return;
    const listEl = main.querySelector("#ivAiList");
    if (listEl) listEl.innerHTML = `<div class="sheet sheet-pad small muted">Chưa tải được danh sách phỏng vấn AI (${esc(e.message)}). Bạn vẫn có thể luyện bộ câu mẫu bên dưới hoặc mở <a href="${lang.course}">Phòng luyện nói</a>.</div>`;
  }
}

function renderSession(main, lang, track, ctx) {
  ctx.setCrumbs([["Phỏng vấn", "/app/phong-van"], [lang.name, `/app/phong-van/${lang.id}`], [track.title]]);
  let step = Math.min(savedStep(lang.id, track.id), track.questions.length);
  const draw = () => {
    if (step >= track.questions.length) {
      main.innerHTML = `${head(`${lang.flag} ${esc(track.title)}`, `Bạn đã xem đáp án ${track.questions.length} câu.`, `/app/phong-van/${lang.id}`)}
        <div class="sheet sheet-pad"><b>Hết vòng này</b><p>Làm lại từ đầu nếu muốn nói theo cách khác. Câu mẫu chỉ là một cách trả lời đúng, không phải lời duy nhất.</p>
        <div class="row"><button class="btn btn-primary" id="ivRestart">Làm lại</button><a class="btn" href="/app/phong-van/${lang.id}">Vòng khác</a></div></div>`;
      main.querySelector("#ivRestart").addEventListener("click", () => { step = 0; saveStep(lang.id, track.id, 0); draw(); });
      return;
    }
    const item = track.questions[step];
    main.innerHTML = `${head(`${lang.flag} ${esc(track.title)}`, `Câu ${step + 1}/${track.questions.length}`, `/app/phong-van/${lang.id}`)}
      <section class="sheet sheet-pad">
        <p class="kicker">Người phỏng vấn</p>
        <h2 style="margin:6px 0 8px">${esc(item.q)}</h2>
        ${item.qVi ? `<p class="muted">${esc(item.qVi)}</p>` : ""}
        ${item.hint ? `<p class="small muted">${currentLang() === "en" ? "Tip" : "Gợi ý cách nói"}: ${esc(item.hint)}</p>` : ""}
        <p class="small" style="margin:10px 0 0"><b>Nói to câu trả lời trước</b>, như đang ngồi trước người phỏng vấn. Ghi lại vài ý nếu muốn, rồi xem câu mẫu để so.</p>
        <label class="field">Ghi chú (không bắt buộc)<textarea class="note-area" id="ivAnswer" maxlength="2000" placeholder="Viết như khi đang nói. Câu ngắn, đủ ý."></textarea></label>
        <div class="row" style="margin-top:12px"><button class="btn btn-primary" id="ivShow">Tôi đã nói xong · xem câu mẫu</button>${aiOn() && S.membership && S.membership.pro ? `<button class="btn" id="ivAi">${icon("bulb")}Nhờ AI nhận xét</button>` : ""}</div>
        <div id="ivOut"></div>
      </section>`;
    const answer = () => main.querySelector("#ivAnswer").value.trim();
    const showModel = () => {
      main.querySelector("#ivOut").innerHTML = `<div class="prompt" style="margin-top:16px"><b>Một cách trả lời</b><p>${esc(item.model)}</p>${item.modelVi ? `<p class="muted">${esc(item.modelVi)}</p>` : ""}</div>
        <button class="btn btn-primary" id="ivNext" style="margin-top:12px">${step + 1 === track.questions.length ? "Xong vòng này" : "Câu tiếp theo"}</button>`;
      main.querySelector("#ivNext").addEventListener("click", () => { step += 1; saveStep(lang.id, track.id, step); draw(); });
    };
    main.querySelector("#ivShow").addEventListener("click", () => {
      showModel();
    });
    main.querySelector("#ivAi")?.addEventListener("click", async () => {
      const text = answer();
      if (text.length < 8) { toast("Hãy viết câu trả lời trước.", "err"); return; }
      const btn = main.querySelector("#ivAi");
      btn.disabled = true;
      try {
        const j = await api("/api/ai/ask", "POST", {
          mode: "review",
          question: `Câu phỏng vấn: ${item.q}\n${item.qVi ? "Nghĩa: " + item.qVi + "\n" : ""}Câu trả lời của học viên:\n${text}\nNhận xét ngắn bằng tiếng Việt: chỗ đúng, chỗ thiếu, và một cách nói lại gọn hơn. Không chấm điểm số.`,
          page: `Phỏng vấn ${lang.name} · ${track.title}`,
        });
        main.querySelector("#ivOut").insertAdjacentHTML("afterbegin", `<div class="prompt" style="margin-top:16px"><b>AI nhận xét</b><p>${esc(j.answer || "")}</p></div>`);
      } catch (e) { toast(e.message, "err"); }
      btn.disabled = false;
    });
  };
  draw();
}
