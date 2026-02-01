# PixelTrivia

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?logo=supabase)
![Tests](https://img.shields.io/badge/Tests-333%20passing-brightgreen)

**A retro-styled trivia game with AI-powered question generation**

[Demo](#) | [Documentation](docs/) | [Report Bug](../../issues) | [Request Feature](../../issues)

</div>

---

## Features

- **Pixel-Perfect Retro UI** - Nostalgic 8-bit inspired design
- **AI-Powered Questions** - Generate custom trivia using DeepSeek AI via OpenRouter
- **Multiple Game Modes** - Quick Play, Custom Topics, Advanced Configuration
- **Multiplayer Rooms** - Create and join rooms with friends
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Keyboard Navigation** - Full keyboard accessibility support
- **WCAG Accessible** - Screen reader friendly with proper ARIA labels
- **Security Hardened** - Rate limiting, input validation, XSS protection

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
| [Architecture](docs/ARCHITECTURE.md) | System design and component overview |
| [Development](docs/DEVELOPMENT.md) | Local setup and development guide |
| [API Reference](docs/API.md) | Complete API documentation |
| [Database](docs/DATABASE.md) | Schema and Supabase setup |
| [Testing](docs/TESTING.md) | Testing guide and conventions |
| [Deployment](docs/DEPLOYMENT.md) | Production deployment guide |
| [Contributing](CONTRIBUTING.md) | How to contribute |

## Game Modes

### Quick Play
Jump straight into a trivia game with predefined categories:
- Gaming, Movies, Science, History, Geography, and more
- 5 difficulty levels from Elementary to College
- 5-50 questions per game

### Custom Game
Create your own trivia experience:
- AI generates questions based on your topic
- Provide optional context for more specific questions
- Supports multiple languages

### Multiplayer
Play with friends in real-time:
- Create private rooms with 6-character codes
- Up to 16 players per room
- Host controls game flow

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
│   │   ├── create/        # Create multiplayer room
│   │   └── join/          # Join multiplayer room
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility libraries
│   ├── errors.ts          # Custom error classes
│   ├── validation.ts      # Zod schemas
│   ├── security.ts        # Security middleware
│   ├── rateLimit.ts       # Rate limiting
│   ├── apiResponse.ts     # API response helpers
│   └── *Api.ts            # API client functions
├── database/              # Database schema
├── docs/                  # Documentation
├── __tests__/             # Test suites
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

**Test Coverage:** 236 tests across 11 test suites

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
| `npm run typecheck` | TypeScript type checking |

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
