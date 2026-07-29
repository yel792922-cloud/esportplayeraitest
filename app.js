/* =====================================================================
 * Esports Destiny Match — app.js
 * A static, front-end-only fortune-style matcher.
 *
 * Pipeline:
 *   birth info  ->  compact archetype profile (stem/element + branch + mansion)
 *   archetype + selected games  ->  deterministic score per player
 *   sorted players  ->  top 10 with percentages + one-line reasons
 *
 * The local engine ALWAYS produces the ranking and the numbers.
 * OpenAI (optional) is only ever used to polish wording, never to rank.
 * Everything here is deterministic — the same inputs give the same result.
 * ===================================================================== */

'use strict';

/* ---------------------------------------------------------------------
 * 0. East Asian metaphysics reference tables (entertainment layer)
 * ------------------------------------------------------------------- */

// Ten Heavenly Stems 天干
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// Human-readable archetype label per stem, e.g. 甲木人
const STEM_ARCHETYPE = ['甲木人', '乙木人', '丙火人', '丁火人', '戊土人', '己土人', '庚金人', '辛金人', '壬水人', '癸水人'];
// Element per stem index: 0=Wood,1=Fire,2=Earth,3=Metal,4=Water
const STEM_ELEMENT = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
// Yang (阳) stems = even index, Yin (阴) = odd index
const STEM_YIN = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1]; // 1 = yin

const ELEMENTS = [
  { key: 'wood',  cn: '木', en: 'Wood',  emoji: '🌿', color: '#3ee08a' },
  { key: 'fire',  cn: '火', en: 'Fire',  emoji: '🔥', color: '#ff6a4d' },
  { key: 'earth', cn: '土', en: 'Earth', emoji: '⛰️', color: '#d8a24a' },
  { key: 'metal', cn: '金', en: 'Metal', emoji: '⚔️', color: '#cfd6e6' },
  { key: 'water', cn: '水', en: 'Water', emoji: '🌊', color: '#4aa8ff' }
];

// Twelve Earthly Branches 地支
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 28 Lunar Mansions 二十八宿 grouped into four palaces (7 each)
const MANSIONS = [
  // East — Azure Dragon 东方青龙
  { cn: '角', palace: '青龙', dir: 'East' }, { cn: '亢', palace: '青龙', dir: 'East' },
  { cn: '氐', palace: '青龙', dir: 'East' }, { cn: '房', palace: '青龙', dir: 'East' },
  { cn: '心', palace: '青龙', dir: 'East' }, { cn: '尾', palace: '青龙', dir: 'East' },
  { cn: '箕', palace: '青龙', dir: 'East' },
  // North — Black Tortoise 北方玄武
  { cn: '斗', palace: '玄武', dir: 'North' }, { cn: '牛', palace: '玄武', dir: 'North' },
  { cn: '女', palace: '玄武', dir: 'North' }, { cn: '虚', palace: '玄武', dir: 'North' },
  { cn: '危', palace: '玄武', dir: 'North' }, { cn: '室', palace: '玄武', dir: 'North' },
  { cn: '壁', palace: '玄武', dir: 'North' },
  // West — White Tiger 西方白虎
  { cn: '奎', palace: '白虎', dir: 'West' }, { cn: '娄', palace: '白虎', dir: 'West' },
  { cn: '胃', palace: '白虎', dir: 'West' }, { cn: '昴', palace: '白虎', dir: 'West' },
  { cn: '毕', palace: '白虎', dir: 'West' }, { cn: '觜', palace: '白虎', dir: 'West' },
  { cn: '参', palace: '白虎', dir: 'West' },
  // South — Vermilion Bird 南方朱雀
  { cn: '井', palace: '朱雀', dir: 'South' }, { cn: '鬼', palace: '朱雀', dir: 'South' },
  { cn: '柳', palace: '朱雀', dir: 'South' }, { cn: '星', palace: '朱雀', dir: 'South' },
  { cn: '张', palace: '朱雀', dir: 'South' }, { cn: '翼', palace: '朱雀', dir: 'South' },
  { cn: '轸', palace: '朱雀', dir: 'South' }
];

// A short flavor line per mansion (kept light and mystical, not academic)
const MANSION_FLAVOR = {
  '角': 'a first-light spark that opens new campaigns',
  '亢': 'a proud, front-facing energy that leads charges',
  '氐': 'a grounded root that holds a formation together',
  '房': 'an open-door instinct for reading the map',
  '心': 'a burning core that thrives under pressure',
  '尾': 'a patient tail that closes games out',
  '箕': 'a scattering wind that stirs momentum',
  '斗': 'a measuring star that weighs every play',
  '牛': 'a steady ox-strength that never tilts',
  '女': 'a quiet precision that punishes mistakes',
  '虚': 'an empty-calm focus in the eye of the storm',
  '危': 'a high-wire boldness that dances on the edge',
  '室': 'a fortress mind that builds the win',
  '壁': 'a wall of composure that anchors the team',
  '奎': 'a striding energy that covers the whole map',
  '娄': 'a gathering pull that rallies teammates',
  '胃': 'a hungry appetite for tempo and farm',
  '昴': 'a clustered brilliance that shines in fights',
  '毕': 'a net-caster who traps the enemy just right',
  '觜': 'a sharp beak of pinpoint aggression',
  '参': 'a three-star strike of raw mechanical power',
  '井': 'a deep well of resourceful comebacks',
  '鬼': 'a hidden-lane cunning that ambushes',
  '柳': 'a willow flexibility that bends and wins',
  '星': 'a lone-star shine built for the highlight reel',
  '张': 'an expanding presence that snowballs leads',
  '翼': 'a soaring pace that flies across lanes',
  '轸': 'a closing chariot that seals the victory'
};

// Ten-God relationship label (relative to the user's day master element)
const TEN_GOD_CN = {
  companion: '比劫',
  output: '食伤',
  resource: '印绶',
  wealth: '财星',
  authority: '官杀'
};
const TEN_GOD_DESC = {
  companion: 'kindred spirits who share your rhythm',
  output: 'expressive talents who channel your creative fire',
  resource: 'nourishing minds who steady and inspire you',
  wealth: 'rewarding rivals you love to chase and conquer',
  authority: 'commanding forces that sharpen your edge'
};

