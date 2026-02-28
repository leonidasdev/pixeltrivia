-- PixelTrivia Seed Data
--
-- Populates the questions table with sample trivia questions
-- across multiple categories and difficulty levels.
--
-- Usage:
--   Run in Supabase SQL editor after applying migrations, or via:
--   npx supabase db seed (with Supabase CLI)
--
-- Idempotent: uses ON CONFLICT DO NOTHING to avoid duplicates
-- when re-running.

BEGIN;

-- ================================================================
-- Geography Questions
-- ================================================================

INSERT INTO questions (question_text, options, correct_answer, category, difficulty) VALUES
('What is the capital of France?', '["London", "Berlin", "Paris", "Madrid"]', 2, 'Geography', 'easy'),
('What is the largest ocean on Earth?', '["Atlantic", "Indian", "Arctic", "Pacific"]', 3, 'Geography', 'medium'),
('In which continent is the Sahara Desert?', '["Asia", "Africa", "Australia", "South America"]', 1, 'Geography', 'easy'),
('What is the capital of Japan?', '["Seoul", "Beijing", "Tokyo", "Bangkok"]', 2, 'Geography', 'easy'),
('Which country has the most population?', '["United States", "India", "China", "Indonesia"]', 2, 'Geography', 'medium'),
('What is the longest river in the world?', '["Amazon", "Nile", "Yangtze", "Mississippi"]', 1, 'Geography', 'hard'),
('Which country is known as the Land of the Rising Sun?', '["China", "Japan", "Thailand", "South Korea"]', 1, 'Geography', 'easy'),
('What is the smallest country in the world?', '["Monaco", "Vatican City", "San Marino", "Liechtenstein"]', 1, 'Geography', 'medium'),
('On which continent is Mount Kilimanjaro?', '["Asia", "South America", "Africa", "Europe"]', 2, 'Geography', 'medium'),
('Which ocean lies between Africa and Australia?', '["Pacific", "Atlantic", "Indian", "Arctic"]', 2, 'Geography', 'medium');

-- ================================================================
-- Science Questions
-- ================================================================

INSERT INTO questions (question_text, options, correct_answer, category, difficulty) VALUES
('Which planet is known as the Red Planet?', '["Venus", "Mars", "Jupiter", "Saturn"]', 1, 'Science', 'easy'),
('What is the largest mammal in the world?', '["Elephant", "Blue Whale", "Giraffe", "Polar Bear"]', 1, 'Science', 'medium'),
('What do we call frozen water?', '["Steam", "Ice", "Rain", "Snow"]', 1, 'Science', 'easy'),
('What is the chemical symbol for water?', '["H2O", "CO2", "O2", "NaCl"]', 0, 'Science', 'medium'),
('What is the smallest planet in our solar system?', '["Mercury", "Venus", "Mars", "Pluto"]', 0, 'Science', 'medium'),
('Which gas makes up most of Earth''s atmosphere?', '["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"]', 1, 'Science', 'medium'),
('What is the hardest natural substance?', '["Gold", "Iron", "Diamond", "Silver"]', 2, 'Science', 'medium'),
('What is the boiling point of water in Celsius?', '["90", "100", "110", "120"]', 1, 'Science', 'easy'),
('How many bones are in the adult human body?', '["196", "206", "216", "226"]', 1, 'Science', 'hard'),
('What type of energy does the sun produce?', '["Nuclear", "Chemical", "Mechanical", "Electrical"]', 0, 'Science', 'hard'),
('What is the speed of light approximately?', '["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"]', 0, 'Science', 'hard'),
('Which element has the atomic number 1?', '["Helium", "Hydrogen", "Oxygen", "Carbon"]', 1, 'Science', 'medium');

-- ================================================================
-- History Questions
-- ================================================================

INSERT INTO questions (question_text, options, correct_answer, category, difficulty) VALUES
('In which year did World War II end?', '["1944", "1945", "1946", "1947"]', 1, 'History', 'medium'),
('Who was the first President of the United States?', '["John Adams", "George Washington", "Thomas Jefferson", "Benjamin Franklin"]', 1, 'History', 'easy'),
('In which year did the Titanic sink?', '["1910", "1911", "1912", "1913"]', 2, 'History', 'medium'),
('Which ancient civilization built the pyramids?', '["Romans", "Greeks", "Egyptians", "Aztecs"]', 2, 'History', 'easy'),
('What was the name of the ship Columbus sailed on in 1492?', '["Mayflower", "Santa Maria", "Endeavour", "Victoria"]', 1, 'History', 'medium'),
('In which year did the Berlin Wall fall?', '["1987", "1988", "1989", "1990"]', 2, 'History', 'medium'),
('Who discovered penicillin?', '["Louis Pasteur", "Alexander Fleming", "Marie Curie", "Robert Koch"]', 1, 'History', 'hard'),
('What year did the first humans land on the Moon?', '["1967", "1968", "1969", "1970"]', 2, 'History', 'medium');

-- ================================================================
-- Art & Literature Questions
-- ================================================================

INSERT INTO questions (question_text, options, correct_answer, category, difficulty) VALUES
('Who painted the Mona Lisa?', '["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"]', 1, 'Art', 'medium'),
('Who wrote "Romeo and Juliet"?', '["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"]', 1, 'Literature', 'medium'),
('Who painted "Starry Night"?', '["Pablo Picasso", "Vincent van Gogh", "Claude Monet", "Salvador Dali"]', 1, 'Art', 'medium'),
('Who wrote "1984"?', '["George Orwell", "Aldous Huxley", "Ray Bradbury", "H.G. Wells"]', 0, 'Literature', 'medium'),
('Which artist sculpted "David"?', '["Leonardo da Vinci", "Raphael", "Michelangelo", "Donatello"]', 2, 'Art', 'hard'),
('Who wrote "The Great Gatsby"?', '["Ernest Hemingway", "F. Scott Fitzgerald", "John Steinbeck", "William Faulkner"]', 1, 'Literature', 'medium');

