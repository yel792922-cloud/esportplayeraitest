/* =====================================================================
 * lunar.js — Chinese lunar-calendar conversion + 宿曜経 (Sukuyō) 本命星宿
 *
 * The 本命宿 (birth mansion) follows the 宿曜経 lineage — the same method the
 * Chinese app 爱占星 uses — NOT modern Moon longitude and NOT a self-consistent
 * custom cycle. It is a lunar-calendar lookup:
 *
 *   1. Convert the Gregorian birth date to the Chinese lunar calendar
 *      (农历/旧暦) — lunar month + lunar day, with leap months — at the
 *      birth-place meridian (default UTC+8, China Standard Time).
 *   2. Look up 本命宿 = SUKUYO_27[lunarMonth-1][lunarDay-1] in the classical
 *      27-宿 月宿傍通暦 table (昴-cycle, 牛宿 omitted).
 *
 * The lunar conversion is the standard astronomical "qreki" algorithm (major
 * solar terms 中気 + new moons 朔), ported verbatim from the public MIT-licensed
 * implementation used by shin_astrology (ryutabi), which reproduces 爱占星's
 * anchor 2000-03-01 → 虚宿. Boundary rules: the lunar day changes at local
 * midnight; true solar time is never applied; 夜子時 (23:00–24:00 → next day)
 * only when explicitly enabled.
 * ===================================================================== */