// Element cycles 五行生克
const generates = (e) => (e + 1) % 5; // 生 : Wood->Fire->Earth->Metal->Water
const controls  = (e) => (e + 2) % 5; // 克 : Wood->Earth->Water->Fire->Metal

// Element carried by each Earthly Branch 地支五行 (子水 丑土 寅木 卯木 辰土 巳火 …)
const BRANCH_ELEMENT = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

// Chinese zodiac animals indexed by Earthly Branch (子=Rat …)
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const ZODIAC_EN = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];

// Heavenly-Stem five combinations 天干五合 (甲己 乙庚 丙辛 丁壬 戊癸)
const STEM_COMBINE = { 0: 5, 5: 0, 1: 6, 6: 1, 2: 7, 7: 2, 3: 8, 8: 3, 4: 9, 9: 4 };

// Earthly-Branch relationship sets (index into BRANCHES)
const SIX_HARMONY = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 }; // 六合
const TRINE_GROUPS = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];                                  // 三合
const SIX_HARM = { 0: 7, 7: 0, 1: 6, 6: 1, 2: 5, 5: 2, 3: 4, 4: 3, 8: 11, 11: 8, 9: 10, 10: 9 };       // 相害
const SIX_DESTROY = { 0: 9, 9: 0, 6: 3, 3: 6, 5: 8, 8: 5, 2: 11, 11: 2, 4: 1, 1: 4, 10: 7, 7: 10 };    // 相破
// 相刑 punishments: 无恩(寅巳申) 恃势(丑戌未) 无礼(子卯) 自刑(辰午酉亥)
const PUNISH_GROUPS = [[2, 5, 8], [1, 10, 7]];
const PUNISH_PAIRS = { 0: 3, 3: 0 };
const SELF_PUNISH = new Set([4, 6, 9, 11]);

const clamp01 = (x) => Math.max(0, Math.min(1, x));

/* ---------------------------------------------------------------------
 * 0b. Twenty-Eight Mansions 二十八宿 — TRADITIONAL 月宿 almanac layer
 *
 * A Chinese-almanac-style layer: the mansion is the one the Moon *lodges in*
 * (月宿 / 月离二十八宿) at the birth moment. It is read with a traditional
 * mean-motion + 迟疾 (equation-of-centre) lunar rule and divided by the classical
 * 距度 widths of the 28 mansions, anchored to a traditional reference almanac
 * (calibrated so 2005-06-01 19:30 → 娄宿 and 2005-08-01 06:30 → 井宿). It is NOT a
 * modern observatory reduction and NOT a fixed calendar-day bucket. It is
 * computed entirely separately from the day pillar, Five Elements and Zodiac —
 * a symbolic resonance layer, never a correction to the others. The birth moment
 * is birth-PLACE local civil time; when time or time zone is incomplete the
 * mansion is marked low-confidence or unresolved (never faked exact).
 * ------------------------------------------------------------------- */

// Classic determinative-star widths 距度 of the 28 mansions (角..轸), in the
// 365.25-degree system; normalized below to a 360 ecliptic. Order matches MANSIONS.
const XIU_WIDTHS = [
  12, 9, 15, 5, 5, 18, 11.25,      // 角亢氐房心尾箕 (East)
  26.25, 8, 12, 10, 17, 16, 9,     // 斗牛女虚危室壁 (North)
  16, 12, 14, 11, 16, 2, 9,        // 奎娄胃昴毕觜参 (West)
  33, 4, 15, 7, 18, 18, 17         // 井鬼柳星张翼轸 (South)
];
const XIU_BOUND = (() => {
  const total = XIU_WIDTHS.reduce((a, b) => a + b, 0);
  let acc = 0; const b = [0];
  for (const w of XIU_WIDTHS) { acc += w; b.push(acc * 360 / total); }
  return b; // length 29, b[28] === 360
})();

// True Julian Day for a moment (UT hours). Independent of the day-pillar math.
function julianDay(y, m, d, hourUT) {
  let Y = y, M = m;
  if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5 + hourUT / 24;
}

// Anchor of the mansion sequence (deg), calibrated to a traditional reference
// almanac (NOT a star such as Spica) so 2005-06-01 19:30 (UTC+8) lodges in 娄宿
// and 2005-08-01 06:30 in 井宿.
const MANSION_ANCHOR = 173.685;

// Traditional 月离 longitude of the Moon (degrees): mean motion (平行) plus the
// primary 迟疾 term (equation of centre) — the classical two-part lunar rule used
// by the old almanacs, not a modern multi-term reduction. This is precise enough
// to place the Moon among the ~13-degree-wide mansions.
function lunarLodgeLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  const norm = (x) => ((x % 360) + 360) % 360;
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T; // mean longitude 平行
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;  // mean anomaly
  return norm(Lp + 6.289 * Math.sin(norm(Mp) * Math.PI / 180));      // + 迟疾 correction
}

// Map a 月离 longitude to one of the 28 mansions by the classical 距度 widths.
function mansionByWidth(lon) {
  const rel = (((lon - MANSION_ANCHOR) % 360) + 360) % 360;
  for (let i = 0; i < 28; i++) {
    if (rel >= XIU_BOUND[i] && rel < XIU_BOUND[i + 1]) {
      return { idx: i, edge: Math.min(rel - XIU_BOUND[i], XIU_BOUND[i + 1] - rel) };
    }
  }
  return { idx: 27, edge: 0 };
}

// Default metaphysical time zone when the birth place is not given: UTC+8
// (Beijing Time), the standard baseline for Mainland-China BaZi practice.
const DEFAULT_TZ_OFFSET = 8;

function dayOfYear(y, m, d) {
  return Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000) + 1;
}

// Equation of Time (minutes -> hours) — the mean-vs-apparent-solar offset used
// by the optional true-solar-time refinement of the birth hour (时辰).
function equationOfTimeHours(y, m, d) {
  const B = 2 * Math.PI * (dayOfYear(y, m, d) - 81) / 364;
  return (9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B)) / 60;
}

