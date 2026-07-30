/* Regression tests for the Twenty-Eight Mansions (二十八宿值日) engine.
 * Run: node tests/mansion.test.mjs   (exits non-zero on any failure)
 *
 * The mansion is the traditional day-on-duty (值日) mansion for the birth-place
 * LOCAL civil date, with the Chinese day turning at 子時 (23:00). It is a pure
 * day count — no Moon longitude, no astronomy. */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.document = { addEventListener: () => {}, documentElement: {} };
new Function(readFileSync(join(root, 'i18n.js'), 'utf8'))();
const src = readFileSync(join(root, 'app.js'), 'utf8').replace("document.addEventListener('DOMContentLoaded', init);", '');
const mod = { exports: {} };
new Function('module', 'exports', src + '\nmodule.exports={buildProfile,MANSIONS};')(mod, mod.exports);
const { buildProfile, MANSIONS } = mod.exports;

const mansionOf = (date, time, tz, opts = {}) =>
  MANSIONS[buildProfile(date, time, 'unspecified', { tzOffset: tz, ...opts }).mansionIdx].cn;

const cases = [
  // The verified anchor sample from the brief.
  { date: '2000-03-01', time: '13:30', tz: 8, expect: '虚', why: 'brief sample — must be 虚, not 女' },
  // Same day, any time before 23:00 → same mansion (day-based, time only pins the day).
  { date: '2000-03-01', time: '06:00', tz: 8, expect: '虚', why: 'morning same day' },
  { date: '2000-03-01', time: null,   tz: 8, expect: '虚', why: 'date-only still resolves (low confidence)' },
  // 子時 (23:00) rolls onto the next day's mansion (虚 → 危).
  { date: '2000-03-01', time: '23:30', tz: 8, expect: '危', why: '子時 rolls to next day' },
  { date: '2000-03-02', time: '09:00', tz: 8, expect: '危', why: 'next day is 危' },
  // Rotation advances exactly one mansion per day, in the classical order.
  { date: '2000-03-11', time: '12:00', tz: 8, expect: '参', why: '+10 days advances +10 mansions: 虚(10)→参(20)' },
];

let failed = 0;
for (const c of cases) {
  const got = mansionOf(c.date, c.time, c.tz);
  const ok = got === c.expect;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.date} ${c.time || '(no time)'} UTC+${c.tz} → ${got}宿 (expected ${c.expect}宿) — ${c.why}`);
}

// Confidence must degrade honestly (never fabricated exact) without birth time/zone.
const p1 = buildProfile('2000-03-01', '13:30', 'unspecified', { tzOffset: 8 });
const p2 = buildProfile('2000-03-01', null, 'unspecified', { tzOffset: null });
const confOk = p1.mansionExact === true && p1.mansionConf === 1 && p2.mansionExact === false && p2.mansionConf < 0.6 && p2.mansionResolved === true;
console.log(`${confOk ? 'PASS' : 'FAIL'}  confidence tiers: exact=${p1.mansionConf} low=${p2.mansionConf}`);
if (!confOk) failed++;

console.log(failed ? `\n${failed} test(s) FAILED` : '\nAll mansion tests passed.');
process.exit(failed ? 1 : 0);
