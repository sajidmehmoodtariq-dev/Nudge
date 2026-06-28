# Nudge — Claude Code Context File

> This file is the single source of truth for the Nudge app project.
> Load this at the start of every Claude Code session.

---

## What is Nudge?

Nudge is a zero-friction reminder app for **Android** (Phase 1) and **Windows** (Phase 2).
A persistent floating bubble lives on top of every app. Tap it → paste clipboard, type, or speak a reminder in English, Roman Urdu, or Urdu script → Nudge parses the date/time → fires a local notification. No switching apps. No forms. Under 5 seconds end-to-end.

---

## Developer

- Name: Sajid
- Stack background: MERN, React Native, Expo, Python, MongoDB
- Prefers: TypeScript, functional components, hooks, Zustand for state
- No tutorial-style explanations needed — give direct, production-quality code

---

## Tech Stack

| Layer             | Technology                                            |
| ----------------- | ----------------------------------------------------- |
| Mobile Framework  | React Native 0.74 — **Bare Workflow** (NOT Expo Go)   |
| Language          | TypeScript throughout                                 |
| Animations        | react-native-reanimated 3                             |
| Gestures          | react-native-gesture-handler                          |
| Floating Overlay  | Custom Kotlin Native Module (SYSTEM_ALERT_WINDOW)     |
| Local Storage     | expo-sqlite                                           |
| Notifications     | @notifee/react-native                                 |
| Voice Input       | @react-native-voice/voice                             |
| Clipboard         | @react-native-clipboard/clipboard                     |
| EN Date Parser    | chrono-node                                           |
| Urdu Parsers      | Custom rule-based — src/parser/ (no external library) |
| Navigation        | react-navigation 6                                    |
| State Management  | Zustand                                               |
| Fonts             | Inter (Latin) + Noto Nastaliq Urdu (Urdu script)      |
| Backend (Phase 2) | Node.js + Express + MongoDB                           |
| Desktop (Phase 2) | Electron + React                                      |

---

## Design System — Follow This Exactly

### Colors (src/theme/colors.ts)

```ts
export const colors = {
  primary: '#5B5FEF', // Indigo — bubble, buttons, active states
  primaryDark: '#3D40C4',
  primaryLight: '#E8E9FD', // light indigo — backgrounds, badges
  accent: '#00C896', // Mint green — success, done state, bullets
  warning: '#F59E0B', // Amber — low confidence parse, caution
  danger: '#F43F5E', // Rose — delete, error
  background: '#F7F8FF', // Off-white app background
  surface: '#FFFFFF', // Card / panel surface
  textMain: '#1A1B2E', // Near-black main text
  textSub: '#6B7280', // Cool gray secondary text
  textLight: '#9CA3AF', // Placeholder, captions
  border: '#E5E7EB', // Card borders, dividers
};
```

### Typography (src/theme/typography.ts)

```ts
// Font families
// Latin/English: Inter (Inter-Regular, Inter-Medium, Inter-SemiBold, Inter-Bold)
// Urdu script: NotoNastaliqUrdu-Regular

// Scale (sp)
// 12sp — captions, timestamps
// 14sp — body text, list items
// 15sp — reminder label on card (SemiBold)
// 16sp — input field text
// 20sp — confirm screen label (Bold)
// 28sp — screen titles (Bold)

// Line height: always 1.5x font size
```

### Spacing (src/theme/spacing.ts)

```ts
// Base grid: 4dp
export const spacing = {xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32};
```

### Component Specs

- **Floating Bubble**: 56dp circle, `colors.primary` fill, white 'N' SVG icon, elevation 8, always-on-top, draggable, spring animation
- **Bottom Panel**: rounded top corners 20dp, white surface, handle bar 36x4dp at top, max height 60% screen, slide-up 220ms ease-out
- **Input Field**: rounded 12dp, border `colors.border`, focus border `colors.primary`, 16sp text
- **Primary Button**: full width, `colors.primary`, white text, 14dp radius, 52dp height, Inter Bold
- **Reminder Card**: white surface, 10dp radius, left accent strip (3dp wide, `colors.primary`), elevation 2
- **Tabs (Type/Paste/Speak)**: active = `colors.primary` underline + bold; inactive = `colors.textSub`