-- ================================================================
-- Mathematics Questions
-- ================================================================

INSERT INTO questions (question_text, options, correct_answer, category, difficulty) VALUES
('What is 2 + 2?', '["3", "4", "5", "6"]', 1, 'Mathematics', 'easy'),
('How many sides does a triangle have?', '["2", "3", "4", "5"]', 1, 'Mathematics', 'easy'),
('What is the square root of 64?', '["6", "7", "8", "9"]', 2, 'Mathematics', 'medium'),
('What is the value of Pi rounded to two decimal places?', '["3.12", "3.14", "3.16", "3.18"]', 1, 'Mathematics', 'medium'),
('What is 15% of 200?', '["20", "25", "30", "35"]', 2, 'Mathematics', 'medium'),
('What is the next prime number after 7?', '["8", "9", "10", "11"]', 3, 'Mathematics', 'medium');

-- ================================================================
-- Animals Questions
-- ================================================================

INSERT INTO questions (question_text, options, correct_answer, category, difficulty) VALUES
('Which animal says "moo"?', '["Dog", "Cat", "Cow", "Pig"]', 2, 'Animals', 'easy'),
('How many hearts does an octopus have?', '["1", "2", "3", "4"]', 2, 'Animals', 'hard'),
('What is the fastest land animal?', '["Lion", "Cheetah", "Horse", "Kangaroo"]', 1, 'Animals', 'medium'),
('What is the largest bird in the world?', '["Eagle", "Ostrich", "Albatross", "Condor"]', 1, 'Animals', 'medium'),
('How many legs does a spider have?', '["6", "8", "10", "12"]', 1, 'Animals', 'easy'),
('What is a group of wolves called?', '["Herd", "Flock", "Pack", "Swarm"]', 2, 'Animals', 'medium');

-- ================================================================
-- Music Questions
-- ================================================================

INSERT INTO questions (question_text, options, correct_answer, category, difficulty) VALUES
('Who composed "The Four Seasons"?', '["Mozart", "Beethoven", "Vivaldi", "Bach"]', 2, 'Music', 'hard'),
('How many strings does a standard guitar have?', '["4", "5", "6", "7"]', 2, 'Music', 'easy'),
('Which instrument has 88 keys?', '["Guitar", "Violin", "Piano", "Flute"]', 2, 'Music', 'easy'),
('Who sang "Bohemian Rhapsody"?', '["The Beatles", "Queen", "Led Zeppelin", "Pink Floyd"]', 1, 'Music', 'medium');

-- ================================================================
-- Sports Questions
-- ================================================================

INSERT INTO questions (question_text, options, correct_answer, category, difficulty) VALUES
('Which sport is played at Wimbledon?', '["Football", "Tennis", "Cricket", "Rugby"]', 1, 'Sports', 'easy'),
('How many players are on a soccer team?', '["9", "10", "11", "12"]', 2, 'Sports', 'easy'),
('In which sport would you perform a slam dunk?', '["Tennis", "Basketball", "Volleyball", "Football"]', 1, 'Sports', 'easy'),
('How long is an Olympic swimming pool in meters?', '["25", "50", "75", "100"]', 1, 'Sports', 'medium');

-- ================================================================
-- Food Questions
-- ================================================================

INSERT INTO questions (question_text, options, correct_answer, category, difficulty) VALUES
('What is the main ingredient in guacamole?', '["Tomato", "Avocado", "Onion", "Pepper"]', 1, 'Food', 'easy'),
('Which country is known for inventing pizza?', '["France", "Spain", "Italy", "Greece"]', 2, 'Food', 'easy'),
('What is sushi traditionally wrapped in?', '["Lettuce", "Rice Paper", "Seaweed", "Banana Leaf"]', 2, 'Food', 'medium'),
('What nut is used to make marzipan?', '["Walnut", "Cashew", "Almond", "Pistachio"]', 2, 'Food', 'hard');

-- ================================================================
-- Colors & Shapes Questions
-- ================================================================

INSERT INTO questions (question_text, options, correct_answer, category, difficulty) VALUES
('What color do you get when you mix red and blue?', '["Green", "Purple", "Orange", "Yellow"]', 1, 'Colors & Shapes', 'easy'),
('How many sides does a hexagon have?', '["5", "6", "7", "8"]', 1, 'Colors & Shapes', 'medium'),
('What are the three primary colors?', '["Red, Blue, Green", "Red, Blue, Yellow", "Red, Green, Yellow", "Blue, Green, Yellow"]', 1, 'Colors & Shapes', 'easy');

-- ================================================================
-- Technology Questions
-- ================================================================

INSERT INTO questions (question_text, options, correct_answer, category, difficulty) VALUES
('What does "HTML" stand for?', '["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Logic", "Home Tool Markup Language"]', 0, 'Technology', 'medium'),
('Who founded Apple Inc.?', '["Bill Gates", "Steve Jobs", "Mark Zuckerberg", "Jeff Bezos"]', 1, 'Technology', 'easy'),
('What year was the first iPhone released?', '["2005", "2006", "2007", "2008"]', 2, 'Technology', 'medium'),
('What does "CPU" stand for?', '["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"]', 0, 'Technology', 'medium'),
('Which programming language is known as the language of the web?', '["Python", "Java", "JavaScript", "C++"]', 2, 'Technology', 'medium');

COMMIT;