// The traditional 月宿 (mansion the Moon lodges in). USER-FACING rule: the birth
// hour is birth-PLACE local civil time; internally we convert to UTC only as a
// calculation step for the lunar rule. Confidence degrades honestly when the
// birth time or birth-place time zone is missing — it never pretends exact.
//   ctx: { localHour (fractional)|null, tzOffset (hours)|null, approx, playerBaseline, baselineConf }
function computeMansion(y, m, d, ctx) {
  const hasTime = typeof ctx.localHour === 'number' && !Number.isNaN(ctx.localHour);
  const tzKnown = typeof ctx.tzOffset === 'number' && !Number.isNaN(ctx.tzOffset);

  // Local basis hour: real birth time; else noon (only for approximate mode or
  // the date-only player baseline); otherwise it is left unresolved.
  const resolved = hasTime || !!ctx.approx || !!ctx.playerBaseline;
  const basisHour = hasTime ? ctx.localHour : 12;

  // Birth-place local civil time -> UTC (internal calculation step only).
  const effTz = tzKnown ? ctx.tzOffset : DEFAULT_TZ_OFFSET;
  const lodgeLon = lunarLodgeLongitude(julianDay(y, m, d, basisHour - effTz));
  const sec = mansionByWidth(lodgeLon);

  let confidence;
  if (ctx.playerBaseline) {
    confidence = clamp01(ctx.baselineConf ?? 0.7); // date-only reference baseline
  } else if (!resolved) {
    confidence = 0;                                 // unresolved — no time, no approx mode
  } else {
    // Uncertainty window (deg of lunar motion): tight with time+zone, wide otherwise.
    const win = hasTime ? (tzKnown ? 1.0 : 8.0) : (tzKnown ? 6.6 : 9.0);
    confidence = clamp01(sec.edge / win);
  }

  return { idx: sec.idx, lodgeLon, confidence, resolved, hasTime, tzKnown, approx: !!ctx.approx, exact: hasTime && tzKnown };
}

/* ---------------------------------------------------------------------
 * 1. Calendar math -> day pillar & mansion (deterministic)
 * ------------------------------------------------------------------- */

// Julian Day Number at midnight for a Gregorian date.
function julianDayNumber(year, month, day) {
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
}

// Sexagenary day index (0..59), 0 == 甲子. Anchor chosen so the cycle is stable.
function daySexagenary(y, m, d) {
  const jdn = julianDayNumber(y, m, d);
  return { sx: ((jdn + 49) % 60 + 60) % 60, jdn };
}

// Approximate solar-month branch from (month, day) using fixed 节气 cut-offs.
// Lightweight and entertainment-grade — not ephemeris-accurate.
function solarMonthBranch(m, d) {
  const B = [[1, 6, 1], [2, 4, 2], [3, 6, 3], [4, 5, 4], [5, 6, 5], [6, 6, 6],
             [7, 7, 7], [8, 8, 8], [9, 8, 9], [10, 8, 10], [11, 7, 11], [12, 7, 0]];
  let bi = 0; // before Jan 6 -> 子 month (which began the previous Dec 7)
  for (const [bm, bd, idx] of B) if (m > bm || (m === bm && d >= bd)) bi = idx;
  return bi;
}

// Full six-character BaZi chart (Year + Month + Day pillars) plus zodiac,
// lunar mansion, and an optional hour pillar. Li Chun (~Feb 4) is the year
// boundary; the month stem follows 五虎遁, the hour stem 五鼠遁.
function computeChart(y, m, d, ctx) {
  const { sx, jdn } = daySexagenary(y, m, d);
  const dStem = sx % 10, dBranch = sx % 12;

  // Year pillar with Li Chun boundary.
  const yBazi = (m < 2 || (m === 2 && d < 4)) ? y - 1 : y;
  const yStem = ((yBazi - 4) % 10 + 10) % 10;
  const yBranch = ((yBazi - 4) % 12 + 12) % 12;

  // Month pillar: branch from the solar term, stem from 五虎遁 (Five Tigers).
  const mBranch = solarMonthBranch(m, d);
  const tigerStart = [2, 4, 6, 8, 0][yStem % 5];        // 寅月 stem for this year stem
  const mStem = (tigerStart + ((mBranch - 2) % 12 + 12) % 12) % 10;

  // Five-element distribution across the six visible characters.
  const dist = [0, 0, 0, 0, 0];
  [yStem, mStem, dStem].forEach(s => dist[STEM_ELEMENT[s]]++);
  [yBranch, mBranch, dBranch].forEach(b => dist[BRANCH_ELEMENT[b]]++);

  // Twenty-Eight Mansions — from the Moon's position, a fully separate layer.
  const mansion = computeMansion(y, m, d, ctx);

  // Hour pillar (时辰) from birth-PLACE local civil time. When the optional
  // true-solar-time mode is on, refine that local clock by the Equation of Time.
  let hourBranchIdx = null, hourStemIdx = null;
  const hasTime = typeof ctx.localHour === 'number' && !Number.isNaN(ctx.localHour);
  if (hasTime) {
    let solarHour = ctx.localHour + (ctx.trueSolar ? equationOfTimeHours(y, m, d) : 0);
    solarHour = ((solarHour % 24) + 24) % 24;
    hourBranchIdx = Math.floor(((solarHour + 1) % 24) / 2);  // 23:00-01:00 -> 子
    const ratStart = [0, 2, 4, 6, 8][dStem % 5];             // 五鼠遁: 子时 stem for the day stem
    hourStemIdx = (ratStart + hourBranchIdx) % 10;
  }

  return {
    year: { stem: yStem, branch: yBranch },
    month: { stem: mStem, branch: mBranch },
    day: { stem: dStem, branch: dBranch },
    dayMasterIdx: dStem,
    dayMasterElementIdx: STEM_ELEMENT[dStem],
    elementDist: dist,
    zodiacIdx: yBranch,
    mansionIdx: mansion.idx,
    mansionConf: mansion.confidence,
    mansionResolved: mansion.resolved,
    mansionExact: mansion.exact,
    mansionHasTime: mansion.hasTime,
    mansionTzKnown: mansion.tzKnown,
    mansionApprox: mansion.approx,
    lodgeLon: mansion.lodgeLon,
    hasHour: hourBranchIdx !== null,
    hourBranchIdx,
    hourStemIdx
  };
}

