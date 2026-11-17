/**
 * @file tests/e2e-mobile-align.mjs
 * Opaque-box E2E & Visual/DOM Verification Suite for Study v2 Mobile Alignment,
 * Role Drawers, Student Dock Fan-Out Menus, and Admin Mobile Modernization (Tiers 1-4, F1-F14).
 *
 * Usage:
 *   node tests/e2e-mobile-align.mjs [--tier <1|2|3|4|all>] [--shots <dir>] [--infra-check]
 *
 * Workspace Safety:
 *   - Spawns an isolated `node server.js` on a free 127.0.0.1 TCP port with temp DATA_DIR.
 *   - NEVER modifies .env, data/app.db, data/secret.key, or touches port 8090.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TestSuite } from './e2e/assertions.mjs';
import { launchCdpBrowser } from './e2e/cdp.mjs';
import { startE2EServer, removeDirWithRetry } from './e2e/server-seed.mjs';
import { createE2EContext } from './e2e/helpers.mjs';
import { registerAllTiers } from './e2e/tiers.mjs';

function parseArgs(argv) {
  const opts = {
    tier: 'all',
    shotsDir: null,
    keepShots: false,
    infraCheck: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--infra-check') {
      opts.infraCheck = true;
    } else if (a === '--tier' && argv[i + 1]) {
      opts.tier = argv[++i];
    } else if (a.startsWith('--tier=')) {
      opts.tier = a.slice(7);
    } else if (a === '--shots' && argv[i + 1]) {
      opts.shotsDir = path.resolve(argv[++i]);
      opts.keepShots = true;
    } else if (a.startsWith('--shots=')) {
      opts.shotsDir = path.resolve(a.slice(8));
      opts.keepShots = true;
    }
  }
  if (!['all', '1', '2', '3', '4'].includes(String(opts.tier))) {
    throw new Error(`Invalid --tier value "${opts.tier}". Expected 1, 2, 3, 4, or all.`);
  }
  return opts;
}

function printSummary(summary, matrix, { infraCheck, shotsDir, keepShots, capturedCount }) {
  console.log('\n=== E2E Coverage & Execution Summary ===');
  console.log(`Mode: ${infraCheck ? '--infra-check (Core/Harness enforced, M1-M3 pending allowed)' : 'STRICT (100% pass required)'}`);
  console.log(`Registered Matrix: T1=${matrix.counts[1]}, T2=${matrix.counts[2]}, T3=${matrix.counts[3]}, T4=${matrix.counts[4]} (Total=${matrix.counts[1] + matrix.counts[2] + matrix.counts[3] + matrix.counts[4]})`);
  console.log(`Executed: ${summary.total} | PASS: ${summary.pass} | PENDING: ${summary.pending} | FAIL: ${summary.fail} | HARNESS_ERR: ${summary.harnessErrors}`);
  if (summary.knownAppExceptions > 0) {
    console.log(`[APP DEFECT ESCALATED] Suppressed ${summary.knownAppExceptions} pre-existing lang-switch.js SyntaxError(s) in --infra-check mode (strict mode still fails on them).`);
  }
  console.log('By Tier:');
  for (const t of [1, 2, 3, 4]) {
    const r = summary.byTier[t];
    if (r.total > 0) {
      console.log(`  Tier ${t}: total=${r.total} pass=${r.pass} pending=${r.pending} fail=${r.fail}`);
    }
  }
  console.log('By Milestone:');
  for (const m of ['Core', 'M1', 'M2', 'M3']) {
    const r = summary.byMilestone[m];
    if (r.total > 0) {
      console.log(`  ${m.padEnd(4)}: total=${r.total} pass=${r.pass} pending=${r.pending} fail=${r.fail}`);
    }
  }
  console.log(`Screenshots captured: ${capturedCount}${keepShots ? ` -> ${shotsDir}` : ' (temp dir cleaned on exit)'}`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const shotsDir = opts.shotsDir || fs.mkdtempSync(path.join(os.tmpdir(), 'study-e2e-shots-'));
  fs.mkdirSync(shotsDir, { recursive: true });

  let srv = null;
  let cdp = null;
  let cleaning = false;

  const cleanup = async () => {
    if (cleaning) return;
    cleaning = true;
    if (cdp) {
      await cdp.close().catch(() => {});
      cdp = null;
    }
    if (srv) {
      await srv.stop().catch((err) => {
        console.error('Cleanup error:', err.message);
      });
      srv = null;
    }
    if (!opts.keepShots) {
      await removeDirWithRetry(shotsDir).catch(() => {});
    }
  };

  const onSig = () => {
    cleanup().finally(() => process.exit(130));
  };
  process.once('SIGINT', onSig);
  process.once('SIGTERM', onSig);

  try {
    console.log('[E2E] Starting isolated ephemeral server & seeding temp DB...');
    srv = await startE2EServer();
    console.log(`[E2E] Ephemeral server ready at ${srv.baseUrl} (DATA_DIR=${srv.tmpDataDir})`);

    console.log('[E2E] Launching headless Chromium via CDP pipe...');
    cdp = await launchCdpBrowser(srv.tmpChromeDir);

    const suite = new TestSuite();
    const ctx = createE2EContext({ cdp, srv, shotsDir });
    registerAllTiers(suite, ctx);

    const matrix = suite.verifyCoverageMatrix();
    console.log(`[E2E] Matrix verified: T1=${matrix.counts[1]}, T2=${matrix.counts[2]}, T3=${matrix.counts[3]}, T4=${matrix.counts[4]}`);

    const summary = await suite.run({
      tierFilter: opts.tier,
      infraCheck: opts.infraCheck,
      cdp,
    });

    printSummary(summary, matrix, {
      infraCheck: opts.infraCheck,
      shotsDir,
      keepShots: opts.keepShots,
      capturedCount: ctx.capturedShots.length,
    });

    if (!summary.ok) {
      process.exitCode = 1;
    }
  } finally {
    process.removeListener('SIGINT', onSig);
    process.removeListener('SIGTERM', onSig);
    await cleanup();
  }
}

main().catch((err) => {
  console.error('[E2E FATAL]', err);
  process.exit(1);
});
