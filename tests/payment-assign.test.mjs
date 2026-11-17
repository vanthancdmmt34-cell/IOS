// Gán thủ công giao dịch chưa khớp vào đơn: giao dịch chuyển khoản không có mã đơn -> admin gán vào đơn -> đơn đã thanh toán, học viên có Pro.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BANK_ACC = "9999888877";
const SEPAY_KEY = "test-sepay-key-123";

describe("gán thủ công giao dịch chưa khớp vào đơn", () => {
  let srv, dir;
  const cookieOf = (r) => (/hoc_session=([^;,]+)/.exec(r.headers["set-cookie"] || "") || [])[1] || "";
  const call = (p, { method = "GET", body, cookie = "", csrf = "", headers = {} } = {}) => srv.fetch(p, {
    method,
    headers: { "content-type": "application/json", ...(cookie ? { cookie: `hoc_session=${cookie}` } : {}), ...(csrf ? { "x-csrf-token": csrf } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, headers: r.headers, json: await r.json().catch(() => ({})) }));

  before(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "study-assign-"));
    Object.assign(process.env, { DATA_DIR: dir, SEPAY_API_KEY: SEPAY_KEY });
    const { getTestServer } = await import("./helpers/test-server.mjs");
    srv = await getTestServer();
  });
  after(async () => { try { await srv.close(); } catch {} });

  it("chạy trọn luồng: đơn -> giao dịch không mã -> gán -> Pro", async () => {
    const adm = await call("/api/register", { method: "POST", body: { username: "pa_admin", password: "matkhau-quan-tri" } });
    assert.equal(adm.status, 201);
    const aC = cookieOf(adm), aT = adm.json.csrfToken;
    const hv = await call("/api/register", { method: "POST", body: { username: "pa_hocvien", password: "matkhau-hv-1" } });
    const hC = cookieOf(hv), hT = hv.json.csrfToken;

    // Bật bán gói và cấu hình tài khoản nhận tiền
    const st = await call("/api/admin/settings", { method: "PUT", cookie: aC, csrf: aT, body: { values: { proEnabled: true, payBank: "970422", payAccountNo: BANK_ACC } } });
    assert.equal(st.status, 200, JSON.stringify(st.json));

    // Học viên tạo đơn
    const ord = await call("/api/billing/orders", { method: "POST", cookie: hC, csrf: hT, body: { planId: "pro_1m" } });
    assert.equal(ord.status, 200, JSON.stringify(ord.json));
    const orderCode = ord.json.order.code;
    const amount = Number(ord.json.order.amountVnd);
    assert.match(orderCode, /^PL[A-HJ-NP-Z2-9]{6}$/);
    assert.ok(amount > 0);

    // Giao dịch chuyển khoản KHÔNG ghi mã đơn -> chưa khớp
    const wh = await call("/api/pay/sepay/webhook", { method: "POST", headers: { authorization: "Apikey " + SEPAY_KEY }, body: { id: 777001, transferAmount: amount, content: "chuyen tien hoc phi", accountNumber: BANK_ACC, transferType: "in" } });
    assert.equal(wh.status, 200, JSON.stringify(wh.json));

    const list = await call("/api/admin/biz/payments?status=unmatched", { cookie: aC });
    const pay = list.json.payments.find((p) => p.txnId === "777001");
    assert.ok(pay, "giao dịch chưa khớp xuất hiện trong danh sách");

    // Mã sai -> 404; mã đúng -> 200
    const wrong = await call(`/api/admin/biz/payments/${pay.id}/assign`, { method: "POST", cookie: aC, csrf: aT, body: { orderCode: "PLZZZZZZ" } });
    assert.equal(wrong.status, 404);
    const ok = await call(`/api/admin/biz/payments/${pay.id}/assign`, { method: "POST", cookie: aC, csrf: aT, body: { orderCode: orderCode } });
    assert.equal(ok.status, 200, JSON.stringify(ok.json));

    // Đơn đã thanh toán và học viên có Pro
    const me = await call("/api/me/pro-access", { cookie: hC });
    assert.equal(me.json.pro, true);
    const after = await call("/api/admin/biz/payments?status=manual", { cookie: aC });
    assert.ok(after.json.payments.some((p) => p.id === pay.id), "giao dịch chuyển sang trạng thái gán thủ công");

    // Gán lại không được nữa
    const again = await call(`/api/admin/biz/payments/${pay.id}/assign`, { method: "POST", cookie: aC, csrf: aT, body: { orderCode: orderCode } });
    assert.equal(again.status, 400);
  });
});
