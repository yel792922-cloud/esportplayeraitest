/* Regression + external-compatibility suite for the 宿曜経 (Sukuyō) 本命星宿 engine.
 * Run: node tests/mansion.test.mjs   (exits non-zero on any failure)
 *
 * Three layers of validation:
 *   1. Reference-implementation parity — every date in shukuyo_reference.json,
 *      generated from the public 宿曜経 implementation (ryutabi/shin_astrology),
 *      computed at the UTC+8 (Chinese 农历 / 爱占星) meridian.
 *   2. 爱占星 anchor — 2000-03-01 → 虚宿.
 *   3. Independently-documented celebrity 本命宿 — from third-party 宿曜 sites,
 *      computed at the birth-place meridian (JST for Japanese context).
 * The engine is compared to EXTERNAL references, not to itself. */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.document = { addEventListener: () => {}, documentElement: {} };
new Function(readFileSync(join(root, 'i18n.js'), 'utf8'))();
new Function(readFileSync(join(root, 'lunar.js'), 'utf8'))();
const src = readFileSync(join(root, 'app.js'), 'utf8').replace("document.addEventListener('DOMContentLoaded', init);", '');
const mod = { exports: {} };
new Function('module', 'exports', src + '\nmodule.exports={buildProfile,MANSIONS,MANSION_CHAR_TO_IDX};')(mod, mod.exports);
const { buildProfile, MANSIONS, MANSION_CHAR_TO_IDX } = mod.exports;

// Glyph-agnostic: compare by mansion INDEX (the engine's char→index map already
// unifies traditional 宿曜経 glyphs with the simplified display glyphs).
const idxOf = (ch) => (ch in MANSION_CHAR_TO_IDX ? MANSION_CHAR_TO_IDX[ch] : -1);
const profileIdx = (y, m, d, tz, opts = {}) =>
  buildProfile(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`,
    opts.time || '', 'u', { tzOffset: tz, ...opts }).mansionIdx;
const mansion = (y, m, d, tz, opts = {}) => MANSIONS[profileIdx(y, m, d, tz, opts)].cn;
const matches = (y, m, d, tz, expChar, opts = {}) => profileIdx(y, m, d, tz, opts) === idxOf(expChar);

let failed = 0, passed = 0;
const check = (ok, label) => { if (ok) passed++; else { failed++; console.log('FAIL  ' + label); } };

// ---- 1. Reference-implementation parity (UTC+8) ----
const ref = JSON.parse(readFileSync(join(root, 'tests/shukuyo_reference.json'), 'utf8'));
let leapCount = 0;
for (const r of ref) {
  const p = buildProfile(`${r.y}-${String(r.m).padStart(2,'0')}-${String(r.d).padStart(2,'0')}`, '', 'u', { tzOffset: 8 });
  if (r.leap) leapCount++;
  check(p.mansionIdx === idxOf(r.mansion) && p.lunarMonth === r.lunarMonth
        && p.lunarDay === r.lunarDay && !!p.lunarLeap === !!r.leap,
    `ref ${r.y}-${r.m}-${r.d} expect ${r.mansion} (农历${r.lunarMonth}/${r.lunarDay}${r.leap?'闰':''})`);
}
console.log(`Reference parity: ${passed} passed (${leapCount} leap-month cases) / ${ref.length}`);

// ---- 2. 爱占星 anchor (CST / UTC+8) ----
check(matches(2000, 3, 1, 8, '虚', { time: '13:30' }), '爱占星 2000-03-01 13:30 UTC+8 → 虚');

// ---- 3. Independently-documented celebrity 本命宿 (JST unless noted) ----
const celebs = [
  ['宮藤官九郎', 1970, 7, 19, 9, '虚'],
  ['木村拓哉',   1972, 11, 13, 9, '室'],
  ['稲垣吾郎',   1973, 12, 8, 9, '井'],
  ['中谷美紀',   1976, 1, 12, 9, '井'],
  ['岡本太郎',   1911, 2, 26, 9, '室'],
  ['吉井和哉',   1966, 10, 8, 9, '星'],
  ['羽鳥慎一',   1971, 3, 24, 9, '奎'],
  ['ポール・マッカートニー', 1942, 6, 18, 9, '星'],
  ['ロバート・デ・ニーロ',   1943, 8, 17, 9, '奎'],
  ['木梨憲武',   1962, 3, 9, 9, '昴'],
  ['田村淳',     1973, 12, 4, 9, '昴'],
  ['坂本真綾',   1980, 3, 31, 9, '角'],
  ['1983 anchor', 1983, 2, 11, 8, '危'],   // ryutabi documented sample (CST)
];
for (const [name, y, m, d, tz, exp] of celebs) {
  check(matches(y, m, d, tz, exp), `${name} ${y}-${m}-${d} (UTC+${tz}) → ${exp} (got ${mansion(y, m, d, tz)})`);
}

// ---- 4. 夜子時 boundary (off by default; on rolls to next day) ----
check(mansion(2000, 2, 29, 8, { time: '23:30' }) !== mansion(2000, 2, 29, 8, { time: '23:30', yeziEnabled: true }),
  '夜子時 toggle changes the day near 23:00');
check(mansion(2000, 2, 29, 8, { time: '23:30', yeziEnabled: true }) === mansion(2000, 3, 1, 8),
  '夜子時-on 2000-02-29 23:30 == 2000-03-01');

console.log(`\nTotal: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
