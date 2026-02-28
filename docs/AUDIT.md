# PixelTrivia Professional Codebase Audit

> **Date:** 2025-01-XX  
> **Scope:** 71 files across `lib/`, `hooks/`, `constants/`, `types/`, `app/`, and config files  
> **Methodology:** Full manual read → cross-file pattern analysis → categorised finding report

---

## Table of Contents

1. [Comment Consistency](#1-comment-consistency)
2. [Formatting Consistency](#2-formatting-consistency)
3. [Modularity & Structure](#3-modularity--structure)
4. [Scalability](#4-scalability)
5. [UI/UX & Color Consistency](#5-uiux--color-consistency)
6. [Cross-File Duplication Summary](#6-cross-file-duplication-summary)
7. [Actionable Recommendations](#7-actionable-recommendations)

---

## 1. Comment Consistency

### 1.1 Module-Level JSDoc Headers

The project convention (established by `lib/logger.ts`, `hooks/useGameState.ts`, etc.) is a multi-line JSDoc block with `@module` and `@since` tags at the top of every file.

#### Files WITH proper `@module` + `@since` JSDoc header ✅

| Layer | Files |
|-------|-------|
| **lib/** | `storage.ts`, `apiResponse.ts`, `logger.ts`, `rateLimit.ts`, `security.ts`, `security.core.ts`, `quickQuizApi.ts`, `gameApi.ts`, `roomApi.ts` |
| **hooks/** | `index.ts`, `useGameState.ts`, `useLocalStorage.ts`, `usePlayerSettings.ts`, `useQuizSession.ts`, `useTimer.ts`, `useGameHistory.ts` |
| **constants/** | `index.ts`, `categories.ts`, `difficulties.ts`, `avatars.ts`, `game.ts` |
| **types/** | `index.ts`, `api.ts`, `game.ts`, `quiz.ts`, `room.ts` |
| **app/components/ui/** | `index.ts`, `AnimatedBackground.tsx`, `GamePageLayout.tsx`, `LoadingSpinner.tsx`, `Modal.tsx`, `PageHeader.tsx` |
| **app/components/stats/** | `index.ts`, `StatsOverview.tsx`, `GameHistoryList.tsx`, `StatsChart.tsx` |
| **app/game/** | `stats/page.tsx`, `join/page.tsx`, `create/page.tsx`, `play/[code]/page.tsx` |

#### Files MISSING module-level JSDoc header ❌

| File | What it has instead |
|------|-------------------|
| `lib/errors.ts` | JSDoc present but **missing `@module` and `@since`** |
| `lib/validation.ts` | Minimal JSDoc, no `@module`/`@since` |
| `lib/roomCode.ts` | Uses `@param`/`@returns` on functions only, no file-level doc |
| `lib/supabase.ts` | **No header at all** |
| `lib/customQuizApi.ts` | Single-line `// Client utility...` comment |
| `app/page.tsx` | No header |
| `app/layout.tsx` | Block comment but not JSDoc format (no `@module`/`@since`) |
| `app/error.tsx` | Inline function JSDoc only |
| `app/global-error.tsx` | Inline function JSDoc only |
| `app/not-found.tsx` | Inline function JSDoc only |
| `app/globals.css` | No header comment |
| `app/components/Help/HelpButton.tsx` | No header |
| `app/components/Help/HelpContext.tsx` | No header |
| `app/components/Help/HelpModal.tsx` | No header |
| `app/components/Help/index.ts` | No header |
| `app/components/AdvancedGameConfigurator.tsx` | No header |
| `app/components/BackButton.tsx` | No header |
| `app/components/CustomGameConfigurator.tsx` | No header |
| `app/components/MainMenuLogo.tsx` | No header |
| `app/components/QuickGameSelector.tsx` | No header |
| `app/components/SettingsPanel.tsx` | No header |
| `app/game/mode/page.tsx` | No header |
| `app/game/quick/page.tsx` | No header |
| `app/game/custom/page.tsx` | No header |
| `app/game/advanced/page.tsx` | No header |
| `app/game/select/page.tsx` | No header |
| `middleware.ts` | Has JSDoc but no `@module`/`@since` |
| `tailwind.config.js` | Only `@type` annotation |
| `next.config.js` | Only `@type` annotation |
| `jest.config.js` | Only `@type` annotation |

**Summary:** 27 of 71 files lack the standard header. Most of the non-compliant files are in `app/components/` and game pages.

### 1.2 Inline Comment Style Inconsistencies

| Pattern | Where used | Recommendation |
|---------|-----------|----------------|
| `// =========` section separators | `lib/storage.ts`, `constants/game.ts`, `constants/difficulties.ts` | Adopt consistently or drop |
| `// Game mode types` style labels | `app/game/mode/page.tsx` L14, `app/game/select/page.tsx` L11 | Use JSDoc `/** @section */` or separator blocks like lib files |
| `// TODO:` comments in production | `app/game/quick/page.tsx` L47, `app/game/custom/page.tsx` L40–41 | Track in TODO.md or issue tracker, not code |

### 1.3 Logging Style Inconsistency

The project has a dedicated `logger` module (`lib/logger.ts`) and its own codex (`docs/CLAUDE.md` L393, L484) explicitly requires: _"Use `logger` from `lib/logger` (not console.error)"_.

**Files violating this rule** (using raw `console.error` in production code):

| File | Line(s) |
|------|---------|
| `lib/apiResponse.ts` | L297 |
| `lib/gameApi.ts` | L61 |
| `lib/quickQuizApi.ts` | L46 |
| `lib/customQuizApi.ts` | L46 |
| `lib/rateLimit.ts` | L299 |
| `app/error.tsx` | L19 |
| `app/components/ErrorBoundary.tsx` | L41–42 |
| `app/game/quick/page.tsx` | L52 |
| `app/game/custom/page.tsx` | L53 |
| `app/game/advanced/page.tsx` | L36 |

---

## 2. Formatting Consistency

### 2.1 Import Ordering

The dominant convention observed is:

1. React / Next.js framework imports
2. Internal component imports (`@/app/components/…`)
3. Hooks (`@/hooks/…`)
4. Libraries (`@/lib/…`)
5. Constants (`@/constants/…`)
6. Types (`@/types/…`)

**Violations:**

| File | Issue |
|------|-------|
| `app/game/mode/page.tsx` L20–21 | Constants imported *after* component usage, separated by a blank line and type declaration block |
| `app/game/select/page.tsx` L21–22 | Same pattern: constants imported after inline type declarations |
| `app/game/join/page.tsx` L46 | Hardcoded `'pixeltrivia_player_name'` string instead of importing `STORAGE_KEYS` |

### 2.2 Export Style

| Pattern | Files |
|---------|-------|
| `export default function` | Most game pages, `SettingsPanel.tsx` |
| Named export + `export default` class | `ErrorBoundary.tsx` |
| Named exports only | `lib/*.ts`, `hooks/*.ts`, `constants/*.ts`, `types/*.ts` |
| Barrel `export *` | `constants/index.ts`, `types/index.ts` |
| Barrel named exports | `hooks/index.ts`, `app/components/ui/index.ts` |
| Default re-exports | `app/components/Help/index.ts` |

The barrel export style differs between directories — `constants/` uses `export *` while `hooks/` uses named re-exports. This is a minor inconsistency but can lead to namespace pollution from `export *`.

### 2.3 `'use client'` Directive

**Files using React hooks (`useState`, `useEffect`, etc.) without `'use client'`:**

| File | Uses |
|------|------|
| `app/components/AdvancedGameConfigurator.tsx` | `useState` (L2) |

Note: `SettingsPanel.tsx` doesn't use hooks directly (receives callbacks as props), so it does not require the directive, though it could be added for clarity.

### 2.4 Deprecated API Usage

`String.prototype.substr()` is deprecated in favour of `substring()` or `slice()`.

| File | Line |
|------|------|
| `hooks/useQuizSession.ts` | L91 |
| `lib/gameApi.ts` | L98 |
| `lib/quickQuizApi.ts` | L114 |
| `lib/storage.ts` | L327 |
| `app/components/AdvancedGameConfigurator.tsx` | L63 |
| `app/components/ui/PixelInput.tsx` | L106, L231 |

---

## 3. Modularity & Structure

### 3.1 Type Duplication

**Critical:** `ApiSuccessResponse`, `ApiErrorResponse`, and `ApiResponse` are defined in **two places**:
- `types/api.ts` (L18, L32, L51) — canonical type definitions
- `lib/apiResponse.ts` (L23, L39, L51) — re-defined with identical structure

**Impact:** If one is updated without the other, consumers will get type mismatches. `lib/apiResponse.ts` should import from `types/api.ts`.

### 3.2 Storage Key Duplication

Two separate `STORAGE_KEYS` objects exist with **different key formats**:

| Location | Prefix Format | Keys |
|----------|---------------|------|
| `lib/storage.ts` L163 | `pixeltrivia_profile`, `pixeltrivia_settings`, etc. | `ROOT`, `PROFILE`, `SETTINGS`, `HISTORY`, `SESSION` |
| `constants/game.ts` L187 | `pixeltrivia_player_name`, `pixeltrivia_player_avatar`, etc. | `PLAYER_NAME`, `PLAYER_AVATAR`, `PLAYER_VOLUME`, `ADVANCED_CONFIG`, `GENERATED_QUESTIONS`, `GAME_METADATA` |

**Impact:** The two sets are complementary (non-overlapping keys) but having them in separate files with different naming conventions is confusing. Additionally, `app/game/join/page.tsx` L46 hardcodes `'pixeltrivia_player_name'` instead of using `STORAGE_KEYS.PLAYER_NAME`.

### 3.3 Category Data Duplication

`GAME_CATEGORIES` is defined in:
- `constants/categories.ts` L51 — the canonical source, keyed by `DifficultyLevel`
- `app/components/QuickGameSelector.tsx` L9 — a completely separate inline copy

**Key differences between the two copies:**
- QuickGameSelector uses `'college-level'` as a key; constants uses `'college'`
- The `'classic'` difficulty categories differ (QuickGameSelector has 'Movies & TV', 'Pop Culture'; constants has different groupings)
- QuickGameSelector does not import from constants at all

### 3.4 Knowledge Level Duplication

`KNOWLEDGE_LEVELS` is defined in:
- `constants/difficulties.ts` L37 — canonical, with full `KnowledgeLevelConfig` objects
- `app/components/CustomGameConfigurator.tsx` L13 — separate inline copy with `{ value, label, description }` shape

### 3.5 Utility Function Duplication

| Function | Duplicate Locations |
|----------|-------------------|
| `formatDuration(seconds)` | `app/components/stats/StatsOverview.tsx` L30, `app/components/stats/GameHistoryList.tsx` L67 |
| `shuffleArray<T>()` | `hooks/useQuizSession.ts` L78 (only location in audited files, but pattern exists) |
| `generateSessionId` pattern | `hooks/useQuizSession.ts` L91, `lib/gameApi.ts` L98, `lib/quickQuizApi.ts` L114, `lib/storage.ts` L327 — all use `Math.random().toString(36).substr(2, 9)` |

**Recommendation:** Extract `formatDuration` to a shared utility (e.g., `lib/formatters.ts`). Extract `generateId()` to `lib/utils.ts`.

### 3.6 Room Code Constant Duplication

| Constant | Location 1 | Location 2 |
|----------|-----------|-----------|
| Code character set | `lib/roomCode.ts` L12 (hardcoded `'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'`) | `constants/game.ts` L171 (`ROOM_CODE_CHARACTERS`) |
| Code length | `lib/roomCode.ts` L1 (default param `codeLength = 6`) | `constants/game.ts` L176 (`ROOM_CODE_LENGTH = 6`) |

### 3.7 Test Code in Production Modules

| File | Exported Function | Line |
|------|------------------|------|
| `lib/gameApi.ts` | `testQuestionFetching()` | L152 |
| `lib/roomApi.ts` | `testRoomCreation()` | L50 |

These should be in test files or behind `NODE_ENV` guards.

### 3.8 Scoring Logic Fragmentation

Score calculation is implemented in **four separate places** with **different formulas**:

| File | Formula | Max Bonus / Question |
|------|---------|---------------------|
| `lib/gameApi.ts` L130–131 | `(30 - timeSpent) × (50/30)` | **50 pts** |
| `lib/quickQuizApi.ts` L183–184 | `min(20, (30 - timeSpent) × (20/30))` | **20 pts** |
| `hooks/useQuizSession.ts` L260–264 | `(timeLimit×1000 - avgTime) / 100` | **Variable** |
| `constants/difficulties.ts` L163+ | `calculateDifficultyScore()` | Separate concept (difficulty weighting) |

This will produce inconsistent scores for identical gameplay across modes.

### 3.9 HelpModal Doesn't Use Shared Modal

`app/components/Help/HelpModal.tsx` implements its own modal with:
- Own escape-key handling
- Own scroll lock
- Own backdrop
- `border-2` styling (vs `border-4` in `app/components/ui/Modal.tsx`)

It should use `<Modal>` from `ui/Modal.tsx` for consistency.

---

## 4. Scalability

### 4.1 In-Memory Rate Limiting

`lib/rateLimit.ts` uses a `Map<string, …>` with `setInterval` for cleanup. This:
- **Does not persist** across serverless invocations (Vercel Functions, Lambda, etc.)
- **Does not share state** between multiple server instances
- Will effectively be a no-op in production serverless environments

**Recommendation:** Replace with Redis-backed or edge-based rate limiting (e.g., Upstash, Vercel Edge Config).

### 4.2 `DEFAULT_PROFILE` Static Date

`lib/storage.ts` L129–130:
```ts
export const DEFAULT_PROFILE: PlayerProfile = {
  createdAt: new Date().toISOString(),
  lastPlayedAt: new Date().toISOString(),
}
```
`new Date()` is evaluated **once at module parse time**. Every user who gets this default will have the same timestamp (the time the server cold-started or the module was first loaded). Should be a factory function.

### 4.3 CSP Contains `unsafe-eval` and `unsafe-inline`

`lib/security.core.ts` includes both directives. While these may be needed for development, they should be conditional or removed in production.

### 4.4 Duplicated Security Headers

Security headers are defined in **three places**:
1. `middleware.ts` L12–17 (`SECURITY_HEADERS` object)
2. `next.config.js` L14–50 (`headers()` function)
3. `lib/security.core.ts` (CSP generation)

The first two are additive (both will run), but this means headers like `X-Frame-Options` are set twice. Consolidate.

### 4.5 CORS Allowed Origins Duplication

Allowed origins are hardcoded in:
- `middleware.ts` L29 (`['http://localhost:3000', 'http://localhost:3001']`)
- `lib/security.core.ts` (same values)

Both should read from a single source or environment variable.

### 4.6 ESLint Ignored During Builds

`next.config.js` L5–8:
```js
eslint: {
  ignoreDuringBuilds: true,
}
```
This masks lint errors. Should be false in CI/production.

### 4.7 Low Coverage Thresholds

`jest.config.js` L35–40:
```js
coverageThreshold: {
  global: {
    branches: 12,
    functions: 15,
    lines: 15,
    statements: 15,
  },
}
```
These are extremely low. Recommend raising incrementally (target: 60%+ for lines/statements).

---

## 5. UI/UX & Color Consistency

### 5.1 `border-3` Is Not a Standard Tailwind Class

Tailwind CSS provides `border`, `border-2`, `border-4`, `border-8` by default. `border-3` requires custom configuration in `tailwind.config.js`, which is **not present** in the current config.

**Files using `border-3`** (14 occurrences):

| File | Line(s) |
|------|---------|
| `app/game/select/page.tsx` | L158 |
| `app/game/mode/page.tsx` | L107 |
| `app/components/AdvancedGameConfigurator.tsx` | L123, L235, L255 |
| `app/components/CustomGameConfigurator.tsx` | L124, L170, L218 |
| `app/components/Help/HelpButton.tsx` | L36 |
| `app/components/SettingsPanel.tsx` | L39, L93 |
| `app/components/MainMenuLogo.tsx` | L36 |
| `app/components/BackButton.tsx` | L35 |

**Impact:** These borders render as the default 1px since `border-3` doesn't exist. Either add `borderWidth: { 3: '3px' }` to `tailwind.config.js` or standardise on `border-2` or `border-4`.

### 5.2 `bg-brown-500` Is Not a Standard Tailwind Color

`constants/avatars.ts` L42:
```ts
{ id: 'dog', name: 'Dog', emoji: '🐕', color: 'bg-brown-500' },
```
Tailwind does not include `brown` in its default palette. This class will have no effect. Options: use `bg-amber-700` or add a custom color.

### 5.3 Dynamic Tailwind Classes Won't Be Tree-Shaken

Several components construct class names dynamically. Tailwind's JIT compiler cannot detect these at build time:

| File | Pattern | Line |
|------|---------|------|
| `app/components/ui/AnimatedBackground.tsx` | `` `bg-${color}` `` | (sparkle rendering) |
| `app/components/ui/LoadingSpinner.tsx` | `` `text-${color}` `` | (spinner color) |
| `app/game/mode/page.tsx` | `` `${avatarDetails.color}` `` | L107 |
| `app/game/select/page.tsx` | `` `${avatarDetails.color}` `` | L158 |

**Fix:** Add a `safelist` array to `tailwind.config.js` with all possible dynamic class values, or use a class mapping object.

### 5.4 Border Width Inconsistency Across Components

| Component Family | Dominant Border Width |
|-----------------|----------------------|
| `ui/Modal.tsx`, game pages, create/join pages | `border-4` |
| `Help/HelpModal.tsx` | `border-2` |
| `play/[code]/page.tsx` sidebar | `border-2` |
| Standalone components (Back, Logo, Settings, Custom) | `border-3` (non-functional) |

The pixel-art aesthetic calls for thick, consistent borders. Recommend standardising on `border-4` everywhere.

### 5.5 `rounded-lg` vs Pixel-Art Sharp Corners

The pixel-art aesthetic established in `globals.css` uses square/sharp corners (`pixel-border`). Several components mix in `rounded-lg`:

| File | Line(s) |
|------|---------|
| `app/components/CustomGameConfigurator.tsx` | L104, L182, L238, L278 |
| `app/components/AdvancedGameConfigurator.tsx` | L123, L235, L255 |
| `app/game/mode/page.tsx` | L107 (avatar container) |
| `app/game/select/page.tsx` | L158 (avatar container) |
| `app/game/play/[code]/page.tsx` | L229 (sidebar `rounded-lg`) |

Most other components use sharp edges via `pixel-border`. Consider replacing `rounded-lg` with square corners for consistency.

### 5.6 Font Class Usage

Two font families are configured:
- `font-pixel` → Press Start 2P (headings, labels, UI text)
- `font-pixel-body` → VT323 (body text, descriptions)

**Inconsistent usage examples:**

| File | Line | Issue |
|------|------|-------|
| `app/game/mode/page.tsx` | L97,L150 | H1 uses `font-bold` without `font-pixel`; card descriptions use inline `text-sm` without `font-pixel-body` |
| `app/game/quick/page.tsx` | L71,L79 | H1 uses `font-bold` (not `font-pixel`); instructions use generic styles |
| `app/game/play/[code]/page.tsx` | L229 | Sidebar heading uses `text-xs font-bold` without `font-pixel` |

Game pages created later in development (`stats/page.tsx`, `join/page.tsx`, `create/page.tsx`) use `font-pixel` and `font-pixel-body` correctly. Earlier pages (`mode/page.tsx`, `quick/page.tsx`) do not.

### 5.7 `pixel-border` Usage

The `pixel-border` class (defined in `globals.css`) is the core pixel-art styling. Some pages/components inconsistently omit it:

| File | Element | Has `pixel-border`? |
|------|---------|-------------------|
| `app/not-found.tsx` | Action buttons | ❌ No |
| `app/error.tsx` | Main container | ✅ Yes |
| `app/game/play/[code]/page.tsx` | Sidebar container | ❌ No (uses `rounded-lg` instead) |

### 5.8 Footer Copyright Year

Several pages include `© 2026 PixelTrivia`:
- `app/game/stats/page.tsx` L159
- `app/game/mode/page.tsx` (footer)
- `app/game/select/page.tsx` (footer)
- `app/game/advanced/page.tsx` (footer)

Recommend using a dynamic year or moving to a shared `<Footer>` component.

---

## 6. Cross-File Duplication Summary

| #  | What's Duplicated | Primary Location | Duplicate Location(s) | Severity |
|----|------------------|-----------------|----------------------|----------|
| D1 | `ApiSuccessResponse` / `ApiErrorResponse` types | `types/api.ts` L18,L32 | `lib/apiResponse.ts` L23,L39 | 🔴 High |
| D2 | `STORAGE_KEYS` object | `constants/game.ts` L187 | `lib/storage.ts` L163 | 🔴 High |
| D3 | `GAME_CATEGORIES` data | `constants/categories.ts` L51 | `QuickGameSelector.tsx` L9 | 🔴 High |
| D4 | `KNOWLEDGE_LEVELS` array | `constants/difficulties.ts` L37 | `CustomGameConfigurator.tsx` L13 | 🟡 Medium |
| D5 | `formatDuration()` function | `StatsOverview.tsx` L30 | `GameHistoryList.tsx` L67 | 🟡 Medium |
| D6 | Score calculation logic | `gameApi.ts` L126–137 | `quickQuizApi.ts` L176–185, `useQuizSession.ts` L260–264 | 🔴 High |
| D7 | Room code characters & length | `constants/game.ts` L171,L176 | `lib/roomCode.ts` L12,param | 🟡 Medium |
| D8 | `generateId()` pattern | `lib/storage.ts` L327 | `gameApi.ts` L98, `quickQuizApi.ts` L114, `useQuizSession.ts` L91, `AdvancedGameConfigurator.tsx` L63 | 🟡 Medium |
| D9 | Allowed origins list | `middleware.ts` L29 | `lib/security.core.ts` | 🟡 Medium |
| D10 | Security headers | `middleware.ts` L12–17 | `next.config.js` L14–50 | 🟡 Medium |

---

## 7. Actionable Recommendations

### Priority 1 — Critical (Fix Immediately)

| # | Action | Files Affected |
|---|--------|---------------|
| 1 | **Unify `STORAGE_KEYS`** into a single source (`constants/game.ts`), import everywhere. Remove the copy in `lib/storage.ts` and the hardcoded string in `app/game/join/page.tsx` L46 | `lib/storage.ts`, `constants/game.ts`, `app/game/join/page.tsx` |
| 2 | **Remove duplicate `ApiResponse` types** from `lib/apiResponse.ts`, import from `types/api.ts` | `lib/apiResponse.ts`, `types/api.ts` |
| 3 | **Unify `GAME_CATEGORIES`** — delete the inline copy in `QuickGameSelector.tsx`, import from `constants/categories.ts`. Fix `'college-level'` → `'college'` mismatch | `QuickGameSelector.tsx`, `constants/categories.ts` |
| 4 | **Standardise scoring** — extract a single `calculateScore()` function to `lib/scoring.ts`, use in `gameApi.ts`, `quickQuizApi.ts`, and `useQuizSession.ts` | 3 files |
| 5 | **Add `borderWidth: { 3: '3px' }` to `tailwind.config.js`** (or replace all `border-3` with `border-2`/`border-4`) | `tailwind.config.js` + 14 component references |
| 6 | **Add `brown` to Tailwind colour palette** or replace `bg-brown-500` with `bg-amber-700` | `constants/avatars.ts` L42, `tailwind.config.js` |
| 7 | **Replace `console.error` with `logger`** in all production files | 10 files listed in §1.3 |

### Priority 2 — Important (Fix This Sprint)

| # | Action | Files Affected |
|---|--------|---------------|
| 8 | **Add module-level JSDoc headers** to all 27 files listed in §1.1 | 27 files |
| 9 | **Remove test functions from production** (`testQuestionFetching`, `testRoomCreation`) — move to `__tests__/` | `lib/gameApi.ts`, `lib/roomApi.ts` |
| 10 | **Make `DEFAULT_PROFILE` a factory function** to avoid stale dates | `lib/storage.ts` L127–131 |
| 11 | **Replace deprecated `substr()`** with `substring()` or `slice()` | 7 files listed in §2.4 |
| 12 | **Add `'use client'` to `AdvancedGameConfigurator.tsx`** | 1 file |
| 13 | **Extract `formatDuration()` to `lib/formatters.ts`** | `StatsOverview.tsx`, `GameHistoryList.tsx` |
| 14 | **Extract `generateId()` to `lib/utils.ts`** | 5 files listed in D8 |
| 15 | **Add Tailwind `safelist`** for dynamic avatar colour classes | `tailwind.config.js` |
| 16 | **Refactor `HelpModal` to use `ui/Modal`** | `app/components/Help/HelpModal.tsx` |

### Priority 3 — Improvement (Backlog)

| # | Action | Notes |
|---|--------|-------|
| 17 | Consolidate security headers into one location | Choose middleware OR next.config.js, not both |
| 18 | Consolidate CORS allowed origins | Single env-var read in one spot |
| 19 | Replace in-memory rate limiter | Use Redis/Upstash for serverless |
| 20 | Remove CSP `unsafe-eval`/`unsafe-inline` in production | `lib/security.core.ts` |
| 21 | Standardise border widths (`border-4` everywhere) | Style guide update |
| 22 | Remove `rounded-lg` from pixel-art components | Consistency with `pixel-border` |
| 23 | Standardise font class usage across all game pages | Use `font-pixel` for headings, `font-pixel-body` for body |
| 24 | Create shared `<Footer>` component | Remove duplicate copyright lines |
| 25 | Enable ESLint during builds (`ignoreDuringBuilds: false`) | `next.config.js` |
| 26 | Raise coverage thresholds incrementally | `jest.config.js` |
| 27 | Standardise barrel export style (`export *` vs named re-exports) | `constants/`, `hooks/`, `types/` index files |
| 28 | Import `KNOWLEDGE_LEVELS` in `CustomGameConfigurator.tsx` from constants | Remove local redeclaration |
| 29 | Import room code constants in `lib/roomCode.ts` from `constants/game.ts` | Remove hardcoded character set |
| 30 | Address `_setIsCreatingRoom` unused variable in `app/page.tsx` | Remove or use |

---

## File-by-File Quick Reference

<details>
<summary><strong>Click to expand full per-file table (71 files)</strong></summary>

| # | File | JSDoc | `'use client'` | Import Order | Code Smells | Pixel-Art Style | Hardcoded Values |
|---|------|-------|----------------|-------------|-------------|----------------|-----------------|
| 1 | `lib/storage.ts` | ✅ @module,@since | N/A | ✅ | `DEFAULT_PROFILE` stale Date; duplicate `STORAGE_KEYS` | N/A | STORAGE_PREFIX L18 |
| 2 | `lib/errors.ts` | ⚠️ No @module | N/A | ✅ | `Error.captureStackTrace` (Node-only) | N/A | — |
| 3 | `lib/validation.ts` | ⚠️ Minimal | N/A | ✅ | Duplicates KnowledgeLevel enum | N/A | maxLength 10000, context 2000 |
| 4 | `lib/security.ts` | ✅ | N/A | ✅ | Double import pattern | N/A | — |
| 5 | `lib/security.core.ts` | ✅ | N/A | ✅ | `unsafe-eval`, `unsafe-inline` in CSP | N/A | localhost origins |
| 6 | `lib/apiResponse.ts` | ✅ | N/A | ✅ | Duplicate types from `types/api.ts`; `console.error` | N/A | — |
| 7 | `lib/logger.ts` | ✅ @module,@since | N/A | ✅ | Clean | N/A | — |
| 8 | `lib/rateLimit.ts` | ✅ | N/A | ✅ | In-memory Map (no scale); `console.error` | N/A | — |
| 9 | `lib/roomCode.ts` | ⚠️ No @module | N/A | ✅ | Duplicate chars/length from constants | N/A | char set, codeLength=6 |
| 10 | `lib/supabase.ts` | ❌ None | N/A | ✅ | Deprecated `supabase` export; mixed concerns | N/A | — |
| 11 | `lib/customQuizApi.ts` | ❌ `//` only | N/A | ✅ | `console.error`; duplicate validLevels | N/A | validLevels array |
| 12 | `lib/quickQuizApi.ts` | ✅ | N/A | ✅ | `console.error`; `substr`; own QuizSession type; scoring differs | N/A | max 20 bonus |
| 13 | `lib/gameApi.ts` | ✅ | N/A | ✅ | `testQuestionFetching`; `substr`; `console.error`; scoring differs | N/A | max 50 bonus |
| 14 | `lib/roomApi.ts` | ✅ | N/A | ✅ | `testRoomCreation` in prod | N/A | — |
| 15 | `hooks/index.ts` | ✅ @module,@since | N/A | ✅ | Clean | N/A | — |
| 16 | `hooks/useGameState.ts` | ✅ @module,@since | N/A | ✅ | Clean | N/A | — |
| 17 | `hooks/useLocalStorage.ts` | ✅ @module,@since | N/A | ✅ | Clean | N/A | prefix `pixeltrivia_v` |
| 18 | `hooks/usePlayerSettings.ts` | ✅ @module,@since | ✅ | ✅ | Clean | N/A | — |
| 19 | `hooks/useQuizSession.ts` | ✅ @module,@since | N/A | ✅ | `substr`; duplicate `shuffleArray`/`generateId` | N/A | Scoring formula |
| 20 | `hooks/useTimer.ts` | ✅ @module,@since | N/A | ✅ | Clean | N/A | — |
| 21 | `hooks/useGameHistory.ts` | ✅ @module,@since | N/A | ✅ | Clean | N/A | — |
| 22 | `constants/index.ts` | ✅ @module,@since | N/A | ✅ | `export *` (namespace pollution risk) | N/A | — |
| 23 | `constants/categories.ts` | ✅ @module,@since | N/A | ✅ | Duplicated in QuickGameSelector | N/A | — |
| 24 | `constants/difficulties.ts` | ✅ @module,@since | N/A | ✅ | Clean | N/A | — |
| 25 | `constants/avatars.ts` | ✅ @module,@since | N/A | ✅ | `bg-brown-500` invalid | N/A | — |
| 26 | `constants/game.ts` | ✅ @module,@since | N/A | ✅ | Duplicate `STORAGE_KEYS`; duplicate room code constants | N/A | — |
| 27 | `types/index.ts` | ✅ @module,@since | N/A | ✅ | Clean | N/A | — |
| 28 | `types/api.ts` | ✅ @module,@since | N/A | ✅ | Types duplicated in `lib/apiResponse.ts` | N/A | — |
| 29 | `types/game.ts` | ✅ @module,@since | N/A | ✅ | `DifficultyLevel` ≅ `KnowledgeLevel` (redundant?) | N/A | — |
| 30 | `types/quiz.ts` | ✅ @module,@since | N/A | ✅ | Clean | N/A | — |
| 31 | `types/room.ts` | ✅ @module,@since | N/A | ✅ | Clean | N/A | Hardcoded defaults |
| 32 | `app/page.tsx` | ❌ None | ✅ | ✅ | Unused `_setIsCreatingRoom`; inline player name gen; TODO | ⚠️ Mixed | Random range, font-size |
| 33 | `app/layout.tsx` | ⚠️ Non-standard | N/A (server) | ✅ | Clean (good a11y: skip nav) | ✅ | — |
| 34 | `app/error.tsx` | ⚠️ Inline only | ✅ | ✅ | `console.error` | ✅ pixel-border | — |
| 35 | `app/global-error.tsx` | ⚠️ Inline only | ✅ | ✅ | Clean | ✅ | — |
| 36 | `app/not-found.tsx` | ⚠️ Inline only | N/A | ✅ | Missing pixel-border on buttons | ⚠️ Inconsistent | — |
| 37 | `app/globals.css` | ❌ None | N/A | N/A | Clean | ✅ Core definitions | — |
| 38 | `ui/index.ts` | ✅ @module,@since | N/A | ✅ | Clean | N/A | — |
| 39 | `ui/AnimatedBackground.tsx` | ✅ | ✅ | ✅ | Dynamic `bg-${color}` (safelist needed) | ✅ | — |
| 40 | `ui/GamePageLayout.tsx` | ✅ | ✅ | ✅ | Clean | ✅ | — |
| 41 | `ui/LoadingSpinner.tsx` | ✅ | ✅ | ✅ | Unused `_PixelSpinnerSVG`; dynamic `text-${color}` | ✅ | — |
| 42 | `ui/Modal.tsx` | ✅ | ✅ | ✅ | Clean (focus trap, portal) | ✅ border-4 | — |
| 43 | `ui/PageHeader.tsx` | ✅ | N/A | ✅ | Clean | ✅ | — |
| 44 | `stats/index.ts` | ✅ @module,@since | N/A | ✅ | Clean | N/A | — |
| 45 | `stats/StatsOverview.tsx` | ✅ | ✅ | ✅ | Duplicate `formatDuration` | ✅ | Magic numbers (86400000) |
| 46 | `stats/GameHistoryList.tsx` | ✅ | ✅ | ✅ | Duplicate `formatDuration` | ✅ | Magic numbers |
| 47 | `stats/StatsChart.tsx` | ✅ | ✅ | ✅ | Clean | ✅ | — |
| 48 | `Help/HelpButton.tsx` | ❌ None | ✅ | ✅ | border-3 | ⚠️ border-3 | — |
| 49 | `Help/HelpContext.tsx` | ❌ None | ✅ | ✅ | Clean | N/A | — |
| 50 | `Help/HelpModal.tsx` | ❌ None | ✅ | ✅ | Doesn't use shared Modal; border-2 | ⚠️ border-2 | — |
| 51 | `Help/index.ts` | ❌ None | N/A | ✅ | Default exports (inconsistent) | N/A | — |
| 52 | `AdvancedGameConfigurator.tsx` | ❌ None | ❌ Missing | ✅ | `substr`; border-3; rounded-lg; hardcoded file types | ⚠️ Mixed | File limits 5MB, types |
| 53 | `BackButton.tsx` | ❌ None | ✅ | ✅ | border-3 | ⚠️ border-3 | — |
| 54 | `CustomGameConfigurator.tsx` | ❌ None | ✅ | ✅ | Duplicate `KNOWLEDGE_LEVELS`; border-3; rounded-lg | ⚠️ Mixed | — |
| 55 | `ErrorBoundary.tsx` | ⚠️ Inline | ✅ | ✅ | `console.error` | ✅ | — |
| 56 | `MainMenuLogo.tsx` | ❌ None | ✅ | ✅ | border-3 | ⚠️ border-3 | — |
| 57 | `QuickGameSelector.tsx` | ❌ None | N/A | ✅ | Complete GAME_CATEGORIES duplication; `college-level` mismatch | ✅ Border-4 | — |
| 58 | `SettingsPanel.tsx` | ❌ None | ❌ (not needed) | ✅ | border-3 | ⚠️ border-3 | — |
| 59 | `game/stats/page.tsx` | ✅ @module,@since | ✅ | ✅ | Clean | ✅ | — |
| 60 | `game/mode/page.tsx` | ❌ None | ✅ | ⚠️ Imports after types | border-3; `font-bold` not `font-pixel` | ⚠️ Mixed | — |
| 61 | `game/quick/page.tsx` | ❌ None | ✅ | ✅ | `console.error`; TODO; no nav to play | ⚠️ `font-bold` | — |
| 62 | `game/custom/page.tsx` | ❌ None | ✅ | ✅ | `console.error`; TODO | ✅ | — |
| 63 | `game/advanced/page.tsx` | ❌ None | ✅ | ✅ | `console.error` | ✅ | — |
| 64 | `game/select/page.tsx` | ❌ None | ✅ | ⚠️ Imports after types | border-3; Large duplicated card UI | ⚠️ Mixed | — |
| 65 | `game/join/page.tsx` | ✅ @module,@since | ✅ | ✅ | Hardcoded storage key string L46 | ✅ | — |
| 66 | `game/create/page.tsx` | ✅ @module,@since | ✅ | ✅ | Clean | ✅ | — |
| 67 | `game/play/[code]/page.tsx` | ✅ @module,@since | ✅ | ✅ | Sidebar border-2/rounded-lg inconsistent | ⚠️ Sidebar | — |
| 68 | `middleware.ts` | ⚠️ No @module | N/A | ✅ | Duplicate headers with next.config.js | N/A | localhost origins |
| 69 | `tailwind.config.js` | ⚠️ @type only | N/A | N/A | Missing safelist; missing border-3; missing brown | N/A | — |
| 70 | `next.config.js` | ⚠️ @type only | N/A | N/A | ESLint ignored; duplicate headers | N/A | — |
| 71 | `jest.config.js` | ⚠️ @type only | N/A | N/A | Very low thresholds | N/A | 12/15/15/15 |

</details>

---

*End of audit.*
