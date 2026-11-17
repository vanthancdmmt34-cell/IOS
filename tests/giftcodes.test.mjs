// Mã quà tặng Pro và Pro miễn phí 10 phút mỗi ngày: đổi mốc 5:00 sáng giờ Việt Nam, mã dùng một lần, không cộng dồn,
// đăng ký không còn tặng Pro dùng thử. Chạy máy chủ thật với CSDL tạm.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { dailyKey, nextResetIso, normalizeGiftCode, DAILY_PRO_MINUTES } from "../modules/giftcodes.js";

describe("khóa ngày Pro miễn phí (làm mới 5:00 sáng giờ Việt Nam)", () => {
  it("04:59 và 05:00 giờ Việt Nam thuộc hai ngày khác nhau", () => {
    // 2026-11-14 04:59 ICT = 2026-11-13T21:59Z ; 05:00 ICT = 2026-11-13T22:00Z
    const before5 = Date.parse("2026-11-13T21:59:00Z");
    const at5 = Date.parse("2026-11-13T22:00:00Z");
    assert.equal(dailyKey(before5), "2026-11-13");
    assert.equal(dailyKey(at5), "2026-11-14");
  });
  it("lần làm mới kế tiếp là 5:00 sáng hôm sau giờ Việt Nam", () => {
    assert.equal(nextResetIso("2026-11-14"), "2026-11-14T22:00:00.000Z");
  });
  it("thời lượng Pro miễn phí là 10 phút", () => {
    assert.equal(DAILY_PRO_MINUTES, 10);
  });
});

describe("mã quà tặng", () => {
  it("chuẩn hóa mã: bỏ dấu cách, viết hoa, thêm gạch nối", () => {
    assert.equal(normalizeGiftCode(" abcd efgh-jk23 "), "ABCD-EFGH-JK23");
    assert.equal(normalizeGiftCode("ABCDEFGHJK23"), "ABCD-EFGH-JK23");
    assert.equal(normalizeGiftCode("ABC"), null);
    assert.equal(normalizeGiftCode("ABCD-EFGH-JK2!"), null);
  });
});

describe("Pro miễn phí, mã quà tặng và đăng ký", () => {
  let srv, dir;
  const admin = "gift_admin", user = "gift_user", friend = "gift_friend";
  let adminCookie = "", adminCsrf = "", userCookie = "", userCsrf = "";

  const cookieOf = (r) => {
    const sc = r.headers["set-cookie"] || "";
    return (/hoc_session=([^;,]+)/.exec(sc) || [])[1] || "";
  };
  const call = (p, { method = "GET", body, cookie = "", csrf = "" } = {}) => srv.fetch(p, {
    method,
    headers: { "content-type": "application/json", ...(cookie ? { cookie: `hoc_session=${cookie}` } : {}), ...(csrf ? { "x-csrf-token": csrf } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, headers: r.headers, json: await r.json().catch(() => ({})) }));

  before(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "study-gift-"));
    Object.assign(process.env, { DATA_DIR: dir });
    const { getTestServer } = await import("./helpers/test-server.mjs");
    srv = await getTestServer();
    // Tài khoản đầu tiên là quản trị.
    const a = await call("/api/register", { method: "POST", body: { username: admin, password: "matkhau-quan-tri" } });
    assert.equal(a.status, 201);
    adminCookie = cookieOf(a); adminCsrf = a.json.csrfToken;
    const u = await call("/api/register", { method: "POST", body: { username: user, password: "matkhau-hoc-vien" } });
    assert.equal(u.status, 201);
    userCookie = cookieOf(u); userCsrf = u.json.csrfToken;
    assert.equal(u.json.trial, null, "đăng ký không còn kích hoạt Pro dùng thử");
  });
  after(async () => { try { await srv.close(); } catch {} });

  it("học viên mới chưa có Pro nhưng được dùng lượt miễn phí hôm nay", async () => {
    const r = await call("/api/me/pro-access", { cookie: userCookie });
    assert.equal(r.status, 200);
    assert.equal(r.json.pro, false);
    assert.equal(r.json.daily.canClaim, true);
  });

  it("bấm dùng lượt miễn phí mở Pro, nhưng chỉ được một lần trong ngày", async () => {
    const r1 = await call("/api/me/daily-pro", { method: "POST", body: {}, cookie: userCookie, csrf: userCsrf });
    assert.equal(r1.status, 200);
    assert.equal(r1.json.status.pro, true);
    const r2 = await call("/api/me/daily-pro", { method: "POST", body: {}, cookie: userCookie, csrf: userCsrf });
    assert.equal(r2.status, 400);
  });

  it("quản trị tạo mã ngẫu nhiên, học viên nhập mã và không nhập lại được", async () => {
    const g = await call("/api/admin/gift-codes", { method: "POST", body: { count: 2, days: 30, note: "thử" }, cookie: adminCookie, csrf: adminCsrf });
    assert.equal(g.status, 200);
    assert.equal(g.json.codes.length, 2);
    assert.notEqual(g.json.codes[0], g.json.codes[1]);
    const [c1, c2] = g.json.codes;

    const bad = await call("/api/me/gift", { method: "POST", body: { code: "AAAA-BBBB-CCCC" }, cookie: userCookie, csrf: userCsrf });
    assert.equal(bad.status, 400);

    const ok = await call("/api/me/gift", { method: "POST", body: { code: c1.toLowerCase() }, cookie: userCookie, csrf: userCsrf });
    assert.equal(ok.status, 200);
    assert.equal(ok.json.days, 30);
    assert.equal(ok.json.status.gift.active, true);
    // Dùng xong thì mã bị xóa khỏi kho quản trị
    const left = await call("/api/admin/gift-codes", { cookie: adminCookie });
    assert.ok(!left.json.items.some((x) => x.code === c1), "mã đã dùng không còn trong kho");

    // Mỗi tài khoản chỉ dùng một mã trong đời, kể cả khi mã trước đã hết hạn
    const stack = await call("/api/me/gift", { method: "POST", body: { code: c2 }, cookie: userCookie, csrf: userCsrf });
    assert.equal(stack.status, 400);
    assert.equal(stack.json.error, "Mỗi tài khoản chỉ dùng được một mã quà tặng.");

    // Người khác không dùng lại được mã đã đổi
    const f = await call("/api/register", { method: "POST", body: { username: friend, password: "matkhau-ban-be" } });
    const friendCookie = cookieOf(f), friendCsrf = f.json.csrfToken;
    const again = await call("/api/me/gift", { method: "POST", body: { code: c1 }, cookie: friendCookie, csrf: friendCsrf });
    assert.equal(again.status, 400);
    assert.equal(again.json.error, "Mã không tồn tại hoặc đã được sử dụng.");
  });

  it("học viên thường không xem được danh sách mã quản trị", async () => {
    const r = await call("/api/admin/gift-codes", { cookie: userCookie });
    assert.equal(r.status, 403);
  });
});