### Motion Rules

- All transitions: 220ms ease-out
- Panel open: translateY screen bottom → 0
- Bubble tap: spring (damping 12, stiffness 180)
- Confirmation: scale 0.8 → 1.0
- Success: bubble briefly turns `colors.accent` for 800ms
- Haptics: light on bubble press, success pulse on confirm save

---

## Folder Structure

```
src/
  bubble/
    BubbleService.ts          # JS wrapper around NativeModules.Bubble
    useBubble.ts              # Hook: { show, hide, isVisible }
  parser/
    detectLanguage.ts         # Returns 'URDU_SCRIPT' | 'ROMAN_URDU' | 'ENGLISH'
    englishParser.ts          # chrono-node wrapper
    romanUrduMap.ts           # Token map: kal→tomorrow, sham→evening, etc.
    romanUrduParser.ts        # Normalize Roman Urdu → feed into chrono-node
    urduScriptParser.ts       # Token map for Nastaliq script → chrono-node
    index.ts                  # parseReminder(text) — orchestrator, single export
  reminders/
    db.ts                     # SQLite init, singleton connection
    reminderService.ts        # createReminder, getAll, getCompleted, markDone, deleteReminder
    types.ts                  # Reminder interface
  notifications/
    notificationService.ts    # scheduleNotification, cancelNotification
  screens/
    HomeScreen.tsx
    ConfirmScreen.tsx
    SettingsScreen.tsx
  components/
    ReminderCard.tsx
    InputPanel.tsx            # The bottom sheet with 3 tabs
    EmptyState.tsx
  theme/
    colors.ts
    typography.ts
    spacing.ts
    index.ts                  # Re-export all theme
  store/
    reminderStore.ts          # Zustand store for reminders list
android/
  app/src/main/java/com/nudge/
    BubbleService.kt          # Floating overlay service
    BubbleModule.kt           # ReactContextBaseJavaModule bridge
    BubblePackage.kt          # Package registration
```

---

## Parser Output Schema

Every parser must return this exact shape:

```ts
interface ParseResult {
  datetime: Date | null;
  label: string; // reminder text minus the time expression
  confidence: 'high' | 'low' | 'none';
  originalText: string;
  language: 'ENGLISH' | 'ROMAN_URDU' | 'URDU_SCRIPT';
}
```

Rules:

- `datetime` null → `confidence: 'none'` → show DateTimePicker immediately
- Date parsed but no time → default to 09:00 AM
- Time parsed but no date → today if future, tomorrow if past
- Parser must run in under 20ms — synchronous only, no async, no network

---

## Reminder SQLite Schema

```sql
CREATE TABLE IF NOT EXISTS reminders (
  id             TEXT PRIMARY KEY,   -- UUID
  label          TEXT NOT NULL,      -- what the reminder is about
  datetime       INTEGER NOT NULL,   -- unix ms timestamp
  language       TEXT NOT NULL,      -- ENGLISH | ROMAN_URDU | URDU_SCRIPT
  originalText   TEXT NOT NULL,      -- raw input from user
  isCompleted    INTEGER DEFAULT 0,  -- 0 = pending, 1 = done
  createdAt      INTEGER NOT NULL,   -- unix ms
  notificationId TEXT               -- from @notifee/react-native
);
```

---

## Roman Urdu Token Map (partial — expand as needed)

