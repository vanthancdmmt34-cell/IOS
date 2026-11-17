/* Sổ tay từ vựng: từ đã lưu (lưu từ trang lý thuyết) và ghi chú cá nhân. Lưu trong tài khoản (S.prefs.words, S.prefs.notes). */
import { S, esc, icon, toast } from "./core.js";
import { savePrefs } from "./game.js";
import { speakText } from "./voice.js";
import { currentLang } from "./i18n.js";

const EN = currentLang() === "en";
const LANG_NAME = { en: EN ? "English" : "Tiếng Anh", zh: EN ? "Chinese" : "Tiếng Trung", ja: EN ? "Japanese" : "Tiếng Nhật", ko: EN ? "Korean" : "Tiếng Hàn", fr: EN ? "French" : "Tiếng Pháp", es: EN ? "Spanish" : "Tiếng Tây Ban Nha" };

export const savedWords = () => (S.prefs && Array.isArray(S.prefs.words) ? S.prefs.words : []);
export const isWordSaved = (lang, word) => savedWords().some((w) => w.lang === lang && w.word === word);

// Lưu hoặc bỏ lưu một từ; trả về true nếu vừa được lưu
export function toggleWord({ lang, word, reading = "", meaning = "" }) {
  const list = savedWords().slice();
  const i = list.findIndex((w) => w.lang === lang && w.word === word);
  if (i >= 0) { list.splice(i, 1); savePrefs({ words: list }); return false; }
  list.unshift({ lang, word, reading, meaning, at: new Date().toISOString().slice(0, 10) });
  savePrefs({ words: list.slice(0, 300) });
  return true;
}

const notesMap = () => (S.prefs && S.prefs.notes && typeof S.prefs.notes === "object" ? S.prefs.notes : {});

