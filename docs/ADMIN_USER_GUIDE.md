# ADMIN_USER_GUIDE — LifeRivo Administration Guide

## 0. Roles

| Role | Who | What they see |
|---|---|---|
| **Administrator (admin)** | The first registered account, or the username set in `ADMIN_USERNAME`. | **Administration** (bottom of the left menu): settings, plans and pricing, orders, licenses, all classes, bilingual management. |
| **Teacher (teacher)** | Users who buy a teacher plan or are granted a license by an admin. | **Teacher portal**: their own classes, assignments, tests and reports. Cannot open administration or other teachers' classes. |
| **Student (student)** | Self-registered users. | Lessons, exercises, my classes, family plan. |
| **Parent (parent)** | Users who choose "Parent" at registration. | Family plan, invite children, view the progress of children who have consented to share. |

To change a role: **Administration → Students → open the account → Change Role**. To make someone a teacher, grant a **license** (section 7) instead of only changing the role: a teacher without an active license cannot create new classes.

## 1. Initial setup

Open **Administration → Payment, AI & System**. The page has three sections: **Payment**, **AI Tutor** and **Website**. Click **Save Configuration** to apply changes.

- **AI Tutor**: paste your Gemini API key (get one at aistudio.google.com → Get API key; new keys start with `AQ.`, legacy keys start with `AIza…`; both work). Choose the model, unit prices and the monthly cost cap. Save (re-enter your password), then click **Test Connection**.
- **Website**: the official public URL of the site.
- Saved keys only show "Set … last 4 characters". To replace a key, paste a new one. To fall back to the server's environment variable, click **Clear**.

**Payment section**

- **Sell Pro plans**: on or off. When off, the pricing page is hidden and no new orders can be created. Existing Pro members keep their access.
- **Payment verification method**: **Personal account QR** (manual reconciliation) or **Automated via SePay**.
- **Bank**, **account number** and **account holder name**. Personal bank accounts are supported. A VietQR code is generated automatically with the exact amount and the order code pre-filled in the transfer description.
- **Confirmation time**: the message students see after they report a transfer (for example, "Usually within 12 hours").
- **Order expiration time** (hours), **support contact**, and **business entity name** (shown on the policy pages).

**AI Tutor quota settings**: turn the AI on or off; set daily and monthly request limits for the Free and Pro tiers (Free = 0 means only Pro users can use the AI); set the maximum question length, the maximum answer length and the number of earlier turns sent as context.

## 2. Manual verification of personal QR payments

1. The student transfers the money and clicks **I Have Transferred**. The Business tab shows an **"N awaiting confirmation"** badge on Orders.
2. Open your bank's app and find the transaction with the **exact order code in the transfer description** (`PLxxxxxx`) and the **exact amount**.
3. If the money arrived: click **Confirm Payment Received** and enter the bank transaction ID or reference number. Pro access is activated immediately and the student's checkout page updates by itself.
4. If you cannot find it after checking carefully: click **Payment Not Found** and enter a reason. The order is cancelled.
5. If the description is wrong: ask the student for their order code, check the amount and time, then confirm as in step 3.

Reporting a transfer does not activate Pro by itself. Each bank transaction ID can be used only once.

## 3. Business tab

| Section | Purpose |
|---|---|
| **Analytics** | Revenue, active Pro members, conversion rate, new and active students, AI requests and costs, lesson completions. Filter by 24 hours, 7, 30, 90 or 365 days. |
| **Orders** | Filter by status; search by order code or username. Use **Manual Confirmation** only when the webhook fails: check the bank statement, find the matching transaction (amount and description), then enter its transaction ID. Never confirm an order based only on a screenshot from a student. |
| **Bank Transactions** | Every incoming transfer reported by SePay. **No order code**: the transfer description was wrong; ask for the order code, check the amount, then **Assign to Order**. **Mismatch**: underpayment, a second payment for an order that is already paid, or a cancelled order; contact the student and refund if the refund policy applies. |
| **Pro Members** | Search users, **Grant Pro** (months and reason), or **Revoke** (reason required; access ends immediately, used after a refund). |
| **Plans & Pricing** | Change plan names and prices, or stop selling a plan. Pending orders keep their original price. |
| **AI Costs** | Requests, tokens and costs by student and by day, plus recent errors. Costs are computed from the token counts returned by Google and the unit prices in settings. |
| **Audit Log** | Who did what, when, and from which IP: order creation and cancellation, matched payments, manual confirmations, transaction assignments, Pro grants and revocations, price changes, setting updates, rejected webhooks. |

## 4. Recommended daily routine

