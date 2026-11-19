/* Shared Pet Companion ("Cổ vũ · Bạn đồng hành") widget used in /app/ca-nhan and /app/co-vu. */
import { S, esc, fmtN, toast, paintProBadges } from "./core.js";
import { currentLang } from "./i18n.js";
import { COMPANIONS, companionOf, companionSvg, activeCompanionId, refreshCompanion } from "./companion.js";
import { petState, cheer, exchange, refreshPet, petView } from "./pet-state.js";
import { savePrefs } from "./game.js";

const L = (vi, en) => (currentLang() === "en" ? en : vi);
const bar = (pct, color) => `<span class="bar hm-bar"><i style="width:${Math.max(0, Math.min(100, pct))}%;${color ? `background:${color}` : ""}"></i></span>`;

export function companionCardHtml({ userLv = 1, showStars = false } = {}) {
  const activeC = companionOf(activeCompanionId());
  const pet = petState();
  const knowPct = Math.min(100, pet.knowledge);
  const knowTxt = Number.isInteger(pet.knowledge) ? fmtN(pet.knowledge) : String(pet.knowledge).replace(".", ",");
  const energyPct = pet.energy;
  return `
      <aside class="hm-pet-card" id="hmPetCard" aria-label="${L("Thú cưng đồng hành", "Pet Companion")}">
        <div class="hm-pet-head">
          <div>
            <b id="hmPetName">${esc(activeC.name)}</b>
            <small id="hmPetTier">${esc(activeC.tone)} · LVL ${userLv}</small>
          </div>
          ${showStars ? `<span class="hm-star-pill hm-pet-stars">⭐ <b data-pet-stars>${fmtN(pet.stars)}</b> <small>SAO</small></span>` : ""}
        </div>
        <div class="hm-pet-tabs" role="tablist" aria-label="${L("Chọn bạn đồng hành", "Choose companion")}">
          ${COMPANIONS.map((c) => `
            <button type="button" class="hm-pet-tab${c.id === activeC.id ? " on" : ""}" data-pet="${esc(c.id)}" title="${esc(c.name)}">
              ${companionSvg(c.id, 40)}
              <span>${esc(c.name.split(" ")[0])}</span>
            </button>
          `).join("")}
        </div>
        <div class="hm-pet-stage">
          <div class="hm-pet-aura" aria-hidden="true"></div>
          <div id="hmPetHeroImg" class="hm-pet-hero-img" role="img" aria-label="${esc(activeC.name)}">${companionSvg(activeC.id, 210)}</div>
        </div>
        <div class="hm-pet-bars">
          <div><span>🍀 ${L("Năng lượng", "Energy")}</span><b>${energyPct}/100</b>${bar(energyPct, "#10B981")}</div>
          <div><span>🧠 ${L("Tri thức", "Knowledge")}</span><b id="hmPetKnowVal">${knowTxt}/100</b>${bar(knowPct, "#8B5CF6")}</div>
        </div>
        <button type="button" class="hm-pet-cheer-btn" id="hmPetCheerBtn">⭐ ${L("Cổ vũ bạn học · 5 sao = +2 tri thức", "Cheer your companion · 5 stars = +2 knowledge")}</button>
        <button type="button" class="hm-pet-cheer-btn hm-pet-exch-btn" id="hmPetExchBtn" disabled>🎁 ${L("Đổi 100 tri thức = 1 ngày Pro", "Exchange 100 knowledge = 1 day of Pro")}</button>
        <small class="hm-pet-exch-note" id="hmPetExchNote"></small>
      </aside>`;
}

export function bindCompanionCard(container, { userLv = 1, starRoot = container } = {}) {
  if (!container) return;
  const paintPet = () => {
    const s = petState();
    const kv = container.querySelector("#hmPetKnowVal");
    if (kv) kv.textContent = `${Number.isInteger(s.knowledge) ? fmtN(s.knowledge) : String(s.knowledge).replace(".", ",")}/100`;
    const knowBar = container.querySelector("#hmPetKnowVal + .bar i");
    if (knowBar) knowBar.style.width = `${Math.max(0, Math.min(100, s.knowledge))}%`;
    const roots = starRoot && starRoot !== container ? [container, starRoot] : [container];
    roots.forEach((r) => r.querySelectorAll(".hm-star-pill b").forEach((b) => { b.textContent = fmtN(s.stars); }));
    const v = petView();
    const used = v ? v.exchangedToday || 0 : 0;
    const limit = v && v.exchangeLimit ? v.exchangeLimit : 2;
    const btn = container.querySelector("#hmPetExchBtn");
    if (btn) btn.disabled = s.knowledge < 100 || used >= limit;
    const note = container.querySelector("#hmPetExchNote");
    if (note) note.textContent = used >= limit
      ? L(`Hôm nay đã đổi ${used}/${limit} lần. Lượt mới lúc 5:00 sáng mai.`, `Exchanged ${used}/${limit} today. Resets at 5:00 am.`)
      : L(`Đã đổi ${used}/${limit} lần hôm nay.`, `Exchanged ${used}/${limit} today.`);
  };
  container.querySelectorAll("[data-pet]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = companionOf(btn.dataset.pet);
      savePrefs({ companion: c.id });
      refreshCompanion(`${c.name} sẽ đi cùng bạn trên mọi trang và nhắc bài tiếp theo. Chọn xong rồi!`);
      container.querySelectorAll("[data-pet]").forEach((b) => b.classList.toggle("on", b === btn));
      const hero = container.querySelector("#hmPetHeroImg");
      const nm = container.querySelector("#hmPetName");
      const tr = container.querySelector("#hmPetTier");
      if (hero) {
        hero.innerHTML = companionSvg(c.id, 210);
        hero.setAttribute("aria-label", c.name);
        hero.classList.remove("chibi-pop");
        void hero.offsetWidth;
        hero.classList.add("chibi-pop");
      }
      if (nm) nm.textContent = c.name;
      if (tr) tr.textContent = `${c.tone} · LVL ${userLv}`;
    });
  });
  paintPet();
  refreshPet().then(() => { if (container.isConnected) paintPet(); });
  container.querySelector("#hmPetCheerBtn")?.addEventListener("click", async (ev) => {
    const btn = ev.currentTarget;
    btn.disabled = true;
    try {
      await cheer();
      const name = container.querySelector("#hmPetName")?.textContent || L("Bạn đồng hành", "Your companion");
      const img = container.querySelector("#hmPetHeroImg");
      if (img) { img.classList.remove("chibi-pop"); void img.offsetWidth; img.classList.add("chibi-pop"); }
      paintPet();
      refreshCompanion(`${name}: Cảm ơn bạn đã cổ vũ mình! +2 tri thức.`);
      toast(L(`${name} được cổ vũ! +2 tri thức.`, `${name} was cheered! +2 knowledge.`), "ok");
    } catch (e) { toast(e.message, "info"); }
    finally { btn.disabled = false; }
  });
  container.querySelector("#hmPetExchBtn")?.addEventListener("click", async (ev) => {
    const btn = ev.currentTarget;
    btn.disabled = true;
    try {
      const r = await exchange();
      if (S.membership) { S.membership.pro = true; if (r && r.expiresAt) S.membership.expiresAt = r.expiresAt; }
      try { paintProBadges(); } catch {}
      toast(L("Đã đổi 100 tri thức lấy 1 ngày Pro!", "Exchanged 100 knowledge for 1 day of Pro!"), "ok");
    } catch (e) { toast(e.message, "info"); }
    paintPet();
  });
}
