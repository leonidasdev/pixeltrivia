# Database Documentation

This guide covers the PixelTrivia database schema, setup, and maintenance.

## Table of Contents

- [Overview](#overview)
- [Database Setup](#database-setup)
- [Schema](#schema)
  - [Rooms Table](#rooms-table)
  - [Players Table](#players-table)
  - [Questions Table](#questions-table)
  - [Game Sessions Table](#game-sessions-table)
- [Relationships](#relationships)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Indexes](#indexes)
- [Functions](#functions)
- [Migrations](#migrations)
- [Maintenance](#maintenance)

---

## Overview

PixelTrivia uses **Supabase** (PostgreSQL) as its database backend. The schema supports:

- Multiplayer game rooms
- Player management and scoring
- Question storage and retrieval
- Game session tracking

**Key Features:**
- Row Level Security (RLS) for data protection
- Foreign key relationships with cascade delete
- Optimized indexes for common queries
- Utility functions for room management

---

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project" and configure:
   - **Project name:** pixeltrivia
   - **Database password:** (generate a strong password)
   - **Region:** Choose closest to your users

### 2. Run Schema Migration

1. Navigate to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy the contents of `database/schema.sql`
4. Execute the query

### 3. Verify Setup

Run this query to verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

Expected output:
```
 table_name
----------------
 rooms
 players
 questions
 game_sessions
```

### 4. Configure Environment

Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     rooms       │       │    questions    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ code (UNIQUE)   │◄──────│ question_text   │
│ created_at      │   │   │ options (JSONB) │
│ status          │   │   │ correct_answer  │
│ max_players     │   │   │ category        │
│ host_player_id  │   │   │ difficulty      │
│ current_question│   │   │ created_at      │
│ total_questions │   │   └─────────────────┘
└────────┬────────┘   │
         │            │
         │ 1:N        │ N:1
         ▼            │
┌─────────────────┐   │   ┌─────────────────┐
│    players      │   │   │  game_sessions  │
├─────────────────┤   │   ├─────────────────┤
│ id (PK)         │   │   │ id (PK)         │
│ room_code (FK)  │───┘   │ room_code (FK)  │
│ name            │       │ current_question│
│ avatar          │       │ question_start  │
│ is_host         │       │ question_end    │
│ joined_at       │       │ created_at      │
│ score           │       └─────────────────┘
│ current_answer  │
│ answer_time     │
└─────────────────┘
```

---

### Rooms Table

Stores multiplayer game room information.

```sql
CREATE TABLE rooms (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'waiting',
  max_players INTEGER DEFAULT 8,
  host_player_id UUID,
  current_question INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 10
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| `code` | VARCHAR(6) | UNIQUE, NOT NULL | 6-char room code |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `status` | VARCHAR(20) | CHECK constraint | Room status |
| `max_players` | INTEGER | CHECK 1-20 | Max allowed players |
| `host_player_id` | UUID | - | Host player reference |
| `current_question` | INTEGER | DEFAULT 0 | Current question index |
| `total_questions` | INTEGER | DEFAULT 10 | Total questions in game |

**Status Values:**
- `waiting` - Room is open for players
- `active` - Game in progress
- `finished` - Game completed

---

### Players Table

Stores player information and scores.

```sql
CREATE TABLE players (
  id BIGSERIAL PRIMARY KEY,
  room_code VARCHAR(6) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  avatar VARCHAR(20) NOT NULL,
  is_host BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INTEGER DEFAULT 0,
  current_answer TEXT,
  answer_time TIMESTAMP WITH TIME ZONE
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| `room_code` | VARCHAR(6) | FK → rooms.code, CASCADE | Associated room |
| `name` | VARCHAR(50) | NOT NULL | Player display name |
| `avatar` | VARCHAR(20) | NOT NULL | Avatar identifier |
| `is_host` | BOOLEAN | DEFAULT FALSE | Is room host |
| `joined_at` | TIMESTAMPTZ | DEFAULT NOW() | Join timestamp |
| `score` | INTEGER | DEFAULT 0 | Current score |
| `current_answer` | TEXT | - | Current question answer |
| `answer_time` | TIMESTAMPTZ | - | When answer was submitted |

---

### Questions Table

Stores trivia questions for the database-backed quiz modes.

```sql
CREATE TABLE questions (
  id BIGSERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  category VARCHAR(50),
  difficulty VARCHAR(20) DEFAULT 'medium',
  image_url TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| `question_text` | TEXT | NOT NULL | Question content |
| `options` | JSONB | NOT NULL | Answer options array |
| `correct_answer` | INTEGER | NOT NULL | Index of correct option |
| `category` | VARCHAR(50) | - | Question category |
| `difficulty` | VARCHAR(20) | CHECK constraint | easy/medium/hard |
| `image_url` | TEXT | DEFAULT NULL | Optional image URL |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Options Format (JSONB):**
```json
["Option A", "Option B", "Option C", "Option D"]
```

**Difficulty Values:**
- `easy` - Elementary/simple questions
- `medium` - Standard difficulty
- `hard` - Challenging questions

---

### Game Sessions Table

Tracks active game state for multiplayer sessions.

```sql
CREATE TABLE game_sessions (
  id BIGSERIAL PRIMARY KEY,
  room_code VARCHAR(6) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  current_question_id BIGINT REFERENCES questions(id),
  question_start_time TIMESTAMP WITH TIME ZONE,
  question_end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-increment ID |
| `room_code` | VARCHAR(6) | FK → rooms.code, CASCADE | Associated room |
| `current_question_id` | BIGINT | FK → questions.id | Current question |
| `question_start_time` | TIMESTAMPTZ | - | When question started |
| `question_end_time` | TIMESTAMPTZ | - | When question ended |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Session creation time |

---

## Relationships

### Foreign Keys

```sql
-- Players → Rooms (cascade delete)
players.room_code → rooms.code ON DELETE CASCADE

-- Game Sessions → Rooms (cascade delete)
game_sessions.room_code → rooms.code ON DELETE CASCADE

-- Game Sessions → Questions
game_sessions.current_question_id → questions.id
```

### Cascade Behavior

When a room is deleted:
- All players in that room are automatically deleted
- All game sessions for that room are automatically deleted

---

## Row Level Security (RLS)

All tables have RLS enabled for security.

### Rooms Policies

```sql
-- Anyone can read rooms
CREATE POLICY "Anyone can read rooms" ON rooms
  FOR SELECT USING (true);

-- Anyone can create rooms
CREATE POLICY "Anyone can create rooms" ON rooms
  FOR INSERT WITH CHECK (true);

-- Only service role can update rooms
CREATE POLICY "Only service role can update rooms" ON rooms
  FOR UPDATE USING (auth.role() = 'service_role');
```

### Players Policies

```sql
-- Anyone can read players
CREATE POLICY "Anyone can read players" ON players
  FOR SELECT USING (true);

-- Anyone can create players
CREATE POLICY "Anyone can create players" ON players
  FOR INSERT WITH CHECK (true);

-- Players can update their own data
CREATE POLICY "Players can update their own data" ON players
  FOR UPDATE USING (true);
```

### Questions Policies

```sql
-- Anyone can read questions
CREATE POLICY "Anyone can read questions" ON questions
  FOR SELECT USING (true);

-- Only service role can manage questions
CREATE POLICY "Only service role can manage questions" ON questions
  FOR ALL USING (auth.role() = 'service_role');
```

---

## Indexes

Indexes are created for frequently queried columns:

```sql
-- Room lookup by code
CREATE INDEX idx_rooms_code ON rooms(code);

-- Player lookup by room
CREATE INDEX idx_players_room_code ON players(room_code);

-- Find host players quickly
CREATE INDEX idx_players_is_host ON players(is_host);

-- Game session lookup by room
CREATE INDEX idx_game_sessions_room_code ON game_sessions(room_code);
```

---

## Functions

### cleanup_old_rooms()

Removes abandoned rooms older than 24 hours.

```sql
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms
  WHERE created_at < NOW() - INTERVAL '24 hours'
  AND status = 'waiting';
END;
$$ LANGUAGE plpgsql;
```

**Usage:**
```sql
SELECT cleanup_old_rooms();
```

**Scheduling (via pg_cron):**
```sql
SELECT cron.schedule('cleanup-rooms', '0 * * * *', 'SELECT cleanup_old_rooms()');
```

### get_room_with_player_count()

Gets room info with current player count.

```sql
CREATE OR REPLACE FUNCTION get_room_with_player_count(room_code_param VARCHAR(6))
RETURNS TABLE (
  code VARCHAR(6),
  created_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20),
  max_players INTEGER,
  current_players BIGINT,
  host_player_name VARCHAR(50)
);
```

**Usage:**
```sql
SELECT * FROM get_room_with_player_count('ABC123');
```

**Example Output:**
```
 code   | created_at          | status  | max_players | current_players | host_player_name
--------+---------------------+---------+-------------+-----------------+------------------
 ABC123 | 2024-01-31 12:00:00 | waiting | 8           | 3               | Player1
```

---

## Migrations

### Adding New Columns

```sql
-- Example: Add a 'category' field to rooms
ALTER TABLE rooms ADD COLUMN category VARCHAR(50);
```

### Creating New Tables

```sql
-- Example: Add achievements table
CREATE TABLE achievements (
  id BIGSERIAL PRIMARY KEY,
  player_id BIGINT REFERENCES players(id),
  achievement_type VARCHAR(50) NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read their achievements" ON achievements
  FOR SELECT USING (true);
```

### Backup Before Migration

Always backup before making schema changes:

```bash
# Using Supabase CLI
supabase db dump --file backup.sql

# Or via Dashboard
# Settings → Database → Backups
```

---

## Maintenance

### Viewing Table Stats

```sql
SELECT
  schemaname,
  relname,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables
WHERE schemaname = 'public';
```

### Checking Index Usage

```sql
SELECT
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public';
```

### Manual Cleanup

```sql
-- Delete old waiting rooms
DELETE FROM rooms
WHERE created_at < NOW() - INTERVAL '24 hours'
AND status = 'waiting';

-- Delete finished rooms older than 7 days
DELETE FROM rooms
WHERE created_at < NOW() - INTERVAL '7 days'
AND status = 'finished';
```

### Monitoring Connection Pool

In Supabase Dashboard:
- Go to **Settings → Database**
- Check connection pool utilization
- Adjust pool size if needed

---

## Common Queries

### Get All Players in a Room

```sql
SELECT name, avatar, score, is_host
FROM players
WHERE room_code = 'ABC123'
ORDER BY score DESC;
```

### Get Questions by Category

```sql
SELECT id, question_text, difficulty
FROM questions
WHERE category ILIKE '%gaming%'
ORDER BY RANDOM()
LIMIT 10;
```

### Get Room Statistics

```sql
SELECT
  r.code,
  r.status,
  COUNT(p.id) as player_count,
  MAX(p.score) as high_score
FROM rooms r
LEFT JOIN players p ON r.code = p.room_code
WHERE r.created_at > NOW() - INTERVAL '1 day'
GROUP BY r.code, r.status;
```

---

## Troubleshooting

### "Permission Denied" Errors

Check RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

Temporarily bypass (for debugging):
```sql
-- Disable RLS (only in development!)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

### Connection Timeout

1. Check Supabase dashboard for pool exhaustion
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Check if project is paused (free tier)

### Slow Queries

Analyze query performance:
```sql
EXPLAIN ANALYZE
SELECT * FROM questions WHERE category = 'Gaming';
```

Add indexes for frequently filtered columns.

---

*Last updated: March 1, 2026*
