import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('./apps/backend/data.sqlite');
console.log('📂 Database path:', dbPath);

const db = new Database(dbPath);

console.log('\n=== PROFILES ===');
const profiles = db.prepare('SELECT * FROM profiles').all();
console.log(profiles);

console.log('\n=== SESSIONS COUNT ===');
const sessionCount = db.prepare('SELECT COUNT(*) as total FROM sessions').get();
console.log(sessionCount);

console.log('\n=== SESSIONS ===');
const sessions = db.prepare('SELECT * FROM sessions LIMIT 10').all();
console.log(sessions);

console.log('\n=== QUESTION 8 (Patriot) ===');
const question8 = db.prepare('SELECT id, question_id, label, pdf_page, pdf_keyword, pdf_search_text FROM questions WHERE question_id = 8').get();
console.log(question8);

console.log('\n=== SAMPLE QUESTIONS WITH PDF DATA ===');
const sampleQuestions = db.prepare('SELECT id, question_id, label, pdf_page, pdf_keyword, pdf_search_text FROM questions WHERE pdf_search_text IS NOT NULL LIMIT 5').all();
console.log(sampleQuestions);

db.close();
