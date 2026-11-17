/**
 * @file tests/e2e/tiers.mjs
 * Aggregated registration of Tiers 1-4 across features F1-F14.
 */

import { registerTier1 } from './tier1.mjs';
import { registerTier2 } from './tier2.mjs';
import { registerTier3 } from './tier3.mjs';
import { registerTier4 } from './tier4.mjs';

export { registerTier1, registerTier2, registerTier3, registerTier4 };

export function registerAllTiers(suite, ctx) {
  registerTier1(suite, ctx);
  registerTier2(suite, ctx);
  registerTier3(suite, ctx);
  registerTier4(suite, ctx);
}
