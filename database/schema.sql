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

-- Insert sample questions
-- Categories align with constants/categories.ts across all difficulty levels
INSERT INTO questions (question_text, options, correct_answer, category, difficulty) VALUES

-- ============================================================================
-- ELEMENTARY (easy)
-- ============================================================================

-- Colors & Shapes
('What color do you get when you mix red and blue?', '["Green", "Purple", "Orange", "Yellow"]', 1, 'Colors & Shapes', 'easy'),
('How many sides does a triangle have?', '["2", "3", "4", "5"]', 1, 'Colors & Shapes', 'easy'),
('What shape is a stop sign?', '["Circle", "Square", "Octagon", "Triangle"]', 2, 'Colors & Shapes', 'easy'),
('What color is a banana?', '["Red", "Blue", "Yellow", "Green"]', 2, 'Colors & Shapes', 'easy'),
('How many sides does a square have?', '["3", "4", "5", "6"]', 1, 'Colors & Shapes', 'easy'),

-- Animals
('Which animal says "moo"?', '["Dog", "Cat", "Cow", "Pig"]', 2, 'Animals', 'easy'),
('What is the fastest land animal?', '["Lion", "Cheetah", "Horse", "Kangaroo"]', 1, 'Animals', 'easy'),
('How many legs does a spider have?', '["6", "8", "10", "12"]', 1, 'Animals', 'easy'),
('What animal has a very long neck?', '["Elephant", "Giraffe", "Zebra", "Hippo"]', 1, 'Animals', 'easy'),
('What do caterpillars turn into?', '["Birds", "Butterflies", "Fish", "Frogs"]', 1, 'Animals', 'easy'),

-- Food
('What is the main ingredient in guacamole?', '["Tomato", "Avocado", "Onion", "Pepper"]', 1, 'Food', 'easy'),
('What do bees make?', '["Milk", "Honey", "Butter", "Cheese"]', 1, 'Food', 'easy'),
('Which fruit is red and has seeds on the outside?', '["Apple", "Cherry", "Strawberry", "Raspberry"]', 2, 'Food', 'easy'),
('What is the most popular pizza topping?', '["Mushrooms", "Olives", "Pepperoni", "Anchovies"]', 2, 'Food', 'easy'),
('What colour is a carrot usually?', '["Red", "Green", "Orange", "Purple"]', 2, 'Food', 'easy'),

-- Numbers
('What is 2 + 2?', '["3", "4", "5", "6"]', 1, 'Numbers', 'easy'),
('How many days are in a week?', '["5", "6", "7", "8"]', 2, 'Numbers', 'easy'),
('How many months are in a year?', '["10", "11", "12", "13"]', 2, 'Numbers', 'easy'),
('What is 5 × 3?', '["10", "12", "15", "18"]', 2, 'Numbers', 'easy'),
('How many zeros are in one hundred?', '["1", "2", "3", "4"]', 1, 'Numbers', 'easy'),

-- Weather
('What do we call frozen water?', '["Steam", "Ice", "Rain", "Snow"]', 1, 'Weather', 'easy'),
('What appears in the sky after rain and sunshine?', '["Stars", "Moon", "Rainbow", "Lightning"]', 2, 'Weather', 'easy'),
('What instrument measures temperature?', '["Ruler", "Scale", "Thermometer", "Clock"]', 2, 'Weather', 'easy'),
('What season comes after spring?', '["Winter", "Fall", "Summer", "Autumn"]', 2, 'Weather', 'easy'),

-- Transportation
('How many wheels does a bicycle have?', '["1", "2", "3", "4"]', 1, 'Transportation', 'easy'),
('What vehicle travels on rails?', '["Bus", "Car", "Train", "Airplane"]', 2, 'Transportation', 'easy'),
('What do boats travel on?', '["Roads", "Air", "Water", "Rails"]', 2, 'Transportation', 'easy'),

-- Body Parts
('How many fingers do humans have on one hand?', '["3", "4", "5", "6"]', 2, 'Body Parts', 'easy'),
('What organ pumps blood through your body?', '["Brain", "Lungs", "Heart", "Stomach"]', 2, 'Body Parts', 'easy'),
('How many bones does an adult human have?', '["106", "206", "306", "406"]', 1, 'Body Parts', 'easy'),

-- ============================================================================
-- MIDDLE SCHOOL (medium)
-- ============================================================================

