-- PixelTrivia Multiplayer Migration
-- Run this AFTER the base schema.sql has been applied
-- Adds real-time multiplayer support to the database

-- ============================================================================
-- 1. Add multiplayer columns to rooms table
-- ============================================================================

-- Time tracking for question synchronization
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS question_start_time TIMESTAMP WITH TIME ZONE;

-- Game configuration
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS game_mode VARCHAR(20) DEFAULT 'quick';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS time_limit INTEGER DEFAULT 30;

-- ============================================================================
-- 2. Create game_questions table (questions for a specific game session)
-- ============================================================================

CREATE TABLE IF NOT EXISTS game_questions (
  id BIGSERIAL PRIMARY KEY,
  room_code VARCHAR(6) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  category VARCHAR(50),
  difficulty VARCHAR(20),
  UNIQUE(room_code, question_index)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_game_questions_room_code ON game_questions(room_code);
CREATE INDEX IF NOT EXISTS idx_game_questions_room_index ON game_questions(room_code, question_index);

-- RLS
ALTER TABLE game_questions ENABLE ROW LEVEL SECURITY;

-- Players can read questions for their room (correct_answer is filtered in API, not here)
CREATE POLICY "Anyone can read game questions" ON game_questions FOR SELECT USING (true);
CREATE POLICY "Only service role can manage game questions" ON game_questions FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 3. Add answer tracking to players table
-- ============================================================================

-- JSONB array of { questionIndex, answer, timeMs, correct, score }
ALTER TABLE players ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]'::jsonb;

-- ============================================================================
-- 4. Enable Supabase Realtime on multiplayer tables
-- ============================================================================

-- These allow clients to subscribe to changes via Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- ============================================================================
-- 5. Helper functions
-- ============================================================================

-- Get room with full player list
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