export function pageNotebook(main, _params, _query, ctx) {
  ctx.setCrumbs([[EN ? "Student" : "Học viên", "/app/"], [EN ? "Notebook" : "Sổ tay từ vựng"]]);
  let qFilter = "", langFilter = "all";
  const render = () => {
    const words = savedWords();
    const notes = Object.entries(notesMap());
    const langs = [...new Set(words.map((w) => w.lang).filter(Boolean))];
    const qNorm = qFilter.trim().toLowerCase();
    const filtered = words.filter((w) => {
      if (langFilter !== "all" && w.lang !== langFilter) return false;
      if (!qNorm) return true;
      return `${w.word || ""} ${w.reading || ""} ${w.meaning || ""}`.toLowerCase().includes(qNorm);
    });
    const groups = {};
    for (const w of filtered) (groups[w.lang] = groups[w.lang] || []).push(w);
    main.innerHTML = `
      <div class="lx-notebook">
        <div class="page-head"><div><span class="edu-eyebrow">${EN ? "NOTEBOOK" : "SỔ TAY"}</span>
          <h1>${EN ? "Vocabulary notebook" : "Sổ tay từ vựng"}</h1>
          <p>${EN ? "Words you saved from lessons, and your own notes." : "Các từ bạn đã lưu trong bài học và ghi chú của riêng bạn."}</p></div></div>
        <div class="lx-nb-search-wrap">
          <span class="lx-nb-search-ic">🔍</span>
          <input type="search" id="nbSearch" class="lx-nb-search" value="${esc(qFilter)}" placeholder="${EN ? "Search word or meaning..." : "Tìm từ hoặc nghĩa..."}" />
        </div>
        <div class="lx-nb-toolbar">
          <span class="lx-ex-pill">${EN ? "Saved" : "Đã lưu"} ${filtered.length} ${EN ? "words" : "từ"}</span>
          <select id="nbLangFilter" class="lx-nb-select" aria-label="${EN ? "Filter by language" : "Lọc theo ngoại ngữ"}">
            <option value="all"${langFilter === "all" ? " selected" : ""}>${EN ? "All languages" : "Tất cả ngôn ngữ"}</option>
            ${langs.map((l) => `<option value="${esc(l)}"${langFilter === l ? " selected" : ""}>${esc(LANG_NAME[l] || l)}</option>`).join("")}
          </select>
        </div>
        <section class="sheet sheet-pad lx-nb-sec">
          <h2>${EN ? "Saved words" : "Từ đã lưu"} <small>(${filtered.length})</small></h2>
          ${filtered.length ? Object.keys(groups).map((lang) => `
            <h3 class="lx-nb-lang">${esc(LANG_NAME[lang] || lang)}</h3>
            <ul class="lx-nb-list">${groups[lang].map((w) => {
              const i = words.indexOf(w);
              return `<li class="lx-nb-word">
                <span class="lx-nb-ico" aria-hidden="true">🔖</span>
                <div class="lx-nb-txt"><b>${esc(w.word)}</b>${w.reading ? `<span class="lx-nb-read">${esc(w.reading)}</span>` : ""}<span class="lx-nb-mean">${esc(w.meaning || "")}</span></div>
                <div class="lx-nb-act">
                  <button type="button" class="btn btn-sm lx-nb-say-btn" data-nb-say="${i}" aria-label="${EN ? "Listen" : "Nghe"}">🔊</button>
                  <button type="button" class="btn btn-sm btn-ghost lx-nb-del-btn" data-nb-del="${i}" aria-label="${EN ? "Remove" : "Xóa"}">×</button>
                </div></li>`;
            }).join("")}</ul>`).join("") : `<p class="muted">${EN ? "No saved words yet. Open a lesson's vocabulary and tap Save." : "Chưa có từ nào. Mở phần từ vựng của bài học và bấm Lưu từ."}</p>`}
        </section>
        <section class="sheet sheet-pad lx-nb-sec">
          <h2>${EN ? "My notes" : "Ghi chú của tôi"}</h2>
          <form class="lx-nb-form" id="nbNoteForm">
            <textarea id="nbNoteText" rows="3" maxlength="2000" placeholder="${EN ? "Write a tip, a sentence or a reminder…" : "Viết mẹo, câu ví dụ hoặc lời nhắc…"}"></textarea>
            <button type="submit" class="btn btn-primary">${EN ? "Save note" : "Lưu ghi chú"}</button>
          </form>
          ${notes.length ? `<ul class="lx-nb-list">${notes.reverse().map(([k, v]) => `<li class="lx-nb-note"><p>${esc(v)}</p><button type="button" class="btn btn-sm btn-ghost" data-nb-note-del="${esc(k)}">${EN ? "Delete" : "Xóa"}</button></li>`).join("")}</ul>` : ""}
        </section>
      </div>`;
    const searchEl = main.querySelector("#nbSearch");
    searchEl?.addEventListener("input", (e) => {
      qFilter = e.target.value;
      const pos = e.target.selectionStart;
      render();
      const nextEl = main.querySelector("#nbSearch");
      if (nextEl) { nextEl.focus(); try { nextEl.setSelectionRange(pos, pos); } catch {} }
    });
    main.querySelector("#nbLangFilter")?.addEventListener("change", (e) => {
      langFilter = e.target.value;
      render();
    });
    main.querySelectorAll("[data-nb-say]").forEach((b) => b.addEventListener("click", () => {
      const w = savedWords()[+b.dataset.nbSay]; if (w) speakText(w.word, w.lang);
    }));
    main.querySelectorAll("[data-nb-del]").forEach((b) => b.addEventListener("click", () => {
      const list = savedWords().slice(); list.splice(+b.dataset.nbDel, 1); savePrefs({ words: list }); render();
    }));
    main.querySelector("#nbNoteForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const txt = (main.querySelector("#nbNoteText")?.value || "").trim();
      if (!txt) { toast(EN ? "Write something first." : "Hãy viết nội dung trước.", "info"); return; }
      const key = `n-${Date.now().toString(36)}`;
      savePrefs({ notes: { ...notesMap(), [key]: txt.slice(0, 2000) } });
      render();
    });
    main.querySelectorAll("[data-nb-note-del]").forEach((b) => b.addEventListener("click", () => {
      const next = { ...notesMap() }; delete next[b.dataset.nbNoteDel]; savePrefs({ notes: next }); render();
    }));
  };
  render();
}