-- Basic Science
('Which planet is known as the Red Planet?', '["Venus", "Mars", "Jupiter", "Saturn"]', 1, 'Basic Science', 'medium'),
('What is the largest mammal in the world?', '["Elephant", "Blue Whale", "Giraffe", "Polar Bear"]', 1, 'Basic Science', 'medium'),
('What is the chemical symbol for water?', '["H2O", "CO2", "O2", "NaCl"]', 0, 'Basic Science', 'medium'),
('Which gas makes up most of Earth''s atmosphere?', '["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"]', 1, 'Basic Science', 'medium'),
('What is the smallest planet in our solar system?', '["Mercury", "Venus", "Mars", "Pluto"]', 0, 'Basic Science', 'medium'),
('How many hearts does an octopus have?', '["1", "2", "3", "4"]', 2, 'Basic Science', 'medium'),
('What is the boiling point of water in Celsius?', '["90°C", "100°C", "110°C", "120°C"]', 1, 'Basic Science', 'medium'),
('What planet has the most moons?', '["Jupiter", "Saturn", "Neptune", "Uranus"]', 1, 'Basic Science', 'medium'),

-- World Geography
('What is the capital of France?', '["London", "Berlin", "Paris", "Madrid"]', 2, 'World Geography', 'medium'),
('What is the largest ocean on Earth?', '["Atlantic", "Indian", "Arctic", "Pacific"]', 3, 'World Geography', 'medium'),
('In which continent is the Sahara Desert?', '["Asia", "Africa", "Australia", "South America"]', 1, 'World Geography', 'medium'),
('What is the capital of Japan?', '["Seoul", "Beijing", "Tokyo", "Bangkok"]', 2, 'World Geography', 'medium'),
('What is the longest river in the world?', '["Amazon", "Nile", "Mississippi", "Yangtze"]', 1, 'World Geography', 'medium'),
('Which country has the largest population?', '["USA", "India", "China", "Indonesia"]', 2, 'World Geography', 'medium'),
('What is the tallest mountain in the world?', '["K2", "Kangchenjunga", "Mount Everest", "Lhotse"]', 2, 'World Geography', 'medium'),

-- Math Fundamentals
('What is the square root of 64?', '["6", "7", "8", "9"]', 2, 'Math Fundamentals', 'medium'),
('What is 15% of 200?', '["15", "25", "30", "35"]', 2, 'Math Fundamentals', 'medium'),
('How many degrees are in a right angle?', '["45", "60", "90", "180"]', 2, 'Math Fundamentals', 'medium'),
('What is the area of a rectangle with length 5 and width 3?', '["8", "15", "16", "20"]', 1, 'Math Fundamentals', 'medium'),
('What is the next prime number after 7?', '["8", "9", "10", "11"]', 3, 'Math Fundamentals', 'medium'),

-- Literature
('Who wrote "Romeo and Juliet"?', '["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"]', 1, 'Literature', 'medium'),
('Who wrote "Harry Potter"?', '["Stephen King", "J.R.R. Tolkien", "J.K. Rowling", "Roald Dahl"]', 2, 'Literature', 'medium'),
('What is the name of Sherlock Holmes'' assistant?', '["Dr. Wilson", "Dr. Watson", "Dr. Martin", "Dr. Hudson"]', 1, 'Literature', 'medium'),
('Who wrote "The Adventures of Tom Sawyer"?', '["Mark Twain", "Ernest Hemingway", "F. Scott Fitzgerald", "John Steinbeck"]', 0, 'Literature', 'medium'),

-- American History
('In which year did World War II end?', '["1944", "1945", "1946", "1947"]', 1, 'American History', 'medium'),
('Who was the first President of the United States?', '["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"]', 2, 'American History', 'medium'),
('In what year did the United States declare independence?', '["1774", "1775", "1776", "1777"]', 2, 'American History', 'medium'),
('Which amendment gives the right to free speech?', '["First", "Second", "Third", "Fourth"]', 0, 'American History', 'medium'),

-- Sports
('Which sport is played at Wimbledon?', '["Football", "Tennis", "Cricket", "Rugby"]', 1, 'Sports', 'medium'),
('How many players are on a soccer team?', '["9", "10", "11", "12"]', 2, 'Sports', 'medium'),
('In which sport can you score a "hole-in-one"?', '["Tennis", "Basketball", "Golf", "Bowling"]', 2, 'Sports', 'medium'),
('How many quarters are in a basketball game?', '["2", "3", "4", "5"]', 2, 'Sports', 'medium'),
('What country hosted the 2016 Summer Olympics?', '["China", "UK", "Brazil", "Japan"]', 2, 'Sports', 'medium'),

