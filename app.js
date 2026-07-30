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

// Map a mansion character to its MANSIONS index. The 宿曜経 table (lunar.js) uses
// traditional glyphs for a few mansions; alias them onto the simplified display.
const MANSION_CHAR_TO_IDX = {};
MANSIONS.forEach((mm, i) => { MANSION_CHAR_TO_IDX[mm.cn] = i; });
[['婁', '娄'], ['畢', '毕'], ['張', '张'], ['軫', '轸'], ['氏', '氐']].forEach(([trad, simp]) => {
  if (simp in MANSION_CHAR_TO_IDX) MANSION_CHAR_TO_IDX[trad] = MANSION_CHAR_TO_IDX[simp];
});

/* 星宿关系 (star-mansion relationship) — loaded from data/star_relations.json,
 * the single source of truth for the relation MAPPING (角-start 27-宿, 牛 omitted).
 * It is a 3-dimensional, DIRECTIONAL model: relation FAMILY (荣亲/友衰/安坏/危成/
 * 业胎/命之星) × ROLE within the family (荣 vs 亲, 危 vs 成, …) × DISTANCE TIER
 * (远/中/近). Because this is a compatibility test, the role the USER occupies vs
 * the one the PLAYER occupies are different experiences and are scored asymmetrically
 * (user side weighted higher). The family+tier come straight from the table; the
 * role split comes from direction (see directionConvention in the JSON). */
let STAR_REL = null;

// 28-mansion index → 27-宿 position (drop 牛 at MANSIONS index 8). 本命宿 is never 牛.
function mansionIdx28to27(idx28) { return idx28 < 8 ? idx28 : idx28 - 1; }