// Parse "HH:MM" into a fractional local hour, or null.
function parseLocalHour(birthTime) {
  if (birthTime && /^\d{1,2}:\d{2}$/.test(birthTime)) {
    const [h, mi] = birthTime.split(':').map(Number);
    return h + mi / 60;
  }
  return null;
}

// Build the display + scoring profile from raw birth inputs.
//   opts: { tzOffset (hours)|null, approx, trueSolar, playerBaseline, baselineConf }
function buildProfile(birthDate, birthTime, gender, opts) {
  opts = opts || {};
  const [y, m, d] = birthDate.split('-').map(Number);
  const ctx = {
    localHour: parseLocalHour(birthTime),
    tzOffset: (typeof opts.tzOffset === 'number' && !Number.isNaN(opts.tzOffset)) ? opts.tzOffset : null,
    approx: !!opts.approx,
    trueSolar: !!opts.trueSolar,
    playerBaseline: !!opts.playerBaseline,
    baselineConf: opts.baselineConf
  };
  const chart = computeChart(y, m, d, ctx);
  const elementIdx = chart.dayMasterElementIdx;
  return {
    birthDate,
    birthTime: birthTime || null,
    gender: gender || 'unspecified',
    tzOffset: ctx.tzOffset,
    trueSolar: ctx.trueSolar,
    chart,
    stemIdx: chart.dayMasterIdx,
    stemChar: STEMS[chart.dayMasterIdx],
    stemArchetype: STEM_ARCHETYPE[chart.dayMasterIdx],
    yin: STEM_YIN[chart.dayMasterIdx] === 1,
    elementIdx,
    element: ELEMENTS[elementIdx],
    branchIdx: chart.day.branch,
    branchChar: BRANCHES[chart.day.branch],
    zodiacIdx: chart.zodiacIdx,
    zodiacChar: ZODIAC[chart.zodiacIdx],
    zodiacEn: ZODIAC_EN[chart.zodiacIdx],
    mansionIdx: chart.mansionIdx,
    mansion: MANSIONS[chart.mansionIdx],
    mansionConf: chart.mansionConf,
    mansionResolved: chart.mansionResolved,
    mansionExact: chart.mansionExact,
    mansionHasTime: chart.mansionHasTime,
    mansionTzKnown: chart.mansionTzKnown,
    mansionApprox: chart.mansionApprox,
    hasHour: chart.hasHour,
    hourBranchIdx: chart.hourBranchIdx
  };
}

/* ---------------------------------------------------------------------
 * 2. Relationship helpers
 * ------------------------------------------------------------------- */

// Ten-God category of a target element relative to the user's element.
function tenGod(userElem, targetElem) {
  if (targetElem === userElem) return 'companion';
  if (generates(userElem) === targetElem) return 'output';   // user produces target
  if (generates(targetElem) === userElem) return 'resource'; // target produces user
  if (controls(userElem) === targetElem) return 'wealth';    // user controls target
  return 'authority';                                        // target controls user
}

function branchesInSameTrine(a, b) {
  return TRINE_GROUPS.some(g => g.includes(a) && g.includes(b));
}
function branchClash(a, b) {
  return ((a + 6) % 12) === b;
}

/* ---------------------------------------------------------------------
 * 3. The deterministic scoring engine
 * ------------------------------------------------------------------- */

// ---- Layer 1 · Core BaZi (Year + Month + Day), 55% ----
// Day-master Ten-God relation + five-element distribution balance + 天干五合.
function coreBaziScore(u, p, cfg) {
  const uE = u.chart.dayMasterElementIdx, pE = p.chart.dayMasterElementIdx;
  const god = tenGod(uE, pE);
  const relScore = cfg.dayMaster[god];

  const comb = u.chart.elementDist.map((v, i) => v + p.chart.elementDist[i]);
  const total = comb.reduce((a, b) => a + b, 0);            // 12 visible chars
  const mean = total / 5;
  const variance = comb.reduce((a, b) => a + (b - mean) ** 2, 0) / 5;
  const maxVar = ((total - mean) ** 2 + 4 * mean ** 2) / 5; // all-in-one-element worst case
  const balance = maxVar > 0 ? clamp01(1 - variance / maxVar) : 1;

  const combine = STEM_COMBINE[u.chart.dayMasterIdx] === p.chart.dayMasterIdx ? 1 : 0;

  const s = cfg.sub;
  const score = clamp01(s.dayMaster * relScore + s.balance * balance + s.combine * combine);
  return { score, god, balance, combine: !!combine };
}

function isPunish(a, b) {
  if (PUNISH_PAIRS[a] === b) return true;
  return PUNISH_GROUPS.some(g => g.includes(a) && g.includes(b) && a !== b);
}

// ---- Layer 2 · Chinese Zodiac (year branch), 20% ----
// 六合 三合 六冲 相刑 相害 相破, with Li Chun as the year boundary (in computeChart).
function zodiacScore(u, p, cfg) {
  const a = u.zodiacIdx, b = p.zodiacIdx;
  if (a === b) return { score: cfg.same, rel: 'same' };
  if (SIX_HARMONY[a] === b) return { score: cfg.sixHarmony, rel: '六合' };
  if (branchesInSameTrine(a, b)) return { score: cfg.trine, rel: '三合' };
  if (((a + 6) % 12) === b) return { score: cfg.clash, rel: '六冲' };
  if (isPunish(a, b)) return { score: cfg.punish, rel: '相刑' };
  if (SIX_HARM[a] === b) return { score: cfg.harm, rel: '相害' };
  if (SIX_DESTROY[a] === b) return { score: cfg.destroy, rel: '相破' };
  return { score: cfg.neutral, rel: 'neutral' };
}

// ---- Layer 3 · Star Mansion (28 lunar mansions), 15% ----
function mansionScore(u, p, cfg) {
  if (u.mansionIdx === p.mansionIdx) return { score: cfg.same, rel: 'same' };
  const up = Math.floor(u.mansionIdx / 7), pp = Math.floor(p.mansionIdx / 7);
  if (up === pp) return { score: cfg.samePalace, rel: 'palace' };
  if ((up + 2) % 4 === pp) return { score: cfg.opposite, rel: 'opposite' };
  return { score: cfg.adjacent, rel: 'adjacent' };
}