-- Technology
('What does "CPU" stand for?', '["Central Process Unit", "Central Processing Unit", "Computer Processing Unit", "Core Processing Unit"]', 1, 'Technology', 'medium'),
('Who co-founded Apple Computer?', '["Bill Gates", "Steve Jobs", "Jeff Bezos", "Mark Zuckerberg"]', 1, 'Technology', 'medium'),
('What does "URL" stand for?', '["Uniform Resource Locator", "Universal Resource Link", "Uniform Remote Location", "Universal Reference Locator"]', 0, 'Technology', 'medium'),
('In what year was the first iPhone released?', '["2005", "2006", "2007", "2008"]', 2, 'Technology', 'medium'),

-- Art & Music
('Who painted the Mona Lisa?', '["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"]', 1, 'Art & Music', 'medium'),
('Who painted "Starry Night"?', '["Pablo Picasso", "Vincent van Gogh", "Claude Monet", "Salvador Dali"]', 1, 'Art & Music', 'medium'),
('How many notes are in a musical octave?', '["6", "7", "8", "9"]', 2, 'Art & Music', 'medium'),
('What instrument has 88 keys?', '["Guitar", "Violin", "Piano", "Flute"]', 2, 'Art & Music', 'medium'),

-- ============================================================================
-- HIGH SCHOOL (medium-hard)
-- ============================================================================

-- Advanced Science
('What is the powerhouse of the cell?', '["Nucleus", "Ribosome", "Mitochondria", "Golgi Apparatus"]', 2, 'Advanced Science', 'medium'),
('What is the chemical formula for table salt?', '["KCl", "NaCl", "CaCl2", "MgCl2"]', 1, 'Advanced Science', 'medium'),
('What force keeps planets in orbit around the Sun?', '["Friction", "Magnetism", "Gravity", "Electricity"]', 2, 'Advanced Science', 'medium'),
('What is the pH of pure water?', '["5", "6", "7", "8"]', 2, 'Advanced Science', 'medium'),
('What type of bond involves sharing electrons?', '["Ionic", "Covalent", "Metallic", "Hydrogen"]', 1, 'Advanced Science', 'medium'),

-- World History
('In what year did the Berlin Wall fall?', '["1987", "1988", "1989", "1990"]', 2, 'World History', 'medium'),
('Who was the first Emperor of Rome?', '["Julius Caesar", "Augustus", "Nero", "Caligula"]', 1, 'World History', 'medium'),
('What ancient civilisation built the pyramids at Giza?', '["Romans", "Greeks", "Egyptians", "Persians"]', 2, 'World History', 'medium'),
('In which country did the Renaissance begin?', '["France", "Spain", "Italy", "England"]', 2, 'World History', 'medium'),
('What treaty ended World War I?', '["Treaty of Paris", "Treaty of Versailles", "Treaty of Vienna", "Treaty of Rome"]', 1, 'World History', 'medium'),

-- Mathematics
('What is the value of Pi to two decimal places?', '["3.12", "3.14", "3.16", "3.18"]', 1, 'Mathematics', 'medium'),
('What is the derivative of x²?', '["x", "2x", "x²", "2x²"]', 1, 'Mathematics', 'medium'),
('What is the sum of interior angles of a triangle?', '["90°", "180°", "270°", "360°"]', 1, 'Mathematics', 'medium'),
('In a right triangle, what is the longest side called?', '["Adjacent", "Opposite", "Hypotenuse", "Base"]', 2, 'Mathematics', 'medium'),

-- English Literature
('Who wrote "Pride and Prejudice"?', '["Charlotte Brontë", "Jane Austen", "Emily Brontë", "Mary Shelley"]', 1, 'English Literature', 'medium'),
('What is the opening line of "A Tale of Two Cities"?', '["Call me Ishmael", "It was the best of times", "It is a truth universally acknowledged", "All happy families"]', 1, 'English Literature', 'medium'),
('Who wrote "1984"?', '["Aldous Huxley", "George Orwell", "Ray Bradbury", "H.G. Wells"]', 1, 'English Literature', 'medium'),
('What play features the characters Prospero and Ariel?', '["Hamlet", "Othello", "The Tempest", "King Lear"]', 2, 'English Literature', 'medium'),

-- Chemistry
('What is the atomic number of Carbon?', '["4", "6", "8", "12"]', 1, 'Chemistry', 'medium'),
('What is the most abundant element in Earth''s crust?', '["Iron", "Silicon", "Oxygen", "Aluminium"]', 2, 'Chemistry', 'medium'),
('What gas do plants absorb from the atmosphere?', '["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"]', 2, 'Chemistry', 'medium'),

