# 🔮 Esports Destiny Match · 电竞命盘

A **static, front-end-only** fortune-style matcher. Enter a birth date (plus an
optional time and gender), pick 1–4 esports titles, and instantly get:

1. A short, direct **archetype** — a Heavenly-Stem / Five-Element type (e.g. `甲木人`, `丁火人`)
2. A **star-mansion** label (e.g. `毕宿型`, `昴宿型`)
3. A one-line summary + what kinds of matches you're most suited to watch
4. A readable "why" explanation
5. Your **Top 10 destined pro players** with compatibility %, role, nationality, birth date, and a one-line reason
6. A **shareable result card** + copy-to-clipboard text

It's playful entertainment, not real astrology. The symbolic East Asian
metaphysics (Heavenly Stems, Five Elements, Ten Gods, Earthly-Branch
relationships, the 28 Lunar Mansions) are used purely as a fun, deterministic
compatibility layer.

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

The engine maps you into a **compact archetype profile**, then ranks players
from your selected games against it.

1. **Birth date → day pillar.** A Julian-Day computation yields a stable
   sexagenary day index, giving a **Heavenly Stem** (→ Five Element + Yin/Yang)
   and an **Earthly Branch**. The same date also maps to one of the **28 Lunar
   Mansions**. An optional **birth time** nudges an hour-branch tie-breaker.
2. **Scoring** (see `data/config.json`) combines, for each player:
   - **Element / Ten-God relationship** (生克 generation & control cycles) — the core signal
   - **Earthly-Branch relationships** — 六合 (six harmony), 三合 (trine), 六冲 (clash), 六害 (harm)
   - **Lunar-mansion resonance** — exact mansion match or same palace (青龙/玄武/白虎/朱雀)
   - **Yin/Yang + gender** flavor
   - **Tag affinity** — the Ten-God flavor prefers certain player tags (calm, aggressive, clutch, …)
   - **Optional game affinity** bias per element
3. Raw scores are mapped onto the configured percentage band (default **60–99%**)
   and sorted (with a stable tie-break), and the **top 10** are shown.

> Calibration note: the day-pillar and mansion anchors are tuned for a stable,
> symbolic, entertainment experience — not for precise astronomical BaZi.

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
  "game": "lol",
  "role": "Mid",
  "nationality": "South Korea",
  "birthDate": "1996-05-07",
  "birthTime": null,
  "avatar": "",
  "bio": "…",
  "tags": ["calm", "clutch", "leader", "stable"],
  "source": { "origin": "public-wiki", "verified": true }
}
```

- **No `team` field** in the MVP — rosters change too often. If you add teams
  later, keep the field optional and separate from the matching logic.
- **Allowed tags:** `calm, aggressive, clutch, leader, creative, stable, explosive`.
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
