# 🔮 Esports Destiny Match · 电竞命盘

A **static, front-end-only** fortune-style matcher. Enter a birth date (plus an
optional time and gender), pick 1–4 esports titles, and instantly get:

1. A short, direct **viewer archetype** — a Heavenly-Stem / Five-Element type (e.g. `甲木人`, `丁火人`)
2. A **star-mansion** label (e.g. `毕宿型`, `昴宿型`)
3. A one-line summary of your **viewing style** + what kind of matches pull you in
4. A readable "how your watch-list is read" explanation
5. A **featured #1 destined pro** plus your scannable **Top 10** — each with a match %,
   role, competition region, birth date, and a one-line reason
6. A **shareable result card** + copy-to-clipboard text

It's playful entertainment, not real astrology. The symbolic East Asian
metaphysics (Heavenly Stems, Five Elements, Ten Gods, Earthly-Branch
relationships, the 28 Lunar Mansions) are used purely as a fun, deterministic
layer that reframes the match as **audience × player × event aura** — which pros
you're *fated to watch*, never romance or social compatibility.

---

## ✨ Features

- **Pure static site** — HTML + CSS + vanilla JS. No build step, no backend.
- **Deterministic engine** — same inputs always give the same result. Nothing is random.
- **Transparent, JSON-configurable scoring** — every weight lives in `data/config.json`.
- **Data separated from UI** — players, games, and config are plain JSON.
- **Optional AI polish** — if you add an OpenAI key, it *only* rewrites the wording; the local engine still produces the ranking and percentages, and it falls back gracefully if the call fails.
- **Built-in data validation** — flags missing/inconsistent player fields in the console.
- **Mobile-first, dark cosmic/neon UI** with subtle animations and a screenshot-friendly share card.
- **localStorage** remembers your last inputs.

---

## 🗂 Project structure

```
index.html          # Landing + input card + result + share section
style.css           # Dark cosmic / neon theme, mobile-first, all self-contained
app.js              # Metaphysics engine, scoring, rendering, optional OpenAI layer
data/
  games.json        # Selectable esports titles
  players.json      # Curated pro players (no team field in the MVP)
  config.json       # Scoring weights & mappings — edit to tune the vibe
assets/
  players/          # Optional avatar images (auto-generated initials if empty)
  icons/            # Optional (emoji icons are used by default)
  backgrounds/      # Optional (background is pure CSS)
README.md
```

---

## 🚀 Run locally

Because the app loads JSON with `fetch`, browsers block it over `file://`.
Serve the folder over a tiny static server instead:

```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000

# …or Node
npx serve .
```

---

## 🌐 Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source = Deploy from a branch**.
4. Choose the branch (e.g. `main`) and folder **`/root`**, then **Save**.
5. Your site goes live at `https://<user>.github.io/<repo>/`.

No configuration or build step is required — it's plain static files.

---

## 🧠 How the matching works

The engine builds a lightweight **six-character BaZi chart** from your birth
info, then ranks players against it across four independent layers
(all weights in `data/config.json`):

1. **Core BaZi (Year + Month + Day) — 55%.** Day-master Ten-God relationship
   (生克 generation/control), five-element balance, and 天干五合.
2. **Chinese Zodiac — 20%.** Year branch with **Li Chun** as the year boundary;
   六合 · 三合 · 六冲 · 相刑 · 相害 · 相破.
3. **Star mansion (宿曜経 本命星宿) — 15%.** The **宿曜経 (Sukuyō)** birth-mansion
   method — the same lunar-calendar lineage the Chinese app **爱占星** uses. Your
   Gregorian birth date is converted to the **Chinese lunar calendar** (农历, leap
   months included) at your **birth-place meridian** (default UTC+8), then the
   本命宿 is read from the classical **27-宿 月宿傍通暦** table. It is **not** modern
   Moon longitude and **not** a custom cycle. The lunar conversion is the standard
   astronomical *qreki* algorithm (new moons 朔 + major solar terms 中気); the
   mansion table is ported from the public 宿曜経 implementation
   `ryutabi/shin_astrology`. Externally validated (98/98 reference parity + the
   爱占星 anchor 2000-03-01 → 虚宿 + a dozen documented celebrity 本命宿) — see
   **`VALIDATION.md`** and `tests/mansion.test.mjs`.
4. **Birth-hour refinement — 10%.** Applied only when both sides have a reliable
   hour; otherwise its weight is redistributed across the first three layers
   (never a penalty).

The layers are computed separately and do not interfere with each other — the
mansion layer is a pure lunar-date→mansion lookup, independent of the Five
Elements, Day Pillar and Zodiac.

