# Contributing to PixelTrivia

Thank you for your interest in contributing to PixelTrivia! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pixeltrivia.git
   cd pixeltrivia
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/leonidasdev/pixeltrivia.git
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase and OpenRouter keys
   ```

6. **Verify setup:**
   ```bash
   npm run lint
   npm test
   npm run dev
   ```

---

## Development Workflow

### 1. Sync with Upstream

Before starting work:

```bash
git checkout main
git pull upstream main
git push origin main
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/fixes

### 3. Make Changes

- Write code following our [coding standards](#coding-standards)
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run linting
npm run lint

# Run type checking
npm run typecheck

# Run tests
npm test

# Check formatting
npm run format:check
```

### 5. Commit Your Changes

Follow [conventional commit messages](#commit-messages):

```bash
git add .
git commit -m "feat: add multiplayer score tracking"
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventions

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested the changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests pass
- [ ] Lint passes
- [ ] Documentation updated
```

### Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged

---

## Coding Standards

### TypeScript

- Use strict mode (enabled in tsconfig)
- Define explicit types for function parameters and return values
- Prefer `interface` over `type` for object shapes
- Use `unknown` instead of `any` when type is uncertain

```typescript
// ✅ Good
interface Player {
  id: string;
  name: string;
  score: number;
}

function calculateScore(player: Player, bonus: number): number {
  return player.score + bonus;
}

// ❌ Bad
function calc(p: any, b: any) {
  return p.score + b;
}
```

### React Components

- Use functional components with hooks
- Define prop interfaces
- Use descriptive component names
- Extract complex logic into custom hooks

```tsx
// ✅ Good
interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: number) => void;
  timeLimit: number;
}

export function QuestionCard({ question, onAnswer, timeLimit }: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  // ...
}
```

### CSS/Tailwind

- Follow the retro pixel aesthetic
- Use consistent spacing and colors
- Prefer Tailwind utilities over custom CSS

```tsx
// Retro button style
<button className="
  bg-green-500 hover:bg-green-600
  text-white font-bold
  px-6 py-3
  border-4 border-black
  shadow-[4px_4px_0_0_#000]
  hover:shadow-[2px_2px_0_0_#000]
  transition-all
">
```

### File Organization

- One component per file
- Place related files together
- Use index files for clean exports

---

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code refactoring |
| `test` | Adding/updating tests |
| `chore` | Build, CI, dependencies |
| `perf` | Performance improvements |

### Examples

```bash
# Feature
git commit -m "feat(quiz): add timer component"

# Bug fix
git commit -m "fix(room): correct player count on join"

# Documentation
git commit -m "docs: update API reference"

# Breaking change
git commit -m "feat(api)!: change response format

BREAKING CHANGE: API now returns data in 'data' field instead of 'result'"
```

---

## Testing Requirements

### All PRs Must

- Pass existing tests
- Include tests for new functionality
- Maintain or improve coverage

### Test Types

| Type | Location | Purpose |
|------|----------|---------|
| Unit | `__tests__/unit/` | Test individual functions |
| Component | `__tests__/components/` | Test React components |
| Page | `__tests__/components/pages/` | Test page-level rendering |
| Hook | `__tests__/hooks/` | Test custom React hooks |
| Integration | `__tests__/integration/` | Test API routes end-to-end |

### Writing Tests

```typescript
// Follow Arrange-Act-Assert pattern
describe('functionName', () => {
  it('should handle normal case', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = functionName(input);

    // Assert
    expect(result).toBe('expected');
  });

  it('should throw on invalid input', () => {
    expect(() => functionName(null)).toThrow();
  });
});
```

---

## Documentation

### When to Update Docs

- Adding new features → Update relevant docs
- Changing API → Update api-reference.md
- Changing database → Update database-guide.md
- Changing setup → Update development-guide.md

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `CHANGELOG.md` | Release history |
| `docs/architecture.md` | System design |
| `docs/development-guide.md` | Setup guide |
| `docs/api-reference.md` | API reference |
| `docs/api-testing-guide.md` | Manual API testing |
| `docs/api-versioning.md` | Versioning strategy |
| `docs/database-guide.md` | Database schema |
| `docs/deployment-guide.md` | Deployment & hosting |
| `docs/monitoring.md` | Observability & alerts |
| `docs/runbook.md` | Operational runbook |
| `docs/testing-guide.md` | Testing guide |
| `docs/AUDIT.md` | Code quality audit |
| `docs/TODO.md` | Roadmap & task tracker |
| `docs/CLAUDE.md` | AI assistant context |

---

## Issue Reporting

### Bug Reports

Include:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version)
- Screenshots if applicable

### Feature Requests

Include:
- Clear description of the feature
- Use case / motivation
- Proposed solution (if any)
- Alternatives considered

### Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature request |
| `documentation` | Documentation improvements |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |

---

## Questions?

- Check existing [issues](../../issues)
- Read the [documentation](docs/)
- Open a new issue for questions

---

Thank you for contributing to PixelTrivia!

*Last updated: March 1, 2026*
