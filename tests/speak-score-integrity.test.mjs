// AUDIT P1-1: chấm phát âm bằng văn bản do trình duyệt gửi không được ghi tiến độ hay cộng sao.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

describe("Speaking score không ghi tiến độ khi chấm bằng văn bản", () => {
  let srv, cookie, csrf;
  const call = (p, { method = "GET", body, cookie: c = "", csrf: t = "" } = {}) => srv.fetch(p, {
    method,
    headers: { "content-type": "application/json", ...(c ? { cookie: `hoc_session=${c}` } : {}), ...(t ? { "x-csrf-token": t } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, headers: r.headers, json: await r.json().catch(() => ({})) }));

  before(async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "study-speak-integrity-"));
    Object.assign(process.env, { DATA_DIR: dir });
    const { getTestServer } = await import("./helpers/test-server.mjs");
    srv = await getTestServer();
    const r = await call("/api/register", { method: "POST", body: { username: "hoc_vien_noi", password: "matkhau-noi-1" } });
    assert.equal(r.status, 201);
    cookie = (/hoc_session=([^;,]+)/.exec(r.headers.get ? r.headers.get("set-cookie") || "" : (r.headers["set-cookie"] || "")) || [])[1] || "";
    csrf = r.json.csrfToken;
  });

  after(async () => { if (srv) await srv.close(); });

  it("gửi đúng câu mẫu: vẫn trả điểm nhưng không cộng sao, không ghi tiến độ", async () => {
    const list = await call("/api/lang/speak/en", { cookie });
    assert.equal(list.status, 200);
    const item = (list.json.levels || []).filter((l) => !l.locked).flatMap((l) => l.units || []).flatMap((u) => u.sentences || [])[0];
    assert.ok(item?.k && item?.t, "cần một câu luyện mở khóa");

    const sc = await call("/api/lang/speak/score", { method: "POST", cookie, csrf, body: { lang: "en", key: item.k, heard: item.t, alts: [], conf: 0.99, ms: 2000 } });
    assert.equal(sc.status, 200);
    assert.ok(sc.json.score >= 85, "điểm phản hồi vẫn được trả về");
    assert.equal(sc.json.starsEarned, 0, "không cộng sao từ văn bản client");
    assert.equal(sc.json.recorded, false);
    assert.equal(sc.json.best, null, "chưa có tiến độ thì best là null");

    const after1 = await call("/api/lang/speak/en", { cookie });
    assert.equal(after1.json.stats.practiced, 0, "không có câu nào được tính là đã luyện");
  });
});
