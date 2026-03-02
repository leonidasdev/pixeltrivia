# PixelTrivia

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?logo=supabase)
![Tests](https://img.shields.io/badge/Tests-1990%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/Coverage-86%25-brightgreen)

**A retro-styled trivia game with AI-powered question generation**

[Demo](#) | [Documentation](docs/) | [Report Bug](../../issues) | [Request Feature](../../issues)

</div>

---

## Features

- **Pixel-Perfect Retro UI** — Nostalgic 8-bit inspired design with retro fonts and pixel borders
- **AI-Powered Questions** — Generate custom trivia using DeepSeek AI via OpenRouter
- **Multiple Game Modes** — Quick Play, Custom Topics, Advanced (file-based)
- **Multiplayer Rooms** — Create and join rooms, real-time gameplay with Supabase Realtime
- **Single-Player Mode** — Full solo gameplay with timer, scoring, streaks, and results
- **Leaderboards & Achievements** — Local rankings with 20 unlockable achievements across 4 tiers
- **Adaptive Difficulty** — Per-category accuracy tracking adjusts recommended difficulty
- **Chiptune Sound System** — Web Audio API engine with 18 sound effects and procedural music
- **Image-Based Questions** — Optional image support for richer trivia content
- **Share Results** — Web Share API with clipboard fallback for sharing scores
- **Touch Gestures** — Swipe navigation on mobile devices
- **Keyboard Navigation** — Full keyboard accessibility (1-4 / A-D answer shortcuts)
- **WCAG Accessible** — Screen reader friendly, ARIA labels, skip navigation, 44px touch targets
- **Reduced Motion** — Respects `prefers-reduced-motion` system preference
- **Security Hardened** — Rate limiting, input validation, XSS protection, CSP headers
- **Responsive Design** — Works on desktop, tablet, and mobile

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)
- OpenRouter API key (for AI question generation)

### Installation

```bash
# Clone the repository
git clone https://github.com/leonidasdev/pixeltrivia.git
cd pixeltrivia

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Question Generation (OpenRouter)
OPENROUTER_API_KEY=your-openrouter-api-key

# Optional: Internal API key for admin endpoints
INTERNAL_API_KEY=your-secret-key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/reference/architecture.md) | System design and component overview |
| [Development](docs/guides/development-guide.md) | Local setup and development guide |
| [API Reference](docs/reference/api-reference.md) | Complete API documentation |
| [Database](docs/guides/database-guide.md) | Schema and Supabase setup |
| [Testing](docs/guides/testing-guide.md) | Testing guide and conventions |
| [Deployment](docs/guides/deployment-guide.md) | Production deployment guide |
| [Contributing](CONTRIBUTING.md) | How to contribute |

## Game Modes

### Quick Play
Select from predefined categories and start a trivia game:
- 40+ categories across Gaming, Movies, Science, History, Geography, and more
- 5 difficulty levels from Elementary to College
- Adaptive difficulty recommendations based on your performance
- 5-50 questions per game

### Custom Game
Create your own trivia experience:
- AI generates questions based on your topic using DeepSeek
- Provide optional context for more specific questions
- Configurable question count and difficulty

### Advanced Game
Generate questions from your own documents:
- Upload PDF, DOCX, TXT, or Markdown files
- AI creates questions based on document content
- Input sanitization and prompt injection protection

### Multiplayer
Compete with others in real-time:
- Create private rooms with 6-character codes
- Up to 16 players per room
- Host controls game flow
- Invite links and room code sharing

## Project Structure

```
pixeltrivia/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── ai/            # AI generation endpoints
│   │   ├── game/          # Game session endpoints
│   │   ├── quiz/          # Quiz endpoints (quick, custom, advanced)
│   │   └── room/          # Multiplayer room endpoints
│   ├── components/        # React components
│   ├── game/              # Game pages
│   │   ├── quick/         # Quick play mode
│   │   ├── custom/        # Custom game mode
│   │   ├── advanced/      # Advanced configuration
│   │   ├── play/          # Single-player gameplay
│   │   ├── create/        # Create multiplayer room
│   │   ├── join/          # Join multiplayer room
│   │   ├── mode/          # Game mode selection
│   │   ├── select/        # Category & difficulty selection
│   │   ├── leaderboard/   # Rankings page
│   │   ├── achievements/  # Achievement showcase
│   │   └── stats/         # Game statistics
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── types/                 # Shared TypeScript type definitions
├── constants/             # Application constants (avatars, categories, game config)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── errors.ts          # Custom error classes
│   ├── validation.ts      # Zod schemas
│   ├── security.ts        # Security middleware
│   ├── security.core.ts   # Pure security functions
│   ├── rateLimit.ts       # Rate limiting (in-memory + Redis)
│   ├── apiResponse.ts     # API response helpers
│   ├── logger.ts          # Structured logging utility
│   ├── storage.ts         # Typed localStorage wrapper
│   ├── soundManager.ts    # Web Audio API sound engine
│   ├── leaderboard.ts     # Local leaderboard system
│   ├── achievements.ts    # Achievement system
│   ├── apiCache.ts        # SWR-based API caching
│   └── *Api.ts            # API client functions
├── database/              # Database schema
├── docs/                  # Documentation
│   ├── guides/            # Development, testing, deployment
│   ├── reference/         # Architecture, API reference
│   └── operations/        # Monitoring, runbook
├── __tests__/             # Test suites (114 suites, 1990 tests)
└── .github/               # GitHub Actions CI/CD
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run typecheck
```

**Test Coverage:** 1990 tests across 114 test suites (unit, component, page, hook, integration)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format with Prettier |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run typecheck` | TypeScript type checking |
| `npm run validate` | Full validation (typecheck + lint + test) |

## Security Features

- **Rate Limiting** - Protects against abuse (100 req/min standard, 5 req/min for AI)
- **Input Validation** - Zod schemas validate all API inputs
- **XSS Protection** - Input sanitization and CSP headers
- **CORS** - Configured allowed origins
- **Security Headers** - X-Frame-Options, X-Content-Type-Options, etc.
- **Request Size Limits** - Prevents oversized payloads

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Supabase](https://supabase.com/) - Backend
- [OpenRouter](https://openrouter.ai/) - AI API gateway
- [DeepSeek](https://deepseek.com/) - AI model for question generation

---

<div align="center">
Made with pixels
</div>
