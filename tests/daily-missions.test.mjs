// Nhiệm vụ hằng ngày: "hôm nay" tính từ 5:00 sáng giờ Việt Nam; lượt chơi mini game được ghi nhận;
// hoạt động học ngoại ngữ và hoạt động chung được tách riêng trong biểu đồ tuần. Chạy máy chủ thật với CSDL tạm.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { cycleStartIso } from "../modules/giftcodes.js";

describe("đầu chu kỳ hôm nay (5:00 sáng giờ Việt Nam)", () => {
  it("đầu chu kỳ rơi đúng 22:00 UTC, tức 05:00 giờ Việt Nam", () => {
    const at = Date.parse("2026-11-14T10:00:00Z"); // 17:00 ICT ngày 14/11
    assert.equal(cycleStartIso(at), "2026-11-13T22:00:00.000Z");
  });
  it("04:59 giờ Việt Nam vẫn thuộc chu kỳ của ngày hôm trước", () => {
    const at = Date.parse("2026-11-13T21:59:00Z"); // 04:59 ICT ngày 14/11
    assert.equal(cycleStartIso(at), "2026-11-12T22:00:00.000Z");
  });
  it("05:00 giờ Việt Nam bắt đầu chu kỳ mới", () => {
    const at = Date.parse("2026-11-13T22:00:00Z"); // 05:00 ICT ngày 14/11
    assert.equal(cycleStartIso(at), "2026-11-13T22:00:00.000Z");
  });
});

describe("số liệu hôm nay và biểu đồ tuần trên máy chủ thật", () => {
  let srv, dir, cookie, csrf;
  const call = (p, { method = "GET", body, cookie: c = "", csrf: t = "" } = {}) => srv.fetch(p, {
    method,
    headers: { "content-type": "application/json", ...(c ? { cookie: `hoc_session=${c}` } : {}), ...(t ? { "x-csrf-token": t } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, headers: r.headers, json: await r.json().catch(() => ({})) }));

  before(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "study-daily-missions-"));
    Object.assign(process.env, { DATA_DIR: dir });
    const { getTestServer } = await import("./helpers/test-server.mjs");
    srv = await getTestServer();
    const r = await call("/api/register", { method: "POST", body: { username: "nhiemvu_hang_ngay", password: "matkhau-nhiem-vu-1" } });
    assert.equal(r.status, 201);
    cookie = (/hoc_session=([^;,]+)/.exec(r.headers["set-cookie"] || "") || [])[1] || "";
    csrf = r.json.csrfToken;
  });

  // Đóng máy chủ thử sau khi chạy xong, nếu không tiến trình test sẽ treo
  after(async () => {
    if (srv) await srv.close();
  });

  it("chưa học gì thì mọi số liệu hôm nay bằng 0", async () => {
    const d = await call("/api/dashboard", { cookie });
    assert.equal(d.status, 200);
    // Shape hiện tại của /api/dashboard → today (modules/api.js): có thêm số bài học và luyện nói theo ngôn ngữ
    assert.deepEqual(d.json.today, { activities: 0, lessons: 0, lessonsByLang: {}, speaks: 0, speaksByLang: {}, reviewsByLang: {}, miniGames: 0 });
  });

  it("mỗi lượt mini game được ghi nhận, không tính vào hoạt động học ngoại ngữ", async () => {
    for (const game of ["quiz", "spell"]) {
      const g = await call("/api/me/pet/game/start", { method: "POST", cookie, csrf, body: { game, lang: "en" } });
      assert.equal(g.status, 200, JSON.stringify(g.json).slice(0, 160));
    }
    const d = await call("/api/dashboard", { cookie });
    assert.equal(d.json.today.miniGames, 2);
    assert.equal(d.json.today.activities, 2);
    const todayRow = d.json.week.find((w) => Number(w.n) === 2);
    assert.ok(todayRow, "biểu đồ tuần có 2 hoạt động trong ngày");
    assert.equal(Number(todayRow.lang) || 0, 0, "lượt chơi không được tính là hoạt động học ngoại ngữ");
  });
});
