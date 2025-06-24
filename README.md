# PixelTrivia

A retro-styled trivia game built with Next.js, React, Tailwind CSS, and AI-powered question generation.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `OPENROUTER_API_KEY` - Your OpenRouter API key for AI question generation

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- 🎮 Pixel-perfect retro UI design
- 🧠 AI-powered custom question generation
- 📱 Responsive layout
- ⌨️ Keyboard navigation support
- ♿ Accessible components
- 🔷 TypeScript support
- 🎯 Multiple game modes (Quick, Custom, Multiplayer)
- 🗄️ Supabase backend integration

## API Endpoints

### `/api/quiz/custom` - AI Question Generation

Generate custom trivia questions using DeepSeek AI through OpenRouter.

**Request:**

```json
POST /api/quiz/custom
{
  "knowledgeLevel": "college",
  "context": "Ancient Greek mythology",
  "numQuestions": 10
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "custom_1234567890_0",
      "question": "Who is the king of the gods in Greek mythology?",
      "options": ["Zeus", "Poseidon", "Hades", "Apollo"],
      "correctAnswer": 0,
      "category": "Mythology",
      "difficulty": "college"
    }
  ],
  "metadata": {
    "knowledgeLevel": "college",
    "context": "Ancient Greek mythology",
    "requestedQuestions": 10,
    "generatedQuestions": 10,
    "generatedAt": "2025-06-23T10:30:00.000Z"
  }
}
```

### `/api/quiz/quick` - Quick Quiz

Get predefined questions by category.

### `/api/room/create` - Room Creation

Create multiplayer game rooms.

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `app/page.tsx` - Main menu screen
- `app/game/` - Game-related pages
- `app/api/` - API routes
- `app/components/` - Reusable React components
- `lib/` - Utility functions and API clients
- `database/` - Database schema and migrations

## Test Pages

- `/test/quiz` - Test the quick quiz API
- `/test/custom` - Test the custom AI quiz generation API