1. In QR mode, process orders marked "awaiting confirmation" (section 2).
2. Business → Bank Transactions: filter by **No order code** and **Mismatch**, then resolve them.
3. Business → Analytics: compare AI costs with the monthly budget cap.
4. For students who say they paid but are not Pro yet: ask for their order code and bank transaction ID, then look it up in Bank Transactions.

## 5. Learning content

Lessons and exercises are organised by language, level and unit. Free and Pro access depends on the plan. Content is managed in **Administration → Bilingual** (section 9).

## 6. What students see

- Menu items: **Lessons**, **AI Tutor**, **My Plan**, **Upgrade to Pro**.
- Checkout: choose a plan → QR code and transfer details → (QR mode) click **I Have Transferred** and wait for confirmation; (SePay) activation is automatic, usually within 1–3 minutes. The page updates by itself once the order is active.
- **My Plan**: expiry date, order history, and an option to turn off renewal reminders. There is no automatic recurring charge.
- When 7 days or fewer of Pro access remain, a renewal card appears on the dashboard (unless reminders are off).

## 7. Classes and licenses

**Administration → Classes & Licenses**

- **Grant License**: enter the username, the number of student seats, the duration in months, and a reason or contract number. A student or parent account that receives a license is promoted to teacher. Licenses bought through normal orders are provisioned automatically.
- **Revoke**: students in that teacher's classes lose the Pro access granted by the license. Their personal Pro or Family access is not affected. A reason is required.
- **All Classes**: view every class, open any class, **Change Teacher**, or **Create Class for Teacher**.
- A teacher account that still owns classes cannot be deleted. Transfer the classes to another teacher first.

## 8. Plans and pricing

**Administration → Business → Plans & Pricing.** Each plan has a type (Pro, Family or Teacher), a Vietnamese and an English name, a duration in months, a seat count (Family: family members; Teacher: students), a price, a "Contact for quote" flag (not sold directly online), and an Active status. A price change applies only to new orders.

## 9. Bilingual management

**Administration → Bilingual**

- **Learning content translations**: lists every lesson and chapter with its status (Missing, Draft, Published), its source (AI draft, AI + human edited, human translated), and an **"Original changed"** warning when the Vietnamese source was edited after translation.
- Click **Open** to see Vietnamese and English side by side and edit each field. A blank English field falls back to Vietnamese.
- **Generate AI Draft** (needs a Gemini API key) always saves a draft. **Generate AI Drafts for Missing Items** processes all untranslated items one by one.
- **Publish**: tick "I have read and verified the entire translation", then click **Save & Publish**. Only published translations are shown to learners who choose English. **Unpublish** hides a translation again.
- **English UI strings**: search any interface string, edit its translation, and click Save. Clearing a custom translation restores the default text.

## 10. Webhook logs

**Administration → Business → Webhook Logs** records every request sent to the payment webhook, including rejected requests (invalid signature, receiving account mismatch, duplicate transaction). Click **Payload** to see the raw data from SePay. **Mismatched receiving account** means the bank account in the transaction differs from the one in settings: check the Payment section.

## 11. Floating AI assistant

A round button at the bottom right of every page after login (hidden during active tests). Modes: **Language tutor** (for everyone) and **Teaching assistant** (for teachers with an active license and for administrators). All modes share the user's plan quota and the system-wide monthly budget. Cost by mode is shown under Business → AI Costs.

## 12. Teachers

**Administration → Teachers**: each teacher manages their own students and classes; administrators manage teachers.

- **Create teacher account**: username, full name and password (leave blank to generate one). You can grant a license at the same time. The login sheet is shown once, so copy or print it.
- **Per-teacher actions**: view classes and students; grant or renew a license; reset password; lock or unlock the account; transfer classes and students to another teacher.
- **Offboarding a teacher**: first transfer classes and students, then lock or delete the account. The receiving teacher needs enough free license seats; grant more seats first if needed.

## 13. Teacher-managed students

Teachers open **Teacher portal → My Students**.

- **Bulk create**: one student per line in the format `username, Full name, password` (password optional). You can enrol them in a class at the same time.
- For accounts the teacher created: the teacher can reset passwords, lock or unlock accounts, and edit full names. For self-registered accounts: the teacher can only view progress; an administrator resets passwords (**Administration → Students**).
- An active teacher license is required to create student accounts. Enrolling students in a class uses license seats.

## 14. Custom logo

**Administration → General Settings → Logo → Choose Image…** (PNG, JPG or WebP; large images are resized automatically). It takes effect immediately. Under **Logo display mode**, choose "Logo + system name" or "Logo only" (when the image already contains the name), then click **Save Settings**. **Use Default Logo** removes the custom logo. SVG files are rejected for security reasons.