// Full directional 星宿关系 detail between the user's and the player's 本命宿.
// Returns { category, family, tier, userRole, playerRole, fwd, score } or null.
function starRelationDetail(uIdx28, pIdx28) {
  if (!STAR_REL) return null;
  const uPos = mansionIdx28to27(uIdx28), pPos = mansionIdx28to27(pIdx28);
  const fwd = ((pPos - uPos) % 27 + 27) % 27;         // 0..26, player forward of user
  let category, family, tier, userRole, playerRole;
  if (fwd === 0) {
    category = STAR_REL.byDistance[0];                 // 命之星 — same 本命宿
    family = 'command'; tier = null;
    const meta = STAR_REL.categoryMeta[category];
    family = meta.family;
    userRole = STAR_REL.families[family].roles[0];     // 命
    playerRole = STAR_REL.families[family].roles[1];   // 星
  } else {
    const k = Math.min(fwd, 27 - fwd);                 // folded distance → table category
    category = STAR_REL.byDistance[k];
    const meta = STAR_REL.categoryMeta[category] || {};
    family = meta.family; tier = meta.tier;
    const roles = (STAR_REL.families[family] || {}).roles || [];
    const forward = fwd <= 13;                          // player ahead (short way forward)
    userRole = forward ? roles[0] : roles[1];
    playerRole = forward ? roles[1] : roles[0];
  }
  const rs = (r) => (STAR_REL.roles[r] && typeof STAR_REL.roles[r].score === 'number') ? STAR_REL.roles[r].score : 0.5;
  const w = STAR_REL.weights || { userSide: 0.6, playerSide: 0.4, neutral: 0.5 };
  const neutral = w.neutral ?? 0.5;
  const scale = (tier && STAR_REL.tierScale[tier] != null)
    ? STAR_REL.tierScale[tier]
    : ((STAR_REL.specialScale && STAR_REL.specialScale[category]) ?? 0.9);
  const score = clamp01(neutral + scale * (w.userSide * (rs(userRole) - neutral) + w.playerSide * (rs(playerRole) - neutral)));
  return { category, family, tier, userRole, playerRole, fwd, score };
}

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
// Reframed for spectating: which pros you're *fated to watch*, per Ten-God.
//   食伤 output    -> aesthetics / mechanics / highlights / creativity
//   官杀 authority -> pressure / discipline / clutch / structured play
//   比劫 companion -> confrontation / aggression / head-to-head fire
//   印星 resource  -> strategy / analysis / stability / the explanatory game
//   财星 wealth    -> objective-hungry grind you enjoy chasing alongside them
const TEN_GOD_DESC = {
  companion: 'head-to-head brawlers whose confrontational, go-for-the-throat fire mirrors yours',
  output: 'expressive shot-makers whose highlight mechanics and creative flair light up your feed',
  resource: 'cerebral, explanatory players whose strategy and steady analysis you love to follow',
  wealth: 'relentless, objective-hungry grinders whose rewarding, hard-earned wins you enjoy chasing',
  authority: 'high-pressure performers whose disciplined, clutch composure under structure electrifies you'
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
 * 0b. Star mansion 星宿 — 宿曜経 (Sukuyō) 本命星宿, the 爱占星 lineage
 *
 * The birth mansion follows the 宿曜経 method — a lunar-calendar lookup, the same
 * one the Chinese app 爱占星 uses — NOT modern Moon longitude and NOT a custom
 * cycle. The heavy lifting (Chinese-lunar conversion with leap months + the
 * classical 27-宿 月宿傍通暦 table) lives in lunar.js (window.EDM_LUNAR); this layer
 * just wraps it, maps the 本命宿 onto the 28-mansion display/scoring index, and
 * degrades confidence honestly. It stays fully independent of the Five Elements,
 * Day Pillar and Zodiac. Externally validated against a published 宿曜経
 * implementation (98/98) plus the 爱占星 anchor 2000-03-01 → 虚宿 and a dozen
 * documented celebrity 本命宿 — see tests/mansion.test.mjs and VALIDATION.md.
 * ------------------------------------------------------------------- */

// Default meridian when the birth place is not given: UTC+8 (China Standard
// Time), the meridian on which the Chinese 农历 (and 爱占星) is defined.
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

// 宿曜経 本命星宿. Delegates to lunar.js (Chinese-lunar conversion + 月宿傍通暦
// table), then maps the 本命宿 character onto the 28-mansion index the rest of the
// app uses for the palace/scoring/reading layers. The lunar date is taken at the
// birth-place meridian (default UTC+8, i.e. the Chinese 农历 / 爱占星 basis); true
// solar time is never applied here, and 夜子時 rolls 23:00–24:00 to the next day
// only when explicitly enabled.
//   ctx: { localHour|null, tzOffset (meridian hrs)|null, yeziEnabled, playerBaseline, baselineConf }
function computeMansion(y, m, d, ctx) {
  const hasTime = typeof ctx.localHour === 'number' && !Number.isNaN(ctx.localHour);
  const tzKnown = typeof ctx.tzOffset === 'number' && !Number.isNaN(ctx.tzOffset);
  const meridian = tzKnown ? ctx.tzOffset : DEFAULT_TZ_OFFSET;

  const LUNAR = (typeof window !== 'undefined' && window.EDM_LUNAR) ||
                (typeof EDM_LUNAR !== 'undefined' ? EDM_LUNAR : null);
  const r = LUNAR.benmingSuku(y, m, d, {
    meridianHours: meridian,
    localHour: hasTime ? ctx.localHour : null,
    yeziEnabled: !!ctx.yeziEnabled
  });
  const idx = MANSION_CHAR_TO_IDX[r.mansion] ?? 0;

  // The 农历 date fixes the mansion, so the layer is never "unresolved". Birth-place
  // meridian pins the rare new-moon-boundary day; birth time only matters for the
  // optional 夜子時 roll — hence confidence degrades gently, never fabricated.
  let confidence;
  if (ctx.playerBaseline) confidence = clamp01(ctx.baselineConf ?? 0.7);
  else if (tzKnown && hasTime) confidence = 1.0;   // meridian + time fully pin the day
  else if (tzKnown) confidence = 0.85;             // meridian known; only 夜子時 unresolved
  else if (hasTime) confidence = 0.6;              // meridian assumed UTC+8
  else confidence = 0.5;                           // date only, meridian assumed

  return {
    idx, mansionChar: r.mansion,
    lunarMonth: r.lunarMonth, lunarDay: r.lunarDay, isLeap: r.isLeap,
    confidence, resolved: true, hasTime, tzKnown,
    approx: !!ctx.approx, exact: tzKnown, rolled: r.rolled
  };
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
    mansionRolled: mansion.rolled,
    lunarMonth: mansion.lunarMonth,
    lunarDay: mansion.lunarDay,
    lunarLeap: mansion.isLeap,
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
    yeziEnabled: !!opts.yeziEnabled,
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
    lunarMonth: chart.lunarMonth,
    lunarDay: chart.lunarDay,
    lunarLeap: chart.lunarLeap,
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

// ---- Layer 3 · Star mansion 星宿 (宿曜経 本命星宿 + 星宿关系), 15% ----
// The star layer is now a RELATIONSHIP between the two natal mansions, read from
// the 星宿关系自查表 (data/star_relations.json) — the relation category is the
// source of truth; its score is a supporting resonance modifier. Falls back to a
// neutral score if the table hasn't loaded.
function mansionScore(u, p, cfg) {
  const det = starRelationDetail(u.mansionIdx, p.mansionIdx);
  if (det) return { score: det.score, rel: det.category, detail: det };
  return { score: (cfg && cfg.neutral) || 0.6, rel: 'neutral', detail: null };
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

// Classify the branch/zodiac relationship between two year branches.
function zodiacRelation(a, b) {
  if (a === b) return 'same';
  if (SIX_HARMONY[a] === b) return 'six';
  if (branchesInSameTrine(a, b)) return 'trine';
  if (((a + 6) % 12) === b) return 'clash';
  if (isPunish(a, b)) return 'punish';
  if (SIX_HARM[a] === b) return 'harm';
  if (SIX_DESTROY[a] === b) return 'destroy';
  return 'neutral';
}

// Classify the 28-mansion palace relationship (same / palace / opposite / adjacent).
function mansionRelation(uMan, pMan) {
  if (uMan === pMan) return 'same';
  const up = Math.floor(uMan / 7), pp = Math.floor(pMan / 7);
  if (up === pp) return 'palace';
  if ((up + 2) % 4 === pp) return 'opposite';
  return 'adjacent';
}

// Pick a play-style bucket key from a player's tags (fixed priority so it's deterministic).
function pickBucket(tags) {
  const order = ['aggressive', 'mechanical', 'clutch', 'creative', 'strategic', 'leader', 'disciplined', 'stable', 'calm', 'veteran', 'rookie'];
  for (const k of order) if (tags.includes(k)) return k;
  return 'mechanical';
}

// Build a compact, multi-layer per-player reading (current language):
//   { summary (A), evidence [B–E], final (F) }.
// Layers degrade gracefully — the mansion line is dropped when the user's
// mansion is unresolved (no birth time/zone) rather than faking a resonance.
function explainPlayer(u, p, player, reasons) {
  const R = READING.explain;
  const uE = u.elementIdx, pE = p.elementIdx;
  const god = tenGod(uE, pE);
  const uEl = ELEMENTS[uE], pEl = ELEMENTS[pE];
  const zh = CURRENT_LANG === 'zh';

  // A — headline hook.
  const hook = tr(R.summaryHook[god]);
  const summary = zh
    ? `${player.name} 以${tr(READING.tenGodShort[god])}牵动你——${hook}。`
    : `${player.name} pulls you through ${tr(READING.tenGodShort[god])} — ${hook}.`;

  const evidence = [];

  // B — Five Elements / stems.
  const er = R.elementRel[god];
  let bText = zh
    ? `他的${pEl.cn}${tr(er.rel)}你的${uEl.cn}本性——你偏向${tr(er.behavior)}。`
    : `Their ${pEl.en} ${tr(er.rel)} your ${uEl.en} core — you lean toward ${tr(er.behavior)}.`;
  if (STEM_COMBINE[u.stemIdx] === p.stemIdx) bText += tr(R.stemCombine);
  evidence.push({ label: tr(R.label.element), text: bText });

  // C — Zodiac / branch relationship.
  const zr = zodiacRelation(u.zodiacIdx, p.zodiacIdx);
  const relCn = R.branchCn[zr];
  const cText = zh
    ? `${ZODIAC[u.zodiacIdx]}${ZODIAC[p.zodiacIdx]}${relCn ? ' ' + relCn : ''}——${tr(R.branchRel[zr])}。`
    : `${ZODIAC_EN[u.zodiacIdx]}–${ZODIAC_EN[p.zodiacIdx]}${relCn ? ' ' + relCn : ''} — ${tr(R.branchRel[zr])}.`;
  evidence.push({ label: tr(R.label.branch), text: cText });

  // D — 星宿关系: directional (family × role × tier). Concise visible line;
  // the full breakdown lives in the 计算说明 section.
  const starDet = starRelationDetail(u.mansionIdx, p.mansionIdx);
  if (starDet) {
    const uRole = tr((R.starRole || {})[starDet.userRole]) || starDet.userRole;
    const dText = zh
      ? `${starDet.category}｜你属「${starDet.userRole}」·他属「${starDet.playerRole}」——${uRole}`
      : `${starDet.category} · you 「${starDet.userRole}」 / them 「${starDet.playerRole}」 — ${uRole}`;
    evidence.push({ label: tr(R.label.mansion), text: dText });
  }

  // E — play-style bucket ↔ viewer taste.
  const bucket = tr(R.bucket[pickBucket(player.tags || [])]);
  const taste = tr(R.taste[uE]);
  evidence.push({
    label: tr(R.label.style),
    text: zh ? `打法偏${bucket}——正中你${taste}的口味。` : `Plays as ${bucket} — right in your ${taste} wheelhouse.`
  });

  // F — bottom line: the single strongest scoring layer.
  const top = reasons.filter(r => r.pts > 0).sort((a, b) => b.pts - a.pts)[0];
  const kind = top ? top.kind : 'element';
  let final;
  if (kind === 'zodiac') {
    final = tr(R.finalZodiac)
      .replace('{rel}', relCn || (zh ? '生肖' : 'zodiac'))
      .replace('{a}', zh ? ZODIAC[u.zodiacIdx] : ZODIAC_EN[u.zodiacIdx])
      .replace('{b}', zh ? ZODIAC[p.zodiacIdx] : ZODIAC_EN[p.zodiacIdx]);
  } else if (kind === 'mansion' && starDet) {
    final = tr(R.finalMansion).replace('{rel}', starDet.category).replace('{role}', starDet.userRole);
  } else {
    final = tr(R.finalElement)
      .replace('{a}', zh ? uEl.cn : uEl.en)
      .replace('{b}', zh ? pEl.cn : pEl.en)
      .replace('{noun}', tr(er.noun));
  }

  return { summary, evidence, final };
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
  const man = { score: 0.5 + mConf * (manRaw.score - 0.5), rel: manRaw.rel, detail: manRaw.detail, conf: mConf };

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
    { pts: wCore * core.score, kind: 'element', god: core.god },
    { pts: wZod * zod.score, kind: 'zodiac', zRel: zod.rel, uZod: u.zodiacIdx, pZod: p.zodiacIdx },
    { pts: wMan * man.score, kind: 'mansion', starRel: man.detail }
  ];
  if (hour) reasons.push({ pts: wHour * hour.score, kind: 'hour' });

  return { score, reasons, layers: { core: core.score, zodiac: zod.score, mansion: man.score, hour: hour ? hour.score : null } };
}

// Map a raw score onto the configured display percentage band.
function toPercent(score, config, minRaw, maxRaw) {
  const { min, max } = config.scoreRange;
  if (maxRaw === minRaw) return Math.round((min + max) / 2);
  const t = (score - minRaw) / (maxRaw - minRaw);
  return Math.round(min + t * (max - min));
}

// Render a player's structured explanation into compact, scannable HTML:
// a summary line, 2–4 labeled evidence lines, and a bottom-line interpretation.
function explanationMarkup(ex) {
  const rows = ex.evidence.map(e =>
    `<li class="ex-row"><span class="ex-key">${e.label}</span><span class="ex-text">${e.text}</span></li>`).join('');
  return `<p class="ex-summary">${ex.summary}</p>` +
    `<ul class="ex-evidence">${rows}</ul>` +
    `<p class="ex-final">${ex.final}</p>`;
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
    return { player: p, pProfile, rawScore: score, reasons, layers };
  });

  if (scored.length === 0) return { profile, ranked: [] };

  const rawScores = scored.map(s => s.rawScore);
  const minRaw = Math.min(...rawScores);
  const maxRaw = Math.max(...rawScores);

  // Percentages are language-independent; reason text is built at render time
  // so a language toggle re-flows it without recomputing the ranking.
  scored.forEach(s => { s.percent = toPercent(s.rawScore, config, minRaw, maxRaw); });

  // Deterministic sort: score desc, then id asc for stable tie-breaks.
  scored.sort((a, b) => b.rawScore - a.rawScore || a.player.id.localeCompare(b.player.id));

  return { profile, ranked: scored.slice(0, 10) };
}