**Time handling.** Enter your **birth place** (city / region) and pick your
birth-place **time zone** — the meridian on which the 农历 is computed. For
Mainland-China births the default is **UTC+8 (China Standard Time)**, a *default*,
not a hidden assumption; your device's time zone is never used. Near a new-moon
midnight the lunar day (hence the mansion) can differ by one between meridians, so
the time zone matters; if it is missing the mansion is marked **low-confidence**
(estimated on the UTC+8 农历). The lunar day changes at local midnight; **true
solar time is never applied** to the mansion (it refines only the birth-hour
pillar); **夜子時 (23:00–24:00 → next day) applies only when explicitly enabled**.
Scores map onto the configured band (default **60–99%**); the **top 10** are shown.

> Note: nationality/gender are never scoring factors; the anchors are tuned for a
> stable, entertainment-first experience, not observatory BaZi.

### Tuning it

Open `data/config.json` and edit `weights`, `scoreRange`, `tenGodTags`, or
`gameAffinity`. Reload the page — no rebuild needed.

---

## 🧩 Player data

Each player in `data/players.json`:

```json
{
  "id": "lol-faker",
  "name": "Faker",
  "realName": "Lee Sang-hyeok",
  "aliases": [],
  "game": "lol",
  "role": "Mid",
  "competition_region": "LCK",
  "birthDate": "1996-05-07",
  "birthTime": null,
  "avatar": "",
  "bio": "…",
  "tags": ["calm", "clutch", "leader", "stable"],
  "source": ["Liquipedia", "Leaguepedia"],
  "source_type": "liquipedia",
  "verified": true,
  "notes": "…"
}
```

- **No `team` field** in the visible schema — rosters change too often. Team
  context, when noted at all, lives only in `notes`/source metadata, never in
  the UI or the matching logic.
- **Geopolitical neutrality:** the UI renders **no flags, no nationalities, and no
  demonyms** — only a neutral `competition_region` label (e.g. `LCK`, `LPL`,
  `VCT Pacific`, `Europe`). Nationality is never a scoring factor.
- **Allowed tags:** `clutch, leader, aggressive, disciplined, stable, calm, creative, veteran, rookie, mechanical, strategic`.
- `birthTime` is `null` unless a reliable birth hour is known — hours are never invented.
- `avatar` is optional — leave it `""` and a colored initials badge is generated.

### Data ingestion & validation

Data is **curated** rather than scraped from raw HTML. Prefer structured
public-data workflows (APIs / curated entry) when importing more players, and
keep entries easy to validate and hand-correct.

A lightweight validator runs on load (`validatePlayers` in `app.js`) and prints
any missing/inconsistent fields to the browser console.

> ⚠️ **Birth dates are curated from public sources and power the scoring.**
> Entries flagged `"verified": false` (notably the Honor of Kings roster, whose
> public birth data is sparse) should be double-checked and corrected. Because
> the tool is entertainment-only, approximate dates still produce a fun,
> deterministic result — but PRs correcting them are welcome.

### Suggest a player (contribution flow)

The app has a **“＋ Suggest a player”** button (on the result card and in the
footer). It opens a compact, bilingual form — name, game, role, birth date/time,
competition region, source link, note. On submit the entry is **sanitized**
(angle brackets stripped, single-lined, length-capped) and **validated** (name,
game and a source are required; any birth date must be `YYYY-MM-DD`), then:

1. saved to a **local pending queue** (`localStorage['edm_submissions']`), and
2. routed for review — either by opening a **prefilled GitHub Issue** (label
   `player-submission`, see `.github/ISSUE_TEMPLATE/player_submission.yml`) or
   **copied as JSON** for a manual PR.

**Unverified submissions never touch `data/players.json`.** They land in the
review queue (`data/submissions.json` documents the schema and holds accepted-
but-not-yet-merged entries during triage). A maintainer verifies the birth date
against a public source, enforces the neutral schema (competition region only —
no nationality/flags, approved tags, `birthTime: null` unless known), and only
then hand-merges the record. The form is structured so it can later POST to an
API endpoint unchanged if a backend is added.

### Tests

`node tests/mansion.test.mjs` runs the Twenty-Eight Mansions regression suite
(including **2000-03-01 13:30 UTC+8 → 虚宿**, the 子時 day-roll, and the
one-mansion-per-day rotation).

To add a game, add an entry to `data/games.json` and give its players
`"game": "<id>"`.

---

## 🤖 Optional OpenAI polish

Click **✨ AI polish** and paste an OpenAI API key. It's stored **only in your
browser** (`localStorage`) and used to call OpenAI directly to rewrite the
archetype name, summary, and "why" copy in a more mystical tone.

- The **local engine always computes the ranking and percentages** first and
  renders them immediately.
- If no key is set, or the call fails, the app uses its local narrative
  templates and works exactly the same.
- The model is instructed never to invent names, numbers, or rankings.

---

## ⚖️ Disclaimer

Entertainment only. This is a fun fortune toy, not astrology, and not a
judgment of any player. Player metadata is compiled from public sources for a
symbolic matching game.
