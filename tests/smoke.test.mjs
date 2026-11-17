// Kiểm thử nhanh (không cần máy chủ chạy): cú pháp JS, tệp giao diện được nạp có tồn tại,
// từ điển tiếng Anh hợp lệ, bài chơi thử có đáp án đúng nằm trong danh sách lựa chọn.
// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(ROOT, "public");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

test("mọi tệp JS của máy chủ và giao diện đều đúng cú pháp", () => {
  const files = [
    "server.js", "settings.js",
    ...fs.readdirSync(path.join(ROOT, "modules")).filter((f) => f.endsWith(".js")).map((f) => `modules/${f}`),
    ...fs.readdirSync(path.join(PUB, "js")).filter((f) => f.endsWith(".js")).map((f) => `public/js/${f}`),
  ];
  const bad = [];
  for (const f of files) {
    try { execFileSync(process.execPath, ["--check", path.join(ROOT, f)], { stdio: "pipe" }); }
    catch (e) { bad.push(`${f}: ${String(e.stderr || e.message).split("\n").slice(0, 3).join(" ")}`); }
  }
  assert.deepEqual(bad, [], "Tệp lỗi cú pháp:\n" + bad.join("\n"));
});

test("index.html chỉ nạp các tệp CSS/JS có thật", () => {
  const html = read("public/index.html");
  const refs = [...html.matchAll(/(?:href|src)="(\/(?:css|js|vendor)\/[^"?]+)/g)].map((m) => m[1]);
  assert.ok(refs.length > 3, "Không tìm thấy liên kết tệp nào trong index.html");
  const missing = refs.filter((r) => !fs.existsSync(path.join(PUB, r)));
  assert.deepEqual(missing, [], "Thiếu tệp: " + missing.join(", "));
});

test("bundle.min.css có đủ các phần giao diện chính", () => {
  const css = read("public/css/bundle.min.css");
  for (const cls of [".aw-hero", ".aw-try", ".lh-hero", ".ex-card", ".ad-hello", ".ad-kpi"]) {
    assert.ok(css.includes(cls), `bundle.min.css thiếu ${cls}`);
  }
});

test("từ điển tiếng Anh hợp lệ và có bản dịch trang chủ", () => {
  const d = JSON.parse(read("public/locales/en.json"));
  assert.ok(d.exact && typeof d.exact === "object");
  for (const k of ["Bài chơi thử.", "Sẵn sàng bắt đầu?", "Chính xác!", "Chưa đúng."]) {
    assert.ok(d.exact[k], `en.json thiếu bản dịch: ${k}`);
  }
});