/* ---------------------------------------------------------------------
 * 5. Reading generator (bilingual, structured) + optional OpenAI polish
 *
 * buildReading() turns the deterministic profile + ranking into a rich,
 * layered "reading" in the CURRENT language: a confident main conclusion,
 * a four-layer reasoned explanation (elemental temperament, zodiac/branch
 * interaction, star-mansion aura, Ten-God viewing lens), an event-aura fit,
 * and a player-fit paragraph. The scoring is untouched — this is pure
 * interpretation, rebuilt on the fly whenever the language changes.
 * ------------------------------------------------------------------- */

// The Ten-God "viewing lens" the viewer leans on, derived from the element
// their own chart most reinforces (relative to their day master).
function viewerLensGod(profile) {
  const dist = profile.chart.elementDist;
  const self = profile.elementIdx;
  let dom = -1, best = -1;
  for (let i = 0; i < 5; i++) {
    if (i === self) continue;
    if (dist[i] > best) { best = dist[i]; dom = i; }
  }
  if (dom < 0 || best === 0) dom = generates(self); // fallback: what the self element produces (output)
  return tenGod(self, dom);
}

// Confidence-aware, bilingual star-mansion clause. The 值日 mansion is fixed by
// the local civil date; the caveat is only about pinning that date and the 子時
// boundary when birth time / time zone are missing — never a fabricated value.
function mansionClause(profile) {
  const lunar = (typeof profile.lunarMonth === 'number')
    ? (CURRENT_LANG === 'zh'
        ? `农历${profile.lunarLeap ? '闰' : ''}${profile.lunarMonth}月${profile.lunarDay}日`
        : `lunar ${profile.lunarLeap ? 'leap ' : ''}month ${profile.lunarMonth} day ${profile.lunarDay}`)
    : '';
  if (profile.mansionExact) {
    return CURRENT_LANG === 'zh' ? `（宿曜经本命宿 · ${lunar}）` : `(宿曜経 birth mansion · ${lunar})`;
  }
  return CURRENT_LANG === 'zh'
    ? `（宿曜经本命宿 · ${lunar}；未设出生地时区，按 UTC+8 农历估算，置信度略低。）`
    : `(宿曜経 birth mansion · ${lunar}; birth-place time zone unset, estimated on the UTC+8 lunar calendar, slightly lower confidence.)`;
}

