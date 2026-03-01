-- ============================================================================
-- PixelTrivia - Complete Database Schema (Supabase)
--
-- Single source of truth for all tables, indexes, RLS policies, functions,
-- and Realtime configuration. Run this on a fresh Supabase project to set
-- up the entire database.
--
-- After applying the schema, run seed.sql to populate sample data.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS rooms (
  id              BIGSERIAL PRIMARY KEY,
  code            VARCHAR(6) UNIQUE NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status          VARCHAR(20) DEFAULT 'waiting'
                    CHECK (status IN ('waiting', 'active', 'finished')),
  max_players     INTEGER DEFAULT 8
                    CHECK (max_players > 0 AND max_players <= 20),
  host_player_id  UUID,
  current_question INTEGER DEFAULT 0,
  total_questions  INTEGER DEFAULT 10,
  -- Multiplayer columns
  question_start_time TIMESTAMP WITH TIME ZONE,
  game_mode       VARCHAR(20) DEFAULT 'quick',
  category        VARCHAR(50),
  time_limit      INTEGER DEFAULT 30
);

CREATE TABLE IF NOT EXISTS players (
  id              BIGSERIAL PRIMARY KEY,
  room_code       VARCHAR(6) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  name            VARCHAR(50) NOT NULL,
  avatar          VARCHAR(20) NOT NULL,
  is_host         BOOLEAN DEFAULT FALSE,
  joined_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score           INTEGER DEFAULT 0,
  current_answer  TEXT,
  answer_time     TIMESTAMP WITH TIME ZONE,
  -- Multiplayer: JSONB array of { questionIndex, answer, timeMs, correct, score }
  answers         JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS questions (
  id              BIGSERIAL PRIMARY KEY,
  question_text   TEXT NOT NULL,
  options         JSONB NOT NULL,            -- Array of answer options
  correct_answer  INTEGER NOT NULL,          -- Index of correct option
  category        VARCHAR(50),
  difficulty      VARCHAR(20) DEFAULT 'medium'
                    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  image_url       TEXT DEFAULT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id                  BIGSERIAL PRIMARY KEY,
  room_code           VARCHAR(6) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  current_question_id BIGINT REFERENCES questions(id),
  question_start_time TIMESTAMP WITH TIME ZONE,
  question_end_time   TIMESTAMP WITH TIME ZONE,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Per-game questions for multiplayer sessions
CREATE TABLE IF NOT EXISTS game_questions (
  id              BIGSERIAL PRIMARY KEY,
  room_code       VARCHAR(6) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  question_index  INTEGER NOT NULL,
  question_text   TEXT NOT NULL,
  options         JSONB NOT NULL,
  correct_answer  INTEGER NOT NULL,
  category        VARCHAR(50),
  difficulty      VARCHAR(20),
  UNIQUE(room_code, question_index)
);

-- ============================================================================
-- 2. Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_players_room_code ON players(room_code);
CREATE INDEX IF NOT EXISTS idx_players_is_host ON players(is_host);
CREATE INDEX IF NOT EXISTS idx_game_sessions_room_code ON game_sessions(room_code);
CREATE INDEX IF NOT EXISTS idx_game_questions_room_code ON game_questions(room_code);
CREATE INDEX IF NOT EXISTS idx_game_questions_room_index ON game_questions(room_code, question_index);

-- ============================================================================
-- 3. Row Level Security
-- ============================================================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_questions ENABLE ROW LEVEL SECURITY;

-- Rooms
CREATE POLICY "Anyone can read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Only service role can update rooms" ON rooms FOR UPDATE USING (auth.role() = 'service_role');

-- Players
CREATE POLICY "Anyone can read players" ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can create players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Players can update their own data" ON players FOR UPDATE USING (true);

-- Questions
CREATE POLICY "Anyone can read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Only service role can manage questions" ON questions FOR ALL USING (auth.role() = 'service_role');

-- Game sessions
CREATE POLICY "Anyone can read game sessions" ON game_sessions FOR SELECT USING (true);
CREATE POLICY "Only service role can manage game sessions" ON game_sessions FOR ALL USING (auth.role() = 'service_role');

-- Game questions
CREATE POLICY "Anyone can read game questions" ON game_questions FOR SELECT USING (true);
CREATE POLICY "Only service role can manage game questions" ON game_questions FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 4. Supabase Realtime
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- ============================================================================
-- 5. Functions
-- ============================================================================

-- Get room with full player list (multiplayer)
CREATE OR REPLACE FUNCTION get_room_full(room_code_param VARCHAR(6))
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'room', (
      SELECT json_build_object(
        'code', r.code,
        'status', r.status,
        'max_players', r.max_players,
        'current_question', r.current_question,
        'total_questions', r.total_questions,
        'question_start_time', r.question_start_time,
        'time_limit', r.time_limit,
        'game_mode', r.game_mode,
        'category', r.category,
        'created_at', r.created_at
      )
      FROM rooms r WHERE r.code = room_code_param
    ),
    'players', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'avatar', p.avatar,
          'is_host', p.is_host,
          'score', p.score,
          'has_answered', p.current_answer IS NOT NULL,
          'joined_at', p.joined_at
        )
        ORDER BY p.joined_at
      )
      FROM players p WHERE p.room_code = room_code_param
    ), '[]'::json)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Reset player answers for next question
CREATE OR REPLACE FUNCTION reset_player_answers(room_code_param VARCHAR(6))
RETURNS void AS $$
BEGIN
  UPDATE players
  SET current_answer = NULL, answer_time = NULL
  WHERE room_code = room_code_param;
END;
$$ LANGUAGE plpgsql;

-- Clean up stale waiting rooms (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms
  WHERE created_at < NOW() - INTERVAL '24 hours'
  AND status = 'waiting';
END;
$$ LANGUAGE plpgsql;

-- Get room with player count summary
CREATE OR REPLACE FUNCTION get_room_with_player_count(room_code_param VARCHAR(6))
RETURNS TABLE (
  code VARCHAR(6),
  created_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20),
  max_players INTEGER,
  current_players BIGINT,
  host_player_name VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.code,
    r.created_at,
    r.status,
    r.max_players,
    COUNT(p.id) as current_players,
    MAX(CASE WHEN p.is_host THEN p.name END) as host_player_name
  FROM rooms r
  LEFT JOIN players p ON r.code = p.room_code
  WHERE r.code = room_code_param
  GROUP BY r.code, r.created_at, r.status, r.max_players;
END;
$$ LANGUAGE plpgsql;

COMMIT;
