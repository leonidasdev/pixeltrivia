# Testing Guide

Comprehensive guide to testing in PixelTrivia.

## Table of Contents

- [Overview](#overview)
- [Test Stack](#test-stack)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
  - [Unit Tests](#unit-tests)
  - [Component Tests](#component-tests)
  - [API Tests](#api-tests)
- [E2E Testing with Playwright](#e2e-testing-with-playwright)
- [Mocking](#mocking)
- [Coverage](#coverage)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

PixelTrivia uses a comprehensive testing setup with:

- **333 tests** total (305 Jest + 28 Playwright E2E)
- **Jest 30** as the unit/component test runner
- **Playwright** for E2E testing (Chromium + Firefox)
- **React Testing Library** for component tests
- **>20% coverage** threshold (and growing)

Tests run automatically:
- On every commit (via Husky pre-commit hooks)
- On every PR (via GitHub Actions CI)

---

## Test Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Jest | 30.2.0 | Unit/Component test runner |
| @testing-library/react | 16.4.1 | Component testing |
| @testing-library/jest-dom | 6.6.3 | DOM matchers |
| @testing-library/user-event | 14.x | User interaction simulation |
| jest-environment-jsdom | 30.2.0 | Browser environment |
| Playwright | 1.51.x | E2E testing |

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- roomCode.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="validation"

# Run tests in a specific directory
npm test -- __tests__/unit/lib
```

### Watch Mode

Watch mode is ideal during development:

```bash
npm run test:watch
```

**Watch mode commands:**
- `a` - Run all tests
- `f` - Run only failed tests
- `p` - Filter by filename pattern
- `t` - Filter by test name pattern
- `q` - Quit watch mode

### Coverage Report

```bash
npm run test:coverage
```

This generates:
- Console summary
- Detailed HTML report in `coverage/lcov-report/index.html`

---

## Test Structure

```
__tests__/                         # Jest unit & component tests
├── components/                    # Component tests
│   ├── CustomGameConfigurator.test.tsx
│   ├── QuickGameSelector.test.tsx
│   ├── SettingsPanel.test.tsx
│   ├── ErrorBoundary.test.tsx
│   └── Help/
│       └── HelpModal.test.tsx
├── integration/                   # Integration tests
│   └── api/
└── unit/                          # Unit tests
    └── lib/
        ├── errors.test.ts         # Error classes
        ├── validation.test.ts     # Zod schemas
        ├── rateLimit.test.ts      # Rate limiting
        ├── security.test.ts       # Security functions
        ├── roomCode.test.ts       # Room code utils
        ├── roomApi.test.ts        # Room API client
        ├── gameApi.test.ts        # Game API client
        ├── quickQuizApi.test.ts   # Quick quiz client
        └── customQuizApi.test.ts  # Custom quiz client

tests/                             # Playwright E2E tests
├── home.spec.ts                   # Home page E2E tests
└── game-flow.spec.ts              # Game flow E2E tests
```

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Unit tests | `*.test.ts` | `roomCode.test.ts` |
| Component tests | `*.test.tsx` | `QuickGameSelector.test.tsx` |
| Integration tests | `*.integration.test.ts` | `api.integration.test.ts` |

---

## Writing Tests

### Unit Tests

Test pure functions and utilities:

```typescript
// __tests__/unit/lib/roomCode.test.ts
import { generateRoomCode, isValidRoomCode } from '@/lib/roomCode';

describe('generateRoomCode', () => {
  it('should generate a 6-character code', () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(6);
  });

  it('should only contain uppercase letters and digits', () => {
    const code = generateRoomCode();
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });

  it('should generate unique codes', () => {
    const codes = new Set(
      Array.from({ length: 100 }, () => generateRoomCode())
    );
    // Most codes should be unique (allowing some collision)
    expect(codes.size).toBeGreaterThan(90);
  });
});

describe('isValidRoomCode', () => {
  it('should return true for valid codes', () => {
    expect(isValidRoomCode('ABC123')).toBe(true);
    expect(isValidRoomCode('ZZZZZZ')).toBe(true);
    expect(isValidRoomCode('000000')).toBe(true);
  });

  it('should return false for invalid codes', () => {
    expect(isValidRoomCode('')).toBe(false);
    expect(isValidRoomCode('abc123')).toBe(false);  // lowercase
    expect(isValidRoomCode('AB123')).toBe(false);   // too short
    expect(isValidRoomCode('ABC1234')).toBe(false); // too long
    expect(isValidRoomCode('ABC-23')).toBe(false);  // special chars
  });
});
```

### Component Tests

Test React components with React Testing Library:

```typescript
// __tests__/components/QuickGameSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickGameSelector } from '@/app/components/QuickGameSelector';

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('QuickGameSelector', () => {
  it('should render category buttons', () => {
    render(<QuickGameSelector />);

    expect(screen.getByText('Gaming')).toBeInTheDocument();
    expect(screen.getByText('Movies')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
  });

  it('should have accessible button roles', () => {
    render(<QuickGameSelector />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should apply hover styles on interaction', async () => {
    render(<QuickGameSelector />);

    const gamingButton = screen.getByText('Gaming');
    fireEvent.mouseEnter(gamingButton);

    // Check for visual feedback
    expect(gamingButton.closest('button')).toHaveClass('hover:bg-green-600');
  });
});
```

### Testing User Interactions

```typescript
import userEvent from '@testing-library/user-event';

describe('CustomGameConfigurator', () => {
  it('should update question count when slider changes', async () => {
    const user = userEvent.setup();
    render(<CustomGameConfigurator />);

    const slider = screen.getByRole('slider', { name: /questions/i });

    // Simulate user changing slider value
    await user.type(slider, '{arrowright}{arrowright}');

    expect(screen.getByText(/12 questions/i)).toBeInTheDocument();
  });

  it('should submit form with entered values', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<CustomGameConfigurator onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/topic/i), 'Space');
    await user.click(screen.getByText('Start Quiz'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ topic: 'Space' })
    );
  });
});
```

### API Tests

Test API client functions:

```typescript
// __tests__/unit/lib/roomApi.test.ts
import { createRoom, joinRoom, getRoomStatus } from '@/lib/roomApi';

// Mock fetch globally
global.fetch = jest.fn();

describe('roomApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRoom', () => {
    it('should create a room and return room code', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { roomCode: 'ABC123' }
        })
      });

      const result = await createRoom();

      expect(fetch).toHaveBeenCalledWith('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(result.roomCode).toBe('ABC123');
    });

    it('should throw error on failed request', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Server error'
        })
      });

      await expect(createRoom()).rejects.toThrow('Server error');
    });
  });
});
```

---

## E2E Testing with Playwright

### Overview

We use Playwright for end-to-end testing across Chromium and Firefox browsers.

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run headed (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/home.spec.ts

# Generate test code
npx playwright codegen http://localhost:3000
```