// Advanced "计算说明" breakdown — bilingual, includes the star system + the
// user's own 本命星宿 details. Kept out of the main card (collapsed by default).
function calcMarkup(profile) {
  const zh = CURRENT_LANG === 'zh';
  const cn = profile.mansion.cn;
  const lunar = (typeof profile.lunarMonth === 'number')
    ? (zh ? `农历${profile.lunarLeap ? '闰' : ''}${profile.lunarMonth}月${profile.lunarDay}日`
          : `lunar ${profile.lunarLeap ? 'leap ' : ''}month ${profile.lunarMonth} day ${profile.lunarDay}`)
    : '';
  const mer = (typeof profile.tzOffset === 'number') ? `UTC${profile.tzOffset >= 0 ? '+' : ''}${profile.tzOffset}` : 'UTC+8';
  const confPct = Math.round((profile.mansionConf || 0) * 100);
  if (zh) {
    return `
      <p>结果由四个独立层加权得出：<b>核心八字 55%</b> · <b>生肖（立春为界）20%</b> · <b>星宿 15%</b> · <b>时辰 10%</b>（缺时辰时其权重按比例分摊，不作惩罚）。</p>
      <h4>星宿层：本命星宿 + 星宿关系</h4>
      <ul>
        <li><b>本命星宿</b>采用<b>宿曜経</b>算法：把公历生日按出生地经度（默认 ${mer}）换算为<b>农历</b>（含闰月），再查月宿傍通暦定宿——并非现代月球黄经，也非自造循环。</li>
        <li><b>星宿关系</b>取自你提供的<b>星宿关系自查表</b>（唯一来源），并拆成三个维度：
          <ul>
            <li><b>关系家族</b>：荣亲 / 友衰 / 安坏 / 危成 / 业胎 / 命之星。</li>
            <li><b>关系位／角色</b>：每族分两端，如 荣↔亲、危↔成、业↔胎、友↔衰。这是一场<b>相性测试</b>，<b>方向敏感</b>——你在哪一端、他在哪一端，体验不同、分数不同（<b>你方权重更高</b>）。</li>
            <li><b>距离档</b>：按 <b>远 / 中 / 近</b> 排列——<b>近</b>即时上手，<b>中</b>适中稳定，<b>远</b>较缓但仍是底层牵引。</li>
          </ul>
        </li>
        <li>角色释义：<b>荣</b>=提升激活对方，<b>亲</b>=易亲近／被抬举；<b>安</b>=稳定，<b>坏</b>=消耗；<b>危</b>=压强刺激，<b>成</b>=促成结果；<b>业胎</b>=牵绊课题、黏性更强；<b>命之星</b>=宿命主线、核心共鸣；<b>友衰</b>=同侪呼应、力度偏软，并非单纯友情。星宿层仅作<b>辅助修正</b>，不喧宾夺主。</li>
      </ul>
      <p>你的本命星宿：<b>${cn}宿</b>（${lunar}，基准 ${mer}，置信度约 ${confPct}%）。每位选手的家族·你的角色·他的角色·距离档，见其卡片上的「星宿关系」一行。</p>
      <p class="calc__priv">🔒 全部计算在本浏览器完成，出生信息不上传、不保存、不记录。</p>`;
  }
  return `
      <p>The result is a weighted blend of four independent layers: <b>Core BaZi 55%</b> · <b>Chinese zodiac (Li Chun boundary) 20%</b> · <b>Star mansion 15%</b> · <b>Birth hour 10%</b> (its weight is shared out, never penalised, when the hour is unknown).</p>
      <h4>Star layer: 本命星宿 + 星宿关系</h4>
      <ul>
        <li><b>Natal mansion (本命星宿)</b> uses the <b>宿曜経</b> method: your Gregorian date is converted to the Chinese lunar calendar (leap months included) at your birth-place meridian (default ${mer}), then read from the 月宿傍通暦 table — not modern Moon longitude, not a custom cycle.</li>
        <li><b>Star relationship (星宿关系)</b> comes straight from the supplied <b>星宿关系自查表</b> (the single source of truth), split into three dimensions:
          <ul>
            <li><b>Family</b>: 荣亲 / 友衰 / 安坏 / 危成 / 业胎 / 命之星.</li>
            <li><b>Role / position</b>: each family has two sides — 荣↔亲, 危↔成, 业↔胎, 友↔衰. This is a <b>compatibility test</b>, so it is <b>directional</b>: which side <i>you</i> occupy vs the player is a different experience and a different score (<b>your side weighted higher</b>).</li>
            <li><b>Distance tier</b>, in the canonical order <b>远 / 中 / 近</b> — <b>近</b> is immediate & fast-activating, <b>中</b> is moderate & steady, <b>远</b> is slower but still a background pull.</li>
          </ul>
        </li>
        <li>Roles: <b>荣</b> elevates/activates the other · <b>亲</b> is approachable / lifted; <b>安</b> grounds · <b>坏</b> drains; <b>危</b> pressures/stimulates · <b>成</b> makes results land; <b>业胎</b> = a binding, karmic task (stickier); <b>命之星</b> = a fate main-line, central resonance; <b>友衰</b> = a peer echo, softer force (not plain friendship). The star layer is only a supporting modifier.</li>
      </ul>
      <p>Your natal mansion: <b>${cn}宿</b> (${lunar}, meridian ${mer}, confidence ≈ ${confPct}%). Each player's family · your role · their role · distance tier is shown on their card's “星宿关系” line.</p>
      <p class="calc__priv">🔒 Everything is computed in your browser; birth details are never uploaded, saved, or logged.</p>`;
}

