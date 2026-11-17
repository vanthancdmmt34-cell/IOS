// Kiểm tra bảo mật cho đăng ký nhắc luyện nói (Web Push): chỉ nhận endpoint của dịch vụ push chính thức.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isPushEndpoint, MAX_SUBS_PER_USER } from "../modules/reminders.js";

describe("push endpoint allowlist (SSRF guard)", () => {
  it("accepts official browser push services", () => {
    assert.equal(isPushEndpoint("https://fcm.googleapis.com/fcm/send/abc123"), true);
    assert.equal(isPushEndpoint("https://updates.push.services.mozilla.com/wpush/v2/xyz"), true);
    assert.equal(isPushEndpoint("https://web.push.apple.com/QabcDEF"), true);
    assert.equal(isPushEndpoint("https://wns2-pn1p.notify.windows.com/w/?token=1"), true);
  });

  it("rejects arbitrary, internal, insecure and look-alike hosts", () => {
    assert.equal(isPushEndpoint("https://evil.example.com/fcm.googleapis.com/"), false);
    assert.equal(isPushEndpoint("https://169.254.169.254/latest/meta-data"), false);
    assert.equal(isPushEndpoint("https://localhost:3000/hook"), false);
    assert.equal(isPushEndpoint("http://fcm.googleapis.com/fcm/send/abc"), false);
    assert.equal(isPushEndpoint("https://fcm.googleapis.com.evil.example.com/x"), false);
    assert.equal(isPushEndpoint(""), false);
    assert.equal(isPushEndpoint(undefined), false);
  });

  it("caps devices per account", () => {
    assert.ok(Number.isInteger(MAX_SUBS_PER_USER) && MAX_SUBS_PER_USER >= 1 && MAX_SUBS_PER_USER <= 10);
  });
});
