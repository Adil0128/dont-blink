# ⚡ DON'T BLINK — 30-Second Hyper Reflex Arcade

> **"A 30-second reflex challenge designed to go viral on TikTok, Instagram Reels, and WhatsApp."**

![Tech Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20TypeScript%20%7C%20TailwindCSS%20%7C%20Supabase-10b981?style=for-the-badge)
![Gameplay](https://img.shields.io/badge/Round%20Time-Exactly%2030s-a855f7?style=for-the-badge)
![Audio](https://img.shields.io/badge/Sound-Web%20Audio%20API%20Synthesizer-00f0ff?style=for-the-badge)

---

## 🎯 Game Objective
Understand within 3 seconds, play within seconds, and replay continuously.
You have **exactly 30 seconds** on the clock. Targets spawn rapidly across the cyber arena. Your goal is to maximize your score, build insane combo multipliers, and dominate the global leaderboard without touching a bomb.

---

## 🕹️ Gameplay Rules & Points

| Target | Visual | Points | Effect |
| :--- | :--- | :---: | :--- |
| **Green Target** | 🟢 Neon Green Crosshair | **+10 pts** | Boosts combo multiplier (+1) |
| **Golden Target** | 🟡 Pulsing Gold Star | **+25 pts** | Rarer, faster shrink, high reward (+2 combo) |
| **Red Target** | 🔴 Crimson Warning Cross | **-15 pts** | Resets combo streak to 0, screen shake |
| **Bomb Target** | 💣 Ticking Black/Red Bomb | **0 pts** | **Instant Game Over!** Detonation rumble |

- **Countdown Ring**: Every target has an SVG circular progress ring showing its remaining lifetime.
- **Dynamic Speed Scaling**: As the timer ticks down and your score rises, targets spawn faster (down to 340ms intervals) and expire quicker.
- **Combo Multipliers**:
  - `x1.0` (0–2 streak)
  - `x1.5` (3–4 streak)
  - `x2.0` (5–9 streak)
  - `x3.0` (10+ streak)
- **Multi-Click Prevention**: Targets immediately deactivate pointer events upon first tap.

---

## 🚀 Viral & Social Features

1. **Direct Friend Challenges (VS Mode)**:
   - Click **"Challenge"** on the Result screen to generate a unique challenge link:
     `https://your-domain/?challenger=Alex&target=420`
   - When opened by a friend, a **VS Challenger Banner** appears at the top:
     *"Alex challenged you to beat 420 pts!"*
   - During gameplay, a real-time progress tracker displays remaining points needed to defeat the friend.
2. **Downloadable Viral Story Score Cards**:
   - One-tap button renders an ultra-crisp **1080x1350 PNG Score Card** (formatted for Instagram Stories, TikTok, and WhatsApp status).
   - Features neon cyberpunk framing, player name, large final score, accuracy %, max combo, and call-to-action watermark.
3. **Native Web Share & WhatsApp**:
   - Uses `navigator.share` on mobile devices.
   - WhatsApp direct link formatted with emojis and instant play URL.
4. **Viral Rank Titles & Playful Messages**:
   - `>= 500 PTS`: `⚡ CYBER GOD (TOP 0.01%)`
   - `>= 380 PTS`: `🥷 CYBER NINJA`
   - `>= 260 PTS`: `🎯 SHARPSHOOTER`
   - `< 140 PTS`: `👀 SLOW BLINKER`
   - `Bomb Detonation`: `💥 BOOM! DETONATED`

---

## 🎨 Arcade Design & Sound

- **Aesthetic**: Dark Obsidian background (`#080811`), Neon Lime (`#00ff88`), Electric Cyan (`#00f0ff`), and Cyber Purple (`#a855f7`).
- **Sound Engine**: 100% built on native **Web Audio API**:
  - No external MP3 downloads required.
  - Zero loading latency, instant crisp audio pops, gold coin chimes, buzzer thuds, and sub-bass bomb explosions.
- **Particle System**: Hardware-accelerated 60fps HTML5 Canvas particle engine for target bursts and victory confetti.
- **Themes**:
  1. `Cyber Neon` (Default)
  2. `Synthwave 80s`
  3. `Matrix Code`
  4. `Vampire Dark`
  5. `Hyper Gold (VIP)`

---

## 🗄️ Supabase Cloud & Leaderboard Setup

The project includes ready-to-run Supabase integration with automatic fallback to local high scores.

### 1. Database Schema
Copy and execute the contents of `supabase/schema.sql` inside your Supabase project's **SQL Editor**:
- Creates `public.leaderboard` and `public.challenges` tables.
- Enables Row Level Security (RLS) policies.
- Adds anti-cheat score range validation.

### 2. Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🌐 Launch Free on GitHub Pages (Public Web Game)

The repository includes a ready-made **GitHub Actions workflow** (`.github/workflows/deploy.yml`) and a `docs/` folder for instant deployment:

### 1. Create a GitHub Repo
1. Visit [github.com/new](https://github.com/new) and name your repository: `dont-blink`.
2. Select **Public**.

### 2. Push Code
Run the included `deploy-to-github.bat` script, or run:
```bash
git init
git add .
git commit -m "Launch DON'T BLINK arcade game"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/dont-blink.git
git push -u origin main
```

### 3. Enable GitHub Pages
1. Go to your repository **Settings** $\rightarrow$ **Pages**.
2. Under **Build and deployment** $\rightarrow$ **Source**, choose **GitHub Actions** (or select **Deploy from branch** $\rightarrow$ `/docs`).
3. Your live game URL will be ready at:
   `https://<YOUR-USERNAME>.github.io/dont-blink/`

---

## 🏃 Quick Start & How to Play Locally

### Option 1: Instant Browser Play (Zero Installation)
Simply double-click or open `dont-blink.html` in any web browser! Everything is self-contained with zero external dependencies.

### Option 2: Local HTTP Server
Run with Antigravity Node or standard Node:
```powershell
agy-node server.js
# Or
node server.js
```
Then visit `http://localhost:3000` in your browser.

### Option 3: Full React + Vite Development
```bash
npm install
npm run dev
```

---

## 📁 Project Architecture

```
dont-blink-game/
├── dont-blink.html        # Standalone, zero-dependency browser build
├── server.js              # Zero-dependency Node.js HTTP server
├── index.html             # React Vite HTML entry
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── tailwind.config.js     # Custom neon colors & animations
├── supabase/
│   └── schema.sql         # Supabase PostgreSQL database schema & RLS
└── src/
    ├── main.tsx           # React root mount
    ├── App.tsx            # Main game orchestrator & theme manager
    ├── index.css          # CSS animations & styles
    ├── types/
    │   └── game.ts        # TypeScript interfaces & types
    ├── utils/
    │   ├── sound.ts       # Web Audio API Synthesizer
    │   ├── particles.ts   # 60fps Canvas particle engine
    │   ├── scoreCard.ts   # HTML5 Canvas viral PNG generator
    │   └── storage.ts     # LocalStorage, streak & missions manager
    ├── services/
    │   └── supabase.ts    # Supabase client with anti-cheat & mock fallback
    └── components/
        ├── HomeScreen.tsx       # Animated logo, Play button, personal best
        ├── GameScreen.tsx       # 30s timer, live score, arena, targets
        ├── Target.tsx           # Countdown SVG ring, icon, tap handler
        ├── ResultScreen.tsx     # Final stats, rank, social sharing
        ├── ChallengeBanner.tsx  # VS friend tracker
        ├── LeaderboardModal.tsx # Global & Weekly leaderboards
        ├── AchievementsModal.tsx# Daily streak & achievement badges
        ├── ThemeSelector.tsx    # Arcade theme switcher
        └── MonetizationModal.tsx# Rewarded ad simulation & VIP unlock
```
