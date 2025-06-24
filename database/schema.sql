-- PixelTrivia Database Schema for Supabase
-- Run these SQL commands in your Supabase SQL editor

-- Create rooms table
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

-- Create players table
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

-- Create questions table (for future use)
CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of answer options
  correct_answer INTEGER NOT NULL, -- Index of correct option
  category VARCHAR(50),
  difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_sessions table (for tracking game state)
CREATE TABLE IF NOT EXISTS game_sessions (
  id BIGSERIAL PRIMARY KEY,
  room_code VARCHAR(6) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  current_question_id BIGINT REFERENCES questions(id),
  question_start_time TIMESTAMP WITH TIME ZONE,
  question_end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_players_room_code ON players(room_code);
CREATE INDEX IF NOT EXISTS idx_players_is_host ON players(is_host);
CREATE INDEX IF NOT EXISTS idx_game_sessions_room_code ON game_sessions(room_code);

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for rooms table
CREATE POLICY "Anyone can read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Only service role can update rooms" ON rooms FOR UPDATE USING (auth.role() = 'service_role');

-- Create policies for players table
CREATE POLICY "Anyone can read players" ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can create players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Players can update their own data" ON players FOR UPDATE USING (true);

-- Create policies for questions table
CREATE POLICY "Anyone can read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Only service role can manage questions" ON questions FOR ALL USING (auth.role() = 'service_role');

-- Create policies for game_sessions table
CREATE POLICY "Anyone can read game sessions" ON game_sessions FOR SELECT USING (true);
CREATE POLICY "Only service role can manage game sessions" ON game_sessions FOR ALL USING (auth.role() = 'service_role');

-- Insert some sample questions
INSERT INTO questions (question_text, options, correct_answer, category, difficulty) VALUES
('What is the capital of France?', '["London", "Berlin", "Paris", "Madrid"]', 2, 'Geography', 'easy'),
('Which planet is known as the Red Planet?', '["Venus", "Mars", "Jupiter", "Saturn"]', 1, 'Science', 'easy'),
('Who painted the Mona Lisa?', '["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"]', 1, 'Art', 'medium'),
('What is the largest mammal in the world?', '["Elephant", "Blue Whale", "Giraffe", "Polar Bear"]', 1, 'Science', 'medium'),
('In which year did World War II end?', '["1944", "1945", "1946", "1947"]', 1, 'History', 'medium'),
('What is 2 + 2?', '["3", "4", "5", "6"]', 1, 'Mathematics', 'easy'),
('What color do you get when you mix red and blue?', '["Green", "Purple", "Orange", "Yellow"]', 1, 'Colors & Shapes', 'easy'),
('Which animal says "moo"?', '["Dog", "Cat", "Cow", "Pig"]', 2, 'Animals', 'easy'),
('What do we call frozen water?', '["Steam", "Ice", "Rain", "Snow"]', 1, 'Science', 'easy'),
('How many sides does a triangle have?', '["2", "3", "4", "5"]', 1, 'Mathematics', 'easy'),
('What is the largest ocean on Earth?', '["Atlantic", "Indian", "Arctic", "Pacific"]', 3, 'Geography', 'medium'),
('Who wrote "Romeo and Juliet"?', '["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"]', 1, 'Literature', 'medium'),
('What is the chemical symbol for water?', '["H2O", "CO2", "O2", "NaCl"]', 0, 'Science', 'medium'),
('Which sport is played at Wimbledon?', '["Football", "Tennis", "Cricket", "Rugby"]', 1, 'Sports', 'easy'),
('What is the smallest planet in our solar system?', '["Mercury", "Venus", "Mars", "Pluto"]', 0, 'Science', 'medium'),
('Who composed "The Four Seasons"?', '["Mozart", "Beethoven", "Vivaldi", "Bach"]', 2, 'Music', 'hard'),
('What is the square root of 64?', '["6", "7", "8", "9"]', 2, 'Mathematics', 'medium'),
('In which continent is the Sahara Desert?', '["Asia", "Africa", "Australia", "South America"]', 1, 'Geography', 'easy'),
('What is the main ingredient in guacamole?', '["Tomato", "Avocado", "Onion", "Pepper"]', 1, 'Food', 'easy'),
('How many hearts does an octopus have?', '["1", "2", "3", "4"]', 2, 'Animals', 'hard'),
('What is the fastest land animal?', '["Lion", "Cheetah", "Horse", "Kangaroo"]', 1, 'Animals', 'medium'),
('Which gas makes up most of Earth''s atmosphere?', '["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"]', 1, 'Science', 'medium'),
('What is the capital of Japan?', '["Seoul", "Beijing", "Tokyo", "Bangkok"]', 2, 'Geography', 'easy'),
('Who painted "Starry Night"?', '["Pablo Picasso", "Vincent van Gogh", "Claude Monet", "Salvador Dali"]', 1, 'Art', 'medium'),
('What is the hardest natural substance?', '["Gold", "Iron", "Diamond", "Silver"]', 2, 'Science', 'medium');

-- Create a function to clean up old rooms (optional)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms 
  WHERE created_at < NOW() - INTERVAL '24 hours' 
  AND status = 'waiting';
END;
$$ LANGUAGE plpgsql;

-- Create a function to get room with player count
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
    (SELECT p2.name FROM players p2 WHERE p2.room_code = r.code AND p2.is_host = true LIMIT 1) as host_player_name
  FROM rooms r
  LEFT JOIN players p ON r.code = p.room_code
  WHERE r.code = room_code_param
  GROUP BY r.code, r.created_at, r.status, r.max_players;
END;
$$ LANGUAGE plpgsql;