### E2E Test Structure

```typescript
// tests/home.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display main title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /pixeltrivia/i })).toBeVisible();
  });

  test('should navigate to game modes', async ({ page }) => {
    await page.getByRole('button', { name: /play/i }).click();
    await expect(page).toHaveURL(/\/game\/mode/);
  });
});
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Best Practices for E2E Tests

1. **Use semantic locators** - `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Wait for stability** - Use `expect` with auto-waiting instead of manual waits
3. **Test user flows** - Focus on complete user journeys, not isolated clicks
4. **Keep tests independent** - Each test should start fresh
5. **Use fixtures** - Share setup code across tests

---

## Mocking

### Mocking Modules

```typescript
// Mock entire module
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn()
    }))
  }
}));
```

### Mocking Next.js Router

```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn()
  }),
  usePathname: () => '/current-path',
  useSearchParams: () => new URLSearchParams()
}));
```

### Mocking Environment Variables

```typescript
describe('with API key configured', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, OPENROUTER_API_KEY: 'test-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use the API key', () => {
    // Test that uses process.env.OPENROUTER_API_KEY
  });
});
```

### Mocking Timers

```typescript
describe('rate limiting', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should reset rate limit after window expires', () => {
    // Trigger rate limit
    for (let i = 0; i < 100; i++) {
      rateLimiter.check('test-ip');
    }

    // Advance time past the rate limit window
    jest.advanceTimersByTime(60 * 1000);

    // Should be allowed again
    expect(rateLimiter.check('test-ip')).toBe(true);
  });
});
```