function buildReading(profile, ranked) {
  const R = READING;
  const e = profile.elementIdx;
  const palace = Math.floor(profile.mansionIdx / 7);
  const cn = profile.mansion.cn;

  // ----- Main conclusion -----
  const conclusion = {
    title: tr(R.archetype[e]),
    sub: tr(R.archetypeSub[e])
  };
  const chips = [
    `${READING.elementCN[e]}${CURRENT_LANG === 'zh' ? '' : ' ' + profile.element.en}`,
    CURRENT_LANG === 'zh' ? profile.zodiacChar : profile.zodiacEn,
    `${cn}${CURRENT_LANG === 'zh' ? '宿' : '宿'}`,
    tr(profile.yin ? R.temper.yin : R.temper.yang)
  ];

  // ----- Bridging identity line -----
  const summary = CURRENT_LANG === 'zh'
    ? `命盘：${profile.stemArchetype}（${profile.element.cn}），属${profile.zodiacChar}，主星 ${cn}宿——这正是塑造你观赛口味的底色。`
    : `Chart: a ${profile.stemArchetype} (${profile.element.en}), a ${profile.zodiacEn}, under the ${cn}宿 mansion — the base note that shapes your viewing taste.`;

  // ----- Four-layer reasoned explanation -----
  const lens = viewerLensGod(profile);
  const mClause = mansionClause(profile);
  const mansionBody = CURRENT_LANG === 'zh'
    ? `${cn}宿——${tr(R.palace[palace])}${mClause}`
    : `${cn}宿 (${profile.mansion.palace}) — ${tr(R.palace[palace])} ${mClause}`.trim();
  const viewingBody = CURRENT_LANG === 'zh'
    ? `你偏爱${tr(R.tenGod[lens])}`
    : `You gravitate to ${tr(R.tenGod[lens])}`;

  const layers = [
    { title: tr(R.layerTitle.temperament), body: tr(R.temperament[e]) },
    { title: tr(R.layerTitle.zodiac), body: tr(R.zodiac[profile.zodiacIdx]) },
    { title: tr(R.layerTitle.mansion), body: mansionBody },
    { title: tr(R.layerTitle.viewing), body: viewingBody }
  ];

  // ----- Event-aura fit -----
  const auraKeys = R.aura[e].chips.slice();
  const pc = R.palaceChip[palace];
  if (!auraKeys.includes(pc) && auraKeys.length < 3) auraKeys.push(pc);
  const aura = {
    chips: auraKeys.map(k => tr(R.auraChip[k])),
    body: tr(R.aura[e])
  };

  // ----- Player fit -----
  const top = (ranked || []).slice(0, 3);
  let playerFit = '';
  if (top.length) {
    const sep = CURRENT_LANG === 'zh' ? '、' : ', ';
    const names = top.map(r => r.player.name).join(sep);
    const gods = top.map(r => { const x = r.reasons.find(y => y.kind === 'element'); return x && x.god; }).filter(Boolean);
    const domGod = mode(gods) || 'resource';
    const tags = top.flatMap(r => r.player.tags || []);
    const domTag = mode(tags) || 'mechanical';
    const lensShort = tr(R.tenGodShort[domGod]);
    const tagLabel = tr(R.tag[domTag] || { en: domTag, zh: domTag });
    const tmpl = tr(top.length > 1 ? R.playerFit.body : R.playerFit.bodyOne);
    playerFit = tmpl.replace('{names}', names).replace('{lens}', lensShort).replace('{tag}', tagLabel);
  }

  return {
    archetypeTitle: profile.stemArchetype,
    mansionTitle: `${cn}宿型`,
    conclusion, chips, summary, layers, aura, playerFit
  };
}

