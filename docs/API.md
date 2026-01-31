# API Reference

Complete reference documentation for all PixelTrivia API endpoints.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Response Format](#response-format)
- [Quiz Endpoints](#quiz-endpoints)
  - [POST /api/quiz/quick](#post-apiquizquick)
  - [POST /api/quiz/custom](#post-apiquizcustom)
  - [POST /api/quiz/advanced](#post-apiquizadvanced)
- [Game Endpoints](#game-endpoints)
  - [GET /api/game/questions](#get-apigamequestions)
- [Room Endpoints](#room-endpoints)
  - [POST /api/room/create](#post-apiroomcreate)
- [AI Endpoints](#ai-endpoints)
  - [POST /api/ai/generate-questions](#post-apiaigenerate-questions)
- [Error Handling](#error-handling)

---

## Overview

All API endpoints follow RESTful conventions and return JSON responses.

**Base URL:**
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

**Content Type:**
```
Content-Type: application/json
```

---

## Authentication

Currently, PixelTrivia uses public endpoints with rate limiting for protection. No API keys are required for client requests.

Internal endpoints (like AI generation) use server-side API keys configured via environment variables.

---

## Rate Limiting

All endpoints are protected by rate limiting:

| Endpoint Type | Rate Limit |
|---------------|------------|
| Standard API | 100 requests/minute |
| AI Generation | 5 requests/minute |
| Room Creation | 10 requests/5 minutes |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706745600
```

**Rate Limit Exceeded Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please wait before trying again.",
  "retryAfter": 60
}
```
**Status:** `429 Too Many Requests`

---

## Response Format

All API responses follow a consistent structure:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error type or code",
  "message": "Human-readable error description"
}
```

---

## Quiz Endpoints

### POST /api/quiz/quick

Fetches random questions from the database for quick play mode.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | string | Yes | Category to filter questions |

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/quiz/quick \
  -H "Content-Type: application/json" \
  -d '{"category": "gaming"}'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": 1,
        "question": "What game features a plumber named Mario?",
        "options": ["Sonic", "Super Mario Bros", "Zelda", "Metroid"],
        "correctAnswer": 1,
        "category": "Gaming",
        "difficulty": "easy"
      }
    ],
    "totalQuestions": 10
  },
  "message": "Questions fetched successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Category is required | Missing category parameter |
| 400 | Invalid category | Category must be a non-empty string |
| 404 | No questions found | No questions match the category |
| 500 | Database query failed | Database connection error |

---

### POST /api/quiz/custom

Generates AI-powered custom quiz questions using DeepSeek.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `knowledgeLevel` | string | Yes | Player's knowledge level |
| `context` | string | No | Topic/context for questions |
| `numQuestions` | number | Yes | Number of questions (1-50) |

**Knowledge Levels:**
- `beginner`
- `intermediate`
- `advanced`
- `expert`

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/quiz/custom \
  -H "Content-Type: application/json" \
  -d '{
    "knowledgeLevel": "intermediate",
    "context": "Space exploration and NASA missions",
    "numQuestions": 10
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "q_1",
        "question": "Which spacecraft was the first to land humans on the Moon?",
        "options": ["Gemini", "Apollo 11", "Skylab", "Voyager"],
        "correctAnswer": 1,
        "category": "Space",
        "difficulty": "medium"
      }
    ],
    "metadata": {
      "generatedAt": "2024-01-31T12:00:00Z",
      "model": "deepseek/deepseek-chat"
    }
  },
  "message": "Quiz generated successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Knowledge level required | Missing knowledgeLevel |
| 400 | Invalid numQuestions | Must be between 1-50 |
| 429 | Rate limit exceeded | AI endpoint rate limited |
| 500 | API key not configured | Missing OpenRouter key |
| 500 | AI generation failed | DeepSeek API error |

---

### POST /api/quiz/advanced

Generates quiz questions from uploaded file content summaries.

**Request Body:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `filesSummary` | string | Yes | - | Summary of file content (max 3000 chars) |
| `numQuestions` | number | No | 10 | Questions to generate (1-20) |
| `format` | string | No | "short" | "short" or "long" format |
| `timeLimit` | number | No | 20 | Seconds per question (10-120) |

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/quiz/advanced \
  -H "Content-Type: application/json" \
  -d '{
    "filesSummary": "Chapter 3 covers photosynthesis, the process by which plants convert sunlight into energy. Key concepts include chlorophyll, carbon dioxide absorption, and oxygen release.",
    "numQuestions": 5,
    "format": "short",
    "timeLimit": 30
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question": "What pigment is responsible for absorbing sunlight in plants?",
        "options": ["Chlorophyll", "Melanin", "Carotene", "Hemoglobin"],
        "answer": "A"
      }
    ],
    "quizSettings": {
      "totalQuestions": 5,
      "format": "short",
      "timeLimit": 30
    }
  },
  "message": "Advanced quiz generated successfully"
}
```

**Security Features:**
- Input sanitization removes markdown, HTML, and injection patterns
- Maximum 3000 character limit on file summaries
- Prompt injection detection and blocking

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid request | Missing or invalid filesSummary |
| 400 | Content too long | Exceeds 3000 character limit |
| 429 | Rate limit exceeded | AI endpoint rate limited |
| 500 | Generation failed | AI response parsing error |

---

## Game Endpoints

### GET /api/game/questions

Fetches questions for multiplayer game sessions.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | string | Yes | - | Question category |
| `difficulty` | string | Yes | - | Difficulty level |
| `limit` | number | No | 10 | Max questions (1-50) |

**Difficulty Levels:**
- `elementary` → maps to "easy"
- `middle-school` → maps to "easy"
- `high-school` → maps to "medium"
- `college-level` → maps to "hard"
- `classic` → mixed difficulties

**Example Request:**
```bash
curl "http://localhost:3000/api/game/questions?category=science&difficulty=high-school&limit=10"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": 42,
        "questionNumber": 1,
        "question": "What is the chemical symbol for gold?",
        "options": ["Au", "Ag", "Fe", "Cu"],
        "correctAnswer": 0,
        "category": "Science",
        "difficulty": "medium",
        "timeLimit": 30
      }
    ],
    "totalQuestions": 10,
    "selectedCategory": "science",
    "selectedDifficulty": "high-school",
    "timeLimit": 30
  },
  "message": "Questions fetched successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Category required | Missing category parameter |
| 400 | Difficulty required | Missing difficulty parameter |
| 400 | Invalid limit | Limit must be 1-50 |
| 404 | No questions found | No matching questions |
| 500 | Database error | Query failed |

---

## Room Endpoints

### POST /api/room/create

Creates a new multiplayer game room.

**Request Body:** None required

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/room/create
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "roomCode": "A1B2C3",
    "createdAt": "2024-01-31T12:00:00.000Z",
    "status": "waiting"
  },
  "message": "Room created successfully"
}
```

**Room Code Format:**
- 6 alphanumeric characters
- Uppercase letters and digits only
- Pattern: `[A-Z0-9]{6}`

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 405 | Method not allowed | Use POST only |
| 429 | Rate limit exceeded | 10 rooms/5 minutes |
| 500 | Generation failed | Could not create unique code |
| 500 | Database error | Insert failed |

---

## AI Endpoints

### POST /api/ai/generate-questions

Low-level AI question generation endpoint (internal use).

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | string | Yes | Topic for questions |
| `difficulty` | string | No | Difficulty level |
| `questionCount` | number | No | Number of questions |

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "World History",
    "difficulty": "medium",
    "questionCount": 5
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "question": "Sample question about World History",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "difficulty": "medium"
    }
  ]
}
```

> **Note:** This is a placeholder endpoint. Full AI integration uses the `/api/quiz/custom` and `/api/quiz/advanced` endpoints.

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET/POST |
| 201 | Created | Resource created (rooms) |
| 400 | Bad Request | Invalid parameters |
| 404 | Not Found | Resource not found |
| 405 | Method Not Allowed | Wrong HTTP method |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal errors |

### Common Error Types

```json
// Validation Error
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Category must be a non-empty string",
  "details": {
    "field": "category",
    "received": null
  }
}

// Rate Limit Error
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retryAfter": 60
}

// Database Error
{
  "success": false,
  "error": "DATABASE_ERROR",
  "message": "Failed to fetch questions from database"
}

// AI Generation Error
{
  "success": false,
  "error": "AI_GENERATION_FAILED",
  "message": "Failed to generate quiz questions"
}
```

---

## Testing the API

### Using cURL

```bash
# Quick Quiz
curl -X POST http://localhost:3000/api/quiz/quick \
  -H "Content-Type: application/json" \
  -d '{"category": "movies"}'

# Custom Quiz
curl -X POST http://localhost:3000/api/quiz/custom \
  -H "Content-Type: application/json" \
  -d '{"knowledgeLevel": "intermediate", "context": "Marvel movies", "numQuestions": 5}'

# Create Room
curl -X POST http://localhost:3000/api/room/create

# Get Game Questions
curl "http://localhost:3000/api/game/questions?category=history&difficulty=classic&limit=10"
```

### Using JavaScript

```javascript
// Quick Quiz
const quickQuiz = await fetch('/api/quiz/quick', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ category: 'gaming' })
});
const data = await quickQuiz.json();

// Custom Quiz
const customQuiz = await fetch('/api/quiz/custom', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    knowledgeLevel: 'advanced',
    context: 'Quantum physics',
    numQuestions: 10
  })
});
```

---

## API Client Libraries

PixelTrivia provides client libraries in `lib/`:

- [quickQuizApi.ts](../lib/quickQuizApi.ts) - Quick play API client
- [customQuizApi.ts](../lib/customQuizApi.ts) - Custom quiz API client
- [roomApi.ts](../lib/roomApi.ts) - Room management API client
- [gameApi.ts](../lib/gameApi.ts) - Game session API client

**Example Usage:**

```typescript
import { fetchQuickQuiz } from '@/lib/quickQuizApi';
import { createRoom, joinRoom } from '@/lib/roomApi';

// Fetch quick quiz
const quiz = await fetchQuickQuiz('gaming');

// Create multiplayer room
const room = await createRoom();
console.log(`Room code: ${room.roomCode}`);
```

---

*Last updated: January 31, 2026*