---

## Coverage

### Configuration

Coverage is configured in `jest.config.js`:

```javascript
{
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20,
    },
  },
}
```

### Viewing Coverage

```bash
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html  # macOS
start coverage/lcov-report/index.html # Windows
```

### Coverage Goals

Current thresholds are set low (20%) to establish a baseline. Target coverage:

| Metric | Current | Target |
|--------|---------|--------|
| Statements | 20% | 60% |
| Branches | 20% | 50% |
| Functions | 20% | 60% |
| Lines | 20% | 60% |

---

## Best Practices

### Test Organization

```typescript
describe('ModuleName', () => {
  // Setup shared between tests
  beforeEach(() => {
    // Reset mocks, set up test data
  });

  describe('functionName', () => {
    it('should handle normal case', () => {});
    it('should handle edge case', () => {});
    it('should throw on invalid input', () => {});
  });

  describe('another function', () => {
    // ...
  });
});
```

### Test Naming

Use descriptive names that explain the behavior:

```typescript
// Good
it('should return false when room code is less than 6 characters')
it('should throw ValidationError when category is empty')

// Bad
it('test1')
it('works')
it('handles error')
```

### Arrange-Act-Assert Pattern

```typescript
it('should add player to room', async () => {
  // Arrange
  const roomCode = 'ABC123';
  const playerName = 'TestPlayer';

  // Act
  const result = await joinRoom(roomCode, playerName);

  // Assert
  expect(result.success).toBe(true);
  expect(result.player.name).toBe(playerName);
});
```

### Test Isolation

Each test should be independent:

```typescript
// Good - each test sets up its own data
it('test 1', () => {
  const data = createTestData();
  // ...
});

it('test 2', () => {
  const data = createTestData();
  // ...
});

// Bad - tests depend on shared state
let sharedData;

beforeAll(() => {
  sharedData = createTestData();
});

it('test 1', () => {
  sharedData.value = 'modified'; // Affects other tests!
});
```

### Testing Error Cases

```typescript
it('should throw ValidationError for invalid input', () => {
  expect(() => validateRoomCode('')).toThrow(ValidationError);
  expect(() => validateRoomCode('')).toThrow('Room code is required');
});

it('should reject promise with error message', async () => {
  await expect(createRoom()).rejects.toThrow('Network error');
});
```

---

## Troubleshooting

### "Cannot find module" Errors

Check module path aliases in `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### "Request is not defined" in Tests

Some Next.js server modules can't be imported in test environment. Split your code:

```typescript
// lib/security.core.ts - Pure functions (testable)
export function sanitizeString(input: string): string { ... }

// lib/security.ts - Next.js dependent (harder to test)
import { NextRequest } from 'next/server';
export function withSecurity(handler) { ... }
```

### Tests Running Slowly

1. Run specific tests instead of all:
   ```bash
   npm test -- validation.test.ts
   ```

2. Use `--maxWorkers` to limit parallelization:
   ```bash
   npm test -- --maxWorkers=2
   ```

3. Check for missing `jest.clearAllMocks()` in `beforeEach`

### Snapshot Tests Failing

Update snapshots when intentional changes are made:

```bash
npm test -- --updateSnapshot
```

### Async Test Timeout

Increase timeout for slow tests:

```typescript
it('should complete long operation', async () => {
  // ...
}, 10000); // 10 second timeout
```

Or globally in `jest.setup.js`:

```javascript
jest.setTimeout(10000);
```

---

## CI/CD Integration

Tests run automatically in GitHub Actions:

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage
```

### Pre-commit Hooks

Tests are also validated via lint-staged on commit:

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

*Last updated: January 31, 2026*
