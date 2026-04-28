# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm start            # Start Expo dev server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run web          # Run in browser
npm run lint         # ESLint
```

No test suite is configured. There is no build step beyond Expo's managed workflow.

## Architecture

SplitMate is an offline-first React Native expense-splitting app (Expo managed workflow, TypeScript, Expo Router v6 for file-based navigation).

**State is split across two Zustand stores:**
- `store/useAuthStore.ts` — biometric lock state (in-memory only; resets on app restart)
- `store/useGroupStore.ts` — all group/member/expense data, persisted to AsyncStorage under key `splitmate-storage`

**Routing** follows Expo Router conventions. The root layout (`app/_layout.tsx`) wraps everything in an auth guard: if `useAuthStore.isAuthenticated` is false, the `LockScreen` component is rendered instead of the app. All group screens live under the dynamic route `app/group/[id]/`.

**Settlement algorithm** in `useGroupStore.getSettlements(groupId)`: computes per-member balances, then uses a two-pointer greedy approach on sorted creditors/debtors to minimize the number of payment transactions. Returns `{from, to, amount}[]`.

**Styling** uses React Native `StyleSheet` exclusively — no UI library. All colors, spacing, radii, and common style presets are defined in `constants/theme.ts`. The app uses a dark theme throughout.

**Data model** (`types/index.ts`):
- `Group` → has `members: Member[]` and `expenses: Expense[]`
- `Expense` stores `paidBy` (memberId) and `splitBetween` (memberIds[])
- IDs are generated with `Date.now().toString()`

## Key constraints

- No backend or network requests — purely local AsyncStorage
- Biometric auth via `expo-local-authentication`; no PIN/password fallback is implemented (device fallback is enabled in the prompt options)
- React Compiler and Expo typed routes are both enabled in `app.json`
- Path alias `@/*` maps to the repo root (configured in `tsconfig.json`)
- Currency display uses `₹` (Indian Rupees) throughout the UI