```ts
export const ROMAN_URDU_MAP: Record<string, string> = {
  // Time references
  aaj: 'today',
  kal: 'tomorrow',
  parso: 'day after tomorrow',
  abhi: 'now',
  agli: 'next',
  is: 'this',
  // Periods
  subah: 'morning',
  dopeher: 'afternoon',
  sham: 'evening',
  raat: 'night',
  // Days
  somwar: 'Monday',
  mangal: 'Tuesday',
  budh: 'Wednesday',
  jumeraat: 'Thursday',
  jumma: 'Friday',
  hafta: 'Saturday',
  itwaar: 'Sunday',
  // Number words
  ek: '1',
  do: '2',
  teen: '3',
  chaar: '4',
  paanch: '5',
  chhe: '6',
  saat: '7',
  aath: '8',
  nau: '9',
  das: '10',
  // Clock
  baje: "o'clock",
  minute: 'minutes',
  ghante: 'hours',
  mein: 'in',
};
```

---

## Urdu Script Token Map (partial — expand as needed)

```ts
export const URDU_SCRIPT_MAP: Record<string, string> = {
  // Time references
  کل: 'tomorrow',
  پرسوں: 'day after tomorrow',
  آج: 'today',
  ابھی: 'now',
  اگلے: 'next',
  اس: 'this',
  // Periods
  صبح: 'morning',
  دوپہر: 'afternoon',
  شام: 'evening',
  رات: 'night',
  // Days
  سوموار: 'Monday',
  منگل: 'Tuesday',
  بدھ: 'Wednesday',
  جمعرات: 'Thursday',
  جمعہ: 'Friday',
  ہفتہ: 'Saturday',
  اتوار: 'Sunday',
  // Number words
  ایک: '1',
  دو: '2',
  تین: '3',
  چار: '4',
  پانچ: '5',
  چھے: '6',
  سات: '7',
  آٹھ: '8',
  نو: '9',
  دس: '10',
  // Clock
  بجے: "o'clock",
  منٹ: 'minutes',
  گھنٹے: 'hours',
  میں: 'in',
};
```

---

## Android Permissions Required

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

---

## Phase 1 Build Order (do not skip ahead)

1. Project init — bare RN + TypeScript + ESLint + Prettier
2. Theme system — colors.ts, typography.ts, spacing.ts
3. Folder structure — create all empty files with correct exports
4. SQLite setup — db.ts + reminderService.ts
5. Parser module — detectLanguage → englishParser → romanUrduParser → urduScriptParser → index.ts
6. Write parser unit tests (min 10 cases each language)
7. Android native module — BubbleService.kt → BubbleModule.kt → BubblePackage.kt
8. JS bridge — BubbleService.ts + useBubble hook
9. InputPanel component — 3-tab bottom sheet (Type / Paste / Speak)
10. ConfirmScreen — parsed result display + DateTimePicker override
11. Notification service — scheduleNotification + cancelNotification
12. HomeScreen — FlatList of ReminderCards, Upcoming/Completed tabs
13. SettingsScreen — basic settings via AsyncStorage
14. End-to-end test on physical Android device

---

## Non-Negotiable Rules

1. **Speed** — bubble → confirm → back in under 5 seconds always
2. **Never lose a reminder** — SQLite is ground truth; notifications are secondary
3. **RTL support** — test every screen in RTL layout (Urdu script users)
4. **Single theme file** — zero hardcoded colors or font sizes outside src/theme/
5. **Parser is synchronous** — no async, no API calls, must return under 20ms
6. **Physical device testing** — SYSTEM_ALERT_WINDOW does not work reliably on emulator
7. **Phase discipline** — do not add sync/auth/backend until Phase 1 is complete and stable

---

## What is NOT in Phase 1

- No user accounts or login
- No backend or API
- No cross-device sync
- No recurring reminders
- No snooze from notification
- No home screen widget
- No Windows app
- No location-based reminders
- No LLM/AI parsing fallback

---

## Phase 2 Overview (future — do not build yet)

- Node.js + Express + MongoDB backend
- JWT auth (email/password + Google OAuth)
- Real-time sync via Socket.io
- Electron Windows companion app (global hotkey Ctrl+Shift+N)
- Offline-first: SQLite local → sync to backend when online

---

_Last updated: June 2025 — Phase 1 in progress_
