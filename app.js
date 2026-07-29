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

// Element cycles
const generates = (e) => (e + 1) % 5; // e生X : Wood->Fire->Earth->Metal->Water
const controls  = (e) => (e + 2) % 5; // e克X : Wood->Earth->Water->Fire->Metal

// Branch relationship sets (by index into BRANCHES)
const SIX_HARMONY = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
const TRINE_GROUPS = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]]; // water/wood/fire/metal frames
const SIX_HARM = { 0: 7, 7: 0, 1: 6, 6: 1, 2: 5, 5: 2, 3: 4, 4: 3, 8: 11, 11: 8, 9: 10, 10: 9 };

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

// Compute the compact archetype numbers from a date (+ optional hour).
// Calibrated for a stable, symbolic experience — not precise astronomy.
function pillarsFromDate(year, month, day, hour) {
  const jdn = julianDayNumber(year, month, day);

  // Sexagenary day index (0..59), 0 == 甲子. Anchor chosen so the cycle is stable.
  const sexagenary = ((jdn + 49) % 60 + 60) % 60;
  let stemIdx = sexagenary % 10;
  let branchIdx = sexagenary % 12;

  // Optional birth hour nudges the branch toward its two-hour 时辰 slot,
  // giving birth time a small but real influence without extra UI.
  if (typeof hour === 'number' && !Number.isNaN(hour)) {
    const hourBranch = Math.floor(((hour + 1) % 24) / 2); // 23:00-01:00 -> 子(0)
    // blend: keep day branch but let the hour branch break ties in scoring
    branchIdx = branchIdx; // day branch stays the identity anchor
    return { stemIdx, branchIdx, hourBranchIdx: hourBranch, mansionIdx: ((jdn + 3) % 28 + 28) % 28 };
  }

  const mansionIdx = ((jdn + 3) % 28 + 28) % 28;
  return { stemIdx, branchIdx, hourBranchIdx: null, mansionIdx };
}