-- Physics
('What is the speed of light approximately?', '["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"]', 0, 'Physics', 'medium'),
('What unit measures electrical resistance?', '["Volt", "Amp", "Ohm", "Watt"]', 2, 'Physics', 'medium'),
('What is Newton''s First Law also known as?', '["Law of Gravity", "Law of Inertia", "Law of Action", "Law of Force"]', 1, 'Physics', 'medium'),

-- Biology
('What molecule carries genetic information?', '["RNA", "DNA", "ATP", "Protein"]', 1, 'Biology', 'medium'),
('How many chromosomes do humans have?', '["23", "44", "46", "48"]', 2, 'Biology', 'medium'),
('What process do plants use to make food?', '["Respiration", "Photosynthesis", "Fermentation", "Digestion"]', 1, 'Biology', 'medium'),

-- Government & Politics
('How many branches does the US government have?', '["2", "3", "4", "5"]', 1, 'Government & Politics', 'medium'),
('What is the supreme law of the United States?', '["Bill of Rights", "Declaration of Independence", "The Constitution", "Articles of Confederation"]', 2, 'Government & Politics', 'medium'),
('How many justices sit on the US Supreme Court?', '["7", "9", "11", "13"]', 1, 'Government & Politics', 'medium'),

-- ============================================================================
-- COLLEGE LEVEL (hard)
-- ============================================================================

-- Advanced Mathematics
('What is Euler''s number (e) approximately equal to?', '["2.618", "2.718", "3.141", "1.618"]', 1, 'Advanced Mathematics', 'hard'),
('What is the integral of 1/x?', '["x", "x²", "ln|x| + C", "e^x + C"]', 2, 'Advanced Mathematics', 'hard'),
('What does the Fibonacci sequence start with?', '["0, 1", "1, 1", "1, 2", "0, 2"]', 0, 'Advanced Mathematics', 'hard'),
('What is the determinant of a 2×2 identity matrix?', '["0", "1", "2", "4"]', 1, 'Advanced Mathematics', 'hard'),

-- Philosophy
('Who wrote "The Republic"?', '["Aristotle", "Socrates", "Plato", "Epicurus"]', 2, 'Philosophy', 'hard'),
('"I think, therefore I am" is attributed to whom?', '["Kant", "Descartes", "Locke", "Hume"]', 1, 'Philosophy', 'hard'),
('What is the study of knowledge called?', '["Ontology", "Epistemology", "Ethics", "Aesthetics"]', 1, 'Philosophy', 'hard'),
('Who wrote "Beyond Good and Evil"?', '["Hegel", "Nietzsche", "Schopenhauer", "Kierkegaard"]', 1, 'Philosophy', 'hard'),

-- Computer Science
('What data structure uses FIFO (First In, First Out)?', '["Stack", "Queue", "Tree", "Graph"]', 1, 'Computer Science', 'hard'),
('What is the time complexity of binary search?', '["O(n)", "O(n²)", "O(log n)", "O(1)"]', 2, 'Computer Science', 'hard'),
('What does "SQL" stand for?', '["Simple Query Language", "Structured Query Language", "Standard Query Language", "System Query Language"]', 1, 'Computer Science', 'hard'),
('What sorting algorithm has the best average-case complexity?', '["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"]', 2, 'Computer Science', 'hard'),
('What protocol does the web primarily use?', '["FTP", "SMTP", "HTTP", "TCP"]', 2, 'Computer Science', 'hard'),

-- Economics
('What does GDP stand for?', '["Gross Domestic Product", "General Domestic Product", "Gross Domestic Price", "Grand Domestic Product"]', 0, 'Economics', 'hard'),
('Who wrote "The Wealth of Nations"?', '["Karl Marx", "Adam Smith", "John Keynes", "David Ricardo"]', 1, 'Economics', 'hard'),
('What type of market has only one seller?', '["Oligopoly", "Monopoly", "Duopoly", "Perfect Competition"]', 1, 'Economics', 'hard'),

-- Psychology
('Who is considered the father of psychoanalysis?', '["Carl Jung", "Sigmund Freud", "B.F. Skinner", "William James"]', 1, 'Psychology', 'hard'),
('What does Maslow''s hierarchy of needs have at its base?', '["Safety", "Love", "Physiological", "Esteem"]', 2, 'Psychology', 'hard'),
('What term describes learning through observation?', '["Classical Conditioning", "Operant Conditioning", "Social Learning", "Habituation"]', 2, 'Psychology', 'hard'),

-- Engineering
('What is Ohm''s Law?', '["V = IR", "P = IV", "F = ma", "E = mc²"]', 0, 'Engineering', 'hard'),
('What material is most commonly used in semiconductor chips?', '["Copper", "Silicon", "Gold", "Aluminium"]', 1, 'Engineering', 'hard'),
('What type of bridge uses cables attached to towers?', '["Arch", "Beam", "Cable-Stayed", "Truss"]', 2, 'Engineering', 'hard'),

