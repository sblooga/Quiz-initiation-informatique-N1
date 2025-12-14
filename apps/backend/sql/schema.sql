CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  photo TEXT,
  color TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profileId INTEGER NOT NULL,
  date INTEGER NOT NULL,
  score INTEGER NOT NULL,
  answers TEXT,
  FOREIGN KEY(profileId) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  choices_json TEXT,
  answer_text TEXT,
  answer_index INTEGER,
  theme TEXT,
  course_ref TEXT,
  pdf_keyword TEXT,
  lesson TEXT,
  pdf_page INTEGER,
  pdf_search_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