// ---- Layer 4 · Birth Hour refinement, 10% (only when BOTH have a birth hour) ----
function hourScore(u, p, cfg) {
  const a = u.hourBranchIdx, b = p.hourBranchIdx;
  if (a === b) return { score: cfg.same };
  if (SIX_HARMONY[a] === b) return { score: cfg.sixHarmony };
  if (branchesInSameTrine(a, b)) return { score: cfg.trine };
  if (((a + 6) % 12) === b) return { score: cfg.clash };
  return { score: cfg.neutral };
}

// One-line reason fragments per layer.
function elementReason(p, core) {
  const pe = ELEMENTS[p.chart.dayMasterElementIdx];
  return `${TEN_GOD_DESC[core.god]} — their ${pe.cn}${pe.en} day-master ${TEN_GOD_CN[core.god]} yours`;
}
function zodiacReason(u, p, z) {
  const map = {
    '六合': 'a 六合 six-harmony', '三合': 'a 三合 trine', '六冲': 'a 六冲 clash-spark',
    '相刑': 'a 相刑 tension', '相害': 'a 相害 friction', '相破': 'a 相破 edge',
    same: 'a shared', neutral: 'an easy'
  };
  return `${map[z.rel] || 'an easy'} ${ZODIAC_EN[u.zodiacIdx]}–${ZODIAC_EN[p.zodiacIdx]} zodiac tie`;
}
function mansionReason(u, p, man) {
  if (man.rel === 'same') return `the same ${MANSIONS[u.mansionIdx].cn}宿 lunar mansion`;
  if (man.rel === 'palace') return `a shared ${MANSIONS[u.mansionIdx].palace} star-palace`;
  return `${MANSIONS[u.mansionIdx].cn}宿 and ${MANSIONS[p.mansionIdx].cn}宿 in dialogue`;
}

// Weighted four-layer compatibility. Returns a 0..1 score.
// If either side lacks a reliable birth hour, the 10% hour weight is
// redistributed proportionally across the first three layers (never deducted).
function scorePlayer(u, p, config) {
  const M = config.model;
  const core = coreBaziScore(u, p, M.coreBazi);
  const zod = zodiacScore(u, p, M.zodiac);
  const manRaw = mansionScore(u, p, M.starMansion);
  // Mansion is a resonance/texture layer. When either side's mansion is
  // uncertain (birth time unknown, Moon near a boundary), blend its score
  // toward neutral by the combined confidence — never fabricate a strong signal.
  const mConf = Math.min(u.mansionConf ?? 1, p.mansionConf ?? 1);
  const man = { score: 0.5 + mConf * (manRaw.score - 0.5), rel: manRaw.rel, conf: mConf };

  let wCore = M.layers.coreBazi, wZod = M.layers.zodiac, wMan = M.layers.starMansion, wHour = M.layers.birthHour;
  let hour = null;
  if (u.hasHour && p.hasHour) {
    hour = hourScore(u, p, M.birthHour);
  } else {
    const base = wCore + wZod + wMan;
    const k = (base + wHour) / base; // spread the hour weight proportionally
    wCore *= k; wZod *= k; wMan *= k; wHour = 0;
  }

  const score = wCore * core.score + wZod * zod.score + wMan * man.score + (hour ? wHour * hour.score : 0);

  const reasons = [
    { pts: wCore * core.score, kind: 'element', god: core.god, text: elementReason(p, core) },
    { pts: wZod * zod.score, kind: 'zodiac', rel: zod.rel, text: zodiacReason(u, p, zod) },
    { pts: wMan * man.score, kind: 'mansion', rel: man.rel, text: mansionReason(u, p, man) }
  ];
  if (hour) reasons.push({ pts: wHour * hour.score, kind: 'hour', text: `a resonant birth-hour (时辰) pairing` });

  return { score, reasons, layers: { core: core.score, zodiac: zod.score, mansion: man.score, hour: hour ? hour.score : null } };
}

// Map a raw score onto the configured display percentage band.
function toPercent(score, config, minRaw, maxRaw) {
  const { min, max } = config.scoreRange;
  if (maxRaw === minRaw) return Math.round((min + max) / 2);
  const t = (score - minRaw) / (maxRaw - minRaw);
  return Math.round(min + t * (max - min));
}

// Build a one-sentence match reason from the strongest contributors.
function buildReason(player, contributors) {
  const positives = contributors.filter(c => c.pts > 0).sort((a, b) => b.pts - a.pts);
  const top = positives.slice(0, 2).map(c => c.text);
  if (top.length === 0) return `${player.name}'s chart crosses yours on a subtle, slow-burning line.`;
  if (top.length === 1) return `You share ${top[0]}.`;
  return `You share ${top[0]}, reinforced by ${top[1]}.`;
}

/* ---------------------------------------------------------------------
 * 4. Top-level: profile + ranked players
 * ------------------------------------------------------------------- */

function runMatch(birthDate, birthTime, gender, selectedGames, data, opts) {
  const { players, config } = data;
  // The user's chart honors the time-handling options (birth-place time zone,
  // approximate mode, true solar time).
  const profile = buildProfile(birthDate, birthTime, gender, opts || {});

  // Only rank players whose birth date is a valid YYYY-MM-DD. Anchor records
  // (e.g. Worlds winners) whose birth date could not be reliably verified may
  // live in the dataset with birthDate: null — they stay in the DB but are
  // skipped from scoring rather than producing a bogus result.
  const pool = players.filter(p =>
    selectedGames.includes(p.game) && /^\d{4}-\d{2}-\d{2}$/.test(p.birthDate || ''));

  // Players only ever have a birth date, so their mansion uses a consistent
  // date-only baseline (noon at the default zone) with a fixed baseline
  // confidence. The pair's mansion strength is then driven by the USER's data
  // quality (via the min-confidence blend in scorePlayer).
  const baselineConf = (config.model.starMansion && config.model.starMansion.playerBaselineConfidence) ?? 0.7;
  const scored = pool.map(p => {
    const pProfile = buildProfile(p.birthDate, p.birthTime || null, 'unspecified', { playerBaseline: true, baselineConf });
    const { score, reasons, layers } = scorePlayer(profile, pProfile, config);
    return { player: p, rawScore: score, reasons, layers };
  });

  if (scored.length === 0) return { profile, ranked: [] };

  const rawScores = scored.map(s => s.rawScore);
  const minRaw = Math.min(...rawScores);
  const maxRaw = Math.max(...rawScores);

  scored.forEach(s => {
    s.percent = toPercent(s.rawScore, config, minRaw, maxRaw);
    s.reasonText = buildReason(s.player, s.reasons);
  });

  // Deterministic sort: score desc, then id asc for stable tie-breaks.
  scored.sort((a, b) => b.rawScore - a.rawScore || a.player.id.localeCompare(b.player.id));

  return { profile, ranked: scored.slice(0, 10) };
}

