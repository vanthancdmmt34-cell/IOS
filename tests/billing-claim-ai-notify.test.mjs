// Hồi quy cho ba luồng từng bị thiếu route: học viên "Tôi đã chuyển khoản" (claim),
// xem/hủy đơn của chính mình, lịch sử hội thoại AI (GET/DELETE) và nút thử thông báo của quản trị viên.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

describe("đơn Pro: claim / xem / hủy; hội thoại AI; thử thông báo", () => {
  let srv, dir;
  const cookieOf = (r) => (/hoc_session=([^;,]+)/.exec(r.headers["set-cookie"] || "") || [])[1] || "";
  const call = (p, { method = "GET", body, cookie = "", csrf = "" } = {}) => srv.fetch(p, {
    method,
    headers: { "content-type": "application/json", ...(cookie ? { cookie: `hoc_session=${cookie}` } : {}), ...(csrf ? { "x-csrf-token": csrf } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, headers: r.headers, json: await r.json().catch(() => ({})) }));

  let adm, hv, other;
  let order;

  before(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "study-claim-"));
    Object.assign(process.env, { DATA_DIR: dir });
    const { getTestServer } = await import("./helpers/test-server.mjs");
    srv = await getTestServer();
    // Người đăng ký đầu tiên là quản trị viên (fixture; helper bật ALLOW_FIRST_USER_ADMIN)
    adm = await call("/api/register", { method: "POST", body: { username: "bc_admin", password: "matkhau-quan-tri" } });
    assert.equal(adm.status, 201);
    hv = await call("/api/register", { method: "POST", body: { username: "bc_hocvien", password: "matkhau-hv-1" } });
    assert.equal(hv.status, 201);
    other = await call("/api/register", { method: "POST", body: { username: "bc_khac", password: "matkhau-khac-1" } });
    assert.equal(other.status, 201);
    const st = await call("/api/admin/settings", {
      method: "PUT", cookie: cookieOf(adm), csrf: adm.json.csrfToken,
      body: { values: { proEnabled: true, payBank: "970422", payAccountNo: "9999888877" } },
    });
    assert.equal(st.status, 200, JSON.stringify(st.json));
  });
  after(async () => { try { await srv.close(); } catch {} });

  const S = () => ({ cookie: cookieOf(hv), csrf: hv.json.csrfToken });
  const O = () => ({ cookie: cookieOf(other), csrf: other.json.csrfToken });
  const A = () => ({ cookie: cookieOf(adm), csrf: adm.json.csrfToken });

  it("học viên tạo đơn, xem lại đơn của mình; người khác không xem được", async () => {
    const r = await call("/api/billing/orders", { method: "POST", ...S(), body: { planId: "pro_1m" } });
    assert.equal(r.status, 200, JSON.stringify(r.json));
    order = r.json.order;
    assert.ok(order.id);

    const mine = await call(`/api/billing/orders/${order.id}`, S());
    assert.equal(mine.status, 200, JSON.stringify(mine.json));
    assert.equal(mine.json.order.id, order.id);
    assert.ok(mine.json.pay, "có thông tin thanh toán để tiếp tục");
    assert.ok("membership" in mine.json);

    const stranger = await call(`/api/billing/orders/${order.id}`, O());
    assert.equal(stranger.status, 404);
  });

  it("claim \"Tôi đã chuyển khoản\" ghi claimedAt, lặp lại vẫn 200, admin thấy đơn", async () => {
    const c1 = await call(`/api/billing/orders/${order.id}/claim`, { method: "POST", ...S(), body: {} });
    assert.equal(c1.status, 200, JSON.stringify(c1.json));
    assert.ok(c1.json.order.claimedAt, "claimedAt được ghi");

    const c2 = await call(`/api/billing/orders/${order.id}/claim`, { method: "POST", ...S(), body: {} });
    assert.equal(c2.status, 200);

    const list = await call("/api/admin/biz/orders?status=claimed", { cookie: A().cookie });
    assert.equal(list.status, 200);
    assert.ok((list.json.orders || []).some((o) => o.id === order.id), "admin thấy đơn đã báo chuyển khoản");

    const notMine = await call(`/api/billing/orders/${order.id}/claim`, { method: "POST", ...O(), body: {} });
    assert.equal(notMine.status, 404);
  });

  it("không hủy được đơn đã claim; đơn chưa claim thì hủy được", async () => {
    const refused = await call(`/api/billing/orders/${order.id}/cancel`, { method: "POST", ...S(), body: {} });
    assert.equal(refused.status, 400);

    const fresh = await call("/api/billing/orders", { method: "POST", ...S(), body: { planId: "pro_3m" } });
    assert.equal(fresh.status, 200, JSON.stringify(fresh.json));
    const cancelled = await call(`/api/billing/orders/${fresh.json.order.id}/cancel`, { method: "POST", ...S(), body: {} });
    assert.equal(cancelled.status, 200, JSON.stringify(cancelled.json));
  });

  it("lịch sử hội thoại AI: học viên xem và xóa được cuộc của mình, người khác không", async () => {
    const dbPath = path.join(dir, "app.db");
    const db = new DatabaseSync(dbPath);
    const uid = db.prepare("SELECT id FROM users WHERE username = 'bc_hocvien'").get().id;
    const t = new Date().toISOString();
    const cid = Number(db.prepare("INSERT INTO ai_conversations (user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?) RETURNING id").get(uid, "Hỏi về thì hiện tại", t, t).id);
    db.prepare("INSERT INTO ai_messages (conversation_id, role, content, created_at) VALUES (?, 'user', ?, ?)").run(cid, "Thì hiện tại đơn là gì?", t);
    db.prepare("INSERT INTO ai_messages (conversation_id, role, content, created_at) VALUES (?, 'assistant', ?, ?)").run(cid, "Diễn tả hành động ở hiện tại.", t);
    db.close();

    const got = await call(`/api/ai/conversations/${cid}`, S());
    assert.equal(got.status, 200, JSON.stringify(got.json));
    assert.equal(got.json.messages.length, 2);

    const stranger = await call(`/api/ai/conversations/${cid}`, O());
    assert.equal(stranger.status, 404);

    const del = await call(`/api/ai/conversations/${cid}`, { method: "DELETE", ...S() });
    assert.equal(del.status, 200, JSON.stringify(del.json));

    const gone = await call(`/api/ai/conversations/${cid}`, S());
    assert.equal(gone.status, 404);
  });

  it("nút thử thông báo: quản trị viên được phép, học viên bị chặn", async () => {
    const ok = await call("/api/admin/notify-test", { method: "POST", ...A(), body: {} });
    assert.equal(ok.status, 200, JSON.stringify(ok.json));
    assert.equal(ok.json.ok, true);
    assert.equal(ok.json.webhook.enabled, false, "chưa cấu hình webhook trong test");

    const denied = await call("/api/admin/notify-test", { method: "POST", ...S(), body: {} });
    assert.equal(denied.status, 403);
  });
});
