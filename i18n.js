/* =====================================================================
 * Esports Destiny Match — i18n.js
 * Centralized, structured translations. Loaded before app.js so the very
 * first paint is already localized (no fetch race, GitHub-Pages friendly).
 *
 *   window.EDM_I18N     — static UI strings, keyed, per language.
 *   window.EDM_READING  — bilingual "reading" vocabulary the narrative
 *                         generator composes into the result page.
 *
 * Nothing bilingual is hardcoded in index.html; the markup carries only
 * data-i18n keys, and app.js fills the dynamic reading from EDM_READING.
 * ===================================================================== */

window.EDM_I18N = {
  en: {
    'lang.zh': '中文', 'lang.en': 'EN',

    'landing.subtitle': 'Read your star-chart. Discover the pros you were <em>fated to watch</em>.',
    'landing.start': 'Reveal My Destiny ✦',
    'landing.meta': '<span>274 pros</span><span>·</span><span>5 titles</span><span>·</span><span>traditional 二十八宿</span>',
    'landing.disclaimer': 'For fun only — a playful fortune toy, not real astrology.',

    'form.title': 'Your Chart',
    'form.hint': 'Just a few inputs — then your result appears instantly.',
    'form.birthDate': 'Birth date',
    'form.birthTime': 'Birth time <em>(strongly recommended)</em>',
    'form.tz': 'Birth-place time zone <em>(for an accurate star mansion)</em>',
    'form.tzHint': 'Your star mansion is the <strong>宿曜経 本命星宿</strong> — the same lunar-calendar method the app 爱占星 uses. Your Gregorian date is converted to the <strong>Chinese lunar calendar</strong> (农历, with leap months) at your <strong>birth-place meridian</strong> — for Mainland China the default is UTC+8. It is not modern Moon longitude and never uses your device time zone. Missing the birth-place zone lowers confidence slightly.',
    'form.approx': 'No birth time? Use an approximate (noon) reading',
    'form.yezi': 'Advanced: count 夜子時 (23:00–24:00) as the next day',
    'form.trueSolar': 'Advanced: apply true solar time to the birth-hour pillar',
    'form.gender': 'Gender',
    'form.female': 'Female',
    'form.male': 'Male',
    'form.unspecified': 'Prefer not to say',
    'form.games': 'Pick your games <em>(1–4)</em>',
    'form.submit': 'Cast the Match',
    'form.ai': '✨ AI polish',
    'form.birthPlace': 'Birth place <em>(city / region — for time-zone context)</em>',
    'form.birthPlacePh': 'e.g. Shanghai, Seoul, Berlin',

    'submit.open': '＋ Suggest a player',
    'submit.title': 'Suggest a missing player',
    'submit.intro': 'Spotted a pro we\'re missing, or a wrong detail? Send it to our review queue — nothing goes live without a manual check.',
    'submit.name': 'Player name *',
    'submit.game': 'Game *',
    'submit.gamePick': '— Select a game —',
    'submit.role': 'Role / position',
    'submit.birthDate': 'Birth date',
    'submit.birthTime': 'Birth time (if known)',
    'submit.region': 'Competition region (e.g. LCK, VCT Pacific)',
    'submit.source': 'Source link or reference *',
    'submit.note': 'Short note',
    'submit.send': 'Send to review queue',
    'submit.gh': 'Open a GitHub issue ↗',
    'submit.copy': '📋 Copy as JSON',
    'submit.cancel': 'Cancel',
    'submit.disclaimer': 'Reviewed manually before any database change. Neutral policy: no flags or nationalities — competition region only.',
    'submit.errName': 'Player name is required.',
    'submit.errGame': 'Please pick a game.',
    'submit.errSource': 'Please add a source link or reference note.',
    'submit.errDate': 'Birth date must be a valid YYYY-MM-DD date.',
    'submit.done': 'Thanks! Your suggestion is queued for review. Open a GitHub issue to send it in, or copy it as JSON.',
    'submit.copied': 'Copied!',

    'tz.sel': '— Select your birth-place time zone —',
    'tz.8': 'UTC+8 · Beijing / China Standard Time (default for Mainland China)',
    'tz.9': 'UTC+9 · Seoul / Tokyo',
    'tz.9_5': 'UTC+9:30 · Adelaide',
    'tz.10': 'UTC+10 · Sydney',
    'tz.12': 'UTC+12 · Auckland',
    'tz.7': 'UTC+7 · Bangkok / Jakarta / Hanoi',
    'tz.6': 'UTC+6 · Almaty / Dhaka',
    'tz.5_5': 'UTC+5:30 · Mumbai / Delhi',
    'tz.5': 'UTC+5 · Tashkent',
    'tz.4': 'UTC+4 · Dubai',
    'tz.3': 'UTC+3 · Moscow / Istanbul',
    'tz.2': 'UTC+2 · Athens / Kyiv',
    'tz.1': 'UTC+1 · Berlin / Paris',
    'tz.0': 'UTC±0 · London / Lisbon',
    'tz.m3': 'UTC−3 · São Paulo / Buenos Aires',
    'tz.m4': 'UTC−4 · Santiago / New York (DST)',
    'tz.m5': 'UTC−5 · New York / Toronto',
    'tz.m6': 'UTC−6 · Mexico City / Chicago',
    'tz.m7': 'UTC−7 · Denver',
    'tz.m8': 'UTC−8 · Los Angeles / Vancouver',

    'game.lol': 'League of Legends',
    'game.valorant': 'VALORANT',
    'game.cs2': 'Counter-Strike 2',
    'game.dota2': 'Dota 2',
    'game.hok': 'Honor of Kings',

    'result.eyebrow': 'The pros you\'re fated to watch —',
    'result.kindArch': 'Viewer archetype · 天干五行',
    'result.kindMansion': 'Star Mansion',
    'result.conclusion': 'Your reading',
    'result.readingTitle': 'Why this is your reading',
    'result.auraTitle': 'Matches you resonate with',
    'result.playerFitTitle': 'Why these pros pull your attention',
    'result.topOne': 'Your #1 destined pro',
    'result.rest': 'The rest of your Top 10',
    'result.destiny': 'destiny',
    'result.foot': '🔮 Esports Destiny Match · for entertainment only',

    'share.label': 'Shareable summary',
    'share.copy': '📋 Copy result',
    'share.again': '↺ Try again',
    'share.hint': 'Tip: screenshot the card above for a clean share image.',
    'share.copied': 'Copied!',
    'share.aiOn': 'AI polish on',
    'share.aiOff': 'AI polish off',

    'footer.text': 'Esports Destiny Match — a static, front-end fortune toy. Symbolic East Asian metaphysics used purely for entertainment.',

    'err.date': 'Please enter your birth date.',
    'err.games': 'Pick at least one game (up to 4).',
    'err.none': 'No players found for the selected games.',
    'err.fail': 'Something went wrong computing your destiny. Please try again.'
  },

  zh: {
    'lang.zh': '中文', 'lang.en': 'EN',

    'landing.subtitle': '解读你的命盘，找到你<em>注定观看</em>的选手。',
    'landing.start': '揭晓我的命盘 ✦',
    'landing.meta': '<span>274 位选手</span><span>·</span><span>5 个项目</span><span>·</span><span>传统二十八宿</span>',
    'landing.disclaimer': '仅供娱乐——一个好玩的命理小玩具，并非真实占星。',

    'form.title': '你的命盘',
    'form.hint': '只需几项输入，结果立即呈现。',
    'form.birthDate': '出生日期',
    'form.birthTime': '出生时间 <em>（强烈建议填写）</em>',
    'form.tz': '出生地时区 <em>（用于精确的星宿）</em>',
    'form.tzHint': '你的星宿采用<strong>宿曜经·本命星宿</strong>——与「爱占星」一致的农历算法。系统会按你的<strong>出生地经度</strong>（中国大陆默认 UTC+8）把公历换算为<strong>农历</strong>（含闰月），再查月宿傍通暦定宿。它并非现代月球黄经，也绝不使用设备时区。未填出生地时区时置信度略低。',
    'form.approx': '没有出生时间？使用近似（正午）推算',
    'form.yezi': '进阶：将夜子时（23:00–24:00）计入次日',
    'form.trueSolar': '进阶：对时辰柱应用真太阳时',
    'form.gender': '性别',
    'form.female': '女',
    'form.male': '男',
    'form.unspecified': '不愿透露',
    'form.games': '选择你的项目 <em>（1–4 个）</em>',
    'form.submit': '开始匹配',
    'form.ai': '✨ AI 润色',
    'form.birthPlace': '出生地 <em>（城市 / 地区——用于判断时区）</em>',
    'form.birthPlacePh': '例如：上海、首尔、柏林',

    'submit.open': '＋ 推荐选手',
    'submit.title': '推荐缺失的选手',
    'submit.intro': '发现我们遗漏的选手，或有信息有误？提交到审核队列——未经人工核验不会直接上线。',
    'submit.name': '选手名 *',
    'submit.game': '项目 *',
    'submit.gamePick': '— 选择项目 —',
    'submit.role': '位置 / 角色',
    'submit.birthDate': '出生日期',
    'submit.birthTime': '出生时间（如已知）',
    'submit.region': '赛区（如 LCK、VCT Pacific）',
    'submit.source': '来源链接或参考 *',
    'submit.note': '备注',
    'submit.send': '提交至审核队列',
    'submit.gh': '打开 GitHub issue ↗',
    'submit.copy': '📋 复制为 JSON',
    'submit.cancel': '取消',
    'submit.disclaimer': '所有提交均经人工审核后才会更新数据库。中立政策：不含国旗或国籍——仅填赛区。',
    'submit.errName': '请填写选手名。',
    'submit.errGame': '请选择项目。',
    'submit.errSource': '请填写来源链接或参考。',
    'submit.errDate': '出生日期需为有效的 YYYY-MM-DD 格式。',
    'submit.done': '谢谢！你的建议已进入审核队列。可打开 GitHub issue 提交，或复制为 JSON。',
    'submit.copied': '已复制！',

    'tz.sel': '— 选择你的出生地时区 —',
    'tz.8': 'UTC+8 · 北京 / 中国标准时间（中国大陆默认）',
    'tz.9': 'UTC+9 · 首尔 / 东京',
    'tz.9_5': 'UTC+9:30 · 阿德莱德',
    'tz.10': 'UTC+10 · 悉尼',
    'tz.12': 'UTC+12 · 奥克兰',
    'tz.7': 'UTC+7 · 曼谷 / 雅加达 / 河内',
    'tz.6': 'UTC+6 · 阿拉木图 / 达卡',
    'tz.5_5': 'UTC+5:30 · 孟买 / 德里',
    'tz.5': 'UTC+5 · 塔什干',
    'tz.4': 'UTC+4 · 迪拜',
    'tz.3': 'UTC+3 · 莫斯科 / 伊斯坦布尔',
    'tz.2': 'UTC+2 · 雅典 / 基辅',
    'tz.1': 'UTC+1 · 柏林 / 巴黎',
    'tz.0': 'UTC±0 · 伦敦 / 里斯本',
    'tz.m3': 'UTC−3 · 圣保罗 / 布宜诺斯艾利斯',
    'tz.m4': 'UTC−4 · 圣地亚哥 / 纽约（夏令时）',
    'tz.m5': 'UTC−5 · 纽约 / 多伦多',
    'tz.m6': 'UTC−6 · 墨西哥城 / 芝加哥',
    'tz.m7': 'UTC−7 · 丹佛',
    'tz.m8': 'UTC−8 · 洛杉矶 / 温哥华',

    'game.lol': '英雄联盟',
    'game.valorant': '无畏契约',
    'game.cs2': 'CS2',
    'game.dota2': '刀塔 2',
    'game.hok': '王者荣耀',

    'result.eyebrow': '你注定观看的选手 —',
    'result.kindArch': '观赛原型 · 天干五行',
    'result.kindMansion': '星宿',
    'result.conclusion': '你的命读',
    'result.readingTitle': '为什么这是你的命读',
    'result.auraTitle': '你共鸣的比赛类型',
    'result.playerFitTitle': '为什么这些选手吸引你',
    'result.topOne': '你的头号命定选手',
    'result.rest': '你的 Top 10 其余选手',
    'result.destiny': '命定值',
    'result.foot': '🔮 电竞命盘 · 仅供娱乐',

    'share.label': '可分享的总结',
    'share.copy': '📋 复制结果',
    'share.again': '↺ 再试一次',
    'share.hint': '小提示：截图上方卡片即可获得干净的分享图。',
    'share.copied': '已复制！',
    'share.aiOn': 'AI 润色已开启',
    'share.aiOff': 'AI 润色已关闭',

    'footer.text': '电竞命盘——一个纯静态的前端命理小玩具。东方玄学符号仅用于娱乐。',

    'err.date': '请填写你的出生日期。',
    'err.games': '至少选择一个项目（最多 4 个）。',
    'err.none': '所选项目下没有找到选手。',
    'err.fail': '推算命盘时出了点问题，请重试。'
  }
};

