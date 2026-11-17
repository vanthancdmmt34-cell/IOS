# Payment Confirmation via Zalo (4.10.4)

Workflow:

1. A student purchases a plan, transfers money via the QR code, and clicks **"Tôi đã chuyển khoản"** (I have transferred).
2. The system sends a message to **your Zalo bot**, for example:
   ```
   🧾 Đơn PL4Z2BW6 · Pro 12 tháng · 599.000đ
   Học viên: Nguyễn An (@an123)
   Đã báo chuyển khoản lúc 16:55 11/11.
   … trả lời: HT PL4Z2BW6
   ```
3. You check your banking app to confirm the payment arrived, then message the bot: **`HT PL4Z2BW6`**.
4. The bot forwards that message to the system -> the plan is activated immediately, the student receives a notification, and the bot replies to you with the result.

Commands you can send: `HT <order_code>` (activate) · `HUY <order_code> <reason>` (reject and notify the student) · `DON` (list pending orders).
Case-insensitive; you can type `ht pl4z2bw6`.

## Configuration in the Admin Panel

Admin -> **"Thanh toán và gói"** (Payments & Plans) -> **"Báo đơn và xác nhận qua Zalo"** (Order Notifications & Confirmation via Zalo) section:

- Enable the feature, enter the **bot webhook URL**, click **"Tạo mã"** (Generate token) to create a secret token, (optionally) enter your Zalo ID, and click **"Lưu"** (Save).
- Click **"Gửi tin thử tới Zalo"** (Send test message to Zalo) to test the connection.
- The **"Thử lệnh"** (Test command) input runs `HT`/`HUY`/`DON` commands directly on the web (without needing the bot) — useful when the bot is down.

## Two Snippets to Add to Your Zalo AI Bot (Node.js)

The system does not send Zalo messages directly; it calls your bot. Add the following two snippets to your bot (replace `guiTinZalo` with the message-sending function your bot uses):

```js
// Bot's .env
// PL_URL=https://study.liferivo.com        (learning system URL)
// PL_SECRET=<secret token generated in the admin panel>
// PL_ADMIN_ID=<your Zalo ID>

// 1) Receive order notifications from the system and send them to your Zalo
app.post("/hoc-ngoai-ngu/don-hang", express.json(), async (req, res) => {
  if (req.get("X-PL-Secret") !== process.env.PL_SECRET) return res.sendStatus(401);
  const { to, text } = req.body;              // text: message content to send, to: configured Zalo ID
  await guiTinZalo(to || process.env.PL_ADMIN_ID, text);
  res.json({ ok: true });
});

// 2) When you send HT / HUY / DON to the bot -> forward to the system and send back the reply
async function xuLyTinNhan(fromId, text) {
  if (fromId !== process.env.PL_ADMIN_ID) return false;              // only accept commands from you
  if (!/^\s*(HT|XN|HUY|DON)\b/i.test(text)) return false;            // not an order command -> let the bot handle as usual
  const r = await fetch(process.env.PL_URL + "/api/integrations/zalo", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-PL-Secret": process.env.PL_SECRET },
    body: JSON.stringify({ text, from: fromId }),
  });
  const j = await r.json().catch(() => ({ reply: "Hệ thống học không phản hồi (HTTP " + r.status + ")." }));
  await guiTinZalo(fromId, j.reply || j.error || "Không rõ kết quả.");
  return true;
}
```

Call `xuLyTinNhan(idNguoiGui, noiDung)` at the beginning of your bot's message-handling function; if it returns `true`, skip the AI reply logic.

## Security

- Both directions verify the `X-PL-Secret` header (constant-time comparison). Invalid token -> 401 and logs `zalo.rejected`.
- If a Zalo ID is configured, commands with a `from` value other than that ID are rejected.
- Each order can only be activated once (transaction `zalo:<order_code>` is idempotent); cancelled orders or orders expired for more than 7 days cannot be activated.
- Every confirmation or rejection is logged (`order.zalo_confirm`, `order.zalo_reject`) and appears in the Bank Transactions tab with source `zalo`.
- HTTPS is recommended for both endpoints.
