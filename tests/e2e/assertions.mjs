/**
 * @file tests/e2e/assertions.mjs
 * Test registry, execution engine, milestone-aware reporting (--infra-check vs full pass),
 * and coverage matrix verification (N = 14 features F1..F14 across Tiers 1-4).
 */

import assert from 'node:assert/strict';

export class TestSuite {
  constructor() {
    this.cases = [];
    this.results = [];
  }

  test(meta, fn) {
    const { id, tier, feature, milestone, name } = meta || {};
    if (!id || !tier || !feature || !milestone || !name) {
      throw new Error(`Invalid test metadata: ${JSON.stringify(meta)}`);
    }
    this.cases.push({ id, tier, feature, milestone, name, fn });
  }

  async run({ tierFilter = 'all', infraCheck = false, cdp = null } = {}) {
    const selected = this.cases.filter((tc) => {
      if (tierFilter === 'all') return true;
      return String(tc.tier) === String(tierFilter);
    });

    this.results = [];
    this.knownAppExceptions = [];
    for (const tc of selected) {
      const start = Date.now();
      const exBefore = cdp ? cdp.runtimeExceptions.length : 0;
      const err5xxBefore = cdp ? cdp.http5xx.length : 0;
      let status = 'PASS';
      let errorMsg = '';
      let isHarnessError = false;

      try {
        await tc.fn();
        if (cdp) {
          const rawEx = cdp.runtimeExceptions.slice(exBefore);
          const knownEx = infraCheck
            ? rawEx.filter((e) => /\/js\/lang-switch(?:\.min)?\.js/i.test(e.url || '') && /Cannot use import statement outside a module/i.test(e.message || ''))
            : [];
          if (knownEx.length > 0) {
            this.knownAppExceptions.push(...knownEx);
          }
          const newEx = infraCheck
            ? rawEx.filter((e) => !knownEx.includes(e))
            : rawEx;
          const new5xx = cdp.http5xx.slice(err5xxBefore);
          if (newEx.length > 0) {
            isHarnessError = true;
            status = 'FAIL';
            errorMsg = `Uncaught browser Runtime.exceptionThrown: ${newEx.map((e) => `${e.message} (${e.url || 'inline'})`).join(' | ')}`;
          } else if (new5xx.length > 0) {
            isHarnessError = true;
            status = 'FAIL';
            errorMsg = `Unexpected HTTP 5xx response: ${new5xx.map((e) => `${e.status} ${e.url}`).join(' | ')}`;
          }
        }
      } catch (err) {
        const isAssertion = err instanceof assert.AssertionError || err?.name === 'AssertionError';
        errorMsg = err?.message || String(err);
        if (!isAssertion) {
          isHarnessError = true;
          status = 'HARNESS_ERR';
        } else if (infraCheck && tc.milestone !== 'Core') {
          status = 'PENDING';
        } else {
          status = 'FAIL';
        }
      }

      const ms = Date.now() - start;
      const rec = { ...tc, status, ms, errorMsg, isHarnessError };
      this.results.push(rec);

      const tag = `[T${tc.tier}|${tc.feature}|${tc.milestone}]`;
      const icon = status === 'PASS' ? 'PASS' : status === 'PENDING' ? 'PEND' : 'FAIL';
      console.log(`  ${icon.padEnd(4)} ${tc.id.padEnd(11)} ${tag.padEnd(18)} ${tc.name} (${ms}ms)`);
      if (status !== 'PASS' && errorMsg) {
        console.log(`       -> ${errorMsg.split('\n')[0]}`);
      }
    }

    return this.summarize({ infraCheck });
  }

  summarize({ infraCheck = false } = {}) {
    const byTier = { 1: { pass: 0, fail: 0, pending: 0, total: 0 }, 2: { pass: 0, fail: 0, pending: 0, total: 0 }, 3: { pass: 0, fail: 0, pending: 0, total: 0 }, 4: { pass: 0, fail: 0, pending: 0, total: 0 } };
    const byMilestone = { Core: { pass: 0, fail: 0, pending: 0, total: 0 }, M1: { pass: 0, fail: 0, pending: 0, total: 0 }, M2: { pass: 0, fail: 0, pending: 0, total: 0 }, M3: { pass: 0, fail: 0, pending: 0, total: 0 } };
    const byFeature = {};

    let pass = 0;
    let fail = 0;
    let pending = 0;
    let harnessErrors = 0;

    for (const r of this.results) {
      if (r.isHarnessError) harnessErrors++;
      if (r.status === 'PASS') pass++;
      else if (r.status === 'PENDING') pending++;
      else fail++;

      const t = byTier[r.tier];
      if (t) {
        t.total++;
        if (r.status === 'PASS') t.pass++;
        else if (r.status === 'PENDING') t.pending++;
        else t.fail++;
      }

      const m = byMilestone[r.milestone];
      if (m) {
        m.total++;
        if (r.status === 'PASS') m.pass++;
        else if (r.status === 'PENDING') m.pending++;
        else m.fail++;
      }

      const f = byFeature[r.feature] || (byFeature[r.feature] = { t1: 0, t2: 0, t3: 0, t4: 0, pass: 0, fail: 0, pending: 0 });
      f[`t${r.tier}`]++;
      if (r.status === 'PASS') f.pass++;
      else if (r.status === 'PENDING') f.pending++;
      else f.fail++;
    }

    const ok = infraCheck
      ? (fail === 0 && harnessErrors === 0 && byMilestone.Core.fail === 0)
      : (fail === 0 && pending === 0 && harnessErrors === 0);

    return {
      ok,
      total: this.results.length,
      pass,
      fail,
      pending,
      harnessErrors,
      knownAppExceptions: this.knownAppExceptions.length,
      byTier,
      byMilestone,
      byFeature,
    };
  }

  verifyCoverageMatrix() {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const perFeature = {};
    for (let i = 1; i <= 14; i++) {
      perFeature[`F${i}`] = { 1: 0, 2: 0, 3: 0, 4: 0 };
    }
    for (const tc of this.cases) {
      counts[tc.tier] = (counts[tc.tier] || 0) + 1;
      if (perFeature[tc.feature]) {
        perFeature[tc.feature][tc.tier] = (perFeature[tc.feature][tc.tier] || 0) + 1;
      }
    }
    assert.ok(counts[1] >= 70, `Tier 1 must have >= 70 tests (got ${counts[1]})`);
    assert.ok(counts[2] >= 70, `Tier 2 must have >= 70 tests (got ${counts[2]})`);
    assert.ok(counts[3] >= 14, `Tier 3 must have >= 14 tests (got ${counts[3]})`);
    assert.ok(counts[4] >= 7, `Tier 4 must have >= 7 tests (got ${counts[4]})`);
    for (let i = 1; i <= 14; i++) {
      const f = `F${i}`;
      assert.ok(perFeature[f][1] >= 5, `Feature ${f} must have >= 5 Tier 1 tests (got ${perFeature[f][1]})`);
      assert.ok(perFeature[f][2] >= 5, `Feature ${f} must have >= 5 Tier 2 tests (got ${perFeature[f][2]})`);
    }
    return { counts, perFeature };
  }
}