/* ---------------------------------------------------------------------
 * Reading vocabulary — bilingual. Indices/keys match the engine tables in
 * app.js (element 0=Wood 1=Fire 2=Earth 3=Metal 4=Water; branch 0..11;
 * palace 0=青龙 1=玄武 2=白虎 3=朱雀; ten-god relation keys).
 * ------------------------------------------------------------------- */
window.EDM_READING = {
  // Main-conclusion archetype title, by day-master element.
  archetype: [
    { en: 'Growth & Macro Viewer',    zh: '成长运营型观众' },
    { en: 'Hot-Start Highlight Viewer', zh: '高光烈焰型观众' },
    { en: 'Stable System Viewer',     zh: '稳健体系型观众' },
    { en: 'Precision Pressure Viewer', zh: '精准压制型观众' },
    { en: 'Adaptive Flow Viewer',     zh: '灵动应变型观众' }
  ],
  archetypeSub: [
    { en: 'You watch the long game — scaling, setups, and leads that snowball.', zh: '你看的是长线——发育、布局，以及会滚雪球的优势。' },
    { en: 'You live for the hot start — explosive, highlight-driven, first-blood energy.', zh: '你为开局而生——爆发、高光、抢先手的血腥感十足。' },
    { en: 'You back the system — disciplined, low-tilt, macro-first esports.', zh: '你押注体系——纪律、不上头、宏观优先的电竞。' },
    { en: 'You reward precision — clean, clutch, mistake-punishing play.', zh: '你奖赏精准——干净、关键、专抓失误的操作。' },
    { en: 'You chase the read — adaptive, comeback-hungry, improvisational games.', zh: '你追逐阅读——应变、渴望翻盘、即兴发挥的对局。' }
  ],
  // Yin/Yang temper chip.
  temper: {
    yang: { en: '阳 · confrontation-leaning', zh: '阳 · 偏向对抗' },
    yin:  { en: '阴 · control-leaning',       zh: '阴 · 偏向掌控' }
  },

  // Layer titles.
  layerTitle: {
    temperament: { en: 'Core elemental temperament', zh: '元素本性' },
    zodiac:      { en: 'Zodiac & branch interaction', zh: '生肖地支互动' },
    mansion:     { en: 'Star-mansion aura',           zh: '星宿气场' },
    viewing:     { en: 'Viewing lens · Ten Gods',     zh: '观赛视角 · 十神' }
  },

  // Layer 1 — elemental temperament, translated to viewing behavior.
  temperament: [
    { en: 'Wood gives you a builder\'s patience: you track map control, vision, and the scaling lead that quietly compounds into a win.', zh: '木主生长——你盯的是运营、视野，以及一点点滚起来、最终成型的优势。' },
    { en: 'Fire runs hot and expressive: you\'re here for early aggression, the flashy outplay, and a highlight that ends a fight in one beat.', zh: '火主升腾——你要的是前期压制、华丽操作，以及一拍带走团战的高光。' },
    { en: 'Earth is grounded and unshakeable: you trust structure, macro discipline, and teams that never tilt off a single bad trade.', zh: '土主厚载——你信任体系与宏观纪律，欣赏不会因一次亏损就崩盘的队伍。' },
    { en: 'Metal is sharp and exacting: you savor clean mechanics, precise trades, and the clutch that punishes one mistake.', zh: '金主肃杀——你偏爱干净的操作、精准的换血，以及一次失误即被惩罚的关键处理。' },
    { en: 'Water is fluid and adaptive: you love the read, the improvised angle, and the comeback that flows around a losing position.', zh: '水主润下——你着迷于阅读局势、临场取角，以及从劣势中流转翻盘。' }
  ],

  // Layer 2 — per-zodiac interaction pattern -> viewing behavior.
  zodiac: [
    { en: 'Rat seeks quick, clever tempo — you click with teams that outmaneuver rather than outmuscle.', zh: '子鼠求机变——你偏爱以巧破力、绕后调度的队伍。' },
    { en: 'Ox holds the line — you resonate with patient, attrition-heavy, never-fold matches.', zh: '丑牛能扛线——你与耐心、拼消耗、绝不认输的对局共鸣。' },
    { en: 'Tiger wants the charge — you\'re pulled to fearless, front-foot, first-engage play.', zh: '寅虎爱冲锋——你被无畏、抢先手、正面开团的打法吸引。' },
    { en: 'Rabbit reads angles — you enjoy poke, positioning, and the safe-but-lethal setup.', zh: '卯兔擅走位——你享受消耗、站位与稳中带刀的布置。' },
    { en: 'Dragon plays for the spectacle — you\'re drawn to carry-driven, snowball games.', zh: '辰龙求气象——你被大核带队、滚雪球的比赛吸引。' },
    { en: 'Snake favors the ambush — you love traps, picks, and a slow-tightening noose.', zh: '巳蛇好设伏——你喜欢陷阱、抓单与步步收紧的绞杀。' },
    { en: 'Horse wants pace — you resonate with high-tempo, roam-heavy, never-slow matches.', zh: '午马求节奏——你与快节奏、频繁游走、绝不拖沓的比赛共鸣。' },
    { en: 'Goat plays the group — you enjoy coordinated, teamfight-centric compositions.', zh: '未羊重协同——你享受团队联动、以团战为核心的阵容。' },
    { en: 'Monkey loves the trick — you\'re pulled to creative, cheese-friendly, outplay-heavy games.', zh: '申猴爱花活——你被创意、奇招与操作博弈的对局吸引。' },
    { en: 'Rooster demands precision — you click with clean, disciplined, execution-perfect teams.', zh: '酉鸡求精确——你偏爱干净、纪律、执行零失误的队伍。' },
    { en: 'Dog backs the loyal grind — you resonate with steady, team-first, dependable play.', zh: '戌狗重稳靠——你与稳健、以队为先、可靠的打法共鸣。' },
    { en: 'Pig enjoys the honest slugfest — you love direct, resource-rich, macro brawls.', zh: '亥猪爱硬碰——你喜欢直接、资源充裕、宏观互拼的较量。' }
  ],

  // Layer 3 — palace aura (0 青龙 East, 1 玄武 North, 2 白虎 West, 3 朱雀 South).
  palace: [
    { en: 'an Azure-Dragon aura — initiative and momentum; you feel matches that open fast and keep pressing.', zh: '青龙之象——主动与势头，你对开局迅猛、步步紧逼的比赛最有感觉。' },
    { en: 'a Black-Tortoise aura — defense and endurance; you feel matches won by holding, stalling, and outlasting.', zh: '玄武之象——防守与耐久，你对靠死守、拖延、熬赢的比赛最有感觉。' },
    { en: 'a White-Tiger aura — force and execution; you feel decisive, hard-hitting, clean-kill matches.', zh: '白虎之象——力量与执行，你对果断、强硬、一击致命的比赛最有感觉。' },
    { en: 'a Vermilion-Bird aura — flair and spectacle; you feel flashy, highlight-rich, crowd-igniting matches.', zh: '朱雀之象——华彩与观赏，你对炫目、高光频出、点燃全场的比赛最有感觉。' }
  ],

  // Layer 4 — Ten-God viewing lens (the player expression you gravitate to).
  tenGod: {
    companion: { en: 'players who go blow-for-blow with their lane — confrontation you feel in your gut.', zh: '与对手贴身互拼的选手——那种正面冲突你感同身受。' },
    output:    { en: 'expressive shot-makers whose mechanics and creativity you watch for the sheer art of it.', zh: '极具表现力的操作型选手——你为那份技艺与创意而看。' },
    resource:  { en: 'cerebral, explanatory players whose strategy and calm you find genuinely reassuring.', zh: '睿智、讲道理的选手——他们的策略与沉稳让你真正安心。' },
    wealth:    { en: 'objective-hungry grinders whose hard-earned, resource-rich wins you love to chase alongside.', zh: '紧盯目标的选手——你乐于陪他们追逐那些硬拼来的、资源充裕的胜利。' },
    authority: { en: 'high-pressure performers whose disciplined, clutch composure under structure electrifies you.', zh: '高压之下的选手——那份纪律与关键时刻的沉着让你热血沸腾。' }
  },
  tenGodShort: {
    companion: { en: 'head-to-head fire', zh: '贴身对抗' },
    output:    { en: 'highlight mechanics', zh: '高光操作' },
    resource:  { en: 'cerebral strategy', zh: '睿智策略' },
    wealth:    { en: 'objective pressure', zh: '目标压制' },
    authority: { en: 'clutch composure', zh: '关键沉着' }
  },

  // Event-aura match-type chips.
  auraChip: {
    'high-tempo':      { en: 'High-tempo', zh: '快节奏' },
    'early-skirmish':  { en: 'Early skirmishes', zh: '前期团战' },
    'comeback':        { en: 'Comeback games', zh: '翻盘局' },
    'slow-burn':       { en: 'Slow-burn tactical', zh: '慢热战术' },
    'teamfight-macro': { en: 'Teamfight & macro', zh: '团战宏观' },
    'clutch':          { en: 'Clutch eliminations', zh: '关键淘汰' },
    'precision-duel':  { en: 'Precision duels', zh: '精准单挑' },
    'read-heavy':      { en: 'Read-heavy chess', zh: '博弈阅读' }
  },
  // element -> chip keys + body sentence.
  aura: [
    { chips: ['teamfight-macro', 'comeback'], en: 'You lean into the long, macro-driven game — patient scaling, coordinated teamfights, and the lead that snowballs into a clean close.', zh: '你偏爱宏观向的长局——耐心发育、团队协同的团战，以及一路滚成干净收尾的优势。' },
    { chips: ['high-tempo', 'early-skirmish'], en: 'You resonate with fast, front-loaded games — early skirmishes, relentless tempo, and a first blood that sets the whole map on fire.', zh: '你与前压、快打的对局共鸣——前期团战、不停歇的节奏，以及一血点燃整张地图。' },
    { chips: ['slow-burn', 'teamfight-macro'], en: 'You resonate with disciplined, slow-burn tactical matches — territory, tempo control, and the teamfight that a good macro plan sets up.', zh: '你与纪律、慢热的战术局共鸣——地图控制、节奏拿捏，以及靠宏观运营铺好的团战。' },
    { chips: ['clutch', 'precision-duel'], en: 'You resonate with precise, high-stakes matches — clutch eliminations, clean duels, and the round decided by one perfect trade.', zh: '你与精准、高压的比赛共鸣——关键淘汰、干净单挑，以及一次完美换血就定胜负的回合。' },
    { chips: ['comeback', 'read-heavy'], en: 'You resonate with fluid, chess-like matches — comebacks from behind, adaptive reads, and the improvised angle that flips a lost game.', zh: '你与灵动、如棋局般的比赛共鸣——劣势翻盘、随局应变，以及一记即兴取角扭转败局。' }
  ],
  // palace -> a signature aura chip to fold in.
  palaceChip: ['high-tempo', 'comeback', 'clutch', 'early-skirmish'],

  // Approved-tag labels (for player-fit copy).
  tag: {
    clutch: { en: 'clutch', zh: '关键先生' }, leader: { en: 'shot-calling', zh: '指挥' },
    aggressive: { en: 'aggressive', zh: '激进' }, disciplined: { en: 'disciplined', zh: '自律' },
    stable: { en: 'stable', zh: '稳健' }, calm: { en: 'calm', zh: '冷静' },
    creative: { en: 'creative', zh: '创意' }, veteran: { en: 'veteran', zh: '老将' },
    rookie: { en: 'rookie-spark', zh: '新秀锐气' }, mechanical: { en: 'mechanical', zh: '操作' },
    strategic: { en: 'strategic', zh: '战术' }
  },

  // Reason fragments (per-player one-liners on the ranking).
  zodiacRel: {
    '六合': { en: 'six-harmony', zh: '六合' }, '三合': { en: 'trine', zh: '三合' },
    '六冲': { en: 'clash-spark', zh: '相冲' }, '相刑': { en: 'tension', zh: '相刑' },
    '相害': { en: 'friction', zh: '相害' }, '相破': { en: 'edge', zh: '相破' },
    same: { en: 'shared-sign', zh: '同支' }, neutral: { en: 'easy', zh: '平和' }
  },
  mansionRel: {
    same: { en: 'the same birth mansion', zh: '同一本命宿' },
    palace: { en: 'a shared star-palace', zh: '同一星宫' },
    other: { en: 'mansions in dialogue', zh: '星宿相呼应' }
  },
  elementCN: ['木', '火', '土', '金', '水'],

  // Player-fit sentence builder pieces.
  playerFit: {
    lead: { en: 'Your strongest pulls', zh: '最吸引你的' },
    // {names} · {tenGodShort} · {tag}
    body: {
      en: 'Your strongest pulls — {names} — are drawn to you through {lens}. You lock onto their {tag} play, and that resonance is exactly why they top your watch-list.',
      zh: '最吸引你的——{names}——正是通过{lens}与你相连。你会不由自主盯住他们的{tag}，这份共鸣正是他们高居榜首的原因。'
    },
    bodyOne: {
      en: '{names} tops your list — a {lens} resonance that locks your eye onto their {tag} play.',
      zh: '{names} 高居榜首——一份{lens}的共鸣，让你的目光牢牢锁在他们的{tag}上。'
    }
  },

  /* Per-player layered explanation vocabulary. Composed by explainPlayer(). */
  explain: {
    label: {
      element: { en: 'Five Elements', zh: '五行' },
      branch:  { en: 'Branch',        zh: '地支' },
      mansion: { en: 'Mansion',       zh: '星宿' },
      style:   { en: 'Style',         zh: '风格' }
    },
    // A — headline hook, by the core Ten-God relation (player element vs yours).
    summaryHook: {
      companion: { en: 'a mirror-match you feel in your gut', zh: '感同身受的镜像对决' },
      output:    { en: 'mechanics that light you up',          zh: '点燃你的操作' },
      resource:  { en: 'strategy that steadies your eye',      zh: '让你安定的策略感' },
      wealth:    { en: 'a lead-hunt you love to chase',        zh: '你爱追的猎杀节奏' },
      authority: { en: 'clutch pressure that grips you',       zh: '攥住你的关键压力' }
    },
    // B — element relation: verb (complement/mirror/challenge) + viewing behavior + noun for the bottom line.
    elementRel: {
      companion: { rel: { en: 'mirrors', zh: '映照' }, noun: { en: 'mirror pull', zh: '镜像共振' }, behavior: { en: 'emotional momentum swings and mirror rivalries', zh: '情绪与势头的拉扯、镜像般的对决' } },
      output:    { rel: { en: 'channels', zh: '引燃' }, noun: { en: 'creative channel', zh: '引燃之势' }, behavior: { en: 'explosive mechanics and highlight plays', zh: '爆发操作与高光时刻' } },
      resource:  { rel: { en: 'nourishes', zh: '滋养' }, noun: { en: 'nourishing bond', zh: '滋养之合' }, behavior: { en: 'stable system play and strategic control', zh: '稳健的体系运营与战略掌控' } },
      wealth:    { rel: { en: 'draws out', zh: '牵引' }, noun: { en: 'lead-hunt pull', zh: '牵引之力' }, behavior: { en: 'objective pressure and lead-hunting', zh: '目标压制与滚雪球猎杀' } },
      authority: { rel: { en: 'tests', zh: '淬炼' }, noun: { en: 'high-pressure test', zh: '淬炼之压' }, behavior: { en: 'high-pressure, clutch moments', zh: '高压与关键处理' } }
    },
    // C — branch/zodiac relationship meaning (audience terms).
    branchCn: { six: '六合', trine: '三合', clash: '六冲', punish: '相刑', harm: '相害', destroy: '相破', same: '同支', neutral: '' },
    branchRel: {
      six:     { en: 'instantly easy to lock onto', zh: '一眼就能锁定的顺眼' },
      trine:   { en: 'strong matchup energy you naturally sync with', zh: '天然合拍的强匹配气场' },
      clash:   { en: 'tension-driven attraction — the clash is a thrill', zh: '对冲的张力——正面碰撞看着就来劲' },
      punish:  { en: 'friction that keeps you on edge', zh: '带刺的张力，让你一直提着神' },
      harm:    { en: 'a prickly, love-to-hate pull', zh: '又爱又气的微妙牵引' },
      destroy: { en: 'an unsettled edge that holds your gaze', zh: '一丝不安分的锋芒，勾着你的目光' },
      same:    { en: 'same-sign familiarity — you read them instantly', zh: '同支的熟悉感——你瞬间读懂他' },
      neutral: { en: 'a low-friction, easy watch', zh: '低摩擦、轻松好看的观感' }
    },
    // D — 28-mansion palace resonance as aura texture / pacing.
    mansionRel: {
      same:     { en: 'the exact same star-aura — identical pacing and mood', zh: '完全相同的星宿气场——一致的节奏与情绪' },
      palace:   { en: 'the same star-palace — a shared tempo and emotional register', zh: '同一星宫——共享的节奏与情绪基调' },
      opposite: { en: 'facing star-palaces — a high-contrast aura that still magnetizes', zh: '相对的星宫——高反差却相互吸引的气场' },
      adjacent: { en: 'neighboring auras — a complementary texture and pace', zh: '相邻的气场——互补的质感与节奏' }
    },
    // E — player play-style bucket (from tags) and the viewer's taste word (from element).
    bucket: {
      aggressive:  { en: 'brute-force aggression', zh: '强攻压制' },
      mechanical:  { en: 'highlight-driven play',  zh: '高光操作' },
      clutch:      { en: 'comeback & clutch pressure', zh: '翻盘与关键压制' },
      creative:    { en: 'creative improvisation',  zh: '创意即兴' },
      strategic:   { en: 'tactical control',        zh: '战术掌控' },
      leader:      { en: 'shot-calling control',    zh: '指挥调度' },
      disciplined: { en: 'disciplined execution',   zh: '纪律执行' },
      stable:      { en: 'steady, low-tilt play',   zh: '稳健不乱' },
      calm:        { en: 'cool-headed control',     zh: '冷静掌控' },
      veteran:     { en: 'veteran composure',       zh: '老练沉稳' },
      rookie:      { en: 'raw rookie upside',       zh: '新锐冲劲' }
    },
    taste: [
      { en: 'macro-patient', zh: '运营耐心' }, // wood
      { en: 'highlight-hungry', zh: '高光至上' }, // fire
      { en: 'system-trusting', zh: '体系至上' }, // earth
      { en: 'precision-loving', zh: '精准至上' }, // metal
      { en: 'read-loving', zh: '博弈至上' }  // water
    ],
    // F — bottom-line templates keyed by the strongest scoring layer.
    finalZodiac: { en: 'Bottom line: the {rel} {a}–{b} tie is the hook.', zh: '一句话：{a}{b} {rel} 的缘分最钩人。' },
    finalMansion: { en: 'Bottom line: the shared star-aura sets the pace you love.', zh: '一句话：相通的星宿气场，定下了你爱的节奏。' },
    finalElement: { en: 'Bottom line: the {a}–{b} {noun} is what pins your eye.', zh: '一句话：{a}{b} 的{noun}最抓你的眼。' },
    stemCombine: { en: ' (your day-stems even form a 天干五合 bond)', zh: '（日干还成天干五合，锁定般的吸引）' }
  }
};
