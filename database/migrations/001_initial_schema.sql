-- PixelTrivia Database Migration: Initial Schema
-- Version: 001
-- Date: 2026-02-28
--
-- Creates the core tables for rooms, players, questions, and game sessions.
-- This is the initial schema — matches the original schema.sql.
--
-- Usage:
--   Run in Supabase SQL editor, or via:
--   npx supabase db push (with Supabase CLI)

BEGIN;

-- ================================================================
-- Tables
-- ================================================================

CREATE TABLE IF NOT EXISTS rooms (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  max_players INTEGER DEFAULT 8 CHECK (max_players > 0 AND max_players <= 20),
  host_player_id UUID,
  current_question INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 10
);

CREATE TABLE IF NOT EXISTS players (
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

CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  category VARCHAR(50),
  difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id BIGSERIAL PRIMARY KEY,
  room_code VARCHAR(6) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  current_question_id BIGINT REFERENCES questions(id),
  question_start_time TIMESTAMP WITH TIME ZONE,
  question_end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- Indexes
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_players_room_code ON players(room_code);
CREATE INDEX IF NOT EXISTS idx_players_is_host ON players(is_host);
CREATE INDEX IF NOT EXISTS idx_game_sessions_room_code ON game_sessions(room_code);

-- ================================================================
-- Row Level Security
-- ================================================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Only service role can update rooms" ON rooms FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can read players" ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can create players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Players can update their own data" ON players FOR UPDATE USING (true);

CREATE POLICY "Anyone can read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Only service role can manage questions" ON questions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can read game sessions" ON game_sessions FOR SELECT USING (true);
CREATE POLICY "Only service role can manage game sessions" ON game_sessions FOR ALL USING (auth.role() = 'service_role');

-- ================================================================
-- Functions
-- ================================================================

CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms
  WHERE created_at < NOW() - INTERVAL '24 hours'
  AND status = 'waiting';
END;
$$ LANGUAGE plpgsql;

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
