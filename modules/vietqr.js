// Standard VietQR bank transfer QR code (EMVCo, NAPAS 247) generated directly on the server.
// No external service calls: payload string built in-process, SVG rendered via qrcode-generator (MIT, vendor/).
import { createRequire } from "node:module";
const qrcode = createRequire(import.meta.url)("../vendor/qrcode-generator-1.4.4.cjs");

// BIN codes per State Bank of Vietnam list (sbv.gov.vn, "Bank Identification Numbers").
export const BANKS = [
  ["970436", "Vietcombank"], ["970415", "VietinBank"], ["970418", "BIDV"], ["970405", "Agribank"],
  ["970422", "MB (Quân đội)"], ["970407", "Techcombank"], ["970416", "ACB"], ["970432", "VPBank"],
  ["970423", "TPBank"], ["970403", "Sacombank"], ["970437", "HDBank"], ["970441", "VIB"],
  ["970443", "SHB"], ["970431", "Eximbank"], ["970426", "MSB"], ["970448", "OCB"],
  ["970440", "SeABank"], ["970449", "LPBank (LienVietPostBank)"], ["970428", "Nam A Bank"], ["970409", "Bac A Bank"],
  ["970454", "BVBank (Viet Capital)"], ["970452", "KienlongBank"], ["970412", "PVcomBank"], ["970425", "ABBANK"],
  ["970400", "Saigonbank"], ["970419", "NCB"], ["970427", "VietABank"], ["970433", "VietBank"],
  ["970438", "BaoViet Bank"], ["970429", "SCB"], ["970430", "PG Bank"], ["970406", "DongA Bank"],
  ["970408", "GPBank"], ["970414", "OceanBank"], ["970424", "Shinhan Bank"], ["970458", "UOB Việt Nam"],
  ["970457", "Woori Bank"], ["970439", "Public Bank"], ["970442", "Hong Leong Bank"], ["970410", "Standard Chartered"],
  ["970434", "Indovina Bank"], ["970421", "VRB"], ["970446", "Co-opBank"], ["970459", "CIMB"],
];
export const bankName = (bin) => (BANKS.find((b) => b[0] === bin) || [, bin])[1];

const tlv = (id, v) => id + String(v.length).padStart(2, "0") + v;
export function crc16(s) {
  let crc = 0xffff;
  for (const b of Buffer.from(s, "utf8")) {
    crc ^= b << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
// Transfer memo: ASCII letters, digits, spaces only (banks often strip special characters), max 25 characters.
export const cleanContent = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^A-Za-z0-9 ]/g, "").slice(0, 25);

export function vietqrPayload({ bin, accountNo, amount, content }) {
  const acc = tlv("00", "A000000727") + tlv("01", tlv("00", bin) + tlv("01", accountNo)) + tlv("02", "QRIBFTTA");
  let s = tlv("00", "01") + tlv("01", amount ? "12" : "11") + tlv("38", acc) + tlv("53", "704");
  if (amount) s += tlv("54", String(Math.round(amount)));
  s += tlv("58", "VN");
  if (content) s += tlv("62", tlv("08", cleanContent(content)));
  s += "6304";
  return s + crc16(s);
}

// Returns SVG data URL (compatible with CSP img-src data:)
export function qrDataUrl(text) {
  const q = qrcode(0, "M");
  q.addData(text, "Byte");
  q.make();
  const svg = q.createSvgTag({ cellSize: 6, margin: 4, scalable: true });
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

export function bankQr({ bin, accountNo, amount, content }) {
  if (!/^\d{6}$/.test(String(bin || "")) || !/^[A-Za-z0-9]{1,19}$/.test(String(accountNo || ""))) return "";
  return qrDataUrl(vietqrPayload({ bin, accountNo, amount, content }));
}