// Optional OpenAI polish. NEVER changes the ranking or numbers — text only.
// Requires a user-provided key stored in localStorage. Fails safe to local copy.
// Polishes the current-language reading (conclusion + layer bodies + aura +
// player-fit), keeping metaphysical labels and structure intact.
async function polishWithOpenAI(narrative, ranked, profile) {
  const key = (localStorage.getItem('edm_openai_key') || '').trim();
  if (!key) return narrative; // no key -> local reading, app still fully works

  const langName = CURRENT_LANG === 'zh' ? 'Simplified Chinese' : 'English';
  const payload = {
    conclusionSub: narrative.conclusion.sub,
    summary: narrative.summary,
    layers: narrative.layers.map(l => l.body),
    aura: narrative.aura.body,
    playerFit: narrative.playerFit
  };
  const prompt =
    `You are a playful yet precise esports metaphysics writer. The theme is which pros the reader is FATED TO WATCH — ` +
    `audience resonance, viewing style, and event aura — never romance or dating. Write in ${langName}. ` +
    `Do NOT change any numbers, names, rankings, or the metaphysical terms (Five Elements, zodiac, 宿, Ten Gods). ` +
    `Rewrite ONLY the wording to be elegant, grounded and vivid — keep each field roughly the same length. ` +
    `Return strict JSON with the SAME keys and array lengths as this input:\n${JSON.stringify(payload)}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You polish copy. You never invent rankings, names, or numbers, and you preserve JSON shape.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    if (!res.ok) throw new Error('OpenAI ' + res.status);
    const json = await res.json();
    const parsed = JSON.parse(json.choices?.[0]?.message?.content || '{}');
    const layers = narrative.layers.map((l, i) => ({
      title: l.title,
      body: (Array.isArray(parsed.layers) && parsed.layers[i]) || l.body
    }));
    return {
      ...narrative,
      conclusion: { title: narrative.conclusion.title, sub: parsed.conclusionSub || narrative.conclusion.sub },
      summary: parsed.summary || narrative.summary,
      layers,
      aura: { chips: narrative.aura.chips, body: parsed.aura || narrative.aura.body },
      playerFit: parsed.playerFit || narrative.playerFit
    };
  } catch (err) {
    console.warn('OpenAI polish failed, using local reading:', err);
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
  const [gamesRes, playersRes, configRes, starRes] = await Promise.all([
    fetch('data/games.json'),
    fetch('data/players.json'),
    fetch('data/config.json'),
    fetch('data/star_relations.json')
  ]);
  if (!gamesRes.ok || !playersRes.ok || !configRes.ok) {
    throw new Error('Failed to load data files. If opening locally, run a static server (see README).');
  }
  const games = (await gamesRes.json()).games;
  const players = (await playersRes.json()).players;
  const config = await configRes.json();
  // 星宿关系 table — the source of truth for the star-relationship layer.
  if (starRes.ok) { try { STAR_REL = await starRes.json(); } catch (_) { STAR_REL = null; } }

  const issues = validatePlayers(players);
  if (issues.length) console.warn('Player data validation issues:\n' + issues.join('\n'));

  return { games, players, config, starRel: STAR_REL, validationIssues: issues };
}

/* ---------------------------------------------------------------------
 * 8. UI wiring
 * ------------------------------------------------------------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

let DATA = null;
let LAST_RESULT = null;

/* ---- i18n runtime ---- */
const I18N = (typeof window !== 'undefined' && window.EDM_I18N) || { en: {}, zh: {} };
const READING = (typeof window !== 'undefined' && window.EDM_READING) || {};
let CURRENT_LANG = 'zh';

function getLang() {
  try { const s = localStorage.getItem('edm_lang'); if (s === 'en' || s === 'zh') return s; } catch (_) {}
  return 'zh';
}
// Translate a static UI key.
function t(key) {
  const table = I18N[CURRENT_LANG] || {};
  return (key in table) ? table[key] : ((I18N.en && I18N.en[key]) || key);
}
// Pick a language field from a bilingual reading object {en, zh}.
function tr(obj) {
  if (!obj) return '';
  return obj[CURRENT_LANG] != null ? obj[CURRENT_LANG] : (obj.en || '');
}

// Apply all static translations to the DOM for the current language.
function applyI18n() {
  document.documentElement.lang = CURRENT_LANG;
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  $$('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  $$('[data-i18n-ph]').forEach(el => { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph'))); });
  $$('.lang-btn').forEach(b => b.classList.toggle('is-active', b.dataset.lang === CURRENT_LANG));
}

function setLang(lang) {
  if (lang !== 'en' && lang !== 'zh') return;
  CURRENT_LANG = lang;
  try { localStorage.setItem('edm_lang', lang); } catch (_) {}
  applyI18n();
  // Re-render a shown result in the new language (deterministic, no recompute).
  if (LAST_RESULT && !$('#resultSection').hidden) {
    const narrative = buildReading(LAST_RESULT.result.profile, LAST_RESULT.result.ranked);
    renderResult(narrative, LAST_RESULT.result);
  }
}

// Most-frequent value in an array (stable: first-seen wins ties).
function mode(arr) {
  const c = new Map();
  arr.forEach(v => c.set(v, (c.get(v) || 0) + 1));
  let best = null, bestN = -1;
  for (const [k, n] of c) if (n > bestN) { best = k; bestN = n; }
  return best;
}

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
      `<span class="game-chip__name" data-i18n="game.${g.id}">${g.name}</span>`;
    wrap.appendChild(label);
  });
  applyI18n();
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

  // Identity cards
  $('#archetypeLabel').textContent = narrative.archetypeTitle;
  $('#archetypeEmoji').textContent = profile.element.emoji;
  $('#archetypeCard').style.setProperty('--accent', profile.element.color);
  $('#mansionLabel').textContent = narrative.mansionTitle;
  // #mansionSub label ("Star Mansion"/"星宿") is handled by applyI18n.

  // Main conclusion
  $('#conclusionTitle').textContent = narrative.conclusion.title;
  $('#conclusionSub').textContent = narrative.conclusion.sub;
  $('#conclusionChips').innerHTML = (narrative.chips || [])
    .map(c => `<span class="ct-chip">${c}</span>`).join('');

  $('#summaryText').textContent = narrative.summary;

  // Layered, reasoned explanation
  $('#layerBlocks').innerHTML = narrative.layers.map((l, i) => `
    <div class="layer" style="animation-delay:${i * 60}ms">
      <span class="layer__n">${i + 1}</span>
      <div class="layer__main">
        <h4 class="layer__title">${l.title}</h4>
        <p class="layer__body">${l.body}</p>
      </div>
    </div>`).join('');

  // Event-aura fit
  $('#auraChips').innerHTML = (narrative.aura.chips || [])
    .map(c => `<span class="aura-chip">${c}</span>`).join('');
  $('#auraBody').textContent = narrative.aura.body;

  // Player fit
  $('#playerFitBody').textContent = narrative.playerFit;

  // Advanced calculation breakdown (计算说明)
  const calc = $('#calcBody');
  if (calc) calc.innerHTML = calcMarkup(profile);

  // Featured #1 — hero treatment for the top destined pro.
  const featured = $('#featuredMatch');
  if (featured) {
    if (ranked.length) {
      const r0 = ranked[0], p0 = r0.player;
      const ex0 = explainPlayer(profile, r0.pProfile, p0, r0.reasons);
      featured.innerHTML = `
        <div class="featured__glow" aria-hidden="true"></div>
        <div class="featured__head">
          <div class="featured__avatar">${avatarMarkup(p0)}</div>
          <div class="featured__body">
            <div class="featured__top">
              <span class="featured__name">${p0.name}</span>
              ${gameBadge(p0.game)}
            </div>
            <div class="featured__meta"><span class="pl-role">${p0.role}</span> · ${regionLabel(p0)}${formatDate(p0.birthDate)}</div>
          </div>
          <div class="featured__score">
            <div class="featured__pct">${r0.percent}<span>%</span></div>
            <div class="featured__label">${t('result.destiny')}</div>
          </div>
        </div>
        <div class="featured__explain pl-explain">${explanationMarkup(ex0)}</div>`;
    } else {
      featured.innerHTML = '';
    }
  }

  // Ranked players (2–10). #1 is featured above.
  const list = $('#playerList');
  list.innerHTML = '';
  ranked.slice(1).forEach((r, i) => {
    const rank = i + 2;
    const p = r.player;
    const ex = explainPlayer(profile, r.pProfile, p, r.reasons);
    const li = document.createElement('li');
    li.className = 'player-row';
    li.style.animationDelay = (i * 50) + 'ms';
    li.innerHTML = `
      <div class="pl-head">
        <div class="pl-rank">${rank}</div>
        <div class="pl-avatar">${avatarMarkup(p)}</div>
        <div class="pl-main">
          <div class="pl-top">
            <span class="pl-name">${p.name}</span>
            ${gameBadge(p.game)}
            <span class="pl-role">${p.role}</span>
          </div>
          <div class="pl-meta">${regionLabel(p)}${formatDate(p.birthDate)}</div>
        </div>
        <div class="pl-score">
          <div class="pl-score__num">${r.percent}<span>%</span></div>
          <div class="pl-score__bar"><span style="width:${r.percent}%"></span></div>
        </div>
      </div>
      <div class="pl-explain">${explanationMarkup(ex)}</div>`;
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
  if (CURRENT_LANG === 'zh') {
    return `🔮 电竞命盘\n` +
      `我是「${narrative.conclusion.title}」· ${narrative.archetypeTitle} · ${narrative.mansionTitle}\n` +
      `${narrative.conclusion.sub}\n\n我的头号命定选手：\n${top3}\n\n#电竞命盘 #EsportsDestinyMatch`;
  }
  return `🔮 Esports Destiny Match\n` +
    `I'm a ${narrative.conclusion.title} · ${narrative.archetypeTitle} · ${narrative.mansionTitle}\n` +
    `${narrative.conclusion.sub}\n\nMy top destined pros:\n${top3}\n\n#EsportsDestinyMatch`;
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
  const yeziEnabled = !!($('#yeziEnable') || {}).checked;
  const opts = { tzOffset, approx, trueSolar, yeziEnabled };

  const err = $('#formError');
  err.textContent = '';
  if (!birthDate) { err.textContent = t('err.date'); return; }
  if (selectedGames.length < 1) { err.textContent = t('err.games'); return; }

  const btn = $('#submitBtn');
  btn.disabled = true;
  btn.classList.add('is-loading');

  try {
    const result = runMatch(birthDate, birthTime, gender, selectedGames, DATA, opts);
    if (result.ranked.length === 0) {
      err.textContent = t('err.none');
      return;
    }
    // Local reading first (guaranteed, current language), then optional polish.
    let narrative = buildReading(result.profile, result.ranked);
    renderResult(narrative, result); // show immediately with local copy

    // PRIVACY: birth data is computed entirely in-browser and NEVER persisted.
    // We do not save the birth date/time/place or any other sensitive input to
    // localStorage, a backend, or analytics. Only the language choice is stored
    // (see setLang). Nothing here writes birth data anywhere.

    // Fire-and-refresh optional polish
    const polished = await polishWithOpenAI(narrative, result.ranked, result.profile);
    if (polished !== narrative) renderResult(polished, result);
  } catch (ex) {
    console.error(ex);
    err.textContent = t('err.fail');
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
      flash($('#copyBtn'), t('share.copied'));
    } catch {
      $('#shareText').select();
      document.execCommand && document.execCommand('copy');
      flash($('#copyBtn'), t('share.copied'));
    }
  });

  // Language switch
  $$('.lang-btn').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

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
    if (val.trim()) { localStorage.setItem('edm_openai_key', val.trim()); flash($('#aiKeyBtn'), t('share.aiOn')); }
    else { localStorage.removeItem('edm_openai_key'); flash($('#aiKeyBtn'), t('share.aiOff')); }
  });
}

