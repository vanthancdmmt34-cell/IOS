/**
 * @file tests/helpers/adversarial-challenger.mjs
 * Empirical Challenger Harness:
 * 1. Rate-Limiter Independence & Blast Radius
 * 2. Adversarial Boundary Fuzzing (Unicode, Vietnamese, Emojis, Injection, Payloads)
 * 3. Concurrent Burst Harness
 * 4. Header & Protocol Edge Cases
 */

import assert from 'node:assert/strict';
import { getTestServer } from './test-server.mjs';

async function run() {
  console.log('--- STARTING ADVERSARIAL CHALLENGER VERIFICATION ---');
  const testServer = await getTestServer();
  let passCount = 0;
  let failCount = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`  ✔ [PASS] ${name}`);
      passCount++;
    } catch (err) {
      console.error(`  ✖ [FAIL] ${name}:`, err.message);
      failCount++;
    }
  }

  // =========================================================================
  // SUITE 1: Rate-Limiter Independence & Isolation
  // =========================================================================
  console.log('\n[Suite 1] Rate-Limiter Independence & IP Isolation Verification');

  await check('T2-B14 IP rate exhaustion does NOT pollute other IPs', async () => {
    const exhaustedIp = '198.51.100.77';
    const cleanIp = '198.51.100.88';

    // 1. Send 30 requests from exhaustedIp
    for (let i = 0; i < 30; i++) {
      const res = await testServer.fetch('/api/demo/run', {
        method: 'POST',
        headers: { 'X-Forwarded-For': exhaustedIp },
        body: { code: 'x = 10' }
      });
      assert.strictEqual(res.status, 200, `Request ${i + 1} from ${exhaustedIp} should succeed`);
    }

    // 2. 31st request from exhaustedIp MUST be blocked with 429
    const blockedRes = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      headers: { 'X-Forwarded-For': exhaustedIp },
      body: { code: 'x = 10' }
    });
    assert.strictEqual(blockedRes.status, 429, `Request 31 from ${exhaustedIp} must be 429`);
    const blockedData = await blockedRes.json();
    assert.match(blockedData.error, /chạy code quá nhanh/i);

    // 3. Request from cleanIp MUST NOT be blocked (must return 200)
    const cleanRes = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      headers: { 'X-Forwarded-For': cleanIp },
      body: { code: 'print("clean ip works")' }
    });
    assert.strictEqual(cleanRes.status, 200, `Request from ${cleanIp} must succeed with 200`);
    const cleanData = await cleanRes.json();
    assert.strictEqual(cleanData.status, 'ok');
    assert.strictEqual(cleanData.output.trim(), 'clean ip works');

    // 4. Request with NO X-Forwarded-For (default socket IP 127.0.0.1) MUST NOT be blocked
    const defaultRes = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: { code: 'print("default socket works")' }
    });
    assert.strictEqual(defaultRes.status, 200, 'Request with default socket IP must succeed');
    const defaultData = await defaultRes.json();
    assert.strictEqual(defaultData.status, 'ok');
    assert.strictEqual(defaultData.output.trim(), 'default socket works');
  });

  await check('X-Forwarded-For with multiple IPs takes the first client IP', async () => {
    const multiIp = '198.51.100.99, 10.0.0.1, 127.0.0.1';
    const res = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      headers: { 'X-Forwarded-For': multiIp },
      body: { code: 'print("multi-xff")' }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.output.trim(), 'multi-xff');
  });

  // =========================================================================
  // SUITE 2: Unicode, Vietnamese Diacritics & Multilingual Fuzzing
  // =========================================================================
  console.log('\n[Suite 2] Unicode & Vietnamese Diacritics Fuzzing');

  await check('Vietnamese accented strings and full vowels run and output correctly', async () => {
    const vietnameseText = 'Xin chào Việt Nam: à á ả ã ạ, ê ế ề ể ễ ệ, ô ố ồ ổ ỗ ộ, ư ứ ừ ử ữ ự, đ Đ!';
    const res = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: { code: `print("${vietnameseText}")` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.output.trim(), vietnameseText);
  });

  await check('Vietnamese comments with mixed newlines (CRLF, LF)', async () => {
    const code = '# Dòng 1: chú thích tiếng Việt\r\nx = "Học lập trình"\n# Dòng 2: tiếp tục chú thích\r\nprint(x)';
    const res = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: { code }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.output.trim(), 'Học lập trình');
  });

  await check('Multilingual script with Japanese, Korean, Chinese, and French', async () => {
    const code = 'print("日本語: おはよう")\nprint("한국어: 안녕하세요")\nprint("中文: 你好")\nprint("Français: Bonjour")';
    const res = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: { code }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.ok(data.output.includes('日本語: おはよう'));
    assert.ok(data.output.includes('한국어: 안녕하세요'));
    assert.ok(data.output.includes('中文: 你好'));
    assert.ok(data.output.includes('Français: Bonjour'));
  });

  await check('Emojis and special Unicode symbols in output', async () => {
    const code = 'print("🚀 🌟 🎓 ✨ MyEvolve Study")';
    const res = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: { code }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.output.trim(), '🚀 🌟 🎓 ✨ MyEvolve Study');
  });

  await check('BOM character (\\uFEFF) handled safely without crash', async () => {
    const code = '\uFEFFprint("with bom")';
    const res = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: { code }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.status === 'ok' || data.status === 'error');
  });

  // =========================================================================
  // SUITE 3: Payload Edge Cases & Type Coercion
  // =========================================================================
  console.log('\n[Suite 3] Payload Edge Cases & Type Coercion');

  await check('Boolean code values (true, false) coerced safely', async () => {
    const resTrue = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: { code: true }
    });
    assert.strictEqual(resTrue.status, 200);

    const resFalse = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: { code: false }
    });
    assert.strictEqual(resFalse.status, 200);
  });

  await check('Array and Object code values coerced safely', async () => {
    const resArr = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: { code: [1, 2, 3] }
    });
    assert.strictEqual(resArr.status, 200);

    const resObj = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: { code: { nested: 'obj' } }
    });
    assert.strictEqual(resObj.status, 200);
  });

  await check('Extra unknown payload fields (injection resistance)', async () => {
    const res = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: {
        code: 'print("sanitized")',
        __proto__: { admin: true },
        isAdmin: true,
        role: 'superadmin',
        command: 'DROP TABLE users'
      }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.output.trim(), 'sanitized');
  });

  await check('Exact boundary at 4999, 5000 and 5001 characters', async () => {
    // 4999 chars
    const code4999 = '#'.repeat(4999);
    const res4999 = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: { code: code4999 }
    });
    assert.strictEqual(res4999.status, 200);

    // 5000 chars (inclusive limit)
    const code5000 = '#'.repeat(5000);
    const res5000 = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: { code: code5000 }
    });
    assert.strictEqual(res5000.status, 200);

    // 5001 chars (exceeded)
    const code5001 = '#'.repeat(5001);
    const res5001 = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: { code: code5001 }
    });
    assert.strictEqual(res5001.status, 400);
    const data5001 = await res5001.json();
    assert.strictEqual(data5001.error, 'Code quá dài.');
  });

  // =========================================================================
  // SUITE 4: Header Variations & HTTP Protocols
  // =========================================================================
  console.log('\n[Suite 4] Header Variations & HTTP Protocols');

  await check('Content-Type variations (charset=utf-8, uppercase)', async () => {
    const res1 = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ code: 'print("header1")' })
    });
    assert.strictEqual(res1.status, 200);

    const res2 = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      headers: { 'Content-Type': 'APPLICATION/JSON' },
      body: JSON.stringify({ code: 'print("header2")' })
    });
    assert.strictEqual(res2.status, 200);
  });

  await check('OPTIONS method on /api/demo/run returns gracefully without crash', async () => {
    const res = await testServer.fetch('/api/demo/run', { method: 'OPTIONS' });
    // Should be safely handled (200, 204, 401, 404, or 405), but never crash the server (500)
    assert.notStrictEqual(res.status, 500);
  });

  // =========================================================================
  // SUITE 5: Concurrent Burst & Rapid-Fire Stress Testing
  // =========================================================================
  console.log('\n[Suite 5] Rapid-Fire & Concurrent Burst Stress Testing');

  await check('Rapid-fire sequence of 20 requests completes with 100% accuracy', async () => {
    for (let i = 0; i < 20; i++) {
      const rapidIp = `203.0.113.${100 + i}`;
      const res = await testServer.fetch('/api/demo/run', {
        method: 'POST',
        headers: { 'X-Forwarded-For': rapidIp },
        body: { code: `print(${i * 3})` }
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.status, 'ok');
      assert.strictEqual(data.output.trim(), String(i * 3));
    }
  });

  await check('Concurrent burst (with IPC pipe-busy resilience) completes cleanly', async () => {
    // Windows Named Pipe concurrency helper (handles OS-level Pipe busy cycling)
    async function pipeFetch(endpoint, opts, retries = 5) {
      for (let r = 0; r < retries; r++) {
        try {
          return await testServer.fetch(endpoint, opts);
        } catch (e) {
          if (e.code === 'ENOENT' && r < retries - 1) {
            await new Promise((res) => setTimeout(res, 25 * (r + 1)));
            continue;
          }
          throw e;
        }
      }
    }

    const count = 10;
    const burstPromises = [];
    for (let i = 0; i < count; i++) {
      const burstIp = `203.0.113.${150 + i}`;
      const targetVal = i * 11;
      burstPromises.push(
        pipeFetch('/api/demo/run', {
          method: 'POST',
          headers: { 'X-Forwarded-For': burstIp },
          body: { code: `print(${targetVal})` }
        }).then(async (res) => {
          assert.strictEqual(res.status, 200, `Burst request ${i} must return 200`);
          const data = await res.json();
          assert.strictEqual(data.status, 'ok');
          assert.strictEqual(data.output.trim(), String(targetVal));
          return true;
        })
      );
    }

    const results = await Promise.all(burstPromises);
    assert.strictEqual(results.length, count);
    assert.ok(results.every((r) => r === true));
  });

  // =========================================================================
  // SUITE 6: Verification of Subsequent Suite Safety (Post-Stress Check)
  // =========================================================================
  console.log('\n[Suite 6] Post-Stress Health Verification');

  await check('Server is healthy and responsive for root page and demo run', async () => {
    const resRoot = await testServer.fetch('/');
    assert.strictEqual(resRoot.status, 200);
    const html = await resRoot.text();
    assert.match(html, /id="demoBox"/);

    const resDemo = await testServer.fetch('/api/demo/run', {
      method: 'POST',
      body: { code: 'print("final health check")' }
    });
    assert.strictEqual(resDemo.status, 200);
    const dataDemo = await resDemo.json();
    assert.strictEqual(dataDemo.output.trim(), 'final health check');
  });

  await testServer.close();

  console.log('\n=========================================================');
  console.log(`TOTAL ADVERSARIAL CHECKS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('=========================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('FATAL ADVERSARIAL CHALLENGER ERROR:', err);
  process.exit(1);
});
