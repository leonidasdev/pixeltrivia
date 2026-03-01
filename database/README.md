# Database

This directory contains the complete database definition for PixelTrivia (Supabase / PostgreSQL).

## Structure

```
database/
  schema.sql   -- Single source of truth: tables, indexes, RLS, Realtime, functions
  seed.sql     -- Sample trivia questions (150+ across 40 categories)
  README.md    -- This file
```

## Setup

### Option 1: Supabase SQL Editor

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Paste and run `schema.sql`
4. Paste and run `seed.sql` to populate sample data

### Option 2: Supabase CLI

```bash
npm install -g supabase
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase db reset   # development only — reset and re-seed
```

### Option 3: Direct connection

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```

## Schema Overview

| Table | Purpose |
|-------|---------|
| `rooms` | Game rooms with status, config, and multiplayer settings |
| `players` | Players in a room with scores, answers, and host flag |
| `questions` | Trivia question bank (text, options, category, difficulty, image_url) |
| `game_sessions` | Tracks active game state per room |
| `game_questions` | Per-game question sets for multiplayer sessions |

**Functions:** `get_room_full`, `reset_player_answers`, `cleanup_old_rooms`, `get_room_with_player_count`

**Realtime:** Enabled on `rooms` and `players` tables for multiplayer subscriptions.

## Seed Data

The `seed.sql` file contains 150+ sample trivia questions across 40 categories (Geography, Science, History, Art, Literature, Mathematics, Animals, Music, Sports, Food, Colors & Shapes, Technology, and more) at easy/medium/hard difficulties.

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
