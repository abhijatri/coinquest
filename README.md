# 🪙 CoinQuest — Drop. Connect. Win!

A world-class, production-grade Connect 4 gaming platform built for kids. Five thrilling game modes, Firebase authentication, XP progression, achievements, and beautiful UI.

---

## ✨ Features

| Feature | Details |
|---|---|
| **5 Game Modes** | Classic, Power Mode, Timed Blitz, Connect 5, Color Chaos |
| **Auth** | Google OAuth · Phone OTP (SMS) · Email Magic Link |
| **Progress** | XP system · 20 levels · per-mode stats · 18 achievements |
| **AI** | Easy / Medium / Hard (minimax + alpha-beta pruning) |
| **Design** | Dark-first · mobile-responsive · 44px tap targets · confetti wins |
| **Sound** | Web Audio API — no external files, procedurally generated |

---

## 🚀 Quick Start (5 minutes to playing)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd coinquest
npm install
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use an existing one)
3. Enable these services:
   - **Authentication** → Sign-in methods:
     - ✅ Google
     - ✅ Phone (requires billing / Blaze plan for production)
     - ✅ Email/Password → **Email link (passwordless sign-in)**
   - **Firestore Database** → Create in production mode
4. In Project Settings → Your Apps → Add Web App → copy config
5. Deploy Firestore rules (see below)

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Firebase values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Deploy Firestore security rules

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login and init (select your project)
firebase login
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 📋 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Auth domain (project-id.firebaseapp.com) |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Storage bucket URL |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Cloud Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | ❌ | Analytics measurement ID (optional) |

---

## 🔥 Firebase Setup Details

### Phone Auth (SMS OTP)
- Requires the **Blaze (pay-as-you-go) plan** for production SMS
- For local testing: add test phone numbers in Firebase Console → Authentication → Sign-in methods → Phone → Test phone numbers
- reCAPTCHA is configured as **invisible** (no user interaction needed)

### Email Magic Link
- Works on any Firebase plan
- The magic link redirects to `VITE_FIREBASE_AUTH_DOMAIN/auth?emailLink=true`
- Add your local dev domain (`http://localhost:5173`) to Firebase Auth → Authorized domains

### Google OAuth
- Works on any Firebase plan
- No extra setup needed — Firebase handles it

### Firestore Indexes
The app uses simple document reads/writes — no composite indexes required.

---

## 🛠️ Commands

```bash
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Production build → ./dist
npm run preview    # Preview production build locally
```

---

## 🚢 Deploy

### Vercel (recommended)
```bash
npm install -g vercel
vercel --prod
```
Add all `VITE_*` environment variables in the Vercel dashboard.

### Firebase Hosting
```bash
firebase init hosting  # Set public dir to "dist", SPA: yes
npm run build
firebase deploy --only hosting
```

### Netlify
```bash
npm run build
# Drag & drop the ./dist folder to Netlify dashboard
# Or: netlify deploy --prod --dir=dist
```
Add `VITE_*` env vars in Netlify → Site settings → Environment variables.

For SPA routing on Netlify, add a `public/_redirects` file:
```
/* /index.html 200
```

---

## 🎮 Game Modes

### Classic Connect 4
- 7×6 grid · first to connect 4 wins
- vs AI (Easy / Medium / Hard) or 2-player local
- Hard AI uses minimax with alpha-beta pruning (depth 7)

### Power Mode
- Same as Classic + 3 power tokens per player:
  - 💣 **Bomb** — click an opponent coin to remove it
  - 🔄 **Swap** — move your last coin to another column
  - ⏩ **Double** — drop 2 coins in one turn

### Timed Blitz
- 10 seconds per turn · miss it = forfeit that turn
- Fast-paced sound cues for urgency

### Connect 5
- 9×7 board · must connect 5 in a row
- vs AI or 2-player local

### Color Chaos
- 9×7 board · 4 players take turns
- First to connect 4 of their color wins

---

## 📊 XP & Level System

| Result | XP |
|---|---|
| Win | +10 XP |
| Draw | +3 XP |
| Loss | +1 XP |

20 levels from Rookie → CoinQuest God. XP thresholds increase non-linearly.

---

## 🏅 Achievements

18 achievements including:
- First Win, Hat Trick, On Fire!, Unstoppable
- Mode-specific: Classic Pro, Power Player, Blitz Master, High Five!, Chaos King
- Coin milestones: Coin Collector (100), Coin Hoarder (500), Coin Legend (1000)
- Level milestones: Rising Star (Lv5), Grandmaster (Lv10)
- Explorer (play all 5 modes), All-Rounder (win all 5 modes)

---

## 🗂️ Project Structure

```
coinquest/
├── src/
│   ├── firebase/          # Firebase config, auth helpers, Firestore CRUD
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Game logic, AI engine, XP system, achievements
│   ├── contexts/          # React contexts (Auth, Sound, Theme)
│   ├── hooks/             # Custom hooks (useGameStats)
│   ├── components/
│   │   ├── auth/          # Auth flow components
│   │   ├── game/          # Board, header, game-over overlay, power tokens, timer
│   │   ├── profile/       # Profile card, stats cards, achievement badges
│   │   ├── ui/            # Button, Input, Spinner, Toast
│   │   └── layout/        # Navbar, ProtectedRoute, PageTransition
│   ├── games/             # 5 game mode implementations
│   └── pages/             # Landing, Auth, Home, Profile, Settings
├── firestore.rules        # Firestore security rules
├── firebase.config.example.js
├── .env.example
└── README.md
```

---

## 🔒 Security

- No passwords stored anywhere
- All user data scoped to `users/{uid}` and `stats/{uid}` — only accessible by the owning user
- Firestore rules enforce ownership and validate display name length
- Environment variables are never committed (`.gitignore` covers `.env.local`)

---

Built with React 18 · TypeScript · Tailwind CSS · Firebase 10 · Vite 5