/* ---------------------------------------------------------------------
 * 5. Narrative copy (local template) + optional OpenAI polish
 * ------------------------------------------------------------------- */

function localNarrative(profile, selectedGames, gamesMeta) {
  const el = profile.element;
  const mansion = profile.mansion;
  const flavor = MANSION_FLAVOR[mansion.cn] || 'a rare and singular star-signature';

  // 1) short metaphysical identity + personality style
  const summary =
    `You're a ${profile.stemArchetype} — ${personalityStyle(profile.elementIdx)}. ` +
    `Year of the ${profile.zodiacChar} ${profile.zodiacEn}, under the ${mansion.cn}宿 mansion.`;

  // 2) concise zodiac compatibility note
  const zodiacNote =
    `As a ${profile.zodiacEn}, you click with charts in 六合/三合 harmony and strike sparks with 六冲/刑/害/破 — ` +
    `that mix decides who rises up your list.`;

  // 3) concise star-mansion note — traditional 二十八宿 (月宿) almanac, read from
  //    birth-place local time, with an honest confidence tier.
  let mansionNote;
  if (!profile.mansionResolved) {
    mansionNote =
      `Star mansion (月宿) unresolved — the traditional almanac reads it from your exact birth moment, so it needs your birth time and birth-place time zone. ` +
      `Shown as ${mansion.cn}宿 from a noon estimate only, and it counts lightly here.`;
  } else if (profile.mansionExact) {
    mansionNote = `Your 月宿 is ${mansion.cn}宿 (${mansion.palace}), read by the traditional almanac from your birth-place birth time — ${flavor}.`;
  } else if (profile.mansionHasTime && !profile.mansionTzKnown) {
    mansionNote =
      `Your 月宿 is ${mansion.cn}宿 (${mansion.palace}) — ${flavor}. ` +
      `Birth-place time zone not set, so it's approximate; set it for an exact mansion.`;
  } else {
    mansionNote =
      `Approximate ${mansion.cn}宿 (${mansion.palace}) — ${flavor}. ` +
      `Add your birth time and birth-place time zone for an exact 月宿.`;
  }

  // 4) why the user matches this profile
  const why =
    `Ranking is a light BaZi read: your ${profile.stemChar}${el.cn} day-master & elements (55%), zodiac ties (20%), ` +
    `star-mansion resonance (15%) and birth-hour (10%, shared out when unknown). ` +
    `The players below ${relationHint(profile.elementIdx)} your ${el.en} temperament most.`;

  return {
    archetypeTitle: profile.stemArchetype,
    mansionTitle: `${mansion.cn}宿型`,
    zodiacTitle: `${profile.zodiacChar}${profile.zodiacEn}`,
    summary, zodiacNote, mansionNote, why
  };
}

function personalityStyle(e) {
  return [
    'a patient, growth-minded strategist who compounds small edges',  // wood
    'an explosive, expressive playmaker who lives for the highlight',  // fire
    'a grounded, unshakeable anchor who wins on discipline',           // earth
    'a sharp, precise perfectionist who punishes every mistake',       // metal
    'a fluid, adaptive reader who flows around any problem'            // water
  ][e];
}
function relationHint(e) {
  return [
    'feed and generate',       // wood
    'ignite and mirror',       // fire
    'stabilize and ground',    // earth
    'sharpen and refine',      // metal
    'flow with and deepen'     // water
  ][e];
}

