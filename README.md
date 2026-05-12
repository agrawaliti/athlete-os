# AthleteOS

A clean, offline-first fitness tracking app for combat athletes and hybrid athletes. Built with React Native, Expo, and TypeScript.

Designed for people who train BJJ, lift weights, and want a no-nonsense way to log workouts, track progressive overload, and review performance over time.

## What It Does

- **Fast gym logging** — select a template, log sets with minimal taps
- **Progressive overload tracking** — smart suggestions based on your recent history
- **PR detection** — automatic personal record tracking on every set
- **Workout history** — review past sessions with stats at a glance
- **Session rating** — rate how each workout felt for future fatigue-aware insights
- **Superset support** — exercises grouped visually as performed
- **Rest timer** — auto-triggered countdown with haptic feedback
- **Offline-first** — everything stored locally in SQLite, no account required

## Screenshots

_Coming soon_

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo Go](https://expo.dev/go) app on your phone (iOS or Android)
- Phone and computer on the same Wi-Fi network

### Install & Run

```bash
# Clone the repo
git clone git@github.com:agrawaliti/athlete-os.git
cd athlete-os

# Install dependencies
npm install

# Start the dev server
npx expo start
```

Scan the QR code from the terminal with your phone camera. The app opens in Expo Go.

> **Tunnel mode** (if QR doesn't connect on corporate/split Wi-Fi):
> ```bash
> npx expo start --tunnel
> ```

### Build a Standalone App

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure builds
eas build:configure

# Build for iOS (cloud build, outputs .ipa)
eas build --platform ios --profile production

# Build for Android (outputs .apk)
eas build --platform android --profile production
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo 54 |
| Language | TypeScript 5.9 |
| Navigation | Expo Router (file-based) |
| State | Zustand (active session) |
| Database | SQLite via expo-sqlite (offline-first) |
| Haptics | expo-haptics |
| IDs | nanoid (offline-safe, sync-ready) |

## Architecture

```
athlete-os/
├── app/                    # Screens (Expo Router file-based routing)
│   ├── _layout.tsx         # Root layout — DB init, navigation stack
│   ├── (tabs)/             # Bottom tab bar
│   │   ├── home.tsx        # Activity card grid (entry point)
│   │   ├── analytics.tsx   # Progress charts (placeholder)
│   │   └── settings.tsx    # Preferences (placeholder)
│   └── gym/                # Full-screen modal flow
│       ├── select-workout.tsx  # Template picker
│       ├── session.tsx         # Core workout logging
│       ├── summary.tsx         # Post-workout stats + rating
│       └── history.tsx         # Past workout list
│
├── src/
│   ├── core/               # Business logic (no UI)
│   │   ├── db/             # SQLite client, schema, migrations, seed
│   │   ├── repositories/   # Data access layer (CRUD per entity)
│   │   ├── services/       # Progression engine, future services
│   │   └── stores/         # Zustand stores (ephemeral session state)
│   │
│   ├── features/           # Feature-scoped UI components
│   │   ├── gym/components/ # ExerciseCard, SetRow, RestTimer, SupersetGroup
│   │   ├── analytics/      # Charts (future)
│   │   └── home/           # Home-specific components (future)
│   │
│   ├── types/              # Shared TypeScript interfaces & enums
│   │
│   └── ui/                 # Design system
│       ├── primitives/     # Text, Button, Card, NumericInput, Badge
│       └── theme/          # Colors, spacing, typography, shadows
```

### Key Design Decisions

**Offline-first**: All data lives in SQLite on-device. No account, no cloud dependency. Every set is written to disk immediately on log (crash-safe). IDs use nanoid so future cloud sync is trivial.

**Two-tier state**: Zustand holds the active workout session in memory (fast renders). SQLite holds everything persistent. On each `logSet()`, the store writes to both simultaneously.

**Progression engine**: Compares your last 3 sessions for each exercise. Suggests weight increases when you consistently hit target reps, maintains when you're on track, and suggests deloads when performance drops. Doesn't assume linear progression — accounts for fatigue, recovery, and external training load (BJJ, etc).

**Feature-based structure**: Each domain (gym, analytics, home) owns its components, hooks, and services. Shared UI lives in `src/ui/`. Core business logic lives in `src/core/`. Screens are thin — they compose features.

## Data Model

```
exercises              — Exercise library (30 seeded: bench, squat, deadlift, etc.)
workout_templates      — Named programs (Pull Day, Push Day, Legs)
template_exercises     — Exercises per template with targets, rest, superset groups
workout_sessions       — Completed workout instances with stats
set_logs               — Individual set records (weight, reps, RPE, PR flag)
personal_records       — PR history per exercise (auto-detected)
activity_sessions      — Future: BJJ, swimming, running sessions
```

## User Flow

```
Home → Gym → Select Template → Log Sets → Finish → Summary → Done
                                  │
                                  ├── Each set: enter weight + reps → LOG
                                  ├── Rest timer auto-starts
                                  ├── Undo last set if needed
                                  └── PR detected automatically
```

## Use Cases

**Primary: Gym strength training**
- PPL (Push/Pull/Legs) split with superset support
- Progressive overload suggestions per exercise
- PR tracking across sessions
- Volume and set tracking

**Future modules (architecture supports these today):**
- BJJ session logging (rolls, techniques, duration)
- Swimming / cardio tracking
- Analytics dashboard (PR timelines, volume charts, consistency streaks)
- Recovery and fatigue tracking
- Body metrics and habit tracking
- Apple Health / wearable integration
- AI-powered programming suggestions

## Target User

Hobbyist combat athletes and hybrid athletes who:
- Train BJJ + lift weights
- Want data-driven progression without complexity
- Value clean UI and fast interaction during workouts
- Don't want to pay for bloated fitness apps
- Want their data local and private

## Contributing

This is a personal project. If you're interested in contributing, open an issue first to discuss.

## License

Private — not open source (yet).
