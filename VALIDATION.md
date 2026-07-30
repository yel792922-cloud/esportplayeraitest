# 宿曜経 本命星宿 — Validation Report

The star-mansion engine implements the **宿曜経 (Sukuyō) 本命星宿** method — the
same lunar-calendar lineage the Chinese app **爱占星** uses. The Gregorian birth
date is converted to the Chinese lunar calendar (农历, leap months included) at
the birth-place meridian, then the 本命宿 is read from the classical 27-宿
月宿傍通暦 table. This report validates the engine against **external references**,
not against itself.

**Result: 112 / 112 samples match (100%).**

| # | Source | Birth date | Meridian | 农历 (lunar) | Reference 宿 | Our 宿 | Match |
|--:|--------|-----------|:-------:|------------|:-----------:|:------:|:-----:|
| 1 | 爱占星 (anchor) | 2000-03-01 13:30 | UTC+8 | 1/26 | 虚 | 虚 | ✓ |
| 2 | 宮藤官九郎 (yakumoin) | 1970-07-19 | UTC+9 | 6/16 | 虚 | 虚 | ✓ |
| 3 | 木村拓哉 (fs-astrology) | 1972-11-13 | UTC+9 | 10/8 | 室 | 室 | ✓ |
| 4 | 稲垣吾郎 (yakumoin) | 1973-12-08 | UTC+9 | 11/14 | 井 | 井 | ✓ |
| 5 | 中谷美紀 (yakumoin) | 1976-01-12 | UTC+9 | 12/12 | 井 | 井 | ✓ |
| 6 | 岡本太郎 (uranai-mania) | 1911-02-26 | UTC+9 | 1/28 | 室 | 室 | ✓ |
| 7 | 吉井和哉 (yakumoin) | 1966-10-08 | UTC+9 | 8/24 | 星 | 星 | ✓ |
| 8 | 羽鳥慎一 (kosei-do) | 1971-03-24 | UTC+9 | 2/28 | 奎 | 奎 | ✓ |
| 9 | ポール・マッカートニー (yakumoin) | 1942-06-18 | UTC+9 | 5/5 | 星 | 星 | ✓ |
| 10 | ロバート・デ・ニーロ (kosei-do) | 1943-08-17 | UTC+9 | 7/17 | 奎 | 奎 | ✓ |
| 11 | 木梨憲武 (yakumoin) | 1962-03-09 | UTC+9 | 2/4 | 昴 | 昴 | ✓ |
| 12 | 田村淳 (yakumoin) | 1973-12-04 | UTC+9 | 11/10 | 昴 | 昴 | ✓ |
| 13 | 坂本真綾 (yakumoin) | 1980-03-31 | UTC+9 | 2/15 | 角 | 角 | ✓ |
| 14 | shin_astrology test | 1983-02-11 | UTC+8 | 12/29 | 危 | 危 | ✓ |
| 15 | shin_astrology (宿曜経 ref) | 1972-01-15 | UTC+8 | 11/29 | 女 | 女 | ✓ |
| 16 | shin_astrology (宿曜経 ref) | 1972-03-15 | UTC+8 | 2/1 | 奎 | 奎 | ✓ |
| 17 | shin_astrology (宿曜経 ref) | 1972-05-15 | UTC+8 | 4/3 | 参 | 参 | ✓ |
| 18 | shin_astrology (宿曜経 ref) | 1972-07-15 | UTC+8 | 6/5 | 翼 | 翼 | ✓ |
| 19 | shin_astrology (宿曜経 ref) | 1972-09-15 | UTC+8 | 8/8 | 斗 | 斗 | ✓ |
| 20 | shin_astrology (宿曜経 ref) | 1972-11-15 | UTC+8 | 10/10 | 奎 | 奎 | ✓ |
| 21 | shin_astrology (宿曜経 ref) | 1979-01-15 | UTC+8 | 12/17 | 翼 | 翼 | ✓ |
| 22 | shin_astrology (宿曜経 ref) | 1979-03-15 | UTC+8 | 2/17 | 氐 | 氐 | ✓ |
| 23 | shin_astrology (宿曜経 ref) | 1979-05-15 | UTC+8 | 4/20 | 虚 | 虚 | ✓ |
| 24 | shin_astrology (宿曜経 ref) | 1979-07-15 | UTC+8 | 6/22 | 胃 | 胃 | ✓ |
| 25 | shin_astrology (宿曜経 ref) | 1979-09-15 | UTC+8 | 7/24 | 井 | 井 | ✓ |
| 26 | shin_astrology (宿曜経 ref) | 1979-11-15 | UTC+8 | 9/26 | 角 | 角 | ✓ |
| 27 | shin_astrology (宿曜経 ref) | 1985-01-15 | UTC+8 | 11/25 | 心 | 心 | ✓ |
| 28 | shin_astrology (宿曜経 ref) | 1985-03-15 | UTC+8 | 1/24 | 斗 | 斗 | ✓ |
| 29 | shin_astrology (宿曜経 ref) | 1985-05-15 | UTC+8 | 3/26 | 奎 | 奎 | ✓ |
| 30 | shin_astrology (宿曜経 ref) | 1985-07-15 | UTC+8 | 5/28 | 参 | 参 | ✓ |
| 31 | shin_astrology (宿曜経 ref) | 1985-09-15 | UTC+8 | 8/1 | 角 | 角 | ✓ |
| 32 | shin_astrology (宿曜経 ref) | 1985-11-15 | UTC+8 | 10/4 | 斗 | 斗 | ✓ |
| 33 | shin_astrology (宿曜経 ref) | 1990-01-15 | UTC+8 | 12/19 | 角 | 角 | ✓ |
| 34 | shin_astrology (宿曜経 ref) | 1990-03-15 | UTC+8 | 2/19 | 心 | 心 | ✓ |
| 35 | shin_astrology (宿曜経 ref) | 1990-05-15 | UTC+8 | 4/21 | 危 | 危 | ✓ |
| 36 | shin_astrology (宿曜経 ref) | 1990-07-15 | UTC+8 | 闰5/23 | 婁 | 娄 | ✓ |
| 37 | shin_astrology (宿曜経 ref) | 1990-09-15 | UTC+8 | 7/27 | 星 | 星 | ✓ |
| 38 | shin_astrology (宿曜経 ref) | 1990-11-15 | UTC+8 | 9/29 | 房 | 房 | ✓ |
| 39 | shin_astrology (宿曜経 ref) | 1994-01-15 | UTC+8 | 12/4 | 壁 | 壁 | ✓ |
| 40 | shin_astrology (宿曜経 ref) | 1994-03-15 | UTC+8 | 2/4 | 昴 | 昴 | ✓ |
| 41 | shin_astrology (宿曜経 ref) | 1994-05-15 | UTC+8 | 4/5 | 鬼 | 鬼 | ✓ |
| 42 | shin_astrology (宿曜経 ref) | 1994-07-15 | UTC+8 | 6/7 | 角 | 角 | ✓ |
| 43 | shin_astrology (宿曜経 ref) | 1994-09-15 | UTC+8 | 8/10 | 虚 | 虚 | ✓ |
| 44 | shin_astrology (宿曜経 ref) | 1994-11-15 | UTC+8 | 10/13 | 昴 | 昴 | ✓ |
| 45 | shin_astrology (宿曜経 ref) | 1997-01-15 | UTC+8 | 12/7 | 胃 | 胃 | ✓ |
| 46 | shin_astrology (宿曜経 ref) | 1997-03-15 | UTC+8 | 2/7 | 参 | 参 | ✓ |
| 47 | shin_astrology (宿曜経 ref) | 1997-05-15 | UTC+8 | 4/9 | 翼 | 翼 | ✓ |
| 48 | shin_astrology (宿曜経 ref) | 1997-07-15 | UTC+8 | 6/11 | 心 | 心 | ✓ |
| 49 | shin_astrology (宿曜経 ref) | 1997-09-15 | UTC+8 | 8/14 | 奎 | 奎 | ✓ |
| 50 | shin_astrology (宿曜経 ref) | 1997-11-15 | UTC+8 | 10/16 | 参 | 参 | ✓ |
| 51 | shin_astrology (宿曜経 ref) | 1999-01-15 | UTC+8 | 11/28 | 斗 | 斗 | ✓ |
| 52 | shin_astrology (宿曜経 ref) | 1999-03-15 | UTC+8 | 1/28 | 室 | 室 | ✓ |
| 53 | shin_astrology (宿曜経 ref) | 1999-05-15 | UTC+8 | 4/1 | 畢 | 毕 | ✓ |
| 54 | shin_astrology (宿曜経 ref) | 1999-07-15 | UTC+8 | 6/3 | 星 | 星 | ✓ |
| 55 | shin_astrology (宿曜経 ref) | 1999-09-15 | UTC+8 | 8/6 | 尾 | 尾 | ✓ |
| 56 | shin_astrology (宿曜経 ref) | 1999-11-15 | UTC+8 | 10/8 | 室 | 室 | ✓ |
| 57 | shin_astrology (宿曜経 ref) | 2001-01-15 | UTC+8 | 12/21 | 氐 | 氐 | ✓ |
| 58 | shin_astrology (宿曜経 ref) | 2001-03-15 | UTC+8 | 2/21 | 箕 | 箕 | ✓ |
| 59 | shin_astrology (宿曜経 ref) | 2001-05-15 | UTC+8 | 4/23 | 壁 | 壁 | ✓ |
| 60 | shin_astrology (宿曜経 ref) | 2001-07-15 | UTC+8 | 5/25 | 昴 | 昴 | ✓ |
| 61 | shin_astrology (宿曜経 ref) | 2001-09-15 | UTC+8 | 7/28 | 張 | 张 | ✓ |
| 62 | shin_astrology (宿曜経 ref) | 2001-11-15 | UTC+8 | 10/1 | 心 | 心 | ✓ |
| 63 | shin_astrology (宿曜経 ref) | 2003-01-15 | UTC+8 | 12/13 | 鬼 | 鬼 | ✓ |
| 64 | shin_astrology (宿曜経 ref) | 2003-03-15 | UTC+8 | 2/13 | 翼 | 翼 | ✓ |
| 65 | shin_astrology (宿曜経 ref) | 2003-05-15 | UTC+8 | 4/15 | 心 | 心 | ✓ |
| 66 | shin_astrology (宿曜経 ref) | 2003-07-15 | UTC+8 | 6/16 | 虚 | 虚 | ✓ |
| 67 | shin_astrology (宿曜経 ref) | 2003-09-15 | UTC+8 | 8/19 | 觜 | 觜 | ✓ |
| 68 | shin_astrology (宿曜経 ref) | 2003-11-15 | UTC+8 | 10/22 | 翼 | 翼 | ✓ |
| 69 | shin_astrology (宿曜経 ref) | 2005-01-15 | UTC+8 | 12/6 | 婁 | 娄 | ✓ |
| 70 | shin_astrology (宿曜経 ref) | 2005-03-15 | UTC+8 | 2/6 | 觜 | 觜 | ✓ |
| 71 | shin_astrology (宿曜経 ref) | 2005-05-15 | UTC+8 | 4/8 | 張 | 张 | ✓ |
| 72 | shin_astrology (宿曜経 ref) | 2005-07-15 | UTC+8 | 6/10 | 房 | 房 | ✓ |
| 73 | shin_astrology (宿曜経 ref) | 2005-09-15 | UTC+8 | 8/12 | 室 | 室 | ✓ |
| 74 | shin_astrology (宿曜経 ref) | 2005-11-15 | UTC+8 | 10/14 | 畢 | 毕 | ✓ |
| 75 | shin_astrology (宿曜経 ref) | 2007-01-15 | UTC+8 | 11/27 | 箕 | 箕 | ✓ |
| 76 | shin_astrology (宿曜経 ref) | 2007-03-15 | UTC+8 | 1/26 | 虚 | 虚 | ✓ |
| 77 | shin_astrology (宿曜経 ref) | 2007-05-15 | UTC+8 | 3/29 | 昴 | 昴 | ✓ |
| 78 | shin_astrology (宿曜経 ref) | 2007-07-15 | UTC+8 | 6/2 | 柳 | 柳 | ✓ |
| 79 | shin_astrology (宿曜経 ref) | 2007-09-15 | UTC+8 | 8/5 | 心 | 心 | ✓ |
| 80 | shin_astrology (宿曜経 ref) | 2007-11-15 | UTC+8 | 10/6 | 虚 | 虚 | ✓ |
| 81 | shin_astrology (宿曜経 ref) | 2010-01-15 | UTC+8 | 12/1 | 虚 | 虚 | ✓ |
| 82 | shin_astrology (宿曜経 ref) | 2010-03-15 | UTC+8 | 1/30 | 奎 | 奎 | ✓ |
| 83 | shin_astrology (宿曜経 ref) | 2010-05-15 | UTC+8 | 4/2 | 觜 | 觜 | ✓ |
| 84 | shin_astrology (宿曜経 ref) | 2010-07-15 | UTC+8 | 6/4 | 張 | 张 | ✓ |
| 85 | shin_astrology (宿曜経 ref) | 2010-09-15 | UTC+8 | 8/8 | 斗 | 斗 | ✓ |
| 86 | shin_astrology (宿曜経 ref) | 2010-11-15 | UTC+8 | 10/10 | 奎 | 奎 | ✓ |
| 87 | shin_astrology (宿曜経 ref) | 2000-03-01 | UTC+8 | 1/26 | 虚 | 虚 | ✓ |
| 88 | shin_astrology (宿曜経 ref) | 1983-02-11 | UTC+8 | 12/29 | 危 | 危 | ✓ |
| 89 | shin_astrology (宿曜経 ref) | 1988-02-24 | UTC+8 | 1/8 | 觜 | 觜 | ✓ |
| 90 | shin_astrology (宿曜経 ref) | 2001-05-23 | UTC+8 | 闰4/1 | 畢 | 毕 | ✓ |
| 91 | shin_astrology (宿曜経 ref) | 2001-06-20 | UTC+8 | 闰4/29 | 觜 | 觜 | ✓ |
| 92 | shin_astrology (宿曜経 ref) | 2004-03-20 | UTC+8 | 2/30 | 胃 | 胃 | ✓ |
| 93 | shin_astrology (宿曜経 ref) | 2004-02-20 | UTC+8 | 2/1 | 奎 | 奎 | ✓ |
| 94 | shin_astrology (宿曜経 ref) | 2006-08-20 | UTC+8 | 7/27 | 星 | 星 | ✓ |
| 95 | shin_astrology (宿曜経 ref) | 2006-09-10 | UTC+8 | 闰7/18 | 婁 | 娄 | ✓ |
| 96 | shin_astrology (宿曜経 ref) | 2009-06-10 | UTC+8 | 5/18 | 虚 | 虚 | ✓ |
| 97 | shin_astrology (宿曜経 ref) | 2009-07-05 | UTC+8 | 闰5/13 | 心 | 心 | ✓ |
| 98 | shin_astrology (宿曜経 ref) | 2020-05-10 | UTC+8 | 4/18 | 斗 | 斗 | ✓ |
| 99 | shin_astrology (宿曜経 ref) | 2020-06-20 | UTC+8 | 闰4/29 | 觜 | 觜 | ✓ |
| 100 | shin_astrology (宿曜経 ref) | 1998-01-28 | UTC+8 | 1/1 | 室 | 室 | ✓ |
| 101 | shin_astrology (宿曜経 ref) | 1998-01-29 | UTC+8 | 1/2 | 壁 | 壁 | ✓ |
| 102 | shin_astrology (宿曜経 ref) | 1995-01-31 | UTC+8 | 1/1 | 室 | 室 | ✓ |
| 103 | shin_astrology (宿曜経 ref) | 1996-02-19 | UTC+8 | 1/1 | 室 | 室 | ✓ |
| 104 | shin_astrology (宿曜経 ref) | 2002-02-12 | UTC+8 | 1/1 | 室 | 室 | ✓ |
| 105 | shin_astrology (宿曜経 ref) | 2002-02-13 | UTC+8 | 1/2 | 壁 | 壁 | ✓ |
| 106 | shin_astrology (宿曜経 ref) | 1990-01-27 | UTC+8 | 1/1 | 室 | 室 | ✓ |
| 107 | shin_astrology (宿曜経 ref) | 1990-01-26 | UTC+8 | 12/30 | 室 | 室 | ✓ |
| 108 | shin_astrology (宿曜経 ref) | 2008-08-08 | UTC+8 | 7/8 | 心 | 心 | ✓ |
| 109 | shin_astrology (宿曜経 ref) | 1993-07-15 | UTC+8 | 5/26 | 畢 | 毕 | ✓ |
| 110 | shin_astrology (宿曜経 ref) | 1987-11-11 | UTC+8 | 9/20 | 鬼 | 鬼 | ✓ |
| 111 | shin_astrology (宿曜経 ref) | 2000-12-31 | UTC+8 | 12/6 | 婁 | 娄 | ✓ |
| 112 | shin_astrology (宿曜経 ref) | 2005-10-01 | UTC+8 | 8/28 | 角 | 角 | ✓ |

## Method notes

- **Independent anchors (rows 1–14):** the 爱占星 anchor plus a dozen celebrity 本命宿 published by third-party 宿曜 sites (yakumoin.net, kosei-do, fs-astrology, uranai-mania) with birth dates from public biographies; Japanese-context samples are read at the JST meridian, the 爱占星/CST samples at UTC+8.
- **Reference-implementation parity (rows 15–112):** every date matches the public MIT-licensed 宿曜経 implementation `ryutabi/shin_astrology` computed at UTC+8, spanning 1911–2020, all 12 lunar months, day-1/day-30 edges, CNY boundaries, and 6 leap-month cases.
- **Meridian sensitivity:** near a new-moon midnight the 农历 day (hence the 宿) can differ by one between UTC+8 and UTC+9 (e.g. 宮藤官九郎 1970-07-19 → 虚 at JST, 危 at CST). The engine parameterises the meridian by birth place; the app default is UTC+8 for 爱占星 compatibility.
- **Boundary rules:** lunar day changes at local midnight; true solar time is never applied to the mansion; 夜子時 (23:00–24:00 → next day) only when explicitly enabled.
- Reproduce: `node tests/mansion.test.mjs`.
