# Development Guide

This guide covers everything you need to set up a local development environment and contribute to PixelTrivia.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Development Server](#running-the-development-server)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18.x or higher | [nodejs.org](https://nodejs.org/) |
| npm | 9.x or higher | Included with Node.js |
| Git | 2.x or higher | [git-scm.com](https://git-scm.com/) |

### Recommended Tools

- **VS Code** - Recommended IDE with extensions
- **GitHub Desktop** - Visual Git client (optional)
- **Postman/Insomnia** - API testing (optional)

### VS Code Extensions

Install these recommended extensions for the best experience:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/leonidasdev/pixeltrivia.git
cd pixeltrivia
```

### 2. Install Dependencies

```bash
npm install
```

This will:
- Install all dependencies from `package.json`
- Set up Husky git hooks automatically (via `prepare` script)

### 3. Verify Installation

```bash
# Check that all scripts work
npm run lint      # Should complete without errors
npm run typecheck # Should complete without errors
npm test          # Should run 488 tests
```

---

## Environment Configuration

### Create Environment File

```bash
cp .env.example .env.local
```

### Required Variables

```env
# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================
# Get these from: https://supabase.com/dashboard/project/_/settings/api

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Public anonymous key (safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key

# Service role key (server-side only, NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# =============================================================================
# AI QUESTION GENERATION
# =============================================================================
# Get from: https://openrouter.ai/keys

OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key

# =============================================================================
# OPTIONAL CONFIGURATION
# =============================================================================

# Internal API key for admin endpoints (generate a random string)
INTERNAL_API_KEY=your-secret-admin-key

# Override the AI model (default: deepseek/deepseek-chat)
# OPENROUTER_MODEL=deepseek/deepseek-chat
```

### Setting Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** to find your keys
3. Run the database schema:
   - Go to **SQL Editor** in Supabase dashboard
   - Copy contents of `database/schema.sql`
   - Execute the SQL

### Getting an OpenRouter API Key

1. Create an account at [openrouter.ai](https://openrouter.ai)
2. Go to **Keys** section
3. Create a new API key
4. Add credits to your account (DeepSeek is very affordable)

---

## Running the Development Server

### Start Development Mode

```bash
npm run dev
```

This starts the Next.js development server with:
- Hot module replacement (HMR)
- Fast Refresh for React components
- API routes available at `/api/*`

Open [http://localhost:3000](http://localhost:3000)

### Start Production Build Locally

```bash
npm run build
npm run start
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without changes |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run typecheck` | Run TypeScript type checking |

---

## Project Structure

```
pixeltrivia/
├── .github/                 # GitHub configuration
│   └── workflows/           # CI/CD workflows
│       └── ci.yml           # Main CI pipeline
│
├── .husky/                  # Git hooks
│   └── pre-commit           # Runs lint-staged
│
├── __tests__/               # Test files
│   ├── components/          # Component tests (incl. pages/)
│   ├── hooks/               # Hook tests
│   ├── integration/         # API route integration tests
│   └── unit/               # Unit tests
│       └── lib/            # Library function tests
│
├── app/                     # Next.js App Router
│   ├── api/                # API routes (serverless functions)
│   ├── components/         # React components
│   ├── game/              # Game-related pages
│   ├── globals.css        # Global styles & Tailwind
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── error.tsx          # Error boundary
│   ├── global-error.tsx   # Global error handler
│   └── not-found.tsx      # 404 page
│
├── database/               # Database files
│   └── schema.sql         # Supabase schema
│
├── docs/                   # Documentation
│   ├── api-reference.md   # API reference
│   ├── architecture.md    # System architecture
│   ├── database-guide.md  # Database schema
│   ├── development-guide.md # This file
│   ├── testing-guide.md   # Testing guide
│   └── ...                # Other docs
│
├── lib/                    # Shared libraries
│   ├── errors.ts          # Error classes
│   ├── validation.ts      # Zod schemas
│   ├── security.ts        # Security middleware
│   ├── rateLimit.ts       # Rate limiting
│   ├── apiResponse.ts     # Response helpers
│   ├── supabase.ts        # Supabase client
│   └── *Api.ts            # API client functions
│
├── .env.example           # Environment template
├── .env.local             # Local environment (gitignored)
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── .editorconfig          # Editor settings
├── jest.config.js         # Jest configuration
├── jest.setup.js          # Jest setup file
├── middleware.ts          # Next.js middleware
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project overview
```

---

## Development Workflow

### Git Workflow

We use a feature branch workflow:

```bash
# 1. Create a feature branch from main
git checkout main
git pull origin main
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add amazing feature"

# 3. Push and create PR
git push origin feature/my-feature
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Type | Description |
|------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting, no code change |
| `refactor:` | Code refactoring |
| `test:` | Adding tests |
| `chore:` | Build, CI, dependencies |

Examples:
```bash
git commit -m "feat: add multiplayer room creation"
git commit -m "fix: correct score calculation"
git commit -m "docs: update API documentation"
```

### Pre-commit Hooks

Husky runs automatically on each commit:

1. **lint-staged** - Lints and formats staged files
2. ESLint checks TypeScript/JavaScript files
3. Prettier formats all supported files

If hooks fail, fix the issues before committing:

```bash
# Check what lint-staged would do
npm run lint
npm run format:check

# Auto-fix issues
npm run lint:fix
npm run format
```

---

## Code Style

### TypeScript

- Use strict mode (enabled in `tsconfig.json`)
- Prefer `interface` over `type` for object shapes
- Always define return types for functions
- Use descriptive variable names

```typescript
// Good
interface Player {
  id: string;
  name: string;
  score: number;
}

function calculateScore(player: Player, bonusPoints: number): number {
  return player.score + bonusPoints;
}

// Bad
type Player = any;

function calc(p, b) {
  return p.score + b;
}
```

### React Components

- Use functional components with hooks
- Place hooks at the top of components
- Extract complex logic into custom hooks
- Use meaningful component names

```tsx
// Good
export function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    // Timer logic
  }, []);

  return (
    <div className="pixel-border p-4">
      {/* ... */}
    </div>
  );
}