function flash(btn, msg) {
  const old = btn.textContent;
  btn.textContent = msg;
  btn.classList.add('is-flash');
  setTimeout(() => { btn.textContent = old; btn.classList.remove('is-flash'); }, 1400);
}

// PRIVACY: birth inputs are intentionally NOT remembered. We removed the old
// "restore last inputs" feature so no sensitive birth data is written to
// localStorage. Any legacy key from a previous version is proactively cleared.
function restoreLast() {
  try { localStorage.removeItem('edm_last'); } catch (_) {}
}

/* ---------------------------------------------------------------------
 * 9b. Submit-a-player contribution flow (static, review-queue based)
 *
 * Nothing here ever writes players.json. A submission is: (1) sanitized and
 * validated, (2) appended to a local pending queue (localStorage), and (3)
 * routed for review — either by opening a prefilled GitHub Issue (the intake
 * for the moderation workflow) or copied as JSON for a manual PR into
 * data/submissions.json. Unverified data never reaches the live database.
 * ------------------------------------------------------------------- */
const SUBMIT_REPO = 'yel792922-cloud/esportplayeraitest';

// Strip anything that could break out of text/markdown; collapse whitespace.
function sanitizeField(v, max) {
  return String(v == null ? '' : v)
    .replace(/[<>]/g, '')          // no angle brackets (HTML/markdown safety)
    .replace(/[\r\n]+/g, ' ')       // single-line
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max || 300);
}

