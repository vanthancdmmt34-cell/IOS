// CSP chỉ cho phép đúng gói Rive đang ghim (AUDIT P2-4). Khi nâng phiên bản Rive, test này bắt buộc đổi cả CSP.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rive = fs.readFileSync(path.join(ROOT, 'public', 'js', 'rive-companion.js'), 'utf8');
const server = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const version = /const RIVE_VERSION = "([^"]+)"/.exec(rive)?.[1];

describe('CSP cho runtime Rive', () => {
  it('RIVE_VERSION được ghim cố định (x.y.z)', () => {
    assert.match(version ?? '', /^\d+\.\d+\.\d+$/);
  });

  it('script-src và connect-src chỉ cho đúng tiền tố gói Rive đã ghim', () => {
    const prefix = `https://cdn.jsdelivr.net/npm/@rive-app/canvas@${version}/`;
    const occurrences = server.split(prefix).length - 1;
    assert.ok(occurrences >= 2, `CSP phải chứa ${prefix} trong script-src và connect-src (tìm thấy ${occurrences})`);
  });

  it('CSP không còn cho phép toàn bộ host cdn.jsdelivr.net', () => {
    assert.doesNotMatch(server, /cdn\.jsdelivr\.net(?!\/npm\/@rive-app\/canvas@)/);
  });
});