// Bad
export default function(props) {
  // Missing types, unclear purpose
}
```

### Tailwind CSS

- Use utility classes directly
- Extract common patterns to components
- Follow the retro pixel theme

```tsx
// Common retro styling classes
<button className="
  bg-green-500 hover:bg-green-600
  text-white font-bold
  px-6 py-3
  border-4 border-black
  shadow-[4px_4px_0_0_#000]
  hover:shadow-[2px_2px_0_0_#000]
  transition-all
  active:translate-x-1 active:translate-y-1
">
  Play Now
</button>
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- roomCode.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="validation"

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

```
__tests__/
├── components/              # Component tests
│   ├── CustomGameConfigurator.test.tsx
│   └── QuickGameSelector.test.tsx
└── unit/                   # Unit tests
    └── lib/
        ├── errors.test.ts
        ├── validation.test.ts
        ├── rateLimit.test.ts
        ├── security.test.ts
        ├── roomCode.test.ts
        ├── roomApi.test.ts
        ├── gameApi.test.ts
        ├── quickQuizApi.test.ts
        └── customQuizApi.test.ts
```

### Writing Tests

```typescript
// Unit test example
describe('generateRoomCode', () => {
  it('should generate a 6-character code', () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(6);
  });

  it('should only contain alphanumeric characters', () => {
    const code = generateRoomCode();
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });
});

// Component test example
describe('QuickGameSelector', () => {
  it('should render category buttons', () => {
    render(<QuickGameSelector />);
    expect(screen.getByText('Gaming')).toBeInTheDocument();
    expect(screen.getByText('Movies')).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Common Issues

#### "Module not found" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript errors after dependency updates

```bash
# Rebuild TypeScript
npm run typecheck
# or restart TS server in VS Code: Cmd/Ctrl+Shift+P → "Restart TS Server"
```

#### Tests failing with "Request is not defined"

Some tests that import Next.js server modules need special handling. Use pure function imports:

```typescript
// Recommended - works in tests
import { sanitizeString } from '@/lib/security.core';

// Not recommended - may fail in tests (Next.js server dependency)
import { withSecurity } from '@/lib/security';
```

#### Supabase connection issues

1. Check that `.env.local` has correct keys
2. Verify project is active in Supabase dashboard
3. Check that RLS policies are correctly set up

#### AI questions not generating

1. Verify `OPENROUTER_API_KEY` is set correctly
2. Check OpenRouter dashboard for API credits
3. Look for errors in browser console and server logs

### Getting Help

1. Check existing [GitHub Issues](../../issues)
2. Search the documentation
3. Create a new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node version, OS)
   - Relevant error messages

---

## Next Steps

- Read the [Architecture Overview](architecture.md)
- Explore the [API Reference](api-reference.md)
- Check the [Testing Guide](testing-guide.md)
- Review the [Contributing Guidelines](../CONTRIBUTING.md)

---

*Last updated: February 28, 2026*