// Build a full archetype profile object from raw birth inputs.
function buildProfile(birthDate, birthTime, gender) {
  const [y, m, d] = birthDate.split('-').map(Number);
  let hour = null;
  if (birthTime && /^\d{1,2}:\d{2}$/.test(birthTime)) hour = Number(birthTime.split(':')[0]);

  const p = pillarsFromDate(y, m, d, hour);
  const elementIdx = STEM_ELEMENT[p.stemIdx];

  return {
    birthDate,
    birthTime: birthTime || null,
    gender: gender || 'unspecified',
    stemIdx: p.stemIdx,
    stemChar: STEMS[p.stemIdx],
    stemArchetype: STEM_ARCHETYPE[p.stemIdx],
    yin: STEM_YIN[p.stemIdx] === 1,
    elementIdx,
    element: ELEMENTS[elementIdx],
    branchIdx: p.branchIdx,
    branchChar: BRANCHES[p.branchIdx],
    hourBranchIdx: p.hourBranchIdx,
    mansionIdx: p.mansionIdx,
    mansion: MANSIONS[p.mansionIdx]
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

function scorePlayer(profile, player, config, selectedGames) {
  const w = config.weights;
  let score = config.base;
  const reasons = []; // structured contributors, strongest first

  // --- Element / Ten-God relationship (the heart of the match) ---
  const pPillars = pillarsFromDate(...player.birthDate.split('-').map(Number), null);
  const pElementIdx = STEM_ELEMENT[pPillars.stemIdx];
  const god = tenGod(profile.elementIdx, pElementIdx);

  const elementWeightKey = {
    companion: 'elementSame',
    output: 'elementOutput',
    resource: 'elementResource',
    wealth: 'elementWealth',
    authority: 'elementAuthority'
  }[god];
  const elemPts = w[elementWeightKey] || 0;
  score += elemPts;
  reasons.push({
    pts: elemPts,
    kind: 'element',
    god,
    text: `${TEN_GOD_DESC[god]} (${ELEMENTS[pElementIdx].cn}·${TEN_GOD_CN[god]})`
  });

  // --- Earthly Branch relationship ---
  const uBranch = profile.branchIdx;
  const pBranch = pPillars.branchIdx;
  if (uBranch === pBranch) {
    score += w.branchSame;
    reasons.push({ pts: w.branchSame, kind: 'branch', text: `a shared ${BRANCHES[uBranch]} branch — parallel instincts` });
  } else if (SIX_HARMONY[uBranch] === pBranch) {
    score += w.branchSixHarmony;
    reasons.push({ pts: w.branchSixHarmony, kind: 'branch', text: `a ${BRANCHES[uBranch]}·${BRANCHES[pBranch]} six-harmony bond` });
  } else if (branchesInSameTrine(uBranch, pBranch)) {
    score += w.branchTrine;
    reasons.push({ pts: w.branchTrine, kind: 'branch', text: `a three-harmony (三合) alignment of timing` });
  } else if (branchClash(uBranch, pBranch)) {
    score += w.branchClash;
    reasons.push({ pts: w.branchClash, kind: 'branch', text: `a spark of ${BRANCHES[uBranch]}·${BRANCHES[pBranch]} clash — thrilling but volatile` });
  } else if (SIX_HARM[uBranch] === pBranch) {
    score += w.branchHarm;
  }

  // Optional birth-hour tie-breaker: hour branch harmony gives a tiny nudge.
  if (profile.hourBranchIdx !== null) {
    if (SIX_HARMONY[profile.hourBranchIdx] === pBranch || profile.hourBranchIdx === pBranch) {
      score += 3;
    }
  }

  // --- Lunar mansion resonance ---
  if (profile.mansionIdx === pPillars.mansionIdx) {
    score += w.mansionExact;
    reasons.push({ pts: w.mansionExact, kind: 'mansion', text: `the same ${MANSIONS[profile.mansionIdx].cn}宿 star mansion` });
  } else if (MANSIONS[profile.mansionIdx].palace === MANSIONS[pPillars.mansionIdx].palace) {
    score += w.mansionSamePalace;
    reasons.push({ pts: w.mansionSamePalace, kind: 'mansion', text: `a shared ${MANSIONS[profile.mansionIdx].palace} palace of stars` });
  }

  // --- Yin/Yang + gender flavor (small, symbolic) ---
  const pYin = STEM_YIN[pPillars.stemIdx] === 1;
  if (pYin !== profile.yin) score += w.yinYangComplement;
  else score += w.yinYangSame;
  if ((profile.gender === 'female' && !profile.yin) || (profile.gender === 'male' && profile.yin)) {
    score += w.genderAlign; // gentle complementary nudge
  }

  // --- Tag affinity from the Ten-God flavor ---
  const preferred = (config.tenGodTags && config.tenGodTags[god]) || [];
  let tagPts = 0;
  const matchedTags = [];
  (player.tags || []).forEach(t => {
    if (preferred.includes(t)) { tagPts += w.tagAffinityPerMatch; matchedTags.push(t); }
  });
  tagPts = Math.min(tagPts, w.tagAffinityCap);
  score += tagPts;
  if (matchedTags.length) {
    reasons.push({ pts: tagPts, kind: 'tag', text: `${matchedTags.slice(0, 2).join(' & ')} energy that matches your ${TEN_GOD_CN[god]} nature` });
  }

  // --- Optional game affinity bias ---
  const ga = config.gameAffinity && config.gameAffinity.byElement && config.gameAffinity.byElement[profile.element.key];
  if (ga && typeof ga[player.game] === 'number') score += ga[player.game];

  return { score, reasons };
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

function runMatch(birthDate, birthTime, gender, selectedGames, data) {
  const { players, config } = data;
  const profile = buildProfile(birthDate, birthTime, gender);

  // Only rank players whose birth date is a valid YYYY-MM-DD. Anchor records
  // (e.g. Worlds winners) whose birth date could not be reliably verified may
  // live in the dataset with birthDate: null — they stay in the DB but are
  // skipped from scoring rather than producing a bogus result.
  const pool = players.filter(p =>
    selectedGames.includes(p.game) && /^\d{4}-\d{2}-\d{2}$/.test(p.birthDate || ''));

  const scored = pool.map(p => {
    const { score, reasons } = scorePlayer(profile, p, config, selectedGames);
    return { player: p, rawScore: score, reasons };
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
  const gameNames = selectedGames.map(id => (gamesMeta.find(g => g.id === id) || {}).name).filter(Boolean);
  const mansion = profile.mansion;
  const flavor = MANSION_FLAVOR[mansion.cn] || 'a rare and singular star-signature';

  const summary =
    `You are a ${profile.stemArchetype} with the mark of ${mansion.cn}宿 — ${flavor}.`;

  const watch =
    `Your ${el.cn}${el.emoji} nature draws you to ${gameNames.length ? gameNames.join(' / ') : 'the arena'}. ` +
    `You're happiest watching ${styleForElement(profile.elementIdx)} — the kind of series where ${profile.mansion.palace} energy decides the game.`;

  const why =
    `Your day-master reads as ${profile.stemChar}${el.cn} (${el.en}), sitting on the ${profile.branchChar} branch, under the ${mansion.cn} mansion of the ${mansion.palace}. ` +
    `In this symbolic system, that pairing pulls you toward players whose charts ${relationHint(profile.elementIdx)} yours — which is exactly how the ranking below was drawn.`;

  return { archetypeTitle: profile.stemArchetype, mansionTitle: `${mansion.cn}宿型`, summary, watch, why };
}

function styleForElement(e) {
  return [
    'patient macro games that snowball from a single opening',   // wood
    'explosive, high-tempo firefights and aggressive dives',      // fire
    'grinding, attrition-heavy series won on discipline',         // earth
    'clean, mechanical, pixel-perfect duels',                     // metal
    'fluid, unpredictable games full of flanks and comebacks'     // water
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
    `archetypeTitle, mansionTitle, summary, watch, why.\n\n` +
    `Archetype: ${narrative.archetypeTitle}\nMansion: ${narrative.mansionTitle}\n` +
    `summary: ${narrative.summary}\nwatch: ${narrative.watch}\nwhy: ${narrative.why}\n\n` +
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
      watch: parsed.watch || narrative.watch,
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
  $('#watchText').textContent = narrative.watch;
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

  const err = $('#formError');
  err.textContent = '';
  if (!birthDate) { err.textContent = 'Please enter your birth date.'; return; }
  if (selectedGames.length < 1) { err.textContent = 'Pick at least one game (up to 4).'; return; }

  const btn = $('#submitBtn');
  btn.disabled = true;
  btn.classList.add('is-loading');

  try {
    const result = runMatch(birthDate, birthTime, gender, selectedGames, DATA);
    if (result.ranked.length === 0) {
      err.textContent = 'No players found for the selected games.';
      return;
    }
    // Local narrative first (guaranteed), then optional OpenAI polish.
    let narrative = localNarrative(result.profile, selectedGames, DATA.games);
    renderResult(narrative, result); // show immediately with local copy

    // Save last result
    try {
      localStorage.setItem('edm_last', JSON.stringify({ birthDate, birthTime, gender, selectedGames }));
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
