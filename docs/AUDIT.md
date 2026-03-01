# PixelTrivia Professional Codebase Audit

> **Date:** February 28, 2026 (initial audit); updated March 1, 2026 (Phase 24)
> **Scope:** 71 files across `lib/`, `hooks/`, `constants/`, `types/`, `app/`, and config files
> **Methodology:** Full manual read, cross-file pattern analysis, categorized finding report
> **Status:** Most critical findings resolved in Phases 15–24. Remaining items noted inline.

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

#### Files with proper `@module` + `@since` JSDoc header

| Layer | Files |
|-------|-------|
| **lib/** | `storage.ts`, `apiResponse.ts`, `logger.ts`, `rateLimit.ts`, `security.ts`, `security.core.ts`, `quickQuizApi.ts`, `gameApi.ts`, `roomApi.ts` |
| **hooks/** | `index.ts`, `useGameState.ts`, `useLocalStorage.ts`, `usePlayerSettings.ts`, `useQuizSession.ts`, `useTimer.ts`, `useGameHistory.ts` |
| **constants/** | `index.ts`, `categories.ts`, `difficulties.ts`, `avatars.ts`, `game.ts` |
| **types/** | `index.ts`, `api.ts`, `game.ts`, `quiz.ts`, `room.ts` |
| **app/components/ui/** | `index.ts`, `AnimatedBackground.tsx`, `GamePageLayout.tsx`, `LoadingSpinner.tsx`, `Modal.tsx`, `PageHeader.tsx` |
| **app/components/stats/** | `index.ts`, `StatsOverview.tsx`, `GameHistoryList.tsx`, `StatsChart.tsx` |
| **app/game/** | `stats/page.tsx`, `join/page.tsx`, `create/page.tsx`, `play/[code]/page.tsx` |

#### Files missing module-level JSDoc header

| File | What it has instead |
|------|-------------------|
| `lib/errors.ts` | JSDoc present but missing `@module` and `@since` |
| `lib/validation.ts` | Minimal JSDoc, no `@module`/`@since` |
| `lib/roomCode.ts` | Uses `@param`/`@returns` on functions only, no file-level doc |
| `lib/supabase.ts` | No header at all |
| `lib/customQuizApi.ts` | Single-line `// Client utility...` comment |
| `app/page.tsx` | No header |
| `app/layout.tsx` | Block comment but not JSDoc format (no `@module`/`@since`) |
| `app/error.tsx` | Inline function JSDoc only |
| `app/global-error.tsx` | Inline function JSDoc only |
| `app/not-found.tsx` | Inline function JSDoc only |
| `app/globals.css` | No header comment |
| `app/components/help/HelpButton.tsx` | ✅ Added (Phase 15) |
| `app/components/help/HelpContext.tsx` | ✅ Added (Phase 15) |
| `app/components/help/HelpModal.tsx` | ✅ Added (Phase 15) |
| `app/components/help/index.ts` | ✅ Added (Phase 15) |
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

**Summary:** 27 of 71 files lack the standard header. Most non-compliant files are in `app/components/` and game pages.

### 1.2 Inline Comment Style Inconsistencies

| Pattern | Where used | Recommendation |
|---------|-----------|----------------|
| `// =========` section separators | `lib/storage.ts`, `constants/game.ts`, `constants/difficulties.ts` | Adopt consistently or drop |
| `// Game mode types` style labels | `app/game/mode/page.tsx` L14, `app/game/select/page.tsx` L11 | Use JSDoc or separator blocks like lib files |
| `// TODO:` comments in production | `app/game/quick/page.tsx` L47, `app/game/custom/page.tsx` L40-41 | Track in TODO.md or issue tracker, not code |

### 1.3 Logging Style Inconsistency

The project has a dedicated `logger` module (`lib/logger.ts`) and its documentation explicitly requires: _"Use `logger` from `lib/logger` (not console.error)"_.

**Files violating this rule** (using raw `console.error` in production code):

> **Resolution (Phase 24):** All files listed below have been migrated to `logger` from `lib/logger.ts`.

| File | Line(s) | Status |
|------|---------|--------|
| `lib/apiResponse.ts` | L297 | ✅ Resolved |
| `lib/gameApi.ts` | L61 | ✅ Resolved |
| `lib/quickQuizApi.ts` | L46 | ✅ Resolved |
| `lib/customQuizApi.ts` | L46 | ✅ Resolved |
| `lib/rateLimit.ts` | L299 | ✅ Resolved |
| `app/error.tsx` | L19 | ✅ Resolved (Phase 24) |
| `app/components/ErrorBoundary.tsx` | L41-42 | ✅ Resolved (Phase 24) |
| `app/game/quick/page.tsx` | L52 | ✅ Resolved |
| `app/game/custom/page.tsx` | L53 | ✅ Resolved (Phase 24) |
| `app/game/advanced/page.tsx` | L36 | ✅ Resolved (Phase 24) |

---

## 2. Formatting Consistency

### 2.1 Import Ordering

The dominant convention observed is:

1. React / Next.js framework imports
2. Internal component imports (`@/app/components/...`)
3. Hooks (`@/hooks/...`)
4. Libraries (`@/lib/...`)
5. Constants (`@/constants/...`)
6. Types (`@/types/...`)

**Violations:**

| File | Issue |
|------|-------|
| `app/game/mode/page.tsx` L20-21 | Constants imported after component usage, separated by a blank line and type declaration block |
| `app/game/select/page.tsx` L21-22 | Same pattern: constants imported after inline type declarations |
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

The barrel export style differs between directories. This is a minor inconsistency but can lead to namespace pollution from `export *`.

### 2.3 `'use client'` Directive

> **Resolution (Phase 15):** `'use client'` added to `AdvancedGameConfigurator.tsx`.

**Files using React hooks (`useState`, `useEffect`, etc.) without `'use client'`:** (all resolved)

| File | Uses |
|------|------|
| `app/components/AdvancedGameConfigurator.tsx` | `useState` (L2) |

### 2.4 Deprecated API Usage

> **Resolution (Phase 8):** All `substr()` calls replaced with `substring()` across the codebase.

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

> **Resolution (Phase 16):** `lib/apiResponse.ts` now imports types from `types/api.ts`. No longer duplicated.

`ApiSuccessResponse`, `ApiErrorResponse`, and `ApiResponse` were defined in two places:
- `types/api.ts` (L18, L32, L51) -- canonical type definitions
- `lib/apiResponse.ts` (L23, L39, L51) -- re-defined with identical structure

If one is updated without the other, consumers will get type mismatches. `lib/apiResponse.ts` should import from `types/api.ts`.

### 3.2 Storage Key Duplication

> **Resolution (Phase 16):** `STORAGE_KEYS` consolidated into `constants/game.ts`. `lib/storage.ts` now imports from there.

Two separate `STORAGE_KEYS` objects existed with different key formats:

| Location | Prefix Format | Keys |
|----------|---------------|------|
| `lib/storage.ts` L163 | `pixeltrivia_profile`, `pixeltrivia_settings`, etc. | `ROOT`, `PROFILE`, `SETTINGS`, `HISTORY`, `SESSION` |
| `constants/game.ts` L187 | `pixeltrivia_player_name`, `pixeltrivia_player_avatar`, etc. | `PLAYER_NAME`, `PLAYER_AVATAR`, `PLAYER_VOLUME`, `ADVANCED_CONFIG`, `GENERATED_QUESTIONS`, `GAME_METADATA` |

The two sets are complementary (non-overlapping keys) but having them in separate files with different naming conventions is confusing.

### 3.3 Category Data Duplication

> **Resolution (Phase 16):** `QuickGameSelector.tsx` now imports from `constants/categories.ts`.

`GAME_CATEGORIES` was defined in:
- `constants/categories.ts` L51 -- the canonical source
- `app/components/QuickGameSelector.tsx` L9 -- a separate inline copy

Key differences: QuickGameSelector uses `'college-level'` while constants uses `'college'`.

### 3.4 Knowledge Level Duplication

> **Resolution (Phase 16):** `CustomGameConfigurator.tsx` now imports from `constants/difficulties.ts`.

`KNOWLEDGE_LEVELS` was defined in:
- `constants/difficulties.ts` L37 -- canonical, with full `KnowledgeLevelConfig` objects
- `app/components/CustomGameConfigurator.tsx` L13 -- separate inline copy

### 3.5 Utility Function Duplication

> **Resolution (Phase 16):** `formatDuration()` extracted to `lib/utils.ts`. `generateId()` extracted to `lib/utils.ts`. Both used across all files.

| Function | Duplicate Locations (before fix) |
|----------|-------------------|
| `formatDuration(seconds)` | `StatsOverview.tsx` L30, `GameHistoryList.tsx` L67 |
| `generateSessionId` pattern | `useQuizSession.ts` L91, `gameApi.ts` L98, `quickQuizApi.ts` L114, `storage.ts` L327 |

### 3.6 Room Code Constant Duplication

> **Resolution (Phase 16):** `lib/roomCode.ts` now imports from `constants/game.ts`.

| Constant | Location 1 | Location 2 |
|----------|-----------|-----------|
| Code character set | `lib/roomCode.ts` L12 (hardcoded) | `constants/game.ts` L171 (`ROOM_CODE_CHARACTERS`) |
| Code length | `lib/roomCode.ts` L1 (default param) | `constants/game.ts` L176 (`ROOM_CODE_LENGTH = 6`) |

### 3.7 Scoring Logic Fragmentation

> **Resolution (Phase 8):** Score calculation centralized in `lib/scoring.ts`.

Score calculation was implemented in four separate places with different formulas:

| File | Formula | Max Bonus / Question |
|------|---------|---------------------|
| `lib/gameApi.ts` L130-131 | `(30 - timeSpent) * (50/30)` | 50 pts |
| `lib/quickQuizApi.ts` L183-184 | `min(20, (30 - timeSpent) * (20/30))` | 20 pts |
| `hooks/useQuizSession.ts` L260-264 | `(timeLimit*1000 - avgTime) / 100` | Variable |
| `constants/difficulties.ts` L163+ | `calculateDifficultyScore()` | Separate concept |

This will produce inconsistent scores for identical gameplay across modes.

### 3.8 HelpModal Does Not Use Shared Modal

> **Resolution (Phase 15):** `HelpModal` refactored to use `<Modal>` from `ui/Modal.tsx`.

`app/components/help/HelpModal.tsx` previously implemented its own modal.

---

## 4. Scalability

### 4.1 In-Memory Rate Limiting

`lib/rateLimit.ts` uses a `Map<string, ...>` with `setInterval` for cleanup. This does not persist across serverless invocations and does not share state between multiple server instances.

### 4.2 Default Profile Static Date

> **Resolution (Phase 15):** `DEFAULT_PROFILE` converted to factory function `createDefaultProfile()`.

`lib/storage.ts` previously had `new Date()` evaluated once at module parse time.

### 4.3 CSP Contains `unsafe-eval` and `unsafe-inline`

`lib/security.core.ts` includes both directives. These should be conditional or removed in production.

### 4.4 Duplicated Security Headers

Security headers are defined in three places:
1. `middleware.ts` L12-17 (`SECURITY_HEADERS` object)
2. `next.config.js` L14-50 (`headers()` function)
3. `lib/security.core.ts` (CSP generation)

### 4.5 CORS Allowed Origins Duplication

Allowed origins are hardcoded in both `middleware.ts` and `lib/security.core.ts`.

### 4.6 ESLint Ignored During Builds

> **Resolution (Phase 11):** `next.config.js` now has `ignoreDuringBuilds: false`, ESLint runs during production builds.

`next.config.js` previously had `ignoreDuringBuilds: true`.

### 4.7 Low Coverage Thresholds

> **Resolution (Phase 20):** Thresholds raised to branches 55%, functions/lines/statements 55%+. Actual coverage exceeds 60% across all metrics.

Current thresholds in `jest.config.js` were previously set very low.

---

## 5. UI/UX & Color Consistency

### 5.1 `border-3` Is Not a Standard Tailwind Class

> **Resolution (Phase 15):** Custom `borderWidth: { 3: '3px' }` added to `tailwind.config.js`.

Tailwind CSS provides `border`, `border-2`, `border-4`, `border-8` by default. `border-3` requires custom configuration.

### 5.2 `bg-brown-500` Is Not a Standard Tailwind Color

> **Resolution (Phase 15):** Replaced with `bg-amber-700`.

`constants/avatars.ts` previously used `bg-brown-500` which had no effect.

### 5.3 Dynamic Tailwind Classes

Several components construct class names dynamically (e.g., `` `bg-${color}` ``). Tailwind's JIT compiler cannot detect these at build time. A `safelist` array is needed in `tailwind.config.js`.

### 5.4 Border Width Inconsistency

| Component Family | Dominant Border Width |
|-----------------|----------------------|
| `ui/Modal.tsx`, game pages, create/join pages | `border-4` |
| `Help/HelpModal.tsx` | `border-2` |
| `play/[code]/page.tsx` sidebar | `border-2` |
| Standalone components (Back, Logo, Settings, Custom) | `border-3` (non-functional) |

### 5.5 `rounded-lg` vs Sharp Corners

> **Resolution (Phase 15):** Removed `rounded-lg` / `rounded-md` from 22 pixel-art components (14 files). Kept on range sliders and circular elements.

The pixel-art aesthetic uses square corners via `pixel-border`. Several components previously mixed in `rounded-lg`.

### 5.6 Font Class Usage

Two font families are configured: `font-pixel` (Press Start 2P) for headings and `font-pixel-body` (VT323) for body text. Earlier game pages (`mode/page.tsx`, `quick/page.tsx`) do not use these classes consistently. Later pages use them correctly.

---

## 6. Cross-File Duplication Summary

| # | What's Duplicated | Primary Location | Duplicate Location(s) | Severity |
|---|------------------|-----------------|----------------------|----------|
| D1 | `ApiSuccessResponse` / `ApiErrorResponse` types | `types/api.ts` | `lib/apiResponse.ts` | High |
| D2 | `STORAGE_KEYS` object | `constants/game.ts` | `lib/storage.ts` | High |
| D3 | `GAME_CATEGORIES` data | `constants/categories.ts` | `QuickGameSelector.tsx` | High |
| D4 | `KNOWLEDGE_LEVELS` array | `constants/difficulties.ts` | `CustomGameConfigurator.tsx` | Medium |
| D5 | `formatDuration()` function | `StatsOverview.tsx` | `GameHistoryList.tsx` | Medium |
| D6 | Score calculation logic | `gameApi.ts` | `quickQuizApi.ts`, `useQuizSession.ts` | High |
| D7 | Room code characters and length | `constants/game.ts` | `lib/roomCode.ts` | Medium |
| D8 | `generateId()` pattern | `lib/storage.ts` | 4 other files | Medium |
| D9 | Allowed origins list | `middleware.ts` | `lib/security.core.ts` | Medium |
| D10 | Security headers | `middleware.ts` | `next.config.js` | Medium |

---

## 7. Actionable Recommendations

### Priority 1 — Critical (All Resolved)

| # | Action | Status |
|---|--------|--------|
| 1 | Unify `STORAGE_KEYS` into a single source | ✅ Resolved (Phase 16) |
| 2 | Remove duplicate `ApiResponse` types from `lib/apiResponse.ts` | ✅ Resolved (Phase 16) |
| 3 | Unify `GAME_CATEGORIES`, fix `'college-level'` mismatch | ✅ Resolved (Phase 16) |
| 4 | Standardize scoring by extracting `calculateScore()` to `lib/scoring.ts` | ✅ Resolved (Phase 8) |
| 5 | Add `borderWidth: { 3: '3px' }` to `tailwind.config.js` | ✅ Resolved (Phase 15) |
| 6 | Replace `bg-brown-500` with `bg-amber-700` | ✅ Resolved (Phase 15) |
| 7 | Replace remaining `console.error` with `logger` in production files | ✅ Resolved (Phase 24) |

### Priority 2 — Important (Mostly Resolved)

| # | Action | Status |
|---|--------|--------|
| 8 | Add module-level JSDoc headers to all files | Partial — 27 files remain |
| 9 | Remove test functions from production | ✅ Resolved |
| 10 | Make `DEFAULT_PROFILE` a factory function | ✅ Resolved (Phase 15) |
| 11 | Replace deprecated `substr()` with `substring()` | ✅ Resolved (Phase 8) |
| 12 | Add `'use client'` to `AdvancedGameConfigurator.tsx` | ✅ Resolved (Phase 15) |
| 13 | Extract `formatDuration()` to shared utility | ✅ Resolved (Phase 16) |
| 14 | Extract `generateId()` to `lib/utils.ts` | ✅ Resolved (Phase 16) |
| 15 | Add Tailwind `safelist` for dynamic avatar color classes | ✅ Resolved (Phase 15) |
| 16 | Refactor `HelpModal` to use `ui/Modal` | ✅ Resolved (Phase 15) |

### Priority 3 — Improvement (Partially Addressed)

| # | Action | Status |
|---|--------|--------|
| 17 | Consolidate security headers into one location | Open |
| 18 | Consolidate CORS allowed origins | Open |
| 19 | Replace in-memory rate limiter with Redis/Upstash | Open |
| 20 | Remove CSP `unsafe-eval`/`unsafe-inline` in production | Open |
| 21 | Standardize border widths (`border-4` everywhere) | ✅ Resolved (Phase 15) |
| 22 | Remove `rounded-lg` from pixel-art components | ✅ Resolved (Phase 15) |
| 23 | Standardize font class usage across all game pages | ✅ Resolved (Phase 9) |
| 24 | Create shared `<Footer>` component | ✅ Resolved (Phase 15) |
| 25 | Enable ESLint during builds | ✅ Resolved (Phase 11) |
| 26 | Raise coverage thresholds incrementally | ✅ Resolved (Phase 20) |
| 27 | Standardize barrel export style | ✅ Resolved (Phase 16) |
| 28 | Import `KNOWLEDGE_LEVELS` in `CustomGameConfigurator.tsx` | ✅ Resolved (Phase 16) |
| 29 | Import room code constants from `constants/game.ts` | ✅ Resolved (Phase 16) |

---

*End of audit. Last updated: March 1, 2026 (Phase 24)*