// Optional OpenAI polish. NEVER changes the ranking or numbers — text only.
// Requires a user-provided key stored in localStorage. Fails safe to local copy.
async function polishWithOpenAI(narrative, ranked, profile) {
  const key = (localStorage.getItem('edm_openai_key') || '').trim();
  if (!key) return narrative; // no key -> local template, app still fully works

  const topReasons = ranked.slice(0, 3).map(r => `${r.player.name} (${r.percent}%): ${r.reasonText}`).join('\n');
  const prompt =
    `You are a playful, mystical esports fortune writer. Do NOT change any numbers, names, or rankings.\n` +
    `Rewrite ONLY the wording to be elegant, mystical and shareable. Return strict JSON with keys ` +
    `archetypeTitle, mansionTitle, summary, zodiacNote, mansionNote, why.\n\n` +
    `Archetype: ${narrative.archetypeTitle}\nMansion: ${narrative.mansionTitle}\n` +
    `summary: ${narrative.summary}\nzodiacNote: ${narrative.zodiacNote}\nmansionNote: ${narrative.mansionNote}\nwhy: ${narrative.why}\n\n` +
    `Top matches for tone reference (do not alter):\n${topReasons}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.8,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You polish copy. You never invent rankings, names, or numbers.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    if (!res.ok) throw new Error('OpenAI ' + res.status);
    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    // Merge but keep our titles authoritative if the model drops them.
    return {
      archetypeTitle: parsed.archetypeTitle || narrative.archetypeTitle,
      mansionTitle: parsed.mansionTitle || narrative.mansionTitle,
      summary: parsed.summary || narrative.summary,
      zodiacNote: parsed.zodiacNote || narrative.zodiacNote,
      mansionNote: parsed.mansionNote || narrative.mansionNote,
      why: parsed.why || narrative.why
    };
  } catch (err) {
    console.warn('OpenAI polish failed, using local narrative:', err);
    return narrative; // graceful fallback
  }
}

/* ---------------------------------------------------------------------
 * 6. Lightweight data validation layer
 * ------------------------------------------------------------------- */

function validatePlayers(players) {
  const issues = [];
  const seen = new Set();
  // Approved, broadly-recognized tag vocabulary (all games now migrated to it).
  const allowedTags = new Set([
    'clutch', 'leader', 'aggressive', 'disciplined', 'stable', 'calm',
    'creative', 'veteran', 'rookie', 'mechanical', 'strategic'
  ]);
  players.forEach((p, i) => {
    const at = `players[${i}] ${p.name || p.id || '?'}`;
    if (!p.id) issues.push(`${at}: missing id`);
    if (p.id && seen.has(p.id)) issues.push(`${at}: duplicate id "${p.id}"`);
    if (p.id) seen.add(p.id);
    if (!p.name) issues.push(`${at}: missing name`);
    if (!p.game) issues.push(`${at}: missing game`);
    // birthDate may be intentionally null when a date is unverifiable/conflicting
    // (see the record's notes). Only a non-null, malformed date is a problem.
    if (p.birthDate !== null && p.birthDate !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate)) issues.push(`${at}: birthDate must be YYYY-MM-DD or null`);
      else {
        const d = new Date(p.birthDate + 'T00:00:00');
        if (Number.isNaN(d.getTime())) issues.push(`${at}: invalid birthDate "${p.birthDate}"`);
      }
    }
    if (p.birthTime && !/^\d{1,2}:\d{2}$/.test(p.birthTime)) issues.push(`${at}: birthTime must be HH:MM`);
    if (!Array.isArray(p.tags) || p.tags.length === 0) issues.push(`${at}: needs at least one tag`);
    (p.tags || []).forEach(t => { if (!allowedTags.has(t)) issues.push(`${at}: unknown tag "${t}"`); });
  });
  return issues;
}

/* ---------------------------------------------------------------------
 * 7. Data loading
 * ------------------------------------------------------------------- */

async function loadData() {
  const [gamesRes, playersRes, configRes] = await Promise.all([
    fetch('data/games.json'),
    fetch('data/players.json'),
    fetch('data/config.json')
  ]);
  if (!gamesRes.ok || !playersRes.ok || !configRes.ok) {
    throw new Error('Failed to load data files. If opening locally, run a static server (see README).');
  }
  const games = (await gamesRes.json()).games;
  const players = (await playersRes.json()).players;
  const config = await configRes.json();

  const issues = validatePlayers(players);
  if (issues.length) console.warn('Player data validation issues:\n' + issues.join('\n'));

  return { games, players, config, validationIssues: issues };
}

/* ---------------------------------------------------------------------
 * 8. UI wiring
 * ------------------------------------------------------------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

let DATA = null;
let LAST_RESULT = null;

function initGameCheckboxes(games) {
  const wrap = $('#gameOptions');
  wrap.innerHTML = '';
  games.filter(g => g.enabled).forEach(g => {
    const label = document.createElement('label');
    label.className = 'game-chip';
    label.style.setProperty('--chip', g.color);
    label.innerHTML =
      `<input type="checkbox" name="game" value="${g.id}">` +
      `<span class="game-chip__icon">${g.icon}</span>` +
      `<span class="game-chip__name">${g.name}</span>`;
    wrap.appendChild(label);
  });
  // enforce max 4 selection
  wrap.addEventListener('change', () => {
    const checked = $$('input[name="game"]:checked', wrap);
    if (checked.length > 4) { checked[checked.length - 1].checked = false; }
    $$('.game-chip', wrap).forEach(c => c.classList.toggle('is-checked', c.querySelector('input').checked));
  });
}

function avatarMarkup(player) {
  const initials = (player.name || '?').replace(/[^A-Za-z一-龥]/g, '').slice(0, 2).toUpperCase() || '?';
  const game = DATA.games.find(g => g.id === player.game) || { color: '#8a7dff' };
  if (player.avatar) {
    return `<img class="pl-avatar__img" src="${player.avatar}" alt="${player.name}" loading="lazy"
              onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'pl-avatar__fallback',textContent:'${initials}'}))">`;
  }
  return `<span class="pl-avatar__fallback" style="--a:${game.color}">${initials}</span>`;
}

function gameBadge(gameId) {
  const g = DATA.games.find(x => x.id === gameId) || { name: gameId, color: '#888', short: gameId };
  return `<span class="pl-game" style="--g:${g.color}">${g.icon || ''} ${g.short}</span>`;
}