(function (root) {
  'use strict';
  const RAD = Math.PI / 180;

  // Meridian offset (hours east of UTC) used by the astronomy, set per call.
  let TZ = -8 / 24;     // internal fraction = -(meridianHours)/24
  let rm_sun0 = 0;

  const norm = (a) => a - 360 * Math.floor(a / 360);

  function longitudeSun(t) {
    let th = 0;
    th += 0.0004 * Math.cos(RAD * norm(31557 * t + 161));
    th += 0.0004 * Math.cos(RAD * norm(29930 * t + 48));
    th += 0.0005 * Math.cos(RAD * norm(2281 * t + 221));
    th += 0.0005 * Math.cos(RAD * norm(155 * t + 118));
    th += 0.0006 * Math.cos(RAD * norm(33718 * t + 316));
    th += 0.0007 * Math.cos(RAD * norm(9038 * t + 64));
    th += 0.0007 * Math.cos(RAD * norm(3035 * t + 110));
    th += 0.0007 * Math.cos(RAD * norm(65929 * t + 45));
    th += 0.0013 * Math.cos(RAD * norm(22519 * t + 352));
    th += 0.0015 * Math.cos(RAD * norm(45038 * t + 254));
    th += 0.0018 * Math.cos(RAD * norm(445267 * t + 208));
    th += 0.0018 * Math.cos(RAD * norm(19 * t + 159));
    th += 0.0020 * Math.cos(RAD * norm(32964 * t + 158));
    th += 0.0200 * Math.cos(RAD * norm(71998.1 * t + 265.1));
    let ang = norm(35999.05 * t + 267.52);
    th = th - 0.0048 * t * Math.cos(RAD * ang);
    th += 1.9147 * Math.cos(RAD * ang);
    ang = norm(36000.7695 * t);
    ang = norm(ang + 280.4659);
    return norm(th + ang);
  }

  function longitudeMoon(t) {
    let th = 0;
    th += 0.0003 * Math.cos(RAD * norm(2322131 * t + 191));
    th += 0.0003 * Math.cos(RAD * norm(4067 * t + 70));
    th += 0.0003 * Math.cos(RAD * norm(549197 * t + 220));
    th += 0.0003 * Math.cos(RAD * norm(1808933 * t + 58));
    th += 0.0003 * Math.cos(RAD * norm(349472 * t + 337));
    th += 0.0003 * Math.cos(RAD * norm(381404 * t + 354));
    th += 0.0003 * Math.cos(RAD * norm(958465 * t + 340));
    th += 0.0004 * Math.cos(RAD * norm(12006 * t + 187));
    th += 0.0004 * Math.cos(RAD * norm(39871 * t + 223));
    th += 0.0005 * Math.cos(RAD * norm(509131 * t + 242));
    th += 0.0005 * Math.cos(RAD * norm(1745069 * t + 24));
    th += 0.0005 * Math.cos(RAD * norm(1908795 * t + 90));
    th += 0.0006 * Math.cos(RAD * norm(2258267 * t + 156));
    th += 0.0006 * Math.cos(RAD * norm(111869 * t + 38));
    th += 0.0007 * Math.cos(RAD * norm(27864 * t + 127));
    th += 0.0007 * Math.cos(RAD * norm(485333 * t + 186));
    th += 0.0007 * Math.cos(RAD * norm(405201 * t + 50));
    th += 0.0007 * Math.cos(RAD * norm(790672 * t + 114));
    th += 0.0008 * Math.cos(RAD * norm(1403732 * t + 98));
    th += 0.0009 * Math.cos(RAD * norm(858602 * t + 129));
    th += 0.0011 * Math.cos(RAD * norm(1920802 * t + 186));
    th += 0.0012 * Math.cos(RAD * norm(1267871 * t + 249));
    th += 0.0016 * Math.cos(RAD * norm(1856938 * t + 152));
    th += 0.0018 * Math.cos(RAD * norm(401329 * t + 274));
    th += 0.0021 * Math.cos(RAD * norm(341337 * t + 16));
    th += 0.0021 * Math.cos(RAD * norm(71998 * t + 85));
    th += 0.0021 * Math.cos(RAD * norm(990397 * t + 357));
    th += 0.0022 * Math.cos(RAD * norm(818536 * t + 151));
    th += 0.0023 * Math.cos(RAD * norm(922466 * t + 163));
    th += 0.0024 * Math.cos(RAD * norm(99863 * t + 122));
    th += 0.0026 * Math.cos(RAD * norm(1379739 * t + 17));
    th += 0.0027 * Math.cos(RAD * norm(918399 * t + 182));
    th += 0.0028 * Math.cos(RAD * norm(1934 * t + 145));
    th += 0.0037 * Math.cos(RAD * norm(541062 * t + 259));
    th += 0.0038 * Math.cos(RAD * norm(1781068 * t + 21));
    th += 0.0040 * Math.cos(RAD * norm(133 * t + 29));
    th += 0.0040 * Math.cos(RAD * norm(1844932 * t + 56));
    th += 0.0040 * Math.cos(RAD * norm(1331734 * t + 283));
    th += 0.0050 * Math.cos(RAD * norm(481266 * t + 205));
    th += 0.0052 * Math.cos(RAD * norm(31932 * t + 107));
    th += 0.0068 * Math.cos(RAD * norm(926533 * t + 323));
    th += 0.0079 * Math.cos(RAD * norm(449334 * t + 188));
    th += 0.0085 * Math.cos(RAD * norm(826671 * t + 111));
    th += 0.0100 * Math.cos(RAD * norm(1431597 * t + 315));
    th += 0.0107 * Math.cos(RAD * norm(1303870 * t + 246));
    th += 0.0110 * Math.cos(RAD * norm(489205 * t + 142));
    th += 0.0125 * Math.cos(RAD * norm(1443603 * t + 52));
    th += 0.0154 * Math.cos(RAD * norm(75870 * t + 41));
    th += 0.0304 * Math.cos(RAD * norm(513197.9 * t + 222.5));
    th += 0.0347 * Math.cos(RAD * norm(445267.1 * t + 27.9));
    th += 0.0409 * Math.cos(RAD * norm(441199.8 * t + 47.4));
    th += 0.0458 * Math.cos(RAD * norm(854535.2 * t + 148.2));
    th += 0.0533 * Math.cos(RAD * norm(1367733.1 * t + 280.7));
    th += 0.0571 * Math.cos(RAD * norm(377336.3 * t + 13.2));
    th += 0.0588 * Math.cos(RAD * norm(63863.5 * t + 124.2));
    th += 0.1144 * Math.cos(RAD * norm(966404 * t + 276.5));
    th += 0.1851 * Math.cos(RAD * norm(35999.05 * t + 87.53));
    th += 0.2136 * Math.cos(RAD * norm(954397.74 * t + 179.93));
    th += 0.6583 * Math.cos(RAD * norm(890534.22 * t + 145.7));
    th += 1.2740 * Math.cos(RAD * norm(413335.35 * t + 10.74));
    th += 6.2888 * Math.cos(RAD * norm(477198.868 * t + 44.963));
    let ang = norm(481267.8809 * t);
    ang = norm(ang + 218.3162);
    return norm(th + ang);
  }

  // Instant (JD, meridian-local integer convention) of the major solar term
  // whose longitude is the largest multiple of `longitude` at/just before tm.
  function calcChu(tm, longitude) {
    let tm1 = Math.floor(tm);
    let tm2 = tm - tm1 + TZ;
    let t = (tm2 + 0.5) / 36525 + (tm1 - 2451545) / 36525;
    let rmSun = longitudeSun(t);
    rm_sun0 = longitude * Math.floor(rmSun / longitude);
    let d1 = 0, d2 = 1;
    while (Math.abs(d1 + d2) > 1 / 86400) {
      t = (tm2 + 0.5) / 36525 + (tm1 - 2451545) / 36525;
      rmSun = longitudeSun(t);
      let dr = rmSun - rm_sun0;
      if (dr > 180) dr -= 360; else if (dr < -180) dr += 360;
      d1 = Math.floor(dr * 365.2 / 360);
      d2 = dr * 365.2 / 360 - d1;
      tm1 -= d1; tm2 -= d2;
      if (tm2 < 0) { tm1 -= 1; tm2 += 1; }
    }
    return tm2 + tm1 - TZ;
  }

  // Instant (JD) of the new moon 朔 at/just before tm.
  function calcSaku(tm) {
    let tm1 = Math.floor(tm);
    let tm2 = tm - tm1 + TZ;
    let d1 = 0, d2 = 1;
    for (let lc = 1; Math.abs(d1 + d2) > 1 / 86400; lc++) {
      let t = (tm2 + 0.5) / 36525 + (tm1 - 2451545) / 36525;
      const rmSun = longitudeSun(t);
      const rmMoon = longitudeMoon(t);
      let dr = rmMoon - rmSun;
      if (lc === 1 && dr < 0) dr = norm(dr);
      else if (rmSun >= 0 && rmSun <= 20 && rmMoon >= 300) { dr = norm(dr); dr = 360 - dr; }
      else if (Math.abs(dr) > 40) dr = norm(dr);
      d1 = Math.floor(dr * 29.530589 / 360);
      d2 = dr * 29.530589 / 360 - d1;
      tm1 -= d1; tm2 -= d2;
      if (tm2 < 0) { tm1 -= 1; tm2 += 1; }
      if (lc === 15 && Math.abs(d1 + d2) > 1 / 86400) { tm1 = Math.floor(tm - 26); tm2 = 0; }
      else if (lc > 30 && Math.abs(d1 + d2) > 1 / 86400) { tm1 = tm; tm2 = 0; break; }
    }
    return tm2 + tm1 - TZ;
  }

  // Core qreki: given tm (meridian-local integer JD) → { month, day, isLeap }.
  function qreki(tm) {
    const chu = new Array(4);
    const saku = new Array(5);
    const m = [];
    for (let i = 0; i < 5; i++) m[i] = {};

    chu[0] = calcChu(tm, 90);
    m[0].month = Math.floor(rm_sun0 / 30) + 2;
    for (let i = 1; i < 4; i++) chu[i] = calcChu(chu[i - 1] + 32, 30);

    saku[0] = calcSaku(chu[0]);
    for (let i = 1; i < 5; i++) {
      saku[i] = calcSaku(saku[i - 1] + 30);
      if (Math.abs(Math.floor(saku[i - 1]) - Math.floor(saku[i])) <= 26) saku[i] = calcSaku(saku[i - 1] + 35);
    }
    if (Math.floor(saku[1]) <= Math.floor(chu[0])) {
      for (let i = 0; i < 4; i++) saku[i] = saku[i + 1];
      saku[4] = calcSaku(saku[3] + 35);
    } else if (Math.floor(saku[0]) > Math.floor(chu[0])) {
      for (let i = 4; i > 0; i--) saku[i] = saku[i - 1];
      saku[0] = calcSaku(saku[0] - 27);
    }

    let lap = Math.floor(saku[4]) <= Math.floor(chu[3]);
    m[0].isLeap = false;
    m[0].jd = Math.floor(saku[0]);
    for (let i = 1; i < 5; i++) {
      if (lap && i > 1) {
        if (chu[i - 1] <= Math.floor(saku[i - 1]) || chu[i - 1] >= Math.floor(saku[i])) {
          m[i - 1].month = m[i - 2].month;
          m[i - 1].isLeap = true;
          m[i - 1].jd = Math.floor(saku[i - 1]);
          lap = false;
        }
      }
      m[i].month = m[i - 1].month + 1;
      if (m[i].month > 12) m[i].month -= 12;
      m[i].jd = Math.floor(saku[i]);
      m[i].isLeap = false;
    }

    let state = 0, idx = 0;
    for (let i = 0; i < 5; i++) {
      idx = i;
      if (Math.floor(tm) < Math.floor(m[i].jd)) { state = 1; break; }
      else if (Math.floor(tm) === Math.floor(m[i].jd)) { state = 2; break; }
    }
    if (state === 0 || state === 1) idx--;

    return {
      month: m[idx].month,
      day: Math.floor(tm) - Math.floor(m[idx].jd) + 1,
      isLeap: !!m[idx].isLeap
    };
  }

  // Deterministic meridian-local integer JD for a Gregorian civil date — matches
  // the reference's date.getJD() (2440587 + integer days since 1970-01-01 UTC),
  // independent of the host machine's time zone.
  function civilJD(y, mo, d) {
    return 2440587 + Math.round(Date.UTC(y, mo - 1, d) / 86400000);
  }

  // Gregorian → Chinese lunar. meridianHours: hours east of UTC (default 8).
  function toLunar(y, mo, d, meridianHours) {
    TZ = -((typeof meridianHours === 'number' && !Number.isNaN(meridianHours)) ? meridianHours : 8) / 24;
    return qreki(civilJD(y, mo, d));
  }

  // 27-宿 月宿傍通暦: [lunarMonth-1][lunarDay-1] → 本命宿 (昴-cycle, 牛 omitted).
  const SUKUYO_27 = [
    ['室', '壁', '奎', '婁', '胃', '昴', '畢', '觜', '参', '井', '鬼', '柳', '星', '張', '翼', '軫', '角', '亢', '氐', '房', '心', '尾', '箕', '斗', '女', '虚', '危', '室', '壁', '奎'],
    ['奎', '婁', '胃', '昴', '畢', '觜', '参', '井', '鬼', '柳', '星', '張', '翼', '軫', '角', '亢', '氐', '房', '心', '尾', '箕', '斗', '女', '虚', '危', '室', '壁', '奎', '婁', '胃'],
    ['胃', '昴', '畢', '觜', '参', '井', '鬼', '柳', '星', '張', '翼', '軫', '角', '亢', '氐', '房', '心', '尾', '箕', '斗', '女', '虚', '危', '室', '壁', '奎', '婁', '胃', '昴', '畢'],
    ['畢', '觜', '参', '井', '鬼', '柳', '星', '張', '翼', '軫', '角', '亢', '氐', '房', '心', '尾', '箕', '斗', '女', '虚', '危', '室', '壁', '奎', '婁', '胃', '昴', '畢', '觜', '参'],
    ['参', '井', '鬼', '柳', '星', '張', '翼', '軫', '角', '亢', '氐', '房', '心', '尾', '箕', '斗', '女', '虚', '危', '室', '壁', '奎', '婁', '胃', '昴', '畢', '觜', '参', '井', '鬼'],
    ['鬼', '柳', '星', '張', '翼', '軫', '角', '亢', '氐', '房', '心', '尾', '箕', '斗', '女', '虚', '危', '室', '壁', '奎', '婁', '胃', '昴', '畢', '觜', '参', '井', '鬼', '柳', '星'],
    ['張', '翼', '軫', '角', '亢', '氐', '房', '心', '尾', '箕', '斗', '女', '虚', '危', '室', '壁', '奎', '婁', '胃', '昴', '畢', '觜', '参', '井', '鬼', '柳', '星', '張', '翼', '軫'],
    ['角', '亢', '氐', '房', '心', '尾', '箕', '斗', '女', '虚', '危', '室', '壁', '奎', '婁', '胃', '昴', '畢', '觜', '参', '井', '鬼', '柳', '星', '張', '翼', '軫', '角', '亢', '氐'],
    ['氐', '房', '心', '尾', '箕', '斗', '女', '虚', '危', '室', '壁', '奎', '婁', '胃', '昴', '畢', '觜', '参', '井', '鬼', '柳', '星', '張', '翼', '軫', '角', '亢', '氐', '房', '心'],
    ['心', '尾', '箕', '斗', '女', '虚', '危', '室', '壁', '奎', '婁', '胃', '昴', '畢', '觜', '参', '井', '鬼', '柳', '星', '張', '翼', '軫', '角', '亢', '氐', '房', '心', '尾', '箕'],
    ['斗', '女', '虚', '危', '室', '壁', '奎', '婁', '胃', '昴', '畢', '觜', '参', '井', '鬼', '柳', '星', '張', '翼', '軫', '角', '亢', '氐', '房', '心', '尾', '箕', '斗', '女', '虚'],
    ['虚', '危', '室', '壁', '奎', '婁', '胃', '昴', '畢', '觜', '参', '井', '鬼', '柳', '星', '張', '翼', '軫', '角', '亢', '氐', '房', '心', '尾', '箕', '斗', '女', '虚', '危', '室']
  ];

  // 本命宿 for a Gregorian civil date.
  //   opts: { meridianHours (default 8), localHour (0..24)|null, yeziEnabled }
  // Returns { mansion, lunarMonth, lunarDay, isLeap, rolled }.
  function benmingSuku(y, mo, d, opts) {
    opts = opts || {};
    // Day boundary: local midnight by default; 夜子時 (>=23:00) rolls to next
    // civil day ONLY when explicitly enabled. True solar time is never used.
    let yy = y, mm = mo, dd = d, rolled = false;
    if (opts.yeziEnabled && typeof opts.localHour === 'number' && opts.localHour >= 23) {
      const nx = new Date(Date.UTC(y, mo - 1, d) + 86400000);
      yy = nx.getUTCFullYear(); mm = nx.getUTCMonth() + 1; dd = nx.getUTCDate();
      rolled = true;
    }
    const l = toLunar(yy, mm, dd, opts.meridianHours);
    return {
      mansion: SUKUYO_27[l.month - 1][l.day - 1],
      lunarMonth: l.month, lunarDay: l.day, isLeap: l.isLeap, rolled
    };
  }

  root.EDM_LUNAR = { toLunar, benmingSuku, SUKUYO_27, civilJD };
})(typeof window !== 'undefined' ? window : globalThis);