-- Law & Ethics
('What does "habeas corpus" literally mean?', '["You have the body", "You have the right", "You are guilty", "You shall appear"]', 0, 'Law & Ethics', 'hard'),
('What ethical theory focuses on the greatest good for the greatest number?', '["Deontology", "Utilitarianism", "Virtue Ethics", "Contractualism"]', 1, 'Law & Ethics', 'hard'),
('In which year was the Universal Declaration of Human Rights adopted?', '["1945", "1947", "1948", "1950"]', 2, 'Law & Ethics', 'hard'),

-- ============================================================================
-- CLASSIC / GENERAL KNOWLEDGE (mixed)
-- ============================================================================

-- General Knowledge
('What is the hardest natural substance?', '["Gold", "Iron", "Diamond", "Silver"]', 2, 'General Knowledge', 'medium'),
('How many continents are there?', '["5", "6", "7", "8"]', 2, 'General Knowledge', 'easy'),
('What is the currency of Japan?', '["Yuan", "Won", "Yen", "Ringgit"]', 2, 'General Knowledge', 'medium'),
('What is the largest desert in the world?', '["Sahara", "Gobi", "Antarctic", "Arabian"]', 2, 'General Knowledge', 'hard'),

-- Pop Culture
('What movie features a character named "Luke Skywalker"?', '["Star Trek", "Star Wars", "Guardians of the Galaxy", "The Matrix"]', 1, 'Pop Culture', 'easy'),
('What band was John Lennon a member of?', '["The Rolling Stones", "The Beatles", "The Who", "Led Zeppelin"]', 1, 'Pop Culture', 'easy'),
('What fictional school does Harry Potter attend?', '["Beauxbatons", "Durmstrang", "Hogwarts", "Ilvermorny"]', 2, 'Pop Culture', 'easy'),
('Who directed "Jurassic Park"?', '["James Cameron", "Steven Spielberg", "George Lucas", "Ridley Scott"]', 1, 'Pop Culture', 'medium'),

-- History (classic)
('Who discovered America in 1492?', '["Vasco da Gama", "Christopher Columbus", "Ferdinand Magellan", "Amerigo Vespucci"]', 1, 'History', 'easy'),
('What was the name of the ship that sank in 1912?', '["Lusitania", "Britannic", "Titanic", "Olympic"]', 2, 'History', 'medium'),
('Who was the first person to walk on the Moon?', '["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "John Glenn"]', 1, 'History', 'easy'),

-- Science (classic)
('What is the closest star to Earth?', '["Sirius", "Alpha Centauri", "The Sun", "Proxima Centauri"]', 2, 'Science', 'medium'),
('What element does "Au" represent on the periodic table?', '["Silver", "Aluminium", "Gold", "Argon"]', 2, 'Science', 'medium'),
('How many bones does a shark have?', '["0", "50", "100", "200"]', 0, 'Science', 'hard'),

-- Geography (classic)
('What is the capital of Australia?', '["Sydney", "Melbourne", "Canberra", "Brisbane"]', 2, 'Geography', 'medium'),
('What country is shaped like a boot?', '["Spain", "France", "Italy", "Greece"]', 2, 'Geography', 'easy'),
('What is the smallest country in the world?', '["Monaco", "Vatican City", "San Marino", "Liechtenstein"]', 1, 'Geography', 'medium'),

-- Entertainment
('Who composed "The Four Seasons"?', '["Mozart", "Beethoven", "Vivaldi", "Bach"]', 2, 'Entertainment', 'hard'),
('What board game involves buying and trading properties?', '["Risk", "Monopoly", "Clue", "Life"]', 1, 'Entertainment', 'easy'),
('What card game''s objective is to reach 21?', '["Poker", "Blackjack", "Solitaire", "Bridge"]', 1, 'Entertainment', 'easy'),

-- Nature
('What is the largest living organism?', '["Blue Whale", "Giant Sequoia", "Honey Fungus", "Great Barrier Reef"]', 2, 'Nature', 'hard'),
('What is the fastest bird?', '["Eagle", "Peregrine Falcon", "Ostrich", "Swift"]', 1, 'Nature', 'medium'),
('Which tree produces acorns?', '["Maple", "Oak", "Pine", "Birch"]', 1, 'Nature', 'easy'),
('What is group of wolves called?', '["Herd", "Pack", "Flock", "Pod"]', 1, 'Nature', 'easy');


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