function renderResult(narrative, result) {
  const { profile, ranked } = result;

  // Identity cards (only two labels, as required)
  $('#archetypeLabel').textContent = narrative.archetypeTitle;
  $('#archetypeEmoji').textContent = profile.element.emoji;
  $('#archetypeCard').style.setProperty('--accent', profile.element.color);
  $('#mansionLabel').textContent = narrative.mansionTitle;
  $('#mansionSub').textContent = `${profile.mansion.palace} · ${profile.mansion.dir}`;

  $('#summaryText').textContent = narrative.summary;
  $('#zodiacText').textContent = narrative.zodiacNote;
  $('#mansionNoteText').textContent = narrative.mansionNote;
  $('#whyText').textContent = narrative.why;

  // Ranked players
  const list = $('#playerList');
  list.innerHTML = '';
  ranked.forEach((r, i) => {
    const p = r.player;
    const li = document.createElement('li');
    li.className = 'player-row';
    li.style.animationDelay = (i * 55) + 'ms';
    li.innerHTML = `
      <div class="pl-rank">${i + 1}</div>
      <div class="pl-avatar">${avatarMarkup(p)}</div>
      <div class="pl-main">
        <div class="pl-top">
          <span class="pl-name">${p.name}</span>
          ${gameBadge(p.game)}
          <span class="pl-role">${p.role}</span>
        </div>
        <div class="pl-meta">${regionLabel(p)}${formatDate(p.birthDate)}</div>
        <div class="pl-reason">${r.reasonText}</div>
      </div>
      <div class="pl-score">
        <div class="pl-score__num">${r.percent}<span>%</span></div>
        <div class="pl-score__bar"><span style="width:${r.percent}%"></span></div>
      </div>`;
    list.appendChild(li);
  });

  // Share text
  LAST_RESULT = { narrative, result };
  $('#shareText').value = buildShareText(narrative, ranked);

  // Reveal
  const section = $('#resultSection');
  section.hidden = false;
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildShareText(narrative, ranked) {
  const top3 = ranked.slice(0, 3).map((r, i) => `${i + 1}. ${r.player.name} — ${r.percent}%`).join('\n');
  return `🔮 Esports Destiny Match\n` +
    `I'm a ${narrative.archetypeTitle} · ${narrative.mansionTitle}\n` +
    `${narrative.summary}\n\nMy top pro matches:\n${top3}\n\n#EsportsDestinyMatch`;
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[+m - 1]} ${+d}, ${y}`;
}

// Geopolitical neutrality: the UI never renders flags, demonyms, or country
// names. The only optional location-style label is a neutral competition-region
// tag (e.g. LPL, LCK, LCS, LEC) — a competition grouping, not a nationality.
// Nationality is never used as a scoring factor anywhere in this app.
function regionLabel(p) {
  const r = p.competition_region;
  if (!r) return '';
  return `<span class="pl-region">${r}</span> · `;
}

/* ---------------------------------------------------------------------
 * 9. Form submit flow
 * ------------------------------------------------------------------- */

async function onSubmit(e) {
  e.preventDefault();
  const birthDate = $('#birthDate').value;
  const birthTime = $('#birthTime').value;
  const gender = ($('input[name="gender"]:checked') || {}).value || 'unspecified';
  const selectedGames = $$('input[name="game"]:checked').map(i => i.value);

  // Time-handling options: birth-place time zone (metaphysical basis), an
  // explicit approximate mode, and an optional true-solar-time refinement.
  const tzRaw = ($('#birthTz') || {}).value;
  const tzOffset = (tzRaw === '' || tzRaw == null) ? null : Number(tzRaw);
  const approx = !!($('#approxTime') || {}).checked;
  const trueSolar = !!($('#trueSolar') || {}).checked;
  const opts = { tzOffset, approx, trueSolar };

  const err = $('#formError');
  err.textContent = '';
  if (!birthDate) { err.textContent = 'Please enter your birth date.'; return; }
  if (selectedGames.length < 1) { err.textContent = 'Pick at least one game (up to 4).'; return; }

  const btn = $('#submitBtn');
  btn.disabled = true;
  btn.classList.add('is-loading');

  try {
    const result = runMatch(birthDate, birthTime, gender, selectedGames, DATA, opts);
    if (result.ranked.length === 0) {
      err.textContent = 'No players found for the selected games.';
      return;
    }
    // Local narrative first (guaranteed), then optional OpenAI polish.
    let narrative = localNarrative(result.profile, selectedGames, DATA.games);
    renderResult(narrative, result); // show immediately with local copy

    // Save last result
    try {
      localStorage.setItem('edm_last', JSON.stringify({ birthDate, birthTime, gender, selectedGames, tz: tzRaw, approx, trueSolar }));
    } catch (_) {}

    // Fire-and-refresh optional polish
    const polished = await polishWithOpenAI(narrative, result.ranked, result.profile);
    if (polished !== narrative) renderResult(polished, result);
  } catch (ex) {
    console.error(ex);
    err.textContent = 'Something went wrong computing your destiny. Please try again.';
  } finally {
    btn.disabled = false;
    btn.classList.remove('is-loading');
  }
}

function wireStaticButtons() {
  $('#startBtn').addEventListener('click', () => {
    $('#inputSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('#birthDate').focus();
  });

  $('#copyBtn').addEventListener('click', async () => {
    const text = $('#shareText').value;
    try {
      await navigator.clipboard.writeText(text);
      flash($('#copyBtn'), 'Copied!');
    } catch {
      $('#shareText').select();
      document.execCommand && document.execCommand('copy');
      flash($('#copyBtn'), 'Copied!');
    }
  });

  $('#againBtn').addEventListener('click', () => {
    $('#inputSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Optional OpenAI key management (kept subtle)
  $('#aiKeyBtn').addEventListener('click', () => {
    const current = localStorage.getItem('edm_openai_key') || '';
    const val = prompt(
      'Optional: paste an OpenAI API key to let the AI polish the wording.\n' +
      'It is stored only in this browser (localStorage) and never leaves your device except to call OpenAI directly.\n' +
      'Leave blank and press OK to remove it.', current);
    if (val === null) return;
    if (val.trim()) { localStorage.setItem('edm_openai_key', val.trim()); flash($('#aiKeyBtn'), 'AI polish on'); }
    else { localStorage.removeItem('edm_openai_key'); flash($('#aiKeyBtn'), 'AI polish off'); }
  });
}

function flash(btn, msg) {
  const old = btn.textContent;
  btn.textContent = msg;
  btn.classList.add('is-flash');
  setTimeout(() => { btn.textContent = old; btn.classList.remove('is-flash'); }, 1400);
}

function restoreLast() {
  try {
    const saved = JSON.parse(localStorage.getItem('edm_last') || 'null');
    if (!saved) return;
    if (saved.birthDate) $('#birthDate').value = saved.birthDate;
    if (saved.birthTime) $('#birthTime').value = saved.birthTime;
    if (saved.gender) { const g = $(`input[name="gender"][value="${saved.gender}"]`); if (g) g.checked = true; }
    if (saved.tz != null && $('#birthTz')) $('#birthTz').value = saved.tz;
    if (saved.approx && $('#approxTime')) $('#approxTime').checked = true;
    if (saved.trueSolar && $('#trueSolar')) $('#trueSolar').checked = true;
    (saved.selectedGames || []).forEach(id => {
      const box = $(`input[name="game"][value="${id}"]`);
      if (box) { box.checked = true; box.closest('.game-chip').classList.add('is-checked'); }
    });
  } catch (_) {}
}

async function init() {
  try {
    DATA = await loadData();
    initGameCheckboxes(DATA.games);
    wireStaticButtons();
    $('#matchForm').addEventListener('submit', onSubmit);
    restoreLast();
    if (DATA.validationIssues.length) {
      $('#dataNote').textContent = `Note: ${DATA.validationIssues.length} data validation warning(s) — see console.`;
    }
  } catch (ex) {
    console.error(ex);
    const banner = $('#loadError');
    if (banner) { banner.hidden = false; banner.textContent = ex.message; }
  }
}

document.addEventListener('DOMContentLoaded', init);