function collectSubmission() {
  const gamePick = ($('#sfGame') || {}).value || '';
  const gameMeta = (DATA && DATA.games.find(g => g.id === gamePick)) || null;
  const dateRaw = (($('#sfDate') || {}).value || '').trim();
  return {
    name: sanitizeField(($('#sfName') || {}).value, 60),
    game: gamePick,
    gameName: gameMeta ? gameMeta.name : gamePick,
    role: sanitizeField(($('#sfRole') || {}).value, 40),
    birthDate: dateRaw,
    birthTime: (($('#sfTime') || {}).value || '').trim(),
    competition_region: sanitizeField(($('#sfRegion') || {}).value, 40),
    source: sanitizeField(($('#sfSource') || {}).value, 300),
    note: sanitizeField(($('#sfNote') || {}).value, 500),
    submittedAt: new Date().toISOString(),
    status: 'pending'
  };
}

function validateSubmission(s) {
  if (!s.name) return t('submit.errName');
  if (!s.game) return t('submit.errGame');
  if (!s.source) return t('submit.errSource');
  if (s.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(s.birthDate)) return t('submit.errDate');
  if (s.birthDate && Number.isNaN(new Date(s.birthDate + 'T00:00:00').getTime())) return t('submit.errDate');
  return null;
}

function githubIssueUrl(s) {
  const title = `[player-submission] ${s.name} (${s.gameName})`;
  const body =
    `### Player submission\n\n` +
    `- **Name:** ${s.name}\n` +
    `- **Game:** ${s.gameName} (\`${s.game}\`)\n` +
    `- **Role:** ${s.role || '—'}\n` +
    `- **Birth date:** ${s.birthDate || '—'}\n` +
    `- **Birth time:** ${s.birthTime || '—'}\n` +
    `- **Competition region:** ${s.competition_region || '—'}\n` +
    `- **Source:** ${s.source}\n` +
    `- **Note:** ${s.note || '—'}\n\n` +
    `\`\`\`json\n${JSON.stringify(s, null, 2)}\n\`\`\`\n\n` +
    `_Submitted via the in-app "Suggest a player" form. Review before merging into data/players.json._`;
  return `https://github.com/${SUBMIT_REPO}/issues/new?labels=player-submission&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

function saveSubmissionLocally(s) {
  try {
    const key = 'edm_submissions';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push(s);
    localStorage.setItem(key, JSON.stringify(list.slice(-50)));
  } catch (_) {}
}

function wireSubmitFeature() {
  const dlg = $('#submitDialog');
  if (!dlg || !dlg.showModal) return; // <dialog> unsupported → feature simply absent

  // Populate the game select from the live games list.
  const sel = $('#sfGame');
  if (sel) {
    DATA.games.filter(g => g.enabled).forEach(g => {
      const o = document.createElement('option');
      o.value = g.id;
      o.textContent = g.name;
      o.setAttribute('data-i18n', `game.${g.id}`);
      sel.appendChild(o);
    });
  }

  const open = () => {
    $('#submitForm').reset();
    $('#sfError').textContent = '';
    $('#sfDone').hidden = true;
    $('#sfGh').hidden = true;
    $('#sfCopy').hidden = true;
    pending = null;
    applyI18n();
    dlg.showModal();
  };
  const close = () => dlg.close();
  ['#suggestBtn', '#suggestBtnFoot'].forEach(id => { const b = $(id); if (b) b.addEventListener('click', open); });
  $('#submitClose').addEventListener('click', close);
  $('#sfCancel').addEventListener('click', close);
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); }); // backdrop click

  let pending = null;
  $('#submitForm').addEventListener('submit', e => {
    e.preventDefault();
    const s = collectSubmission();
    const errMsg = validateSubmission(s);
    const err = $('#sfError');
    if (errMsg) { err.textContent = errMsg; return; }
    err.textContent = '';
    pending = s;
    saveSubmissionLocally(s);                 // local pending queue
    $('#sfGh').setAttribute('href', githubIssueUrl(s));
    $('#sfGh').hidden = false;
    $('#sfCopy').hidden = false;
    const done = $('#sfDone');
    done.textContent = t('submit.done');
    done.hidden = false;
  });

  $('#sfCopy').addEventListener('click', async () => {
    if (!pending) return;
    const json = JSON.stringify(pending, null, 2);
    try { await navigator.clipboard.writeText(json); }
    catch (_) { /* ignore */ }
    flash($('#sfCopy'), t('submit.copied'));
  });
}

async function init() {
  try {
    // Language first, so the very first paint is localized. Default: Chinese.
    CURRENT_LANG = getLang();
    applyI18n();

    DATA = await loadData();
    initGameCheckboxes(DATA.games);
    wireStaticButtons();
    wireSubmitFeature();
    $('#matchForm').addEventListener('submit', onSubmit);
    restoreLast();
    if (DATA.validationIssues.length) {
      $('#dataNote').textContent = CURRENT_LANG === 'zh'
        ? `提示：${DATA.validationIssues.length} 条数据校验警告——详见控制台。`
        : `Note: ${DATA.validationIssues.length} data validation warning(s) — see console.`;
    }
  } catch (ex) {
    console.error(ex);
    const banner = $('#loadError');
    if (banner) { banner.hidden = false; banner.textContent = ex.message; }
  }
}

document.addEventListener('DOMContentLoaded', init);
