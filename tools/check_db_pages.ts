import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'apps/backend/data.sqlite'));

const lessons = ['Leçon 001', 'Leçon 044', 'Leçon 045'];

lessons.forEach(lesson => {
    const row = db.prepare('SELECT course_ref, pdf_page FROM questions WHERE course_ref LIKE ? LIMIT 1').get(`${lesson}%`);
    console.log(`${lesson}:`, row);
});
